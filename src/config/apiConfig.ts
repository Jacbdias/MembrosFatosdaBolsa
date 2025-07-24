// 🔑 CONFIGURAÇÕES CENTRALIZADAS DAS APIs
export const API_CONFIG = {
  // Token da BRAPI
  BRAPI_TOKEN: 'jJrMYVy9MATGEicx3GxBp8',
  
  // Timeouts
  DEFAULT_TIMEOUT: 5000,
  MOBILE_TIMEOUT: 3000,
  
  // Retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 300,
  
  // Endpoints
  ENDPOINTS: {
    BRAPI_QUOTE: 'https://brapi.dev/api/quote',
    BRAPI_HISTORICAL: 'https://brapi.dev/api/quote'
  },
  
  // User Agents
  USER_AGENTS: {
    DESKTOP: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    MOBILE: 'MicroCaps-Mobile-v2',
    DEFAULT: 'MicroCaps-Desktop-v2'
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  
  // Intervalo de atualização (5 minutos)
  UPDATE_INTERVAL: 5 * 60 * 1000,
  
  // Tickers especiais
  SPECIAL_TICKERS: {
    IBOVESPA: '^BVSP',
    SMAL11: 'SMAL11'
  },
  
  // Fatores de conversão
  CONVERSION_FACTORS: {
    SMAL11_TO_SMLL: 20.6 // Baseado na relação Status Invest
  }
} as const;

// 🎯 URLS PRÉ-FORMATADAS
export const buildApiUrl = (ticker: string, modules?: string) => {
  const baseUrl = `${API_CONFIG.ENDPOINTS.BRAPI_QUOTE}/${ticker}`;
  const params = new URLSearchParams();
  
  params.append('token', API_CONFIG.BRAPI_TOKEN);
  
  if (modules) {
    params.append('modules', modules);
  }
  
  return `${baseUrl}?${params.toString()}`;
};

export const buildBatchApiUrl = (tickers: string[], modules?: string) => {
  const baseUrl = `${API_CONFIG.ENDPOINTS.BRAPI_QUOTE}/${tickers.join(',')}`;
  const params = new URLSearchParams();
  
  params.append('token', API_CONFIG.BRAPI_TOKEN);
  
  if (modules) {
    params.append('modules', modules);
  }
  
  return `${baseUrl}?${params.toString()}`;
};