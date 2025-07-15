export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de tokens Eduzz para configurações
const EDUZZ_TOKEN_MAPPING: Record<string, { name: string; plan: string; integrationId: string }> = {
  'ED789xyz123abc456': { name: 'Projeto Trump Eduzz', plan: 'VIP', integrationId: 'ED001' },
  'ED456abc789def012': { name: 'Close Friends LITE Eduzz', plan: 'LITE', integrationId: 'ED002' },
  'ED123def456ghi789': { name: 'Projeto FIIs Eduzz', plan: 'FIIS', integrationId: 'ED003' },
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
    console.log(`📚 Webhook Eduzz recebido para token: ${token}`);

    // Verificar se o token existe
    const integration = EDUZZ_TOKEN_MAPPING[token];
    if (!integration) {
      console.log(`❌ Token Eduzz ${token} não encontrado`);
      return NextResponse.json(
        { error: `Token Eduzz ${token} não configurado` },
        { status: 404 }
      );
    }

    console.log(`✅ Integração Eduzz encontrada: ${integration.name} → Plano ${integration.plan}`);

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

    console.log('📦 Dados do webhook Eduzz:', JSON.stringify(webhookData, null, 2));

    // Extrair evento (Eduzz usa diferentes eventos)
    const event = webhookData.event_type || webhookData.event || webhookData.tipo_evento || 'venda_aprovada';
    console.log(`🎯 Evento Eduzz recebido: ${event}`);

    // Extrair informações do Eduzz (estrutura pode variar)
    const saleData = webhookData.sale || webhookData.venda || webhookData.data || webhookData;
    const customerData = saleData.customer || saleData.cliente || saleData;
    
    const buyerEmail = customerData?.email || saleData?.email || webhookData.email;
    const buyerName = customerData?.name || customerData?.nome || saleData?.customer_name || 'Cliente Eduzz';
    const transactionId = saleData?.transaction_id || saleData?.id_transacao || saleData?.id || webhookData.transaction_id || `ED_${Date.now()}`;
    const amount = saleData?.value || saleData?.valor || saleData?.amount || 0;

    console.log('🔍 Dados extraídos do Eduzz:', {
      event, buyerEmail, buyerName, transactionId, amount,
      plan: integration.plan,
      integrationName: integration.name,
      token: token
    });

    // Processar diferentes tipos de eventos Eduzz
    if (event === 'venda_cancelada' || event === 'venda_estornada' || event === 'refund' || event === 'chargeback') {
      // REEMBOLSO/CANCELAMENTO - BLOQUEAR USUÁRIO
      console.log(`🚫 Evento de ${event} no Eduzz - bloqueando usuário`);
      
      if (!buyerEmail || !buyerEmail.includes('@')) {
        console.log('❌ Email inválido para reembolso Eduzz:', buyerEmail);
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
          console.log(`💸 Reembolso Eduzz registrado: -${amount} - ${integration.name}`);
        } catch (purchaseError) {
          console.error('⚠️ Erro ao registrar reembolso Eduzz:', purchaseError);
        }

        await prisma.$disconnect();

        return NextResponse.json({
          success: true,
          message: `Reembolso Eduzz processado - usuário bloqueado`,
          platform: 'Eduzz',
          event: event,
          user: { id: user.id, email: user.email, status: user.status, blocked: true }
        });
      }
    }

    // EVENTOS DE COMPRA (venda_aprovada, venda_finalizada, etc.)
    if (!['venda_aprovada', 'venda_finalizada', 'venda_confirmada', 'payment_confirmed'].includes(event)) {
      console.log(`📝 Evento Eduzz ${event} não processado pelo sistema`);
      return NextResponse.json({
        success: true,
        message: `Evento Eduzz ${event} recebido mas não processado`,
        platform: 'Eduzz',
        event: event
      });
    }

    console.log(`✅ Processando evento de compra Eduzz: ${event}`);

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
      
      console.log(`✅ Usuário atualizado via Eduzz: ${email} → ${integration.plan}`);
      
    } else {
      // CRIAR novo usuário
      console.log(`➕ Criando novo usuário via Eduzz: ${email}`);
      
      const nameParts = buyerName.split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.slice(1).join(' ') || 'Eduzz';
      
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
      
      console.log(`✅ Novo usuário criado via Eduzz: ${email} → ${integration.plan}`);
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
      console.log(`💰 Compra Eduzz registrada: ${amount} - ${integration.name}`);
    } catch (purchaseError) {
      console.error('⚠️ Erro ao registrar compra Eduzz:', purchaseError);
    }

    await prisma.$disconnect();

    const response = {
      success: true,
      message: `Webhook Eduzz processado com sucesso`,
      platform: 'Eduzz',
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

    console.log(`📚 Webhook Eduzz ${token} processado com sucesso:`, response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ Erro no webhook Eduzz ${params.token}:`, error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Erro ao desconectar:', disconnectError);
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        platform: 'Eduzz',
        token: params.token,
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET para status da integração Eduzz
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  const integration = EDUZZ_TOKEN_MAPPING[token];

  if (!integration) {
    return NextResponse.json(
      { error: `Token Eduzz ${token} não encontrado` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    platform: 'Eduzz',
    integration: {
      id: integration.integrationId,
      name: integration.name,
      plan: integration.plan,
      token: token,
      status: 'ACTIVE',
      webhookUrl: `${new URL(request.url).origin}/api/webhooks/eduzz/${token}`
    },
    message: `Integração Eduzz ${integration.name} ativa e funcionando`,
    timestamp: new Date().toISOString()
  });
}