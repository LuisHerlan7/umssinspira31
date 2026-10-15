
import { Controller, Get, Query } from '@nestjs/common';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(
    private readonly vacantesService: VacantesService,
  ) {}

  @Get('disponibilidad')
  consultarDisponibilidad(
    @Query('buscar') buscar?: string,
  ) {
    return this.vacantesService.consultarDisponibilidad(buscar);
  }
}
