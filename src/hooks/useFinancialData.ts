// src/hooks/useFinancialData.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketData } from '@/types/financial';

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

      console.log('🔄 Buscando dados do mercado...');

      const response = await fetch('/api/financial/market-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const { marketData } = await response.json();
      console.log('✅ Dados do mercado recebidos:', marketData);
      
      setMarketData(marketData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro no useFinancialData:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Atualizar dados a cada 5 minutos
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
