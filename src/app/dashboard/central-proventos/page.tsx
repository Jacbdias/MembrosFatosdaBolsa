'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Stack,
  Grid, LinearProgress
} from '@mui/material';

// Ícones
const ArrowLeftIcon = () => <span>←</span>;
const UploadIcon = () => <span>📤</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const CheckIcon = () => <span>✅</span>;
const DeleteIcon = () => <span>🗑️</span>;
const DownloadIcon = () => <span>📥</span>;
const SyncIcon = () => <span>🔄</span>;

// Interfaces
interface ProventoCentral {
  ticker: string;
  data: string;
  dataObj: Date;
  valor: number;
  tipo: string;
  dataFormatada: string;
  valorFormatado: string;
}

export default function CentralProventos() {
  const router = useRouter();

  const [dialogAberto, setDialogAberto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');
  const [progresso, setProgresso] = useState(0);
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalEmpresas: 0,
    totalProventos: 0,
    valorTotal: 0,
    dataUltimoUpload: ''
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const carregarEstatisticas = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      const masterData = localStorage.getItem('proventos_central_master');
      if (masterData) {
        const dados = JSON.parse(masterData);
        const tickers = new Set();
        let totalValor = 0;
        dados.forEach((item: any) => {
          tickers.add(item.ticker);
          totalValor += item.valor;
        });
        setEstatisticasGerais({
          totalEmpresas: tickers.size,
          totalProventos: dados.length,
          valorTotal: totalValor,
          dataUltimoUpload: localStorage.getItem('proventos_central_data_upload') || ''
        });
      } else {
        setEstatisticasGerais({
          totalEmpresas: 0,
          totalProventos: 0,
          valorTotal: 0,
          dataUltimoUpload: ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const handleUploadArquivo = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.type !== 'text/csv' && !arquivo.name.endsWith('.csv')) {
      alert('Por favor, selecione apenas arquivos CSV');
      event.target.value = '';
      return;
    }
    const maxSize = 10 * 1024 * 1024;
    if (arquivo.size > maxSize) {
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    setArquivoSelecionado(arquivo);
  }, []);

  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }, []);

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');
    await delay(300);

    try {
      const text = await arquivoSelecionado.text();
      const linhas = text.split('\n').filter(linha => linha.trim());
      if (linhas.length < 2) throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');

      setProgresso(20);
      setEtapaProcessamento('Validando dados...');
      await delay(300);

      const proventosValidos: ProventoCentral[] = [];
      const maxLinhas = Math.min(linhas.length, 1001);
      for (let i = 1; i < maxLinhas; i++) {
        const linha = linhas[i];
        let partes = linha.includes(';')
          ? linha.split(';').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''))
          : linha.split(',').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));
        if (partes.length < 4) continue;

        const [ticker, data, valorStr, tipo] = partes;
        let valorLimpo = valorStr.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim();
        const valor = parseFloat(valorLimpo);
        if (isNaN(valor)) continue;

        let dataObj: Date;
        if (data.includes('/')) {
          const [dia, mes, ano] = data.split('/');
          dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
        } else {
          dataObj = new Date(data);
        }
        if (isNaN(dataObj.getTime())) continue;

        proventosValidos.push({
          ticker: ticker.toUpperCase(),
          data,
          dataObj,
          valor,
          tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valor)
        });
      }

      if (proventosValidos.length === 0) throw new Error('Nenhum provento válido encontrado');

      setProgresso(60);
      setEtapaProcessamento('Salvando dados...');
      await delay(300);

      if (typeof window !== 'undefined') {
        localStorage.setItem('proventos_central_master', JSON.stringify(proventosValidos));
        localStorage.setItem('proventos_central_data_upload', new Date().toISOString());

        const proventosPorTicker: Record<string, ProventoCentral[]> = {};
        proventosValidos.forEach(p => {
          if (!proventosPorTicker[p.ticker]) proventosPorTicker[p.ticker] = [];
          proventosPorTicker[p.ticker].push(p);
        });

        Object.entries(proventosPorTicker).forEach(([ticker, proventos]) => {
          localStorage.setItem(`proventos_${ticker}`, JSON.stringify(proventos));
        });
      }

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      await delay(500);
      carregarEstatisticas();
      setDialogAberto(false);
      setArquivoSelecionado(null);
      alert(`✅ ${proventosValidos.length} proventos processados com sucesso!`);
    } catch (err: any) {
      alert(`❌ Erro ao processar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [arquivoSelecionado, carregarEstatisticas, formatarMoeda]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()} variant="outlined">Voltar</Button>
      </Stack>

      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>🏦 Central de Proventos</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>Sistema unificado para gerenciar proventos</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{estatisticasGerais.totalEmpresas}</Typography>
              <Typography variant="body2">Empresas</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{estatisticasGerais.totalProventos}</Typography>
              <Typography variant="body2">Proventos</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{formatarMoeda(estatisticasGerais.valorTotal)}</Typography>
              <Typography variant="body2">Total Histórico</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body1">
                {estatisticasGerais.dataUltimoUpload
                  ? new Date(estatisticasGerais.dataUltimoUpload).toLocaleDateString('pt-BR')
                  : 'Nunca'}
              </Typography>
              <Typography variant="body2">Último Upload</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Button variant="contained" fullWidth startIcon={<CloudUploadIcon />} onClick={() => setDialogAberto(true)} disabled={loading}>Novo Upload CSV</Button>
        </Grid>
      </Grid>

      <Dialog open={dialogAberto} onClose={() => !loading && setDialogAberto(false)} fullWidth maxWidth="md">
        <DialogTitle>📤 Upload Central de Proventos</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>⚠️ Este upload irá substituir TODOS os proventos existentes.</Alert>
          <input id="upload-csv-central" type="file" accept=".csv" hidden onChange={handleUploadArquivo} disabled={loading} />
          <label htmlFor="upload-csv-central">
            <Button component="span" fullWidth variant={arquivoSelecionado ? 'outlined' : 'contained'} startIcon={<UploadIcon />} disabled={loading}>
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : 'Selecionar Arquivo CSV'}
            </Button>
          </label>
          {loading && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">{etapaProcessamento}</Typography>
              <LinearProgress variant="determinate" value={progresso} />
              <Typography variant="caption">{progresso}% concluído</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={processarCSV} variant="contained" disabled={!arquivoSelecionado || loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}>
            {loading ? 'Processando...' : 'Processar CSV'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
