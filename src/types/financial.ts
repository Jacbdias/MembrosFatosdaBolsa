// src/types/financial.ts
export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketTime: string;
}

export interface BrapiResponse {
  results: StockQuote[];
  requestedAt: string;
  took: string;
}

export interface MarketData {
  ibovespa: { value: string; trend: 'up' | 'down'; diff: number };
  indiceSmall: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraHoje: { value: string; trend: 'up' | 'down'; diff: number };
  dividendYield: { value: string; trend: 'up' | 'down'; diff: number };
  ibovespaPeriodo: { value: string; trend: 'up' | 'down'; diff: number };
  carteiraPeriodo: { value: string; trend: 'up' | 'down'; diff: number };
}
