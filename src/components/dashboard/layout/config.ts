import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Small Caps', href: '/dashboard/overview', icon: 'chart-pie' },
  { key: 'customers', title: 'Micro Caps', href: paths.dashboard.customers, icon: 'chart-bar' },
  { key: 'integrations', title: 'Dividendos', href: paths.dashboard.integrations, icon: 'chart-line-up' },
  { key: 'settings', title: 'Fundos Imobiliários', href: paths.dashboard.settings, icon: 'buildings' },
  { key: 'account', title: 'Exterior', href: paths.dashboard.account, icon: 'user' },
  { key: 'error', title: 'Error', href: paths.errors.notFound, icon: 'x-square' },
] satisfies NavItemConfig[];
