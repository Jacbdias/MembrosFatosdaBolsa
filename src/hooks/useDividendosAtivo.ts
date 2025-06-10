// 🎯 src/hooks/useDividendosAtivo.ts - VERSÃO SUPER ROBUSTA
'use client';

import * as React from 'react';

interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
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
}

export function useDividendosAtivo(
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

      console.log(`🔍 Buscando dividendos para ${ticker} desde ${dataEntrada}`);

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      
      // 🚀 ESTRATÉGIA MÚLTIPLA: Tentar diferentes endpoints
      const endpoints = [
        `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}`,
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&modules=dividends`,
        `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true`
      ];

      let dividendosEncontrados: any[] = [];
      let ultimoErro = '';

      for (let i = 0; i < endpoints.length; i++) {
        try {
          console.log(`🌐 Tentativa ${i + 1}: ${endpoints[i].replace(BRAPI_TOKEN, 'TOKEN')}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(endpoints[i], {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          console.log(`📡 Status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);

          if (!response.ok) {
            ultimoErro = `HTTP ${response.status}`;
            continue;
          }

          // 🔍 VERIFICAR SE É REALMENTE JSON
          const contentType = response.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.warn(`⚠️ Content-Type inválido: ${contentType}`);
            ultimoErro = `Resposta não é JSON (${contentType})`;
            continue;
          }

          const responseText = await response.text();
          
          // 🔍 VERIFICAR SE NÃO É HTML
          if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
            console.warn(`⚠️ Resposta é HTML, não JSON`);
            ultimoErro = 'API retornou página HTML';
            continue;
          }

          // 🔍 TENTAR PARSEAR JSON
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.warn(`⚠️ Erro ao parsear JSON:`, parseError);
            ultimoErro = 'JSON inválido';
            continue;
          }

          console.log(`📊 Dados recebidos:`, data);

          // 🔍 EXTRAIR DIVIDENDOS DE DIFERENTES ESTRUTURAS
          if (data.dividends && Array.isArray(data.dividends)) {
            dividendosEncontrados = data.dividends;
            console.log(`✅ Dividendos encontrados via endpoint ${i + 1}`);
            break;
          } else if (data.results && data.results[0] && data.results[0].dividends) {
            dividendosEncontrados = data.results[0].dividends;
            console.log(`✅ Dividendos encontrados via results[0].dividends`);
            break;
          } else if (data.results && Array.isArray(data.results)) {
            // Procurar dividendos em qualquer lugar dos results
            for (const result of data.results) {
              if (result.dividends && Array.isArray(result.dividends)) {
                dividendosEncontrados = result.dividends;
                console.log(`✅ Dividendos encontrados em results`);
                break;
              }
            }
            if (dividendosEncontrados.length > 0) break;
          }

          ultimoErro = 'Estrutura de dados não reconhecida';

        } catch (fetchError) {
          console.warn(`⚠️ Erro na tentativa ${i + 1}:`, fetchError);
          ultimoErro = fetchError instanceof Error ? fetchError.message : 'Erro de rede';
          continue;
        }
      }

      // 🎯 PROCESSAR DIVIDENDOS ENCONTRADOS
      if (dividendosEncontrados.length > 0) {
        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        
        const dividendosProcessados = dividendosEncontrados
          .filter((div: any) => {
            if (!div.date || typeof div.value !== 'number' || div.value <= 0) {
              return false;
            }
            try {
              const dataDividendo = new Date(div.date);
              return dataDividendo >= dataEntradaDate;
            } catch {
              return false;
            }
          })
          .map((div: any) => ({
            date: div.date,
            value: div.value,
            type: div.type || 'Dividendo',
            dataFormatada: new Date(div.date).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${div.value.toFixed(2).replace('.', ',')}`
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ ${ticker}: ${dividendosProcessados.length} dividendos processados`);
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, dividendosProcessados));
        
      } else {
        console.log(`📭 ${ticker}: Nenhum dividendo encontrado. Último erro: ${ultimoErro}`);
        setDividendos([]);
        setPerformance(calcularPerformanceDetalhada(precoEntrada, precoAtual, []));
        
        // 🔄 DEFINIR ERRO APENAS SE REALMENTE HOUVE PROBLEMA
        if (ultimoErro && !ultimoErro.includes('Estrutura de dados')) {
          setError(`Sem dividendos disponíveis (${ultimoErro})`);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral ao buscar dividendos de ${ticker}:`, err);
      setError(errorMessage);
      
      // 🔄 SEMPRE CALCULAR PERFORMANCE DE CAPITAL
      setDividendos([]);
      const performanceFallback = calcularPerformanceDetalhada(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      const timer = setTimeout(buscarDividendos, 500); // Delay maior para evitar conflitos
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

function calcularPerformanceDetalhada(
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
    status: dividendos.length > 0 ? 'success' : 'partial'
  };
}
