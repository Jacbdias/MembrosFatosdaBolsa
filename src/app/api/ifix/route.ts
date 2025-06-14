// app/api/ifix/route.ts (ou pages/api/ifix.ts se usando Pages Router)

interface BrapiResponse {
  results?: Array<{
    symbol: string;
    regularMarketPrice?: number;
    regularMarketChange?: number;
    regularMarketChangePercent?: number;
    regularMarketTime?: string;
  }>;
  requestedAt?: string;
  took?: string;
}

export async function GET() {
  const endpoints = [
    // Tenta múltiplos endpoints e símbolos
    'https://brapi.dev/api/quote/^IFIX',
    'https://brapi.dev/api/quote/IFIX11',
    'https://brapi.dev/api/quote/IFIX',
    // Backup com token (caso tenha um válido)
    // 'https://brapi.dev/api/quote/^IFIX?token=SEU_TOKEN_AQUI'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Tentando endpoint: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(endpoint, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IFIX-Monitor/1.0',
        }
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`Endpoint ${endpoint} falhou com status ${res.status}`);
        continue;
      }

      const data: BrapiResponse = await res.json();
      console.log(`Resposta de ${endpoint}:`, data);

      const result = data.results?.[0];
      if (!result || typeof result.regularMarketPrice !== 'number') {
        console.warn(`Dados inválidos de ${endpoint}:`, result);
        continue;
      }

      // Sucesso! Processa os dados
      const ifix = {
        valor: result.regularMarketPrice,
        valorFormatado: result.regularMarketPrice.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        variacao: result.regularMarketChange || 0,
        variacaoPercent: result.regularMarketChangePercent || 0,
        trend: (result.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
        timestamp: new Date().toISOString(),
        fonte: 'BRAPI',
        nota: `Dados obtidos via ${endpoint.includes('brapi.dev') ? 'BRAPI' : 'API Externa'}`,
        symbol: result.symbol
      };

      console.log('IFIX processado com sucesso:', ifix);
      
      return Response.json({ 
        ifix,
        meta: {
          source: endpoint,
          requestedAt: data.requestedAt,
          took: data.took
        }
      });

    } catch (err) {
      console.warn(`Erro no endpoint ${endpoint}:`, err);
      continue;
    }
  }

  // Se todos os endpoints falharam, retorna erro
  console.error('Todos os endpoints da BRAPI falharam');
  
  return new Response(
    JSON.stringify({ 
      error: 'Todos os endpoints falharam',
      detail: 'BRAPI indisponível em todos os endpoints testados',
      endpoints: endpoints,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

// Se estiver usando Pages Router (Next.js 12 ou anterior)
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Copia a mesma lógica da função GET acima
  // mas usando res.status().json() em vez de Response.json()
}
