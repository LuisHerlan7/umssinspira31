
'use client';

import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import {
  BriefcaseBusiness,
  MapPin,
  Search,
  Plus,
  Clock3,
  ArrowRight,
  SlidersHorizontal,
  Building2,
  X,
} from 'lucide-react';
import {
  mergeVacancies,
  parseSavedVacancies,
} from './vacancy-data';
import {
  SERVER_STORAGE_SNAPSHOT,
  STORAGE_READ_ERROR_SNAPSHOT,
  readVacancySnapshot,
  subscribeToLocalStorage,
} from './storage';

export default function VacantesPage() {
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('Todas');
  const [modality, setModality] = useState('Todas');
  const snapshot = useSyncExternalStore(
    subscribeToLocalStorage,
    readVacancySnapshot,
    () => SERVER_STORAGE_SNAPSHOT,
  );
  const { savedVacancies, storageError, loaded } = useMemo(() => {
    if (snapshot === SERVER_STORAGE_SNAPSHOT) {
      return {
        savedVacancies: [],
        storageError: false,
        loaded: false,
      };
    }

    if (snapshot === STORAGE_READ_ERROR_SNAPSHOT) {
      return {
        savedVacancies: [],
        storageError: true,
        loaded: true,
      };
    }

    try {
      return {
        savedVacancies: parseSavedVacancies(snapshot),
        storageError: false,
        loaded: true,
      };
    } catch {
      return {
        savedVacancies: [],
        storageError: true,
        loaded: true,
      };
    }
  }, [snapshot]);

  const allVacancies = useMemo(
    () => mergeVacancies(savedVacancies),
    [savedVacancies],
  );

  const areas = useMemo(
    () => [
      'Todas',
      ...Array.from(new Set(allVacancies.map((vacancy) => vacancy.area))),
    ],
    [allVacancies],
  );

  const modalities = useMemo(
    () => [
      'Todas',
      ...Array.from(
        new Set(allVacancies.map((vacancy) => vacancy.modality)),
      ),
    ],
    [allVacancies],
  );

  const filteredVacancies = allVacancies.filter((vacancy) => {
    const text =
      `${vacancy.title} ${vacancy.company} ${vacancy.description} ${vacancy.location}`.toLowerCase();

    return (
      text.includes(search.trim().toLowerCase()) &&
      (area === 'Todas' || vacancy.area === area) &&
      (modality === 'Todas' || vacancy.modality === modality)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setArea('Todas');
    setModality('Todas');
  };

  return (
    <main className="min-h-screen bg-[#f3efe5] px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#bd7627]">
              UMSSPIRA / Oportunidades laborales
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#17384b] sm:text-4xl">
              Vacantes disponibles
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Explora oportunidades laborales y encuentra la que mejor se
              adapte a tu perfil profesional.
            </p>
          </div>

          <Link
            href="/vacantes/nueva"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-lg bg-[#ed9635] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#d98223] md:self-auto"
          >
            <Plus size={19} />
            Registrar vacante
          </Link>
        </div>

        <section className="mb-8 rounded-2xl border border-[#e7e0d4] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={19} className="text-[#17384b]" />
            <h2 className="font-bold text-[#17384b]">
              Encuentra tu oportunidad
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px_190px]">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-gray-200 bg-[#fcfbf8] px-4 transition focus-within:border-[#ed9635]">
              <Search size={19} className="shrink-0 text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cargo, empresa o ubicación..."
                className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                aria-label="Buscar vacantes"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Limpiar búsqueda"
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">
                Área profesional
              </span>

              <select
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className="min-h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#ed9635]"
                aria-label="Filtrar por área profesional"
              >
                {areas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-gray-500">
                Modalidad
              </span>

              <select
                value={modality}
                onChange={(event) => setModality(event.target.value)}
                className="min-h-12 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#ed9635]"
                aria-label="Filtrar por modalidad"
              >
                {modalities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#17384b]">
              Oportunidades laborales
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {loaded
                ? `${filteredVacancies.length} ${
                    filteredVacancies.length === 1
                      ? 'vacante encontrada'
                      : 'vacantes encontradas'
                  }`
                : 'Cargando oportunidades...'}
            </p>
          </div>

          {(search || area !== 'Todas' || modality !== 'Todas') && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[#a66320] hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {storageError && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            No se pudieron leer las vacantes guardadas en este navegador.
          </p>
        )}

        {!loaded ? (
          <div className="rounded-2xl border border-[#e7e0d4] bg-white px-5 py-16 text-center">
            <p className="text-sm text-gray-500">
              Cargando vacantes...
            </p>
          </div>
        ) : filteredVacancies.length === 0 ? (
          <div className="rounded-2xl border border-[#e7e0d4] bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5eee2] text-[#bd7627]">
              <Search size={26} />
            </div>

            <h2 className="text-lg font-bold text-[#17384b]">
              No encontramos vacantes
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Prueba con otra búsqueda o selecciona un área profesional
              diferente.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg bg-[#ed9635] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d98223]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVacancies.map((vacancy) => (
              <article
                key={`${vacancy.id}-${vacancy.title}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e7e0d4] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#e3c49c] hover:shadow-lg"
              >
                <div className="h-1.5 bg-[#ed9635]" />

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf1f3] text-[#17384b]">
                      <BriefcaseBusiness size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold leading-snug text-[#17384b]">
                        {vacancy.title}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                        <Building2 size={15} className="shrink-0" />
                        <span>{vacancy.company}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#edf1f3] px-3 py-1.5 text-xs font-semibold text-[#294d60]">
                      {vacancy.area}
                    </span>

                    <span className="rounded-full bg-[#fbf0df] px-3 py-1.5 text-xs font-semibold text-[#975b1c]">
                      {vacancy.modality}
                    </span>
                  </div>

                  <p className="mb-5 text-sm leading-6 text-gray-600">
                    {vacancy.description}
                  </p>

                  <div className="mb-5 space-y-2 text-xs text-gray-500">
                    <p className="flex items-start gap-2">
                      <MapPin size={15} className="mt-0.5 shrink-0" />
                      <span>{vacancy.location}</span>
                    </p>

                    <p className="flex items-start gap-2">
                      <Clock3 size={15} className="mt-0.5 shrink-0" />
                      <span>
                        {vacancy.createdAt
                          ? `Registrada el ${new Date(
                              vacancy.createdAt,
                            ).toLocaleDateString('es-BO')}`
                          : 'Vacante de ejemplo'}
                      </span>
                    </p>
                  </div>

                  <div className="mb-5 border-t border-[#eee9df] pt-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Requisitos destacados
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {vacancy.requirements.map((requirement, index) => (
                        <span
                          key={`${vacancy.id}-${index}-${requirement}`}
                          className="rounded-md border border-gray-200 bg-[#fcfbf8] px-2.5 py-1.5 text-xs text-gray-600"
                        >
                          {requirement}
                        </span>
                      ))}
                    </div>
                  </div>

                  {vacancy.conditions && (
                    <div className="mb-5 border-t border-[#eee9df] pt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Condiciones
                      </p>

                      <p className="text-sm leading-6 text-gray-600">
                        {vacancy.conditions}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto border-t border-[#eee9df] pt-4">
                    <Link
                      href={`/vacantes/${vacancy.id}`}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#17384b] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#234b60]"
                    >
                      Ver detalle de la vacante
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="mt-8 rounded-xl border border-[#e7e0d4] bg-white/70 px-4 py-3">
          <p className="text-xs leading-5 text-gray-500">
            Esta versión utiliza vacantes de demostración y datos almacenados
            localmente en este navegador. La integración con el backend y la
            base de datos compartida está pendiente.
          </p>
        </div>
      </div>
    </main>
  );
}
