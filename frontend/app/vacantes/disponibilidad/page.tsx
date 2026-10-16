'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import VacancyAdminFooter from '../components/VacancyAdminFooter';
import {
  configuredCompanyId,
  listVacancies,
  updateVacancyAvailability,
  type Vacancy,
} from '../../../lib/api/vacantes';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

export default function DisponibilidadVacantesPage() {
  const [filter, setFilter] = useState<AvailabilityFilter>('all');
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    let active = true;

    if (!configuredCompanyId) {
      setLoadError('No se configuró la empresa cuyas vacantes deben consultarse.');
      setLoaded(true);
      return;
    }

    listVacancies(configuredCompanyId)
      .then((data) => {
        if (active) setVacancies(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'No se pudieron consultar las vacantes.',
          );
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeVacancies = vacancies.filter(
    (vacancy) => vacancy.disponible,
  );
  const unavailableVacancies = vacancies.filter(
    (vacancy) => !vacancy.disponible,
  );
  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesAvailability =
      filter === 'all' ||
      (filter === 'available' && vacancy.disponible) ||
      (filter === 'unavailable' && !vacancy.disponible);

    return matchesAvailability;
  });

  const confirmAvailabilityChange = async () => {
    if (!selectedVacancy) return;

    const nextAvailability = !selectedVacancy.disponible;

    try {
      setMutating(true);
      const updated = await updateVacancyAvailability(
        selectedVacancy.id,
        nextAvailability,
      );
      setVacancies((current) =>
        current.map((vacancy) =>
          vacancy.id === updated.id ? updated : vacancy,
        ),
      );
      setNotice(
        nextAvailability
          ? 'La vacante fue reactivada y volvió al conjunto activo.'
          : 'La vacante se marcó como no disponible. Su registro se conserva.',
      );
      setMutationError('');
      setSelectedVacancy(null);
    } catch (error) {
      setMutationError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la disponibilidad de la vacante.',
      );
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[#eee9df] text-[#1b2632]">
      <main className="mx-auto min-h-[890px] max-w-[1440px] px-5 pb-16 pt-5 sm:px-8 lg:px-14">
        <nav aria-label="Ruta de navegación" className="text-xs text-[#7a858d]">
          <Link href="/mis-vacantes" className="hover:underline">Mis vacantes</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page" className="font-medium text-[#1b2632]">Disponibilidad</span>
        </nav>

        <header className="mt-6">
          <h1 className="text-[30px] font-bold leading-none">Disponibilidad de vacantes</h1>
          <p className="mt-3 text-sm text-[#6e7880]">Administra el estado de tus oportunidades laborales.</p>
        </header>

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-[10px] border border-[#2f7a5d] bg-[#e7f3ed] px-5 py-4 text-sm font-medium text-[#2f7a5d]"
          >
            {notice}
          </p>
        )}

        {mutationError && (
          <p
            role="alert"
            className="mt-5 rounded-[10px] border border-[#a35139] bg-[#fff0db] px-5 py-4 text-sm text-[#a35139]"
          >
            {mutationError}
          </p>
        )}

        <section aria-label="Resumen de vacantes" className="mt-[84px] grid gap-4 sm:grid-cols-3 xl:grid-cols-[220px_220px_220px_1fr] xl:gap-6">
          <SummaryCard label="Registradas" value={vacancies.length} />
          <SummaryCard
            label="Disponibles"
            value={activeVacancies.length}
            tone="green"
          />
          <SummaryCard
            label="No disponibles"
            value={unavailableVacancies.length}
            tone="amber"
          />
          <aside className="flex min-h-[94px] flex-col justify-center rounded-[14px] bg-[#2c3b4d] px-6 text-white sm:col-span-3 xl:col-span-1">
            <h2 className="text-[13px] font-bold">Visibilidad en la bolsa</h2>
            <p className="mt-3 text-xs font-medium text-[#c9c1b1]">Las vacantes no disponibles dejan de mostrarse en la bolsa pública, pero permanecen en “Mis vacantes”.</p>
          </aside>
        </section>

        <section className="mt-[22px] min-h-[504px] overflow-hidden rounded-2xl border border-[#ddd6c8] bg-white p-4 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Mis vacantes</h2>
            </div>
            <div className="w-full sm:w-[350px]">
              <label className="block text-[11px] font-semibold">Filtrar por estado
                <select
                  value={filter}
                  onChange={(event) =>
                    setFilter(event.target.value as AvailabilityFilter)
                  }
                  aria-label="Filtrar por estado de disponibilidad"
                  className="mt-2 h-[46px] w-full rounded-[7px] border border-[#ddd6c8] bg-white px-3.5 text-[13px] outline-none focus:border-[#ffb162]"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="unavailable">No disponible</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3 flex min-h-[42px] flex-wrap items-center gap-x-6 gap-y-2 rounded-lg bg-[#f8f5ef] px-4 py-3 text-xs font-semibold sm:gap-x-9 sm:px-5">
            <button type="button" onClick={() => setFilter('all')}>Todas {vacancies.length}</button>
            <button type="button" onClick={() => setFilter('available')} className="text-[#2f7a5d]">Disponibles {activeVacancies.length}</button>
            <button type="button" onClick={() => setFilter('unavailable')} className="text-[#a35139]">No disponibles {unavailableVacancies.length}</button>
          </div>

          {loadError ? (
            <p role="alert" className="mt-5 rounded-lg bg-[#fff0db] p-4 text-sm text-[#a35139]">
              {loadError}
            </p>
          ) : !loaded ? (
            <p className="p-10 text-center text-sm text-[#6e7880]">
              Cargando vacantes...
            </p>
          ) : filteredVacancies.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-semibold text-[#1b2632]">
                No encontramos vacantes
              </p>
              <p className="mt-2 text-sm text-[#6e7880]">
                Prueba con otra búsqueda o selecciona otro estado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="sr-only"><tr><th>Identificador</th><th>Vacante</th><th>Estado</th><th>Visibilidad</th><th>Acción</th></tr></thead>
                <tbody className="divide-y divide-[#ddd6c8]">
                  {filteredVacancies.map((vacancy) => {
                    const available = vacancy.disponible;

                    return (
                      <tr key={String(vacancy.id)} className="h-[68px] even:bg-[#f8f5ef]">
                        <td className="w-[145px] px-4 text-xs font-semibold text-[#a35139]">{String(vacancy.id)}</td>
                        <td className="w-[360px] px-4 text-[13px] font-medium">{vacancy.titulo}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex h-[30px] min-w-[150px] items-center justify-center rounded-full px-4 text-[11px] font-bold ${
                              available
                                ? 'bg-[#e7f3ed] text-[#2f7a5d]'
                                : 'bg-[#fff4db] text-[#a66b1f]'
                            }`}
                          >
                            {available ? 'Disponible' : 'No disponible'}
                          </span>
                        </td>
                        <td className={`w-[220px] px-5 text-xs font-medium ${available ? 'text-[#2f7a5d]' : 'text-[#a35139]'}`}>
                          {available ? 'Visible en bolsa' : 'Oculta en bolsa'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setMutationError('');
                              setSelectedVacancy(vacancy);
                            }}
                            className="h-11 min-w-[188px] rounded-[7px] border border-[#ddd6c8] bg-white px-4 text-[13px] font-semibold hover:bg-[#faf8f4]"
                          >
                            {available ? 'Cambiar estado' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 rounded-[9px] bg-[#fff0db] px-5 py-[18px] text-xs font-medium text-[#a35139]">Antes de cambiar una vacante a “No disponible”, el sistema debe solicitar confirmación para evitar cambios accidentales.</p>
        </section>
      </main>

      {selectedVacancy && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#000b21]/45 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedVacancy(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="availability-dialog-title"
            aria-describedby="availability-dialog-description"
            className="max-h-[calc(100vh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-[#ddd6c8] bg-white p-5 shadow-2xl sm:p-8"
          >
            <p className="mb-4 inline-flex rounded-full bg-[#eaf0f7] px-4 py-2 text-xs font-bold text-[#2c3b4d]">
              VAC-{String(selectedVacancy.id).toUpperCase()}
            </p>
            <h2
              id="availability-dialog-title"
              className="text-xl font-bold text-[#1b2632]"
            >
              {!selectedVacancy.disponible
                ? '¿Reactivar esta vacante?'
                : '¿Marcar la vacante como no disponible?'}
            </h2>
            <p
              id="availability-dialog-description"
              className="mt-3 text-sm leading-6 text-[#6e7880]"
            >
              {!selectedVacancy.disponible
                ? 'La vacante volverá a aparecer en las búsquedas y consultas disponibles.'
                : 'La vacante dejará de aparecer en “Mis vacantes” para postulantes, pero su registro se conservará y podrás reactivarla después.'}
            </p>
            <p className="mt-5 rounded-lg bg-[#f8f5ef] p-4 text-sm font-semibold text-[#1b2632]">
              {selectedVacancy.titulo} · {selectedVacancy.empresa}
            </p>
            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedVacancy(null)}
                className="h-11 rounded-[7px] border border-[#ddd6c8] px-6 text-[13px] font-semibold hover:bg-[#faf8f4]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAvailabilityChange}
                disabled={mutating}
                className="h-11 rounded-[7px] bg-[#ffb162] px-6 text-[13px] font-semibold text-[#1b2632] hover:bg-[#f2a455]"
              >
                {mutating
                  ? 'Guardando...'
                  : !selectedVacancy.disponible
                    ? 'Reactivar vacante'
                    : 'Marcar no disponible'}
              </button>
            </div>
          </section>
        </div>
      )}
      <VacancyAdminFooter />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'green' | 'amber';
}) {
  const valueColor = tone === 'amber' ? 'text-[#a35139]' : 'text-[#1b2632]';

  return (
    <article className="flex min-h-[94px] flex-col justify-center rounded-[14px] border border-[#ddd6c8] bg-white px-6">
      <p className={`text-[28px] font-bold leading-none ${valueColor}`}>{value}</p>
      <p className="mt-4 text-xs font-medium text-[#6e7880]">{label}</p>
    </article>
  );
}
