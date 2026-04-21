import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ITokenPayload } from '../../application/ports/out/auth.out-ports';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'secretsecurity12345',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: ITokenPayload) {
    const authHeader = req.get('authorization');
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header found');
    }
    const refreshToken = authHeader.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
