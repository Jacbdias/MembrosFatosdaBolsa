export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
dashboard: {
  overview: '/dashboard/overview',
  account: '/dashboard/account',
  customers: '/dashboard/customers',
  internacional: '/dashboard/internacional', // ← ESTA LINHA
  integrations: '/dashboard/integrations',
  settings: '/dashboard/settings',
},
  errors: { notFound: '/errors/not-found' },
} as const;
