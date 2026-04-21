import { User } from '../../../../users/domain/entities/user.entity';

export const IAdminService = Symbol('IAdminService');

export interface IAdminService {
  verifyUser(userId: string): Promise<User>;
}
