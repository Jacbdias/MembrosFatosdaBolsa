// src/app/api/hotmart/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { gerarSenhaSegura, hashPassword } from '@/lib/auth/password';
import { enviarEmailCredenciais } from '@/lib/auth/email';

const prisma = new PrismaClient();

// Mapeamento: Produto Hotmart → Plano do Sistema
const PRODUCT_PLAN_MAPPING = {
  // SUBSTITUA pelos IDs reais dos seus produtos na Hotmart
  'produto-vip-123': 'VIP',
  'produto-lite-456': 'LITE', 
  'produto-renda-passiva-789': 'RENDA_PASSIVA',
  'produto-fiis-101': 'FIIS',
  'produto-america-202': 'AMERICA'
};

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook Hotmart recebido');
    
    const webhookData = await request.json();
    console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2));
    
    // Verificar estrutura do webhook da Hotmart
    const event = webhookData.event;
    const data = webhookData.data;
    
    if (!data) {
      console.log('❌ Webhook sem dados válidos');
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Extrair informações (ajuste conforme estrutura real da Hotmart)
    const {
      product,
      buyer,
      purchase
    } = data;

    const productId = product?.id || product?.ucode;
    const productName = product?.name;
    const buyerEmail = buyer?.email;
    const buyerName = buyer?.name;
    const transactionId = purchase?.transaction;
    const amount = purchase?.price?.value || purchase?.price;
    const status = purchase?.status;

    console.log('📋 Dados extraídos:', {
      event,
      productId,
      productName,
      buyerEmail,
      buyerName,
      transactionId,
      amount,
      status
    });

    // Só processar vendas aprovadas
    if (event !== 'PURCHASE_APPROVED' && event !== 'PURCHASE_COMPLETE') {
      console.log(`⚠️ Evento ${event} ignorado - só processamos vendas aprovadas`);
      return NextResponse.json({ message: 'Evento ignorado' });
    }

    if (!buyerEmail) {
      console.log('❌ Email do comprador não encontrado');
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
    }

    // Determinar plano baseado no produto
    const plan = PRODUCT_PLAN_MAPPING[productId];
    if (!plan) {
      console.log(`❌ Produto ${productId} não mapeado. Produtos disponíveis:`, Object.keys(PRODUCT_PLAN_MAPPING));
      return NextResponse.json({ error: 'Produto não reconhecido' }, { status: 400 });
    }

    console.log(`✅ Produto ${productName} (${productId}) → Plano ${plan}`);

    // Verificar se usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: buyerEmail }
    });

    let senhaGerada = '';
    let isNewUser = false;

    if (user) {
      console.log(`👤 Usuário existente encontrado: ${buyerEmail}`);
      
      // Se usuário existente não tem senha, gerar uma
      if (!user.password) {
        console.log('🔑 Usuário sem senha - gerando nova senha');
        senhaGerada = gerarSenhaSegura();
        const senhaHash = await hashPassword(senhaGerada);
        
        // Atualizar usuário existente com senha e novos dados
        user = await prisma.user.update({
          where: { email: buyerEmail },
          data: {
            plan: plan as any,
            status: 'ACTIVE',
            hotmartCustomerId: transactionId,
            expirationDate: calculateExpirationDate(plan),
            password: senhaHash,
            passwordCreatedAt: new Date(),
            mustChangePassword: true,
            totalPurchases: (user.totalPurchases || 0) + amount,
            purchaseCount: (user.purchaseCount || 0) + 1
          }
        });
        
        isNewUser = true; // Para enviar email
      } else {
        // Atualizar plano e dados Hotmart (sem mexer na senha)
        user = await prisma.user.update({
          where: { email: buyerEmail },
          data: {
            plan: plan as any,
            status: 'ACTIVE',
            hotmartCustomerId: transactionId,
            expirationDate: calculateExpirationDate(plan),
            totalPurchases: (user.totalPurchases || 0) + amount,
            purchaseCount: (user.purchaseCount || 0) + 1
          }
        });
        
        console.log(`✅ Usuário atualizado sem alterar senha`);
      }
    } else {
      console.log(`👤 Criando novo usuário: ${buyerEmail}`);
      
      // Extrair nome
      const nameParts = buyerName ? buyerName.split(' ') : ['Usuário', 'Hotmart'];
      const firstName = nameParts[0] || 'Usuário';
      const lastName = nameParts.slice(1).join(' ') || 'Hotmart';
      
      // 🆕 Gerar senha para novo usuário
      senhaGerada = gerarSenhaSegura();
      const senhaHash = await hashPassword(senhaGerada);
      console.log(`🔑 Senha gerada para ${buyerEmail}: ${senhaGerada}`);
      
      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          email: buyerEmail,
          firstName: firstName,
          lastName: lastName,
          plan: plan as any,
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(plan),
          password: senhaHash,
          passwordCreatedAt: new Date(),
          mustChangePassword: true,
          customPermissions: '[]', // Inicia sem permissões extras
          totalPurchases: amount || 0,
          purchaseCount: 1
        }
      });
      
      isNewUser = true;
    }

    // Registrar a compra
    await prisma.purchase.create({
      data: {
        userId: user.id,
        amount: amount || 0,
        productName: productName || `Produto ${productId}`,
        hotmartTransactionId: transactionId,
        status: 'COMPLETED'
      }
    });

    // 🆕 Enviar email com credenciais para novos usuários ou usuários sem senha
    if (isNewUser && senhaGerada) {
      try {
        console.log(`📧 Enviando email com credenciais para ${buyerEmail}`);
        await enviarEmailCredenciais(buyerEmail, user.firstName, senhaGerada);
        console.log(`✅ Email enviado com sucesso para ${buyerEmail}`);
      } catch (emailError) {
        console.error(`❌ Erro ao enviar email para ${buyerEmail}:`, emailError);
        // Não falhar o webhook por erro de email
      }
    }

    console.log(`🎉 Acesso liberado para ${buyerEmail} - Plano ${plan}`);

    return NextResponse.json({ 
      message: 'Usuário processado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        status: user.status,
        emailSent: isNewUser && !!senhaGerada
      }
    });

  } catch (error) {
    console.error('❌ Erro no webhook Hotmart:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Função para calcular data de expiração
function calculateExpirationDate(plan: string): Date | null {
  const expirationMap = {
    'VIP': 365,      // 1 ano
    'LITE': 365,     // 1 ano  
    'RENDA_PASSIVA': null, // Vitalício
    'FIIS': null,    // Vitalício
    'AMERICA': 365   // 1 ano
  };

  const days = expirationMap[plan as keyof typeof expirationMap];
  if (days === null) return null; // Acesso vitalício

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
}

// GET para testar se a API está funcionando
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook Hotmart funcionando',
    timestamp: new Date().toISOString(),
    products: Object.keys(PRODUCT_PLAN_MAPPING)
  });
}