import { useState, useEffect, useCallback } from 'react';

// 🔥 HOOK INTEGRADO PARA DY - EXTRAÍDO DO CÓDIGO ORIGINAL
export function useDividendYieldIntegrado(ticker: string) {
  const [dyData, setDyData] = useState<{
    dy12Meses: number;
    dyFormatado: string;
    fonte: string;
  }>({
    dy12Meses: 0,
    dyFormatado: '0,00%',
    fonte: 'indisponível'
  });
  const [loading, setLoading] = useState(true);
  
  // 🔥 DETECTAR DISPOSITIVO COM ESTADO DE DETECÇÃO COMPLETA
  const [isMobile, setIsMobile] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);

  // 🔥 DETECÇÃO DE DISPOSITIVO
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setDeviceDetected(true);
      console.log('📱 DY - Dispositivo detectado:', { width, isMobile: mobile, deviceDetected: true });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const fetchDY = useCallback(async () => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`📈 Buscando DY para ${ticker} usando estratégia mobile-first...`);
      console.log('📱 Device Info:', { isMobile, deviceDetected });

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      let dyObtido = false;
      let dyValue = 0;
      let fonte = 'BRAPI-Estratégia';

      if (isMobile) {
        // 📱 MOBILE: Estratégia agressiva com múltiplas tentativas
        console.log('📱 [DY-MOBILE] Estratégia agressiva para forçar API funcionar');
        
        // ESTRATÉGIA 1: User-Agent Desktop
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 1 - User-Agent Desktop`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-UA-Desktop';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Desktop UA)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-UA-Desktop-Zero';
                dyObtido = true;
              }
            }
          } catch (error: any) {
            console.log(`📱❌ [DY] ${ticker} (Desktop UA): ${error.message}`);
          }
        }
        
        // Delay entre tentativas
        if (!dyObtido) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // ESTRATÉGIA 2: Sem User-Agent
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 2 - Sem User-Agent`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-Sem-UA';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Sem UA)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-Sem-UA-Zero';
                dyObtido = true;
              }
            }
          } catch (error: any) {
            console.log(`📱❌ [DY] ${ticker} (Sem UA): ${error.message}`);
          }
        }

        // Delay entre tentativas
        if (!dyObtido) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // ESTRATÉGIA 3: URL simplificada
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 3 - URL simplificada`);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}&range=1d`, {
              method: 'GET',
              mode: 'cors'
            });

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-URL-Simples';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (URL simples)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-URL-Simples-Zero';
                dyObtido = true;
              }
            }
          } catch (error: any) {
            console.log(`📱❌ [DY] ${ticker} (URL simples): ${error.message}`);
          }
        }

        if (!dyObtido) {
          console.log(`📱⚠️ [DY] ${ticker}: Todas as estratégias mobile falharam`);
          dyValue = 0;
          fonte = 'BRAPI-Mobile-Fallback';
        }

      } else {
        // 🖥️ DESKTOP: Estratégia original (mais simples)
        console.log('🖥️ [DY-DESKTOP] Estratégia desktop padrão');
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'DY-Desktop-App'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
            
            if (dy && dy > 0) {
              dyValue = dy;
              fonte = 'BRAPI-Desktop';
              console.log(`🖥️✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Desktop)`);
            } else {
              dyValue = 0;
              fonte = 'BRAPI-Desktop-Zero';
            }
          }
        } catch (error: any) {
          console.log(`🖥️❌ [DY] ${ticker} Desktop:`, error.message);
          dyValue = 0;
          fonte = 'BRAPI-Desktop-Error';
        }
      }

      // ✅ ATUALIZAR ESTADO FINAL
      setDyData({
        dy12Meses: dyValue,
        dyFormatado: dyValue > 0 ? `${dyValue.toFixed(2).replace('.', ',')}%` : '0,00%',
        fonte: fonte
      });

      console.log(`✅ DY FINAL ${ticker}:`, {
        valor: dyValue,
        formatado: dyValue > 0 ? `${dyValue.toFixed(2).replace('.', ',')}%` : '0,00%',
        fonte: fonte,
        dispositivo: isMobile ? 'mobile' : 'desktop'
      });

    } catch (error) {
      console.error(`❌ Erro geral ao buscar DY para ${ticker}:`, error);
      setDyData({
        dy12Meses: 0,
        dyFormatado: '0,00%',
        fonte: 'erro'
      });
    } finally {
      setLoading(false);
    }
  }, [ticker, isMobile]);

  // ✅ USEEFFECT CORRIGIDO: Aguarda detecção E re-executa quando isMobile muda
  useEffect(() => {
    if (deviceDetected) {
      console.log('🔥 DY: Executando busca após detecção de dispositivo:', { isMobile, deviceDetected });
      fetchDY();
    }
  }, [fetchDY, deviceDetected, isMobile]);

  return {
    dy12Meses: dyData.dy12Meses,
    dyFormatado: dyData.dyFormatado,
    loading,
    fonte: dyData.fonte,
    refetch: fetchDY,
    isMobile,
    deviceDetected
  };
}