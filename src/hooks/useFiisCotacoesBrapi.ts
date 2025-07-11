/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDataStore } from '@/hooks/useDataStore';

export interface FII {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  dy: string;
  precoTeto: string;
  vies: string;
  performance?: number;
  variacao?: number;
  variacaoPercent?: number;
  volume?: number;
  statusApi?: string;
  nomeCompleto?: string;
}

// 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
function calcularViesAutomatico(precoTeto: number | undefined, precoAtual: string): string {
  if (!precoTeto || precoAtual === 'N/A') {
    return 'Aguardar';
  }
  
  // Remover formatação e converter para números
  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
  
  if (isNaN(precoAtualNum)) {
    return 'Aguardar';
  }
  
  // 🎯 LÓGICA CORRETA: Preço Atual < Preço Teto = COMPRA (FII está barato)
  if (precoAtualNum < precoTeto) {
    return 'Compra';
  } else {
    return 'Aguardar';
  }
}

// 🎯 FUNÇÃO PARA CALCULAR DY DOS ÚLTIMOS 12 MESES BASEADO NOS PROVENTOS UPLOADADOS
function calcularDY12Meses(ticker: string, precoAtual: number): string {
  try {
    if (typeof window === 'undefined' || precoAtual <= 0) return '0,00%';
    
    // Buscar proventos do ticker específico no localStorage
    const proventosData = localStorage.getItem(`proventos_${ticker}`);
    if (!proventosData) return '0,00%';
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return '0,00%';
    
    // Data de 12 meses atrás
    const hoje = new Date();
    const umAnoAtras = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
    
    console.log(`🔍 Calculando DY para ${ticker}:`);
    
    // Filtrar proventos dos últimos 12 meses
    const proventosUltimos12Meses = proventos.filter((provento: any) => {
      let dataProvento: Date;
      
      // Tentar várias formas de parsing da data
      if (provento.dataObj) {
        dataProvento = new Date(provento.dataObj);
      } else if (provento.dataCom) {
        if (provento.dataCom.includes('/')) {
          const [d, m, a] = provento.dataCom.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.dataCom);
        }
      } else if (provento.data) {
        if (provento.data.includes('/')) {
          const [d, m, a] = provento.data.split('/');
          dataProvento = new Date(+a, +m - 1, +d);
        } else {
          dataProvento = new Date(provento.data);
        }
      } else {
        return false;
      }
      
      return dataProvento >= umAnoAtras && dataProvento <= hoje;
    });
    
    if (proventosUltimos12Meses.length === 0) {
      console.log(`❌ ${ticker}: Nenhum provento nos últimos 12 meses`);
      return '0,00%';
    }
    
    // Somar valores dos proventos
    const totalProventos = proventosUltimos12Meses.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    if (totalProventos <= 0) {
      return '0,00%';
    }
    
    // Calcular DY: (Total Proventos 12 meses / Preço Atual) * 100
    const dy = (totalProventos / precoAtual) * 100;
    
    return `${dy.toFixed(2).replace('.', ',')}%`;
    
  } catch (error) {
    console.error(`❌ Erro ao calcular DY para ${ticker}:`, error);
    return '0,00%';
  }
}

// 🚀 HOOK CORRIGIDO PARA BUSCAR COTAÇÕES DOS FIIS DO DATASTORE
export function useFiisCotacoesBrapi() {
  const { dados } = useDataStore(); // 🔥 USAR dados DIRETAMENTE
  const [fiis, setFiis] = useState<FII[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);

  // 📊 OBTER DADOS DA CARTEIRA FIIS DO DATASTORE
  const fiisData = dados.fiis || [];

  const fetchCotacoes = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);

      console.log('🔥 BUSCANDO COTAÇÕES INTEGRADAS PARA FIIS');
      console.log('📋 Ativos do DataStore:', fiisData);

      if (fiisData.length === 0) {
        console.log('⚠️ Nenhum FII encontrado no DataStore');
        setFiis([]);
        setLoading(false);
        return;
      }

      // Verifica se já fez uma requisição nos últimos 2 minutos
      const agora = new Date();
      if (ultimaAtualizacao && (agora.getTime() - ultimaAtualizacao.getTime()) < 2 * 60 * 1000) {
        console.log('⏰ Aguardando intervalo mínimo entre requisições...');
        setLoading(false);
        return;
      }

      // 🔑 TOKEN BRAPI FUNCIONANDO
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

      // 📋 EXTRAIR TODOS OS TICKERS
      const tickers = fiisData.map(fii => fii.ticker);
      console.log('🎯 Tickers para buscar:', tickers.join(', '));

      // 🔄 BUSCAR EM LOTES MENORES COM TOKEN E TIMEOUT
      const LOTE_SIZE = 5;
      const cotacoesMap = new Map();
      let sucessosTotal = 0;
      let falhasTotal = 0;

      for (let i = 0; i < tickers.length; i += LOTE_SIZE) {
        const lote = tickers.slice(i, i + LOTE_SIZE);
        const tickersString = lote.join(',');
        
        const apiUrl = `https://brapi.dev/api/quote/${tickersString}?token=${BRAPI_TOKEN}&range=1d&interval=1d&fundamental=true`;
        
        console.log(`🔍 Lote ${Math.floor(i/LOTE_SIZE) + 1}: ${lote.join(', ')}`);

        try {
          // 🔥 ADICIONAR TIMEOUT DE 8 SEGUNDOS PARA LOTES MÚLTIPLOS
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'FIIs-Portfolio-App'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const apiData = await response.json();
            console.log(`📊 Resposta para lote ${Math.floor(i/LOTE_SIZE) + 1}:`, apiData);

            if (apiData.results && Array.isArray(apiData.results)) {
              apiData.results.forEach((quote: any) => {
                if (quote.symbol && quote.regularMarketPrice && quote.regularMarketPrice > 0) {
                  cotacoesMap.set(quote.symbol, {
                    precoAtual: quote.regularMarketPrice,
                    variacao: quote.regularMarketChange || 0,
                    variacaoPercent: quote.regularMarketChangePercent || 0,
                    volume: quote.regularMarketVolume || 0,
                    nome: quote.shortName || quote.longName,
                    dadosCompletos: quote
                  });
                  sucessosTotal++;
                  console.log(`✅ ${quote.symbol}: R$ ${quote.regularMarketPrice}`);
                } else {
                  console.warn(`⚠️ ${quote.symbol}: Dados inválidos (preço: ${quote.regularMarketPrice})`);
                  falhasTotal++;
                }
              });
            }
          } else {
            console.error(`❌ Erro HTTP ${response.status} para lote: ${lote.join(', ')}`);
            falhasTotal += lote.length;
          }
        } catch (loteError) {
          console.error(`❌ Erro no lote ${lote.join(', ')}:`, loteError);
          falhasTotal += lote.length;
        }

        // DELAY entre requisições para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`✅ Total processado: ${sucessosTotal} sucessos, ${falhasTotal} falhas`);

      // 🔥 COMBINAR DADOS DO DATASTORE COM COTAÇÕES REAIS
      const ativosComCotacoes = fiisData.map((fii, index) => {
        const cotacao = cotacoesMap.get(fii.ticker);
        
        console.log(`\n🔄 Processando ${fii.ticker}:`);
        console.log(`💵 Preço entrada: R$ ${fii.precoEntrada}`);
        
        if (cotacao && cotacao.precoAtual > 0) {
          // 📊 PREÇO E PERFORMANCE REAIS
          const precoAtualNum = cotacao.precoAtual;
          const performance = ((precoAtualNum - fii.precoEntrada) / fii.precoEntrada) * 100;
          
          console.log(`💰 Preço atual: R$ ${precoAtualNum}`);
          console.log(`📈 Performance: ${performance.toFixed(2)}%`);
          
          // VALIDAR SE O PREÇO FAZ SENTIDO
          const diferencaPercent = Math.abs(performance);
          if (diferencaPercent > 500) {
            console.warn(`🚨 ${fii.ticker}: Preço suspeito! Diferença de ${diferencaPercent.toFixed(1)}% - usando preço de entrada`);
            return {
              ...fii,
              id: String(fii.id || index + 1),
              avatar: `https://www.ivalor.com.br/media/emp/logos/${fii.ticker.replace(/\d+$/, '')}.png`,
              precoAtual: `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`,
              precoEntrada: `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`,
              precoTeto: fii.precoTeto ? `R$ ${fii.precoTeto.toFixed(2).replace('.', ',')}` : undefined,
              performance: 0,
              variacao: 0,
              variacaoPercent: 0,
              volume: 0,
              vies: calcularViesAutomatico(fii.precoTeto, `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`),
              dy: '0,00%',
              statusApi: 'suspicious_price',
              nomeCompleto: cotacao.nome
            };
          }
          
          const precoAtualFormatado = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          const precoEntradaFormatado = `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`;
          const precoTetoFormatado = fii.precoTeto ? `R$ ${fii.precoTeto.toFixed(2).replace('.', ',')}` : undefined;
          
          return {
            ...fii,
            id: String(fii.id || index + 1),
            avatar: `https://www.ivalor.com.br/media/emp/logos/${fii.ticker.replace(/\d+$/, '')}.png`,
            precoAtual: precoAtualFormatado,
            precoEntrada: precoEntradaFormatado,
            precoTeto: precoTetoFormatado,
            performance: performance,
            variacao: cotacao.variacao,
            variacaoPercent: cotacao.variacaoPercent,
            volume: cotacao.volume,
            vies: calcularViesAutomatico(fii.precoTeto, precoAtualFormatado),
            dy: calcularDY12Meses(fii.ticker, precoAtualNum), // 🔥 DY REAL DOS ÚLTIMOS 12 MESES
            statusApi: 'success',
            nomeCompleto: cotacao.nome
          };
        } else {
          // ⚠️ FALLBACK PARA FIIS SEM COTAÇÃO
          console.warn(`⚠️ ${fii.ticker}: Sem cotação válida, usando preço de entrada`);
          
          const precoEntradaFormatado = `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`;
          const precoTetoFormatado = fii.precoTeto ? `R$ ${fii.precoTeto.toFixed(2).replace('.', ',')}` : undefined;
          
          return {
            ...fii,
            id: String(fii.id || index + 1),
            avatar: `https://www.ivalor.com.br/media/emp/logos/${fii.ticker.replace(/\d+$/, '')}.png`,
            precoAtual: precoEntradaFormatado,
            precoEntrada: precoEntradaFormatado,
            precoTeto: precoTetoFormatado,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            vies: calcularViesAutomatico(fii.precoTeto, precoEntradaFormatado),
            dy: calcularDY12Meses(fii.ticker, fii.precoEntrada), // 🔥 DY REAL DOS ÚLTIMOS 12 MESES
            statusApi: 'not_found',
            nomeCompleto: 'N/A'
          };
        }
      });

      // 📊 ESTATÍSTICAS FINAIS
      const sucessos = ativosComCotacoes.filter(a => a.statusApi === 'success').length;
      const suspeitos = ativosComCotacoes.filter(a => a.statusApi === 'suspicious_price').length;
      const naoEncontrados = ativosComCotacoes.filter(a => a.statusApi === 'not_found').length;
      
      console.log('\n📊 ESTATÍSTICAS FINAIS:');
      console.log(`✅ Sucessos: ${sucessos}/${ativosComCotacoes.length}`);
      console.log(`🚨 Preços suspeitos: ${suspeitos}/${ativosComCotacoes.length}`);
      console.log(`❌ Não encontrados: ${naoEncontrados}/${ativosComCotacoes.length}`);

      setFiis(ativosComCotacoes);
      setUltimaAtualizacao(new Date());

      // ⚠️ ALERTAR SOBRE QUALIDADE DOS DADOS
      if (sucessos < ativosComCotacoes.length / 2) {
        setErro(`Apenas ${sucessos} de ${ativosComCotacoes.length} FIIs com cotação válida`);
      } else if (suspeitos > 0) {
        setErro(`${suspeitos} FIIs com preços suspeitos foram ignorados`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setErro(errorMessage);
      console.error('❌ Erro geral ao buscar cotações:', err);
      
      // 🔄 FALLBACK: USAR DADOS DO DATASTORE SEM COTAÇÕES
      console.log('🔄 Usando fallback com dados do DataStore...');
      const ativosFallback = fiisData.map((fii, index) => ({
        ...fii,
        id: String(fii.id || index + 1),
        avatar: `https://www.ivalor.com.br/media/emp/logos/${fii.ticker.replace(/\d+$/, '')}.png`,
        precoAtual: `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`,
        precoEntrada: `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`,
        precoTeto: fii.precoTeto ? `R$ ${fii.precoTeto.toFixed(2).replace('.', ',')}` : undefined,
        performance: 0,
        variacao: 0,
        variacaoPercent: 0,
        volume: 0,
        vies: calcularViesAutomatico(fii.precoTeto, `R$ ${fii.precoEntrada.toFixed(2).replace('.', ',')}`),
        dy: calcularDY12Meses(fii.ticker, fii.precoEntrada), // 🔥 DY REAL DOS ÚLTIMOS 12 MESES
        statusApi: 'error',
        nomeCompleto: 'Erro'
      }));
      setFiis(ativosFallback);
    } finally {
      setLoading(false);
    }
  }, [fiisData, ultimaAtualizacao]);

  // 🔄 EXECUTAR QUANDO OS DADOS DO DATASTORE MUDAREM
  useEffect(() => {
    console.log('🔄 EFFECT DISPARADO - DADOS DO DATASTORE MUDARAM');
    console.log('📊 FIIs data length:', dados.fiis?.length || 0);
    
    if (fiisData.length > 0) {
      fetchCotacoes();
    } else {
      setLoading(false);
      setFiis([]);
    }
  }, [dados.fiis?.length]); // 🔥 USAR LENGTH PARA EVITAR LOOP INFINITO

  // ATUALIZAR COTAÇÕES A CADA 15 MINUTOS
  useEffect(() => {
    const interval = setInterval(() => {
      const agora = new Date();
      const hora = agora.getHours();
      const diaSemana = agora.getDay();
      
      // Segunda a sexta, das 10h às 17h (horário comercial)
      if (diaSemana >= 1 && diaSemana <= 5 && hora >= 10 && hora <= 17 && fiisData.length > 0) {
        console.log('🔄 Auto-atualizando carteira de FIIs...');
        fetchCotacoes();
      }
    }, 15 * 60 * 1000); // 15 minutos

    return () => clearInterval(interval);
  }, [fetchCotacoes, fiisData.length]);

  return { 
    fiis, 
    loading, 
    erro, 
    refetch: fetchCotacoes 
  };
}