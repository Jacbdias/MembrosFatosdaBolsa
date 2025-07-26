// 📁 /src/app/api/proventos/estatisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 📊 BUSCAR ESTATÍSTICAS GERAIS (SUBSTITUI localStorage stats)
    const [
      totalProventos,
      totalEmpresas,
      valorTotal,
      ultimoUpload
    ] = await Promise.all([
      prisma.provento.count(),
      prisma.provento.findMany({
        select: { ticker: true },
        distinct: ['ticker']
      }).then(result => result.length),
      prisma.provento.aggregate({
        _sum: { valor: true }
      }).then(result => result._sum.valor || 0),
      prisma.proventoUpload.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      }).then(result => result?.createdAt.toISOString() || '')
    ]);
    
    return NextResponse.json({
      totalEmpresas,
      totalProventos,
      valorTotal,
      dataUltimoUpload: ultimoUpload
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}