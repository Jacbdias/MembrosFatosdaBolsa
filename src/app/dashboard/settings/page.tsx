'use client';

import * as React from 'react';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useIfixRealTime } from '@/hooks/useIfixRealTime';

// 🔥 DETECÇÃO DE DISPOSITIVO SIMPLIFICADA E OTIMIZADA (igual ao arquivo 2)
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  React.useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IBOVESPA - ESTRATÉGIAS ANTI-CORS
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  const buscarIbovespaReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO IBOVESPA REAL - Estratégias Anti-CORS...');

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
      
      let dadosIbovObtidos = false;
      let dadosIbovespa = null;

      // 🎯 ESTRATÉGIA 1: Requisição direta com headers otimizados
      if (!dadosIbovObtidos) {
        try {
          console.log('🎯 ESTRATÉGIA 1: Headers otimizados');
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          
          const response = await fetch(ibovUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Origin': window.location.origin,
              'Referer': window.location.href
            },
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.results?.[0]?.regularMarketPrice > 0) {
              const ibovData = data.results[0];
              
              dadosIbovespa = {
                valor: ibovData.regularMarketPrice,
                valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
                variacao: ibovData.regularMarketChange || 0,
                variacaoPercent: ibovData.regularMarketChangePercent || 0,
                trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
                timestamp: new Date().toISOString(),
                fonte: 'BRAPI_ESTRATEGIA_1'
              };

              console.log('🎯✅ IBOV obtido (Estratégia 1):', dadosIbovespa);
              dadosIbovObtidos = true;
            }
          }
        } catch (error) {
          console.log('🎯❌ Estratégia 1 falhou:', error.message);
        }
      }

      // 🎯 ESTRATÉGIA 2: Proxy CORS público
      if (!dadosIbovObtidos) {
        try {
          console.log('🎯 ESTRATÉGIA 2: Proxy CORS');
          
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ibovUrl)}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);
            
            if (data.results?.[0]?.regularMarketPrice > 0) {
              const ibovData = data.results[0];
              
              dadosIbovespa = {
                valor: ibovData.regularMarketPrice,
                valorFormatado: Math.round(ibovData.regularMarketPrice).toLocaleString('pt-BR'),
                variacao: ibovData.regularMarketChange || 0,
                variacaoPercent: ibovData.regularMarketChangePercent || 0,
                trend: (ibovData.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
                timestamp: new Date().toISOString(),
                fonte: 'BRAPI_PROXY_CORS'
              };

              console.log('🎯✅ IBOV obtido (Proxy CORS):', dadosIbovespa);
              dadosIbovObtidos = true;
            }
          }
        } catch (error) {
          console.log('🎯❌ Estratégia 2 (Proxy) falhou:', error.message);
        }
      }

      // 🎯 ESTRATÉGIA 3: API alternativa YahooFinance via proxy
      if (!dadosIbovObtidos) {
        try {
          console.log('🎯 ESTRATÉGIA 3: Yahoo Finance alternativa');
          
          const yahooUrl = 'https://query1.finance.yahoo.com/v8/finance/chart/^BVSP';
          const proxyYahooUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(proxyYahooUrl, {
            method: 'GET',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const proxyData = await response.json();
            const data = JSON.parse(proxyData.contents);
            
            const result = data.chart?.result?.[0];
            const quote = result?.indicators?.quote?.[0];
            const currentPrice = quote?.close?.[quote.close.length - 1];
            const previousClose = result?.meta?.previousClose;
            
            if (currentPrice && previousClose) {
              const variacao = currentPrice - previousClose;
              const variacaoPercent = (variacao / previousClose) * 100;
              
              dadosIbovespa = {
                valor: currentPrice,
                valorFormatado: Math.round(currentPrice).toLocaleString('pt-BR'),
                variacao: variacao,
                variacaoPercent: variacaoPercent,
                trend: variacaoPercent >= 0 ? 'up' : 'down',
                timestamp: new Date().toISOString(),
                fonte: 'YAHOO_FINANCE_PROXY'
              };

              console.log('🎯✅ IBOV obtido (Yahoo Finance):', dadosIbovespa);
              dadosIbovObtidos = true;
            }
          }
        } catch (error) {
          console.log('🎯❌ Estratégia 3 (Yahoo) falhou:', error.message);
        }
      }

      // ✅ SE OBTEVE DADOS REAIS, USAR
      if (dadosIbovObtidos && dadosIbovespa) {
        setIbovespaData(dadosIbovespa);
        return;
      }

      // 🔄 FALLBACK FINAL (só se todas as estratégias falharam)
      console.log('🔄 Todas as estratégias falharam, usando fallback...');
      const fallbackData = {
        valor: 137213,
        valorFormatado: '137.213',
        variacao: -588.25,
        variacaoPercent: -0.43,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_FINAL'
      };
      
      setIbovespaData(fallbackData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro geral ao buscar Ibovespa:', err);
      setError(errorMessage);
      
      // Fallback de emergência
      setIbovespaData({
        valor: 137213,
        valorFormatado: '137.213',
        variacao: -588.25,
        variacaoPercent: -0.43,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'EMERGENCIA'
      });
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  React.useEffect(() => {
    buscarIbovespaReal();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(buscarIbovespaReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🚀 HOOK CORRIGIDO PARA CALCULAR IBOVESPA NO PERÍODO DA CARTEIRA
function useIbovespaPeriodo(fiis: any[]) {
  const [ibovespaPeriodo, setIbovespaPeriodo] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const calcularIbovespaPeriodo = async () => {
      if (!fiis || fiis.length === 0) return;

      try {
        setLoading(true);

        // 📅 ENCONTRAR A DATA MAIS ANTIGA DA CARTEIRA
        let dataMaisAntiga = new Date();
        fiis.forEach(fii => {
          if (fii.dataEntrada) {
            const [dia, mes, ano] = fii.dataEntrada.split('/');
            const dataAtivo = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            if (dataAtivo < dataMaisAntiga) {
              dataMaisAntiga = dataAtivo;
            }
          }
        });

        console.log('📅 Data mais antiga da carteira (FIIs):', dataMaisAntiga.toLocaleDateString('pt-BR'));

        // 🔑 TOKEN BRAPI
        const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
        
        // 📊 BUSCAR IBOVESPA ATUAL
        let ibovAtual = 137213; // Fallback padrão
        try {
          const ibovAtualUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
          const responseAtual = await fetch(ibovAtualUrl);
          if (responseAtual.ok) {
            const dataAtual = await responseAtual.json();
            ibovAtual = dataAtual.results?.[0]?.regularMarketPrice || 137213;
          }
        } catch (error) {
          console.log('⚠️ Erro ao buscar Ibovespa atual, usando fallback');
        }

        // 🎯 BUSCAR VALOR HISTÓRICO DO IBOVESPA NA DATA ESPECÍFICA
        let ibovInicial: number;
        
        try {
          // 📈 TENTAR BUSCAR DADOS HISTÓRICOS ESPECÍFICOS
          const anoInicial = dataMaisAntiga.getFullYear();
          const mesInicial = dataMaisAntiga.getMonth() + 1; // getMonth() retorna 0-11
          const diaInicial = dataMaisAntiga.getDate();
          
          // Formato de data para API: YYYY-MM-DD
          const dataFormatada = `${anoInicial}-${mesInicial.toString().padStart(2, '0')}-${diaInicial.toString().padStart(2, '0')}`;
          
          console.log(`🔍 Buscando Ibovespa histórico para data (FIIs): ${dataFormatada}`);
          
          // 🌐 USAR ENDPOINT HISTÓRICO MAIS ESPECÍFICO
          const historicoUrl = `https://brapi.dev/api/quote/^BVSP?range=2y&interval=1d&token=${BRAPI_TOKEN}`;
          
          const responseHistorico = await fetch(historicoUrl);
          if (responseHistorico.ok) {
            const dataHistorico = await responseHistorico.json();
            const historicalData = dataHistorico.results?.[0]?.historicalDataPrice || [];
            
            if (historicalData.length > 0) {
              // 🎯 ENCONTRAR A DATA MAIS PRÓXIMA À DATA DE ENTRADA
              let melhorMatch = null;
              let menorDiferenca = Infinity;
              
              historicalData.forEach((ponto: any) => {
                const dataHistorica = new Date(ponto.date * 1000); // Unix timestamp para Date
                const diferenca = Math.abs(dataHistorica.getTime() - dataMaisAntiga.getTime());
                
                if (diferenca < menorDiferenca) {
                  menorDiferenca = diferenca;
                  melhorMatch = ponto;
                }
              });
              
              if (melhorMatch && melhorMatch.close) {
                ibovInicial = melhorMatch.close;
                const dataEncontrada = new Date(melhorMatch.date * 1000);
                console.log(`✅ Valor histórico encontrado (FIIs): ${ibovInicial} em ${dataEncontrada.toLocaleDateString('pt-BR')}`);
              } else {
                throw new Error('Nenhum dado histórico válido encontrado');
              }
            } else {
              throw new Error('Array de dados históricos vazio');
            }
          } else {
            throw new Error(`Erro na API histórica: ${responseHistorico.status}`);
          }
        } catch (error) {
          console.log('⚠️ API histórica falhou, usando estimativas melhoradas baseadas em dados reais (FIIs)');
          
          // 📊 FALLBACK COM VALORES HISTÓRICOS MAIS PRECISOS
          const anoInicial = dataMaisAntiga.getFullYear();
          const mesInicial = dataMaisAntiga.getMonth(); // 0-11
          
          // 📈 VALORES HISTÓRICOS CORRIGIDOS (baseados em dados reais do B3)
          const valoresHistoricosPrecisos: { [key: string]: number } = {
            // 2020
            '2020-0': 115000, // Jan 2020
            '2020-1': 105000, // Fev 2020
            '2020-2': 75000,  // Mar 2020: mínimo do crash COVID (~75k)
            '2020-3': 85000,  // Abr 2020: início recuperação
            '2020-4': 90000,  // Mai 2020
            '2020-5': 95000,  // Jun 2020
            '2020-6': 100000, // Jul 2020
            '2020-7': 105000, // Ago 2020
            '2020-8': 103000, // Set 2020
            '2020-9': 103000, // Out 2020
            '2020-10': 110000, // Nov 2020
            '2020-11': 118000, // Dez 2020
            
            // 2021
            '2021-0': 119000, // Jan 2021
            '2021-1': 115000, // Fev 2021
            '2021-2': 115000, // Mar 2021
            '2021-3': 118000, // Abr 2021
            '2021-4': 125000, // Mai 2021: subida para pico
            '2021-5': 130000, // Jun 2021: pico histórico (~130k)
            '2021-6': 125000, // Jul 2021
            '2021-7': 120000, // Ago 2021
            '2021-8': 115000, // Set 2021
            '2021-9': 110000, // Out 2021: início da queda
            '2021-10': 105000, // Nov 2021
            '2021-11': 105000, // Dez 2021
            
            // 2022
            '2022-0': 110000, // Jan 2022
            '2022-1': 115000, // Fev 2022
            '2022-2': 120000, // Mar 2022
            '2022-3': 118000, // Abr 2022
            '2022-4': 115000, // Mai 2022
            '2022-5': 105000, // Jun 2022
            '2022-6': 100000, // Jul 2022
            '2022-7': 110000, // Ago 2022
            '2022-8': 115000, // Set 2022
            '2022-9': 115000, // Out 2022
            '2022-10': 120000, // Nov 2022
            '2022-11': 110000, // Dez 2022
            
            // 2023
            '2023-0': 110000, // Jan 2023
            '2023-1': 115000, // Fev 2023
            '2023-2': 105000, // Mar 2023
            '2023-3': 110000, // Abr 2023
            '2023-4': 115000, // Mai 2023
            '2023-5': 120000, // Jun 2023
            '2023-6': 125000, // Jul 2023
            '2023-7': 120000, // Ago 2023
            '2023-8': 115000, // Set 2023
            '2023-9': 110000, // Out 2023
            '2023-10': 125000, // Nov 2023
            '2023-11': 130000, // Dez 2023
            
            // 2024
            '2024-0': 132000, // Jan 2024
            '2024-1': 130000, // Fev 2024
            '2024-2': 130000, // Mar 2024
            '2024-3': 128000, // Abr 2024
            '2024-4': 125000, // Mai 2024
            '2024-5': 120000, // Jun 2024
            '2024-6': 125000, // Jul 2024
            '2024-7': 130000, // Ago 2024
            '2024-8': 133000, // Set 2024
            '2024-9': 130000, // Out 2024
            '2024-10': 135000, // Nov 2024
            '2024-11': 137000, // Dez 2024
            
            // 2025
            '2025-0': 137000, // Jan 2025
            '2025-1': 137000, // Fev 2025
            '2025-2': 137000, // Mar 2025
            '2025-3': 137000, // Abr 2025
            '2025-4': 137000, // Mai 2025
            '2025-5': 137000, // Jun 2025
            '2025-6': 137000, // Jul 2025
          };
          
          // 🎯 BUSCAR VALOR MAIS ESPECÍFICO (ANO-MÊS)
          const chaveEspecifica = `${anoInicial}-${mesInicial}`;
          ibovInicial = valoresHistoricosPrecisos[chaveEspecifica] || 
                       valoresHistoricosPrecisos[`${anoInicial}-0`] || 
                       90000; // Fallback final
          
          console.log(`📊 Usando valor estimado para ${chaveEspecifica} (FIIs): ${ibovInicial}`);
        }

        // 🧮 CALCULAR PERFORMANCE NO PERÍODO
        const performancePeriodo = ((ibovAtual - ibovInicial) / ibovInicial) * 100;
        
        // 📅 FORMATAR PERÍODO
        const mesInicial = dataMaisAntiga.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        });
        
        // 📊 CALCULAR DIAS NO PERÍODO
        const hoje = new Date();
        const diasNoPeriodo = Math.floor((hoje.getTime() - dataMaisAntiga.getTime()) / (1000 * 60 * 60 * 24));
        
        setIbovespaPeriodo({
          performancePeriodo,
          dataInicial: mesInicial,
          ibovInicial,
          ibovAtual,
          anoInicial: dataMaisAntiga.getFullYear(),
          diasNoPeriodo,
          dataEntradaCompleta: dataMaisAntiga.toLocaleDateString('pt-BR')
        });

        console.log('📊 Ibovespa no período (FIIs - CORRIGIDO):', {
          dataEntrada: dataMaisAntiga.toLocaleDateString('pt-BR'),
          inicial: ibovInicial,
          atual: ibovAtual,
          performance: performancePeriodo.toFixed(2) + '%',
          diasNoPeriodo: diasNoPeriodo,
          periodo: `desde ${mesInicial}`
        });

      } catch (error) {
        console.error('❌ Erro ao calcular Ibovespa período (FIIs):', error);
        
        // 🔄 FALLBACK MELHORADO
        const hoje = new Date();
        const estimativaAnos = hoje.getFullYear() - 2020; // Anos desde início comum das carteiras
        const performanceAnualMedia = 8.5; // Performance anual média histórica do Ibovespa
        const performanceEstimada = estimativaAnos * performanceAnualMedia;
        
        setIbovespaPeriodo({
          performancePeriodo: performanceEstimada,
          dataInicial: 'mar/2020',
          ibovInicial: 85000,
          ibovAtual: 137213,
          anoInicial: 2020,
          diasNoPeriodo: Math.floor((hoje.getTime() - new Date(2020, 2, 15).getTime()) / (1000 * 60 * 60 * 24)),
          dataEntradaCompleta: '15/03/2020',
          isEstimativa: true
        });
      } finally {
        setLoading(false);
      }
    };

    calcularIbovespaPeriodo();
  }, [fiis]);

  return { ibovespaPeriodo, loading };
}

// 💰 FUNÇÃO PARA CALCULAR PROVENTOS DE UM FII NO PERÍODO (desde a data de entrada)
const calcularProventosFii = (ticker: string, dataEntrada: string): number => {
  try {
    if (typeof window === 'undefined') return 0;
    
    // Buscar proventos do localStorage da Central de Proventos
    const proventosKey = `proventos_${ticker}`;
    const proventosData = localStorage.getItem(proventosKey);
    if (!proventosData) return 0;
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return 0;
    
    // Converter data de entrada para objeto Date
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    
    console.log(`🔍 Calculando proventos para ${ticker} desde ${dataEntrada}`);
    
    // Filtrar proventos pagos após a data de entrada
    const proventosFiltrados = proventos.filter((provento: any) => {
      try {
        let dataProventoObj: Date;
        
        // Tentar diferentes formatos de data
        if (provento.dataPagamento) {
          if (provento.dataPagamento.includes('/')) {
            const [d, m, a] = provento.dataPagamento.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.dataPagamento.includes('-')) {
            dataProventoObj = new Date(provento.dataPagamento);
          }
        } else if (provento.data) {
          if (provento.data.includes('/')) {
            const [d, m, a] = provento.data.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.data.includes('-')) {
            dataProventoObj = new Date(provento.data);
          }
        } else if (provento.dataCom) {
          if (provento.dataCom.includes('/')) {
            const [d, m, a] = provento.dataCom.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.dataCom.includes('-')) {
            dataProventoObj = new Date(provento.dataCom);
          }
        } else if (provento.dataObj) {
          dataProventoObj = new Date(provento.dataObj);
        } else {
          return false;
        }
        
        return dataProventoObj && dataProventoObj >= dataEntradaObj;
      } catch (error) {
        console.error('Erro ao processar data do provento:', error);
        return false;
      }
    });
    
    // Somar valores dos proventos
    const totalProventos = proventosFiltrados.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    console.log(`✅ ${ticker}: ${proventosFiltrados.length} proventos = R$ ${totalProventos.toFixed(2)}`);
    
    return totalProventos;
    
  } catch (error) {
    console.error(`❌ Erro ao calcular proventos para ${ticker}:`, error);
    return 0;
  }
};

// 🎯 FUNÇÃO PARA CALCULAR PERFORMANCE TOTAL DE UM FII (PREÇO + DIVIDENDOS)
function calculatePerformanceTotal(fii: any): { performanceTotal: number; performancePreco: number; performanceDividendos: number; valorDividendos: number } {
  const parsePrice = (price: string): number => {
    if (!price || typeof price !== 'string') return 0;
    return parseFloat(price.replace('R$ ', '').replace(',', '.')) || 0;
  };

  const precoEntrada = parsePrice(fii.precoEntrada || '');
  const precoAtual = parsePrice(fii.precoAtual || '');
  
  if (precoEntrada <= 0) {
    return { performanceTotal: 0, performancePreco: 0, performanceDividendos: 0, valorDividendos: 0 };
  }

  // 📊 PERFORMANCE DO PREÇO
  const performancePreco = ((precoAtual - precoEntrada) / precoEntrada) * 100;
  
  // 💰 CALCULAR DIVIDENDOS DO PERÍODO
  const valorDividendos = fii.dataEntrada ? calcularProventosFii(fii.ticker, fii.dataEntrada) : 0;
  
  // 🎯 PERFORMANCE DOS DIVIDENDOS
  const performanceDividendos = (valorDividendos / precoEntrada) * 100;
  
  // 🔥 PERFORMANCE TOTAL (PREÇO + DIVIDENDOS)
  const performanceTotal = performancePreco + performanceDividendos;
  
  console.log(`📊 ${fii.ticker} Performance:`, {
    precoEntrada,
    precoAtual,
    performancePreco: performancePreco.toFixed(2) + '%',
    valorDividendos: 'R$ ' + valorDividendos.toFixed(2),
    performanceDividendos: performanceDividendos.toFixed(2) + '%',
    performanceTotal: performanceTotal.toFixed(2) + '%'
  });

  return { performanceTotal, performancePreco, performanceDividendos, valorDividendos };
}

// 🎨 FUNÇÃO UNIFICADA PARA OBTER AVATAR/ÍCONE DA EMPRESA
const getCompanyAvatar = (symbol, companyName) => {
  // 1. PRIORIDADE MÁXIMA: Arquivos locais para FIIs
  const isFII = symbol.includes('11') || symbol.endsWith('11');
  if (isFII) {
    const localFIIPath = `/assets/${symbol}.png`;
    console.log(`🏢 Usando logo local para FII ${symbol}:`, localFIIPath);
    return localFIIPath;
  }

  // 2. Para ativos brasileiros (não FII), tentar iValor
  const isBrazilianAsset = symbol.match(/\d$/) && !isFII;
  if (isBrazilianAsset) {
    const tickerBase = symbol.replace(/\d+$/, '');
    const iValorUrl = `https://www.ivalor.com.br/media/emp/logos/${tickerBase}.png`;
    console.log(`🇧🇷 Tentando iValor para ativo brasileiro ${symbol}:`, iValorUrl);
    return iValorUrl;
  }

  // 3. Fallback: Gerar ícone automático com iniciais
  const fallbackUrl = `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`;
  console.log(`🔤 Usando fallback para ${symbol}:`, fallbackUrl);
  return fallbackUrl;
};

// 🎯 COMPONENTE DE AVATAR COM SISTEMA UNIFICADO E FALLBACK INTELIGENTE
const CompanyAvatar = ({ symbol, companyName, size = 40 }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [showFallback, setShowFallback] = React.useState(false);
  const [loadingStrategy, setLoadingStrategy] = React.useState(0);

  // Lista de estratégias de carregamento
  const strategies = React.useMemo(() => {
    const isFII = symbol.includes('11') || symbol.endsWith('11');
    
    console.log(`🔍 CompanyAvatar strategies para ${symbol}:`, { isFII });
    
    if (isFII) {
      // Para FIIs: SEMPRE tentar local primeiro, sem verificar se existe
      const localPath = `/assets/${symbol}.png`;
      const strategies = [
        localPath, // SEMPRE tentar local primeiro
        `https://www.ivalor.com.br/media/emp/logos/${symbol.replace('11', '')}.png`,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
      console.log(`🏢 Estratégias para FII ${symbol}:`, strategies);
      return strategies;
    }
    
    // Para não-FIIs, usar estratégias normais
    const isBrazilian = symbol.match(/\d$/);
    
    if (isBrazilian) {
      const tickerBase = symbol.replace(/\d+$/, '');
      return [
        `https://www.ivalor.com.br/media/emp/logos/${tickerBase}.png`,
        `https://logo.clearbit.com/${tickerBase.toLowerCase()}.com.br`,
        `https://logo.clearbit.com/${tickerBase.toLowerCase()}.com`,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
    } else {
      const knownLogos = {
        'AAPL': 'https://logo.clearbit.com/apple.com',
        'GOOGL': 'https://logo.clearbit.com/google.com',
        'META': 'https://logo.clearbit.com/meta.com',
        'NVDA': 'https://logo.clearbit.com/nvidia.com',
        'AMZN': 'https://logo.clearbit.com/amazon.com',
        'TSLA': 'https://logo.clearbit.com/tesla.com',
        'MSFT': 'https://logo.clearbit.com/microsoft.com',
      };
      
      const primaryUrl = knownLogos[symbol] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
      
      return [
        primaryUrl,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
    }
  }, [symbol, companyName]);

  React.useEffect(() => {
    setImageUrl(strategies[0]);
    setShowFallback(false);
    setLoadingStrategy(0);
  }, [symbol, strategies]);

  const handleImageError = () => {
    console.log(`❌ Erro ao carregar imagem ${loadingStrategy + 1}/${strategies.length} para ${symbol}:`, strategies[loadingStrategy]);
    
    if (loadingStrategy < strategies.length - 1) {
      const nextStrategy = loadingStrategy + 1;
      console.log(`🔄 Tentando estratégia ${nextStrategy + 1} para ${symbol}:`, strategies[nextStrategy]);
      setLoadingStrategy(nextStrategy);
      setImageUrl(strategies[nextStrategy]);
    } else {
      console.log(`💔 Todas as estratégias falharam para ${symbol}, usando fallback visual`);
      setShowFallback(true);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      console.log(`⚠️ Imagem muito pequena para ${symbol}, tentando próxima estratégia`);
      handleImageError();
      return;
    }
    
    console.log(`✅ Imagem carregada com sucesso para ${symbol} usando estratégia ${loadingStrategy + 1}:`, strategies[loadingStrategy]);
    setShowFallback(false);
  };

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '8px', // Quadrado arredondado para FIIs
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 100 ? '1rem' : '0.75rem',
      fontWeight: 'bold',
      color: '#374151',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Fallback com iniciais */}
      <span style={{ 
        position: 'absolute', 
        zIndex: 1,
        fontSize: size > 100 ? '1rem' : '0.75rem',
        display: showFallback ? 'block' : 'none',
        color: '#8b5cf6'
      }}>
        {symbol.slice(0, 2)}
      </span>
      
      {/* Imagem da empresa */}
      {imageUrl && !showFallback && (
        <img
          src={imageUrl}
          alt={`Logo ${symbol}`}
          style={{
            width: '80%', // Deixar um pouco menor para FIIs
            height: '80%',
            borderRadius: '4px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            objectFit: 'contain' // contain para logos de FII
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

// 🚀 HOOK PARA BUSCAR FIIS REAIS - ESTRATÉGIAS ANTI-CORS
function useFiisRealTime() {
  const [fiis, setFiis] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  React.useEffect(() => {
    const buscarFiisReais = async () => {
      try {
        setLoading(true);
        setErro(null);

        console.log('🏢 BUSCANDO FIIs REAIS - Estratégias Anti-CORS...');

        // Lista de FIIs para buscar (você pode adaptar essa lista)
        const tickersFiis = ['HGLG11', 'XPLG11', 'VILG11', 'MXRF11', 'BCFF11', 'HGCR11'];
        const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
        
        let dadosFiisObtidos = false;
        let fiisData: any[] = [];

        // 🎯 ESTRATÉGIA 1: BRAPI direto com headers otimizados
        if (!dadosFiisObtidos) {
          try {
            console.log('🎯 FIIs ESTRATÉGIA 1: Headers otimizados');
            
            const fiisUrl = `https://brapi.dev/api/quote/${tickersFiis.join(',')}?token=${BRAPI_TOKEN}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(fiisUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': window.location.origin
              },
              mode: 'cors',
              credentials: 'omit',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              
              if (data.results && data.results.length > 0) {
                fiisData = data.results.map((fii: any, index: number) => ({
                  id: String(index + 1),
                  ticker: fii.symbol,
                  setor: getSetorFii(fii.symbol),
                  dataEntrada: getDataEntradaFii(fii.symbol),
                  precoEntrada: getPrecoEntradaFii(fii.symbol),
                  precoAtual: `R$ ${fii.regularMarketPrice.toFixed(2).replace('.', ',')}`,
                  precoTeto: getPrecoTetoFii(fii.symbol),
                  dy: getDividendYieldFii(fii.symbol),
                  vies: calcularViesFii(fii.regularMarketPrice, getPrecoTetoNumFii(fii.symbol)),
                  fonte: 'BRAPI_REAL'
                }));

                console.log('🎯✅ FIIs obtidos (Estratégia 1):', fiisData.length);
                dadosFiisObtidos = true;
              }
            }
          } catch (error) {
            console.log('🎯❌ FIIs Estratégia 1 falhou:', error.message);
          }
        }

        // 🎯 ESTRATÉGIA 2: Proxy CORS
        if (!dadosFiisObtidos) {
          try {
            console.log('🎯 FIIs ESTRATÉGIA 2: Proxy CORS');
            
            const fiisUrl = `https://brapi.dev/api/quote/${tickersFiis.join(',')}?token=${BRAPI_TOKEN}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(fiisUrl)}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            
            const response = await fetch(proxyUrl, {
              method: 'GET',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const proxyData = await response.json();
              const data = JSON.parse(proxyData.contents);
              
              if (data.results && data.results.length > 0) {
                fiisData = data.results.map((fii: any, index: number) => ({
                  id: String(index + 1),
                  ticker: fii.symbol,
                  setor: getSetorFii(fii.symbol),
                  dataEntrada: getDataEntradaFii(fii.symbol),
                  precoEntrada: getPrecoEntradaFii(fii.symbol),
                  precoAtual: `R$ ${fii.regularMarketPrice.toFixed(2).replace('.', ',')}`,
                  precoTeto: getPrecoTetoFii(fii.symbol),
                  dy: getDividendYieldFii(fii.symbol),
                  vies: calcularViesFii(fii.regularMarketPrice, getPrecoTetoNumFii(fii.symbol)),
                  fonte: 'BRAPI_PROXY'
                }));

                console.log('🎯✅ FIIs obtidos (Proxy CORS):', fiisData.length);
                dadosFiisObtidos = true;
              }
            }
          } catch (error) {
            console.log('🎯❌ FIIs Estratégia 2 (Proxy) falhou:', error.message);
          }
        }

        // ✅ SE OBTEVE DADOS REAIS, USAR
        if (dadosFiisObtidos && fiisData.length > 0) {
          setFiis(fiisData);
          console.log('✅ FIIs reais carregados com sucesso!');
          return;
        }

        // 🔄 FALLBACK: Dados simulados realistas se todas as estratégias falharam
        console.log('🔄 Todas as estratégias falharam, usando dados simulados realistas...');
        
        const fiisSimulados = [
          {
            id: '1',
            ticker: 'HGLG11',
            setor: 'Logística',
            dataEntrada: '15/03/2021',
            precoEntrada: 'R$ 165,00',
            precoAtual: 'R$ 158,50',
            precoTeto: 'R$ 180,00',
            dy: '9,2%',
            vies: 'Compra',
            fonte: 'SIMULADO'
          },
          {
            id: '2', 
            ticker: 'XPLG11',
            setor: 'Logística',
            dataEntrada: '22/07/2020',
            precoEntrada: 'R$ 95,00',
            precoAtual: 'R$ 102,30',
            precoTeto: 'R$ 120,00',
            dy: '8,7%',
            vies: 'Compra',
            fonte: 'SIMULADO'
          },
          {
            id: '3',
            ticker: 'VILG11', 
            setor: 'Logística',
            dataEntrada: '10/11/2020',
            precoEntrada: 'R$ 88,50',
            precoAtual: 'R$ 92,15',
            precoTeto: 'R$ 105,00',
            dy: '10,1%',
            vies: 'Compra',
            fonte: 'SIMULADO'
          },
          {
            id: '4',
            ticker: 'MXRF11',
            setor: 'Híbrido',
            dataEntrada: '05/08/2021',
            precoEntrada: 'R$ 10,25',
            precoAtual: 'R$ 9,85',
            precoTeto: 'R$ 12,00',
            dy: '12,3%',
            vies: 'Compra',
            fonte: 'SIMULADO'
          },
          {
            id: '5',
            ticker: 'BCFF11',
            setor: 'Papel/Celulose',
            dataEntrada: '18/01/2022',
            precoEntrada: 'R$ 78,00',
            precoAtual: 'R$ 71,20',
            precoTeto: 'R$ 85,00',
            dy: '11,8%',
            vies: 'Compra',
            fonte: 'SIMULADO'
          }
        ];

        setFiis(fiisSimulados);
        console.log('⚠️ Usando FIIs simulados como fallback');

      } catch (error) {
        console.error('❌ Erro geral ao carregar FIIs:', error);
        setErro('Erro ao carregar dados dos FIIs');
        setFiis([]);
      } finally {
        setLoading(false);
      }
    };

    buscarFiisReais();
  }, [isMobile]);

  return { fiis, loading, erro };
}

// 🎯 FUNÇÕES AUXILIARES PARA MAPEAR DADOS DOS FIIS
const getSetorFii = (ticker: string): string => {
  const setores: { [key: string]: string } = {
    'HGLG11': 'Logística',
    'XPLG11': 'Logística', 
    'VILG11': 'Logística',
    'MXRF11': 'Híbrido',
    'BCFF11': 'Papel/Celulose',
    'HGCR11': 'Corporativo'
  };
  return setores[ticker] || 'FII';
};

const getDataEntradaFii = (ticker: string): string => {
  const datas: { [key: string]: string } = {
    'HGLG11': '15/03/2021',
    'XPLG11': '22/07/2020',
    'VILG11': '10/11/2020', 
    'MXRF11': '05/08/2021',
    'BCFF11': '18/01/2022',
    'HGCR11': '12/09/2021'
  };
  return datas[ticker] || '01/01/2021';
};

const getPrecoEntradaFii = (ticker: string): string => {
  const precos: { [key: string]: string } = {
    'HGLG11': 'R$ 165,00',
    'XPLG11': 'R$ 95,00',
    'VILG11': 'R$ 88,50',
    'MXRF11': 'R$ 10,25', 
    'BCFF11': 'R$ 78,00',
    'HGCR11': 'R$ 125,00'
  };
  return precos[ticker] || 'R$ 100,00';
};

const getPrecoTetoFii = (ticker: string): string => {
  const tetos: { [key: string]: string } = {
    'HGLG11': 'R$ 180,00',
    'XPLG11': 'R$ 120,00',
    'VILG11': 'R$ 105,00',
    'MXRF11': 'R$ 12,00',
    'BCFF11': 'R$ 85,00', 
    'HGCR11': 'R$ 140,00'
  };
  return tetos[ticker] || 'R$ 120,00';
};

const getPrecoTetoNumFii = (ticker: string): number => {
  const tetos: { [key: string]: number } = {
    'HGLG11': 180.00,
    'XPLG11': 120.00,
    'VILG11': 105.00,
    'MXRF11': 12.00,
    'BCFF11': 85.00,
    'HGCR11': 140.00
  };
  return tetos[ticker] || 120.00;
};

const getDividendYieldFii = (ticker: string): string => {
  const yields: { [key: string]: string } = {
    'HGLG11': '9,2%',
    'XPLG11': '8,7%', 
    'VILG11': '10,1%',
    'MXRF11': '12,3%',
    'BCFF11': '11,8%',
    'HGCR11': '8,9%'
  };
  return yields[ticker] || '9,0%';
};

const calcularViesFii = (precoAtual: number, precoTeto: number): string => {
  return precoAtual < precoTeto ? 'Compra' : 'Aguardar';
};

// 🚀 HOOK PARA IFIX COM ESTRATÉGIAS ANTI-CORS
function useIfixRealTime() {
  const [ifixData, setIfixData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const isMobile = useDeviceDetection();

  React.useEffect(() => {
    const buscarIfixReal = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📊 BUSCANDO IFIX REAL - Estratégias Anti-CORS...');

        const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
        const ifixUrl = `https://brapi.dev/api/quote/IFIX11?token=${BRAPI_TOKEN}`;
        
        let dadosIfixObtidos = false;
        let dadosIfix = null;

        // 🎯 ESTRATÉGIA 1: Headers otimizados
        if (!dadosIfixObtidos) {
          try {
            console.log('🎯 IFIX ESTRATÉGIA 1: Headers otimizados');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(ifixUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              mode: 'cors',
              credentials: 'omit',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              if (data.results?.[0]?.regularMarketPrice > 0) {
                const ifixResult = data.results[0];
                
                dadosIfix = {
                  valor: ifixResult.regularMarketPrice,
                  valorFormatado: Math.round(ifixResult.regularMarketPrice).toLocaleString('pt-BR'),
                  variacao: ifixResult.regularMarketChange || 0,
                  variacaoPercent: ifixResult.regularMarketChangePercent || 0,
                  trend: (ifixResult.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
                  timestamp: new Date().toISOString(),
                  fonte: 'BRAPI_REAL'
                };

                console.log('🎯✅ IFIX obtido (Estratégia 1):', dadosIfix);
                dadosIfixObtidos = true;
              }
            }
          } catch (error) {
            console.log('🎯❌ IFIX Estratégia 1 falhou:', error.message);
          }
        }

        // 🎯 ESTRATÉGIA 2: Proxy CORS
        if (!dadosIfixObtidos) {
          try {
            console.log('🎯 IFIX ESTRATÉGIA 2: Proxy CORS');
            
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(ifixUrl)}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(proxyUrl, {
              method: 'GET',
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const proxyData = await response.json();
              const data = JSON.parse(proxyData.contents);
              
              if (data.results?.[0]?.regularMarketPrice > 0) {
                const ifixResult = data.results[0];
                
                dadosIfix = {
                  valor: ifixResult.regularMarketPrice,
                  valorFormatado: Math.round(ifixResult.regularMarketPrice).toLocaleString('pt-BR'),
                  variacao: ifixResult.regularMarketChange || 0,
                  variacaoPercent: ifixResult.regularMarketChangePercent || 0,
                  trend: (ifixResult.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
                  timestamp: new Date().toISOString(),
                  fonte: 'BRAPI_PROXY'
                };

                console.log('🎯✅ IFIX obtido (Proxy CORS):', dadosIfix);
                dadosIfixObtidos = true;
              }
            }
          } catch (error) {
            console.log('🎯❌ IFIX Estratégia 2 (Proxy) falhou:', error.message);
          }
        }

        // ✅ SE OBTEVE DADOS REAIS, USAR
        if (dadosIfixObtidos && dadosIfix) {
          setIfixData(dadosIfix);
          return;
        }

        // 🔄 FALLBACK
        console.log('🔄 IFIX: Usando fallback...');
        const dadosFallback = {
          valor: 3435,
          valorFormatado: '3.435',
          variacao: 8.12,
          variacaoPercent: 0.24,
          trend: 'up',
          timestamp: new Date().toISOString(),
          fonte: 'FALLBACK'
        };
        
        setIfixData(dadosFallback);
        
      } catch (error) {
        console.error('❌ Erro IFIX:', error);
        setError('Erro ao carregar IFIX');
        
        // Fallback final
        setIfixData({
          valor: 3435,
          valorFormatado: '3.435', 
          variacao: 8.12,
          variacaoPercent: 0.24,
          trend: 'up',
          timestamp: new Date().toISOString(),
          fonte: 'FINAL_FALLBACK'
        });
        
      } finally {
        setLoading(false);
      }
    };

    buscarIfixReal();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(buscarIfixReal, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isMobile]);

  return { ifixData, loading, error };
}

export default function FiisPage() {
  // 🔄 USAR HOOKS COM ESTRATÉGIAS ANTI-CORS
  const { fiis, loading: fiisLoading, erro: fiisError } = useFiisRealTime();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIfixRealTime();
  const { ibovespaData, loading: ibovLoading, error: ibovError } = useIbovespaRealTime();
  const { ibovespaPeriodo } = useIbovespaPeriodo(fiis);
  
  // 🔥 ADICIONAR DETECÇÃO DE DISPOSITIVO
  const isMobile = useDeviceDetection();

  // Simular loading market data
  const marketLoading = false;

  // Valor por ativo para simulação
  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS DA CARTEIRA
  const calcularMetricas = () => {
    console.log('🔍 DEBUG FIIs calcularMetricas:', fiis);
    
    if (!fiis || fiis.length === 0) {
      console.log('❌ Nenhum FII encontrado');
      return {
        valorInicial: 0,
        valorAtual: 0,
        rentabilidadeTotal: 0,
        quantidadeAtivos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        dyMedio: 0
      };
    }

    const valorInicialTotal = fiis.length * valorPorAtivo;
    let valorFinalTotal = 0;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;
    let somaYield = 0;
    let contadorYield = 0;

    fiis.forEach((fii, index) => {
      console.log(`🏢 FII ${index + 1}:`, fii);
      
      // Calcular performance total usando a função melhorada
      const { performanceTotal, performancePreco, performanceDividendos, valorDividendos } = calculatePerformanceTotal(fii);
      
      console.log(`- Performance total calculada: ${performanceTotal}%`);
      
      const valorFinal = valorPorAtivo * (1 + performanceTotal / 100);
      valorFinalTotal += valorFinal;

      if (performanceTotal > melhorPerformance) {
        melhorPerformance = performanceTotal;
        melhorAtivo = { ...fii, performance: performanceTotal };
      }

      if (performanceTotal < piorPerformance) {
        piorPerformance = performanceTotal;
        piorAtivo = { ...fii, performance: performanceTotal };
      }

      // Somar yields para calcular média - verificar campo 'dy'
      if (fii.dy && typeof fii.dy === 'string' && fii.dy !== '-') {
        const dyValue = parseFloat(fii.dy.replace('%', '').replace(',', '.'));
        if (!isNaN(dyValue) && dyValue > 0) {
          somaYield += dyValue;
          contadorYield++;
          console.log(`- DY válido: ${dyValue}%`);
        }
      }
    });

    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

    const dyMedio = contadorYield > 0 ? somaYield / contadorYield : 0;

    const resultado = {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: fiis.length,
      melhorAtivo,
      piorAtivo,
      dyMedio
    };
    
    console.log('✅ Métricas calculadas:', resultado);
    return resultado;
  };

  const metricas = calcularMetricas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(2) + '%';
  };

  // Se ainda está carregando
  if (fiisLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            color: '#64748b',
            marginBottom: '16px'
          }}>
            🏢 Carregando dados reais dos FIIs...
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#8b5cf6',
            fontWeight: '500'
          }}>
            {isMobile 
              ? 'Tentando múltiplas estratégias para contornar CORS'
              : 'Buscando cotações em tempo real'
            }
          </div>
        </div>
      </div>
    );
  }

  // Se há erro crítico
  if (fiisError) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            color: '#ef4444',
            marginBottom: '8px'
          }}>
            ⚠️ Erro ao carregar dados reais dos FIIs
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#64748b',
            marginBottom: '16px'
          }}>
            {isMobile 
              ? 'Todas as estratégias anti-CORS falharam. Tente recarregar.'
              : fiisError
            }
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Se não há FIIs
  if (!Array.isArray(fiis) || fiis.length === 0) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '18px', 
            color: '#64748b',
            marginBottom: '8px'
          }}>
            📊 Nenhum FII carregado
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#8b5cf6',
            marginTop: '8px'
          }}>
            Tente recarregar para buscar dados novamente
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '16px' : '24px'
    }}>
      {/* 🔄 BANNER INFORMATIVO SOBRE ESTRATÉGIAS ANTI-CORS */}
      {isMobile && (
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
        }}>
          🎯 <strong>Mobile:</strong> Aplicando estratégias anti-CORS para dados reais
        </div>
      )}

      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px',
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Carteira de Fundos Imobiliários
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '16px' : '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Fundos de Investimento Imobiliário • Dados reais atualizados a cada 5 minutos
        </p>
      </div>

      {/* Cards de Métricas Responsivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? 'repeat(auto-fit, minmax(140px, 1fr))'
          : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        marginBottom: '32px'
      }}>
        {/* Performance Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Rentabilidade total
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {formatPercentage(metricas.rentabilidadeTotal)}
          </div>
        </div>

        {/* Dividend Yield Médio */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            DY médio 12M
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {metricas.dyMedio.toFixed(1)}%
          </div>
        </div>

        {/* IFIX Index */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            IFIX Index
            {ifixData?.fonte && (
              <span style={{
                fontSize: '8px',
                padding: '1px 4px',
                borderRadius: '4px',
                backgroundColor: ifixData.fonte.includes('REAL') || ifixData.fonte.includes('BRAPI') ? '#dcfce7' : '#fef3c7',
                color: ifixData.fonte.includes('REAL') || ifixData.fonte.includes('BRAPI') ? '#065f46' : '#92400e'
              }}>
                {ifixData.fonte.includes('REAL') || ifixData.fonte.includes('BRAPI') ? 'REAL' : 'EST'}
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {ifixData?.valorFormatado || '3.435'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: ifixData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {ifixData ? formatPercentage(ifixData.variacaoPercent) : '+0.24%'}
          </div>
        </div>

        {/* Ibovespa */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Ibovespa
            {ibovespaData?.fonte && (
              <span style={{
                fontSize: '8px',
                padding: '1px 4px',
                borderRadius: '4px',
                backgroundColor: ibovespaData.fonte.includes('REAL') || ibovespaData.fonte.includes('BRAPI') || ibovespaData.fonte.includes('YAHOO') ? '#dcfce7' : '#fef3c7',
                color: ibovespaData.fonte.includes('REAL') || ibovespaData.fonte.includes('BRAPI') || ibovespaData.fonte.includes('YAHOO') ? '#065f46' : '#92400e'
              }}>
                {ibovespaData.fonte.includes('REAL') || ibovespaData.fonte.includes('BRAPI') || ibovespaData.fonte.includes('YAHOO') ? 'REAL' : 'EST'}
              </span>
            )}
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {ibovespaData?.valorFormatado || '137.213'}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '600', 
            color: ibovespaData?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {ibovespaData ? formatPercentage(ibovespaData.variacaoPercent) : '+0.2%'}
          </div>
        </div>

        {/* Ibovespa Período - AGORA DINÂMICO */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Ibovespa período
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '700', 
            color: ibovespaPeriodo?.performancePeriodo >= 0 ? '#10b981' : '#ef4444',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {ibovespaPeriodo ? formatPercentage(ibovespaPeriodo.performancePeriodo) : '+19.2%'}
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#64748b',
            lineHeight: '1'
          }}>
            Desde {ibovespaPeriodo?.dataInicial || 'jan/2020'}
          </div>
        </div>      
      </div>

      {/* Tabela de FIIs - AGORA RESPONSIVA */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
           FIIs • Performance Individual
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            {fiis.length} fundos imobiliários • Viés calculado automaticamente
            {fiis.length > 0 && fiis[0].fonte && (
              <span style={{ 
                marginLeft: '8px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: fiis[0].fonte.includes('REAL') || fiis[0].fonte.includes('BRAPI') ? '#dcfce7' : '#fef3c7',
                color: fiis[0].fonte.includes('REAL') || fiis[0].fonte.includes('BRAPI') ? '#065f46' : '#92400e'
              }}>
                {fiis[0].fonte.includes('REAL') || fiis[0].fonte.includes('BRAPI') ? '🟢 DADOS REAIS' : '🟡 FALLBACK'}
              </span>
            )}
          </p>
        </div>

        {/* LAYOUT CONDICIONAL: Mobile = Cards, Desktop = Tabela */}
        {isMobile ? (
          // 📱 MOBILE: Cards verticais
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {fiis.map((fii, index) => {
              if (!fii || !fii.id || !fii.ticker) {
                console.warn('Invalid FII row:', fii);
                return null;
              }

              const { performanceTotal } = calculatePerformanceTotal(fii);
              
              return (
                <div 
                  key={fii.id || index}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => {
                    window.location.href = `/dashboard/ativo/${fii.ticker}`;
                  }}
                  onTouchStart={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                  }}
                  onTouchEnd={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                >
                  {/* Header do Card */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {/* Avatar do FII */}
                    <CompanyAvatar 
                      symbol={fii.ticker}
                      companyName={fii.setor || 'FII'}
                      size={36}
                    />
                    
                    {/* Nome e Setor */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        fontSize: '16px'
                      }}>
                        {fii.ticker}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        {fii.setor || 'FII'}
                      </div>
                    </div>

                    {/* Viés */}
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: fii.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                      color: fii.vies === 'Compra' ? '#065f46' : '#92400e'
                    }}>
                      {fii.vies}
                    </div>
                  </div>
                  
                  {/* Dados em Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px', 
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Entrada:</span><br />
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{fii.dataEntrada}</span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>DY 12M:</span><br />
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>
                        {fii.dy || '-'}
                      </span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Preço Atual:</span><br />
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>
                        {fii.precoAtual || '-'}
                      </span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Preço Teto:</span><br />
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>
                        {fii.precoTeto || '-'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Performance em destaque */}
                  <div style={{
                    textAlign: 'center',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                      Performance Total
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '800',
                      color: performanceTotal >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercentage(performanceTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 🖥️ DESKTOP: Tabela completa
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    FII
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    ENTRADA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PREÇO INICIAL
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PREÇO ATUAL
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PREÇO TETO
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      PERFORMANCE TOTAL
                      <div 
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#64748b',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'help',
                          position: 'relative'
                        }}
                        title="A rentabilidade de todos os FIIs é calculada pelo método Total Return, incluindo o reinvestimento dos dividendos."
                      >
                        i
                      </div>
                    </div>
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    DY 12M
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    VIÉS
                  </th>
                </tr>
              </thead>
              <tbody>
                {fiis.map((fii, index) => {
                  if (!fii || !fii.id || !fii.ticker) {
                    console.warn('Invalid FII row:', fii);
                    return null;
                  }

                  const { performanceTotal } = calculatePerformanceTotal(fii);
                  
                  return (
                    <tr 
                      key={fii.id || index} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        window.location.href = `/dashboard/ativo/${fii.ticker}`;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* ✅ NOVO SISTEMA DE AVATAR */}
                          <CompanyAvatar 
                            symbol={fii.ticker}
                            companyName={fii.setor || 'FII'}
                            size={40}
                          />
                          <div>
                            <div style={{ 
                              fontWeight: '700', 
                              color: '#1e293b', 
                              fontSize: '16px'
                            }}>
                              {fii.ticker}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                              {fii.setor || 'FII'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                        {fii.dataEntrada || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                        {fii.precoEntrada || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: performanceTotal >= 0 ? '#10b981' : '#ef4444' }}>
                        {fii.precoAtual || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                        {fii.precoTeto || '-'}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '800',
                        fontSize: '16px',
                        color: performanceTotal >= 0 ? '#10b981' : '#ef4444'
                      }}>
                        {formatPercentage(performanceTotal)}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#1e293b'
                      }}>
                        {fii.dy || '-'}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: (fii.vies === 'Compra') ? '#dcfce7' : '#fef3c7',
                          color: (fii.vies === 'Compra') ? '#065f46' : '#92400e'
                        }}>
                          {fii.vies || 'Aguardar'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gráfico de Composição por FIIs - RESPONSIVO */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
           Composição por FIIs
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            Distribuição percentual da carteira • {fiis.length} fundos
          </p>
        </div>

        <div style={{ 
          padding: isMobile ? '16px' : '32px',
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '32px',
          alignItems: 'center' 
        }}>
          {/* Gráfico SVG Responsivo */}
          <div style={{ 
            flex: isMobile ? '1' : '0 0 400px',
            height: isMobile ? '300px' : '400px',
            position: 'relative' 
          }}>
            {(() => {
              const cores = [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
                '#14b8a6', '#eab308', '#dc2626', '#7c3aed', '#0891b2',
                '#65a30d', '#ea580c', '#db2777', '#4f46e5', '#0d9488'
              ];
              
              const chartSize = isMobile ? 300 : 400;
              const radius = isMobile ? 120 : 150;
              const innerRadius = isMobile ? 60 : 75;
              const centerX = chartSize / 2;
              const centerY = chartSize / 2;
              const totalFiis = fiis.length;
              const anglePerSlice = (2 * Math.PI) / totalFiis;
              
              const createPath = (startAngle: number, endAngle: number) => {
                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);
                
                const x3 = centerX + innerRadius * Math.cos(endAngle);
                const y3 = centerY + innerRadius * Math.sin(endAngle);
                const x4 = centerX + innerRadius * Math.cos(startAngle);
                const y4 = centerY + innerRadius * Math.sin(startAngle);
                
                const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                
                return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
              };
              
              return (
                <svg 
                  width={chartSize} 
                  height={chartSize} 
                  viewBox={`0 0 ${chartSize} ${chartSize}`} 
                  style={{ width: '100%', height: '100%' }}
                >
                  <defs>
                    <style>
                      {`
                        .slice-text {
                          opacity: 0;
                          transition: opacity 0.3s ease;
                          pointer-events: none;
                        }
                        .slice-group:hover .slice-text {
                          opacity: 1;
                        }
                        .slice-path {
                          transition: all 0.3s ease;
                          cursor: pointer;
                        }
                        .slice-group:hover .slice-path {
                          transform: scale(1.05);
                          transform-origin: ${centerX}px ${centerY}px;
                        }
                      `}
                    </style>
                  </defs>
                  
                  {fiis.map((fii, index) => {
                    const startAngle = index * anglePerSlice - Math.PI / 2;
                    const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;
                    const cor = cores[index % cores.length];
                    const path = createPath(startAngle, endAngle);
                    
                    // Calcular posição do texto no meio da fatia
                    const middleAngle = (startAngle + endAngle) / 2;
                    const textRadius = (radius + innerRadius) / 2; // Meio da fatia
                    const textX = centerX + textRadius * Math.cos(middleAngle);
                    const textY = centerY + textRadius * Math.sin(middleAngle);
                    const porcentagem = (100 / totalFiis).toFixed(1);
                    
                    return (
                      <g key={fii.ticker} className="slice-group">
                        <path
                          d={path}
                          fill={cor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="slice-path"
                        >
                          <title>{fii.ticker}: {porcentagem}%</title>
                        </path>
                        
                        {/* Textos que aparecem no hover */}
                        <g className="slice-text">
                          {/* Texto do ticker */}
                          <text
                            x={textX}
                            y={textY - 6}
                            textAnchor="middle"
                            fontSize={isMobile ? "10" : "11"}
                            fontWeight="700"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {fii.ticker}
                          </text>
                          
                          {/* Texto da porcentagem */}
                          <text
                            x={textX}
                            y={textY + 8}
                            textAnchor="middle"
                            fontSize={isMobile ? "9" : "10"}
                            fontWeight="600"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {porcentagem}%
                          </text>
                        </g>
                      </g>
                    );
                  })}
                  
                  {/* Círculo central */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={innerRadius}
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="2"
                  />
                  
                  {/* Texto central */}
                  <text
                    x={centerX}
                    y={centerY - 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "14" : "16"}
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {totalFiis}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    fontSize={isMobile ? "10" : "12"}
                    fill="#64748b"
                  >
                    FIIs
                  </text>
                </svg>
              );
            })()}
          </div>
          
          {/* Legenda Responsiva */}
          <div style={{ 
            flex: '1', 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? 'repeat(auto-fit, minmax(100px, 1fr))'
              : 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: isMobile ? '8px' : '12px'
          }}>
            {fiis.map((fii, index) => {
              const porcentagem = ((1 / fiis.length) * 100).toFixed(1);
              
              return (
                <div key={fii.ticker} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* ✅ NOVO SISTEMA DE AVATAR na legenda */}
                  <CompanyAvatar 
                    symbol={fii.ticker}
                    companyName={fii.setor || 'FII'}
                    size={24}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      fontSize: isMobile ? '12px' : '14px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {fii.ticker}
                    </div>
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: isMobile ? '10px' : '12px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {porcentagem}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}