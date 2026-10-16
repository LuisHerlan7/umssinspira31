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
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AddRequisitosDto } from './dto/add-requisitos.dto';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { ValidarEstructuraVacanteDto } from './dto/validar-estructura-vacante.dto';
import { VacantesIndexService } from './indexacion/vacantes-index.service';
import { VacantesEstructuraService } from './vacantes-estructura.service';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(
    private readonly vacantesEstructuraService: VacantesEstructuraService,
    private readonly requisitosTecnicosService: RequisitosTecnicosService,
    private readonly vacantesService: VacantesService,
    private readonly vacantesIndexService: VacantesIndexService,
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
  @Get('disponibilidad')
  consultarDisponibilidad(@Query('buscar') buscar?: string) {
    return this.vacantesService.consultarDisponibilidad(buscar);
  }

  @Get('buscar')
  buscar(@Query('q') query = '') {
    return this.vacantesIndexService.buscar(query);
  }

  @Post()
  crear(@Body() dto: CreateVacanteDto) {
    return this.vacantesService.crear(dto);
  }

  @Get()
  listarPorEmpresa(
    @Query('idEmpresa', new ParseUUIDPipe()) idEmpresa: string,
  ) {
    return this.vacantesService.listarPorEmpresa(idEmpresa);
  }

  @Get(':id')
  obtenerPorId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vacantesService.obtenerPorId(id);
  }

  @Post(':id/indexar')
  indexar(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.vacantesIndexService.indexarVacante(id);
  }

  @Post(':id/requisitos')
  agregarRequisitos(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddRequisitosDto,
  ) {
    return this.vacantesService.agregarRequisitos(id, dto.requisitos);
  }
}
