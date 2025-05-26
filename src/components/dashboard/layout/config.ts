// src/components/dashboard/layout/config.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { 
    key: 'overview', 
    title: 'Small Caps', 
    href: paths.dashboard.overview,
    icon: 'chart-pie' 
  },
  { 
    key: 'customers', 
    title: 'Micro Caps', 
    href: paths.dashboard.customers, 
    icon: 'chart-bar' 
  },
  { 
    key: 'integrations', 
    title: 'Dividendos', 
    href: paths.dashboard.integrations, 
    icon: 'chart-line-up' 
  },
  { 
    key: 'settings', 
    title: 'Fundos Imobiliários', 
    href: paths.dashboard.settings, 
    icon: 'buildings' 
  },
  {
    key: 'internacional',
    title: 'Internacional',
    href: paths.dashboard.internacional,
    icon: 'globe',
    items: [
      {
        key: 'internacional-etfs',
        title: 'ETFs',
        href: paths.dashboard.internacional + '/etfs',
        icon: 'chart-bar',
      },
      {
        key: 'internacional-stocks',
        title: 'Stocks',
        href: paths.dashboard.internacional + '/stocks',
        icon: 'chart-line-up',
      },
      {
        key: 'internacional-dividendos',
        title: 'Dividendos',
        href: paths.dashboard.internacional + '/dividendos',
        icon: 'chart-pie',
      },
    ],
  },
  {
    key: 'recursos-exclusivos',
    title: 'Recursos Exclusivos',
    href: paths.dashboard.recursosExclusivos,
    icon: 'package',
    items: [
      {
        key: 'recursos-ebooks',
        title: 'eBooks',
        href: paths.dashboard.recursosExclusivos + '/ebooks',
        icon: 'package',
      },
      {
        key: 'recursos-imposto',
        title: 'Imposto de Renda',
        href: paths.dashboard.recursosExclusivos + '/imposto-de-renda',
        icon: 'buildings',
      },
      {
        key: 'recursos-lives',
        title: 'Lives e Aulas',
        href: paths.dashboard.recursosExclusivos + '/lives-e-aulas',
        icon: 'package',
      },
      {
        key: 'recursos-milhas',
        title: 'Milhas Aéreas',
        href: paths.dashboard.recursosExclusivos + '/milhas-aereas',
        icon: 'package',
      },
      {
        key: 'recursos-planilhas',
        title: 'Planilhas',
        href: paths.dashboard.recursosExclusivos + '/planilhas',
        icon: 'package',
      },
      {
        key: 'recursos-telegram',
        title: 'Telegram',
        href: paths.dashboard.recursosExclusivos + '/telegram',
        icon: 'package',
      },
    ],
  },
  { 
    key: 'error', 
    title: 'Error', 
    href: paths.errors.notFound, 
    icon: 'x-square' 
  },
] satisfies NavItemConfig[];
