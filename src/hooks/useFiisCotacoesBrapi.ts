'use client';

import { useState, useEffect, useCallback } from 'react';

interface FII {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  dy: string;
  precoTeto: string;
  vies: string;
}

function calcularVies(precoTeto: string, precoAtual: string): string {
  const teto = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  const atual = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  if (isNaN(teto) || isNaN(atual)) return 'Aguardar';
  return atual < teto ? 'Compra' : 'Aguardar';
}

function calcularDY(dyOriginal: string, precoOriginal: string, precoAtual: number): string {
  const dyNum = parseFloat(dyOriginal.replace('%', '').replace(',', '.'));
  const precoOriginalNum = parseFloat(precoOriginal.replace('R$ ', '').replace(',', '.'));
  if (isNaN(dyNum) || isNaN(precoOriginalNum) || precoOriginalNum === 0) return dyOriginal;
  const valorDividendo = (dyNum / 100) * precoOriginalNum;
  const novoDY = (valorDividendo / precoAtual) * 100;
  return `${novoDY.toFixed(2).replace('.', ',')}%`;
}

const fiisBase: Omit<FII, 'precoAtual' | 'dy' | 'vies'>[] = [
  {
    id: '1', avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png', ticker: 'MALL11', setor: 'Shopping', dataEntrada: '26/01/2022', precoEntrada: 'R$ 118,37', dy: '10,09%', precoTeto: 'R$ 103,68'
  },
  {
    id: '2', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png', ticker: 'KNSC11', setor: 'Papel', dataEntrada: '24/05/2022', precoEntrada: 'R$ 9,31', dy: '11,52%', precoTeto: 'R$ 9,16'
  },
  {
    id: '3', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png', ticker: 'KNHF11', setor: 'Hedge Fund', dataEntrada: '20/12/2024', precoEntrada: 'R$ 76,31', dy: '12,17%', precoTeto: 'R$ 90,50'
  },
  {
    id: '4', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png', ticker: 'HGBS11', setor: 'Shopping', dataEntrada: '02/01/2025', precoEntrada: 'R$ 186,08', dy: '10,77%', precoTeto: 'R$ 19,20'
  },
  {
    id: '5', avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png', ticker: 'RURA11', setor: 'Fiagro', dataEntrada: '14/02/2023', precoEntrada: 'R$ 10,25', dy: '13,75%', precoTeto: 'R$ 8,70'
  },
  {
    id: '6', avatar: 'https://www.ivalor.com.br/media/emp/logos/BCIA.png', ticker: 'BCIA11', setor: 'FoF', dataEntrada: '12/04/2023', precoEntrada: 'R$ 82,28', dy: '11,80%', precoTeto: 'R$ 87,81'
  },
  {
    id: '7', avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png', ticker: 'BPFF11', setor: 'FoF', dataEntrada: '08/01/2024', precoEntrada: 'R$ 72,12', dy: '12,26%', precoTeto: 'R$ 66,26'
  },
  {
    id: '8', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png', ticker: 'HGFF11', setor: 'FoF', dataEntrada: '03/04/2023', precoEntrada: 'R$ 69,15', dy: '11,12%', precoTeto: 'R$ 73,59'
  },
  {
    id: '9', avatar: 'https://www.ivalor.com.br/media/emp/logos/BRCO.png', ticker: 'BRCO11', setor: 'Logística', dataEntrada: '09/05/2022', precoEntrada: 'R$ 99,25', dy: '10,18%', precoTeto: 'R$ 109,89'
  },
  {
    id: '10', avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png', ticker: 'XPML11', setor: 'Shopping', dataEntrada: '16/02/2022', precoEntrada: 'R$ 93,32', dy: '10,58%', precoTeto: 'R$ 110,40'
  }
];

export function useFiisCotacoesBrapi() {
  const [fiis, setFiis] = useState<FII[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCotacoes = useCallback(async () => {
    setLoading(true);
    const token = 'jJrMYVy9MATGEicx3GxBp8';
    const tickers = fiisBase.map(fii => fii.ticker);
    const url = `https://brapi.dev/api/quote/${tickers.join(',')}?token=${token}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results) throw new Error('Sem resultados');

      const cotacoesMap = new Map();
      data.results.forEach((fii: any) => {
        if (fii.symbol && fii.regularMarketPrice) {
          cotacoesMap.set(fii.symbol, fii);
        }
      });

      const atualizados: FII[] = fiisBase.map(fii => {
        const cotacao = cotacoesMap.get(fii.ticker);
        if (cotacao && cotacao.regularMarketPrice) {
          const precoAtualNum = cotacao.regularMarketPrice;
          const precoAtual = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          return {
            ...fii,
            precoAtual,
            dy: calcularDY(fii.dy, fii.precoEntrada, precoAtualNum),
            vies: calcularVies(fii.precoTeto, precoAtual)
          };
        } else {
          return {
            ...fii,
            precoAtual: fii.precoEntrada,
            dy: fii.dy,
            vies: calcularVies(fii.precoTeto, fii.precoEntrada)
          };
        }
      });

      setFiis(atualizados);
    } catch (err) {
      console.error('Erro ao buscar FIIs:', err);
      setFiis(fiisBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        dy: fii.dy,
        vies: calcularVies(fii.precoTeto, fii.precoEntrada)
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCotacoes();
  }, [fetchCotacoes]);

  return { fiis, loading };
}
