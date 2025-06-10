'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { WarningCircle as WarningIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info'; // Added for info status
import { ChartLine as ChartLineIcon } from '@phosphor-icons/react/dist/ssr/ChartLine'; // Added for analysis section
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar'; // Added for financial data icon

// 🔑 TOKEN BRAPI VALIDADO
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
  pvp?: number;
  roe?: number;
  dy?: number;
}

interface EmpresaCompleta {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  dataEntrada: string;
  precoIniciou: string;
  precoTeto: string;
  viesAtual: string;
  ibovespaEpoca: string;
  percentualCarteira: string;
  tipo?: 'FII';
  gestora?: string;
  dadosFinanceiros?: DadosFinanceiros;
  statusApi?: string;
  ultimaAtualizacao?: string;
}

// 🚀 HOOK PARA BUSCAR DADOS FINANCEIROS
function useDadosFinanceiros(ticker: string) {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  const buscarDados = React.useCallback(async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      
      const response = await fetch(quoteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Details-App',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const quote = data.results[0];
          
          const precoAtual = quote.regularMarketPrice || quote.currentPrice || quote.price || 0;
          
          let dividendYield = 0;
          if (quote.dividendYield) {
            dividendYield = quote.dividendYield;
          } else if (quote.dividendsData?.yield) {
            dividendYield = quote.dividendsData.yield;
          }

          const pl = quote.priceEarnings || quote.pe;
          const pvp = quote.priceToBook;
          const roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined;
          const marketCap = quote.marketCap;

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: precoAtual,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            dy: dividendYield,
            marketCap: marketCap,
            pl: pl,
            pvp: pvp,
            roe: roe
          };

          setDadosFinanceiros(dadosProcessados);
          setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
          
        } else {
          throw new Error('Nenhum resultado encontrado na API.'); // More specific error message
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}: Falha ao buscar dados.`); // More specific error message
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar dados.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 5 * 60 * 1000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

// 🎯 FUNÇÃO PARA CALCULAR VIÉS
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace('.', '').replace(',', '.'));
  
  if (isNaN(precoTetoNum) || precoAtual <= 0) {
    return 'Aguardar';
  }
  
  const percentualDoTeto = (precoAtual / precoTetoNum) * 100;
  
  if (percentualDoTeto <= 80) {
    return 'Compra Forte';
  } else if (percentualDoTeto <= 95) {
    return 'Compra';
  } else if (percentualDoTeto <= 105) {
    return 'Neutro';
  } else if (percentualDoTeto <= 120) {
    return 'Aguardar';
  } else {
    return 'Venda';
  }
}

// 🔥 FUNÇÃO PARA FORMATAR VALORES
function formatarValor(valor: number | undefined, tipo: 'currency' | 'percent' | 'number' | 'millions' = 'currency'): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
  
  switch (tipo) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor);
    
    case 'percent':
      // Ensure percentage is formatted correctly for display
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1_000_000_000) { // Using numeric separators for readability
        return `R$ ${(valor / 1_000_000_000).toFixed(1).replace('.', ',')} bi`;
      } else if (valor >= 1_000_000) {
        return `R$ ${(valor / 1_000_000).toFixed(1).replace('.', ',')} mi`;
      } else {
        return formatarValor(valor, 'currency');
      }
    
    case 'number':
      return valor.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    
    default:
      return valor.toString();
  }
}

// 📊 COMPONENTE DE MÉTRICA
const MetricCard = ({ 
  title, 
  value, 
  color = 'text.primary', // Use theme colors or specific hex codes
  subtitle, 
  loading = false,
  trend,
  highlight = false,
  icon: IconComponent // Allow passing an icon component
}: { 
  title: string; 
  value: string; 
  color?: string; // Can be a Material-UI color or hex
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  highlight?: boolean;
  icon?: React.ElementType; // Type for icon component
}) => (
  <Card 
    sx={{ 
      height: '100%', 
      border: '1px solid',
      borderColor: highlight ? 'primary.main' : 'grey.300', // Dynamic border color
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out', // Smoother transition
      '&:hover': { 
        transform: 'translateY(-3px)', // More pronounced hover effect
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)', // Stronger shadow
      },
      ...(highlight && {
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', // Lighter, more inviting gradient
        boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
      })
    }}
  >
    <CardContent sx={{ textAlign: 'center', p: { xs: 2.5, md: 3 } }}>
      {loading ? (
        <>
          <Skeleton variant="text" height={40} width="80%" sx={{ mx: 'auto' }} />
          <Skeleton variant="text" height={20} width="60%" sx={{ mx: 'auto' }} />
        </>
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1.5 }}>
            {IconComponent && (
              <IconComponent size={24} color={color === 'success' ? '#16a34a' : color === 'error' ? '#dc2626' : '#607d8b'} /> // Icon with subtle color
            )}
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                fontSize: { xs: '1.6rem', md: '2.1rem' }, // Slightly larger for impact
                color: color === 'success' ? '#16a34a' : color === 'error' ? '#dc2626' : 'text.primary', // Use theme text color
                lineHeight: 1
              }}
            >
              {value}
            </Typography>
            {trend && (
              <Box sx={{ ml: 0.5 }}>
                {trend === 'up' ? (
                  <TrendUpIcon size={20} style={{ color: '#16a34a' }} />
                ) : (
                  <TrendDownIcon size={20} style={{ color: '#dc2626' }} />
                )}
              </Box>
            )}
          </Stack>
          
          <Typography 
            variant="subtitle1" // Changed to subtitle1 for slightly larger title
            sx={{ 
              fontWeight: 600, 
              fontSize: '0.95rem', // Slightly larger font size
              color: 'text.secondary', // Use theme text secondary color
              mb: subtitle ? 0.8 : 0
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.disabled', // Lighter color for caption
                fontSize: '0.78rem', // Slightly larger for readability
                display: 'block',
                lineHeight: 1.3
              }}
            >
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// 🔥 DADOS BASE (Consider renaming to initialAssetsData for clarity)
const ativosBase = [
  {
    ticker: 'ALOS3',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
    setor: 'Shoppings'
  }
];

// Dados de fallback
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Shoppings',
    descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão e com presença consolidada nos principais mercados do país.', // Expanded description
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '108.500',
    percentualCarteira: '4.2%'
  }
};

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  // 📊 BUSCAR DY DOS DADOS DA TABELA PRINCIPAL
  const buscarDYDaTabela = (ticker: string): string => {
    try {
      const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
      
      if (dadosAdmin) {
        const ativos = JSON.parse(dadosAdmin);
        const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
        
        if (ativoEncontrado && ativoEncontrado.dy) {
          return ativoEncontrado.dy;
        }
      }

      const ativoBase = ativosBase?.find(a => a.ticker === ticker);
      if (ativoBase && ativoBase.dy) {
        return ativoBase.dy;
      }

      if (ticker === 'ALOS3') return '5,95%'; // Fallback for ALOS3 if not in localStorage or ativosBase
      
      return 'N/A';
    } catch (err) {
      console.error("Erro ao buscar DY da tabela:", err); // Log the error for debugging
      return 'N/A';
    }
  };

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
        
        if (dadosAdmin) {
          const ativos = JSON.parse(dadosAdmin);
          const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
          
          if (ativoEncontrado) {
            setEmpresa(ativoEncontrado);
            setDataSource('admin');
            return;
          }
        }

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        console.error("Erro ao carregar dados da empresa:", err);
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  // 🔥 COMBINAR DADOS
  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;
    
    let empresaAtualizada = { ...empresa };
    
    // Only apply API data if fetching was successful and data is meaningful
    if (!dadosLoading && !dadosError && dadosFinanceiros && dadosFinanceiros.precoAtual > 0) {
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    } else if (!dadosLoading && (dadosError || !dadosFinanceiros || dadosFinanceiros.precoAtual <= 0)) {
        empresaAtualizada.statusApi = 'error'; // Indicate API data is not available or has errors
    } else if (dadosLoading) {
        empresaAtualizada.statusApi = 'loading'; // Indicate API data is loading
    }
    
    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao, dadosLoading, dadosError]); // Added dadosLoading, dadosError to dependencies

  // 📊 CALCULAR PERFORMANCE
  const calcularPerformance = () => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    const precoEntradaStr = empresaCompleta.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.');
    const precoEntrada = parseFloat(precoEntradaStr);
    const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
    
    if (precoEntrada > 0 && precoAtual > 0) {
      const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
      return formatarValor(performance, 'percent');
    }
    
    return 'N/A';
  };

  const dyDaTabela = buscarDYDaTabela(ticker);

  if (!empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center', // Center content vertically and horizontally
        backgroundColor: '#f8fafc' // Light background for the whole page
      }}>
        <WarningIcon size={64} style={{ color: '#ef4444', marginBottom: '24px' }} /> {/* Larger, more prominent icon */}
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#1f2937' }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 500, mx: 'auto', color: '#4b5563' }}>
          Parece que o ticker "<strong>{ticker}</strong>" não foi encontrado em nossa base de dados ou nos dados de fallback. Por favor, verifique e tente novamente.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            startIcon={<ArrowLeftIcon />} 
            onClick={() => window.history.back()}
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#2563eb' },
              color: 'white',
              boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)'
            }}
          >
            Voltar à Lista
          </Button>
        </Stack>
      </Box>
    );
  }

  const isFII = empresaCompleta.tipo === 'FII';
  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual) : empresaCompleta.precoIniciou;
  const variacaoPercentFormatada = dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A';
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : 'up';

  const viesColor = (vies: string) => {
    if (vies.includes('Compra')) return 'success';
    if (vies === 'Venda') return 'error';
    return 'info'; // 'Neutro' or 'Aguardar'
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header com navegação */}
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }} 
        spacing={2} 
        sx={{ mb: 3 }}
      >
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()} 
          variant="outlined"
          sx={{ borderColor: 'grey.400', color: 'text.primary', '&:hover': { borderColor: 'grey.500', backgroundColor: 'grey.50' } }}
        >
          Voltar
        </Button>
        
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
          {empresaCompleta.statusApi === 'loading' && (
            <Alert severity="info" icon={<CircularProgress size={16} color="inherit" />} sx={{ py: 0.5, pr: 1, backgroundColor: '#e0f2f7', color: '#01579b' }}>
              Carregando dados da API...
            </Alert>
          )}
          {empresaCompleta.statusApi === 'error' && (
            <Alert severity="warning" icon={<WarningIcon size={16} />} sx={{ py: 0.5, pr: 1, backgroundColor: '#fff3e0', color: '#ff6f00' }}>
              Erro na API: {dadosError || "Dados estáticos"}
            </Alert>
          )}
          {empresaCompleta.statusApi === 'success' && (
            <Alert severity="success" icon={<CheckIcon size={16} />} sx={{ py: 0.5, pr: 1, backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
              Dados atualizados via API BRAPI
            </Alert>
          )}
          
          <Tooltip title="Atualizar dados">
            <IconButton onClick={refetch} disabled={dadosLoading} sx={{ color: 'grey.700', '&:hover': { color: 'primary.main' } }}>
              <RefreshIcon size={20} />
            </IconButton>
          </Tooltip>
          
          <Button 
            startIcon={<SettingsIcon />} 
            onClick={() => window.open('/admin', '_blank')}
            variant="outlined"
            size="small"
            sx={{ borderColor: 'grey.400', color: 'text.secondary', '&:hover': { borderColor: 'grey.500', backgroundColor: 'grey.50' } }}
          >
            Gerenciar
          </Button>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card 
        sx={{ 
          mb: 4, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)', 
          color: 'black',
          borderRadius: 3, // More rounded corners
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)' // Softer, more pronounced shadow
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}> {/* Increased padding for larger screens */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4} // Increased spacing
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresaCompleta.avatar} 
              alt={empresaCompleta.ticker} 
              sx={{ 
                width: { xs: 100, md: 140 }, // Larger avatar
                height: { xs: 100, md: 140 },
                border: '5px solid #e0e0e0', // Thicker, slightly darker border
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)', // Subtle shadow for avatar
                flexShrink: 0
              }} 
            />
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-start' }} 
                sx={{ mb: 1.5 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {empresaCompleta.ticker}
                </Typography>
                {isFII && (
                  <Chip 
                    label="FII" 
                    sx={{ 
                      backgroundColor: '#e3f2fd', // Light blue background
                      color: '#2196f3', // Blue text
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      px: 1, // Padding horizontal
                      py: 0.5 // Padding vertical
                    }} 
                  />
                )}
              </Stack>
              <Typography variant="h5" sx={{ mb: 2, color: 'text.secondary' }}> {/* Slightly smaller, clearer heading */}
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                sx={{ 
                  backgroundColor: '#e8f5e9', // Light green background for sector
                  color: '#4caf50', // Green text
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 650, color: 'text.primary', lineHeight: 1.6 }}> {/* Increased line height */}
                {empresaCompleta.descricao}
              </Typography>
              {ultimaAtualizacao && (
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1.5, color: 'text.disabled' }}>
                  Última atualização (API): {ultimaAtualizacao}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' }, minWidth: { md: '180px' } }}> {/* Set a min-width for consistent alignment */}
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} sx={{ mx: 'auto', mb: 1 }} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}> {/* Use primary.main for current price */}
                    {precoAtualFormatado}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                  >
                    {tendencia === 'up' ? (
                      <TrendUpIcon size={28} style={{ color: '#22c55e' }} />
                    ) : (
                      <TrendDownIcon size={28} style={{ color: '#ef4444' }} />
                    )}
                    <Typography sx={{ 
                      color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                      fontWeight: 700, 
                      fontSize: '1.3rem' 
                    }}>
                      {variacaoPercentFormatada}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Variação hoje
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <Grid container spacing={3} sx={{ mb: 4 }}> {/* Increased spacing */}
        <Grid item xs={6} sm={4} md={2.4}> {/* Adjusted grid sizes for better distribution */}
          <MetricCard 
            title="Dividend Yield" 
            value={dyDaTabela}
            color="success"
            loading={dadosLoading}
            subtitle="Da carteira"
            icon={CurrencyDollarIcon} // Added icon
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MetricCard 
            title="Viés Atual" 
            value={empresaCompleta.viesAtual}
            color={viesColor(empresaCompleta.viesAtual)} // Dynamic color based on bias
            loading={dadosLoading}
            subtitle="Análise automática" // More descriptive subtitle
            highlight={empresaCompleta.viesAtual.includes('Compra')}
            icon={ChartLineIcon} // Added icon
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MetricCard 
            title="% Carteira" 
            value={empresaCompleta.percentualCarteira || 'N/A'} 
            subtitle="Participação total" // More descriptive subtitle
            icon={InfoIcon} // Added icon
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MetricCard 
            title={isFII ? "P/VP" : "P/L"} 
            value={dados?.pl || dados?.pvp ? formatarValor(dados.pl || dados.pvp, 'number') : 'N/A'}
            loading={dadosLoading}
            subtitle="Múltiplo de mercado" // More descriptive subtitle
            icon={CurrencyDollarIcon} // Added icon
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MetricCard 
            title="Preço Teto" 
            value={empresaCompleta.precoTeto} 
            subtitle="Meta de valor" // More descriptive subtitle
            icon={ChartLineIcon} // Added icon
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MetricCard 
            title="Performance" 
            value={calcularPerformance()}
            color={calcularPerformance().includes('-') ? 'error' : 'success'}
            loading={dadosLoading}
            trend={calcularPerformance().includes('-') ? 'down' : 'up'}
            subtitle="Desde a entrada" // More descriptive subtitle
            highlight={!calcularPerformance().includes('-') && calcularPerformance() !== 'N/A'} // Highlight only if positive and not N/A
            icon={ChartLineIcon} // Added icon
          />
        </Grid>
      </Grid>

      {/* Dados da posição */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: 'grey.50', // Lighter background
                  borderRadius: 1.5 // Slightly more rounded
                }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{empresaCompleta.dataEntrada}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1.5 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{empresaCompleta.precoIniciou}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: dados?.precoAtual ? '#e8f5e9' : 'grey.50', // Highlight if API data available
                  borderRadius: 1.5 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: dados?.precoAtual ? '#22c55e' : 'text.primary' 
                  }}>
                    {precoAtualFormatado}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1.5 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{empresaCompleta.ibovespaEpoca}</Typography>
                </Box>
                {isFII && empresaCompleta.gestora && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: 'grey.50', 
                    borderRadius: 1.5 
                  }}>
                    <Typography variant="body2" color="text.secondary">Gestora</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{empresaCompleta.gestora}</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                📈 {isFII ? 'Dados do Fundo' : 'Dados Fundamentalistas'}
              </Typography>
              
              {dadosLoading ? (
                <Stack spacing={2}>
                  {[...Array(isFII ? 3 : 4)].map((_, index) => ( // Adjust skeleton count based on FII or not
                    <Skeleton key={index} variant="rectangular" height={50} sx={{ borderRadius: 1.5 }} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.marketCap ? '#e8f5e9' : 'grey.50', 
                    borderRadius: 1.5 
                  }}>
                    <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {dados?.marketCap ? formatarValor(dados.marketCap, 'millions') : 'N/A'}
                    </Typography>
                  </Box>
                  {!isFII && ( // Only show P/L and ROE for non-FII
                    <>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: dados?.pl ? '#e8f5e9' : 'grey.50', 
                        borderRadius: 1.5 
                      }}>
                        <Typography variant="body2" color="text.secondary">P/L</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        p: 2, 
                        backgroundColor: dados?.roe ? '#e8f5e9' : 'grey.50', 
                        borderRadius: 1.5 
                      }}>
                        <Typography variant="body2" color="text.secondary">ROE</Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          color: dados?.roe ? '#22c55e' : 'text.primary'
                        }}>
                          {dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
                        </Typography>
                      </Box>
                    </>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.pvp ? '#e8f5e9' : 'grey.50', 
                    borderRadius: 1.5 
                  }}>
                    <Typography variant="body2" color="text.secondary">{isFII ? 'P/VP' : 'P/VPA'}</Typography> {/* Label adjustment */}
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análise de performance */}
      {dados && dados.precoAtual > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: 700, 
                  color: 'text.primary', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  🎯 Análise de Performance com Dados Reais
                </Typography>
                
                <Grid container spacing={4} alignItems="flex-start"> {/* Increased spacing and align items */}
                  <Grid item xs={12} md={7}> {/* Adjusted grid size */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}> {/* Slightly bolder subtitle */}
                        Performance vs Preço de Entrada
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            {empresaCompleta.ticker} - Desempenho Total
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(Math.abs(
                              parseFloat(calcularPerformance().replace('%', '').replace(',', '.')) || 0
                            ), 100)} 
                            sx={{ 
                              height: 14, // Slightly thicker progress bar
                              borderRadius: 2, // More rounded corners
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e',
                                transition: 'all 0.5s ease-in-out' // Smooth transition for value changes
                              }
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="body1" // Slightly larger for value
                          sx={{ 
                            fontWeight: 700, // Bolder value
                            minWidth: 80,
                            textAlign: 'right', // Align right for numbers
                            color: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e'
                          }}
                        >
                          {calcularPerformance()}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Distância do Preço Teto
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Percentual atingido em relação ao Preço Teto
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 100)} 
                            sx={{ 
                              height: 14, 
                              borderRadius: 2, 
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444',
                                transition: 'all 0.5s ease-in-out'
                              }
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 700, 
                            minWidth: 80,
                            textAlign: 'right',
                            color: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444'
                          }}
                        >
                          {formatarValor((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 'percent')}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={5}> {/* Adjusted grid size */}
                    <Box sx={{ p: 3, backgroundColor: '#e0f7fa', borderRadius: 2.5, height: '100%', border: '1px solid #b2ebf2' }}> {/* Lighter blue, softer background, border */}
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#006064', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon size={20} /> Resumo da Análise
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#006064', lineHeight: 1.7 }}>
                        Com base nos dados mais recentes da API, a ação **{empresaCompleta.ticker}** está atualmente em **{empresaCompleta.viesAtual}**. 
                        Sua performance desde a entrada é de **{calcularPerformance()}**, e o preço atual está a **{formatarValor((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 'percent')}** do seu preço teto.
                        Acompanhe de perto o *Market Cap* de **{formatarValor(dados.marketCap, 'millions')}** e o {isFII ? 'P/VP' : 'P/L'} de **{formatarValor(dados.pl || dados.pvp, 'number')}** para futuras decisões.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Optional: Add a subtle footer or more charts/tables here */}
    </Box>
  );
}
