
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DisponibilidadMentorService } from './disponibilidad-mentor.service';
import { RegistrarMentorDto } from './dto/registrar-mentor.dto';

@Controller('disponibilidad-mentor')
export class DisponibilidadMentorController {
  constructor(
    private readonly disponibilidadMentorService: DisponibilidadMentorService,
  ) {}

  @Post(':idEgresado')
  registrar(
    @Param('idEgresado', new ParseUUIDPipe()) idEgresado: string,
    @Body() dto: RegistrarMentorDto,
  ) {
    return this.disponibilidadMentorService.registrar(idEgresado, dto);
  }

  @Get(':idEgresado')
  consultar(
    @Param('idEgresado', new ParseUUIDPipe()) idEgresado: string,
  ) {
    return this.disponibilidadMentorService.consultar(idEgresado);
  }

  @Patch(':idEgresado')
  actualizar(
    @Param('idEgresado', new ParseUUIDPipe()) idEgresado: string,
    @Body() dto: RegistrarMentorDto,
  ) {
    return this.disponibilidadMentorService.actualizar(idEgresado, dto);
  }

  @Patch(':idEgresado/disponibilidad')
  cambiarDisponibilidad(
    @Param('idEgresado', new ParseUUIDPipe()) idEgresado: string,
    @Body('activo') activo: boolean,
  ) {
    return this.disponibilidadMentorService.cambiarDisponibilidad(
      idEgresado,
      activo,
    );
  }
}