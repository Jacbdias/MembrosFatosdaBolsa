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
              pages: ['relatorio-semanal', 'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
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

        // 🔥 MAPEAMENTO INTERNO ATUALIZADO - Relatório Semanal em TODOS os planos
        const internalPlanPermissions = {
          'VIP': [
            'relatorio-semanal', // 📋 NOVO: Disponível para VIP
            'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks',
            'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
          ],
          'LITE': [
            'relatorio-semanal', // 📋 NOVO: Disponível para LITE
            'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          // ✅ ADICIONADO: Close Friends LITE 2.0
          'LITE_V2': [
            'relatorio-semanal', // 📋 NOVO: Disponível para LITE V2
            'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
            // Nota: Não inclui 'internacional' (diferença do LITE original)
          ],
          'RENDA_PASSIVA': [
            'relatorio-semanal', // 📋 NOVO: Disponível para Renda Passiva
            'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          'FIIS': [
            'relatorio-semanal', // 📋 NOVO: Disponível para FIIs
            'fundos-imobiliarios', 'rentabilidades',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
          ],
          'AMERICA': [
            'relatorio-semanal', // 📋 NOVO: Disponível para América
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
          ],
          'ADMIN': [
            'relatorio-semanal', // 📋 NOVO: Disponível para Admin
            'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
            'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos', 'internacional-projeto-america',
            'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks',
            'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram',
            'admin', 'admin-dashboard', 'admin-usuarios', 'admin-instagram', 'admin-empresas', 'admin-proventos',
            'admin-relatorios', 'admin-relatorio-semanal', 'admin-integracoes', 'admin-renovacoes', 'admin-settings', 'admin-logs' // 🆕 NOVO: admin-relatorio-semanal
          ]
        };

        // Pegar permissões base do plano
        const basePlanPages = basePlanInfo?.pages || internalPlanPermissions[user.plan] || ['relatorio-semanal']; // 📋 Fallback: pelo menos relatório
        
        // Pegar permissões customizadas do usuário
        const customPermissions = user.customPermissions || [];
        
        // 🔥 GARANTIR que 'relatorio-semanal' esteja sempre presente
        const guaranteedPages = ['relatorio-semanal'];
        
        // Combinar todas as permissões (sem duplicatas)
        const allPermissions = [...new Set([...guaranteedPages, ...basePlanPages, ...customPermissions])];
        
        console.log('📋 Permissões base do plano:', basePlanPages);
        console.log('🎯 Permissões customizadas:', customPermissions);
        console.log('✅ Permissões finais:', allPermissions);

        // Mapear nome do plano
        const planNames = {
          'VIP': 'Close Friends VIP',
          'LITE': 'Close Friends LITE', 
          'LITE_V2': 'Close Friends LITE 2.0', // ✅ ADICIONADO
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
        
        // 🔥 FALLBACK ATUALIZADO - Sempre incluir relatório semanal
        setPlanInfo({
          displayName: 'Close Friends VIP',
          pages: ['relatorio-semanal', 'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
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
      // 🔥 EXCEÇÃO: Relatório semanal disponível mesmo sem login
      if (page === 'relatorio-semanal') {
        console.log('📋 Relatório semanal - acesso público');
        return true;
      }
      return false;
    }

    // Admin sempre tem acesso (incluindo Instagram, Renovações e Relatório Semanal Admin)
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

    // 📊 Verificação específica para Renovações Admin
    if (page === 'admin-renovacoes') {
      const isRenovacoesAdmin = user.plan === 'ADMIN';
      console.log(`📊 Verificando acesso Renovações Admin para ${user.email}:`, isRenovacoesAdmin);
      return isRenovacoesAdmin;
    }

    // 📋 NOVA: Verificação específica para Relatório Semanal Admin
    if (page === 'admin-relatorio-semanal') {
      const isRelatorioAdmin = user.plan === 'ADMIN';
      console.log(`📋 Verificando acesso Relatório Semanal Admin para ${user.email}:`, isRelatorioAdmin);
      return isRelatorioAdmin;
    }

    // 📋 GARANTIR acesso ao relatório semanal para todos os usuários logados
    if (page === 'relatorio-semanal') {
      console.log('📋 Relatório semanal - acesso garantido para usuário logado');
      return true;
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

  // 📊 Função para verificar acesso às Renovações
  const hasRenovacoesAdminAccess = (): boolean => {
    if (!user) {
      console.log('❌ Usuário não logado - sem acesso Renovações');
      return false;
    }

    const isRenovacoesAdmin = user.plan === 'ADMIN';
    console.log(`📊 Verificando acesso Renovações Admin para ${user.email}:`, isRenovacoesAdmin);
    
    return isRenovacoesAdmin;
  };

  // 📋 NOVA: Função para verificar acesso ao Relatório Semanal Admin
  const hasRelatorioSemanalAdminAccess = (): boolean => {
    if (!user) {
      console.log('❌ Usuário não logado - sem acesso Relatório Semanal Admin');
      return false;
    }

    const isRelatorioAdmin = user.plan === 'ADMIN';
    console.log(`📋 Verificando acesso Relatório Semanal Admin para ${user.email}:`, isRelatorioAdmin);
    
    return isRelatorioAdmin;
  };

  return {
    planInfo,
    loading,
    hasAccessSync,
    hasContentAccess, // Nova função para conteúdos específicos
    hasInstagramAdminAccess, // 📱 FUNÇÃO PARA INSTAGRAM
    hasRenovacoesAdminAccess, // 📊 FUNÇÃO PARA RENOVAÇÕES
    hasRelatorioSemanalAdminAccess, // 📋 NOVA FUNÇÃO PARA RELATÓRIO SEMANAL ADMIN
    user,
    debugInfo: {
      userPlan: user?.plan,
      customPermissions: user?.customPermissions,
      allPages: planInfo?.pages,
      isAdmin: user?.plan === 'ADMIN',
      hasInstagramAccess: user?.plan === 'ADMIN' || user?.email === 'jacbdias@gmail.com', // 📱 DEBUG INFO
      hasRenovacoesAccess: user?.plan === 'ADMIN', // 📊 DEBUG INFO RENOVAÇÕES
      hasRelatorioSemanalAdminAccess: user?.plan === 'ADMIN' // 📋 DEBUG INFO RELATÓRIO SEMANAL ADMIN
    }
  };
}