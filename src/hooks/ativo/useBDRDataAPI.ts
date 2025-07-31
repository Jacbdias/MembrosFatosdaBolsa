import { useState, useEffect, useCallback } from 'react';

// 🔥 HOOK PARA BUSCAR DADOS REAIS DOS BDRs
export function useBDRDataAPI(bdrTicker: string | null) {
  const [bdrData, setBDRData] = useState<any>(null);
  const [bdrLoading, setBDRLoading] = useState(true);
  const [bdrError, setBDRError] = useState<string | null>(null);

  const fetchBDRData = useCallback(async () => {
    if (!bdrTicker) {
      setBDRLoading(false);
      return;
    }

    try {
      setBDRError(null);
      console.log(`🇧🇷 Buscando cotação do BDR: ${bdrTicker}...`);
      
      const response = await fetch(`https://brapi.dev/api/quote/${bdrTicker}?token=jJrMYVy9MATGEicx3GxBp8`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      if (data?.results?.[0]) {
        const result = data.results[0];
        setBDRData({
          symbol: result.symbol,
          price: result.regularMarketPrice,
          change: result.regularMarketChange,
          changePercent: result.regularMarketChangePercent,
          volume: result.regularMarketVolume,
          shortName: result.shortName,
          longName: result.longName
        });
        console.log(`✅ BDR ${bdrTicker}: R$ ${result.regularMarketPrice}`);
      } else {
        throw new Error('Dados do BDR não encontrados na resposta da API');
      }
    } catch (err: any) {
      console.error(`❌ Erro BDR ${bdrTicker}:`, err);
      setBDRError(err.message);
      setBDRData(null);
    } finally {
      setBDRLoading(false);
    }
  }, [bdrTicker]);

  useEffect(() => {
    fetchBDRData();
  }, [fetchBDRData]);

  return { 
    bdrData, 
    bdrLoading, 
    bdrError, 
    refetch: fetchBDRData 
  };
}