import type { ReactNode } from 'react';
import VacancyConsultationProvider from './components/VacancyConsultationProvider';

export default function VacanciesLayout({ children }: { children: ReactNode }) {
  return <VacancyConsultationProvider>{children}</VacancyConsultationProvider>;
}
