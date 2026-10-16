export interface VacancyTechnicalRequirementsReference {
  requerimientoLaboralIds: string[];
}

export interface CanonicalVacancy {
  id: string;
  titulo: string;
  idEmpresa: string;
  estado: string;
  requisitosTecnicos: VacancyTechnicalRequirementsReference;
}

export type ValidateVacancyStructureRequest = CanonicalVacancy;

export interface ValidateVacancyStructureResponse {
  valida: true;
  vacante: CanonicalVacancy;
}
