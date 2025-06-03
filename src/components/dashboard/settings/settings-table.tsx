/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { Storefront } from '@phosphor-icons/react/dist/ssr/Storefront';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { Truck } from '@phosphor-icons/react/dist/ssr/Truck';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';
import { TrendUp } from '@phosphor-icons/react/dist/ssr/TrendUp';

function noop(): void {
  // Função vazia para props obrigatórias
}

// 🔥 HOOK PARA BUSCAR DADOS REAIS DA API DE FIIs
function useFIIsDataAPI() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      console.log('🔄 Buscando dados da API de FIIs...');
      
      const timestamp = Date.now();
      const response = await fetch(`/api/financial/fiis-data?_t=${timestamp}`, {
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
      console.log('✅ Dados da API de FIIs recebidos:', result);
      
      setData(result.fiisData);
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao buscar dados da API de FIIs:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    
    // Refresh a cada 5 minutos
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// 🎨 INDICADOR DE MERCADO DISCRETO E ELEGANTE PARA FIIs
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
    <Box 
      sx={{ 
        backgroundColor: '#ffffff',
        borderRadius: 2,
        p: 2.5,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        opacity: isLoading ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#c7d2fe',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }
      }}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94a3b8',
                  display: 'block',
                  mt: 0.25,
                  fontSize: '0.7rem'
                }}
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            {React.cloneElement(icon as React.ReactElement, { size: 16 })}
          </Box>
        </Stack>
        
        {/* Valor principal */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            fontSize: '1.75rem',
            lineHeight: 1
          }}
        >
          {isLoading ? '...' : value}
        </Typography>
        
        {/* Indicador de tendência */}
        {!isLoading && diff !== undefined && trend && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
              color: trendColor
            }}>
              <TrendIcon size={12} weight="bold" />
            </Box>
            <Typography 
              variant="body2"
              sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.875rem'
              }}
            >
              {diff > 0 ? '+' : ''}{typeof diff === 'number' ? diff.toFixed(2) : diff}%
            </Typography>
            <Typography 
              variant="body2"
              sx={{ 
                color: '#64748b',
                fontSize: '0.875rem'
              }}
            >
              hoje
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function getSetorIcon(setor: string): React.ReactNode {
  const iconStyle = { fontSize: 20, color: '#6b7280' };
  
  switch (setor.toLowerCase()) {
    case 'shopping':
    case 'shoppings':
      return <Storefront style={iconStyle} />;
    case 'papel':
    case 'papel e celulose':
      return <FileText style={iconStyle} />;
    case 'logística':
    case 'logistico':
      return <Truck style={iconStyle} />;
    case 'fii':
    case 'fiis':
    case 'híbrido':
    case 'hibrido':
    case 'hedge fund':
    case 'fof':
    case 'fiagro':
    case 'renda urbana':
      return <Buildings style={iconStyle} />;
    case 'renda fixa':
      return <TrendUp style={iconStyle} />;
    default:
      return <Buildings style={iconStyle} />;
  }
}

export interface SettingsData {
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
}

interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: SettingsData[];
  rowsPerPage?: number;
  cardsData?: {
    ibovespa?: { value: string; trend?: 'up' | 'down'; diff?: number };
    indiceSmall?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraHoje?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dividendYield?: { value: string; trend?: 'up' | 'down'; diff?: number };
    ibovespaPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function SettingsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: SettingsTableProps): React.JSX.Element {
  
  // Dados reais dos FIIs baseados na tabela fornecida
  const dadosReais: SettingsData[] = [
    {
      id: "1",
      avatar: "",
      ticker: "MALL11",
      setor: "Shopping",
      dataEntrada: "26/01/2022",
      precoEntrada: "R$ 118,37",
      precoAtual: "R$ 103,53",
      dy: "8.40%",
      precoTeto: "R$ 103,68",
      vies: "Compra"
    },
    {
      id: "2",
      avatar: "",
      ticker: "KNSC11",
      setor: "Papel",
      dataEntrada: "24/05/2022",
      precoEntrada: "R$ 9,31",
      precoAtual: "R$ 8,87",
      dy: "10.98%",
      precoTeto: "R$ 9,16",
      vies: "Compra"
    },
    {
      id: "3",
      avatar: "",
      ticker: "KNHF11",
      setor: "Hedge Fund",
      dataEntrada: "20/12/2024",
      precoEntrada: "R$ 76,31",
      precoAtual: "R$ 91,05",
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
      precoAtual: "R$ 199,60",
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
      precoAtual: "R$ 8,47",
      dy: "13.21%",
      precoTeto: "R$ 8,70",
      vies: "Compra"
    },
    {
      id: "6",
      avatar: "",
      ticker: "BCIA11",
      setor: "FoF",
      dataEntrada: "12/04/2023",
      precoEntrada: "R$ 82,28",
      precoAtual: "R$ 85,75",
      dy: "9.77%",
      precoTeto: "R$ 86,00",
      vies: "Compra"
    },
    {
      id: "7",
      avatar: "",
      ticker: "BPFF11",
      setor: "FoF",
      dataEntrada: "08/01/2024",
      precoEntrada: "R$ 72,12",
      precoAtual: "R$ 60,40",
      dy: "11.00%",
      precoTeto: "R$ 66,34",
      vies: "Compra"
    },
    {
      id: "8",
      avatar: "",
      ticker: "HGFF11",
      setor: "FoF",
      dataEntrada: "03/04/2023",
      precoEntrada: "R$ 69,15",
      precoAtual: "R$ 71,40",
      dy: "9.25%",
      precoTeto: "R$ 73,59",
      vies: "Compra"
    },
    {
      id: "9",
      avatar: "",
      ticker: "BRCO11",
      setor: "Logística",
      dataEntrada: "09/05/2022",
      precoEntrada: "R$ 99,25",
      precoAtual: "R$ 108,66",
      dy: "8.44%",
      precoTeto: "R$ 109,89",
      vies: "Compra"
    },
    {
      id: "10",
      avatar: "",
      ticker: "XPML11",
      setor: "Shopping",
      dataEntrada: "16/02/2022",
      precoEntrada: "R$ 93,32",
      precoAtual: "R$ 104,80",
      dy: "8.44%",
      precoTeto: "R$ 136,00",
      vies: "Compra"
    },
    {
      id: "11",
      avatar: "",
      ticker: "HGLG11",
      setor: "Logística",
      dataEntrada: "20/06/2022",
      precoEntrada: "R$ 161,80",
      precoAtual: "R$ 159,72",
      dy: "8.44%",
      precoTeto: "R$ 148,67",
      vies: "Compra"
    },
    {
      id: "12",
      avatar: "",
      ticker: "HSML11",
      setor: "Shopping",
      dataEntrada: "14/06/2022",
      precoEntrada: "R$ 78,00",
      precoAtual: "R$ 84,47",
      dy: "8.91%",
      precoTeto: "R$ 93,40",
      vies: "Compra"
    },
    {
      id: "13",
      avatar: "",
      ticker: "VGIP11",
      setor: "Papel",
      dataEntrada: "02/12/2021",
      precoEntrada: "R$ 96,99",
      precoAtual: "R$ 81,61",
      dy: "13.67%",
      precoTeto: "R$ 93,30",
      vies: "Compra"
    },
    {
      id: "14",
      avatar: "",
      ticker: "AFHI11",
      setor: "Papel",
      dataEntrada: "05/07/2022",
      precoEntrada: "R$ 99,91",
      precoAtual: "R$ 92,79",
      dy: "13.08%",
      precoTeto: "R$ 93,30",
      vies: "Compra"
    },
    {
      id: "15",
      avatar: "",
      ticker: "BTLG11",
      setor: "Logística",
      dataEntrada: "05/01/2022",
      precoEntrada: "R$ 103,14",
      precoAtual: "R$ 100,20",
      dy: "8.42%",
      precoTeto: "R$ 104,09",
      vies: "Compra"
    },
    {
      id: "16",
      avatar: "",
      ticker: "VRTA11",
      setor: "Papel",
      dataEntrada: "27/12/2022",
      precoEntrada: "R$ 88,30",
      precoAtual: "R$ 81,86",
      dy: "9.66%",
      precoTeto: "R$ 54,23",
      vies: "Compra"
    },
    {
      id: "17",
      avatar: "",
      ticker: "LVBI11",
      setor: "Logística",
      dataEntrada: "18/10/2022",
      precoEntrada: "R$ 113,85",
      precoAtual: "R$ 102,67",
      dy: "7.90%",
      precoTeto: "R$ 120,25",
      vies: "Compra"
    },
    {
      id: "18",
      avatar: "",
      ticker: "HGRU11",
      setor: "Renda Urbana",
      dataEntrada: "17/05/2022",
      precoEntrada: "R$ 115,00",
      precoAtual: "R$ 124,94",
      dy: "8.44%",
      precoTeto: "R$ 138,57",
      vies: "Compra"
    },
    {
      id: "19",
      avatar: "",
      ticker: "ALZR11",
      setor: "Híbrido",
      dataEntrada: "02/02/2022",
      precoEntrada: "R$ 115,89",
      precoAtual: "R$ 100,70",
      dy: "8.44%",
      precoTeto: "R$ 110,16",
      vies: "Compra"
    }
  ];

  // 🔥 PRIORIZAR DADOS DA API (rows) SOBRE DADOS ESTÁTICOS
  const dadosParaUsar = rows.length > 0 ? rows : dadosReais;

  // 🔥 BUSCAR DADOS REAIS DA API
  const { data: apiData, loading, error, refresh } = useFIIsDataAPI();

  // 🔥 VALORES PADRÃO ATUALIZADOS (APENAS FALLBACK QUANDO API FALHA)
  const defaultIndicators = {
    ibovespa: { value: "158.268", trend: "up" as const, diff: 10.09 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "R$ 118,27", trend: "up" as const, diff: 10.09 },
    dividendYield: { value: "10,9%", trend: "up" as const, diff: 10.9 },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  // 🔧 PRIORIZAR DADOS DA API, DEPOIS cardsData, DEPOIS DEFAULT
  const indicators = React.useMemo(() => {
    // Se temos dados da API, usar eles
    if (apiData) {
      console.log('✅ Usando dados da API de FIIs:', apiData);
      return {
        ibovespa: apiData.ibovespa || defaultIndicators.ibovespa,
        indiceSmall: apiData.indiceSmall || defaultIndicators.indiceSmall,
        carteiraHoje: apiData.carteiraHoje || defaultIndicators.carteiraHoje,
        dividendYield: apiData.dividendYield || defaultIndicators.dividendYield,
        ibovespaPeriodo: apiData.ibovespaPeriodo || defaultIndicators.ibovespaPeriodo,
        carteiraPeriodo: apiData.carteiraPeriodo || defaultIndicators.carteiraPeriodo,
      };
    }
    
    // Senão, usar cardsData se disponível
    if (Object.keys(cardsData).length > 0) {
      console.log('⚠️ Usando cardsData prop:', cardsData);
      return { ...defaultIndicators, ...cardsData };
    }
    
    // Por último, usar fallback
    console.log('⚠️ Usando dados de fallback para FIIs');
    return defaultIndicators;
  }, [apiData, cardsData]);

  console.log("✅ SettingsTable FIIs iniciado!");
  console.log("📊 Dados recebidos via props (API):", rows.length, "itens");
  console.log("📊 Dados estáticos (fallback):", dadosReais.length, "itens");
  console.log("🎯 Usando dados:", rows.length > 0 ? "DA API (REAL)" : "ESTÁTICOS (FALLBACK)");

  return (
    <Box>
      {/* Header com status da API */}
      {error && (
        <Box sx={{ mb: 3, p: 3, backgroundColor: '#fef2f2', borderRadius: 2, border: '1px solid #fecaca' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" sx={{ color: '#dc2626' }}>
              ⚠️ Erro ao carregar dados da API: {error}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={refresh}
            >
              🔄 Tentar novamente
            </Typography>
          </Stack>
        </Box>
      )}

      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 6 }} />
          <Typography variant="body2" sx={{ color: '#64748b', textAlign: 'center', mt: 2 }}>
            Carregando dados de FIIs em tempo real...
          </Typography>
        </Box>
      )}

      {/* Indicadores de Mercado - Layout em Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)'
          },
          gap: 2,
          mb: 4,
        }}
      >
        <MarketIndicator 
          title="IBOVESPA" 
          description="Índice da Bolsa Brasileira"
          value={indicators.ibovespa.value} 
          icon={<CurrencyDollarIcon />} 
          trend={indicators.ibovespa.trend} 
          diff={indicators.ibovespa.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="IFIX HOJE" 
          description="Índice de Fundos Imobiliários"
          value={indicators.indiceSmall.value} 
          icon={<Buildings />} 
          trend={indicators.indiceSmall.trend} 
          diff={indicators.indiceSmall.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="CARTEIRA HOJE" 
          description="Valor atual da carteira"
          value={indicators.carteiraHoje.value} 
          icon={<ListBulletsIcon />}
          trend={indicators.carteiraHoje.trend}
          diff={indicators.carteiraHoje.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="DIVIDEND YIELD" 
          description="Rendimento médio"
          value={indicators.dividendYield.value} 
          icon={<ChartBarIcon />}
          trend={indicators.dividendYield.trend}
          diff={indicators.dividendYield.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="IFIX PERÍODO" 
          description="Performance do período"
          value={indicators.ibovespaPeriodo.value} 
          icon={<Buildings />} 
          trend={indicators.ibovespaPeriodo.trend} 
          diff={indicators.ibovespaPeriodo.diff}
          isLoading={loading}
        />
        <MarketIndicator 
          title="CARTEIRA PERÍODO" 
          description="Performance da carteira"
          value={indicators.carteiraPeriodo.value} 
          icon={<ChartBarIcon />} 
          trend={indicators.carteiraPeriodo.trend} 
          diff={indicators.carteiraPeriodo.diff}
          isLoading={loading}
        />
      </Box>
      
      {/* Tabela de FIIs */}
      <Card sx={{ 
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 4,
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.2)'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ 
                fontWeight: 800, 
                color: '#1e293b',
                fontSize: '1.5rem',
                mb: 0.5
              }}>
                Carteira de Fundos Imobiliários
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}>
                {dadosParaUsar.length} FIIs em acompanhamento • Viés calculado automaticamente
              </Typography>
            </Box>
            <Box sx={{
              background: 'linear-gradient(135deg, #000000 0%, #374151 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {dadosParaUsar.length} FIIs
            </Box>
          </Stack>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  width: '60px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  #
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  FII
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  DY
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Teto
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Viés
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosParaUsar.map((row, index) => {
                // 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
                    return 'Aguardar';
                  }
                  
                  return precoAtualNum < precoTetoNum ? 'Compra' : 'Aguardar';
                };
                
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                
                // Calcular performance
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        cursor: 'pointer',
                        transform: 'scale(1.005)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      color: '#000000'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          width: 44, 
                          height: 44,
                          backgroundColor: '#f8fafc',
                          border: '2px solid rgba(0, 0, 0, 0.1)'
                        }}>
                          {getSetorIcon(row.setor)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '1rem'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: performance >= 0 ? '#059669' : '#dc2626',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="medium"
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          color: '#000000',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      {row.precoEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: performance >= 0 ? '#10b981' : '#ef4444',
                      whiteSpace: 'nowrap',
                      fontSize: '0.9rem'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.dy}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569',
                      whiteSpace: 'nowrap'
                    }}>
                      {row.precoTeto}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={viesCalculado}
                        size="medium"
                        sx={{
                          backgroundColor: viesCalculado === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid',
                          borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count || dadosParaUsar.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage || dadosParaUsar.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            p: 2,
            '& .MuiTablePagination-toolbar': {
              color: '#475569'
            }
          }}
        />
      </Card>
    </Box>
  );
}Setor
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Entrada
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Preço Inicial
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
                  Preço Atual
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  color: '#475569', 
                  fontSize: '0.8rem', 
                  textTransform: 'uppercase'
                }}>
