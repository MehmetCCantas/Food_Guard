import { RequestStatus } from '../enums/request.enum';

export class Request {
  id: string;
  productId: string;
  recipientId: string;
  donorId: string;
  status: RequestStatus;
  requestMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}
