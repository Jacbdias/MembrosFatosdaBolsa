// src/app/api/admin/instagram-cadastros/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 API Admin chamada...');
    
    // Buscar todos os cadastros sem verificação (TEMPORÁRIO)
    const cadastros = await prisma.instagramCadastro.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            plan: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Cadastros encontrados:', cadastros.length);

    return NextResponse.json({
      success: true,
      data: cadastros,
      total: cadastros.length
    });

  } catch (error) {
    console.error('💥 Erro ao buscar cadastros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cadastroId = searchParams.get('id');

    if (!cadastroId) {
      return NextResponse.json(
        { error: 'ID do cadastro é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.instagramCadastro.delete({
      where: { id: cadastroId }
    });

    return NextResponse.json({
      success: true,
      message: 'Cadastro removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover cadastro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}