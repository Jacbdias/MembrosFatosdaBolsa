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
  // ✅ DESCOMENTADO - Rentabilidades
  { 
    key: 'rentabilidades', 
    title: 'Rentabilidades', 
    href: paths.dashboard.rentabilidades, 
    icon: 'chart-line',
    page: 'rentabilidades'
  },
  // ✅ DESCOMENTADO - Internacional
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
      // 🇺🇸 NOVO ITEM - Projeto América
      {
        key: 'internacional-projeto-america',
        title: 'Projeto América',
        href: paths.dashboard.internacional + '/projeto-america',
        icon: 'star',
        page: 'internacional-projeto-america'
      },
    ],
  },
  // ✅ DESCOMENTADO - Recursos Exclusivos
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

  // 🛡️ NOVO - MENU ADMINISTRATIVO
  {
    key: 'administracao',
    title: 'Administração',
    href: '/dashboard/admin',
    icon: 'gear', // Certifique-se que este ícone existe no nav-icons
    page: 'admin', // Página principal que controla acesso
    items: [
      {
        key: 'admin-dashboard',
        title: 'Dashboard Admin',
        href: '/dashboard/admin',
        icon: 'chart-pie',
        page: 'admin-dashboard'
      },
      {
        key: 'admin-proventos',
        title: 'Central de Proventos',
        href: '/dashboard/central-proventos',
        icon: 'chart-line-up',
        page: 'admin-proventos'
      },
      {
        key: 'admin-usuarios',
        title: 'Gestão de Usuários',
        href: '/dashboard/admin/usuarios',
        icon: 'users',
        page: 'admin-usuarios'
      },
      {
        key: 'admin-empresas',
        title: 'Gestão de Empresas',
        href: '/dashboard/admin/empresas',
        icon: 'buildings',
        page: 'admin-empresas'
      },
      {
        key: 'admin-relatorios',
        title: 'Relatórios',
        href: '/dashboard/admin/relatorios',
        icon: 'chart-bar',
        page: 'admin-relatorios'
      },
      {
        key: 'admin-integracoes',
        title: 'Integrações',
        href: '/dashboard/admin/integracoes',
        icon: 'link',
        page: 'admin-integracoes'
      }
    ]
  },

  // 🛡️ NOVO - SUPER ADMIN (só aparece para super admins)
  {
    key: 'super-admin',
    title: 'Super Admin',
    href: '/dashboard/admin/settings',
    icon: 'shield-check', // Certifique-se que este ícone existe
    page: 'admin-settings', // Controla acesso de super admin
    items: [
      {
        key: 'admin-settings',
        title: 'Configurações do Sistema',
        href: '/dashboard/admin/settings',
        icon: 'gear',
        page: 'admin-settings'
      },
      {
        key: 'admin-logs',
        title: 'Logs do Sistema',
        href: '/dashboard/admin/logs',
        icon: 'list',
        page: 'admin-logs'
      },
      {
        key: 'admin-plans',
        title: 'Gestão de Planos',
        href: '/dashboard/admin/plans',
        icon: 'package',
        page: 'admin-plans'
      }
    ]
  },

  { 
    key: 'error', 
    title: 'Error', 
    href: paths.errors.notFound, 
    icon: 'x-square'
  },
] satisfies NavItemConfig[];
