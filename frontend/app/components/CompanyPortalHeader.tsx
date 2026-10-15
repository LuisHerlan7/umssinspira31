import Link from 'next/link';
import { Bell, ChevronDown, MessageSquare, Search } from 'lucide-react';

const navigation = [
  { label: 'Inicio', href: '/empresa' },
  { label: 'Mis vacantes', href: '/vacantes/1/editar' },
  { label: 'Postulantes', href: '/empresa/postulantes' },
  { label: 'Mi empresa', href: '/empresa/mi-empresa' },
];

export default function CompanyPortalHeader({ pathname }: { pathname: string }) {
  const currentPath = pathname.replace(/\/+$/, '');
  return (
    <header className="border-b border-[#c7c5bf] bg-[#1b2935] text-[#f8f8f7]">
      <div className="mx-auto flex min-h-[78px] max-w-[1440px] flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3 lg:flex-nowrap lg:py-0">
        <Link href="/empresa" className="flex shrink-0 items-center gap-1">
          <svg viewBox="0 0 36 40" width="32" height="38" aria-hidden="true">
            <path d="M4 29c-3 7 13 11 24 3 5-4 5-9 2-12" fill="none" stroke="#ff9d22" strokeWidth="3" strokeLinecap="round" />
            <path d="M9 20c-3 3-3 10 2 13 5 3 12 1 14-4l-2-11Z" fill="#fff" />
            <path d="M8 20 6 26l6-1m14-5 3 6-6-1" fill="#e5ebef" />
            <circle cx="13" cy="21" r="5" fill="#1b2935" stroke="#fff" strokeWidth="2" />
            <circle cx="23" cy="21" r="5" fill="#1b2935" stroke="#fff" strokeWidth="2" />
            <circle cx="14" cy="20" r="1.5" fill="#fff" /><circle cx="22" cy="20" r="1.5" fill="#fff" />
            <path d="m16 24 3 4 3-4" fill="#ff9d22" />
            <path d="m5 10 15-7 15 7-15 7Z" fill="#fff" />
            <path d="M11 14v4c6 3 12 3 17-1v-4l-8 4Z" fill="#fff" />
            <path d="M33 11v10" stroke="#ff9d22" strokeWidth="2" /><circle cx="33" cy="22" r="2" fill="#ff9d22" />
          </svg>
          <span className="text-[22px] font-black leading-none tracking-[-1px]">UMSS<span className="text-[#ff9408]">PIRA</span></span>
        </Link>

        <nav aria-label="Navegación de empresa" className="order-last flex w-full items-center gap-4 text-xs sm:order-none sm:w-auto">
          {navigation.map((item) => {
            const active = currentPath === item.href ||
              (item.href !== '/empresa' && currentPath.startsWith(`${item.href}/`)) ||
              (item.href === '/vacantes/1/editar' && /^\/vacantes\/[^/]+\/editar$/.test(currentPath));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`relative whitespace-nowrap py-5${item.href === '/empresa' ? ' hover:text-white' : ''}${active ? ' after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:rounded-full after:bg-[#ffa94d]' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-5">
          <div className="hidden items-center gap-5 text-[#e7e7e4] md:flex" aria-hidden="true">
            <Search size={19} strokeWidth={1.8} />
            <MessageSquare size={19} strokeWidth={1.8} />
            <span className="relative"><Bell size={21} strokeWidth={1.8} /><span className="absolute -right-0.5 -top-1 h-[7px] w-[7px] rounded-full bg-[#ffa94d]" /></span>
          </div>
          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[#d99a47] bg-[#2d3a46] text-[11px]">TA</span>
            <div className="hidden min-w-[120px] sm:block">
              <p className="text-[11px] font-semibold leading-5">TecnoAndes S.R.L.</p>
              <p className="text-[10px] leading-4 text-[#abb1b6]">Empresa verificada</p>
            </div>
            <ChevronDown size={13} className="ml-2 text-[#e7e7e4]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
}
