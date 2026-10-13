import { Suspense } from 'react';
import DetalleVacanteCliente from './DetalleVacanteCliente';
import Link from 'next/link';

export const instant = false;

export default async function DetalleVacantePage({
params,
}: {
params: Promise<{ id: string }>;
}) {
const { id } = await params;

return (
<Suspense
fallback={ <main className="min-h-screen bg-[#f1eee4] px-5 py-10"> <p className="text-center text-gray-600">
Cargando detalle de la vacante... </p> <div className="mx-auto mb-6 flex max-w-6xl flex-wrap gap-3">
  <Link
    href="/vacantes"
    className="rounded-lg bg-orange-400 px-4 py-2 font-semibold text-white"
  >
    Ver vacantes
  </Link>

  <Link
    href="/postulaciones"
    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
  >
    Mis postulaciones
  </Link>
</div> </main>
}
> <DetalleVacanteCliente id={id} /> </Suspense>
);
}
