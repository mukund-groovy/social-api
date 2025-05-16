// src/auth/signature.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private privateKey: string;

  constructor() {
    const privateKeyPath = path.resolve(
      process.cwd(),
      'keys/client-private.pem',
    );
    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  }

  generateSignedHeaders(userId: string): {
    'x-user-id': string;
    'x-auth-timestamp': string;
    'x-auth-signature': string;
  } {
    const timestamp = Date.now().toString();
    const message = `${userId}:${timestamp}`;

    const signer = crypto.createSign('sha256');
    signer.update(message);
    signer.end();

    const signature = signer.sign(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      },
      'base64',
    );

    return {
      'x-user-id': userId,
      'x-auth-timestamp': timestamp,
      'x-auth-signature': signature,
    };
  }
}
