// 📁 /src/app/api/proventos/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nomeArquivo, 
      tamanhoArquivo, 
      totalLinhas, 
      linhasProcessadas, 
      linhasComErro,
      proventos 
    } = body;
    
    // 📊 REGISTRAR LOG DO UPLOAD
    const upload = await prisma.proventoUpload.create({
      data: {
        nomeArquivo,
        tamanhoArquivo,
        totalLinhas,
        linhasProcessadas,
        linhasComErro,
        iniciadoEm: new Date(),
        // userId: req.user?.id, // Se tiver autenticação
      }
    });
    
    // 📤 PROCESSAR PROVENTOS EM LOTES
    const BATCH_SIZE = 100;
    let totalInseridos = 0;
    
    const resultado = await prisma.$transaction(async (tx) => {
      for (let i = 0; i < proventos.length; i += BATCH_SIZE) {
        const batch = proventos.slice(i, i + BATCH_SIZE);
        
        const resultado = await tx.provento.createMany({
          data: batch.map(p => ({
            ticker: p.ticker,
            valor: p.valor,
            tipo: p.tipo,
            data: p.data,
            dataObj: new Date(p.dataObj),
            dataCom: p.dataCom,
            dataPagamento: p.dataPagamento,
            dataFormatada: p.dataFormatada,
            valorFormatado: p.valorFormatado,
            dividendYield: p.dividendYield,
            fonte: 'csv_upload'
          })),
          skipDuplicates: true
        });
        
        totalInseridos += resultado.count;
      }
      
      return totalInseridos;
    });
    
    // ✅ FINALIZAR LOG DO UPLOAD
    await prisma.proventoUpload.update({
      where: { id: upload.id },
      data: {
        finalizadoEm: new Date(),
        proventosCriados: resultado
      }
    });
    
    return NextResponse.json({
      message: `Upload concluído: ${resultado} proventos inseridos`,
      uploadId: upload.id,
      total: resultado
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}