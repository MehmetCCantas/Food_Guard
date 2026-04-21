import { RiskReport } from '../../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../../../infrastructure/dtos/ai-analysis-request.dto';

export const IAiApiProvider = Symbol('IAiApiProvider');

export interface IAiApiProvider {
  analyzeImage(dto: AiAnalysisRequestDto): Promise<RiskReport>;
}
