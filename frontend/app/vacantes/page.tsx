'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
BriefcaseBusiness,
MapPin,
Search,
Plus,
Clock3,
} from 'lucide-react';

const STORAGE_KEY = 'umsspira-vacantes';

type Vacancy = {
id: string | number;
title: string;
company: string;
area: string;
location: string;
modality: string;
description: string;
requirements: string[];
conditions?: string;
createdAt?: string;
};

const DEMO_VACANCIES: Vacancy[] = [
{
id: 1,
title: 'Analista de Datos Junior',
company: 'Empresa de Tecnología',
area: 'Datos y Analítica',
location: 'Cochabamba, Bolivia',
modality: 'Híbrido',
description:
'Apoya en el análisis de datos, elaboración de reportes y generación de información para la toma de decisiones.',
requirements: ['SQL básico', 'Excel', 'Pensamiento analítico'],
},
{
id: 2,
title: 'Desarrollador Frontend Junior',
company: 'Empresa de Software',
area: 'Desarrollo de Software',
location: 'Bolivia',
modality: 'Remoto',
description:
'Participa en el desarrollo de interfaces web y colabora con el equipo de diseño y desarrollo.',
requirements: ['JavaScript', 'React', 'Git'],
},
{
id: 3,
title: 'Asistente de Soporte TI',
company: 'Servicios Informáticos',
area: 'Infraestructura y Soporte',
location: 'Cochabamba, Bolivia',
modality: 'Presencial',
description:
'Brinda soporte técnico, registra incidencias y ayuda a mantener los equipos y sistemas operativos.',
requirements: ['Windows', 'Redes básicas', 'Atención al usuario'],
},
];

export default function VacantesPage() {
const [search, setSearch] = useState('');
const [area, setArea] = useState('Todas');
const [savedVacancies, setSavedVacancies] = useState<Vacancy[]>([]);
const [storageError, setStorageError] = useState(false);
const [loaded, setLoaded] = useState(false);

useEffect(() => {
try {
const saved = localStorage.getItem(STORAGE_KEY);


  if (saved) {
    const parsed: unknown = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      setSavedVacancies(parsed as Vacancy[]);
    }
  }
} catch {
  setStorageError(true);
} finally {
  setLoaded(true);
}


}, []);

const allVacancies = [...DEMO_VACANCIES, ...savedVacancies];

const areas = [
'Todas',
...Array.from(new Set(allVacancies.map((vacancy) => vacancy.area))),
];

const filteredVacancies = allVacancies.filter((vacancy) => {
const text =
`${vacancy.title} ${vacancy.company} ${vacancy.description}`.toLowerCase();


return (
  text.includes(search.toLowerCase()) &&
  (area === 'Todas' || vacancy.area === area)
);


});

return ( <main className="min-h-screen bg-[#f1eee4] px-5 py-8 sm:px-8"> <div className="mx-auto max-w-6xl"> <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
UMSSPIRA / Oportunidades laborales </p>


    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Vacantes disponibles
        </h1>
        <div className="my-6 flex flex-wrap gap-3">
          <Link
            href="/vacantes"
            className="inline-flex items-center rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
           Ver vacantes
          </Link>

  <Link
    href="/postulaciones"
    className="inline-flex items-center rounded-lg border-2 border-orange-500 bg-white px-5 py-3 font-semibold text-orange-700 hover:bg-orange-50"
  >
    Mis postulaciones
  </Link>
</div>
        <p className="mt-2 text-sm text-gray-600">
          Explora oportunidades laborales y encuentra la que mejor se
          adapte a tu perfil.
        </p>
      </div>

      <Link
        href="/vacantes/nueva"
        className="inline-flex items-center justify-center gap-2 rounded-md bg-orange-400 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500"
      >
        <Plus size={18} />
        Registrar vacante
      </Link>
    </div>

    <section className="mb-6 rounded-lg bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <label className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por cargo, empresa o descripción..."
            className="w-full bg-transparent text-sm text-gray-800 outline-none"
            aria-label="Buscar vacantes"
          />
        </label>

        <select
          value={area}
          onChange={(event) => setArea(event.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
          aria-label="Filtrar por área profesional"
        >
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </section>

    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-gray-600">
        {filteredVacancies.length}{' '}
        {filteredVacancies.length === 1
          ? 'vacante encontrada'
          : 'vacantes encontradas'}
      </p>

      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
        Datos de demostración y almacenamiento local
      </span>
    </div>

    {storageError && (
      <p
        role="alert"
        className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
      >
        No se pudieron leer las vacantes guardadas en este navegador.
      </p>
    )}

    {!loaded ? (
      <p className="py-8 text-center text-sm text-gray-500">
        Cargando vacantes...
      </p>
    ) : (
      <>
        <section className="grid gap-5 md:grid-cols-2">
          {filteredVacancies.map((vacancy) => (
            <article
              key={vacancy.id}
              className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-orange-50 p-3 text-orange-500">
                  <BriefcaseBusiness size={23} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    {vacancy.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {vacancy.company}
                  </p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-800">
                  {vacancy.area}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  {vacancy.modality}
                </span>
              </div>

              <p className="mb-4 text-sm leading-6 text-gray-600">
                {vacancy.description}
              </p>

              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <MapPin size={15} />
                <span>{vacancy.location}</span>
                <Clock3 size={15} className="ml-2" />
                <span>
                  {vacancy.createdAt
                    ? `Registrada el ${new Date(vacancy.createdAt).toLocaleDateString('es-BO')}`
                    : 'Vacante de ejemplo'}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Requisitos destacados
                </p>

                <div className="flex flex-wrap gap-2">
                  {vacancy.requirements.map((requirement, index) => (
                    <span
                      key={`${vacancy.id}-${index}-${requirement}`}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600"
                    >
                      {requirement}
                    </span>
                  ))}
                </div>
              </div>

              {vacancy.conditions && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Condiciones
                  </p>
                  <p className="text-sm text-gray-600">
                    {vacancy.conditions}
                  </p>
                </div>
              )}
               <div className="mt-5 border-t border-gray-100 pt-4">
                 <Link
                    href={`/vacantes/${vacancy.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
                  >
                   Ver detalle de la vacante
                   </Link>
                </div>
            </article>
          ))}
        </section>

        {filteredVacancies.length === 0 && (
          <div className="rounded-lg bg-white px-5 py-12 text-center shadow-sm">
            <Search size={30} className="mx-auto mb-3 text-gray-400" />
            <h2 className="font-semibold text-gray-800">
              No encontramos vacantes
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Prueba con otra búsqueda o selecciona un área diferente.
            </p>
          </div>
        )}
      </>
    )}
  </div>
</main>


);
}
