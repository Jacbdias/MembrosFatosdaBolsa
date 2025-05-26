import { NextResponse } from 'next/server';
import { BrapiService } from '@/lib/brapi-service';
import { FinancialUtils } from '@/lib/financial-utils';

export async function GET() {
  try {
    console.log('🚀 API market-data chamada');

    const { ibovespa, smallCap } = await BrapiService.fetchIndexes();

    const defaultData = {
      ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
      indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
      carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
      dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
      ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
      carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
    };

    const marketData = {
      ibovespa: ibovespa ? {
        value: FinancialUtils.formatMarketValue(ibovespa.regularMarketPrice),
        trend: FinancialUtils.getTrendDirection(ibovespa.regularMarketChange),
        diff: Number(ibovespa.regularMarketChangePercent.toFixed(2)),
      } : defaultData.ibovespa,
      
      indiceSmall: smallCap ? {
        value: FinancialUtils.formatMarketValue(smallCap.regularMarketPrice),
        trend: FinancialUtils.getTrendDirection(smallCap.regularMarketChange),
        diff: Number(smallCap.regularMarketChangePercent.toFixed(2)),
      } : defaultData.indiceSmall,
      
      carteiraHoje: defaultData.carteiraHoje,
      dividendYield: defaultData.dividendYield,
      ibovespaPeriodo: defaultData.ibovespaPeriodo,
      carteiraPeriodo: defaultData.carteiraPeriodo,
    };

    return NextResponse.json(
      { marketData, timestamp: new Date().toISOString() },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('❌ Market Data API Error:', error);
    
    return NextResponse.json({
      marketData: {
        ibovespa: { value: "145k", trend: "up", diff: 2.8 },
        indiceSmall: { value: "1.950k", trend: "down", diff: -1.2 },
        carteiraHoje: { value: "88.7%", trend: "up", diff: 88.7 },
        dividendYield: { value: "7.4%", trend: "up", diff: 7.4 },
        ibovespaPeriodo: { value: "6.1%", trend: "up", diff: 6.1 },
        carteiraPeriodo: { value: "9.3%", trend: "up", diff: 9.3 },
      },
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}
