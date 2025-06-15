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
  success?: boolean;
  timestamp?: string;
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
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/dados-ifix', {
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
      
      if (!data.ifix && !data.success) {
        throw new Error('Dados IFIX não encontrados na resposta');
      }

      let ifixInfo: IfixData;
      
      if (data.ifix) {
        ifixInfo = data.ifix;
      } else {
        throw new Error('Formato de resposta inválido');
      }

      setIfixData(ifixInfo);
      setLastUpdate(new Date());
      
      if (data.meta?.status === 'fallback') {
        setError('APIs externas indisponíveis - usando dados simulados');
      } else if (ifixInfo.fonte.includes('SIMULAÇÃO')) {
        setError('Dados simulados (APIs indisponíveis)');
      } else {
        setError(null);
      }

      console.log('✅ IFIX atualizado:', {
        valor: ifixInfo.valor,
        fonte: ifixInfo.fonte,
        timestamp: ifixInfo.timestamp
      });

    } catch (err) {
      console.error('❌ Erro ao buscar IFIX:', err);
      
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Timeout na requisição');
      } else {
        setError('Erro na comunicação com a API');
      }
      
      // Só cria fallback se realmente não tem dados
      if (!ifixData) {
        const agora = new Date();
        const hora = agora.getHours();
        const minuto = agora.getMinutes();
        
        const isHorarioComercial = hora >= 9 && hora <= 18;
        const variacao = (Math.random() - 0.5) * (isHorarioComercial ? 2 : 0.5);
        const valorBase = 3440;
        const novoValor = valorBase * (1 + variacao / 100);
        
        const fallbackLocal: IfixData = {
          valor: novoValor,
          valorFormatado: novoValor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }),
          variacao: valorBase * (variacao / 100),
          variacaoPercent: variacao,
          trend: variacao >= 0 ? 'up' : 'down',
          timestamp: agora.toISOString(),
          fonte: 'ERRO_FALLBACK_LOCAL',
          nota: `Fallback local ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`
        };
        setIfixData(fallbackLocal);
      }
    } finally {
      setLoading(false);
    }
  }, []); // ← MUDANÇA: Array vazio remove dependência circular

  useEffect(() => {
    buscarIfix();
    
    // Atualiza a cada 2 minutos
    const interval = setInterval(buscarIfix, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // ← MUDANÇA: Array vazio, sem dependência do buscarIfix

  const isDataFresh = lastUpdate && (Date.now() - lastUpdate.getTime()) < 5 * 60 * 1000;

  return { 
    ifixData, 
    loading, 
    error, 
    lastUpdate,
    isDataFresh,
    refetch: buscarIfix 
  };
}
