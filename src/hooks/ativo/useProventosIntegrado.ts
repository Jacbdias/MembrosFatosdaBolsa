import { useState, useCallback, useEffect } from 'react';

// 📁 FUNÇÃO FALLBACK PARA LOCALSTORAGE
async function calcularProventosLocalStorageAprimorado(ticker: string, dataEntrada: string): Promise<number> {
  try {
    console.log(`📁 [localStorage] Buscando fallback para ${ticker}...`);
    
    if (typeof window === 'undefined') return 0;

    const chavesPossiveis = [
      `proventos_${ticker}`,
      `dividendos_${ticker}`,
      `rendimentos_${ticker}`,
      `dividendos_fii_${ticker}`,
      'proventos_central_master'
    ];

    let proventosEncontrados: any[] = [];

    for (const chave of chavesPossiveis) {
      const dados = localStorage.getItem(chave);
      if (dados) {
        try {
          const dadosParseados = JSON.parse(dados);
          
          if (Array.isArray(dadosParseados)) {
            const proventosTicker = dadosParseados.filter((item: any) => 
              item.ticker === ticker || item.symbol === ticker
            );
            proventosEncontrados.push(...proventosTicker);
          }
        } catch (parseError) {
          console.warn(`⚠️ [localStorage] Erro ao parsear ${chave}:`, parseError);
        }
      }
    }

    if (proventosEncontrados.length === 0) {
      console.log(`❌ [localStorage] Nenhum provento encontrado para ${ticker}`);
      return 0;
    }

    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    dataEntradaObj.setHours(0, 0, 0, 0);

    const proventosFiltrados = proventosEncontrados.filter((provento: any) => {
      try {
        let dataProventoObj: Date | null = null;

        if (provento.dataObj) {
          dataProventoObj = new Date(provento.dataObj);
        } else if (provento.dataPagamento && provento.dataPagamento.includes('/')) {
          const [d, m, a] = provento.dataPagamento.split('/');
          dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
        } else if (provento.data && provento.data.includes('/')) {
          const [d, m, a] = provento.data.split('/');
          dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
        }

        if (!dataProventoObj || isNaN(dataProventoObj.getTime())) {
          return false;
        }

        dataProventoObj.setHours(0, 0, 0, 0);
        return dataProventoObj >= dataEntradaObj;
      } catch (error) {
        return false;
      }
    });

    const valorTotal = proventosFiltrados.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' 
        ? provento.valor 
        : parseFloat(String(provento.valor || '0').replace(',', '.'));
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);

    console.log(`✅ [localStorage] ${ticker}: ${proventosFiltrados.length} proventos = R$ ${valorTotal.toFixed(2)}`);
    return valorTotal;

  } catch (error) {
    console.error(`❌ [localStorage] Erro para ${ticker}:`, error);
    return 0;
  }
}

// 🔥 HOOK INTEGRADO PARA PROVENTOS - VERSÃO COMPLETA
export function useProventosIntegrado(ticker: string, dataEntrada: string, precoEntrada?: number | string) {
  const [proventosData, setProventosData] = useState<{
    valor: number;
    performanceProventos: number;
    fonte: string;
  }>({
    valor: 0,
    performanceProventos: 0,
    fonte: 'carregando'
  });
  const [loading, setLoading] = useState(true);

  const fetchProventos = useCallback(async () => {
    if (!ticker || !dataEntrada) {
      console.log(`❌ [PROVENTOS] Dados insuficientes:`, { ticker, dataEntrada });
      setProventosData({
        valor: 0,
        performanceProventos: 0,
        fonte: 'dados insuficientes'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`💰 [PROVENTOS] === INICIANDO BUSCA PARA ${ticker} ===`);
      console.log(`📅 [PROVENTOS] Data entrada: ${dataEntrada}`);

      // 📅 PROCESSAR DATA DE ENTRADA
      if (!dataEntrada.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        throw new Error(`Data de entrada inválida: ${dataEntrada}`);
      }

      const [dia, mes, ano] = dataEntrada.split('/');
      const dataEntradaDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      dataEntradaDate.setHours(0, 0, 0, 0);
      
      console.log(`📅 [PROVENTOS] Data processada:`, {
        original: dataEntrada,
        processada: dataEntradaDate.toISOString(),
        timestamp: dataEntradaDate.getTime()
      });

      let valorProventos = 0;
      let fonte = 'API';

      // 🌐 MÉTODO 1: Buscar via API
      try {
        console.log(`🌐 [PROVENTOS] Chamando API: /api/proventos/${ticker}`);
        
        const response = await fetch(`/api/proventos/${ticker}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const proventosAPI = await response.json();
        console.log(`📊 [PROVENTOS] API respondeu:`, {
          ticker,
          totalRecebido: proventosAPI.length,
          amostra: proventosAPI.slice(0, 2)
        });
        
        if (Array.isArray(proventosAPI) && proventosAPI.length > 0) {
          // Filtrar proventos a partir da data de entrada
          const proventosFiltrados = proventosAPI.filter((provento: any) => {
            try {
              const dataProvento = new Date(provento.dataObj);
              
              if (isNaN(dataProvento.getTime())) {
                console.warn(`⚠️ [PROVENTOS] Data inválida:`, provento.dataObj);
                return false;
              }

              dataProvento.setHours(0, 0, 0, 0);
              const isValido = dataProvento >= dataEntradaDate;
              
              if (isValido) {
                console.log(`✅ [PROVENTOS] INCLUÍDO: R$ ${provento.valor.toFixed(2)} em ${dataProvento.toLocaleDateString('pt-BR')}`);
              } else {
                console.log(`❌ [PROVENTOS] EXCLUÍDO: R$ ${provento.valor.toFixed(2)} em ${dataProvento.toLocaleDateString('pt-BR')} (antes da entrada)`);
              }
              
              return isValido;
            } catch (error) {
              console.error(`❌ [PROVENTOS] Erro ao processar:`, error, provento);
              return false;
            }
          });
          
          // Calcular valor total
          valorProventos = proventosFiltrados.reduce((total: number, provento: any) => {
            return total + (parseFloat(provento.valor) || 0);
          }, 0);
          
          console.log(`🎯 [PROVENTOS] API PROCESSADA:`, {
            ticker,
            totalAPI: proventosAPI.length,
            filtrados: proventosFiltrados.length,
            valorTotal: `R$ ${valorProventos.toFixed(2)}`,
            dataCorte: dataEntrada
          });
          
        } else {
          console.log(`❌ [PROVENTOS] API retornou array vazio para ${ticker}`);
        }
        
      } catch (apiError) {
        console.error(`❌ [PROVENTOS] Erro na API:`, apiError);
        fonte = 'localStorage';
        valorProventos = await calcularProventosLocalStorageAprimorado(ticker, dataEntrada);
      }

      // 📊 CALCULAR PERFORMANCE DOS PROVENTOS
      let performanceProventos = 0;
      let precoEntradaNumerico: number | null = null;

      // Usar preço de entrada passado como parâmetro
      if (precoEntrada) {
        precoEntradaNumerico = typeof precoEntrada === 'number' 
          ? precoEntrada 
          : parseFloat(String(precoEntrada).replace(',', '.'));
        
        console.log(`💰 [PROVENTOS] Preço de entrada recebido: R$ ${precoEntradaNumerico.toFixed(2)}`);
      }

      // Calcular performance
      if (precoEntradaNumerico && precoEntradaNumerico > 0 && valorProventos > 0) {
        performanceProventos = (valorProventos / precoEntradaNumerico) * 100;
        console.log(`📊 [PROVENTOS] PERFORMANCE CALCULADA:`, {
          ticker,
          valorProventos: `R$ ${valorProventos.toFixed(2)}`,
          precoEntrada: `R$ ${precoEntradaNumerico.toFixed(2)}`,
          performance: `${performanceProventos.toFixed(2)}%`,
          calculo: `(${valorProventos.toFixed(2)} / ${precoEntradaNumerico.toFixed(2)}) * 100`
        });
      } else {
        console.log(`⚠️ [PROVENTOS] Performance não calculada:`, {
          ticker,
          valorProventos,
          precoEntrada,
          motivo: !precoEntradaNumerico || precoEntradaNumerico <= 0 ? 'Preço de entrada inválido' : 'Sem proventos'
        });
      }

      // Determinar fonte final
      const fonteAtual = valorProventos > 0 ? fonte : 'sem dados';

      // Atualizar estado
      setProventosData({
        valor: valorProventos,
        performanceProventos: performanceProventos,
        fonte: fonteAtual
      });

      console.log(`🏆 [PROVENTOS] === RESULTADO FINAL ${ticker} ===`, {
        valorProventos: `R$ ${valorProventos.toFixed(2)}`,
        performance: `${performanceProventos.toFixed(2)}%`,
        fonte: fonteAtual,
        periodo: `desde ${dataEntrada}`
      });

    } catch (error) {
      console.error(`❌ [PROVENTOS] Erro geral para ${ticker}:`, error);
      setProventosData({
        valor: 0,
        performanceProventos: 0,
        fonte: 'erro'
      });
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada]);

  useEffect(() => {
    fetchProventos();
  }, [fetchProventos]);

  return {
    valorProventos: proventosData.valor,
    performanceProventos: proventosData.performanceProventos,
    loading,
    fonte: proventosData.fonte,
    refetch: fetchProventos
  };
}