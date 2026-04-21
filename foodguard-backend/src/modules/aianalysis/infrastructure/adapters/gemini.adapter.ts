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

      if (!aiResponseText) {
        throw new Error('Empty response from AI');
      }

      return this.parseAiResponse(aiResponseText);
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
      You are a food safety expert AI. Analyze the image and data.
      Data:
      - Storage: ${dto.storageCondition}
      - Duration: ${dto.storageDurationHours} hours
      - Smell Change: ${dto.hasSmellChange ? 'Yes' : 'No'}

      Output ONLY valid JSON in this format (no markdown code blocks):
      {
        "foodIdentity": "string (Short name of food)",
        "riskLevel": "Low" | "Medium" | "High",
        "analysisPoints": ["string", "string"],
        "recommendationToDonor": "string",
        "warningForRecipient": "string"
      }

      Rules:
      - If smell change is Yes -> High Risk.
      - If room_temp > 4 hours -> High Risk.
      - If visible mold -> High Risk.
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
