// ==========================================
// 📋 GET /api/agenda/por-ticker/[ticker]
// ==========================================

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } }
) {
  try {
    const { ticker } = params;
    
    if (!ticker) {
      return NextResponse.json(
        { error: 'Ticker não informado' }, 
        { status: 400 }
      );
    }
    
    const eventos = await prisma.eventoCorporativo.findMany({
      where: { 
        ticker: ticker.toUpperCase() 
      },
      orderBy: { data_evento: 'asc' }
    });
    
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      totalEventos: eventos.length,
      eventos
    });
    
  } catch (error) {
    console.error(`Erro ao carregar eventos para ${params.ticker}:`, error);
    return NextResponse.json(
      { error: 'Erro ao carregar eventos' }, 
      { status: 500 }
    );
  }
}
