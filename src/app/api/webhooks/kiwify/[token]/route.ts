export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de tokens Kiwify para configurações
const KIWIFY_TOKEN_MAPPING: Record<string, { name: string; plan: string; integrationId: string }> = {
  'KW123abc456def789': { name: 'Projeto Trump Kiwify', plan: 'VIP', integrationId: 'KW001' },
  'KW456def789ghi012': { name: 'Close Friends LITE Kiwify', plan: 'LITE', integrationId: 'KW002' },
  // Adicionar mais conforme necessário
};

// Função para gerar senha segura
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let password = '';
  
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 2; i++) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Calcular data de expiração - TODOS OS PLANOS = 1 ANO
function calculateExpirationDate(): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 365);
  return expirationDate;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    console.log(`🥝 Webhook Kiwify recebido para token: ${token}`);

    // Verificar se o token existe
    const integration = KIWIFY_TOKEN_MAPPING[token];
    if (!integration) {
      console.log(`❌ Token Kiwify ${token} não encontrado`);
      return NextResponse.json(
        { error: `Token Kiwify ${token} não configurado` },
        { status: 404 }
      );
    }

    console.log(`✅ Integração Kiwify encontrada: ${integration.name} → Plano ${integration.plan}`);

    let webhookData;
    try {
      webhookData = await request.json();
    } catch (jsonError) {
      console.error('❌ Erro ao parsear JSON:', jsonError);
      return NextResponse.json(
        { error: 'JSON inválido' },
        { status: 400 }
      );
    }

    console.log('📦 Dados do webhook Kiwify:', JSON.stringify(webhookData, null, 2));

    // Extrair evento (Kiwify usa diferentes eventos)
    const event = webhookData.event || webhookData.type || 'order.paid';
    console.log(`🎯 Evento Kiwify recebido: ${event}`);

    // Extrair informações do Kiwify (estrutura diferente do Hotmart)
    const orderData = webhookData.order || webhookData.data || webhookData;
    const customerData = orderData.Customer || orderData.customer || orderData;
    
    const buyerEmail = customerData?.email || orderData?.email || webhookData.email;
    const buyerName = customerData?.name || customerData?.full_name || orderData?.customer_name || 'Cliente Kiwify';
    const transactionId = orderData?.order_id || orderData?.id || webhookData.order_id || `KW_${Date.now()}`;
    const amount = orderData?.total_value || orderData?.amount || orderData?.value || 0;

    console.log('🔍 Dados extraídos do Kiwify:', {
      event, buyerEmail, buyerName, transactionId, amount,
      plan: integration.plan,
      integrationName: integration.name,
      token: token
    });

    // Processar diferentes tipos de eventos Kiwify
    if (event === 'order.refunded' || event === 'order.cancelled' || event === 'order.chargeback') {
      // REEMBOLSO/CANCELAMENTO - BLOQUEAR USUÁRIO
      console.log(`🚫 Evento de ${event} no Kiwify - bloqueando usuário`);
      
      if (!buyerEmail || !buyerEmail.includes('@')) {
        console.log('❌ Email inválido para reembolso Kiwify:', buyerEmail);
        return NextResponse.json({
          error: 'Email do comprador é obrigatório para processar reembolso',
          received_email: buyerEmail
        }, { status: 400 });
      }

      await prisma.$connect();

      const email = buyerEmail.toLowerCase().trim();
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        // BLOQUEAR usuário por reembolso
        user = await prisma.user.update({
          where: { email },
          data: {
            status: 'INACTIVE',
            expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Ontem
          }
        });

        // Registrar reembolso
        try {
          await prisma.purchase.create({
            data: {
              userId: user.id,
              amount: -(amount || 0),
              productName: `${integration.name} - REEMBOLSO`,
              hotmartTransactionId: transactionId,
              status: 'REFUNDED'
            }
          });
          console.log(`💸 Reembolso Kiwify registrado: -${amount} - ${integration.name}`);
        } catch (purchaseError) {
          console.error('⚠️ Erro ao registrar reembolso Kiwify:', purchaseError);
        }

        await prisma.$disconnect();

        return NextResponse.json({
          success: true,
          message: `Reembolso Kiwify processado - usuário bloqueado`,
          platform: 'Kiwify',
          event: event,
          user: { id: user.id, email: user.email, status: user.status, blocked: true }
        });
      }
    }

    // EVENTOS DE COMPRA (order.paid, order.approved, etc.)
    if (!['order.paid', 'order.approved', 'order.completed'].includes(event)) {
      console.log(`📝 Evento Kiwify ${event} não processado pelo sistema`);
      return NextResponse.json({
        success: true,
        message: `Evento Kiwify ${event} recebido mas não processado`,
        platform: 'Kiwify',
        event: event
      });
    }

    console.log(`✅ Processando evento de compra Kiwify: ${event}`);

    // Validação mínima
    if (!buyerEmail || !buyerEmail.includes('@')) {
      console.log('❌ Email inválido:', buyerEmail);
      return NextResponse.json({
        error: 'Email do comprador é obrigatório e deve ser válido',
        received_email: buyerEmail
      }, { status: 400 });
    }

    // Conectar ao banco
    await prisma.$connect();

    // Verificar se usuário já existe
    const email = buyerEmail.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // ATUALIZAR usuário existente
      console.log(`🔄 Atualizando usuário existente: ${email}`);
      
      user = await prisma.user.update({
        where: { email },
        data: {
          plan: integration.plan,
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(),
          // Manter senha existente se houver
          ...(user.password ? {} : { 
            password: generateSecurePassword(),
            passwordCreatedAt: new Date(),
            mustChangePassword: true 
          })
        }
      });
      
      console.log(`✅ Usuário atualizado via Kiwify: ${email} → ${integration.plan}`);
      
    } else {
      // CRIAR novo usuário
      console.log(`➕ Criando novo usuário via Kiwify: ${email}`);
      
      const nameParts = buyerName.split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.slice(1).join(' ') || 'Kiwify';
      
      user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          plan: integration.plan,
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(),
          password: generateSecurePassword(),
          passwordCreatedAt: new Date(),
          mustChangePassword: true,
          customPermissions: '[]'
        }
      });
      
      console.log(`✅ Novo usuário criado via Kiwify: ${email} → ${integration.plan}`);
    }

    // Registrar compra
    try {
      await prisma.purchase.create({
        data: {
          userId: user.id,
          amount: amount || 0,
          productName: integration.name,
          hotmartTransactionId: transactionId,
          status: 'COMPLETED'
        }
      });
      console.log(`💰 Compra Kiwify registrada: ${amount} - ${integration.name}`);
    } catch (purchaseError) {
      console.error('⚠️ Erro ao registrar compra Kiwify:', purchaseError);
    }

    await prisma.$disconnect();

    const response = {
      success: true,
      message: `Webhook Kiwify processado com sucesso`,
      platform: 'Kiwify',
      integration: {
        id: integration.integrationId,
        name: integration.name,
        plan: integration.plan,
        token: token
      },
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        status: user.status,
        isNewUser: !user.password
      },
      transaction: {
        id: transactionId,
        amount: amount,
        product: integration.name
      },
      timestamp: new Date().toISOString()
    };

    console.log(`🥝 Webhook Kiwify ${token} processado com sucesso:`, response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ Erro no webhook Kiwify ${params.token}:`, error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Erro ao desconectar:', disconnectError);
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        platform: 'Kiwify',
        token: params.token,
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET para status da integração Kiwify
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  const integration = KIWIFY_TOKEN_MAPPING[token];

  if (!integration) {
    return NextResponse.json(
      { error: `Token Kiwify ${token} não encontrado` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    platform: 'Kiwify',
    integration: {
      id: integration.integrationId,
      name: integration.name,
      plan: integration.plan,
      token: token,
      status: 'ACTIVE',
      webhookUrl: `${new URL(request.url).origin}/api/webhooks/kiwify/${token}`
    },
    message: `Integração Kiwify ${integration.name} ativa e funcionando`,
    timestamp: new Date().toISOString()
  });
}