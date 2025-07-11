'use client';
import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

// ✅ PERMISSÕES (mantidas como estavam)
const planPermissions = {
  'VIP': {
    displayName: 'Close Friends VIP',
    isAdmin: false,
    pages: [
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva' // ← ADICIONADO
    ]
  },
  'LITE': {
    displayName: 'Close Friends LITE',
    isAdmin: false,
    pages: [
      'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'internacional', 'internacional-etfs', 'internacional-stocks',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva' // ← ADICIONADO
    ]
  },
  'RENDA_PASSIVA': {
    displayName: 'Projeto Renda Passiva',
    isAdmin: false,
    pages: [
      'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva' // ← ADICIONADO
    ]
  },
  'FIIS': {
    displayName: 'Projeto FIIs',
    isAdmin: false,
    pages: [
      'fundos-imobiliarios', 'rentabilidades',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva' // ← ADICIONADO
    ]
  },
  'AMERICA': {
    displayName: 'Projeto América',
    isAdmin: false,
    pages: [
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva' // ← ADICIONADO
    ]
  },
  'ADMIN': {
    displayName: 'Administrador',
    isAdmin: true,
    pages: [
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
      'recursos-reserva', // ← ADICIONADO
      'admin', 'admin-dashboard', 'admin-usuarios', 'admin-empresas', 'admin-proventos', 
      'admin-relatorios', 'admin-integracoes', 'admin-settings', 'admin-logs'
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
      canViewLogs: true
    }
  }
} as const;

// ✅ Usuários hardcoded como fallback
const fallbackUsers = {
  'sofia@devias.io': {
    id: 'USR-000',
    avatar: '/assets/avatar.png',
    firstName: 'Sofia',
    lastName: 'Rivers',
    email: 'sofia@devias.io',
    plan: 'VIP' as keyof typeof planPermissions
  },
  'admin@fatosdobolsa.com': {
    id: 'ADM-001',
    avatar: '/assets/avatar.png',
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@fatosdobolsa.com',
    plan: 'ADMIN' as keyof typeof planPermissions
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

export interface AdminPermissions {
  canManageUsers: boolean;
  canManageCompanies: boolean;
  canManageProventos: boolean;
  canViewReports: boolean;
  canManageIntegrations: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
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

  // 🆕 MÉTODO ATUALIZADO - Usa nossa nova API
  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    
    console.log('🔐 Tentando login via API para:', email);
    
    try {
      // 🆕 Chamar nossa nova API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login via API bem-sucedido:', data);
        
        // Armazenar dados do usuário
        localStorage.setItem('custom-auth-token', generateToken());
        localStorage.setItem('user-email', email);
        localStorage.setItem('user-data', JSON.stringify(data.user));
        
        return { error: null };
      } else {
        const errorData = await response.json();
        console.log('❌ Erro da API:', errorData);
        
        // 🆕 Fallback: tentar usuários hardcoded se API falhar
        return this.tryFallbackLogin(email, password);
      }
    } catch (error) {
      console.error('💥 Erro na chamada da API:', error);
      
      // 🆕 Fallback: tentar usuários hardcoded se API falhar
      return this.tryFallbackLogin(email, password);
    }
  }

  // 🆕 Método fallback para usuários hardcoded
  private async tryFallbackLogin(email: string, password: string): Promise<{ error?: string }> {
    console.log('🔄 Tentando fallback para:', email);
    
    const user = fallbackUsers[email as keyof typeof fallbackUsers];
    if (!user) {
      return { error: 'Credenciais inválidas' };
    }
    
    // Senhas hardcoded
    const validPassword = email.includes('admin') ? 'Admin123!' : 'Secret1';
    
    if (password !== validPassword) {
      return { error: 'Credenciais inválidas' };
    }

    console.log('✅ Login fallback bem-sucedido para:', email);
    
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    localStorage.setItem('user-email', email);
    localStorage.setItem('user-data', JSON.stringify(user));
    
    return { error: null };
  }

async resetPassword(params: ResetPasswordParams): Promise<{ error?: string }> {
  try {
    console.log('🔑 Solicitando reset para:', params.email);
    
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: params.email }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Reset solicitado com sucesso');
      return { error: null };
    } else {
      const errorData = await response.json();
      console.log('❌ Erro no reset:', errorData);
      return { error: errorData.error || 'Erro ao solicitar reset' };
    }
  } catch (error) {
    console.error('💥 Erro na solicitação de reset:', error);
    return { error: 'Erro de conexão. Tente novamente.' };
  }
}
  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  // 🆕 MÉTODO ATUALIZADO - Pega dados do localStorage ou fallback
  async getUser(): Promise<{ data?: User | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return { data: null };
    }

    // Tentar pegar dados salvos do usuário
    const userData = localStorage.getItem('user-data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return { data: user };
      } catch (error) {
        console.error('Erro ao parse user data:', error);
      }
    }

    // Fallback para usuários hardcoded
    const userEmail = localStorage.getItem('user-email');
    if (userEmail && fallbackUsers[userEmail as keyof typeof fallbackUsers]) {
      return { data: fallbackUsers[userEmail as keyof typeof fallbackUsers] };
    }

    return { data: null };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-data');
    return { error: null };
  }

  // ✅ Resto dos métodos permanecem iguais
  async hasAccess(page: string): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return false;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan]?.pages.includes(page) || false;
  }

  async isAdmin(): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return false;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan]?.isAdmin || false;
  }

  async getAdminPermissions(): Promise<AdminPermissions | null> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return null;
    
    const userPlan = (user as any).plan;
    const plan = planPermissions[userPlan];
    
    return plan?.adminPermissions || null;
  }

  async hasAdminPermission(permission: keyof AdminPermissions): Promise<boolean> {
    const permissions = await this.getAdminPermissions();
    return permissions?.[permission] || false;
  }

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

// ✅ Exportar globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).authClient = authClient;
}