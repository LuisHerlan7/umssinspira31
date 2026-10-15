import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ValidarEstructuraVacanteDto } from './dto/validar-estructura-vacante.dto';
import { VacantesEstructuraService } from './vacantes-estructura.service';

@Controller('vacantes/estructura')
export class VacantesController {
  constructor(
    private readonly vacantesEstructuraService: VacantesEstructuraService,
  ) {}

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidarEstructuraVacanteDto) {
    return this.vacantesEstructuraService.preparar(dto);
  }
}
