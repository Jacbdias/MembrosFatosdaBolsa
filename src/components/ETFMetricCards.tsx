'use client';

import React from 'react';

// 🎨 INTERFACES TypeScript
interface BRAPIETFData {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekRange: string;
  marketCap: number | null;
  logoUrl: string;
  dividendsData?: any;
  distanceFrom52WeekHigh: number | null;
  distanceFrom52WeekLow: number | null;
  requestedAt: string;
  fonte: string;
}

interface ETFMetricCardsProps {
  ticker: string;
  etfData: BRAPIETFData | null;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  icon?: string;
  color?: string;
}

// 🔥 HOOK RESPONSIVO (reutilizar do arquivo principal)
const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= 480) return 'mobile';
    if (width <= 768) return 'tablet';
    return 'desktop';
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 480) setScreenSize('mobile');
      else if (width <= 768) setScreenSize('tablet');
      else setScreenSize('desktop');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isMobileOrTablet: screenSize === 'mobile' || screenSize === 'tablet'
  };
};

// 🎯 COMPONENTE DE CARD MÉTRICA OTIMIZADO
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  loading = false, 
  trend, 
  icon, 
  color = '#1e293b' 
}) => {
  const { isMobile } = useResponsive();
  
  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: isMobile ? '16px' : '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        height: '100%'
      }}>
        <div style={{
          height: '20px',
          backgroundColor: '#e2e8f0',
          borderRadius: '4px',
          animation: 'pulse 2s infinite',
          marginBottom: '12px'
        }} />
        <div style={{
          height: '32px',
          backgroundColor: '#e2e8f0',
          borderRadius: '4px',
          animation: 'pulse 2s infinite',
          marginBottom: '8px'
        }} />
        <div style={{
          height: '16px',
          backgroundColor: '#e2e8f0',
          borderRadius: '4px',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: isMobile ? '16px' : '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      height: '100%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '8px'
      }}>
        {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
        <h4 style={{
          fontSize: isMobile ? '11px' : '12px',
          fontWeight: '700',
          color: '#64748b',
          margin: '0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </h4>
      </div>
      
      <p style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: '800',
        color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : color,
        margin: '0 0 4px 0',
        lineHeight: '1.2'
      }}>
        {value}
      </p>
      
      {subtitle && (
        <p style={{
          fontSize: isMobile ? '10px' : '12px',
          color: '#64748b',
          margin: '0',
          fontWeight: '500'
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// 🏢 COMPONENTE PRINCIPAL - CARDS PARA ETFs
const ETFMetricCards: React.FC<ETFMetricCardsProps> = ({ ticker, etfData, loading }) => {
  const { isMobile, isMobileOrTablet } = useResponsive();

  // Função para formatar números grandes
  const formatVolume = (volume: number): string => {
    if (!volume) return 'N/A';
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toLocaleString();
  };

  // Função para formatar moeda
  const formatCurrency = (value: number, currency: string = 'USD'): string => {
    if (!value) return 'N/A';
    const symbol = currency === 'USD' ? '$' : 'R$';
    return `${symbol} ${value.toFixed(2)}`;
  };

  // Função para formatar percentual
  const formatPercentage = (value: number): string => {
    if (value === undefined || value === null) return 'N/A';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: '20px',
        gap: isMobile ? '12px' : '0'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0'
        }}>
          📊 Métricas do ETF
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            backgroundColor: loading ? '#f59e0b' : etfData ? '#22c55e' : '#6b7280',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            📈 {loading ? 'Carregando...' : etfData ? 'BRAPI' : 'N/A'}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobileOrTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '12px' : '16px'
      }}>
        
        {/* PREÇO ATUAL */}
        <MetricCard
          title="PREÇO ATUAL"
          value={etfData ? formatCurrency(etfData.regularMarketPrice, etfData.currency) : 'N/A'}
          subtitle={etfData?.currency === 'USD' ? 'Dólares' : 'Reais'}
          loading={loading}
          icon="💰"
        />

        {/* VARIAÇÃO DIÁRIA */}
        <MetricCard
          title="VARIAÇÃO"
          value={etfData ? formatPercentage(etfData.regularMarketChangePercent) : 'N/A'}
          subtitle={etfData ? formatCurrency(etfData.regularMarketChange, etfData.currency) : 'Mudança R$'}
          loading={loading}
          trend={etfData?.regularMarketChangePercent >= 0 ? 'up' : 'down'}
          icon={etfData?.regularMarketChangePercent >= 0 ? '📈' : '📉'}
        />

        {/* VOLUME */}
        <MetricCard
          title="VOLUME"
          value={etfData ? formatVolume(etfData.regularMarketVolume) : 'N/A'}
          subtitle="Volume negociado"
          loading={loading}
          icon="📊"
        />

        {/* 52W HIGH */}
        <MetricCard
          title="52W HIGH"
          value={etfData ? formatCurrency(etfData.fiftyTwoWeekHigh, etfData.currency) : 'N/A'}
          subtitle={etfData?.distanceFrom52WeekHigh ? 
            `${etfData.distanceFrom52WeekHigh.toFixed(1)}% abaixo` : 
            'Máxima 52 semanas'
          }
          loading={loading}
          icon="🎯"
          color="#22c55e"
        />

        {/* 52W LOW */}
        <MetricCard
          title="52W LOW"
          value={etfData ? formatCurrency(etfData.fiftyTwoWeekLow, etfData.currency) : 'N/A'}
          subtitle={etfData?.distanceFrom52WeekLow ? 
            `${etfData.distanceFrom52WeekLow.toFixed(1)}% acima` : 
            'Mínima 52 semanas'
          }
          loading={loading}
          icon="⬇️"
          color="#ef4444"
        />

        {/* RANGE DIÁRIO */}
        <MetricCard
          title="RANGE DIÁRIO"
          value={etfData ? `${etfData.regularMarketDayLow.toFixed(2)} - ${etfData.regularMarketDayHigh.toFixed(2)}` : 'N/A'}
          subtitle="Mín - Máx hoje"
          loading={loading}
          icon="📏"
        />

        {/* ABERTURA */}
        <MetricCard
          title="ABERTURA"
          value={etfData ? formatCurrency(etfData.regularMarketOpen, etfData.currency) : 'N/A'}
          subtitle="Preço de abertura"
          loading={loading}
          icon="🔔"
        />

        {/* FECHAMENTO ANTERIOR */}
        <MetricCard
          title="FECH. ANTERIOR"
          value={etfData ? formatCurrency(etfData.regularMarketPreviousClose, etfData.currency) : 'N/A'}
          subtitle="Último fechamento"
          loading={loading}
          icon="🏁"
        />
      </div>

      {/* INFORMAÇÕES ADICIONAIS */}
      {etfData && (
        <div style={{
          marginTop: '24px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          padding: isMobile ? '16px' : '20px',
          border: '1px solid #7dd3fc'
        }}>
          <h4 style={{
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: '600',
            color: '#0c4a6e',
            margin: '0 0 8px 0'
          }}>
            {etfData.longName || etfData.shortName}
          </h4>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#0369a1',
            margin: '0 0 12px 0',
            lineHeight: '1.5'
          }}>
            ETF negociado em {etfData.currency} • Símbolo: {etfData.symbol}
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '600'
            }}>
              📊 Fonte: BRAPI
            </span>
            <span style={{
              backgroundColor: '#dcfce7',
              color: '#166534',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: '600'
            }}>
              💱 {etfData.currency}
            </span>
            {etfData.requestedAt && (
              <span style={{
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: '600'
              }}>
                🕐 {new Date(etfData.requestedAt).toLocaleString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ETFMetricCards;