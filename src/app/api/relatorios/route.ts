import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔧 HEADERS ANTI-CACHE PARA TODAS AS RESPONSES
const getAntiCacheHeaders = () => ({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
});

// 📊 GET - Listar todos os relatórios
export async function GET(request: NextRequest) {
  console.log('📡 [API-DEBUG] GET /api/relatorios chamado:', new Date().toISOString());
  
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    
    console.log('🔍 [API-DEBUG] Parâmetros:', { ticker });

    let relatorios;
    
    if (ticker) {
      // Buscar relatórios de um ticker específico
      relatorios = await prisma.relatorio.findMany({
        where: {
          ticker: ticker.toUpperCase()
        },
        orderBy: [
          { dataReferencia: 'desc' },
          { dataUpload: 'desc' }
        ]
      });
      console.log(`🔍 [API-DEBUG] Encontrados ${relatorios.length} relatórios para ticker ${ticker}`);
    } else {
      // Buscar todos os relatórios
      relatorios = await prisma.relatorio.findMany({
        orderBy: [
          { ticker: 'asc' },
          { dataReferencia: 'desc' }
        ]
      });
      console.log(`📊 [API-DEBUG] Encontrados ${relatorios.length} relatórios no total`);
    }

    // Converter dados do Prisma para formato da interface
    const relatoriosFormatados = relatorios.map(relatorio => ({
      id: relatorio.id,
      ticker: relatorio.ticker,
      nome: relatorio.nome,
      tipo: relatorio.tipo as 'trimestral' | 'anual' | 'apresentacao' | 'outros',
      dataReferencia: relatorio.dataReferencia,
      dataUpload: relatorio.dataUpload.toISOString(),
      linkCanva: relatorio.linkCanva || undefined,
      linkExterno: relatorio.linkExterno || undefined,
      tipoVisualizacao: relatorio.tipoVisualizacao as 'iframe' | 'canva' | 'link' | 'pdf',
      arquivoPdf: relatorio.arquivoPdf || undefined,
      nomeArquivoPdf: relatorio.nomeArquivoPdf || undefined,
      tamanhoArquivo: relatorio.tamanhoArquivo || undefined,
      tipoPdf: (relatorio.tipoPdf as 'base64' | 'referencia') || undefined,
      hashArquivo: relatorio.hashArquivo || undefined,
      solicitarReupload: relatorio.solicitarReupload || undefined
    }));

    const response = {
      success: true,
      relatorios: relatoriosFormatados,
      total: relatoriosFormatados.length,
      timestamp: new Date().toISOString() // 🔄 Timestamp para debug
    };

    console.log('✅ [API-DEBUG] Retornando dados:', {
      total: response.total,
      timestamp: response.timestamp
    });

    // 🔥 RESPOSTA COM HEADERS ANTI-CACHE
    return NextResponse.json(response, {
      status: 200,
      headers: getAntiCacheHeaders()
    });

  } catch (error) {
    console.error('❌ [API-DEBUG] Erro ao buscar relatórios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao buscar relatórios',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: getAntiCacheHeaders()
      }
    );
  }
}

// ➕ POST - Criar novo relatório
export async function POST(request: NextRequest) {
  console.log('📝 [API-DEBUG] POST /api/relatorios chamado:', new Date().toISOString());
  
  try {
    const dados = await request.json();
    console.log('📝 [API-DEBUG] Dados recebidos:', {
      ticker: dados.ticker,
      nome: dados.nome,
      tipo: dados.tipo
    });

    // Validar dados obrigatórios
    if (!dados.ticker || !dados.nome || !dados.tipo) {
      console.log('❌ [API-DEBUG] Dados obrigatórios faltando');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obrigatórios: ticker, nome, tipo',
          timestamp: new Date().toISOString()
        },
        { 
          status: 400,
          headers: getAntiCacheHeaders()
        }
      );
    }

    console.log('💾 [API-DEBUG] Criando relatório no banco...');

    // Criar relatório no banco
    const novoRelatorio = await prisma.relatorio.create({
      data: {
        ticker: dados.ticker.toUpperCase(),
        nome: dados.nome,
        tipo: dados.tipo,
        dataReferencia: dados.dataReferencia || '',
        dataUpload: new Date(),
        linkCanva: dados.linkCanva || null,
        linkExterno: dados.linkExterno || null,
        tipoVisualizacao: dados.tipoVisualizacao || 'iframe',
        arquivoPdf: dados.arquivoPdf || null,
        nomeArquivoPdf: dados.nomeArquivoPdf || null,
        tamanhoArquivo: dados.tamanhoArquivo || null,
        tipoPdf: dados.tipoPdf || null,
        hashArquivo: dados.hashArquivo || null,
        solicitarReupload: dados.solicitarReupload || false
      }
    });

    console.log('✅ [API-DEBUG] Relatório criado com ID:', novoRelatorio.id);

    const response = {
      success: true,
      message: 'Relatório criado com sucesso',
      relatorio: {
        id: novoRelatorio.id,
        ticker: novoRelatorio.ticker,
        nome: novoRelatorio.nome,
        tipo: novoRelatorio.tipo,
        dataReferencia: novoRelatorio.dataReferencia,
        dataUpload: novoRelatorio.dataUpload.toISOString(),
        linkCanva: novoRelatorio.linkCanva || undefined,
        linkExterno: novoRelatorio.linkExterno || undefined,
        tipoVisualizacao: novoRelatorio.tipoVisualizacao,
        arquivoPdf: novoRelatorio.arquivoPdf || undefined,
        nomeArquivoPdf: novoRelatorio.nomeArquivoPdf || undefined,
        tamanhoArquivo: novoRelatorio.tamanhoArquivo || undefined,
        tipoPdf: novoRelatorio.tipoPdf || undefined,
        hashArquivo: novoRelatorio.hashArquivo || undefined,
        solicitarReupload: novoRelatorio.solicitarReupload || undefined
      },
      timestamp: new Date().toISOString()
    };

    // 🔥 RESPOSTA COM HEADERS ANTI-CACHE
    return NextResponse.json(response, { 
      status: 201,
      headers: getAntiCacheHeaders()
    });

  } catch (error) {
    console.error('❌ [API-DEBUG] Erro ao criar relatório:', error);
    
    // Tratar erro de duplicação se existir
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Já existe um relatório com esses dados',
          timestamp: new Date().toISOString()
        },
        { 
          status: 409,
          headers: getAntiCacheHeaders()
        }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao criar relatório',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: getAntiCacheHeaders()
      }
    );
  }
}