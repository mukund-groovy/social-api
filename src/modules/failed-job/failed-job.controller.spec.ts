import { Test, TestingModule } from '@nestjs/testing';
import { FailedJobController } from './failed-job.controller';

describe('FailedJobController', () => {
  let controller: FailedJobController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FailedJobController],
    }).compile();

    controller = module.get<FailedJobController>(FailedJobController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
