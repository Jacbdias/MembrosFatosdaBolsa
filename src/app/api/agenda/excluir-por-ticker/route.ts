// ==========================================
// 🗑️ DELETE /api/agenda/excluir-por-ticker
// ==========================================

export async function DELETE(request: Request) {
  try {
    const { ticker } = await request.json();
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker não informado' }, 
        { status: 400 }
      );
    }
    
    const resultado = await prisma.eventoCorporativo.deleteMany({
      where: { 
        ticker: ticker.toUpperCase() 
      }
    });
    
    return NextResponse.json({
      success: true,
      eventosExcluidos: resultado.count,
      ticker
    });
    
  } catch (error) {
    console.error('Erro ao excluir eventos do ticker:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir eventos do ticker' }, 
      { status: 500 }
    );
  }
}
