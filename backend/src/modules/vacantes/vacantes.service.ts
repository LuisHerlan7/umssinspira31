import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { CreateVacanteDto } from './dto/create-vacante.dto';

interface EmpresaRow {
  razon_social: string | null;
}

interface RequerimientoRow {
  id: string;
  titulo: string | null;
}

interface VacanteRequerimientoRow {
  requerimiento_laboral: RequerimientoRow | RequerimientoRow[] | null;
}

interface VacanteRow {
  id: string;
  id_empresa: string;
  titulo: string | null;
  modalidad: string | null;
  estado: string | null;
  created_at: string | null;
  descripcion: string | null;
  ubicacion: string | null;
  area: string | null;
  condiciones: string | null;
  empresa: EmpresaRow | EmpresaRow[] | null;
  vacante_requerimiento_laboral: VacanteRequerimientoRow[] | null;
}

interface SupabaseErrorLike {
  code?: string;
  message?: string;
}

const VACANTE_SELECT = `
  id,
  id_empresa,
  titulo,
  modalidad,
  estado,
  created_at,
  descripcion,
  ubicacion,
  area,
  condiciones,
  empresa!fk_vacante_empresa(razon_social),
  vacante_requerimiento_laboral(
    requerimiento_laboral!fk_vac_req_requerimiento(
      id,
      titulo
    )
  )
`;

// Provisional para HU3; Equipo 4 definirá el catálogo oficial de estados.
const PROVISIONAL_VACANCY_STATUS = 'Disponible';

@Injectable()
export class VacantesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private get db() {
    return this.supabaseService.getClient();
  }

  private firstRelation<T>(relation: T | T[] | null): T | null {
    return Array.isArray(relation) ? (relation[0] ?? null) : relation;
  }

  private mapVacante(row: VacanteRow) {
    const empresa = this.firstRelation(row.empresa);

    return {
      id: row.id,
      idEmpresa: row.id_empresa,
      empresa: empresa?.razon_social ?? 'Empresa sin nombre registrado',
      titulo: row.titulo ?? '',
      modalidad: row.modalidad ?? '',
      estado: row.estado ?? PROVISIONAL_VACANCY_STATUS,
      fechaCreacion: row.created_at,
      descripcion: row.descripcion ?? '',
      ubicacion: row.ubicacion ?? '',
      area: row.area ?? '',
      condiciones: row.condiciones ?? '',
      requisitos: this.mapRequirements(row.vacante_requerimiento_laboral),
    };
  }

  // Adaptador temporal de TEXT[]; HU2 definirá el contrato final de requisitos.
  private mapRequirements(relations: VacanteRequerimientoRow[] | null) {
    return (relations ?? [])
      .map((relation) =>
        this.firstRelation(relation.requerimiento_laboral),
      )
      .filter((requirement): requirement is RequerimientoRow =>
        Boolean(requirement?.id && requirement.titulo),
      )
      .map((requirement) => ({
        id: requirement.id,
        nombre: requirement.titulo ?? '',
      }));
  }

  private normalizeRequirements(requirements: string[]) {
    const normalized = requirements.map((requirement) => requirement.trim());
    const unique = new Set(normalized.map((requirement) => requirement.toLowerCase()));

    if (normalized.some((requirement) => !requirement)) {
      throw new BadRequestException(
        'Los requisitos no pueden contener valores vacíos.',
      );
    }

    if (unique.size !== normalized.length) {
      throw new BadRequestException(
        'Los requisitos no pueden estar duplicados.',
      );
    }

    return normalized;
  }

  private handleWriteError(
    error: SupabaseErrorLike,
    fallbackMessage: string,
  ): never {
    const message = error.message ?? '';

    if (message.includes('REQUISITO_DUPLICADO')) {
      throw new BadRequestException(
        'Uno o más requisitos ya están asociados a la vacante.',
      );
    }

    if (
      error.code === '23503' ||
      message.includes('EMPRESA_NO_EXISTE') ||
      message.includes('VACANTE_NO_EXISTE')
    ) {
      throw new BadRequestException(
        message.includes('VACANTE_NO_EXISTE')
          ? 'La vacante indicada no existe.'
          : 'La empresa indicada no existe.',
      );
    }

    if (
      error.code === '22023' ||
      message.includes('REQUISITO_INVALIDO') ||
      message.includes('REQUISITOS_VACIOS')
    ) {
      throw new BadRequestException('Los requisitos indicados no son válidos.');
    }

    throw new InternalServerErrorException(fallbackMessage);
  }

  async crear(dto: CreateVacanteDto) {
    const requisitos = this.normalizeRequirements(dto.requisitos);
    const { data, error } = await this.db.rpc(
      'crear_vacante_con_requisitos',
      {
        p_id_empresa: dto.idEmpresa,
        p_titulo: dto.titulo.trim(),
        p_modalidad: dto.modalidad.trim(),
        p_descripcion: dto.descripcion.trim(),
        p_ubicacion: dto.ubicacion.trim(),
        p_area: dto.area.trim(),
        p_condiciones: dto.condiciones.trim(),
        p_requisitos: requisitos,
      },
    );

    if (error) {
      this.handleWriteError(error, 'No se pudo guardar la vacante.');
    }

    if (typeof data !== 'string') {
      throw new InternalServerErrorException(
        'No se pudo confirmar el identificador de la vacante guardada.',
      );
    }

    return this.obtenerPorId(data);
  }

  async obtenerPorId(id: string) {
    const { data, error } = await this.db
      .from('vacante')
      .select(VACANTE_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo consultar la vacante.',
      );
    }

    if (!data) {
      throw new NotFoundException('La vacante no existe.');
    }

    return this.mapVacante(data as unknown as VacanteRow);
  }

  async listarPorEmpresa(idEmpresa: string) {
    const { data, error } = await this.db
      .from('vacante')
      .select(VACANTE_SELECT)
      .eq('id_empresa', idEmpresa)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(
        'No se pudieron consultar las vacantes.',
      );
    }

    return ((data ?? []) as unknown as VacanteRow[]).map((row) =>
      this.mapVacante(row),
    );
  }

  async agregarRequisitos(idVacante: string, requirements: string[]) {
    const requisitos = this.normalizeRequirements(requirements);
    const { error } = await this.db.rpc('agregar_requisitos_vacante', {
      p_id_vacante: idVacante,
      p_requisitos: requisitos,
    });

    if (error) {
      this.handleWriteError(
        error,
        'No se pudieron asociar los requisitos a la vacante.',
      );
    }

    return this.obtenerPorId(idVacante);
  }
}
