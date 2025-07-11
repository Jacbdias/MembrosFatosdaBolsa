import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAuth(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (userEmail === 'admin@fatosdobolsa.com') {
      return {
        id: 'ADM-001',
        firstName: 'Admin',
        lastName: 'Sistema',
        email: userEmail,
        plan: 'ADMIN'
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return null;
  }
}

// GET - Buscar dados do usuário + compras
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    console.log('🔍 Buscando usuário com ID:', userId);
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado:', userId);
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Buscar também as compras do usuário
    const purchases = await prisma.purchase.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    const formattedPurchases = purchases.map(purchase => ({
      id: purchase.id,
      amount: purchase.amount,
      date: purchase.createdAt.toISOString(),
      product: purchase.productName || 'Produto não especificado',
      status: purchase.status,
      hotmartTransactionId: purchase.hotmartTransactionId
    }));

    // Formatar os dados do usuário conforme esperado pelo frontend
    const formattedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || undefined,
      plan: user.plan,
      status: user.status,
      hotmartCustomerId: user.hotmartCustomerId || undefined,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      totalPurchases: user.totalPurchases || 0,
      purchaseCount: user.purchaseCount || 0,
      expirationDate: user.expirationDate?.toISOString(),
      customPermissions: user.customPermissions || []
    };

    console.log(`✅ Encontradas ${purchases.length} compras para o usuário`);

    return NextResponse.json({ 
      user: formattedUser,
      purchases: formattedPurchases 
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados do usuário
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    const userData = await request.json();
    
    console.log('🔄 Atualizando usuário:', userId);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Preparar dados para atualização
    const updateData: any = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      plan: userData.plan,
      status: userData.status,
      customPermissions: userData.customPermissions || []
    };

    // Só atualizar expirationDate se foi fornecida
    if (userData.expirationDate) {
      updateData.expirationDate = new Date(userData.expirationDate);
    } else if (userData.expirationDate === null || userData.expirationDate === '') {
      updateData.expirationDate = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    console.log('✅ Usuário atualizado:', updatedUser.email);

    // Formatar resposta
    const formattedUser = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      avatar: updatedUser.avatar || undefined,
      plan: updatedUser.plan,
      status: updatedUser.status,
      hotmartCustomerId: updatedUser.hotmartCustomerId || undefined,
      createdAt: updatedUser.createdAt.toISOString(),
      lastLogin: updatedUser.lastLogin?.toISOString(),
      totalPurchases: updatedUser.totalPurchases || 0,
      purchaseCount: updatedUser.purchaseCount || 0,
      expirationDate: updatedUser.expirationDate?.toISOString(),
      customPermissions: updatedUser.customPermissions || []
    };

    return NextResponse.json({ user: formattedUser });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir usuário
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    console.log('🗑️ Excluindo usuário:', userId);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Excluir relacionamentos primeiro (se necessário)
    await prisma.purchase.deleteMany({ where: { userId } });
    
    // Excluir usuário
    await prisma.user.delete({
      where: { id: userId }
    });

    console.log('✅ Usuário excluído:', existingUser.email);

    return NextResponse.json({ message: 'Usuário excluído com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}