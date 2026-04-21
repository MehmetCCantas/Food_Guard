import {
  Inject,
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IHashingService,
  IJwtService,
  IUserRepository,
  ITokenPayload,
} from '../ports/out/auth.out-ports';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(IHashingService)
    private readonly hashingService: IHashingService,
    @Inject(IJwtService)
    private readonly jwtService: IJwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    userId: string,
    providedRefreshToken: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isRefreshTokenMatching = await this.hashingService.comparePassword(
      providedRefreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }

    const accessTokenSecret = this.configService.get<string>('JWT_SECRET');
    const accessTokenExpiresIn = this.configService.get<number>(
      'JWT_EXPIRATION_TIME',
    );

    if (!accessTokenSecret || !accessTokenExpiresIn) {
      throw new InternalServerErrorException('JWT configuration is missing');
    }

    const payload: ITokenPayload = { userId: user.id, email: user.email };
    const accessToken = await this.jwtService.createToken(
      payload,
      accessTokenSecret,
      accessTokenExpiresIn,
    );

    return { accessToken };
  }
}
