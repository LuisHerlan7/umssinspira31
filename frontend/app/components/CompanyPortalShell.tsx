import type { ReactNode } from 'react';

export default function CompanyPortalShell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className ? `${className} ` : ''}flex min-h-[calc(100svh-78px)] flex-col bg-[#eeeae1]`}>
      {children}
      <footer className="mt-auto border-t border-[#e2ded4] px-5 py-3 text-[10px] leading-[18px] text-[#7b858e] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p>Universidad Mayor de San Simón | UMSS Vinculación Laboral</p>
          <div className="flex items-center gap-2"><span>Ayuda</span><span aria-hidden="true">·</span><span>Privacidad</span></div>
        </div>
      </footer>
    </div>
  );
}
