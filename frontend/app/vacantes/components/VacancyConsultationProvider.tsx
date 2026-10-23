'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createVacancyConsultationSession, type VacancyConsultationSession } from '../../../lib/vacancies/consultation-session';
import type { Hu8DemoScenario } from '../../../lib/vacancies/demo-mode';

const ConsultationSessions = createContext<Map<string, VacancyConsultationSession> | null>(null);

/** Scoped to /vacantes; navigation to a detail keeps consultation history alive. */
export default function VacancyConsultationProvider({ children }: { children: ReactNode }) {
  const [sessions] = useState(() => new Map<string, VacancyConsultationSession>());
  return <ConsultationSessions.Provider value={sessions}>{children}</ConsultationSessions.Provider>;
}

export function useVacancyConsultationSession(scenario: Hu8DemoScenario | null) {
  const sessions = useContext(ConsultationSessions);
  if (!sessions) throw new Error('La consulta debe estar dentro de VacancyConsultationProvider.');
  const [session] = useState(() => {
    const key = scenario ?? 'api';
    let current = sessions.get(key);
    if (!current) {
      current = createVacancyConsultationSession();
      sessions.set(key, current);
    }
    return current;
  });
  return session;
}
