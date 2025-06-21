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
const ArrowLeftIcon = () => <span style={{ fontSize: '16px' }}>←</span>;
const UploadIcon = () => <span style={{ fontSize: '16px' }}>📤</span>;
const CloudUploadIcon = () => <span style={{ fontSize: '16px' }}>☁️</span>;
const CheckIcon = () => <span style={{ fontSize: '16px' }}>✅</span>;
const DeleteIcon = () => <span style={{ fontSize: '16px' }}>🗑️</span>;
const DownloadIcon = () => <span style={{ fontSize: '16px' }}>📥</span>;
const SyncIcon = () => <span style={{ fontSize: '16px' }}>🔄</span>;

// Interfaces
interface ProventoCentral {
  ticker: string;
  data: string;
  dataObj: Date;
  valor: number;
  tipo: string;
  dataFormatada: string;
  valorFormatado: string;
  // ✅ NOVOS CAMPOS ADICIONADOS
  dataCom?: string;
  dataComFormatada?: string;
  dataPagamento?: string;
  dataPagamentoFormatada?: string;
  dividendYield?: number;
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
    <Box sx={{ 
      p: 4, 
      maxWidth: 1400, 
      mx: 'auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header com botão voltar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Button 
          onClick={() => router.back()} 
          startIcon={<ArrowLeftIcon />} 
          sx={{
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '8px 16px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: '#f1f5f9',
              borderColor: '#cbd5e1'
            }
          }}
        >
          Voltar
        </Button>
      </Stack>

      {/* Card principal com título e estatísticas */}
      <Card sx={{ 
        mb: 4, 
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Box mb={3}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#1e293b',
                mb: 1,
                fontSize: '2rem'
              }}
            >
              💰 Central de Proventos
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b', 
                fontWeight: 400,
                fontSize: '1.125rem'
              }}
            >
              Sistema unificado para gerenciar proventos de todas as empresas
            </Typography>
          </Box>

          {/* Estatísticas */}
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5
                  }}
                >
                  {estatisticas.totalEmpresas}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Empresas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5
                  }}
                >
                  {estatisticas.totalProventos}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Proventos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e293b',
                    mb: 0.5,
                    fontSize: '1.5rem'
                  }}
                >
                  {formatarMoeda(estatisticas.valorTotal).replace('R$', 'R$')}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Total
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0'
                }}
              >
                <Typography 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    mb: 0.5,
                    fontSize: '1rem'
                  }}
                >
                  {estatisticas.dataUltimoUpload 
                    ? new Date(estatisticas.dataUltimoUpload).toLocaleDateString('pt-BR') 
                    : 'Nunca'
                  }
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Último Upload
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={() => setDialogAberto(true)} 
            startIcon={<CloudUploadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }
            }}
          >
            Novo Upload CSV
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={exportarDados} 
            startIcon={<DownloadIcon />}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Exportar
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={carregarEstatisticas} 
            startIcon={<SyncIcon />}
            sx={{
              border: '1px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1'
              }
            }}
          >
            Atualizar
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button 
            fullWidth 
            onClick={limparTudo} 
            startIcon={<DeleteIcon />}
            sx={{
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '12px',
              padding: '12px 20px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              '&:hover': {
                backgroundColor: '#fef2f2',
                borderColor: '#fca5a5'
              }
            }}
          >
            Limpar Tudo
          </Button>
        </Grid>
      </Grid>

      {/* Dialog de upload */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => !loading && setDialogAberto(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          📤 Upload Central de Proventos
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              border: '1px solid #dbeafe',
              backgroundColor: '#f0f9ff'
            }}
          >
            <Typography sx={{ fontSize: '0.875rem' }}>
              Formato esperado: <code style={{ 
                backgroundColor: '#e2e8f0', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                ticker,data,valor,tipo
              </code> ou <code style={{ 
                backgroundColor: '#e2e8f0', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontSize: '0.8rem'
              }}>
                ticker;data;valor;tipo
              </code>
            </Typography>
          </Alert>
          
          <input 
            id="upload-csv" 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={handleUploadArquivo} 
            disabled={loading} 
          />
          <label htmlFor="upload-csv">
            <Button 
              component="span" 
              fullWidth 
              startIcon={<UploadIcon />} 
              disabled={loading}
              sx={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '20px',
                textTransform: 'none',
                fontWeight: 500,
                color: arquivoSelecionado ? '#16a34a' : '#64748b',
                backgroundColor: arquivoSelecionado ? '#f0fdf4' : '#f8fafc',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                  borderColor: '#94a3b8'
                }
              }}
            >
              {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : 'Clique para selecionar arquivo CSV'}
            </Button>
          </label>
          
          {loading && (
            <Box mt={3}>
              <Typography sx={{ mb: 1, color: '#64748b', fontSize: '0.875rem' }}>
                {etapaProcessamento}
              </Typography>
              <LinearProgress 
                value={progresso} 
                variant="determinate" 
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#3b82f6',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={() => setDialogAberto(false)} 
            disabled={loading}
            sx={{
              color: '#64748b',
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={processarCSV} 
            disabled={!arquivoSelecionado || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              '&:disabled': {
                backgroundColor: '#e2e8f0',
                color: '#94a3b8'
              }
            }}
          >
            {loading ? 'Processando...' : 'Processar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
