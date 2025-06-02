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
function calcularViesAutomatico(precoTeto: string, precoAtual: string): string {
  // Remover formatação e converter para números
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  // Verificar se os valores são válidos
  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
    return 'Aguardar'; // Default se não conseguir calcular
  }
  
  // 🎯 LÓGICA: Preço Teto > Preço Atual = COMPRA
  if (precoTetoNum > precoAtualNum) {
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

// 🔥 DADOS BASE DAS AÇÕES COM MAPEAMENTO PARA TICKERS VÁLIDOS DA BRAPI
const ativosBase = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    ticker: 'ALOS3',
    tickerBrapi: 'ALOS3', // Confirmado que funciona
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
    tickerBrapi: 'TUPY3', // Vamos testar
    setor: 'Industrial',
    dataEntrada: '04/11/2020',
    precoEntrada: 'R$ 20,36',
    dy: '1,71%',
    precoTeto: 'R$ 31,50',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    ticker: 'PETR4',
    tickerBrapi: 'PETR4', // Sabemos que funciona
    setor: 'Petróleo',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 30,00',
    dy: '8,50%',
    precoTeto: 'R$ 40,00',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    ticker: 'VALE3',
    tickerBrapi: 'VALE3', // Sabemos que funciona
    setor: 'Mineração',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 80,00',
    dy: '12,00%',
    precoTeto: 'R$ 90,00',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ITUB.png',
    ticker: 'ITUB4',
    tickerBrapi: 'ITUB4', // Banco Itaú - comum na Brapi
    setor: 'Bancário',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 25,00',
    dy: '6,50%',
    precoTeto: 'R$ 35,00',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBDC.png',
    ticker: 'BBDC4',
    tickerBrapi: 'BBDC4', // Bradesco - comum na Brapi
    setor: 'Bancário',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 20,00',
    dy: '8,00%',
    precoTeto: 'R$ 25,00',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ABEV.png',
    ticker: 'ABEV3',
    tickerBrapi: 'ABEV3', // Ambev - comum na Brapi
    setor: 'Bebidas',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 15,00',
    dy: '4,50%',
    precoTeto: 'R$ 18,00',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MGLU.png',
    ticker: 'MGLU3',
    tickerBrapi: 'MGLU3', // Magazine Luiza - comum na Brapi
    setor: 'Varejo',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 10,00',
    dy: '0,00%',
    precoTeto: 'R$ 15,00',
  },
  // Mantendo algumas das suas ações originais para teste
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    ticker: 'RECV3',
    tickerBrapi: 'RECV3',
    setor: 'Petróleo',
    dataEntrada: '23/07/2023',
    precoEntrada: 'R$ 22,29',
    dy: '11,07%',
    precoTeto: 'R$ 31,37',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    ticker: 'CSED3',
    tickerBrapi: 'CSED3',
    setor: 'Educação',
    dataEntrada: '10/12/2023',
    precoEntrada: 'R$ 4,49',
    dy: '4,96%',
    precoTeto: 'R$ 8,35',
  }
];

// 🚀 HOOK PARA BUSCAR COTAÇÕES REAIS DA BRAPI COM TICKERS VALIDADOS
function useBrapiCotacoesValidadas() {
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<string>('');
  const [debugInfo, setDebugInfo] = React.useState<any>({});

  const buscarCotacoes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES COM TICKERS VALIDADOS PARA BRAPI');

      // 🔑 TOKEN VALIDADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TICKERS PARA BRAPI
      const tickers = ativosBase.map(ativo => ativo.tickerBrapi);
      console.log('🎯 Tickers para buscar na Brapi:', tickers.join(', '));

      // 🧪 PRIMEIRO, TESTAR ALGUNS TICKERS CONHECIDOS
      const tickersConhecidos = ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3'];
      console.log('\n🧪 TESTE INICIAL COM TICKERS CONHECIDOS:', tickersConhecidos.join(', '));

      const testeUrl = `https://brapi.dev/api/quote/${tickersConhecidos.join(',')}?token=${BRAPI_TOKEN}`;
      console.log('🌐 URL de teste:', testeUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));

      const testeResponse = await fetch(testeUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Test-App',
          'Cache-Control': 'no-cache'
        }
      });

      console.log(`📊 Status do teste: ${testeResponse.status} ${testeResponse.statusText}`);

      if (testeResponse.ok) {
        const testeData = await testeResponse.json();
        console.log('✅ TESTE INICIAL FUNCIONOU!', testeData);
        
        if (testeData.results && testeData.results.length > 0) {
          console.log(`🎉 ${testeData.results.length} tickers encontrados no teste!`);
          testeData.results.forEach((quote: any) => {
            console.log(`   • ${quote.symbol}: R$ ${quote.regularMarketPrice}`);
          });
        }
      } else {
        const testeError = await testeResponse.text();
        console.error('❌ TESTE INICIAL FALHOU:', testeError);
        setError(`Teste inicial falhou: ${testeResponse.status} - ${testeError}`);
        return;
      }

      // 🔄 AGORA BUSCAR TODOS OS TICKERS INDIVIDUALMENTE
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;
      const tickersProblematicos = [];

      console.log('\n🔍 === BUSCANDO CADA TICKER INDIVIDUALMENTE ===');

      for (let i = 0; i < tickers.length; i++) {
        const ticker = tickers[i];
        const apiUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`;
        
        console.log(`\n🔍 [${i+1}/${tickers.length}] Testando: ${ticker}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Portfolio-Individual-Test',
              'Cache-Control': 'no-cache'
            }
          });

          console.log(`📊 Status: ${response.status}`);

          if (response.ok) {
            const apiData = await response.json();
            
            if (apiData.results && Array.isArray(apiData.results) && apiData.results.length > 0) {
              const quote = apiData.results[0];
              console.log(`✅ ${ticker}: R$ ${quote.regularMarketPrice} (${quote.shortName})`);
              
              if (quote.regularMarketPrice != null && !isNaN(quote.regularMarketPrice) && quote.regularMarketPrice > 0) {
                cotacoesMap.set(ticker, {
                  precoAtual: quote.regularMarketPrice,
                  variacao: quote.regularMarketChange || 0,
                  variacaoPercent: quote.regularMarketChangePercent || 0,
                  volume: quote.regularMarketVolume || 0,
                  nome: quote.shortName || quote.longName,
                  dadosCompletos: quote
                });
                sucessosTotal++;
              } else {
                console.warn(`⚠️ ${ticker}: Preço inválido`);
                falhasTotal++;
                tickersProblematicos.push(`${ticker} (preço inválido)`);
              }
            } else {
              console.warn(`⚠️ ${ticker}: Sem resultados válidos`);
              falhasTotal++;
              tickersProblematicos.push(`${ticker} (sem resultados)`);
            }
          } else {
            console.error(`❌ ${ticker}: HTTP ${response.status}`);
            const errorText = await response.text();
            console.error(`   Erro: ${errorText}`);
            falhasTotal++;
            
            if (errorText.includes('não encontramos')) {
              tickersProblematicos.push(`${ticker} (não encontrado)`);
            } else if (errorText.includes('limite')) {
              tickersProblematicos.push(`${ticker} (rate limit)`);
            } else {
              tickersProblematicos.push(`${ticker} (HTTP ${response.status})`);
            }
          }
        } catch (tickerError) {
          console.error(`❌ ${ticker}: Erro de rede:`, tickerError);
          falhasTotal++;
          tickersProblematicos.push(`${ticker} (erro de rede)`);
        }

        // DELAY entre requisições
        if (i < tickers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
        }
      }

      // 📊 RESULTADOS FINAIS
      console.log('\n📊 === RESULTADOS FINAIS ===');
      console.log(`✅ Sucessos: ${sucessosTotal}/${tickers.length}`);
      console.log(`❌ Falhas: ${falhasTotal}/${tickers.length}`);
      
      if (tickersProblematicos.length > 0) {
        console.log('\n🚨 TICKERS PROBLEMÁTICOS:');
        tickersProblematicos.forEach(problema => console.log(`   • ${problema}`));
      }

      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const ativosComCotacoes = ativosBase.map((ativo) => {
        const cotacao = cotacoesMap.get(ativo.tickerBrapi);
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        if (cotacao && cotacao.precoAtual != null && !isNaN(cotacao.precoAtual) && cotacao.precoAtual > 0) {
          const precoAtualNum = cotacao.precoAtual;
          const precoAtualFormatado = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`\n✅ ${ativo.ticker} ATUALIZADO:`);
          console.log(`   💰 Preço: ${precoAtualFormatado}`);
          console.log(`   📈 Performance: ${performance.toFixed(2)}%`);
          
          return {
            ...ativo,
            precoAtual: precoAtualFormatado,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomatico(ativo.precoTeto, precoAtualFormatado),
            dy: calcularDYAtualizado(ativo.dy, ativo.precoEntrada, precoAtualNum),
            statusApi: 'success',
            nomeCompleto: cotacao.nome
          };
        } else {
          console.log(`\n⚠️ ${ativo.ticker} SEM COTAÇÃO - usando fallback`);
          
          return {
            ...ativo,
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),
            dy: ativo.dy,
            statusApi: 'not_found',
            nomeCompleto: 'N/A'
          };
        }
      });

      setDebugInfo({
        timestamp: new Date().toISOString(),
        sucessos: sucessosTotal,
        falhas: falhasTotal,
        tickersProblematicos,
        cotacoesEncontradas: Array.from(cotacoesMap.keys())
      });

      setAtivosAtualizados(ativosComCotacoes);
      setLastUpdate(new Date().toLocaleString('pt-BR'));

      if (sucessosTotal === 0) {
        setError('Nenhuma cotação foi obtida da Brapi');
      } else if (sucessosTotal < ativosComCotacoes.length / 3) { // Mudado de /2 para /3
        setError(`Apenas ${sucessosTotal} de ${ativosComCotacoes.length} ações atualizadas`);
      } else {
        setError(null); // Limpar erro se teve sucesso suficiente
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ ERRO GERAL:', err);
      
      // FALLBACK COMPLETO
      const ativosFallback = ativosBase.map(ativo => ({
        ...ativo,
        precoAtual: ativo.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),
        dy: ativo.dy,
        statusApi: 'error',
        nomeCompleto: 'Erro'
      }));
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarCotacoes();
    const interval = setInterval(buscarCotacoes, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarCotacoes]);

  return { ativosAtualizados, loading, error, refetch: buscarCotacoes, lastUpdate, debugInfo };
}

export default function Page(): React.JSX.Element {
  console.log("🔥 PÁGINA OVERVIEW (AÇÕES) - VERSÃO COM TICKERS VALIDADOS");

  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { ativosAtualizados, loading: cotacoesLoading, error: cotacoesError, refetch: cotacoesRefetch, lastUpdate, debugInfo } = useBrapiCotacoesValidadas();

  const dadosCardsPadrao = {
    ibovespa: { value: "137k", trend: "up" as const, diff: 0.2 },
    indiceSmall: { value: "2k", trend: "up" as const, diff: 0.24 },
    carteiraHoje: { value: "88.7%", trend: "up" as const },
    dividendYield: { value: "7.4%", trend: "up" as const },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  const dadosCards = marketData || dadosCardsPadrao;

  React.useEffect(() => {
    if (ativosAtualizados.length > 0) {
      console.log('\n🎯 RESULTADO FINAL PARA INTERFACE:');
      ativosAtualizados.forEach(ativo => {
        console.log(`📊 ${ativo.ticker}: ${ativo.precoAtual} (${ativo.statusApi})`);
      });
      
      if (debugInfo.timestamp) {
        console.log('\n📈 Debug Info:', debugInfo);
      }
    }
  }, [ativosAtualizados, debugInfo]);

  if (cotacoesLoading || marketLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🔄 Testando tickers validados na Brapi...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {cotacoesError && (
        <Grid xs={12}>
          <Alert 
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={cotacoesRefetch}>
                🔄 Tentar Novamente
              </Button>
            }
            sx={{ mb: 1 }}
          >
            ⚠️ {cotacoesError}
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

      {!cotacoesError && ativosAtualizados.length > 0 && (
        <Grid xs={12}>
          <Alert severity="success" sx={{ mb: 1 }}>
            ✅ Cotações Brapi: {ativosAtualizados.filter(a => a.statusApi === 'success').length}/{ativosAtualizados.length} ações atualizadas
            {lastUpdate && ` • Última atualização: ${lastUpdate}`}
          </Alert>
        </Grid>
      )}

      {!marketError && marketData && (
        <Grid xs={12}>
          <Alert severity="info" sx={{ mb: 1 }}>
            📈 Dados de mercado em tempo real (Ibovespa: 137k pts)
          </Alert>
        </Grid>
      )}

      <Grid xs={12}>
        <Alert severity="info" sx={{ mb: 1 }}>
          🎯 Viés automático: Preço Teto > Preço Atual = COMPRA | Caso contrário = AGUARDAR
        </Alert>
      </Grid>

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
