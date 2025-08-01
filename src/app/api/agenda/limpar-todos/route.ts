// src/app/api/agenda/limpar-todos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
  console.log('🗑️ [LIMPAR-TODOS] Iniciando...');
  
  try {
    // Testar conexão com banco
    console.log('📡 [LIMPAR-TODOS] Testando conexão com banco...');
    
    // Verificar quantos eventos existem
    const totalAntes = await prisma.eventoCorporativo.count();
    console.log(`📊 [LIMPAR-TODOS] Eventos encontrados: ${totalAntes}`);
    
    if (totalAntes === 0) {
      console.log('ℹ️ [LIMPAR-TODOS] Nenhum evento para remover');
      return NextResponse.json({
        success: true,
        message: 'Nenhum evento para remover',
        eventosExcluidos: 0
      });
    }
    
    // Executar a remoção
    console.log('🔥 [LIMPAR-TODOS] Iniciando deleteMany...');
    const resultado = await prisma.eventoCorporativo.deleteMany({});
    console.log(`✅ [LIMPAR-TODOS] DeleteMany executado. Count: ${resultado.count}`);
    
    const resposta = {
      success: true,
      message: `${resultado.count} eventos removidos com sucesso`,
      eventosExcluidos: resultado.count,
      totalAnterior: totalAntes
    };
    
    console.log('📋 [LIMPAR-TODOS] Resposta a ser enviada:', resposta);
    
    return NextResponse.json(resposta);
    
  } catch (error) {
    console.error('❌ [LIMPAR-TODOS] ERRO CAPTURADO:');
    console.error('- Tipo:', typeof error);
    console.error('- Nome:', error?.name);
    console.error('- Mensagem:', error?.message);
    console.error('- Stack:', error?.stack);
    console.error('- Objeto completo:', error);
    
    const errorResponse = {
      success: false,
      error: 'Erro interno do servidor',
      message: error?.message || 'Erro desconhecido',
      details: process.env.NODE_ENV === 'development' ? {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      } : undefined
    };
    
    console.log('📋 [LIMPAR-TODOS] Error response:', errorResponse);
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}