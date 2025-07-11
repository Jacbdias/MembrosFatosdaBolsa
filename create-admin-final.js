const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@sistema.local',
        password: 'senha123', // Senha simples por enquanto
        plan: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin criado:', admin.email, '- Plan:', admin.plan);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();