import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import {
  UserRole,
  VerificationStatus,
} from '../../domain/enums/user-status.enum';
import { RegisterUserDto } from '../../infrastructure/dtos/register-user.dto';
import { IHashingService, IUserRepository } from '../ports/out/user.out-port';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
  ) {}

  async execute(command: RegisterUserDto): Promise<User> {
    const { email, fullName, password, city, district, role, phoneNumber } = command;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('This email already exits.');
    }

    const hashedPassword = await this.hashingService.hashPassword(password);

    const newUser = new User();
    newUser.id = uuidv4();
    newUser.email = email.toLowerCase();
    newUser.passwordHash = hashedPassword;
    newUser.fullName = fullName;
    newUser.city = city;
    newUser.district = district;
    newUser.role = role || UserRole.INDIVIDUAL_RECIPIENT;
    newUser.phoneNumber = phoneNumber;
    newUser.verificationStatus = VerificationStatus.UNVERIFIED;
    newUser.ratingScore = 0;
    newUser.createdAt = new Date();
    newUser.updatedAt = new Date();

    return this.userRepository.save(newUser);
  }
}
