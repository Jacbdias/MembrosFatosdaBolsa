'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, Grid, LinearProgress, Stack
} from '@mui/material';

const ArrowLeftIcon = () => <span>←</span>;
const UploadIcon = () => <span>📤</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const CheckIcon = () => <span>✅</span>;
const DeleteIcon = () => <span>🗑️</span>;
const DownloadIcon = () => <span>📥</span>;
const SyncIcon = () => <span>🔄</span>;

interface ProventoCentral {
  ticker: string;
  data: string;
  dataObj: Date;
  valor: number;
  tipo: string;
  dataFormatada: string;
  valorFormatado: string;
}

interface RelatorioImportacao {
  ticker: string;
  quantidade: number;
  totalValor: number;
  ultimaData: string;
  proventos: ProventoCentral[];
}

export default function CentralProventos() {
  const router = useRouter();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [proventosProcessados, setProventosProcessados] = useState<ProventoCentral[]>([]);
  const [relatorioImportacao, setRelatorioImportacao] = useState<RelatorioImportacao[]>([]);
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
  }, []);

  React.useEffect(() => {
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
    if (arquivo.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    setArquivoSelecionado(arquivo);
  }, []);

  const parseData = (data: string): Date | null => {
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      const dt = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return isNaN(dt.getTime()) ? null : dt;
    } else if (data.includes('-')) {
      const dt = new Date(data);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  const formatarMoeda = useCallback((valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor), []);

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');
    setProventosProcessados([]);
    setRelatorioImportacao([]);

    try {
      setProgresso(20);
      await delay(300);
      const text = await arquivoSelecionado.text();
      const linhas = text.split('\n').filter(l => l.trim());
      if (linhas.length < 2) throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');

      setEtapaProcessamento('Validando dados...');
      setProgresso(40);
      await delay(300);

      const proventosValidos: ProventoCentral[] = [];
      const maxLinhas = Math.min(linhas.length, 1001);

      for (let i = 1; i < maxLinhas; i++) {
        const partes = (linhas[i].includes(';') ? linhas[i].split(';') : linhas[i].split(','))
          .map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));
        if (partes.length < 4) continue;
        const [ticker, data, valor, tipo] = partes;
        if (!ticker || !data || !valor || !tipo) continue;

        const valorNum = parseFloat(valor.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim());
        if (isNaN(valorNum)) continue;

        const dataObj = parseData(data);
        if (!dataObj) continue;

        proventosValidos.push({
          ticker: ticker.toUpperCase(),
          data,
          dataObj,
          valor: valorNum,
          tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valorNum)
        });
      }

      if (proventosValidos.length === 0) throw new Error('Nenhum provento válido encontrado no arquivo');

      setEtapaProcessamento('Salvando dados...');
      setProgresso(80);
      await delay(300);

      if (typeof window !== 'undefined') {
        localStorage.setItem('proventos_central_master', JSON.stringify(proventosValidos));
        localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
      }

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      setProventosProcessados(proventosValidos);
      await delay(500);
      carregarEstatisticas();
      await delay(1000);
      setDialogAberto(false);
      setArquivoSelecionado(null);
      alert(`✅ Sucesso!\n\n${proventosValidos.length} proventos processados`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setEtapaProcessamento(`Erro: ${msg}`);
      alert(`❌ Erro ao processar CSV:\n\n${msg}`);
    } finally {
      setLoading(false);
    }
  }, [arquivoSelecionado, carregarEstatisticas]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()} variant="outlined">Voltar</Button>
      </Stack>
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>🏦 Central de Proventos</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>Sistema unificado para gerenciar proventos</Typography>
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{estatisticasGerais.totalEmpresas}</Typography><Typography>Empresas</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{estatisticasGerais.totalProventos}</Typography><Typography>Proventos</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography variant="h4">{formatarMoeda(estatisticasGerais.valorTotal)}</Typography><Typography>Total</Typography></Box></Grid>
            <Grid item xs={6} md={3}><Box textAlign="center"><Typography>{estatisticasGerais.dataUltimoUpload ? new Date(estatisticasGerais.dataUltimoUpload).toLocaleDateString('pt-BR') : 'Nunca'}</Typography><Typography>Último Upload</Typography></Box></Grid>
          </Grid>
        </CardContent>
      </Card>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={() => setDialogAberto(true)}>Novo Upload</Button></Grid>
      </Grid>
      <Dialog open={dialogAberto} onClose={() => { if (!loading) setDialogAberto(false); }} maxWidth="md" fullWidth disableEscapeKeyDown={loading}>
        <DialogTitle><Typography variant="h5">📤 Upload Central de Proventos</Typography></DialogTitle>
        <DialogContent>
          <Alert severity="warning">⚠️ Este upload irá substituir TODOS os proventos existentes.</Alert>
          <input id="upload-csv-central" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleUploadArquivo} disabled={loading} />
          <label htmlFor="upload-csv-central">
            <Button variant={arquivoSelecionado ? 'outlined' : 'contained'} component="span" startIcon={<UploadIcon />} fullWidth disabled={loading}>
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : '📁 Selecionar Arquivo CSV'}
            </Button>
          </label>
          {loading && <Box sx={{ mt: 2 }}><Typography>{etapaProcessamento}</Typography><LinearProgress variant="determinate" value={progresso} /></Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={processarCSV} variant="contained" disabled={!arquivoSelecionado || loading} startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}>{loading ? 'Processando...' : 'Processar CSV'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
