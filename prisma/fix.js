const { PrismaClient } = require('@prisma/client');  
const prisma = new PrismaClient();  
async function main() {  
  const admin = await prisma.user.create({  
    data: {  
      email: 'admin@fatosdobolsa.com',  
      firstName: 'Admin',  
      lastName: 'Sistema',  
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMye1IVQ9VqKJoOB9gw3zVdG3d0F3kGqP2.',  
      plan: 'ADMIN',  
      status: 'ACTIVE'  
    }  
  });  
  console.log('Admin criado!', admin.email);  
}  
main().catch(console.error).finally(() =
