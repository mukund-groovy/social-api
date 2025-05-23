import { Module } from '@nestjs/common';
import { FailedJobService } from './failed-job.service';
import { FailedJobController } from './failed-job.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FailedJob, FailedJobSchema } from './entities/failed-job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FailedJob.name, schema: FailedJobSchema },
    ]),
  ],
  providers: [FailedJobService],
  controllers: [FailedJobController],
  exports: [FailedJobService],
})
export class FailedJobModule {}
