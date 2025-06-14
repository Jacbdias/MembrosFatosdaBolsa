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
}

export function useIfixRealTime() {
  const [ifixData, setIfixData] = useState<IfixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const gerarFallback = useCallback(() => {
    const agora = new Date();
    const hora = agora.getHours();
    const min = agora.getMinutes();
    
    // Simulação mais realista baseada no horário
    const isHorarioComercial = hora >= 10 && hora <= 17;
    const variacao = (Math.random() - 0.5) * (isHorarioComercial ? 2.5 : 0.8);
    const valorBase = 3442;
    const novoValor = valorBase * (1 + variacao / 100);
    
    return {
      valor: novoValor,
      valorFormatado: Math.round(novoValor).toLocaleString('pt-BR'),
      variacao: valorBase * (variacao / 100),
      variacaoPercent: variacao,
      trend: variacao >= 0 ? 'up' as const : 'down' as const,
      timestamp: agora.toISOString(),
      fonte: 'FALLBACK_LOCAL',
      nota: `Dados simulados ${hora}:${min.toString().padStart(2, '0')}`
    };
  }, []);

  const buscarIfix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch('/api/ifix', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API retornou status ${res.status}`);
      }

      const data = await res.json();
      
      if (!data.ifix) {
        throw new Error('Dados IFIX não encontrados na resposta');
      }

      setIfixData(data.ifix);
      setError(null);

    } catch (err) {
      console.warn('Erro ao buscar IFIX, usando fallback:', err);
      
      // Usa fallback em caso de erro
      const fallbackData = gerarFallback();
      setIfixData(fallbackData);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Timeout na API - usando dados simulados');
      } else {
        setError('API indisponível - usando dados simulados');
      }
    } finally {
      setLoading(false);
    }
  }, [gerarFallback]);

  useEffect(() => {
    buscarIfix();
    
    // Atualiza a cada 3 minutos
    const interval = setInterval(buscarIfix, 3 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIfix]);

  return { ifixData, loading, error, refetch: buscarIfix };
}
