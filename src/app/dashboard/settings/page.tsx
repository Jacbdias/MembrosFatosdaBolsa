'use client';

import * as React from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { SettingsTable, type SettingsData } from '@/components/dashboard/settings/settings-table';

export default function SettingsPage(): React.JSX.Element {
  const [fiisData, setFiisData] = React.useState<SettingsData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());

  // 📊 Base de dados dos FIIs
  const fiisPortfolioBase: SettingsData[] = [
    /* ... dados estáticos existentes ... */
  ];

  // 🔥 BUSCAR COTAÇÕES REAIS DOS FIIs NA BRAPI
  const fetchFiisPortfolioData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tickers = fiisPortfolioBase.map(fii => fii.ticker).join(',');
      const token = process.env.NEXT_PUBLIC_BRAPI_TOKEN;
      const brapiUrl = `https://brapi.dev/api/quote/${tickers}?token=${token}&range=1d&interval=1d&fundamental=true`;

      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'FIIs-Portfolio-App/2.0',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        setFiisData(fiisPortfolioBase);
        setLastUpdate(new Date());
        return;
      }

      const brapiData = await response.json();

      if (!brapiData.results || brapiData.results.length === 0) {
        setFiisData(fiisPortfolioBase);
        setLastUpdate(new Date());
        return;
      }

      const portfolioAtualizado = fiisPortfolioBase.map((fiiBase) => {
        const quote = brapiData.results.find((result: any) => result.symbol === fiiBase.ticker);

        if (quote && quote.regularMarketPrice) {
          const precoAtualNum = quote.regularMarketPrice;
          const precoAtual = `R$ ${precoAtualNum.toFixed(2).replace('.', ',')}`;
          const precoEntradaNum = parseFloat(fiiBase.precoEntrada.replace('R$ ', '').replace(',', '.'));
          const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;

          return {
            ...fiiBase,
            precoAtual,
            performance,
            variacao: performance,
            variacaoPercent: performance,
            volume: quote.regularMarketVolume || 0,
            statusApi: 'success',
          };
        }

        return {
          ...fiiBase,
          performance: 0,
          variacao: 0,
          variacaoPercent: 0,
          volume: 0,
          statusApi: 'fallback',
        };
      });

      setFiisData(portfolioAtualizado);
      setLastUpdate(new Date());
    } catch (fetchError) {
      setError('Erro ao carregar dados da BRAPI. Usando dados estáticos.');
      setFiisData(fiisPortfolioBase);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFiisPortfolioData();
  }, [fetchFiisPortfolioData]);

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
          {lastUpdate && <span> • Última atualização: {lastUpdate.toLocaleTimeString()}</span>}
        </Typography>
      </div>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={40} />
          <Box ml={2} sx={{ fontSize: '1.1rem' }}>
            Carregando FIIs...
          </Box>
        </Box>
      ) : (
        <SettingsTable
          rows={fiisData}
          count={fiisData.length}
          page={0}
          rowsPerPage={fiisData.length}
        />
      )}
    </Stack>
  );
}
