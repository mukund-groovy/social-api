import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedJob, FailedJobDocument } from './entities/failed-job.entity';
import { Job } from 'bullmq';

@Injectable()
export class FailedJobService {
  constructor(
    @InjectModel(FailedJob.name)
    private failedJobModel: Model<FailedJobDocument>,
  ) {}

  async logFailedJob(job: Job, error: Error) {
    const failedJob = new this.failedJobModel({
      jobId: job.id,
      jobName: job.name,
      queueName: job.queueName,
      data: job.data,
      error: error.stack || error.message,
      failedAt: new Date(),
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      timestamp: job.timestamp,
      returnvalue: job.returnvalue,
    });

    return failedJob.save();
  }

  async logWorkerError(error: Error) {
    const failedJob = new this.failedJobModel({
      jobId: 'N/A',
      jobName: 'worker_error',
      queueName: 'N/A',
      data: {},
      error: error.stack || error.message,
      failedAt: new Date(),
    });

    return failedJob.save();
  }
}
