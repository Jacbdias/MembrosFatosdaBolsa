// src/app/api/financial/market-data/route.ts
import { NextResponse } from 'next/server';
import { BrapiService } from '@/lib/brapi-service'; // Assuming this path
import { FinancialUtils } from '@/lib/financial-utils'; // Assuming this path

// Optional: Define revalidation strategy at the top level for the entire route
// This will tell Next.js to revalidate this route's data every 5 minutes (300 seconds)
// export const revalidate = 300; 

export async function GET() {
  try {
    console.log('🚀 API market-data chamada');

    // Use a Promise.allSettled to handle potential individual failures gracefully
    const [ibovespaResult, smallCapResult] = await Promise.allSettled([
      BrapiService.fetchIndex('^BVSP'), // Pass specific ticker for Ibovespa
      BrapiService.fetchIndex('SMAL11') // Pass specific ticker for Small Cap ETF
    ]);

    // Default fallback data for when API calls fail or data is missing
    // It's good practice to make these defaults align with your expected `MarketData` structure
    const defaultMarketData = {
      ibovespa: { value: "N/A", trend: "up" as const, diff: 0 },
      indiceSmall: { value: "N/A", trend: "up" as const, diff: 0 },
    };

    let ibovespaData = defaultMarketData.ibovespa;
    let smallCapData = defaultMarketData.indiceSmall;

    if (ibovespaResult.status === 'fulfilled' && ibovespaResult.value) {
      const ibovespa = ibovespaResult.value;
      ibovespaData = {
        value: FinancialUtils.formatMarketValue(ibovespa.regularMarketPrice),
        trend: FinancialUtils.getTrendDirection(ibovespa.regularMarketChange),
        diff: Number(ibovespa.regularMarketChangePercent.toFixed(2)),
      };
      console.log('✅ Ibovespa data processed.');
    } else {
      console.warn('⚠️ Falha ao obter dados do Ibovespa:', ibovespaResult.status === 'rejected' ? ibovespaResult.reason : 'Dados vazios');
    }

    if (smallCapResult.status === 'fulfilled' && smallCapResult.value) {
      const smallCap = smallCapResult.value;
      smallCapData = {
        value: FinancialUtils.formatMarketValue(smallCap.regularMarketPrice),
        trend: FinancialUtils.getTrendDirection(smallCap.regularMarketChange),
        diff: Number(smallCap.regularMarketChangePercent.toFixed(2)),
      };
      console.log('✅ Small Cap data processed.');
    } else {
      console.warn('⚠️ Falha ao obter dados do Small Cap:', smallCapResult.status === 'rejected' ? smallCapResult.reason : 'Dados vazios');
    }

    // Combine the fetched/default data with your fixed portfolio-level data
    const marketData = {
      ibovespa: ibovespaData,
      indiceSmall: smallCapData,
      // These seem to be static/calculated on the client-side,
      // so they remain as default if not calculated here.
      // If they are calculated on the server, you'd integrate that logic.
      carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
      dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };

    console.log('📊 Dados de mercado finalizados para resposta:', marketData);

    return NextResponse.json(
      { marketData, timestamp: new Date().toISOString() },
      { 
        status: 200,
        headers: {
          // This header will be respected by Vercel's Edge Network for caching.
          // `s-maxage=300` means cache for 5 minutes at the CDN.
          // `stale-while-revalidate=600` means serve stale for up to 10 minutes
          // while revalidating in the background after 5 minutes.
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao buscar dados de mercado.';
    console.error('❌ Market Data API Error (caught):', errorMessage, error);
    
    // Return a fallback with a 500 status code to indicate an error
    return NextResponse.json({
      error: `Falha ao buscar dados de mercado: ${errorMessage}`,
      marketData: {
        ibovespa: { value: "N/A", trend: "up" as const, diff: 0 },
        indiceSmall: { value: "N/A", trend: "up" as const, diff: 0 },
        carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
        dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
        ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
        carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
      },
      timestamp: new Date().toISOString(),
      fallback: true,
    }, { status: 500 }); // Set status to 500 for server errors
  }
}
