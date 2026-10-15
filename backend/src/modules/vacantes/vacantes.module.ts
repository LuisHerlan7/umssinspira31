import { Module } from '@nestjs/common';
import { RequisitosTecnicosService } from './requisitos-tecnicos.service';
import { VacantesController } from './vacantes.controller';
import { VacantesEstructuraService } from './vacantes-estructura.service';

@Module({
  controllers: [VacantesController],
  providers: [VacantesEstructuraService, RequisitosTecnicosService],
  exports: [VacantesEstructuraService, RequisitosTecnicosService],
})
export class VacantesModule {}
