import { Injectable } from '@nestjs/common';
import { RiskReport } from '../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../../infrastructure/dtos/ai-analysis-request.dto';
import { IAiAnalysisService } from '../ports/in/aianalysis.in-ports';
import { AnalyzeFoodSafetyUseCase } from '../use-cases/analyze-food-safety.use-case';

@Injectable()
export class AiAnalysisService implements IAiAnalysisService {
  constructor(
    private readonly analyzeFoodSafetyUseCase: AnalyzeFoodSafetyUseCase,
  ) {}

  async analyzeFoodSafety(dto: AiAnalysisRequestDto): Promise<RiskReport> {
    return this.analyzeFoodSafetyUseCase.execute(dto);
  }
}
