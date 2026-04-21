import { Request } from '../../domain/entities/request.entity';

export class RequestResponseDto extends Request {
  constructor(partial: Partial<Request>) {
    super();
    Object.assign(this, partial);
  }
}
