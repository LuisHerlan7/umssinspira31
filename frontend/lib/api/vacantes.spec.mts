import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { updateVacancyAvailability } from './vacantes.ts';

const ID = '00000000-0000-4000-8000-000000000006';
const originalFetch = globalThis.fetch;

afterEach(() => { globalThis.fetch = originalFetch; });

describe('HU6 API de disponibilidad', () => {
  it('usa PATCH, conserva el ID y no accede a localStorage', async () => {
    let storageAccessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() { storageAccessed = true; throw new Error('HU6 no debe acceder a localStorage.'); },
    });
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), `http://localhost:3001/vacantes/${ID}/disponibilidad`);
      assert.equal(init?.method, 'PATCH');
      assert.deepEqual(JSON.parse(String(init?.body)), { disponible: false });
      return Response.json({ id: ID, disponible: false });
    };

    try {
      const updated = await updateVacancyAvailability(ID, false);
      assert.equal(updated.id, ID);
      assert.equal(updated.disponible, false);
      assert.equal(storageAccessed, false);
    } finally {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }
  });
});
