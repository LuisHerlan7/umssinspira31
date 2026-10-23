import type { Metadata } from 'next';
import { Suspense } from 'react';
import DetalleVacanteCliente from './DetalleVacanteCliente';
import { boardStyles as styles } from '../components/jobs-styles';

export const instant = false;

export const metadata: Metadata = {
  title: 'Detalle de vacante | UMSSPIRA',
};

export default async function DetalleVacantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <div className={styles.content}><p role="status">Cargando detalle de la vacante...</p></div>
        </main>
      }
    >
      <DetalleVacanteCliente id={id} />
    </Suspense>
  );
}
