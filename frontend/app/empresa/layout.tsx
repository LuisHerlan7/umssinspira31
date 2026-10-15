import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import CompanyPortalShell from '../components/CompanyPortalShell';

export const metadata: Metadata = {
  title: 'Portal empresa | UMSSPIRA',
};

export default function EmpresaLayout({ children }: { children: ReactNode }) {
  return <CompanyPortalShell>{children}</CompanyPortalShell>;
}
