import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createVacancyConsultationSession, observeVacancyRead } from './consultation-session.ts';
import { vacancyA, vacancyB } from '../../tests/fixtures/hu8.ts';

describe('Continuidad de la consulta HU8', () => {
  it('conserva el historial tras una respuesta vacía y distingue solo dos incorporaciones', () => {
    const session = createVacancyConsultationSession();
    const original = Array.from({ length: 6 }, (_, index) => ({ ...vacancyA, id: `vacante-${index + 1}` }));
    const additions = [7, 8].map((index) => ({ ...vacancyB, id: `vacante-${index}` }));
    assert.deepEqual(observeVacancyRead(session, original, 'initial'), []);
    assert.deepEqual(observeVacancyRead(session, [], 'refresh'), []);
    assert.equal(session.knownIds.size, 6);
    assert.deepEqual(observeVacancyRead(session, [...original, ...additions], 'retry'), ['vacante-7', 'vacante-8']);
    assert.equal(session.knownIds.size, 8);
  });

  it('retiene las etiquetas al volver del detalle y no marca cambios de contenido como altas', () => {
    const session = createVacancyConsultationSession();
    observeVacancyRead(session, [vacancyA], 'initial');
    assert.deepEqual(observeVacancyRead(session, [vacancyA, vacancyB], 'refresh'), [vacancyB.id.toLowerCase()]);
    assert.deepEqual(observeVacancyRead(session, [vacancyA, vacancyB], 'initial'), [vacancyB.id.toLowerCase()]);
    assert.deepEqual(observeVacancyRead(session, [{ ...vacancyA, titulo: 'Título actualizado' }, vacancyB], 'refresh'), []);
  });

  it('separa las sesiones y trata el mismo UUID con distinta capitalización como la misma vacante', () => {
    const realSession = createVacancyConsultationSession();
    const demoSession = createVacancyConsultationSession();
    const letterVacancy = { ...vacancyA, id: 'abcdef12-abcd-4abc-8def-abcdefabcdef' };
    observeVacancyRead(realSession, [letterVacancy], 'initial');
    observeVacancyRead(demoSession, [vacancyB], 'initial');
    assert.deepEqual([...realSession.knownIds], [letterVacancy.id]);
    assert.deepEqual([...demoSession.knownIds], [vacancyB.id.toLowerCase()]);
    assert.deepEqual(observeVacancyRead(realSession, [{ ...letterVacancy, id: letterVacancy.id.toUpperCase() }], 'refresh'), []);
    assert.deepEqual([...demoSession.knownIds], [vacancyB.id.toLowerCase()]);
  });
});
