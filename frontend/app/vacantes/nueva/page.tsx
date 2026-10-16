'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VacancyAdminFooter from '../components/VacancyAdminFooter';
import { configuredCompanyId, configuredCompanyName, createVacancy } from '../../../lib/api/vacantes';

const AREAS = ['Desarrollo de Software', 'Datos y Analítica', 'Infraestructura y Soporte', 'Ciberseguridad', 'Gestión de Proyectos', 'Otra área'];
const LEVELS = ['Básico', 'Intermedio', 'Avanzado'];
const TYPES = ['Obligatorio', 'Deseable'];
type Requirement = { name: string; level: string; type: string; description: string };

const field = 'mt-2 h-[46px] w-full rounded-[7px] border border-[#ddd6c8] bg-white px-[14px] text-[13px] text-[#1b2632] outline-none focus:border-[#ffb162]';
const label = 'block text-[11px] font-semibold text-[#1b2632]';

export default function NuevaVacantePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [modality, setModality] = useState('');
  const [conditions, setConditions] = useState('');
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [draft, setDraft] = useState<Requirement>({ name: '', level: '', type: '', description: '' });
  const [editing, setEditing] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const company = configuredCompanyName || 'Empresa registrada';
  const canContinue = Boolean(title.trim() || area || description.trim());
  const canAdd = Boolean(draft.name.trim() && draft.level && draft.type);
  const identifier = 'Se asignará al guardar';

  function continueToRequirements() {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'El nombre del cargo es obligatorio.';
    if (!area) next.area = 'Selecciona un área profesional.';
    if (!description.trim()) next.description = 'La descripción breve es obligatoria.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setNotice('Datos completos');
    setStep(2);
  }

  function saveRequirement() {
    const normalized = draft.name.trim().toLocaleLowerCase('es');
    const duplicate = requirements.some((item, index) => index !== editing && item.name.trim().toLocaleLowerCase('es') === normalized);
    if (duplicate) {
      setErrors({ requirement: `${draft.name.trim()} ya fue agregado a esta vacante.` });
      return;
    }
    if (!canAdd) return;
    setRequirements((current) => editing == null ? [...current, { ...draft, name: draft.name.trim() }] : current.map((item, index) => index === editing ? { ...draft, name: draft.name.trim() } : item));
    setDraft({ name: '', level: '', type: '', description: '' });
    setEditing(null);
    setErrors({});
    setNotice(editing == null ? 'Requisito agregado' : 'Requisito actualizado');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!requirements.length) return;
    if (!configuredCompanyId) {
      setSaveError('No se configuró la empresa que registrará la vacante.');
      return;
    }
    if (!location.trim() || !modality || !conditions.trim()) {
      setSaveError('Completa ubicación, modalidad y condiciones antes de guardar.');
      return;
    }
    try {
      setIsSaving(true);
      const vacancy = await createVacancy({
        idEmpresa: configuredCompanyId,
        titulo: title.trim(),
        modalidad: modality,
        descripcion: description.trim(),
        ubicacion: location.trim(),
        area,
        condiciones: conditions.trim(),
        requisitos: requirements.map((item) => item.name),
      });
      router.push(`/vacantes/${encodeURIComponent(vacancy.id)}/confirmacion`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No se pudo guardar la vacante.');
    } finally { setIsSaving(false); }
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-[#eee9df] text-[#1b2632]">
      <main className="mx-auto min-h-[890px] max-w-[1440px] px-5 pb-[14px] pt-5 sm:px-8 lg:px-14">
        <p className="text-xs text-[#7a858d]">Mis vacantes / Nueva vacante{step === 2 ? ' / ' : ''}<span className="font-medium text-[#1b2632]">{step === 2 ? 'Requisitos técnicos' : ''}</span></p>
        <h1 className="mt-6 text-[30px] font-bold leading-none">{step === 1 ? 'Datos de la vacante' : 'Requisitos técnicos'}</h1>
        <p className="mt-3 text-sm text-[#6e7880]">{step === 1 ? 'Completa la información principal de la oportunidad laboral.' : 'Define las competencias y el nivel esperado para el puesto.'}</p>

        {notice && <div className="mt-[76px] flex h-[52px] items-center gap-4 rounded-[10px] border border-[#2f7a5d] bg-[#e7f3ed] px-5 text-[#2f7a5d]"><Check size={20} strokeWidth={3}/><div><p className="text-sm font-bold">{notice}</p><p className="text-[11px] font-medium">{notice === 'Datos completos' ? 'La información principal está lista.' : 'El requisito se guardó correctamente.'}</p></div></div>}

        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); continueToRequirements(); }} className={notice ? 'mt-1' : 'mt-[76px]'}>
            <section className="flex min-h-[86px] flex-col items-start justify-center gap-3 rounded-xl bg-[#2c3b4d] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div><p className="text-[10px] font-bold text-[#ffb162]">EMPRESA ASOCIADA</p><p className="mt-2 text-lg font-semibold">{company}</p></div>
              <span className="rounded-full bg-[#e7f3ed] px-8 py-2 text-[11px] font-bold text-[#2f7a5d]">Empresa verificada</span>
            </section>
            <section className="mt-[22px] rounded-2xl border border-[#ddd6c8] bg-white p-7">
              <h2 className="text-xl font-bold">Información de la oportunidad</h2>
              <p className="mt-2 text-xs text-[#6e7880]">Corrige los campos marcados para continuar.</p>
              <div className="mt-9 grid gap-x-10 gap-y-9 md:grid-cols-2">
                <label className={`${label} ${errors.title ? 'text-[#b34a3d]' : ''}`}>Nombre del cargo *<input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Ej. Analista de Datos Junior" className={`${field} ${errors.title ? 'border-[1.5px] border-[#b34a3d]' : ''}`}/>{errors.title && <span className="mt-1.5 block font-medium text-[#b34a3d]">{errors.title}</span>}</label>
                <label className={label}>Área profesional *<select value={area} onChange={(e)=>setArea(e.target.value)} className={field}><option value="">Selecciona un área</option>{AREAS.map((v)=><option key={v}>{v}</option>)}</select></label>
                <label className={label}>Código de vacante *<input readOnly value={identifier} className={`${field} bg-[#f8f5ef]`}/><span className="mt-1.5 block font-normal text-[#6e7880]">Se muestra solo como referencia.</span></label>
                <div className="grid grid-cols-2 gap-6"><label className={label}>Estado *<input readOnly value="Disponible" className={field}/></label><label className={label}>Empresa *<input readOnly value={company} className={`${field} bg-[#f8f5ef]`}/></label></div>
                <label className={`${label} md:col-span-2`}>Descripción breve *<input value={description} maxLength={300} onChange={(e)=>setDescription(e.target.value)} className={field}/><span className="mt-1.5 flex justify-between font-normal text-[#6e7880]"><span>Máximo 300 caracteres.</span><span>{description.length} / 300</span></span></label>
              </div>
              <details className="mt-5 rounded-lg border border-[#ddd6c8] bg-[#f8f5ef] px-4 py-3 text-xs"><summary className="cursor-pointer font-semibold">Datos complementarios requeridos</summary><div className="mt-4 grid gap-4 md:grid-cols-3"><label className={label}>Ubicación *<input value={location} onChange={(e)=>setLocation(e.target.value)} className={field}/></label><label className={label}>Modalidad *<select value={modality} onChange={(e)=>setModality(e.target.value)} className={field}><option value="">Selecciona</option><option>Presencial</option><option>Híbrido</option><option>Remoto</option></select></label><label className={label}>Condiciones *<input value={conditions} onChange={(e)=>setConditions(e.target.value)} className={field}/></label></div></details>
            </section>
            <div className="mt-[10px] flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4"><Link href="/mis-vacantes" className="flex h-11 w-full items-center justify-center rounded-[7px] border border-[#ddd6c8] bg-white text-[13px] font-semibold sm:w-[140px]">Cancelar</Link><button type="submit" disabled={!canContinue} className="h-11 w-full rounded-[7px] bg-[#ffb162] text-[13px] font-semibold disabled:bg-[#c9c1b1] disabled:text-[#6e7880] sm:w-[184px]">Continuar</button></div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={notice ? 'mt-1' : 'mt-[76px]'}>
            <section className="flex min-h-[82px] flex-col items-start justify-center gap-3 rounded-xl bg-[#2c3b4d] px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="min-w-0"><p className="break-words text-[11px] font-bold text-[#ffb162]">{identifier}</p><p className="mt-2 break-words text-lg font-semibold">{title}</p></div><span className="min-w-36 rounded-full bg-[#eaf0f7] px-6 py-2 text-center text-[11px] font-bold text-[#2c3b4d]">{requirements.length} requisitos</span></section>
            <div className="mt-[22px] grid gap-6 lg:grid-cols-[540px_1fr]">
              <section className="rounded-2xl border border-[#ddd6c8] bg-white p-5 sm:p-7"><h2 className="text-xl font-bold">Agregar requisito</h2><p className="mt-2 text-xs text-[#6e7880]">Completa todos los campos antes de añadirlo.</p><div className="mt-9 space-y-8"><label className={`${label} ${errors.requirement?'text-[#b34a3d]':''}`}>Competencia técnica *<input value={draft.name} onChange={(e)=>setDraft({...draft,name:e.target.value})} className={`${field} ${errors.requirement?'border-[#b34a3d]':''}`}/>{errors.requirement&&<span className="mt-1.5 block text-[#b34a3d]">{errors.requirement}</span>}</label><div className="grid gap-6 sm:grid-cols-2"><label className={label}>Nivel esperado *<select value={draft.level} onChange={(e)=>setDraft({...draft,level:e.target.value})} className={field}><option value="">Selecciona un nivel</option>{LEVELS.map(v=><option key={v}>{v}</option>)}</select></label><label className={label}>Tipo *<select value={draft.type} onChange={(e)=>setDraft({...draft,type:e.target.value})} className={field}><option value="">Selecciona un tipo</option>{TYPES.map(v=><option key={v}>{v}</option>)}</select></label></div><label className={label}>Descripción opcional<input value={draft.description} onChange={(e)=>setDraft({...draft,description:e.target.value})} className={field}/><span className="mt-1.5 block font-normal text-[#6e7880]">Ayuda a aclarar el requisito.</span></label></div><button type="button" onClick={saveRequirement} disabled={!canAdd} className="mt-7 ml-auto block h-11 w-full rounded-[7px] bg-[#ffb162] text-[13px] font-semibold disabled:bg-[#c9c1b1] disabled:text-[#6e7880] sm:w-[220px]">{editing == null?'Agregar requisito':'Guardar cambios'}</button></section>
              <section className="min-h-[516px] rounded-2xl border border-[#ddd6c8] bg-white p-5 sm:p-7"><h2 className="text-xl font-bold">Requisitos agregados</h2><p className="mt-2 text-xs text-[#6e7880]">Puedes editar o quitar requisitos antes de continuar.</p>{requirements.length===0?<div className="mt-11 flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-[#ddd6c8] bg-[#f8f5ef] px-4 text-center"><p className="text-lg font-semibold">Aún no agregaste requisitos</p><p className="mt-5 text-[13px] text-[#6e7880]">Agrega la primera competencia técnica para esta vacante.</p></div>:<ul className="mt-7 space-y-4">{requirements.map((item,index)=><li key={`${item.name}-${index}`} className={`grid min-h-[62px] gap-3 rounded-[10px] px-[18px] py-4 text-xs sm:grid-cols-[1fr_110px_120px_58px] sm:items-center lg:grid-cols-[1fr_140px_146px_58px] ${item.type==='Deseable'?'bg-[#fff0db]':'bg-[#eaf0f7]'}`}><strong className="break-words text-sm">{item.name}</strong><span className="text-[#6e7880]">{item.level}</span><span className={`w-fit rounded-full px-3 py-2 text-center text-[11px] font-bold ${item.type==='Deseable'?'text-[#a35139]':'text-[#2c3b4d]'}`}>{item.type}</span><button type="button" onClick={()=>{setDraft(item);setEditing(index);setNotice('');}} className="flex items-center gap-1 font-semibold"><Pencil size={12}/>Editar</button></li>)}</ul>}<p className="mt-7 rounded-[9px] border border-[#c9c1b1] bg-[#f8f5ef] px-[18px] py-5 text-xs text-[#6e7880]">No se permiten requisitos duplicados en una misma vacante.</p></section>
            </div>
            {saveError&&<p role="alert" className="mt-3 rounded-lg border border-[#b34a3d] bg-[#fbeae7] p-3 text-xs text-[#b34a3d]">{saveError}</p>}
            <div className="mt-[10px] flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4"><button type="button" onClick={()=>{setStep(1);setNotice('');}} className="h-11 w-full rounded-[7px] border border-[#ddd6c8] bg-white text-[13px] font-semibold sm:w-[140px]">Atrás</button><button type="submit" disabled={!requirements.length||isSaving} className="h-11 w-full rounded-[7px] bg-[#ffb162] text-[13px] font-semibold disabled:bg-[#c9c1b1] disabled:text-[#6e7880] sm:w-[184px]">{isSaving?'Guardando...':'Guardar requisitos'}</button></div>
          </form>
        )}
      </main>
      <VacancyAdminFooter />
    </div>
  );
}
