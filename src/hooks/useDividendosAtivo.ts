// 🎯 Hook Melhorado com API Dados de Mercado
'use client';

import * as React from 'react';

interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
  exDate?: string;
  paymentDate?: string;
}

interface PerformanceDetalhada {
  performanceCapital: number;
  dividendosTotal: number;
  dividendosPercentual: number;
  performanceTotal: number;
  quantidadeDividendos: number;
  ultimoDividendo: string;
  dividendosPorAno: { [ano: string]: number };
  mediaAnual: number;
  status: 'success' | 'partial' | 'error';
  fonte: 'ddm' | 'brapi' | 'hg' | 'local';
}

// 🗂️ MAPEAMENTO DE TICKERS PARA CÓDIGOS CVM
const TICKER_TO_CVM: { [key: string]: string } = {
  'ALOS3': '5410',   // Allos
  'PETR4': '9512',   // Petrobras
  'VALE3': '4170',   // Vale
  'ITUB4': '18520',  // Itaú
  'BBDC4': '17175',  // Bradesco
  // Adicione mais conforme necessário
};

export function useDividendosMelhorado(
  ticker: string, 
  dataEntrada: string, 
  precoEntrada: string, 
  precoAtual: string
) {
  const [dividendos, setDividendos] = React.useState<DividendoDetalhado[]>([]);
  const [performance, setPerformance] = React.useState<PerformanceDetalhada | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarDividendos = React.useCallback(async () => {
    if (!ticker || !dataEntrada || !precoEntrada) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 === BUSCA MELHORADA DE DIVIDENDOS PARA ${ticker} ===`);

      let dividendosEncontrados: DividendoDetalhado[] = [];
      let fonte: 'ddm' | 'brapi' | 'hg' | 'local' = 'local';

      // 🏆 ESTRATÉGIA 1: DADOS DE MERCADO (API PREMIUM)
      try {
        console.log('📊 Tentando API Dados de Mercado...');
        dividendosEncontrados = await buscarDividendosDDM(ticker);
        if (dividendosEncontrados.length > 0) {
          fonte = 'ddm';
          console.log(`✅ Sucesso com Dados de Mercado: ${dividendosEncontrados.length} dividendos`);
        }
      } catch (err) {
        console.log('❌ Dados de Mercado falhou:', err);
      }

      // 🥈 ESTRATÉGIA 2: HG BRASIL (FALLBACK)
      if (dividendosEncontrados.length === 0) {
        try {
          console.log('📊 Tentando HG Brasil...');
          dividendosEncontrados = await buscarDividendosHG(ticker);
          if (dividendosEncontrados.length > 0) {
            fonte = 'hg';
            console.log(`✅ Sucesso com HG Brasil: ${dividendosEncontrados.length} dividendos`);
          }
        } catch (err) {
          console.log('❌ HG Brasil falhou:', err);
        }
      }

      // 🥉 ESTRATÉGIA 3: BRAPI (SEU HOOK ORIGINAL)
      if (dividendosEncontrados.length === 0) {
        try {
          console.log('📊 Tentando BRAPI (método original)...');
          dividendosEncontrados = await buscarDividendosBrapi(ticker);
          if (dividendosEncontrados.length > 0) {
            fonte = 'brapi';
            console.log(`✅ Sucesso com BRAPI: ${dividendosEncontrados.length} dividendos`);
          }
        } catch (err) {
          console.log('❌ BRAPI falhou:', err);
        }
      }

      // 🗂️ ESTRATÉGIA 4: DADOS LOCAIS (ÚLTIMO RECURSO)
      if (dividendosEncontrados.length === 0) {
        console.log('📊 Usando dados locais...');
        dividendosEncontrados = buscarDividendosLocal(ticker);
        fonte = 'local';
      }

      // 🔍 FILTRAR POR DATA DE ENTRADA
      const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
      const dividendosFiltrados = dividendosEncontrados
        .filter(div => {
          try {
            const dataDiv = new Date(div.date);
            return dataDiv >= dataEntradaDate;
          } catch {
            return false;
          }
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`✅ FINAL: ${dividendosFiltrados.length} dividendos desde ${dataEntrada} (fonte: ${fonte})`);

      setDividendos(dividendosFiltrados);
      const performanceCalculada = calcularPerformance(precoEntrada, precoAtual, dividendosFiltrados);
      performanceCalculada.fonte = fonte;
      setPerformance(performanceCalculada);

      if (dividendosFiltrados.length === 0 && dividendosEncontrados.length > 0) {
        setError(`Encontrados ${dividendosEncontrados.length} dividendos, mas todos anteriores à entrada (${dataEntrada})`);
      } else if (dividendosEncontrados.length === 0) {
        setError('Nenhum dividendo encontrado em nenhuma fonte. A empresa pode não ter distribuído proventos.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral:`, err);
      setError(errorMessage);
      
      setDividendos([]);
      const performanceFallback = calcularPerformance(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      performanceFallback.fonte = 'local';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      const timer = setTimeout(buscarDividendos, 500);
      return () => clearTimeout(timer);
    }
  }, [buscarDividendos]);

  return {
    dividendos,
    performance,
    loading,
    error,
    refetch: buscarDividendos
  };
}

// 🏆 API DADOS DE MERCADO (MELHOR OPÇÃO)
async function buscarDividendosDDM(ticker: string): Promise<DividendoDetalhado[]> {
  const cvmCode = TICKER_TO_CVM[ticker];
  if (!cvmCode) {
    throw new Error(`Código CVM não encontrado para ${ticker}`);
  }

  // NOTA: Você precisa de um token da API Dados de Mercado
  // Cadastre-se em: https://www.dadosdemercado.com.br/api
  const DDM_TOKEN = 'SEU_TOKEN_DDM'; // Substitua pelo seu token
  
  const url = `https://api.dadosdemercado.com.br/v1/companies/${cvmCode}/dividends`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${DDM_TOKEN}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`DDM API erro: ${response.status}`);
  }

  const data = await response.json();
  
  return data.map((item: any) => ({
    date: item.date || item.payment_date,
    value: parseFloat(item.amount || item.value || 0),
    type: item.type || 'Dividendo',
    dataFormatada: new Date(item.date || item.payment_date).toLocaleDateString('pt-BR'),
    valorFormatado: `R$ ${parseFloat(item.amount || item.value || 0).toFixed(4).replace('.', ',')}`,
    exDate: item.ex_date,
    paymentDate: item.payment_date
  }));
}

// 🥈 HG BRASIL (ALTERNATIVA CONFIÁVEL)
async function buscarDividendosHG(ticker: string): Promise<DividendoDetalhado[]> {
  // NOTA: Você precisa de uma chave da HG Brasil
  // Cadastre-se em: https://hgbrasil.com/
  const HG_KEY = 'SUA_CHAVE_HG'; // Substitua pela sua chave
  
  const url = `https://api.hgbrasil.com/finance/dividends/${ticker}?key=${HG_KEY}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HG Brasil erro: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.results || !data.results.dividends) {
    return [];
  }

  return data.results.dividends.map((item: any) => ({
    date: item.date,
    value: parseFloat(item.amount || 0),
    type: item.type || 'Dividendo',
    dataFormatada: new Date(item.date).toLocaleDateString('pt-BR'),
    valorFormatado: `R$ ${parseFloat(item.amount || 0).toFixed(4).replace('.', ',')}`
  }));
}

// 🥉 BRAPI (SEU MÉTODO ORIGINAL SIMPLIFICADO)
async function buscarDividendosBrapi(ticker: string): Promise<DividendoDetalhado[]> {
  const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
  
  const estrategias = [
    `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true`,
    `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true`,
    `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}`
  ];

  for (const url of estrategias) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Extrair dividendos da resposta BRAPI
      let dividendos: any[] = [];
      
      if (data.results?.[0]?.dividendsData?.cashDividends) {
        dividendos = data.results[0].dividendsData.cashDividends;
      } else if (data.results?.[0]?.dividends) {
        dividendos = data.results[0].dividends;
      } else if (data.dividends) {
        dividendos = data.dividends;
      }

      if (dividendos.length > 0) {
        return dividendos.map((item: any) => ({
          date: item.paymentDate || item.date,
          value: item.rate || item.value || item.amount || 0,
          type: item.type || item.label || 'Dividendo',
          dataFormatada: new Date(item.paymentDate || item.date).toLocaleDateString('pt-BR'),
          valorFormatado: `R$ ${(item.rate || item.value || item.amount || 0).toFixed(4).replace('.', ',')}`
        }));
      }
    } catch (err) {
      console.log(`Estratégia BRAPI falhou:`, err);
    }
  }
  
  return [];
}

// 🗂️ DADOS LOCAIS (FALLBACK)
function buscarDividendosLocal(ticker: string): DividendoDetalhado[] {
  const dividendosLocais: { [key: string]: DividendoDetalhado[] } = {
    'ALOS3': [
      {
        date: '2024-05-15',
        value: 0.85,
        type: 'Dividendo',
        dataFormatada: '15/05/2024',
        valorFormatado: 'R$ 0,8500'
      },
      {
        date: '2023-12-15', 
        value: 0.80,
        type: 'Dividendo',
        dataFormatada: '15/12/2023',
        valorFormatado: 'R$ 0,8000'
      }
    ]
    // Adicione mais tickers conforme necessário
  };

  return dividendosLocais[ticker] || [];
}

// 📊 FUNÇÃO DE CÁLCULO (MESMA DO SEU HOOK)
function calcularPerformance(
  precoEntrada: string,
  precoAtual: string,
  dividendos: DividendoDetalhado[]
): PerformanceDetalhada {
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  const dividendosTotal = dividendos.reduce((sum, div) => sum + (div.value || 0), 0);
  const dividendosPercentual = precoEntradaNum > 0 ? (dividendosTotal / precoEntradaNum) * 100 : 0;
  const performanceTotal = performanceCapital + dividendosPercentual;

  const ultimoDividendo = dividendos.length > 0 ? dividendos[0].dataFormatada : 'Nenhum';

  const dividendosPorAno: { [ano: string]: number } = {};
  dividendos.forEach(div => {
    try {
      const ano = new Date(div.date).getFullYear().toString();
      dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + (div.value || 0);
    } catch {
      // Ignorar datas inválidas
    }
  });

  const anos = Object.keys(dividendosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(dividendosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  return {
    performanceCapital,
    dividendosTotal,
    dividendosPercentual,
    performanceTotal,
    quantidadeDividendos: dividendos.length,
    ultimoDividendo,
    dividendosPorAno,
    mediaAnual,
    status: dividendos.length > 0 ? 'success' : 'partial',
    fonte: 'local' // Será sobrescrito
  };
}
