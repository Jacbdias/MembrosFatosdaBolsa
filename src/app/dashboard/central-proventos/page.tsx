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

// Ícones
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
  const [progresso, setProgresso] = useState(0);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalEmpresas: 0,
    totalProventos: 0,
    valorTotal: 0,
    dataUltimoUpload: ''
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }, []);

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

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');
    try {
      setProgresso(20);
      await delay(300);

      const text = await arquivoSelecionado.text();
      const linhas = text.split('\n').filter(linha => linha.trim());

      if (linhas.length < 2) throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');

      setProgresso(40);
      setEtapaProcessamento('Validando dados...');
      await delay(300);

      const proventosValidos: ProventoCentral[] = [];

      for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i];
        const partes = linha.includes(';')
          ? linha.split(';').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''))
          : linha.split(',').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));

        if (partes.length < 4) continue;
        const [ticker, data, valor, tipo] = partes;

        let valorNum = parseFloat(
          valor.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim()
        );
        if (isNaN(valorNum)) continue;

        let dataObj = new Date();
        if (data.includes('/')) {
          const [dia, mes, ano] = data.split('/');
          dataObj = new Date(+ano, +mes - 1, +dia);
        } else if (data.includes('-')) {
          dataObj = new Date(data);
        }

        if (isNaN(dataObj.getTime())) continue;

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

      if (!proventosValidos.length) throw new Error('Nenhum provento válido encontrado no arquivo');

      setProgresso(60);
      setEtapaProcessamento('Salvando dados...');
      await delay(300);

      if (typeof window !== 'undefined') {
        localStorage.setItem('proventos_central_master', JSON.stringify(proventosValidos));
        localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
      }

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      carregarEstatisticas();

      alert(`✅ Sucesso!\n\n${proventosValidos.length} proventos processados`);
      setDialogAberto(false);
      setArquivoSelecionado(null);
    } catch (error: any) {
      console.error('Erro:', error);
      alert(`❌ Erro ao processar CSV: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [arquivoSelecionado, carregarEstatisticas, formatarMoeda]);

  const exportarDados = useCallback(() => {
    if (typeof window === 'undefined') return;
    const masterData = localStorage.getItem('proventos_central_master');
    if (!masterData) {
      alert('Nenhum dado para exportar');
      return;
    }
    const dados = JSON.parse(masterData);
    const csvContent = [
      'ticker,data,valor,tipo',
      ...dados.map((item: ProventoCentral) =>
        `${item.ticker},${item.data},${item.valor.toString().replace('.', ',')},${item.tipo}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `proventos_backup_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, []);

  const limparTodosDados = useCallback(() => {
    if (!confirm('⚠️ Isto irá remover TODOS os proventos. Continuar?')) return;
    if (typeof window === 'undefined') return;
    localStorage.removeItem('proventos_central_master');
    localStorage.removeItem('proventos_central_data_upload');
    carregarEstatisticas();
    alert('✅ Todos os dados foram removidos');
  }, [carregarEstatisticas]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => router.back()} variant="outlined">
          Voltar
        </Button>
      </Stack>

      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h4">🏦 Central de Proventos</Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Sistema unificado para gerenciar proventos
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{estatisticasGerais.totalEmpresas}</Typography>
              <Typography>Empresas</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{estatisticasGerais.totalProventos}</Typography>
              <Typography>Proventos</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="h4">{formatarMoeda(estatisticasGerais.valorTotal)}</Typography>
              <Typography>Total Histórico</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography>
                {estatisticasGerais.dataUltimoUpload
                  ? new Date(estatisticasGerais.dataUltimoUpload).toLocaleDateString('pt-BR')
                  : 'Nunca'}
              </Typography>
              <Typography>Último Upload</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setDialogAberto(true)}
            disabled={loading}
          >
            Novo Upload CSV
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} onClick={exportarDados}>
            Exportar Backup
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button fullWidth variant="outlined" startIcon={<SyncIcon />} onClick={carregarEstatisticas}>
            Atualizar Stats
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={limparTodosDados}>
            Limpar Tudo
          </Button>
        </Grid>
      </Grid>

      <Dialog open={dialogAberto} onClose={() => !loading && setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>📤 Upload Central de Proventos</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Este upload substituirá TODOS os proventos existentes.
          </Alert>
          <input
            accept=".csv"
            id="upload-csv-central"
            type="file"
            style={{ display: 'none' }}
            onChange={handleUploadArquivo}
            disabled={loading}
          />
          <label htmlFor="upload-csv-central">
            <Button
              component="span"
              variant={arquivoSelecionado ? 'outlined' : 'contained'}
              startIcon={<UploadIcon />}
              fullWidth
              sx={{ py: 2 }}
              disabled={loading}
            >
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : 'Selecionar Arquivo CSV'}
            </Button>
          </label>
          {loading && (
            <>
              <Typography sx={{ mt: 2 }}>{etapaProcessamento}</Typography>
              <LinearProgress variant="determinate" value={progresso} sx={{ mt: 1 }} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={processarCSV}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
            disabled={!arquivoSelecionado || loading}
          >
            {loading ? 'Processando...' : 'Processar CSV'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
