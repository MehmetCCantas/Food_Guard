import { IProductRepository as IProductRepositoryFromProduct } from '../../../../products/application/ports/out/product.out-ports';
import {
  IUserRepository as IUserRepositoryFromUser,
  IHashingService as IHashingServiceFromUser,
} from '../../../../users/application/ports/out/user.out-port';

export const IJwtService = Symbol('IJwtService');

export interface ITokenPayload {
  userId: string;
  email: string;
}

export interface IJwtService {
  createToken(
    payload: ITokenPayload,
    secret: string,
    expiresIn: number,
  ): Promise<string>;

  validateToken(token: string, secret: string): Promise<ITokenPayload>;
}

export const IEmailService = Symbol('IEmailService');

export interface IEmailService {
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
  sendVerificationCode(email: string, code: string): Promise<void>;
}

export const IUserRepository = IUserRepositoryFromUser;
export interface IUserRepository extends IUserRepositoryFromUser {}

export const IHashingService = IHashingServiceFromUser;
export interface IHashingService extends IHashingServiceFromUser {}

export { IProductRepositoryFromProduct as IProductRepository };
