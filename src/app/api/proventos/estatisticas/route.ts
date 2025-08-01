// 📁 /src/app/api/proventos/estatisticas/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('📊 Buscando estatísticas de proventos...');

    // 📊 BUSCAR ESTATÍSTICAS USANDO OS MODELOS CORRETOS
    const [
      totalProventos,
      empresasUnicas,
      valorTotal,
      ultimoUpload
    ] = await Promise.all([
      // Total de proventos
      prisma.provento.count(),
      
      // Empresas únicas (usando distinct corretamente)
      prisma.provento.findMany({
        select: { ticker: true },
        distinct: ['ticker']
      }),
      
      // Valor total
      prisma.provento.aggregate({
        _sum: { valor: true }
      }),
      
      // Último upload (usando ProventoUpload com P maiúsculo)
      prisma.proventoUpload.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    ]);

    const estatisticas = {
      totalEmpresas: empresasUnicas.length,
      totalProventos: totalProventos,
      valorTotal: valorTotal._sum.valor || 0,
      dataUltimoUpload: ultimoUpload?.createdAt?.toISOString() || ''
    };

    console.log('✅ Estatísticas calculadas:', estatisticas);

    return NextResponse.json(estatisticas);
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    
    // Em caso de erro, retornar estatísticas básicas sem usar ProventoUpload
    try {
      const [totalProventos, empresasUnicas, valorTotal] = await Promise.all([
        prisma.provento.count(),
        prisma.provento.findMany({
          select: { ticker: true },
          distinct: ['ticker']
        }),
        prisma.provento.aggregate({
          _sum: { valor: true }
        })
      ]);

      return NextResponse.json({
        totalEmpresas: empresasUnicas.length,
        totalProventos: totalProventos,
        valorTotal: valorTotal._sum.valor || 0,
        dataUltimoUpload: ''
      });
    } catch (fallbackError) {
      console.error('❌ Erro no fallback:', fallbackError);
      return NextResponse.json(
        { 
          error: 'Erro interno do servidor',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }
}