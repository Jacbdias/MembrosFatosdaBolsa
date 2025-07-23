'use client';

import * as React from 'react';
import { useFiisCotacoesBrapi } from '@/hooks/useFiisCotacoesBrapi';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useIfixRealTime } from '@/hooks/useIfixRealTime';

// 🚀 HOOK PARA BUSCAR DADOS REAIS DO IBOVESPA VIA API (MOBILE OPTIMIZED)
function useIbovespaRealTime() {
  const [ibovespaData, setIbovespaData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarIbovespaReal = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [MOBILE] BUSCANDO IBOVESPA REAL VIA BRAPI...');

      // 🔑 TOKEN BRAPI VALIDADO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📊 BUSCAR IBOVESPA (^BVSP) VIA BRAPI COM TIMEOUT MOBILE
      const ibovUrl = `https://brapi.dev/api/quote/^BVSP?token=${BRAPI_TOKEN}`;
      
      console.log('🌐 [MOBILE] Buscando Ibovespa:', ibovUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));

      // 🔥 TIMEOUT REDUZIDO PARA MOBILE (3 SEGUNDOS)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(ibovUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Ibovespa-Mobile-App',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 [MOBILE] Resposta IBOVESPA:', data);

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

          console.log('✅ [MOBILE] IBOVESPA PROCESSADO:', dadosIbovespa);
          setIbovespaData(dadosIbovespa);
          
        } else {
          throw new Error('Sem dados do Ibovespa na resposta');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ [MOBILE] Erro ao buscar Ibovespa:', err);
      setError(errorMessage);
      
      // 🔄 FALLBACK MOBILE
      console.log('🔄 [MOBILE] Usando fallback...');
      const fallbackData = {
        valor: 137213,
        valorFormatado: '137.213',
        variacao: -588.25,
        variacaoPercent: -0.43,
        trend: 'down',
        timestamp: new Date().toISOString(),
        fonte: 'FALLBACK_MOBILE'
      };
      setIbovespaData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // 🔥 DELAY INICIAL PARA MOBILE
    const timer = setTimeout(() => {
      buscarIbovespaReal();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [buscarIbovespaReal]);

  return { ibovespaData, loading, error, refetch: buscarIbovespaReal };
}

// 🎨 HOOK PARA DETECTAR MOBILE
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 768);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// 🎨 COMPONENTE DE AVATAR MOBILE OTIMIZADO
const CompanyAvatar = ({ symbol, companyName, size = 40 }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [showFallback, setShowFallback] = React.useState(false);
  const [loadingStrategy, setLoadingStrategy] = React.useState(0);

  const strategies = React.useMemo(() => {
    const isFII = symbol.includes('11') || symbol.endsWith('11');
    
    if (isFII) {
      return [
        `/assets/${symbol}.png`,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
    }
    
    return [
      `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
    ];
  }, [symbol]);

  React.useEffect(() => {
    setImageUrl(strategies[0]);
    setShowFallback(false);
    setLoadingStrategy(0);
  }, [symbol, strategies]);

  const handleImageError = () => {
    if (loadingStrategy < strategies.length - 1) {
      const nextStrategy = loadingStrategy + 1;
      setLoadingStrategy(nextStrategy);
      setImageUrl(strategies[nextStrategy]);
    } else {
      setShowFallback(true);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      handleImageError();
      return;
    }
    setShowFallback(false);
  };

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 40 ? '1rem' : '0.75rem',
      fontWeight: 'bold',
      color: '#374151',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <span style={{ 
        position: 'absolute', 
        zIndex: 1,
        fontSize: size > 40 ? '1rem' : '0.75rem',
        display: showFallback ? 'block' : 'none',
        color: '#8b5cf6'
      }}>
        {symbol.slice(0, 2)}
      </span>
      
      {imageUrl && !showFallback && (
        <img
          src={imageUrl}
          alt={`Logo ${symbol}`}
          style={{
            width: '80%',
            height: '80%',
            borderRadius: '4px',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            objectFit: 'contain'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

// 💰 FUNÇÃO SIMPLIFICADA PARA MOBILE
const calcularProventosFii = (ticker: string, dataEntrada: string): number => {
  try {
    if (typeof window === 'undefined') return 0;
    
    const proventosKey = `proventos_${ticker}`;
    const proventosData = localStorage.getItem(proventosKey);
    if (!proventosData) return 0;
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return 0;
    
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    
    const proventosFiltrados = proventos.filter((provento: any) => {
      try {
        let dataProventoObj: Date;
        
        if (provento.dataPagamento) {
          if (provento.dataPagamento.includes('/')) {
            const [d, m, a] = provento.dataPagamento.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else {
            dataProventoObj = new Date(provento.dataPagamento);
          }
        } else if (provento.data) {
          if (provento.data.includes('/')) {
            const [d, m, a] = provento.data.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else {
            dataProventoObj = new Date(provento.data);
          }
        } else {
          return false;
        }
        
        return dataProventoObj && dataProventoObj >= dataEntradaObj;
      } catch {
        return false;
      }
    });
    
    const totalProventos = proventosFiltrados.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    return totalProventos;
    
  } catch (error) {
    console.error(`❌ [MOBILE] Erro ao calcular proventos para ${ticker}:`, error);
    return 0;
  }
};

// 🎯 FUNÇÃO DE PERFORMANCE MOBILE OTIMIZADA
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

  const performancePreco = ((precoAtual - precoEntrada) / precoEntrada) * 100;
  const valorDividendos = fii.dataEntrada ? calcularProventosFii(fii.ticker, fii.dataEntrada) : 0;
  const performanceDividendos = (valorDividendos / precoEntrada) * 100;
  const performanceTotal = performancePreco + performanceDividendos;

  return { performanceTotal, performancePreco, performanceDividendos, valorDividendos };
}

export default function FiisPage() {
  const { fiis, loading: fiisLoading, erro: fiisError } = useFiisCotacoesBrapi();
  const { marketData, loading: marketLoading, error: marketError } = useFinancialData();
  const { ifixData, loading: ifixLoading, error: ifixError } = useIfixRealTime();
  const { ibovespaData, loading: ibovLoading, error: ibovError } = useIbovespaRealTime();
  const isMobile = useIsMobile();

  // 🔥 DEBUG MOBILE ESPECÍFICO
  React.useEffect(() => {
    console.log('🔍 [MOBILE DEBUG]', {
      isMobile,
      fiis: fiis?.length || 0,
      fiisLoading,
      fiisError,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    });
  }, [isMobile, fiis, fiisLoading, fiisError]);

  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS MOBILE SAFE
  const calcularMetricas = () => {
    if (!fiis || fiis.length === 0) {
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
      const { performanceTotal } = calculatePerformanceTotal(fii);
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

      if (fii.dy && typeof fii.dy === 'string' && fii.dy !== '-') {
        const dyValue = parseFloat(fii.dy.replace('%', '').replace(',', '.'));
        if (!isNaN(dyValue) && dyValue > 0) {
          somaYield += dyValue;
          contadorYield++;
        }
      }
    });

    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

    const dyMedio = contadorYield > 0 ? somaYield / contadorYield : 0;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal,
      quantidadeAtivos: fiis.length,
      melhorAtivo,
      piorAtivo,
      dyMedio
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

  // 🚨 ESTADOS DE LOADING E ERRO MOBILE
  if (fiisLoading || marketLoading) {
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
            fontSize: isMobile ? '16px' : '18px', 
            color: '#64748b',
            marginBottom: '16px'
          }}>
            🏢 {isMobile ? 'Carregando FIIs...' : 'Carregando dados dos FIIs...'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            {isMobile ? 'Mobile' : 'Desktop'} • Aguarde...
          </div>
        </div>
      </div>
    );
  }

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
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            color: '#ef4444',
            marginBottom: '8px'
          }}>
            ⚠️ Erro ao carregar FIIs
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#64748b',
            marginBottom: '16px'
          }}>
            {fiisError}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8'
          }}>
            Dispositivo: {isMobile ? 'Mobile' : 'Desktop'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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
            fontSize: isMobile ? '16px' : '18px', 
            color: '#64748b'
          }}>
            📊 Nenhum FII encontrado na carteira
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#94a3b8',
            marginTop: '8px'
          }}>
            {isMobile ? 'Mobile' : 'Desktop'} • {typeof fiis} • Length: {fiis?.length || 0}
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
      {/* Header Responsivo */}
      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          {isMobile ? 'FIIs' : 'Carteira de Fundos Imobiliários'}
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '14px' : '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {isMobile ? `${fiis.length} FIIs • Atualizado 15min` : 'Fundos de Investimento Imobiliário • Dados atualizados a cada 15 minutos.'}
        </p>
      </div>

      {/* Cards de Métricas Responsivos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: isMobile ? '8px' : '12px',
        marginBottom: isMobile ? '24px' : '32px'
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
            fontSize: '10px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            Rentabilidade total
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
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
          borderRadius: '8px',
          padding: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '10px', 
            color: '#64748b', 
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            DY médio 12M
          </div>
          <div style={{ 
            fontSize: isMobile ? '18px' : '24px', 
            fontWeight: '700', 
            color: '#1e293b',
            lineHeight: '1'
          }}>
            {metricas.dyMedio.toFixed(1)}%
          </div>
        </div>

        {/* IFIX (só mostrar se não for mobile ou tiver espaço) */}
        {!isMobile && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#64748b', 
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              IFIX Index
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e293b',
              lineHeight: '1',
              marginBottom: '4px'
            }}>
              {ifixData?.valorFormatado || '3.435'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: ifixData?.trend === 'up' ? '#10b981' : '#ef4444',
              lineHeight: '1'
            }}>
              {ifixData ? formatPercentage(ifixData.variacaoPercent) : '+0.24%'}
            </div>
          </div>
        )}

        {/* Ibovespa (só mostrar se não for mobile ou tiver espaço) */}
        {!isMobile && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              fontSize: '10px', 
              color: '#64748b', 
              fontWeight: '500',
              marginBottom: '6px'
            }}>
              Ibovespa
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1e293b',
              lineHeight: '1',
              marginBottom: '4px'
            }}>
              {ibovespaData?.valorFormatado || '137.213'}
            </div>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: ibovespaData?.trend === 'up' ? '#10b981' : '#ef4444',
              lineHeight: '1'
            }}>
              {ibovespaData ? formatPercentage(ibovespaData.variacaoPercent) : '+0.2%'}
            </div>
          </div>
        )}
      </div>

      {/* Tabela/Cards Responsivos */}
      {isMobile ? (
        // VERSÃO MOBILE: Cards
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 12px 0'
            }}>
              FIIs ({fiis.length})
            </h3>
          </div>

          {fiis.map((fii, index) => {
            if (!fii || !fii.ticker) return null;
            
            const { performanceTotal } = calculatePerformanceTotal(fii);
            
            return (
              <div 
                key={fii.id || index}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  window.location.href = `/dashboard/ativo/${fii.ticker}`;
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <CompanyAvatar 
                    symbol={fii.ticker}
                    companyName={fii.setor || 'FII'}
                    size={32}
                  />
                  <div style={{ flex: 1 }}>
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
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: (fii.vies === 'Compra') ? '#dcfce7' : '#fef3c7',
                    color: (fii.vies === 'Compra') ? '#065f46' : '#92400e'
                  }}>
                    {fii.vies || 'Aguardar'}
                  </div>
                </div>

                {/* Métricas do Card */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                      Performance Total
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '700',
                      color: performanceTotal >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercentage(performanceTotal)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                      DY 12M
                    </div>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '700',
                      color: '#1e293b'
                    }}>
                      {fii.dy || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                      Preço Atual
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {fii.precoAtual || '-'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>
                      Entrada
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      {fii.precoEntrada || '-'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // VERSÃO DESKTOP: Tabela Original
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
             FIIs • Performance Individual
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0'
            }}>
              {fiis.length} fundos imobiliários • Viés calculado automaticamente
            </p>
          </div>

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
                    PERFORMANCE TOTAL
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
                  if (!fii || !fii.ticker) return null;

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
        </div>
      )}
    </div>
  );
}