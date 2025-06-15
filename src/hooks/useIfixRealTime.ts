// hooks/useIfixRealTime.ts
import { useState, useEffect, useCallback } from 'react';

interface IfixData {
  valor: number;
  valorFormatado: string;
  variacao: number;
  variacaoPercent: number;
  trend: 'up' | 'down';
  timestamp: string;
  fonte: string;
  nota: string;
  symbol?: string;
}

interface IfixResponse {
  ifix: IfixData;
  meta?: {
    source: string;
    timestamp: string;
    status: string;
    message?: string;
  };
}

export function useIfixRealTime() {
  const [ifixData, setIfixData] = useState<IfixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const buscarIfix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const res = await fetch('/api/dados', { // ← MUDANÇA AQUI
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API retornou status ${res.status}`);
      }

      const data: IfixResponse = await res.json();
      
      if (!data.ifix) {
        throw new Error('Dados IFIX não encontrados na resposta');
      }

      setIfixData(data.ifix);
      setLastUpdate(new Date());
      
      // Define mensagem de status baseada na fonte
      if (data.meta?.status === 'fallback') {
        setError('APIs externas indisponíveis - usando dados simulados');
      } else if (data.ifix.fonte.includes('SIMULAÇÃO')) {
        setError('Dados simulados (APIs indisponíveis)');
      } else {
        setError(null);
      }

      console.log('✅ IFIX atualizado:', {
        valor: data.ifix.valor,
        fonte: data.ifix.fonte,
        timestamp: data.ifix.timestamp
      });

    } catch (err) {
      console.error('❌ Erro ao buscar IFIX:', err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Timeout na requisição');
      } else {
        setError('Erro na comunicação com a API');
      }
      
      // Se não tem dados ainda, não deixa o usuário sem nada
      if (!ifixData) {
        const agora = new Date();
        const fallbackLocal: IfixData = {
          valor: 3440,
          valorFormatado: '3.440,00',
          variacao: 0,
          variacaoPercent: 0,
          trend: 'up',
          timestamp: agora.toISOString(),
          fonte: 'ERRO_FALLBACK',
          nota: 'Dados de emergência - API indisponível'
        };
        setIfixData(fallbackLocal);
      }
    } finally {
      setLoading(false);
    }
  }, [ifixData]);

  useEffect(() => {
    buscarIfix();
    
    // Atualiza a cada 2 minutos
    const interval = setInterval(buscarIfix, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const isDataFresh = lastUpdate && (Date.now() - lastUpdate.getTime()) < 5 * 60 * 1000; // 5 min

  return { 
    ifixData, 
    loading, 
    error, 
    lastUpdate,
    isDataFresh,
    refetch: buscarIfix 
  };
}
