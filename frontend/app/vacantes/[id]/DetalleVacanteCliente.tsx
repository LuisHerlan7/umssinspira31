'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
ArrowLeft,
BriefcaseBusiness,
MapPin,
Building2,
Clock3,
CheckCircle2,
Send,
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
conditions:
'Trabajo remoto y colaboración con un equipo de desarrollo.',
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

export default function DetalleVacanteCliente({ id }: { id: string }) {
const [vacancy, setVacancy] = useState<Vacancy | null>(null);
const [loaded, setLoaded] = useState(false);

useEffect(() => {
let savedVacancies: Vacancy[] = [];


try {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const parsed: unknown = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      savedVacancies = parsed as Vacancy[];
    }
  }
} catch {
  savedVacancies = [];
}

const allVacancies = [...DEMO_VACANCIES, ...savedVacancies];

const found = allVacancies.find(
  (item) => String(item.id) === String(id),
);

setVacancy(found ?? null);
setLoaded(true);

}, [id]);

if (!loaded) {
return ( <main className="min-h-screen bg-[#f1eee4] px-5 py-10"> <p className="text-center text-gray-600">
Cargando detalle de la vacante... </p> </main>
);
}

if (!vacancy) {
return ( <main className="min-h-screen bg-[#f1eee4] px-5 py-10"> <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 text-center shadow-sm"> <h1 className="text-2xl font-bold text-gray-800">
Vacante no encontrada </h1> <p className="mt-2 text-gray-600">
Es posible que la vacante no exista o ya no esté disponible. </p> <Link
         href="/vacantes"
         className="mt-6 inline-flex items-center gap-2 rounded-md bg-orange-400 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500"
       > <ArrowLeft size={17} />
Volver a vacantes </Link> </div> </main>
);
}

return ( <main className="min-h-screen bg-[#f1eee4] px-5 py-8 sm:px-8"> <div className="mx-auto max-w-4xl"> <Link
       href="/vacantes"
       className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600"
     > <ArrowLeft size={17} />
Volver a vacantes </Link>


    <section className="rounded-lg bg-white p-6 shadow-sm sm:p-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-orange-50 p-4 text-orange-500">
          <BriefcaseBusiness size={32} />
        </div>
        <div className="flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Detalle de oportunidad laboral
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            {vacancy.title}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-gray-600">
            <Building2 size={17} />
            {vacancy.company}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">
              {vacancy.area}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
              {vacancy.modality}
            </span>
          </div>
        </div>
      </div>

      <div className="my-7 grid gap-4 border-y border-gray-100 py-5 sm:grid-cols-2">
        <div className="flex items-center gap-3">
          <MapPin className="text-orange-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="font-medium text-gray-800">
              {vacancy.location}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock3 className="text-orange-500" size={20} />
          <div>
            <p className="text-xs text-gray-500">
              Fecha de publicación
            </p>
            <p className="font-medium text-gray-800">
              {vacancy.createdAt
                ? new Date(vacancy.createdAt).toLocaleDateString('es-BO')
                : 'Vacante de ejemplo'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-7">
        <h2 className="mb-3 text-lg font-bold text-gray-800">
          Descripción del puesto
        </h2>
        <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
          {vacancy.description}
        </p>
      </div>

      <div className="mb-7">
        <h2 className="mb-3 text-lg font-bold text-gray-800">
          Requisitos del puesto
        </h2>
        <ul className="space-y-3">
          {vacancy.requirements.map((requirement, index) => (
            <li
              key={`${vacancy.id}-${index}`}
              className="flex items-start gap-3 text-sm text-gray-600"
            >
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-green-600"
              />
              {requirement}
            </li>
          ))}
        </ul>
      </div>

      {vacancy.conditions && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-gray-800">
            Condiciones laborales
          </h2>
          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
            {vacancy.conditions}
          </p>
        </div>
      )}

      <div className="rounded-lg bg-orange-50 p-5">
        <h2 className="font-semibold text-gray-800">
          ¿Te interesa esta oportunidad?
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Revisa los requisitos antes de continuar con tu postulación.
        </p>
        <Link
          href={`/vacantes/${vacancy.id}/postular`}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-orange-400 px-5 py-3 font-semibold text-white transition hover:bg-orange-500 sm:w-auto"
        >
          <Send size={17} />
          Postularme a esta vacante
        </Link>
      </div>
    </section>
  </div>
</main>


);
}
