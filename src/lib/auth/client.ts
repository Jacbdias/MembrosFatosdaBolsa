'use client';
import type { User } from '@/types/user';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

// ✅ PERMISSÕES CORRIGIDAS conforme especificado
const planPermissions = {
  'VIP': {
    displayName: 'Close Friends VIP',
    pages: [
      // Páginas principais
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 
      // Internacional completo
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos',
      // Recursos Exclusivos completo
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'LITE': {
    displayName: 'Close Friends LITE',
    pages: [
      // Páginas principais (SEM micro-caps)
      'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      // Internacional apenas ETFs e Stocks (SEM dividendos)
      'internacional', 'internacional-etfs', 'internacional-stocks',
      // Recursos Exclusivos limitado (SEM analise, imposto, lives, milhas)
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'RENDA_PASSIVA': {
    displayName: 'Projeto Renda Passiva',
    pages: [
      // Apenas dividendos, FIIs e rentabilidades
      'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      // Recursos Exclusivos limitado
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'FIIS': {
    displayName: 'Projeto FIIs',
    pages: [
      // Apenas FIIs e rentabilidades
      'fundos-imobiliarios', 'rentabilidades',
      // Recursos Exclusivos limitado
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'AMERICA': {
    displayName: 'Projeto América',
    pages: [
      // Internacional completo
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos',
      // Recursos Exclusivos com Lives (SEM analise, imposto, milhas)
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
    ]
  }
} as const;

// ✅ Usuários com diferentes planos
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

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
    const { email, password } = params;
    
    const user = users[email as keyof typeof users];
    if (!user || password !== 'Secret1') {
      return { error: 'Invalid credentials' };
    }

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);
    localStorage.setItem('user-email', email);
    return {};
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
    return {};
  }

  // ✅ Função para verificar acesso a uma página
  async hasAccess(page: string): Promise<boolean> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return false;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan]?.pages.includes(page) || false;
  }

  // ✅ Função para obter informações do plano
  async getPlanInfo(): Promise<{ displayName: string; pages: string[] } | null> {
    const { data: user } = await this.getUser();
    if (!user || !('plan' in user)) return null;
    
    const userPlan = (user as any).plan;
    return planPermissions[userPlan] || null;
  }
}

export const authClient = new AuthClient();
