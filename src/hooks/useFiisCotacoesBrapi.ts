'use client';

import { useEffect, useState, useCallback } from 'react';

// Dados base dos FIIs
const baseFiis = [
  { id: '1', ticker: 'MALL11', avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png', setor: 'Shopping', dataEntrada: '26/01/2022', precoEntrada: 'R$ 118,37', dy: '10,09%', precoTeto: 'R$ 103,68' },
  { id: '2', ticker: 'KNSC11', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png', setor: 'Papel', dataEntrada: '24/05/2022', precoEntrada: 'R$ 9,31', dy: '11,52%', precoTeto: 'R$ 9,16' },
  { id: '3', ticker: 'KNHF11', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png', setor: 'Hedge Fund', dataEntrada: '20/12/2024', precoEntrada: 'R$ 76,31', dy: '12,17%', precoTeto: 'R$ 90,50' },
  { id: '4', ticker: 'HGBS11', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png', setor: 'Shopping', dataEntrada: '02/01/2025', precoEntrada: 'R$ 186,08', dy: '10,77%', precoTeto: 'R$ 19,20' },
  // ... adicione os demais FIIs como nos dados estáticos anteriores
];

const calcularVies = (precoAtual: number, precoTeto: string) => {
  const teto = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  return precoAtual < teto ? 'Compra' : 'Aguardar';
};

const calcularDY = (dyOriginal: string, precoEntrada: string, precoAtual: number) => {
  const dyNum = parseFloat(dyOriginal.replace('%', '').replace(',', '.'));
  const precoEntradaNum = parseFloat(precoEntrada.replace('R$ ', '').replace(',', '.'));
  const valorRendimento = (dyNum / 100) * precoEntradaNum;
  const novoDY = (valorRendimento / precoAtual) * 100;
  return `${novoDY.toFixed(2).replace('.', ',')}%`;
};

export function useFiisCotacoesBrapi() {
  const [fiis, setFiis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCotacoes = useCallback(async () => {
    try {
      setLoading(true);

      const token = 'jJrMYVy9MATGEicx3GxBp8';
      const tickers = baseFiis.map(fii => fii.ticker).join(',');
      const url = `https://brapi.dev/api/quote/${tickers}?token=${token}`;

      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });

      const json = await res.json();
      const dataMap = new Map();

      for (const result of json.results) {
        if (result.symbol && result.regularMarketPrice) {
          dataMap.set(result.symbol, result.regularMarketPrice);
        }
      }

      const atualizados = baseFiis.map(fii => {
        const precoAtual = dataMap.get(fii.ticker);
        const precoAtualNum = precoAtual || parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'));

        return {
          ...fii,
          precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
          performance: ((precoAtualNum - parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'))) / parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'))) * 100,
          vies: calcularVies(precoAtualNum, fii.precoTeto),
          dy: calcularDY(fii.dy, fii.precoEntrada, precoAtualNum)
        };
      });

      setFiis(atualizados);
    } catch (e) {
      console.error('Erro ao buscar cotações dos FIIs:', e);
      setFiis(baseFiis.map(fii => ({ ...fii, precoAtual: fii.precoEntrada, performance: 0, vies: 'Aguardar' })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCotacoes();
    const interval = setInterval(fetchCotacoes, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCotacoes]);

  return { fiis, loading };
}
