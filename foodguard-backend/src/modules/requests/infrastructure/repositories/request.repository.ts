import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, EntityManager } from 'typeorm';
import { Request } from '../../domain/entities/request.entity';
import { IRequestRepository } from '../../application/ports/out/request.out-ports';
import { RequestOrmEntity } from './request.orm-entity';
import { RequestStatus } from '../../domain/enums/request.enum';

@Injectable()
export class RequestRepository implements IRequestRepository {
  constructor(
    @InjectRepository(RequestOrmEntity)
    private readonly defaultRepository: Repository<RequestOrmEntity>,
  ) {}

  private getRepository(
    transactionManager?: EntityManager,
  ): Repository<RequestOrmEntity> {
    return transactionManager
      ? transactionManager.getRepository(RequestOrmEntity)
      : this.defaultRepository;
  }

  private toDomain(ormEntity: RequestOrmEntity): Request {
    const request = new Request();
    Object.assign(request, ormEntity);
    return request;
  }

  private toOrm(domainEntity: Request): RequestOrmEntity {
    const ormEntity = new RequestOrmEntity();
    Object.assign(ormEntity, domainEntity);
    return ormEntity;
  }

  async save(
    request: Request,
    transactionManager?: EntityManager,
  ): Promise<Request> {
    const repository = this.getRepository(transactionManager);
    const ormEntity = this.toOrm(request);
    const savedOrmEntity = await repository.save(ormEntity);
    return this.toDomain(savedOrmEntity);
  }

  async findByProductIdAndRecipientId(
    productId: string,
    recipientId: string,
  ): Promise<Request | null> {
    const repository = this.getRepository();
    const ormEntity = await repository.findOne({
      where: { productId, recipientId },
    });
    if (!ormEntity) return null;
    return this.toDomain(ormEntity);
  }

  async findById(id: string): Promise<Request | null> {
    const repository = this.getRepository();
    const ormEntity = await repository.findOneBy({ id });
    if (!ormEntity) {
      return null;
    }
    return this.toDomain(ormEntity);
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(transactionManager);
    await repository.update(id, { status, updatedAt: new Date() });
  }

  async rejectOtherPendingRequests(
    productId: string,
    acceptedRequestId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const repository = this.getRepository(transactionManager);
    await repository.update(
      {
        productId: Equal(productId),
        status: Equal(RequestStatus.PENDING),
        id: Not(Equal(acceptedRequestId)),
      },
      {
        status: RequestStatus.REJECTED,
        updatedAt: new Date(),
      },
    );
  }

  async findByRecipientId(
    recipientId: string,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]> {
    const repository = this.getRepository();
    const [ormEntities, totalItems] = await repository.findAndCount({
      where: { recipientId: Equal(recipientId) },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    return [ormEntities.map(this.toDomain), totalItems];
  }

  async findByProductIdAndStatus(
    productId: string,
    status: RequestStatus,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]> {
    const repository = this.getRepository();
    const [ormEntities, totalItems] = await repository.findAndCount({
      where: {
        productId: Equal(productId),
        status: Equal(status),
      },
      order: { createdAt: 'ASC' },
      skip: offset,
      take: limit,
    });
    return [ormEntities.map(this.toDomain.bind(this)), totalItems];
  }

  async findIncomingRequests(
    donorId: string,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]> {
    const repository = this.getRepository();
    const [ormEntities, totalItems] = await repository.findAndCount({
      where: { donorId: Equal(donorId) },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
    return [ormEntities.map(this.toDomain.bind(this)), totalItems];
  }
}
