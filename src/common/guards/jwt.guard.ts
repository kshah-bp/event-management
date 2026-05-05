import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return false;

    try {
      const decoded = jwt.verify(token, this.configService.get<string>('JWT_SECRET')!);
      req.user = decoded;
      return true;
    } catch(error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}