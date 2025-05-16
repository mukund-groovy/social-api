// src/auth/auth.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('sign')
  getSignedHeaders(@Query('userId') userId: string) {
    if (!userId) {
      return { error: 'Missing userId' };
    }

    return this.authService.generateSignedHeaders(userId);
  }
}
