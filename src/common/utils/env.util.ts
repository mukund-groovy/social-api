// env.util.ts
import { ConfigService } from '@nestjs/config';

let configService: ConfigService | null = null;

export function setConfigService(service: ConfigService) {
  configService = service;
}

export function getEnv<T = string>(key: string, defaultValue?: T): T {
  if (!configService) {
    throw new Error(
      'ConfigService not initialized. Call setConfigService() first.',
    );
  }

  const value = configService.get<T>(key);
  if (value === undefined) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}
