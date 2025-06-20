'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Stack
} from '@mui/material';

// Ícones simples
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
  const [estatisticas, setEstatisticas] = useState({
    totalEmpresas: 0,
    totalProventos: 0,
    valorTotal: 0,
    dataUltimoUpload: ''
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const carregarEstatisticas = useCallback(() => {
    if (typeof window === 'undefined') return;
    const master = localStorage.getItem('proventos_central_master');
    if (master) {
      const dados = JSON.parse(master) as ProventoCentral[];
      const tickers = new Set(dados.map(d => d.ticker));
      const valorTotal = dados.reduce((acc, d) => acc + d.valor, 0);
      setEstatisticas({
        totalEmpresas: tickers.size,
        totalProventos: dados.length,
        valorTotal,
        dataUltimoUpload: localStorage.getItem('proventos_central_data_upload') || ''
      });
    } else {
      setEstatisticas({
        totalEmpresas: 0,
        totalProventos: 0,
        valorTotal: 0,
        dataUltimoUpload: ''
      });
    }
  }, []);

  useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }
    setArquivoSelecionado(file);
  };

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo...');
    await delay(300);

    const text = await arquivoSelecionado.text();
    const linhas = text.split('\n').filter(l => l.trim());
    if (linhas.length < 2) {
      alert('Arquivo vazio ou sem dados válidos.');
      setLoading(false);
      return;
    }

    setEtapaProcessamento('Processando linhas...');
    setProgresso(30);
    await delay(300);

    const proventos: ProventoCentral[] = [];
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i].replace(/\r/g, '');
      const partes = linha.includes(';') ? linha.split(';') : linha.split(',');
      if (partes.length < 4) continue;
      const [ticker, data, valorRaw, tipo] = partes.map(p => p.trim());
      let valor = parseFloat(
        valorRaw.replace('R$', '').replace(/\s/g, '').replace(',', '.')
      );
      if (isNaN(valor)) continue;
      let dataObj: Date;
      if (data.includes('/')) {
        const [d, m, a] = data.split('/');
        dataObj = new Date(+a, +m - 1, +d);
      } else {
        dataObj = new Date(data);
      }
      if (isNaN(dataObj.getTime())) continue;
      proventos.push({
        ticker,
        data,
        dataObj,
        valor,
        tipo,
        dataFormatada: dataObj.toLocaleDateString('pt-BR'),
        valorFormatado: formatarMoeda(valor)
      });
    }

    if (proventos.length === 0) {
      alert('Nenhum provento válido encontrado.');
      setLoading(false);
      return;
    }

    setEtapaProcessamento('Salvando dados...');
    setProgresso(70);
    await delay(300);

    if (typeof window !== 'undefined') {
      localStorage.setItem('proventos_central_master', JSON.stringify(proventos));
      localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
      const porTicker: Record<string, ProventoCentral[]> = {};
      proventos.forEach(p => {
        if (!porTicker[p.ticker]) porTicker[p.ticker] = [];
        porTicker[p.ticker].push(p);
      });
      Object.entries(porTicker).forEach(([t, ps]) => {
        localStorage.setItem(`proventos_${t}`, JSON.stringify(ps));
      });
    }

    setProgresso(100);
    await delay(500);
    carregarEstatisticas();
    alert(`✅ ${proventos.length} proventos processados com sucesso.`);
    setDialogAberto(false);
    setArquivoSelecionado(null);
    setLoading(false);
  }, [arquivoSelecionado, carregarEstatisticas]);

  const exportarDados = () => {
    if (typeof window === 'undefined') return;
    const master = localStorage.getItem('proventos_central_master');
    if (!master) {
      alert('Nenhum dado para exportar');
      return;
    }
    const blob = new Blob([master], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `proventos_backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const limparTudo = () => {
    if (!confirm('Tem certeza que deseja apagar todos os dados?')) return;
    localStorage.clear();
    carregarEstatisticas();
    alert('Dados removidos.');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Button onClick={() => router.back()} startIcon={<ArrowLeftIcon />} variant="outlined">
          Voltar
        </Button>
      </Stack>

      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4" fontWeight={700}>🏦 Central de Proventos</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>Sistema unificado para gerenciar proventos de todas as empresas</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{estatisticas.totalEmpresas}</Typography><Typography>Empresas</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{estatisticas.totalProventos}</Typography><Typography>Proventos</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{formatarMoeda(estatisticas.valorTotal).replace('R$', '')}</Typography><Typography>Total</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="body1">{estatisticas.dataUltimoUpload ? new Date(estatisticas.dataUltimoUpload).toLocaleDateString('pt-BR') : 'Nunca'}</Typography><Typography>Último Upload</Typography></Box></Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={3}><Button fullWidth variant="contained" onClick={() => setDialogAberto(true)} startIcon={<CloudUploadIcon />}>Novo Upload CSV</Button></Grid>
        <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={exportarDados} startIcon={<DownloadIcon />}>Exportar</Button></Grid>
        <Grid item xs={12} md={3}><Button fullWidth variant="outlined" onClick={carregarEstatisticas} startIcon={<SyncIcon />}>Atualizar</Button></Grid>
        <Grid item xs={12} md={3}><Button fullWidth variant="outlined" color="error" onClick={limparTudo} startIcon={<DeleteIcon />}>Limpar Tudo</Button></Grid>
      </Grid>

      <Dialog open={dialogAberto} onClose={() => !loading && setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>📤 Upload Central de Proventos</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Formato: <code>ticker,data,valor,tipo</code> ou <code>ticker;data;valor;tipo</code>
          </Alert>
          <input id="upload-csv" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUploadArquivo} disabled={loading} />
          <label htmlFor="upload-csv">
            <Button component="span" variant="contained" fullWidth startIcon={<UploadIcon />} disabled={loading}>
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : 'Selecionar Arquivo CSV'}
            </Button>
          </label>
          {loading && (
            <Box mt={2}>
              <Typography>{etapaProcessamento}</Typography>
              <LinearProgress value={progresso} variant="determinate" />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={processarCSV} disabled={!arquivoSelecionado || loading} variant="contained" startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}>
            {loading ? 'Processando...' : 'Processar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
