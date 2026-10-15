import type { Metadata } from 'next';
import { Suspense } from 'react';
import EditarVacanteCliente from './EditarVacanteCliente';
import CompanyPortalShell from '../../../components/CompanyPortalShell';
import './editar-vacante.css';

export const metadata: Metadata = {
  title: 'Editar vacante | UMSSPIRA',
};

async function VacancyEditorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditarVacanteCliente key={id} id={id} />;
}

export default function EditarVacantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <CompanyPortalShell className="hu5-company-editor">
      <Suspense fallback={
        <main className="flex-1 bg-[#eeeae1] px-5 py-10">
          <p className="mx-auto max-w-4xl text-sm text-gray-600">Cargando vacante...</p>
        </main>
      }>
        <VacancyEditorRoute params={params} />
      </Suspense>
    </CompanyPortalShell>
  );
}
