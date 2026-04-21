import { Injectable } from '@nestjs/common';
import { RiskReport } from '../../domain/entities/risk-report.entity';
import { AiAnalysisRequestDto } from '../dtos/ai-analysis-request.dto';
import { IAiApiProvider } from '../../application/ports/out/aianalysis.out-ports';

@Injectable()
export class MockAiAdapter implements IAiApiProvider {
  async analyzeImage(dto: AiAnalysisRequestDto): Promise<RiskReport> {
    const report = new RiskReport();
    report.foodIdentity = 'Mock Chicken Sandwich';

    if (
      (dto.storageCondition === 'room_temp' && dto.storageDurationHours > 2) ||
      dto.hasSmellChange
    ) {
      report.riskLevel = 'High';
      report.analysisPoints = [
        'Food identified as Mock Chicken Sandwich.',
        'CRITICAL: User reports potential safety issue (storage or smell).',
      ];
      report.recommendationToDonor =
        'Posting this item carries a high risk. We advise discarding this item.';
      report.warningForRecipient =
        'HIGH RISK: This item was reported with potential safety concerns (storage/smell).';
    } else {
      report.riskLevel = 'Low';
      report.analysisPoints = [
        'Food identified as Mock Chicken Sandwich.',
        'No obvious risks detected based on user input.',
      ];
      report.recommendationToDonor = 'Thank you for your donation.';
      report.warningForRecipient =
        'No immediate risks reported. Please inspect upon pickup.';
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    return report;
  }
}
