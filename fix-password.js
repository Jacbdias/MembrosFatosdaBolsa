const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.updateMany({
      where: { 
        email: { in: ['admin@fatosdobolsa.com', 'admin@sistema.local'] }
      },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Senhas atualizadas!');
    console.log('🔑 Use: admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPassword();