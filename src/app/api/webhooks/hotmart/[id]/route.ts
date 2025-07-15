export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeamento de TOKENS para configurações (não mais Product IDs!)
const TOKEN_MAPPING: Record<string, { name: string; plan: string; integrationId: string }> = {
  'EtgWA9f64vpgWvg6m9oSSnpn': { name: 'Projeto Trump', plan: 'VIP', integrationId: '124159' },
  'Abc123def456ghi789jkl012': { name: 'Troca de Plano - VIP', plan: 'VIP', integrationId: '99519' },
  'Xyz789uvw456rst123opq890': { name: 'Projeto FIIs', plan: 'FIIS', integrationId: '99516' },
  'Mno345pqr678stu901vwx234': { name: 'Close Friends LITE 2024', plan: 'LITE', integrationId: '85078' },
  'Def567ghi890jkl123mno456': { name: 'Close Friends VIP 2024', plan: 'VIP', integrationId: '85075' }
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
function calculateExpirationDate(plan: string): Date {
  // TODOS os planos têm duração de 1 ano (365 dias)
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 365);
  
  console.log(`📅 Plano ${plan}: Expira em ${expirationDate.toISOString().split('T')[0]} (365 dias a partir de hoje)`);
  
  return expirationDate;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = params.id; // Este é o token único da integração
    console.log(`🔔 Webhook recebido para token: ${token}`);

    // Verificar se o token existe
    const integration = TOKEN_MAPPING[token];
    if (!integration) {
      console.log(`❌ Token ${token} não encontrado`);
      return NextResponse.json(
        { error: `Token ${token} não configurado` },
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

    // Extrair evento
    const event = webhookData.event || 'PURCHASE_APPROVED';
    console.log(`🎯 Evento recebido: ${event}`);

    // Extrair informações básicas para todos os eventos
    const buyerData = webhookData.data?.buyer || webhookData.buyer || webhookData;
    const purchaseData = webhookData.data?.purchase || webhookData.purchase || webhookData;
    const productData = webhookData.data?.product || webhookData.product || webhookData;
    const buyerEmail = buyerData?.email || webhookData.email;
    const buyerName = buyerData?.name || buyerData?.full_name || webhookData.name || 'Cliente Hotmart';
    const transactionId = purchaseData?.transaction || purchaseData?.transaction_id || 
                         webhookData.transaction || `TXN_${integration.integrationId}_${Date.now()}`;
    const amount = purchaseData?.price?.value || purchaseData?.amount || webhookData.price || 0;

    // Processar diferentes tipos de eventos
    if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CANCELLED' || event === 'PURCHASE_CHARGEBACK') {
      // REEMBOLSO/CANCELAMENTO - BLOQUEAR USUÁRIO
      console.log(`🚫 Evento de ${event} recebido - bloqueando usuário`);
      
      if (!buyerEmail || !buyerEmail.includes('@')) {
        console.log('❌ Email inválido para reembolso:', buyerEmail);
        return NextResponse.json({
          error: 'Email do comprador é obrigatório para processar reembolso',
          received_email: buyerEmail
        }, { status: 400 });
      }

      // Conectar ao banco
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
            // Opcional: definir data de expiração para ontem (força expiração)
            expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        });

        // Registrar reembolso
        try {
          await prisma.purchase.create({
            data: {
              userId: user.id,
              amount: -(amount || 0), // Valor negativo para reembolso
              productName: `${integration.name} - REEMBOLSO`,
              hotmartTransactionId: transactionId,
              status: 'REFUNDED'
            }
          });
          console.log(`💸 Reembolso registrado: -${amount} - ${integration.name}`);
        } catch (purchaseError) {
          console.error('⚠️ Erro ao registrar reembolso (não crítico):', purchaseError);
        }

        await prisma.$disconnect();

        const response = {
          success: true,
          message: `Reembolso processado - usuário bloqueado`,
          event: event,
          integration: {
            id: integration.integrationId,
            name: integration.name,
            plan: integration.plan,
            token: token
          },
          user: {
            id: user.id,
            email: user.email,
            status: user.status,
            blocked: true
          },
          refund: {
            id: transactionId,
            amount: amount,
            product: integration.name
          },
          timestamp: new Date().toISOString()
        };

        console.log(`🚫 Reembolso ${token} processado - usuário bloqueado:`, response);
        return NextResponse.json(response);

      } else {
        // Usuário não encontrado para reembolso
        await prisma.$disconnect();
        console.log(`⚠️ Usuário ${email} não encontrado para reembolso`);
        
        return NextResponse.json({
          success: true,
          message: 'Usuário não encontrado - reembolso registrado',
          email: email,
          event: event
        });
      }
    }

    // EVENTOS DE COMPRA (comportamento atual mantido)
    if (!['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_PAID'].includes(event)) {
      console.log(`📝 Evento ${event} não processado pelo sistema`);
      return NextResponse.json({
        success: true,
        message: `Evento ${event} recebido mas não processado`,
        event: event
      });
    }

    console.log(`✅ Processando evento de compra: ${event}`);

    console.log('🔍 Dados extraídos para compra:', {
      event, buyerEmail, buyerName, transactionId, amount,
      plan: integration.plan,
      integrationName: integration.name,
      token: token
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
      
      console.log(`✅ Usuário atualizado: ${email} → ${integration.plan} via token ${token}`);
      
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
      
      console.log(`✅ Novo usuário criado: ${email} → ${integration.plan} via token ${token}`);
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
      message: `Webhook processado com sucesso via token ${token}`,
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

    console.log(`🎉 Webhook ${token} processado com sucesso:`, response);

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
        token: params.id,
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
  const token = params.id;
  const integration = TOKEN_MAPPING[token];

  if (!integration) {
    return NextResponse.json(
      { error: `Token ${token} não encontrado` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    integration: {
      id: integration.integrationId,
      name: integration.name,
      plan: integration.plan,
      token: token,
      status: 'ACTIVE',
      webhookUrl: `${new URL(request.url).origin}/api/webhooks/hotmart/${token}`
    },
    message: `Integração ${integration.name} ativa e funcionando`,
    timestamp: new Date().toISOString()
  });
}