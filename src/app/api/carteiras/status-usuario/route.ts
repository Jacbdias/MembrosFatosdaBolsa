// src/app/api/carteiras/status-usuario/route.ts

export const dynamic = 'force-dynamic'; // 👈 ADICIONAR ESTA LINHA AQUI

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('🔍 Verificando status para usuário:', session.user.id);

    // Verificar se o usuário já enviou uma carteira
    const carteiraExistente = await prisma.carteiraAnalise.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        status: true,
        dataEnvio: true,
        nomeArquivo: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc' // Pegar a mais recente
      }
    });

    const jaEnviou = !!carteiraExistente;

    console.log('📊 Resultado da verificação:', {
      userId: session.user.id,
      jaEnviou,
      carteira: carteiraExistente
    });

    return NextResponse.json({
      jaEnviou,
      carteira: carteiraExistente ? {
        id: carteiraExistente.id,
        status: carteiraExistente.status.toLowerCase(),
        dataEnvio: carteiraExistente.dataEnvio,
        nomeArquivo: carteiraExistente.nomeArquivo
      } : null
    });

  } catch (error) {
    console.error('❌ Erro ao verificar status do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}