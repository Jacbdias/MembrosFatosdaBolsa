'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '../../../../hooks/useDataStore';

// ✅ LAZY LOADING DE COMPONENTES PESADOS
const AnalisesTrimesestrais = lazy(() => import('@/components/AnalisesTrimesestrais'));
const ETFHoldings = lazy(() => import('@/components/ETFHoldings'));
const ETFMetricCards = lazy(() => import('@/components/ETFMetricCards'));

// ✅ IMPORTS BÁSICOS (mantidos síncronos)
import { useAgendaCorporativaTicker } from '@/hooks/ativo/useAgendaCorporativaTicker';
import { useDividendYieldIntegrado } from '@/hooks/ativo/useDividendYieldIntegrado';
import { useProventosIntegrado } from '../../../../hooks/ativo/useProventosIntegrado';
import { useBDRDataAPI } from '../../../../hooks/ativo/useBDRDataAPI';
import { useHGBrasilFII } from '../../../../hooks/ativo/useHGBrasilFII';
import { useCotacaoCompleta } from '../../../../hooks/ativo/useCotacaoCompleta';
import { useBRAPIETF } from '@/hooks/useBRAPIETF';
import { useRelatoriosEstatisticas } from '@/hooks/useRelatoriosAPI';

// ✅ IMPORT ÚNICO CORRIGIDO
import { 
  useDadosFinanceiros, 
  useDadosFII, 
  useDadosBDR, 
  useHGBrasilAcoes,
  useYahooFinanceInternacional,
  useCotacaoUSD,
  formatCurrency, 
  formatarValor,
  isBDREstrangeiro,
  getEstrangeiroFromBDR,
  getMercadoOrigem,
  DadosFinanceiros,
  DadosFII,
  Relatorio 
} from '../../../../hooks/useAtivoDetalhes';

// ✅ CACHE INTELIGENTE UTILITÁRIO
const cacheUtils = {
  set: (key, data, ttl = 5 * 60 * 1000) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      sessionStorage.setItem(`ativo_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  },
  
  get: (key) => {
    try {
      const cached = sessionStorage.getItem(`ativo_cache_${key}`);
      if (cached) {
        const { data, timestamp, ttl } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) {
          return data;
        }
      }
    } catch (error) {
      console.warn('Cache get error:', error);
    }
    return null;
  },
  
  clear: (key) => {
    try {
      sessionStorage.removeItem(`ativo_cache_${key}`);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }
};

// ✅ INTERSECTION OBSERVER OTIMIZADO PARA MOBILE
const useInView = (options = {}) => {
  const [inView, setInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef();
  const timeoutRef = useRef();

  useEffect(() => {
    // Detectar se é mobile para usar configurações diferentes
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Debounce para mobile
        if (isMobileDevice) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            if (entry.isIntersecting && !hasTriggered) {
              setInView(true);
              setHasTriggered(true);
              // Uma vez que está in view, não precisa mais observar
              observer.disconnect();
            }
          }, 100);
        } else {
          // Desktop - comportamento normal
          setInView(entry.isIntersecting);
        }
      },
      { 
        threshold: isMobileDevice ? 0.05 : 0.1, // Threshold menor no mobile
        rootMargin: isMobileDevice ? '100px' : '50px', // Margem maior no mobile
        ...options 
      }
    );

    if (ref.current) observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
      clearTimeout(timeoutRef.current);
    };
  }, [hasTriggered]);

  return [ref, inView];
};

// ✅ FUNÇÃO PARA DETECTAR ETFs (OTIMIZADA)
const ETF_LIST = new Set([
  'QQQ', 'SPY', 'VTI', 'VEA', 'VWO', 'QUAL', 'SOXX', 'XLF', 'XLK', 'XLV', 'XLE',
  'HERO', 'MCHI', 'TFLO', 'TLT', 'IEF', 'SHY', 'NOBL', 'VNQ', 'SCHP', 'VTEB',
  'VOO', 'IVV', 'VXUS', 'BND', 'AGG', 'LQD', 'HYG', 'EMB', 'VB', 'VTV', 'VUG',
  'IWM', 'IWN', 'IWO', 'IJH', 'IJR', 'IJK', 'IJJ', 'IJS', 'IWV', 'ITOT',
  'XLC', 'XLI', 'XLB', 'XLRE', 'XLP', 'XLY', 'XLU', 'GLD', 'SLV', 'IAU',
  'PDBC', 'DBA', 'USO', 'UNG', 'ARKK', 'ARKQ', 'ARKW', 'ARKG', 'ARKF'
]);

const isETF = (ticker) => {
  if (!ticker) return false;
  return ETF_LIST.has(ticker.toUpperCase());
};

// ✅ HOOK RESPONSIVO OTIMIZADO
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width <= 480) return 'mobile';
    if (width <= 768) return 'tablet';
    if (width <= 1024) return 'laptop';
    return 'desktop';
  });

  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      if (width <= 480) setScreenSize('mobile');
      else if (width <= 768) setScreenSize('tablet');
      else if (width <= 1024) setScreenSize('laptop');
      else setScreenSize('desktop');
    };

    // ✅ DEBOUNCE OTIMIZADO PARA MOBILE
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      // Debounce maior para mobile (menos re-renders)
      const delay = window.innerWidth <= 768 ? 300 : 150;
      timeoutId = setTimeout(handleResize, delay);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // ✅ MEMOIZE COMPUTED VALUES
  const computedValues = useMemo(() => ({
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isLaptop: screenSize === 'laptop',
    isDesktop: screenSize === 'desktop',
    isMobileOrTablet: screenSize === 'mobile' || screenSize === 'tablet'
  }), [screenSize]);

  return {
    screenSize,
    ...computedValues,
    width: dimensions.width,
    height: dimensions.height,
    breakpoints: {
      mobile: 480,
      tablet: 768,
      laptop: 1024,
      desktop: 1200
    }
  };
};

// ✅ HOOK DE LOADING PROGRESSIVO
const useProgressiveLoading = (dependencies = []) => {
  const [stages, setStages] = useState({
    stage1: true,  // Header + dados básicos
    stage2: true,  // Métricas financeiras
    stage3: true   // Componentes pesados
  });

  useEffect(() => {
    const anyLoading = dependencies.some(dep => dep === true);
    
    if (!anyLoading) {
      // Stage 1: Dados básicos
      setStages(prev => ({ ...prev, stage1: false }));
      
      // Stage 2: Métricas (com delay mínimo)
      setTimeout(() => {
        setStages(prev => ({ ...prev, stage2: false }));
      }, 100);
      
      // Stage 3: Componentes pesados
      setTimeout(() => {
        setStages(prev => ({ ...prev, stage3: false }));
      }, 200);
    }
  }, dependencies);

  return stages;
};

// ✅ SKELETON LOADER OTIMIZADO
const SkeletonLoader = React.memo(({ variant = 'card', count = 1, className = '' }) => {
  const { isMobile } = useResponsive();
  
  const skeletonStyles = useMemo(() => {
    const baseStyle = {
      backgroundColor: '#e2e8f0',
      borderRadius: '8px',
      animation: 'pulse 2s infinite',
      marginBottom: '16px'
    };

    const variants = {
      header: { ...baseStyle, height: isMobile ? '120px' : '180px', borderRadius: '12px' },
      card: { ...baseStyle, height: isMobile ? '120px' : '160px', width: '100%' },
      metric: { ...baseStyle, height: isMobile ? '80px' : '100px', width: '100%' },
      'table-row': { ...baseStyle, height: '40px', marginBottom: '8px' },
      text: { ...baseStyle, height: '20px', width: '60%' }
    };

    return variants[variant] || baseStyle;
  }, [variant, isMobile]);

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={skeletonStyles} />
      ))}
    </div>
  );
});

// ✅ LAZY COMPONENT WRAPPER
const LazyComponent = ({ children, fallback, condition = true }) => {
  if (!condition) return fallback || <SkeletonLoader />;
  
  return (
    <Suspense fallback={fallback || <SkeletonLoader />}>
      {children}
    </Suspense>
  );
};

// ✅ GRID RESPONSIVO INTELIGENTE (MEMOIZADO)
const ResponsiveGrid = React.memo(({ children, minCardWidth = 250, gap = 20, className = '' }) => {
  const { width, isMobile } = useResponsive();
  
  const gridStyle = useMemo(() => {
    const adjustedMinWidth = isMobile ? Math.min(minCardWidth, width - 48) : minCardWidth;
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${adjustedMinWidth}px, 1fr))`,
      gap: `${gap}px`,
      width: '100%',
      marginBottom: '32px'
    };
  }, [width, isMobile, minCardWidth, gap]);

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  );
});

// ✅ UTILITÁRIOS CENTRALIZADOS (MEMOIZADOS)
const formatUtils = {
  currency: (value, currency = 'BRL') => {
    if (!value || isNaN(value)) return 'N/A';
    return formatCurrency(value, currency);
  },
  
  percentage: (value, decimals = 2) => {
    if (!value || isNaN(value)) return 'N/A';
    return `${value.toFixed(decimals)}%`;
  },
  
  number: (value, decimals = 2) => {
    if (!value || isNaN(value)) return 'N/A';
    return value.toFixed(decimals).replace('.', ',');
  },
  
  compactNumber: (value, suffix = '') => {
    if (!value || isNaN(value)) return 'N/A';
    
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B${suffix}`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M${suffix}`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K${suffix}`;
    
    return `${value.toFixed(0)}${suffix}`;
  },
  
  date: (dateInput, format = 'short') => {
    if (!dateInput) return 'N/A';
    
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    const options = {
      short: { day: '2-digit', month: '2-digit' },
      medium: { day: '2-digit', month: '2-digit', year: '2-digit' },
      long: { day: '2-digit', month: '2-digit', year: 'numeric' },
      monthYear: { month: 'short', year: 'numeric' }
    };
    
    try {
      return date.toLocaleDateString('pt-BR', options[format] || options.medium);
    } catch (error) {
      return 'N/A';
    }
  }
};

// ✅ COMPONENTE CARD MÉTRICA OTIMIZADO
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  icon,
  color = '#1e293b'
}) => {
  const { isMobile } = useResponsive();
  
  const cardStyles = useMemo(() => ({
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    height: '100%',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default'
  }), [isMobile]);
  
  if (loading) {
    return <SkeletonLoader variant="metric" />;
  }

  return (
    <div style={cardStyles}>
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
});

// ✅ NOMES E DESCRIÇÕES (MEMOIZADOS)
const COMPANY_NAMES = {
  'AAPL': 'Apple Inc.',
  'GOOGL': 'Alphabet Inc. (Google)',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'MSFT': 'Microsoft Corporation',
  'VALE3': 'Vale S.A.',
  'PETR4': 'Petróleo Brasileiro S.A.',
  'BBAS3': 'Banco do Brasil S.A.',
  'ALOS3': 'Allos S.A.',
  'TUPY3': 'Tupy S.A.',
  'RECV3': 'PetroRecôncavo S.A.',
  'PRIO3': 'PetroRio S.A.'
};

const COMPANY_DESCRIPTIONS = {
  'AAPL': 'Empresa americana de tecnologia especializada em eletrônicos de consumo, software e serviços online.',
  'GOOGL': 'Empresa multinacional americana especializada em serviços e produtos relacionados à internet.',
  'META': 'Empresa americana de tecnologia que desenvolve produtos e serviços de redes sociais.',
  'NVDA': 'Empresa americana de tecnologia especializada em processadores gráficos e inteligência artificial.',
  'AMZN': 'Empresa americana de comércio eletrônico e computação em nuvem.',
  'TSLA': 'Empresa americana de veículos elétricos e energia limpa.',
  'MSFT': 'Empresa americana de tecnologia que desenvolve, licencia e vende software, serviços e dispositivos.',
  'VALE3': 'Empresa brasileira multinacional de mineração.',
  'PETR4': 'Empresa brasileira de energia, atuando principalmente na exploração e produção de petróleo.',
  'BBAS3': 'Banco brasileiro, uma das maiores instituições financeiras do país.',
  'ALOS3': 'Empresa brasileira do setor imobiliário, focada em desenvolvimento de empreendimentos.',
  'TUPY3': 'Empresa brasileira de fundição, produzindo blocos e cabeçotes para motores.',
  'RECV3': 'Empresa brasileira de exploração e produção de petróleo e gás natural.',
  'PRIO3': 'Empresa brasileira independente de exploração e produção de petróleo e gás.'
};

const getNomeEmpresa = (ticker, setor) => {
  return COMPANY_NAMES[ticker] || `${ticker} - ${setor}`;
};

const getDescricaoEmpresa = (ticker, setor) => {
  return COMPANY_DESCRIPTIONS[ticker] || `Empresa do setor ${setor}.`;
};

// ✅ COMPONENTE DE AVATAR OTIMIZADO
const CompanyAvatar = React.memo(({ symbol, companyName, size = 120 }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [showFallback, setShowFallback] = React.useState(false);
  const [loadingStrategy, setLoadingStrategy] = React.useState(0);

  const strategies = useMemo(() => {
    const isFII = symbol.includes('11') || symbol.endsWith('11');
    
    if (isFII) {
      const localPath = `/assets/${symbol}.png`;
      return [
        localPath,
        `https://www.ivalor.com.br/media/emp/logos/${symbol.replace('11', '')}.png`,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
    }
    
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
        'MSFT': 'https://logo.clearbit.com/microsoft.com'
      };
      
      const primaryUrl = knownLogos[symbol] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
      
      return [
        primaryUrl,
        `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
      ];
    }
  }, [symbol]);

  React.useEffect(() => {
    setImageUrl(strategies[0]);
    setShowFallback(false);
    setLoadingStrategy(0);
  }, [symbol, strategies]);

  const handleImageError = useCallback(() => {
    if (loadingStrategy < strategies.length - 1) {
      const nextStrategy = loadingStrategy + 1;
      setLoadingStrategy(nextStrategy);
      setImageUrl(strategies[nextStrategy]);
    } else {
      setShowFallback(true);
    }
  }, [loadingStrategy, strategies]);

  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      handleImageError();
      return;
    }
    setShowFallback(false);
  }, [handleImageError]);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '3px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size > 100 ? '2rem' : '1.5rem',
    fontWeight: 'bold',
    color: '#374151',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden'
  }), [size]);

  return (
    <div style={containerStyle}>
      <span style={{ 
        position: 'absolute', 
        zIndex: 1,
        fontSize: size > 100 ? '2rem' : '1.5rem',
        display: showFallback ? 'block' : 'none'
      }}>
        {symbol.slice(0, 2)}
      </span>
      
      {imageUrl && !showFallback && (
        <img
          src={imageUrl}
          alt={`Logo ${symbol}`}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            objectFit: 'cover'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
});

// ✅ MAPEAMENTO BDR OTIMIZADO
const BDR_MAPPING = {
  'NVDA': 'NVDC34', 'AAPL': 'AAPL34', 'AMZN': 'AMZO34', 'GOOGL': 'GOGL34',
  'GOOG': 'GOGL34', 'META': 'M1TA34', 'TSLA': 'TSLA34', 'MSFT': 'MSFT34',
  'AMD': 'A1MD34', 'NFLX': 'NFLX34', 'UBER': 'UBER34', 'PYPL': 'PYPL34',
  'CRM': 'SSFO34', 'ADBE': 'ADBE34', 'INTC': 'I1NT34', 'ORCL': 'ORCL34'
};

function getBDRFromAmericano(tickerAmericano) {
  return BDR_MAPPING[tickerAmericano] || null;
}

// ✅ FUNÇÕES DE CÁLCULO OTIMIZADAS
const calcularVies = (precoTeto, precoAtual, precoEntrada) => {
  const teto = typeof precoTeto === 'string' ? 
    parseFloat(precoTeto.replace(',', '.').replace('R$', '').trim()) : 
    precoTeto;
  
  const entrada = typeof precoEntrada === 'string' ? 
    parseFloat(precoEntrada.replace(',', '.').replace('R$', '').trim()) : 
    precoEntrada;
  
  const precoReferencia = precoAtual || entrada;
  
  if (!teto || !precoReferencia || isNaN(teto) || isNaN(precoReferencia)) {
    return { vies: 'N/A', cor: '#6b7280' };
  }
  
  if (precoReferencia >= teto) {
    return { vies: 'AGUARDAR', cor: '#f59e0b' };
  } else {
    return { vies: 'COMPRA', cor: '#22c55e' };
  }
};

const calcularViesBDR = (precoTetoBDR, precoBDR, cotacaoUSD) => {
  if (!precoTetoBDR || !precoBDR) {
    return { vies: 'N/A', cor: '#6b7280', explicacao: 'Dados insuficientes' };
  }

  const tetoNumerico = typeof precoTetoBDR === 'string' ? 
    parseFloat(precoTetoBDR.replace(',', '.').replace('R$', '').trim()) : 
    precoTetoBDR;

  if (isNaN(tetoNumerico) || tetoNumerico <= 0) {
    return { vies: 'N/A', cor: '#6b7280', explicacao: 'Preço teto inválido' };
  }

  if (precoBDR >= tetoNumerico) {
    return { 
      vies: 'AGUARDAR', 
      cor: '#f59e0b', 
      explicacao: 'BDR atingiu ou superou o preço teto' 
    };
  } else {
    const percentualParaTeto = ((tetoNumerico - precoBDR) / precoBDR) * 100;
    return { 
      vies: 'COMPRA', 
      cor: '#22c55e', 
      explicacao: `${percentualParaTeto.toFixed(1)}% de espaço até o teto` 
    };
  }
};

// ✅ COMPONENTES ESPECÍFICOS (COM LAZY LOADING INTERNO)

// FII Cards com In-View Loading
const FIISpecificCards = React.memo(({ ticker, dadosFII, loading, isFII }) => {
  const { isMobile, isMobileOrTablet } = useResponsive();
  const [containerRef, inView] = useInView();
  const ehFII = isFII || ticker.includes('11') || ticker.endsWith('11');
  
  if (!ehFII) return null;

  const formatarValor = useCallback((valor, tipo = 'currency') => {
    if (!valor || isNaN(valor)) return 'N/A';
    
    switch (tipo) {
      case 'currency': return `R$ ${valor.toFixed(2).replace('.', ',')}`;
      case 'percentage': return `${valor.toFixed(2)}%`;
      case 'billions': return `R$ ${(valor / 1000000000).toFixed(1)} B`;
      case 'millions': return `R$ ${(valor / 1000000).toFixed(1)} M`;
      case 'number': return valor.toFixed(2).replace('.', ',');
      default: return valor.toString();
    }
  }, []);

  return (
    <div ref={containerRef} style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
      }}>
        🏢 Informações sobre o FII
      </h3>

      {!inView ? (
        <SkeletonLoader variant="card" count={3} />
      ) : loading ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(3, 1fr)', 
          gap: isMobile ? '12px' : '16px'
        }}>          
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonLoader key={i} variant="metric" />
          ))}
        </div>
      ) : dadosFII ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(3, 1fr)', 
          gap: isMobile ? '12px' : '16px'
        }}>
          <MetricCard
            title="Dividend Yield"
            value={dadosFII.dividendYield12m ? formatarValor(dadosFII.dividendYield12m, 'percentage') : 'N/A'}
            loading={false}
          />
          <MetricCard
            title="Último Rendimento"
            value={dadosFII.ultimoRendimento ? formatarValor(dadosFII.ultimoRendimento) : 'N/A'}
            loading={false}
          />
          <MetricCard
            title="Patrimônio Líquido"
            value={dadosFII.patrimonioLiquido ? formatarValor(dadosFII.patrimonioLiquido, 'billions') : 'N/A'}
            loading={false}
          />
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(3, 1fr)',  
          gap: isMobile ? '12px' : '16px'
        }}>
          <MetricCard title="Dividend Yield" value="N/A" loading={false} />
          <MetricCard title="Último Rendimento" value="N/A" loading={false} />
          <MetricCard title="Patrimônio Líquido" value="N/A" loading={false} />
        </div>
      )}
    </div>
  );
});

// Agenda Corporativa com Loading Condicional
const AgendaCorporativa = React.memo(({ ticker, isFII = false }) => {
  const [containerRef, inView] = useInView();
  const { eventos, loading, error, refetch } = useAgendaCorporativaTicker(ticker || '');

  const calcularDiasAteEvento = useCallback((dataEvento) => {
    if (!dataEvento) return 0;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const evento = dataEvento instanceof Date ? dataEvento : new Date(dataEvento);
    if (isNaN(evento.getTime())) return 0;
    
    evento.setHours(0, 0, 0, 0);
    
    const diffTime = evento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, []);

  const formatarProximidade = useCallback((dias) => {
    if (dias < 0) return 'Passou';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias <= 7) return `Em ${dias} dias`;
    if (dias <= 30) return `Em ${Math.ceil(dias / 7)} semanas`;
    return `Em ${Math.ceil(dias / 30)} meses`;
  }, []);

  // Só renderiza se estiver na view e com ticker válido
  if (!inView || !ticker) {
    return (
      <div ref={containerRef} style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '32px'
      }}>
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0'
        }}>
          📅 Agenda Corporativa
        </h3>
      </div>

      {!ticker ? (
        <SkeletonLoader variant="card" count={2} />
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <div style={{ color: '#64748b', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <p>Carregando eventos...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#ef4444' }}>
          <h4 style={{ marginBottom: '16px' }}>❌ Erro ao carregar eventos</h4>
          <p style={{ marginBottom: '24px', fontSize: '14px' }}>{error}</p>
        </div>
      ) : eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <h4 style={{ marginBottom: '16px' }}>📭 Nenhum evento encontrado para {ticker}</h4>
          <p style={{ marginBottom: '24px' }}>ℹ️ Não há eventos cadastrados para este ticker</p>
        </div>
      ) : (
        <div>
          {eventos.slice(0, 4).map((evento, index) => {
            const diasAteEvento = calcularDiasAteEvento(evento.dataObj);
            const proximidade = formatarProximidade(diasAteEvento);
            
            return (
              <div key={evento.id} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                backgroundColor: 'white',
                marginBottom: '12px',
                padding: '20px',
                borderLeftWidth: diasAteEvento <= 7 ? '4px' : '1px',
                borderLeftColor: diasAteEvento <= 7 ? '#f59e0b' : '#e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      color: '#1e293b'
                    }}>
                      {evento.titulo}
                    </h4>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}>
                      {evento.descricao}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: diasAteEvento <= 7 ? '#f59e0b' : diasAteEvento < 0 ? '#6b7280' : '#3b82f6',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {proximidade}
                      </span>
                      
                      <span style={{
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {evento.tipo}
                      </span>
                    </div>
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    minWidth: '120px',
                    marginLeft: '20px'
                  }}>
                    <div style={{ 
                      fontSize: '28px',
                      fontWeight: '700',
                      color: diasAteEvento <= 7 ? '#f59e0b' : diasAteEvento < 0 ? '#6b7280' : '#3b82f6',
                      lineHeight: '1'
                    }}>
                      {evento.dataObj ? (
                        evento.dataObj instanceof Date ? 
                          evento.dataObj.getDate() :
                          new Date(evento.dataObj).getDate()
                      ) : 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {evento.dataObj ? (
                        evento.dataObj instanceof Date ? 
                          evento.dataObj.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) :
                          new Date(evento.dataObj).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                      ) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Dados da Posição com Memoização
const DadosPosicaoExpandidos = React.memo(({ 
  empresa, 
  dadosFinanceiros, 
  precoAtualFormatado,
  isFII = false,
  distanciaPrecoTeto,
  percentualCarteira, 
  carteiraConfig
}) => {
  const { isMobile, isMobileOrTablet } = useResponsive();
  const precoAtual = dadosFinanceiros?.precoAtual || null;

  const viesCalculado = useMemo(() => {
    return calcularVies(empresa.precoTeto, precoAtual, empresa.precoEntrada);
  }, [empresa.precoTeto, precoAtual, empresa.precoEntrada]);

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
      gap: isMobile ? '16px' : '24px', 
      marginBottom: '32px' 
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '16px' : '18px', 
          marginBottom: isMobile ? '16px' : '24px', 
          fontWeight: '600' 
        }}>
          📊 Dados da Posição
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>Data de Entrada</span>
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>{empresa.dataEntrada}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>Preço de Entrada</span>
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>
              {typeof empresa.precoEntrada === 'number' 
                ? formatCurrency(empresa.precoEntrada, carteiraConfig.moeda)
                : empresa.precoEntrada || 'N/A'
              }
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: dadosFinanceiros?.precoAtual ? '#e8f5e8' : '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>Preço Atual</span>
            <span style={{ 
              fontSize: isMobile ? '12px' : '14px', 
              fontWeight: '600', 
              color: dadosFinanceiros?.precoAtual ? '#22c55e' : 'inherit' 
            }}>
              {precoAtualFormatado}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '16px' : '18px', 
          marginBottom: isMobile ? '16px' : '24px', 
          fontWeight: '600' 
        }}>
          🎯 Análise de Viés
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '8px' : '12px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>Preço Teto</span>
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>
              {typeof empresa.precoTeto === 'number' 
                ? formatCurrency(empresa.precoTeto, carteiraConfig.moeda)
                : empresa.precoTeto || 'N/A'
              }
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0',
            alignItems: isMobile ? 'flex-start' : 'center'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>Viés Calculado</span>
            <span style={{
              backgroundColor: viesCalculado.cor,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: '600',
              alignSelf: isMobile ? 'flex-start' : 'auto'
            }}>
              {viesCalculado.vies}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: isMobile ? '8px 12px' : '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '4px' : '0'
          }}>
            <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#64748b' }}>% da Carteira</span>
            <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600' }}>{percentualCarteira || 'N/A'}</span>
          </div>
          
          {distanciaPrecoTeto !== null && distanciaPrecoTeto !== undefined && (
            <div style={{ 
              padding: isMobile ? '10px 12px' : '12px', 
              backgroundColor: distanciaPrecoTeto > 0 ? '#f0f9ff' : '#fef2f2', 
              borderRadius: '8px',
              border: `1px solid ${distanciaPrecoTeto > 0 ? '#bfdbfe' : '#fecaca'}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '4px' : '0'
              }}>
                <span style={{ fontSize: isMobile ? '11px' : '12px', color: '#64748b' }}>
                  Distância do Teto:
                </span>
                <span style={{ 
                  fontSize: isMobile ? '12px' : '14px', 
                  fontWeight: '600',
                  color: distanciaPrecoTeto > 0 ? '#1d4ed8' : '#dc2626'
                }}>
                  {distanciaPrecoTeto > 0 ? '+' : ''}{distanciaPrecoTeto.toFixed(1)}%
                </span>
              </div>
              <p style={{ 
                fontSize: isMobile ? '10px' : '11px', 
                color: '#64748b', 
                margin: '4px 0 0 0',
                fontStyle: 'italic',
                lineHeight: '1.3'
              }}>
                {distanciaPrecoTeto > 0 
                  ? '📈 Preço atual está abaixo do teto - espaço para valorização'
                  : '🚨 Preço atual atingiu ou superou o teto'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Histórico de Dividendos com Virtual Scrolling
const HistoricoDividendos = React.memo(({ ticker, dataEntrada, isFII = false }) => {
  const [containerRef, inView] = useInView();
  const [proventos, setProventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fonte, setFonte] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (!inView || !ticker) return;

    const carregarProventos = async () => {
      try {
        setLoading(true);
        
        // Tentar cache primeiro
        const cached = cacheUtils.get(`proventos_${ticker}`);
        if (cached) {
          setProventos(cached);
          setFonte('cache');
          setLoading(false);
          return;
        }

        let proventosEncontrados = [];
        let fonteAtual = '';

        // Tentar API primeiro
        try {
          const response = await fetch(`/api/proventos/${ticker}`);
          
          if (response.ok) {
            const dadosAPI = await response.json();
            
            if (Array.isArray(dadosAPI) && dadosAPI.length > 0) {
              proventosEncontrados = dadosAPI.map(item => {
                const dataObj = item.dataObj ? 
                  (item.dataObj instanceof Date ? item.dataObj : new Date(item.dataObj)) :
                  (item.data ? new Date(item.data) : new Date());
                
                return {
                  ...item,
                  dataObj: isNaN(dataObj.getTime()) ? new Date() : dataObj,
                  valorFormatado: item.valorFormatado || `R$ ${(item.valor || 0).toFixed(2).replace('.', ',')}`,
                  tipo: item.tipo || (isFII ? 'Rendimento' : 'Dividendo')
                };
              });
              
              fonteAtual = 'API';
            }
          }
        } catch (apiError) {
          console.warn('Erro na API:', apiError);
        }

        // Fallback para localStorage
        if (proventosEncontrados.length === 0) {
          const dadosSalvos = localStorage.getItem(`proventos_${ticker}`);
          if (dadosSalvos) {
            try {
              const proventosSalvos = JSON.parse(dadosSalvos);
              proventosEncontrados = proventosSalvos.map(item => {
                const dataObj = item.dataCom || item.data || item.dataObj;
                const dataFinal = dataObj ? 
                  (dataObj instanceof Date ? dataObj : new Date(dataObj)) :
                  new Date();
                
                return {
                  ...item,
                  dataObj: isNaN(dataFinal.getTime()) ? new Date() : dataFinal,
                  valorFormatado: item.valorFormatado || `R$ ${(item.valor || 0).toFixed(2).replace('.', ',')}`
                };
              });
              fonteAtual = 'localStorage';
            } catch (err) {
              console.error('Erro localStorage:', err);
            }
          }
        }

        const proventosValidos = proventosEncontrados.filter(item => {
          // Verificar se tem dataObj válida
          if (!item.dataObj) return false;
          
          const data = item.dataObj instanceof Date ? item.dataObj : new Date(item.dataObj);
          if (isNaN(data.getTime())) return false;
          
          // Verificar se tem valor válido
          if (!item.valor || item.valor <= 0) return false;
          
          // Atualizar o item com a data corrigida
          item.dataObj = data;
          
          return true;
        });
        
        proventosValidos.sort((a, b) => {
          const dateA = a.dataObj instanceof Date ? a.dataObj : new Date(a.dataObj);
          const dateB = b.dataObj instanceof Date ? b.dataObj : new Date(b.dataObj);
          return dateB.getTime() - dateA.getTime();
        });

        setProventos(proventosValidos);
        setFonte(fonteAtual || 'sem dados');
        setPaginaAtual(1);
        
        // Cache os dados válidos
        if (proventosValidos.length > 0) {
          cacheUtils.set(`proventos_${ticker}`, proventosValidos);
        }
        
      } catch (error) {
        console.error('Erro geral:', error);
        setProventos([]);
        setFonte('erro');
      } finally {
        setLoading(false);
      }
    };

    carregarProventos();
  }, [ticker, isFII, inView]);

  const { totalProventos, mediaProvento, ultimoProvento } = useMemo(() => {
    const total = proventos.reduce((sum, item) => sum + (item.valor || 0), 0);
    const media = proventos.length > 0 ? total / proventos.length : 0;
    let ultimo = null;
    
    if (proventos.length > 0) {
      ultimo = proventos[0];
      // Garantir que o último provento tem uma data válida
      if (ultimo && ultimo.dataObj) {
        if (!(ultimo.dataObj instanceof Date)) {
          ultimo.dataObj = new Date(ultimo.dataObj);
        }
        if (isNaN(ultimo.dataObj.getTime())) {
          ultimo.dataObj = new Date();
        }
      }
    }

    return {
      totalProventos: total,
      mediaProvento: media,
      ultimoProvento: ultimo
    };
  }, [proventos]);

  const totalPaginas = Math.ceil(proventos.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const proventosExibidos = proventos.slice(indiceInicio, indiceFim);

  return (
    <div ref={containerRef} style={{
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
          {isFII ? 'Histórico de Rendimentos (FII)' : 'Histórico de Proventos'}
        </h3>
        
        {fonte && (
          <span style={{
            backgroundColor: fonte === 'API' ? '#22c55e' : fonte === 'localStorage' ? '#f59e0b' : '#6b7280',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            📊 {fonte}
          </span>
        )}
      </div>

      {!inView ? (
        <SkeletonLoader variant="card" count={3} />
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <p>Carregando proventos de {ticker}...</p>
        </div>
      ) : proventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <p>
            {isFII ? `❌ Nenhum rendimento carregado para ${ticker}` : `❌ Nenhum provento carregado para ${ticker}`}
          </p>
        </div>
      ) : (
        <>
          <ResponsiveGrid minCardWidth={200} gap={16}>
            <MetricCard
              title={isMobile ? 'Pagamentos' : 'Nº de Pagamentos'}
              value={proventos.length.toString()}
              color="#0ea5e9"
            />
            <MetricCard
              title="Total"
              value={`R$ ${totalProventos.toFixed(2).replace('.', ',')}`}
              color="#22c55e"
            />
            <MetricCard
              title="Média"
              value={`R$ ${mediaProvento.toFixed(2).replace('.', ',')}`}
              color="#eab308"
            />
            <MetricCard
              title="Último"
              value={ultimoProvento && ultimoProvento.dataObj ? 
                (ultimoProvento.dataObj instanceof Date ? 
                  ultimoProvento.dataObj.toLocaleDateString('pt-BR').replace(/\/\d{4}/, '') : 
                  new Date(ultimoProvento.dataObj).toLocaleDateString('pt-BR').replace(/\/\d{4}/, '')
                ) : 'N/A'
              }
              color="#a855f7"
            />
          </ResponsiveGrid>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            overflowX: isMobile ? 'auto' : 'visible'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: isMobile ? '600px' : '100%'
            }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px'
                  }}>
                    Ativo
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'right', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px'
                  }}>
                    Valor
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px'
                  }}>
                    Data
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px'
                  }}>
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody>
                {proventosExibidos.map((provento, index) => (
                  <tr 
                    key={`${provento.id || provento.data}-${index}`} 
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      fontWeight: '500',
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      {ticker}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'right', 
                      fontWeight: '700', 
                      color: '#22c55e',
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      {provento.valorFormatado}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'center', 
                      fontWeight: '500',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      {provento.dataObj ? (
                        provento.dataObj instanceof Date ? 
                          provento.dataObj.toLocaleDateString('pt-BR') :
                          new Date(provento.dataObj).toLocaleDateString('pt-BR')
                      ) : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        backgroundColor: '#f0f9ff',
                        color: '#1e40af',
                        borderRadius: '4px',
                        padding: isMobile ? '2px 6px' : '4px 8px',
                        fontSize: isMobile ? '10px' : '12px',
                        fontWeight: '600',
                        border: '1px solid #bfdbfe'
                      }}>
                        {isMobile 
                          ? (provento.tipo || (isFII ? 'Rend' : 'Div')).substring(0, 4)
                          : (provento.tipo || (isFII ? 'Rendimento' : 'Dividendo'))
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPaginas > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '24px',
              gap: '8px'
            }}>
              <button
                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                disabled={paginaAtual === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: paginaAtual === 1 ? '#f8fafc' : '#ffffff',
                  color: paginaAtual === 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Anterior
              </button>

              <span style={{ padding: '0 16px', fontSize: '14px', color: '#64748b' }}>
                {paginaAtual} de {totalPaginas}
              </span>

              <button
                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                disabled={paginaAtual === totalPaginas}
                style={{
                  padding: '8px 16px',
                  backgroundColor: paginaAtual === totalPaginas ? '#f8fafc' : '#ffffff',
                  color: paginaAtual === totalPaginas ? '#9ca3af' : '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer'
                }}
              >
                Próximo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});

// BDR Americano Info com Lazy Loading
const BDRAmericanoInfo = React.memo(({ 
  ticker, 
  bdrCorrespondente, 
  temBDR, 
  bdrData, 
  bdrLoading,
  precoTetoBDR,
  cotacaoUSD,
  loadingUSD = false,
  atualizacaoUSD,
  refetchUSD
}) => {
  
  if (!temBDR || !bdrCorrespondente) {
    return null;
  }

  const viesBDR = useMemo(() => {
    return precoTetoBDR && bdrData?.price ? 
      calcularViesBDR(precoTetoBDR, bdrData.price, cotacaoUSD) : null;
  }, [precoTetoBDR, bdrData?.price, cotacaoUSD]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🇧🇷 BDR Disponível no Brasil
        <span style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          DISPONÍVEL
        </span>
      </h3>

      <ResponsiveGrid minCardWidth={200} gap={16}>
        <MetricCard
          title="Ativo Original (EUA)"
          value={ticker}
          subtitle="Mercado Americano"
          color="#15803d"
        />
        
        <MetricCard
          title="BDR Brasileiro"
          value={bdrCorrespondente}
          subtitle="Negociado na B3"
          color="#15803d"
        />

        {bdrData && bdrData.price && (
          <>
            <MetricCard
              title="Preço BDR (R$)"
              value={`R$ ${bdrData.price.toFixed(2).replace('.', ',')}`}
              color="#22c55e"
            />

            <MetricCard
              title="Variação BDR"
              value={`${(bdrData.changePercent || 0) >= 0 ? '+' : ''}${(bdrData.changePercent || 0).toFixed(2)}%`}
              color={(bdrData.changePercent || 0) >= 0 ? '#22c55e' : '#ef4444'}
            />
          </>
        )}

        {cotacaoUSD && (
          <MetricCard
            title="USD/BRL"
            value={`R$ ${cotacaoUSD.toFixed(2).replace('.', ',')}`}
            subtitle="Dólar hoje"
            color="#6366f1"
          />
        )}
      </ResponsiveGrid>

      {bdrLoading && (
        <div style={{ 
          marginTop: '16px',
          textAlign: 'center', 
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <span style={{ color: '#15803d', fontSize: '14px' }}>⏳ Carregando cotação do BDR...</span>
        </div>
      )}
    </div>
  );
});

// Gerenciador de Relatórios com In-View Loading
const GerenciadorRelatorios = React.memo(({ ticker }) => {
  const [containerRef, inView] = useInView();
  const { 
    estatisticas, 
    loading, 
    error,
    carregarEstatisticas 
  } = useRelatoriosEstatisticas();

  const relatoriosDoTicker = useMemo(() => {
    if (!ticker || !estatisticas.relatorios) return [];
    
    return estatisticas.relatorios
      .filter(rel => rel.ticker === ticker)
      .map(rel => ({
        ...rel,
        arquivo: rel.arquivoPdf ? 'PDF_API' : undefined,
        tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
      }))
      .sort((a, b) => {
        const dateA = a.dataUpload ? new Date(a.dataUpload) : new Date(0);
        const dateB = b.dataUpload ? new Date(b.dataUpload) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
  }, [ticker, estatisticas.relatorios]);

  useEffect(() => {
    if (inView) {
      carregarEstatisticas();
    }
  }, [inView, carregarEstatisticas]);

  const visualizarRelatorio = useCallback((relatorio) => {
    if (relatorio.arquivoPdf && relatorio.tipoPdf === 'base64') {
      try {
        const base64Clean = relatorio.arquivoPdf.replace('data:application/pdf;base64,', '');
        const binaryString = atob(base64Clean);
        const bytes = new Uint8Array(binaryString.length);
        
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const newWindow = window.open(url, '_blank');
        
        if (newWindow) {
          setTimeout(() => URL.revokeObjectURL(url), 30000);
          
          const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (isMobile) {
            setTimeout(() => {
              alert('📱 PDF aberto para visualização!\n\nPara salvar: use o botão de compartilhar (📤) do navegador');
            }, 1000);
          }
        } else {
          alert('🚫 Popup bloqueado! Permita popups para visualizar o PDF.');
        }
        
        return;
        
      } catch (error) {
        console.error('❌ Erro ao abrir PDF para visualização:', error);
      }
    }
    
    if (relatorio.tipoVisualizacao === 'link' && relatorio.linkExterno) {
      window.open(relatorio.linkExterno, '_blank');
      return;
    }
    
    if (relatorio.tipoVisualizacao === 'canva' && relatorio.linkCanva) {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        if (confirm('🎨 Abrir no Canva?\n\n📱 Pode abrir o app do Canva se instalado.\n\nClique OK para continuar ou Cancelar para tentar outra opção.')) {
          window.open(relatorio.linkCanva, '_blank');
        } else {
          alert('💡 Alternativa: Use o botão "📥 PDF" para baixar a versão em PDF se disponível.');
        }
      } else {
        window.open(relatorio.linkCanva, '_blank');
      }
      return;
    }
    
    if (relatorio.linkExterno) {
      window.open(relatorio.linkExterno, '_blank');
    } else if (relatorio.linkCanva) {
      window.open(relatorio.linkCanva, '_blank');
    } else {
      alert('📋 Link de visualização não disponível para este relatório');
    }
  }, []);

  const downloadPDF = useCallback((relatorio) => {
    if (!relatorio.arquivoPdf || relatorio.tipoPdf !== 'base64') {
      if (relatorio.tipoPdf === 'referencia') {
        alert('📋 PDF grande - solicite re-upload na Central de Relatórios');
      } else {
        alert('📋 PDF não disponível para este relatório');
      }
      return;
    }

    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isMobile = isIOS || isAndroid;
      
      const nomeArquivo = relatorio.nomeArquivoPdf || `${relatorio.ticker}_${relatorio.nome}.pdf`;
      
      if (!relatorio.arquivoPdf.startsWith('data:application/pdf;base64,')) {
        alert('❌ Formato de PDF inválido. Tente fazer re-upload do arquivo.');
        return;
      }
      
      if (isMobile) {
        try {
          const base64Clean = relatorio.arquivoPdf.replace('data:application/pdf;base64,', '');
          const binaryString = atob(base64Clean);
          const bytes = new Uint8Array(binaryString.length);
          
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          if (isIOS) {
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
              setTimeout(() => {
                alert('📱 PDF aberto em nova aba!\n\nPara salvar no iPhone:\n1. Toque no ícone de compartilhar (📤)\n2. Escolha "Salvar em Arquivos"');
              }, 1000);
            } else {
              alert('🚫 Popup bloqueado! Permita popups nas configurações do Safari.');
            }
          } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = nomeArquivo;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
              if (confirm('📱 Se o download não apareceu, deseja abrir o PDF em nova aba?')) {
                window.open(url, '_blank');
              }
            }, 2000);
          }
          
          setTimeout(() => URL.revokeObjectURL(url), 10000);
          
        } catch (error) {
          alert('❌ Erro ao processar PDF no mobile. Tente fazer re-upload do arquivo.');
        }
        
      } else {
        try {
          const base64Clean = relatorio.arquivoPdf.replace('data:application/pdf;base64,', '');
          const binaryString = atob(base64Clean);
          const bytes = new Uint8Array(binaryString.length);
          
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = nomeArquivo;
          link.style.display = 'none';
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          
        } catch (error) {
          alert('❌ Erro ao processar PDF. Verifique se o arquivo não está corrompido.');
        }
      }
      
    } catch (error) {
      alert('❌ Erro ao baixar PDF: ' + error.message);
    }
  }, []);

  return (
    <div ref={containerRef} style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 4px 0'
        }}>
          📊 Relatórios da Empresa
        </h3>
      </div>

      {!inView ? (
        <SkeletonLoader variant="card" count={2} />
      ) : loading ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          color: '#64748b'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '24px' }}>⏳</div>
          <p style={{ fontSize: '14px', margin: '0' }}>
            Carregando relatórios de {ticker}...
          </p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          color: '#dc2626'
        }}>
          <div style={{ marginBottom: '12px', fontSize: '24px' }}>⚠️</div>
          <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>
            <strong>Erro ao carregar relatórios</strong>
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
            {error}
          </p>
          <button
            onClick={carregarEstatisticas}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      ) : relatoriosDoTicker.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '48px' }}>📭</div>
          <h4 style={{ 
            marginBottom: '8px', 
            color: '#1e293b',
            fontSize: '16px' 
          }}>
            Nenhum relatório encontrado
          </h4>
          <p style={{ 
            marginBottom: '16px',
            fontSize: '14px' 
          }}>
            Não há relatórios para <strong>{ticker}</strong>
          </p>
          <p style={{ 
            fontSize: '12px', 
            color: '#94a3b8', 
            marginBottom: '20px' 
          }}>
            💡 Adicione relatórios através da Central de Relatórios
          </p>
        </div>
      ) : (
        <div>
          {relatoriosDoTicker.map((relatorio, index) => (
            <div key={relatorio.id || index} style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              marginBottom: '12px',
              backgroundColor: 'white',
              padding: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ 
                  margin: '0 0 4px 0', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#1e293b',
                  lineHeight: '1.3'
                }}>
                  {relatorio.nome}
                </h4>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginBottom: '4px'
                }}>
                  {relatorio.tipo} • {relatorio.dataReferencia}
                </div>
                {relatorio.tamanho && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#94a3b8'
                  }}>
                    📄 {relatorio.tamanho}
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                justifyContent: 'center'
              }}>
                {relatorio.arquivoPdf && relatorio.tipoPdf === 'base64' && (
                  <button
                    onClick={() => downloadPDF(relatorio)}
                    style={{
                      flex: 1,
                      backgroundColor: '#dcfce7',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#166534',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    📥 PDF
                  </button>
                )}
                
                <button
                  onClick={() => visualizarRelatorio(relatorio)}
                  style={{
                    flex: 1,
                    backgroundColor: '#dbeafe',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  👁 Ver
                </button>
              </div>

              <div style={{ 
                fontSize: '10px', 
                color: '#94a3b8',
                textAlign: 'center',
                marginTop: '8px'
              }}>
                Adicionado em: {relatorio.dataUpload ? 
                  (typeof relatorio.dataUpload === 'string' ? 
                    new Date(relatorio.dataUpload).toLocaleDateString('pt-BR') :
                    relatorio.dataUpload.toLocaleDateString('pt-BR')
                  ) : 'N/A'
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ========================================
// COMPONENTE PRINCIPAL OTIMIZADO
// ========================================
export default function AtivoPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    dados, 
    CARTEIRAS_CONFIG, 
    cotacoes, 
    buscarCotacoes
  } = useDataStore();
  
  const ticker = params?.ticker?.toString().toUpperCase();
  const { isMobile, isMobileOrTablet } = useResponsive();
  
  // ✅ VERIFICAÇÃO PRECOCE DO TICKER
  if (!ticker) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Ticker não informado
          </h2>
        </div>
      </div>
    );
  }
  
  // ✅ ESTADOS BÁSICOS
  const [ativo, setAtivo] = useState(null);
  const [carteira, setCarteira] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ DETECTORES DE TIPO DE ATIVO (MEMOIZADOS) - Só executa se ticker existe
  const tipoAtivo = useMemo(() => {
    const ehBDREstrangeiro = isBDREstrangeiro(ticker);
    const tickerEstrangeiro = ehBDREstrangeiro ? getEstrangeiroFromBDR(ticker) : null;
    const bdrCorrespondente = getBDRFromAmericano(ticker);
    const temBDR = !!bdrCorrespondente;
    const ehETF = isETF(ticker);
    const ehFII = ticker.includes('11') || ticker.endsWith('11');
    
    return {
      ehBDREstrangeiro,
      tickerEstrangeiro,
      bdrCorrespondente,
      temBDR,
      ehETF,
      ehFII
    };
  }, [ticker]);

  // ✅ HOOKS CONDICIONAIS OTIMIZADOS (sempre chamados, mas com parâmetros condicionais)
  const { cotacaoUSD, loading: loadingUSD, ultimaAtualizacao: atualizacaoUSD, refetch: refetchUSD } = useCotacaoUSD();
  
  // Dados básicos sempre carregados
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);
  const { cotacaoCompleta, loading: loadingCotacao, error: errorCotacao } = useCotacaoCompleta(ticker, tipoAtivo.ehBDREstrangeiro);
  
  // Dados condicionais baseados no tipo (sempre chamados, mas podem retornar null)
  const { dadosFII: dadosFIIHGBrasil, loading: loadingFIIHGBrasil } = useHGBrasilFII(
    tipoAtivo.ehFII ? ticker : ''
  );
  
  const { dadosHGBrasil, loading: loadingHGBrasil } = useHGBrasilAcoes(
    (ticker?.match(/\d$/) && !ticker.includes('11')) ? ticker : ''
  );
  
  const { dadosYahoo, loading: loadingYahoo } = useYahooFinanceInternacional(
    (!ticker?.match(/\d$/) || tipoAtivo.ehBDREstrangeiro) ? ticker : ''
  );
  
  const { bdrData, bdrLoading } = useDadosBDR(
    tipoAtivo.ehBDREstrangeiro ? ticker : ''
  );
  
  const { bdrData: bdrDataAPI, bdrLoading: bdrLoadingAPI } = useBDRDataAPI(
    tipoAtivo.temBDR ? tipoAtivo.bdrCorrespondente : ''
  );
  
  const { etfData: etfBRAPIData, loading: loadingETFBRAPI } = useBRAPIETF(
    tipoAtivo.ehETF ? ticker : ''
  );

  // ✅ HOOKS INTEGRADOS (sempre chamados)
  const { dy12Meses, dyFormatado, loading: loadingDY, fonte: fonteDY } = useDividendYieldIntegrado(ticker);
  const { valorProventos, performanceProventos, loading: loadingProventos, fonte: fonteProventos } = useProventosIntegrado(
    ticker, 
    ativo?.dataEntrada || '', 
    ativo?.precoEntrada
  );

  // ✅ LOADING PROGRESSIVO
  const loadingStages = useProgressiveLoading([
    loading,
    dadosLoading && !dadosFinanceiros,
    loadingCotacao && !cotacaoCompleta
  ]);

  // ✅ FUNÇÃO PARA OBTER PREÇO TETO BDR (MEMOIZADA)
  const obterPrecoTetoBDR = useCallback(() => {
    if (!ativo || !carteira) return null;

    if (ativo.precoTetoBDR && typeof ativo.precoTetoBDR === 'number') {
      return ativo.precoTetoBDR;
    }

    try {
      const dadosCompletos = dados[carteira];
      if (Array.isArray(dadosCompletos)) {
        const ativoCompleto = dadosCompletos.find(a => a?.ticker === ticker);
        if (ativoCompleto?.precoTetoBDR && typeof ativoCompleto.precoTetoBDR === 'number') {
          return ativoCompleto.precoTetoBDR;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar preço teto BDR:', error);
    }

    return null;
  }, [ativo, carteira, dados, ticker]);

  const precoTetoBDR = obterPrecoTetoBDR();

  // ✅ FUNÇÃO CALCULAR PERCENTUAL CARTEIRA (MEMOIZADA)
  const calcularPercentualCarteira = useCallback((nomeCarteira) => {
    if (!dados || !dados[nomeCarteira]) return 'N/A';
    
    const ativosCarteira = dados[nomeCarteira];
    const numeroAtivos = Array.isArray(ativosCarteira) ? ativosCarteira.length : 0;
    
    if (numeroAtivos === 0) return '0%';
    
    const percentual = (100 / numeroAtivos).toFixed(1);
    return `${percentual}%`;
  }, [dados]);

  // ✅ EFFECT PARA BUSCAR DADOS BÁSICOS (OTIMIZADO)
  useEffect(() => {
    if (!dados || Object.keys(dados).length === 0) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // Função para buscar dados
    const buscarDadosAtivo = () => {
      // Cache para dados do ativo
      const cached = cacheUtils.get(`ativo_${ticker}`);
      
      if (cached) {
        setAtivo(cached.ativo);
        setCarteira(cached.carteira);
        setLoading(false);
        return;
      }

      // BUSCA EM MÚLTIPLAS CARTEIRAS
      let ativoEncontrado = null;
      let carteiraEncontrada = null;
      const carteirasComAtivo = [];
      const dadosDetalhados = {};

      Object.entries(dados).forEach(([nomeCarteira, ativos]) => {
        if (Array.isArray(ativos)) {
          const ativoNaCarteira = ativos.find(a => a?.ticker === ticker);
          if (ativoNaCarteira) {
            if (!ativoEncontrado) {
              ativoEncontrado = { ...ativoNaCarteira };
              carteiraEncontrada = nomeCarteira;
            }
            
            carteirasComAtivo.push({
              nome: nomeCarteira,
              config: CARTEIRAS_CONFIG[nomeCarteira],
              dados: ativoNaCarteira
            });
            
            dadosDetalhados[nomeCarteira] = ativoNaCarteira;
          }
        }
      });

      if (ativoEncontrado && carteiraEncontrada) {
        if (carteirasComAtivo.length > 1) {
          ativoEncontrado.multiplePortfolios = true;
          ativoEncontrado.portfoliosList = carteirasComAtivo.map(c => c.nome);
          ativoEncontrado.portfoliosData = dadosDetalhados;
          
          const prioridades = {
            'internacional': 1,
            'acoes': 2,
            'fiis': 3,
            'cripto': 4,
            'renda_fixa': 5
          };
          
          carteirasComAtivo.sort((a, b) => {
            const prioA = prioridades[a.nome] || 99;
            const prioB = prioridades[b.nome] || 99;
            return prioA - prioB;
          });
          
          const carteiraPrincipal = carteirasComAtivo[0];
          carteiraEncontrada = carteiraPrincipal.nome;
          
        } else {
          ativoEncontrado.multiplePortfolios = false;
          ativoEncontrado.portfoliosList = [carteiraEncontrada];
        }

        setAtivo(ativoEncontrado);
        setCarteira(carteiraEncontrada);
        
        // Cache os dados encontrados
        const cacheData = {
          ativo: ativoEncontrado,
          carteira: carteiraEncontrada
        };
        
        cacheUtils.set(`ativo_${ticker}`, cacheData);
      }

      setLoading(false);
    };

    buscarDadosAtivo();
  }, [ticker, dados, CARTEIRAS_CONFIG]);

  // ✅ CÁLCULOS MEMOIZADOS
  const calculatedData = useMemo(() => {
    if (!ativo) return {};
    
    // Calcular performance
    let performanceAcao = 0;
    
    if (ativo.posicaoEncerrada && ativo.precoSaida) {
      performanceAcao = ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
    } else {
      const precoAtual = cotacaoCompleta?.regularMarketPrice || 
                        (cotacoes[ticker] && typeof cotacoes[ticker] === 'object' ? cotacoes[ticker].regularMarketPrice : cotacoes[ticker]);
      
      if (precoAtual && ativo.precoEntrada) {
        performanceAcao = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
      }
    }
    
    const performanceTotal = performanceAcao + (performanceProventos || 0);
    
    // Preço atual formatado
    const precoAtual = cotacaoCompleta?.regularMarketPrice || 
                      (cotacoes[ticker] && typeof cotacoes[ticker] === 'object' ? cotacoes[ticker].regularMarketPrice : cotacoes[ticker]);
    
    const precoAtualFormatado = ativo.posicaoEncerrada && ativo.precoSaida ? 
      formatCurrency(ativo.precoSaida, CARTEIRAS_CONFIG[carteira]?.moeda || 'BRL') :
      (precoAtual ? formatCurrency(precoAtual, CARTEIRAS_CONFIG[carteira]?.moeda || 'BRL') : formatCurrency(ativo.precoEntrada, CARTEIRAS_CONFIG[carteira]?.moeda || 'BRL'));

    // Distância do preço teto
    const distanciaPrecoTeto = (() => {
      if (!ativo.precoTeto || ativo.posicaoEncerrada) {
        return null;
      }
      
      const precoReferencia = precoAtual || ativo.precoEntrada;
      return ((ativo.precoTeto - precoReferencia) / precoReferencia) * 100;
    })();

    // Percentual da carteira
    const percentualCarteira = (() => {
      if (ativo?.multiplePortfolios) {
        const percentuais = {};
        ativo.portfoliosList.forEach(nomeCarteira => {
          percentuais[nomeCarteira] = calcularPercentualCarteira(nomeCarteira);
        });
        
        const principal = percentuais[carteira];
        const outros = Object.entries(percentuais)
          .filter(([nome]) => nome !== carteira)
          .map(([nome, valor]) => `${CARTEIRAS_CONFIG[nome]?.nome || nome}: ${valor}`)
          .join(', ');
        
        return `${principal} (principal)${outros ? ` + ${outros}` : ''}`;
      }
      
      return calcularPercentualCarteira(carteira);
    })();

    // Dados de variação
    const getVariationData = () => {
      if (ativo.posicaoEncerrada) {
        return {
          value: Math.abs(performanceTotal).toFixed(2),
          isPositive: performanceTotal >= 0,
          icon: performanceTotal >= 0 ? '▲' : '▼'
        };
      }
      
      if (cotacaoCompleta?.regularMarketChangePercent !== undefined) {
        const variation = cotacaoCompleta.regularMarketChangePercent;
        return {
          value: Math.abs(variation).toFixed(2),
          isPositive: variation >= 0,
          icon: variation >= 0 ? '▲' : '▼'
        };
      }
      
      const cotacaoGlobal = cotacoes[ticker];
      if (cotacaoGlobal?.regularMarketChangePercent !== undefined) {
        const variation = cotacaoGlobal.regularMarketChangePercent;
        return {
          value: Math.abs(variation).toFixed(2),
          isPositive: variation >= 0,
          icon: variation >= 0 ? '▲' : '▼'
        };
      }
      
      return {
        value: 'N/A',
        isPositive: true,
        icon: '•'
      };
    };

    // Background gradient
    const getBackgroundGradient = () => {
      if (tipoAtivo.ehFII) return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
      if (tipoAtivo.ehBDREstrangeiro) return 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)';
      if (carteira === 'acoes') return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
      return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
    };

    return {
      performanceData: {
        total: performanceTotal,
        acao: performanceAcao,
        proventos: performanceProventos || 0,
        valorProventos: valorProventos || 0
      },
      precoAtualFormatado,
      distanciaPrecoTeto,
      percentualCarteira,
      variationData: getVariationData(),
      backgroundGradient: getBackgroundGradient()
    };
  }, [
    ativo, 
    carteira, 
    cotacaoCompleta, 
    cotacoes, 
    ticker, 
    performanceProventos, 
    valorProventos, 
    calcularPercentualCarteira, 
    CARTEIRAS_CONFIG,
    tipoAtivo
  ]);

  // Estados de carregamento e erro (com stages)
  if (loadingStages.stage1) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Carregando informações do ativo...
          </h2>
        </div>
      </div>
    );
  }

  if (!ativo || !carteira) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Ativo não encontrado
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#64748b',
            marginBottom: '32px'
          }}>
            O ativo <strong>{ticker}</strong> não foi encontrado em nenhuma das suas carteiras.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🏠 Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const carteiraConfig = CARTEIRAS_CONFIG[carteira];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: isMobile ? '16px' : '24px' 
    }}>
      {/* Navegação */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Voltar
        </button>
      </div>

      {/* Header Principal */}
      <div style={{
        marginBottom: '32px',
        background: calculatedData.backgroundGradient,
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: isMobile ? '20px' : '32px' }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            gap: isMobile ? '16px' : '24px',
            alignItems: isMobileOrTablet ? 'center' : 'flex-start'
          }}>
            
            {/* AVATAR DA EMPRESA */}
            <CompanyAvatar 
              symbol={ticker}
              companyName={getNomeEmpresa(ticker, ativo?.setor || '')}
              size={isMobile ? 80 : isMobileOrTablet ? 100 : 120}
            />
            
            {/* INFORMAÇÕES CENTRAIS */}
            <div style={{ 
              flex: 1, 
              textAlign: isMobileOrTablet ? 'center' : 'left',
              minWidth: 0
            }}>
              {/* Título e badges */}
              <div style={{
                display: 'flex',
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                gap: '12px',
                alignItems: isMobileOrTablet ? 'center' : 'flex-start',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <h1 style={{ 
                  fontSize: isMobile ? '1.8rem' : isMobileOrTablet ? '2.2rem' : '2.5rem', 
                  fontWeight: 700, 
                  margin: 0,
                  color: '#1f2937',
                  letterSpacing: '-0.025em'
                }}>
                  {ticker}
                </h1>
                
                {/* Badges responsivos */}
                <div style={{ 
                  display: 'flex', 
                  gap: isMobile ? '6px' : '8px', 
                  flexWrap: 'wrap',
                  justifyContent: isMobileOrTablet ? 'center' : 'flex-start'
                }}>
                  <div style={{
                    background: carteiraConfig?.color || '#6b7280',
                    color: 'white',
                    padding: isMobile ? '3px 8px' : '4px 12px',
                    borderRadius: '6px',
                    fontSize: isMobile ? '10px' : '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {carteiraConfig?.nome || carteira}
                  </div>
                  
                  {ativo?.multiplePortfolios && (
                    <div style={{
                      background: '#fefce8',
                      color: '#d97706',
                      padding: isMobile ? '3px 8px' : '4px 12px',
                      borderRadius: '6px',
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      📂 {ativo.portfoliosList.length} CARTEIRAS
                    </div>
                  )}
                  
                  {ativo.posicaoEncerrada && (
                    <div style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: isMobile ? '3px 8px' : '4px 12px',
                      borderRadius: '6px',
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: 'bold'
                    }}>
                      ENCERRADA
                    </div>
                  )}
                </div>
              </div>
              
              {/* Nome da empresa */}
              <h2 style={{ 
                fontSize: isMobile ? '1rem' : isMobileOrTablet ? '1.1rem' : '1.25rem', 
                fontWeight: 600, 
                margin: '0 0 12px 0',
                color: '#374151',
                lineHeight: '1.4'
              }}>
                {getNomeEmpresa(ticker, ativo.setor)}
              </h2>
              
              {/* Info do setor */}
              <div style={{
                background: '#e2e8f0',
                color: '#475569',
                padding: isMobile ? '3px 10px' : '4px 12px',
                borderRadius: '6px',
                fontSize: isMobile ? '11px' : '13px',
                fontWeight: 500,
                display: 'inline-block',
                marginBottom: '12px'
              }}>
                {carteiraConfig?.moeda || 'BRL'} • {ativo.setor}
                {tipoAtivo.ehFII && ' • Fundo Imobiliário'}
                {tipoAtivo.ehBDREstrangeiro && ` • Mercado: ${getMercadoOrigem(tipoAtivo.tickerEstrangeiro)}`}
              </div>
              
              {/* Descrição da empresa */}
              <p style={{ 
                fontSize: isMobile ? '14px' : '16px',
                lineHeight: 1.6,
                color: '#4b5563',
                margin: 0,
                maxWidth: isMobileOrTablet ? '100%' : '600px'
              }}>
                {getDescricaoEmpresa(ticker, ativo.setor)}
              </p>
              
              {/* Alerta de posição encerrada */}
              {ativo.posicaoEncerrada && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: isMobile ? '10px 12px' : '12px 16px',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontWeight: 600,
                  marginTop: '12px',
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  🔒 Posição encerrada em {ativo.dataSaida}
                </div>
              )}
            </div>
            
            {/* PREÇO E VARIAÇÃO */}
            <div style={{ 
              textAlign: isMobileOrTablet ? 'center' : 'right',
              minWidth: isMobileOrTablet ? 'auto' : '200px'
            }}>
              <div style={{ 
                fontSize: isMobile ? '2rem' : isMobileOrTablet ? '2.5rem' : '3rem', 
                fontWeight: 700,
                color: '#1f2937',
                lineHeight: 1,
                marginBottom: '8px'
              }}>
                {calculatedData.precoAtualFormatado}
              </div>
              
              <div style={{ 
                color: calculatedData.variationData?.isPositive ? '#22c55e' : '#ef4444', 
                fontWeight: 700, 
                fontSize: isMobile ? '0.9rem' : isMobileOrTablet ? '1.1rem' : '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobileOrTablet ? 'center' : 'flex-end',
                gap: '8px'
              }}>
                <span style={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }}>
                  {calculatedData.variationData?.icon}
                </span>
                <span>
                  {calculatedData.variationData?.value}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STAGE 2: COMPONENTES CONDICIONAIS */}
      {!loadingStages.stage2 && (
        <>
          {/* Para ativos americanos com BDR disponível */}
          {tipoAtivo.temBDR && tipoAtivo.bdrCorrespondente && (
            <BDRAmericanoInfo 
              ticker={ticker}
              bdrCorrespondente={tipoAtivo.bdrCorrespondente}
              temBDR={tipoAtivo.temBDR}
              bdrData={bdrDataAPI}
              bdrLoading={bdrLoadingAPI}
              precoTetoBDR={precoTetoBDR}
              cotacaoUSD={cotacaoUSD}
              loadingUSD={loadingUSD}
              atualizacaoUSD={atualizacaoUSD}
              refetchUSD={refetchUSD}
            />
          )}

          {/* Dados Específicos de FII */}
          {tipoAtivo.ehFII && (
            <FIISpecificCards 
              ticker={ticker}
              dadosFII={dadosFIIHGBrasil}
              loading={loadingFIIHGBrasil}
              isFII={tipoAtivo.ehFII}
            />
          )}

          {/* Grid de Cards de Métricas */}
          {tipoAtivo.ehETF ? (
            <LazyComponent 
              condition={!loadingStages.stage2}
              fallback={<SkeletonLoader variant="card" count={4} />}
            >
              <ETFMetricCards 
                ticker={ticker}
                etfData={etfBRAPIData}
                loading={loadingETFBRAPI}
              />
            </LazyComponent>
          ) : !tipoAtivo.ehFII && (
            <ResponsiveGrid minCardWidth={200} gap={20}>
              <MetricCard
                title="PERFORMANCE TOTAL"
                value={`${calculatedData.performanceData?.total >= 0 ? '+' : ''}${calculatedData.performanceData?.total.toFixed(2)}%`}
                subtitle={`Ação: ${calculatedData.performanceData?.acao.toFixed(1)}% • Proventos: ${(performanceProventos || 0).toFixed(1)}%`}
                color={calculatedData.performanceData?.total >= 0 ? '#22c55e' : '#ef4444'}
                loading={loadingProventos}
              />

              <MetricCard 
                title="P/L" 
                value={(() => {
                  if (ticker.match(/\d$/) && !ticker.includes('11')) {
                    if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
                      return dadosHGBrasil.pl.toFixed(2);
                    }
                    if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
                      return dadosFinanceiros.pl.toFixed(2);
                    }
                    if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
                      return dadosYahoo.pl.toFixed(2);
                    }
                    return 'N/A';
                  }
                  
                  else if (!ticker.match(/\d$/)) {
                    if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
                      return dadosYahoo.pl.toFixed(2);
                    }
                    if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
                      return dadosHGBrasil.pl.toFixed(2);
                    }
                    if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
                      return dadosFinanceiros.pl.toFixed(2);
                    }
                    return 'N/A';
                  }
                  
                  else {
                    if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0) {
                      return dadosHGBrasil.pl.toFixed(2);
                    }
                    if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0) {
                      return dadosFinanceiros.pl.toFixed(2);
                    }
                    if (dadosYahoo?.pl && dadosYahoo.pl > 0) {
                      return dadosYahoo.pl.toFixed(2);
                    }
                    return 'N/A';
                  }
                })()}
                
                subtitle={(() => {
                  if (ticker.match(/\d$/) && !ticker.includes('11')) {
                    if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
                      return "HG Brasil";
                    }
                    if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
                      return "BRAPI";
                    }
                    if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
                      return "Yahoo";
                    }
                  } else if (!ticker.match(/\d$/)) {
                    if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
                      return dadosYahoo.fonte || "International";
                    }
                    if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
                      return "HG Brasil";
                    }
                    if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
                      return "BRAPI";
                    }
                  }
                  
                  return "indisponível";
                })()}
                
                loading={dadosLoading || loadingHGBrasil || loadingYahoo}
              />
              
              <MetricCard 
                title="DIVIDEND YIELD" 
                value={(() => {
                  if (dy12Meses > 0) {
                    return dyFormatado;
                  }
                  if (dadosYahoo?.dividendYield && dadosYahoo.dividendYield > 0) {
                    return `${dadosYahoo.dividendYield.toFixed(2)}%`;
                  }
                  if (dadosHGBrasil?.dividendYield12m) {
                    return `${dadosHGBrasil.dividendYield12m.toFixed(2)}%`;
                  }
                  return 'N/A';
                })()}
                subtitle={(() => {
                  if (dy12Meses > 0) {
                    return fonteDY || "BRAPI-Estratégia";
                  }
                  if (dadosYahoo?.dividendYield && dadosYahoo.dividendYield > 0) {
                    return dadosYahoo.fonte || "International";
                  }
                  if (dadosHGBrasil?.dividendYield12m) {
                    return "HG Brasil";
                  }
                  return "indisponível";
                })()}
                loading={loadingDY || loadingHGBrasil || loadingYahoo}
              />
              
              <MetricCard 
                title="P/VP" 
                value={(() => {
                  if (dadosYahoo?.pvp && dadosYahoo.pvp > 0 && dadosYahoo.pvp < 999) {
                    return dadosYahoo.pvp.toFixed(2);
                  }
                  if (dadosHGBrasil?.pvp) {
                    return dadosHGBrasil.pvp.toFixed(2);
                  }
                  return 'N/A';
                })()}
                subtitle={(() => {
                  if (dadosYahoo?.pvp && dadosYahoo.pvp > 0 && dadosYahoo.pvp < 999) {
                    return dadosYahoo.fonte || "International";
                  }
                  if (dadosHGBrasil?.pvp) {
                    return "HG Brasil";
                  }
                  return "indisponível";
                })()}
                loading={loadingHGBrasil || loadingYahoo}
              />
            </ResponsiveGrid>
          )}
        </>
      )}

      {/* STAGE 3: COMPONENTES PESADOS COM LAZY LOADING */}
      {!loadingStages.stage3 && (
        <>
          <LazyComponent 
            condition={!loadingStages.stage3}
            fallback={<SkeletonLoader variant="card" count={2} />}
          >
            <ETFHoldings 
              ticker={ticker}
              dadosYahoo={dadosYahoo}
              dadosBRAPI={etfBRAPIData}
              loading={loadingYahoo || loadingETFBRAPI}
            />
          </LazyComponent>

          <LazyComponent 
            condition={!loadingStages.stage3}
            fallback={<SkeletonLoader variant="card" count={2} />}
          >
            <AnalisesTrimesestrais ticker={ticker} />
          </LazyComponent>

          <GerenciadorRelatorios ticker={ticker} />
          
          <AgendaCorporativa ticker={ticker} isFII={tipoAtivo.ehFII} />

          <HistoricoDividendos ticker={ticker} dataEntrada={ativo.dataEntrada} isFII={tipoAtivo.ehFII} />

          <DadosPosicaoExpandidos 
            empresa={ativo} 
            dadosFinanceiros={dadosFinanceiros}
            precoAtualFormatado={calculatedData.precoAtualFormatado}
            isFII={tipoAtivo.ehFII}
            distanciaPrecoTeto={calculatedData.distanciaPrecoTeto}
            percentualCarteira={calculatedData.percentualCarteira}
            carteiraConfig={carteiraConfig}
          />
        </>
      )}
    </div>
  );
}