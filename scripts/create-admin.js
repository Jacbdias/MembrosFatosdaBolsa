const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🛡️ Criando usuário administrador...');
    
    // Verificar se já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@fatosdobolsa.com' }
    });

    if (existingAdmin) {
      console.log('⚠️ Admin já existe:', existingAdmin.email);
      return;
    }

    // Criar senha hash
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    // Criar admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@fatosdobolsa.com',
        firstName: 'Admin',
        lastName: 'Sistema',
        password: hashedPassword,
        plan: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: admin@fatosdobolsa.com');
    console.log('🔑 Senha: Admin123!');
    
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();