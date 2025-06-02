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

    tickerBrapi: 'ALOS3',

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

    tickerBrapi: 'TUPY3',

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

    tickerBrapi: 'PETR4',

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

    tickerBrapi: 'VALE3',

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

    tickerBrapi: 'ITUB4',

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

    tickerBrapi: 'BBDC4',

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

    tickerBrapi: 'ABEV3',

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

    tickerBrapi: 'MGLU3',

    setor: 'Varejo',

    dataEntrada: '01/01/2022',

    precoEntrada: 'R$ 10,00',

    dy: '0,00%',

    precoTeto: 'R$ 15,00',

  },

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



// 🚀 HOOK PARA BUSCAR COTAÇÕES REAIS DA BRAPI - VERSÃO CORRIGIDA BASEADA NO PADRÃO DOS FIIs

function useBrapiCotacoesValidadas() {

  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);

  const [loading, setLoading] = React.useState(true);

  const [error, setError] = React.useState<string | null>(null);



  const buscarCotacoes = React.useCallback(async () => {

    try {

      setLoading(true);

      setError(null);



      console.log('🚀 BUSCANDO COTAÇÕES DAS AÇÕES COM PADRÃO DOS FIIs FUNCIONANDO');



      // 🔑 TOKEN BRAPI FUNCIONANDO (MESMO DOS FIIs)

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';



      // 📋 EXTRAIR TODOS OS TICKERS

      const tickers = ativosBase.map(ativo => ativo.tickerBrapi);

      console.log('🎯 Tickers para buscar:', tickers.join(', '));



      // 🔄 BUSCAR EM LOTES MENORES COM TOKEN (MESMO PADRÃO DOS FIIs)

      const LOTE_SIZE = 5;

      const cotacoesMap = new Map();

      let sucessosTotal = 0;

      let falhasTotal = 0;



      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {

        const lote = tickers.slice(i, i + LOTE_SIZE);

        const tickersString = lote.join(',');

        

        // 🔑 URL COM TOKEN DE AUTENTICAÇÃO VALIDADO (IGUAL AOS FIIs)

        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`;

        

        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);

        console.log(`🌐 URL: ${apiUrl.replace(BRAPI_TOKEN, 'TOKEN_FUNCIONANDO')}`);



        try {

          const response = await fetch(apiUrl, {

            method: 'GET',

            headers: {

              'Accept': 'application/json',

              'User-Agent': 'Acoes-Portfolio-App'

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

                    nome: quote.shortName || quote.longName,

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



        // DELAY entre requisições para evitar rate limiting (IGUAL AOS FIIs)

        await new Promise(resolve => setTimeout(resolve, 300));

      }



      console.log(`✅ Total processado: ${sucessosTotal} sucessos, ${falhasTotal} falhas`);

      console.log('🗺️ Mapa de cotações:', Array.from(cotacoesMap.entries()));



      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS (MESMO PADRÃO DOS FIIs)

      const ativosComCotacoes = ativosBase.map((ativo) => {

        const cotacao = cotacoesMap.get(ativo.tickerBrapi);

        const precoEntradaNum = parseFloat(ativo.precoEntrada.replace('R$ ', '').replace(',', '.'));

        

        console.log(`\n🔄 Processando ${ativo.ticker}:`);

        console.log(`💵 Preço entrada: R$ ${precoEntradaNum}`);

        

        if (cotacao && cotacao.precoAtual > 0) {

          // 📊 PREÇO E PERFORMANCE REAIS

          const precoAtualNum = cotacao.precoAtual;

          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;

          

          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);

          console.log(`📈 Performance: ${performance.toFixed(2)}%`);

          

          // VALIDAR SE O PREÇO FAZ SENTIDO (IGUAL AOS FIIs)

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

              vies: calcularViesAutomatico(ativo.precoTeto, ativo.precoEntrada),

              dy: ativo.dy,

              statusApi: 'suspicious_price',

              nomeCompleto: cotacao.nome

            };

          }

          

          const precoAtualFormatado = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;

          

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

          // ⚠️ FALLBACK PARA AÇÕES SEM COTAÇÃO (IGUAL AOS FIIs)

          console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida, usando preço de entrada`);

          

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



      // 📊 ESTATÍSTICAS FINAIS (IGUAL AOS FIIs)

      const sucessos = ativosComCotacoes.filter(a => a.statusApi === 'success').length;

      const suspeitos = ativosComCotacoes.filter(a => a.statusApi === 'suspicious_price').length;

      const naoEncontrados = ativosComCotacoes.filter(a => a.statusApi === 'not_found').length;

      

      console.log('\n📊 ESTATÍSTICAS FINAIS:');

      console.log(`✅ Sucessos: ${sucessos}/${ativosComCotacoes.length}`);

      console.log(`🚨 Preços suspeitos: ${suspeitos}/${ativosComCotacoes.length}`);

      console.log(`❌ Não encontrados: ${naoEncontrados}/${ativosComCotacoes.length}`);

      

      if (sucessos > 0) {

        const performanceMedia = ativosComCotacoes

          .filter(a => a.statusApi === 'success')

          .reduce((sum, a) => sum + a.performance, 0) / sucessos;

        console.log(`📈 Performance média: ${performanceMedia.toFixed(2)}%`);

      }



      setAtivosAtualizados(ativosComCotacoes);



      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS (IGUAL AOS FIIs)

      if (sucessos < ativosComCotacoes.length / 2) {

        setError(`Apenas ${sucessos} de ${ativosComCotacoes.length} ações com cotação válida`);

      } else if (suspeitos > 0) {

        setError(`${suspeitos} ações com preços suspeitos foram ignorados`);

      }



    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';

      setError(errorMessage);

      console.error('❌ Erro geral ao buscar cotações:', err);

      

      // 🔄 FALLBACK: USAR DADOS ESTÁTICOS (IGUAL AOS FIIs)

      console.log('🔄 Usando fallback completo com preços de entrada...');

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



    // ATUALIZAR A CADA 10 MINUTOS (IGUAL AOS FIIs)

    const interval = setInterval(buscarCotacoes, 10 * 60 * 1000);

    

    return () => clearInterval(interval);

  }, [buscarCotacoes]);



  return {

    ativosAtualizados,

    loading,

    error,

    refetch: buscarCotacoes,

  };

}



export default function Page(): React.JSX.Element {

  console.log("🔥 PÁGINA OVERVIEW (AÇÕES) - VERSÃO FINAL COM VALORES EXPANDIDOS");



  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();

  const { ativosAtualizados, loading: cotacoesLoading, error: cotacoesError, refetch: cotacoesRefetch } = useBrapiCotacoesValidadas();



  // 🔥 DADOS PADRÃO ATUALIZADOS COM VALORES REAIS E PRECISOS

  const dadosCardsPadrao = {

    ibovespa: { value: "140109", trend: "up" as const, diff: 0.34 },      // 💰 VALOR REAL: 140.109 (sem pontos para não confundir)

    indiceSmall: { value: "3200", trend: "up" as const, diff: 0.24 },     // 📊 IFIX: 3.200 (sem pontos)

    carteiraHoje: { value: "88.7%", trend: "up" as const },

    dividendYield: { value: "7.4%", trend: "up" as const },

    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },

    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },

  };



  // CALCULAR DIVIDEND YIELD MÉDIO DAS AÇÕES

  const calcularDYAcoes = () => {

    if (ativosAtualizados.length === 0) return dadosCardsPadrao.dividendYield;

    

    const dyValues = ativosAtualizados

      .map(acao => parseFloat(acao.dy.replace('%', '').replace(',', '.')))

      .filter(dy => !isNaN(dy) && dy > 0);

    

    if (dyValues.length === 0) return dadosCardsPadrao.dividendYield;

    

    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;

    

    return {

      value: `${dyMedio.toFixed(1)}%`,

      trend: "up" as const,

      diff: dyMedio,

    };

  };



  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA AÇÕES

  const calcularPerformanceAcoes = () => {

    console.log('🔍 DEBUG calcularPerformanceAcoes:');

    console.log('- ativosAtualizados.length:', ativosAtualizados.length);

    

    if (ativosAtualizados.length === 0) {

      console.log('❌ Portfolio vazio, usando padrão');

      return dadosCardsPadrao.carteiraHoje;

    }

    

    const performances = ativosAtualizados

      .filter(acao => {

        const hasPerformance = acao.performance !== undefined && !isNaN(acao.performance);

        console.log(`🔍 ACAO ${acao.ticker}: performance = ${acao.performance}, válida = ${hasPerformance}`);

        return hasPerformance;

      })

      .map(acao => acao.performance);

    

    console.log('🔍 Performances válidas:', performances);

    

    if (performances.length === 0) {

      console.log('❌ Nenhuma performance válida, usando padrão');

      return dadosCardsPadrao.carteiraHoje;

    }

    

    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;

    console.log('✅ Performance média calculada:', performancMedia);

    

    return {

      value: `${performancMedia.toFixed(1)}%`,

      trend: performancMedia >= 0 ? "up" as const : "down" as const,

      diff: performancMedia,

    };

  };



  // 🔥 USAR DADOS DA API SE DISPONÍVEIS COM CÁLCULOS PERSONALIZADOS

  // A FUNÇÃO expandirValorAbreviado() NO COMPONENTE OverviewTable CUIDARÁ DA EXPANSÃO

  const dadosCards = {

    ...dadosCardsPadrao,

    ...(marketData || {}),

    dividendYield: calcularDYAcoes(),

    carteiraHoje: calcularPerformanceAcoes(),

  };



  React.useEffect(() => {

    if (ativosAtualizados.length > 0) {

      console.log('\n🎯 RESULTADO FINAL PARA INTERFACE:');

      ativosAtualizados.forEach(ativo => {

        console.log(`📊 ${ativo.ticker}: ${ativo.precoAtual} (${ativo.statusApi}) - Performance: ${ativo.performance?.toFixed(2)}%`);

      });

    }

  }, [ativosAtualizados]);



  // LOADING STATE

  if (cotacoesLoading || marketLoading) {

    return (

      <Grid container spacing={3}>

        <Grid xs={12}>

          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">

            <CircularProgress size={40} />

            <Box ml={2} sx={{ fontSize: '1.1rem' }}>

              📈 Carregando carteira de ações com cotações reais...

            </Box>

          </Box>

        </Grid>

      </Grid>

    );

  }



  // ERROR HANDLING

  const hasError = marketError || cotacoesError;

  

  const refetchAll = async () => {

    await Promise.all([marketRefetch(), cotacoesRefetch()]);

  };



  return (

    <Grid container spacing={3}>

      {/* Alertas de status */}

      {hasError && (

        <Grid xs={12}>

          <Alert 

            severity="warning"

            action={

              <Button color="inherit" size="small" onClick={refetchAll}>

                🔄 Tentar Novamente

              </Button>

            }

            sx={{ mb: 1 }}

          >

            {marketError && `⚠️ Mercado: ${marketError}`}

            {cotacoesError && `⚠️ Ações: ${cotacoesError}`}

            {hasError && ' - Usando dados offline temporariamente'}

          </Alert>

        </Grid>

      )}



      {/* Indicador de sucesso */}

      {!cotacoesError && ativosAtualizados.length > 0 && (

        <Grid xs={12}>

          <Alert severity="success" sx={{ mb: 1 }}>

            ✅ Carteira de ações atualizada com sucesso - Cotações reais: {ativosAtualizados.filter(a => a.statusApi === 'success').length}/{ativosAtualizados.length} ações via BRAPI

          </Alert>

        </Grid>

      )}



      {!marketError && marketData && (

        <Grid xs={12}>

          <Alert severity="info" sx={{ mb: 1 }}>

            📈 Dados de mercado em tempo real (Ibovespa: {marketData.ibovespa?.value || '140.109'} pts)

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

