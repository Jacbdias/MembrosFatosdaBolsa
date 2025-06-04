/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress } from '@mui/material';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { FIIOverviewTable } from '@/components/dashboard/overview/fii-overview-table';

// 🔥 IMPORTAR O HOOK PARA DADOS FINANCEIROS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IFIX VIA API
function useIFIXRealTime() {
  const [ifixData, setIfixData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIFIXReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO IFIX REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR IFIX (IFIX) VIA BRAPI
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
          const ifixData = data.results[0];
          
          const dadosIFIX = {
            valor: ifixData.regularMarketPrice,
            valorFormatado: Math.round(ifixData.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ifixData.regularMarketChange || 0,
            variacaoPercent: ifixData.regularMarketChangePercent || 0,
            trend: (ifixData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI_REAL'
          };

          console.log('✅ IFIX PROCESSADO:', dadosIFIX);
          setIfixData(dadosIFIX);
          
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
        variacao: 7.85,
        variacaoPercent: 0.25,
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
    buscarIFIXReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIFIXReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIFIXReal]);

  return { ifixData, loading, error, refetch: buscarIFIXReal };
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE PARA FIIs
function calcularViesAutomaticoFII(precoTeto: string, precoAtual: string): string {
  // Remover formatação e converter para números
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  // Verificar se os valores são válidos
  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
    return 'Aguardar';
  }
  
  // 🎯 LÓGICA: Preço Atual < Preço Teto = COMPRA (FII está barato)
  if (precoAtualNum < precoTetoNum) {
    return 'Compra';
  } else {
    return 'Aguardar';
  }
}

// 🎯 FUNÇÃO PARA CALCULAR DIVIDEND YIELD ATUALIZADO PARA FIIs
function calcularDYAtualizadoFII(dyOriginal: string, precoOriginal: string, precoAtual: number): string {
  try {
    // Se DY original já está em decimal (0.1009), converter para %
    let dyNum = parseFloat(dyOriginal.replace('%', '').replace(',', '.'));
    
    // Se o número está entre 0 e 1, é decimal e precisa multiplicar por 100
    if (dyNum > 0 && dyNum < 1) {
      dyNum = dyNum * 100;
    }
    
    const precoOriginalNum = parseFloat(precoOriginal.replace('R$ ', '').replace(',', '.'));
    
    if (isNaN(dyNum) || isNaN(precoOriginalNum) || precoOriginalNum === 0) {
      return `${dyNum.toFixed(2)}%`;
    }
    
    const valorDividendo = (dyNum / 100) * precoOriginalNum;
    const novoDY = (valorDividendo / precoAtual) * 100;
    
    return `${novoDY.toFixed(2)}%`;
  } catch {
    return dyOriginal;
  }
}

// 🔥 DADOS BASE DOS FIIs EXTRAÍDOS DO EXCEL
const fiisBase = [
  {
    id: '1',
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/mall11-logo.png',
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
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/knsc11-logo.png',
    ticker: 'KNSC11',
    tickerBrapi: 'KNSC11',
    setor: 'Papel',
    dataEntrada: '24/05/2022',
    precoEntrada: 'R$ 9,31',
    dy: '11,52%',
    precoTeto: 'R$ 9,16',
    rank: '2º'
  },
  {
    id: '3',
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/knhf11-logo.png',
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
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/hgbs11-logo.png',
    ticker: 'HGBS11',
    tickerBrapi: 'HGBS11',
    setor: 'Shopping',
    dataEntrada: '02/01/2025',
    precoEntrada: 'R$ 186,08',
    dy: '10,77%',
    precoTeto: 'R$ 192,00',
    rank: '4º'
  },
  {
    id: '5',
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/rura11-logo.png',
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
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/bcia11-logo.png',
    ticker: 'BCIA11',
    tickerBrapi: 'BCIA11',
    setor: 'FoF',
    dataEntrada: '12/04/2023',
    precoEntrada: 'R$ 82,28',
    dy: '11,80%',
    precoTeto: 'R$ 87,81',
    rank: '6º'
  },
  {
    id: '7',
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/bpff11-logo.png',
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
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/hgff11-logo.png',
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
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/brco11-logo.png',
    ticker: 'BRCO11',
    tickerBrapi: 'BRCO11',
    setor: 'Logística',
    dataEntrada: '09/05/2022',
    precoEntrada: 'R$ 99,25',
    dy: '10,18%',
    precoTeto: 'R$ 109,89',
    rank: '9º'
  },
  {
    id: '10',
    avatar: 'https://www.fiis.com.br/wp-content/uploads/2023/05/irdm11-logo.png',
    ticker: 'IRDM11',
    tickerBrapi: 'IRDM11',
    setor: 'Híbrido',
    dataEntrada: '15/06/2023',
    precoEntrada: 'R$ 95,50',
    dy: '9,85%',
    precoTeto: 'R$ 102,30',
    rank: '10º'
  }
];

// 🚀 HOOK PARA BUSCAR COTAÇÕES REAIS DOS FIIs DA BRAPI
function useBrapiFIICotacoes() {
  const [fiisAtualizados, setFiisAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarCotacoesFIIs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES DOS FIIs VIA BRAPI');

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS DOS FIIs
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
        console.log(`🌐 URL: ${apiUrl.replace(BRAPI_TOKEN, 'TOKEN_FUNCIONANDO')}`);

        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'FII-Portfolio-App'
            }
          });

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
                console.log(`🔍 Processando FII: ${quote.symbol}`);
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
            
            const errorText = await response.text();
            console.error('📄 Resposta de erro:', errorText);
            
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
      console.log('🗺️ Mapa de cotações FIIs:', Array.from(cotacoesMap.entries()));

      // 🔥 COMBINAR DADOS BASE COM COTAÇÕES REAIS
      const fiisComCotacoes = fiisBase.map((fii) => {
        const cotacao = cotacoesMap.get(fii.tickerBrapi);
        const precoEntradaNum = parseFloat(fii.precoEntrada.replace('R$ ', '').replace(',', '.'));
        
        console.log(`\n🔄 Processando FII ${fii.ticker}:`);
        console.log(`💵 Preço entrada: R$ ${precoEntradaNum}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          // 📊 PREÇO E PERFORMANCE REAIS
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          // VALIDAR SE O PREÇO FAZ SENTIDO
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 500) {
            console.warn(`🚨 ${fii.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            return {
              ...fii,
              precoAtual: fii.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomaticoFII(fii.precoTeto, fii.precoEntrada),
              dy: fii.dy,
              statusApi: 'suspicious_price',
              nomeCompleto: cotacao.nome
            };
          }
          
          const precoAtualFormatado = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          
          return {
            ...fii,
            precoAtual: precoAtualFormatado,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomaticoFII(fii.precoTeto, precoAtualFormatado),
            dy: calcularDYAtualizadoFII(fii.dy, fii.precoEntrada, precoAtualNum),
            statusApi: 'success',
            nomeCompleto: cotacao.nome
          };
        } else {
          // ⚠️ FALLBACK PARA FIIs SEM COTAÇÃO
          console.warn(`⚠️ ${fii.ticker}: Sem cotação válida, usando preço de entrada`);
          
          return {
            ...fii,
            precoAtual: fii.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomaticoFII(fii.precoTeto, fii.precoEntrada),
            dy: fii.dy,
            statusApi: 'not_found',
            nomeCompleto: 'N/A'
          };
        }
      });

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = fiisComCotacoes.filter(f => f.statusApi === 'success').length;
      const suspeitos = fiisComCotacoes.filter(f => f.statusApi === 'suspicious_price').length;
      const naoEncontrados = fiisComCotacoes.filter(f => f.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS FIIs:');
      console.log(`✅ Sucessos: ${sucessos}/${fiisComCotacoes.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${fiisComCotacoes.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${fiisComCotacoes.length}`);
      
      if (sucessos > 0) {
        const performanceMedia = fiisComCotacoes
          .filter(f => f.statusApi === 'success')
          .reduce((sum, f) => sum + f.performance, 0) / sucessos;
        console.log(`📈 Performance média FIIs: ${performanceMedia.toFixed(2)}%`);
      }

      setFiisAtualizados(fiisComCotacoes);

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < fiisComCotacoes.length / 2) {
        setError(`Apenas ${sucessos} de ${fiisComCotacoes.length} FIIs com cotação válida`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} FIIs com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações FIIs:', err);
      
      // 🔄 FALLBACK: USAR DADOS ESTÁTICOS
      console.log('🔄 Usando fallback completo com preços de entrada...');
      const fiisFallback = fiisBase.map(fii => ({
        ...fii,
        precoAtual: fii.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: calcularViesAutomaticoFII(fii.precoTeto, fii.precoEntrada),
        dy: fii.dy,
        statusApi: 'error',
        nomeCompleto: 'Erro'
      }));
      setFiisAtualizados(fiisFallback);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarCotacoesFIIs();

    // ATUALIZAR A CADA 10 MINUTOS
    const interval = setInterval(buscarCotacoesFIIs, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarCotacoesFIIs]);

  return {
    fiisAtualizados,
    loading,
    error,
    refetch: buscarCotacoesFIIs,
  };
}

export default function FIIOverviewPage(): React.JSX.Element {
  console.log("🔥 PÁGINA OVERVIEW (FIIs) - VERSÃO COM IFIX DINÂMICO");

  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { fiisAtualizados, loading: cotacoesLoading, error: cotacoesError, refetch: cotacoesRefetch } = useBrapiFIICotacoes();
  
  // 🚀 BUSCAR DADOS REAIS DO IFIX
  const { ifixData, loading: ifixLoading, error: ifixError, refetch: ifixRefetch } = useIFIXRealTime();

  // 🔥 CONSTRUIR DADOS DOS CARDS COM IFIX DINÂMICO
  const construirDadosCards = () => {
    const dadosBase = {
      ibovespa: { value: "136985", trend: "down" as const, diff: -0.02 },
      carteiraHoje: { value: "12.4%", trend: "up" as const },
      dividendYield: { value: "11.8%", trend: "up" as const },
      ifixPeriodo: { value: "8.7%", trend: "up" as const, diff: 8.7 },
      carteiraPeriodo: { value: "15.2%", trend: "up" as const, diff: 15.2 },
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

    // 🔄 FALLBACK: usar dados da API de mercado se disponível
    if (marketData?.ifix) {
      console.log('🔄 USANDO DADOS DA API DE MERCADO');
      return {
        ...dadosBase,
        ifix: marketData.ifix
      };
    }

    // 🔄 FALLBACK FINAL: valor estimado
    console.log('🔄 USANDO FALLBACK FINAL');
    return {
      ...dadosBase,
      ifix: { value: "3200", trend: "up" as const, diff: 0.25 }
    };
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DOS FIIs
  const calcularDYFIIs = () => {
    if (fiisAtualizados.length === 0) return { value: "11.8%", trend: "up" as const };
    
    const dyValues = fiisAtualizados
      .map(fii => {
        let dyString = fii.dy.replace('%', '').replace(',', '.');
        let dyNum = parseFloat(dyString);
        
        // Se está entre 0 e 1, converter de decimal para percentual
        if (dyNum > 0 && dyNum < 1) {
          dyNum = dyNum * 100;
        }
        
        return dyNum;
      })
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return { value: "11.8%", trend: "up" as const };
    
    const dyMedio = dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length;
    
    return {
      value: `${dyMedio.toFixed(1)}%`,
      trend: "up" as const,
      diff: dyMedio,
    };
  };

  // CALCULAR PERFORMANCE MÉDIA DA CARTEIRA FIIs
  const calcularPerformanceFIIs = () => {
    console.log('🔍 DEBUG calcularPerformanceFIIs:');
    console.log('- fiisAtualizados.length:', fiisAtualizados.length);
    
    if (fiisAtualizados.length === 0) {
      console.log('❌ Portfolio FII vazio, usando padrão');
      return { value: "12.4%", trend: "up" as const };
    }
    
    const performances = fiisAtualizados
      .filter(fii => {
        const hasPerformance = fii.performance !== undefined && !isNaN(fii.performance);
        console.log(`🔍 FII ${fii.ticker}: performance = ${fii.performance}, válida = ${hasPerformance}`);
        return hasPerformance;
      })
      .map(fii => fii.performance);
    
    console.log('🔍 Performances válidas FIIs:', performances);
    
    if (performances.length === 0) {
      console.log('❌ Nenhuma performance válida, usando padrão');
      return { value: "12.4%", trend: "up" as const };
    }
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    console.log('✅ Performance média FIIs calculada:', performancMedia);
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // 🔥 CONSTRUIR DADOS FINAIS COM CÁLCULOS DINÂMICOS
  const dadosCards = {
    ...construirDadosCards(),
    dividendYield: calcularDYFIIs(),
    carteiraHoje: calcularPerformanceFIIs(),
  };

  React.useEffect(() => {
    if (ifixData) {
      console.log('\n🎯 IFIX REAL CARREGADO:');
      console.log(`📊 Valor: ${ifixData.valorFormatado}`);
      console.log(`📈 Variação: ${ifixData.variacaoPercent}%`);
      console.log(`🎨 Trend: ${ifixData.trend}`);
      console.log(`🕐 Fonte: ${ifixData.fonte}`);
    }
  }, [ifixData]);

  React.useEffect(() => {
    if (fiisAtualizados.length > 0) {
      console.log('\n🎯 RESULTADO FINAL PARA INTERFACE FIIs:');
      fiisAtualizados.forEach(fii => {
        console.log(`📊 ${fii.ticker}: ${fii.precoAtual} (${fii.statusApi}) - Performance: ${fii.performance?.toFixed(2)}%`);
      });
    }
  }, [fiisAtualizados]);

  // LOADING STATE
  if (cotacoesLoading || marketLoading || ifixLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              🏢 Carregando dados reais do mercado e FIIs...
            </Box>
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      
      <Grid xs={12}>
        <FIIOverviewTable 
          count={fiisAtualizados.length} 
          rows={fiisAtualizados}
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
          ifixReal={ifixData}
        />
      </Grid>
    </Grid>
  );
}
