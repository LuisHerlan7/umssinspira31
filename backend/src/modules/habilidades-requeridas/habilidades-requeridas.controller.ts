import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { AgregarHabilidadDto } from './dto/agregar-habilidad.dto';
import { ReemplazarHabilidadesDto } from './dto/reemplazar-habilidades.dto';
import { HabilidadesRequeridasService } from './habilidades-requeridas.service';

@Controller()
export class HabilidadesRequeridasController {
  constructor(
    private readonly habilidadesService: HabilidadesRequeridasService,
  ) {}

  @Get('habilidades')
  listarHabilidades(@Query('tipo') tipo?: string) {
    return this.habilidadesService.listarHabilidades(tipo);
  }

  @Get('vacantes/:idVacante/habilidades-requeridas')
  listarPorVacante(
    @Param('idVacante', new ParseUUIDPipe()) idVacante: string,
  ) {
    return this.habilidadesService.listarPorVacante(idVacante);
  }

  @Post('vacantes/:idVacante/habilidades-requeridas')
  agregar(
    @Param('idVacante', new ParseUUIDPipe()) idVacante: string,
    @Body() dto: AgregarHabilidadDto,
  ) {
    return this.habilidadesService.agregar(
      idVacante,
      dto.idHabilidad,
    );
  }

  @Put('vacantes/:idVacante/habilidades-requeridas')
  reemplazar(
    @Param('idVacante', new ParseUUIDPipe()) idVacante: string,
    @Body() dto: ReemplazarHabilidadesDto,
  ) {
    return this.habilidadesService.reemplazar(
      idVacante,
      dto.habilidades,
    );
  }

  @Delete(
    'vacantes/:idVacante/habilidades-requeridas/:idHabilidad',
  )
  eliminar(
    @Param('idVacante', new ParseUUIDPipe()) idVacante: string,
    @Param('idHabilidad', new ParseUUIDPipe()) idHabilidad: string,
  ) {
    return this.habilidadesService.eliminar(
      idVacante,
      idHabilidad,
    );
  }
}