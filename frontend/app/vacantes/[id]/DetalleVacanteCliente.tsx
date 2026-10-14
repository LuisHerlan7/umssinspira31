'use client';

import Link from 'next/link';
import { useMemo, useSyncExternalStore } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  MapPin,
  Send,
} from 'lucide-react';
import {
  findVacancyIn,
  parseSavedVacancies,
} from '../vacancy-data';
import {
  SERVER_STORAGE_SNAPSHOT,
  STORAGE_READ_ERROR_SNAPSHOT,
  readVacancySnapshot,
  subscribeToLocalStorage,
} from '../storage';

type Props = { id: string };

export default function DetalleVacanteCliente({ id }: Props) {
  const snapshot = useSyncExternalStore(
    subscribeToLocalStorage,
    readVacancySnapshot,
    () => SERVER_STORAGE_SNAPSHOT,
  );
  const { loaded, vacancy, loadError } = useMemo(() => {
    if (snapshot === SERVER_STORAGE_SNAPSHOT) {
      return { loaded: false, vacancy: null, loadError: '' };
    }

    if (snapshot === STORAGE_READ_ERROR_SNAPSHOT) {
      return {
        loaded: true,
        vacancy: null,
        loadError: 'No se pudo acceder al almacenamiento local del navegador.',
      };
    }

    try {
      return {
        loaded: true,
        vacancy: findVacancyIn(id, parseSavedVacancies(snapshot)),
        loadError: '',
      };
    } catch {
      return {
        loaded: true,
        vacancy: null,
        loadError:
          'No se pudieron leer las vacantes guardadas en este navegador.',
      };
    }
  }, [id, snapshot]);

  if (!loaded) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#FAF9F6] px-5 py-10">
        <p className="mx-auto max-w-6xl text-sm text-[#44474D]">
          Cargando detalle de la vacante...
        </p>
      </main>
    );
  }

  if (loadError || !vacancy) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#FAF9F6] px-5 py-10">
        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#000B21]">
            {loadError ? 'No se pudo cargar la vacante' : 'Vacante no encontrada'}
          </h1>
          <p role={loadError ? 'alert' : undefined} className="mt-2 text-[#44474D]">
            {loadError ||
              'Es posible que la vacante no exista o ya no esté disponible.'}
          </p>
          <Link
            href="/vacantes"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#FFA94D] px-4 py-3 text-sm font-semibold text-[#000B21] hover:bg-[#f39a3d]"
          >
            <ArrowLeft size={17} />
            Volver a vacantes
          </Link>
        </div>
      </main>
    );
  }

  const comparisonHref = `/vacantes/${encodeURIComponent(String(vacancy.id))}/comparar`;
  const parsedPublicationDate = vacancy.createdAt
    ? new Date(vacancy.createdAt)
    : null;
  const publicationDate =
    parsedPublicationDate && !Number.isNaN(parsedPublicationDate.getTime())
      ? parsedPublicationDate.toLocaleDateString('es-BO')
      : 'No especificada';

  return (
    <main className="min-h-[calc(100vh-76px)] bg-[#FAF9F6] text-[#000B21]">
      <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-7">
        <nav
          aria-label="Ruta de navegación"
          className="mb-6 flex items-center gap-2 text-sm text-[#44474D]"
        >
          <Link href="/vacantes" className="hover:underline">
            Vacantes
          </Link>
          <span aria-hidden="true" className="text-[#9A9CA1]">/</span>
          <span aria-current="page" className="font-semibold">
            Detalle de vacante
          </span>
        </nav>

        <section className="mb-6 flex items-center justify-between gap-8 rounded-lg bg-white px-9 py-8 shadow-sm">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#065F46]">
                <span className="h-2 w-2 rounded-full bg-[#059669]" />
                Oportunidad laboral
              </span>
              <span className="rounded-full bg-[#EFEEEB] px-3 py-1 text-xs font-medium text-[#44474D]">
                {vacancy.area}
              </span>
            </div>
            <h1 className="text-[30px] font-bold leading-9 tracking-tight">
              {vacancy.title}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-[15px] text-[#44474D]">
              <Building2 size={17} />
              {vacancy.company}
            </p>
            <div className="mt-4 flex items-center gap-5 text-sm text-[#44474D]">
              <span className="flex items-center gap-2">
                <MapPin size={16} />
                {vacancy.location}
              </span>
              <span className="flex items-center gap-2">
                <BriefcaseBusiness size={16} />
                {vacancy.modality}
              </span>
            </div>
          </div>

          <div className="flex w-[250px] shrink-0 items-center gap-4 rounded bg-[#F4F3F0] px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#44474D]">
                Requisitos registrados
              </p>
              <p className="mt-1 text-base font-semibold">
                {vacancy.requirements.length} habilidades
              </p>
            </div>
            <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFEEEB]">
              <Check size={16} />
            </div>
          </div>
        </section>

        <section className="mb-6 flex items-center justify-between gap-8 rounded-lg bg-[#000B21] p-6 text-white shadow-sm">
          <div className="flex max-w-[620px] items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white/10">
              <BriefcaseBusiness size={23} />
            </div>
            <div>
              <h2 className="text-base font-semibold">
                Compara tu perfil con los requisitos de esta vacante
              </h2>
              <p className="mt-2 text-[15px] leading-6 text-[#E3E2DF]">
                Revisa cuáles de las habilidades solicitadas coinciden con las
                que tienes registradas en este navegador.
              </p>
            </div>
          </div>
          <Link
            href={comparisonHref}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded bg-[#FFA94D] px-6 text-sm font-bold text-[#000B21] shadow-sm transition hover:bg-[#f39a3d]"
          >
            <ArrowRight size={17} />
            Comparar mis habilidades
          </Link>
        </section>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] items-start gap-6">
          <article className="rounded-lg bg-white p-9 shadow-sm">
            <div className="mb-7 flex items-center justify-between border-b border-[#E7E6E3] pb-4">
              <h2 className="flex items-center gap-3 text-xl font-semibold">
                <BriefcaseBusiness size={20} />
                Información de la oportunidad
              </h2>
              <span className="rounded bg-[#F4F3F0] px-3 py-1 text-xs text-[#44474D]">
                Publicación: {publicationDate}
              </span>
            </div>

            <section className="mb-8">
              <h3 className="mb-3 text-base font-semibold">
                Descripción del puesto
              </h3>
              <p className="whitespace-pre-line text-[15px] leading-7 text-[#44474D]">
                {vacancy.description}
              </p>
            </section>

            <section className="mb-8">
              <h3 className="mb-4 text-base font-semibold">
                Habilidades y requisitos solicitados
              </h3>
              {vacancy.requirements.length > 0 ? (
                <ul className="grid grid-cols-2 gap-3">
                  {vacancy.requirements.map((requirement, index) => (
                    <li
                      key={`${vacancy.id}-${index}`}
                      className="flex items-center gap-3 rounded border border-[#E7E6E3] bg-[#FCFBF8] px-4 py-3 text-sm text-[#44474D]"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-[#059669]"
                      />
                      {requirement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded bg-[#F4F3F0] p-4 text-sm text-[#44474D]">
                  Esta vacante no tiene requisitos de habilidades registrados.
                </p>
              )}
            </section>

            {vacancy.conditions && (
              <section>
                <h3 className="mb-3 text-base font-semibold">
                  Condiciones laborales
                </h3>
                <p className="whitespace-pre-line text-[15px] leading-7 text-[#44474D]">
                  {vacancy.conditions}
                </p>
              </section>
            )}
          </article>

          <aside className="space-y-6">
            <section className="rounded-lg bg-white p-7 shadow-sm">
              <h2 className="mb-5 text-base font-semibold">
                Información de la empresa
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded bg-[#EFEEEB]">
                  <Building2 size={21} />
                </div>
                <p className="font-semibold">{vacancy.company}</p>
              </div>
              <div className="mt-5 space-y-4 border-t border-[#E7E6E3] pt-5 text-sm text-[#44474D]">
                <p className="flex items-center gap-3">
                  <MapPin size={16} />
                  {vacancy.location}
                </p>
                <p className="flex items-center gap-3">
                  <Clock3 size={16} />
                  Modalidad {vacancy.modality.toLowerCase()}
                </p>
              </div>
            </section>

            <section className="rounded-lg border border-[#E8D8C4] bg-[#FFF9F0] p-6">
              <h2 className="text-base font-semibold">
                ¿Te interesa esta oportunidad?
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#55565A]">
                Puedes revisar tu compatibilidad antes de continuar con la
                postulación.
              </p>
              <Link
                href={`/vacantes/${encodeURIComponent(String(vacancy.id))}/postular`}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-[#FFA94D] px-4 text-sm font-bold text-[#000B21] hover:bg-[#f39a3d]"
              >
                <Send size={16} />
                Postularme a esta vacante
              </Link>
            </section>
          </aside>
        </div>
      </div>

      <footer className="border-t border-[#E7E6E3] bg-white px-5 py-5 text-center text-xs text-[#66686D]">
        Portal de Vinculación Laboral · Universidad Mayor de San Simón
      </footer>
    </main>
  );
}
