
'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, GraduationCap, Search } from 'lucide-react';

const navigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Vacantes', href: '/vacantes' },
  { label: 'Mis postulaciones', href: '/postulaciones' },
  { label: 'Perfil', href: '/perfil/experiencia-laboral' },
];

function NavigationLinks({ pathname }: { pathname?: string | null }) {
  return navigation.map((item) => {
    const active =
      pathname != null &&
      (item.href === '/'
        ? pathname === '/'
        : pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.href === '/perfil/experiencia-laboral' &&
            (pathname.startsWith('/profile/experience') ||
              pathname.startsWith('/skills') ||
              pathname.startsWith('/perfil/formacion'))));

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`border-b-2 px-3 py-3 text-sm transition-colors sm:px-4 ${
          active
            ? 'border-[#ed9635] font-bold text-[#17384b]'
            : 'border-transparent text-gray-600 hover:text-[#17384b]'
        }`}
      >
        {item.label}
      </Link>
    );
  });
}

function ActiveNavigationLinks() {
  const pathname = usePathname();
  return <NavigationLinks pathname={pathname} />;
}

function StandardHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e0d4] bg-white">
      <div className="mx-auto flex min-h-[76px] max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/vacantes" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#17384b] text-sm font-bold tracking-wide text-white">
            U
          </div>

          <div>
            <p className="text-sm font-bold leading-tight text-[#17384b] sm:text-base">
              UMSSPIRA
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Vinculación Laboral
            </p>
          </div>
        </Link>

        <nav
          aria-label="Navegación principal"
          className="flex flex-wrap items-center gap-1 sm:gap-2"
        >
          <Suspense fallback={<NavigationLinks />}>
            <ActiveNavigationLinks />
          </Suspense>
        </nav>

        <div className="hidden items-center gap-3 border-l border-gray-200 pl-4 md:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8edf0] text-sm font-bold text-[#17384b]">
            E
          </div>
          <div>
            <p className="text-sm font-semibold text-[#263747]">
              Portal de egresados
            </p>
            <p className="text-xs text-gray-500">
              UMSS · Sistemas
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function CompanyHeader() {
  const companyName =
    process.env.NEXT_PUBLIC_EMPRESA_NAME?.trim() || 'Empresa registrada';
  const initials = companyName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-[#2c3b4d] bg-[#1b2632] text-[#eee9df]">
      <div className="mx-auto flex min-h-[84px] max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:px-5">
        <Link href="/mis-vacantes" className="flex shrink-0 items-center gap-2">
          <GraduationCap size={30} className="text-[#ffb162]" aria-hidden="true" />
          <span className="text-lg font-black tracking-tight">
            UMSS<span className="text-[#ff9f43]">PIRA</span>
          </span>
        </Link>

        <nav aria-label="Navegación de empresa" className="hidden items-stretch self-stretch md:flex">
          <Link href="/" className="flex items-center px-3 text-sm font-medium hover:text-white">
            Inicio
          </Link>
          <Link
            href="/mis-vacantes"
            aria-current="page"
            className="flex items-center border-b-[3px] border-[#ffb162] px-3 text-sm font-medium"
          >
            Mis vacantes
          </Link>
          <Link href="/postulaciones" className="flex items-center px-3 text-sm font-medium hover:text-white">
            Postulantes
          </Link>
          <span className="flex items-center px-3 text-sm font-medium text-[#c9c1b1]">
            Mi empresa
          </span>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span className="flex h-11 w-11 items-center justify-center" aria-label="Buscar">
            <Search size={19} />
          </span>
          <span className="flex h-11 w-11 items-center justify-center" aria-label="Notificaciones">
            <Bell size={19} />
          </span>
          <span className="mx-2 h-11 w-px bg-[#2c3b4d]" />
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ffb162] text-xs font-bold">
            {initials || 'E'}
          </span>
          <span className="max-w-40">
            <span className="block truncate text-[13px] font-semibold">{companyName}</span>
            <span className="block text-[11px] text-[#c9c1b1]">Empresa verificada</span>
          </span>
          <ChevronDown size={15} className="ml-1" />
        </div>
      </div>
    </header>
  );
}

function RoutedHeader() {
  const pathname = usePathname();
  const isCompanyRoute =
    pathname === '/mis-vacantes' ||
    /^\/vacantes\/[^/]+\/confirmacion$/.test(pathname);

  return isCompanyRoute ? <CompanyHeader /> : <StandardHeader />;
}

export default function PortalHeader() {
  return (
    <Suspense fallback={<StandardHeader />}>
      <RoutedHeader />
    </Suspense>
  );
}
