/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useDataStore } from '@/hooks/useDataStore';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DE ÍNDICES INTERNACIONAIS
function useIndicesInternacionaisRealTime() {
  const [indicesData, setIndicesData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIndicesReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 BUSCANDO ÍNDICES INTERNACIONAIS REAIS...');

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR S&P 500 E NASDAQ VIA BRAPI COM TIMEOUT
      const indices = ['^GSPC', '^IXIC']; // S&P 500 e NASDAQ
      const indicesUrl = `https://brapi.dev/api/quote/${indices.join(',')}?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 Buscando índices internacionais...');

      // 🔥 ADICIONAR TIMEOUT DE 5 SEGUNDOS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(indicesUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'International-Indices-App'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Resposta Índices Internacionais:', data);

        if (data.results && data.results.length > 0) {
          const dadosIndices = {
            sp500: null,
            nasdaq: null
          };

          data.results.forEach((indice: any) => {
            console.log('🔍 Processando índice:', indice.symbol, indice.regularMarketPrice);
            
            if (indice.symbol === '^GSPC') {
              dadosIndices.sp500 = {
                valor: indice.regularMarketPrice,
                valorFormatado: indice.regularMarketPrice.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }),
                variacao: indice.regularMarketChange || 0,
                variacaoPercent: indice.regularMarketChangePercent || 0,
                trend: (indice.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down'
              };
              console.log('✅ S&P 500 processado:', dadosIndices.sp500);
            } else if (indice.symbol === '^IXIC') {
              dadosIndices.nasdaq = {
                valor: indice.regularMarketPrice,
                valorFormatado: indice.regularMarketPrice.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                }),
                variacao: indice.regularMarketChange || 0,
                variacaoPercent: indice.regularMarketChangePercent || 0,
                trend: (indice.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down'
              };
              console.log('✅ NASDAQ processado:', dadosIndices.nasdaq);
            }
          });

          console.log('✅ ÍNDICES INTERNACIONAIS PROCESSADOS:', dadosIndices);
          setIndicesData(dadosIndices);
          
        } else {
          throw new Error('Sem dados dos índices na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar índices internacionais:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK CORRIGIDO
      console.log('🔄 Usando fallback para índices internacionais...');
      const fallbackData = {
        sp500: {
          valor: 5970.80,
          valorFormatado: '5,970.80',
          variacao: 35.2,
          variacaoPercent: 0.59,
          trend: 'up'
        },
        nasdaq: {
          valor: 19400.00,
          valorFormatado: '19,400.00',
          variacao: 156.3,
          variacaoPercent: 0.81,
          trend: 'up'
        }
      };
      setIndicesData(fallbackData);
      console.log('✅ Fallback aplicado:', fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    buscarIndicesReal();
    
    // 🔄 ATUALIZAR A CADA 5 MINUTOS
    const interval = setInterval(buscarIndicesReal, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // 🔥 ARRAY VAZIO PARA EVITAR LOOP INFINITO

  return { indicesData, loading, error, refetch: buscarIndicesReal };
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesAutomatico(precoTeto: number | undefined, precoAtual: string): string {
  if (!precoTeto || precoAtual === 'N/A' || precoTeto === 0) {
    return 'Aguardar';
  }
  
  // Remover formatação e converter para números
  const precoAtualNum = parseFloat(precoAtual.replace('US$', '').replace(',', '.'));
  
  if (isNaN(precoAtualNum)) {
    return 'Aguardar';
  }
  
  // 🎯 LÓGICA CORRETA: Preço Atual < Preço Teto = COMPRA (ação está barata)
  if (precoAtualNum < precoTeto) {
    return 'Compra';
  } else {
    return 'Aguardar';
  }
}

// 🎯 FUNÇÃO PARA CALCULAR DY DOS ÚLTIMOS 12 MESES BASEADO NOS PROVENTOS UPLOADADOS
function calcularDY12Meses(ticker: string, precoAtual: number): string {
  try {
    if (typeof window === 'undefined' || precoAtual <= 0) return '0,00%';
    
    // Buscar proventos do ticker específico no localStorage
    const proventosData = localStorage.getItem(`proventos_${ticker}`);
    if (!proventosData) return '0,00%';
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return '0,00%';
    
    // Data de 12 meses atrás
    const hoje = new Date();
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    
    console.log(`🔍 Calculando DY para ${ticker}:`);
    
    // Filtrar proventos dos últimos 12 meses
    const proventosUltimos12Meses = proventos.filter((provento: any) => {
      let dataProvento: Date;
      
      // Tentar várias formas de parsing da data
      if (provento.dataObj) {
        dataProvento = new Date(provento.dataObj);
      } else if (provento.dataCom) {
        if (provento.dataCom.includes('/')) {
          const [d, m, a] = provento.dataCom.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.dataCom);
        }
      } else if (provento.data) {
        if (provento.data.includes('/')) {
          const [d, m, a] = provento.data.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.data);
        }
      } else {
        return false;
      }
      
      return dataProvento >= umAnoAtras && dataProvento <= hoje;
    });
    
    if (proventosUltimos12Meses.length === 0) {
      console.log(`❌ ${ticker}: Nenhum provento nos últimos 12 meses`);
      return '0,00%';
    }
    
    // Somar valores dos proventos
    const totalProventos = proventosUltimos12Meses.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    if (totalProventos <= 0) {
      return '0,00%';
    }
    
    // Calcular DY: (Total Proventos 12 meses / Preço Atual) * 100
    const dy = (totalProventos / precoAtual) * 100;
    
    return `${dy.toFixed(2).replace('.', ',')}%`;
    
  } catch (error) {
    console.error(`❌ Erro ao calcular DY para ${ticker}:`, error);
    return '0,00%';
  }
}

// 🚀 HOOK CORRIGIDO PARA BUSCAR COTAÇÕES DOS ATIVOS - USANDO DATASTORE
function useExteriorStocksIntegradas() {
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // 🔥 USAR O DATASTORE EM VEZ DE LOCALSTORAGE DIRETO
  const { dados } = useDataStore();

  const buscarCotacoesIntegradas = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔥 BUSCANDO COTAÇÕES INTEGRADAS PARA EXTERIOR STOCKS - USANDO DATASTORE');
      
      // 🔄 USAR DADOS DO DATASTORE
      const exteriorStocksData = dados.exteriorStocks || [];
      console.log('📋 Ativos do DataStore:', exteriorStocksData);
      console.log('📊 Total de ativos:', exteriorStocksData.length);

      if (exteriorStocksData.length === 0) {
        console.log('⚠️ Nenhum ativo encontrado no DataStore');
        setAtivosAtualizados([]);
        setLoading(false);
        return;
      }

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = exteriorStocksData.map((ativo: any) => ativo.ticker);
      console.log('🎯 Tickers para buscar:', tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES COM TOKEN E TIMEOUT
      const LOTE_SIZE = 5;
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`;
        
        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);

        try {
          // 🔥 ADICIONAR TIMEOUT DE 8 SEGUNDOS PARA LOTES MÚLTIPLOS
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'ExteriorStocks-Portfolio-App'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
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
                  console.log(`✅ ${quote.symbol}: US$ ${quote.regularMarketPrice}`);
                } else {
                  console.warn(`⚠️ ${quote.symbol}: Dados inválidos (preço: ${quote.regularMarketPrice})`);
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

      // 🔥 COMBINAR DADOS DO DATASTORE COM COTAÇÕES REAIS
      const ativosComCotacoes = exteriorStocksData.map((ativo: any, index: number) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        
        console.log(`\n🔄 Processando ${ativo.ticker}:`);
        console.log(`💵 Preço entrada: US$ ${ativo.precoEntrada}`);
        console.log(`🎯 Preço teto: ${ativo.precoTeto}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          // 📊 PREÇO E PERFORMANCE REAIS
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - ativo.precoEntrada) / ativo.precoEntrada) * 100;
          
          console.log(`💰 Preço atual: US$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          // VALIDAR SE O PREÇO FAZ SENTIDO (para ações americanas, usar limite maior)
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 1000) {
            console.warn(`🚨 ${ativo.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            return {
              ...ativo,
              id: String(ativo.id || index + 1),
              precoAtual: ativo.precoEntrada,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
              dy: '0,00%',
              statusApi: 'suspicious_price',
              nomeCompleto: cotacao.nome,
              rank: (index + 1) + '°'
            };
          }
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual: precoAtualNum,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${precoAtualNum.toFixed(2)}`),
            dy: calcularDY12Meses(ativo.ticker, precoAtualNum),
            statusApi: 'success',
            nomeCompleto: cotacao.nome,
            rank: (index + 1) + '°'
          };
        } else {
          // ⚠️ FALLBACK PARA AÇÕES SEM COTAÇÃO
          console.warn(`⚠️ ${ativo.ticker}: Sem cotação válida, usando preço de entrada`);
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
            dy: calcularDY12Meses(ativo.ticker, ativo.precoEntrada),
            statusApi: 'not_found',
            nomeCompleto: 'N/A',
            rank: (index + 1) + '°'
          };
        }
      });

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = ativosComCotacoes.filter((a: any) => a.statusApi === 'success').length;
      const suspeitos = ativosComCotacoes.filter((a: any) => a.statusApi === 'suspicious_price').length;
      const naoEncontrados = ativosComCotacoes.filter((a: any) => a.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS:');
      console.log(`✅ Sucessos: ${sucessos}/${ativosComCotacoes.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${ativosComCotacoes.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${ativosComCotacoes.length}`);

      setAtivosAtualizados(ativosComCotacoes);

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < ativosComCotacoes.length / 2) {
        setError(`Apenas ${sucessos} de ${ativosComCotacoes.length} ações com cotação válida`);
      } else if (suspeitos > 0) {
        setError(`${suspeitos} ações com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral ao buscar cotações:', err);
      
      // 🔄 FALLBACK: USAR DADOS DO DATASTORE SEM COTAÇÕES
      console.log('🔄 Usando fallback com dados do DataStore...');
      const exteriorStocksData = dados.exteriorStocks || [];
      const ativosFallback = exteriorStocksData.map((ativo: any, index: number) => ({
        ...ativo,
        id: String(ativo.id || index + 1),
        precoAtual: ativo.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: calcularViesAutomatico(ativo.precoTeto, `US$ ${ativo.precoEntrada.toFixed(2)}`),
        dy: calcularDY12Meses(ativo.ticker, ativo.precoEntrada),
        statusApi: 'error',
        nomeCompleto: 'Erro',
        rank: (index + 1) + '°'
      }));
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, [dados.exteriorStocks]); // 🔥 DEPENDÊNCIA DOS DADOS DO DATASTORE

  // 🔄 EXECUTAR QUANDO OS DADOS DO DATASTORE MUDAREM
  React.useEffect(() => {
    console.log('🔄 EFFECT DISPARADO - DADOS DO DATASTORE MUDARAM');
    console.log('📊 ExteriorStocks data length:', dados.exteriorStocks?.length || 0);
    
    buscarCotacoesIntegradas();
  }, [buscarCotacoesIntegradas]);

  // 🔄 FUNÇÃO PARA FORÇAR ATUALIZAÇÃO
  const refetch = React.useCallback(() => {
    console.log('🔄 FORÇANDO ATUALIZAÇÃO MANUAL...');
    buscarCotacoesIntegradas();
  }, [buscarCotacoesIntegradas]);

  return {
    ativosAtualizados,
    loading,
    error,
    refetch,
  };
}

export default function ExteriorStocksPage() {
  const { dados } = useDataStore();
  const { ativosAtualizados, loading, refetch } = useExteriorStocksIntegradas();
  const { indicesData } = useIndicesInternacionaisRealTime();

  // Valor por ativo para simulação
  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS DA CARTEIRA
  const calcularMetricas = () => {
    if (!ativosAtualizados || ativosAtualizados.length === 0) {
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

    const valorInicialTotal = ativosAtualizados.length * valorPorAtivo;
    let valorFinalTotal = 0;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;

    ativosAtualizados.forEach((ativo) => {
      const valorFinal = valorPorAtivo * (1 + ativo.performance / 100);
      valorFinalTotal += valorFinal;

      if (ativo.performance > melhorPerformance) {
        melhorPerformance = ativo.performance;
        melhorAtivo = { ...ativo, performance: ativo.performance };
      }

      if (ativo.performance < piorPerformance) {
        piorPerformance = ativo.performance;
        piorAtivo = { ...ativo, performance: ativo.performance };
      }
    });

    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

    // Calcular DY médio
    const dyValues = ativosAtualizados
      .map(ativo => parseFloat(ativo.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    const dyMedio = dyValues.length > 0 ? 
      dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: ativosAtualizados.length,
      melhorAtivo,
      piorAtivo,
      dyMedio
    };
  };

  const metricas = calcularMetricas();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(2) + '%';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Exterior Stocks
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Ações internacionais de tecnologia, crescimento e valor • Dados atualizados a cada 15 minutos.
        </p>
      </div>

      {/* Cards de Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {/* Performance Total */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Rentabilidade total
          </div>
          <div style={{ 
            fontSize: '24px', 
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
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            DY médio 12M
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {metricas.dyMedio.toFixed(1)}%
          </div>
        </div>

        {/* S&P 500 */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            S&P 500
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {indicesData?.sp500?.valorFormatado || '5,970.80'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: indicesData?.sp500?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {indicesData?.sp500 ? formatPercentage(indicesData.sp500.variacaoPercent) : '+0.59%'}
          </div>
        </div>

        {/* NASDAQ */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            NASDAQ 100
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1',
            marginBottom: '4px'
          }}>
            {indicesData?.nasdaq?.valorFormatado || '19,400.00'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: indicesData?.nasdaq?.trend === 'up' ? '#10b981' : '#ef4444',
            lineHeight: '1'
          }}>
            {indicesData?.nasdaq ? formatPercentage(indicesData.nasdaq.variacaoPercent) : '+0.81%'}
          </div>
        </div>

        {/* Quantidade de Ativos */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Total de ativos
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {metricas.quantidadeAtivos}
          </div>
        </div>
      </div>

      {/* Tabela de Ativos */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
           Exterior Stocks • Performance Individual
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            {ativosAtualizados.length} ativos
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px', width: '60px' }}>
                  RANK
                </th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px', width: '200px' }}>
                  ATIVO
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  SETOR
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
                  PERFORMANCE
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  VIÉS
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  DY 12M
                </th>
              </tr>
            </thead>
            <tbody>
              {ativosAtualizados.map((ativo, index) => {
                const temCotacaoReal = ativo.statusApi === 'success';
                
                return (
                  <tr 
                    key={ativo.id || index} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // Navegar para página de detalhes do ativo
                      window.location.href = `/dashboard/ativo/${ativo.ticker}`;
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      fontWeight: '800', 
                      fontSize: '16px',
                      color: '#000000'
                    }}>
                      {ativo.rank || (index + 1) + '°'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #e2e8f0'
                        }}>
                          <img 
                            src={`https://financialmodelingprep.com/image-stock/${ativo.ticker}.png`}
                            alt={`Logo ${ativo.ticker}`}
                            style={{
                              width: '32px',
                              height: '32px',
                              objectFit: 'contain'
                            }}
                            onError={(e) => {
                              // Fallback para ícone com iniciais se a imagem não carregar
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.backgroundColor = ativo.performance >= 0 ? '#dcfce7' : '#fee2e2';
                                parent.style.color = ativo.performance >= 0 ? '#065f46' : '#991b1b';
                                parent.style.fontWeight = '700';
                                parent.style.fontSize = '14px';
                                parent.textContent = ativo.ticker.slice(0, 2);
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: '700', 
                            color: '#1e293b', 
                            fontSize: '16px'
                          }}>
                            {ativo.ticker}
                            {!temCotacaoReal && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '12px', 
                                color: '#f59e0b',
                                backgroundColor: '#fef3c7',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                SIM
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '14px' }}>
                            {ativo.nomeCompleto || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      {ativo.setor}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      {ativo.dataEntrada}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                      {formatCurrency(ativo.precoEntrada)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: ativo.performance >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(ativo.precoAtual)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1e293b' }}>
                      {ativo.precoTeto ? formatCurrency(ativo.precoTeto) : '-'}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      fontWeight: '800',
                      fontSize: '16px',
                      color: ativo.performance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercentage(ativo.performance)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                        color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                      }}>
                        {ativo.vies}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {ativo.dy}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Composição por Setor */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
           Composição por Setor
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Distribuição setorial da carteira • {ativosAtualizados.length} ativos
          </p>
        </div>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'row', gap: '32px', alignItems: 'center' }}>
          {/* Gráfico SVG */}
          <div style={{ flex: '0 0 400px', height: '400px', position: 'relative' }}>
            {(() => {
              // Agrupar por setor
              const setoresMap = new Map();
              ativosAtualizados.forEach(ativo => {
                const setor = ativo.setor || 'Outros';
                setoresMap.set(setor, (setoresMap.get(setor) || 0) + 1);
              });
              
              const setores = Array.from(setoresMap.entries()).map(([setor, quantidade]) => ({
                setor,
                quantidade,
                porcentagem: (quantidade / ativosAtualizados.length) * 100
              }));
              
              const cores = [
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#9ca3af'
              ];
              
              const radius = 150;
              const innerRadius = 75;
              const centerX = 200;
              const centerY = 200;
              const totalAngle = 2 * Math.PI;
              let currentAngle = -Math.PI / 2; // Começar no topo
              
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
                <svg width="400" height="400" viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
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
                  
                  {setores.map((setor, index) => {
                    const sliceAngle = (setor.porcentagem / 100) * totalAngle;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + sliceAngle;
                    const cor = cores[index % cores.length];
                    const path = createPath(startAngle, endAngle);
                    
                    // Calcular posição do texto no meio da fatia
                    const middleAngle = (startAngle + endAngle) / 2;
                    const textRadius = (radius + innerRadius) / 2; // Meio da fatia
                    const textX = centerX + textRadius * Math.cos(middleAngle);
                    const textY = centerY + textRadius * Math.sin(middleAngle);
                    
                    currentAngle += sliceAngle;
                    
                    return (
                      <g key={setor.setor} className="slice-group">
                        <path
                          d={path}
                          fill={cor}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="slice-path"
                        >
                          <title>{setor.setor}: {setor.porcentagem.toFixed(1)}% ({setor.quantidade} ativos)</title>
                        </path>
                        
                        {/* Textos que aparecem no hover */}
                        <g className="slice-text">
                          {/* Texto do setor */}
                          <text
                            x={textX}
                            y={textY - 6}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {setor.setor.length > 12 ? setor.setor.substring(0, 10) + '...' : setor.setor}
                          </text>
                          
                          {/* Texto da porcentagem */}
                          <text
                            x={textX}
                            y={textY + 8}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill="#ffffff"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                            }}
                          >
                            {setor.porcentagem.toFixed(1)}%
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
                    fontSize="16"
                    fontWeight="700"
                    fill="#1e293b"
                  >
                    {setores.length}
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#64748b"
                  >
                    SETORES
                  </text>
                </svg>
              );
            })()}
          </div>
          
          {/* Legenda */}
          <div style={{ flex: '1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {(() => {
              // Agrupar por setor para a legenda
              const setoresMap = new Map();
              ativosAtualizados.forEach(ativo => {
                const setor = ativo.setor || 'Outros';
                setoresMap.set(setor, (setoresMap.get(setor) || 0) + 1);
              });
              
              const setores = Array.from(setoresMap.entries()).map(([setor, quantidade]) => ({
                setor,
                quantidade,
                porcentagem: (quantidade / ativosAtualizados.length) * 100
              }));
              
              const cores = [
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', 
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
                '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
                '#ec4899', '#f43f5e', '#64748b', '#6b7280', '#9ca3af'
              ];
              
              return setores.map((setor, index) => {
                const cor = cores[index % cores.length];
                
                return (
                  <div key={setor.setor} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      backgroundColor: cor,
                      flexShrink: 0
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {setor.setor}
                      </div>
                      <div style={{ 
                        color: '#64748b', 
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {setor.porcentagem.toFixed(1)}% • {setor.quantidade} ativo{setor.quantidade > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}