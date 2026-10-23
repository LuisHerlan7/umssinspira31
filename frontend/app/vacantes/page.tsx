'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowUp, BriefcaseBusiness, CheckCircle2, ChevronDown, CloudAlert, Info, RefreshCw, Search, UserRound } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import VacancyAdminFooter from './components/VacancyAdminFooter';
import { useVacancyConsultationSession } from './components/VacancyConsultationProvider';
import { boardStyles as styles } from './components/jobs-styles';
import type { Vacancy } from '../../lib/api/vacantes';
import { loadHu8Vacancies } from '../../lib/vacancies/consultation-source';
import { observeVacancyRead } from '../../lib/vacancies/consultation-session';
import { hu8Href, resolveHu8DemoScenario, type Hu8ConsultationRead, type Hu8DemoScenario } from '../../lib/vacancies/demo-mode';
import {
  EMPTY_VACANCY_FILTERS,
  filterVacancies,
  formatVacancyConsultation,
  sortVacancies,
  vacancyFilterOptions,
  vacancyPublicationDate,
  type VacancyFilterField,
  type VacancyFilters,
  type VacancySort,
} from '../../lib/vacancies/listing';

type SearchResult = {
  reloadKey: number;
  vacancies: Vacancy[];
  error: string;
  consultedAt: string | null;
  newIds: string[];
};

function VacancyFilter({ field, label, placeholder, vacancies, value, onChange }: {
  field: VacancyFilterField;
  label: string;
  placeholder: string;
  vacancies: Vacancy[];
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `vacancy-${field}`;
  return (
    <div className={styles.filter}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.fieldWrap}>
        <ChevronDown size={16} aria-hidden="true" className={styles.fieldIcon} />
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={styles.field}>
          <option value="">{placeholder}</option>
          {vacancyFilterOptions(vacancies, field, value).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const LOAD_ERROR_MESSAGE = 'Ocurrió un problema al consultar las ofertas. Intenta nuevamente en unos momentos.';

function VacantesContenido({ scenario }: { scenario: Hu8DemoScenario | null }) {
  const session = useVacancyConsultationSession(scenario);
  const [filters, setFilters] = useState<VacancyFilters>(session.filters);
  const [order, setOrder] = useState<VacancySort>(session.order);
  const [read, setRead] = useState<{ sequence: number; action: Hu8ConsultationRead['action'] }>({ sequence: session.nextRead, action: 'initial' });
  const reloadKey = read.sequence;
  const [result, setResult] = useState<SearchResult | null>(null);
  const requestInFlight = useRef(false);
  const currentResult = result?.reloadKey === reloadKey ? result : null;
  const loading = currentResult === null;
  const sourceVacancies = currentResult?.vacancies ?? [];
  const vacancies = sortVacancies(filterVacancies(sourceVacancies, filters), order);
  const error = currentResult?.error ?? '';
  const newIds = currentResult?.newIds ?? [];
  const hasFilters = Object.values(filters).some((value) => value.trim().length > 0);
  const noFilterMatches = hasFilters && sourceVacancies.length > 0 && vacancies.length === 0;
  const updated = !loading && !error && (reloadKey > 0 || newIds.length > 0 || scenario === 'actualizado' || (scenario === 'recorrido' && session.journey.phase === 'actualizado'));

  useEffect(() => {
    const controller = new AbortController();
    requestInFlight.current = true;
    // Real API by default. Demo URLs require development or the explicitly enabled Preview.
    loadHu8Vacancies(scenario, controller.signal, { ...read, journey: session.journey })
      .then((data) => {
        if (!controller.signal.aborted) {
          const action = read.sequence > session.completedRead ? read.action : 'initial';
          const additions = observeVacancyRead(session, data, action);
          session.completedRead = Math.max(session.completedRead, read.sequence);
          setResult({ reloadKey, vacancies: data, error: '', consultedAt: new Date().toISOString(), newIds: additions });
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        session.completedRead = Math.max(session.completedRead, read.sequence);
        setResult({ reloadKey, vacancies: [], error: LOAD_ERROR_MESSAGE, consultedAt: null, newIds: [] });
      })
      .finally(() => {
        if (!controller.signal.aborted) requestInFlight.current = false;
      });
    return () => {
      controller.abort();
      requestInFlight.current = false;
    };
  }, [reloadKey, scenario, session, read]);

  const reload = () => {
    // The ref also blocks several clicks in the same event turn, before React
    // has replaced the error card with the loading skeleton.
    if (loading || requestInFlight.current) return;
    requestInFlight.current = true;
    session.nextRead += 1;
    setRead({ sequence: session.nextRead, action: error ? 'retry' : 'refresh' });
  };
  const clearFilters = () => {
    session.filters = { ...EMPTY_VACANCY_FILTERS };
    setFilters(session.filters);
  };
  const updateFilter = (field: keyof VacancyFilters, value: string) => {
    session.filters = { ...filters, [field]: value };
    setFilters(session.filters);
  };
  const updateOrder = (value: VacancySort) => {
    session.order = value;
    setOrder(value);
  };
  const PublicationArrow = order === 'recent' ? ArrowDown : ArrowUp;

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Link href={hu8Href(scenario ? '/vacantes' : '/', scenario)} className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Inicio</Link>
        <header className={styles.heading}>
          <div className={styles.identity}>
            <span className={styles.briefcase}><BriefcaseBusiness size={25} strokeWidth={1.4} aria-hidden="true" /></span>
            <div>
              <h1 className={styles.title}>Bolsa de trabajo</h1>
              <p className={styles.description}>Explora las vacantes disponibles y conoce sus principales características.</p>
            </div>
          </div>
          <Link href="/perfil/experiencia-laboral" className={`${styles.button} ${styles.profile}`}><UserRound size={15} aria-hidden="true" />Mi perfil</Link>
        </header>

        <section aria-label="Filtros de vacantes" className={styles.filters}>
          <div className={styles.filter}>
            <label htmlFor="vacancy-search" className={styles.label}>Buscar vacantes</label>
            <div className={styles.fieldWrap}>
              <Search size={16} aria-hidden="true" className={styles.fieldIcon} />
              <input id="vacancy-search" type="search" aria-label="Buscar por título o empresa" placeholder="Buscar por título o empresa" value={filters.query} onChange={(event) => updateFilter('query', event.target.value)} className={styles.field} />
            </div>
          </div>
          <VacancyFilter field="area" label="Área laboral" placeholder="Área: todas" vacancies={result?.vacancies ?? []} value={filters.area} onChange={(value) => updateFilter('area', value)} />
          <VacancyFilter field="modalidad" label="Modalidad de trabajo" placeholder="Modalidad: todas" vacancies={result?.vacancies ?? []} value={filters.modalidad} onChange={(value) => updateFilter('modalidad', value)} />
          <VacancyFilter field="ubicacion" label="Ubicación" placeholder="Ubicación: todas" vacancies={result?.vacancies ?? []} value={filters.ubicacion} onChange={(value) => updateFilter('ubicacion', value)} />
        </section>
        {hasFilters && <div className={styles.filterActions}><button type="button" onClick={clearFilters} className={styles.textButton}>Limpiar filtros</button></div>}

        <div role="status" className={`${styles.information} ${updated ? styles.informationSuccess : ''}`}>
          {updated ? <CheckCircle2 size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
          <p className="flex-1">
            {loading
              ? reloadKey > 0 ? 'Actualizando listado…' : 'Consultando las ofertas publicadas y disponibles…'
              : error ? 'No se pudo completar la consulta de vacantes.'
                : <>{updated && 'Listado actualizado. '}{newIds.length > 0 && `${newIds.length} ${newIds.length === 1 ? 'nueva vacante' : 'nuevas vacantes'}. `}Consulta las ofertas publicadas y disponibles. {currentResult?.consultedAt && <>Última consulta: <time dateTime={currentResult.consultedAt}>{formatVacancyConsultation(currentResult.consultedAt)}</time>.</>}</>}
          </p>
          <button type="button" onClick={reload} disabled={loading} aria-label="Actualizar listado" title="Actualizar listado" className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-black/5">
            <RefreshCw size={17} aria-hidden="true" className={loading ? 'animate-spin motion-reduce:animate-none' : ''} />
          </button>
        </div>

        <section aria-label="Vacantes disponibles" aria-busy={loading}>
          <div className={styles.toolbar}>
            <p aria-live="polite" className={styles.count}>
              {loading ? 'Consultando vacantes…' : error ? 'Consulta no disponible' : `${vacancies.length} ${vacancies.length === 1 ? 'vacante disponible' : 'vacantes disponibles'}`}
              {scenario && <span className="ml-2 text-xs font-normal text-[#71829a]">Datos simulados · Demostración</span>}
            </p>
            <div className={styles.toolbarActions}>
              <div className={`${styles.fieldWrap} ${styles.sort}`}>
                <ChevronDown size={16} aria-hidden="true" className={styles.fieldIcon} />
                <label htmlFor="vacancy-order" className="sr-only">Orden de publicación</label>
                <select id="vacancy-order" value={order} onChange={(event) => updateOrder(event.target.value as VacancySort)} className={styles.field}>
                  <option value="recent">Ordenar: más recientes</option>
                  <option value="oldest">Ordenar: más antiguas</option>
                </select>
              </div>
            </div>
          </div>
          {loading && <p role="status" className="sr-only">Cargando vacantes</p>}

          {!loading && error ? (
            <div role="alert" aria-labelledby="vacancies-load-error-title" className={`${styles.state} hu8-board-loadError`}>
              <span className="hu8-board-errorIcon" aria-hidden="true"><CloudAlert size={34} strokeWidth={1.6} /></span>
              <h2 id="vacancies-load-error-title">No pudimos cargar las vacantes</h2>
              <p>{error}</p>
              <button type="button" onClick={reload} disabled={loading} className={`${styles.button} hu8-board-errorRetry`}>Reintentar</button>
              <p className="hu8-board-errorHelp">Si el problema continúa, contacta a Ayuda y soporte.</p>
            </div>
          ) : !loading && vacancies.length === 0 ? (
            <div role="status" className={styles.state}>
              <Search size={36} strokeWidth={1.5} className={styles.stateIcon} aria-hidden="true" />
              <h2>{noFilterMatches ? 'No encontramos vacantes' : 'Sin vacantes'}</h2>
              <p>{noFilterMatches ? 'No hay ofertas que coincidan con los filtros seleccionados. Prueba con otros criterios.' : 'En este momento no hay vacantes disponibles. Puedes actualizar el listado más tarde.'}</p>
              <button type="button" onClick={noFilterMatches ? clearFilters : reload} className={styles.button}>{noFilterMatches ? 'Limpiar filtros' : 'Actualizar listado'}</button>
            </div>
          ) : (
            <div role="region" aria-label="Tabla de vacantes" tabIndex={0} className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className="sr-only">Vacantes y empresas con acceso a la oferta y sus requisitos técnicos</caption>
                <colgroup><col style={{ width: '49.5%' }} /><col style={{ width: '16.5%' }} /><col style={{ width: '10.5%' }} /><col style={{ width: '11%' }} /><col style={{ width: '12.5%' }} /></colgroup>
                <thead>
                  <tr>
                    <th scope="col">Vacante y empresa</th>
                    <th scope="col">Área laboral</th>
                    <th scope="col">Modalidad</th>
                    <th scope="col" aria-sort={order === 'recent' ? 'descending' : 'ascending'}><span className="inline-flex items-center gap-1">Publicación<PublicationArrow size={14} aria-hidden="true" /></span></th>
                    <th scope="col">Oferta</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 4 }, (_, index) => (
                    <tr key={index} aria-hidden="true">
                      <td><div className={styles.skeleton} style={{ width: '70%' }} /><div className={`${styles.skeleton} ${styles.skeletonSecondary}`} /><div className={`${styles.skeleton} ${styles.skeletonSummary}`} /></td>
                      <td><div className={styles.skeleton} /><div className={`${styles.skeleton} ${styles.skeletonSecondary}`} /></td>
                      <td><div className={styles.skeleton} /></td>
                      <td><div className={styles.skeleton} /></td>
                      <td><div className={`${styles.skeleton} ${styles.skeletonButton}`} /></td>
                    </tr>
                  )) : vacancies.map((vacancy) => {
                    const publication = vacancyPublicationDate(vacancy.fechaCreacion);
                    return (
                      <tr key={vacancy.id}>
                        <td>
                          <p className={styles.vacancyTitle}>{vacancy.titulo || 'Vacante sin título'}{newIds.includes(vacancy.id.toLowerCase()) && <span className="hu8-board-newBadge">Nueva</span>}</p>
                          <p className={styles.company}>{vacancy.empresa || 'Empresa sin nombre registrado'}</p>
                          {vacancy.descripcion && <p className={styles.summary}>{vacancy.descripcion}</p>}
                        </td>
                        <td>{vacancy.area || 'No especificada'}{vacancy.ubicacion && <span className={styles.location}>{vacancy.ubicacion}</span>}</td>
                        <td className={styles.modality}>{vacancy.modalidad || 'No especificada'}</td>
                        <td className={styles.publication}>{publication.dateTime ? <time dateTime={publication.dateTime} title="Fecha de registro de la vacante">{publication.label}</time> : publication.label}</td>
                        <td><Link href={hu8Href(`/vacantes/${encodeURIComponent(vacancy.id)}`, scenario)} aria-label={`Ver oferta: ${vacancy.titulo}`} className={`${styles.button} ${styles.offer}`}>Ver oferta</Link></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <VacancyAdminFooter />
    </main>
  );
}

function VacantesRoute() {
  const searchParams = useSearchParams();
  const scenario = resolveHu8DemoScenario(searchParams.get('hu8Demo'));
  return <VacantesContenido key={scenario ?? 'real'} scenario={scenario} />;
}

export default function VacantesPage() {
  return (
    <Suspense fallback={
      <main className={styles.page}>
        <div className={styles.content}><p role="status">Cargando bolsa de trabajo…</p></div>
      </main>
    }>
      <VacantesRoute />
    </Suspense>
  );
}
