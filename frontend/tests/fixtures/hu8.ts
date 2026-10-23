// Test fixtures only. Production pages and services must never import this file.
import type { Vacancy } from '../../lib/api/vacantes';

export const vacancyA: Vacancy = {
  id: '11111111-1111-4111-8111-111111111111',
  idEmpresa: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  empresa: 'Empresa de prueba A',
  titulo: 'Vacante de prueba A',
  modalidad: 'Remoto',
  estado: 'Disponible',
  fechaCreacion: null,
  descripcion: 'Descripción de prueba A',
  ubicacion: 'Cochabamba',
  area: 'Tecnología',
  condiciones: 'Condiciones de prueba',
  requisitos: [
    { id: 'a1', nombre: 'Python' },
    { id: 'a2', nombre: 'python' },
    { id: 'a3', nombre: 'pythón' },
    { id: 'a4', nombre: 'SQL' },
  ],
};

export const vacancyB: Vacancy = {
  ...vacancyA,
  id: '22222222-2222-4222-8222-222222222222',
  empresa: 'Empresa de prueba B',
  titulo: 'Vacante de prueba B',
  requisitos: [{ id: 'b1', nombre: 'Java' }],
};

export const vacancyWithoutRequirements: Vacancy = {
  ...vacancyA,
  id: '33333333-3333-4333-8333-333333333333',
  titulo: 'Vacante de prueba sin requisitos',
  requisitos: [],
};

export const missingVacancyId = '44444444-4444-4444-8444-444444444444';
