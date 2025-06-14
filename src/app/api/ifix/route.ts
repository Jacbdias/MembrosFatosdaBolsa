// app/api/ifix/route.ts
export async function GET() {
  // Dados de fallback mais realistas
  const gerarDadosRealisticos = () => {
    const agora = new Date();
    const hora = agora.getHours();
    const minuto = agora.getMinutes();
    
    // Simula maior volatilidade no horário comercial
    const isHorarioComercial = hora >= 10 && hora <= 17;
    const intensidadeVolatilidade = isHorarioComercial ? 3.2 : 1.1;
    
    // Base do IFIX (valor aproximado real)
    const valorBase = 3440;
    
    // Variação mais realista baseada no tempo
    const seed = Math.sin(hora * minuto + agora.getDate()) * 100;
    const variacao = (Math.random() - 0.5 + seed * 0.01) * intensidadeVolatilidade;
    
    const novoValor = valorBase + (valorBase * variacao / 100);
    const variacaoAbsoluta = novoValor - valorBase;
    
    return {
      valor: novoValor,
      valorFormatado: novoValor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      variacao: variacaoAbsoluta,
      variacaoPercent: variacao,
      trend: variacao >= 0 ? 'up' : 'down',
      timestamp: agora.toISOString(),
      fonte: 'SIMULAÇÃO_REALISTA',
      nota: `Dados simulados ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')} (${isHorarioComercial ? 'Comercial' : 'Pós-mercado'})`,
      symbol: 'IFIX'
    };
  };

  // Lista de APIs alternativas para tentar
  const apisAlternativas = [
    // Yahoo Finance (gratuita)
    {
      url: 'https://query1.finance.yahoo.com/v8/finance/chart/^IFIX',
      parser: (data: any) => {
        const result = data.chart?.result?.[0];
        if (!result) return null;
        
        const meta = result.meta;
        const price = meta?.regularMarketPrice || meta?.previousClose;
        const change = meta?.regularMarketPrice - meta?.previousClose;
        const changePercent = (change / meta?.previousClose) * 100;
        
        return {
          valor: price,
          valorFormatado: price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          variacao: change,
          variacaoPercent: changePercent,
          trend: changePercent >= 0 ? 'up' : 'down',
          timestamp: new Date().toISOString(),
          fonte: 'YAHOO_FINANCE',
          nota: 'Dados obtidos via Yahoo Finance',
          symbol: '^IFIX'
        };
      }
    },
    
    // Alpha Vantage (requer chave, mas tem versão demo)
    {
      url: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IFIX&apikey=demo',
      parser: (data: any) => {
        const quote = data['Global Quote'];
        if (!quote) return null;
        
        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        
        return {
          valor: price,
          valorFormatado: price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          variacao: change,
          variacaoPercent: changePercent,
          trend: changePercent >= 0 ? 'up' : 'down',
          timestamp: new Date().toISOString(),
          fonte: 'ALPHA_VANTAGE',
          nota: 'Dados obtidos via Alpha Vantage',
          symbol: 'IFIX'
        };
      }
    },

    // BRAPI (tentativa final)
    {
      url: 'https://brapi.dev/api/quote/^IFIX',
      parser: (data: any) => {
        const result = data.results?.[0];
        if (!result?.regularMarketPrice) return null;
        
        return {
          valor: result.regularMarketPrice,
          valorFormatado: result.regularMarketPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          variacao: result.regularMarketChange || 0,
          variacaoPercent: result.regularMarketChangePercent || 0,
          trend: (result.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
          timestamp: new Date().toISOString(),
          fonte: 'BRAPI',
          nota: 'Dados obtidos via BRAPI',
          symbol: result.symbol
        };
      }
    }
  ];

  // Tenta cada API sequencialmente
  for (const api of apisAlternativas) {
    try {
      console.log(`🔍 Tentando: ${api.url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`❌ ${api.url} retornou ${response.status}`);
        continue;
      }

      const data = await response.json();
      const parsedData = api.parser(data);

      if (parsedData && parsedData.valor) {
        console.log(`✅ Sucesso com: ${api.url}`);
        return Response.json({ 
          ifix: parsedData,
          meta: {
            source: api.url,
            timestamp: new Date().toISOString(),
            status: 'success'
          }
        });
      }

    } catch (error) {
      console.warn(`💥 Erro em ${api.url}:`, error);
      continue;
    }
  }

  // Se todas as APIs falharam, usa dados simulados
  console.log('🎭 Todas as APIs falharam, usando simulação realista');
  
  const dadosSimulados = gerarDadosRealisticos();
  
  return Response.json({ 
    ifix: dadosSimulados,
    meta: {
      source: 'fallback_simulation',
      timestamp: new Date().toISOString(),
      status: 'fallback',
      message: 'APIs externas indisponíveis, usando simulação realista'
    }
  });
}

// Para Pages Router (Next.js 12 ou anterior)
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await GET();
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
