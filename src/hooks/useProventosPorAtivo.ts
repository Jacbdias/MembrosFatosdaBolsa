// 💰 Hook para buscar proventos de um ativo específico via API
'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProventoAtivo {
  ticker: string;
  valor: number;
  dataCom: string;
  dataPagamento?: string;
  tipo: string;
  dividendYield?: number;
  dataObj: Date;
}

interface UseProventosPorAtivoResult {
  proventos: ProventoAtivo[];
  totalProventos: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProventosPorAtivo(ticker: string, dataEntrada: string): UseProventosPorAtivoResult {
  const [proventos, setProventos] = useState<ProventoAtivo[]>([]);
  const [totalProventos, setTotalProventos] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buscarProventos = useCallback(async () => {
    if (!ticker || !dataEntrada) {
      setProventos([]);
      setTotalProventos(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`💰 [API] Buscando proventos para ${ticker} desde ${dataEntrada}`);

      // 📅 Converter data de entrada para formato API (YYYY-MM-DD)
      const [dia, mes, ano] = dataEntrada.split('/');
      const dataEntradaISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

      // 🌐 Buscar proventos via API (usando seu route existente)
      const response = await fetch(`/api/proventos/${ticker}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const proventosRaw = await response.json();
      
      if (!Array.isArray(proventosRaw)) {
        throw new Error('Formato de resposta inválido');
      }

      // 📅 Filtrar proventos a partir da data de entrada
      const dataEntradaDate = new Date(dataEntradaISO + 'T00:00:00');
      
      const proventosFiltrados = proventosRaw.filter((p: any) => {
        if (!p.dataObj) return false;
        const dataProvento = new Date(p.dataObj);
        return dataProvento >= dataEntradaDate;
      });

      // 📊 Processar dados da API
      const proventosProcessados: ProventoAtivo[] = proventosFiltrados.map((p: any) => ({
        ticker: p.ticker,
        valor: p.valor || 0,
        dataCom: p.dataCom || p.dataObj?.split('T')[0],
        dataPagamento: p.dataPagamento,
        tipo: p.tipo || 'dividendo',
        dividendYield: p.dividendYield,
        dataObj: new Date(p.dataObj)
      }));

      // 💰 Calcular total dos proventos
      const total = proventosProcessados.reduce((sum, p) => sum + p.valor, 0);

      setProventos(proventosProcessados);
      setTotalProventos(total);

      console.log(`✅ [API] ${ticker}: ${proventosProcessados.length} proventos, total R$ ${total.toFixed(2)}`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ [API] Erro ao buscar proventos para ${ticker}:`, errorMessage);
      setError(errorMessage);
      setProventos([]);
      setTotalProventos(0);
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada]);

  useEffect(() => {
    buscarProventos();
  }, [buscarProventos]);

  const refetch = useCallback(() => {
    buscarProventos();
  }, [buscarProventos]);

  return {
    proventos,
    totalProventos,
    loading,
    error,
    refetch
  };
}