
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

type FilaVacante = Record<string, any>;

@Injectable()
export class VacantesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  private get db() {
    return this.supabaseService.getAdminClient();
  }

  private obtenerValor(
    fila: FilaVacante,
    nombres: string[],
  ): any {
    for (const nombre of nombres) {
      if (
        Object.prototype.hasOwnProperty.call(fila, nombre) &&
        fila[nombre] !== undefined
      ) {
        return fila[nombre];
      }
    }

    return undefined;
  }

  private estaDisponible(vacante: FilaVacante): boolean {
    const estado = this.obtenerValor(vacante, [
      'estado',
      'estado_vacante',
      'status',
      'estado_publicacion',
    ]);

    const estadoNormalizado = String(estado ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const estadosPublicados = [
      'publicada',
      'publicado',
      'publicada y vigente',
      'vigente',
      'abierta',
      'activo',
      'activa',
      'published',
      'open',
    ];

    if (!estadosPublicados.includes(estadoNormalizado)) {
      return false;
    }

    const fechaLimite = this.obtenerValor(vacante, [
      'fecha_limite',
      'fecha_cierre',
      'fecha_fin',
      'fecha_vencimiento',
      'fecha_limite_postulacion',
    ]);

    if (fechaLimite) {
      const fecha = new Date(fechaLimite);

      if (Number.isNaN(fecha.getTime())) {
        return false;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fecha < hoy) {
        return false;
      }
    }

    return true;
  }

  async consultarDisponibilidad(buscar?: string) {
    const { data, error } = await this.db
      .from('vacante')
      .select('*');

    if (error) {
      console.error(
        'Error consultando vacantes:',
        error.message,
      );

      throw new InternalServerErrorException(
        'No se pudieron consultar las vacantes disponibles.',
      );
    }

    let vacantes = ((data ?? []) as FilaVacante[])
      .filter((vacante) => this.estaDisponible(vacante));

    if (buscar?.trim()) {
      const termino = buscar.trim().toLowerCase();

      vacantes = vacantes.filter((vacante) =>
        Object.values(vacante).some((valor) =>
          typeof valor === 'string' &&
          valor.toLowerCase().includes(termino),
        ),
      );
    }

    return {
      total: vacantes.length,
      vacantes,
    };
  }
}
