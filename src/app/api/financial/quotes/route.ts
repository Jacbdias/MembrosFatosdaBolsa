import { NextRequest, NextResponse } from 'next/server';
import { BrapiService } from '@/lib/brapi-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');

    console.log('🚀 API quotes chamada com symbols:', symbols);

    if (!symbols) {
      return NextResponse.json(
        { error: 'Parâmetro symbols é obrigatório' },
        { status: 400 }
      );
    }

    const symbolsArray = symbols.split(',').map(s => s.trim().toUpperCase());
    const quotes = await BrapiService.fetchQuotes(symbolsArray);

    console.log('✅ Quotes processadas:', quotes.length, 'ativos');

    return NextResponse.json(
      { quotes, timestamp: new Date().toISOString() },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('❌ Quotes API Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', quotes: [] },
      { status: 500 }
    );
  }
}
