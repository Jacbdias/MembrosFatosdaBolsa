'use client';

import React, { useState, useEffect } from 'react';

// 🔥 HOOK PARA BUSCAR DADOS REAIS DOS BDRs
function useBDRDataAPI(bdrTicker) {
  const [bdrData, setBDRData] = React.useState(null);
  const [bdrLoading, setBDRLoading] = React.useState(true);

  const fetchBDRData = React.useCallback(async () => {
    if (!bdrTicker) {
      setBDRLoading(false);
      return;
    }

    try {
      console.log(`🇧🇷 Buscando cotação do BDR: ${bdrTicker}...`);
      
      const response = await fetch(`https://brapi.dev/api/quote/${bdrTicker}?token=jJrMYVy9MATGEicx3GxBp8`);
      const data = await response.json();

      if (data?.results?.[0]) {
        const result = data.results[0];
        setBDRData({
          symbol: result.symbol,
          price: result.regularMarketPrice,
          change: result.regularMarketChange,
          changePercent: result.regularMarketChangePercent
        });
        console.log(`✅ BDR ${bdrTicker}: R$ ${result.regularMarketPrice}`);
      }
    } catch (err) {
      console.error(`❌ Erro BDR ${bdrTicker}:`, err);
    } finally {
      setBDRLoading(false);
    }
  }, [bdrTicker]);

  React.useEffect(() => {
    fetchBDRData();
  }, [fetchBDRData]);

  return { bdrData, bdrLoading };
}

export default function EmpresaExteriorDetalhes() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState(null);
  const [staticData, setStaticData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [apiData, setApiData] = useState({ stocks: [], dividends: [] });
  
  // 🇧🇷 Buscar dados do BDR se existir
  const { bdrData, bdrLoading } = useBDRDataAPI(staticData?.bdr);
  
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
    tipo: 'STOCK',
    bdr: 'A1MD34',
    bdrTeto: 'R$ 93,20'
  },
  'XP': {
    rank: '2º',
    name: 'XP Inc.',
    setor: 'Financial Services',
    dataEntrada: '26/05/2023',
    precoQueIniciou: 'US$18,41',
    precoTeto: 'US$24,34',
    avatar: 'https://logo.clearbit.com/xpi.com.br',
    tipo: 'STOCK',
    bdr: 'XPBR31',
    bdrTeto: 'R$ 119,00'
  },
  'HD': {
    rank: '3º',
    name: 'Home Depot Inc.',
    setor: 'Varejo',
    dataEntrada: '24/02/2023',
    precoQueIniciou: 'US$299,31',
    precoTeto: 'US$366,78',
    avatar: 'https://logo.clearbit.com/homedepot.com',
    tipo: 'STOCK',
    bdr: 'HOME34',
    bdrTeto: 'R$ 65,88'
  },
  'AAPL': {
    rank: '4º',
    name: 'Apple Inc.',
    setor: 'Tecnologia',
    dataEntrada: '05/05/2022',
    precoQueIniciou: 'US$156,77',
    precoTeto: 'US$170,00',
    avatar: 'https://logo.clearbit.com/apple.com',
    tipo: 'STOCK',
    bdr: 'AAPL34',
    bdrTeto: 'R$ 42,39'
  },
  'FIVE': {
    rank: '5º',
    name: 'Five Below Inc.',
    setor: 'Varejo',
    dataEntrada: '17/03/2022',
    precoQueIniciou: 'US$163,41',
    precoTeto: 'US$179,00',
    avatar: 'https://logo.clearbit.com/fivebelow.com',
    tipo: 'STOCK'
  },
  'AMAT': {
    rank: '6º',
    name: 'Applied Materials Inc.',
    setor: 'Semicondutores',
    dataEntrada: '07/04/2022',
    precoQueIniciou: 'US$122,40',
    precoTeto: 'US$151,30',
    avatar: 'https://logo.clearbit.com/appliedmaterials.com',
    tipo: 'STOCK',
    bdr: 'A1MT34',
    bdrTeto: 'R$ 74,00'
  },
  'COST': {
    rank: '7º',
    name: 'Costco Wholesale Corporation',
    setor: 'Consumer Discretionary',
    dataEntrada: '23/06/2022',
    precoQueIniciou: 'US$459,00',
    precoTeto: 'US$571,00',
    avatar: 'https://logo.clearbit.com/costco.com',
    tipo: 'STOCK',
    bdr: 'COWC34',
    bdrTeto: 'R$ 71,91'
  },
  'GOOGL': {
    rank: '8º',
    name: 'Alphabet Inc.',
    setor: 'Tecnologia',
    dataEntrada: '06/03/2022',
    precoQueIniciou: 'US$131,83',
    precoTeto: 'US$153,29',
    avatar: 'https://logo.clearbit.com/google.com',
    tipo: 'STOCK',
    bdr: 'GOGL34',
    bdrTeto: 'R$ 54,60'
  },
  'META': {
    rank: '9º',
    name: 'Meta Platforms Inc.',
    setor: 'Tecnologia',
    dataEntrada: '17/02/2022',
    precoQueIniciou: 'US$213,92',
    precoTeto: 'US$322,00',
    avatar: 'https://logo.clearbit.com/meta.com',
    tipo: 'STOCK',
    bdr: 'M1TA34',
    bdrTeto: 'R$ 54,45'
  },
  'BRK-B': {
    rank: '10º',
    name: 'Berkshire Hathaway Inc.',
    setor: 'Holding',
    dataEntrada: '11/05/2021',
    precoQueIniciou: 'US$286,35',
    precoTeto: 'US$330,00',
    avatar: 'https://logo.clearbit.com/berkshirehathaway.com',
    tipo: 'STOCK',
    bdr: 'BERK34',
    bdrTeto: 'R$ 71,34'
  }
};
  
  // 🗄️ BANCO DE DADOS ESTÁTICO DOS DIVIDENDOS INTERNACIONAIS
const exteriorDividendsDatabase = {
  'OXY': {
    rank: '1º',
    name: 'Occidental Petroleum Corporation',
    setor: 'STOCK - Petroleum',
    dataEntrada: '14/04/2023',
    precoQueIniciou: 'US$37,92',
    precoTeto: 'US$60,10',
    avatar: 'https://logo.clearbit.com/oxy.com',
    tipo: 'DIVIDEND',
    dy: '2,34%',
    bdr: 'OXYP34',
    bdrTeto: 'R$ 58,54'
  },
  'ADC': {
    rank: '2º',
    name: 'Agree Realty Corporation',
    setor: 'REIT - Net Lease',
    dataEntrada: '15/03/2023',
    precoQueIniciou: 'US$58,25',
    precoTeto: 'US$72,80',
    avatar: 'https://logo.clearbit.com/agreerealty.com',
    tipo: 'DIVIDEND',
    dy: '4,12%'
    // Não tem BDR disponível
  },
  'VZ': {
    rank: '3º',
    name: 'Verizon Communications Inc.',
    setor: 'Stock - Telecom',
    dataEntrada: '28/03/2022',
    precoQueIniciou: 'US$51,17',
    precoTeto: 'US$51,12',
    avatar: 'https://logo.clearbit.com/verizon.com',
    tipo: 'DIVIDEND',
    dy: '6,57%',
    bdr: 'VERZ34',
    bdrTeto: 'R$ 44,39'
  },
  'O': {
    rank: '4º',
    name: 'Realty Income Corporation',
    setor: 'REIT - Net Lease',
    dataEntrada: '01/02/2024',
    precoQueIniciou: 'US$54,39',
    precoTeto: 'US$58,91',
    avatar: 'https://logo.clearbit.com/realtyincome.com',
    tipo: 'DIVIDEND',
    dy: '6,13%',
    bdr: 'R1IN34',
    bdrTeto: 'R$ 146,30'
  },
  'AVB': {
    rank: '5º',
    name: 'AvalonBay Communities Inc.',
    setor: 'REIT - Apartamentos',
    dataEntrada: '10/02/2022',
    precoQueIniciou: 'US$242,00',
    precoTeto: 'US$340,00',
    avatar: 'https://logo.clearbit.com/avalonbay.com',
    tipo: 'DIVIDEND',
    dy: '3,96%',
    bdr: 'A1VB34',
    bdrTeto: 'R$ 445,86'
  },
  'STAG': {
    rank: '6º',
    name: 'Stag Industrial Inc.',
    setor: 'REIT - Industrial',
    dataEntrada: '24/03/2022',
    precoQueIniciou: 'US$40,51',
    precoTeto: 'US$42,87',
    avatar: 'https://logo.clearbit.com/stagindustrial.com',
    tipo: 'DIVIDEND',
    dy: '4,55%',
    bdr: 'S2TA34',
    bdrTeto: 'R$ 44,06'
  }
};
  
  // 🗄️ BANCO DE DADOS ESTÁTICO DOS ETFs INTERNACIONAIS
const exteriorETFsDatabase = {
  'VOO': {
    rank: '1º',
    name: 'Vanguard S&P 500 ETF',
    setor: 'Large Cap',
    dataEntrada: '03/06/2021',
    precoQueIniciou: 'US$383,95',
    precoTeto: 'US$520,00',
    avatar: 'https://logo.clearbit.com/vanguard.com',
    tipo: 'ETF',
    dy: '1,32%'
  },
  'IJS': {
    rank: '2º',
    name: 'iShares Core S&P Small-Cap ETF',
    setor: 'Small Caps',
    dataEntrada: '21/07/2021',
    precoQueIniciou: 'US$100,96',
    precoTeto: 'US$125,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '1,85%'
  },
  'QUAL': {
    rank: '3º',
    name: 'iShares MSCI USA Quality Factor ETF',
    setor: 'Total Market',
    dataEntrada: '11/06/2021',
    precoQueIniciou: 'US$130,13',
    precoTeto: 'US$170,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '1,45%'
  },
  'QQQ': {
    rank: '4º',
    name: 'Invesco QQQ Trust ETF',
    setor: 'Large Cap',
    dataEntrada: '09/06/2021',
    precoQueIniciou: 'US$337,18',
    precoTeto: 'US$495,00',
    avatar: 'https://logo.clearbit.com/invesco.com',
    tipo: 'ETF',
    dy: '0,68%'
  },
  'VNQ': {
    rank: '5º',
    name: 'Vanguard Real Estate ETF',
    setor: 'Real Estate (USA)',
    dataEntrada: '12/07/2021',
    precoQueIniciou: 'US$105,96',
    precoTeto: 'US$115,00',
    avatar: 'https://logo.clearbit.com/vanguard.com',
    tipo: 'ETF',
    dy: '3,85%'
  },
  'SCHP': {
    rank: '6º',
    name: 'Schwab U.S. TIPS ETF',
    setor: 'Renda Fixa',
    dataEntrada: '22/11/2021',
    precoQueIniciou: 'US$63,14',
    precoTeto: 'US$67,00',
    avatar: 'https://logo.clearbit.com/schwab.com',
    tipo: 'ETF',
    dy: '3,25%'
  },
  'IAU': {
    rank: '7º',
    name: 'iShares Gold Trust ETF',
    setor: 'Ouro',
    dataEntrada: '07/06/2021',
    precoQueIniciou: 'US$36,04',
    precoTeto: 'US$45,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '0,00%'
  },
  'HERO': {
    rank: '8º',
    name: 'Global X Video Games & Esports ETF',
    setor: 'Games',
    dataEntrada: '15/07/2021',
    precoQueIniciou: 'US$31,28',
    precoTeto: 'US$35,00',
    avatar: 'https://logo.clearbit.com/globalxetfs.com',
    tipo: 'ETF',
    dy: '0,00%'
  },
  'SOXX': {
    rank: '9º',
    name: 'iShares Semiconductor ETF',
    setor: 'Semicondutores',
    dataEntrada: '04/08/2021',
    precoQueIniciou: 'US$156,03',
    precoTeto: 'US$250,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '1,12%'
  },
  'MCHI': {
    rank: '10º',
    name: 'iShares MSCI China ETF',
    setor: 'Empresas Chinesas',
    dataEntrada: '01/02/2023',
    precoQueIniciou: 'US$53,58',
    precoTeto: 'US$60,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '2,45%'
  },
  'TFLO': {
    rank: '11º',
    name: 'iShares Treasury Floating Rate Bond ETF',
    setor: 'Renda Fixa',
    dataEntrada: '21/03/2023',
    precoQueIniciou: 'US$50,50',
    precoTeto: 'US$52,00',
    avatar: 'https://logo.clearbit.com/ishares.com',
    tipo: 'ETF',
    dy: '4,75%'
  }
};

  // 🔗 FUNÇÃO PARA BUSCAR DADOS DAS APIs
const fetchAPIData = async () => {
  console.log('🔍 Buscando dados das APIs...');
  
  try {
    // Buscar dados de stocks
    const stocksResponse = await fetch('/api/financial/stocks', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    let stocksData = [];
    if (stocksResponse.ok) {
      const stocksResult = await stocksResponse.json();
      stocksData = stocksResult.stocks || [];
      console.log('✅ Dados de stocks da API:', stocksData.length, 'itens');
    }

    // Buscar dados de dividendos
    const dividendsResponse = await fetch('/api/financial/dividends', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    let dividendsData = [];
    if (dividendsResponse.ok) {
      const dividendsResult = await dividendsResponse.json();
      dividendsData = dividendsResult.dividends || [];
      console.log('✅ Dados de dividendos da API:', dividendsData.length, 'itens');
    }

    setApiData({ stocks: stocksData, dividends: dividendsData });
    return { stocks: stocksData, dividends: dividendsData };
  } catch (err) {
    console.error('❌ Erro ao buscar dados das APIs:', err);
    setApiData({ stocks: [], dividends: [] });
    return { stocks: [], dividends: [] };
  }
};

// 🎯 FUNÇÃO PARA ENCONTRAR EMPRESA (STATIC + API)
const findCompanyData = (tickerSymbol, apiData) => {
  console.log(`🔍 Procurando dados para ${tickerSymbol}...`);
  
  // 1. Primeiro verifica nos dados estáticos de stocks
  if (exteriorStocksDatabase[tickerSymbol]) {
    console.log(`✅ Encontrado em stocks estáticos: ${tickerSymbol}`);
    return exteriorStocksDatabase[tickerSymbol];
  }

// 2. Depois verifica nos dados estáticos de dividendos
if (exteriorDividendsDatabase[tickerSymbol]) {
  console.log(`✅ Encontrado em dividendos estáticos: ${tickerSymbol}`);
  return exteriorDividendsDatabase[tickerSymbol];
}

// 2.5. NOVO: Depois verifica nos dados estáticos de ETFs
if (exteriorETFsDatabase[tickerSymbol]) {
  console.log(`✅ Encontrado em ETFs estáticos: ${tickerSymbol}`);
  return exteriorETFsDatabase[tickerSymbol];
}
  
  // 3. Busca nos dados de stocks da API
  const stockFromAPI = apiData.stocks.find(stock => 
    (stock.ticker || stock.symbol)?.toUpperCase() === tickerSymbol.toUpperCase()
  );
  
  if (stockFromAPI) {
    console.log(`✅ Encontrado na API de stocks: ${tickerSymbol}`);
    return {
      rank: `API-S${stockFromAPI.id || '?'}`,
      name: stockFromAPI.name || stockFromAPI.longName || `${tickerSymbol} Corporation`,
      setor: stockFromAPI.sector || stockFromAPI.industry || 'Setor não informado',
      dataEntrada: stockFromAPI.entryDate || new Date().toLocaleDateString('pt-BR'),
      precoQueIniciou: `US$${stockFromAPI.entryPrice || '0.00'}`,
      precoTeto: `US$${stockFromAPI.targetPrice || '0.00'}`,
      avatar: getCompanyAvatar(tickerSymbol, stockFromAPI.name),
      tipo: 'STOCK_API'
    };
  }

  // 4. Busca nos dados de dividendos da API
  const dividendFromAPI = apiData.dividends.find(dividend => 
    (dividend.ticker || dividend.symbol)?.toUpperCase() === tickerSymbol.toUpperCase()
  );
  
  if (dividendFromAPI) {
    console.log(`✅ Encontrado na API de dividendos: ${tickerSymbol}`);
    return {
      rank: `API-D${dividendFromAPI.id || '?'}`,
      name: dividendFromAPI.name || dividendFromAPI.longName || `${tickerSymbol} Corporation`,
      setor: dividendFromAPI.sector || dividendFromAPI.industry || 'Dividendos',
      dataEntrada: dividendFromAPI.entryDate || new Date().toLocaleDateString('pt-BR'),
      precoQueIniciou: `US$${dividendFromAPI.entryPrice || '0.00'}`,
      precoTeto: `US$${dividendFromAPI.targetPrice || '0.00'}`,
      avatar: getCompanyAvatar(tickerSymbol, dividendFromAPI.name),
      tipo: 'DIVIDEND_API',
      dy: `${dividendFromAPI.dividendYield || '0'}%`
    };
  }

  console.log(`⚠️ ${tickerSymbol} não encontrado em nenhuma fonte`);
  return null;
};
  
  // 🎨 FUNÇÃO PARA OBTER AVATAR/ÍCONE DA EMPRESA
  const getCompanyAvatar = (symbol, companyName) => {
    const knownLogos = {
      // Empresas já na cobertura
      'AMD': 'https://logo.clearbit.com/amd.com',
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'HD': 'https://logo.clearbit.com/homedepot.com',
      'COST': 'https://logo.clearbit.com/costco.com',
      'AMAT': 'https://logo.clearbit.com/appliedmaterials.com',
      'XP': 'https://logo.clearbit.com/xpi.com.br',
      'FIVE': 'https://logo.clearbit.com/fivebelow.com',
      'BRK-B': 'https://s3-symbol-logo.tradingview.com/berkshire-hathaway--600.png?v=1',
      // Empresas já na cobertura de DIVIDENDOS
'OXY': 'https://logo.clearbit.com/oxy.com',
'ADC': 'https://logo.clearbit.com/agreerealty.com',
'VZ': 'https://logo.clearbit.com/verizon.com',
'O': 'https://logo.clearbit.com/realtyincome.com',
'AVB': 'https://logo.clearbit.com/avalonbay.com',
'STAG': 'https://logo.clearbit.com/stagindustrial.com',
      
      // Empresas populares sem cobertura
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
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

    // 1. Se o ticker tem logo conhecido, retorna (MESMA LÓGICA das empresas com cobertura)
    if (knownLogos[symbol]) {
      return knownLogos[symbol];
    }

    // 2. Se não tem logo conhecido, gera ícone automático baseado no ticker
    return `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`;
  };
  
useEffect(() => {
  setMounted(true);
  const path = window.location.pathname;
  const tickerFromUrl = path.split('/').pop() || '';
  const cleanTicker = tickerFromUrl.toUpperCase();
  setTicker(cleanTicker);

  const initializeData = async () => {
    // Buscar dados das APIs primeiro
    const apis = await fetchAPIData();
    
    // Procurar dados da empresa
    const staticInfo = findCompanyData(cleanTicker, apis);
    setStaticData(staticInfo);

    if (cleanTicker) {
      fetchStockData(cleanTicker, staticInfo);
    }
  };

  initializeData();
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
        precoQueIniciou: staticInfo?.precoQueIniciou || `US${precoAtual.toFixed(2)}`,
        precoTeto: staticInfo?.precoTeto || `US${(precoAtual * 1.2).toFixed(2)}`,
        avatar: staticInfo?.avatar || getCompanyAvatar(tickerSymbol, result.shortName || result.longName) || result.logourl,
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
          ? `${(result.marketCap / 1e9).toFixed(2)}B`
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
        vies: staticInfo ? ((precoAtual / precoTeto) >= 0.95 ? 'AGUARDAR' : 'COMPRA') : 'N/A',
        tipo: staticInfo?.tipo || 'SEM_COBERTURA',
        dy: staticInfo?.dy || null
      };

      // Debug do avatar
      console.log('🎯 Avatar URL gerada:', realData.avatar);
      console.log('📊 Dados completos:', realData);

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
      'BRK-B': '$890B'
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
            {/* Container do avatar - versão ultra simplificada */}
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
              {/* Fallback com iniciais - sempre visível */}
              <span 
                id="avatar-fallback"
                style={{ 
                  position: 'absolute', 
                  zIndex: 1
                }}
              >
                {ticker.slice(0, 2)}
              </span>
              
              {/* Imagem da logo */}
              {stockData?.avatar && (
                <img
                  id="avatar-img"
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
                    const valid = e.target.naturalWidth > 1 && e.target.naturalHeight > 1;
                    console.log('📸 Avatar carregou:', e.target.src, `${e.target.naturalWidth}x${e.target.naturalHeight}`, 'válido:', valid);
                    if (valid) {
                      // Esconde o fallback se imagem é válida
                      const fallback = document.getElementById('avatar-fallback');
                      console.log('🎯 Tentando esconder fallback:', !!fallback);
                      if (fallback) {
                        fallback.style.display = 'none';
                        console.log('✅ Fallback escondido! Display:', fallback.style.display);
                      }
                    } else {
                      // Remove a imagem se for inválida (1x1px, etc)
                      console.log('❌ Imagem inválida, removendo');
                      e.target.style.display = 'none';
                    }
                  }}
                  onError={(e) => {
                    console.log('❌ Avatar falhou:', e.target.src);
                    // Remove a imagem se erro
                    e.target.style.display = 'none';
                    console.log('🔄 Imagem removida, fallback deve estar visível');
                  }}
                />
              )}
            </div>
            
    <div>
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
    <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
      {ticker} {stockData.rank && <span style={{ color: '#6b7280', fontSize: '24px' }}>• {stockData.rank}</span>}
    </h1>
<div style={{
  background: (() => {
    // Verifica se tem dados estáticos primeiro
  if (staticData) {
    if (staticData.tipo === 'DIVIDEND') return '#dcfce7';
    if (staticData.tipo === 'ETF') return '#fef3c7';  // NOVO
    return '#dbeafe';
  }
  switch(stockData.tipo) {
    case 'STOCK': return '#dbeafe';
    case 'DIVIDEND': return '#dcfce7';
    case 'ETF': return '#fef3c7';  // NOVO
    case 'STOCK_API': return '#e9d5ff';
    case 'DIVIDEND_API': return '#fee2e2';
    default: return '#f3f4f6';
  }
})(),
  color: (() => {
    // Verifica se tem dados estáticos primeiro
  if (staticData) {
    if (staticData.tipo === 'DIVIDEND') return '#059669';
    if (staticData.tipo === 'ETF') return '#d97706';  // NOVO
    return '#3b82f6';
  }
  switch(stockData.tipo) {
    case 'STOCK': return '#3b82f6';
    case 'DIVIDEND': return '#059669';
    case 'ETF': return '#d97706';  // NOVO
    case 'STOCK_API': return '#7c3aed';
    case 'DIVIDEND_API': return '#dc2626';
    default: return '#6b7280';
  }
})(),
  padding: '4px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase'
}}>
{(() => {
  if (staticData) {
    if (staticData.tipo === 'DIVIDEND') return '💰 DIVIDEND';
    if (staticData.tipo === 'ETF') return '📊 ETF';  // NOVO
    return '📈 STOCK';
  }
  switch(stockData.tipo) {
    case 'STOCK': return '📈 STOCK';
    case 'DIVIDEND': return '💰 DIVIDEND';
    case 'ETF': return '📊 ETF';  // NOVO
    case 'STOCK_API': return '📈 STOCK (API)';
    case 'DIVIDEND_API': return '💰 DIVIDEND (API)';
    default: return 'SEM COBERTURA';
  }
})()}
</div>
  </div>
  <p style={{ color: '#6b7280', margin: 0 }}>
    {stockData.name} • USD • {stockData.setor}
    {stockData.dy && ` • DY: ${stockData.dy}`}
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
      {/* 🆕 NOVO CAMPO - VARIAÇÃO DO DIA */}
      <div>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px 0', fontWeight: '600' }}>
          VARIAÇÃO DO DIA
        </p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px' 
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: stockData.isPositive ? '#059669' : '#dc2626'
          }}>
            {stockData.isPositive ? '+' : ''}{stockData.change}
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: stockData.isPositive ? '#059669' : '#dc2626'
          }}>
            ({stockData.isPositive ? '+' : ''}{stockData.changePercent}%)
          </span>
          <span style={{ fontSize: '16px' }}>
            {stockData.isPositive ? '↗️' : '↘️'}
          </span>
        </div>
      </div>
    </div>
  </div>
    
        {/* 🆕 CARD PRINCIPAL DE PREÇO - ADICIONE AQUI */}
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
                  color: 'rgba(255,255,255,0.9)',
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
