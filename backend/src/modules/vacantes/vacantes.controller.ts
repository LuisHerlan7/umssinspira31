import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ActualizarRequisitoDto } from './dto/actualizar-requisito.dto';
import { AsociarRequisitosDto } from './dto/asociar-requisitos.dto';
import { ValidarEstructuraVacanteDto } from './dto/validar-estructura-vacante.dto';
import { RequisitosTecnicosService } from './requisitos-tecnicos.service';
import { VacantesEstructuraService } from './vacantes-estructura.service';

@Controller('vacantes')
export class VacantesController {
  constructor(
    private readonly vacantesEstructuraService: VacantesEstructuraService,
    private readonly requisitosTecnicosService: RequisitosTecnicosService,
  ) {}

  @Post('estructura/validar')
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidarEstructuraVacanteDto) {
    return this.vacantesEstructuraService.preparar(dto);
  }

  @Post(':id/requisitos')
  @HttpCode(HttpStatus.CREATED)
  asociarRequisitos(
    @Param('id') idVacante: string,
    @Body() dto: AsociarRequisitosDto,
  ) {
    return this.requisitosTecnicosService.asociarRequisitos(
      idVacante,
      dto.requisitos,
    );
  }

  @Get(':id/requisitos')
  obtenerRequisitos(@Param('id') idVacante: string) {
    return this.requisitosTecnicosService.obtenerRequisitos(idVacante);
  }

  @Get(':id/requisitos/matching')
  obtenerEstructuraIndexacion(@Param('id') idVacante: string) {
    return this.requisitosTecnicosService.obtenerEstructuraIndexacion(idVacante);
  }

  @Patch(':id/requisitos/:idRequisito')
  actualizarRequisito(
    @Param('id') idVacante: string,
    @Param('idRequisito') idRequisito: string,
    @Body() dto: ActualizarRequisitoDto,
  ) {
    return this.requisitosTecnicosService.actualizarRequisito(
      idVacante,
      idRequisito,
      dto,
    );
  }

  @Delete(':id/requisitos/:idRequisito')
  eliminarRequisito(
    @Param('id') idVacante: string,
    @Param('idRequisito') idRequisito: string,
  ) {
    return this.requisitosTecnicosService.eliminarRequisito(
      idVacante,
      idRequisito,
    );
  }
}
