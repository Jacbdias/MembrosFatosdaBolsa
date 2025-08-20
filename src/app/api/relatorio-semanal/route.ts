import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET - Buscar relatórios (admin) ou atual (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // ADMIN: Buscar todos os relatórios
      const relatorios = await prisma.relatorioSemanal.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`Admin: encontrados ${relatorios.length} relatórios`);
      return NextResponse.json(relatorios);
      
    } else {
      // PÚBLICO: Apenas o mais recente publicado
      const relatorio = await prisma.relatorioSemanal.findFirst({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
      });
      
      if (relatorio) {
        // Converter para formato compatível com visualização
        const relatorioFormatted = {
          ...relatorio,
          // Campos para compatibilidade
          date: relatorio.dataPublicacao || relatorio.date,
          weekOf: relatorio.semana || relatorio.weekOf,
          // Garantir arrays existem
          macro: relatorio.macro || [],
          dividendos: relatorio.dividendos || [],
          smallCaps: relatorio.smallCaps || [],
          microCaps: relatorio.microCaps || [],
          exteriorStocks: relatorio.exteriorStocks || [],
          exteriorETFs: relatorio.exteriorETFs || [],
          exteriorDividendos: relatorio.exteriorDividendos || [],
          exteriorProjetoAmerica: relatorio.exteriorProjetoAmerica || [],
          // Campo legado
          exterior: relatorio.exteriorStocks || relatorio.exterior || [],
          proventos: relatorio.proventos || []
        };
        return NextResponse.json(relatorioFormatted);
      }
      
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('Erro GET relatório:', error);
    return NextResponse.json({ error: 'Erro ao buscar relatório' }, { status: 500 });
  }
}

// POST - Criar/Atualizar relatório (sem autenticação para teste)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', { 
      semana: data.semana, 
      titulo: data.titulo,
      id: data.id 
    });
    
    // Preparar dados compatíveis
    const relatorioData = {
      // Campos do admin
      semana: data.semana,
      dataPublicacao: data.dataPublicacao || new Date().toISOString().split('T')[0],
      autor: data.autor || '',
      titulo: data.titulo,
      
      // Campos legados para compatibilidade
      date: data.dataPublicacao || data.date || new Date().toISOString().split('T')[0],
      weekOf: data.semana || data.weekOf || 'Nova semana',
      
      // Arrays de conteúdo
      macro: data.macro || [],
      dividendos: data.dividendos || [],
      smallCaps: data.smallCaps || [],
      microCaps: data.microCaps || [],
      exteriorStocks: data.exteriorStocks || [],
      exteriorETFs: data.exteriorETFs || [],
      exteriorDividendos: data.exteriorDividendos || [],
      exteriorProjetoAmerica: data.exteriorProjetoAmerica || [],
      
      // Campos legados
      proventos: data.proventos || [],
      exterior: data.exterior || data.exteriorStocks || [],
      
      status: data.status || 'draft',
      authorId: 'admin' // Temporário
    };
    
    let relatorio;
    
    if (data.id && data.id !== 'novo') {
      // Tentar atualizar
      try {
        relatorio = await prisma.relatorioSemanal.update({
          where: { id: data.id },
          data: relatorioData
        });
        console.log('Relatório atualizado:', relatorio.id);
      } catch (updateError) {
        if (updateError.code === 'P2025') {
          // Não encontrou, criar novo
          const { id, ...dataWithoutId } = relatorioData;
          relatorio = await prisma.relatorioSemanal.create({
            data: dataWithoutId
          });
          console.log('Relatório criado (não encontrou):', relatorio.id);
        } else {
          throw updateError;
        }
      }
    } else {
      // Criar novo
      const { id, ...dataWithoutId } = relatorioData;
      relatorio = await prisma.relatorioSemanal.create({
        data: dataWithoutId
      });
      console.log('Relatório criado:', relatorio.id);
    }
    
    return NextResponse.json(relatorio);
    
  } catch (error) {
    console.error('Erro POST relatório:', error);
    return NextResponse.json({ 
      error: 'Erro ao salvar relatório',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Deletar relatório
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID necessário' }, { status: 400 });
    }
    
    await prisma.relatorioSemanal.delete({
      where: { id }
    });
    
    console.log('Relatório deletado:', id);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro DELETE relatório:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Erro ao deletar relatório' }, { status: 500 });
  }
}

// Remover funções de validação e auth por enquanto