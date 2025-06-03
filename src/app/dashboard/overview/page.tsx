/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, CircularProgress } from '@mui/material';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { OverviewTable } from '@/components/dashboard/overview/overview-table';

// 🔥 IMPORTAR O HOOK PARA DADOS FINANCEIROS REAIS
import { useFinancialData } from '@/hooks/useFinancialData';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IBOVESPA VIA API
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIbovespaReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO IBOVESPA REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO (MESMO DO SEU CÓDIGO)
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR IBOVESPA (^BVSP) VIA BRAPI
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 Buscando Ibovespa:', ibovUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));

      const response = await fetch(ibovUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Ibovespa-Real-Time-App'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta IBOVESPA:', data);

        if (data.results && data.results.length > 0) {
          const ibovData = data.results[0];
          
          const dadosIbovespa = {
            valor: ibovData.regularMarketPrice,
            valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
            variacao: ibovData.regularMarketChange || 0,
            variacaoPercent: ibovData.regularMarketChangePercent || 0,
            trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
            timestamp: new Date().toISOString(),
            fonte: 'BRAPI_REAL'
          };

          console.log('✅ IBOVESPA PROCESSADO:', dadosIbovespa);
          setIbovespaData(dadosIbovespa);
          
        } else {
          throw new Error('Sem dados do Ibovespa na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar Ibovespa:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK: Usar valor aproximado baseado na B3
      console.log('🔄 Usando fallback com valor aproximado da B3...');
      const fallbackData = {
        valor: 136985,
        valorFormatado: '136.985',
        variacao: -21.25,
        variacaoPercent: -0.02,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_B3'
      };
      setIbovespaData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIbovespaReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIbovespaReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesAutomatico(precoTeto: string, precoAtual: string): string {
  // Remover formatação e converter para números
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  // Verificar se os valores são válidos
  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
    return 'Aguardar'; // Default se não conseguir calcular
  }
  
  // 🎯 LÓGICA CORRETA: Preço Atual < Preço Teto = COMPRA (ação está barata)
  if (precoAtualNum < precoTetoNum) {
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
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    ticker: 'CSED3',
    tickerBrapi: 'CSED3',
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
    tickerBrapi: 'PRIO3',
    setor: 'Petróleo',
    dataEntrada: '04/08/2022',
    precoEntrada: 'R$ 23,35',
    dy: '8,50%',
    precoTeto: 'R$ 48,70',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RAPT.png',
    ticker: 'RAPT4',
    tickerBrapi: 'RAPT4',
    setor: 'Industrial',
    dataEntrada: '16/09/2021',
    precoEntrada: 'R$ 10,69',
    dy: '6,50%',
    precoTeto: 'R$ 14,00',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
    ticker: 'SMTO3',
    tickerBrapi: 'SMTO3',
    setor: 'Siderúrgico',
    dataEntrada: '10/11/2022',
    precoEntrada: 'R$ 28,20',
    dy: '4,50%',
    precoTeto: 'R$ 35,00',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FESA.png',
    ticker: 'FESA4',
    tickerBrapi: 'FESA4',
    setor: 'Commodities',
    dataEntrada: '11/12/2020',
    precoEntrada: 'R$ 4,49',
    dy: '8,00%',
    precoTeto: 'R$ 14,07',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/UNIP.png',
    ticker: 'UNIP6',
    tickerBrapi: 'UNIP6',
    setor: 'Químico',
    dataEntrada: '08/12/2020',
    precoEntrada: 'R$ 42,41',
    dy: '0,00%',
    precoTeto: 'R$ 117,90',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FLRY.png',
    ticker: 'FLRY3',
    tickerBrapi: 'FLRY3',
    setor: 'Saúde',
    dataEntrada: '19/05/2022',
    precoEntrada: 'R$ 14,63',
    dy: '2,50%',
    precoTeto: 'R$ 17,50',
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EZTC.png',
    ticker: 'EZTC3',
    tickerBrapi: 'EZTC3',
    setor: 'Construção Civil',
    dataEntrada: '07/10/2022',
    precoEntrada: 'R$ 22,61',
    dy: '12,00%',
    precoTeto: 'R$ 30,00',
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/JALL.png',
    ticker: 'JALL3',
    tickerBrapi: 'JALL3',
    setor: 'Siderúrgico',
    dataEntrada: '17/06/2022',
    precoEntrada: 'R$ 8,36',
    dy: '6,50%',
    precoTeto: 'R$ 11,90',
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/YDUQ.png',
    ticker: 'YDUQ3',
    tickerBrapi: 'YDUQ3',
    setor: 'Educação',
    dataEntrada: '11/11/2020',
    precoEntrada: 'R$ 27,16',
    dy: '4,50%',
    precoTeto: 'R$ 15,00',
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SIMH.png',
    ticker: 'SIMH3',
    tickerBrapi: 'SIMH3',
    setor: 'Logística',
    dataEntrada: '03/12/2020',
    precoEntrada: 'R$ 7,88',
    dy: '8,00%',
    precoTeto: 'R$ 10,79',
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
    ticker: 'ALUP11',
    tickerBrapi: 'ALUP11',
    setor: 'Energia',
    dataEntrada: '25/11/2020',
    precoEntrada: 'R$ 24,40',
    dy: '6,50%',
    precoTeto: 'R$ 29,00',
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NEOE.png',
    ticker: 'NEOE3',
    tickerBrapi: 'NEOE3',
    setor: 'Energia',
    dataEntrada: '04/05/2021',
    precoEntrada: 'R$ 15,94',
    dy: '4,96%',
    precoTeto: 'R$ 21,00',
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
  console.log("🔥 PÁGINA OVERVIEW (AÇÕES) - VERSÃO COM IBOVESPA DINÂMICO");

  const { marketData, loading: marketLoading, error: marketError, refetch: marketRefetch } = useFinancialData();
  const { ativosAtualizados, loading: cotacoesLoading, error: cotacoesError, refetch: cotacoesRefetch } = useBrapiCotacoesValidadas();
  
  // 🚀 BUSCAR DADOS REAIS DO IBOVESPA
  const { ibovespaData, loading: ibovLoading, error: ibovError, refetch: ibovRefetch } = useIbovespaRealTime();

  // 🔥 CONSTRUIR DADOS DOS CARDS COM IBOVESPA DINÂMICO
  const construirDadosCards = () => {
    const dadosBase = {
      indiceSmall: { value: "3200", trend: "up" as const, diff: 0.24 },     // 📊 IFIX: 3.200 pontos
      carteiraHoje: { value: "88.7%", trend: "up" as const },
      dividendYield: { value: "7.4%", trend: "up" as const },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };

    // 🎯 USAR DADOS REAIS DO IBOVESPA SE DISPONÍVEL
    if (ibovespaData) {
      console.log('🔥 USANDO IBOVESPA REAL:', ibovespaData);
      return {
        ...dadosBase,
        ibovespa: {
          value: ibovespaData.valorFormatado,  // Valor já formatado (ex: "136.985")
          trend: ibovespaData.trend,           // "up" ou "down"
          diff: ibovespaData.variacaoPercent   // -0.02
        }
      };
    }

    // 🔄 FALLBACK: usar dados da API de mercado se disponível
    if (marketData?.ibovespa) {
      console.log('🔄 USANDO DADOS DA API DE MERCADO');
      return {
        ...dadosBase,
        ibovespa: marketData.ibovespa
      };
    }

    // 🔄 FALLBACK FINAL: valor estimado
    console.log('🔄 USANDO FALLBACK FINAL');
    return {
      ...dadosBase,
      ibovespa: { value: "136985", trend: "down" as const, diff: -0.02 }  // Será expandido para "136.985"
    };
  };

  // CALCULAR DIVIDEND YIELD MÉDIO DAS AÇÕES
  const calcularDYAcoes = () => {
    if (ativosAtualizados.length === 0) return { value: "7.4%", trend: "up" as const };
    
    const dyValues = ativosAtualizados
      .map(acao => parseFloat(acao.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    if (dyValues.length === 0) return { value: "7.4%", trend: "up" as const };
    
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
      return { value: "88.7%", trend: "up" as const };
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
      return { value: "88.7%", trend: "up" as const };
    }
    
    const performancMedia = performances.reduce((sum, perf) => sum + perf, 0) / performances.length;
    console.log('✅ Performance média calculada:', performancMedia);
    
    return {
      value: `${performancMedia.toFixed(1)}%`,
      trend: performancMedia >= 0 ? "up" as const : "down" as const,
      diff: performancMedia,
    };
  };

  // 🔥 CONSTRUIR DADOS FINAIS COM CÁLCULOS DINÂMICOS
  const dadosCards = {
    ...construirDadosCards(),
    dividendYield: calcularDYAcoes(),
    carteiraHoje: calcularPerformanceAcoes(),
  };

  React.useEffect(() => {
    if (ibovespaData) {
      console.log('\n🎯 IBOVESPA REAL CARREGADO:');
      console.log(`📊 Valor: ${ibovespaData.valorFormatado}`);
      console.log(`📈 Variação: ${ibovespaData.variacaoPercent}%`);
      console.log(`🎨 Trend: ${ibovespaData.trend}`);
      console.log(`🕐 Fonte: ${ibovespaData.fonte}`);
    }
  }, [ibovespaData]);

  React.useEffect(() => {
    if (ativosAtualizados.length > 0) {
      console.log('\n🎯 RESULTADO FINAL PARA INTERFACE:');
      ativosAtualizados.forEach(ativo => {
        console.log(`📊 ${ativo.ticker}: ${ativo.precoAtual} (${ativo.statusApi}) - Performance: ${ativo.performance?.toFixed(2)}%`);
      });
    }
  }, [ativosAtualizados]);

  // LOADING STATE
  if (cotacoesLoading || marketLoading || ibovLoading) {
    return (
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress size={40} />
            <Box ml={2} sx={{ fontSize: '1.1rem' }}>
              📈 Carregando dados reais do mercado e ações...
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
        <OverviewTable 
          count={ativosAtualizados.length} 
          rows={ativosAtualizados}
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
          ibovespaReal={ibovespaData}
        />
      </Grid>
    </Grid>
  );
}
