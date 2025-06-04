'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';
import type { SettingsData } from '@/components/dashboard/settings/settings-table';

export default function SettingsPage(): React.JSX.Element {
  const [fiisData, setFiisData] = React.useState<SettingsData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());

  // 📊 Base de dados dos FIIs
  const fiisPortfolioBase: SettingsData[] = [
    {
      id: "1",
      avatar: "",
      ticker: "MALL11",
      setor: "Shopping",
      dataEntrada: "26/01/2022",
      precoEntrada: "R$ 118,37",
      precoAtual: "R$ 118,37",
      dy: "8.40%",
      precoTeto: "R$ 103,68",
      vies: "Aguardar"
    },
    {
      id: "2",
      avatar: "",
      ticker: "KNSC11",
      setor: "Papel",
      dataEntrada: "24/05/2022",
      precoEntrada: "R$ 9,31",
      precoAtual: "R$ 9,31",
      dy: "10.98%",
      precoTeto: "R$ 9,16",
      vies: "Aguardar"
    },
    {
      id: "3",
      avatar: "",
      ticker: "KNHF11",
      setor: "Hedge Fund",
      dataEntrada: "20/12/2024",
      precoEntrada: "R$ 76,31",
      precoAtual: "R$ 76,31",
      dy: "15.00%",
      precoTeto: "R$ 90,50",
      vies: "Compra"
    },
    {
      id: "4",
      avatar: "",
      ticker: "HGBS11",
      setor: "Shopping",
      dataEntrada: "02/01/2025",
      precoEntrada: "R$ 186,08",
      precoAtual: "R$ 186,08",
      dy: "10.50%",
      precoTeto: "R$ 192,00",
      vies: "Compra"
    },
    {
      id: "5",
      avatar: "",
      ticker: "RURA11",
      setor: "Fiagro",
      dataEntrada: "14/02/2023",
      precoEntrada: "R$ 10,25",
      precoAtual: "R$ 10,25",
      dy: "13.21%",
      precoTeto: "R$ 8,70",
      vies: "Aguardar"
    }
  ];

  // 🔥 BUSCAR COTAÇÕES REAIS DOS FIIs NA BRAPI
  const fetchFiisPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 BUSCANDO COTAÇÕES REAIS DOS FIIs NA BRAPI');

      const tickers = fiisPortfolioBase.map(fii => fii.ticker).join(',');
      const brapiUrl = `https://brapi.dev/api/quote/${tickers}?token=jJrMYVy9MATGEicx3GxBp8&range=1d&interval=1d&fundamental=true`;
      
      console.log('📡 Buscando cotações da BRAPI...');

      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FIIs-Portfolio-App/2.0',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        console.warn('⚠️ BRAPI indisponível, usando dados estáticos');
        setFiisData(fiisPortfolioBase);
        setLastUpdate(new Date());
        return;
      }

      const brapiData = await response.json();
      console.log('✅ Dados recebidos da BRAPI:', brapiData);

      if (!brapiData.results || brapiData.results.length === 0) {
        console.warn('⚠️ BRAPI retornou dados vazios, usando dados estáticos');
        setFiisData(fiisPortfolioBase);
        setLastUpdate(new Date());
        return;
      }

      // 🔥 PROCESSAR DADOS DA BRAPI E CALCULAR PERFORMANCE
      const portfolioAtualizado = fiisPortfolioBase.map((fiiBase) => {
        const quote = brapiData.results.find((result: any) => result.symbol === fiiBase.ticker);
        
        if (quote && quote.regularMarketPrice) {
          const precoAtualNum = quote.regularMarketPrice;
          const precoAtual = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          const precoEntradaNum = parseFloat(fiiBase.precoEntrada.replace('R$ ', '').replace(',', '.'));
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
          
          console.log(`✅ ${fiiBase.ticker}: R$ ${precoAtualNum} (${performance.toFixed(2)}%)`);
          
          return {
            ...fiiBase,
            precoAtual,
            performance,
            variacao: performance,
            variacaoPercent: performance,
            volume: quote.regularMarketVolume || 0,
            statusApi: 'success'
          };
        } else {
          console.warn(`⚠️ ${fiiBase.ticker}: Cotação não encontrada, mantendo preço de entrada`);
          return {
            ...fiiBase,
            performance: 0,
            variacao: 0,
            variacaoPercent: 0,
            volume: 0,
            statusApi: 'fallback'
          };
        }
      });

      setFiisData(portfolioAtualizado);
      setLastUpdate(new Date());
      console.log('🎯 Portfolio atualizado com sucesso!');

    } catch (fetchError) {
      console.error('❌ Erro ao buscar cotações:', fetchError);
      setError('Erro ao carregar dados da BRAPI. Usando dados estáticos.');
      setFiisData(fiisPortfolioBase);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 Buscar dados ao montar o componente
  React.useEffect(() => {
    fetchFiisPortfolioData();
  }, [fetchFiisPortfolioData]);

  // 🔄 Atualizar dados a cada 30 segundos
  React.useEffect(() => {
    const interval = setInterval(fetchFiisPortfolioData, 30000);
    return () => clearInterval(interval);
  }, [fetchFiisPortfolioData]);

  return (
    <Stack spacing={3}>
      <div>
        <Typography variant="h4">Portfolio FIIs</Typography>
        <Typography color="text.secondary" variant="body2">
          Acompanhe seus investimentos em Fundos Imobiliários
          {lastUpdate && (
            <span> • Última atualização: {lastUpdate.toLocaleTimeString()}</span>
          )}
        </Typography>
      </div>
      
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      
      <SettingsTable 
        rows={fiisData}
        count={fiisData.length}
        page={0}
        rowsPerPage={fiisData.length}
      />
    </Stack>
  );
}
