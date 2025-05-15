import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.split(' ')[1];

    // Simulated token check — replace with actual logic
    if (token !== 'your-secure-token') {
      throw new UnauthorizedException('Invalid token');
    }

    // Optionally attach user data to the request
    req['user'] = { id: '123', role: 'admin' };

    next();
  }
}
