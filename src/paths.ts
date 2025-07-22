// src/paths.ts
export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password'
  },
  dashboard: {
    // 🆕 NOVO: Relatório Semanal (primeiro item do menu)
    relatorioSemanal: '/dashboard/relatorio-semanal',
    
    overview: '/dashboard/overview',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    internacional: '/dashboard/internacional',
    recursosExclusivos: '/dashboard/recursos-exclusivos',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    rentabilidades: '/dashboard/rentabilidades',
    
    // 🛡️ ROTAS ADMINISTRATIVAS
    admin: '/dashboard/admin',
    adminUsuarios: '/dashboard/admin/usuarios',
    adminRenovacoes: '/dashboard/admin/renovacoes',
    adminIntegracoesPlatformas: '/dashboard/admin/integracoes',
    adminEmpresas: '/dashboard/gerenciamento',
    adminProventos: '/dashboard/central-proventos',
    adminRelatorios: '/dashboard/central-relatorios',
    adminRelatorioSemanal: '/dashboard/admin/relatorio-semanal',
    // 🆕 NOVO: Análises Trimestrais
    adminAnalisesTrimesestrais: '/dashboard/admin/analises-trimesestrais',
    adminIntegracoes: '/dashboard/central-agenda',
    adminSettings: '/dashboard/admin/settings',
    adminLogs: '/dashboard/admin/logs',
    adminPlans: '/dashboard/admin/plans',
  },
  errors: {
    notFound: '/errors/not-found'
  },
} as const;

// Export default também para compatibilidade
export default paths;
// Export tipo para TypeScript
export type Paths = typeof paths;