// src/hooks/useFinancialData.ts
'use client';
import { useState, useEffect, useCallback } from 'react';

// 🎯 TIPOS PARA OS DADOS FINANCEIROS
export interface MarketData {
  ibovespa: { value: string; trend: 'up' | 'down'; diff: number };
  indiceSmall: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraHoje: { value: string; trend: 'up' | 'down'; diff: number };
  dividendYield: { value: string; trend: 'up' | 'down'; diff: number };
  ibovespaPeriodo: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraPeriodo: { value: string; trend: 'up' | 'down'; diff: number };
}

interface UseFinancialDataReturn {
  marketData: MarketData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFinancialData(): UseFinancialDataReturn {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Buscando dados do mercado via API...');
      
      const response = await fetch('/api/financial/market-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // ✅ Adicionar cache busting se necessário
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // ✅ VERIFICAR SE HÁ ERRO NA RESPOSTA (mesmo com status 200)
      if (data.error) {
        console.warn('⚠️ API retornou erro mas com status 200:', data.error);
        // Mesmo assim, usar os dados de fallback
      }
      
      console.log('✅ Dados do mercado recebidos:', data.marketData);
      setMarketData(data.marketData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro no useFinancialData:', err);
      
      // 🚨 FALLBACK LOCAL SE A API FALHAR COMPLETAMENTE
      console.log('📊 Usando fallback local devido ao erro na API');
      setMarketData({
        ibovespa: { value: "136.787", trend: "down", diff: -0.18 },
        indiceSmall: { value: "2.155", trend: "up", diff: 0.47 }, // SMLL Yahoo Finance
        carteiraHoje: { value: "88.7%", trend: "up", diff: 88.7 },
        dividendYield: { value: "7.4%", trend: "up", diff: 7.4 },
        ibovespaPeriodo: { value: "6.1%", trend: "up", diff: 6.1 },
        carteiraPeriodo: { value: "9.3%", trend: "up", diff: 9.3 },
      });
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // ⏰ ATUALIZAR DADOS A CADA 5 MINUTOS
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchData]);

  return {
    marketData,
    loading,
    error,
    refetch: fetchData,
  };
}
