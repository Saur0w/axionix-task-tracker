import { LucideIcon, Activity, CheckCircle2, FolderKanban } from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number | string;
  exact?: boolean;
}

export const CORE_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'pulse',
    label: 'Pulse',
    href: '/dashboard',
    icon: Activity,
    exact: true,
  },
  {
    id: 'my-issues',
    label: 'My issues',
    href: '/dashboard?view=my-issues',
    icon: CheckCircle2,
    exact: false,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    exact: false,
  },
];

export function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams | null,
  href: string
): boolean {
  const [targetPath, targetQuery] = href.split('?');

  if (targetQuery) {
    if (pathname !== targetPath) return false;
    const currentView = searchParams?.get('view');
    const targetParams = new URLSearchParams(targetQuery);
    return currentView === targetParams.get('view');
  }

  if (targetPath === '/dashboard') {
    if (pathname !== '/dashboard') return false;
    const currentView = searchParams?.get('view');
    return !currentView || currentView !== 'my-issues';
  }

  if (targetPath === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }

  return pathname === targetPath;
}
