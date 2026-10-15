import { SKILLS_STORAGE_KEY } from './comparison-data';
import {
  VACANCIES_STORAGE_KEY,
  findVacancyIn,
  parseSavedVacancies,
  type Vacancy,
} from './vacancy-data';

export const SERVER_STORAGE_SNAPSHOT = '__umsspira_server_snapshot__';
export const STORAGE_READ_ERROR_SNAPSHOT = '__umsspira_storage_read_error__';
const VACANCY_UPDATED_EVENT = 'umsspira-vacancy-updated';

export function subscribeToLocalStorage(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(VACANCY_UPDATED_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(VACANCY_UPDATED_EVENT, onChange);
  };
}

export type VacancyUpdate = Pick<
  Vacancy,
  'title' | 'description' | 'status' | 'requirements' | 'requirementDetails'
>;

// Read the latest record before applying only the fields owned by HU5.
// Parsing and serialization finish before writing, so invalid data is not erased.
export function updateVacancy(id: string, changes: VacancyUpdate): Vacancy {
  const saved = parseSavedVacancies(localStorage.getItem(VACANCIES_STORAGE_KEY));
  const current = findVacancyIn(id, saved);
  if (!current) throw new Error('La vacante ya no existe.');

  const updated: Vacancy = {
    ...current,
    title: changes.title,
    description: changes.description,
    status: changes.status,
    requirements: [...changes.requirements],
    requirementDetails: changes.requirementDetails?.map((detail) => ({ ...detail })),
  };
  const next = saved.filter((vacancy) => String(vacancy.id) !== id);
  next.push(updated);
  const serialized = JSON.stringify(next);
  parseSavedVacancies(serialized);
  localStorage.setItem(VACANCIES_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(VACANCY_UPDATED_EVENT));
  return updated;
}

export function readVacancySnapshot(): string | null {
  try {
    return localStorage.getItem(VACANCIES_STORAGE_KEY);
  } catch {
    return STORAGE_READ_ERROR_SNAPSHOT;
  }
}

export function readComparisonSnapshot(): string {
  try {
    return JSON.stringify([
      localStorage.getItem(VACANCIES_STORAGE_KEY),
      localStorage.getItem(SKILLS_STORAGE_KEY),
    ]);
  } catch {
    return STORAGE_READ_ERROR_SNAPSHOT;
  }
}
