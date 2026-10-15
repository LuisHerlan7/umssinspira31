'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { findVacancyIn, parseSavedVacancies, type Vacancy } from '../../vacancy-data';
import {
  SERVER_STORAGE_SNAPSHOT,
  STORAGE_READ_ERROR_SNAPSHOT,
  readVacancySnapshot,
  subscribeToLocalStorage,
  updateVacancy,
} from '../../storage';

type Requirement = NonNullable<Vacancy['requirementDetails']>[number];
type Draft = {
  title: string;
  status: string;
  description: string;
  requirements: Requirement[];
};

const LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
const TYPES = ['Obligatorio', 'Deseable'];
const STATUSES = ['Disponible', 'Pausada', 'Cerrada'];
const inputClass = 'h-10 w-full min-w-0 rounded-md border border-[#ded6c9] bg-white px-3 py-2 text-xs outline-none focus:border-[#ed9635]';
const labelClass = 'mb-1 block text-[10px] font-semibold leading-3 text-[#263747]';
const normalize = (value: string) => value.replace(/\s+/gu, '').toLocaleLowerCase('es');

function toDraft(vacancy: Vacancy): Draft {
  return {
    title: vacancy.title,
    status: vacancy.status ?? 'Disponible',
    description: vacancy.description,
    requirements: vacancy.requirements.map((name) => {
      const detail = vacancy.requirementDetails?.find((item) => normalize(item.name) === normalize(name));
      return { name, level: detail?.level ?? 'Avanzado', type: detail?.type ?? 'Obligatorio' };
    }),
  };
}

export default function EditarVacanteCliente({ id }: { id: string }) {
  const snapshot = useSyncExternalStore(
    subscribeToLocalStorage,
    readVacancySnapshot,
    () => SERVER_STORAGE_SNAPSHOT,
  );
  const result = useMemo(() => {
    if (snapshot === SERVER_STORAGE_SNAPSHOT) return { loading: true };
    if (snapshot === STORAGE_READ_ERROR_SNAPSHOT) {
      return { error: 'No se pudo acceder al almacenamiento local del navegador.' };
    }
    try {
      const savedVacancies = parseSavedVacancies(snapshot);
      const vacancy = findVacancyIn(id, savedVacancies);
      // Only the unsaved sample uses the approved mockup's initial content.
      // Persisted records and other vacancies keep their own information.
      const initialVacancy = vacancy && id === '1' &&
        !savedVacancies.some((item) => String(item.id) === id)
        ? {
            ...vacancy,
            title: 'Analista de Datos Junior',
            status: 'Disponible',
            code: 'VAC-2026-047',
            description: 'Apoyar análisis comercial, reportes y tableros para toma de decisiones.',
            requirements: ['SQL', 'Python', 'Power BI', 'Excel'],
          }
        : vacancy;
      return { vacancy: initialVacancy };
    } catch {
      return { error: 'No se pudieron leer las vacantes guardadas en este navegador.' };
    }
  }, [id, snapshot]);

  return (
    <main className="flex-1 bg-[#eeeae1] px-5 pb-3 pt-6 text-[#202d39] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1240px]">
        {result.loading ? <p className="text-sm text-gray-600">Cargando vacante...</p> :
          result.error || !result.vacancy ? (
            <section className="rounded-2xl border border-[#e7e0d4] bg-white p-8 text-center shadow-sm">
              <h1 className="text-2xl font-bold">{result.error ? 'No se pudo cargar la vacante' : 'Vacante no encontrada'}</h1>
              <p className="mt-3 text-sm text-gray-600" role={result.error ? 'alert' : undefined}>
                {result.error || 'Es posible que la vacante no exista o ya no esté disponible.'}
              </p>
              <Link href="/empresa/vacantes" className="mt-6 inline-block rounded-lg bg-[#ed9635] px-5 py-3 text-sm font-bold text-white hover:bg-[#d98223]">Volver a vacantes</Link>
            </section>
          ) : <VacancyForm key={id} vacancy={result.vacancy} />}
      </div>
    </main>
  );
}

function VacancyForm({ vacancy }: { vacancy: Vacancy }) {
  const [original, setOriginal] = useState(vacancy);
  const [baseline, setBaseline] = useState(() => toDraft(vacancy));
  const [draft, setDraft] = useState(() => toDraft(vacancy));
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Avanzado');
  const [type, setType] = useState('Obligatorio');
  const [requirementError, setRequirementError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const discardButtonRef = useRef<HTMLButtonElement>(null);
  const requirementInputRef = useRef<HTMLInputElement>(null);

  const pendingRequirement = name.length > 0 || level !== 'Avanzado' || type !== 'Obligatorio';
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline) || pendingRequirement;
  const valid = draft.title.trim().length > 0 && draft.title.trim().length <= 100 &&
    draft.status.trim().length > 0 && draft.description.trim().length >= 20 && draft.requirements.length > 0;
  const code = original.code ?? 'VAC-2026-047';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (confirmDiscard && dialog && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('button')?.focus();
    }
    if (!confirmDiscard && dialog?.open) dialog.close();
  }, [confirmDiscard]);

  function changeDraft(next: Draft) {
    setDraft(next);
    setSaved(false);
    setSaveError('');
  }

  function resetRequirement() {
    setName('');
    setLevel('Avanzado');
    setType('Obligatorio');
    setRequirementError('');
  }

  function addRequirement() {
    const trimmed = name.trim();
    if (!trimmed || !level || !type) {
      setRequirementError('Completa el nuevo requisito, el nivel y el tipo.');
      requirementInputRef.current?.focus();
      return;
    }
    if (draft.requirements.some((item) => normalize(item.name) === normalize(trimmed))) {
      setRequirementError(`${trimmed} ya existe en los requisitos de esta vacante.`);
      requirementInputRef.current?.focus();
      return;
    }
    changeDraft({ ...draft, requirements: [...draft.requirements, { name: trimmed, level, type }] });
    resetRequirement();
    requirementInputRef.current?.focus();
  }

  function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty || !valid || name.trim()) return;
    setSaveError('');
    try {
      const updated = updateVacancy(String(original.id), {
        title: draft.title.trim(),
        status: draft.status,
        description: draft.description.trim(),
        requirements: draft.requirements.map((item) => item.name),
        requirementDetails: draft.requirements,
      });
      const nextDraft = toDraft(updated);
      setOriginal(updated);
      setBaseline(nextDraft);
      setDraft(nextDraft);
      resetRequirement();
      setSaved(true);
    } catch {
      setSaved(false);
      setSaveError('No se pudieron guardar los cambios. Comprueba el almacenamiento del navegador e inténtalo de nuevo.');
    }
  }

  function discardChanges() {
    setDraft(baseline);
    resetRequirement();
    setSaved(false);
    setSaveError('');
    setConfirmDiscard(false);
  }

  return (
    <>
      <nav aria-label="Ruta de navegación" className="mb-5 flex flex-wrap items-center gap-1 text-[11px] leading-4 text-[#7b858e]">
        <Link href="/empresa/vacantes" className="hover:underline">Mis vacantes</Link>
        <span aria-hidden="true">/</span>
        <span className="hover:underline">{original.title}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="font-semibold text-[#263747]">Editar</span>
      </nav>

      <div className="mb-10 sm:mb-16">
        <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">Editar vacante</h1>
        <p className="mt-1.5 text-xs leading-5 text-[#7b858e]">Actualiza los datos de la oportunidad y guarda los cambios.</p>
      </div>

      <div className="mb-5 min-h-11">
      {(dirty || !saved) && (
        <div role="status" className="flex items-start gap-4 px-3 py-0.5 text-xs text-[#b84c27] sm:px-6">
          <span className="mt-0.5 text-base font-bold leading-5" aria-hidden="true">!</span>
          <div><p className="font-bold leading-5">Cambios sin guardar</p><p className="mt-0.5 text-[11px] leading-4">Revisa los campos modificados antes de confirmar.</p></div>
        </div>
      )}
      </div>
      {saved && !dirty && (
        <div role="status" className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div><p className="font-bold">Cambios guardados correctamente</p><p className="mt-1">La vacante se actualizó con la nueva información.</p></div>
        </div>
      )}
      {saveError && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{saveError}</p>}

      <form onSubmit={saveChanges}>
        <div className="rounded-[14px] border border-[#ded8cc] bg-white px-5 pb-[26px] pt-[18px] shadow-[0_1px_2px_rgba(38,55,71,0.02)] sm:px-[22px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold leading-7 tracking-tight">Información editable</h2>
            <span className="inline-flex min-w-28 items-center justify-center rounded-full bg-[#eaf0f7] px-5 py-1.5 text-[10px] font-semibold text-[#263747]">Editando</span>
          </div>
        <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.95fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="vacancy-title" className={labelClass}>Nombre del cargo <span className="text-red-600">*</span></label>
            <input id="vacancy-title" required maxLength={100} value={draft.title} onChange={(event) => changeDraft({ ...draft, title: event.target.value })} className={inputClass} />
          </div>
          <div>
            <label htmlFor="vacancy-status" className={labelClass}>Estado <span className="text-red-600">*</span></label>
            <select id="vacancy-status" required value={draft.status} onChange={(event) => changeDraft({ ...draft, status: event.target.value })} className={inputClass}>
              {!STATUSES.includes(draft.status) && <option value={draft.status}>{draft.status || 'Selecciona un estado'}</option>}
              {STATUSES.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="vacancy-code" className={labelClass}>Código</label>
            <input id="vacancy-code" readOnly value={code} className={`${inputClass} bg-[#f7f5f0]! text-[#555e67]`} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="vacancy-description" className={labelClass}>Descripción breve <span className="text-red-600">*</span></label>
            <textarea id="vacancy-description" required minLength={20} rows={1} value={draft.description} onChange={(event) => changeDraft({ ...draft, description: event.target.value })} className={`${inputClass} block min-h-10 resize-y leading-5`} aria-describedby="description-help" />
            <p id="description-help" className="mt-1 text-[10px] leading-4 text-[#7b858e]">Máximo 300 caracteres.</p>
          </div>
        </div>

        <fieldset className="mt-5 min-w-0">
          <legend className="sr-only">Requisitos de la vacante</legend>
          <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(120px,0.75fr)] lg:gap-6">
            <div>
              <label htmlFor="requirement-name" className={`${labelClass} text-[#b84c27]!`}>Nuevo requisito <span className="text-red-600">*</span></label>
              <input ref={requirementInputRef} id="requirement-name" value={name} placeholder="Ej. SQL" onChange={(event) => { setName(event.target.value); setRequirementError(''); setSaved(false); }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addRequirement(); } }} aria-invalid={Boolean(requirementError)} aria-describedby={requirementError ? 'requirement-error' : undefined} className={`${inputClass} ${requirementError ? 'border-red-500 focus:border-red-500' : ''}`} />
              {requirementError && <p id="requirement-error" role="alert" className="mt-2 text-sm text-red-600">{requirementError}</p>}
            </div>
            <div>
              <label htmlFor="requirement-level" className={labelClass}>Nivel <span className="text-red-600">*</span></label>
              <select id="requirement-level" value={level} onChange={(event) => { setLevel(event.target.value); setSaved(false); }} className={inputClass}>
                {LEVELS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="requirement-type" className={labelClass}>Tipo <span className="text-red-600">*</span></label>
              <select id="requirement-type" value={type} onChange={(event) => { setType(event.target.value); setSaved(false); }} className={inputClass}>
                {TYPES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </div>
            <button type="button" onClick={addRequirement} className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-xs font-medium sm:mt-4 ${name.trim() && level && type ? 'bg-[#ed9635] text-white hover:bg-[#d98223]' : 'bg-[#cbc3b2] text-[#737d85]'}`}>
              Agregar
            </button>
          </div>
          <div className="mt-11 flex flex-col gap-3 rounded-lg border border-[#ded6c9] bg-[#f7f5f0] px-3.5 py-2 sm:min-h-[62px] sm:flex-row sm:items-start sm:gap-6">
          <p className="shrink-0 text-[11px] font-semibold leading-7 sm:w-36">Requisitos actuales</p>
          <ul className="flex min-w-0 flex-wrap gap-3" aria-label="Requisitos actuales">
            {draft.requirements.map((item, index) => (
              <li key={`${index}-${item.name}`} className={`group inline-flex min-h-6 min-w-28 max-w-full items-center justify-center gap-1 rounded-full py-1 pl-4 pr-1 text-[10px] font-semibold leading-4 ${normalize(item.name) === 'excel' ? 'bg-[#fff0db] text-[#b84c27]' : 'bg-[#e8eff6] text-[#263747]'}`}>
                <span className="min-w-0 flex-1 break-words text-center">{item.name}<span className="sr-only"> · {item.level} · {item.type}</span></span>
                <button type="button" aria-label={`Quitar requisito ${item.name}`} onClick={() => { changeDraft({ ...draft, requirements: draft.requirements.filter((_, position) => position !== index) }); setRequirementError(''); }} className="shrink-0 rounded-full p-0.5 opacity-60 hover:bg-white/60 hover:opacity-100 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100"><X size={11} aria-hidden="true" /></button>
              </li>
            ))}
          </ul>
          </div>
          {draft.requirements.length === 0 && <p role="alert" className="mt-2 text-sm text-red-600">Agrega al menos un requisito antes de guardar.</p>}
          {name.trim() && <p className="mt-3 text-xs text-gray-500">Pulsa Agregar o limpia el nuevo requisito antes de guardar los cambios.</p>}
        </fieldset>
        </div>

        <div className="mt-2 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button ref={discardButtonRef} type="button" disabled={!dirty} onClick={() => setConfirmDiscard(true)} className="h-10 rounded-md border border-[#ded6c9] px-5 text-xs font-medium text-[#555e67] hover:bg-white/50 disabled:border-transparent disabled:bg-[#cbc3b2] disabled:text-[#737d85] disabled:opacity-100! sm:min-w-36">Descartar cambios</button>
          <button type="submit" disabled={!dirty || !valid || Boolean(name.trim())} className="inline-flex h-10 items-center justify-center rounded-md bg-[#ed9635] px-5 text-xs font-medium text-white hover:bg-[#d98223] disabled:bg-[#cbc3b2] disabled:text-[#737d85] disabled:opacity-100! sm:min-w-40">Guardar cambios</button>
        </div>
      </form>

      <dialog ref={dialogRef} aria-labelledby="discard-title" aria-describedby="discard-description discard-message" onCancel={() => setConfirmDiscard(false)} onClose={() => { setConfirmDiscard(false); discardButtonRef.current?.focus(); }} className="fixed inset-0 m-auto max-h-[calc(100svh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[550px] overflow-y-auto rounded-[14px] border-0 bg-white px-7 pb-5 pt-6 text-[#172A3A] shadow-[0_12px_28px_rgba(23,42,58,0.22)] backdrop:bg-[#17212b]/40">
        <span className="inline-flex min-h-6 items-center rounded-full bg-[#FFF1DE] px-3 text-[10px] font-semibold leading-4 text-[#a9462f]">Cambios sin guardar</span>
        <h2 id="discard-title" className="mt-4 text-[22px] font-bold leading-7">¿Descartar los cambios?</h2>
        <p id="discard-description" className="mt-3 text-xs leading-[18px] text-[#75818c]">Los cambios realizados en esta vacante todavía no se guardaron.</p>
        <p id="discard-message" className="mt-[30px] flex min-h-16 items-center rounded-lg border border-[#E4DACD] bg-[#FAF7F1] px-4 py-4 text-xs leading-[18px] text-[#172A3A]">Si continúas, se conservará la última versión guardada.</p>
        <div className="mt-8 flex flex-col gap-3 sm:mt-[46px] sm:flex-row sm:justify-end">
          <button type="button" onClick={() => setConfirmDiscard(false)} className="inline-flex h-[38px] items-center justify-center rounded-md border border-[#E4DACD] bg-white px-4 text-xs font-semibold text-[#172A3A] hover:bg-[#FAF7F1] sm:w-[140px]">Seguir editando</button>
          <button type="button" onClick={discardChanges} className="inline-flex h-[38px] items-center justify-center rounded-md border border-transparent bg-[#BE4D3F] px-4 text-xs font-semibold text-white hover:bg-[#a94034] sm:w-[140px]">Descartar</button>
        </div>
      </dialog>
    </>
  );
}
