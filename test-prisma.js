const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
console.log('Prisma OK:', !!prisma); 
console.log('Methods:', Object.keys(prisma).filter(k => !k.startsWith('$'))); 
prisma.$disconnect(); 
