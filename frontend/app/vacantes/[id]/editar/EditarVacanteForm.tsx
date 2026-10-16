'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getVacancy,
  updateVacancy,
} from '../../../../lib/api/vacantes';
import {
  crearPayloadActualizacion,
  crearVacanteEditable,
  requisitoDuplicado,
  validarVacante,
  type EstadoEdicion,
  type VacanteEditable,
} from './vacante-edicion';

type Props = {
  id: string;
};

const estiloCampo =
  'mt-2 h-[46px] w-full rounded-[7px] border border-[#ddd6c8] bg-white px-[14px] text-[13px] text-[#1b2632] outline-none focus:border-[#ffb162]';

const estiloEtiqueta = 'block text-[11px] font-semibold text-[#1b2632]';

function clonarVacante(vacante: VacanteEditable): VacanteEditable {
  return { ...vacante, requisitos: [...vacante.requisitos] };
}

export default function EditarVacanteForm({ id }: Props) {
  const [vacante, setVacante] = useState<VacanteEditable | null>(null);
  const [original, setOriginal] = useState<VacanteEditable | null>(null);
  const [requisitoNuevo, setRequisitoNuevo] = useState('');
  const [estadoPantalla, setEstadoPantalla] =
    useState<EstadoEdicion>('cargando');
  const [mensajeError, setMensajeError] = useState('');

  useEffect(() => {
    let active = true;

    getVacancy(id)
      .then((persistida) => {
        if (!active) return;
        const editable = crearVacanteEditable(persistida);
        setVacante(editable);
        setOriginal(clonarVacante(editable));
        setEstadoPantalla('inicial');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMensajeError(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar la vacante.',
        );
        setEstadoPantalla('error');
      });

    return () => {
      active = false;
    };
  }, [id]);

  const hayCambios =
    vacante !== null &&
    original !== null &&
    JSON.stringify(vacante) !== JSON.stringify(original);

  function actualizarVacante(cambios: Partial<VacanteEditable>) {
    setVacante((actual) => (actual ? { ...actual, ...cambios } : actual));
    setEstadoPantalla('pendiente');
    setMensajeError('');
  }

  function agregarRequisito() {
    if (!vacante) return;
    const nombre = requisitoNuevo.trim();

    if (nombre.length < 1 || nombre.length > 100) {
      setMensajeError('Ingresa un requisito técnico válido.');
      setEstadoPantalla('error');
      return;
    }

    if (requisitoDuplicado(vacante.requisitos, nombre)) {
      setMensajeError('Este requisito ya está asociado a la vacante.');
      setEstadoPantalla('error');
      return;
    }

    actualizarVacante({ requisitos: [...vacante.requisitos, nombre] });
    setRequisitoNuevo('');
  }

  function eliminarRequisito(nombre: string) {
    if (!vacante) return;
    actualizarVacante({
      requisitos: vacante.requisitos.filter(
        (requisito) => requisito !== nombre,
      ),
    });
  }

  async function guardarCambios() {
    if (!vacante || !hayCambios) return;
    const validationError = validarVacante(vacante);

    if (validationError) {
      setMensajeError(validationError);
      setEstadoPantalla('error');
      return;
    }

    setEstadoPantalla('guardando');
    setMensajeError('');

    try {
      const persistida = await updateVacancy(
        vacante.id,
        crearPayloadActualizacion(vacante),
      );
      const editable = crearVacanteEditable(persistida);
      setVacante(editable);
      setOriginal(clonarVacante(editable));
      setRequisitoNuevo('');
      setEstadoPantalla('guardado');
    } catch (error) {
      setMensajeError(
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la vacante.',
      );
      setEstadoPantalla('error');
    }
  }

  function descartarCambios() {
    if (!original) return;
    setVacante(clonarVacante(original));
    setRequisitoNuevo('');
    setEstadoPantalla('inicial');
    setMensajeError('');
  }

  if (estadoPantalla === 'cargando') {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#f3efe7] px-5 py-12 text-slate-800">
        <p role="status" className="mx-auto max-w-6xl text-sm text-slate-600">
          Cargando datos de la vacante...
        </p>
      </main>
    );
  }

  if (!vacante) {
    return (
      <main className="min-h-[calc(100vh-76px)] bg-[#f3efe7] px-5 py-12 text-slate-800">
        <section className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold">No se pudo cargar la vacante</h1>
          <p role="alert" className="mt-3 text-sm text-red-700">
            {mensajeError}
          </p>
          <Link
            href="/vacantes"
            className="mt-6 inline-flex rounded-md border border-stone-300 bg-white px-5 py-3 text-xs font-semibold"
          >
            Volver a vacantes
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-84px)] bg-[#eee9df] text-[#1b2632]">
      <div className="mx-auto max-w-[1440px] px-5 pb-4 pt-5 sm:px-8 lg:px-14">
        <p className="text-xs text-slate-500">
          Mis vacantes / Detalles de vacante / Editar
        </p>

        <h1 className="mt-6 text-[30px] font-bold leading-none">Editar vacante</h1>
        <p className="mt-3 text-sm text-[#6e7880]">
          Actualiza los datos de la oportunidad y guarda los cambios.
        </p>

        {estadoPantalla === 'error' ? (
          <div
            role="alert"
            className="mt-7 rounded-md border border-orange-300 bg-[#fff0df] px-5 py-4 text-xs text-orange-800"
          >
            <p className="font-bold">Cambios sin guardar</p>
            <p className="mt-1">{mensajeError}</p>
          </div>
        ) : null}

        {estadoPantalla === 'pendiente' ? (
          <div
            role="status"
            className="mt-7 rounded-md border border-orange-300 bg-[#fff0df] px-5 py-4 text-xs text-orange-800"
          >
            <p className="font-bold">Cambios pendientes</p>
            <p className="mt-1">Confirma y guarda los cambios.</p>
          </div>
        ) : null}

        {estadoPantalla === 'guardado' ? (
          <div
            role="status"
            className="mt-7 rounded-md border border-emerald-300 bg-[#e5f4eb] px-5 py-4 text-xs text-emerald-800"
          >
            <p className="font-bold">Cambios guardados correctamente</p>
            <p className="mt-1">
              La vacante persistida y su documento de búsqueda están actualizados.
            </p>
          </div>
        ) : null}

        <section className="mt-16 rounded-2xl border border-[#ddd6c8] bg-white p-5 sm:mt-[118px] sm:p-7">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-bold">Información editable</h2>
            <span className="rounded-full bg-slate-100 px-4 py-1 text-xs text-slate-600">
              {estadoPantalla === 'guardando' ? 'Guardando...' : 'Editando'}
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <label className={estiloEtiqueta}>
              Nombre del cargo <span className="text-red-500">*</span>
              <input
                className={estiloCampo}
                maxLength={150}
                value={vacante.titulo}
                onChange={(event) =>
                  actualizarVacante({ titulo: event.target.value })
                }
              />
            </label>

            <label className={estiloEtiqueta}>
              Modalidad <span className="text-red-500">*</span>
              <input
                className={estiloCampo}
                maxLength={50}
                value={vacante.modalidad}
                onChange={(event) =>
                  actualizarVacante({ modalidad: event.target.value })
                }
              />
            </label>

            <label className={estiloEtiqueta}>
              Estado
              <input
                className={`${estiloCampo} bg-stone-100`}
                value={vacante.estado}
                readOnly
              />
              <span className="mt-1 block font-normal text-slate-400">
                El catálogo oficial de estados se gestiona por separado.
              </span>
            </label>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className={estiloEtiqueta}>
              Ubicación <span className="text-red-500">*</span>
              <input
                className={estiloCampo}
                maxLength={120}
                value={vacante.ubicacion}
                onChange={(event) =>
                  actualizarVacante({ ubicacion: event.target.value })
                }
              />
            </label>

            <label className={estiloEtiqueta}>
              Área <span className="text-red-500">*</span>
              <input
                className={estiloCampo}
                maxLength={100}
                value={vacante.area}
                onChange={(event) =>
                  actualizarVacante({ area: event.target.value })
                }
              />
            </label>
          </div>

          <label className={`${estiloEtiqueta} mt-6`}>
            Descripción <span className="text-red-500">*</span>
            <textarea
              rows={4}
              maxLength={4000}
              className={estiloCampo}
              value={vacante.descripcion}
              onChange={(event) =>
                actualizarVacante({ descripcion: event.target.value })
              }
            />
          </label>

          <label className={`${estiloEtiqueta} mt-6`}>
            Condiciones
            <textarea
              rows={3}
              maxLength={2000}
              className={estiloCampo}
              value={vacante.condiciones}
              onChange={(event) =>
                actualizarVacante({ condiciones: event.target.value })
              }
            />
          </label>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end">
            <label className={`${estiloEtiqueta} flex-1`}>
              Nuevo requisito <span className="text-red-500">*</span>
              <input
                className={estiloCampo}
                maxLength={100}
                placeholder="Ej. SQL"
                value={requisitoNuevo}
                onChange={(event) => setRequisitoNuevo(event.target.value)}
              />
            </label>

            <button
              type="button"
              onClick={agregarRequisito}
              className="h-[46px] w-full rounded-md bg-[#c9c2b3] px-5 text-sm font-semibold text-white hover:bg-[#aea594] sm:w-auto"
            >
              Agregar
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 rounded-md bg-[#f5f2ec] px-4 py-4">
            <span className="mr-3 text-xs font-bold">Requisitos actuales</span>
            {vacante.requisitos.length === 0 ? (
              <span className="text-xs text-red-600">
                No hay requisitos registrados.
              </span>
            ) : null}
            {vacante.requisitos.map((requisito) => (
              <button
                type="button"
                key={requisito.toLowerCase()}
                onClick={() => eliminarRequisito(requisito)}
                title={`Quitar ${requisito}`}
                className="rounded-full bg-[#e5edf5] px-4 py-1.5 text-xs font-medium text-[#335875]"
              >
                {requisito} ×
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={descartarCambios}
            disabled={!hayCambios || estadoPantalla === 'guardando'}
            className="rounded-md border border-stone-300 bg-white px-5 py-3 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-slate-400"
          >
            Descartar cambios
          </button>

          <button
            type="button"
            onClick={guardarCambios}
            disabled={!hayCambios || estadoPantalla === 'guardando'}
            className="rounded-md bg-orange-400 px-6 py-3 text-xs font-bold text-slate-900 hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-[#c9c2b3] disabled:text-white"
          >
            {estadoPantalla === 'guardando'
              ? 'Guardando cambios...'
              : 'Guardar cambios'}
          </button>
        </div>

        <footer className="mt-8 flex justify-between border-t border-stone-200 pt-4 text-[10px] text-slate-400">
          <span>UMSS Inspira · Gestión de oportunidades laborales</span>
          <span>Ayuda · Privacidad</span>
        </footer>
      </div>
    </main>
  );
}
