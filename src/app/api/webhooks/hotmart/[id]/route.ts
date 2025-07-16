export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password'; // ✅ ADICIONADO

const prisma = new PrismaClient();

// ✅ TOKEN ÚNICO DA HOTMART CONFIGURADO
const TOKEN_MAPPING: Record<string, { name: string; plan: string; integrationId: string }> = {
  'TokendYNZMSBlDXyWPST3VZPSsaqe3JfKYJ': { name: 'Produto Fatos da Bolsa Hotmart', plan: 'VIP', integrationId: 'HM001' }, // Será substituído pela detecção automática
};

// 🔍 FUNÇÃO PARA DETECTAR PLANO AUTOMATICAMENTE PELOS SEUS PRODUTOS HOTMART
function detectarPlanoHotmart(webhookData: any): { plan: string; productName: string } {
  try {
    console.log('🔍 Detectando plano do produto Hotmart:', webhookData);
    
    // Extrair nome do produto de diferentes campos possíveis da Hotmart
    const productData = webhookData.data?.product || webhookData.product || {};
    const productName = productData?.name || 
                       productData?.product_name ||
                       productData?.title ||
                       webhookData.product_name ||
                       webhookData.name ||
                       '';
    
    console.log(`📋 Nome do produto Hotmart recebido: "${productName}"`);
    
    // 🔍 DETECTAR POR NOME (seus produtos reais na Hotmart)
    const produtoLower = productName.toLowerCase();
    
    // 🌟 CLOSE FRIENDS LITE 2.0 (detectar PRIMEIRO - mais específico)
    if (produtoLower.includes('close friends lite 2.0') || 
        produtoLower.includes('cf lite 2.0') ||
        produtoLower.includes('lite 2.0') ||
        produtoLower.includes('lite v2')) {
      return { 
        plan: 'LITE_V2', 
        productName: `Close Friends LITE 2.0 Hotmart - ${productName}` 
      };
    }
    
    // ⭐ CLOSE FRIENDS LITE ORIGINAL
    if (produtoLower.includes('close friends lite') || 
        produtoLower.includes('cf lite') ||
        (produtoLower.includes('lite') && !produtoLower.includes('2.0') && !produtoLower.includes('v2'))) {
      return { 
        plan: 'LITE', 
        productName: `Close Friends LITE Hotmart - ${productName}` 
      };
    }
    
    // 👑 CLOSE FRIENDS VIP
    if (produtoLower.includes('close friends vip') || 
        produtoLower.includes('cf vip') ||
        produtoLower.includes('vip')) {
      return { 
        plan: 'VIP', 
        productName: `Close Friends VIP Hotmart - ${productName}` 
      };
    }
    
    // 🏢 PROJETO FIIs
    if (produtoLower.includes('projeto fiis') || 
        produtoLower.includes('fiis') ||
        produtoLower.includes('fii')) {
      return { 
        plan: 'FIIS', 
        productName: `Projeto FIIs Hotmart - ${productName}` 
      };
    }
    
    // 💰 PROJETO RENDA PASSIVA
    if (produtoLower.includes('renda passiva') || 
        produtoLower.includes('dividendos')) {
      return { 
        plan: 'RENDA_PASSIVA', 
        productName: `Projeto Renda Passiva Hotmart - ${productName}` 
      };
    }
    
    // 🇺🇸 PROJETO AMÉRICA (conhecido como Projeto Trump na Hotmart)
    if (produtoLower.includes('projeto trump') || 
        produtoLower.includes('trump') ||
        produtoLower.includes('projeto américa') || 
        produtoLower.includes('america')) {
      return { 
        plan: 'AMERICA', 
        productName: `Projeto Trump (América) Hotmart - ${productName}` 
      };
    }
    
    // 🔢 FALLBACK POR VALOR (se não conseguir pelo nome)
    const purchaseData = webhookData.data?.purchase || webhookData.purchase || {};
    const priceData = purchaseData?.price || {};
    const valor = priceData?.value || purchaseData?.amount || webhookData.price || 0;
    console.log(`💰 Valor da compra Hotmart: R$ ${valor}`);
    
    if (valor > 0) {
      // Ajustar valores conforme seus preços na Hotmart
      if (valor >= 200) {
        return { plan: 'VIP', productName: `Produto VIP Hotmart - R$ ${valor}` };
      } else if (valor >= 150) {
        return { plan: 'FIIS', productName: `Projeto FIIs Hotmart - R$ ${valor}` };
      } else if (valor >= 100) {
        return { plan: 'AMERICA', productName: `Projeto América Hotmart - R$ ${valor}` };
      } else if (valor >= 50) {
        // Para valores médios, assumir LITE_V2 como padrão (mais recente)
        return { plan: 'LITE_V2', productName: `Close Friends LITE 2.0 Hotmart - R$ ${valor}` };
      } else {
        // Para valores baixos, assumir LITE original
        return { plan: 'LITE', productName: `Close Friends LITE Hotmart - R$ ${valor}` };
      }
    }
    
    // 📅 FALLBACK POR DATA (produtos de 2022 para trás são LITE original)
    const createdAt = webhookData.data?.created_at || webhookData.created_at;
    if (createdAt) {
      const productDate = new Date(createdAt);
      const cutoffDate = new Date('2023-01-01'); // ✅ PRODUTOS ATÉ 2022 = LITE ORIGINAL
      
      if (productDate < cutoffDate) {
        console.log(`📅 Produto criado em ${productDate.toISOString().split('T')[0]} (antes de 2023) → LITE original`);
        return { 
          plan: 'LITE', 
          productName: `Close Friends LITE Original Hotmart - ${productName || 'Produto 2022 ou anterior'}` 
        };
      } else {
        console.log(`📅 Produto criado em ${productDate.toISOString().split('T')[0]} (2023 ou depois) → LITE 2.0`);
        return { 
          plan: 'LITE_V2', 
          productName: `Close Friends LITE 2.0 Hotmart - ${productName || 'Produto Recente'}` 
        };
      }
    }
    
    // 🎯 FALLBACK FINAL: VIP como padrão mais seguro
    console.log(`⚠️ Não foi possível detectar o plano Hotmart específico, usando VIP como padrão`);
    return { 
      plan: 'VIP', 
      productName: `Produto Não Identificado Hotmart - ${productName || 'Sem Nome'}` 
    };
    
  } catch (error) {
    console.error('❌ Erro ao detectar plano Hotmart:', error);
    return { 
      plan: 'VIP', 
      productName: 'Produto com Erro de Detecção Hotmart'
    };
  }
}

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
    console.log(`🔔 Webhook Hotmart recebido para token: ${token}`);

    // Verificar se o token existe
    const integration = TOKEN_MAPPING[token];
    if (!integration) {
      console.log(`❌ Token Hotmart ${token} não encontrado`);
      return NextResponse.json(
        { error: `Token Hotmart ${token} não configurado` },
        { status: 404 }
      );
    }

    console.log(`✅ Integração Hotmart encontrada: ${integration.name} → Plano ${integration.plan}`);

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

    console.log('📦 Dados do webhook Hotmart:', JSON.stringify(webhookData, null, 2));

    // 🔍 DETECTAR PLANO AUTOMATICAMENTE (DEPOIS DO PARSE)
    const { plan: planoDetectado, productName: nomeDetectado } = detectarPlanoHotmart(webhookData);
    
    // ✅ SOBRESCREVER DADOS DA INTEGRAÇÃO COM DETECÇÃO AUTOMÁTICA
    const integrationData = {
      name: nomeDetectado,
      plan: planoDetectado,
      integrationId: integration.integrationId
    };

    console.log(`✅ Plano Hotmart detectado: ${integrationData.name} → ${integrationData.plan}`);

    // Extrair evento
    const event = webhookData.event || 'PURCHASE_APPROVED';
    console.log(`🎯 Evento Hotmart recebido: ${event}`);

    // Extrair informações básicas para todos os eventos
    const buyerData = webhookData.data?.buyer || webhookData.buyer || webhookData;
    const purchaseData = webhookData.data?.purchase || webhookData.purchase || webhookData;
    const productData = webhookData.data?.product || webhookData.product || webhookData;
    const buyerEmail = buyerData?.email || webhookData.email;
    const buyerName = buyerData?.name || buyerData?.full_name || webhookData.name || 'Cliente Hotmart';
    const transactionId = purchaseData?.transaction || purchaseData?.transaction_id || 
                         webhookData.transaction || `TXN_${integration.integrationId}_${Date.now()}`;
    const amount = purchaseData?.price?.value || purchaseData?.amount || webhookData.price || 0;

    console.log('🔍 Dados extraídos da Hotmart:', {
      event, buyerEmail, buyerName, transactionId, amount,
      plan: integrationData.plan, // ✅ CORRIGIDO
      integrationName: integrationData.name, // ✅ CORRIGIDO
      token: token
    });

    // Processar diferentes tipos de eventos
    if (event === 'PURCHASE_REFUNDED' || event === 'PURCHASE_CANCELLED' || event === 'PURCHASE_CHARGEBACK') {
      // REEMBOLSO/CANCELAMENTO - BLOQUEAR USUÁRIO
      console.log(`🚫 Evento de ${event} na Hotmart - bloqueando usuário`);
      
      if (!buyerEmail || !buyerEmail.includes('@')) {
        console.log('❌ Email inválido para reembolso Hotmart:', buyerEmail);
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
            expirationDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Ontem
          }
        });

        // Registrar reembolso
        try {
          await prisma.purchase.create({
            data: {
              userId: user.id,
              amount: -(amount || 0), // Valor negativo para reembolso
              productName: `${integrationData.name} - REEMBOLSO`, // ✅ CORRIGIDO
              hotmartTransactionId: transactionId,
              status: 'REFUNDED'
            }
          });
          console.log(`💸 Reembolso Hotmart registrado: -${amount} - ${integrationData.name}`);
        } catch (purchaseError) {
          console.error('⚠️ Erro ao registrar reembolso Hotmart:', purchaseError);
        }

        await prisma.$disconnect();

        return NextResponse.json({
          success: true,
          message: `Reembolso Hotmart processado - usuário bloqueado`,
          platform: 'Hotmart',
          event: event,
          integration: {
            id: integrationData.integrationId,
            name: integrationData.name,
            plan: integrationData.plan,
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
            product: integrationData.name
          },
          timestamp: new Date().toISOString()
        });

      } else {
        // Usuário não encontrado para reembolso
        await prisma.$disconnect();
        console.log(`⚠️ Usuário ${email} não encontrado para reembolso Hotmart`);
        
        return NextResponse.json({
          success: true,
          message: 'Usuário não encontrado - reembolso registrado',
          platform: 'Hotmart',
          email: email,
          event: event
        });
      }
    }

    // EVENTOS DE COMPRA (comportamento atual mantido)
    if (!['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'PURCHASE_PAID'].includes(event)) {
      console.log(`📝 Evento Hotmart ${event} não processado pelo sistema`);
      return NextResponse.json({
        success: true,
        message: `Evento Hotmart ${event} recebido mas não processado`,
        platform: 'Hotmart',
        event: event
      });
    }

    console.log(`✅ Processando evento de compra Hotmart: ${event}`);

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

    let isNewUser = false;
    let tempPassword = '';

    if (user) {
      // ATUALIZAR usuário existente
      console.log(`🔄 Atualizando usuário existente: ${email}`);
      
      user = await prisma.user.update({
        where: { email },
        data: {
          plan: integrationData.plan, // 🔥 PLANO DETECTADO AUTOMATICAMENTE
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(integrationData.plan)
        }
      });
      
      console.log(`✅ Usuário atualizado via Hotmart: ${email} → ${integrationData.plan} via token ${token}`);
      
    } else {
      // CRIAR novo usuário
      isNewUser = true;
      tempPassword = generateSecurePassword();
      const hashedPassword = await hashPassword(tempPassword); // ✅ USANDO HASH SEGURO
      
      console.log(`➕ Criando novo usuário via Hotmart: ${email}`);
      
      const nameParts = buyerName.split(' ');
      const firstName = nameParts[0] || 'Cliente';
      const lastName = nameParts.slice(1).join(' ') || 'Hotmart';
      
      user = await prisma.user.create({
        data: {
          email: email,
          firstName: firstName,
          lastName: lastName,
          plan: integrationData.plan, // 🔥 PLANO DETECTADO AUTOMATICAMENTE
          status: 'ACTIVE',
          hotmartCustomerId: transactionId,
          expirationDate: calculateExpirationDate(integrationData.plan),
          password: hashedPassword, // ✅ USANDO HASH SEGURO
          passwordCreatedAt: new Date(),
          mustChangePassword: true,
          customPermissions: '[]'
        }
      });
      
      console.log(`✅ Novo usuário criado via Hotmart: ${email} → ${integrationData.plan} via token ${token}`);
    }

    // Registrar compra
    try {
      await prisma.purchase.create({
        data: {
          userId: user.id,
          amount: amount || 0,
          productName: integrationData.name, // 🔥 NOME DETECTADO
          hotmartTransactionId: transactionId,
          status: 'COMPLETED'
        }
      });
      console.log(`💰 Compra Hotmart registrada: ${amount} - ${integrationData.name}`);
    } catch (purchaseError) {
      console.error('⚠️ Erro ao registrar compra Hotmart:', purchaseError);
    }

    await prisma.$disconnect();

    const response = {
      success: true,
      message: `Webhook Hotmart processado com sucesso via token ${token}`,
      platform: 'Hotmart',
      integration: {
        id: integrationData.integrationId,
        name: integrationData.name,
        plan: integrationData.plan,
        token: token
      },
      productDetection: {
        detectedPlan: integrationData.plan,
        detectedProductName: integrationData.name,
        originalProductName: webhookData.data?.product?.name || webhookData.product_name || 'N/A',
        amount: amount
      },
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        status: user.status,
        isNewUser: isNewUser,
        tempPassword: isNewUser ? tempPassword : undefined // ✅ Para debug
      },
      transaction: {
        id: transactionId,
        amount: amount,
        product: integrationData.name
      },
      timestamp: new Date().toISOString()
    };

    console.log(`🔥 Webhook Hotmart ${token} processado com sucesso:`, response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`❌ Erro no webhook Hotmart ${params.id}:`, error);

    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Erro ao desconectar:', disconnectError);
    }

    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        platform: 'Hotmart',
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
      { error: `Token Hotmart ${token} não encontrado` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    platform: 'Hotmart',
    integration: {
      id: integration.integrationId,
      name: integration.name,
      plan: integration.plan,
      token: token,
      status: 'ACTIVE',
      webhookUrl: `${new URL(request.url).origin}/api/webhooks/hotmart/${token}`
    },
    message: `Integração Hotmart ${integration.name} ativa e funcionando`,
    timestamp: new Date().toISOString()
  });
}