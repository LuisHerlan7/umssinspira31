
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

@Injectable()
export class VacantesService {
  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async consultarDisponibilidad(buscar?: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('vacante')
      .select('*');

    if (error) {
      console.error('Error consultando vacantes:', error.message);

      throw new InternalServerErrorException(
        'No se pudieron consultar las vacantes.',
      );
    }

    let vacantes = data ?? [];

    if (buscar?.trim()) {
      const termino = buscar.trim().toLowerCase();

      vacantes = vacantes.filter((vacante) =>
        Object.values(vacante).some(
          (valor) =>
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
