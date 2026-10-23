import { Test, TestingModule } from '@nestjs/testing';
import { VacanteService } from './vacante.service';

describe('VacanteService', () => {
  let service: VacanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VacanteService],
    }).compile();

    service = module.get<VacanteService>(VacanteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
