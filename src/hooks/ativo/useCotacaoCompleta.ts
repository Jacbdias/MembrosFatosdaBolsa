import { useState, useCallback, useEffect } from 'react';

// 🔥 HOOK PARA BUSCAR COTAÇÃO COMPLETA COM ESTRATÉGIA MOBILE/DESKTOP
export function useCotacaoCompleta(ticker: string, ehBDREstrangeiro: boolean = false) {
  const [cotacaoCompleta, setCotacaoCompleta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detecção de dispositivo
  const [isMobile, setIsMobile] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);

  // Detectar dispositivo
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setDeviceDetected(true);
      console.log('📱 Cotação - Dispositivo detectado:', { width, isMobile: mobile, deviceDetected: true });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const buscarCotacaoCompleta = useCallback(async () => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      let cotacaoObtida = false;
      let cotacaoData = null;
      
      console.log(`🔍 Buscando cotação para ${ticker}:`, { isMobile, deviceDetected });

      if (isMobile) {
        // 📱 MOBILE: Estratégia agressiva
        console.log('📱 ESTRATÉGIA MOBILE: Múltiplas tentativas');
        
        // ESTRATÉGIA 1: User-Agent Desktop
        if (!cotacaoObtida) {
          try {
            console.log(`📱🔄 ${ticker}: Tentativa 1 - User-Agent Desktop`);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.results?.[0]?.regularMarketPrice > 0) {
                cotacaoData = data.results[0];
                cotacaoObtida = true;
                console.log(`📱✅ ${ticker}: Obtido via Desktop UA`);
              }
            }
          } catch (error: any) {
            console.log(`📱❌ ${ticker} (Desktop UA):`, error.message);
          }
        }
        
        // ESTRATÉGIA 2: Sem User-Agent
        if (!cotacaoObtida) {
          try {
            console.log(`📱🔄 ${ticker}: Tentativa 2 - Sem User-Agent`);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.results?.[0]?.regularMarketPrice > 0) {
                cotacaoData = data.results[0];
                cotacaoObtida = true;
                console.log(`📱✅ ${ticker}: Obtido sem UA`);
              }
            }
          } catch (error: any) {
            console.log(`📱❌ ${ticker} (Sem UA):`, error.message);
          }
        }
        
        // ESTRATÉGIA 3: URL simplificada
        if (!cotacaoObtida) {
          try {
            console.log(`📱🔄 ${ticker}: Tentativa 3 - URL simplificada`);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&range=1d`, {
              method: 'GET',
              mode: 'cors'
            });

            if (response.ok) {
              const data = await response.json();
              if (data.results?.[0]?.regularMarketPrice > 0) {
                cotacaoData = data.results[0];
                cotacaoObtida = true;
                console.log(`📱✅ ${ticker}: Obtido via URL simples`);
              }
            }
          } catch (error: any) {
            console.log(`📱❌ ${ticker} (URL simples):`, error.message);
          }
        }
        
      } else {
        // 🖥️ DESKTOP: Estratégia original
        console.log('🖥️ ESTRATÉGIA DESKTOP');
        
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Ativo-Individual-App'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.results?.[0]?.regularMarketPrice > 0) {
              cotacaoData = data.results[0];
              cotacaoObtida = true;
              console.log(`🖥️✅ ${ticker}: Obtido desktop`);
            }
          }
        } catch (error) {
          console.error(`🖥️❌ ${ticker} Desktop:`, error);
        }
      }

      // ✅ PROCESSAR RESULTADO
      if (cotacaoObtida && cotacaoData) {
        const cotacaoAtivo = {
          regularMarketPrice: cotacaoData.regularMarketPrice,
          regularMarketChange: cotacaoData.regularMarketChange || 0,
          regularMarketChangePercent: cotacaoData.regularMarketChangePercent || 0,
          regularMarketVolume: cotacaoData.regularMarketVolume || 0,
          shortName: cotacaoData.shortName || cotacaoData.longName,
          dadosCompletos: cotacaoData,
          isBDREstrangeiro: ehBDREstrangeiro
        };
        
        setCotacaoCompleta(cotacaoAtivo);
        console.log(`✅ Cotação ${ticker} salva:`, cotacaoAtivo.regularMarketPrice);
      } else {
        console.log(`❌ Falha ao obter cotação para ${ticker}`);
        throw new Error('Cotação não encontrada');
      }
      
    } catch (err: any) {
      console.error(`❌ Erro geral ao buscar cotação para ${ticker}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticker, isMobile, deviceDetected, ehBDREstrangeiro]);

  // Executar busca quando dispositivo for detectado
  useEffect(() => {
    if (deviceDetected) {
      console.log('🔥 Cotação: Executando busca após detecção de dispositivo:', { isMobile, deviceDetected });
      buscarCotacaoCompleta();
    }
  }, [buscarCotacaoCompleta, deviceDetected, isMobile]);

  return {
    cotacaoCompleta,
    loading,
    error,
    refetch: buscarCotacaoCompleta,
    isMobile,
    deviceDetected
  };
}