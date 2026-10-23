import { VacancyApiError } from '../../api/vacantes';
import type { Hu8ConsultationRead, Hu8DemoJourney, Hu8DemoScenario } from '../demo-mode';
import { resolveHu8DemoScenario } from '../demo-mode';
import { getHu8DevelopmentFixtures } from './fixtures';

function assertDemoAllowed(scenario: Hu8DemoScenario) {
  if (resolveHu8DemoScenario(scenario) !== scenario) {
    throw new Error('La demostración de HU8 no está habilitada para este entorno y escenario.');
  }
}

/** A stable loading view remains pending until navigation cancels it. */
function demoDelay(scenario: Hu8DemoScenario, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException('Consulta cancelada', 'AbortError')); return; }
    const timer = scenario === 'carga' ? undefined : setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, scenario === 'recorrido' ? 1200 : 250);
    function abort() {
      if (timer !== undefined) clearTimeout(timer);
      reject(new DOMException('Consulta cancelada', 'AbortError'));
    }
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function scenarioVacancies(scenario: Hu8DemoScenario) {
  const vacancies = getHu8DevelopmentFixtures(scenario === 'actualizado');
  if (scenario === 'sin-vacantes') return [];
  if (scenario === 'sin-requisitos') return vacancies.map((vacancy) => ({ ...vacancy, requisitos: [] }));
  if (scenario === 'actualizado') {
    // An explicit second visual dataset, never a mutation of a real vacancy.
    vacancies[0] = {
      ...vacancies[0],
      modalidad: 'Híbrido',
      descripcion: 'Crea interfaces web accesibles con React y TypeScript y colabora con el equipo de producto en modalidad híbrida.',
      requisitos: [...vacancies[0].requisitos, { id: 'hu8-demo-updated', nombre: 'Pruebas de interfaces' }],
      detailContent: {
        ...vacancies[0].detailContent,
        benefits: [
          'Trabajo híbrido en Cochabamba y jornada de tiempo completo.',
          ...(vacancies[0].detailContent?.benefits?.slice(1) ?? []),
        ],
      },
    };
  }
  return vacancies;
}

export async function listDemoVacancies(scenario: Hu8DemoScenario, signal?: AbortSignal, read?: Hu8ConsultationRead) {
  assertDemoAllowed(scenario);
  await demoDelay(scenario, signal);
  signal?.throwIfAborted();
  if (scenario === 'recorrido') {
    if (!read) throw new Error('El recorrido necesita una sesión de consulta.');
    // Only completed user actions advance the story. Replayed effects, route
    // navigation and Strict Mode must not consume another demonstration step.
    const journey = read.journey;
    if (read.action !== 'initial' && read.sequence > journey.appliedRead) {
      if (journey.phase === 'listado') journey.phase = 'sin-vacantes';
      else if (journey.phase === 'sin-vacantes') journey.phase = 'error';
      else if (journey.phase === 'error') journey.phase = 'actualizado';
      journey.appliedRead = read.sequence;
    }
    if (journey.phase === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
    return scenarioVacancies(journey.phase);
  }
  if (scenario === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
  return scenarioVacancies(scenario);
}

export async function getDemoVacancy(id: string, scenario: Hu8DemoScenario, signal?: AbortSignal, journey?: Hu8DemoJourney) {
  assertDemoAllowed(scenario);
  await demoDelay(scenario, signal);
  signal?.throwIfAborted();
  if (scenario === 'error') throw new VacancyApiError('Error simulado de consulta de HU8.', 503);
  const effectiveScenario = scenario === 'recorrido' ? journey?.phase === 'actualizado' ? 'actualizado' : 'listado' : scenario;
  const vacancy = scenario === 'inexistente' ? undefined : scenarioVacancies(effectiveScenario).find((item) => item.id === id);
  if (!vacancy) throw new VacancyApiError('La vacante no existe.', 404);
  return vacancy;
}
