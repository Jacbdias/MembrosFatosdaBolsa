// ===== ARQUIVO CORRIGIDO: src/app/api/meus-ativos/[carteira]/reorder/route.ts =====

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CARTEIRA_MODELS = {
  microCaps: 'userMicroCaps',
  smallCaps: 'userSmallCaps', 
  dividendos: 'userDividendos',
  fiis: 'userFiis',
  dividendosInternacional: 'userDividendosInternacional',
  etfs: 'userEtfs',
  projetoAmerica: 'userProjetoAmerica',
  exteriorStocks: 'userExteriorStocks'
} as const;

// 🔥 MESMA FUNÇÃO DE AUTH
async function getAuthenticatedUser(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  
  if (!userEmail) {
    return null;
  }

  if (userEmail === 'admin@fatosdobolsa.com') {
    return {
      id: 'ADM-001',
      firstName: 'Admin',
      lastName: 'Sistema',
      email: userEmail,
      plan: 'ADMIN',
      status: 'ACTIVE'
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        plan: true,
        status: true
      }
    });

    return user;
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

// POST - Reordenar ativos
export async function POST(request: NextRequest, { params }: { params: { carteira: string } }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carteira } = params;
    const { novosAtivos } = await request.json();
    
    const modelName = CARTEIRA_MODELS[carteira as keyof typeof CARTEIRA_MODELS];
    if (!modelName) {
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }

    const model = (prisma as any)[modelName];

    console.log(`🔄 Reordenando ${novosAtivos.length} ativos da carteira ${carteira}`);

    // Atualizar em transação
    await prisma.$transaction(
      novosAtivos.map((ativo: any) => 
        model.update({
          where: { 
            id: ativo.id,
            userId: user.id 
          },
          data: { 
            editadoEm: new Date().toISOString()
          }
        })
      )
    );

    console.log(`✅ Reordenação da carteira ${carteira} concluída`);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('❌ Erro na reordenação:', error);
    return NextResponse.json({ 
      error: 'Erro ao reordenar',
      details: (error as Error).message 
    }, { status: 500 });
  }
}