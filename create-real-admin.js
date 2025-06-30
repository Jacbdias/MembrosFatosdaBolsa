const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_aOq2Kmpjiv9Q@ep-noisy-wind-a8b1knv2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('Criando admin real...');
  
  const password = await bcrypt.hash('Admin123!', 10);
  console.log('Senha hash criada');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fatosdobolsa.com' },
    update: {
      password: password,
      plan: 'ADMIN',
      status: 'ACTIVE'
    },
    create: {
      email: 'admin@fatosdobolsa.com',
      firstName: 'Admin',
      lastName: 'Sistema',
      password: password,
      plan: 'ADMIN',
      status: 'ACTIVE'
    }
  });
  
  console.log('✅ Admin criado:', admin.email);
  await prisma.$disconnect();
}

createAdmin().catch(console.error);