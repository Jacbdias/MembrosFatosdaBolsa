'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { WarningCircle as WarningIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { FileText as FileIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { CaretDown as ExpandMoreIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

// 🔑 Seu código auxiliar, hooks, funções utilitárias e componentes internos permanecem como você tinha
// (omiti aqui para o espaço, mas deve conter tudo que você já fez: hooks, MetricCard, DebugDividendos, GerenciadorRelatorios, HistoricoDividendos, ResumoExecutivo etc)

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker || '').toString();

  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');

  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  useEffect(() => {
    if (!ticker) return;
    if (typeof window === 'undefined') return;

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
    } catch {
      setDataSource('not_found');
    }
  }, [ticker]);

  const empresaCompleta = useMemo(() => {
    if (!empresa) return null;

    let empresaAtualizada = { ...empresa };

    if (dadosFinanceiros && dadosFinanceiros.precoAtual > 0) {
      empresaAtualizada = {
        ...empresaAtualizada,
        dadosFinanceiros,
        viesAtual: calcularViesInteligente(empresa.precoTeto, dadosFinanceiros.precoAtual),
        statusApi: 'success',
        ultimaAtualizacao
      };
    } else {
      empresaAtualizada.statusApi = 'error';
    }

    return empresaAtualizada;
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  if (!ticker || !empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{ p: 3, textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            startIcon={<ArrowLeftIcon />}
            onClick={() => window.history.back()}
            variant="contained"
            size="large"
          >
            Voltar à Lista
          </Button>
        </Stack>
      </Box>
    );
  }

  // ⬆ Aqui você mantém todo o resto do seu JSX de renderização
  // (Cards, Métricas, Debug, GerenciadorRelatorios, HistoricoDividendos, etc)
}
