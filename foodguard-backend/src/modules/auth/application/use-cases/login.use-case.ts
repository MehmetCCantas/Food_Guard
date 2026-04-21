import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../infrastructure/dtos/login.dto';
import {
  IHashingService,
  IJwtService,
  IUserRepository,
  ITokenPayload,
} from '../ports/out/auth.out-ports';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    @Inject(IJwtService)
    private readonly jwtService: IJwtService,
  ) {}

  private async getTokens(
    payload: ITokenPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.createToken(
      payload,
      'secret12345',
      3600,
    );

    const refreshToken = await this.jwtService.createToken(
      payload,
      'secretsecurity12345',
      604800,
    );

    return { accessToken, refreshToken };
  }

  async execute(
    command: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = command;

    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashingService.comparePassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: ITokenPayload = { userId: user.id, email: user.email };
    const { accessToken, refreshToken } = await this.getTokens(payload);

    const hashedRefreshToken =
      await this.hashingService.hashPassword(refreshToken);
    await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }
}
