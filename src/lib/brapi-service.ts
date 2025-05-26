// src/lib/brapi-service.ts
import { StockQuote, BrapiResponse } from '@/types/financial';

export class BrapiService {
  private static readonly BASE_URL = 'https://brapi.dev/api';
  private static readonly token = process.env.BRAPI_TOKEN;

  static async fetchQuotes(symbols: string[]): Promise<StockQuote[]> {
    try {
      const symbolsParam = symbols.join(',');
      
      // USAR TOKEN NA URL
      let url = `${this.BASE_URL}/quote/${symbolsParam}`;
      
      if (this.token) {
        url += `?token=${this.token}`;
      }

      console.log('🚀 Buscando cotações para:', symbols);
      console.log('🔗 URL com token:', url.replace(this.token || '', 'TOKEN_OCULTO'));

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
      console.log('🔍 Buscando índices COM token...');
      
      const indexes = await this.fetchQuotes(['^BVSP', 'SMLL11']);
      
      const ibovespa = indexes.find(index => index.symbol === '^BVSP') || null;
      const smallCap = indexes.find(index => index.symbol === 'SMLL11') || null;
      
      if (ibovespa) {
        console.log('✅ Ibovespa encontrado:', ibovespa.regularMarketPrice);
      }
      if (smallCap) {
        console.log('✅ Small Cap encontrado:', smallCap.regularMarketPrice);
      }
      
      return { ibovespa, smallCap };
    } catch (error) {
      console.error('❌ Erro ao buscar índices:', error);
      return {
        ibovespa: null,
        smallCap: null,
      };
    }
  }
}
