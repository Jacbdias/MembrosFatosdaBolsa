'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDataStore } from '../../../hooks/useDataStore';

// 🔥 DETECÇÃO DE DISPOSITIVO IGUAL AO CÓDIGO 3
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

export default function RentabilidadesPage() {
  const { dados, CARTEIRAS_CONFIG, buscarCotacoes, loading } = useDataStore();
  const [carteiraAtiva, setCarteiraAtiva] = useState('smallCaps');
  const [cotacoesAtualizadas, setCotacoesAtualizadas] = useState({});
  const isMobile = useDeviceDetection(); // ✅ ADICIONAR HOOK DE MOBILE
  
  // ✅ ESTADOS SEPARADOS PARA MELHOR CONTROLE
  const [loadingProventos, setLoadingProventos] = useState(false);
  const [proventosCache, setProventosCache] = useState(new Map());
  const abortControllerRef = useRef(null);

  // 🔄 BUSCAR COTAÇÕES AO CARREGAR E QUANDO MUDAR CARTEIRA
  useEffect(() => {
    const buscarCotacoesIniciais = async () => {
      console.log('🔄 Iniciando busca de cotações...');
      
      // Buscar apenas ativos da carteira ativa para otimizar
      const ativosCarteira = dados[carteiraAtiva] || [];
      const tickers = ativosCarteira.map(ativo => ativo.ticker);
      
      console.log('📊 Tickers a buscar:', tickers);
      
      if (tickers.length > 0) {
        try {
          console.log('🌐 Chamando API BRAPI individualmente...');
          const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
          
          const novasCotacoes = {};
          
          // 🚀 BUSCAR EM PARALELO COM PROMISE.ALL (MAIS RÁPIDO)
          const promises = tickers.map(async (ticker, index) => {
            try {
              // 🔄 DELAY ESCALONADO PARA EVITAR RATE LIMIT
              await new Promise(resolve => setTimeout(resolve, index * 50));
              
              console.log('🔍 Buscando:', ticker);
              
              const apiUrl = 'https://brapi.dev/api/quote/' + ticker + '?token=' + BRAPI_TOKEN;
              const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'Rentabilidades-App'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                  const quote = data.results[0];
                  if (quote.regularMarketPrice) {
                    console.log('✅ ' + ticker + ': R$ ' + quote.regularMarketPrice.toFixed(2));
                    return { ticker, price: quote.regularMarketPrice };
                  }
                } else {
                  console.log('⚠️ Sem dados para:', ticker);
                }
              } else {
                console.log('❌ Erro HTTP para ' + ticker + ':', response.status);
              }
              
            } catch (error) {
              console.error('❌ Erro individual para ' + ticker + ':', error);
            }
            return null;
          });
          
          // 🎯 AGUARDAR TODAS AS REQUISIÇÕES
          const results = await Promise.all(promises);
          const successResults = results.filter(r => r !== null);
          
          // ✅ ATUALIZAR COTAÇÕES DE UMA SÓ VEZ PARA EVITAR MÚLTIPLOS RE-RENDERS
          const cotacoesMap = {};
          successResults.forEach(result => {
            cotacoesMap[result.ticker] = result.price;
          });
          
          setCotacoesAtualizadas(cotacoesMap);
          console.log('✅ Busca concluída: ' + successResults.length + '/' + tickers.length + ' cotações obtidas');
          
        } catch (error) {
          console.error('❌ Erro geral ao buscar cotações:', error);
          setCotacoesAtualizadas({});
        }
      }
    };

    buscarCotacoesIniciais();
  }, [dados, carteiraAtiva]);

// 💰 FUNÇÃO OTIMIZADA PARA CALCULAR PROVENTOS COM CACHE - CORRIGIDA
const calcularProventosAtivo = useCallback(async (ticker, dataEntrada) => {
  // ✅ VERIFICAR CACHE PRIMEIRO
  const cacheKey = `${ticker}-${dataEntrada}`;
  if (proventosCache.has(cacheKey)) {
    console.log(`💰 ${ticker}: Usando cache`);
    return proventosCache.get(cacheKey);
  }

  try {
    // Converter data de entrada para formato ISO
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    console.log(`💰 Buscando proventos para ${ticker} desde ${dataEntrada}`);
    
    // Buscar proventos via API (igual ao código 2)
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000); // Timeout maior
    
    const response = await fetch(`/api/proventos/${ticker}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const proventosRaw = await response.json();
      
      if (Array.isArray(proventosRaw)) {
        const dataEntradaDate = new Date(dataEntradaISO + 'T00:00:00');
        
        // Filtrar proventos pagos após a data de entrada
        const proventosFiltrados = proventosRaw.filter((p) => {
          if (!p.dataObj) return false;
          const dataProvento = new Date(p.dataObj);
          return dataProvento >= dataEntradaDate;
        });
        
        // Somar valores dos proventos
        const total = proventosFiltrados.reduce((sum, p) => sum + (p.valor || 0), 0);
        
        // ✅ SALVAR NO CACHE
        setProventosCache(prev => new Map(prev).set(cacheKey, total));
        
        console.log(`💰 ${ticker}: R$ ${total.toFixed(2)} (${proventosFiltrados.length} proventos)`);
        return total;
      }
    } else {
      console.log(`💰 ${ticker}: Erro HTTP ${response.status}`);
    }
    
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.log(`💰 ${ticker}: Erro -`, error instanceof Error ? error.message : 'Erro desconhecido');
    }
  }
  
  // ✅ SALVAR 0 NO CACHE PARA EVITAR BUSCAR NOVAMENTE (REUTILIZAR A VARIÁVEL JÁ DECLARADA)
  setProventosCache(prev => new Map(prev).set(cacheKey, 0));
  return 0;
}, [proventosCache]);

  // 🧮 CALCULAR MÉTRICAS DA CARTEIRA COM MÉTODO "TOTAL RETURN"
  const calcularMetricas = useCallback(async (dadosCarteira) => {
    if (!dadosCarteira || dadosCarteira.length === 0) {
      return {
        valorInicial: 0,
        valorAtual: 0,
        rentabilidadeTotal: 0,
        rentabilidadeComProventos: 0,
        totalProventos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        quantidadeAtivos: 0,
        tempoMedio: 0,
        rentabilidadeAnualizada: 0,
        rentabilidadeAnualizadaComProventos: 0,
        ativosComCalculos: [],
        valorFinalTotal: 0,
        valorAtualSemReinvestimento: 0,
        rentabilidadeSemProventos: 0
      };
    }

    // ✅ CANCELAR REQUISIÇÃO ANTERIOR SE EXISTIR
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoadingProventos(true);
    console.log('🧮 Calculando métricas...');

    try {
      // 💰 MÉTODO "TOTAL RETURN" - COMO NO MAIS RETORNO
      let valorInicialTotal = 0;
      let valorFinalTotal = 0;
      let totalProventos = 0;
      
      // 🚀 BUSCAR PROVENTOS EM PARALELO PARA TODOS OS ATIVOS
      console.log('💰 Iniciando busca de proventos para', dadosCarteira.length, 'ativos...');
      
      const proventosPromises = dadosCarteira.map(async (ativo) => {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Aborted');
        }
        const proventosAtivo = await calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
        return { ticker: ativo.ticker, proventos: proventosAtivo };
      });
      
      const proventosResults = await Promise.allSettled(proventosPromises);
      
      // ✅ VERIFICAR SE FOI CANCELADO
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🛑 Cálculo cancelado');
        return null;
      }
      
      const proventosMap = new Map();
      
      proventosResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          proventosMap.set(result.value.ticker, result.value.proventos);
        }
      });
      
      console.log('💰 Proventos obtidos:', Object.fromEntries(proventosMap));
      
      const ativosComCalculos = dadosCarteira.map(ativo => {
        // Investimento de R$ 1.000 por ativo (como no PDF)
        const valorPorAtivo = 1000;
        const valorInvestido = valorPorAtivo;
        
        // Quantas ações foram "compradas" com R$ 1.000
        const quantidadeAcoes = valorInvestido / ativo.precoEntrada;
        
        // 🔥 PARA POSIÇÕES ENCERRADAS, USAR PREÇO DE SAÍDA
        const precoAtual = ativo.posicaoEncerrada 
          ? ativo.precoSaida 
          : (cotacoesAtualizadas[ativo.ticker] || ativo.precoEntrada);
        
        // Proventos recebidos no período (do Map)
        const proventosAtivo = proventosMap.get(ativo.ticker) || 0;
        
        // 🎯 TOTAL RETURN = Valor atual das ações + Proventos (simulando reinvestimento)
        // No método Total Return, os proventos são "reinvestidos" automaticamente
        const valorAtualAcoes = quantidadeAcoes * precoAtual;
        
        // Simular reinvestimento dos proventos (método simplificado)
        // Os proventos aumentam a quantidade de ações ao longo do tempo
        const dividendYieldPeriodo = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) : 0;
        const fatorReinvestimento = 1 + dividendYieldPeriodo;
        
        // Valor final considerando reinvestimento dos proventos
        const valorFinalComReinvestimento = valorAtualAcoes * fatorReinvestimento;
        
        // Performance individual
        const performanceTotal = ((valorFinalComReinvestimento - valorInvestido) / valorInvestido) * 100;
        const performanceAcao = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
        
        // Acumular totais
        valorInicialTotal += valorInvestido;
        valorFinalTotal += valorFinalComReinvestimento;
        totalProventos += proventosAtivo;
        
        return {
          ...ativo,
          quantidadeAcoes,
          precoAtual,
          valorInvestido,
          valorFinalComReinvestimento,
          proventosAtivo,
          performanceAcao,
          performanceTotal,
          dividendYieldPeriodo
        };
      });

      // 📊 RENTABILIDADES FINAIS (MÉTODO TOTAL RETURN)
      const rentabilidadeTotal = valorInicialTotal > 0 ? 
        ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;
        
      // Para compatibilidade, calcular também sem reinvestimento
      const valorAtualSemReinvestimento = ativosComCalculos.reduce((sum, ativo) => 
        sum + (ativo.quantidadeAcoes * ativo.precoAtual), 0);
      
      const rentabilidadeSemProventos = valorInicialTotal > 0 ? 
        ((valorAtualSemReinvestimento - valorInicialTotal) / valorInicialTotal) * 100 : 0;
      
      // Encontrar melhor e pior ativo (baseado na performance total com reinvestimento)
      let melhorAtivo = null;
      let piorAtivo = null;
      let melhorPerformance = -Infinity;
      let piorPerformance = Infinity;

      ativosComCalculos.forEach((ativo) => {
        if (ativo.performanceTotal > melhorPerformance) {
          melhorPerformance = ativo.performanceTotal;
          melhorAtivo = { ...ativo, performance: ativo.performanceTotal };
        }
        
        if (ativo.performanceTotal < piorPerformance) {
          piorPerformance = ativo.performanceTotal;
          piorAtivo = { ...ativo, performance: ativo.performanceTotal };
        }
      });

      // Calcular tempo médio de investimento
      const hoje = new Date();
      const tempoMedio = dadosCarteira.reduce((sum, ativo) => {
        const [dia, mes, ano] = ativo.dataEntrada.split('/');
        const dataEntrada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        const tempoAnos = (hoje.getTime() - dataEntrada.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return sum + tempoAnos;
      }, 0) / dadosCarteira.length;

      const resultado = {
        valorInicial: valorInicialTotal,
        valorAtual: valorFinalTotal,
        rentabilidadeTotal: rentabilidadeTotal,
        rentabilidadeComProventos: rentabilidadeTotal,
        rentabilidadeSemProventos: rentabilidadeSemProventos,
        totalProventos,
        melhorAtivo,
        piorAtivo,
        quantidadeAtivos: dadosCarteira.length,
        tempoMedio: tempoMedio,
        rentabilidadeAnualizada: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
        rentabilidadeAnualizadaComProventos: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
        ativosComCalculos,
        valorFinalTotal,
        valorAtualSemReinvestimento
      };

      console.log('✅ Métricas calculadas com sucesso:', resultado);
      return resultado;

    } catch (error) {
      if (error.message !== 'Aborted') {
        console.error('❌ Erro ao calcular métricas:', error);
      }
      return null;
    } finally {
      setLoadingProventos(false);
    }
  }, [calcularProventosAtivo, cotacoesAtualizadas]);

  // 🎯 OBTER DADOS DA CARTEIRA ATIVA (INCLUINDO POSIÇÕES ENCERRADAS)
  const dadosAtivos = dados[carteiraAtiva] || [];
  const carteiraConfig = CARTEIRAS_CONFIG[carteiraAtiva];
  const nomeCarteira = carteiraConfig?.nome || 'Carteira';

  // 📊 Simular valor investido (R$ 1.000 por ativo para demonstração) - DEFINIR ANTES DO CÁLCULO
  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS INCLUINDO POSIÇÕES ENCERRADAS
  const [metricas, setMetricas] = useState({
    valorInicial: 0,
    valorAtual: 0,
    rentabilidadeTotal: 0,
    rentabilidadeSemProventos: 0,
    quantidadeAtivos: 0,
    melhorAtivo: null,
    piorAtivo: null,
    ativosComCalculos: [],
    valorFinalTotal: 0,
    rentabilidadeAnualizada: 0
  });

  // ✅ USEEFFECT OTIMIZADO COM DEBOUNCE E CONTROLE DE DEPENDÊNCIAS
  useEffect(() => {
    // ✅ SÓ CALCULAR SE TEMOS DADOS E NÃO ESTAMOS CARREGANDO PROVENTOS
    if (!dadosAtivos || dadosAtivos.length === 0 || loadingProventos) {
      return;
    }

    console.log('🧮 Iniciando cálculo de métricas...');

    // ✅ DEBOUNCE PARA EVITAR CÁLCULOS EXCESSIVOS
    const timeoutId = setTimeout(async () => {
      const novasMetricas = await calcularMetricas(dadosAtivos);
      if (novasMetricas) {
        setMetricas(novasMetricas);
        console.log('✅ Métricas atualizadas');
      }
    }, 500); // 500ms de debounce

    return () => {
      clearTimeout(timeoutId);
      // ✅ CANCELAR CÁLCULO SE COMPONENTE DESMONTAR OU DEPENDÊNCIAS MUDAREM
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dadosAtivos, calcularMetricas, loadingProventos]);

  // ✅ CLEANUP NO UNMOUNT
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 📊 Separar ativos ativos e encerrados COM DADOS CALCULADOS
  const ativosAtivos = (metricas.ativosComCalculos || dadosAtivos).filter(ativo => !ativo.posicaoEncerrada);
  const ativosEncerrados = (metricas.ativosComCalculos || dadosAtivos).filter(ativo => ativo.posicaoEncerrada);

  // 📊 Simular valor investido - MOVER PARA DEPOIS DOS CÁLCULOS
  const valorTotalInvestido = metricas.quantidadeAtivos * valorPorAtivo;
  const valorTotalAtual = valorTotalInvestido * (1 + metricas.rentabilidadeTotal / 100);
  const ganhoPerda = valorTotalAtual - valorTotalInvestido;

  // ✅ FUNÇÕES DE FORMATAÇÃO
  const formatCurrency = (value, moeda = 'BRL') => {
    const currency = moeda === 'USD' ? 'USD' : 'BRL';
    const locale = moeda === 'USD' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(1) + '%';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '16px' : '24px' // ✅ RESPONSIVO
    }}>
      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', // ✅ IGUAL AO CÓDIGO 3
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Performance das Carteiras
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '16px' : '18px', // ✅ RESPONSIVO
          margin: '0',
          lineHeight: '1.5'
        }}>
          Resultados reais das nossas recomendações de investimento • Dados sincronizados em tempo real
        </p>
      </div>

      {/* Alerta de Transparência - Responsivo */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px', // ✅ RESPONSIVO
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: isMobile ? '20px' : '24px' }}>📊</span> {/* ✅ RESPONSIVO */}
          <h3 style={{ 
            color: '#1e40af', 
            fontSize: isMobile ? '16px' : '18px', // ✅ RESPONSIVO 
            fontWeight: '700', 
            margin: '0' 
          }}>
            Transparência Total • Dados Sincronizados
          </h3>
        </div>
        <p style={{ 
          color: '#1e40af', 
          fontSize: isMobile ? '13px' : '14px', // ✅ RESPONSIVO
          margin: '0', 
          lineHeight: '1.5' 
        }}>
          Todas as rentabilidades são baseadas nos preços reais de entrada das nossas recomendações. 
          Os valores simulam um investimento de {formatCurrency(valorPorAtivo, carteiraConfig?.moeda)} por ativo para facilitar a compreensão.
          {loading && <span style={{ marginLeft: '12px', color: '#f59e0b' }}>🔄 Atualizando cotações...</span>}
          {loadingProventos && <span style={{ marginLeft: '12px', color: '#3b82f6' }}>💰 Carregando proventos...</span>}
          {Object.keys(cotacoesAtualizadas).length > 0 && !loading && (
            <span style={{ marginLeft: '12px', color: '#10b981' }}>
              ✅ {Object.keys(cotacoesAtualizadas).length} cotações atualizadas
            </span>
          )}
          {proventosCache.size > 0 && !loadingProventos && (
            <span style={{ marginLeft: '12px', color: '#059669' }}>
              💰 {proventosCache.size} proventos carregados
            </span>
          )}
        </p>
      </div>

      {/* Seletores de Carteira - Responsivos */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '8px' : '12px', // ✅ RESPONSIVO
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(CARTEIRAS_CONFIG).map(([chave, config]) => {
          const qtdAtivos = dados[chave]?.length || 0;
          return (
            <button
              key={chave}
              onClick={() => setCarteiraAtiva(chave)}
              style={{
                padding: isMobile ? '10px 16px' : '12px 20px', // ✅ RESPONSIVO
                borderRadius: '12px',
                border: carteiraAtiva === chave ? '2px solid' : '1px solid #e2e8f0',
                borderColor: carteiraAtiva === chave ? config.color : '#e2e8f0',
                backgroundColor: carteiraAtiva === chave ? config.color : '#ffffff',
                color: carteiraAtiva === chave ? '#ffffff' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: isMobile ? '13px' : '14px' // ✅ RESPONSIVO
              }}
            >
              <span style={{ fontSize: isMobile ? '16px' : '18px' }}>{config.icon}</span> {/* ✅ RESPONSIVO */}
              {config.nome}
              <span style={{
                backgroundColor: carteiraAtiva === chave ? 'rgba(255,255,255,0.2)' : config.color,
                color: carteiraAtiva === chave ? 'white' : 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: isMobile ? '11px' : '12px', // ✅ RESPONSIVO
                fontWeight: '700'
              }}>
                {qtdAtivos}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botão para Atualizar Cotações - Responsivo */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <button
          onClick={async () => {
            console.log('🔄 Atualizando cotações manualmente...');
            const ativosCarteira = dados[carteiraAtiva] || [];
            const tickers = ativosCarteira.map(ativo => ativo.ticker);
            
            if (tickers.length > 0) {
              try {
                const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
                const novasCotacoes = {};
                
                // 🔥 BUSCAR CADA TICKER INDIVIDUALMENTE
                for (const ticker of tickers) {
                  try {
                    console.log('🔍 Atualizando:', ticker);
                    
                    const apiUrl = 'https://brapi.dev/api/quote/' + ticker + '?token=' + BRAPI_TOKEN;
                    const response = await fetch(apiUrl, {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Rentabilidades-App'
                      }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      
                      if (data.results && data.results.length > 0) {
                        const quote = data.results[0];
                        if (quote.regularMarketPrice) {
                          novasCotacoes[ticker] = quote.regularMarketPrice;
                        }
                      }
                    }
                    
                    // 🔄 DELAY ENTRE REQUISIÇÕES
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                  } catch (error) {
                    console.error('❌ Erro para ' + ticker + ':', error);
                  }
                }
                
                setCotacoesAtualizadas(novasCotacoes);
                console.log('✅ Cotações atualizadas:', novasCotacoes);
              } catch (error) {
                console.error('❌ Erro geral:', error);
              }
            }
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: isMobile ? '10px 20px' : '12px 24px', // ✅ RESPONSIVO
            fontSize: isMobile ? '13px' : '14px', // ✅ RESPONSIVO
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
        >
          🔄 Atualizar Cotações da {nomeCarteira}
        </button>
      </div>
      
      {/* Cards de Métricas - Mais Elegantes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile 
          ? 'repeat(auto-fit, minmax(140px, 1fr))' 
          : 'repeat(auto-fit, minmax(180px, 1fr))', // ✅ REDUZIDO DE 280px PARA 180px
        gap: isMobile ? '8px' : '12px', // ✅ REDUZIDO DE 24px PARA 12px
        marginBottom: '32px'
      }}>
        {/* Rentabilidade Total Return */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '8px' : '8px', // ✅ BORDAS MENORES
          padding: isMobile ? '12px' : '16px', // ✅ PADDING REDUZIDO DE 32px PARA 16px
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '12px' }}>
            <span style={{ 
              color: '#64748b', 
              fontSize: isMobile ? '10px' : '12px', // ✅ TAMANHO REDUZIDO
              fontWeight: '600', 
              textTransform: 'uppercase' 
            }}>
              TOTAL RETURN (MÉTODO MAIS RETORNO)
            </span>
            <span style={{ fontSize: isMobile ? '24px' : '24px' }}> {/* ✅ TAMANHO REDUZIDO */}
              {metricas.rentabilidadeTotal >= 0 ? '💎' : '📉'}
            </span>
          </div>
          <div style={{ 
            fontSize: isMobile ? '24px' : '28px', // ✅ TAMANHO REDUZIDO DE 42px PARA 28px
            fontWeight: '900', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            marginBottom: isMobile ? '8px' : '8px',
            lineHeight: '1'
          }}>
            {formatPercentage(metricas.rentabilidadeTotal)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px', // ✅ TAMANHO REDUZIDO
            color: '#64748b', 
            marginBottom: isMobile ? '4px' : '6px' 
          }}>
            Anualizada: {formatPercentage(metricas.rentabilidadeAnualizada)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px', // ✅ TAMANHO REDUZIDO
            color: '#059669', 
            fontWeight: '600' 
          }}>
            Inclui reinvestimento de proventos
          </div>
        </div>

        {/* Rentabilidade Apenas Ações */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '8px' : '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (metricas.rentabilidadeSemProventos >= 0 ? '#3b82f6' : '#ef4444'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '12px' }}>
            <span style={{ 
              color: '#64748b', 
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: '600', 
              textTransform: 'uppercase' 
            }}>
              APENAS VALORIZAÇÃO DAS AÇÕES
            </span>
            <span style={{ fontSize: isMobile ? '24px' : '24px' }}>
              {metricas.rentabilidadeSemProventos >= 0 ? '📈' : '📉'}
            </span>
          </div>
          <div style={{ 
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '900', 
            color: metricas.rentabilidadeSemProventos >= 0 ? '#3b82f6' : '#ef4444',
            marginBottom: isMobile ? '8px' : '8px',
            lineHeight: '1'
          }}>
            {formatPercentage(metricas.rentabilidadeSemProventos || 0)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '14px',
            color: '#64748b', 
            marginBottom: isMobile ? '4px' : '6px' 
          }}>
            Sem considerar proventos
          </div>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#64748b' 
          }}>
            Apenas price appreciation
          </div>
        </div>

        {/* Valor Total Return */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '8px' : '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid #3b82f6',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '12px' }}>
            <span style={{ 
              color: '#64748b', 
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: '600', 
              textTransform: 'uppercase' 
            }}>
              VALOR TOTAL RETURN
            </span>
            <span style={{ fontSize: isMobile ? '24px' : '24px' }}>💰</span>
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '22px',
            fontWeight: '800', 
            color: '#1e293b', 
            marginBottom: isMobile ? '4px' : '6px',
            lineHeight: '1'
          }}>
            {formatCurrency(metricas.valorFinalTotal || valorTotalAtual, carteiraConfig?.moeda)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '13px',
            color: '#64748b', 
            marginBottom: isMobile ? '4px' : '6px' 
          }}>
            Investido: {formatCurrency(valorTotalInvestido, carteiraConfig?.moeda)}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '13px',
            fontWeight: '600',
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444'
          }}>
            {metricas.rentabilidadeTotal >= 0 ? 'Ganho Total' : 'Perda Total'}: {formatCurrency(Math.abs((metricas.valorFinalTotal || valorTotalAtual) - valorTotalInvestido), carteiraConfig?.moeda)}
          </div>
        </div>

        {/* Melhor Ativo */}
        {metricas.melhorAtivo && (
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: isMobile ? '8px' : '8px',
            padding: isMobile ? '12px' : '16px',
            border: '1px solid #10b981',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '12px' }}>
              <span style={{ 
                color: '#065f46', 
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '600', 
                textTransform: 'uppercase' 
              }}>
                DESTAQUE POSITIVO
              </span>
              <span style={{ fontSize: isMobile ? '24px' : '24px' }}>🏆</span>
            </div>
            <div style={{ 
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '800', 
              color: '#065f46', 
              marginBottom: isMobile ? '4px' : '6px',
              lineHeight: '1'
            }}>
              {metricas.melhorAtivo.ticker}
            </div>
            <div style={{ 
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '700', 
              color: '#10b981', 
              marginBottom: isMobile ? '4px' : '6px' 
            }}>
              {formatPercentage(metricas.melhorAtivo.performance)}
            </div>
            <div style={{ 
              fontSize: isMobile ? '11px' : '12px',
              color: '#065f46' 
            }}>
              {metricas.melhorAtivo.setor}
            </div>
          </div>
        )}

        {/* Diversificação */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '8px' : '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (carteiraConfig?.color || '#f59e0b'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '12px' : '12px' }}>
            <span style={{ 
              color: '#64748b', 
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: '600', 
              textTransform: 'uppercase' 
            }}>
              DIVERSIFICAÇÃO
            </span>
            <span style={{ fontSize: isMobile ? '24px' : '24px' }}>{carteiraConfig?.icon || '🎯'}</span>
          </div>
          <div style={{ 
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '900', 
            color: carteiraConfig?.color || '#f59e0b', 
            marginBottom: isMobile ? '4px' : '6px',
            lineHeight: '1'
          }}>
            {metricas.quantidadeAtivos}
          </div>
          <div style={{ 
            fontSize: isMobile ? '12px' : '13px',
            color: '#64748b', 
            marginBottom: isMobile ? '4px' : '6px' 
          }}>
            Ativos na carteira {nomeCarteira}
          </div>
          <div style={{ 
            fontSize: isMobile ? '11px' : '12px',
            color: '#92400e', 
            fontWeight: '600' 
          }}>
            Moeda: {carteiraConfig?.moeda || 'BRL'}
          </div>
        </div>
      </div>

      {/* Tabela de Ativos Ativos - RESPONSIVA IGUAL AO CÓDIGO 3 */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: isMobile ? '16px' : '24px', // ✅ RESPONSIVO
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px', // ✅ RESPONSIVO
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            📊 Performance Individual - Posições Ativas
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px', // ✅ RESPONSIVO
            margin: '0'
          }}>
            Baseado nos preços reais de entrada das nossas recomendações • Total: {ativosAtivos.length} ativos ativos
          </p>
        </div>

        {isMobile ? (
          // 📱 MOBILE: Cards verticais - IGUAL AO CÓDIGO 3
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ativosAtivos.map((ativo, index) => {
              const precoAtual = cotacoesAtualizadas[ativo.ticker] || ativo.precoEntrada;
              const performance = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
              
              // ✅ USAR OS DADOS JÁ CALCULADOS AO INVÉS DE CHAMAR A FUNÇÃO ASYNC
              const proventosAtivo = ativo.proventosAtivo || 0; // Dados já calculados nas métricas
              const performanceComProventos = ativo.performanceTotal || (performance + ((proventosAtivo / ativo.precoEntrada) * 100));
              const valorAtualSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
              const temCotacaoReal = !!cotacoesAtualizadas[ativo.ticker];
              
              return (
                <div 
                  key={ativo.id || index}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => {
                    window.location.href = `/dashboard/ativo/${ativo.ticker}`;
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
                    {/* Logo do Ativo */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      backgroundColor: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e2e8f0'
                    }}>
                      <img 
                        src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                        alt={`Logo ${ativo.ticker}`}
                        style={{
                          width: '28px',
                          height: '28px',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          const target = e.target;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = performanceComProventos >= 0 ? '#dcfce7' : '#fee2e2';
                            parent.style.color = performanceComProventos >= 0 ? '#065f46' : '#dc2626';
                            parent.style.fontWeight = '700';
                            parent.style.fontSize = '12px';
                            parent.textContent = ativo.ticker.slice(0, 2);
                          }
                        }}
                      />
                    </div>

                    {/* Nome e Setor */}
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1e293b', 
                        fontSize: '16px'
                      }}>
                        {ativo.ticker}
                        {!temCotacaoReal && (
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '10px', 
                            color: '#f59e0b',
                            backgroundColor: '#fef3c7',
                            padding: '2px 4px',
                            borderRadius: '3px'
                          }}>
                            SIM
                          </span>
                        )}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>
                        {ativo.setor}
                      </div>
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
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{ativo.dataEntrada}</span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Preço Inicial:</span><br />
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}</span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Preço Atual:</span><br />
                      <span style={{ fontWeight: '700', color: '#1e293b' }}>
                        {formatCurrency(precoAtual, carteiraConfig?.moeda)}
                      </span>
                    </div>
                    <div style={{ color: '#64748b' }}>
                      <span style={{ fontWeight: '500' }}>Proventos:</span><br />
                      <span style={{ fontWeight: '700', color: proventosAtivo > 0 ? '#059669' : '#64748b' }}>
                        {proventosAtivo > 0 ? formatCurrency(proventosAtivo, carteiraConfig?.moeda) : '-'}
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
                      Performance Total Return
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '800',
                      color: performanceComProventos >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercentage(performanceComProventos)}
                    </div>
                    {/* Breakdown detalhado */}
                    <div style={{ 
                      fontSize: '11px', 
                      color: '#64748b', 
                      fontWeight: '500',
                      marginTop: '4px',
                      lineHeight: '1.3'
                    }}>
                      <div style={{ marginBottom: '2px' }}>
                        Ação: <span style={{ 
                          color: performance >= 0 ? '#059669' : '#dc2626',
                          fontWeight: '600'
                        }}>
                          {formatPercentage(performance)}
                        </span>
                      </div>
                      <div>
                        Proventos: <span style={{ 
                          color: proventosAtivo > 0 ? '#059669' : '#64748b',
                          fontWeight: '600'
                        }}>
                          {proventosAtivo > 0 ? 
                            '+' + ((proventosAtivo / ativo.precoEntrada) * 100).toFixed(1) + '%' : 
                            '0,0%'
                          }
                        </span>
                      </div>
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
                    ATIVO
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
                    PROVENTOS
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PERFORMANCE
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    VALOR SIMULADO
                  </th>
                </tr>
              </thead>
              <tbody>
                {ativosAtivos.map((ativo, index) => {
                  const precoAtual = cotacoesAtualizadas[ativo.ticker] || ativo.precoEntrada;
                  const performance = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
                  
                  // ✅ USAR OS DADOS JÁ CALCULADOS AO INVÉS DE CHAMAR A FUNÇÃO ASYNC
                  const proventosAtivo = ativo.proventosAtivo || 0; // Dados já calculados nas métricas
                  const performanceComProventos = ativo.performanceTotal || (performance + ((proventosAtivo / ativo.precoEntrada) * 100));
                  const valorAtualSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
                  const temCotacaoReal = !!cotacoesAtualizadas[ativo.ticker];
                  
                  return (
                    <tr key={ativo.id || index} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s'
                    }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: performanceComProventos >= 0 ? '#dcfce7' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            color: performanceComProventos >= 0 ? '#065f46' : '#991b1b'
                          }}>
                            {ativo.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
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
                              {ativo.setor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                        {ativo.dataEntrada}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                        {formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: performance >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatCurrency(precoAtual, carteiraConfig?.moeda)}
                        {temCotacaoReal && (
                          <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '500' }}>
                            ✅ API
                          </div>
                        )}
                        {!temCotacaoReal && (
                          <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                            📊 Simulado
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                          fontWeight: '700',
                          color: proventosAtivo > 0 ? '#059669' : '#64748b',
                          fontSize: '14px'
                        }}>
                          {proventosAtivo > 0 ? formatCurrency(proventosAtivo, carteiraConfig?.moeda) : '-'}
                        </div>
                        {proventosAtivo > 0 && (
                          <div style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>
                            📈 API
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '800',
                        fontSize: '16px'
                      }}>
                        {/* PERFORMANCE TOTAL */}
                        <div style={{ color: performanceComProventos >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatPercentage(performanceComProventos)}
                        </div>
                        
                        {/* BREAKDOWN DETALHADO */}
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#64748b', 
                          fontWeight: '500',
                          marginTop: '4px',
                          lineHeight: '1.3'
                        }}>
                          {/* Linha da ação */}
                          <div style={{ marginBottom: '2px' }}>
                            Ação: <span style={{ 
                              color: performance >= 0 ? '#059669' : '#dc2626',
                              fontWeight: '600'
                            }}>
                              {formatPercentage(performance)}
                            </span>
                          </div>
                          
                          {/* ✅ NOVA LINHA DOS PROVENTOS */}
                          <div>
                            Proventos: <span style={{ 
                              color: proventosAtivo > 0 ? '#059669' : '#64748b',
                              fontWeight: '600'
                            }}>
                              {proventosAtivo > 0 ? 
                                '+' + ((proventosAtivo / ativo.precoEntrada) * 100).toFixed(1) + '%' : 
                                '0,0%'
                              }
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '700',
                        color: '#1e293b',
                        backgroundColor: performanceComProventos >= 0 ? '#f0fdf4' : '#fef2f2'
                      }}>
                        {formatCurrency(valorAtualSimulado, carteiraConfig?.moeda)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔥 TABELA DE POSIÇÕES ENCERRADAS (VENDIDAS) - RESPONSIVA */}
      {ativosEncerrados.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: isMobile ? '16px' : '24px', // ✅ RESPONSIVO
            borderBottom: '1px solid #fecaca',
            backgroundColor: '#fef2f2'
          }}>
            <h3 style={{
              fontSize: isMobile ? '20px' : '24px', // ✅ RESPONSIVO
              fontWeight: '700',
              color: '#991b1b',
              margin: '0 0 8px 0'
            }}>
              🔒 Performance Individual - Posições Vendidas
            </h3>
            <p style={{
              color: '#b91c1c',
              fontSize: isMobile ? '14px' : '16px', // ✅ RESPONSIVO
              margin: '0'
            }}>
              Histórico completo de posições encerradas com performance final • Total: {ativosEncerrados.length} ativos vendidos
            </p>
          </div>

          {isMobile ? (
            // 📱 MOBILE: Cards para encerradas - IGUAL AO CÓDIGO 3
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {ativosEncerrados.map((ativo, index) => {
                const performanceAcao = ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
                // ✅ USAR OS DADOS JÁ CALCULADOS
                const proventosAtivo = ativo.proventosAtivo || 0;
                const performanceComProventos = ativo.performanceTotal || (performanceAcao + ((proventosAtivo / ativo.precoEntrada) * 100));
                const valorFinalSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
                
                return (
                  <div 
                    key={ativo.id || ('encerrado-' + index)}
                    style={{
                      backgroundColor: '#fef2f2',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #fecaca'
                    }}
                  >
                    {/* Header do Card Encerrado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#fef2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #fecaca'
                      }}>
                        <img 
                          src={`https://www.ivalor.com.br/media/emp/logos/${ativo.ticker.replace(/\d+$/, '')}.png`}
                          alt={`Logo ${ativo.ticker}`}
                          style={{
                            width: '28px',
                            height: '28px',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            const target = e.target;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.backgroundColor = '#dc2626';
                              parent.style.color = 'white';
                              parent.style.fontWeight = '700';
                              parent.style.fontSize = '12px';
                              parent.textContent = ativo.ticker.slice(0, 2);
                            }
                          }}
                        />
                      </div>
                      <div style={{ flex: '1' }}>
                        <div style={{ 
                          fontWeight: '700', 
                          color: '#991b1b', 
                          fontSize: '16px'
                        }}>
                          {ativo.ticker}
                          <span style={{ 
                            marginLeft: '8px', 
                            fontSize: '10px', 
                            color: '#dc2626',
                            backgroundColor: '#fecaca',
                            padding: '2px 4px',
                            borderRadius: '3px'
                          }}>
                            VENDIDA
                          </span>
                        </div>
                        <div style={{ color: '#b91c1c', fontSize: '12px' }}>
                          {ativo.setor}
                        </div>
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
                      <div style={{ color: '#991b1b' }}>
                        <span style={{ fontWeight: '500' }}>Entrada:</span><br />
                        <span style={{ fontWeight: '600', color: '#991b1b' }}>{ativo.dataEntrada}</span>
                      </div>
                      <div style={{ color: '#991b1b' }}>
                        <span style={{ fontWeight: '500' }}>Saída:</span><br />
                        <span style={{ fontWeight: '600', color: '#991b1b' }}>{ativo.dataSaida}</span>
                      </div>
                      <div style={{ color: '#991b1b' }}>
                        <span style={{ fontWeight: '500' }}>Preço Entrada:</span><br />
                        <span style={{ fontWeight: '700', color: '#991b1b' }}>
                          {formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}
                        </span>
                      </div>
                      <div style={{ color: '#991b1b' }}>
                        <span style={{ fontWeight: '500' }}>Preço Saída:</span><br />
                        <span style={{ fontWeight: '700', color: '#991b1b' }}>
                          {formatCurrency(ativo.precoSaida, carteiraConfig?.moeda)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Performance final */}
                    <div style={{
                      textAlign: 'center',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '4px' }}>
                        Performance Final Total Return
                      </div>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '800',
                        color: performanceComProventos >= 0 ? '#059669' : '#dc2626'
                      }}>
                        {formatPercentage(performanceComProventos)}
                      </div>
                      {/* Breakdown detalhado */}
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#64748b', 
                        fontWeight: '500',
                        marginTop: '4px',
                        lineHeight: '1.3'
                      }}>
                        <div style={{ marginBottom: '2px' }}>
                          Ação: <span style={{ 
                            color: performanceAcao >= 0 ? '#059669' : '#dc2626',
                            fontWeight: '600'
                          }}>
                            {formatPercentage(performanceAcao)}
                          </span>
                        </div>
                        <div>
                          Proventos: <span style={{ 
                            color: proventosAtivo > 0 ? '#059669' : '#64748b',
                            fontWeight: '600'
                          }}>
                            {proventosAtivo > 0 ? 
                              '+' + ((proventosAtivo / ativo.precoEntrada) * 100).toFixed(1) + '%' : 
                              '0,0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Motivo */}
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#991b1b', 
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      Motivo: {ativo.motivoEncerramento}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // 🖥️ DESKTOP: Tabela para encerradas
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fee2e2' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      ATIVO
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      ENTRADA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      SAÍDA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      PREÇO ENTRADA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      PREÇO SAÍDA
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      PROVENTOS
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      PERFORMANCE FINAL
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      VALOR FINAL
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                      MOTIVO
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ativosEncerrados.map((ativo, index) => {
                    const performanceAcao = ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
                    // ✅ USAR OS DADOS JÁ CALCULADOS
                    const proventosAtivo = ativo.proventosAtivo || 0;
                    const performanceComProventos = ativo.performanceTotal || (performanceAcao + ((proventosAtivo / ativo.precoEntrada) * 100));
                    const valorFinalSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
                    
                    return (
                      <tr key={ativo.id || ('encerrado-' + index)} style={{ 
                        borderBottom: '1px solid #fecaca',
                        backgroundColor: '#fef2f2'
                      }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: performanceComProventos >= 0 ? '#dcfce7' : '#fee2e2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              color: performanceComProventos >= 0 ? '#065f46' : '#991b1b'
                            }}>
                              {ativo.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '16px' }}>
                                {ativo.ticker}
                                <span style={{ 
                                  marginLeft: '8px', 
                                  fontSize: '12px', 
                                  color: '#dc2626',
                                  backgroundColor: '#fecaca',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  VENDIDA
                                </span>
                              </div>
                              <div style={{ color: '#b91c1c', fontSize: '14px' }}>
                                {ativo.setor}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', color: '#991b1b' }}>
                          {ativo.dataEntrada}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', color: '#991b1b' }}>
                          {ativo.dataSaida}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#991b1b' }}>
                          {formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: performanceAcao >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatCurrency(ativo.precoSaida, carteiraConfig?.moeda)}
                          <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '500' }}>
                            🔒 FINAL
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ 
                            fontWeight: '700',
                            color: proventosAtivo > 0 ? '#059669' : '#64748b',
                            fontSize: '14px'
                          }}>
                            {proventosAtivo > 0 ? formatCurrency(proventosAtivo, carteiraConfig?.moeda) : '-'}
                          </div>
                          {proventosAtivo > 0 && (
                            <div style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>
                              📈 Período
                            </div>
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontWeight: '800',
                          fontSize: '16px'
                        }}>
                          {/* PERFORMANCE TOTAL FINAL */}
                          <div style={{ color: performanceComProventos >= 0 ? '#10b981' : '#ef4444' }}>
                            {formatPercentage(performanceComProventos)}
                          </div>
                          
                          {/* BREAKDOWN DETALHADO */}
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#64748b', 
                            fontWeight: '500',
                            marginTop: '4px',
                            lineHeight: '1.3'
                          }}>
                            {/* Performance da ação */}
                            <div style={{ marginBottom: '2px' }}>
                              Ação: <span style={{ 
                                color: performanceAcao >= 0 ? '#059669' : '#dc2626',
                                fontWeight: '600'
                              }}>
                                {formatPercentage(performanceAcao)}
                              </span>
                            </div>
                            
                            {/* ✅ NOVA LINHA DOS PROVENTOS */}
                            <div>
                              Proventos: <span style={{ 
                                color: proventosAtivo > 0 ? '#059669' : '#64748b',
                                fontWeight: '600'
                              }}>
                                {proventosAtivo > 0 ? 
                                  '+' + ((proventosAtivo / ativo.precoEntrada) * 100).toFixed(1) + '%' : 
                                  '0,0%'
                                }
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontWeight: '700',
                          color: '#1e293b',
                          backgroundColor: performanceComProventos >= 0 ? '#f0fdf4' : '#fef2f2'
                        }}>
                          {formatCurrency(valorFinalSimulado, carteiraConfig?.moeda)}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          fontSize: '12px', 
                          color: '#991b1b',
                          fontWeight: '600'
                        }}>
                          {ativo.motivoEncerramento}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Footer com Informações sobre Posições Vendidas - Responsivo */}
      {ativosEncerrados.length > 0 && (
        <div style={{
          marginTop: '32px',
          padding: isMobile ? '16px' : '20px', // ✅ RESPONSIVO
          backgroundColor: '#10b981',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: isMobile ? '16px' : '18px', // ✅ RESPONSIVO
            fontWeight: '700', 
            margin: '0 0 8px 0' 
          }}>
            🔒 Histórico Completo de Posições
          </h3>
          <p style={{ 
            fontSize: isMobile ? '13px' : '14px', // ✅ RESPONSIVO
            margin: '0', 
            opacity: 0.9 
          }}>
            Nossa página de rentabilidades agora inclui o histórico completo de {ativosEncerrados.length} posições vendidas, 
            mostrando performance final com preços reais de entrada e saída. Transparência total em cada decisão de investimento.
          </p>
        </div>
      )}

      {/* Animações CSS */}
      <style jsx>{`
        /* Spinner de Loading */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Animação de Pulse para Skeletons */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}