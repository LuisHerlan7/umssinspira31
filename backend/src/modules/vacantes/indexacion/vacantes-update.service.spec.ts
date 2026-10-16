import { jest } from '@jest/globals';
import { Client } from '@elastic/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { UpdateVacanteDto } from '../dto/update-vacante.dto';
import { VacantesService } from '../vacantes.service';
import { ElasticsearchService } from './elasticsearch.service';
import { VacantesIndexService } from './vacantes-index.service';
import type { VacancyIndexDocument } from './vacancy-index.types';

const VACANCY_ID = '00000000-0000-4000-8000-000000000001';

function initialVacancy() {
  return {
    id: VACANCY_ID,
    idEmpresa: '11111111-1111-4111-8111-111111111111',
    empresa: 'Empresa de prueba',
    titulo: 'Vacante original',
    modalidad: 'Presencial',
    estado: 'Disponible',
    fechaCreacion: '2026-10-15T10:00:00.000Z',
    descripcion: 'Descripción original suficientemente extensa.',
    ubicacion: 'Cochabamba',
    area: 'Tecnología',
    condiciones: 'Jornada completa.',
    disponible: true,
    disponibilidadActualizadaAt: null,
    requisitos: [
      { id: '00000000-0000-4000-8000-000000000002', nombre: 'JavaScript' },
    ],
  };
}

function updateDto(): UpdateVacanteDto {
  return Object.assign(new UpdateVacanteDto(), {
    titulo: 'Vacante actualizada',
    modalidad: 'Híbrido',
    descripcion: 'Descripción vigente después de la actualización.',
    ubicacion: 'La Paz',
    area: 'Desarrollo de software',
    condiciones: 'Jornada completa con modalidad híbrida.',
    requisitos: ['TypeScript', 'NestJS'],
  });
}

class InMemoryVacantesService {
  private vacancy = initialVacancy();
  private requirementSequence = 10;

  readonly obtenerPorId = jest.fn(async (id: string) => {
    if (id !== this.vacancy.id) throw new Error('Vacante inexistente');
    return structuredClone(this.vacancy);
  });

  readonly actualizar = jest.fn(async (id: string, dto: UpdateVacanteDto) => {
    if (id !== this.vacancy.id) throw new Error('Vacante inexistente');

    this.vacancy = {
      ...this.vacancy,
      titulo: dto.titulo,
      modalidad: dto.modalidad,
      descripcion: dto.descripcion,
      ubicacion: dto.ubicacion,
      area: dto.area,
      condiciones: dto.condiciones,
      requisitos: dto.requisitos.map((nombre) => ({
        id: `00000000-0000-4000-8000-${String(this.requirementSequence++).padStart(12, '0')}`,
        nombre,
      })),
    };

    return structuredClone(this.vacancy);
  });
}

class InMemoryElasticsearchClient {
  readonly documents = new Map<string, VacancyIndexDocument>();
  readonly indexRequests: Array<{
    index: string;
    id: string;
    document: VacancyIndexDocument;
  }> = [];

  readonly indices = {
    exists: jest.fn(async () => true),
    create: jest.fn(async () => ({ acknowledged: true })),
  };

  readonly index = jest.fn(
    async (request: {
      index: string;
      id: string;
      document: VacancyIndexDocument;
    }) => {
      this.indexRequests.push(request);
      this.documents.set(`${request.index}/${request.id}`, request.document);
      return { result: 'updated' };
    },
  );

  readonly search = jest.fn(async (request: Record<string, unknown>) => {
    const query = request.query as {
      bool?: { should: Array<{ term?: { id: string } }> };
    };
    const searchedId = query.bool?.should.find((clause) => clause.term)?.term
      ?.id;
    const matches = [...this.documents.values()].filter(
      (document) => !searchedId || document.id === searchedId,
    );

    return {
      hits: { hits: matches.map((document) => ({ _source: document })) },
    };
  });
}

function createScenario() {
  const persisted = new InMemoryVacantesService();
  const elasticClient = new InMemoryElasticsearchClient();
  const elasticsearch = new ElasticsearchService(
    new ConfigService({ ELASTICSEARCH_INDEX_VACANTES: 'vacantes-test' }),
    elasticClient as unknown as Client,
  );
  const service = new VacantesIndexService(
    persisted as unknown as VacantesService,
    elasticsearch,
  );

  return { persisted, elasticClient, service };
}

async function indexAndUpdate() {
  const scenario = createScenario();
  await scenario.service.indexarVacante(VACANCY_ID);
  const updated = await scenario.service.actualizarVacante(
    VACANCY_ID,
    updateDto(),
  );
  return { ...scenario, updated };
}

describe('VacantesIndexService - HU5-S1-05', () => {
  it('AC1 devuelve el nuevo valor indexado después de actualizar', async () => {
    const { service } = await indexAndUpdate();

    const [indexed] = await service.buscar(VACANCY_ID);

    expect(indexed?.titulo).toBe('Vacante actualizada');
  });

  it('AC2 conserva el identificador de la vacante y del documento', async () => {
    const { elasticClient, updated } = await indexAndUpdate();

    expect(updated.id).toBe(VACANCY_ID);
    expect(elasticClient.indexRequests.map((request) => request.id)).toEqual([
      VACANCY_ID,
      VACANCY_ID,
    ]);
  });

  it('AC3 reemplaza el documento lógico sin crear duplicados', async () => {
    const { elasticClient } = await indexAndUpdate();

    expect(elasticClient.indexRequests).toHaveLength(2);
    expect(elasticClient.documents.size).toBe(1);
  });

  it('AC4 devuelve los requisitos técnicos actualizados', async () => {
    const { service } = await indexAndUpdate();

    const [indexed] = await service.buscar(VACANCY_ID);

    expect(indexed?.requisitos.map((requirement) => requirement.nombre)).toEqual(
      ['TypeScript', 'NestJS'],
    );
  });

  it('AC5 mantiene Elasticsearch igual a la versión persistida vigente', async () => {
    const { persisted, service } = await indexAndUpdate();

    const source = await persisted.obtenerPorId(VACANCY_ID);
    const [indexed] = await service.buscar(VACANCY_ID);

    expect(indexed).toEqual(source);
  });
});
