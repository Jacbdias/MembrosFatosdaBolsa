import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE carteira ID:', params.id);
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.plan !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Acesso negado. Apenas administradores podem deletar carteiras.' 
      }, { status: 403 });
    }

    // Buscar carteira com dados do usuário
    const carteira = await prisma.carteiraAnalise.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { 
            firstName: true, 
            lastName: true, 
            email: true 
          }
        },
        ativos: true // Incluir ativos para contagem
      }
    });

    if (!carteira) {
      return NextResponse.json({ 
        error: 'Carteira não encontrada' 
      }, { status: 404 });
    }

    console.log(`Carteira encontrada: ${carteira.nomeArquivo} (${carteira.ativos.length} ativos)`);

    // Como tem onDelete: Cascade, só precisa deletar a carteira
    // Os ativos serão deletados automaticamente
    await prisma.carteiraAnalise.delete({
      where: { id: params.id }
    });

    console.log(`Carteira ${params.id} deletada por ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Carteira de ${carteira.user.firstName} ${carteira.user.lastName} removida com sucesso`,
      clienteEmail: carteira.user.email,
      details: {
        carteiraId: params.id,
        ativosRemovidos: carteira.ativos.length,
        adminEmail: session.user.email
      }
    });

  } catch (error) {
    console.error('Erro ao deletar carteira:', error);
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}