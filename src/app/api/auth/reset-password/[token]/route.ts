import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { password, confirmPassword } = await request.json();
    const token = params.token;

    console.log('🔐 Confirmando reset com token:', token);

    // Validar dados
    if (!password || !confirmPassword) {
      return NextResponse.json({ 
        error: 'Senha e confirmação são obrigatórias' 
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ 
        error: 'Senhas não coincidem' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      }, { status: 400 });
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return NextResponse.json({ 
        error: 'Token inválido ou expirado' 
      }, { status: 400 });
    }

    // Verificar se token não foi usado
    if (resetToken.used) {
      return NextResponse.json({ 
        error: 'Token já foi utilizado' 
      }, { status: 400 });
    }

    // Verificar se token não expirou
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Token expirado' 
      }, { status: 400 });
    }

    console.log('✅ Token válido para usuário:', resetToken.user.email);

    // Hash da nova senha
    const senhaHash = await hashPassword(password);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: senhaHash,
        passwordCreatedAt: new Date(),
        mustChangePassword: false,
        loginAttempts: 0,
        lockedUntil: null
      }
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    console.log('🎉 Senha redefinida com sucesso para:', resetToken.user.email);

    return NextResponse.json({
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao redefinir senha:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET - Verificar se token é válido
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { email: true, firstName: true } } }
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ 
        valid: false,
        error: 'Token inválido ou expirado' 
      });
    }

    return NextResponse.json({
      valid: true,
      user: {
        email: resetToken.user.email,
        firstName: resetToken.user.firstName
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return NextResponse.json({ 
      valid: false,
      error: 'Erro interno do servidor' 
    });
  } finally {
    await prisma.$disconnect();
  }
}