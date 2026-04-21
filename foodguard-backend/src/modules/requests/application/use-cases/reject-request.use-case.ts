import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { RequestStatus } from '../../domain/enums/request.enum';
import { IRequestRepository } from '../ports/out/request.out-ports';

@Injectable()
export class RejectRequestUseCase {
  constructor(
    @Inject(IRequestRepository)
    private readonly requestRepository: IRequestRepository,
  ) {}

  async execute(requestId: string, userId: string): Promise<void> {
    const request = await this.requestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.donorId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to reject this request',
      );
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException('Only pending requests can be rejected');
    }

    await this.requestRepository.updateStatus(
      requestId,
      RequestStatus.REJECTED,
    );
  }
}
