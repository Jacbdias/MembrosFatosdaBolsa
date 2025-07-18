import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Buscar relatório atual
export async function GET() {
  try {
    const relatorio = await prisma.relatorioSemanal.findFirst({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(relatorio);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar relatório' }, { status: 500 });
  }
}

// POST - Criar novo relatório
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const relatorio = await prisma.relatorioSemanal.create({
      data: {
        ...data,
        authorId: admin.id
      }
    });
    
    return NextResponse.json(relatorio);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar relatório' }, { status: 500 });
  }
}

// PUT - Atualizar relatório
export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    const relatorio = await prisma.relatorioSemanal.update({
      where: { id: data.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json(relatorio);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar relatório' }, { status: 500 });
  }
}

async function verifyAdmin(request: NextRequest) {
  const userEmail = request.headers.get('x-user-email');
  const authHeader = request.headers.get('authorization');
  
  if (userEmail === 'admin@fatosdobolsa.com') {
    return { id: 'admin', email: userEmail };
  }
  
  return null;
}