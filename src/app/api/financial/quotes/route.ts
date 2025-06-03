import { NextRequest, NextResponse } from 'next/server';
import { BrapiService } from '@/lib/brapi-service';

// 🛡️ CONFIGURAÇÃO PARA VERCEL - EVITA ERRO DE STATIC GENERATION
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // ✅ USAR request.nextUrl EM VEZ DE new URL(request.url)
    const { searchParams } = request.nextUrl;
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
      { 
        quotes, 
        timestamp: new Date().toISOString(),
        symbols: symbolsArray,
        success: true
      },
      { 
        status: 200,
        headers: {
          // Configuração de cache mais segura para Vercel
          'Cache-Control': 'no-store, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
      }
    );
    
  } catch (error) {
    console.error('❌ Quotes API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor', 
        quotes: [],
        timestamp: new Date().toISOString(),
        success: false,
        details: errorMessage
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

// POST method para atualizar quotes se necessário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📊 POST Quotes API - Dados recebidos:', body);
    
    // Implementar lógica de POST se necessário
    // Por exemplo: cache refresh, webhook processing, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Quotes atualizadas com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ POST Quotes API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    }, { 
      status: 500 
    });
  }
}

// OPTIONS method para CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
