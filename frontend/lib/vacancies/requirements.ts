import type { VacancyRequirement } from '../api/vacantes';
import { TechnicalRequirementsClient } from './technical-requirements-client.ts';

export const NO_TECHNICAL_REQUIREMENTS =
  'Esta vacante no requiere conocimientos técnicos específicos';

/** Deduplicates this vacancy's requirements without changing source data or labels. */
export function uniqueVacancyRequirements(
  requirements: readonly VacancyRequirement[],
): VacancyRequirement[] {
  const seen = new Set<string>();
  return requirements.filter((requirement) => {
    const key = TechnicalRequirementsClient.canonicalName(requirement.nombre).replace(/\s+/g, ' ');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
