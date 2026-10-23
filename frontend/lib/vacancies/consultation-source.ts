import { getVacancy, searchIndexedVacancies } from '../api/vacantes';
import { resolveHu8DemoScenario, type Hu8ConsultationRead, type Hu8DemoJourney, type Hu8DemoScenario } from './demo-mode';
import type { Hu8VacancyDetail } from './detail-content';
import { withVacancyRequestTimeout } from './request-timeout';

/** HU8-only source selection. API errors never trigger simulated data. */
export async function loadHu8Vacancies(scenario: Hu8DemoScenario | null, signal?: AbortSignal, read?: Hu8ConsultationRead) {
  const allowed = resolveHu8DemoScenario(scenario);
  if (allowed) {
    const demo = await import('./development/demo-source');
    return demo.listDemoVacancies(allowed, signal, read);
  }
  return withVacancyRequestTimeout((requestSignal) => searchIndexedVacancies('', requestSignal), signal);
}

export async function loadHu8Vacancy(id: string, scenario: Hu8DemoScenario | null, signal?: AbortSignal, journey?: Hu8DemoJourney): Promise<Hu8VacancyDetail> {
  const allowed = resolveHu8DemoScenario(scenario);
  if (allowed) {
    const demo = await import('./development/demo-source');
    return demo.getDemoVacancy(id, allowed, signal, journey);
  }
  return getVacancy(id, signal);
}
