import type { Vacancy } from '../api/vacantes';
import { TechnicalRequirementsClient } from './technical-requirements-client';

export type VacancyFilterField = 'area' | 'modalidad' | 'ubicacion';

export type VacancyFilters = Record<VacancyFilterField, string> & {
  query: string;
};

export const EMPTY_VACANCY_FILTERS: VacancyFilters = {
  query: '',
  area: '',
  modalidad: '',
  ubicacion: '',
};

export type VacancySort = 'recent' | 'oldest';

export function sortVacancies(vacancies: readonly Vacancy[], order: VacancySort): Vacancy[] {
  const timestamp = (value: string | null) => {
    const parsed = value ? Date.parse(value) : NaN;
    return Number.isNaN(parsed) ? null : parsed;
  };
  return [...vacancies].sort((left, right) => {
    const a = timestamp(left.fechaCreacion);
    const b = timestamp(right.fechaCreacion);
    if (a === null) return b === null ? 0 : 1;
    if (b === null) return -1;
    return order === 'recent' ? b - a : a - b;
  });
}

/** The browser's successful receipt time, never a fabricated backend update time. */
export function formatVacancyConsultation(value: string): string {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('es-BO', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'America/La_Paz',
  }).format(date);
  const time = new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/La_Paz',
  }).format(date);
  return `${day} · ${time} (BOT)`;
}

const normalize = TechnicalRequirementsClient.canonicalName;

/** Filters only API results; no local records or simulated vacancies are added. */
export function filterVacancies(
  vacancies: readonly Vacancy[],
  filters: VacancyFilters,
): Vacancy[] {
  const query = normalize(filters.query);
  return vacancies.filter((vacancy) =>
    (!query || normalize(vacancy.titulo).includes(query) || normalize(vacancy.empresa).includes(query)) &&
    (!filters.area || normalize(vacancy.area) === normalize(filters.area)) &&
    (!filters.modalidad || normalize(vacancy.modalidad) === normalize(filters.modalidad)) &&
    (!filters.ubicacion || normalize(vacancy.ubicacion) === normalize(filters.ubicacion)),
  );
}

/** Choices come from real results and retain an existing selection on refresh. */
export function vacancyFilterOptions(
  vacancies: readonly Vacancy[],
  field: VacancyFilterField,
  selected: string,
): string[] {
  const options = new Map<string, string>();
  for (const vacancy of vacancies) {
    const label = vacancy[field].trim();
    const key = normalize(label);
    if (key && !options.has(key)) options.set(key, label);
  }
  if (selected) options.set(normalize(selected), selected);
  return [...options.values()].sort((left, right) => left.localeCompare(right, 'es'));
}

/** fechaCreacion is the only date supplied by the existing vacancy contract. */
export function vacancyPublicationDate(value: string | null): {
  label: string;
  dateTime?: string;
} {
  if (!value) return { label: 'No disponible' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { label: 'No disponible' };
  return {
    label: new Intl.DateTimeFormat('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/La_Paz',
    }).format(date),
    dateTime: date.toISOString(),
  };
}
