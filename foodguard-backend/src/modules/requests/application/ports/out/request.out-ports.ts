import { IProductRepository as IProductRepositoryFromProduct } from '../../../../products/application/ports/out/product.out-ports';
import { Product } from '../../../../products/domain/entities/product.entity';
import { ProductStatus } from '../../../../products/domain/enums/product.enum';

import { Request } from '../../../domain/entities/request.entity';
import { RequestStatus } from '../../../domain/enums/request.enum';
import { EntityManager } from 'typeorm';

import { INotificationService as INotificationServiceFromNotif } from '../../../../notifications/application/ports/in/notification.in-ports';

export const IRequestRepository = Symbol('IRequestRepository');

export interface IRequestRepository {
  save(request: Request, transactionManager?: EntityManager): Promise<Request>;

  findByProductIdAndRecipientId(
    productId: string,
    recipientId: string,
  ): Promise<Request | null>;

  findById(id: string): Promise<Request | null>;

  updateStatus(
    id: string,
    status: RequestStatus,
    transactionManager?: EntityManager,
  ): Promise<void>;

  rejectOtherPendingRequests(
    productId: string,
    acceptedRequestId: string,
    transactionManager?: EntityManager,
  ): Promise<void>;

  findByRecipientId(
    recipientId: string,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]>;

  findByProductIdAndStatus(
    productId: string,
    status: RequestStatus,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]>;

  findIncomingRequests(
    donorId: string,
    limit: number,
    offset: number,
  ): Promise<[Request[], number]>;
}

export const INotificationService = INotificationServiceFromNotif;
export interface INotificationService extends INotificationServiceFromNotif {}

export const IProductRepository = IProductRepositoryFromProduct;
export interface IProductRepository extends IProductRepositoryFromProduct {}
