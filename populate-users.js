const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function populateUsers() {
  try {
    console.log('🚀 Criando usuários de exemplo...');

    // Usuário Admin
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@fatosdobolsa.com',
        password: 'admin123',
        plan: 'ADMIN',
        status: 'ACTIVE',
        customPermissions: JSON.stringify(['small-caps', 'dividendos', 'recursos-dicas'])
      }
    });

    // Usuários VIP
    const userVip = await prisma.user.create({
      data: {
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@email.com',
        password: 'senha123',
        plan: 'VIP',
        status: 'ACTIVE',
        expirationDate: new Date('2025-12-31'),
        customPermissions: JSON.stringify(['internacional-etfs', 'recursos-analise'])
      }
    });

    // Usuário LITE
    const userLite = await prisma.user.create({
      data: {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@email.com',
        password: 'senha123',
        plan: 'LITE',
        status: 'ACTIVE',
        expirationDate: new Date('2025-06-30'),
        customPermissions: JSON.stringify(['dividendos'])
      }
    });

    // Usuário FIIS
    const userFiis = await prisma.user.create({
      data: {
        firstName: 'Pedro',
        lastName: 'Costa',
        email: 'pedro.costa@email.com',
        password: 'senha123',
        plan: 'FIIS',
        status: 'ACTIVE',
        expirationDate: new Date('2025-09-15'),
        customPermissions: JSON.stringify(['fundos-imobiliarios', 'recursos-planilhas'])
      }
    });

    // Usuário Projeto América
    const userAmerica = await prisma.user.create({
      data: {
        firstName: 'Ana',
        lastName: 'Lima',
        email: 'ana.lima@email.com',
        password: 'senha123',
        plan: 'AMERICA',
        status: 'ACTIVE',
        expirationDate: new Date('2026-01-01'),
        customPermissions: JSON.stringify(['projeto-america', 'internacional-stocks'])
      }
    });

    // Usuário Renda Passiva
    const userRenda = await prisma.user.create({
      data: {
        firstName: 'Carlos',
        lastName: 'Oliveira',
        email: 'carlos.oliveira@email.com',
        password: 'senha123',
        plan: 'RENDA_PASSIVA',
        status: 'ACTIVE',
        expirationDate: new Date('2025-08-20'),
        customPermissions: JSON.stringify(['dividendos', 'recursos-ebooks'])
      }
    });

    // Usuário com status PENDING
    const userPending = await prisma.user.create({
      data: {
        firstName: 'Lucas',
        lastName: 'Fernandes',
        email: 'lucas.fernandes@email.com',
        password: 'senha123',
        plan: 'LITE',
        status: 'PENDING',
        customPermissions: JSON.stringify([])
      }
    });

    // Usuário expirado
    const userExpired = await prisma.user.create({
      data: {
        firstName: 'Patricia',
        lastName: 'Rocha',
        email: 'patricia.rocha@email.com',
        password: 'senha123',
        plan: 'VIP',
        status: 'INACTIVE',
        expirationDate: new Date('2024-12-31'), // Já expirado
        customPermissions: JSON.stringify(['small-caps'])
      }
    });

    // Criar algumas compras de exemplo
    const purchases = [
      {
        userId: userVip.id,
        amount: 497.00,
        productName: 'Close Friends VIP - Anual',
        status: 'COMPLETED',
        hotmartTransactionId: 'HP123456789'
      },
      {
        userId: userLite.id,
        amount: 197.00,
        productName: 'Close Friends LITE - Semestral',
        status: 'COMPLETED',
        hotmartTransactionId: 'HP987654321'
      },
      {
        userId: userFiis.id,
        amount: 297.00,
        productName: 'Projeto FIIs - Anual',
        status: 'COMPLETED',
        hotmartTransactionId: 'HP456789123'
      },
      {
        userId: userAmerica.id,
        amount: 397.00,
        productName: 'Projeto América - Anual',
        status: 'COMPLETED',
        hotmartTransactionId: 'HP789123456'
      }
    ];

    for (const purchase of purchases) {
      await prisma.purchase.create({ data: purchase });
    }

    console.log('✅ Usuários e compras criados com sucesso!');
    console.log(`👥 Total: 8 usuários`);
    console.log(`💰 Total: ${purchases.length} compras`);
    console.log('');
    console.log('👑 Admin: admin@fatosdobolsa.com');
    console.log('📊 VIP: joao.silva@email.com');
    console.log('⭐ LITE: maria.santos@email.com');
    console.log('🏢 FIIS: pedro.costa@email.com');
    console.log('🇺🇸 AMERICA: ana.lima@email.com');
    console.log('💰 RENDA_PASSIVA: carlos.oliveira@email.com');
    console.log('⏳ PENDING: lucas.fernandes@email.com');
    console.log('🔴 EXPIRADO: patricia.rocha@email.com');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateUsers();