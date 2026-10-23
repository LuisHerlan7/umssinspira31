import type { Vacancy } from '../api/vacantes';
import type { Hu8ConsultationRead, Hu8DemoJourney } from './demo-mode';
import type { VacancyFilters, VacancySort } from './listing';

/** Per-route-session UI history. API and each explicit demo use separate entries. */
export type VacancyConsultationSession = {
  filters: VacancyFilters;
  order: VacancySort;
  hasSuccessfulRead: boolean;
  knownIds: Set<string>;
  newIds: Set<string>;
  nextRead: number;
  completedRead: number;
  journey: Hu8DemoJourney;
};

export function createVacancyConsultationSession(): VacancyConsultationSession {
  return {
    filters: { query: '', area: '', modalidad: '', ubicacion: '' },
    order: 'recent',
    hasSuccessfulRead: false,
    knownIds: new Set(),
    newIds: new Set(),
    nextRead: 0,
    completedRead: -1,
    journey: { phase: 'listado', appliedRead: 0 },
  };
}

/** Called only after a successful, non-cancelled read, including an empty result. */
export function observeVacancyRead(
  session: VacancyConsultationSession,
  vacancies: readonly Vacancy[],
  action: Hu8ConsultationRead['action'],
): string[] {
  const currentIds = new Set(vacancies.map((vacancy) => vacancy.id.toLowerCase()));
  const added = session.hasSuccessfulRead
    ? [...currentIds].filter((id) => !session.knownIds.has(id))
    : [];
  // Returning from a detail retains the last highlights. An explicit refresh
  // computes fresh additions. Empty/error responses never erase the baseline.
  session.newIds = new Set([
    ...(action === 'initial' ? session.newIds : []),
    ...added,
  ].filter((id) => currentIds.has(id)));
  for (const id of currentIds) session.knownIds.add(id);
  session.hasSuccessfulRead = true;
  return [...session.newIds];
}
