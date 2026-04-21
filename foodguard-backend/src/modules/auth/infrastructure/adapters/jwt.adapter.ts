import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  IJwtService,
  ITokenPayload,
} from '../../application/ports/out/auth.out-ports';

@Injectable()
export class JwtAdapter implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async createToken(
    payload: ITokenPayload,
    secret: string,
    expiresIn: number,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }

  async validateToken(token: string, secret: string): Promise<ITokenPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: secret,
    });
    return payload as ITokenPayload;
  }
}
