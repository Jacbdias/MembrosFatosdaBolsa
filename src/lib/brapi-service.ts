// src/lib/brapi-service.ts - VERSÃO SEM TOKEN (TEMPORÁRIA)
import { StockQuote, BrapiResponse } from '@/types/financial';

export class BrapiService {
  private static readonly BASE_URL = 'https://brapi.dev/api';
  // TEMPORARIAMENTE REMOVENDO TOKEN PARA TESTAR
  // private static readonly token = process.env.BRAPI_TOKEN;

  static async fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      
      // USAR SEM TOKEN PRIMEIRO
      const url = `${this.BASE_URL}/quote/${symbolsParam}`;

      console.log('🚀 Buscando cotações para:', symbols);
      console.log('🔗 URL (sem token):', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MembrosFactosdaBolsa/1.0',
        },
        next: { revalidate: 300 }, // Cache por 5 minutos
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro detalhado:', errorText);
        throw new Error(`Brapi API error: ${response.status} ${response.statusText}`);
      }

      const data: BrapiResponse = await response.json();
      console.log('✅ Dados recebidos da Brapi:', data.results?.length || 0, 'ativos');
      
      if (data.results && data.results.length > 0) {
        console.log('✅ Primeiro ativo:', data.results[0].symbol, '=', data.results[0].regularMarketPrice);
      }
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Erro ao buscar cotações da Brapi:', error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  static async fetchIndexes(): Promise<{ ibovespa: StockQuote | null; smallCap: StockQuote | null }> {
    try {
      console.log('🔍 Buscando índices sem token...');
      
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
