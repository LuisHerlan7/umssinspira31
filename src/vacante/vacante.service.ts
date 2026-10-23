import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VacanteService {
  constructor(private prisma: PrismaService) {}

  // Listar todas las vacantes para el listado principal
  async findAll() {
    return this.prisma.vacante.findMany({
      include: { empresa: true },
    });
  }

  // Consultar la vista detallada de una vacante específica (para el botón "Ver oferta" de la HU8)
  async findOne(id: string) {
    const vacante = await this.prisma.vacante.findUnique({
      where: { id },
      include: { empresa: true },
    });

    if (!vacante) {
      throw new NotFoundException('La vacante solicitada no existe.');
    }

    return vacante;
  }
}