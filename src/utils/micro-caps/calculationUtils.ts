import type { Ativo, CarteiraMetricas } from '@/types/microCaps';

// 🔥 FUNÇÕES UTILITÁRIAS PARA CÁLCULOS FINANCEIROS

// 🎯 CALCULAR VIÉS AUTOMATICAMENTE
export const calcularViesAutomatico = (precoTeto: number | undefined, precoAtual: string): string => {
  if (!precoTeto || precoAtual === 'N/A') {
    return 'Aguardar';
  }
  
  // Remover formatação e converter para números
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  if (isNaN(precoAtualNum)) {
    return 'Aguardar';
  }
  
  // 🎯 LÓGICA: Preço Atual < Preço Teto = COMPRA (ação está barata)
  return precoAtualNum < precoTeto ? 'Compra' : 'Aguardar';
};

// 💰 CALCULAR PROVENTOS DE UM ATIVO NO PERÍODO
export const calcularProventosAtivo = (ticker: string, dataEntrada: string): number => {
  try {
    if (typeof window === 'undefined') return 0;
    
    console.log(`💰 [PROV] Calculando proventos para ${ticker} desde ${dataEntrada}`);
    
    // 🎯 TENTATIVA 1: Buscar proventos do ticker específico
    let proventosData = localStorage.getItem(`proventos_${ticker}`);
    let fonte = 'individual';
    
    // 🔄 TENTATIVA 2: Fallback para master
    if (!proventosData) {
      console.log(`⚠️ [PROV] Proventos individuais de ${ticker} não encontrados, buscando no master...`);
      
      const masterData = localStorage.getItem('proventos_central_master');
      if (masterData) {
        try {
          const todosProviventos = JSON.parse(masterData);
          console.log(`📊 [PROV] Master carregado: ${todosProviventos.length} proventos totais`);
          
          // Filtrar apenas os proventos do ticker específico
          const proventosTicker = todosProviventos.filter((p: any) => 
            p.ticker && p.ticker.toUpperCase() === ticker.toUpperCase()
          );
          
          console.log(`🎯 [PROV] Encontrados ${proventosTicker.length} proventos para ${ticker} no master`);
          
          if (proventosTicker.length > 0) {
            proventosData = JSON.stringify(proventosTicker);
            fonte = 'master';
          }
        } catch (error) {
          console.error(`❌ [PROV] Erro ao processar master:`, error);
        }
      }
    }
    
    if (!proventosData) {
      console.log(`❌ [PROV] Nenhum provento encontrado para ${ticker}`);
      return 0;
    }
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) {
      console.log(`❌ [PROV] Array de proventos vazio para ${ticker}`);
      return 0;
    }
    
    // 📅 Converter data de entrada para objeto Date
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia), 12, 0, 0);
    
    console.log(`📅 [PROV] Data de entrada: ${dataEntradaObj.toLocaleDateString('pt-BR')}`);
    
    // 🔍 Filtrar proventos pagos após a data de entrada
    const proventosFiltrados = proventos.filter((provento: any) => {
      try {
        let dataProventoObj: Date;
        
        // 🔄 Tentar diferentes formatos de data
        if (provento.dataObj) {
          dataProventoObj = new Date(provento.dataObj);
        } else if (provento.dataPagamento) {
          if (provento.dataPagamento.includes('/')) {
            const [d, m, a] = provento.dataPagamento.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d), 12, 0, 0);
          } else {
            dataProventoObj = new Date(provento.dataPagamento);
          }
        } else if (provento.dataCom) {
          if (provento.dataCom.includes('/')) {
            const [d, m, a] = provento.dataCom.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d), 12, 0, 0);
          } else {
            dataProventoObj = new Date(provento.dataCom);
          }
        } else if (provento.data) {
          if (provento.data.includes('/')) {
            const [d, m, a] = provento.data.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d), 12, 0, 0);
          } else {
            dataProventoObj = new Date(provento.data);
          }
        } else {
          return false;
        }
        
        // Verificar se a data é válida
        if (isNaN(dataProventoObj.getTime())) {
          return false;
        }
        
        return dataProventoObj >= dataEntradaObj;
        
      } catch (error) {
        console.error(`❌ [PROV] Erro ao processar data do provento:`, error);
        return false;
      }
    });
    
    console.log(`📊 [PROV] ${ticker}: ${proventosFiltrados.length} proventos válidos desde a entrada`);
    
    // 💰 Somar valores dos proventos
    const totalProventos = proventosFiltrados.reduce((total: number, provento: any) => {
      let valor = 0;
      
      if (typeof provento.valor === 'number') {
        valor = provento.valor;
      } else if (typeof provento.valor === 'string') {
        valor = parseFloat(
          provento.valor
            .toString()
            .replace('R$', '')
            .replace(/\s/g, '')
            .replace(',', '.')
        );
      }
      
      if (isNaN(valor)) {
        valor = 0;
      }
      
      return total + valor;
    }, 0);
    
    console.log(`✅ [PROV] ${ticker} - Total: R$ ${totalProventos.toFixed(2)} (${proventosFiltrados.length} proventos, fonte: ${fonte})`);
    
    return totalProventos;
    
  } catch (error) {
    console.error(`❌ [PROV] Erro ao calcular proventos para ${ticker}:`, error);
    return 0;
  }
};

// 🧮 CALCULAR MÉTRICAS DA CARTEIRA
export const calcularMetricasCarteira = (ativosAtualizados: Ativo[], valorPorAtivo = 1000): CarteiraMetricas => {
  if (!ativosAtualizados || ativosAtualizados.length === 0) {
    return {
      valorInicial: 0,
      valorAtual: 0,
      rentabilidadeTotal: 0,
      quantidadeAtivos: 0,
      melhorAtivo: null,
      piorAtivo: null,
      dyMedio: 0,
      ativosPositivos: 0,
      ativosNegativos: 0
    };
  }

  const valorInicialTotal = ativosAtualizados.length * valorPorAtivo;
  let valorFinalTotal = 0;
  let melhorPerformance = -Infinity;
  let piorPerformance = Infinity;
  let melhorAtivo = null;
  let piorAtivo = null;
  let ativosPositivos = 0;
  let ativosNegativos = 0;

  ativosAtualizados.forEach((ativo) => {
    const valorFinal = valorPorAtivo * (1 + ativo.performance / 100);
    valorFinalTotal += valorFinal;

    if (ativo.performance > 0) ativosPositivos++;
    if (ativo.performance < 0) ativosNegativos++;

    if (ativo.performance > melhorPerformance) {
      melhorPerformance = ativo.performance;
      melhorAtivo = ativo;
    }

    if (ativo.performance < piorPerformance) {
      piorPerformance = ativo.performance;
      piorAtivo = ativo;
    }
  });

  const rentabilidadeTotal = valorInicialTotal > 0 ? 
    ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;

  // Calcular DY médio
  const dyValues = ativosAtualizados
    .map(ativo => parseFloat(ativo.dy.replace('%', '').replace(',', '.')))
    .filter(dy => !isNaN(dy) && dy > 0);
  
  const dyMedio = dyValues.length > 0 ? 
    dyValues.reduce((sum, dy) => sum + dy, 0) / dyValues.length : 0;

  return {
    valorInicial: valorInicialTotal,
    valorAtual: valorFinalTotal,
    rentabilidadeTotal,
    quantidadeAtivos: ativosAtualizados.length,
    melhorAtivo,
    piorAtivo,
    dyMedio,
    ativosPositivos,
    ativosNegativos
  };
};

// 💱 FUNÇÕES DE FORMATAÇÃO
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  const signal = value >= 0 ? '+' : '';
  return signal + value.toFixed(2) + '%';
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};