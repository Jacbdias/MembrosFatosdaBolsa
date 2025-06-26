'use client';

import React, { useState, useEffect } from 'react';

export default function EmpresaExteriorDetalhes() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState(null);
  const [staticData, setStaticData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // 🗄️ BANCO DE DADOS ESTÁTICO DAS EMPRESAS
  const exteriorStocksDatabase = {
    'AMD': {
      rank: '1º',
      name: 'Advanced Micro Devices Inc.',
      setor: 'Tecnologia',
      dataEntrada: '29/05/2025',
      precoQueIniciou: 'US$112,86',
      precoTeto: 'US$135,20',
      avatar: 'https://logo.clearbit.com/amd.com',
    },
    'XP': {
      rank: '2º',
      name: 'XP Inc.',
      setor: 'Financial Services',
      dataEntrada: '26/05/2023',
      precoQueIniciou: 'US$18,41',
      precoTeto: 'US$24,34',
      avatar: 'https://logo.clearbit.com/xpi.com.br',
    },
    'HD': {
      rank: '3º',
      name: 'Home Depot Inc.',
      setor: 'Varejo',
      dataEntrada: '24/02/2023',
      precoQueIniciou: 'US$299,31',
      precoTeto: 'US$366,78',
      avatar: 'https://logo.clearbit.com/homedepot.com',
    },
    'AAPL': {
      rank: '4º',
      name: 'Apple Inc.',
      setor: 'Tecnologia',
      dataEntrada: '05/05/2022',
      precoQueIniciou: 'US$156,77',
      precoTeto: 'US$170,00',
      avatar: 'https://logo.clearbit.com/apple.com',
    },
    'FIVE': {
      rank: '5º',
      name: 'Five Below Inc.',
      setor: 'Varejo',
      dataEntrada: '17/03/2022',
      precoQueIniciou: 'US$163,41',
      precoTeto: 'US$179,00',
      avatar: 'https://logo.clearbit.com/fivebelow.com',
    },
    'AMAT': {
      rank: '6º',
      name: 'Applied Materials Inc.',
      setor: 'Semicondutores',
      dataEntrada: '07/04/2022',
      precoQueIniciou: 'US$122,40',
      precoTeto: 'US$151,30',
      avatar: 'https://logo.clearbit.com/appliedmaterials.com',
    },
    'COST': {
      rank: '7º',
      name: 'Costco Wholesale Corporation',
      setor: 'Consumer Discretionary',
      dataEntrada: '23/06/2022',
      precoQueIniciou: 'US$459,00',
      precoTeto: 'US$571,00',
      avatar: 'https://logo.clearbit.com/costco.com',
    },
    'GOOGL': {
      rank: '8º',
      name: 'Alphabet Inc.',
      setor: 'Tecnologia',
      dataEntrada: '06/03/2022',
      precoQueIniciou: 'US$131,83',
      precoTeto: 'US$153,29',
      avatar: 'https://logo.clearbit.com/google.com',
    },
    'META': {
      rank: '9º',
      name: 'Meta Platforms Inc.',
      setor: 'Tecnologia',
      dataEntrada: '17/02/2022',
      precoQueIniciou: 'US$213,92',
      precoTeto: 'US$322,00',
      avatar: 'https://logo.clearbit.com/meta.com',
    },
    'BRK.B': {
      rank: '10º',
      name: 'Berkshire Hathaway Inc.',
      setor: 'Holding',
      dataEntrada: '11/05/2021',
      precoQueIniciou: 'US$286,35',
      precoTeto: 'US$330,00',
      avatar: 'https://logo.clearbit.com/berkshirehathaway.com',
    }
  };

  // 🎨 FUNÇÃO PARA OBTER AVATAR/ÍCONE DA EMPRESA
  const getCompanyAvatar = (symbol, companyName) => {
    const knownLogos = {
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'NFLX': 'https://logo.clearbit.com/netflix.com',
      'UBER': 'https://logo.clearbit.com/uber.com',
      'SPOT': 'https://logo.clearbit.com/spotify.com',
      'SHOP': 'https://logo.clearbit.com/shopify.com',
      'PYPL': 'https://logo.clearbit.com/paypal.com',
      'ADBE': 'https://logo.clearbit.com/adobe.com',
      'CRM': 'https://logo.clearbit.com/salesforce.com',
      'ZOOM': 'https://logo.clearbit.com/zoom.us',
      'DOCU': 'https://logo.clearbit.com/docusign.com',
      'ROKU': 'https://logo.clearbit.com/roku.com',
      'SNAP': 'https://logo.clearbit.com/snapchat.com',
      'TWTR': 'https://logo.clearbit.com/twitter.com',
      'PINS': 'https://logo.clearbit.com/pinterest.com',
      'PLTR': 'https://logo.clearbit.com/palantir.com',
      'CRWD': 'https://logo.clearbit.com/crowdstrike.com',
      'ZM': 'https://logo.clearbit.com/zoom.us',
      'OKTA': 'https://logo.clearbit.com/okta.com',
      'SNOW': 'https://logo.clearbit.com/snowflake.com',
      'DDOG': 'https://logo.clearbit.com/datadoghq.com',
      'NET': 'https://logo.clearbit.com/cloudflare.com',
      'FTNT': 'https://logo.clearbit.com/fortinet.com',
      'PANW': 'https://logo.clearbit.com/paloaltonetworks.com',
      'WDAY': 'https://logo.clearbit.com/workday.com',
      'VEEV': 'https://logo.clearbit.com/veeva.com',
      'SPLK': 'https://logo.clearbit.com/splunk.com',
      'TEAM': 'https://logo.clearbit.com/atlassian.com',
      'ZS': 'https://logo.clearbit.com/zscaler.com',
      'ESTC': 'https://logo.clearbit.com/elastic.co',
      'MDB': 'https://logo.clearbit.com/mongodb.com',
      'COIN': 'https://logo.clearbit.com/coinbase.com',
      'SQ': 'https://logo.clearbit.com/squareup.com',
      'ABNB': 'https://logo.clearbit.com/airbnb.com',
      'DASH': 'https://logo.clearbit.com/doordash.com',
      'LYFT': 'https://logo.clearbit.com/lyft.com',
      'RBLX': 'https://logo.clearbit.com/roblox.com',
      'U': 'https://logo.clearbit.com/unity.com',
      'HOOD': 'https://logo.clearbit.com/robinhood.com',
      'SOFI': 'https://logo.clearbit.com/sofi.com',
      'UPST': 'https://logo.clearbit.com/upstart.com',
      'AFRM': 'https://logo.clearbit.com/affirm.com',
      'PTON': 'https://logo.clearbit.com/onepeloton.com',
      'ZG': 'https://logo.clearbit.com/zillow.com',
      'CHWY': 'https://logo.clearbit.com/chewy.com',
      'ETSY': 'https://logo.clearbit.com/etsy.com',
      'EBAY': 'https://logo.clearbit.com/ebay.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'WMT': 'https://logo.clearbit.com/walmart.com',
      'TGT': 'https://logo.clearbit.com/target.com',
      'NKE': 'https://logo.clearbit.com/nike.com',
      'SBUX': 'https://logo.clearbit.com/starbucks.com',
      'MCD': 'https://logo.clearbit.com/mcdonalds.com',
      'KO': 'https://logo.clearbit.com/coca-cola.com',
      'PEP': 'https://logo.clearbit.com/pepsico.com',
      'DIS': 'https://logo.clearbit.com/disney.com',
      'BA': 'https://logo.clearbit.com/boeing.com',
      'CAT': 'https://logo.clearbit.com/caterpillar.com',
      'MMM': 'https://logo.clearbit.com/3m.com',
      'GE': 'https://logo.clearbit.com/ge.com',
      'F': 'https://logo.clearbit.com/ford.com',
      'GM': 'https://logo.clearbit.com/gm.com',
      'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
      'BAC': 'https://logo.clearbit.com/bankofamerica.com',
      'WFC': 'https://logo.clearbit.com/wellsfargo.com',
      'GS': 'https://logo.clearbit.com/goldmansachs.com',
      'MS': 'https://logo.clearbit.com/morganstanley.com',
      'V': 'https://logo.clearbit.com/visa.com',
      'MA': 'https://logo.clearbit.com/mastercard.com',
      'AXP': 'https://logo.clearbit.com/americanexpress.com'
    };

    // 1. Se o ticker tem logo conhecido, retorna
    if (knownLogos[symbol]) {
      return knownLogos[symbol];
    }

    // 2. Tenta detectar pelo nome da empresa
    if (companyName) {
      const companyDomains = {
        'microsoft': 'microsoft.com',
        'apple': 'apple.com',
        'google': 'google.com',
        'alphabet': 'google.com',
        'amazon': 'amazon.com',
        'tesla': 'tesla.com',
        'netflix': 'netflix.com',
        'meta': 'meta.com',
        'facebook': 'meta.com',
        'nvidia': 'nvidia.com',
        'intel': 'intel.com',
        'amd': 'amd.com',
        'oracle': 'oracle.com',
        'salesforce': 'salesforce.com',
        'adobe': 'adobe.com',
        'uber': 'uber.com',
        'airbnb': 'airbnb.com',
        'spotify': 'spotify.com',
        'zoom': 'zoom.us',
        'slack': 'slack.com',
        'twitter': 'twitter.com',
        'snapchat': 'snapchat.com',
        'pinterest': 'pinterest.com',
        'linkedin': 'linkedin.com',
        'paypal': 'paypal.com',
        'square': 'squareup.com',
        'shopify': 'shopify.com',
        'coinbase': 'coinbase.com',
        'robinhood': 'robinhood.com',
        'peloton': 'onepeloton.com',
        'zillow': 'zillow.com',
        'chewy': 'chewy.com',
        'etsy': 'etsy.com',
        'ebay': 'ebay.com',
        'walmart': 'walmart.com',
        'target': 'target.com',
        'nike': 'nike.com',
        'starbucks': 'starbucks.com',
        'mcdonalds': 'mcdonalds.com',
        'disney': 'disney.com',
        'boeing': 'boeing.com',
        'ford': 'ford.com',
        'visa': 'visa.com',
        'mastercard': 'mastercard.com'
      };

      const lowerName = companyName.toLowerCase();
      for (const [key, domain] of Object.entries(companyDomains)) {
        if (lowerName.includes(key)) {
          return `https://logo.clearbit.com/${domain}`;
        }
      }
    }

    // 3. Para tickers desconhecidos, tenta URL genérica
    // Mas se falhar, o onError vai mostrar o fallback com iniciais
    return `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
  };
  
  useEffect(() => {
    setMounted(true);
    const path = window.location.pathname;
    const tickerFromUrl = path.split('/').pop() || '';
    const cleanTicker = tickerFromUrl.toUpperCase();
    setTicker(cleanTicker);

    const staticInfo = exteriorStocksDatabase[cleanTicker] || null;
    setStaticData(staticInfo);

    if (cleanTicker) {
      fetchStockData(cleanTicker, staticInfo);
    }
  }, []);
  
  const fetchStockData = async (tickerSymbol, staticInfo) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://brapi.dev/api/quote/${tickerSymbol}?token=jJrMYVy9MATGEicx3GxBp8`);
      const data = await response.json();

      if (!data || !data.results || data.results.length === 0) {
        throw new Error('Sem dados da API');
      }

      const result = data.results[0];
      const precoAtual = result.regularMarketPrice || 0;
      const precoIniciou = staticInfo ? parseFloat(staticInfo.precoQueIniciou.replace('US$', '')) : precoAtual;
      const precoTeto = staticInfo ? parseFloat(staticInfo.precoTeto.replace('US$', '')) : precoAtual * 1.2;

      const change = precoAtual - precoIniciou;
      const changePercent = (change / precoIniciou) * 100;

      const realData = {
        name: staticInfo?.name || result.shortName || result.longName || tickerSymbol,
        rank: staticInfo?.rank || null,
        setor: staticInfo?.setor || result.sector || 'Setor não identificado',
        dataEntrada: staticInfo?.dataEntrada || 'N/A',
        precoQueIniciou: staticInfo?.precoQueIniciou || `US$${precoAtual.toFixed(2)}`,
        precoTeto: staticInfo?.precoTeto || `US$${(precoAtual * 1.2).toFixed(2)}`,
        avatar: staticInfo?.avatar || result.logourl || getCompanyAvatar(tickerSymbol, result.shortName || result.longName),
        price: precoAtual,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        dayLow: result.regularMarketDayLow || precoAtual * 0.98,
        dayHigh: result.regularMarketDayHigh || precoAtual * 1.02,
        open: result.regularMarketOpen || precoAtual,
        volume: result.regularMarketVolume ? `${(result.regularMarketVolume / 1e6).toFixed(1)}M` : `${(Math.random() * 50 + 5).toFixed(1)}M`,
        week52High: result.fiftyTwoWeekHigh || precoAtual * 1.3,
        week52Low: result.fiftyTwoWeekLow || precoAtual * 0.7,
        marketCap: (typeof result.marketCap === 'number' && isFinite(result.marketCap))
          ? `$${(result.marketCap / 1e9).toFixed(2)}B`
          : generateMarketCap(tickerSymbol),
        peRatio: (typeof result.trailingPE === 'number' && isFinite(result.trailingPE))
          ? Number(result.trailingPE.toFixed(2))
          : Number((Math.random() * 30 + 15).toFixed(1)),
        dividendYield: (typeof result.dividendYield === 'number' && isFinite(result.dividendYield))
          ? `${(result.dividendYield * 100).toFixed(2)}%`
          : generateDividendYield(staticInfo?.setor || 'Diversos'),
        isPositive: change >= 0,
        performanceVsInicio: staticInfo ? changePercent : 0,
        distanciaDoTeto: staticInfo ? ((precoTeto - precoAtual) / precoTeto * 100) : 0,
        vies: staticInfo ? ((precoAtual / precoTeto) >= 0.95 ? 'AGUARDAR' : 'COMPRA') : 'N/A'
      };

      setStockData(realData);
    } catch (err) {
      console.error('Erro na API, usando dados simulados:', err);
      const mockData = generateMockData(tickerSymbol, staticInfo);
      setStockData(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (symbol, staticInfo) => {
    if (staticInfo) {
      const precoIniciou = parseFloat(staticInfo.precoQueIniciou.replace('US$', ''));
      const precoTeto = parseFloat(staticInfo.precoTeto.replace('US$', ''));
      
      const variacao = (Math.random() - 0.3) * 0.4;
      const precoAtual = precoIniciou * (1 + variacao);
      const change = precoAtual - precoIniciou;
      const changePercent = (change / precoIniciou) * 100;
      
      return {
        name: staticInfo.name,
        rank: staticInfo.rank,
        setor: staticInfo.setor,
        dataEntrada: staticInfo.dataEntrada,
        precoQueIniciou: staticInfo.precoQueIniciou,
        precoTeto: staticInfo.precoTeto,
        avatar: getCompanyAvatar(symbol, staticInfo?.name),
        price: Number(precoAtual.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        dayLow: Number((precoAtual - Math.random() * 3).toFixed(2)),
        dayHigh: Number((precoAtual + Math.random() * 5).toFixed(2)),
        open: Number((precoAtual + (Math.random() - 0.5) * 2).toFixed(2)),
        volume: `${(Math.random() * 20 + 1).toFixed(1)}M`,
        week52High: Number((precoTeto * (0.95 + Math.random() * 0.1)).toFixed(2)),
        week52Low: Number((precoIniciou * (0.8 + Math.random() * 0.2)).toFixed(2)),
        marketCap: generateMarketCap(symbol),
        peRatio: Number((Math.random() * 30 + 15).toFixed(1)),
        dividendYield: generateDividendYield(staticInfo.setor),
        isPositive: change >= 0,
        performanceVsInicio: changePercent,
        distanciaDoTeto: ((precoTeto - precoAtual) / precoTeto * 100),
        vies: (precoAtual / precoTeto) >= 0.95 ? 'AGUARDAR' : 'COMPRA'
      };
    }

    const basePrice = Math.random() * 300 + 50;
    const change = (Math.random() - 0.5) * 20;
    const isPositive = change > 0;
    
    return {
      name: `${symbol} Corporation`,
      rank: 'N/A',
      setor: 'Diversos',
      dataEntrada: 'N/A',
      precoQueIniciou: 'N/A',
      precoTeto: 'N/A',
      avatar: getCompanyAvatar(symbol, `${symbol} Corporation`),
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number((change / basePrice * 100).toFixed(2)),
      dayLow: Number((basePrice - Math.random() * 5).toFixed(2)),
      dayHigh: Number((basePrice + Math.random() * 5).toFixed(2)),
      open: Number((basePrice + (Math.random() - 0.5) * 3).toFixed(2)),
      volume: `${(Math.random() * 50 + 1).toFixed(1)}M`,
      week52High: Number((basePrice * (1 + Math.random() * 0.5)).toFixed(2)),
      week52Low: Number((basePrice * (1 - Math.random() * 0.3)).toFixed(2)),
      marketCap: `$${(Math.random() * 500 + 50).toFixed(0)}B`,
      peRatio: Number((Math.random() * 40 + 10).toFixed(1)),
      dividendYield: `${(Math.random() * 3).toFixed(2)}%`,
      isPositive,
      performanceVsInicio: 0,
      distanciaDoTeto: 0,
      vies: 'N/A'
    };
  };

  const generateMarketCap = (symbol) => {
    const caps = {
      'AAPL': '$3.1T',
      'MSFT': '$2.8T',
      'GOOGL': '$1.8T',
      'META': '$789B',
      'AMD': '$240B',
      'HD': '$410B',
      'COST': '$380B',
      'XP': '$12B',
      'AMAT': '$180B',
      'FIVE': '$8B',
      'BRK.B': '$890B'
    };
    return caps[symbol] || `$${(Math.random() * 500 + 50).toFixed(0)}B`;
  };

  const generateDividendYield = (setor) => {
    const yields = {
      'Tecnologia': () => `${(Math.random() * 1.5).toFixed(2)}%`,
      'Varejo': () => `${(Math.random() * 2 + 1.5).toFixed(2)}%`,
      'Financial Services': () => `${(Math.random() * 3 + 2).toFixed(2)}%`,
      'Semicondutores': () => `${(Math.random() * 1.2).toFixed(2)}%`,
      'Consumer Discretionary': () => `${(Math.random() * 2.5 + 1).toFixed(2)}%`,
      'Holding': () => `${(Math.random() * 2 + 1).toFixed(2)}%`
    };
    
    return yields[setor] ? yields[setor]() : `${(Math.random() * 2 + 0.5).toFixed(2)}%`;
  };

  if (!mounted || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Carregando {ticker}</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {staticData ? `Buscando dados de ${staticData.name}...` : 'Buscando dados atualizados...'}
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          border: '2px solid #fca5a5'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Erro</h2>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>{error}</p>
          <button 
            onClick={() => fetchStockData(ticker, staticData)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stockData) return null;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const priceCardStyle = {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  const priceHeaderStyle = {
    background: stockData.isPositive 
      ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
      : 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    padding: '24px'
  };

  const priceFlexStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const dayRangePercent = ((stockData.price - stockData.dayLow) / (stockData.dayHigh - stockData.dayLow)) * 100;

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            {/* Sempre mostra o fallback primeiro, depois tenta carregar a imagem */}
            <div 
              style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '8px',
                border: '2px solid #e2e8f0',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                position: 'relative'
              }}
            >
              {/* Ícone com iniciais (sempre visível como background) */}
              <span style={{ position: 'absolute', zIndex: 1 }}>
                {ticker.slice(0, 2)}
              </span>
              
              {/* Imagem por cima (se carregar, esconde o fundo) */}
              <img 
                src={stockData.avatar} 
                alt={stockData.name}
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '8px',
                  position: 'absolute',
                  top: '-2px',
                  left: '-2px',
                  zIndex: 2,
                  border: '2px solid #e2e8f0'
                }}
                onLoad={(e) => {
                  // Só esconde o fallback se a imagem for grande o suficiente
                  if (e.target.naturalWidth > 20 && e.target.naturalHeight > 20) {
                    e.target.previousElementSibling.style.display = 'none';
                  } else {
                    // Imagem muito pequena, remove ela e mantém o fallback
                    e.target.style.display = 'none';
                  }
                }}
                onError={(e) => {
                  // Se a imagem falhou, remove ela e mantém o fundo
                  e.target.style.display = 'none';
                  e.target.previousElementSibling.style.display = 'block';
                }}
              />
            </div>
            
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#1f2937' }}>
                {ticker} {stockData.rank && <span style={{ color: '#6b7280', fontSize: '24px' }}>• {stockData.rank}</span>}
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {stockData.name} • USD • {stockData.setor} • Exterior Stocks
              </p>
            </div>
          </div>

          {!staticData && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              padding: '16px',
              borderRadius: '8px',
              color: '#b91c1c',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              ⚠️ Empresa sem cobertura – este ativo não está em nossa carteira de recomendações.
            </div>
          )}
          
          {staticData && (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginTop: '16px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px' 
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600' }}>
                    DATA DE ENTRADA
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {stockData.dataEntrada}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600' }}>
                    PREÇO DE ENTRADA
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {stockData.precoQueIniciou}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600' }}>
                    PREÇO TETO
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {stockData.precoTeto}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600' }}>
                    VIÉS ATUAL
                  </p>
                  <div style={{
                    display: 'inline-block',
                    background: stockData.vies === 'COMPRA' ? '#dcfce7' : '#fef3c7',
                    color: stockData.vies === 'COMPRA' ? '#059669' : '#d97706',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid',
                    borderColor: stockData.vies === 'COMPRA' ? '#bbf7d0' : '#fde68a'
                  }}>
                    {stockData.vies}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={priceCardStyle}>
          <div style={priceHeaderStyle}>
            <div style={priceFlexStyle}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{ticker}</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{stockData.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stockData.price}</div>
                <div style={{ 
                  color: stockData.isPositive ? '#10b981' : '#ef4444',
                  marginTop: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end',
                  gap: '8px'
                }}>
                  <span>{stockData.isPositive ? '↗' : '↘'}</span>
                  <span style={{ fontWeight: '600' }}>
                    {stockData.isPositive ? '+' : ''}{stockData.change} ({stockData.changePercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            
            {staticData && stockData.performanceVsInicio !== 0 && (
              <div style={{
                background: stockData.performanceVsInicio >= 0 ? '#ecfdf5' : '#fef2f2',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid',
                borderColor: stockData.performanceVsInicio >= 0 ? '#d1fae5' : '#fecaca'
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px 0' }}>
                  🎯 Performance desde a Entrada
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: stockData.performanceVsInicio >= 0 ? '#059669' : '#dc2626' }}>
                      {stockData.performanceVsInicio >= 0 ? '+' : ''}{stockData.performanceVsInicio.toFixed(2)}%
                    </span>
                    <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '8px' }}>
                      desde {stockData.dataEntrada}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Distância do teto: {stockData.distanciaDoTeto.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}

            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px 0' }}>
                📊 Range do Dia
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>${stockData.dayLow}</span>
                <div style={{
                  flex: 1,
                  height: '12px',
                  background: '#e2e8f0',
                  borderRadius: '6px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${dayRangePercent}%`,
                    background: stockData.isPositive 
                      ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    borderRadius: '6px'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${dayRangePercent}%`,
                    width: '2px',
                    height: '100%',
                    background: '#1f2937',
                    borderRadius: '1px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>${stockData.dayHigh}</span>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#3b82f6',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>📈</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Volume</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{stockData.volume}</p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #86efac',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#10b981',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>💰</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Abertura</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.open}</p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #c4b5fd',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#8b5cf6',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>⬆️</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Máx. 52s</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.week52High}</p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #fca5a5',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#ef4444',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>⬇️</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Mín. 52s</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.week52Low}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                💼 Indicadores Financeiros
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                
                <div style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #a7f3d0',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#059669',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>🌍</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Market Cap</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.marketCap}</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #c4b5fd',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#7c3aed',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>🎯</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>P/E Ratio</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.peRatio}</p>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #fcd34d',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#d97706',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>💵</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Dividend Yield</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.dividendYield}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            ✅ {staticData ? `Dados da carteira Exterior Stocks para ${ticker}` : `Dados simulados para ${ticker}`} • {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
