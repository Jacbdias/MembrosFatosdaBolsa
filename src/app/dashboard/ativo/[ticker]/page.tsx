'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '../../../../hooks/useDataStore';
import { relatoriosDB } from '../../../../utils/relatoriosDB';
import AnalisesTrimesestrais from '@/components/AnalisesTrimesestrais';
import ETFHoldings from '@/components/ETFHoldings';
import { useAgendaCorporativaTicker } from '@/hooks/ativo/useAgendaCorporativaTicker';
import { useDividendYieldIntegrado } from '@/hooks/ativo/useDividendYieldIntegrado';
import { useProventosIntegrado } from '../../../../hooks/ativo/useProventosIntegrado';
import { useBDRDataAPI } from '../../../../hooks/ativo/useBDRDataAPI';
import { useHGBrasilFII } from '../../../../hooks/ativo/useHGBrasilFII';
import { useCotacaoCompleta } from '../../../../hooks/ativo/useCotacaoCompleta';

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

// 🔥 HOOK RESPONSIVO CENTRALIZADO
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

    // Debounce resize para performance
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isLaptop: screenSize === 'laptop',
    isDesktop: screenSize === 'desktop',
    isMobileOrTablet: screenSize === 'mobile' || screenSize === 'tablet',
    width: dimensions.width,
    height: dimensions.height,
    // Breakpoints úteis
    breakpoints: {
      mobile: 480,
      tablet: 768,
      laptop: 1024,
      desktop: 1200
    }
  };
};

// 🔥 HOOK DE LOADING UNIFICADO
const useLoadingState = (loadingStates = [], minLoadingTime = 300) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStartTime] = useState(Date.now());

  useEffect(() => {
    const anyLoading = loadingStates.some(state => state === true);
    
    if (!anyLoading) {
      const elapsed = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime);
    } else {
      setIsLoading(true);
    }
  }, [loadingStates, loadingStartTime, minLoadingTime]);

  return isLoading;
};

// 🔥 COMPONENTE DE SKELETON LOADING RESPONSIVO
const SkeletonLoader = ({ variant = 'card', count = 1, className = '' }) => {
  const { isMobile, isTablet } = useResponsive();
  
  const getSkeletonStyle = () => {
    const baseStyle = {
      backgroundColor: '#e2e8f0',
      borderRadius: '8px',
      animation: 'pulse 2s infinite',
      marginBottom: '16px'
    };

    switch (variant) {
      case 'header':
        return {
          ...baseStyle,
          height: isMobile ? '120px' : '180px',
          borderRadius: '12px'
        };
      case 'card':
        return {
          ...baseStyle,
          height: isMobile ? '120px' : '160px',
          width: '100%'
        };
      case 'metric':
        return {
          ...baseStyle,
          height: isMobile ? '80px' : '100px',
          width: '100%'
        };
      case 'table-row':
        return {
          ...baseStyle,
          height: '40px',
          marginBottom: '8px'
        };
      case 'text':
        return {
          ...baseStyle,
          height: '20px',
          width: '60%'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={getSkeletonStyle()} />
      ))}
    </div>
  );
};

// 🔥 GRID RESPONSIVO INTELIGENTE
const ResponsiveGrid = ({ children, minCardWidth = 250, gap = 20, className = '' }) => {
  const { width, isMobile } = useResponsive();
  
  const gridStyle = useMemo(() => {
    const adjustedMinWidth = isMobile ? Math.min(minCardWidth, width - 48) : minCardWidth;
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${adjustedMinWidth}px, 1fr))`,
      gap: `${gap}px`,
      width: '100%'
    };
  }, [width, isMobile, minCardWidth, gap]);

  return (
    <div style={gridStyle} className={className}>
      {children}
    </div>
  );
};

// 🌍 FUNÇÃO PARA MAPEAR TICKER AMERICANO PARA BDR BRASILEIRO
function getBDRFromAmericano(tickerAmericano) {
  const mapeamento = {
    'NVDA': 'NVDC34',
    'AAPL': 'AAPL34', 
    'AMZN': 'AMZO34',
    'GOOGL': 'GOGL34',
    'GOOG': 'GOGL34',
    'META': 'M1TA34',
    'TSLA': 'TSLA34',
    'MSFT': 'MSFT34',
    'AMD': 'A1MD34',
    'NFLX': 'NFLX34',
    'UBER': 'UBER34',
    'PYPL': 'PYPL34',
    'CRM': 'SSFO34',
    'ADBE': 'ADBE34',
    'INTC': 'I1NT34',
    'ORCL': 'ORCL34',
    'PEP': 'PEPB34',
    'KO': 'COCA34',
    'JNJ': 'JNJB34',
    'V': 'VISA34',
    'MA': 'MAST34',
    'JPM': 'JPMC34',
    'BAC': 'BOAC34',
    'WMT': 'WALM34',
    'DIS': 'DISB34',
    'HD': 'HOME34',
    'COST': 'COWC34',
    'XOM': 'EXXO34',
    'CVX': 'CHVX34',
    'PFE': 'PFIZ34',
    'MRK': 'MERK34',
    'ABT': 'ABTT34',
    'TMO': 'TMOG34',
    'UNH': 'UNHH34',
    'NKE': 'NIKE34',
    'MCD': 'MCDC34',
    'VZ': 'VERZ34',
    'T': 'ATTB34',
    'IBM': 'IBMB34',
    'GE': 'GEOO34',
    'F': 'FORD34',
    'GM': 'GMCO34',
    'CAT': 'CATC34',
    'BA': 'BOEI34',
    'MMM': 'MMMC34'
  };
  
  return mapeamento[tickerAmericano] || null;
}

// Função auxiliar para obter nome da empresa
const getNomeEmpresa = (ticker, setor) => {
  const nomes = {
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
  
  return nomes[ticker] || `${ticker} - ${setor}`;
};

// Função auxiliar para obter descrição da empresa
const getDescricaoEmpresa = (ticker, setor) => {
  const descricoes = {
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
  
  return descricoes[ticker] || `Empresa do setor ${setor}.`;
};

// 🎯 COMPONENTE DE AVATAR COM SISTEMA UNIFICADO E FALLBACK INTELIGENTE
const CompanyAvatar = ({ symbol, companyName, size = 120 }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [showFallback, setShowFallback] = React.useState(false);
  const [loadingStrategy, setLoadingStrategy] = React.useState(0);

  // Lista de estratégias de carregamento
  const strategies = React.useMemo(() => {
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
    }}>
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
};

// Função para calcular o viés baseado no preço teto vs preço atual
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

// 🔥 FUNÇÃO PARA CALCULAR VIÉS BDR
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

// 🏢 COMPONENTE DE CARDS ESPECÍFICOS PARA FII
const FIISpecificCards = React.memo(({ ticker, dadosFII, loading, isFII }) => {
  const ehFII = isFII || ticker.includes('11') || ticker.endsWith('11');
  
  if (!ehFII) {
    return null;
  }

  const formatarValor = (valor, tipo = 'currency') => {
    if (!valor || isNaN(valor)) return 'N/A';
    
    switch (tipo) {
      case 'currency':
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
      case 'percentage':
        return `${valor.toFixed(2)}%`;
      case 'billions':
        return `R$ ${(valor / 1000000000).toFixed(1)} B`;
      case 'millions':
        return `R$ ${(valor / 1000000).toFixed(1)} M`;
      case 'number':
        return valor.toFixed(2).replace('.', ',');
      default:
        return valor.toString();
    }
  };

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
        🏢 Informações sobre o FII
      </h3>

      {loading ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px'
        }}>          
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ 
                height: '20px', 
                backgroundColor: '#e2e8f0', 
                borderRadius: '4px',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          ))}
        </div>
      ) : dadosFII ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.dividendYield12m ? 
                formatarValor(dadosFII.dividendYield12m, 'percentage') : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Dividend Yield
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.ultimoRendimento ? 
                formatarValor(dadosFII.ultimoRendimento) : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Último Rendimento
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.patrimonioLiquido ? 
                formatarValor(dadosFII.patrimonioLiquido, 'billions') : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Patrimônio Líquido
            </p>
          </div>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',  
          gap: '16px' 
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <h4 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#6b7280', 
                margin: '0',
                lineHeight: '1'
              }}>
                N/A
              </h4>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: '4px 0 0 0',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {i === 1 ? 'Dividend Yield' : i === 2 ? 'Último Rendimento' : 'Patrimônio Líquido'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Componente de Métrica
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend
}) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    height: '100%'
  }}>
    <h4 style={{
      fontSize: '12px',
      fontWeight: '700',
      color: '#64748b',
      margin: '0 0 8px 0',
      textTransform: 'uppercase'
    }}>
      {title}
    </h4>
    
    {loading ? (
      <div style={{ color: '#64748b', fontSize: '18px' }}>⏳</div>
    ) : (
      <>
        <p style={{
          fontSize: '24px',
          fontWeight: '800',
          color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#1e293b',
          margin: '0 0 4px 0'
        }}>
          {value}
        </p>
        
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '0'
          }}>
            {subtitle}
          </p>
        )}
      </>
    )}
  </div>
));

// GerenciadorRelatorios com funcionalidades de visualização e download
const GerenciadorRelatorios = React.memo(({ ticker }) => {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarRelatorios = async () => {
      if (!ticker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Tentar IndexedDB primeiro
        try {
          await relatoriosDB.init();
          const relatoriosIndexedDB = await relatoriosDB.buscarRelatoriosTicker(ticker);
          
          if (relatoriosIndexedDB.length > 0) {
            const relatoriosFormatados = relatoriosIndexedDB.map(rel => ({
              ...rel,
              ticker,
              arquivo: rel.arquivoPdf ? 'PDF_INDEXEDDB' : undefined,
              tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
            }));
            
            setRelatorios(relatoriosFormatados);
            setLoading(false);
            return;
          }
        } catch (indexedDBError) {
          console.warn('IndexedDB falhou, tentando localStorage:', indexedDBError);
        }

        // Fallback para localStorage
        const dadosCentralizados = localStorage.getItem('relatorios_central');
        if (dadosCentralizados) {
          try {
            const dados = JSON.parse(dadosCentralizados);
            const relatoriosTicker = dados[ticker] || [];
            
            if (relatoriosTicker.length > 0) {
              const relatoriosFormatados = relatoriosTicker.map(rel => ({
                ...rel,
                ticker,
                arquivo: rel.arquivoPdf ? 'PDF_LOCALSTORAGE' : undefined,
                tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
              }));
              
              setRelatorios(relatoriosFormatados);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.warn('Erro ao ler localStorage:', error);
          }
        }

        setRelatorios([]);

      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setRelatorios([]);
      } finally {
        setLoading(false);
      }
    };

    carregarRelatorios();
  }, [ticker]);

  const getIconePorTipo = (tipo) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  };

  const visualizarRelatorio = (relatorio) => {
    if (relatorio.tipoVisualizacao === 'link' && relatorio.linkExterno) {
      window.open(relatorio.linkExterno, '_blank');
      return;
    }
    
    if (relatorio.tipoVisualizacao === 'canva' && relatorio.linkCanva) {
      window.open(relatorio.linkCanva, '_blank');
      return;
    }
    
    if (relatorio.linkExterno) {
      window.open(relatorio.linkExterno, '_blank');
    } else if (relatorio.linkCanva) {
      window.open(relatorio.linkCanva, '_blank');
    } else {
      alert('📋 Link de visualização não disponível para este relatório');
    }
  };

  if (loading) {
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
          margin: '0 0 20px 0'
        }}>
         Relatórios da Empresa
        </h3>
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <p>Carregando relatórios de {ticker}...</p>
        </div>
      </div>
    );
  }

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
        margin: '0 0 20px 0'
      }}>
       Relatórios da Empresa
      </h3>

      {relatorios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '48px' }}>📭</div>
          <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
            Nenhum relatório encontrado
          </h4>
          <p style={{ marginBottom: '16px' }}>
            Não há relatórios cadastrados para <strong>{ticker}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            💡 Adicione relatórios através da Central de Relatórios
          </p>
        </div>
      ) : (
        <div>
          {relatorios.map((relatorio, index) => (
            <div key={relatorio.id || index} style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              marginBottom: '8px',
              backgroundColor: 'white',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span>{getIconePorTipo(relatorio.tipoVisualizacao)}</span>
                  <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
                    {relatorio.nome}
                  </h4>
                </div>
                
                <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                  {relatorio.tipo} • {relatorio.dataReferencia}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => visualizarRelatorio(relatorio)}
                  style={{
                    backgroundColor: '#e3f2fd',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#1976d2'
                  }}
                  title="Visualizar conteúdo"
                >
                  👁 Ver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Agenda Corporativa
const AgendaCorporativa = React.memo(({ ticker, isFII = false }) => {
  const { eventos, loading, error, refetch } = useAgendaCorporativaTicker(ticker);

  const calcularDiasAteEvento = (dataEvento) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento);
    evento.setHours(0, 0, 0, 0);
    
    const diffTime = evento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatarProximidade = (dias) => {
    if (dias < 0) return 'Passou';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias <= 7) return `Em ${dias} dias`;
    if (dias <= 30) return `Em ${Math.ceil(dias / 7)} semanas`;
    return `Em ${Math.ceil(dias / 30)} meses`;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0'
        }}>
          📅 Agenda Corporativa
        </h3>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            backgroundColor: loading ? '#f59e0b' : error ? '#ef4444' : '#22c55e',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            {loading ? '⏳ API' : error ? '❌ API' : '✅ API'}
          </span>
          
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              opacity: loading ? 0.5 : 1
            }}
            title="Atualizar eventos"
          >
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <div style={{ color: '#64748b', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <p>Carregando eventos via API...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#ef4444' }}>
          <h4 style={{ marginBottom: '16px' }}>❌ Erro ao carregar eventos</h4>
          <p style={{ marginBottom: '24px', fontSize: '14px' }}>{error}</p>
          <button
            onClick={refetch}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      ) : eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <h4 style={{ marginBottom: '16px' }}>📭 Nenhum evento encontrado para {ticker}</h4>
          <p style={{ marginBottom: '24px' }}>ℹ️ Não há eventos cadastrados para este ticker na API</p>
        </div>
      ) : (
        <div>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#1e40af',
              margin: 0,
              fontWeight: '600'
            }}>
              📊 <strong>{eventos.length}</strong> eventos encontrados para <strong>{ticker}</strong> via API
            </p>
          </div>

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
                      {evento.dataObj.getDate()}
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {evento.dataObj.toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: 'numeric'
                      })}
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

// Dados da Posição Expandidos
const DadosPosicaoExpandidos = React.memo(({ 
  empresa, 
  dadosFinanceiros, 
  precoAtualFormatado,
  isFII = false,
  distanciaPrecoTeto,
  percentualCarteira, 
  carteiraConfig
}) => {
  const precoAtual = dadosFinanceiros?.precoAtual || null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>
          📊 Dados da Posição
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Data de Entrada</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{empresa.dataEntrada}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço de Entrada</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {typeof empresa.precoEntrada === 'number' 
                ? formatCurrency(empresa.precoEntrada, carteiraConfig.moeda)
                : empresa.precoEntrada || 'N/A'
              }
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: dadosFinanceiros?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Atual</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: dadosFinanceiros?.precoAtual ? '#22c55e' : 'inherit' }}>
              {precoAtualFormatado}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>
          🎯 Análise de Viés
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Teto</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {typeof empresa.precoTeto === 'number' 
                ? formatCurrency(empresa.precoTeto, carteiraConfig.moeda)
                : empresa.precoTeto || 'N/A'
              }
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Viés Calculado</span>
            <span style={{
              backgroundColor: (() => {
                const { cor } = calcularVies(empresa.precoTeto, precoAtual, empresa.precoEntrada);
                return cor;
              })(),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {(() => {
                const { vies } = calcularVies(empresa.precoTeto, precoAtual, empresa.precoEntrada);
                return vies;
              })()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>% da Carteira</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{percentualCarteira || 'N/A'}</span>
          </div>
          
          {distanciaPrecoTeto !== null && distanciaPrecoTeto !== undefined && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: distanciaPrecoTeto > 0 ? '#f0f9ff' : '#fef2f2', 
              borderRadius: '8px',
              border: `1px solid ${distanciaPrecoTeto > 0 ? '#bfdbfe' : '#fecaca'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Distância do Teto:
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: distanciaPrecoTeto > 0 ? '#1d4ed8' : '#dc2626'
                }}>
                  {distanciaPrecoTeto > 0 ? '+' : ''}{distanciaPrecoTeto.toFixed(1)}%
                </span>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: '#64748b', 
                margin: '4px 0 0 0',
                fontStyle: 'italic'
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
const HistoricoDividendos = React.memo(({ ticker, dataEntrada, isFII = false }) => {
  const [proventos, setProventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fonte, setFonte] = useState('');
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const carregarProventos = async () => {
      if (!ticker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        let proventosEncontrados = [];
        let fonteAtual = '';

        // Tentar API primeiro
        try {
          const response = await fetch(`/api/proventos/${ticker}`);
          
          if (response.ok) {
            const dadosAPI = await response.json();
            
            if (Array.isArray(dadosAPI) && dadosAPI.length > 0) {
              proventosEncontrados = dadosAPI.map(item => ({
                ...item,
                dataObj: new Date(item.dataObj),
                valorFormatado: item.valorFormatado || `R$ ${item.valor.toFixed(2).replace('.', ',')}`,
                tipo: item.tipo || (isFII ? 'Rendimento' : 'Dividendo')
              }));
              
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
              proventosEncontrados = proventosSalvos.map(item => ({
                ...item,
                dataObj: new Date(item.dataCom || item.data || item.dataObj),
                valorFormatado: item.valorFormatado || `R$ ${(item.valor || 0).toFixed(2).replace('.', ',')}`
              }));
              fonteAtual = 'localStorage';
            } catch (err) {
              console.error('Erro localStorage:', err);
            }
          }
        }

        const proventosValidos = proventosEncontrados.filter(item => 
          item.dataObj && 
          !isNaN(item.dataObj.getTime()) && 
          item.valor && 
          item.valor > 0
        );
        
        proventosValidos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());

        setProventos(proventosValidos);
        setFonte(fonteAtual || 'sem dados');
        setPaginaAtual(1);
        
      } catch (error) {
        console.error('Erro geral:', error);
        setProventos([]);
        setFonte('erro');
      } finally {
        setLoading(false);
      }
    };

    carregarProventos();
  }, [ticker, isFII]);

  const { totalProventos, mediaProvento, ultimoProvento } = useMemo(() => {
    const total = proventos.reduce((sum, item) => sum + (item.valor || 0), 0);
    const media = proventos.length > 0 ? total / proventos.length : 0;
    const ultimo = proventos.length > 0 ? proventos[0] : null;

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

      {loading ? (
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? 'repeat(2, 1fr)' 
              : 'repeat(4, 1fr)', 
            gap: isMobile ? '12px' : '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px',
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '700', 
                color: '#0ea5e9', 
                margin: '0' 
              }}>
                {proventos.length}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px',
                margin: '4px 0 0 0' 
              }}>
                {isMobile ? 'Pagamentos' : 'Nº de Pagamentos'}
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#22c55e', 
                margin: '0' 
              }}>
                R$ {totalProventos.toFixed(2).replace('.', ',')}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Total
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#fefce8', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#eab308', 
                margin: '0' 
              }}>
                R$ {mediaProvento.toFixed(2).replace('.', ',')}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Média
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#fdf4ff', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#a855f7', 
                margin: '0' 
              }}>
                {ultimoProvento ? 
                  ultimoProvento.dataObj.toLocaleDateString('pt-BR').replace(/\/\d{4}/, '') : 'N/A'}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Último
              </p>
            </div>
          </div>

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
              <thead style={{ 
                backgroundColor: '#f8fafc'
              }}>
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
                    style={{ 
                      borderBottom: '1px solid #f1f5f9'
                    }}
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
                      {provento.dataObj?.toLocaleDateString('pt-BR') || 'N/A'}
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

// 🇺🇸➡️🇧🇷 COMPONENTE BDR AMERICANO
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

  const viesBDR = precoTetoBDR && bdrData?.price ? 
    calcularViesBDR(precoTetoBDR, bdrData.price, cotacaoUSD) : null;

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Ativo Original (EUA)</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: '0' }}>
            {ticker}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Mercado Americano
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>BDR Brasileiro</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: '0' }}>
            {bdrCorrespondente}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Negociado na B3
          </p>
        </div>

        {bdrData && bdrData.price && (
          <>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Preço BDR (R$)</h4>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e', margin: '0' }}>
                R$ {bdrData.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Variação BDR</h4>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: (bdrData.changePercent || 0) >= 0 ? '#22c55e' : '#ef4444',
                margin: '0' 
              }}>
                {(bdrData.changePercent || 0) >= 0 ? '+' : ''}{(bdrData.changePercent || 0).toFixed(2)}%
              </p>
            </div>
          </>
        )}

        {cotacaoUSD && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>USD/BRL</h4>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#6366f1', margin: '0' }}>
              R$ {cotacaoUSD.toFixed(2).replace('.', ',')}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Dólar hoje
            </p>
          </div>
        )}
      </div>

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

// ========================================
// COMPONENTE PRINCIPAL
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
  
  // ✅ 1. ESTADOS BÁSICOS PRIMEIRO
  const [ativo, setAtivo] = useState(null);
  const [carteira, setCarteira] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 2. HOOK USD ESPECÍFICO (independente)
  const { cotacaoUSD, loading: loadingUSD, ultimaAtualizacao: atualizacaoUSD, refetch: refetchUSD } = useCotacaoUSD();

  // ✅ 3. HOOKS DE DADOS BÁSICOS (independentes)
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);
  const { dadosFII: dadosFIIHGBrasil, loading: loadingFIIHGBrasil } = useHGBrasilFII(ticker);
  const { dadosHGBrasil, loading: loadingHGBrasil, error: errorHGBrasil } = useHGBrasilAcoes(ticker);
  const { dadosYahoo, loading: loadingYahoo, error: errorYahoo } = useYahooFinanceInternacional(ticker);

  // ✅ 4. VARIÁVEIS BDR (dependem das funções importadas)
  const ehBDREstrangeiro = ticker ? isBDREstrangeiro(ticker) : false;
  const tickerEstrangeiro = ehBDREstrangeiro ? getEstrangeiroFromBDR(ticker) : null;
  const { bdrData, bdrLoading, bdrError, refetchBDR } = useDadosBDR(ehBDREstrangeiro ? ticker : null);

  // NOVA LÓGICA: Se é ticker americano, buscar BDR correspondente
  const bdrCorrespondente = ticker ? getBDRFromAmericano(ticker) : null;
  const temBDR = !!bdrCorrespondente;
  
  // HOOK PARA DADOS DO BDR CORRESPONDENTE
  const { bdrData: bdrDataAPI, bdrLoading: bdrLoadingAPI } = useBDRDataAPI(bdrCorrespondente);

  // ✅ 5. HOOKS INTEGRADOS (após definições BDR)
  const { dy12Meses, dyFormatado, loading: loadingDY, fonte: fonteDY, refetch: refetchDY } = useDividendYieldIntegrado(ticker);
  const { valorProventos, performanceProventos, loading: loadingProventos, fonte: fonteProventos, refetch: refetchProventos } = useProventosIntegrado(ticker, ativo?.dataEntrada || '', ativo?.precoEntrada);
  const { cotacaoCompleta, loading: loadingCotacao, error: errorCotacao, isMobile, deviceDetected } = useCotacaoCompleta(ticker, ehBDREstrangeiro);

  // ✅ 6. FUNÇÕES E OUTRAS LÓGICAS
  const calcularPercentualCarteira = (nomeCarteira) => {
    if (!dados || !dados[nomeCarteira]) return 'N/A';
    
    const ativosCarteira = dados[nomeCarteira];
    const numeroAtivos = Array.isArray(ativosCarteira) ? ativosCarteira.length : 0;
    
    if (numeroAtivos === 0) return '0%';
    
    const percentual = (100 / numeroAtivos).toFixed(1);
    return `${percentual}%`;
  };

  const calcularPercentuaisTodasCarteiras = () => {
    if (!ativo?.multiplePortfolios || !ativo?.portfoliosList) {
      return { [carteira]: calcularPercentualCarteira(carteira) };
    }
    
    const percentuais = {};
    ativo.portfoliosList.forEach(nomeCarteira => {
      percentuais[nomeCarteira] = calcularPercentualCarteira(nomeCarteira);
    });
    
    return percentuais;
  };

  // OBTER PREÇO TETO BDR
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

  // ✅ 7. useEffect (após todas as definições)
  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    if (!dados || Object.keys(dados).length === 0) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
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
    }

    setLoading(false);
  }, [ticker, dados, buscarCotacoes, cotacoes, ehBDREstrangeiro, tickerEstrangeiro, deviceDetected]);

  const calcularPerformance = () => {
    if (!ativo) return { total: 0, acao: 0, proventos: 0, valorProventos: 0 };
    
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
    
    const performanceProventosIntegrada = performanceProventos || 0;
    const valorProventosIntegrado = valorProventos || 0;
    const performanceTotal = performanceAcao + performanceProventosIntegrada;
    
    return {
      total: performanceTotal,
      acao: performanceAcao,
      proventos: performanceProventosIntegrada,
      valorProventos: valorProventosIntegrado
    };
  };

  // Estados de carregamento e erro
  if (loading) {
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
  const performanceData = calcularPerformance();
  const performance = performanceData.total;
  
  const precoAtual = cotacaoCompleta?.regularMarketPrice || 
                    (cotacoes[ticker] && typeof cotacoes[ticker] === 'object' ? cotacoes[ticker].regularMarketPrice : cotacoes[ticker]);

  const distanciaPrecoTeto = (() => {
    if (!ativo.precoTeto || ativo.posicaoEncerrada) {
      return null;
    }
    
    const precoReferencia = precoAtual || ativo.precoEntrada;
    return ((ativo.precoTeto - precoReferencia) / precoReferencia) * 100;
  })();

  const isFII = ativo?.tipo === 'FII';
  const precoAtualFormatado = ativo.posicaoEncerrada && ativo.precoSaida ? 
    formatCurrency(ativo.precoSaida, carteiraConfig.moeda) :
    (precoAtual ? formatCurrency(precoAtual, carteiraConfig.moeda) : formatCurrency(ativo.precoEntrada, carteiraConfig.moeda));

  const percentualCarteira = (() => {
    if (ativo?.multiplePortfolios) {
      const percentuais = calcularPercentuaisTodasCarteiras();
      const principal = percentuais[carteira];
      const outros = Object.entries(percentuais)
        .filter(([nome]) => nome !== carteira)
        .map(([nome, valor]) => `${CARTEIRAS_CONFIG[nome]?.nome || nome}: ${valor}`)
        .join(', ');
      
      return `${principal} (principal)${outros ? ` + ${outros}` : ''}`;
    }
    
    return calcularPercentualCarteira(carteira);
  })();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '24px' 
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
        background: (() => {
          if (isFII) {
            return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
          }
          if (ehBDREstrangeiro) {
            return 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)';
          }
          if (carteira === 'acoes') {
            return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)';
          }
          return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
        })(),
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '32px' }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: '24px',
            alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start'
          }}>
            
            <CompanyAvatar 
              symbol={ticker}
              companyName={getNomeEmpresa(ticker, ativo?.setor || '')}
              size={window.innerWidth <= 768 ? 100 : 120}
            />            
            
            <div style={{ 
              flex: 1, 
              textAlign: window.innerWidth <= 768 ? 'center' : 'left',
              minWidth: 0
            }}>
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: '12px',
                alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <h1 style={{ 
                  fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem', 
                  fontWeight: 700, 
                  margin: 0,
                  color: '#1f2937'
                }}>
                  {ticker}
                </h1>
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{
                    background: carteiraConfig?.color || '#6b7280',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {carteiraConfig?.nome || carteira}
                  </div>
                  
                  {ativo?.multiplePortfolios && (
                    <div style={{
                      background: '#fefce8',
                      color: '#d97706',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
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
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ENCERRADA
                    </div>
                  )}
                </div>
              </div>
              
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.25rem', 
                fontWeight: 600, 
                margin: '0 0 16px 0',
                color: '#374151'
              }}>
                {getNomeEmpresa(ticker, ativo.setor)}
              </h2>
              
              <div style={{
                background: '#e2e8f0',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                {carteiraConfig?.moeda || 'BRL'} • {ativo.setor}
                {isFII && ' • Fundo Imobiliário'}
                {ehBDREstrangeiro && ` • Mercado: ${getMercadoOrigem(tickerEstrangeiro)}`}
              </div>
              
              <p style={{ 
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#4b5563',
                margin: 0,
                maxWidth: '600px'
              }}>
                {getDescricaoEmpresa(ticker, ativo.setor)}
              </p>
              
              {ativo.posicaoEncerrada && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontWeight: 600,
                  marginTop: '16px',
                  fontSize: '14px'
                }}>
                  🔒 Posição encerrada em {ativo.dataSaida}
                </div>
              )}
            </div>
            
            <div style={{ 
              textAlign: window.innerWidth <= 768 ? 'center' : 'right',
              minWidth: window.innerWidth <= 768 ? 'auto' : '200px'
            }}>
              {dadosLoading ? (
                <div style={{ 
                  width: '150px', 
                  height: '60px', 
                  background: '#e2e8f0', 
                  borderRadius: '8px',
                  animation: 'pulse 2s infinite'
                }} />
              ) : (
                <>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '2.5rem' : '3rem', 
                    fontWeight: 700,
                    color: '#1f2937',
                    lineHeight: 1,
                    marginBottom: '8px'
                  }}>
                    {precoAtualFormatado}
                  </div>
                  
                  <div style={{ 
                    color: (() => {
                      if (ativo.posicaoEncerrada) {
                        return performance >= 0 ? '#22c55e' : '#ef4444';
                      }
                      
                      if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
                        return cotacaoCompleta.regularMarketChangePercent >= 0 ? '#22c55e' : '#ef4444';
                      }
                      
                      return performance >= 0 ? '#22c55e' : '#ef4444';
                    })(), 
                    fontWeight: 700, 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {(() => {
                        if (ativo.posicaoEncerrada) {
                          return performance >= 0 ? '▲' : '▼';
                        }
                        
                        if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
                          return cotacaoCompleta.regularMarketChangePercent >= 0 ? '▲' : '▼';
                        }
                        
                        return performance >= 0 ? '↗' : '↘';
                      })()}
                    </span>
                    <span>
                      {(() => {
                        if (ativo.posicaoEncerrada) {
                          return `${Math.abs(performance).toFixed(2)}%`;
                        }
                        
                        if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
                          const variacaoPercent = cotacaoCompleta.regularMarketChangePercent;
                          return `${Math.abs(variacaoPercent).toFixed(2)}%`;
                        }
                        
                        return 'Variação indisponível';
                      })()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Para ativos americanos com BDR disponível */}
      {temBDR && bdrCorrespondente && (
        <BDRAmericanoInfo 
          ticker={ticker}
          bdrCorrespondente={bdrCorrespondente}
          temBDR={temBDR}
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
      {(isFII || ticker.includes('11')) && (
        <FIISpecificCards 
          ticker={ticker}
          dadosFII={dadosFIIHGBrasil}
          loading={loadingFIIHGBrasil}
          isFII={isFII}
        />
      )}

      {/* Grid de Cards de Métricas */}
      {!isFII && !ticker.includes('11') && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            height: '100%'
          }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#64748b',
              margin: '0 0 8px 0',
              textTransform: 'uppercase'
            }}>
              PERFORMANCE TOTAL
            </h4>
            
            {loadingProventos ? (
              <div style={{ color: '#64748b', fontSize: '18px' }}>⏳</div>
            ) : (
              <>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: (performanceData.acao + performanceProventos) >= 0 ? '#22c55e' : '#ef4444',
                  margin: '0 0 4px 0'
                }}>
                  {(performanceData.acao + performanceProventos) >= 0 ? '+' : ''}{(performanceData.acao + performanceProventos).toFixed(2)}%
                </p>
                
                <p style={{
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '0',
                  lineHeight: '1.4'
                }}>
                  Ação: {performanceData.acao.toFixed(1)}% • Proventos: {performanceProventos.toFixed(1)}%
                  <br/>
                  <span style={{ 
                    fontSize: '10px',
                    backgroundColor: fonteProventos === 'API' ? '#22c55e' : fonteProventos === 'localStorage' ? '#f59e0b' : '#6b7280',
                    color: 'white',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    marginTop: '2px',
                    display: 'inline-block'
                  }}>
                    {fonteProventos}
                  </span>
                </p>
              </>
            )}
          </div>    

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
        </div>
      )}

      <ETFHoldings 
        ticker={ticker}
        dadosYahoo={dadosYahoo}
        loading={loadingYahoo}
      />

      {/* Histórico de Dividendos */}
      <HistoricoDividendos ticker={ticker} dataEntrada={ativo.dataEntrada} isFII={isFII} />

      {/* Análises Trimestrais */}
      <AnalisesTrimesestrais ticker={ticker} />

      {/* Relatórios */}
      <GerenciadorRelatorios ticker={ticker} />
      
      {/* Agenda Corporativa */}
      <AgendaCorporativa ticker={ticker} isFII={isFII} />

      {/* Dados da Posição Expandidos */}
      <DadosPosicaoExpandidos 
        empresa={ativo} 
        dadosFinanceiros={dadosFinanceiros}
        precoAtualFormatado={precoAtualFormatado}
        isFII={isFII}
        distanciaPrecoTeto={distanciaPrecoTeto}
        percentualCarteira={percentualCarteira}
        carteiraConfig={carteiraConfig}
      />
    </div>
  );
}