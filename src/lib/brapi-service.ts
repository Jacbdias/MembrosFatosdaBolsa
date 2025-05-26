// src/lib/brapi-service.ts - VERSÃO CORRIGIDA PARA FORMATO
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
      console.log('🔗 URL:', url.replace(this.token || '', 'TOKEN_OCULTO'));

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'MembrosFactosdaBolsa/1.0',
        },
        next: { revalidate: 300 },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro detalhado:', errorText);
        throw new Error(`Brapi API error: ${response.status} ${response.statusText}`);
      }

      const data: BrapiResponse = await response.json();
      console.log('✅ Resposta completa da Brapi:', JSON.stringify(data, null, 2));
      
      // VERIFICAR SE OS DADOS EXISTEM
      if (data.results && data.results.length > 0) {
        data.results.forEach(result => {
          console.log(`✅ Ativo: ${result.symbol} = R$ ${result.regularMarketPrice} (${result.regularMarketChangePercent}%)`);
        });
      } else {
        console.log('⚠️ Nenhum resultado encontrado na resposta');
      }
      
      return data.results || [];
    } catch (error) {
      console.error('❌ Erro ao buscar cotações da Brapi:', error);
      return [];
    }
  }

  static async fetchIndexes(): Promise<{ ibovespa: StockQuote | null; smallCap: StockQuote | null }> {
    try {
      console.log('🔍 Buscando índices: ^BVSP, SMLL11');
      
      // BUSCAR IBOVESPA SEPARADAMENTE PRIMEIRO
      const ibovespaData = await this.fetchQuotes(['^BVSP']);
      console.log('🔍 Dados Ibovespa:', ibovespaData);
      
      // BUSCAR SMALL CAP SEPARADAMENTE
      const smallCapData = await this.fetchQuotes(['SMLL11']);
      console.log('🔍 Dados Small Cap:', smallCapData);
      
      const ibovespa = ibovespaData.find(index => 
        index.symbol === '^BVSP' || 
        index.symbol === 'IBOV' || 
        index.symbol.includes('BVSP')
      ) || null;
      
      const smallCap = smallCapData.find(index => 
        index.symbol === 'SMLL11' || 
        index.symbol.includes('SMLL')
      ) || null;
      
      if (ibovespa) {
        console.log('✅ Ibovespa encontrado:', ibovespa.symbol, '=', ibovespa.regularMarketPrice);
      } else {
        console.log('❌ Ibovespa NÃO encontrado');
      }
      
      if (smallCap) {
        console.log('✅ Small Cap encontrado:', smallCap.symbol, '=', smallCap.regularMarketPrice);
      } else {
        console.log('❌ Small Cap NÃO encontrado');
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
