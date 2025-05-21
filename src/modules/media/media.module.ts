import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { AzureMediaModule } from '@aauti/nest-azure-media';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AzureMediaModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        accountName: configService.get('AZURE_ACCOUNT_NAME'),
        accountKey: configService.get('AZURE_ACCOUNT_KEY'),
        containerName: configService.get('AZURE_CONTAINER_NAME'),
        basePath: 'social/',
        retryCount: 3,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MediaController],
})
export class MediaModule {}
