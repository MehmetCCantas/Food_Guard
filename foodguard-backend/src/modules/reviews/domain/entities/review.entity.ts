export class Review {
  id: string;

  requestId: string;

  recipientId: string;

  donorId: string;

  rating: number;

  comment?: string;
  createdAt: Date;
}
