import { jest } from '@jest/globals';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { VacantesService } from '../vacantes.service';
import { ElasticsearchService } from './elasticsearch.service';
import { VacantesIndexService } from './vacantes-index.service';
import type { VacancyIndexDocument } from './vacancy-index.types';

const VACANCY_ID = '00000000-0000-4000-8000-000000000006';

function vacancy(disponible: boolean) {
  return {
    id: VACANCY_ID,
    idEmpresa: '11111111-1111-4111-8111-111111111111',
    empresa: 'Empresa real',
    titulo: 'Ingeniero de Datos',
    modalidad: 'Híbrido',
    estado: 'Publicada',
    fechaCreacion: '2026-10-15T10:00:00.000Z',
    descripcion: 'Descripción persistida.',
    ubicacion: 'Cochabamba',
    area: 'Datos',
    condiciones: 'Jornada completa.',
    disponible,
    disponibilidadActualizadaAt: '2026-10-15T17:30:00.000Z',
    requisitos: [{ id: 'req-1', nombre: 'SQL' }],
  };
}

describe('VacantesIndexService - HU6 disponibilidad', () => {
  it('persiste, lee la versión vigente e indexa el mismo ID sin duplicar', async () => {
    let persisted = vacancy(true);
    const calls: string[] = [];
    const vacantesService = {
      actualizarDisponibilidad: jest.fn(async (id: string, value: boolean) => {
        calls.push(`persist:${id}:${value}`);
        persisted = vacancy(value);
        calls.push(`read:${id}`);
        return structuredClone(persisted);
      }),
    } as unknown as VacantesService;
    const documents = new Map<string, VacancyIndexDocument>();
    const indexRequests: Array<{ id: string; document: VacancyIndexDocument }> = [];
    const elasticClient = {
      indices: { exists: jest.fn(async () => true), create: jest.fn() },
      index: jest.fn(async (request: { id: string; document: VacancyIndexDocument }) => {
        calls.push(`index:${request.id}`);
        indexRequests.push(request);
        documents.set(request.id, request.document);
        return { result: 'updated' };
      }),
      search: jest.fn(async () => ({
        hits: {
          hits: [...documents.values()]
            .filter((document) => document.disponible)
            .map((document) => ({ _source: document })),
        },
      })),
    };
    const elasticsearch = new ElasticsearchService(
      new ConfigService({ ELASTICSEARCH_INDEX_VACANTES: 'vacantes-test' }),
      elasticClient as unknown as Client,
    );
    const service = new VacantesIndexService(vacantesService, elasticsearch);

    const disabled = await service.actualizarDisponibilidad(VACANCY_ID, false);
    await expect(service.buscar('')).resolves.toEqual([]);
    const reactivated = await service.actualizarDisponibilidad(VACANCY_ID, true);
    await expect(service.buscar('')).resolves.toEqual([persisted]);

    expect(calls).toEqual([
      `persist:${VACANCY_ID}:false`, `read:${VACANCY_ID}`, `index:${VACANCY_ID}`,
      `persist:${VACANCY_ID}:true`, `read:${VACANCY_ID}`, `index:${VACANCY_ID}`,
    ]);
    expect(disabled).toMatchObject({ id: VACANCY_ID, disponible: false });
    expect(reactivated).toMatchObject({ id: VACANCY_ID, disponible: true });
    expect(indexRequests.map((request) => request.id)).toEqual([VACANCY_ID, VACANCY_ID]);
    expect(documents.size).toBe(1);
    expect(documents.get(VACANCY_ID)).toEqual(persisted);
  });
});
