import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// ✅ CRÍTICO: Adicionar para evitar erro de build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET - Buscar relatório atual
export async function GET() {
  try {
    const relatorio = await prisma.relatorioSemanal.findFirst({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' }
    });
    
    // ✅ Garantir que os campos existam mesmo se vazios
    if (relatorio) {
      const relatorioFormatted = {
        ...relatorio,
        proventos: relatorio.proventos || [],
        dividendos: relatorio.dividendos || [],
        macro: relatorio.macro || [],
        smallCaps: relatorio.smallCaps || [],
        microCaps: relatorio.microCaps || [],
        exterior: relatorio.exterior || []
      };
      return NextResponse.json(relatorioFormatted);
    }
    
    return NextResponse.json(relatorio);
  } catch (error) {
    console.error('Erro GET relatório:', error);
    return NextResponse.json({ error: 'Erro ao buscar relatório' }, { status: 500 });
  }
}

// POST - Criar novo relatório
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // ✅ Validar estrutura de dados
    const validatedData = validateRelatorioData(data);
    
    const relatorio = await prisma.relatorioSemanal.create({
      data: {
        ...validatedData,
        authorId: admin.id
      }
    });
    
    return NextResponse.json(relatorio);
  } catch (error) {
    console.error('Erro POST relatório:', error);
    return NextResponse.json({ 
      error: 'Erro ao criar relatório',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// PUT - Atualizar relatório
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // ✅ Validar se o relatório existe
    if (!data.id) {
      return NextResponse.json({ error: 'ID do relatório é obrigatório' }, { status: 400 });
    }
    
    // ✅ Validar estrutura de dados
    const validatedData = validateRelatorioData(data);
    
    const relatorio = await prisma.relatorioSemanal.update({
      where: { id: data.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(relatorio);
  } catch (error) {
    console.error('Erro PUT relatório:', error);
    
    // ✅ Melhor tratamento de erros
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Erro ao atualizar relatório',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

// ✅ Função para validar e limpar dados do relatório
function validateRelatorioData(data: any) {
  return {
    date: data.date || new Date().toISOString().split('T')[0],
    weekOf: data.weekOf || `Semana de ${new Date().toLocaleDateString('pt-BR')}`,
    
    // ✅ Garantir que arrays existam e sejam válidos
    macro: Array.isArray(data.macro) ? data.macro.filter(item => item && typeof item === 'object') : [],
    proventos: Array.isArray(data.proventos) ? data.proventos.filter(item => item && typeof item === 'object') : [],
    dividendos: Array.isArray(data.dividendos) ? data.dividendos.filter(item => item && typeof item === 'object') : [],
    smallCaps: Array.isArray(data.smallCaps) ? data.smallCaps.filter(item => item && typeof item === 'object') : [],
    microCaps: Array.isArray(data.microCaps) ? data.microCaps.filter(item => item && typeof item === 'object') : [],
    exterior: Array.isArray(data.exterior) ? data.exterior.filter(item => item && typeof item === 'object') : [],
    
    status: data.status === 'published' ? 'published' : 'draft'
  };
}

async function verifyAdmin(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    const authHeader = request.headers.get('authorization');
    
    console.log('🔐 Verificando admin:', { userEmail, hasAuth: !!authHeader });
    
    if (userEmail === 'admin@fatosdobolsa.com') {
      return { id: 'admin', email: userEmail };
    }
    
    return null;
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return null;
  }
}