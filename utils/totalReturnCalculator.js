/**
 * 🎯 TOTAL RETURN CALCULATOR - MÉTODO CONTÍNUO COM REINVESTIMENTO
 * Implementa rentabilidade percentual diária acumulada com reinvestimento proporcional automático
 * Método usado por fundos profissionais para calcular Total Return real
 */

// 📅 FUNÇÃO PARA CONVERTER DATA BRASILEIRA PARA OBJETO DATE
const parseDataBrasileira = (dataString) => {
  try {
    if (!dataString) return null;
    
    // Formatos suportados: DD/MM/YYYY, DD/MM/YY, YYYY-MM-DD
    if (dataString.includes('/')) {
      const [dia, mes, ano] = dataString.split('/');
      const anoCompleto = ano.length === 2 ? '20' + ano : ano;
      return new Date(parseInt(anoCompleto), parseInt(mes) - 1, parseInt(dia));
    } else if (dataString.includes('-')) {
      return new Date(dataString);
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao converter data:', dataString, error);
    return null;
  }
};

// 📊 FUNÇÃO PARA OBTER DIAS ÚTEIS ENTRE DUAS DATAS
const obterDiasUteis = (dataInicio, dataFim) => {
  const dias = [];
  const atual = new Date(dataInicio);
  
  while (atual <= dataFim) {
    const diaSemana = atual.getDay();
    // 1-5 = Segunda a Sexta (dias úteis da bolsa)
    if (diaSemana >= 1 && diaSemana <= 5) {
      dias.push(new Date(atual));
    }
    atual.setDate(atual.getDate() + 1);
  }
  
  return dias;
};

// 🔍 FUNÇÃO PARA BUSCAR PROVENTOS DE UM ATIVO EM UMA DATA ESPECÍFICA
const buscarProventosDoDia = (ticker, data, todosProventos = null) => {
  try {
    let proventosAtivo = todosProventos;
    
    // Se não passou os proventos, buscar do localStorage
    if (!proventosAtivo) {
      const proventosKey = 'proventos_' + ticker;
      const proventosData = localStorage.getItem(proventosKey);
      if (!proventosData) return [];
      proventosAtivo = JSON.parse(proventosData);
    }
    
    if (!Array.isArray(proventosAtivo)) return [];
    
    // Filtrar proventos da data específica
    return proventosAtivo.filter(provento => {
      try {
        let dataProventoObj = null;
        
        // Tentar diferentes formatos de data
        if (provento.dataPagamento) {
          if (provento.dataPagamento.includes('/')) {
            const [d, m, a] = provento.dataPagamento.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.dataPagamento.includes('-')) {
            dataProventoObj = new Date(provento.dataPagamento);
          }
        } else if (provento.data) {
          if (provento.data.includes('/')) {
            const [d, m, a] = provento.data.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.data.includes('-')) {
            dataProventoObj = new Date(provento.data);
          }
        }
        
        if (!dataProventoObj) return false;
        
        // Comparar apenas ano, mês e dia (ignorar horário)
        return dataProventoObj.getFullYear() === data.getFullYear() &&
               dataProventoObj.getMonth() === data.getMonth() &&
               dataProventoObj.getDate() === data.getDate();
      } catch (error) {
        return false;
      }
    });
  } catch (error) {
    console.error('Erro ao buscar proventos do dia:', error);
    return [];
  }
};

// 🚀 SIMULADOR DE COTAÇÕES HISTÓRICAS (simplificado)
const simularVariacaoDiaria = (precoInicial, precoFinal, numeroDias) => {
  if (numeroDias <= 1) return [precoFinal];
  
  // Calcular retorno total e dividir em variações diárias aleatórias
  const retornoTotal = (precoFinal - precoInicial) / precoInicial;
  const retornoDiarioMedio = retornoTotal / numeroDias;
  
  const precos = [precoInicial];
  let precoAtual = precoInicial;
  
  for (let i = 1; i < numeroDias; i++) {
    // Adicionar volatilidade aleatória (±2% por dia)
    const volatilidade = (Math.random() - 0.5) * 0.04; // ±2%
    const retornoDiario = retornoDiarioMedio + volatilidade;
    
    precoAtual = precoAtual * (1 + retornoDiario);
    precos.push(precoAtual);
  }
  
  // Ajustar último preço para bater exatamente com o preço final
  precos[precos.length - 1] = precoFinal;
  
  return precos;
};

// 🎯 FUNÇÃO PRINCIPAL: CALCULAR TOTAL RETURN CONTÍNUO
export const calcularTotalReturnContinuo = (ativo, cotacaoAtual = null, valorInvestimento = 1000) => {
  try {
    console.log('🎯 Calculando Total Return contínuo para:', ativo.ticker);
    
    // 📅 CONVERTER DATAS
    const dataEntrada = parseDataBrasileira(ativo.dataEntrada);
    if (!dataEntrada) {
      throw new Error('Data de entrada inválida: ' + ativo.dataEntrada);
    }
    
    const hoje = new Date();
    const dataFinal = ativo.posicaoEncerrada ? parseDataBrasileira(ativo.dataSaida) : hoje;
    
    if (!dataFinal || dataFinal < dataEntrada) {
      throw new Error('Data final inválida');
    }
    
    // 💰 PREÇOS INICIAL E FINAL
    const precoInicial = ativo.precoEntrada;
    const precoFinal = ativo.posicaoEncerrada ? ativo.precoSaida : (cotacaoAtual || ativo.precoEntrada);
    
    // 📊 OBTER DIAS ÚTEIS DO PERÍODO
    const diasUteis = obterDiasUteis(dataEntrada, dataFinal);
    
    if (diasUteis.length === 0) {
      return {
        valorInicial: valorInvestimento,
        valorFinal: valorInvestimento,
        rentabilidadeTotal: 0,
        rentabilidadeAnualizada: 0,
        totalProventos: 0,
        diasInvestidos: 0,
        metodo: 'Total Return Contínuo',
        erro: 'Nenhum dia útil no período'
      };
    }
    
    // 🚀 SIMULAR PREÇOS DIÁRIOS (em uma implementação real, usar API histórica)
    const precosHistoricos = simularVariacaoDiaria(precoInicial, precoFinal, diasUteis.length);
    
    // 🔄 SIMULAÇÃO DE REINVESTIMENTO DIÁRIO
    let quantidadeCotas = valorInvestimento / precoInicial; // Quantidade inicial de "cotas"
    let valorPortfolio = valorInvestimento;
    let totalProventosRecebidos = 0;
    
    console.log('📊 Iniciando simulação com', diasUteis.length, 'dias úteis');
    console.log('💰 Investimento inicial:', valorInvestimento, '- Cotas iniciais:', quantidadeCotas.toFixed(6));
    
    // 📈 PROCESSAR CADA DIA ÚTIL
    for (let i = 0; i < diasUteis.length; i++) {
      const diaAtual = diasUteis[i];
      const precoAtual = precosHistoricos[i];
      
      // 💎 VERIFICAR PROVENTOS DO DIA
      const proventosDoDia = buscarProventosDoDia(ativo.ticker, diaAtual);
      
      if (proventosDoDia.length > 0) {
        const totalProventosDia = proventosDoDia.reduce((total, provento) => {
          const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor) || 0;
          return total + valor;
        }, 0);
        
        if (totalProventosDia > 0) {
          // 🔄 REINVESTIMENTO AUTOMÁTICO
          // Os proventos compram mais cotas ao preço atual
          const novasCotas = totalProventosDia / precoAtual;
          quantidadeCotas += novasCotas;
          totalProventosRecebidos += totalProventosDia;
          
          console.log(`💰 ${diaAtual.toLocaleDateString('pt-BR')}: Provento R$ ${totalProventosDia.toFixed(2)} → +${novasCotas.toFixed(6)} cotas`);
        }
      }
      
      // 📊 CALCULAR VALOR ATUAL DO PORTFOLIO
      valorPortfolio = quantidadeCotas * precoAtual;
    }
    
    // 📈 CALCULAR MÉTRICAS FINAIS
    const rentabilidadeTotal = ((valorPortfolio - valorInvestimento) / valorInvestimento) * 100;
    const diasInvestidos = diasUteis.length;
    const anosInvestidos = diasInvestidos / 252; // 252 dias úteis por ano
    const rentabilidadeAnualizada = anosInvestidos > 0 ? rentabilidadeTotal / anosInvestidos : 0;
    
    console.log('✅ Resultado Total Return Contínuo:');
    console.log('💰 Valor inicial:', valorInvestimento);
    console.log('💎 Valor final:', valorPortfolio.toFixed(2));
    console.log('📈 Rentabilidade:', rentabilidadeTotal.toFixed(2) + '%');
    console.log('📊 Cotas finais:', quantidadeCotas.toFixed(6));
    console.log('🎯 Proventos reinvestidos:', totalProventosRecebidos.toFixed(2));
    
    return {
      valorInicial: valorInvestimento,
      valorFinal: valorPortfolio,
      rentabilidadeTotal: rentabilidadeTotal,
      rentabilidadeAnualizada: rentabilidadeAnualizada,
      totalProventos: totalProventosRecebidos,
      diasInvestidos: diasInvestidos,
      quantidadeCotas: quantidadeCotas,
      cotaFinal: precoFinal,
      metodo: 'Total Return Contínuo',
      detalhes: {
        precoInicial,
        precoFinal,
        dataInicio: dataEntrada.toLocaleDateString('pt-BR'),
        dataFim: dataFinal.toLocaleDateString('pt-BR'),
        anosInvestidos: anosInvestidos.toFixed(2)
      }
    };
    
  } catch (error) {
    console.error('❌ Erro ao calcular Total Return contínuo:', error);
    return {
      valorInicial: valorInvestimento,
      valorFinal: valorInvestimento,
      rentabilidadeTotal: 0,
      rentabilidadeAnualizada: 0,
      totalProventos: 0,
      diasInvestidos: 0,
      metodo: 'Total Return Contínuo',
      erro: error.message
    };
  }
};

// 🏢 FUNÇÃO PARA CALCULAR PERFORMANCE DA CARTEIRA COMPLETA
export const calcularPerformanceCarteira = (dadosCarteira, cotacoesAtuais = {}, valorPorAtivo = 1000) => {
  if (!Array.isArray(dadosCarteira) || dadosCarteira.length === 0) {
    return {
      valorInicial: 0,
      valorFinal: 0,
      rentabilidadeTotal: 0,
      rentabilidadeAnualizada: 0,
      totalProventos: 0,
      quantidadeAtivos: 0,
      ativosComCalculos: [],
      metodo: 'Total Return Contínuo da Carteira'
    };
  }
  
  console.log('🏢 Calculando performance da carteira com', dadosCarteira.length, 'ativos');
  
  let valorInicialTotal = 0;
  let valorFinalTotal = 0;
  let totalProventosCarteira = 0;
  
  const ativosComCalculos = dadosCarteira.map(ativo => {
    const cotacaoAtual = cotacoesAtuais[ativo.ticker];
    const resultado = calcularTotalReturnContinuo(ativo, cotacaoAtual, valorPorAtivo);
    
    valorInicialTotal += resultado.valorInicial;
    valorFinalTotal += resultado.valorFinal;
    totalProventosCarteira += resultado.totalProventos;
    
    return {
      ...ativo,
      ...resultado,
      ticker: ativo.ticker,
      setor: ativo.setor
    };
  });
  
  // 📊 CALCULAR MÉTRICAS DA CARTEIRA
  const rentabilidadeTotal = valorInicialTotal > 0 ? 
    ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;
  
  // Tempo médio ponderado por valor investido
  const tempoMedioAnos = ativosComCalculos.reduce((acc, ativo) => {
    const peso = ativo.valorInicial / valorInicialTotal;
    const anos = ativo.diasInvestidos / 252;
    return acc + (anos * peso);
  }, 0);
  
  const rentabilidadeAnualizada = tempoMedioAnos > 0 ? rentabilidadeTotal / tempoMedioAnos : 0;
  
  // Melhor e pior ativo
  let melhorAtivo = null;
  let piorAtivo = null;
  let melhorPerformance = -Infinity;
  let piorPerformance = Infinity;
  
  ativosComCalculos.forEach(ativo => {
    if (ativo.rentabilidadeTotal > melhorPerformance) {
      melhorPerformance = ativo.rentabilidadeTotal;
      melhorAtivo = { ...ativo, performance: ativo.rentabilidadeTotal };
    }
    
    if (ativo.rentabilidadeTotal < piorPerformance) {
      piorPerformance = ativo.rentabilidadeTotal;
      piorAtivo = { ...ativo, performance: ativo.rentabilidadeTotal };
    }
  });
  
  console.log('✅ Performance da carteira calculada:');
  console.log('💰 Valor inicial total:', valorInicialTotal);
  console.log('💎 Valor final total:', valorFinalTotal.toFixed(2));
  console.log('📈 Rentabilidade total:', rentabilidadeTotal.toFixed(2) + '%');
  console.log('📊 Rentabilidade anualizada:', rentabilidadeAnualizada.toFixed(2) + '%');
  
  return {
    valorInicial: valorInicialTotal,
    valorFinal: valorFinalTotal,
    rentabilidadeTotal: rentabilidadeTotal,
    rentabilidadeAnualizada: rentabilidadeAnualizada,
    totalProventos: totalProventosCarteira,
    quantidadeAtivos: dadosCarteira.length,
    ativosComCalculos: ativosComCalculos,
    melhorAtivo: melhorAtivo,
    piorAtivo: piorAtivo,
    metodo: 'Total Return Contínuo da Carteira',
    detalhes: {
      tempoMedioAnos: tempoMedioAnos.toFixed(2),
      valorPorAtivo: valorPorAtivo
    }
  };
};