import { Controller, Post, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  private readonly privateKey: string;

  constructor() {
    const keyPath = path.resolve(process.cwd(), 'keys/client-private.pem');
    this.privateKey = fs.readFileSync(keyPath, 'utf8');
  }

  @Post('sign')
  signData(@Body() body: { method: string; path: string }) {
    const { method, path: reqPath } = body;
    const dataToSign = `${method}:${reqPath}`;

    const signature = crypto.sign('sha256', Buffer.from(dataToSign), {
      key: this.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    return {
      signedData: dataToSign,
      signature: signature.toString('base64'),
    };
  }
}
