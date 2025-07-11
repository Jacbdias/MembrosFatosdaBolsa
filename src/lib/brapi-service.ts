// SUBSTITUA APENAS: src/lib/brapi-service.ts
// (Mantém toda a estrutura atual, só corrige a chave)

export class BrapiService {
  private static apiKey = 'jJrMYVy9MATGEicx3GxBp8'; // HARDCODE TEMPORÁRIO
  private static baseUrl = 'https://brapi.dev/api';

  // Método estático (como seu código atual usa)
  static async fetchQuotes(symbols: string[]): Promise<any[]> {
    console.log(`🚀 Buscando cotações para: ${symbols}`);
    console.log(`🔑 Usando chave: ${this.apiKey.substring(0, 8)}...`);

    if (!symbols || symbols.length === 0) {
      console.log('⚠️ Nenhum símbolo fornecido');
      return [];
    }

    const cleanSymbols = symbols
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);

    const symbolString = cleanSymbols.join(',');

    try {
      const url = `${this.baseUrl}/quote/${symbolString}?token=${this.apiKey}`;
      
      console.log(`📡 URL (mascarada): ${url.replace(this.apiKey, '***')}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'MembrosFatosBolsa/1.0'
        }
      });

      console.log(`📊 Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erro detalhado:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }

        throw new Error(`Brapi API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Dados recebidos:`, {
        resultCount: data.results?.length || 0,
        symbols: symbolString
      });

      return data.results || [];

    } catch (error) {
      console.error(`❌ Erro ao buscar cotações da Brapi:`, error);
      throw error;
    }
  }

  // Método de instância para compatibilidade futura
  async fetchQuotesInstance(symbols: string[]): Promise<any[]> {
    return BrapiService.fetchQuotes(symbols);
  }

  // Método para testar conexão
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const results = await this.fetchQuotes(['PETR4']);
      return {
        success: results.length > 0,
        message: results.length > 0 ? 'Conexão OK' : 'Sem dados'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}