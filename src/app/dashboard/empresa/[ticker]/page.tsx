'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Avatar, Box, Card, CardContent, Grid, Stack, Typography, Button, Chip,
  LinearProgress, CircularProgress, Alert, Skeleton, Tooltip, IconButton
} from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { WarningCircle as WarningIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';

// Simulação de dados fallback
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Shoppings',
    descricao: 'A Allos é uma empresa de shopping centers de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '108.500',
    percentualCarteira: '4.2%'
  }
};

// Interfaces
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
  dadosFinanceiros?: DadosFinanceiros;
  statusApi?: string;
  ultimaAtualizacao?: string;
}

interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
}

// Hook embutido
function useDadosFinanceiros(ticker: string) {
  const [dadosFinanceiros, setDadosFinanceiros] = React.useState<DadosFinanceiros | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = React.useState<string>('');

  const buscarDados = React.useCallback(async () => {
    if (!ticker) return;
    try {
      setLoading(true);
      setError(null);
      // Simule um valor ou substitua por seu fetch real
      const preco = Math.random() * 30 + 10;
      setDadosFinanceiros({
        precoAtual: preco,
        variacao: preco * 0.01,
        variacaoPercent: 1.0
      });
      setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
    } catch {
      setError('Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  React.useEffect(() => {
    buscarDados();
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

// Funções auxiliares
function formatarValor(valor: number, tipo: 'currency' | 'percent' = 'currency'): string {
  if (tipo === 'currency') {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }
  if (tipo === 'percent') {
    return `${valor.toFixed(2).replace('.', ',')}%`;
  }
  return valor.toString();
}

function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  const precoTetoNum = parseFloat(precoTeto.replace(/[^\d,]/g, '').replace(',', '.'));
  if (isNaN(precoTetoNum) || precoAtual <= 0) return 'Aguardar';
  const percentual = (precoAtual / precoTetoNum) * 100;
  if (percentual <= 80) return 'Compra Forte';
  if (percentual <= 95) return 'Compra';
  if (percentual <= 105) return 'Neutro';
  if (percentual <= 120) return 'Aguardar';
  return 'Venda';
}

// Componente principal
export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker || '').toString();

  const [empresa, setEmpresa] = React.useState<EmpresaCompleta | null>(null);
  const { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  React.useEffect(() => {
    if (!ticker) return;
    if (typeof window === 'undefined') return;

    const fallback = dadosFallback[ticker];
    if (fallback) {
      setEmpresa(fallback);
    } else {
      setEmpresa(null);
    }
  }, [ticker]);

  const empresaCompleta = React.useMemo(() => {
    if (!empresa) return null;
    if (dadosFinanceiros) {
      return {
        ...empresa,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        ultimaAtualizacao
      };
    }
    return empresa;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  if (!empresaCompleta) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4">🔍 Empresa não encontrada</Typography>
        <Button onClick={() => window.history.back()} startIcon={<ArrowLeftIcon />} variant="contained">
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={empresaCompleta.avatar} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography variant="h5">{empresaCompleta.nomeCompleto}</Typography>
              <Chip label={empresaCompleta.setor} size="small" />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading ? (
            <Skeleton variant="text" width={100} />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box>
              <Typography variant="h6">Preço Atual: {formatarValor(dadosFinanceiros!.precoAtual)}</Typography>
              <Typography variant="body2">Variação: {formatarValor(dadosFinanceiros!.variacaoPercent, 'percent')}</Typography>
              <Typography variant="body2">Viés: {empresaCompleta.viesAtual}</Typography>
              <Typography variant="caption">Última atualização: {ultimaAtualizacao}</Typography>
            </Box>
          )}
          <Button onClick={refetch} startIcon={<RefreshIcon />} disabled={loading}>
            Atualizar
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
