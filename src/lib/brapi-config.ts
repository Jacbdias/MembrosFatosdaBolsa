// lib/brapi-config.ts
export const BRAPI_CONFIG = {
  BASE_URL: 'https://brapi.dev/api',
  TOKEN: 'jJrMYVy9MATGEicx3GxBp8',
  ENDPOINTS: {
    QUOTE: '/quote',
    QUOTE_LIST: '/quote/list',
    AVAILABLE: '/available',
    CRYPTO: '/v2/crypto'
  },
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
  }
};

// Tipos para responses da BRAPI
export interface BrapiQuoteResponse {
  results: Array<{
    symbol: string;
    shortName: string;
    longName: string;
    currency: string;
    regularMarketPrice: number;
    regularMarketDayHigh: number;
    regularMarketDayLow: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    marketCap: number;
    regularMarketVolume: number;
    regularMarketPreviousClose: number;
    regularMarketOpen: number;
    averageDailyVolume3Month: number;
    fiftyTwoWeekLow: number;
    fiftyTwoWeekHigh: number;
    priceEarnings: number;
    earningsPerShare: number;
    logourl: string;
    // Dados fundamentalistas
    returnOnEquity?: number;
    returnOnAssets?: number;
    currentRatio?: number;
    debtToEquity?: number;
    grossMargin?: number;
    operatingMargin?: number;
    netMargin?: number;
    ebitda?: number;
    revenuePerShare?: number;
    // Histórico trimestral
    incomeStatementHistoryQuarterly?: Array<{
      type: string;
      endDate: string;
      totalRevenue: number;
      costOfRevenue: number;
      grossProfit: number;
      researchDevelopment?: number;
      sellingGeneralAdministrative: number;
      nonRecurring?: number;
      otherOperatingExpenses: number;
      totalOperatingExpenses?: number;
      operatingIncome: number;
      totalOtherIncomeExpenseNet: number;
      ebit: number;
      interestExpense: number;
      incomeBeforeTax: number;
      incomeTaxExpense: number;
      minorityInterest?: number;
      netIncomeFromContinuingOps: number;
      discontinuedOperations?: number;
      extraordinaryItems?: number;
      effectOfAccountingCharges?: number;
      otherItems?: number;
      netIncome: number;
      netIncomeApplicableToCommonShares?: number;
      salesExpenses: number;
      lossesDueToNonRecoverabilityOfAssets?: number;
      otherOperatingIncome?: number;
      equityIncomeResult?: number;
      financialResult: number;
      financialIncome: number;
      financialExpenses: number;
      currentTaxes: number;
      deferredTaxes: number;
      incomeBeforeStatutoryParticipationsAndContributions?: number;
      basicEarningsPerCommonShare: number;
      dilutedEarningsPerCommonShare: number;
      basicEarningsPerPreferredShare?: number;
      profitSharingAndStatutoryContributions?: number;
      dilutedEarningsPerPreferredShare?: number;
      updatedAt: string;
    }>;
    balanceSheetHistoryQuarterly?: Array<{
      type: string;
      endDate: string;
      totalAssets: number;
      totalLiab: number;
      totalStockholderEquity: number;
      cash: number;
      totalDebt: number;
      netDebt: number;
      updatedAt: string;
    }>;
    financialDataHistoryQuarterly?: Array<{
      type: string;
      endDate: string;
      totalRevenue: number;
      grossProfit: number;
      ebitda: number;
      netDebtToEbitda: number;
      freeCashFlow: number;
      totalDebt: number;
      netDebt: number;
      grossMargin: number;
      operatingMargin: number;
      netMargin: number;
      updatedAt: string;
    }>;
  }>;
  requestedAt: string;
  took: string;
}

// Interface completa para dados do trimestre
export interface DadosTrimestre {
  // Informações básicas
  ticker: string;
  nomeEmpresa: string;
  dataReferencia: string;
  trimestre: string;
  
  // Dados do período (cotação, P/L, etc.)
  dadosPeriodo: {
    cotacaoFechamento: number;
    performanceTrimestre: number;
    volumeMedioTrimestre: number;
    plPeriodo: number;
    marketCapPeriodo: number;
    beta?: number;
    dividendYield?: number;
  };
  
  // 💰 DEMONSTRATIVO DE RESULTADOS COMPLETO
  demonstrativoResultados: {
    receitaBruta: number;
    custoProdutos: number;
    lucroBruto: number;
    despesasVendas: number;
    despesasAdministrativas: number;
    outrasReceitasDespesas: number;
    resultadoOperacional: number;
    ebit: number;
    receitasFinanceiras: number;
    despesasFinanceiras: number;
    resultadoFinanceiro: number;
    lucroAntesImposto: number;
    impostoRenda: number;
    impostoCorrente: number;
    impostoDiferido: number;
    lucroLiquido: number;
  };
  
  // 📊 MARGENS CALCULADAS
  margens: {
    margemBruta: number;        // (lucroBruto / receita) * 100
    margemOperacional: number;  // (resultadoOp / receita) * 100
    margemEbit: number;         // (ebit / receita) * 100
    margemLiquida: number;      // (lucroLiq / receita) * 100
    margemEbitda?: number;      // se tivermos EBITDA
  };
  
  // 💹 DADOS POR AÇÃO
  porAcao: {
    lpaBasico: number;          // Lucro por ação básico
    lpaDiluido: number;         // Lucro por ação diluído
    numeroAcoesBasico?: number; // Calculado se possível
    numeroAcoesDiluido?: number;
  };
  
  // 📈 VARIAÇÕES E COMPARAÇÕES
  variacoes: {
    receita: {
      valor: number;
      variacaoQoQ: number;  // Quarter over Quarter
      variacaoYoY: number;  // Year over Year
    };
    lucroBruto: {
      valor: number;
      variacaoQoQ: number;
      variacaoYoY: number;
    };
    ebit: {
      valor: number;
      variacaoQoQ: number;
      variacaoYoY: number;
    };
    lucroLiquido: {
      valor: number;
      variacaoQoQ: number;
      variacaoYoY: number;
    };
    lpa: {
      valor: number;
      variacaoQoQ: number;
      variacaoYoY: number;
    };
  };
  
  // 🧮 ANÁLISE AUTOMÁTICA
  analiseAutomatica: {
    situacaoLucro: 'lucro' | 'prejuizo';
    intensidadeOperacional: 'alta' | 'media' | 'baixa'; // despOp/receita
    alavancagemFinanceira: 'alta' | 'media' | 'baixa';  // despFin/receita
    eficienciaOperacional: 'excelente' | 'boa' | 'regular' | 'ruim'; // margem operacional
    qualidadeLucro: 'alta' | 'media' | 'baixa'; // lucroLiq vs operacional
    crescimentoConsistente: boolean; // 3+ trimestres de crescimento
  };
  
  // 🏷️ BADGES INTELIGENTES
  badges: Array<{
    tipo: 'success' | 'warning' | 'info' | 'error';
    categoria: 'crescimento' | 'rentabilidade' | 'eficiencia' | 'financeiro' | 'alerta';
    texto: string;
    descricao: string;
    valor?: number;
  }>;
  
  // 📊 HISTÓRICO COMPARATIVO ENRIQUECIDO
  historicoComparativo: Array<{
    trimestre: string;
    data: string;
    receita: number;
    custoProdutos: number;
    lucroBruto: number;
    despesasOperacionais: number;
    resultadoOperacional: number;
    ebit: number;
    despesasFinanceiras: number;
    lucroLiquido: number;
    lpaBasico: number;
    // Margens
    margemBruta: number;
    margemOperacional: number;
    margemEbit: number;
    margemLiquida: number;
  }>;
  
  // 🎯 MÉTRICAS BÁSICAS (compatibilidade)
  metricas: {
    receita: {
      valor: number;
      unidade: string;
      variacao: number;
      variacaoYoY: number;
    };
    ebitda: {
      valor: number;
      unidade: string;
      margem: number;
      variacao: number;
      variacaoYoY: number;
    };
    lucroLiquido: {
      valor: number;
      unidade: string;
      margem: number;
      variacao: number;
      variacaoYoY: number;
    };
    roe: {
      valor: number;
      unidade: string;
    };
  };
}