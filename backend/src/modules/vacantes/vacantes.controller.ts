import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AddRequisitosDto } from './dto/add-requisitos.dto';
import { CreateVacanteDto } from './dto/create-vacante.dto';
import { VacantesService } from './vacantes.service';

@Controller('vacantes')
export class VacantesController {
  constructor(private readonly vacantesService: VacantesService) {}

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

  @Post(':id/requisitos')
  agregarRequisitos(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: AddRequisitosDto,
  ) {
    return this.vacantesService.agregarRequisitos(id, dto.requisitos);
  }
}
