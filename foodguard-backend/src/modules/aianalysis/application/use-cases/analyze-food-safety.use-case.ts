import { Inject, Injectable } from '@nestjs/common';
import { RiskReport } from '../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../../infrastructure/dtos/ai-analysis-request.dto';
import { IAiApiProvider } from '../ports/out/aianalysis.out-ports';

@Injectable()
export class AnalyzeFoodSafetyUseCase {
  constructor(
    @Inject(IAiApiProvider)
    private readonly aiApiProvider: IAiApiProvider,
  ) {}

  async execute(dto: AiAnalysisRequestDto): Promise<RiskReport> {
    return this.aiApiProvider.analyzeImage(dto);
  }
}
