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
      {
        key: 'internacional-projeto-america',
        title: 'Projeto América',
        href: paths.dashboard.internacional + '/projeto-america',
        icon: 'star',
        page: 'internacional-projeto-america'
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
      {
        key: 'recursos-reserva',
        title: 'Reserva de Emergência',
        href: paths.dashboard.recursosExclusivos + '/reserva-emergencia',
        icon: 'shield',
        page: 'recursos-reserva'
      },
    ],
  },

  // 🛡️ MENU ADMINISTRATIVO
  {
    key: 'administracao',
    title: 'Administração',
    href: paths.dashboard.admin,
    icon: 'gear',
    page: 'admin',
    items: [
      {
        key: 'admin-dashboard',
        title: 'Dashboard Admin',
        href: paths.dashboard.admin,
        icon: 'chart-pie',
        page: 'admin-dashboard'
      },
      {
        key: 'admin-usuarios',
        title: 'Gestão de Usuários',
        href: paths.dashboard.adminUsuarios,
        icon: 'users',
        page: 'admin-usuarios'
      },
      {
        key: 'admin-instagram',
        title: 'Instagram Close Friends',
        href: paths.dashboard.admin + '/instagram-cadastros',
        icon: 'instagram',
        page: 'admin-instagram'
      },
      {
        key: 'admin-integracoes-plataformas',
        title: 'Integrações',
        href: paths.dashboard.adminIntegracoesPlatformas,
        icon: 'link',
        page: 'admin-integracoes'
      },
      {
        key: 'admin-renovacoes',
        title: 'Renovações',
        href: paths.dashboard.adminRenovacoes,
        icon: 'chart-bar',
        page: 'admin-renovacoes'
      },
      {
        key: 'admin-empresas',
        title: 'Gestão de Empresas',
        href: paths.dashboard.adminEmpresas,
        icon: 'buildings',
        page: 'admin-empresas'
      },
      {
        key: 'admin-proventos',
        title: 'Central de Proventos',
        href: paths.dashboard.adminProventos,
        icon: 'chart-line-up',
        page: 'admin-proventos'
      },
      {
        key: 'admin-relatorios',
        title: 'Gestão de Relatórios',
        href: paths.dashboard.adminRelatorios,
        icon: 'chart-bar',
        page: 'admin-relatorios'
      },
      {
        key: 'admin-integracoes-agenda',
        title: 'Agenda Corporativa',
        href: paths.dashboard.adminIntegracoes,
        icon: 'calendar',
        page: 'admin-integracoes'
      },
      {
        key: 'admin-logs',
        title: 'Logs do Sistema',
        href: paths.dashboard.adminLogs,
        icon: 'list',
        page: 'admin-logs'
      }
    ]
  },

] satisfies NavItemConfig[];