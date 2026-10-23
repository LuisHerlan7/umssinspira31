import { Module } from '@nestjs/common';
import { VacanteController } from './vacante.controller';
import { VacanteService } from './vacante.service';

@Module({
  controllers: [VacanteController],
  providers: [VacanteService]
})
export class VacanteModule {}
