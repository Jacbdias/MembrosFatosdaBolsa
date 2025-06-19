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
  { 
    key: 'rentabilidades', 
    title: 'Rentabilidades', 
    href: paths.dashboard.rentabilidades, 
    icon: 'chart-line',
    page: 'rentabilidades'
  },
  {
    key: 'internacional',
    title: 'Internacional',
    href: paths.dashboard.internacional,
    icon: 'globe',
    page: 'internacional',
    items: [
      {
        key: 'internacional-etfs',
        title: 'ETFs',
        href: paths.dashboard.internacional + '/etfs',
        icon: 'chart-bar',
        page: 'internacional-etfs'
      },
      {
        key: 'internacional-stocks',
        title: 'Stocks',
        href: paths.dashboard.internacional + '/stocks',
        icon: 'chart-line-up',
        page: 'internacional-stocks'
      },
      {
        key: 'internacional-dividendos',
        title: 'Dividendos',
        href: paths.dashboard.internacional + '/dividendos',
        icon: 'chart-pie',
        page: 'internacional-dividendos'
      },
    ],
  },
  {
    key: 'recursos-exclusivos',
    title: 'Recursos Exclusivos',
    href: paths.dashboard.recursosExclusivos,
    icon: 'package',
    page: 'recursos-exclusivos',
    items: [
      {
        key: 'recursos-dicas',
        title: 'Dicas de Investimentos',
        href: paths.dashboard.recursosExclusivos + '/dicas-de-investimentos',
        icon: 'lightbulb',
        page: 'recursos-dicas'
      },
      {
        key: 'recursos-analise',
        title: 'Análise de Carteira',
        href: paths.dashboard.recursosExclusivos + '/analise-de-carteira',
        icon: 'chart-line',
        page: 'recursos-analise'
      },
      {
        key: 'recursos-ebooks',
        title: 'eBooks',
        href: paths.dashboard.recursosExclusivos + '/ebooks',
        icon: 'book',
        page: 'recursos-ebooks'
      },
      {
        key: 'recursos-imposto',
        title: 'Imposto de Renda',
        href: paths.dashboard.recursosExclusivos + '/imposto-de-renda',
        icon: 'receipt',
        page: 'recursos-imposto'
      },
      {
        key: 'recursos-lives',
        title: 'Lives e Aulas',
        href: paths.dashboard.recursosExclusivos + '/lives-e-aulas',
        icon: 'video',
        page: 'recursos-lives'
      },
      {
        key: 'recursos-milhas',
        title: 'Milhas Aéreas',
        href: paths.dashboard.recursosExclusivos + '/milhas-aereas',
        icon: 'airplane',
        page: 'recursos-milhas'
      },
      {
        key: 'recursos-planilhas',
        title: 'Planilhas',
        href: paths.dashboard.recursosExclusivos + '/planilhas',
        icon: 'table',
        page: 'recursos-planilhas'
      },
      {
        key: 'recursos-telegram',
        title: 'Telegram',
        href: paths.dashboard.recursosExclusivos + '/telegram',
        icon: 'chat',
        page: 'recursos-telegram'
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
