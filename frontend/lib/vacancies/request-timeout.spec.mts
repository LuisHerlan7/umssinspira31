import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { withVacancyRequestTimeout } from './request-timeout.ts';

describe('Tiempo de espera de la consulta del listado HU8', () => {
  it('acepta una respuesta vacía y retira la cancelación al terminar', async () => {
    const parent = new AbortController();
    let childSignal: AbortSignal | undefined;
    const empty: unknown[] = [];
    assert.equal(await withVacancyRequestTimeout(async (signal) => {
      childSignal = signal;
      return empty;
    }, parent.signal), empty);
    parent.abort();
    assert.equal(childSignal?.aborted, false);
  });

  it('termina una consulta bloqueada, aborta su petición y permite otra consulta', async () => {
    let childSignal: AbortSignal | undefined;
    await assert.rejects(withVacancyRequestTimeout((signal) => {
      childSignal = signal;
      return new Promise<never>(() => {});
    }, undefined, 5), (error: unknown) => error instanceof DOMException && error.name === 'TimeoutError');
    assert.equal(childSignal?.aborted, true);
    assert.deepEqual(await withVacancyRequestTimeout(async () => ['respuesta recuperada']), ['respuesta recuperada']);
  });

  it('propaga la cancelación de navegación y cancela la petición activa', async () => {
    const parent = new AbortController();
    let childSignal: AbortSignal | undefined;
    let started!: () => void;
    const ready = new Promise<void>((resolve) => { started = resolve; });
    const pending = withVacancyRequestTimeout((signal) => {
      childSignal = signal;
      started();
      return new Promise<never>(() => {});
    }, parent.signal);
    await ready;
    parent.abort();
    await assert.rejects(pending, (error: unknown) => error instanceof DOMException && error.name === 'AbortError');
    assert.equal(childSignal?.aborted, true);
  });

  it('no inicia solicitudes que ya estaban canceladas', async () => {
    const parent = new AbortController();
    parent.abort();
    let called = false;
    await assert.rejects(withVacancyRequestTimeout(async () => {
      called = true;
    }, parent.signal), (error: unknown) => error instanceof DOMException && error.name === 'AbortError');
    assert.equal(called, false);
  });

  it('propaga los errores originales sin convertirlos en respuestas vacías', async () => {
    const failure = new Error('Fallo del servicio');
    await assert.rejects(withVacancyRequestTimeout(async () => { throw failure; }), (error: unknown) => error === failure);
  });
});
