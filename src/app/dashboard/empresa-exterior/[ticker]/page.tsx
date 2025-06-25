'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// ========================================
// ÍCONES MOCK
// ========================================
const ArrowLeftIcon = () => <span>←</span>;
const TrendUpIcon = () => <span style={{ color: '#22c55e' }}>↗</span>;
const TrendDownIcon = () => <span style={{ color: '#ef4444' }}>↘</span>;
const RefreshIcon = () => <span>🔄</span>;
const WarningIcon = () => <span>⚠</span>;
const CheckIcon = () => <span>✓</span>;
const UploadIcon = () => <span>📤</span>;
const DownloadIconCustom = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;
const ViewIcon = () => <span>👁</span>;
const CloseIcon = () => <span>✕</span>;
const CloudUploadIconCustom = () => <span>☁️</span>;
const PictureAsPdfIconCustom = () => <span>📄</span>;

// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
// Para ativos internacionais, você pode usar Alpha Vantage, Yahoo Finance API, etc.
const API_TOKEN = 'your_api_token_here'; // Substituir por token real

// ========================================
// INTERFACES E TIPOS
// ========================================
interface DadosFinanceirosExterior {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pe?: number; // P/E ratio
  dividendYield?: number;
  moeda: string;
  precoEmUSD: number;
  cotacaoUSD?: number;
}

interface EmpresaExterior {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  dataEntrada: string;
  precoIniciou: string;
  precoTeto: string;
  viesAtual: string;
  sp500Epoca: string; // Equivalente ao ibovespaEpoca
  percentualCarteira: string;
  pais: string;
  moeda: string;
  bolsa: string; // NYSE, NASDAQ, LSE, etc.
  dadosFinanceiros?: DadosFinanceirosExterior;
  statusApi?: string;
  ultimaAtualizacao?: string;
}

export type TipoVisualizacao = 'iframe' | 'canva' | 'link' | 'pdf';

interface Relatorio {
  id: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataUpload: string;
  dataReferencia: string;
  arquivo?: string;
  linkCanva?: string;
  linkExterno?: string;
  tamanho?: string;
  tipoVisualizacao: TipoVisualizacao;
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  dataUploadPdf?: string;
  solicitarReupload?: boolean;
  hashArquivo?: string;
}

// ========================================
// DADOS DE FALLBACK - ATIVOS INTERNACIONAIS
// ========================================
const dadosFallbackExterior: { [key: string]: EmpresaExterior } = {
  // ========================================
  // TECNOLOGIA - EUA
  // ========================================
  'AAPL': {
    ticker: 'AAPL',
    nomeCompleto: 'Apple Inc.',
    setor: 'Tecnologia',
    descricao: 'A Apple é uma empresa multinacional americana de tecnologia com sede em Cupertino, Califórnia, que projeta, desenvolve e vende eletrônicos de consumo, software de computador e serviços online.',
    avatar: 'https://logo.clearbit.com/apple.com',
    dataEntrada: '15/03/2022',
    precoIniciou: 'US$ 175,50',
    precoTeto: 'US$ 220,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.200',
    percentualCarteira: '4.8%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NASDAQ'
  },

  'MSFT': {
    ticker: 'MSFT',
    nomeCompleto: 'Microsoft Corporation',
    setor: 'Tecnologia',
    descricao: 'A Microsoft é uma empresa multinacional americana de tecnologia que desenvolve, fabrica, licencia, suporta e vende software de computador, eletrônicos de consumo, computadores pessoais e serviços relacionados.',
    avatar: 'https://logo.clearbit.com/microsoft.com',
    dataEntrada: '10/01/2022',
    precoIniciou: 'US$ 320,00',
    precoTeto: 'US$ 400,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.100',
    percentualCarteira: '5.2%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NASDAQ'
  },

  'GOOGL': {
    ticker: 'GOOGL',
    nomeCompleto: 'Alphabet Inc.',
    setor: 'Tecnologia',
    descricao: 'A Alphabet é uma holding americana criada para ser a empresa-mãe do Google e de várias outras empresas que anteriormente eram de propriedade ou vinculadas ao Google.',
    avatar: 'https://logo.clearbit.com/google.com',
    dataEntrada: '05/08/2021',
    precoIniciou: 'US$ 2.750,00',
    precoTeto: 'US$ 3.200,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.400',
    percentualCarteira: '6.1%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NASDAQ'
  },

  'TSLA': {
    ticker: 'TSLA',
    nomeCompleto: 'Tesla, Inc.',
    setor: 'Automotivo/Tecnologia',
    descricao: 'A Tesla é uma empresa americana de veículos elétricos e energia limpa com sede em Austin, Texas, que projeta e fabrica veículos elétricos, sistemas de armazenamento de energia e painéis solares.',
    avatar: 'https://logo.clearbit.com/tesla.com',
    dataEntrada: '20/11/2021',
    precoIniciou: 'US$ 1.050,00',
    precoTeto: 'US$ 1.400,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.600',
    percentualCarteira: '3.9%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NASDAQ'
  },

  // ========================================
  // FINANCEIRO - EUA
  // ========================================
  'JPM': {
    ticker: 'JPM',
    nomeCompleto: 'JPMorgan Chase & Co.',
    setor: 'Financeiro',
    descricao: 'O JPMorgan Chase é um banco de investimento multinacional americano e empresa de serviços financeiros com sede na cidade de Nova York.',
    avatar: 'https://logo.clearbit.com/jpmorganchase.com',
    dataEntrada: '12/06/2022',
    precoIniciou: 'US$ 135,00',
    precoTeto: 'US$ 165,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.000',
    percentualCarteira: '3.7%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE'
  },

  'BAC': {
    ticker: 'BAC',
    nomeCompleto: 'Bank of America Corporation',
    setor: 'Financeiro',
    descricao: 'O Bank of America é uma corporação bancária e de serviços financeiros multinacional americana com sede em Charlotte, Carolina do Norte.',
    avatar: 'https://logo.clearbit.com/bankofamerica.com',
    dataEntrada: '18/04/2022',
    precoIniciou: 'US$ 42,50',
    precoTeto: 'US$ 55,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.150',
    percentualCarteira: '2.8%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE'
  },

  // ========================================
  // ENERGIA - EUA
  // ========================================
  'XOM': {
    ticker: 'XOM',
    nomeCompleto: 'Exxon Mobil Corporation',
    setor: 'Energia',
    descricao: 'A Exxon Mobil é uma corporação multinacional americana de petróleo e gás com sede em Irving, Texas, é uma das maiores empresas de petróleo e gás do mundo.',
    avatar: 'https://logo.clearbit.com/exxonmobil.com',
    dataEntrada: '08/09/2021',
    precoIniciou: 'US$ 65,00',
    precoTeto: 'US$ 95,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.350',
    percentualCarteira: '3.2%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE'
  },

  // ========================================
  // SAÚDE - EUA
  // ========================================
  'JNJ': {
    ticker: 'JNJ',
    nomeCompleto: 'Johnson & Johnson',
    setor: 'Saúde',
    descricao: 'A Johnson & Johnson é uma corporação multinacional americana que desenvolve dispositivos médicos, produtos farmacêuticos e produtos de consumo embalados.',
    avatar: 'https://logo.clearbit.com/jnj.com',
    dataEntrada: '25/02/2022',
    precoIniciou: 'US$ 165,00',
    precoTeto: 'US$ 190,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.200',
    percentualCarteira: '4.1%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE'
  },

  'PFE': {
    ticker: 'PFE',
    nomeCompleto: 'Pfizer Inc.',
    setor: 'Saúde',
    descricao: 'A Pfizer é uma corporação farmacêutica multinacional americana com sede na cidade de Nova York, uma das maiores empresas farmacêuticas do mundo.',
    avatar: 'https://logo.clearbit.com/pfizer.com',
    dataEntrada: '14/07/2021',
    precoIniciou: 'US$ 42,00',
    precoTeto: 'US$ 55,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.300',
    percentualCarteira: '2.9%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE'
  },

  // ========================================
  // EUROPA - VÁRIAS BOLSAS
  // ========================================
  'ASML': {
    ticker: 'ASML',
    nomeCompleto: 'ASML Holding N.V.',
    setor: 'Tecnologia/Semicondutores',
    descricao: 'A ASML é uma empresa holandesa que é um dos principais fornecedores de sistemas de litografia fotônica para a indústria de semicondutores.',
    avatar: 'https://logo.clearbit.com/asml.com',
    dataEntrada: '30/05/2022',
    precoIniciou: '€ 650,00',
    precoTeto: '€ 800,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.000',
    percentualCarteira: '3.8%',
    pais: 'Holanda',
    moeda: 'EUR',
    bolsa: 'Euronext Amsterdam'
  },

  'NESN': {
    ticker: 'NESN',
    nomeCompleto: 'Nestlé S.A.',
    setor: 'Consumo',
    descricao: 'A Nestlé é uma corporação multinacional suíça de alimentos e bebidas com sede em Vevey, Suíça, é a maior empresa de alimentos do mundo.',
    avatar: 'https://logo.clearbit.com/nestle.com',
    dataEntrada: '22/01/2022',
    precoIniciou: 'CHF 125,00',
    precoTeto: 'CHF 145,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.100',
    percentualCarteira: '3.5%',
    pais: 'Suíça',
    moeda: 'CHF',
    bolsa: 'SIX Swiss Exchange'
  },

  // ========================================
  // ÁSIA - VÁRIAS BOLSAS
  // ========================================
  'TSM': {
    ticker: 'TSM',
    nomeCompleto: 'Taiwan Semiconductor Manufacturing Company',
    setor: 'Tecnologia/Semicondutores',
    descricao: 'A TSMC é uma empresa taiwanesa de fabricação de semicondutores, a maior fundição de semicondutores independente do mundo.',
    avatar: 'https://logo.clearbit.com/tsmc.com',
    dataEntrada: '16/12/2021',
    precoIniciou: 'US$ 120,00',
    precoTeto: 'US$ 150,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.650',
    percentualCarteira: '4.3%',
    pais: 'Taiwan',
    moeda: 'USD',
    bolsa: 'NYSE (ADR)'
  },

  'BABA': {
    ticker: 'BABA',
    nomeCompleto: 'Alibaba Group Holding Limited',
    setor: 'Tecnologia/E-commerce',
    descricao: 'A Alibaba é uma corporação multinacional chinesa especializada em e-commerce, varejo, internet e tecnologia.',
    avatar: 'https://logo.clearbit.com/alibaba.com',
    dataEntrada: '08/10/2021',
    precoIniciou: 'US$ 180,00',
    precoTeto: 'US$ 250,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.400',
    percentualCarteira: '2.7%',
    pais: 'China',
    moeda: 'USD',
    bolsa: 'NYSE (ADR)'
  },

  // ========================================
  // ETFs INTERNACIONAIS
  // ========================================
  'VTI': {
    ticker: 'VTI',
    nomeCompleto: 'Vanguard Total Stock Market ETF',
    setor: 'ETF',
    descricao: 'ETF que busca acompanhar o desempenho do CRSP US Total Market Index, proporcionando exposição a todo o mercado de ações dos EUA.',
    avatar: 'https://logo.clearbit.com/vanguard.com',
    dataEntrada: '10/02/2022',
    precoIniciou: 'US$ 240,00',
    precoTeto: 'US$ 280,00',
    viesAtual: 'Compra',
    sp500Epoca: '4.200',
    percentualCarteira: '8.5%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE Arca'
  },

  'SPY': {
    ticker: 'SPY',
    nomeCompleto: 'SPDR S&P 500 ETF Trust',
    setor: 'ETF',
    descricao: 'ETF que busca proporcionar resultados de investimento que correspondam ao desempenho do índice S&P 500.',
    avatar: 'https://logo.clearbit.com/spdrs.com',
    dataEntrada: '05/01/2022',
    precoIniciou: 'US$ 460,00',
    precoTeto: 'US$ 520,00',
    viesAtual: 'Aguardar',
    sp500Epoca: '4.100',
    percentualCarteira: '7.2%',
    pais: 'Estados Unidos',
    moeda: 'USD',
    bolsa: 'NYSE Arca'
  }
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
function calcularViesSimplificado(precoTeto: string, precoAtual: number): string {
  try {
    // Detectar moeda e converter adequadamente
    let precoTetoNum: number;
    
    if (precoTeto.includes('US$')) {
      precoTetoNum = parseFloat(precoTeto.replace('US$ ', '').replace(',', ''));
    } else if (precoTeto.includes('€')) {
      precoTetoNum = parseFloat(precoTeto.replace('€ ', '').replace(',', ''));
    } else if (precoTeto.includes('CHF')) {
      precoTetoNum = parseFloat(precoTeto.replace('CHF ', '').replace(',', ''));
    } else {
      precoTetoNum = parseFloat(precoTeto.replace(/[^\d.,]/g, '').replace(',', '.'));
    }
    
    if (isNaN(precoTetoNum) || precoAtual <= 0) {
      return 'Aguardar';
    }
    
    return precoAtual < precoTetoNum ? 'Compra' : 'Aguardar';
  } catch {
    return 'Aguardar';
  }
}

function formatarValor(valor: number | undefined, tipo: 'currency' | 'percent' | 'number' | 'millions' = 'currency', moeda: string = 'USD'): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
  
  switch (tipo) {
    case 'currency':
      if (moeda === 'USD') {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(valor);
      } else if (moeda === 'EUR') {
        return new Intl.NumberFormat('de-DE', { 
          style: 'currency', 
          currency: 'EUR',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(valor);
      } else if (moeda === 'CHF') {
        return new Intl.NumberFormat('de-CH', { 
          style: 'currency', 
          currency: 'CHF',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(valor);
      } else {
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(valor);
      }
    
    case 'percent':
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1000000000) {
        return `$${(valor / 1000000000).toFixed(1)} B`;
      } else if (valor >= 1000000) {
        return `$${(valor / 1000000).toFixed(1)} M`;
      } else {
        return formatarValor(valor, 'currency', moeda);
      }
    
    case 'number':
      return valor.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    
    default:
      return valor.toString();
  }
}

const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

const logMobile = (message: string, data?: any) => {
  console.log(`📱 [MOBILE] ${message}`, data || '');
};

// ========================================
// HOOK PARA CALCULAR DIVIDEND YIELD - VERSÃO INTERNACIONAL
// ========================================
function useDividendYieldExterior(ticker: string, dataEntrada: string, precoAtual?: number, precoIniciou?: string) {
  const [dyData, setDyData] = useState({
    dy12Meses: 0,
    dyDesdeEntrada: 0
  });

  const parsePreco = useCallback((precoStr: string): number => {
    try {
      // Remover símbolos de moeda e converter
      return parseFloat(precoStr.replace(/[^\d.,]/g, '').replace(',', '.'));
    } catch {
      return 0;
    }
  }, []);

  const calcularDY = useCallback(() => {
    if (!ticker || !precoAtual || precoAtual <= 0 || !precoIniciou || !dataEntrada) {
      setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
      return;
    }

    try {
      // Buscar dados de dividendos para ativos internacionais
      const dadosSalvos = localStorage.getItem(`dividendos_exterior_${ticker}`) || 
                         localStorage.getItem(`dividends_${ticker}`);
      
      if (!dadosSalvos) {
        console.log(`❌ Nenhum dado de dividendos encontrado para ${ticker}`);
        setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
        return;
      }

      const dividendos = JSON.parse(dadosSalvos).map((item: any) => ({
        ...item,
        dataObj: new Date(item.exDate || item.date || item.dataObj)
      }));

      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999);

      const dataEntradaObj = new Date(dataEntrada.split('/').reverse().join('-'));
      const data12MesesAtras = new Date(hoje);
      data12MesesAtras.setFullYear(data12MesesAtras.getFullYear() - 1);
      data12MesesAtras.setHours(0, 0, 0, 0);

      const dividendos12Meses = dividendos.filter((dividend: any) => {
        if (!dividend.dataObj || isNaN(dividend.dataObj.getTime())) {
          return false;
        }
        return dividend.dataObj >= data12MesesAtras && dividend.dataObj <= hoje;
      });

      const dividendosDesdeEntrada = dividendos.filter((dividend: any) => 
        dividend.dataObj && 
        !isNaN(dividend.dataObj.getTime()) &&
        dividend.dataObj >= dataEntradaObj && 
        dividend.dataObj <= hoje
      );

      const totalDividendos12Meses = dividendos12Meses.reduce((sum: number, d: any) => sum + (d.amount || d.valor || 0), 0);
      const totalDividendosDesdeEntrada = dividendosDesdeEntrada.reduce((sum: number, d: any) => sum + (d.amount || d.valor || 0), 0);

      const dy12Meses = precoAtual > 0 ? (totalDividendos12Meses / precoAtual) * 100 : 0;
      const precoEntrada = parsePreco(precoIniciou);
      const dyDesdeEntrada = precoEntrada > 0 ? (totalDividendosDesdeEntrada / precoEntrada) * 100 : 0;

      setDyData({
        dy12Meses: isNaN(dy12Meses) ? 0 : dy12Meses,
        dyDesdeEntrada: isNaN(dyDesdeEntrada) ? 0 : dyDesdeEntrada
      });

    } catch (error) {
      console.error('Erro ao calcular DY:', error);
      setDyData({ dy12Meses: 0, dyDesdeEntrada: 0 });
    }
  }, [ticker, precoAtual, precoIniciou, dataEntrada, parsePreco]);

  useEffect(() => {
    calcularDY();
  }, [calcularDY]);

  return dyData;
}

// ========================================
// HOOK PERSONALIZADO - DADOS FINANCEIROS INTERNACIONAIS
// ========================================
function useDadosFinanceirosExterior(ticker: string, moeda: string = 'USD') {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceirosExterior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  const buscarDados = React.useCallback(async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);
      logMobile(`🔍 Iniciando busca internacional: ${ticker}`);

      // Cache check
      try {
        const cachedData = localStorage.getItem(`cache_exterior_${ticker}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          if (parsed.timestamp && (Date.now() - parsed.timestamp) < 6 * 60 * 60 * 1000) {
            setDadosFinanceiros(parsed.data);
            setUltimaAtualizacao('Cache: ' + new Date(parsed.timestamp).toLocaleString('pt-BR'));
            logMobile(`📦 Cache válido encontrado para ${ticker}`);
            setLoading(false);
            return;
          }
        }
      } catch (cacheError) {
        logMobile(`⚠️ Erro no cache: ${cacheError.message}`);
      }

      // API call para dados internacionais
      const isGoodConnection = !isMobile() || 
        (navigator.connection && ['wifi', '4g'].includes(navigator.connection.effectiveType)) ||
        !navigator.connection;
      
      if (navigator.onLine && isGoodConnection) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            logMobile(`⏱️ Timeout de API internacional`);
          }, isMobile() ? 3000 : 10000);

          // Você pode usar Alpha Vantage, Yahoo Finance, ou outra API internacional
          // Exemplo com Yahoo Finance (não oficial)
          const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`;
          logMobile(`🌐 Tentando API internacional: ${ticker}`);
          
          const response = await fetch(quoteUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': isMobile() ? 'Portfolio-Mobile/1.0' : 'Portfolio-Desktop/1.0',
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            logMobile(`✅ API internacional funcionou para ${ticker}`);

                          if (data.chart && data.chart.result && data.chart.result.length > 0) {
              const result = data.chart.result[0];
              const meta = result.meta;
              const quote = result.indicators?.quote?.[0];
              
              const dadosProcessados: DadosFinanceirosExterior = {
                precoAtual: meta.regularMarketPrice || meta.previousClose || 0,
                variacao: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
                variacaoPercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
                volume: quote?.volume?.[quote.volume.length - 1] || 0,
                marketCap: meta.marketCap,
                pe: meta.trailingPE,
                dividendYield: meta.trailingAnnualDividendYield * 100 || 0,
                moeda: meta.currency || moeda,
                precoEmUSD: meta.currency === 'USD' ? meta.regularMarketPrice : meta.regularMarketPrice * (meta.exchangeRate || 1),
                cotacaoUSD: meta.exchangeRate
              };

              setDadosFinanceiros(dadosProcessados);
              setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
              
              // Salvar no cache
              try {
                localStorage.setItem(`cache_exterior_${ticker}`, JSON.stringify({
                  data: dadosProcessados,
                  timestamp: Date.now()
                }));
                logMobile(`💾 Dados salvos no cache`);
              } catch (storageError) {
                logMobile(`⚠️ Erro ao salvar cache: ${storageError.message}`);
              }
              
              setLoading(false);
              return;
            }
          } else {
            logMobile(`❌ API retornou erro: ${response.status}`);
          }
        } catch (apiError) {
          logMobile(`❌ Falha na API: ${apiError.message}`);
        }
      } else {
        logMobile(`📶 Conexão ruim ou offline, pulando API`);
      }

      // Dados estáticos baseados no ticker
      logMobile(`🔄 Usando dados estáticos para ${ticker}`);
      
      const dadosEstaticos: DadosFinanceirosExterior = {
        precoAtual: ticker === 'AAPL' ? 189.50 : 
                   ticker === 'MSFT' ? 365.20 :
                   ticker === 'GOOGL' ? 2850.00 : 
                   ticker === 'TSLA' ? 950.00 : 125.75,
        variacao: 2.50,
        variacaoPercent: 1.35,
        volume: 50000000,
        marketCap: 2800000000000,
        pe: 28.5,
        dividendYield: 2.1,
        moeda: moeda,
        precoEmUSD: moeda === 'USD' ? (ticker === 'AAPL' ? 189.50 : 125.75) : 140.25,
        cotacaoUSD: moeda === 'USD' ? 1 : 1.12
      };
      
      setDadosFinanceiros(dadosEstaticos);
      setUltimaAtualizacao('Dados estáticos - ' + new Date().toLocaleString('pt-BR'));
      logMobile(`📊 Dados estáticos aplicados`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logMobile(`💥 Erro geral: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticker, moeda]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

// ========================================
// COMPONENTE DE MÉTRICA
// ========================================
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  showInfo = false
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  showInfo?: boolean;
}) => (
  <Card sx={{ 
    borderRadius: 3,
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-4px)', 
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
    },
    height: '100%'
  }}>
    <Box sx={{ 
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      py: 2,
      px: 2.5,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ 
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#64748b'
        }}>
          {title}
        </Typography>
        {showInfo && (
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#64748b',
            backgroundColor: 'white'
          }}>
            ?
          </Box>
        )}
      </Stack>
    </Box>

    <CardContent sx={{ 
      backgroundColor: 'white',
      p: 3,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      '&:last-child': { pb: 3 }
    }}>
      {loading ? (
        <Skeleton variant="text" height={50} />
      ) : (
        <>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            fontSize: '2rem',
            color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#1e293b',
            lineHeight: 1,
            letterSpacing: '-0.5px'
          }}>
            {value}
          </Typography>
          
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              fontSize: '0.75rem',
              display: 'block',
              mt: 1,
              lineHeight: 1.3,
              fontWeight: 500
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
));

// ========================================
// COMPONENTE HISTÓRICO DE DIVIDENDOS INTERNACIONAIS
// ========================================
const HistoricoDividendosExterior = React.memo(({ ticker, dataEntrada }: { ticker: string; dataEntrada: string }) => {
  const [dividendos, setDividendos] = useState<any[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    if (ticker && typeof window !== 'undefined') {
      const dadosSalvos = localStorage.getItem(`dividendos_exterior_${ticker}`) || 
                         localStorage.getItem(`dividends_${ticker}`);
      
      if (dadosSalvos) {
        try {
          const dividendosSalvos = JSON.parse(dadosSalvos);
          const dividendosLimitados = dividendosSalvos.slice(0, 500).map((item: any) => ({
            ...item,
            dataObj: new Date(item.exDate || item.date || item.dataObj)
          }));
          
          const dividendosValidos = dividendosLimitados.filter((item: any) => 
            item.dataObj && !isNaN(item.dataObj.getTime()) && item.amount && item.amount > 0
          );
          
          dividendosValidos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
          setDividendos(dividendosValidos);
          
        } catch (err) {
          console.error('Erro ao carregar dividendos salvos:', err);
          setDividendos([]);
        }
      } else {
        setDividendos([]);
      }
    }
  }, [ticker]);

  const { totalDividendos, mediaDividendo, ultimoDividendo } = useMemo(() => {
    const total = dividendos.reduce((sum, item) => sum + (item.amount || 0), 0);
    const media = dividendos.length > 0 ? total / dividendos.length : 0;
    const ultimo = dividendos.length > 0 ? dividendos[0] : null;

    return {
      totalDividendos: total,
      mediaDividendo: media,
      ultimoDividendo: ultimo
    };
  }, [dividendos]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💰 Histórico de Dividendos
          </Typography>
        </Stack>

        {dividendos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              ❌ Nenhum dividendo carregado para {ticker}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              📅 Data de entrada: {dataEntrada}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                    {dividendos.length}
                  </Typography>
                  <Typography variant="caption">Pagamentos</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
                    ${totalDividendos.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fefce8', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#eab308' }}>
                    ${mediaDividendo.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">Média</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fdf4ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7' }}>
                    {ultimoDividendo ? 
                      ultimoDividendo.dataObj.toLocaleDateString('en-US').replace(/\/\d{4}/, '') : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Último</Typography>
                </Box>
              </Grid>
            </Grid>
            
            {dividendos.length > 10 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setMostrarTodos(!mostrarTodos)}
                  sx={{
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      borderColor: '#cbd5e1'
                    }
                  }}
                >
                  {mostrarTodos 
                    ? `📋 Mostrar apenas 10 recentes` 
                    : `📋 Mostrar todos os ${dividendos.length} dividendos`
                  }
                </Button>
              </Box>
            )}

            <TableContainer sx={{ 
              backgroundColor: 'white', 
              borderRadius: 1,
              maxHeight: mostrarTodos ? '400px' : 'auto',
              overflowY: mostrarTodos ? 'auto' : 'visible'
            }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Ativo</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Ex-Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Pay Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tipo</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Yield</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                 {(mostrarTodos ? dividendos : dividendos.slice(0, 10)).map((dividend, index) => (
                    <TableRow key={`${dividend.exDate || dividend.date}-${index}`}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {ticker}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        ${(dividend.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 500 }}>
                        {dividend.dataObj?.toLocaleDateString('en-US') || 'N/A'}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 500 }}>
                        {dividend.payDate ? new Date(dividend.payDate).toLocaleDateString('en-US') : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={dividend.type || 'Dividend'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        {dividend.yield ? `${(dividend.yield * 100).toFixed(2)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {dividendos.length > 10 && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {mostrarTodos 
                  ? `Mostrando todos os ${dividendos.length} dividendos com rolagem`
                  : `Mostrando os 10 mais recentes • Total: ${dividendos.length}`
                }
              </Typography>
            </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE GERENCIADOR DE RELATÓRIOS INTERNACIONAIS
// ========================================
const GerenciadorRelatoriosExterior = React.memo(({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);

  useEffect(() => {
    carregarRelatoriosCentralizados();
  }, [ticker]);

  const carregarRelatoriosCentralizados = useCallback(() => {
    try {
      const dadosCentralizados = localStorage.getItem('relatorios_exterior_central');
      
      if (dadosCentralizados) {
        const dados = JSON.parse(dadosCentralizados);
        const relatoriosTicker = dados[ticker] || [];
        
        const relatoriosFormatados = relatoriosTicker.map((rel: any) => ({
          ...rel,
          arquivo: rel.arquivoPdf ? 'PDF_CENTRALIZADO' : undefined,
          tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
        }));
        
        setRelatorios(relatoriosFormatados);
      } else {
        setRelatorios([]);
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      setRelatorios([]);
    }
  }, [ticker]);

  const baixarPdf = useCallback((relatorio: Relatorio) => {
    if (!relatorio.arquivoPdf) {
      alert('❌ Arquivo PDF não encontrado!');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = relatorio.arquivoPdf;
      link.download = relatorio.nomeArquivoPdf || `${relatorio.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      alert('❌ Erro ao baixar o arquivo. Tente novamente.');
    }
  }, []);

  const getIconePorTipo = useCallback((tipo: string) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  }, []);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📋 Relatórios da Empresa
          </Typography>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum relatório cadastrado para {ticker}
            </Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} sx={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: 2, 
                mb: 1,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f8fafc' }
              }}>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{getIconePorTipo(relatorio.tipoVisualizacao)}</span>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {relatorio.nome}
                      </Typography>
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {relatorio.tipo} • {relatorio.dataReferencia}
                      </Typography>
                      {relatorio.tamanhoArquivo && (
                        <Typography variant="caption" color="text.secondary">
                          📊 {(relatorio.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      )}
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setRelatorioSelecionado(relatorio);
                        setDialogVisualizacao(true);
                        setLoadingIframe(true);
                        setTimeoutError(false);
                      }}
                      sx={{ 
                        backgroundColor: '#e3f2fd', 
                        '&:hover': { backgroundColor: '#bbdefb' }
                      }}
                      title="Visualizar conteúdo"
                    >
                      <ViewIcon />
                    </IconButton>
                    
                    {relatorio.arquivoPdf && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => baixarPdf(relatorio)}
                        startIcon={<DownloadIconCustom />}
                        sx={{ minWidth: 'auto', px: 2 }}
                        title="Baixar PDF"
                      >
                        PDF
                      </Button>
                    )}
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog de visualização */}
        <Dialog 
          open={dialogVisualizacao} 
          onClose={() => {
            setDialogVisualizacao(false);
            setLoadingIframe(false);
            setTimeoutError(false);
            setRelatorioSelecionado(null);
          }} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{ 
            sx: { 
              height: '95vh',
              backgroundColor: '#f8fafc'
            } 
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getIconePorTipo(relatorioSelecionado?.tipoVisualizacao || '')} 
                {relatorioSelecionado?.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {relatorioSelecionado?.tipo} • {relatorioSelecionado?.dataReferencia}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              {relatorioSelecionado && (
                <IconButton 
                  onClick={() => {
                    const src = relatorioSelecionado.tipoVisualizacao === 'canva' 
                      ? relatorioSelecionado.linkCanva 
                      : relatorioSelecionado.linkExterno;
                    if (src) window.open(src, '_blank');
                  }}
                  title="Abrir em nova aba"
                >
                  🔗
                </IconButton>
              )}
              <IconButton 
                onClick={() => {
                  setDialogVisualizacao(false);
                  setLoadingIframe(false);
                  setTimeoutError(false);
                  setRelatorioSelecionado(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0, height: '100%', backgroundColor: '#f8fafc' }}>
            {relatorioSelecionado && (
              <Box sx={{ position: 'relative', height: '80vh' }}>
                {loadingIframe && !timeoutError && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    textAlign: 'center'
                  }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Carregando conteúdo...
                    </Typography>
                  </Box>
                )}

                {timeoutError && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                    textAlign: 'center',
                    maxWidth: 400,
                    p: 3
                  }}>
                    <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                      ⚠️ Erro ao Carregar
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                      O conteúdo não pôde ser carregado.
                    </Typography>
                    
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button 
                        variant="outlined"
                        onClick={() => {
                          setTimeoutError(false);
                          setLoadingIframe(true);
                        }}
                        size="small"
                      >
                        🔄 Tentar Novamente
                      </Button>
                      <Button 
                        variant="contained"
                        onClick={() => {
                          const src = relatorioSelecionado.tipoVisualizacao === 'canva' 
                            ? relatorioSelecionado.linkCanva 
                            : relatorioSelecionado.linkExterno;
                          if (src) window.open(src, '_blank');
                        }}
                        size="small"
                      >
                        🔗 Abrir em Nova Aba
                      </Button>
                    </Stack>
                  </Box>
                )}

                <iframe
                  src={(() => {
                    const relatorio = relatorioSelecionado;
                    
                    let url = '';
                    if (relatorio.tipoVisualizacao === 'canva') {
                      url = relatorio.linkCanva || '';
                    } else {
                      url = relatorio.linkExterno || '';
                    }
                    
                    if (!url) return '';
                    
                    if (url.includes('canva.com')) {
                      if (url.includes('?embed')) return url;
                      if (url.includes('/view')) return url + '?embed';
                      if (url.includes('/design/')) return url.replace(/\/(edit|preview).*$/, '/view?embed');
                    }
                    
                    return url;
                  })()}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    border: 'none', 
                    borderRadius: '8px',
                    opacity: timeoutError ? 0.3 : 1
                  }}
                  allowFullScreen
                  onLoad={() => {
                    setLoadingIframe(false);
                    setTimeoutError(false);
                  }}
                  onError={() => {
                    setLoadingIframe(false);
                    setTimeoutError(true);
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE AGENDA CORPORATIVA INTERNACIONAL
// ========================================
const AgendaCorporativaExterior = React.memo(({ ticker }: { ticker: string }) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const calcularDiasAteEvento = useCallback((dataEvento: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento);
    evento.setHours(0, 0, 0, 0);
    
    const diffTime = evento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, []);

  const formatarProximidade = useCallback((dias: number) => {
    if (dias < 0) return 'Passed';
    if (dias === 0) return 'Today';
    if (dias === 1) return 'Tomorrow';
    if (dias <= 7) return `In ${dias} days`;
    if (dias <= 30) return `In ${Math.ceil(dias / 7)} weeks`;
    return `In ${Math.ceil(dias / 30)} months`;
  }, []);

  const carregarEventos = useCallback(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const agendaCorporativaCentral = localStorage.getItem('agenda_corporativa_exterior_central');
      
      if (!agendaCorporativaCentral) {
        setEventos([]);
        setLoading(false);
        return;
      }

      let dadosAgenda;
      try {
        dadosAgenda = JSON.parse(agendaCorporativaCentral);
      } catch (parseError) {
        setEventos([]);
        setLoading(false);
        return;
      }

      const eventosTicker = Array.isArray(dadosAgenda) 
        ? dadosAgenda.filter((evento: any) => evento.ticker === ticker)
        : [];

      if (eventosTicker.length === 0) {
        setEventos([]);
        setLoading(false);
        return;
      }

      const eventosProcessados = eventosTicker.map((evento: any, index: number) => {
        try {
          let dataEvento: Date;
          
          if (evento.date || evento.data_evento) {
            dataEvento = new Date(evento.date || evento.data_evento);
          } else {
            throw new Error('Campo date não encontrado');
          }

          if (isNaN(dataEvento.getTime())) {
            throw new Error(`Data inválida: ${evento.date || evento.data_evento}`);
          }

          return {
            id: evento.id || `${ticker}-${index}`,
            ticker: evento.ticker,
            tipo: evento.type || evento.tipo_evento || evento.tipo,
            titulo: evento.title || evento.titulo,
            descricao: evento.description || evento.descricao,
            data: evento.date || evento.data_evento,
            dataObj: dataEvento,
            status: evento.status,
            prioridade: evento.priority || evento.prioridade,
            categoria: evento.type || evento.tipo_evento || evento.tipo,
            estimado: evento.status?.toLowerCase() === 'estimated',
            observacoes: evento.notes || evento.observacoes
          };
        } catch (error) {
          return null;
        }
      }).filter(Boolean);

      eventosProcessados.sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());
      setEventos(eventosProcessados);
      
    } catch (error) {
      console.error(`❌ [DEBUG] Erro ao carregar eventos:`, error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
          📅 Corporate Calendar
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading events...
            </Typography>
          </Box>
        ) : eventos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              📭 No events found for {ticker}
            </Typography>
            <Typography variant="body2">
              ℹ️ No events registered for this ticker
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {eventos.slice(0, 4).map((evento, index) => {
              const diasAteEvento = calcularDiasAteEvento(evento.dataObj);
              const proximidade = formatarProximidade(diasAteEvento);
              
              return (
                <Card key={evento.id} sx={{ 
                  border: '1px solid #e2e8f0', 
                  borderRadius: 2,
                  backgroundColor: 'white',
                  cursor: 'default'
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 600,
                              fontSize: '1rem',
                              mb: 0.5,
                              color: '#1e293b'
                            }}>
                              {evento.titulo}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ 
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                              mb: 1.5
                            }}>
                              {evento.descricao}
                            </Typography>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip 
                                label={proximidade}
                                size="small"
                                sx={{ 
                                  backgroundColor: diasAteEvento <= 7 ? '#f59e0b' : '#6b7280',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  height: 24
                                }}
                              />
                              
                              <Chip 
                                label={evento.tipo}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.75rem',
                                  borderColor: '#d1d5db',
                                  color: '#6b7280',
                                  height: 24
                                }}
                              />
                            </Stack>
                          </Box>

                          <Box sx={{ 
                            textAlign: 'right',
                            minWidth: 120,
                            flexShrink: 0
                          }}>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700,
                              color: diasAteEvento <= 7 ? '#f59e0b' : '#3b82f6',
                              fontSize: '1.2rem',
                              lineHeight: 1
                            }}>
                              {evento.dataObj.getDate()}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 600,
                              color: '#64748b',
                              fontSize: '0.85rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              {evento.dataObj.toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ 
                              fontSize: '0.7rem',
                              display: 'block',
                              mt: 0.5
                            }}>
                              {evento.dataObj.toLocaleDateString('en-US', {
                                weekday: 'long'
                              })}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}

            {eventos.length > 4 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Showing next 4 events • Total: {eventos.length}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE DADOS DA POSIÇÃO EXPANDIDOS
// ========================================
const DadosPosicaoExpandidosExterior = React.memo(({ 
  empresa, 
  dadosFinanceiros, 
  precoAtualFormatado
}: { 
  empresa: EmpresaExterior; 
  dadosFinanceiros?: DadosFinanceirosExterior;
  precoAtualFormatado: string;
}) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📊 Dados da Posição
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: dadosFinanceiros?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: dadosFinanceiros?.precoAtual ? '#22c55e' : 'inherit' }}>
                  {precoAtualFormatado}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">% da Carteira</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.percentualCarteira}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">País/Bolsa</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.pais} ({empresa.bolsa})</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              🎯 Análise de Viés
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Preço Teto</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoTeto}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Viés Atual</Typography>
                <Chip 
                  label={empresa.viesAtual}
                  size="small"
                  color={empresa.viesAtual === 'Compra' ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">Moeda</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.moeda}</Typography>
              </Box>
              {dadosFinanceiros?.cotacaoUSD && dadosFinanceiros.moeda !== 'USD' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Cotação USD</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dadosFinanceiros.cotacaoUSD.toFixed(4)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Card adicional com métricas financeiras */}
      <Grid item xs={12}>
        <Card sx={{ backgroundColor: '#f0f9ff' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e40af', mb: 3 }}>
              📈 Métricas Financeiras
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {dadosFinanceiros?.marketCap ? formatarValor(dadosFinanceiros.marketCap, 'millions') : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Market Cap</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {dadosFinanceiros?.pe ? dadosFinanceiros.pe.toFixed(2) : 'N/A'}
                  </Typography>
                  <Typography variant="caption">P/E Ratio</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {dadosFinanceiros?.dividendYield ? `${dadosFinanceiros.dividendYield.toFixed(2)}%` : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Dividend Yield</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {dadosFinanceiros?.volume ? (dadosFinanceiros.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Volume</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e2e8f0' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                    {dadosFinanceiros?.precoEmUSD ? `${dadosFinanceiros.precoEmUSD.toFixed(2)}` : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Preço em USD</Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>💡 Sobre os dados:</strong><br/>
                • 🟢 <strong>Dados da API:</strong> Preço, variação, volume, market cap, P/E, dividend yield<br/>
                • 🌍 <strong>Moeda base:</strong> {empresa.moeda} • <strong>Bolsa:</strong> {empresa.bolsa}<br/>
                • 🔄 <strong>Atualização:</strong> {dadosFinanceiros ? 'Dados da API' : 'Dados estáticos'}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
});

// ========================================
// COMPONENTE PRINCIPAL - DETALHES DA EMPRESA EXTERIOR
// ========================================
export default function EmpresaExteriorDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker as string) || '';
  
  const [empresa, setEmpresa] = useState<EmpresaExterior | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceirosExterior(ticker, empresa?.moeda);

  const { dy12Meses, dyDesdeEntrada } = useDividendYieldExterior(
    ticker, 
    empresa?.dataEntrada || '', 
    dadosFinanceiros?.precoAtual, 
    empresa?.precoIniciou || ''
  );

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        if (typeof window !== 'undefined') {
          const dadosAdmin = localStorage.getItem('portfolioDataExteriorAdmin');
          
          if (dadosAdmin) {
            const ativos = JSON.parse(dadosAdmin);
            const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
            
            if (ativoEncontrado) {
              setEmpresa(ativoEncontrado);
              setDataSource('admin');
              return;
            }
          }
        }

        const ativoFallback = dadosFallbackExterior[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;
    
    let empresaAtualizada = { ...empresa };
    
    if (dadosFinanceiros && dadosFinanceiros.precoAtual > 0) {
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesSimplificado(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    } else {
      empresaAtualizada.statusApi = 'error';
    }
    
    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  const calcularPerformance = useCallback(() => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    try {
      const precoEntradaStr = empresaCompleta.precoIniciou.replace(/[^\d.,]/g, '').replace(',', '.');
      const precoEntrada = parseFloat(precoEntradaStr);
      const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
      
      if (precoEntrada > 0 && precoAtual > 0) {
        const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
        return formatarValor(performance, 'percent');
      }
    } catch (error) {
      console.error('Erro ao calcular performance:', error);
    }
    
    return 'N/A';
  }, [empresaCompleta]);

  if (!empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Asset not found
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          The ticker "<strong>{ticker}</strong>" was not found in our international database.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
        >
          Back to List
        </Button>
      </Box>
    );
  }

  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual, 'currency', empresaCompleta.moeda) : empresaCompleta.precoIniciou;
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()} 
          variant="outlined"
        >
          Back
        </Button>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {dadosLoading ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Loading...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              API Error
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              Live API Data
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Static Data
            </Alert>
          )}
          
          <IconButton onClick={refetch} disabled={dadosLoading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' 
      }}>
        <CardContent sx={{ p: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresaCompleta.avatar} 
              alt={empresaCompleta.ticker} 
              sx={{ 
                width: { xs: 100, md: 120 }, 
                height: { xs: 100, md: 120 },
                backgroundColor: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#374151'
              }}
            >
              {empresaCompleta.ticker.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-start' }} 
                sx={{ mb: 1 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {empresaCompleta.ticker}
                </Typography>
                <Chip 
                  label={`${empresaCompleta.pais} • ${empresaCompleta.bolsa}`} 
                  color="primary" 
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ maxWidth: 600 }}>
                {empresaCompleta.descricao}
              </Typography>
              <Typography variant="body2" sx={{ 
                mt: 2, 
                color: '#1976d2',
                fontWeight: 500 
              }}>
                🌍 {empresaCompleta.pais} • 💱 {empresaCompleta.moeda} • 📈 {empresaCompleta.bolsa}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {precoAtualFormatado}
                  </Typography>
                  {tendencia && (
                    <Typography sx={{ 
                      color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                      fontWeight: 700, 
                      fontSize: '1.2rem'
                    }}>
                      {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="PRICE" 
            value={precoAtualFormatado}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="TODAY'S CHANGE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="PERFORMANCE" 
            value={calcularPerformance()}
            subtitle="since entry"
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/E RATIO" 
            value={dados?.pe ? formatarValor(dados.pe, 'number') : 'N/A'}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DIV YIELD 12M" 
            value={dy12Meses > 0 ? `${dy12Meses.toFixed(2)}%` : dados?.dividendYield ? `${dados.dividendYield.toFixed(2)}%` : 'N/A'}
            subtitle="last 12 months"
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DIV SINCE ENTRY" 
            value={dyDesdeEntrada > 0 ? `${dyDesdeEntrada.toFixed(2)}%` : 'N/A'}
            subtitle="since entry"
            loading={dadosLoading}
          />
        </Grid>
      </Grid>

      {/* Alert para problemas com dados */}
      {(dy12Meses === 0 && dyDesdeEntrada === 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ Dividend data not found for {ticker}</strong><br/>
            • Check if dividend data has been imported correctly<br/>
            • International assets may require different data sources<br/>
            • Use the debug tools to diagnose the issue
          </Typography>
        </Alert>
      )}

      {/* Histórico de Dividendos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <HistoricoDividendosExterior ticker={ticker} dataEntrada={empresaCompleta.dataEntrada} />
        </Grid>
      </Grid>

      {/* Seções secundárias */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <GerenciadorRelatoriosExterior ticker={ticker} />
        </Grid>
        
        <Grid item xs={12}>
          <AgendaCorporativaExterior ticker={ticker} />
        </Grid>
      </Grid>

      {/* Dados da Posição Expandidos */}
      <DadosPosicaoExpandidosExterior 
        empresa={empresaCompleta} 
        dadosFinanceiros={dados}
        precoAtualFormatado={precoAtualFormatado}
      />
    </Box>
  );
}
