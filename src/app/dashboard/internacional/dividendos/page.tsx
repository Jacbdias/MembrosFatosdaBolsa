/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';

function noop(): void {}

function useMarketDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`/api/financial/international-data?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      setData(result.internationalData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

function useInternationalDividends() {
  const [portfolio, setPortfolio] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const dividendosBase = [
    {
      id: '1',
      ticker: 'OXY',
      name: 'Occidental Petroleum Corporation',
      setor: 'STOCK - Petroleum',
      dataEntrada: '14/04/2023',
      precoQueIniciou: 'US$37,92',
      dy: '2,34%',
      precoTeto: 'US$60,10',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/oxy.com',
    },
    {
      id: '2',
      ticker: 'ADC',
      name: 'Agree Realty Corporation',
      setor: 'REIT - Retail',
      dataEntrada: '19/01/2023',
      precoQueIniciou: 'US$73,74',
      dy: '5,34%',
      precoTeto: 'US$99,01',
      viesAtual: 'COMPRA',
      avatar: 'https://logo.clearbit.com/agreerealty.com',
    }
    // ... demais ativos
  ];

  const fetchRealQuotes = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const tickers = dividendosBase.map(stock => stock.ticker);
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const brapiUrl = `https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}`;
      const response = await fetch(brapiUrl);

      if (!response.ok) throw new Error(`Erro BRAPI: ${response.status}`);
      const brapiData = await response.json();

      const portfolioAtualizado = dividendosBase.map(stock => {
        const quote = brapiData.results?.find((q: any) => q.symbol === stock.ticker);
        let precoAtual = 'N/A';
        let performance = 0;
        if (quote?.regularMarketPrice) {
          const precoNum = parseFloat(stock.precoQueIniciou.replace('US$', ''));
          performance = ((quote.regularMarketPrice - precoNum) / precoNum) * 100;
          precoAtual = `US$${quote.regularMarketPrice.toFixed(2)}`;
        }
        return { ...stock, precoAtual, performance };
      });

      setPortfolio(portfolioAtualizado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRealQuotes();
    const interval = setInterval(fetchRealQuotes, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRealQuotes]);

  return { portfolio, loading, error, refetch: fetchRealQuotes };
}

interface MarketIndicatorProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
  isLoading?: boolean;
  description?: string;
}

function MarketIndicator({ title, value, icon, trend, diff, isLoading, description }: MarketIndicatorProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';

  return (
    <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Typography variant="caption">{title}</Typography>
      <Typography variant="h4">{isLoading ? '...' : value}</Typography>
      {!isLoading && diff !== undefined && trend && (
        <Stack direction="row" spacing={1}>
          <TrendIcon size={12} />
          <Typography variant="body2" sx={{ color: trendColor }}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

export default function Page(): React.JSX.Element {
  const { data: apiData, loading: cardsLoading } = useMarketDataAPI();
  const { portfolio, loading: portfolioLoading } = useInternationalDividends();

  if (cardsLoading || portfolioLoading) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => window.location.href = '/dashboard/internacional'}>
        Voltar
      </Button>
      <MarketIndicator
        title="S&P 500"
        value={apiData?.sp500?.value || 'N/A'}
        icon={<CurrencyDollarIcon />}
        trend={apiData?.sp500?.trend}
        diff={apiData?.sp500?.diff}
      />
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticker</TableCell>
              <TableCell>Preço Inicial</TableCell>
              <TableCell>Preço Atual</TableCell>
              <TableCell>Variação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {portfolio.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.ticker}</TableCell>
                <TableCell>{row.precoQueIniciou}</TableCell>
                <TableCell>{row.precoAtual}</TableCell>
                <TableCell>{row.performance?.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
