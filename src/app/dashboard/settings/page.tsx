/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { OverviewTable } from '@/components/dashboard/overview/overview-table';

// 🔥 IMPORTAR O HOOK PARA DADOS FINANCEIROS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesAutomatico(precoTeto: string, precoAtual: number): string {
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  
  if (isNaN(precoTetoNum) || isNaN(precoAtual)) {
    return 'Aguardar';
  }
  
  if (precoTetoNum > precoAtual) {
    return 'Compra';
  } else {
    return 'Aguardar';
  }
}

// 🎯 FUNÇÃO PARA CALCULAR DIVIDEND YIELD BASEADO NO PREÇO ATUAL
function calcularDYAtualizado(dyOriginal: string, precoOriginal: string, precoAtual: number): string {
  try {
    const dyNum = parseFloat(dyOriginal.replace('%', '').replace(',', '.'));
    const precoOriginalNum = parseFloat(precoOriginal.replace('R$ ', '').replace(',', '.'));
    
    if (isNaN(dyNum) || isNaN(precoOriginalNum) || precoOriginalNum === 0) {
      return dyOriginal;
    }
    
    const valorDividendo = (dyNum / 100) * precoOriginalNum;
    const novoDY = (valorDividendo / precoAtual) * 100;
    
    return `${novoDY.toFixed(2).replace('.', ',')}%`;
  } catch {
    return dyOriginal;
  }
}

const ativosBase = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    ticker: 'ALOS3',
    setor: 'Shoppings',
    dataEntrada: '15/01/2021',
    precoEntrada: 'R$ 26,68',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
    ticker: 'TUPY3',
    setor: 'Industrial',
    dataEntrada: '04/11/2020',
    precoEntrada: 'R$ 20,36',
    dy: '1,71%',
    precoTeto: 'R$ 31,50',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    ticker: 'RECV3',
    setor: 'Petróleo',
    dataEntrada: '23/07/2023',
    precoEntrada: 'R$ 22,29',
    dy: '11,07%',
    precoTeto: 'R$ 31,37',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    ticker: 'CSED3',
    setor: 'Educação',
    dataEntrada: '10/12/2023',
    precoEntrada: 'R$ 4,49',
    dy: '4,96%',
    precoTeto: 'R$ 8,35',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PRIO.png',
    ticker: 'PRIO3',
    setor: 'Petróleo',
    dataEntrada: '04/08/2022',
    precoEntrada: 'R$ 23,35',
    dy: '0,18%',
    precoTeto: 'R$ 48,70',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RAPT.png',
    ticker: 'RAPT4',
    setor: 'Industrial',
    dataEntrada: '16/09/2021',
    precoEntrada: 'R$ 16,69',
    dy: '4,80%',
    precoTeto: 'R$ 14,00',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
    ticker: 'SMTO3',
    setor: 'Sucroenergetico',
    dataEntrada: '10/11/2022',
    precoEntrada: 'R$ 28,20',
    dy: '3,51%',
    precoTeto: 'R$ 35,00',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FESA.png',
    ticker: 'FESA4',
    setor: 'Commodities',
    dataEntrada: '11/12/2020',
    precoEntrada: 'R$ 4,49',
    dy: '5,68%',
    precoTeto: 'R$ 14,07',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/UNIP.png',
    ticker: 'UNIP6',
    setor: 'Químico',
    dataEntrada: '08/12/2020',
    precoEntrada: 'R$ 42,41',
    dy: '6,77%',
    precoTeto: 'R$ 117,90',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FLRY.png',
    ticker: 'FLRY3',
    setor: 'Saúde',
    dataEntrada: '19/05/2022',
    precoEntrada: 'R$ 14,63',
    dy: '5,20%',
    precoTeto: 'R$ 17,50',
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EZTC.png',
    ticker: 'EZTC3',
    setor: 'Construção Civil',
    dataEntrada: '07/10/2022',
    precoEntrada: 'R$ 22,61',
    dy: '7,83%',
    precoTeto: 'R$ 30,00',
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/JALL.png',
    ticker: 'JALL3',
    setor: 'Sucroenergetico',
    dataEntrada: '17/06/2022',
    precoEntrada: 'R$ 8,36',
    dy: '1,15%',
    precoTeto: 'R$ 11,90',
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/YDUQ.png',
    ticker: 'YDUQ3',
    setor: 'Educação',
    dataEntrada: '11/11/2020',
    precoEntrada: 'R$ 27,16',
    dy: '2,64%',
    precoTeto: 'R$ 15,00',
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SIMH.png',
    ticker: 'SIMH3',
    setor: 'Logística',
    dataEntrada: '03/12/2020',
    precoEntrada: 'R$ 7,98',
    dy: '0,00%',
    precoTeto: 'R$ 10,79',
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
    ticker: 'ALUP11',
    setor: 'Energia',
    dataEntrada: '25/11/2020',
    precoEntrada: 'R$ 24,40',
    dy: '4,46%',
    precoTeto: 'R$ 29,00',
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NEOE.png',
    ticker: 'NEOE3',
    setor: 'Energia',
    dataEntrada: '04/05/2021',
    precoEntrada: 'R$ 15,94',
    dy: '4,29%',
    precoTeto: 'R$ 21,00',
  },
];

// 🎯 HOOK OTIMIZADO PARA BUSCAR COTAÇÕES DA BRAPI
function useBrapiQuotesDireto() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string>('');
  const [debugInfo, setDebugInfo] = React.useState<any>({});

  const fetchQuotes = React.useCallback(async () => {
    const startTime = performance.now();
    
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 INICIANDO BUSCA DE COTAÇÕES DA BRAPI');
      console.log(`📅 Timestamp: ${new Date().toISOString()}`);

      // 🔑 TOKEN BRAPI VALIDADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = ativosBase.map(ativo => ativo.ticker);
      console.log(`🎯 ${tickers.length} Tickers para buscar:`, tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES - OTIMIZADO
      const LOTE_SIZE = 4; // Reduzido para 4 para ser mais conservador
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;
      const detalhesDebug = [];

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        const loteNum = Math.floor(i/LOTE_SIZE) + 1;
        
        // 🔑 URL OTIMIZADA
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}`;
        
        console.log(`\n🔍 === LOTE ${loteNum}/${Math.ceil(tickers.length/LOTE_SIZE)} ===`);
        console.log(`📋 Tickers: ${lote.join(', ')}`);
        console.log(`🌐 URL: ${apiUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO')}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Portfolio-App',
              'Cache-Control': 'no-cache'
            }
          });

          console.log(`📊 Status HTTP: ${response.status} ${response.statusText}`);

          if (response.ok) {
            const apiData = await response.json();
            console.log(`✅ Dados recebidos:`, apiData);

            const loteInfo = {
              lote: loteNum,
              tickers: lote,
              status: response.status,
              resultados: 0,
              dados: apiData
            };

            if (apiData.results && Array.isArray(apiData.results)) {
              console.log(`📈 Processando ${apiData.results.length} resultados:`);
              
              apiData.results.forEach((quote: any, index: number) => {
                console.log(`\n--- RESULTADO ${index + 1} ---`);
                console.log(`🏢 Symbol: ${quote.symbol}`);
                console.log(`💰 Preço: ${quote.regularMarketPrice}`);
                console.log(`📈 Variação: ${quote.regularMarketChangePercent}%`);
                console.log(`📅 Última atualização: ${quote.regularMarketTime}`);
                
                if (quote.symbol && quote.regularMarketPrice != null && quote.regularMarketPrice > 0) {
                  cotacoesMap.set(quote.symbol, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    tempo: quote.regularMarketTime,
                    dadosCompletos: quote
                  });
                  sucessosTotal++;
                  loteInfo.resultados++;
                  console.log(`✅ ${quote.symbol}: R$ ${quote.regularMarketPrice} - PROCESSADO`);
                } else {
                  console.warn(`⚠️ ${quote.symbol || 'UNKNOWN'}: Dados inválidos`);
                  console.warn(`   Preço: ${quote.regularMarketPrice}`);
                  console.warn(`   Tipo preço: ${typeof quote.regularMarketPrice}`);
                  falhasTotal++;
                }
              });
            } else {
              console.warn(`⚠️ Lote ${loteNum}: Sem array 'results' na resposta`);
              falhasTotal += lote.length;
            }

            detalhesDebug.push(loteInfo);

          } else {
            console.error(`❌ Erro HTTP ${response.status} para lote ${loteNum}`);
            
            try {
              const errorText = await response.text();
              console.error(`📄 Resposta de erro:`, errorText);
            } catch (e) {
              console.error(`📄 Erro ao ler resposta de erro:`, e);
            }
            
            falhasTotal += lote.length;
          }
        } catch (loteError) {
          console.error(`❌ Erro de rede no lote ${loteNum}:`, loteError);
          falhasTotal += lote.length;
        }

        // DELAY PROGRESSIVO - mais conservador
        const delay = 800; // 800ms entre lotes
        console.log(`⏱️ Aguardando ${delay}ms antes do próximo lote...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const endTime = performance.now();
      const tempoTotal = Math.round(endTime - startTime);

      console.log(`\n📊 === ESTATÍSTICAS FINAIS ===`);
      console.log(`✅ Sucessos: ${sucessosTotal}`);
      console.log(`❌ Falhas: ${falhasTotal}`);
      console.log(`⏱️ Tempo total: ${tempoTotal}ms`);
      console.log(`🗺️ Cotações encontradas:`, Array.from(cotacoesMap.keys()));

      // 🔥 PROCESSAR DADOS FINAIS
      const portfolioAtualizado = ativosBase.map((ativo) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        console.log(`\n🔄 === PROCESSANDO ${ativo.ticker} ===`);
        console.log(`💵 Preço entrada: R$ ${precoEntradaNum.toFixed(2)}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`💰 Preço atual (API): R$ ${precoAtualNum.toFixed(2)}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          console.log(`🎯 Preço teto: ${ativo.precoTeto}`);
          
          // VERIFICAÇÃO DE SANIDADE DOS DADOS
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 300) { // Reduzido de 500 para 300
            console.warn(`🚨 ${ativo.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}%`);
            console.warn(`🚨 Usando preço de entrada como fallback`);
            
            return {
              ...ativo,
              precoAtual: ativo.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
              dy: ativo.dy,
              statusApi: 'suspicious_price',
              ultimaAtualizacao: new Date().toISOString()
            };
          }
          
          const viasCalculado = calcularViesAutomatico(ativo.precoTeto, precoAtualNum);
          const dyAtualizado = calcularDYAtualizado(ativo.dy, ativo.precoEntrada, precoAtualNum);
          
          console.log(`🎯 Viés calculado: ${viasCalculado}`);
          console.log(`💎 DY atualizado: ${dyAtualizado}`);
          console.log(`✅ ${ativo.ticker}: DADOS ATUALIZADOS COM SUCESSO!`);
          
          return {
            ...ativo,
            precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: viasCalculado,
            dy: dyAtualizado,
            statusApi: 'success',
            ultimaAtualizacao: cotacao.tempo || new Date().toISOString()
          };
        } else {
          console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida na API`);
          console.warn(`⚠️ Usando dados de entrada como fallback`);
          
          return {
            ...ativo,
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
            dy: ativo.dy,
            statusApi: 'not_found',
            ultimaAtualizacao: new Date().toISOString()
          };
        }
      });

      // SALVAR INFORMAÇÕES DE DEBUG
      const debugData = {
        timestamp: new Date().toISOString(),
        tempoExecucao: tempoTotal,
        sucessos: sucessosTotal,
        falhas: falhasTotal,
        totalAtivos: ativosBase.length,
        detalhesLotes: detalhesDebug,
        cotacoesEncontradas: Array.from(cotacoesMap.entries())
      };

      setDebugInfo(debugData);
      setPortfolio(portfolioAtualizado);
      setLastUpdate(new Date().toLocaleString('pt-BR'));

      // DEFINIR MENSAGENS DE ERRO BASEADAS NA QUALIDADE DOS DADOS
      if (sucessosTotal === 0) {
        setError('Nenhuma cotação foi obtida da API Brapi');
      } else if (sucessosTotal < portfolioAtualizado.length / 2) {
        setError(`Apenas ${sucessosTotal} de ${portfolioAtualizado.length} ações atualizadas`);
      } else {
        setError(null); // Limpar erro se teve sucesso suficiente
      }

      console.log(`\n🎉 === PROCESSAMENTO CONCLUÍDO ===`);
      console.log(`📊 Portfolio atualizado com ${portfolioAtualizado.length} ativos`);
      console.log(`✅ ${sucessosTotal} cotações atualizadas com sucesso`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ ERRO GERAL:', errorMessage);
      console.error('❌ Stack trace:', err);
      
      setError(`Erro na API: ${errorMessage}`);
      
      // FALLBACK COMPLETO
      console.log('🔄 Aplicando fallback completo...');
      const portfolioFallback = ativosBase.map(ativo => {
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        return {
          ...ativo,
          precoAtual: ativo.precoEntrada,
          performance: 0,
          variacao: 0,
          variacaoPercent: 0,
          volume: 0,
          vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
          dy: ativo.dy,
          statusApi: 'error',
          ultimaAtualizacao: new Date().toISOString()
        };
      });
      setPortfolio(portfolioFallback);
    } finally {
      setLoading(false);
      console.log('🏁 Hook finalizado');
    }
  }, []);

  // EXECUTAR AO MONTAR
  React.useEffect(() => {
    console.log('🚀 Montando componente - iniciando busca de cotações');
    fetchQuotes();

    // ATUALIZAR A CADA 3 MINUTOS (reduzido de 5 para 3)
    const interval = setInterval(() => {
      console.log('🔄 Intervalo de atualização ativado');
      fetchQuotes();
    }, 3 * 60 * 1000);
    
    return () => {
      console.log('🛑 Limpando intervalo de atualização');
      clearInterval(interval);
    };
  }, [fetchQuotes]);

  return { portfolio, loading, error, refetch: fetchQuotes, lastUpdate, debugInfo };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 === PÁGINA OVERVIEW (AÇÕES) CARREGADA ===");
  console.log("🎯 Versão: Brapi Direto Otimizada");

  // HOOKS
  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { portfolio: ativosAtualizados, loading: quotesLoading, error: quotesError, refetch: quotesRefetch, lastUpdate, debugInfo } = useBrapiQuotesDireto();

  // DADOS PADRÃO
  const dadosCardsPadrao = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const },
    dividendYield: { value: "7.4%", trend: "up" as const },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  const dadosCards = marketData || dadosCardsPadrao;

  // DEBUG LOG DOS RESULTADOS FINAIS
  React.useEffect(() => {
    if (ativosAtualizados.length > 0) {
      console.log('\n🎯 === RESULTADOS FINAIS PARA INTERFACE ===');
      ativosAtualizados.forEach(ativo => {
        const precoTeto = parseFloat(ativo.precoTeto.replace('R$ ', '').replace(',', '.'));
        const precoAtual = parseFloat(ativo.precoAtual.replace('R$ ', '').replace(',', '.'));
        console.log(`📊 ${ativo.ticker}:`);
        console.log(`   💰 Preço: ${ativo.precoAtual} (Status: ${ativo.statusApi})`);
        console.log(`   🎯 Teto: ${ativo.precoTeto} → Viés: ${ativo.vies}`);
        console.log(`   📈 Performance: ${ativo.performance?.toFixed(2)}%`);
      });
      
      // Log do debug info
      if (debugInfo.timestamp) {
        console.log('\n📊 Debug Info:', debugInfo);
      }
    }
  }, [ativosAtualizados, debugInfo]);

  // LOADING STATE
  if (quotesLoading || marketLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🔄 Carregando cotações otimizadas da Brapi...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Alertas de Status */}
      {quotesError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={quotesRefetch}>
                🔄 Tentar Novamente
              </Button>
            }
            sx={{ mb: 1 }}
          >
            ⚠️ {quotesError}
          </Alert>
        </Grid>
      )}

      {marketError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={marketRefetch}>
                🔄 Recarregar Mercado
              </Button>
            }
            sx={{ mb: 1 }}
          >
            ⚠️ API de mercado offline - usando dados locais
          </Alert>
        </Grid>
      )}

      {/* Status de Sucesso */}
      {!quotesError && ativosAtualizados.length > 0 && (
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Cotações Brapi: {ativosAtualizados.filter(a => a.statusApi === 'success').length}/{ativosAtualizados.length} atualizadas
            {lastUpdate && ` • Última atualização: ${lastUpdate}`}
            {debugInfo.tempoExecucao && ` • Tempo: ${debugInfo.tempoExecucao}ms`}
          </Alert>
        </Grid>
      )}

      {!marketError && marketData && (
        <Grid xs={12}>
          <Alert severity="info" sx={{ mb: 1 }}>
            📈 Dados de mercado em tempo real (Ibovespa ativo)
          </Alert>
        </Grid>
      )}

      {/* Info do Viés */}
      <Grid xs={12}>
        <Alert severity="info" sx={{ mb: 1 }}>
          🎯 Viés automático: Preço Teto > Preço Atual = COMPRA | Caso contrário = AGUARDAR
        </Alert>
      </Grid>

      {/* Componentes */}
      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      
      <Grid xs={12}>
        <OverviewTable 
          count={ativosAtualizados.length} 
          rows={ativosAtualizados}
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
        />
      </Grid>
    </Grid>
  );
}
