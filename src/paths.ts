// src/paths.ts
export const paths = {
  home: '/',
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password'
  },
  dashboard: {
    overview: '/dashboard/overview',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    internacional: '/dashboard/internacional',
    recursosExclusivos: '/dashboard/recursos-exclusivos',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    rentabilidades: '/dashboard/rentabilidades', // ✨ NOVA ROTA ADICIONADA
  },
  errors: {
    notFound: '/errors/not-found'
  },
} as const;

// Export default também para compatibilidade
export default paths;

// Export tipo para TypeScript
export type Paths = typeof paths;

// DEBUG: Adicione temporariamente para debug
console.log('=== DEBUG PATHS ===');
console.log('Paths loaded:', paths);
console.log('recursosExclusivos path:', paths.dashboard.recursosExclusivos);
console.log('rentabilidades path:', paths.dashboard.rentabilidades); // ✨ NOVA LINHA DE DEBUG
console.log('==================');
