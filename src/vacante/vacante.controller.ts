import { Controller, Get, Param } from '@nestjs/common';
import { VacanteService } from './vacante.service';

@Controller('vacante')
export class VacanteController {
  constructor(private readonly vacanteService: VacanteService) {}

  @Get()
  obtenerTodas() {
    return this.vacanteService.findAll();
  }

  // Endpoint para la vista detallada de la HU8 (ej: GET /vacante/123-abc)
  @Get(':id')
  obtenerPorId(@Param('id') id: string) {
    return this.vacanteService.findOne(id);
  }
}