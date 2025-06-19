'use client';

import { useState, useEffect } from 'react';

export function useAuthAccess() {
  const [planInfo, setPlanInfo] = useState<{ displayName: string; pages: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        // Importação dinâmica para evitar problemas de SSR
        const { authClient } = await import('@/lib/auth/client');
        
        // Verificar se os métodos existem
        if (typeof authClient.getPlanInfo === 'function') {
          const info = await authClient.getPlanInfo();
          setPlanInfo(info);
        } else {
          console.error('authClient.getPlanInfo não existe');
          // Fallback para VIP
          setPlanInfo({
            displayName: 'Close Friends VIP',
            pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
          });
        }
      } catch (error) {
        console.error('Error loading plan info:', error);
        // Fallback para VIP
        setPlanInfo({
          displayName: 'Close Friends VIP',
          pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlanInfo();
  }, []);

  const hasAccessSync = (page: string): boolean => {
    if (!planInfo) return true; // Se não carregou ainda, mostra tudo
    return planInfo.pages.includes(page);
  };

  return {
    planInfo,
    loading,
    hasAccessSync
  };
}
