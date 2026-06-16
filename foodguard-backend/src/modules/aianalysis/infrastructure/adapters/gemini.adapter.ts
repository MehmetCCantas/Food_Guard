import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RiskReport } from '../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../dtos/ai-analysis-request.dto';
import { IAiApiProvider } from '../../application/ports/out/aianalysis.out-ports';

@Injectable()
export class GeminiAdapter implements IAiApiProvider {
  private readonly logger = new Logger(GeminiAdapter.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      this.logger.warn('GOOGLE_AI_API_KEY is not defined or is default in .env — AI analysis will be disabled.');
      this.apiKey = 'disabled';
    } else {
      this.apiKey = apiKey;
    }

    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
  }

  async analyzeImage(dto: AiAnalysisRequestDto): Promise<RiskReport> {
    if (this.apiKey === 'disabled') {
      this.logger.warn('AI analysis skipped because GOOGLE_AI_API_KEY is not configured in .env');
      return {
        foodIdentity: 'Unknown (AI Disabled)',
        riskLevel: 'Low',
        analysisPoints: ['AI analysis is disabled because no API key was provided.'],
        recommendationToDonor: 'Please provide a valid API key to enable AI safety check.',
        warningForRecipient: 'Safety not verified by AI.',
      };
    }

    this.logger.log(`Starting Gemini AI analysis. Storage: ${dto.storageCondition}, Duration: ${dto.storageDurationHours}h, Smell Change: ${dto.hasSmellChange}`);

    const prompt = this.buildPrompt(dto);

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: dto.photoMimeType,
                data: dto.photoBase64,
              },
            },
          ],
        },
      ],
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.apiUrl, requestBody),
      );

      const aiResponseText =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      this.logger.log(`Received raw Gemini API response: ${aiResponseText}`);

      if (!aiResponseText) {
        throw new Error('Empty response from AI');
      }

      const report = this.parseAiResponse(aiResponseText);
      this.logger.log(`Successfully parsed risk report. Identity: ${report.foodIdentity}, Risk Level: ${report.riskLevel}`);
      return report;
    } catch (error) {
      this.logger.error(
        'Gemini API request failed',
        error.response?.data || error.message,
      );
      if (error.response?.data) {
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      throw new InternalServerErrorException('AI analysis failed');
    }
  }

  private buildPrompt(dto: AiAnalysisRequestDto): string {
    return `
      You are a strict food safety inspection AI. Your PRIMARY job is to analyze the VISUAL appearance of the food in the image.

      CRITICAL VISUAL INSPECTION RULES (highest priority):
      1. If you see ANY mold (green, blue, black, white fuzzy spots, or patches of discoloration) -> IMMEDIATELY set riskLevel to "High"
      2. If the food looks rotten, slimy, decomposed, or severely discolored -> riskLevel "High"
      3. If the food has unusual dark spots, patches, or growth on surface -> riskLevel "High"
      4. Fresh, clean, normal-looking food with no visible issues -> riskLevel "Low"

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
      - If High Risk: write a clear, specific warning about what you see (e.g. "Visible mold detected on the food. Do NOT consume.")
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
