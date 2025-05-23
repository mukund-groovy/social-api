import { Test, TestingModule } from '@nestjs/testing';
import { FailedJobService } from './failed-job.service';

describe('FailedJobService', () => {
  let service: FailedJobService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FailedJobService],
    }).compile();

    service = module.get<FailedJobService>(FailedJobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
