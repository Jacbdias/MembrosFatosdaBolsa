const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSimpleAdmin() {
  try {
    // Deletar usuários admin existentes
    await prisma.user.deleteMany({
      where: { plan: 'ADMIN' }
    });
    
    // Criar novo admin com senha simples
    const admin = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'Sistema',
        email: 'admin@test.com',
        password: 'admin123', // Senha simples para teste
        plan: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin criado:', admin.email);
    console.log('🔑 Senha: admin123');
    console.log('📧 Email: admin@test.com');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleAdmin();