import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Small Caps', href: '/dashboard/overview', icon: 'chart-pie' },
  { key: 'customers', title: 'Micro Caps', href: paths.dashboard.customers, icon: 'chart-bar' },
  { key: 'integrations', title: 'Dividendos', href: paths.dashboard.integrations, icon: 'chart-line-up' },
  { key: 'settings', title: 'Fundos Imobiliários', href: paths.dashboard.settings, icon: 'buildings' },
  { key: 'internacional', title: 'Internacional', href: paths.dashboard.internacional, icon: 'globe' },
  { key: 'recursos-exclusivos', title: 'Recursos Exclusivos', href: paths.dashboard.recursosExclusivos, icon: 'package' }, // ← USE O PATH
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
