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
  { id: '7', avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png', ticker: 'BPFF11', setor: 'FOF', dataEntrada: '08/01/2024', precoEntrada: 'R$ 72,12', dy: '12,26%', precoTeto: 'R$ 66,26' },
  { id: '8', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png', ticker: 'HGFF11', setor: 'FoF', dataEntrada: '03/04/2023', precoEntrada: 'R$ 69,15', dy: '11,12%', precoTeto: 'R$ 73,59' },
  { id: '9', avatar: 'https://www.ivalor.com.br/media/emp/logos/BRCO.png', ticker: 'BRCO11', setor: 'Logística', dataEntrada: '09/05/2022', precoEntrada: 'R$ 99,25', dy: '10,18%', precoTeto: 'R$ 109,89' },
  { id: '10', avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png', ticker: 'XPML11', setor: 'Shopping', dataEntrada: '16/02/2022', precoEntrada: 'R$ 93,32', dy: '10,58%', precoTeto: 'R$ 110,40' },
  { id: '11', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png', ticker: 'HGLG11', setor: 'Logística', dataEntrada: '20/06/2022', precoEntrada: 'R$ 161,80', dy: '8,62%', precoTeto: 'R$ 146,67' },
  { id: '12', avatar: 'https://www.ivalor.com.br/media/emp/logos/HSML.png', ticker: 'HSML11', setor: 'Shopping', dataEntrada: '14/06/2022', precoEntrada: 'R$ 78,00', dy: '10,86%', precoTeto: 'R$ 93,60' },
  { id: '13', avatar: 'https://www.ivalor.com.br/media/emp/logos/VGIP.png', ticker: 'VGIP11', setor: 'Papel', dataEntrada: '02/12/2021', precoEntrada: 'R$ 96,99', dy: '12,51%', precoTeto: 'R$ 88,00' },
  { id: '14', avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png', ticker: 'AFHI11', setor: 'Papel', dataEntrada: '05/07/2022', precoEntrada: 'R$ 99,91', dy: '12,25%', precoTeto: 'R$ 93,20' },
  { id: '15', avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png', ticker: 'BTLG11', setor: 'Logística', dataEntrada: '05/01/2022', precoEntrada: 'R$ 103,14', dy: '9,56%', precoTeto: 'R$ 104,00' },
  { id: '16', avatar: 'https://www.ivalor.com.br/media/emp/logos/VRTA.png', ticker: 'VRTA11', setor: 'Papel', dataEntrada: '27/12/2022', precoEntrada: 'R$ 88,30', dy: '12,30%', precoTeto: 'R$ 94,33' },
  { id: '17', avatar: 'https://www.ivalor.com.br/media/emp/logos/LVBI.png', ticker: 'LVBI11', setor: 'Logística', dataEntrada: '18/10/2022', precoEntrada: 'R$ 113,85', dy: '10,82%', precoTeto: 'R$ 122,51' },
  { id: '18', avatar: 'https://www.ivalor.com.br/media/emp/logos/HGRU.png', ticker: 'HGRU11', setor: 'Renda Urbana', dataEntrada: '17/05/2022', precoEntrada: 'R$ 115,00', dy: '10,35%', precoTeto: 'R$ 138,57' },
  { id: '19', avatar: 'https://www.ivalor.com.br/media/emp/logos/ALZR.png', ticker: 'ALZR11', setor: 'Híbrido', dataEntrada: '02/02/2022', precoEntrada: 'R$ 115,89', dy: '9,14%', precoTeto: 'R$ 10,16' },
  { id: '20', avatar: 'https://www.ivalor.com.br/media/emp/logos/BCRI.png', ticker: 'BCRI11', setor: 'Papel', dataEntrada: '25/11/2021', precoEntrada: 'R$ 104,53', dy: '14,71%', precoTeto: 'R$ 87,81' },
  { id: '21', avatar: 'https://www.ivalor.com.br/media/emp/logos/KNRI.png', ticker: 'KNRI11', setor: 'Híbrido', dataEntrada: '27/06/2022', precoEntrada: 'R$ 131,12', dy: '8,82%', precoTeto: 'R$ 146,67' },
  { id: '22', avatar: 'https://www.ivalor.com.br/media/emp/logos/IRDM.png', ticker: 'IRDM11', setor: 'Papel', dataEntrada: '05/01/2022', precoEntrada: 'R$ 107,04', dy: '13,21%', precoTeto: 'R$ 73,20' },
  { id: '23', avatar: 'https://www.ivalor.com.br/media/emp/logos/MXRF.png', ticker: 'MXRF11', setor: 'Papel', dataEntrada: '12/07/2022', precoEntrada: 'R$ 9,69', dy: '12,91%', precoTeto: 'R$ 9,40' }
];

export function useFiisCotacoesBrapi() {
  const [fiis, setFiis] = useState<FII[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const fetchCotacoes = useCallback(async () => {
    setLoading(true);
    setErro(null);
    
    const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN || '';
    const tickers = fiisBase.map(fii => fii.ticker);
    
    // Adiciona logs para debug
    console.log('🔍 Buscando cotações para:', tickers);
    console.log('🔑 Token configurado:', token ? 'Sim' : 'Não');
    
    const url = `https://brapi.dev/api/quote/${tickers.join(',')}?token=${token}`;
    console.log('📡 URL da API:', url.replace(token, 'TOKEN_OCULTO'));

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos da API:', data);

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Formato de resposta inválido - results não encontrado');
      }

      if (data.results.length === 0) {
        throw new Error('Nenhuma cotação retornada pela API');
      }

      // Mapeia as cotações com validação mais rigorosa
      const cotacoesMap = new Map();
      data.results.forEach((cotacao: any) => {
        console.log(`📈 Processando ${cotacao.symbol}:`, {
          symbol: cotacao.symbol,
          regularMarketPrice: cotacao.regularMarketPrice,
          currency: cotacao.currency,
          marketState: cotacao.marketState
        });

        if (cotacao.symbol && 
            typeof cotacao.regularMarketPrice === 'number' && 
            !isNaN(cotacao.regularMarketPrice) &&
            cotacao.regularMarketPrice > 0) {
          cotacoesMap.set(cotacao.symbol, cotacao);
        } else {
          console.warn(`⚠️ Cotação inválida para ${cotacao.symbol}:`, cotacao);
        }
      });

      console.log('✅ Cotações válidas encontradas:', Array.from(cotacoesMap.keys()));

      const atualizados: FII[] = fiisBase.map(fii => {
        const cotacao = cotacoesMap.get(fii.ticker);
        
        if (cotacao && cotacao.regularMarketPrice) {
          const precoAtualNum = cotacao.regularMarketPrice;
          const precoAtual = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          
          console.log(`💰 ${fii.ticker}: R$ ${precoAtualNum.toFixed(2)}`);
          
          return {
            ...fii,
            precoAtual,
            dy: calcularDY(fii.dy, fii.precoEntrada, precoAtualNum),
            vies: calcularVies(fii.precoTeto, precoAtual)
          };
        } else {
          console.warn(`❌ Usando preço de entrada para ${fii.ticker} - cotação não encontrada`);
          return {
            ...fii,
            precoAtual: fii.precoEntrada,
            dy: fii.dy,
            vies: calcularVies(fii.precoTeto, fii.precoEntrada)
          };
        }
      });

      setFiis(atualizados);
      console.log('🎯 FIIs atualizados com sucesso:', atualizados.length);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar cotações:', errorMessage);
      setErro(errorMessage);
      
      // Fallback com dados estáticos
      const fallbackData = fiisBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        dy: fii.dy,
        vies: calcularVies(fii.precoTeto, fii.precoEntrada)
      }));
      
      setFiis(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCotacoes();
    
    // Atualiza a cada 5 minutos durante horário comercial
    const interval = setInterval(() => {
      const agora = new Date();
      const hora = agora.getHours();
      const diaSemana = agora.getDay();
      
      // Segunda a sexta, das 9h às 18h
      if (diaSemana >= 1 && diaSemana <= 5 && hora >= 9 && hora <= 18) {
        fetchCotacoes();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [fetchCotacoes]);

  return { fiis, loading, erro, refetch: fetchCotacoes };
}
