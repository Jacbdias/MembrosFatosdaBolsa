import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { gerarTokenReset } from '@/lib/auth/password';
import { enviarEmailResetSenha } from '@/lib/auth/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log('🔑 Solicitação de reset para:', email);

    // Validar email
    if (!email) {
      return NextResponse.json({ 
        error: 'Email é obrigatório' 
      }, { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Por segurança, não revelar se email existe ou não
      console.log('❌ Email não encontrado:', email);
      return NextResponse.json({ 
        message: 'Se o email existir, você receberá instruções para redefinir a senha' 
      });
    }

    console.log('✅ Usuário encontrado:', user.firstName, user.lastName);

    // Gerar token de reset
    const { token, expiresAt } = gerarTokenReset();
    console.log('🎫 Token gerado:', token);

    // Salvar token no banco
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        used: false
      }
    });

    // Enviar email
    try {
      await enviarEmailResetSenha(user.email, user.firstName, token);
      console.log('📧 Email de reset enviado para:', user.email);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      // Não falhar a operação por erro de email
    }

    return NextResponse.json({
      message: 'Se o email existir, você receberá instruções para redefinir a senha'
    });

  } catch (error) {
    console.error('❌ Erro no reset de senha:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}