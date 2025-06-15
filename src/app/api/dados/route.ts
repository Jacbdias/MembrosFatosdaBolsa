export async function GET() {
  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();
  
  // Simulação realista baseada no horário
  const isHorarioComercial = hora >= 9 && hora <= 18;
  const valorBase = 3440;
  const variacao = (Math.random() - 0.5) * (isHorarioComercial ? 3 : 1);
  const novoValor = valorBase * (1 + variacao / 100);
  
  const dadosIfix = {
    valor: novoValor,
    valorFormatado: novoValor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }),
    variacao: valorBase * (variacao / 100),
    variacaoPercent: variacao,
    trend: variacao >= 0 ? 'up' : 'down',
    timestamp: agora.toISOString(),
    fonte: 'SIMULAÇÃO_VERCEL',
    nota: `Atualizado ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`,
    symbol: 'IFIX'
  };

  return Response.json({ 
    ifix: dadosIfix,
    success: true,
    timestamp: agora.toISOString()
  });
}
