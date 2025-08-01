import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🗑️ DELETE - Excluir múltiplos relatórios por IDs
export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    // Validar entrada
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'É necessário fornecer um array de IDs para exclusão' 
        },
        { status: 400 }
      );
    }

    // Verificar se todos os IDs são strings válidas
    const idsValidos = ids.filter(id => typeof id === 'string' && id.trim().length > 0);
    
    if (idsValidos.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhum ID válido fornecido' 
        },
        { status: 400 }
      );
    }

    // Buscar relatórios existentes antes da exclusão (para log)
    const relatoriosExistentes = await prisma.relatorio.findMany({
      where: {
        id: {
          in: idsValidos
        }
      },
      select: {
        id: true,
        ticker: true,
        nome: true
      }
    });

    if (relatoriosExistentes.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhum relatório encontrado com os IDs fornecidos' 
        },
        { status: 404 }
      );
    }

    // Executar exclusão em lote
    const resultado = await prisma.relatorio.deleteMany({
      where: {
        id: {
          in: idsValidos
        }
      }
    });

    console.log(`🗑️ Relatórios excluídos em lote:`, {
      idsEnviados: idsValidos.length,
      relatoriosEncontrados: relatoriosExistentes.length,
      relatoriosExcluidos: resultado.count,
      detalhes: relatoriosExistentes.map(r => `${r.ticker} - ${r.nome}`)
    });

    return NextResponse.json({
      success: true,
      message: `${resultado.count} relatórios excluídos com sucesso`,
      relatoriosExcluidos: resultado.count,
      detalhes: relatoriosExistentes
    });

  } catch (error) {
    console.error('Erro ao excluir múltiplos relatórios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao excluir relatórios',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}