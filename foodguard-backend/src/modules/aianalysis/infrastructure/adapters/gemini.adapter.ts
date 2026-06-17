import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RiskReport } from '../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../dtos/ai-analysis-request.dto';
import { IAiApiProvider } from '../../application/ports/out/aianalysis.out-ports';

@Injectable()
export class GeminiAdapter implements IAiApiProvider {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GOOGLE_AI_API_KEY is not defined — AI analysis will be disabled.');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('✅ Gemini AI SDK initialized');
    }
  }

  async analyzeImage(dto: AiAnalysisRequestDto): Promise<RiskReport> {
    if (!this.genAI) {
      this.logger.warn('AI analysis skipped — no API key configured');
      return {
        foodIdentity: 'Unknown (AI Disabled)',
        riskLevel: 'Low',
        analysisPoints: ['AI analysis is disabled.'],
        recommendationToDonor: 'Please provide a valid API key.',
        warningForRecipient: 'Safety not verified by AI.',
      };
    }

    this.logger.log(`Starting Gemini AI analysis. Storage: ${dto.storageCondition}, Duration: ${dto.storageDurationHours}h`);

    const prompt = this.buildPrompt(dto);

    try {
      const model = this.genAI.getGenerativeModel(
        { model: 'gemini-2.0-flash-lite' },
      );

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: dto.photoMimeType,
            data: dto.photoBase64,
          },
        },
      ]);

      const aiResponseText = result.response.text();
      this.logger.log(`Received Gemini response: ${aiResponseText}`);

      if (!aiResponseText) {
        throw new Error('Empty response from AI');
      }

      const report = this.parseAiResponse(aiResponseText);
      this.logger.log(`Parsed risk report — Identity: ${report.foodIdentity}, Risk: ${report.riskLevel}`);
      return report;
    } catch (error) {
      this.logger.error('Gemini SDK request failed', error?.message);
      throw new InternalServerErrorException('AI analysis failed');
    }
  }

  private buildPrompt(dto: AiAnalysisRequestDto): string {
    return `
      You are a strict food safety inspection AI. Your PRIMARY job is to analyze the VISUAL appearance of the food in the image.

      CRITICAL VISUAL INSPECTION RULES (highest priority):
      1. If you see ANY mold (green, blue, black, white fuzzy spots, or patches of discoloration) -> IMMEDIATELY set riskLevel to "High".
         WARNING: Do NOT confuse white flour dusted on bread, natural crust coloring, seeds, or spices with mold.
      2. If the food looks rotten, slimy, decomposed, or severely discolored -> riskLevel "High".
      3. If the food has unusual dark spots, patches, or growth on surface -> riskLevel "High".
         WARNING: Grill marks, natural baking browning, and crusts are normal and should NOT be marked as high risk.
      4. Fresh, clean, normal-looking food with no visible issues -> riskLevel "Low".

      Additional metadata to consider AFTER visual check:
      - Storage condition: ${dto.storageCondition}
      - Hours since preparation: ${dto.storageDurationHours} hours
      - Smell change reported: ${dto.hasSmellChange ? 'YES - indicates spoilage' : 'No'}

      Extra rules from metadata:
      - If smell change is Yes -> High Risk regardless of visual
      - If room_temp storage > 4 hours -> at least Medium Risk
      - If fridge storage > 72 hours -> Medium Risk

      IMPORTANT: Visual mold detection overrides everything. A moldy food item is ALWAYS High Risk.

      For "warningForRecipient":
      - If High Risk: write a clear warning (e.g. "Visible mold detected. Do NOT consume.")
      - If Medium Risk: write a caution message
      - If Low Risk: write empty string ""

      Output ONLY valid JSON (no markdown, no code blocks):
      {
        "foodIdentity": "string (short name of the food you see)",
        "riskLevel": "Low" | "Medium" | "High",
        "analysisPoints": ["string describing what you see", "string with safety concern"],
        "recommendationToDonor": "string",
        "warningForRecipient": "string"
      }
    `;
  }

  private parseAiResponse(text: string): RiskReport {
    try {
      const cleanText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanText) as RiskReport;
    } catch (error) {
      this.logger.error('Failed to parse AI JSON', text);
      return {
        foodIdentity: 'Unknown',
        riskLevel: 'High',
        analysisPoints: ['AI response could not be parsed'],
        recommendationToDonor: 'System error. Please try again.',
        warningForRecipient: 'System error.',
      };
    }
  }
}
