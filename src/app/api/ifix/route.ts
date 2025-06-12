// app/api/ifix/route.ts
export async function GET() {
  try {
    const res = await fetch('https://brapi.dev/api/quote/^IFIX?token=jJrMYVy9MATGEicx3GxBp8', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IFIX-Fetch-Server',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'BRAPI falhou' }), { status: res.status });
    }

    const data = await res.json();
    const result = data.results?.[0];

    if (!result || !result.regularMarketPrice) {
      return new Response(JSON.stringify({ error: 'Dados do IFIX não encontrados na resposta da BRAPI' }), { status: 500 });
    }

    const ifix = {
      valor: result.regularMarketPrice,
      valorFormatado: result.regularMarketPrice.toLocaleString('pt-BR'),
      variacao: result.regularMarketChange || 0,
      variacaoPercent: result.regularMarketChangePercent || 0,
      trend: (result.regularMarketChangePercent || 0) >= 0 ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      fonte: 'BRAPI',
      nota: 'Dados obtidos via BRAPI'
    };

    return Response.json({ ifix });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erro na requisição IFIX', detail: err }), {
      status: 500
    });
  }
}
