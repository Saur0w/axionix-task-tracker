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

/**
 * Checks whether a navigation item is active given the current pathname and search parameters.
 */
export function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams | null,
  href: string
): boolean {
  const [targetPath, targetQuery] = href.split('?');

  if (targetQuery) {
    // Exact path + exact search param matching (e.g. /dashboard?view=my-issues)
    if (pathname !== targetPath) return false;
    const currentView = searchParams?.get('view');
    const targetParams = new URLSearchParams(targetQuery);
    return currentView === targetParams.get('view');
  }

  // If this item is pure /dashboard, do not highlight if view=my-issues is active
  if (targetPath === '/dashboard') {
    if (pathname !== '/dashboard') return false;
    const currentView = searchParams?.get('view');
    return !currentView || currentView !== 'my-issues';
  }

  // For /projects, highlight on /projects and all subroutes like /projects/[id]
  if (targetPath === '/projects') {
    return pathname === '/projects' || pathname.startsWith('/projects/');
  }

  return pathname === targetPath;
}
