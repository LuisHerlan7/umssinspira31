import type {
  UpdateVacancyInput,
  Vacancy,
} from '../../../../lib/api/vacantes';

export type VacanteEditable = UpdateVacancyInput & {
  id: string;
  estado: string;
};

export type EstadoEdicion =
  | 'cargando'
  | 'inicial'
  | 'error'
  | 'pendiente'
  | 'guardando'
  | 'guardado';

export function crearVacanteEditable(vacancy: Vacancy): VacanteEditable {
  return {
    id: vacancy.id,
    estado: vacancy.estado,
    titulo: vacancy.titulo,
    modalidad: vacancy.modalidad,
    descripcion: vacancy.descripcion,
    ubicacion: vacancy.ubicacion,
    area: vacancy.area,
    condiciones: vacancy.condiciones,
    requisitos: vacancy.requisitos.map((requirement) => requirement.nombre),
  };
}

export function crearPayloadActualizacion(
  vacancy: VacanteEditable,
): UpdateVacancyInput {
  return {
    titulo: vacancy.titulo,
    modalidad: vacancy.modalidad,
    descripcion: vacancy.descripcion,
    ubicacion: vacancy.ubicacion,
    area: vacancy.area,
    condiciones: vacancy.condiciones,
    requisitos: [...vacancy.requisitos],
  };
}

export function requisitoDuplicado(
  requisitos: string[],
  nombre: string,
): boolean {
  return requisitos.some(
    (requisito) =>
      requisito.trim().toLowerCase() === nombre.trim().toLowerCase(),
  );
}

export function validarVacante(vacante: VacanteEditable): string | null {
  if (vacante.titulo.trim().length < 2) {
    return 'El nombre del cargo debe tener al menos 2 caracteres.';
  }

  if (vacante.modalidad.trim().length < 2) {
    return 'La modalidad debe tener al menos 2 caracteres.';
  }

  if (vacante.descripcion.trim().length < 20) {
    return 'La descripción debe tener al menos 20 caracteres.';
  }

  if (vacante.ubicacion.trim().length < 2) {
    return 'La ubicación debe tener al menos 2 caracteres.';
  }

  if (vacante.area.trim().length < 2) {
    return 'El área debe tener al menos 2 caracteres.';
  }

  if (vacante.requisitos.length === 0) {
    return 'La vacante debe tener al menos un requisito técnico.';
  }

  if (
    vacante.requisitos.some(
      (requisito) =>
        requisito.trim().length === 0 || requisito.trim().length > 100,
    )
  ) {
    return 'Cada requisito debe contener entre 1 y 100 caracteres.';
  }

  const nombres = vacante.requisitos.map((requisito) =>
    requisito.trim().toLowerCase(),
  );

  if (new Set(nombres).size !== nombres.length) {
    return 'No se permiten requisitos técnicos duplicados.';
  }

  return null;
}
