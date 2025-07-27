// ==========================================
// 🗑️ DELETE /api/agenda/limpar-todos
// ==========================================

export async function DELETE() {
  try {
    const resultado = await prisma.eventoCorporativo.deleteMany({});
    
    return NextResponse.json({
      success: true,
      eventosExcluidos: resultado.count
    });
    
  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar dados' }, 
      { status: 500 }
    );
  }
}
