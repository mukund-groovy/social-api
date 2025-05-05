import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SignatureAuthGuard implements CanActivate {
  private publicKey: string;

  constructor() {
    const publicKeyPath = path.resolve(process.cwd(), 'keys/client-public.pem');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const message = request.headers['x-message'];
    const signature = request.headers['x-signature'];

    if (!message || !signature) {
      throw new UnauthorizedException(
        'Missing x-message or x-signature header',
      );
    }

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

    return true;
  }
}
