import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { notifyNewReport } from '@/utils/notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// Função para transformar dados do Prisma para o formato esperado pelo React
function transformPrismaData(relatorio: any) {
  return {
    ...relatorio,
    // Converter campos Json para arrays
    macro: Array.isArray(relatorio.macro) 
      ? relatorio.macro 
      : (typeof relatorio.macro === 'string' ? JSON.parse(relatorio.macro || '[]') : []),
    
    dividendos: Array.isArray(relatorio.dividendos)
      ? relatorio.dividendos
      : (typeof relatorio.dividendos === 'string' ? JSON.parse(relatorio.dividendos || '[]') : []),
      
    smallCaps: Array.isArray(relatorio.smallCaps)
      ? relatorio.smallCaps  
      : (typeof relatorio.smallCaps === 'string' ? JSON.parse(relatorio.smallCaps || '[]') : []),
      
    microCaps: Array.isArray(relatorio.microCaps)
      ? relatorio.microCaps
      : (typeof relatorio.microCaps === 'string' ? JSON.parse(relatorio.microCaps || '[]') : []),
      
    exteriorStocks: Array.isArray(relatorio.exteriorStocks)
      ? relatorio.exteriorStocks
      : (typeof relatorio.exteriorStocks === 'string' ? JSON.parse(relatorio.exteriorStocks || '[]') : []),
      
    exteriorETFs: Array.isArray(relatorio.exteriorETFs)
      ? relatorio.exteriorETFs  
      : (typeof relatorio.exteriorETFs === 'string' ? JSON.parse(relatorio.exteriorETFs || '[]') : []),
      
    exteriorDividendos: Array.isArray(relatorio.exteriorDividendos)
      ? relatorio.exteriorDividendos
      : (typeof relatorio.exteriorDividendos === 'string' ? JSON.parse(relatorio.exteriorDividendos || '[]') : []),
      
    exteriorProjetoAmerica: Array.isArray(relatorio.exteriorProjetoAmerica)
      ? relatorio.exteriorProjetoAmerica
      : (typeof relatorio.exteriorProjetoAmerica === 'string' ? JSON.parse(relatorio.exteriorProjetoAmerica || '[]') : []),
    
    // Campos legados para compatibilidade
    proventos: Array.isArray(relatorio.proventos)
      ? relatorio.proventos
      : (typeof relatorio.proventos === 'string' ? JSON.parse(relatorio.proventos || '[]') : []),
      
    exterior: Array.isArray(relatorio.exterior)
      ? relatorio.exterior
      : (typeof relatorio.exterior === 'string' ? JSON.parse(relatorio.exterior || '[]') : [])
  };
}

// GET - Buscar relatórios (admin) ou atual (público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // ADMIN: Verificar autenticação
      const userEmail = request.headers.get('X-User-Email');
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');

      if (!userEmail || !token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      });

      if (!user || user.plan !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      // Buscar todos os relatórios para admin
      const relatorios = await prisma.relatorioSemanal.findMany({
        orderBy: { createdAt: 'desc' }
      });
      
      // CORREÇÃO: Transformar dados para admin também
      const relatoriosTransformados = relatorios.map(transformPrismaData);
      
      console.log(`Admin: encontrados ${relatoriosTransformados.length} relatórios`);
      return NextResponse.json(relatoriosTransformados);
      
    } else {
      // PÚBLICO: Apenas o mais recente publicado
      const relatorio = await prisma.relatorioSemanal.findFirst({
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' }
      });
      
      if (relatorio) {
        // Converter para formato compatível com visualização
        const relatorioFormatted = {
          ...transformPrismaData(relatorio),
          // Campos para compatibilidade
          date: relatorio.dataPublicacao || relatorio.date,
          weekOf: relatorio.semana || relatorio.weekOf
        };
        return NextResponse.json(relatorioFormatted);
      }
      
      return NextResponse.json(null);
    }
  } catch (error) {
    console.error('Erro GET relatório:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar relatório',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Criar/Atualizar relatório (com autenticação)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || user.plan !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    console.log('Dados recebidos:', { 
      semana: data.semana, 
      titulo: data.titulo,
      id: data.id,
      status: data.status
    });

    // Validações básicas
    if (!data.titulo || typeof data.titulo !== 'string') {
      return NextResponse.json({ 
        error: 'Título é obrigatório e deve ser uma string' 
      }, { status: 400 });
    }

    if (!data.semana || typeof data.semana !== 'string') {
      return NextResponse.json({ 
        error: 'Semana é obrigatória e deve ser uma string' 
      }, { status: 400 });
    }

    // Preparar dados compatíveis
    const relatorioData = {
      // Campos do admin
      semana: data.semana.trim(),
      dataPublicacao: data.dataPublicacao || new Date().toISOString().split('T')[0],
      autor: data.autor?.trim() || `${user.firstName} ${user.lastName}`,
      titulo: data.titulo.trim(),
      
      // Campos legados para compatibilidade
      date: data.dataPublicacao || data.date || new Date().toISOString().split('T')[0],
      weekOf: data.semana?.trim() || data.weekOf || 'Nova semana',
      
      // Arrays de conteúdo
      macro: Array.isArray(data.macro) ? data.macro : [],
      dividendos: Array.isArray(data.dividendos) ? data.dividendos : [],
      smallCaps: Array.isArray(data.smallCaps) ? data.smallCaps : [],
      microCaps: Array.isArray(data.microCaps) ? data.microCaps : [],
      exteriorStocks: Array.isArray(data.exteriorStocks) ? data.exteriorStocks : [],
      exteriorETFs: Array.isArray(data.exteriorETFs) ? data.exteriorETFs : [],
      exteriorDividendos: Array.isArray(data.exteriorDividendos) ? data.exteriorDividendos : [],
      exteriorProjetoAmerica: Array.isArray(data.exteriorProjetoAmerica) ? data.exteriorProjetoAmerica : [],
      
      // Campos legados
      proventos: Array.isArray(data.proventos) ? data.proventos : [],
      exterior: Array.isArray(data.exterior) ? data.exterior : Array.isArray(data.exteriorStocks) ? data.exteriorStocks : [],
      
      status: data.status || 'draft',
      authorId: user.id
    };
    
    let relatorio;
    let isNewReport = false;
    let wasPublished = false;
    
    if (data.id && data.id !== 'novo') {
      // Tentar atualizar
      try {
        // Verificar status anterior
        const existingReport = await prisma.relatorioSemanal.findUnique({
          where: { id: data.id },
          select: { status: true }
        });

        relatorio = await prisma.relatorioSemanal.update({
          where: { id: data.id },
          data: relatorioData
        });

        // Verificar se foi publicado agora (mudou de draft para published)
        wasPublished = existingReport?.status !== 'published' && relatorio.status === 'published';
        
        console.log('Relatório atualizado:', relatorio.id);
      } catch (updateError) {
        if ((updateError as any).code === 'P2025') {
          // Não encontrou, criar novo
          const { id, ...dataWithoutId } = relatorioData;
          relatorio = await prisma.relatorioSemanal.create({
            data: dataWithoutId
          });
          isNewReport = true;
          wasPublished = relatorio.status === 'published';
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
      isNewReport = true;
      wasPublished = relatorio.status === 'published';
      console.log('Relatório criado:', relatorio.id);
    }

    // Disparar notificação se foi publicado (novo ou atualizado para published)
    if (wasPublished) {
      try {
        const adminName = `${user.firstName} ${user.lastName}`;
        await notifyNewReport(relatorio, adminName);
        console.log('Notificações enviadas para usuários sobre novo relatório');
      } catch (notificationError) {
        console.error('Erro ao enviar notificações:', notificationError);
        // Não falha a criação/atualização se a notificação falhar
      }
    }
    
    // CORREÇÃO: Transformar dados na resposta também
    const relatorioTransformado = transformPrismaData(relatorio);
    
    return NextResponse.json({
      ...relatorioTransformado,
      message: isNewReport ? 'Relatório criado com sucesso' : 'Relatório atualizado com sucesso',
      notificationsSent: wasPublished
    });
    
  } catch (error) {
    console.error('Erro POST relatório:', error);
    
    // Tratamento específico de erros do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: 'Já existe um relatório com estes dados únicos' 
        }, { status: 400 });
      }
      
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Referência de usuário inválida' 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Erro ao salvar relatório',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Deletar relatório
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || user.plan !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID necessário' }, { status: 400 });
    }

    // Verificar se o relatório existe antes de deletar
    const existingReport = await prisma.relatorioSemanal.findUnique({
      where: { id },
      select: { id: true, titulo: true, status: true }
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 });
    }

    // Verificar se pode deletar (por exemplo, não deletar se já publicado)
    if (existingReport.status === 'published') {
      return NextResponse.json({ 
        error: 'Não é possível deletar relatórios já publicados' 
      }, { status: 400 });
    }
    
    await prisma.relatorioSemanal.delete({
      where: { id }
    });
    
    console.log('Relatório deletado:', id);
    return NextResponse.json({ 
      success: true,
      message: 'Relatório deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro DELETE relatório:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ error: 'Relatório não encontrado' }, { status: 404 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Erro ao deletar relatório',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}