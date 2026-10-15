import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ValidarEstructuraVacanteDto } from './dto/validar-estructura-vacante.dto';
import { VacantesEstructuraService } from './vacantes-estructura.service';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(
    private readonly vacantesEstructuraService: VacantesEstructuraService,
    private readonly vacantesService: VacantesService,
  ) {}

  @Post('estructura/validar')
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidarEstructuraVacanteDto) {
    return this.vacantesEstructuraService.preparar(dto);
  }

  @Get('disponibilidad')
  async consultarDisponibilidad(@Query('buscar') buscar?: string) {
    return this.vacantesService.consultarDisponibilidad(buscar);
  }
}
