import { useCallback } from 'react';
import { API_CONFIG, buildApiUrl, buildBatchApiUrl } from '@/config/apiConfig';
import type { Cotacao, ApiStrategy } from '@/types/microCaps';

// 🔄 HOOK PARA ESTRATÉGIAS DE API (MOBILE vs DESKTOP)
export function useApiStrategy(isMobile: boolean): ApiStrategy {
  
  // 📱 ESTRATÉGIA MOBILE: Requisições individuais com múltiplas tentativas
  const fetchIndividualQuotes = useCallback(async (tickers: string[]): Promise<Map<string, Cotacao>> => {
    console.log('📱 ESTRATÉGIA MOBILE: API individual com configuração agressiva');
    const cotacoesMap = new Map<string, Cotacao>();
    let sucessos = 0;

    for (const ticker of tickers) {
      let cotacaoObtida = false;
      
      // TENTATIVA 1: User-Agent Desktop
      if (!cotacaoObtida) {
        try {
          console.log(`📱🔄 ${ticker}: Tentativa 1 - User-Agent Desktop`);
          
          const response = await fetch(buildApiUrl(ticker), {
            method: 'GET',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              'User-Agent': API_CONFIG.USER_AGENTS.DESKTOP
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.results?.[0]?.regularMarketPrice > 0) {
              const quote = data.results[0];
              cotacoesMap.set(ticker, {
                precoAtual: quote.regularMarketPrice,
                variacao: quote.regularMarketChange || 0,
                variacaoPercent: quote.regularMarketChangePercent || 0,
                volume: quote.regularMarketVolume || 0,
                nome: quote.shortName || quote.longName || ticker
              });
              sucessos++;
              cotacaoObtida = true;
              console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (Desktop UA)`);
            }
          }
        } catch (error) {
          console.log(`📱❌ ${ticker} (Desktop UA): ${error.message}`);
        }
      }
      
      // TENTATIVA 2: Sem User-Agent
      if (!cotacaoObtida) {
        try {
          console.log(`📱🔄 ${ticker}: Tentativa 2 - Sem User-Agent`);
          
          const response = await fetch(buildApiUrl(ticker), {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.results?.[0]?.regularMarketPrice > 0) {
              const quote = data.results[0];
              cotacoesMap.set(ticker, {
                precoAtual: quote.regularMarketPrice,
                variacao: quote.regularMarketChange || 0,
                variacaoPercent: quote.regularMarketChangePercent || 0,
                volume: quote.regularMarketVolume || 0,
                nome: quote.shortName || quote.longName || ticker
              });
              sucessos++;
              cotacaoObtida = true;
              console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (Sem UA)`);
            }
          }
        } catch (error) {
          console.log(`📱❌ ${ticker} (Sem UA): ${error.message}`);
        }
      }
      
      // TENTATIVA 3: URL simplificada
      if (!cotacaoObtida) {
        try {
          console.log(`📱🔄 ${ticker}: Tentativa 3 - URL simplificada`);
          
          const response = await fetch(`${buildApiUrl(ticker)}&range=1d`, {
            method: 'GET',
            mode: 'cors'
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.results?.[0]?.regularMarketPrice > 0) {
              const quote = data.results[0];
              cotacoesMap.set(ticker, {
                precoAtual: quote.regularMarketPrice,
                variacao: quote.regularMarketChange || 0,
                variacaoPercent: quote.regularMarketChangePercent || 0,
                volume: quote.regularMarketVolume || 0,
                nome: quote.shortName || quote.longName || ticker
              });
              sucessos++;
              cotacaoObtida = true;
              console.log(`📱✅ ${ticker}: R$ ${quote.regularMarketPrice.toFixed(2)} (URL simples)`);
            }
          }
        } catch (error) {
          console.log(`📱❌ ${ticker} (URL simples): ${error.message}`);
        }
      }
      
      if (!cotacaoObtida) {
        console.log(`📱⚠️ ${ticker}: Todas as estratégias falharam`);
      }
      
      // Delay entre requisições
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
    }

    console.log(`📱 MOBILE RESULT: ${sucessos}/${tickers.length} sucessos`);
    return cotacoesMap;
  }, []);

  // 🖥️ ESTRATÉGIA DESKTOP: Requisição em lote
  const fetchBatchQuotes = useCallback(async (tickers: string[]): Promise<Map<string, Cotacao>> => {
    console.log('🖥️ ESTRATÉGIA DESKTOP: Requisição em lote');
    const cotacoesMap = new Map<string, Cotacao>();
    let sucessos = 0;

    try {
      const response = await fetch(buildBatchApiUrl(tickers), {
        method: 'GET',
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          'User-Agent': API_CONFIG.USER_AGENTS.DEFAULT
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        data.results?.forEach((quote: any) => {
          if (quote.regularMarketPrice > 0) {
            cotacoesMap.set(quote.symbol, {
              precoAtual: quote.regularMarketPrice,
              variacao: quote.regularMarketChange || 0,
              variacaoPercent: quote.regularMarketChangePercent || 0,
              volume: quote.regularMarketVolume || 0,
              nome: quote.shortName || quote.longName || quote.symbol
            });
            sucessos++;
            console.log(`🖥️✅ ${quote.symbol}: R$ ${quote.regularMarketPrice.toFixed(2)}`);
          }
        });
      }
    } catch (error) {
      console.log('🖥️❌ Erro na requisição em lote:', error);
    }

    console.log(`🖥️ DESKTOP RESULT: ${sucessos}/${tickers.length} sucessos`);
    return cotacoesMap;
  }, []);

  // 📈 BUSCAR DIVIDEND YIELDS
  const fetchDividendYields = useCallback(async (tickers: string[]): Promise<Map<string, string>> => {
    const dyMap = new Map<string, string>();
    
    if (isMobile) {
      // Mobile: Individual
      console.log('📱 [DY-MOBILE] Buscando DY individualmente');
      
      for (const ticker of tickers) {
        let dyObtido = false;
        
        // Múltiplas tentativas similar às cotações
        const strategies = [
          () => fetch(buildApiUrl(ticker, 'defaultKeyStatistics'), {
            headers: { ...API_CONFIG.DEFAULT_HEADERS, 'User-Agent': API_CONFIG.USER_AGENTS.DESKTOP }
          }),
          () => fetch(buildApiUrl(ticker, 'defaultKeyStatistics'), {
            headers: { 'Accept': 'application/json' }
          }),
          () => fetch(`${buildApiUrl(ticker, 'defaultKeyStatistics')}&range=1d`, {
            mode: 'cors'
          })
        ];

        for (const [index, strategy] of strategies.entries()) {
          if (dyObtido) break;
          
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa ${index + 1}`);
            const response = await strategy();
            
            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}%`);
                dyObtido = true;
              } else {
                dyMap.set(ticker, '0,00%');
                dyObtido = true;
              }
            }
          } catch (error) {
            console.log(`📱❌ [DY] ${ticker} (Tentativa ${index + 1}): ${error.message}`);
          }
        }
        
        if (!dyObtido) {
          dyMap.set(ticker, '0,00%');
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } else {
      // Desktop: Batch
      console.log('🖥️ [DY-DESKTOP] Buscando DY em lote');
      
      try {
        const response = await fetch(buildBatchApiUrl(tickers, 'defaultKeyStatistics'), {
          headers: {
            ...API_CONFIG.DEFAULT_HEADERS,
            'User-Agent': API_CONFIG.USER_AGENTS.DEFAULT
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          data.results?.forEach((result: any) => {
            const ticker = result.symbol;
            const dy = result.defaultKeyStatistics?.dividendYield;
            
            if (dy && dy > 0) {
              dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
              console.log(`✅ [DY-DESKTOP] ${ticker}: ${dy.toFixed(2)}%`);
            } else {
              dyMap.set(ticker, '0,00%');
            }
          });
        } else {
          // Fallback: definir 0% para todos
          tickers.forEach(ticker => dyMap.set(ticker, '0,00%'));
        }
      } catch (error) {
        console.error(`❌ [DY-DESKTOP] Erro geral:`, error);
        tickers.forEach(ticker => dyMap.set(ticker, '0,00%'));
      }
    }
    
    console.log(`📋 [DY] Resultado final: ${dyMap.size} tickers processados`);
    return dyMap;
  }, [isMobile]);

  // 🎯 FUNÇÃO PRINCIPAL: Escolher estratégia baseada no dispositivo
  const fetchQuotes = useCallback(async (tickers: string[]): Promise<Map<string, Cotacao>> => {
    return isMobile 
      ? await fetchIndividualQuotes(tickers)
      : await fetchBatchQuotes(tickers);
  }, [isMobile, fetchIndividualQuotes, fetchBatchQuotes]);

  return {
    fetchQuotes,
    fetchDividendYields
  };
}