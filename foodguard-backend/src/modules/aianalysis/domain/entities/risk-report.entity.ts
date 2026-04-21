export class RiskReport {
  foodIdentity: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  analysisPoints: string[];
  recommendationToDonor: string;
  warningForRecipient: string;
}
