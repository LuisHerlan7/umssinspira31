import type { estypes } from '@elastic/elasticsearch';

export type VacancyIndexRequirement = {
  id: string;
  nombre: string;
};

export type VacancyIndexDocument = {
  id: string;
  idEmpresa: string;
  empresa: string;
  titulo: string;
  modalidad: string;
  estado: string;
  fechaCreacion: string | null;
  descripcion: string;
  ubicacion: string;
  area: string;
  condiciones: string;
  disponible: boolean;
  disponibilidadActualizadaAt: string | null;
  requisitos: VacancyIndexRequirement[];
};

export const VACANCY_INDEX_MAPPINGS = {
  properties: {
    id: { type: 'keyword' },
    idEmpresa: { type: 'keyword' },
    empresa: { type: 'text' },
    titulo: { type: 'text' },
    modalidad: { type: 'keyword' },
    estado: { type: 'keyword' },
    fechaCreacion: { type: 'date' },
    descripcion: { type: 'text' },
    ubicacion: { type: 'text' },
    area: { type: 'text' },
    condiciones: { type: 'text' },
    disponible: { type: 'boolean' },
    disponibilidadActualizadaAt: { type: 'date' },
    requisitos: {
      type: 'nested',
      properties: {
        id: { type: 'keyword' },
        nombre: { type: 'text' },
      },
    },
  },
} satisfies estypes.MappingTypeMapping;
