// src/app/api/admin/bulk-import/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ImportUser {
  firstName: string;
  lastName: string;
  email: string;
  plan: string;
  expirationDate?: string;
  status?: string;
}

interface ImportResult {
  success: number;
  failed: number;
  updated: number;
  total: number;
  errors: string[];
}

// Função para gerar senha segura
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const symbols = '!@#$%&*';
  let password = '';
  
  // 6 caracteres alfanuméricos + 2 símbolos
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 2; i++) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  
  // Embaralhar
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Função para calcular data de expiração - PRIORIZA DATA DO CSV
function calculateExpirationDate(plan: string, customDate?: string): Date | null {
  // PRIORIDADE 1: Data informada no CSV
  if (customDate && customDate.trim()) {
    try {
      const parsedDate = new Date(customDate.trim());
      // Verificar se a data é válida
      if (!isNaN(parsedDate.getTime())) {
        console.log(`📅 Usando data do CSV: ${customDate} → ${parsedDate.toISOString()}`);
        return parsedDate;
      } else {
        console.warn(`⚠️ Data inválida no CSV: ${customDate}, calculando baseado no plano`);
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao processar data ${customDate}:`, error);
    }
  }

  // PRIORIDADE 2: Calcular baseado no plano (se não tem data no CSV)
  const expirationMap = {
    'VIP': 365,
    'LITE': 365,
    'RENDA_PASSIVA': null, // Vitalício
    'FIIS': null, // Vitalício
    'AMERICA': 365
  };

  const days = expirationMap[plan as keyof typeof expirationMap];
  if (days === null) {
    console.log(`📅 Plano ${plan} é vitalício - sem data de expiração`);
    return null; // Acesso vitalício
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  console.log(`📅 Calculado para plano ${plan}: ${expirationDate.toISOString()}`);
  return expirationDate;
}

// Verificar autenticação
async function verifyAuth(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  
  if (userEmail === 'admin@fatosdobolsa.com') {
    return true;
  }
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 BULK IMPORT - Iniciando importação em massa');
    
    // Verificar autenticação
    if (!(await verifyAuth(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 401 }
      );
    }

    const { users } = await request.json() as { users: ImportUser[] };
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: 'Lista de usuários inválida' },
        { status: 400 }
      );
    }

    console.log(`📦 Processando lote de ${users.length} usuários`);

    const result: ImportResult = {
      success: 0,
      failed: 0,
      updated: 0,
      total: users.length,
      errors: []
    };

    // Conectar ao Prisma
    await prisma.$connect();

    // Processar cada usuário
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      try {
        // Validações básicas
        if (!user.email || !user.email.includes('@')) {
          result.errors.push(`Usuário ${i + 1}: Email inválido (${user.email})`);
          result.failed++;
          continue;
        }

        if (!user.firstName || !user.lastName) {
          result.errors.push(`Usuário ${i + 1}: Nome ou sobrenome em branco (${user.email})`);
          result.failed++;
          continue;
        }

        const email = user.email.toLowerCase().trim();
        
        // Verificar se usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          // ATUALIZAR usuário existente
          console.log(`🔄 Atualizando usuário existente: ${email}`);
          
          const expirationDate = calculateExpirationDate(user.plan || 'VIP', user.expirationDate);
          console.log(`📅 Data de expiração para ${email}: ${expirationDate?.toISOString() || 'Vitalício'}`);
          
          const updatedUser = await prisma.user.update({
            where: { email },
            data: {
              firstName: user.firstName.trim(),
              lastName: user.lastName.trim(),
              plan: user.plan || 'VIP',
              status: user.status || 'ACTIVE',
              expirationDate: expirationDate,
              // NÃO sobrescrever senha se já existir
              ...(existingUser.password ? {} : { 
                password: generateSecurePassword(),
                passwordCreatedAt: new Date(),
                mustChangePassword: true 
              })
            }
          });

          result.updated++;
          console.log(`✅ Usuário atualizado: ${email} → Plano: ${updatedUser.plan} → Expira: ${updatedUser.expirationDate?.toISOString() || 'Vitalício'}`);
          
        } else {
          // CRIAR novo usuário
          console.log(`➕ Criando novo usuário: ${email}`);
          
          const expirationDate = calculateExpirationDate(user.plan || 'VIP', user.expirationDate);
          console.log(`📅 Data de expiração para ${email}: ${expirationDate?.toISOString() || 'Vitalício'}`);
          
          const newUser = await prisma.user.create({
            data: {
              firstName: user.firstName.trim(),
              lastName: user.lastName.trim(),
              email,
              plan: user.plan || 'VIP',
              status: user.status || 'ACTIVE',
              password: generateSecurePassword(),
              passwordCreatedAt: new Date(),
              mustChangePassword: true,
              expirationDate: expirationDate,
              customPermissions: '[]'
            }
          });

          result.success++;
          console.log(`✅ Usuário criado: ${email} → Plano: ${newUser.plan} → Expira: ${newUser.expirationDate?.toISOString() || 'Vitalício'}`);
        }

      } catch (userError: any) {
        console.error(`❌ Erro ao processar usuário ${email}:`, userError);
        result.errors.push(`${user.email}: ${userError.message}`);
        result.failed++;
      }
    }

    await prisma.$disconnect();

    console.log(`🎉 BULK IMPORT CONCLUÍDO:`);
    console.log(`   ✅ Criados: ${result.success}`);
    console.log(`   🔄 Atualizados: ${result.updated}`);
    console.log(`   ❌ Falharam: ${result.failed}`);
    console.log(`   📊 Total: ${result.total}`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro geral na importação em massa:', error);
    
    await prisma.$disconnect();
    
    return NextResponse.json(
      { 
        error: 'Erro interno na importação',
        message: error.message
      },
      { status: 500 }
    );
  }
}

// Webhook Hotmart atualizado - agora detecta usuários importados
export async function PUT(request: NextRequest) {
  try {
    console.log('🔔 WEBHOOK HOTMART - Compra recebida');
    
    const webhookData = await request.json();
    const { event, data } = webhookData;
    
    if (event !== 'PURCHASE_APPROVED') {
      return NextResponse.json({ message: 'Evento ignorado' });
    }

    const { product, buyer, purchase } = data;
    const buyerEmail = buyer?.email?.toLowerCase()?.trim();
    
    if (!buyerEmail) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
    }

    // Mapear produto → plano
    const PRODUCT_PLAN_MAPPING = {
      'fb056612-bcc6-4217-9e6d-2a5d1110ac2f': 'VIP',
      'produto-lite-456': 'LITE',
      'produto-renda-passiva-789': 'RENDA_PASSIVA'
    };

    const plan = PRODUCT_PLAN_MAPPING[product?.ucode] || 'VIP';
    const amount = purchase?.price?.value || 0;

    await prisma.$connect();

    // Verificar se usuário JÁ EXISTE (importado ou não)
    let user = await prisma.user.findUnique({
      where: { email: buyerEmail }
    });

    if (user) {
      // ATUALIZAR usuário existente (importado anteriormente)
      console.log(`🔄 CLIENTE EXISTENTE: ${buyerEmail} - Atualizando assinatura`);
      
      user = await prisma.user.update({
        where: { email: buyerEmail },
        data: {
          plan: plan,
          status: 'ACTIVE',
          hotmartCustomerId: purchase?.transaction,
          expirationDate: calculateExpirationDate(plan),
          // PRESERVAR dados existentes
          ...(user.password ? {} : { 
            password: generateSecurePassword(),
            passwordCreatedAt: new Date(),
            mustChangePassword: true 
          })
        }
      });

      console.log(`✅ ASSINATURA RENOVADA: ${buyerEmail} → ${plan} → Exp: ${user.expirationDate}`);
      
    } else {
      // CRIAR novo usuário (primeira compra)
      console.log(`➕ NOVO CLIENTE: ${buyerEmail}`);
      
      const nameParts = buyer?.name?.split(' ') || ['Cliente', 'Hotmart'];
      
      user = await prisma.user.create({
        data: {
          email: buyerEmail,
          firstName: nameParts[0] || 'Cliente',
          lastName: nameParts.slice(1).join(' ') || 'Hotmart',
          plan: plan,
          status: 'ACTIVE',
          hotmartCustomerId: purchase?.transaction,
          expirationDate: calculateExpirationDate(plan),
          password: generateSecurePassword(),
          passwordCreatedAt: new Date(),
          mustChangePassword: true,
          customPermissions: '[]'
        }
      });

      console.log(`✅ NOVO CLIENTE CRIADO: ${buyerEmail} → ${plan}`);
    }

    // Registrar compra
    await prisma.purchase.create({
      data: {
        userId: user.id,
        amount: amount,
        productName: product?.name || 'Produto Hotmart',
        hotmartTransactionId: purchase?.transaction,
        status: 'COMPLETED'
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: user ? 'Assinatura renovada' : 'Novo cliente criado',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        isExistingCustomer: !!user,
        expirationDate: user.expirationDate
      }
    });

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    await prisma.$disconnect();
    
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de Importação em Massa ativa',
    endpoints: {
      'POST /api/admin/bulk-import': 'Importar lista de usuários',
      'PUT /api/admin/bulk-import': 'Webhook Hotmart (renovação automática)'
    },
    formats: {
      input: {
        users: [
          {
            firstName: 'string',
            lastName: 'string', 
            email: 'string',
            plan: 'VIP|LITE|RENDA_PASSIVA|FIIS|AMERICA',
            expirationDate: 'YYYY-MM-DD (opcional)',
            status: 'ACTIVE|INACTIVE|PENDING (opcional)'
          }
        ]
      }
    }
  });
}