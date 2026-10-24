/**
 * HU5-S1-01 — Definir la estructura de datos de una vacante
 *
 * Tests de aceptación oficiales:
 *   PA-1: Verificar la estructura de una vacante.
 *         Al recibir una vacante con los datos del contrato de integración,
 *         el sistema debe representarla mediante el esquema establecido.
 *   PA-2: Verificar la identificación única de una vacante.
 *         Al registrar una vacante válida, el sistema debe conservar
 *         un identificador único.
 */

import {
  construirVacanteIndexada,
  type VacanteIndexada,
} from './contracts/vacante-indexada';

// ---------------------------------------------------------------------------
// Helpers de test
// ---------------------------------------------------------------------------

/** Valida UUID v4 mediante expresión regular, sin depender de librerías externas. */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function esUuidV4(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

const ID_VACANTE = '11111111-1111-4111-8111-111111111111';
const ID_EMPRESA = '22222222-2222-4222-8222-222222222222';

function payloadBase(overrides: Partial<Parameters<typeof construirVacanteIndexada>[0]> = {}) {
  return {
    id: ID_VACANTE,
    idEmpresa: ID_EMPRESA,
    empresa: 'TecnoAndes S.R.L.',
    titulo: 'Desarrollador Backend',
    descripcionBreve: 'API REST con NestJS y Supabase.',
    descripcion: 'Desarrollar y mantener la API REST del sistema de vacantes usando NestJS y Supabase como base de datos.',
    modalidad: 'Híbrido',
    estado: 'Publicada',
    area: 'Ingeniería de Software',
    ubicacion: 'Cochabamba',
    condiciones: 'Jornada completa. Salario a convenir.',
    fechaCreacion: '2026-10-24T00:00:00.000Z',
    requisitos: [
      { id: '33333333-3333-4333-8333-333333333333', nombre: 'TypeScript' },
    ],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PA-1: Verificar la estructura de una vacante
// ---------------------------------------------------------------------------

describe('HU5-S1-01 | PA-1: Estructura de una vacante', () => {
  let vacante: VacanteIndexada;

  beforeEach(() => {
    vacante = construirVacanteIndexada(payloadBase());
  });

  it('contiene todos los campos obligatorios del contrato', () => {
    const camposEsperados: Array<keyof VacanteIndexada> = [
      'id',
      'idEmpresa',
      'empresa',
      'titulo',
      'descripcionBreve',
      'descripcion',
      'modalidad',
      'estado',
      'area',
      'ubicacion',
      'condiciones',
      'fechaCreacion',
      'requisitos',
    ];

    for (const campo of camposEsperados) {
      expect(vacante).toHaveProperty(campo);
    }
  });

  it('representa fielmente los datos recibidos en el contrato', () => {
    expect(vacante).toMatchObject({
      id: ID_VACANTE,
      idEmpresa: ID_EMPRESA,
      empresa: 'TecnoAndes S.R.L.',
      titulo: 'Desarrollador Backend',
      descripcionBreve: 'API REST con NestJS y Supabase.',
      descripcion: 'Desarrollar y mantener la API REST del sistema de vacantes usando NestJS y Supabase como base de datos.',
      modalidad: 'Híbrido',
      estado: 'Publicada',
      area: 'Ingeniería de Software',
      ubicacion: 'Cochabamba',
      condiciones: 'Jornada completa. Salario a convenir.',
      fechaCreacion: '2026-10-24T00:00:00.000Z',
    });
  });

  it('preserva los requisitos con id y nombre', () => {
    expect(vacante.requisitos).toHaveLength(1);
    expect(vacante.requisitos[0]).toEqual({
      id: '33333333-3333-4333-8333-333333333333',
      nombre: 'TypeScript',
    });
  });

  it('acepta una vacante sin requisitos y devuelve arreglo vacío', () => {
    const sinRequisitos = construirVacanteIndexada(payloadBase({ requisitos: [] }));
    expect(sinRequisitos.requisitos).toEqual([]);
  });

  it('trunca descripcionBreve a 300 caracteres si supera el límite', () => {
    const larga = 'A'.repeat(400);
    const vacanteLarga = construirVacanteIndexada(payloadBase({ descripcionBreve: larga }));
    expect(vacanteLarga.descripcionBreve).toHaveLength(300);
  });

  it('acepta fechaCreacion nula', () => {
    const sinFecha = construirVacanteIndexada(payloadBase({ fechaCreacion: null }));
    expect(sinFecha.fechaCreacion).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// PA-2: Verificar la identificación única de una vacante
// ---------------------------------------------------------------------------

describe('HU5-S1-01 | PA-2: Identificación única', () => {
  it('conserva el identificador UUID v4 sin modificarlo', () => {
    const vacante = construirVacanteIndexada(payloadBase());
    expect(vacante.id).toBe(ID_VACANTE);
    expect(esUuidV4(vacante.id)).toBe(true);
  });

  it('dos vacantes construidas con IDs distintos conservan IDs distintos', () => {
    const id1 = '11111111-1111-4111-8111-111111111111';
    const id2 = '44444444-4444-4444-8444-444444444444';

    const primera = construirVacanteIndexada(payloadBase({ id: id1 }));
    const segunda = construirVacanteIndexada(payloadBase({ id: id2 }));

    expect(primera.id).toBe(id1);
    expect(segunda.id).toBe(id2);
    expect(primera.id).not.toBe(segunda.id);
  });

  it('el ID de una vacante no se altera por los datos de otra', () => {
    const base = payloadBase();
    const vacante1 = construirVacanteIndexada({ ...base, id: '11111111-1111-4111-8111-111111111111' });
    const vacante2 = construirVacanteIndexada({ ...base, id: '55555555-5555-4555-8555-555555555555', titulo: 'Otro título' });

    // vacante1 no fue modificada
    expect(vacante1.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(vacante1.titulo).toBe('Desarrollador Backend');
  });
});
