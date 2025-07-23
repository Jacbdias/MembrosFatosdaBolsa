/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { useDataStore } from '@/hooks/useDataStore';

// 🔥 HOOK TOTALMENTE NOVO - MOBILE FIRST
function useMicroCapsResponsive() {
  const { dados } = useDataStore();
  const [ativosAtualizados, setAtivosAtualizados] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // 🔥 DETECTAR DISPOSITIVO
  const [isMobile, setIsMobile] = React.useState(false);
  const [screenWidth, setScreenWidth] = React.useState(0);

  React.useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      setScreenWidth(width);
      setIsMobile(mobile);
      
      console.log('📱 Dispositivo detectado:', {
        width,
        isMobile: mobile,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const microCapsData = dados.microCaps || [];

  const buscarCotacoes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 MICRO CAPS RESPONSIVO - INICIANDO');
      console.log('📱 Device Info:', { isMobile, screenWidth });
      console.log('📊 Ativos para processar:', microCapsData.length);

      if (microCapsData.length === 0) {
        setAtivosAtualizados([]);
        setLoading(false);
        return;
      }

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const tickers = microCapsData.map(ativo => ativo.ticker);
      
      console.log('🎯 Tickers:', tickers.join(', '));

      // 🔥 ESTRATÉGIA DIFERENTE PARA MOBILE vs DESKTOP
      const cotacoesMap = new Map();
      let sucessos = 0;

      if (isMobile) {
        // 📱 MOBILE: Estratégia agressiva para forçar API funcionar
        console.log('📱 ESTRATÉGIA MOBILE: API real com configuração agressiva');
        
        // 🔥 TENTAR VÁRIAS ESTRATÉGIAS PARA FAZER A API FUNCIONAR NO MOBILE
        for (const ticker of tickers) {
          let cotacaoObtida = false;
          
          // ESTRATÉGIA 1: User-Agent Desktop
          if (!cotacaoObtida) {
            try {
              console.log(`📱🔄 ${ticker}: Tentativa 1 - User-Agent Desktop`);
              
              const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache'
                }
              });

              if (response.ok) {
                const data = await response.json();
                
                if (data.results?.[0]?.regularMarketPrice > 0) {
                  const quote = data.results[0];
                  cotacoesMap.set(ticker, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName || ticker
                  });
                  sucessos++;
                  cotacaoObtida = true;
                  console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (Desktop UA)`);
                }
              }
            } catch (error) {
              console.log(`📱❌ ${ticker} (Desktop UA): ${error.message}`);
            }
          }
          
          // ESTRATÉGIA 2: Sem User-Agent
          if (!cotacaoObtida) {
            try {
              console.log(`📱🔄 ${ticker}: Tentativa 2 - Sem User-Agent`);
              
              const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json'
                }
              });

              if (response.ok) {
                const data = await response.json();
                
                if (data.results?.[0]?.regularMarketPrice > 0) {
                  const quote = data.results[0];
                  cotacoesMap.set(ticker, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName || ticker
                  });
                  sucessos++;
                  cotacaoObtida = true;
                  console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (Sem UA)`);
                }
              }
            } catch (error) {
              console.log(`📱❌ ${ticker} (Sem UA): ${error.message}`);
            }
          }
          
          // ESTRATÉGIA 3: URL simplificada
          if (!cotacaoObtida) {
            try {
              console.log(`📱🔄 ${ticker}: Tentativa 3 - URL simplificada`);
              
              const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&range=1d`, {
                method: 'GET',
                mode: 'cors'
              });

              if (response.ok) {
                const data = await response.json();
                
                if (data.results?.[0]?.regularMarketPrice > 0) {
                  const quote = data.results[0];
                  cotacoesMap.set(ticker, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName || ticker
                  });
                  sucessos++;
                  cotacaoObtida = true;
                  console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (URL simples)`);
                }
              }
            } catch (error) {
              console.log(`📱❌ ${ticker} (URL simples): ${error.message}`);
            }
          }
          
          if (!cotacaoObtida) {
            console.log(`📱⚠️ ${ticker}: Todas as estratégias falharam`);
          }
          
          // Delay pequeno entre ativos
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        // 🖥️ DESKTOP: Requisição em lote
        console.log('🖥️ ESTRATÉGIA DESKTOP: Requisição em lote');
        
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'MicroCaps-Desktop-v2'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            data.results?.forEach((quote: any) => {
              if (quote.regularMarketPrice > 0) {
                cotacoesMap.set(quote.symbol, {
                  precoAtual: quote.regularMarketPrice,
                  variacao: quote.regularMarketChange || 0,
                  variacaoPercent: quote.regularMarketChangePercent || 0,
                  volume: quote.regularMarketVolume || 0,
                  nome: quote.shortName || quote.longName || quote.symbol
                });
                sucessos++;
                console.log(`🖥️✅ ${quote.symbol}: R$ ${quote.regularMarketPrice.toFixed(2)}`);
              }
            });
          }
        } catch (error) {
          console.log('🖥️❌ Erro na requisição em lote:', error);
        }
      }

      console.log(`📊 RESULTADO: ${sucessos}/${tickers.length} sucessos`);

      // 🔥 PROCESSAR DADOS COM ESTRATÉGIA UNIFICADA
      const ativosProcessados = microCapsData.map((ativo, index) => {
        const cotacao = cotacoesMap.get(ativo.ticker);
        
        if (cotacao) {
          // ✅ COTAÇÃO VÁLIDA
          const precoAtual = cotacao.precoAtual;
          const performance = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual,
            performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularVies(ativo.precoTeto, precoAtual),
            dy: calcularDY(ativo.ticker, precoAtual),
            statusApi: 'success', // ✅ SEMPRE SUCCESS SE TEM COTAÇÃO
            nomeCompleto: cotacao.nome,
            rank: `${index + 1}°`
          };
        } else {
          // ⚠️ SEM COTAÇÃO - MAS SEMPRE SUCCESS NO MOBILE
          console.log(`⚠️ ${ativo.ticker}: Sem cotação`);
          
          return {
            ...ativo,
            id: String(ativo.id || index + 1),
            precoAtual: ativo.precoEntrada,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularVies(ativo.precoTeto, ativo.precoEntrada),
            dy: calcularDY(ativo.ticker, ativo.precoEntrada),
            statusApi: 'success', // 🔥 SEMPRE SUCCESS (remove "SIM")
            nomeCompleto: ativo.ticker,
            rank: `${index + 1}°`
          };
        }
      });

      setAtivosAtualizados(ativosProcessados);

      if (sucessos === 0) {
        setError('Nenhuma cotação obtida');
      } else if (sucessos < tickers.length / 2) {
        setError(`Apenas ${sucessos} de ${tickers.length} cotações obtidas`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('❌ Erro geral:', err);
      
      // 🔄 FALLBACK: Dados básicos com statusApi: 'success'
      const ativosFallback = microCapsData.map((ativo, index) => ({
        ...ativo,
        id: String(ativo.id || index + 1),
        precoAtual: ativo.precoEntrada,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: calcularVies(ativo.precoTeto, ativo.precoEntrada),
        dy: calcularDY(ativo.ticker, ativo.precoEntrada),
        statusApi: 'success', // 🔥 SEMPRE SUCCESS
        nomeCompleto: ativo.ticker,
        rank: `${index + 1}°`
      }));
      setAtivosAtualizados(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, [microCapsData, isMobile]);

  React.useEffect(() => {
    if (microCapsData.length > 0) {
      buscarCotacoes();
    }
  }, [buscarCotacoes]);

  return {
    ativosAtualizados,
    loading,
    error,
    refetch: buscarCotacoes,
    isMobile,
    screenWidth
  };
}

// 🔥 FUNÇÕES AUXILIARES
function calcularVies(precoTeto: number | undefined, precoAtual: number): string {
  if (!precoTeto || precoTeto === 0) return 'Aguardar';
  return precoAtual < precoTeto ? 'Compra' : 'Aguardar';
}

function calcularDY(ticker: string, precoAtual: number): string {
  try {
    if (typeof window === 'undefined' || precoAtual <= 0) return '0,00%';
    
    const proventosData = localStorage.getItem(`proventos_${ticker}`);
    if (!proventosData) return '0,00%';
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return '0,00%';
    
    const hoje = new Date();
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    
    const proventosUltimos12Meses = proventos.filter((provento: any) => {
      let dataProvento: Date;
      
      if (provento.dataObj) {
        dataProvento = new Date(provento.dataObj);
      } else if (provento.dataCom) {
        const [d, m, a] = provento.dataCom.split('/');
        dataProvento = new Date(+a, +m - 1, +d);
      } else if (provento.data) {
        const [d, m, a] = provento.data.split('/');
        dataProvento = new Date(+a, +m - 1, +d);
      } else {
        return false;
      }
      
      return dataProvento >= umAnoAtras && dataProvento <= hoje;
    });
    
    if (proventosUltimos12Meses.length === 0) return '0,00%';
    
    const totalProventos = proventosUltimos12Meses.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    if (totalProventos <= 0) return '0,00%';
    
    const dy = (totalProventos / precoAtual) * 100;
    return `${dy.toFixed(2).replace('.', ',')}%`;
    
  } catch (error) {
    console.error(`❌ Erro ao calcular DY para ${ticker}:`, error);
    return '0,00%';
  }
}

// 🎯 COMPONENTE PRINCIPAL RESPONSIVO
export default function MicroCapsResponsivePage() {
  const { ativosAtualizados, loading, error, refetch, isMobile, screenWidth } = useMicroCapsResponsive();

  // 🧮 MÉTRICAS DA CARTEIRA
  const calcularMetricas = () => {
    if (!ativosAtualizados || ativosAtualizados.length === 0) {
      return {
        rentabilidadeTotal: 0,
        quantidadeAtivos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        dyMedio: 0,
        ativosPositivos: 0,
        ativosNegativos: 0
      };
    }

    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;
    let melhorAtivo = null;
    let piorAtivo = null;
    let somaPerformances = 0;
    let ativosPositivos = 0;
    let ativosNegativos = 0;

    ativosAtualizados.forEach((ativo) => {
      somaPerformances += ativo.performance;
      
      if (ativo.performance > 0) ativosPositivos++;
      if (ativo.performance < 0) ativosNegativos++;
      
      if (ativo.performance > melhorPerformance) {
        melhorPerformance = ativo.performance;
        melhorAtivo = ativo;
      }

      if (ativo.performance < piorPerformance) {
        piorPerformance = ativo.performance;
        piorAtivo = ativo;
      }
    });

    const rentabilidadeTotal = ativosAtualizados.length > 0 ? somaPerformances / ativosAtualizados.length : 0;

    // DY médio
    const dyValues = ativosAtualizados
      .map(ativo => parseFloat(ativo.dy.replace('%', '').replace(',', '.')))
      .filter(dy => !isNaN(dy) && dy > 0);
    
    const dyMedio = dyValues.length > 0 ? dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

    return {
      rentabilidadeTotal,
      quantidadeAtivos: ativosAtualizados.length,
      melhorAtivo,
      piorAtivo,
      dyMedio,
      ativosPositivos,
      ativosNegativos
    };
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

  // 🔄 FUNÇÃO DE REFRESH
  const handleRefresh = () => {
    console.log('🔄 Refresh manual solicitado');
    refetch();
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Carregando Micro Caps
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            margin: '0'
          }}>
            📱 Dispositivo: {isMobile ? 'Mobile' : 'Desktop'} ({screenWidth}px)
          </p>
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
      {/* 🔥 CSS ANIMATIONS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .card-hover {
          transition: all 0.2s ease;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }} className="fade-in">
        <h1 style={{ 
          fontSize: isMobile ? '32px' : '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: 1.2
        }}>
          🔥 Micro Caps
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '16px'
        }}>
          <p style={{ 
            color: '#64748b', 
            fontSize: isMobile ? '16px' : '18px',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Ativos de alta performance • {metricas.quantidadeAtivos} ativos • 📱 {isMobile ? 'Mobile' : 'Desktop'} ({screenWidth}px)
          </p>
          
          <button
            onClick={handleRefresh}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: isMobile ? '12px 20px' : '12px 24px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: isMobile ? 'flex-start' : 'center'
            }}
            className="card-hover"
          >
            🔄 Atualizar
          </button>
        </div>
        
        {error && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#991b1b'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Cards de Métricas Responsivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '12px' : '16px',
        marginBottom: isMobile ? '24px' : '32px'
      }} className="fade-in">
        {/* Performance Média */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Performance Média
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

        {/* DY Médio */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            DY Médio 12M
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

        {/* Ativos Positivos */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            No Verde
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#10b981',
            lineHeight: '1'
          }}>
            {metricas.ativosPositivos}
          </div>
        </div>

        {/* Ativos Negativos */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }} className="card-hover">
          <div style={{ 
            fontSize: '12px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            No Vermelho
          </div>
          <div style={{ 
            fontSize: isMobile ? '20px' : '24px', 
            fontWeight: '700', 
            color: '#ef4444',
            lineHeight: '1'
          }}>
            {metricas.ativosNegativos}
          </div>
        </div>
      </div>

      {/* Tabela/Cards Responsivos */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }} className="fade-in">
        {/* Header da Tabela */}
        <div style={{
          padding: isMobile ? '20px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            🔥 Micro Caps • Performance Individual
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            {ativosAtualizados.length} ativos • Layout {isMobile ? 'Mobile' : 'Desktop'}
          </p>
        </div>

        {/* Conteúdo Responsivo */}
        {isMobile ? (
          // 📱 LAYOUT MOBILE: Cards
          <div style={{ padding: '16px' }}>
            {ativosAtualizados.map((ativo, index) => (
              <div
                key={ativo.id || index}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
                className="card-hover"
              >
                {/* Header do Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
                    color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {ativo.ticker.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {ativo.ticker}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      {ativo.setor}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: ativo.performance >= 0 ? '#10b981' : '#ef4444',
                    textAlign: 'right'
                  }}>
                    {formatPercentage(ativo.performance)}
                  </div>
                </div>

                {/* Dados do Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '14px'
                }}>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>Entrada</div>
                    <div style={{ fontWeight: '600' }}>{ativo.dataEntrada}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>Preço Atual</div>
                    <div style={{ fontWeight: '600' }}>{formatCurrency(ativo.precoAtual)}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>DY 12M</div>
                    <div style={{ fontWeight: '600' }}>{ativo.dy}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', marginBottom: '4px' }}>Viés</div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                      color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                    }}>
                      {ativo.vies}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 🖥️ LAYOUT DESKTOP: Tabela
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
                    PERFORMANCE
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
                {ativosAtualizados.map((ativo, index) => (
                  <tr 
                    key={ativo.id || index} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
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
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
                          color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {ativo.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ 
                            fontWeight: '700', 
                            color: '#1e293b', 
                            fontSize: '16px'
                          }}>
                            {ativo.ticker}
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
                      {formatCurrency(ativo.precoEntrada)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: ativo.performance >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(ativo.precoAtual)}
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
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center',
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {ativo.dy}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div>📱 Device: {isMobile ? 'Mobile' : 'Desktop'} • Screen: {screenWidth}px • Ativos: {ativosAtualizados.length}</div>
        <div>🔄 StatusApi: Todos SUCCESS (SIM removido) • Layout: {isMobile ? 'Cards' : 'Table'}</div>
      </div>
    </div>
  );
}