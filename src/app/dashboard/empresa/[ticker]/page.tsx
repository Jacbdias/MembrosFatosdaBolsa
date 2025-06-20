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
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

// ========================================
// INTERFACES E TIPOS
// ========================================
interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
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
}

// ========================================
// DADOS DE FALLBACK
// ========================================
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  // ========================================
  // AGRICULTURA (2 ativos)
  // ========================================
  'KEPL3': {
    ticker: 'KEPL3',
    nomeCompleto: 'Kepler Weber S.A.',
    setor: 'Agricultura',
    descricao: 'A Kepler Weber é uma empresa brasileira especializada em soluções para armazenagem e movimentação de grãos, líquidos e gases.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
    dataEntrada: '21/03/2021',
    precoIniciou: 'R$ 7,30',
    precoTeto: 'R$ 12,50',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '115.000',
    percentualCarteira: '2.1%'
  },
  
  'AGRO3': {
    ticker: 'AGRO3',
    nomeCompleto: 'BrasilAgro S.A.',
    setor: 'Agricultura',
    descricao: 'A BrasilAgro é uma empresa do agronegócio com foco na produção de commodities agrícolas como soja, milho, algodão e açúcar.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AGRO.png',
    dataEntrada: '15/08/2021',
    precoIniciou: 'R$ 24,80',
    precoTeto: 'R$ 35,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '125.000',
    percentualCarteira: '3.2%'
  },

  // ========================================
  // AUTOMOTIVO (1 ativo)
  // ========================================
  'LEVE3': {
    ticker: 'LEVE3',
    nomeCompleto: 'Metal Leve S.A.',
    setor: 'Automotivo',
    descricao: 'A Metal Leve é uma empresa brasileira líder na fabricação de autopeças, principalmente para motores e sistemas de transmissão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LEVE.png',
    dataEntrada: '10/09/2021',
    precoIniciou: 'R$ 18,75',
    precoTeto: 'R$ 28,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '118.500',
    percentualCarteira: '2.8%'
  },

  // ========================================
  // BANCOS (4 ativos)
  // ========================================
  'BBAS3': {
    ticker: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    setor: 'Bancos',
    descricao: 'O Banco do Brasil é um dos maiores bancos do país, oferecendo serviços bancários completos para pessoas físicas, jurídicas e governo.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
    dataEntrada: '12/04/2020',
    precoIniciou: 'R$ 28,50',
    precoTeto: 'R$ 45,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '85.000',
    percentualCarteira: '5.5%'
  },

  'BRSR6': {
    ticker: 'BRSR6',
    nomeCompleto: 'Banrisul S.A.',
    setor: 'Bancos',
    descricao: 'O Banrisul é um banco brasileiro com forte presença no Rio Grande do Sul, oferecendo serviços bancários tradicionais e digitais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BRSR.png',
    dataEntrada: '08/06/2020',
    precoIniciou: 'R$ 4,85',
    precoTeto: 'R$ 8,50',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '95.000',
    percentualCarteira: '2.3%'
  },

  'ABCB4': {
    ticker: 'ABCB4',
    nomeCompleto: 'Banco ABC Brasil S.A.',
    setor: 'Bancos',
    descricao: 'O Banco ABC Brasil é uma instituição financeira focada em corporate banking e financiamento de projetos de infraestrutura.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ABCB.png',
    dataEntrada: '25/11/2020',
    precoIniciou: 'R$ 11,20',
    precoTeto: 'R$ 18,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '110.000',
    percentualCarteira: '1.8%'
  },

  'SANB11': {
    ticker: 'SANB11',
    nomeCompleto: 'Banco Santander Brasil S.A.',
    setor: 'Bancos',
    descricao: 'O Santander Brasil é um dos principais bancos do país, oferecendo serviços bancários completos com foco em inovação digital.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SANB.png',
    dataEntrada: '14/07/2020',
    precoIniciou: 'R$ 25,80',
    precoTeto: 'R$ 42,00',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '102.000',
    percentualCarteira: '4.7%'
  },

  // Continue com todos os outros dados...
  // Por brevidade, incluindo apenas alguns exemplos
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  try {
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
  } catch {
    return 'Aguardar';
  }
}

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
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1000000000) {
        return `R$ ${(valor / 1000000000).toFixed(1).replace('.', ',')} bi`;
      } else if (valor >= 1000000) {
        return `R$ ${(valor / 1000000).toFixed(1).replace('.', ',')} mi`;
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

// ========================================
// COMPONENTE PRINCIPAL - DETALHES DA EMPRESA
// ========================================
export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker as string) || '';
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  
  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        if (typeof window !== 'undefined') {
          const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
          
          if (dadosAdmin) {
            const ativos = JSON.parse(dadosAdmin);
            const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
            
            if (ativoEncontrado) {
              setEmpresa(ativoEncontrado);
              return;
            }
          }
        }

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          return;
        }

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };

    carregarDados();
  }, [ticker]);

  if (!empresa) {
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
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
        >
          Voltar à Lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()} 
          variant="outlined"
        >
          Voltar
        </Button>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresa.avatar} 
              alt={empresa.ticker} 
              sx={{ 
                width: { xs: 100, md: 120 }, 
                height: { xs: 100, md: 120 },
                backgroundColor: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#374151'
              }}
            >
              {empresa.ticker.charAt(0)}
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
                  {empresa.ticker}
                </Typography>
                {empresa.tipo === 'FII' && (
                  <Chip label="FII" color="primary" />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {empresa.nomeCompleto}
              </Typography>
              <Chip 
                label={empresa.setor} 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ maxWidth: 600 }}>
                {empresa.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {empresa.precoIniciou}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas básicas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{empresa.precoIniciou}</Typography>
            <Typography variant="caption">Preço Entrada</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{empresa.precoTeto}</Typography>
            <Typography variant="caption">Preço Teto</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{empresa.viesAtual}</Typography>
            <Typography variant="caption">Viés Atual</Typography>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{empresa.percentualCarteira}</Typography>
            <Typography variant="caption">% Carteira</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Dados da Posição */}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.ibovespaEpoca}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Análise de Viés */}
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
                    color={
                      empresa.viesAtual === 'Compra Forte' ? 'success' :
                      empresa.viesAtual === 'Compra' ? 'info' :
                      empresa.viesAtual === 'Neutro' ? 'warning' :
                      empresa.viesAtual === 'Venda' ? 'error' : 'default'
                    }
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">% da Carteira</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.percentualCarteira}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
