import type { Vacancy } from '../api/vacantes';

/**
 * Optional presentation content, separate from the existing API contract.
 * Currently supplied only by the explicit development fixtures. Real vacancies
 * retain their API fields; absent content must not be filled from demo records.
 */
export type VacancyDetailContent = {
  locationDetail?: string;
  about?: string[];
  experience?: string;
  experienceNote?: string;
  schedule?: string;
  closingDate?: string;
  responsibilities?: string[];
  desirable?: string;
  benefits?: string[];
  companyDescription?: string;
  companyFacts?: string;
};

export type Hu8VacancyDetail = Vacancy & { detailContent?: VacancyDetailContent };
