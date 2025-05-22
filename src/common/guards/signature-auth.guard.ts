import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import { UserService } from 'src/modules/user/user.service';
import { ObjectID } from '@utils/mongodb.util';

@Injectable()
export class SignatureAuthGuard implements CanActivate {
  private publicKey: string;

  constructor(private readonly userService: UserService) {
    const publicKeyPath = path.resolve(process.cwd(), 'keys/client-public.pem');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const userId = request.headers['x-user-id'] as string;
    const timestamp = request.headers['x-auth-timestamp'] as string;
    const signature = request.headers['x-auth-signature'] as string;

    if (!userId || !timestamp || !signature) {
      throw new UnauthorizedException('Missing authentication headers');
    }

    const now = Date.now();
    const ts = Number(timestamp);
    if (isNaN(ts) || Math.abs(now - ts) > 5 * 60 * 1000) {
      throw new UnauthorizedException('Invalid or expired timestamp');
    }

    const message = `${userId}:${timestamp}`;
    const isValid = crypto.verify(
      'sha256',
      Buffer.from(message),
      {
        key: this.publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(signature, 'base64'),
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    const user = await this.userService.checkUser(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    (request as any).user = user;

    return true;
  }
}
