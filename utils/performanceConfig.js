/**
 * 🔧 CONFIGURAÇÕES DO SISTEMA DE PERFORMANCE
 * Centralizando configurações e constantes do calculator
 */

export const PERFORMANCE_CONFIG = {
  // 💰 Valores padrão
  VALOR_INVESTIMENTO_PADRAO: 1000,
  
  // 📅 Configurações de tempo
  DIAS_UTEIS_POR_ANO: 252,
  DIAS_SEMANA_UTEIS: [1, 2, 3, 4, 5], // Segunda a Sexta
  
  // 🎯 Configurações de cálculo
  VOLATILIDADE_SIMULACAO: 0.04, // ±2% por dia na simulação
  CASAS_DECIMAIS_RENTABILIDADE: 1,
  CASAS_DECIMAIS_VALOR: 2,
  
  // 🔄 Cache e performance
  CACHE_TIMEOUT_MS: 30000, // 30 segundos
  MAX_DIAS_SIMULACAO: 5000, // Limite de dias para simulação
  
  // 📊 Formatação
  LOCALES: {
    BRL: 'pt-BR',
    USD: 'en-US'
  },
  
  CURRENCIES: {
    BRL: 'BRL',
    USD: 'USD'
  }
};

export const METODOS_CALCULO = {
  TOTAL_RETURN_CONTINUO: 'Total Return Contínuo',
  TOTAL_RETURN_SIMPLES: 'Total Return Simples',
  APENAS_VALORIZACAO: 'Apenas Valorização',
  BUY_AND_HOLD: 'Buy and Hold'
};

export const STATUS_CALCULO = {
  SUCESSO: 'sucesso',
  ERRO: 'erro',
  PROCESSANDO: 'processando',
  CACHE: 'cache'
};

// 🎨 Cores para interface
export const CORES_PERFORMANCE = {
  POSITIVO: '#10b981',
  NEGATIVO: '#ef4444',
  NEUTRO: '#64748b',
  DESTAQUE: '#3b82f6',
  AVISO: '#f59e0b'
};

// 📈 Faixas de performance para classificação
export const FAIXAS_PERFORMANCE = {
  EXCELENTE: 20,    // > 20% ao ano
  BOA: 15,          // 15-20% ao ano
  MEDIA: 10,        // 10-15% ao ano
  FRACA: 5,         // 5-10% ao ano
  RUIM: 0           // 0-5% ao ano
  // < 0% = Perda
};

// 🔍 Função para classificar performance
export const classificarPerformance = (rentabilidadeAnual) => {
  if (rentabilidadeAnual >= FAIXAS_PERFORMANCE.EXCELENTE) return 'EXCELENTE';
  if (rentabilidadeAnual >= FAIXAS_PERFORMANCE.BOA) return 'BOA';
  if (rentabilidadeAnual >= FAIXAS_PERFORMANCE.MEDIA) return 'MÉDIA';
  if (rentabilidadeAnual >= FAIXAS_PERFORMANCE.FRACA) return 'FRACA';
  if (rentabilidadeAnual >= FAIXAS_PERFORMANCE.RUIM) return 'RUIM';
  return 'PERDA';
};

// 🎯 Função para obter cor baseada na performance
export const obterCorPerformance = (rentabilidade) => {
  if (rentabilidade > 0) return CORES_PERFORMANCE.POSITIVO;
  if (rentabilidade < 0) return CORES_PERFORMANCE.NEGATIVO;
  return CORES_PERFORMANCE.NEUTRO;
};

// 📊 Templates de métricas vazias
export const METRICAS_VAZIA = {
  valorInicial: 0,
  valorFinal: 0,
  rentabilidadeTotal: 0,
  rentabilidadeAnualizada: 0,
  totalProventos: 0,
  quantidadeAtivos: 0,
  ativosComCalculos: [],
  melhorAtivo: null,
  piorAtivo: null,
  metodo: METODOS_CALCULO.TOTAL_RETURN_CONTINUO,
  loading: false,
  erro: null
};