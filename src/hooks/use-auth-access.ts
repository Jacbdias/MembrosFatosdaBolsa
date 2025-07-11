'use client';

import { useState, useEffect } from 'react';
import { useUser } from './use-user'; // Assumindo que você tem este hook

export function useAuthAccess() {
  const { user } = useUser(); // Pega usuário real do banco
  const [planInfo, setPlanInfo] = useState<{ displayName: string; pages: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        console.log('🔍 Carregando permissões para usuário:', user?.email, 'Plano:', user?.plan);

        // Se não tem usuário, usar authClient original
        if (!user) {
          console.log('⚠️ Sem usuário logado, usando authClient padrão');
          const { authClient } = await import('@/lib/auth/client');
          
          if (typeof authClient.getPlanInfo === 'function') {
            const info = await authClient.getPlanInfo();
            setPlanInfo(info);
          } else {
            // Fallback
            setPlanInfo({
              displayName: 'Close Friends VIP',
              pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
            });
          }
          setLoading(false);
          return;
        }

        // Importar authClient para pegar permissões base do plano
        const { authClient } = await import('@/lib/auth/client');
        
        // Simular um usuário temporário com o plano atual para o authClient
        const tempUserEmail = localStorage.getItem('user-email');
        if (tempUserEmail) {
          localStorage.setItem('user-email', tempUserEmail);
        }

        // Pegar permissões base do plano usando authClient
        let basePlanInfo = null;
        try {
          // Se o authClient funcionar, pegar as permissões base
          basePlanInfo = await authClient.getPlanInfo();
        } catch (error) {
          console.log('⚠️ AuthClient falhou, usando mapeamento interno');
        }

        // Mapeamento interno caso authClient falhe
        const internalPlanPermissions = {
          'VIP': [
            'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks',
            'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
          ],
          'LITE': [
            'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          'RENDA_PASSIVA': [
            'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          'FIIS': [
            'fundos-imobiliarios', 'rentabilidades',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          'AMERICA': [
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
          ],
          'ADMIN': [
            'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks',
            'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
            'admin', 'admin-dashboard', 'admin-usuarios', 'admin-instagram', 'admin-empresas', 'admin-proventos',
            'admin-relatorios', 'admin-integracoes', 'admin-settings', 'admin-logs'
          ]
        };

        // Pegar permissões base do plano
        const basePlanPages = basePlanInfo?.pages || internalPlanPermissions[user.plan] || [];
        
        // Pegar permissões customizadas do usuário
        const customPermissions = user.customPermissions || [];
        
        // Combinar todas as permissões (sem duplicatas)
        const allPermissions = [...new Set([...basePlanPages, ...customPermissions])];
        
        console.log('📋 Permissões base do plano:', basePlanPages);
        console.log('🎯 Permissões customizadas:', customPermissions);
        console.log('✅ Permissões finais:', allPermissions);

        // Mapear nome do plano
        const planNames = {
          'VIP': 'Close Friends VIP',
          'LITE': 'Close Friends LITE', 
          'RENDA_PASSIVA': 'Projeto Renda Passiva',
          'FIIS': 'Projeto FIIs',
          'AMERICA': 'Projeto América',
          'ADMIN': 'Administrador'
        };

        setPlanInfo({
          displayName: planNames[user.plan] || user.plan,
          pages: allPermissions
        });

      } catch (error) {
        console.error('❌ Erro ao carregar info do plano:', error);
        
        // Fallback original
        setPlanInfo({
          displayName: 'Close Friends VIP',
          pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlanInfo();
  }, [user]); // Recarregar quando usuário mudar

  const hasAccessSync = (page: string): boolean => {
    if (!planInfo) {
      console.log('⏳ PlanInfo ainda carregando...');
      return true; // Se não carregou ainda, mostra tudo
    }
    
    if (!user) {
      console.log('❌ Usuário não logado');
      return false;
    }

    // Admin sempre tem acesso (incluindo Instagram)
    if (user.plan === 'ADMIN') {
      console.log('✅ Admin - acesso liberado para:', page);
      return true;
    }

    // 📱 Verificação específica para Instagram Admin
    if (page === 'admin-instagram') {
      const isInstagramAdmin = user.plan === 'ADMIN' || user.email === 'jacbdias@gmail.com';
      console.log(`📱 Verificando acesso Instagram Admin para ${user.email}:`, isInstagramAdmin);
      return isInstagramAdmin;
    }

    const hasAccess = planInfo.pages.includes(page);
    console.log(`🔍 Verificando acesso para "${page}":`, hasAccess);
    
    return hasAccess;
  };

  // Nova função específica para verificar conteúdos individuais
  const hasContentAccess = (contentId: string): boolean => {
    if (!user) {
      console.log('❌ Usuário não logado');
      return false;
    }
    
    if (user.plan === 'ADMIN') {
      console.log('✅ Admin - acesso liberado para conteúdo:', contentId);
      return true;
    }
    
    if (!planInfo) {
      console.log('⏳ PlanInfo ainda carregando...');
      return false;
    }

    const hasAccess = planInfo.pages.includes(contentId);
    console.log(`🔍 Verificando acesso para conteúdo "${contentId}":`, hasAccess);
    
    return hasAccess;
  };

  // 📱 Função específica para verificar acesso ao Instagram Admin
  const hasInstagramAdminAccess = (): boolean => {
    if (!user) {
      console.log('❌ Usuário não logado - sem acesso Instagram');
      return false;
    }

    const isInstagramAdmin = user.plan === 'ADMIN' || user.email === 'jacbdias@gmail.com';
    console.log(`📱 Verificando acesso Instagram Admin para ${user.email}:`, isInstagramAdmin);
    
    return isInstagramAdmin;
  };

  return {
    planInfo,
    loading,
    hasAccessSync,
    hasContentAccess, // Nova função para conteúdos específicos
    hasInstagramAdminAccess, // 📱 NOVA FUNÇÃO PARA INSTAGRAM
    user,
    debugInfo: {
      userPlan: user?.plan,
      customPermissions: user?.customPermissions,
      allPages: planInfo?.pages,
      isAdmin: user?.plan === 'ADMIN',
      hasInstagramAccess: user?.plan === 'ADMIN' || user?.email === 'jacbdias@gmail.com' // 📱 DEBUG INFO
    }
  };
}