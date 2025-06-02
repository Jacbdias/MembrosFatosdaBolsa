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

// 🎯 HOOK PARA BUSCAR COTAÇÕES DIRETAMENTE DA BRAPI (SEM API ROUTE)
function useBrapiQuotesDireto() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string>('');

  const fetchQuotes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES DIRETO DA BRAPI (FRONTEND)');

      // 🔑 TOKEN BRAPI FUNCIONANDO (MESMO DO LOG DE BUILD)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS DOS ATIVOS
      const tickers = ativosBase.map(ativo => ativo.ticker);
      console.log('🎯 Tickers para buscar:', tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES COM DELAY (MESMO PADRÃO DOS FIIS)
      const LOTE_SIZE = 5;
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        
        // 🔑 URL DIRETA PARA BRAPI (SEM USAR SUA API ROUTE)
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d`;
        
        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Acoes-Portfolio-Frontend'
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
                console.log(`🔍 Processando: ${quote.symbol}`);
                console.log(`💰 Preço: ${quote.regularMarketPrice}`);
                console.log(`📈 Variação: ${quote.regularMarketChangePercent}%`);
                
                if (quote.symbol && quote.regularMarketPrice && quote.regularMarketPrice > 0) {
                  cotacoesMap.set(quote.symbol, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    dadosCompletos: quote
                  });
                  sucessosTotal++;
                  console.log(`✅ ${quote.symbol}: R$ ${quote.regularMarketPrice}`);
                } else {
                  console.warn(`⚠️ ${quote.symbol}: Dados inválidos (preço: ${quote.regularMarketPrice})`);
                  falhasTotal++;
                }
              });
            }
          } else {
            console.error(`❌ Erro HTTP ${response.status} para lote: ${lote.join(', ')}`);
            
            // LOG DA RESPOSTA DE ERRO
            const errorText = await response.text();
            console.error('📄 Resposta de erro:', errorText);
            
            falhasTotal += lote.length;
          }
        } catch (loteError) {
          console.error(`❌ Erro no lote ${lote.join(', ')}:`, loteError);
          falhasTotal += lote.length;
        }

        // DELAY entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ Total processado: ${sucessosTotal} sucessos, ${falhasTotal} falhas`);

      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const portfolioAtualizado = ativosBase.map((ativo) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        console.log(`\n🔄 Processando ${ativo.ticker}:`);
        console.log(`💵 Preço entrada: R$ ${precoEntradaNum}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          // 📊 PREÇO E PERFORMANCE REAIS
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          // VALIDAR SE O PREÇO FAZ SENTIDO (não pode ser muito diferente)
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 500) {
            console.warn(`🚨 ${ativo.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            return {
              ...ativo,
              precoAtual: ativo.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
              dy: ativo.dy,
              statusApi: 'suspicious_price'
            };
          }
          
          return {
            ...ativo,
            precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomatico(ativo.precoTeto, precoAtualNum),
            dy: calcularDYAtualizado(ativo.dy, ativo.precoEntrada, precoAtualNum),
            statusApi: 'success'
          };
        } else {
          // ⚠️ FALLBACK PARA AÇÕES SEM COTAÇÃO
          console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida, usando preço de entrada`);
          
          return {
            ...ativo,
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
            dy: ativo.dy,
            statusApi: 'not_found'
          };
        }
      });

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = portfolioAtualizado.filter(a => a.statusApi === 'success').length;
      const suspeitos = portfolioAtualizado.filter(a => a.statusApi === 'suspicious_price').length;
      const naoEncontrados = portfolioAtualizado.filter(a => a.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS:');
      console.log(`✅ Sucessos: ${sucessos}/${portfolioAtualizado.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${portfolioAtualizado.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${portfolioAtualizado.length}`);

      setPortfolio(portfolioAtualizado);
      setLastUpdate(new Date().toLocaleString('pt-BR'));

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < portfolioAtualizado.length / 2) {
        setError(`Apenas ${sucessos} de ${portfolioAtualizado.length} ações com cotação válida`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} ações com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações:', err);
      
      // 🔄 FALLBACK: USAR DADOS ESTÁTICOS
      console.log('🔄 Usando fallback completo com preços de entrada...');
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
          statusApi: 'error'
        };
      });
      setPortfolio(portfolioFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar cotações ao montar o componente
  React.useEffect(() => {
    fetchQuotes();

    // ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(fetchQuotes, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  return { portfolio, loading, error, refetch: fetchQuotes, lastUpdate };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 PÁGINA OVERVIEW (AÇÕES) - USANDO BRAPI DIRETO NO FRONTEND");

  // 🔥 BUSCAR DADOS REAIS DA API FINANCEIRA (que está funcionando)
  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  
  // 🎯 BUSCAR COTAÇÕES DIRETO DA BRAPI (SEM API ROUTE PROBLEMÁTICA)
  const { portfolio: ativosAtualizados, loading: quotesLoading, error: quotesError, refetch: quotesRefetch, lastUpdate } = useBrapiQuotesDireto();

  // DADOS PADRÃO CASO A API FALHE
  const dadosCardsPadrao = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const },
    dividendYield: { value: "7.4%", trend: "up" as const },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  // 🚀 USAR DADOS DA API SE DISPONÍVEIS, SENÃO USA DADOS PADRÃO
  const dadosCards = marketData || dadosCardsPadrao;

  // Log para debug
  React.useEffect(() => {
    console.log('🎯 ATIVOS COM COTAÇÕES ATUALIZADAS:');
    ativosAtualizados.forEach(ativo => {
      const precoTeto = parseFloat(ativo.precoTeto.replace('R$ ', '').replace(',', '.'));
      const precoAtual = parseFloat(ativo.precoAtual.replace('R$ ', '').replace(',', '.'));
      console.log(`📊 ${ativo.ticker}: Teto R$ ${precoTeto.toFixed(2)} vs Atual R$ ${precoAtual.toFixed(2)} = ${ativo.vies} (${ativo.statusApi})`);
    });
  }, [ativosAtualizados]);

  // Loading state
  if (quotesLoading || marketLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🔄 Carregando cotações direto da Brapi...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Alerta se Brapi estiver offline */}
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
            ⚠️ Aviso: {quotesError} - Alguns dados podem estar desatualizados
          </Alert>
        </Grid>
      )}

      {/* Alerta se API de mercado estiver offline */}
      {marketError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={marketRefetch}>
                🔄 Tentar Novamente
              </Button>
            }
            sx={{ mb: 1 }}
          >
            ⚠️ API de mercado temporariamente offline - usando dados locais. 
            {marketData ? ' Alguns dados podem estar desatualizados.' : ''}
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso das cotações */}
      {!quotesError && ativosAtualizados.length > 0 && (
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Cotações atualizadas pela Brapi ({ativosAtualizados.filter(a => a.statusApi === 'success').length}/{ativosAtualizados.length} ações) - Última atualização: {lastUpdate}
          </Alert>
        </Grid>
      )}

      {/* Indicador de sucesso da API de mercado */}
      {!marketError && marketData && (
        <Grid xs={12}>
          <Alert severity="info" sx={{ mb: 1 }}>
            📈 Dados de mercado atualizados em tempo real (Ibovespa funcionando!)
          </Alert>
        </Grid>
      )}

      {/* Indicador de viés automático */}
      <Grid xs={12}>
        <Alert severity="info" sx={{ mb: 1 }}>
          🎯 Viés calculado automaticamente: Preço Teto > Preço Atual = COMPRA | Caso contrário = AGUARDAR
        </Alert>
      </Grid>

      {/* Filtros de busca */}
      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      
      {/* Tabela principal com cards e dados */}
      <Grid xs={12}>
        <OverviewTable 
          count={ativosAtualizados.length} 
          rows={ativosAtualizados} // 🔥 DADOS COM COTAÇÕES REAIS DA BRAPI!
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards} // 🔥 DADOS REAIS DA API OU FALLBACK!
        />
      </Grid>
    </Grid>
  );
}
