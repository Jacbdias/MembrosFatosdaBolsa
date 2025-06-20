'use client';
import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

// ✅ PERMISSÕES EXPANDIDAS com níveis administrativos
const planPermissions = {
  'VIP': {
    displayName: 'Close Friends VIP',
    isAdmin: false,
    pages: [
      // Páginas principais
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 
      // Internacional completo + PROJETO AMÉRICA
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      // Recursos Exclusivos completo
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'LITE': {
    displayName: 'Close Friends LITE',
    isAdmin: false,
    pages: [
      // Páginas principais (SEM micro-caps)
      'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      // Internacional apenas ETFs e Stocks (SEM dividendos e projeto américa)
      'internacional', 'internacional-etfs', 'internacional-stocks',
      // Recursos Exclusivos limitado (SEM analise, imposto, lives, milhas)
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'RENDA_PASSIVA': {
    displayName: 'Projeto Renda Passiva',
    isAdmin: false,
    pages: [
      // Apenas dividendos, FIIs e rentabilidades
      'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      // Recursos Exclusivos limitado
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'FIIS': {
    displayName: 'Projeto FIIs',
    isAdmin: false,
    pages: [
      // Apenas FIIs e rentabilidades
      'fundos-imobiliarios', 'rentabilidades',
      // Recursos Exclusivos limitado
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'AMERICA': {
    displayName: 'Projeto América',
    isAdmin: false,
    pages: [
      // Internacional completo + PROJETO AMÉRICA
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      // Recursos Exclusivos com Lives (SEM analise, imposto, milhas)
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  // 🛡️ NOVOS PLANOS ADMINISTRATIVOS
  'ADMIN': {
    displayName: 'Administrador',
    isAdmin: true,
    pages: [
      // Acesso a todas as páginas normais
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
      // Páginas administrativas
      'admin', 'admin-dashboard', 'admin-usuarios', 'admin-empresas', 'admin-proventos', 
      'admin-relatorios', 'admin-integracoes'
    ],
    adminPermissions: {
      canManageUsers: true,
      canManageCompanies: true,
      canManageProventos: true,
      canViewReports: true,
      canManageIntegrations: true,
      canExportData: true,
      canViewAnalytics: true,
      canManageSettings: false, // Super admin only
      canManagePlans: false,    // Super admin only
      canViewLogs: false        // Super admin only
    }
  },
  'SUPER_ADMIN': {
    displayName: 'Super Administrador',
    isAdmin: true,
    pages: [
      // Acesso a TUDO
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
      // Todas as páginas administrativas
      'admin', 'admin-dashboard', 'admin-usuarios', 'admin-empresas', 'admin-proventos', 
      'admin-relatorios', 'admin-integracoes', 'admin-settings', 'admin-logs', 'admin-plans'
    ],
    adminPermissions: {
      canManageUsers: true,
      canManageCompanies: true,
      canManageProventos: true,
      canViewReports: true,
      canManageIntegrations: true,
      canExportData: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canManagePlans: true,
      canViewLogs: true
    }
  }
} as const;

// ✅ Usuários expandidos com administradores
const users = {
  'sofia@devias.io': {
    id: 'USR-000',
    avatar: '/assets/avatar.png',
    firstName: 'Sofia',
    lastName: 'Rivers',
    email: 'sofia@devias.io',
    plan: 'VIP' as keyof typeof planPermissions
  },
  'joao@teste.com': {
    id: 'USR-001',
    avatar: '/assets/avatar.png',
    firstName: 'João',
    lastName: 'Silva',
    email: 'joao@teste.com',
    plan: 'LITE' as keyof typeof planPermissions
  },
  'maria@teste.com': {
    id: 'USR-002',
    avatar: '/assets/avatar.png',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria@teste.com',
    plan: 'RENDA_PASSIVA' as keyof typeof planPermissions
  },
  'pedro@teste.com': {
    id: 'USR-003',
    avatar: '/assets/avatar.png',
    firstName: 'Pedro',
    lastName: 'Costa',
    email: 'pedro@teste.com',
    plan: 'FIIS' as keyof typeof planPermissions
  },
  'ana@teste.com': {
    id: 'USR-004',
    avatar: '/assets/avatar.png',
    firstName: 'Ana',
    lastName: 'Lima',
    email: 'ana@teste.com',
    plan: 'AMERICA' as keyof typeof planPermissions
  },
  // 🛡️ NOVOS USUÁRIOS ADMINISTRATIVOS
  'admin@fatosdobolsa.com': {
    id: 'ADM-001',
    avatar: '/assets/avatar.png',
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@fatosdobolsa.com',
    plan: 'ADMIN' as keyof typeof planPermissions
  },
  'superadmin@fatosdobolsa.com': {
    id: 'SADM-001',
    avatar: '/assets/avatar.png',
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@fatosdobolsa.com',
    plan: 'SUPER_ADMIN' as keyof typeof planPermissions
  }
} satisfies Record<string, User & { plan: keyof typeof planPermissions }>;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

// 🛡️ Interface para permissões administrativas
export interface AdminPermissions {
  canManageUsers: boolean;
  canManageCompanies: boolean;
  canManageProventos: boolean;
  canViewReports: boolean;
  canManageIntegrations: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canManagePlans: boolean;
  canViewLogs: boolean;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    return { error: null };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    
    console.log('🔐 Verificando credenciais para:', email);
    
    const user = users[email as keyof typeof users];
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return { error: 'Credenciais inválidas' };
    }
    
    // 🛡️ Senhas diferentes para diferentes tipos de usuário
    const validPassword = email.includes('admin') ? 'Admin123!' : 'Secret1';
    
    if (password !== validPassword) {
      console.log('❌ Senha incorreta para:', email);
      return { error: 'Credenciais inválidas' };
    }

    console.log('✅ Login bem-sucedido para:', email);
    
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    localStorage.setItem('user-email', email);
    
    return { error: null };
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }

    const userEmail = localStorage.getItem('user-email');
    if (!userEmail || !users[userEmail as keyof typeof users]) {
      return { data: null };
    }

    return { data: users[userEmail as keyof typeof users] };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-email');
    return { error: null };
  }

  // ✅ Função para verificar acesso a uma página
  async hasAccess(page: string): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return false;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan]?.pages.includes(page) || false;
  }

  // 🛡️ NOVA: Verificar se usuário é admin
  async isAdmin(): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return false;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan]?.isAdmin || false;
  }

  // 🛡️ NOVA: Obter permissões administrativas
  async getAdminPermissions(): Promise<AdminPermissions | null> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return null;
    
    const userPlan = (user as any).plan;
    const plan = planPermissions[userPlan];
    
    return plan?.adminPermissions || null;
  }

  // 🛡️ NOVA: Verificar permissão administrativa específica
  async hasAdminPermission(permission: keyof AdminPermissions): Promise<boolean> {
    const permissions = await this.getAdminPermissions();
    return permissions?.[permission] || false;
  }

  // ✅ Função para obter informações do plano (expandida)
  async getPlanInfo(): Promise<{ 
    displayName: string; 
    pages: string[]; 
    isAdmin: boolean;
    adminPermissions?: AdminPermissions;
  } | null> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return null;
    
    const userPlan = (user as any).plan;
    const plan = planPermissions[userPlan];
    
    if (!plan) return null;
    
    return {
      displayName: plan.displayName,
      pages: plan.pages,
      isAdmin: plan.isAdmin || false,
      adminPermissions: plan.adminPermissions
    };
  }
}

export const authClient = new AuthClient();

// ✅ ADICIONAR: Exportar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).authClient = authClient;
  
  // 🛡️ Helper para testar login de admin no console
  (window as any).loginAsAdmin = () => {
    console.log('🛡️ Para fazer login como ADMIN:');
    console.log('Email: admin@fatosdobolsa.com');
    console.log('Senha: Admin123!');
    console.log('');
    console.log('🛡️ Para fazer login como SUPER ADMIN:');
    console.log('Email: superadmin@fatosdobolsa.com');
    console.log('Senha: Admin123!');
  };
}
