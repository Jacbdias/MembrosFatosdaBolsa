// src/app/api/questions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Buscar pergunta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            plan: true
          }
        },
        answers: {
          include: {
            admin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Verificar permissão: usuário só pode ver suas próprias perguntas ou ser admin
    const isAdmin = user.plan === 'ADMIN';
    const isOwner = question.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Marcar respostas como lidas pelo usuário se for o dono
    if (isOwner && !isAdmin) {
      const unreadAnswerIds = question.answers
        .filter(answer => !answer.readByUser)
        .map(answer => answer.id);

      if (unreadAnswerIds.length > 0) {
        await prisma.answer.updateMany({
          where: {
            id: { in: unreadAnswerIds }
          },
          data: {
            readByUser: true
          }
        });
      }
    }

    return NextResponse.json({ question, isAdmin, isOwner });

  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Atualizar pergunta (fechar, alterar status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, priority } = body;

    const isAdmin = user.plan === 'ADMIN';
    const isOwner = question.userId === user.id;

    // Verificar permissões para diferentes ações
    if (status === 'FECHADA') {
      // Admin pode fechar qualquer pergunta, usuário só pode fechar suas próprias
      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else if (status && status !== 'FECHADA') {
      // Só admin pode alterar status para outros valores
      if (!isAdmin) {
        return NextResponse.json({ error: 'Only admins can change question status' }, { status: 403 });
      }
    }

    if (priority && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can change priority' }, { status: 403 });
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      if (status === 'FECHADA') {
        updateData.closedAt = new Date();
        updateData.closedBy = user.id;
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            plan: true
          }
        },
        answers: {
          include: {
            admin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ question: updatedQuestion });

  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Deletar pergunta (só admin ou dono)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isAdmin = user.plan === 'ADMIN';
    const isOwner = question.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Deletar pergunta (cascata vai deletar as respostas)
    await prisma.question.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Question deleted successfully' });

  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}