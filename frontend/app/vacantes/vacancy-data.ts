export const VACANCIES_STORAGE_KEY = 'umsspira-vacantes';

export type Vacancy = {
  id: string | number;
  title: string;
  company: string;
  area: string;
  location: string;
  modality: string;
  description: string;
  requirements: string[];
  status?: string;
  code?: string;
  requirementDetails?: Array<{
    name: string;
    level: string;
    type: string;
  }>;
  conditions?: string;
  createdAt?: string;
};

export const DEMO_VACANCIES: Vacancy[] = [
  {
    id: '1',
    title: 'Analista de Datos Junior',
    company: 'Empresa de Tecnología',
    area: 'Datos y Analítica',
    location: 'Cochabamba',
    modality: 'Híbrido',
    description:
      'Buscamos una persona interesada en analizar información, elaborar reportes y apoyar la toma de decisiones mediante el uso de datos.',
    requirements: ['SQL básico', 'Excel', 'Pensamiento analítico'],
    conditions:
      'Jornada completa. Oportunidad de aprendizaje y crecimiento profesional.',
  },
  {
    id: '2',
    title: 'Desarrollador Frontend Junior',
    company: 'Empresa de Software',
    area: 'Desarrollo de Software',
    location: 'Bolivia',
    modality: 'Remoto',
    description:
      'Participarás en el desarrollo de interfaces web, trabajando junto al equipo de diseño y desarrollo para construir experiencias de usuario.',
    requirements: ['JavaScript', 'React', 'Git'],
    conditions: 'Trabajo remoto y colaboración con un equipo de desarrollo.',
  },
  {
    id: '3',
    title: 'Asistente de Soporte TI',
    company: 'Servicios Informáticos',
    area: 'Infraestructura y Soporte',
    location: 'Cochabamba',
    modality: 'Presencial',
    description:
      'Apoyarás en la atención de incidentes técnicos, mantenimiento de equipos y asistencia a usuarios.',
    requirements: ['Windows', 'Redes básicas', 'Atención al usuario'],
    conditions: 'Trabajo presencial. Capacitación inicial incluida.',
  },
];

function isVacancy(value: unknown): value is Vacancy {
  if (typeof value !== 'object' || value === null) return false;

  const vacancy = value as Record<string, unknown>;
  return (
    (typeof vacancy.id === 'string' || typeof vacancy.id === 'number') &&
    typeof vacancy.title === 'string' &&
    typeof vacancy.company === 'string' &&
    typeof vacancy.area === 'string' &&
    typeof vacancy.location === 'string' &&
    typeof vacancy.modality === 'string' &&
    typeof vacancy.description === 'string' &&
    Array.isArray(vacancy.requirements) &&
    vacancy.requirements.every((item) => typeof item === 'string') &&
    (vacancy.status === undefined || typeof vacancy.status === 'string') &&
    (vacancy.code === undefined || typeof vacancy.code === 'string') &&
    (vacancy.requirementDetails === undefined ||
      (Array.isArray(vacancy.requirementDetails) &&
        vacancy.requirementDetails.every((item: unknown) => {
          if (typeof item !== 'object' || item === null) return false;
          const detail = item as Record<string, unknown>;
          return typeof detail.name === 'string' &&
            typeof detail.level === 'string' && typeof detail.type === 'string';
        }))) &&
    (vacancy.conditions === undefined ||
      typeof vacancy.conditions === 'string') &&
    (vacancy.createdAt === undefined ||
      typeof vacancy.createdAt === 'string')
  );
}

export function parseSavedVacancies(saved: string | null): Vacancy[] {
  if (!saved) return [];

  const parsed: unknown = JSON.parse(saved);
  if (!Array.isArray(parsed) || !parsed.every(isVacancy)) {
    throw new Error('Las vacantes guardadas tienen un formato no válido.');
  }

  return parsed;
}

export function readSavedVacancies(): Vacancy[] {
  return parseSavedVacancies(localStorage.getItem(VACANCIES_STORAGE_KEY));
}

export function readAllVacancies(): Vacancy[] {
  return mergeVacancies(readSavedVacancies());
}

// Saved versions override demos without changing their position in the list.
export function mergeVacancies(savedVacancies: Vacancy[]): Vacancy[] {
  const vacancies = new Map<string, Vacancy>();
  for (const vacancy of [...DEMO_VACANCIES, ...savedVacancies]) {
    vacancies.set(String(vacancy.id), vacancy);
  }
  return Array.from(vacancies.values());
}

export function findVacancyIn(
  id: string,
  savedVacancies: Vacancy[],
): Vacancy | undefined {
  return mergeVacancies(savedVacancies).find(
    (vacancy) => String(vacancy.id) === id,
  );
}

export function findVacancy(id: string): Vacancy | undefined {
  return findVacancyIn(id, readSavedVacancies());
}

export function isDemoVacancy(id: string): boolean {
  return DEMO_VACANCIES.some((vacancy) => String(vacancy.id) === id);
}
