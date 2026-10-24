
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  X,
  BriefcaseBusiness,
  CheckCircle2,
  CircleX,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type Estado = "Disponible" | "No disponible";

type Vacante = {
  id: number;
  codigo: string;
  titulo: string;
  estado: Estado;
};

const datosIniciales: Vacante[] = [
  { id: 1, codigo: "VAC-2026-047", titulo: "Analista de Datos Junior", estado: "Disponible" },
  { id: 2, codigo: "VAC-2026-048", titulo: "Backend Developer", estado: "Disponible" },
  { id: 3, codigo: "VAC-2026-049", titulo: "QA Engineer", estado: "Disponible" },
  { id: 4, codigo: "VAC-2026-050", titulo: "Data Engineer", estado: "No disponible" },
];

export default function DisponibilidadVacantesPage() {
  const [vacantes, setVacantes] = useState(datosIniciales);
  const [filtro, setFiltro] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [seleccionada, setSeleccionada] = useState<Vacante | null>(null);

  const activas = vacantes.filter(
    (v) => v.estado === "Disponible"
  ).length;

  const filtradas = useMemo(() => {
    return vacantes.filter((v) => {
      const coincideEstado =
        filtro === "Todas" || v.estado === filtro;

      const texto = `${v.codigo} ${v.titulo}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());

      return coincideEstado && coincideBusqueda;
    });
  }, [vacantes, filtro, busqueda]);

  function confirmarCambio() {
    if (!seleccionada) return;

    setVacantes((actuales) =>
      actuales.map((v) =>
        v.id === seleccionada.id
          ? {
              ...v,
              estado:
                v.estado === "Disponible"
                  ? "No disponible"
                  : "Disponible",
            }
          : v
      )
    );

    setSeleccionada(null);
  }

  return (
    <main className="min-h-screen bg-[#f4f2ec] text-slate-800">
      <header className="flex items-center justify-between bg-[#071b31] px-5 py-3 text-white md:px-8">
        <div className="flex items-center gap-2 font-bold">
          <span className="text-amber-400">◆</span>
          UMSS<span className="text-orange-400">PIRA</span>
        </div>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <span>Inicio</span>
          <span className="border-b-2 border-orange-400 pb-1">
            Mis vacantes
          </span>
          <span>Postulantes</span>
          <span>Mi empresa</span>
        </nav>

        <div className="flex items-center gap-4">
          <Search size={17} />
          <MessageSquare size={17} />
          <Bell size={17} />
          <span className="hidden text-sm sm:block">
            TecnoAndes S.R.L.
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-7 md:px-8">
        <div>
          <p className="text-xs text-slate-500">
            Mis vacantes / Disponibilidad
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            Disponibilidad de vacantes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Administra el estado de tus oportunidades laborales.
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Resumen titulo="Registradas" valor={vacantes.length} />
          <Resumen titulo="Disponibles" valor={activas} verde />
          <Resumen
            titulo="No disponibles"
            valor={vacantes.length - activas}
            rojo
          />

          <div className="rounded-xl bg-[#172b43] p-4 text-white">
            <p className="text-sm font-semibold">
              <ShieldCheck className="mr-2 inline" size={17} />
              Visibilidad en la bolsa
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Solo las vacantes disponibles deben formar parte
              del conjunto activo de oportunidades.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Mis vacantes</h2>
              <p className="mt-1 text-sm text-slate-500">
                Gestiona la disponibilidad de cada oportunidad.
              </p>
            </div>

            <label className="text-sm">
              <span className="mb-1 block text-slate-500">
                Filtrar por estado
              </span>
              <span className="relative block">
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 sm:w-52"
                >
                  <option>Todas</option>
                  <option>Disponible</option>
                  <option>No disponible</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-3"
                  size={15}
                />
              </span>
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            {[
              ["Todas", vacantes.length],
              ["Disponible", activas],
              ["No disponible", vacantes.length - activas],
            ].map(([nombre, cantidad]) => (
              <button
                key={nombre}
                onClick={() => setFiltro(String(nombre))}
                className={`rounded-lg px-3 py-2 ${
                  filtro === nombre
                    ? "bg-slate-100 font-semibold"
                    : "bg-white text-slate-500"
                }`}
              >
                {nombre} ({cantidad})
              </button>
            ))}
          </div>

          <label className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre de vacante..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <div className="space-y-2">
            {filtradas.map((vacante) => {
              const disponible = vacante.estado === "Disponible";

              return (
                <article
                  key={vacante.id}
                  className="flex flex-col justify-between gap-3 rounded-lg border border-slate-100 p-4 hover:bg-slate-50 md:flex-row md:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-orange-600">
                      {vacante.codigo}
                    </p>
                    <p className="mt-1 font-medium">
                      {vacante.titulo}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        disponible
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {disponible ? (
                        <CheckCircle2
                          className="mr-1 inline"
                          size={13}
                        />
                      ) : (
                        <CircleX
                          className="mr-1 inline"
                          size={13}
                        />
                      )}
                      {vacante.estado}
                    </span>

                    <span className="hidden text-xs text-slate-500 lg:block">
                      {disponible
                        ? "Visible en bolsa"
                        : "Oculta en bolsa"}
                    </span>

                    <button
                      onClick={() => setSeleccionada(vacante)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:border-blue-400 hover:bg-blue-50"
                    >
                      {disponible
                        ? "Cambiar estado"
                        : "Reactivar"}
                    </button>
                  </div>
                </article>
              );
            })}

            {filtradas.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-500">
                No se encontraron vacantes con estos filtros.
              </div>
            )}
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-xs leading-5 text-orange-800">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <p>
              La exclusión del conjunto activo no debe eliminar el
              registro persistido. El índice de búsqueda debe
              sincronizarse con el estado de la fuente de datos.
            </p>
          </div>
        </section>
      </div>

      {seleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmacion"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <span className="rounded bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                  {seleccionada.codigo}
                </span>
                <h2
                  id="titulo-confirmacion"
                  className="mt-3 text-lg font-bold"
                >
                  {seleccionada.estado === "Disponible"
                    ? "¿Marcar la vacante como no disponible?"
                    : "¿Reactivar esta vacante?"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {seleccionada.titulo}
                </p>
              </div>

              <button
                onClick={() => setSeleccionada(null)}
                aria-label="Cerrar modal"
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
              {seleccionada.estado === "Disponible"
                ? "La vacante dejará de formar parte del conjunto activo. Su registro persistido deberá conservarse para trazabilidad."
                : "La vacante podrá volver al conjunto activo una vez que el sistema fuente confirme que está habilitada para procesamiento."}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSeleccionada(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCambio}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                {seleccionada.estado === "Disponible"
                  ? "Marcar no disponible"
                  : "Reactivar vacante"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Resumen({
  titulo,
  valor,
  verde = false,
  rojo = false,
}: {
  titulo: string;
  valor: number;
  verde?: boolean;
  rojo?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{titulo}</p>
      <p
        className={`mt-2 text-3xl font-bold ${
          rojo ? "text-red-600" : verde ? "text-emerald-600" : ""
        }`}
      >
        {valor}
      </p>
    </div>
  );
}
