
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { RegistrarMentorDto } from './dto/registrar-mentor.dto';

@Injectable()
export class DisponibilidadMentorService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private db() {
    return this.supabaseService.getClient();
  }

  async registrar(idEgresado: string, dto: RegistrarMentorDto) {
    const db = this.db();

    // 1. Verificar que exista el egresado y esté aprobado.
    const { data: egresado, error: errorEgresado } = await db
      .from('egresado')
      .select('id, id_usuario, estado_aprobacion')
      .eq('id', idEgresado)
      .maybeSingle();

    if (errorEgresado) {
      throw new InternalServerErrorException(
        'No se pudo verificar el estado del egresado.',
      );
    }

    if (!egresado) {
      throw new NotFoundException('El egresado no existe.');
    }

    if (
      String(egresado.estado_aprobacion ?? '').toUpperCase() !== 'APROBADO'
    ) {
      throw new ForbiddenException(
        'Solo los egresados aprobados pueden registrarse como mentores.',
      );
    }

    if (!egresado.id_usuario) {
      throw new BadRequestException(
        'El egresado no está vinculado a un usuario del sistema.',
      );
    }

    // 2. Comprobar que las áreas existan y estén activas.
    const { data: areas, error: errorAreas } = await db
      .from('area')
      .select('id')
      .in('id', dto.areas)
      .eq('esta_activo', true);

    if (errorAreas) {
      throw new InternalServerErrorException(
        'No se pudieron consultar las áreas de especialidad.',
      );
    }

    if (!areas || areas.length !== dto.areas.length) {
      throw new BadRequestException(
        'Una o más áreas no existen o están inactivas.',
      );
    }

    // 3. Evitar registros duplicados de mentor.
    const { data: mentorExistente, error: errorMentor } = await db
      .from('mentor')
      .select('id')
      .eq('id_egresado', idEgresado)
      .maybeSingle();

    if (errorMentor) {
      throw new InternalServerErrorException(
        'No se pudo consultar el registro de mentor.',
      );
    }

    if (mentorExistente) {
      throw new BadRequestException(
        'Este egresado ya está registrado como mentor.',
      );
    }

    // 4. Crear el registro del mentor.
    const { data: mentor, error: errorCrear } = await db
      .from('mentor')
      .insert({
        id_egresado: idEgresado,
        experiencia: dto.experiencia ?? null,
        anios_exp: dto.aniosExp ?? 0,
        esta_activo: true,
        fecha_creacion: new Date().toISOString().slice(0, 10),
        fecha_actualizacion: new Date().toISOString(),
      })
      .select('id, id_egresado, experiencia, anios_exp, esta_activo')
      .single();

    if (errorCrear || !mentor) {
      throw new InternalServerErrorException(
        'No se pudo registrar el mentor.',
      );
    }

    // 5. Asociar las áreas seleccionadas.
    const asociaciones = dto.areas.map((idArea) => ({
      id_mentor: mentor.id,
      id_area: idArea,
      fecha_creacion: new Date().toISOString().slice(0, 10),
    }));

    const { error: errorAsociaciones } = await db
      .from('mentor_area')
      .insert(asociaciones);

    if (errorAsociaciones) {
      // Compensación por si falla el registro de especialidades.
      await db.from('mentor').delete().eq('id', mentor.id);

      throw new InternalServerErrorException(
        'No se pudieron guardar las especialidades del mentor.',
      );
    }

    // 6. Activar el rol Mentor en el usuario.
    const { error: errorRol } = await db
      .from('usuario')
      .update({ rol: 'Mentor' })
      .eq('usuario_id', egresado.id_usuario);

    if (errorRol) {
      await db.from('mentor_area').delete().eq('id_mentor', mentor.id);
      await db.from('mentor').delete().eq('id', mentor.id);

      throw new InternalServerErrorException(
        'No se pudo actualizar el rol del usuario.',
      );
    }

    return {
      mensaje: 'Mentor registrado correctamente.',
      mentor,
      areas: dto.areas,
    };
  }

  async consultar(idEgresado: string) {
    const db = this.db();

    const { data: mentor, error } = await db
      .from('mentor')
      .select(`
        id,
        id_egresado,
        experiencia,
        anios_exp,
        esta_activo,
        mentor_area (
          id_area,
          area (
            id,
            nombre
          )
        )
      `)
      .eq('id_egresado', idEgresado)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo consultar la disponibilidad del mentor.',
      );
    }

    if (!mentor) {
      throw new NotFoundException(
        'El egresado todavía no está registrado como mentor.',
      );
    }

    return mentor;
  }

  async actualizar(
    idEgresado: string,
    dto: RegistrarMentorDto,
  ) {
    const db = this.db();

    const { data: mentor, error } = await db
      .from('mentor')
      .select('id')
      .eq('id_egresado', idEgresado)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo consultar el mentor.',
      );
    }

    if (!mentor) {
      throw new NotFoundException('El mentor no está registrado.');
    }

    // Reutilizar la validación de áreas activas.
    const { data: areas, error: errorAreas } = await db
      .from('area')
      .select('id')
      .in('id', dto.areas)
      .eq('esta_activo', true);

    if (errorAreas) {
      throw new InternalServerErrorException(
        'No se pudieron consultar las áreas.',
      );
    }

    if (!areas || areas.length !== dto.areas.length) {
      throw new BadRequestException(
        'Una o más áreas no existen o están inactivas.',
      );
    }

    const { error: errorActualizar } = await db
      .from('mentor')
      .update({
        experiencia: dto.experiencia ?? null,
        anios_exp: dto.aniosExp ?? 0,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', mentor.id);

    if (errorActualizar) {
      throw new InternalServerErrorException(
        'No se pudo actualizar el perfil del mentor.',
      );
    }

    // Reemplazar las especialidades por la nueva selección.
    const { error: errorEliminar } = await db
      .from('mentor_area')
      .delete()
      .eq('id_mentor', mentor.id);

    if (errorEliminar) {
      throw new InternalServerErrorException(
        'No se pudieron actualizar las especialidades.',
      );
    }

    const { error: errorInsertar } = await db
      .from('mentor_area')
      .insert(
        dto.areas.map((idArea) => ({
          id_mentor: mentor.id,
          id_area: idArea,
        })),
      );

    if (errorInsertar) {
      throw new InternalServerErrorException(
        'No se pudieron guardar las nuevas especialidades.',
      );
    }

    return {
      mensaje: 'Perfil y especialidades actualizados correctamente.',
      idMentor: mentor.id,
      areas: dto.areas,
    };
  }

  async cambiarDisponibilidad(idEgresado: string, activo: boolean) {
    const db = this.db();

    const { data: mentor, error: errorBuscar } = await db
      .from('mentor')
      .select('id, id_egresado')
      .eq('id_egresado', idEgresado)
      .maybeSingle();

    if (errorBuscar) {
      throw new InternalServerErrorException(
        'No se pudo consultar el mentor.',
      );
    }

    if (!mentor) {
      throw new NotFoundException('El mentor no está registrado.');
    }

    const { error } = await db
      .from('mentor')
      .update({
        esta_activo: activo,
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq('id', mentor.id);

    if (error) {
      throw new InternalServerErrorException(
        'No se pudo cambiar la disponibilidad.',
      );
    }

    return {
      mensaje: activo
        ? 'Disponibilidad de mentor activada.'
        : 'Disponibilidad de mentor desactivada.',
      estaActivo: activo,
    };
  }
}