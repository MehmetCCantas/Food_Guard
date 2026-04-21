import { RiskReport } from '../../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../../../infrastructure/dtos/ai-analysis-request.dto';

export const IAiAnalysisService = Symbol('IAiAnalysisService');

export interface IAiAnalysisService {
  analyzeFoodSafety(dto: AiAnalysisRequestDto): Promise<RiskReport>;
}
