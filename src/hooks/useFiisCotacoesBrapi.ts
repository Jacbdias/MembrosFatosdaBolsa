'use client';

import { useState, useEffect, useCallback } from 'react';

export interface FII {
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
  { id: '1', avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png', ticker: 'MALL11', setor: 'Shopping', dataEntrada: '26/01/2022', precoEntrada: 'R$ 118,37', dy: '10,09%', precoTeto: 'R$ 103,68' },
  { id: '2', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png', ticker: 'KNSC11', setor: 'Papel', dataEntrada: '24/05/2022', precoEntrada: 'R$ 9,31', dy: '11,52%', precoTeto: 'R$ 9,16' },
  { id: '3', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png', ticker: 'KNHF11', setor: 'Hedge Fund', dataEntrada: '20/12/2024', precoEntrada: 'R$ 76,31', dy: '12,17%', precoTeto: 'R$ 90,50' },
  { id: '4', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png', ticker: 'HGBS11', setor: 'Shopping', dataEntrada: '02/01/2025', precoEntrada: 'R$ 186,08', dy: '10,77%', precoTeto: 'R$ 19,20' },
  { id: '5', avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png', ticker: 'RURA11', setor: 'Fiagro', dataEntrada: '14/02/2023', precoEntrada: 'R$ 10,25', dy: '13,75%', precoTeto: 'R$ 8,70' },
  { id: '6', avatar: 'https://www.ivalor.com.br/media/emp/logos/BCIA.png', ticker: 'BCIA11', setor: 'FoF', dataEntrada: '12/04/2023', precoEntrada: 'R$ 82,28', dy: '11,80%', precoTeto: 'R$ 87,81' },
  { id: '7', avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png', ticker: 'BPFF11', setor: 'FoF', dataEntrada: '08/01/2024', precoEntrada: 'R$ 72,12', dy: '12,26%', precoTeto: 'R$ 66,26' },
  { id: '8', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png', ticker: 'HGFF11', setor: 'FoF', dataEntrada: '03/04/2023', precoEntrada: 'R$ 69,15', dy: '11,12%', precoTeto: 'R$ 73,59' },
  { id: '9', avatar: 'https://www.ivalor.com.br/media/emp/logos/BRCO.png', ticker: 'BRCO11', setor: 'Logística', dataEntrada: '09/05/2022', precoEntrada: 'R$ 99,25', dy: '10,18%', precoTeto: 'R$ 109,89' },
  { id: '10', avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png', ticker: 'XPML11', setor: 'Shopping', dataEntrada: '16/02/2022', precoEntrada: 'R$ 93,32', dy: '10,58%', precoTeto: 'R$ 110,40' },
  { id: '11', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png', ticker: 'HGLG11', setor: 'Logística', dataEntrada: '15/03/2022', precoEntrada: 'R$ 165,90', dy: '9,47%', precoTeto: 'R$ 172,60' },
  { id: '12', avatar: 'https://www.ivalor.com.br/media/emp/logos/HSML.png', ticker: 'HSML11', setor: 'Shopping', dataEntrada: '04/04/2022', precoEntrada: 'R$ 82,33', dy: '9,85%', precoTeto: 'R$ 89,12' },
  { id: '13', avatar: 'https://www.ivalor.com.br/media/emp/logos/VGIP.png', ticker: 'VGIP11', setor: 'Papel', dataEntrada: '08/06/2022', precoEntrada: 'R$ 9,78', dy: '12,04%', precoTeto: 'R$ 10,31' },
  { id: '14', avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png', ticker: 'AFHI11', setor: 'Papel', dataEntrada: '10/06/2022', precoEntrada: 'R$ 9,64', dy: '12,20%', precoTeto: 'R$ 9,85' },
  { id: '15', avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png', ticker: 'BTLG11', setor: 'Logística', dataEntrada: '28/07/2022', precoEntrada: 'R$ 107,89', dy: '10,14%', precoTeto: 'R$ 113,62' },
  { id: '16', avatar: 'https://www.ivalor.com.br/media/emp/logos/VRTA.png', ticker: 'VRTA11', setor: 'Papel', dataEntrada: '01/09/2022', precoEntrada: 'R$ 93,75', dy: '12,13%', precoTeto: 'R$ 98,47' },
  { id: '17', avatar: 'https://www.ivalor.com.br/media/emp/logos/LVBI.png', ticker: 'LVBI11', setor: 'Logística', dataEntrada: '10/10/2022', precoEntrada: 'R$ 108,43', dy: '9,86%', precoTeto: 'R$ 114,02' },
  { id: '18', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGRU.png', ticker: 'HGRU11', setor: 'Híbrido', dataEntrada: '21/11/2022', precoEntrada: 'R$ 125,80', dy: '10,19%', precoTeto: 'R$ 130,77' },
  { id: '19', avatar: 'https://www.ivalor.com.br/media/emp/logos/ALZR.png', ticker: 'ALZR11', setor: 'Híbrido', dataEntrada: '09/01/2023', precoEntrada: 'R$ 114,93', dy: '10,22%', precoTeto: 'R$ 119,34' },
  { id: '20', avatar: 'https://www.ivalor.com.br/media/emp/logos/BCRI.png', ticker: 'BCRI11', setor: 'Papel', dataEntrada: '03/03/2023', precoEntrada: 'R$ 10,56', dy: '13,21%', precoTeto: 'R$ 11,03' },
  { id: '21', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNRI.png', ticker: 'KNRI11', setor: 'Híbrido', dataEntrada: '15/05/2023', precoEntrada: 'R$ 156,32', dy: '9,50%', precoTeto: 'R$ 160,94' },
  { id: '22', avatar: 'https://www.ivalor.com.br/media/emp/logos/IRDM.png', ticker: 'IRDM11', setor: 'Papel', dataEntrada: '11/07/2023', precoEntrada: 'R$ 96,24', dy: '12,00%', precoTeto: 'R$ 101,45' },
  { id: '23', avatar: 'https://www.ivalor.com.br/media/emp/logos/MXRF.png', ticker: 'MXRF11', setor: 'Papel', dataEntrada: '18/09/2023', precoEntrada: 'R$ 10,13', dy: '13,18%', precoTeto: 'R$ 10,80' }
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

export { SettingsPage } from '@/components/dashboard/settings/settings-table';
