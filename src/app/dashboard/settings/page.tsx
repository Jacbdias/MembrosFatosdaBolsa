/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress, Alert, Button, Card, CardContent, Typography } from '@mui/material';
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
  // Adicionando apenas alguns para teste
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    ticker: 'PETR4',
    setor: 'Petróleo',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 30,00',
    dy: '8,50%',
    precoTeto: 'R$ 40,00',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    ticker: 'VALE3',
    setor: 'Mineração',
    dataEntrada: '01/01/2022',
    precoEntrada: 'R$ 80,00',
    dy: '12,00%',
    precoTeto: 'R$ 90,00',
  },
];

// 🎯 HOOK DE DEBUG PARA TESTAR A API BRAPI
function useBrapiDebug() {
  const [debugInfo, setDebugInfo] = React.useState<any>({});
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const testarBrapi = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const debug = {
        timestamp: new Date().toISOString(),
        token: 'jJrMYVy9MATGEicx3GxBp8',
        testResults: [],
        errors: [],
        sucessos: 0,
        falhas: 0
      };

      console.log('🔍 INICIANDO DEBUG DA BRAPI');
      console.log('🔑 Token:', debug.token);

      // TESTE 1: REQUISIÇÃO SIMPLES COM PETR4
      console.log('\n🧪 TESTE 1: PETR4 individual');
      try {
        const url1 = `https://brapi.dev/api/quote/PETR4?token=${debug.token}`;
        console.log('📡 URL:', url1);
        
        const response1 = await fetch(url1, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Debug-App'
          }
        });

        console.log('📊 Status:', response1.status);
        console.log('📊 Headers:', Object.fromEntries(response1.headers.entries()));

        const data1 = await response1.json();
        console.log('📊 Resposta PETR4:', data1);

        debug.testResults.push({
          teste: 'PETR4 individual',
          status: response1.status,
          sucesso: response1.ok,
          dados: data1
        });

        if (response1.ok) {
          debug.sucessos++;
        } else {
          debug.falhas++;
          debug.errors.push(`PETR4: ${data1.message || 'Erro desconhecido'}`);
        }
      } catch (err) {
        console.error('❌ Erro PETR4:', err);
        debug.falhas++;
        debug.errors.push(`PETR4: ${err instanceof Error ? err.message : 'Erro de rede'}`);
      }

      // TESTE 2: MÚLTIPLOS TICKERS
      console.log('\n🧪 TESTE 2: Múltiplos tickers');
      try {
        const tickersTest = ['PETR4', 'VALE3'];
        const url2 = `https://brapi.dev/api/quote/${tickersTest.join(',')}?token=${debug.token}`;
        console.log('📡 URL:', url2);
        
        const response2 = await fetch(url2, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Debug-App'
          }
        });

        const data2 = await response2.json();
        console.log('📊 Resposta múltiplos:', data2);

        debug.testResults.push({
          teste: 'Múltiplos tickers',
          status: response2.status,
          sucesso: response2.ok,
          dados: data2
        });

        if (response2.ok) {
          debug.sucessos++;
        } else {
          debug.falhas++;
          debug.errors.push(`Múltiplos: ${data2.message || 'Erro desconhecido'}`);
        }
      } catch (err) {
        console.error('❌ Erro múltiplos:', err);
        debug.falhas++;
        debug.errors.push(`Múltiplos: ${err instanceof Error ? err.message : 'Erro de rede'}`);
      }

      // TESTE 3: VERIFICAR FORMATO DE RESPOSTA
      console.log('\n🧪 TESTE 3: Testando todos os tickers da carteira');
      const cotacoesMap = new Map();
      
      for (const ativo of ativosBase) {
        try {
          console.log(`🔍 Testando ${ativo.ticker}...`);
          const url = `https://brapi.dev/api/quote/${ativo.ticker}?token=${debug.token}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (response.ok && data.results && data.results.length > 0) {
            const quote = data.results[0];
            console.log(`✅ ${ativo.ticker}: R$ ${quote.regularMarketPrice}`);
            
            cotacoesMap.set(ativo.ticker, {
              precoAtual: quote.regularMarketPrice,
              variacao: quote.regularMarketChange || 0,
              variacaoPercent: quote.regularMarketChangePercent || 0,
              dadosCompletos: quote
            });
            debug.sucessos++;
          } else {
            console.warn(`⚠️ ${ativo.ticker}: Sem dados válidos`);
            debug.falhas++;
            debug.errors.push(`${ativo.ticker}: ${data.message || 'Sem dados'}`);
          }
          
          // Delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (err) {
          console.error(`❌ ${ativo.ticker}:`, err);
          debug.falhas++;
          debug.errors.push(`${ativo.ticker}: ${err instanceof Error ? err.message : 'Erro de rede'}`);
        }
      }

      // MONTAR PORTFOLIO COM DADOS REAIS OU FALLBACK
      const portfolioAtualizado = ativosBase.map((ativo) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        if (cotacao && cotacao.precoAtual > 0) {
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          return {
            ...ativo,
            precoAtual: `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            vies: calcularViesAutomatico(ativo.precoTeto, precoAtualNum),
            dy: calcularDYAtualizado(ativo.dy, ativo.precoEntrada, precoAtualNum),
            statusApi: 'success'
          };
        } else {
          return {
            ...ativo,
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, precoEntradaNum),
            dy: ativo.dy,
            statusApi: 'not_found'
          };
        }
      });

      setPortfolio(portfolioAtualizado);
      setDebugInfo(debug);

      console.log('\n📊 RESUMO DO DEBUG:');
      console.log(`✅ Sucessos: ${debug.sucessos}`);
      console.log(`❌ Falhas: ${debug.falhas}`);
      console.log('🗂️ Erros:', debug.errors);
      
      if (debug.falhas > debug.sucessos) {
        setError(`API com problemas: ${debug.falhas} falhas de ${debug.sucessos + debug.falhas} tentativas`);
      }

    } catch (err) {
      console.error('❌ Erro geral no debug:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido no debug');
      
      // Fallback completo
      const portfolioFallback = ativosBase.map(ativo => {
        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));
        return {
          ...ativo,
          precoAtual: ativo.precoEntrada,
          performance: 0,
          variacao: 0,
          variacaoPercent: 0,
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

  React.useEffect(() => {
    testarBrapi();
  }, [testarBrapi]);

  return { portfolio, debugInfo, loading, error, refetch: testarBrapi };
}

export default function Page(): React.JSX.Element {
  console.log("🔍 PÁGINA DEBUG - TESTANDO BRAPI API");

  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { portfolio: ativosAtualizados, debugInfo, loading: quotesLoading, error: quotesError, refetch: quotesRefetch } = useBrapiDebug();

  const dadosCardsPadrao = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const },
    dividendYield: { value: "7.4%", trend: "up" as const },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  const dadosCards = marketData || dadosCardsPadrao;

  if (quotesLoading || marketLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🔍 Executando diagnóstico da API Brapi...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Debug Info Card */}
      <Grid xs={12}>
        <Card sx={{ mb: 2, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Diagnóstico da API Brapi
            </Typography>
            {debugInfo.timestamp && (
              <>
                <Typography variant="body2">
                  📅 Executado em: {new Date(debugInfo.timestamp).toLocaleString('pt-BR')}
                </Typography>
                <Typography variant="body2">
                  ✅ Sucessos: {debugInfo.sucessos} | ❌ Falhas: {debugInfo.falhas}
                </Typography>
                {debugInfo.errors && debugInfo.errors.length > 0 && (
                  <Typography variant="body2" color="error">
                    🚨 Erros: {debugInfo.errors.join(', ')}
                  </Typography>
                )}
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => console.log('📊 Debug completo:', debugInfo)}
                  sx={{ mt: 1 }}
                >
                  Ver Debug Completo no Console
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Alertas de status */}
      {quotesError && (
        <Grid xs={12}>
          <Alert 
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={quotesRefetch}>
                🔄 Testar Novamente
              </Button>
            }
            sx={{ mb: 1 }}
          >
            🚨 Problema na API Brapi: {quotesError}
          </Alert>
        </Grid>
      )}

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
            ⚠️ API de mercado offline: {marketError}
          </Alert>
        </Grid>
      )}

      {/* Status das cotações */}
      <Grid xs={12}>
        <Alert 
          severity={debugInfo.sucessos > debugInfo.falhas ? "success" : "warning"}
          sx={{ mb: 1 }}
        >
          📊 Cotações: {ativosAtualizados.filter(a => a.statusApi === 'success').length} de {ativosAtualizados.length} atualizadas com sucesso
        </Alert>
      </Grid>

      <Grid xs={12}>
        <Alert severity="info" sx={{ mb: 1 }}>
          🎯 Viés calculado automaticamente: Preço Teto > Preço Atual = COMPRA | Caso contrário = AGUARDAR
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
