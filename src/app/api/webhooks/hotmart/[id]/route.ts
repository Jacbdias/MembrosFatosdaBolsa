export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de IDs de integração para produtos/planos
const INTEGRATION_MAPPING: Record<string, { productId: string; plan: string; name: string }> = {
  '124159': { productId: 'fb056612-bcc6-4217-9e6d-2a5d1110ac2f', plan: 'VIP', name: 'Projeto Trump' },
  '99519': { productId: 'upgrade-vip-2024', plan: 'VIP', name: 'Troca de Plano - VIP' },
  '99516': { productId: 'projeto-fiis-2024', plan: 'FIIS', name: 'Projeto FIIs' },
  '85078': { productId: 'cf-lite-2024', plan: 'LITE', name: 'Close Friends LITE 2024' },
  '85075': { productId: 'cf-vip-2024', plan: 'VIP', name: 'Close Friends VIP 2024' }
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

// Calcular data de expiração
function calculateExpirationDate(plan: string): Date | null {
  const expirationMap = {
    'VIP': 365,
    'LITE': 365,
    'RENDA_PASSIVA': null, // Vitalício
    'FIIS': null, // Vitalício
    'AMERICA': 365
  };

  const days = expirationMap[plan as keyof typeof expirationMap];
  if (days === null) return null;

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  return expirationDate;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const integrationId = params.id;
    console.log(`🔔 Webhook recebido para integração ID: ${integrationId}`);

    // Verificar se a integração existe
    const integration = INTEGRATION_MAPPING[integrationId];
    if (!integration) {
      console.log(`❌ Integração ${integrationId} não encontrada`);
      return NextResponse.json(
        { error: `Integração ${integrationId} não configurada` },
        { status: 404 }
      );
    }

    console.log(`✅ Integração encontrada: ${integration.name} → Plano ${integration.plan}`);

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

    console.log('📦 Dados do webhook:', JSON.stringify(webhookData, null, 2));

    // Extrair dados do webhook de forma flexível
    const event = webhookData.event || 'PURCHASE_APPROVED';
    const productData = webhookData.data?.product || webhookData.product || webhookData;
    const buyerData = webhookData.data?.buyer || webhookData.buyer || webhookData;
    const purchaseData = webhookData.data?.purchase || webhookData.purchase || webhookData;

    // Extrair informações essenciais
    const buyerEmail = buyerData?.email || webhookData.email;
    const buyerName = buyerData?.name || buyerData?.full_name || webhookData.name || 'Cliente Hotmart';
    const transactionId = purchaseData?.transaction || purchaseData?.transaction_id || 
                         webhookData.transaction || `TXN_${integrationId}_${Date.now()}`;
    const amount = purchaseData?.price?.value || purchaseData?.amount || webhookData.price || 0;

    console.log('🔍 Dados extraídos:', {
      event, buyerEmail, buyerName, transactionId, amount,
      plan: integration.plan,
      integrationName: integration.name
    });

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
          expirationDate: calculateExpirationDate(integration.plan),
          // Manter senha existente se houver
          ...(user.password ? {} : { 
            password: generateSecurePassword(),
            passwordCreatedAt: new Date(),
            mustChangePassword: true 
          })
        }
      });
      
      console.log(`✅ Usuário atualizado: ${email} → ${integration.plan} via integração ${integrationId}`);
      
    } else {
      // CRIAR novo usuário
      console.log(`➕ Criando novo usuário: ${email}`);
      
      const nameParts = buyerName.split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.slice(1).join(' ') || 'Hotmart';
      
      user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          plan: integration.plan,
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(integration.plan),
          password: generateSecurePassword(),
          passwordCreatedAt: new Date(),
          mustChangePassword: true,
          customPermissions: '[]'
        }
      });
      
      console.log(`✅ Novo usuário criado: ${email} → ${integration.plan} via integração ${integrationId}`);
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
      console.log(`💰 Compra registrada: ${amount} - ${integration.name}`);
    } catch (purchaseError) {
      console.error('⚠️ Erro ao registrar compra (não crítico):', purchaseError);
    }

    await prisma.$disconnect();

    const response = {
      success: true,
      message: `Webhook processado com sucesso via integração ${integrationId}`,
      integration: {
        id: integrationId,
        name: integration.name,
        plan: integration.plan
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

    console.log(`🎉 Webhook ${integrationId} processado com sucesso:`, response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ Erro no webhook ${params.id}:`, error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Erro ao desconectar:', disconnectError);
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        integration_id: params.id,
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET para status da integração
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const integrationId = params.id;
  const integration = INTEGRATION_MAPPING[integrationId];

  if (!integration) {
    return NextResponse.json(
      { error: `Integração ${integrationId} não encontrada` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    integration: {
      id: integrationId,
      name: integration.name,
      plan: integration.plan,
      productId: integration.productId,
      status: 'ACTIVE',
      webhookUrl: `${new URL(request.url).origin}/api/webhooks/hotmart/${integrationId}`
    },
    message: `Integração ${integrationId} ativa e funcionando`,
    timestamp: new Date().toISOString()
  });
}