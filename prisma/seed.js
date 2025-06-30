const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️ Criando admin...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fatosdobolsa.com' },
    update: {},
    create: {
      email: 'admin@fatosdobolsa.com',
      firstName: 'Admin',
      lastName: 'Sistema',
      password: hashedPassword,
      plan: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  
  console.log('✅ Admin criado:', admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());