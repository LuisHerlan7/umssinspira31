'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Award, Bell, BriefcaseBusiness, CalendarDays, ChevronDown, CircleDot, House, Menu, Star, UserRound } from 'lucide-react';
import { headerStyles as styles } from './jobs-styles';
import { hu8Href, resolveHu8DemoScenario, type Hu8DemoScenario } from '../../../lib/vacancies/demo-mode';

const items = [
  { label: 'Inicio', icon: House, href: '/' },
  { label: 'Eventos', icon: CalendarDays },
  { label: 'Bolsa de trabajo', icon: BriefcaseBusiness, href: '/vacantes' },
  { label: 'Mentorías', icon: Award },
  { label: 'Beneficios', icon: Star },
  { label: 'Comunidad', icon: CircleDot },
];

function NavigationItems({ scenario }: { scenario: Hu8DemoScenario | null }) {
  return items.map(({ label, icon: Icon, href }) => {
    const content = <><Icon size={17} strokeWidth={1.7} aria-hidden="true" />{label}</>;
    return href ? (
      <Link key={label} href={hu8Href(href === '/' && scenario ? '/vacantes' : href, scenario)} aria-current={href === '/vacantes' ? 'page' : undefined} className={`${styles.item} ${href === '/vacantes' ? styles.active : ''}`}>{content}</Link>
    ) : (
      <span key={label} aria-disabled="true" title="Esta sección todavía no está disponible" className={styles.item}>{content}</span>
    );
  });
}

/** HU8 navigation only. Unimplemented modules do not link to invented routes. */
export default function JobsPortalHeader() {
  const searchParams = useSearchParams();
  const scenario = resolveHu8DemoScenario(searchParams.get('hu8Demo'));
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={hu8Href(scenario ? '/vacantes' : '/', scenario)} aria-label="UMSSPIRA · Inicio" className={styles.logo}>
          <Image src="/hu04/header-logo.png" alt="UMSSPIRA" width={172} height={56} priority />
        </Link>
        <nav aria-label="Navegación principal" className={styles.nav}><NavigationItems scenario={scenario} /></nav>
        <details className={styles.mobile}>
          <summary aria-label="Menú de navegación"><Menu size={24} aria-hidden="true" /></summary>
          <nav aria-label="Navegación principal móvil" className={styles.mobileNav}><NavigationItems scenario={scenario} /></nav>
        </details>
        <div className={styles.account}>
          <span role="img" aria-label="Notificaciones"><Bell size={21} strokeWidth={1.6} aria-hidden="true" /></span>
          <Link href="/perfil/experiencia-laboral" aria-label="Mi perfil" className={styles.profile}>
            <span className={styles.avatar}><UserRound size={14} aria-hidden="true" /></span>
            <ChevronDown size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
