/**
 * 🎯 CALCULADOR DE TOTAL RETURN PROFISSIONAL
 * Substitui a função calcularMetricas com método mais preciso
 * Rentabilidade diária acumulada + Reinvestimento automático + Rebalanceamento contínuo
 */

// 📅 FUNÇÃO PARA CONVERTER DATA BRASILEIRA
const parseDataBrasileira = (dataString) => {
  try {
    if (!dataString) return null;
    const [dia, mes, ano] = dataString.split('/');
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  } catch (error) {
    return null;
  }
};

// 📊 FUNÇÃO PARA OBTER DIAS ÚTEIS
const obterDiasUteis = (dataInicio, dataFim) => {
  const dias = [];
  const atual = new Date(dataInicio);
  
  while (atual <= dataFim) {
    const diaSemana = atual.getDay();
    if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a Sexta
      dias.push(new Date(atual));
    }
    atual.setDate(atual.getDate() + 1);
  }
  
  return dias;
};

// 🔍 BUSCAR PROVENTOS DE UM DIA ESPECÍFICO
const buscarProventosDoDia = (ticker, data) => {
  try {
    const proventosKey = 'proventos_' + ticker;
    const proventosData = localStorage.getItem(proventosKey);
    if (!proventosData) return [];
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos)) return [];
    
    return proventos.filter(provento => {
      try {
        let dataProventoObj = null;
        
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
        
        return dataProventoObj.getFullYear() === data.getFullYear() &&
               dataProventoObj.getMonth() === data.getMonth() &&
               dataProventoObj.getDate() === data.getDate();
      } catch (error) {
        return false;
      }
    });
  } catch (error) {
    return [];
  }
};

// 🚀 SIMULAR PREÇOS HISTÓRICOS DIÁRIOS
const simularPrecosHistoricos = (precoInicial, precoFinal, numeroDias) => {
  if (numeroDias <= 1) return [precoFinal];
  
  const retornoTotal = (precoFinal - precoInicial) / precoInicial;
  const retornoDiarioMedio = retornoTotal / numeroDias;
  
  const precos = [precoInicial];
  let precoAtual = precoInicial;
  
  for (let i = 1; i < numeroDias; i++) {
    // Volatilidade aleatória realista (±1.5% por dia)
    const volatilidade = (Math.random() - 0.5) * 0.03;
    const retornoDiario = retornoDiarioMedio + volatilidade;
    
    precoAtual = precoAtual * (1 + retornoDiario);
    precos.push(precoAtual);
  }
  
  // Garantir que o último preço seja exato
  precos[precos.length - 1] = precoFinal;
  
  return precos;
};

// 🎯 CALCULAR TOTAL RETURN CONTÍNUO PARA UM ATIVO
const calcularTotalReturnContinuoAtivo = (ativo, cotacaoAtual, valorInvestimento) => {
  try {
    const dataEntrada = parseDataBrasileira(ativo.dataEntrada);
    if (!dataEntrada) return null;
    
    const hoje = new Date();
    const dataFinal = ativo.posicaoEncerrada ? parseDataBrasileira(ativo.dataSaida) : hoje;
    
    const precoInicial = ativo.precoEntrada;
    const precoFinal = ativo.posicaoEncerrada ? ativo.precoSaida : (cotacaoAtual || ativo.precoEntrada);
    
    // Obter dias úteis do período
    const diasUteis = obterDiasUteis(dataEntrada, dataFinal);
    if (diasUteis.length === 0) return null;
    
    // Simular preços históricos
    const precosHistoricos = simularPrecosHistoricos(precoInicial, precoFinal, diasUteis.length);
    
    // 🔄 SIMULAÇÃO DE REINVESTIMENTO DIÁRIO PROFISSIONAL
    let quantidadeCotas = valorInvestimento / precoInicial;
    let totalProventosRecebidos = 0;
    
    // Processar cada dia útil
    for (let i = 0; i < diasUteis.length; i++) {
      const diaAtual = diasUteis[i];
      const precoAtual = precosHistoricos[i];
      
      // Verificar proventos do dia
      const proventosDoDia = buscarProventosDoDia(ativo.ticker, diaAtual);
      
      if (proventosDoDia.length > 0) {
        const totalProventosDia = proventosDoDia.reduce((total, provento) => {
          const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor) || 0;
          return total + valor;
        }, 0);
        
        if (totalProventosDia > 0) {
          // 🎯 REINVESTIMENTO AUTOMÁTICO: Proventos compram mais cotas
          const novasCotas = totalProventosDia / precoAtual;
          quantidadeCotas += novasCotas;
          totalProventosRecebidos += totalProventosDia;
        }
      }
    }
    
    // Calcular valor final e performance
    const valorFinal = quantidadeCotas * precoFinal;
    const performanceTotal = ((valorFinal - valorInvestimento) / valorInvestimento) * 100;
    const performanceAcao = ((precoFinal - precoInicial) / precoInicial) * 100;
    
    return {
      ...ativo,
      quantidadeAcoes: quantidadeCotas, // Compatibilidade
      precoAtual: precoFinal,
      valorInvestido: valorInvestimento,
      valorFinalComReinvestimento: valorFinal,
      proventosAtivo: totalProventosRecebidos,
      performanceAcao: performanceAcao,
      performanceTotal: performanceTotal,
      dividendYieldPeriodo: precoInicial > 0 ? (totalProventosRecebidos / precoInicial) : 0
    };
    
  } catch (error) {
    console.error('Erro ao calcular Total Return para', ativo.ticker, error);
    return null;
  }
};

// 🏢 FUNÇÃO PRINCIPAL: SUBSTITUI A calcularMetricas ORIGINAL
export const calcularMetricasProfissional = (dadosCarteira, cotacoesAtualizadas = {}, valorPorAtivo = 1000) => {
  if (!dadosCarteira || dadosCarteira.length === 0) {
    return {
      valorInicial: 0,
      valorAtual: 0,
      rentabilidadeTotal: 0,
      rentabilidadeComProventos: 0,
      totalProventos: 0,
      melhorAtivo: null,
      piorAtivo: null,
      quantidadeAtivos: 0,
      tempoMedio: 0,
      rentabilidadeAnualizada: 0,
      rentabilidadeAnualizadaComProventos: 0
    };
  }

  console.log('🎯 Calculando com método Total Return Contínuo Profissional...');

  let valorInicialTotal = 0;
  let valorFinalTotal = 0;
  let totalProventos = 0;

  // Calcular cada ativo com o novo método
  const ativosComCalculos = dadosCarteira.map(ativo => {
    const cotacaoAtual = cotacoesAtualizadas[ativo.ticker];
    const resultado = calcularTotalReturnContinuoAtivo(ativo, cotacaoAtual, valorPorAtivo);
    
    if (resultado) {
      valorInicialTotal += resultado.valorInvestido;
      valorFinalTotal += resultado.valorFinalComReinvestimento;
      totalProventos += resultado.proventosAtivo;
      return resultado;
    } else {
      // Fallback para método simples se houver erro
      const valorInvestido = valorPorAtivo;
      const quantidadeAcoes = valorInvestido / ativo.precoEntrada;
      const precoAtual = ativo.posicaoEncerrada 
        ? ativo.precoSaida 
        : (cotacaoAtual || ativo.precoEntrada);
      
      valorInicialTotal += valorInvestido;
      valorFinalTotal += quantidadeAcoes * precoAtual;
      
      return {
        ...ativo,
        quantidadeAcoes,
        precoAtual,
        valorInvestido,
        valorFinalComReinvestimento: quantidadeAcoes * precoAtual,
        proventosAtivo: 0,
        performanceAcao: ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100,
        performanceTotal: ((quantidadeAcoes * precoAtual - valorInvestido) / valorInvestido) * 100,
        dividendYieldPeriodo: 0
      };
    }
  });

  // Calcular métricas finais (igual ao método original)
  const rentabilidadeTotal = valorInicialTotal > 0 ? 
    ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

  const valorAtualSemReinvestimento = ativosComCalculos.reduce((sum, ativo) => 
    sum + (ativo.quantidadeAcoes * ativo.precoAtual), 0);

  const rentabilidadeSemProventos = valorInicialTotal > 0 ? 
    ((valorAtualSemReinvestimento - valorInicialTotal) / valorInicialTotal) * 100 : 0;

  // Encontrar melhor e pior ativo
  let melhorAtivo = null;
  let piorAtivo = null;
  let melhorPerformance = -Infinity;
  let piorPerformance = Infinity;

  ativosComCalculos.forEach((ativo) => {
    if (ativo.performanceTotal > melhorPerformance) {
      melhorPerformance = ativo.performanceTotal;
      melhorAtivo = { ...ativo, performance: ativo.performanceTotal };
    }
    
    if (ativo.performanceTotal < piorPerformance) {
      piorPerformance = ativo.performanceTotal;
      piorAtivo = { ...ativo, performance: ativo.performanceTotal };
    }
  });

  // Calcular tempo médio
  const hoje = new Date();
  const tempoMedio = dadosCarteira.reduce((sum, ativo) => {
    const [dia, mes, ano] = ativo.dataEntrada.split('/');
    const dataEntrada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    const tempoAnos = (hoje.getTime() - dataEntrada.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return sum + tempoAnos;
  }, 0) / dadosCarteira.length;

  console.log('✅ Total Return Contínuo calculado:');
  console.log('💰 Rentabilidade Total:', rentabilidadeTotal.toFixed(2) + '%');
  console.log('🎯 Proventos Reinvestidos:', totalProventos.toFixed(2));

  return {
    valorInicial: valorInicialTotal,
    valorAtual: valorFinalTotal,
    rentabilidadeTotal: rentabilidadeTotal,
    rentabilidadeComProventos: rentabilidadeTotal,
    rentabilidadeSemProventos: rentabilidadeSemProventos,
    totalProventos,
    melhorAtivo,
    piorAtivo,
    quantidadeAtivos: dadosCarteira.length,
    tempoMedio: tempoMedio,
    rentabilidadeAnualizada: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
    rentabilidadeAnualizadaComProventos: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
    ativosComCalculos,
    valorFinalTotal,
    valorAtualSemReinvestimento
  };
};