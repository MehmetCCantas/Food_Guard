import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { IUserRepository } from '../ports/out/admin.out-ports';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
