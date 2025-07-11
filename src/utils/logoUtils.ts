// 🎨 UTILITÁRIO DE LOGOS PARA TICKERS
// src/utils/logoUtils.ts

export const TICKER_TO_COMPANY_NAME: Record<string, string> = {
  // 🇺🇸 PROJETO AMÉRICA
  'NVDA': 'nvidia',
  'AMZN': 'amazon',
  'PEP': 'pepsi',
  'IAU': 'ishares',
  'WPC': 'wpcrealty',
  'NOBL': 'proshares',
  'CRM': 'salesforce',
  'AMD': 'amd',
  'TLT': 'ishares',
  'QQQ': 'invesco',
  'NNN': 'nnnreit',

  // 📊 ETFs INTERNACIONAIS
  'VOO': 'vanguard',
  'IJS': 'ishares',
  'QUAL': 'ishares',
  'VNQ': 'vanguard',
  'SCHP': 'schwab',
  'HERO': 'globalx',
  'SOXX': 'ishares',
  'MCHI': 'ishares',
  'TFLO': 'ishares',

  // 🌎 DIVIDENDOS INTERNACIONAIS
  'OXY': 'oxy',
  'ADC': 'agree',
  'VZ': 'verizon',
  'O': 'realtyincome',
  'AVB': 'avalonbay',
  'STAG': 'stag',

  // 🌍 EXTERIOR STOCKS
  'XP': 'xp',
  'HD': 'homedepot',
  'AAPL': 'apple',
  'FIVE': 'fivebelow',
  'AMAT': 'appliedmaterials',
  'COST': 'costco',
  'GOOGL': 'google',
  'META': 'meta',
  'BRK.B': 'berkshirehathaway',
};

export function obterLogoEmpresa(ticker: string): string {
  if (!ticker) return '';
  
  const tickerLimpo = ticker.trim().toUpperCase();
  const nomeEmpresa = TICKER_TO_COMPANY_NAME[tickerLimpo];
  
  if (nomeEmpresa) {
    return `https://logo.clearbit.com/${nomeEmpresa}.com`;
  }
  
  return `https://logo.clearbit.com/${ticker.toLowerCase()}.com`;
}