import { Module } from '@nestjs/common';
import { VacantesController } from './vacantes.controller';
import { VacantesEstructuraService } from './vacantes-estructura.service';

@Module({
  controllers: [VacantesController],
  providers: [VacantesEstructuraService],
  exports: [VacantesEstructuraService],
})
export class VacantesModule {}
