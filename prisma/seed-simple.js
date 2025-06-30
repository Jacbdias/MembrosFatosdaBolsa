require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

// Se ainda der erro de DATABASE_URL, usar URL direta temporariamente
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_aOq2Kmpjiv9Q@ep-noisy-wind-a8b1knv2-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

async function main() {
  console.log('🛡️ Criando admin...');
  
  // Senha já hasheada para "Admin123!"
  const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMye1IVQ9VqKJoOB9gw3zVdG3d0F3kGqP2.';
  
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
  console.log('📧 Email: admin@fatosdobolsa.com');
  console.log('🔑 Senha: Admin123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());