import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';

type TipoHabilidad = 'Tecnica' | 'Profesional';

@Injectable()
export class HabilidadesRequeridasService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  async listarHabilidades(tipo?: string) {
    if (
      tipo !== undefined &&
      tipo !== 'Tecnica' &&
      tipo !== 'Profesional'
    ) {
      throw new BadRequestException(
        'El tipo debe ser Tecnica o Profesional.',
      );
    }

    let consulta = this.db
      .from('habilidad')
      .select('id, nombre, tipo, descripcion')
      .eq('esta_activo', true)
      .order('nombre', { ascending: true });

    if (tipo) {
      consulta = consulta.eq('tipo', tipo as TipoHabilidad);
    }

    const { data, error } = await consulta;

    if (error) {
      throw new InternalServerErrorException(
        'No se pudieron consultar las habilidades disponibles.',
      );
    }

    return data ?? [];
  }

  private async validarVacante(idVacante: string) {
    const { data, error } = await this.db
      .from('vacante')
      .select('id, titulo')
      .eq('id', idVacante)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo verificar la vacante.',
      );
    }

    if (!data) {
      throw new NotFoundException('La vacante no existe.');
    }

    return data;
  }

  async listarPorVacante(idVacante: string) {
    await this.validarVacante(idVacante);

    const { data, error } = await this.db
      .from('vacante_habilidad')
      .select(
        'id_habilidad, habilidad(id, nombre, tipo, descripcion)',
      )
      .eq('id_vacante', idVacante);

    if (error) {
      throw new InternalServerErrorException(
        'No se pudieron consultar las habilidades de la vacante.',
      );
    }

    return (data ?? []).map((fila) => ({
      idHabilidad: fila.id_habilidad,
      habilidad: fila.habilidad,
    }));
  }

  async agregar(idVacante: string, idHabilidad: string) {
    await this.validarVacante(idVacante);

    const { data: habilidad, error: errorHabilidad } = await this.db
      .from('habilidad')
      .select('id')
      .eq('id', idHabilidad)
      .eq('esta_activo', true)
      .maybeSingle();

    if (errorHabilidad) {
      throw new InternalServerErrorException(
        'No se pudo verificar la habilidad.',
      );
    }

    if (!habilidad) {
      throw new NotFoundException(
        'La habilidad no existe o no está disponible.',
      );
    }

    const { data: existente, error: errorExistente } = await this.db
      .from('vacante_habilidad')
      .select('id_habilidad')
      .eq('id_vacante', idVacante)
      .eq('id_habilidad', idHabilidad)
      .maybeSingle();

    if (errorExistente) {
      throw new InternalServerErrorException(
        'No se pudo comprobar si la habilidad ya está seleccionada.',
      );
    }

    if (existente) {
      throw new ConflictException(
        'Esta habilidad ya está asociada a la vacante.',
      );
    }

    const { error } = await this.db
      .from('vacante_habilidad')
      .insert({
        id_vacante: idVacante,
        id_habilidad: idHabilidad,
      });

    if (error) {
      // La clave primaria compuesta también protege contra
      // duplicados en la base de datos.
      if (error.code === '23505') {
        throw new ConflictException(
          'Esta habilidad ya está asociada a la vacante.',
        );
      }

      throw new InternalServerErrorException(
        'No se pudo registrar la habilidad requerida.',
      );
    }

    return this.listarPorVacante(idVacante);
  }

  async reemplazar(
    idVacante: string,
    habilidades: string[],
  ) {
    await this.validarVacante(idVacante);

    if (new Set(habilidades).size !== habilidades.length) {
      throw new BadRequestException(
        'La lista contiene habilidades duplicadas.',
      );
    }

    const { error } = await this.db.rpc(
      'reemplazar_habilidades_vacante',
      {
        p_id_vacante: idVacante,
        p_habilidades: habilidades,
      },
    );

    if (error) {
      if (error.message.includes('VACANTE_NO_EXISTE')) {
        throw new NotFoundException('La vacante no existe.');
      }

      if (error.message.includes('HABILIDAD_INVALIDA')) {
        throw new BadRequestException(
          'Una o más habilidades no existen o no están disponibles.',
        );
      }

      throw new InternalServerErrorException(
        'No se pudieron actualizar las habilidades requeridas.',
      );
    }

    return this.listarPorVacante(idVacante);
  }

  async eliminar(idVacante: string, idHabilidad: string) {
    await this.validarVacante(idVacante);

    const { data, error } = await this.db
      .from('vacante_habilidad')
      .delete()
      .eq('id_vacante', idVacante)
      .eq('id_habilidad', idHabilidad)
      .select('id_habilidad')
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo eliminar la habilidad requerida.',
      );
    }

    if (!data) {
      throw new NotFoundException(
        'La habilidad no está asociada a esta vacante.',
      );
    }

    return this.listarPorVacante(idVacante);
  }
}