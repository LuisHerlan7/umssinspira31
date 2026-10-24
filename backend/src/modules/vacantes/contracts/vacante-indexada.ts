export interface RequisitoVacanteIndexado {
  id: string;
  nombre: string;
}

export interface VacanteIndexada {
  id: string;
  idEmpresa: string;
  empresa: string;
  titulo: string;
  descripcionBreve: string;
  descripcion: string;
  modalidad: string;
  estado: string;
  area: string;
  ubicacion: string;
  condiciones: string;
  fechaCreacion: string | null;
  requisitos: RequisitoVacanteIndexado[];
}
export function construirVacanteIndexada(
  source: {
    id: string;
    idEmpresa: string;
    empresa: string;
    titulo: string;
    descripcionBreve?: string;
    descripcion: string;
    modalidad: string;
    estado: string;
    area: string;
    ubicacion: string;
    condiciones: string;
    fechaCreacion: string | null;
    requisitos: RequisitoVacanteIndexado[];
  },
): VacanteIndexada {
  return {
    id: source.id,
    idEmpresa: source.idEmpresa,
    empresa: source.empresa,
    titulo: source.titulo,
    descripcionBreve: (source.descripcionBreve ?? '').slice(0, 300),
    descripcion: source.descripcion,
    modalidad: source.modalidad,
    estado: source.estado,
    area: source.area,
    ubicacion: source.ubicacion,
    condiciones: source.condiciones,
    fechaCreacion: source.fechaCreacion,
    requisitos: source.requisitos,
  };
}
