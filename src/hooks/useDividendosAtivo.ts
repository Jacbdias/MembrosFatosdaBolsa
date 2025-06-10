// 🎯 src/hooks/useProventosAtivo.ts - TODOS OS TIPOS DE PROVENTOS
'use client';

import * as React from 'react';

interface ProventoDetalhado {
  date: string;
  value: number;
  type: string;
  subtype?: string;
  dataFormatada: string;
  valorFormatado: string;
  categoria: 'monetario' | 'acao' | 'outro';
  impactoPercentual: number;
}

interface PerformanceCompleta {
  performanceCapital: number;
  proventosMonetarios: number;
  proventosPercentual: number;
  performanceTotal: number;
  quantidadeProventos: number;
  ultimoProvento: string;
  proventosPorAno: { [ano: string]: number };
  proventosPorTipo: { [tipo: string]: number };
  mediaAnual: number;
  status: 'success' | 'partial' | 'error';
  debugInfo?: string;
}

export function useProventosAtivo(
  ticker: string, 
  dataEntrada: string, 
  precoEntrada: string, 
  precoAtual: string
) {
  const [proventos, setProventos] = React.useState<ProventoDetalhado[]>([]);
  const [performance, setPerformance] = React.useState<PerformanceCompleta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarProventos = React.useCallback(async () => {
    if (!ticker || !dataEntrada || !precoEntrada) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 === BUSCANDO TODOS OS PROVENTOS PARA ${ticker} ===`);
      console.log(`📅 Data entrada: ${dataEntrada}`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 🔍 MÚLTIPLAS ESTRATÉGIAS PARA CAPTURAR TODOS OS PROVENTOS
      const estrategias = [
        {
          nome: 'Dividendos Específicos',
          url: `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}`,
          extrair: (data: any) => data.dividends || []
        },
        {
          nome: 'Dados Fundamentais',
          url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&modules=dividends,splits,earnings`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.splits || []),
              ...(result?.earnings || [])
            ];
          }
        },
        {
          nome: 'Histórico Completo',
          url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&range=5y&interval=1d&fundamental=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.stockSplits || []),
              ...(result?.capitalGains || [])
            ];
          }
        }
      ];

      // 🔍 VARIAÇÕES DO TICKER
      const tickerVariacoes = [
        ticker,
        ticker.replace(/[34]$/, ''),  // Remove 3 ou 4 do final
        ticker + '.SA',
        ticker.replace(/[34]$/, '') + '.SA'
      ];

      let todosProventos: any[] = [];
      let debugInfo = '';

      for (const tickerTeste of tickerVariacoes) {
        console.log(`\n🎯 Testando ticker: ${tickerTeste}`);
        
        for (const estrategia of estrategias) {
          try {
            const url = estrategia.url.replace(ticker, tickerTeste);
            console.log(`📡 ${estrategia.nome}: ${url.replace(BRAPI_TOKEN, 'TOKEN')}`);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
              console.log(`❌ ${tickerTeste} ${estrategia.nome}: HTTP ${response.status}`);
              continue;
            }

            const data = await response.json();
            const proventosDaEstrategia = estrategia.extrair(data);
            
            if (proventosDaEstrategia && proventosDaEstrategia.length > 0) {
              console.log(`✅ ${tickerTeste} ${estrategia.nome}: ${proventosDaEstrategia.length} proventos`);
              
              // Log dos proventos encontrados
              proventosDaEstrategia.forEach((p: any, i: number) => {
                console.log(`  ${i + 1}. ${p.date} - ${p.type || 'N/A'} - ${p.value || p.amount || 'N/A'}`);
              });
              
              todosProventos = [...todosProventos, ...proventosDaEstrategia];
              debugInfo += `${estrategia.nome}(${tickerTeste}): ${proventosDaEstrategia.length} proventos. `;
            } else {
              console.log(`📭 ${tickerTeste} ${estrategia.nome}: Nenhum provento`);
            }

          } catch (err) {
            console.log(`❌ ${tickerTeste} ${estrategia.nome}: ${err}`);
          }
        }
      }

      // 🔄 REMOVER DUPLICATAS E PROCESSAR
      const proventosUnicos = removeDuplicatas(todosProventos);
      console.log(`📊 Total de proventos únicos encontrados: ${proventosUnicos.length}`);

      if (proventosUnicos.length > 0) {
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.'));
        
        const proventosFiltrados = proventosUnicos
          .filter((p: any) => {
            if (!p.date) return false;
            
            try {
              const dataProvento = new Date(p.date);
              const isAfterEntry = dataProvento >= dataEntradaDate;
              
              console.log(`📊 ${p.date} (${p.type || 'N/A'}) - Após entrada: ${isAfterEntry}`);
              return isAfterEntry;
            } catch {
              return false;
            }
          })
          .map((p: any) => categorizarProvento(p, precoEntradaNum))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ Proventos processados: ${proventosFiltrados.length}`);
        
        setProventos(proventosFiltrados);
        setPerformance(calcularPerformanceCompleta(precoEntrada, precoAtual, proventosFiltrados));
        
        if (debugInfo) {
          console.log(`📋 Debug: ${debugInfo}`);
        }

      } else {
        console.log(`📭 Nenhum provento encontrado para ${ticker}`);
        setProventos([]);
        setPerformance(calcularPerformanceCompleta(precoEntrada, precoAtual, []));
        setError(`Nenhum provento encontrado. Testados: ${tickerVariacoes.join(', ')}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral:`, err);
      setError(errorMessage);
      
      setProventos([]);
      const performanceFallback = calcularPerformanceCompleta(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      const timer = setTimeout(buscarProventos, 300);
      return () => clearTimeout(timer);
    }
  }, [buscarProventos]);

  return {
    proventos,
    performance,
    loading,
    error,
    refetch: buscarProventos
  };
}

// 🔄 FUNÇÃO PARA REMOVER DUPLICATAS
function removeDuplicatas(proventos: any[]): any[] {
  const vistos = new Set();
  return proventos.filter(p => {
    const chave = `${p.date}_${p.type}_${p.value || p.amount}`;
    if (vistos.has(chave)) {
      return false;
    }
    vistos.add(chave);
    return true;
  });
}

// 🏷️ FUNÇÃO PARA CATEGORIZAR TIPOS DE PROVENTO
function categorizarProvento(provento: any, precoEntrada: number): ProventoDetalhado {
  const tipo = provento.type || provento.eventType || 'Desconhecido';
  const valor = provento.value || provento.amount || provento.rate || 0;
  
  // 📊 CATEGORIZAR POR TIPO
  let categoria: 'monetario' | 'acao' | 'outro' = 'outro';
  let valorMonetario = 0;
  let impactoPercentual = 0;

  const tipoLower = tipo.toLowerCase();
  
  if (tipoLower.includes('dividend') || tipoLower.includes('jcp') || 
      tipoLower.includes('interest') || tipoLower.includes('rendimento')) {
    categoria = 'monetario';
    valorMonetario = valor;
    impactoPercentual = precoEntrada > 0 ? (valor / precoEntrada) * 100 : 0;
  } else if (tipoLower.includes('split') || tipoLower.includes('bonificação') || 
             tipoLower.includes('bonus') || tipoLower.includes('stock')) {
    categoria = 'acao';
    // Para splits/bonificações, calcular impacto diferente
    impactoPercentual = valor > 1 ? (valor - 1) * 100 : 0;
  }

  return {
    date: provento.date,
    value: valorMonetario,
    type: tipo,
    subtype: provento.subtype,
    dataFormatada: new Date(provento.date).toLocaleDateString('pt-BR'),
    valorFormatado: valorMonetario > 0 ? `R$ ${valorMonetario.toFixed(2).replace('.', ',')}` : `${valor}x`,
    categoria,
    impactoPercentual
  };
}

// 📊 FUNÇÃO PARA CALCULAR PERFORMANCE COMPLETA
function calcularPerformanceCompleta(
  precoEntrada: string,
  precoAtual: string,
  proventos: ProventoDetalhado[]
): PerformanceCompleta {
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  // 📈 PERFORMANCE DE CAPITAL
  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  // 💰 APENAS PROVENTOS MONETÁRIOS PARA CÁLCULO
  const proventosMonetarios = proventos
    .filter(p => p.categoria === 'monetario')
    .reduce((sum, p) => sum + p.value, 0);
  
  const proventosPercentual = precoEntradaNum > 0 
    ? (proventosMonetarios / precoEntradaNum) * 100 
    : 0;

  const performanceTotal = performanceCapital + proventosPercentual;

  // 📊 ESTATÍSTICAS
  const ultimoProvento = proventos.length > 0 ? proventos[0].dataFormatada : 'Nenhum';

  const proventosPorAno: { [ano: string]: number } = {};
  const proventosPorTipo: { [tipo: string]: number } = {};

  proventos.forEach(p => {
    // Por ano (apenas monetários)
    if (p.categoria === 'monetario') {
      const ano = new Date(p.date).getFullYear().toString();
      proventosPorAno[ano] = (proventosPorAno[ano] || 0) + p.value;
    }
    
    // Por tipo (todos)
    proventosPorTipo[p.type] = (proventosPorTipo[p.type] || 0) + 1;
  });

  const anos = Object.keys(proventosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(proventosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  return {
    performanceCapital,
    proventosMonetarios,
    proventosPercentual,
    performanceTotal,
    quantidadeProventos: proventos.length,
    ultimoProvento,
    proventosPorAno,
    proventosPorTipo,
    mediaAnual,
    status: proventos.length > 0 ? 'success' : 'partial'
  };
}
