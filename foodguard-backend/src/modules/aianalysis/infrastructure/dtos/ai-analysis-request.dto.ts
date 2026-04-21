export class AiAnalysisRequestDto {
  photoBase64: string;
  photoMimeType: string;
  storageCondition: 'fridge' | 'room_temp' | 'unknown';
  storageDurationHours: number;
  hasSmellChange: boolean;
}
