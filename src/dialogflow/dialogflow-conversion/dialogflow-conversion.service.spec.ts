import { Test, TestingModule } from '@nestjs/testing';
import { DialogflowConversionService } from './dialogflow-conversion.service';

describe('DialogflowConversionService', () => {
  let service: DialogflowConversionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DialogflowConversionService],
    }).compile();

    service = module.get<DialogflowConversionService>(DialogflowConversionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
