'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress } from '@mui/material';
import { SettingsTable } from '@/components/dashboard/overview/settings-table';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IFIX VIA API
function useIFIXRealTime() {
  const [ifixData, setIfixData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIfixReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO IFIX REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO (MESMO DO SEU CÓDIGO)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR IFIX VIA BRAPI
      const ifixUrl = `https://brapi.dev/api/quote/IFIX?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 Buscando IFIX:', ifixUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));

      const response = await fetch(ifixUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IFIX-Real-Time-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta IFIX:', data);

        if (data.results && data.results.length > 0) {
          const ifixResult = data.results[0];
          
          const dadosIfix = {
            valor: ifixResult.regularMarketPrice,
            valorFormatado: Math.round(ifixResult.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ifixResult.regularMarketChange || 0,
            variacaoPercent: ifixResult.regularMarketChangePercent || 0,
            trend: (ifixResult.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI_REAL'
          };

          console.log('✅ IFIX PROCESSADO:', dadosIfix);
          setIfixData(dadosIfix);
          
        } else {
          throw new Error('Sem dados do IFIX na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar IFIX:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK: Usar valor aproximado baseado na B3
      console.log('🔄 Usando fallback com valor aproximado da B3...');
      const fallbackData = {
        valor: 3200,
        valorFormatado: '3.200',
        variacao: 8.45,
        variacaoPercent: 0.26,
        trend: 'up',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_B3'
      };
      setIfixData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIfixReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIfixReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIfixReal]);

  return { ifixData, loading, error, refetch: buscarIfixReal };
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesFII(precoTeto: string, precoAtual: string): string {
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
    return 'Aguardar';
  }
  
  return precoAtualNum < precoTetoNum ? 'Compra' : 'Aguardar';
}

// 🔥 DADOS BASE DOS FIIs COM MAPEAMENTO PARA TICKERS VÁLIDOS DA BRAPI
const fiisBase = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
    ticker: 'MALL11',
    tickerBrapi: 'MALL11',
    setor: 'Shopping',
    dataEntrada: '26/01/2022',
    precoEntrada: 'R$ 118,37',
    dy: '10,09%',
    precoTeto: 'R$ 103,68',
    rank: '1º'
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NSLU.png',
    ticker: 'NSLU11',
    tickerBrapi: 'NSLU11',
    setor: 'Papel',
    dataEntrada: '23/05/2022',
    precoEntrada: 'R$ 9,31',
    dy: '11,52%',
    precoTeto: 'R$ 9,16',
    rank: '2º'
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png',
    ticker: 'KNHF11',
    tickerBrapi: 'KNHF11',
    setor: 'Hedge Fund',
    dataEntrada: '20/12/2024',
    precoEntrada: 'R$ 76,31',
    dy: '12,17%',
    precoTeto: 'R$ 90,50',
    rank: '3º'
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png',
    ticker: 'HGBS11',
    tickerBrapi: 'HGBS11',
    setor: 'Shopping',
    dataEntrada: '02/01/2025',
    precoEntrada: 'R$ 186,08',
    dy: '10,77%',
    precoTeto: 'R$ 19,20',
    rank: '4º'
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png',
    ticker: 'RURA11',
    tickerBrapi: 'RURA11',
    setor: 'Fiagro',
    dataEntrada: '14/02/2023',
    precoEntrada: 'R$ 10,25',
    dy: '13,75%',
    precoTeto: 'R$ 8,70',
    rank: '5º'
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BDIA.png',
    ticker: 'BDIA11',
    tickerBrapi: 'BDIA11',
    setor: 'FoF',
    dataEntrada: '12/04/2023',
    precoEntrada: 'R$ 82,28',
    dy: '11,80%',
    precoTeto: 'R$ 87,81',
    rank: '6º'
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png',
    ticker: 'BPFF11',
    tickerBrapi: 'BPFF11',
    setor: 'FoF',
    dataEntrada: '08/01/2024',
    precoEntrada: 'R$ 72,12',
    dy: '12,26%',
    precoTeto: 'R$ 66,26',
    rank: '7º'
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png',
    ticker: 'HGFF11',
    tickerBrapi: 'HGFF11',
    setor: 'FoF',
    dataEntrada: '03/04/2023',
    precoEntrada: 'R$ 69,15',
    dy: '11,12%',
    precoTeto: 'R$ 73,59',
    rank: '8º'
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RBCO.png',
    ticker: 'RBCO11',
    tickerBrapi: 'RBCO11',
    setor: 'Logística',
    dataEntrada: '09/05/2022',
    precoEntrada: 'R$ 99,25',
    dy: '10,18%',
    precoTeto: 'R$ 109,89',
    rank: '9º'
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png',
    ticker: 'XPML11',
    tickerBrapi: 'XPML11',
    setor: 'Shopping',
    dataEntrada: '16/02/2022',
    precoEntrada: 'R$ 93,32',
    dy: '10,58%',
    precoTeto: 'R$ 110,40',
    rank: '10º'
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png',
    ticker: 'HGLG11',
    tickerBrapi: 'HGLG11',
    setor: 'Logística',
    dataEntrada: '20/06/2022',
    precoEntrada: 'R$ 161,80',
    dy: '8,62%',
    precoTeto: 'R$ 146,67',
    rank: '11º'
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HSML.png',
    ticker: 'HSML11',
    tickerBrapi: 'HSML11',
    setor: 'Shopping',
    dataEntrada: '14/06/2022',
    precoEntrada: 'R$ 78,00',
    dy: '10,86%',
    precoTeto: 'R$ 93,60',
    rank: '12º'
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VGIP.png',
    ticker: 'VGIP11',
    tickerBrapi: 'VGIP11',
    setor: 'Papel',
    dataEntrada: '02/12/2021',
    precoEntrada: 'R$ 96,99',
    dy: '12,51%',
    precoTeto: 'R$ 88,00',
    rank: '13º'
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png',
    ticker: 'AFHI11',
    tickerBrapi: 'AFHI11',
    setor: 'Papel',
    dataEntrada: '05/07/2022',
    precoEntrada: 'R$ 99,91',
    dy: '12,25%',
    precoTeto: 'R$ 93,20',
    rank: '14º'
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png',
    ticker: 'BTLG11',
    tickerBrapi: 'BTLG11',
    setor: 'Logística',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 103,14',
    dy: '9,56%',
    precoTeto: 'R$ 104,00',
    rank: '15º'
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VTAL.png',
    ticker: 'VTAL11',
    tickerBrapi: 'VTAL11',
    setor: 'Papel',
    dataEntrada: '27/12/2022',
    precoEntrada: 'R$ 88,30',
    dy: '12,30%',
    precoTeto: 'R$ 94,33',
    rank: '16º'
  },
  {
    id: '17',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LVBI.png',
    ticker: 'LVBI11',
    tickerBrapi: 'LVBI11',
    setor: 'Logística',
    dataEntrada: '18/10/2022',
    precoEntrada: 'R$ 113,85',
    dy: '10,82%',
    precoTeto: 'R$ 122,51',
    rank: '17º'
  },
  {
    id: '18',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGRU.png',
    ticker: 'HGRU11',
    tickerBrapi: 'HGRU11',
    setor: 'Renda Urbana',
    dataEntrada: '17/05/2022',
    precoEntrada: 'R$ 115,00',
    dy: '10,35%',
    precoTeto: 'R$ 138,57',
    rank: '18º'
  },
  {
    id: '19',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALZR.png',
    ticker: 'ALZR11',
    tickerBrapi: 'ALZR11',
    setor: 'Híbrido',
    dataEntrada: '02/02/2022',
    precoEntrada: 'R$ 115,89',
    dy: '9,14%',
    precoTeto: 'R$ 10,16',
    rank: '19º'
  },
  {
    id: '20',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RBRI.png',
    ticker: 'RBRI11',
    tickerBrapi: 'RBRI11',
    setor: 'Papel',
    dataEntrada: '25/11/2021',
    precoEntrada: 'R$ 104,53',
    dy: '14,71%',
    precoTeto: 'R$ 87,81',
    rank: '20º'
  },
  {
    id: '21',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNRI.png',
    ticker: 'KNRI11',
    tickerBrapi: 'KNRI11',
    setor: 'Híbrido',
    dataEntrada: '27/06/2022',
    precoEntrada: 'R$ 131,12',
    dy: '8,82%',
    precoTeto: 'R$ 146,67',
    rank: '21º'
  },
  {
    id: '22',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/IRDM.png',
    ticker: 'IRDM11',
    tickerBrapi: 'IRDM11',
    setor: 'Papel',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 107,04',
    dy: '13,21%',
    precoTeto: 'R$ 73,20',
    rank: '22º'
  },
  {
    id: '23',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MXRF.png',
    ticker: 'MXRF11',
    tickerBrapi: 'MXRF11',
    setor: 'Papel',
    dataEntrada: '12/07/2022',
    precoEntrada: 'R$ 9,69',
    dy: '12,91%',
    precoTeto: 'R$ 9,40',
    rank: '23º'
  }
];

// 🚀 HOOK PARA BUSCAR COTAÇÕES REAIS DA BRAPI - PADRÃO DOS FIIs
function useBrapiFIIsCotacoes() {
  const [fiisAtualizados, setFiisAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarCotacoes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES DOS FIIs COM PADRÃO FUNCIONANDO');

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = fiisBase.map(fii => fii.tickerBrapi);
      console.log('🎯 Tickers FIIs para buscar:', tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES COM TOKEN
      const LOTE_SIZE = 5;
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        
        // 🔑 URL COM TOKEN DE AUTENTICAÇÃO VALIDADO
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`;
        
        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'FIIs-Portfolio-App'
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
                console.log(`🔍 Processando: ${quote.symbol}`);
                
                if (quote.symbol && quote.regularMarketPrice && quote.regularMarketPrice > 0) {
                  cotacoesMap.set(quote.symbol, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName
                  });
                  sucessosTotal++;
                  console.log(`✅ ${quote.symbol}: R$ ${quote.regularMarketPrice}`);
                } else {
                  console.warn(`⚠️ ${quote.symbol}: Dados inválidos`);
                  falhasTotal++;
                }
              });
            }
          } else {
            console.error(`❌ Erro HTTP ${response.status} para lote: ${lote.join(', ')}`);
            falhasTotal += lote.length;
          }
        } catch (loteError) {
          console.error(`❌ Erro no lote ${lote.join(', ')}:`, loteError);
          falhasTotal += lote.length;
        }

        // DELAY entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ Total processado: ${sucessosTotal} sucessos, ${falhasTotal} falhas`);

      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const fiisComCotacoes = fiisBase.map((fii) => {
        const cotacao = cotacoesMap.get(fii.tickerBrapi);
        
        if (cotacao && cotacao.precoAtual > 0) {
          const precoAtualFormatado = `R$ ${cotacao.precoAtual.toFixed(2).replace('.', ',')}`;
          
          return {
            ...fii,
            precoAtual: precoAtualFormatado,
            performance: 0, // Calculado automaticamente pelo componente
            vies: calcularViesFII(fii.precoTeto, precoAtualFormatado)
          };
        } else {
          return {
            ...fii,
            precoAtual: fii.precoEntrada,
            performance: 0,
            vies: calcularViesFII(fii.precoTeto, fii.precoEntrada)
          };
        }
      });

      setFiisAtualizados(fiisComCotacoes);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações FIIs:', err);
      
      // 🔄 FALLBACK: USAR DADOS ESTÁTICOS
      const fiisFallback = fiisBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        performance: 0,
        vies: calcularViesFII(fii.precoTeto, fii.precoEntrada)
      }));
      setFiisAtualizados(fiisFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarCotacoes();

    // ATUALIZAR A CADA 10 MINUTOS
    const interval = setInterval(buscarCotacoes, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarCotacoes]);

  return {
    fiisAtualizados,
    loading,
    error,
    refetch: buscarCotacoes,
  };
}

export default function SettingsPage(): React.JSX.Element {
  console.log("🏢 PÁGINA SETTINGS - VERSÃO COM FIIs E IFIX DINÂMICO");

  const { fiisAtualizados, loading: fiisLoading, error: fiisError } = useBrapiFIIsCotacoes();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIFIXRealTime();

  // 🔥 CONSTRUIR DADOS DOS CARDS COM IFIX DINÂMICO
  const construirDadosCards = () => {
    const dadosBase = {
      carteiraHoje: { value: "1.24%", trend: "up" as const, diff: 1.24 },
      dividendYield: { value: "11.85%", trend: "up" as const, diff: 11.85 },
      carteiraPeriodo: { value: "15.67%", trend: "up" as const, diff: 15.67 },
    };

    // 🎯 USAR DADOS REAIS DO IFIX SE DISPONÍVEL
    if (ifixData) {
      console.log('🔥 USANDO IFIX REAL:', ifixData);
      return {
        ...dadosBase,
        ifix: {
          value: ifixData.valorFormatado,
          trend: ifixData.trend,
          diff: ifixData.variacaoPercent
        }
      };
    }

    // 🔄 FALLBACK FINAL
    return {
      ...dadosBase,
      ifix: { value: "3.200", trend: "up" as const, diff: 0.26 }
    };
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DOS FIIs
  const calcularDYFIIs = () => {
    if (fiisAtualizados.length === 0) return { value: "11.85%", trend: "up" as const };
    
    const dyValues = fiisAtualizados
      .map(fii => parseFloat(fii.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return { value: "11.85%", trend: "up" as const };
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(2)}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // 🔥 CONSTRUIR DADOS FINAIS COM CÁLCULOS DINÂMICOS
  const dadosCards = {
    ...construirDadosCards(),
    dividendYield: calcularDYFIIs(),
  };

  // LOADING STATE
  if (fiisLoading || ifixLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando dados reais dos FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <SettingsTable 
          count={fiisAtualizados.length} 
          rows={fiisAtualizados}
          page={0} 
          rowsPerPage={10}
        />
      </Grid>
    </Grid>
  );
}
