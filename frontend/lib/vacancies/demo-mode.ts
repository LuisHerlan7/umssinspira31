export const HU8_DEMO_SCENARIOS = [
  { value: 'recorrido', label: 'Recorrido integrado de HU8' },
  { value: 'listado', label: 'Listado de seis vacantes' },
  { value: 'carga', label: 'Carga con skeleton' },
  { value: 'sin-vacantes', label: 'Listado vacío' },
  { value: 'error', label: 'Error de consulta' },
  { value: 'inexistente', label: 'Vacante inexistente' },
  { value: 'actualizado', label: 'Listado actualizado de ocho vacantes' },
  { value: 'sin-requisitos', label: 'Sin requisitos técnicos' },
] as const;

export type Hu8DemoScenario = typeof HU8_DEMO_SCENARIOS[number]['value'];

/** In-memory state owned by a single HU8 consultation session, never by the API. */
export type Hu8DemoJourney = {
  phase: 'listado' | 'sin-vacantes' | 'error' | 'actualizado';
  appliedRead: number;
};

export type Hu8ConsultationRead = {
  action: 'initial' | 'refresh' | 'retry';
  sequence: number;
  journey: Hu8DemoJourney;
};

/** Preview exposes only the partial listing; local development keeps its existing scenarios. */
export function resolveHu8DemoScenario(value: string | null): Hu8DemoScenario | null {
  if (process.env.NODE_ENV === 'development') {
    return HU8_DEMO_SCENARIOS.find((scenario) => scenario.value === value)?.value ?? null;
  }
  // next.config.ts derives this constant from Vercel's environment and an explicit opt-in.
  return process.env.NEXT_PUBLIC_HU8_PREVIEW_DEMO_ENABLED === 'true' && value === 'listado'
    ? 'listado'
    : null;
}

export function hu8Href(path: string, scenario: Hu8DemoScenario | null): string {
  const allowed = resolveHu8DemoScenario(scenario);
  return allowed ? `${path}?${new URLSearchParams({ hu8Demo: allowed })}` : path;
}
