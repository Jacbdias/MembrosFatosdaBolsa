import { useState, useEffect, useCallback } from 'react';

export function useIfixRealTime() {
  const [ifixData, setIfixData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buscarIfix = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/ifix');
      const data = await res.json();

      if (!data.results || !data.results.stocks || !data.results.stocks.IFIX) {
        throw new Error('IFIX não encontrado');
      }

      const ifixHG = data.results.stocks.IFIX;

      const dados = {
        valor: ifixHG.points,
        valorFormatado: Math.round(ifixHG.points).toLocaleString('pt-BR'),
        variacao: ifixHG.variation || 0,
        variacaoPercent: ifixHG.variation || 0,
        trend: (ifixHG.variation || 0) >= 0 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        fonte: 'HG_BRASIL_PROXY',
        nota: 'Via API interna do projeto'
      };

      setIfixData(dados);
    } catch (err) {
      const agora = new Date();
      const hora = agora.getHours();
      const min = agora.getMinutes();
      const variacao = (Math.random() - 0.5) * (hora >= 10 && hora <= 17 ? 2 : 0.6);
      const valorBase = 3442;
      const novoValor = valorBase * (1 + variacao / 100);

      setIfixData({
        valor: novoValor,
        valorFormatado: Math.round(novoValor).toLocaleString('pt-BR'),
        variacao: valorBase * (variacao / 100),
        variacaoPercent: variacao,
        trend: variacao >= 0 ? 'up' : 'down',
        timestamp: agora.toISOString(),
        fonte: 'FALLBACK_HORARIO_INTELIGENTE',
        nota: `Fallback local ${hora}:${min.toString().padStart(2, '0')}`
      });

      setError('API HG Brasil indisponível. Usando fallback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    buscarIfix();
    const interval = setInterval(buscarIfix, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarIfix]);

  return { ifixData, loading, error };
}
