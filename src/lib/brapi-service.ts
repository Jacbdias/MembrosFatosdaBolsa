// src/lib/brapi-service.ts
import { StockQuote, BrapiResponse } from '@/types/financial';

export class BrapiService {
  private static readonly BASE_URL = 'https://brapi.dev/api';
  private static readonly token = process.env.BRAPI_TOKEN;

  static async fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      const url = `${this.BASE_URL}/quote/${symbolsParam}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      console.log('🚀 Buscando cotações para:', symbols);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        next: { revalidate: 300 }, // Cache por 5 minutos
      });

      if (!response.ok) {
        throw new Error(`Brapi API error: ${response.status} ${response.statusText}`);
      }

      const data: BrapiResponse = await response.json();
      console.log('✅ Dados recebidos da Brapi:', data.results?.length || 0, 'ativos');
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Erro ao buscar cotações da Brapi:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  static async fetchIndexes(): Promise<{ ibovespa: StockQuote | null; smallCap: StockQuote | null }> {
    try {
      const indexes = await this.fetchQuotes(['^BVSP', 'SMLL11']);
      
      return {
        ibovespa: indexes.find(index => index.symbol === '^BVSP') || null,
        smallCap: indexes.find(index => index.symbol === 'SMLL11') || null,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar índices:', error);
      return {
        ibovespa: null,
        smallCap: null,
      };
    }
  }
}
