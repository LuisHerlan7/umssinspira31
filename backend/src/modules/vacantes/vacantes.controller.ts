import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AddRequisitosDto } from './dto/add-requisitos.dto';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { UpdateDisponibilidadDto } from './dto/update-disponibilidad.dto';
import { UpdateVacanteDto } from './dto/update-vacante.dto';
import { ValidarEstructuraVacanteDto } from './dto/validar-estructura-vacante.dto';
import { VacantesIndexService } from './indexacion/vacantes-index.service';
import { VacantesEstructuraService } from './vacantes-estructura.service';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(
    private readonly vacantesEstructuraService: VacantesEstructuraService,
    private readonly vacantesService: VacantesService,
    private readonly vacantesIndexService: VacantesIndexService,
  ) {}

  @Post('estructura/validar')
  @HttpCode(HttpStatus.OK)
  validar(@Body() dto: ValidarEstructuraVacanteDto) {
    return this.vacantesEstructuraService.preparar(dto);
  }

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

  @Patch(':id/disponibilidad')
  actualizarDisponibilidad(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateDisponibilidadDto,
  ) {
    return this.vacantesIndexService.actualizarDisponibilidad(
      id,
      dto.disponible,
    );
  }

  @Patch(':id')
  actualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVacanteDto,
  ) {
    return this.vacantesIndexService.actualizarVacante(id, dto);
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
