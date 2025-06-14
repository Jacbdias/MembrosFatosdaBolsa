// app/api/ifix/route.ts
export async function GET() {
  // Configuração específica para Vercel
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
  };

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
      fonte: 'SIMULAÇÃO_REALISTA_VERCEL',
      nota: `Dados simulados ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')} (${isHorarioComercial ? 'Comercial' : 'Pós-mercado'})`,
      symbol: 'IFIX'
    };
  };

  // APIs otimizadas para Vercel
  const apisOtimizadas = [
    // Financialmodelingprep (mais confiável no Vercel)
    {
      url: 'https://financialmodelingprep.com/api/v3/quote/^IFIX?apikey=demo',
      timeout: 4000,
      parser: (data: any) => {
        if (!Array.isArray(data) || !data[0]) return null;
        const quote = data[0];
        const price = quote.price;
        const change = quote.change;
        const changePercent = quote.changesPercentage;
        
        return {
          valor: price,
          valorFormatado: price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          variacao: change,
          variacaoPercent: changePercent,
          trend: changePercent >= 0 ? 'up' : 'down',
          timestamp: new Date().toISOString(),
          fonte: 'FINANCIAL_MODELING_PREP',
          nota: 'Dados via Financial Modeling Prep',
          symbol: '^IFIX'
        };
      }
    },

    // Fallback simplificado - sempre funciona
    {
      url: null, // Sem URL externa
      timeout: 0,
      parser: () => gerarDadosRealisticos()
    }
  ];

  // Tenta cada API sequencialmente (otimizado para Vercel)
  for (const api of apisOtimizadas) {
    try {
      // Se não tem URL, usa dados locais
      if (!api.url) {
        console.log('🎭 Usando dados simulados (Vercel optimized)');
        const dadosSimulados = api.parser(null);
        return new Response(JSON.stringify({ 
          ifix: dadosSimulados,
          meta: {
            source: 'local_simulation',
            timestamp: new Date().toISOString(),
            status: 'fallback_vercel',
            message: 'Dados simulados para Vercel'
          }
        }), { 
          status: 200,
          headers 
        });
      }

      console.log(`🔍 Tentando (Vercel): ${api.url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), api.timeout);

      const response = await fetch(api.url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Vercel-Function/1.0',
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
        return new Response(JSON.stringify({ 
          ifix: parsedData,
          meta: {
            source: api.url,
            timestamp: new Date().toISOString(),
            status: 'success_vercel'
          }
        }), { 
          status: 200,
          headers 
        });
      }

    } catch (error) {
      console.warn(`💥 Erro em ${api.url}:`, error);
      continue;
    }
  }

  // Fallback final (não deveria chegar aqui)
  console.log('🚨 Fallback de emergência (Vercel)');
  const dadosEmergencia = gerarDadosRealisticos();
  
  return new Response(JSON.stringify({ 
    ifix: dadosEmergencia,
    meta: {
      source: 'emergency_fallback',
      timestamp: new Date().toISOString(),
      status: 'emergency',
      message: 'Fallback de emergência ativado'
    }
  }), { 
    status: 200,
    headers 
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
