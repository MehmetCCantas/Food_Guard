import { IUserRepository as IUserRepositoryFromUser } from '../../../../users/application/ports/out/user.out-port';

export const IUserRepository = IUserRepositoryFromUser;
export interface IUserRepository extends IUserRepositoryFromUser {}
