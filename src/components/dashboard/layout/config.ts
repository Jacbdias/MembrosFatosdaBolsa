// src/components/dashboard/layout/config.ts
import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { 
    key: 'overview', 
    title: 'Small Caps', 
    href: paths.dashboard.overview,
    icon: 'chart-pie',
    page: 'small-caps'
  },
  { 
    key: 'customers', 
    title: 'Micro Caps', 
    href: paths.dashboard.customers, 
    icon: 'chart-bar',
    page: 'micro-caps'
  },
  { 
    key: 'integrations', 
    title: 'Dividendos', 
    href: paths.dashboard.integrations, 
    icon: 'chart-line-up',
    page: 'dividendos'
  },
  { 
    key: 'settings', 
    title: 'Fundos Imobiliários', 
    href: paths.dashboard.settings, 
    icon: 'buildings',
    page: 'fundos-imobiliarios'
  },
  // ✅ COMENTAR TEMPORARIAMENTE as rotas que não existem
  // { 
  //   key: 'rentabilidades', 
  //   title: 'Rentabilidades', 
  //   href: paths.dashboard.rentabilidades, 
  //   icon: 'chart-line',
  //   page: 'rentabilidades'
  // },
  // {
  //   key: 'internacional',
  //   title: 'Internacional',
  //   href: paths.dashboard.internacional,
  //   icon: 'globe',
  //   page: 'internacional',
  //   items: [
  //     {
  //       key: 'internacional-etfs',
  //       title: 'ETFs',
  //       href: paths.dashboard.internacional + '/etfs',
  //       icon: 'chart-bar',
  //       page: 'internacional-etfs'
  //     },
  //     {
  //       key: 'internacional-stocks',
  //       title: 'Stocks',
  //       href: paths.dashboard.internacional + '/stocks',
  //       icon: 'chart-line-up',
  //       page: 'internacional-stocks'
  //     },
  //     {
  //       key: 'internacional-dividendos',
  //       title: 'Dividendos',
  //       href: paths.dashboard.internacional + '/dividendos',
  //       icon: 'chart-pie',
  //       page: 'internacional-dividendos'
  //     },
  //   ],
  // },
  // {
  //   key: 'recursos-exclusivos',
  //   title: 'Recursos Exclusivos',
  //   href: paths.dashboard.recursosExclusivos,
  //   icon: 'package',
  //   page: 'recursos-exclusivos',
  //   items: [
  //     {
  //       key: 'recursos-dicas',
  //       title: 'Dicas de Investimentos',
  //       href: paths.dashboard.recursosExclusivos + '/dicas-de-investimentos',
  //       icon: 'lightbulb',
  //       page: 'recursos-dicas'
  //     },
  //     {
  //       key: 'recursos-ebooks',
  //       title: 'eBooks',
  //       href: paths.dashboard.recursosExclusivos + '/ebooks',
  //       icon: 'book',
  //       page: 'recursos-ebooks'
  //     },
  //     {
  //       key: 'recursos-planilhas',
  //       title: 'Planilhas',
  //       href: paths.dashboard.recursosExclusivos + '/planilhas',
  //       icon: 'table',
  //       page: 'recursos-planilhas'
  //     },
  //     {
  //       key: 'recursos-telegram',
  //       title: 'Telegram',
  //       href: paths.dashboard.recursosExclusivos + '/telegram',
  //       icon: 'chat',
  //       page: 'recursos-telegram'
  //     },
  //   ],
  // },
  { 
    key: 'error', 
    title: 'Error', 
    href: paths.errors.notFound, 
    icon: 'x-square'
  },
] satisfies NavItemConfig[];
