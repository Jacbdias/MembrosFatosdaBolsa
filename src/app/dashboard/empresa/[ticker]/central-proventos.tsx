'use client';

import React, { useState, useCallback, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Grid,
  IconButton,
  Collapse,
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';

// Ícones
const ArrowLeftIcon = () => <span>←</span>;
const UploadIcon = () => <span>📤</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const CheckIcon = () => <span>✅</span>;
const ExpandMoreIcon = () => <span>▼</span>;
const ExpandLessIcon = () => <span>▲</span>;
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

interface RelatorioImportacao {
  ticker: string;
  quantidade: number;
  totalValor: number;
  ultimaData: string;
  proventos: ProventoCentral[];
}

// Componente principal
export default function CentralProventos() {
  const router = useRouter();
  
  const [dialogAberto, setDialogAberto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [proventosProcessados, setProventosProcessados] = useState<ProventoCentral[]>([]);
  const [relatorioImportacao, setRelatorioImportacao] = useState<RelatorioImportacao[]>([]);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');
  const [progresso, setProgresso] = useState(0);
  const [expandirDetalhes, setExpandirDetalhes] = useState<string[]>([]);
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalEmpresas: 0,
    totalProventos: 0,
    valorTotal: 0,
    dataUltimoUpload: ''
  });

  // Carregar estatísticas
  const carregarEstatisticas = useCallback(() => {
    try {
      const masterData = localStorage.getItem('proventos_central_master');
      if (masterData) {
        const dados = JSON.parse(masterData);
        
        const estatisticas = dados.reduce((acc: any, item: any) => {
          acc.tickers.add(item.ticker);
          acc.totalValor += item.valor;
          acc.totalProventos += 1;
          return acc;
        }, { tickers: new Set(), totalValor: 0, totalProventos: 0 });

        setEstatisticasGerais({
          totalEmpresas: estatisticas.tickers.size,
          totalProventos: estatisticas.totalProventos,
          valorTotal: estatisticas.totalValor,
          dataUltimoUpload: localStorage.getItem('proventos_central_data_upload') || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
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
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > maxSize) {
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    
    setArquivoSelecionado(arquivo);
  }, []);

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');

    try {
      // Etapa 1: Ler arquivo
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgresso(20);

      const text = await arquivoSelecionado.text();
      const linhas = text.split('\n').filter(linha => linha.trim());
      
      if (linhas.length < 2) {
        throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
      }

      setEtapaProcessamento('Validando dados...');
      setProgresso(40);

      // Processar dados (adicione aqui toda a lógica de processamento do HTML)
      // ... código de processamento ...

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      
      carregarEstatisticas();
      await new Promise(resolve => setTimeout(resolve, 500));
      setDialogAberto(false);

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [arquivoSelecionado, carregarEstatisticas]);

  const formatarMoeda = useCallback((valor: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(valor);
  }, []);

  const exportarDados = useCallback(() => {
    try {
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
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  }, []);

  const limparTodosDados = useCallback(() => {
    if (confirm('⚠️ ATENÇÃO!\n\nIsto irá remover TODOS os proventos de TODAS as empresas.\n\nTem certeza que deseja continuar?')) {
      try {
        localStorage.removeItem('proventos_central_master');
        localStorage.removeItem('proventos_central_data_upload');
        
        const chaves = Object.keys(localStorage);
        chaves.forEach(chave => {
          if (chave.startsWith('proventos_') && chave !== 'proventos_central_master') {
            localStorage.removeItem(chave);
          }
        });

        setProventosProcessados([]);
        setRelatorioImportacao([]);
        carregarEstatisticas();

        alert('✅ Todos os dados foram removidos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('❌ Erro ao limpar dados. Tente novamente.');
      }
    }
  }, [carregarEstatisticas]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header com botão voltar */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => router.back()} 
          variant="outlined"
        >
          Voltar
        </Button>
      </Stack>

      {/* Card principal */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            🏦 Central de Proventos
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Sistema unificado para gerenciar proventos de todas as empresas
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {estatisticasGerais.totalEmpresas}
                </Typography>
                <Typography variant="body2">Empresas</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {estatisticasGerais.totalProventos}
                </Typography>
                <Typography variant="body2">Proventos</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatarMoeda(estatisticasGerais.valorTotal).replace('R$ ', '')}
                </Typography>
                <Typography variant="body2">Total Histórico</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {estatisticasGerais.dataUltimoUpload 
                    ? new Date(estatisticasGerais.dataUltimoUpload).toLocaleDateString('pt-BR')
                    : 'Nunca'
                  }
                </Typography>
                <Typography variant="body2">Último Upload</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Ações principais */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<CloudUploadIcon />}
            onClick={() => setDialogAberto(true)}
            sx={{ py: 2 }}
          >
            Novo Upload CSV
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={exportarDados}
            disabled={estatisticasGerais.totalProventos === 0}
            sx={{ py: 2 }}
          >
            Exportar Backup
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<SyncIcon />}
            onClick={carregarEstatisticas}
            sx={{ py: 2 }}
          >
            Atualizar Stats
          </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="outlined"
            color="error"
            size="large"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={limparTodosDados}
            disabled={estatisticasGerais.totalProventos === 0}
            sx={{ py: 2 }}
          >
            Limpar Tudo
          </Button>
        </Grid>
      </Grid>

      {/* Instruções */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            📋 Como Funciona
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Formato do CSV obrigatório:</strong><br/>
              <code>ticker,data,valor,tipo</code><br/>
              <code>VALE3,15/03/2024,1.50,Dividendo</code><br/>
              <code>PETR4,20/03/2024,2.30,JCP</code>
            </Typography>
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ✅ O que o sistema faz:
                </Typography>
                <Typography variant="body2">
                  • Processa um único CSV com todos os proventos<br/>
                  • Distribui automaticamente por empresa<br/>
                  • Mantém backup do arquivo original<br/>
                  • Atualiza todas as páginas individuais<br/>
                  • Gera relatório de importação detalhado
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, backgroundColor: '#fef3c7', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  ⚠️ Importante:
                </Typography>
                <Typography variant="body2">
                  • Máximo 10MB e 10.000 linhas<br/>
                  • Dados anteriores são sobrescritos<br/>
                  • Sempre faça backup antes<br/>
                  • Formato de data: DD/MM/AAAA<br/>
                  • Valores com ponto ou vírgula
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            📤 Upload Central de Proventos
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>⚠️ ATENÇÃO:</strong> Este upload irá substituir TODOS os proventos existentes de TODAS as empresas.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Selecione o arquivo CSV:
            </Typography>
            
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="upload-csv-central"
              type="file"
              onChange={handleUploadArquivo}
            />
            <label htmlFor="upload-csv-central">
              <Button 
                variant={arquivoSelecionado ? 'outlined' : 'contained'}
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                sx={{ py: 3 }}
              >
                {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : '📁 Selecionar Arquivo CSV'}
              </Button>
            </label>
          </Box>

          {loading && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                {etapaProcessamento}
              </Typography>
              <LinearProgress variant="determinate" value={progresso} sx={{ height: 8, borderRadius: 4 }} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {progresso}% concluído
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogAberto(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={processarCSV}
            variant="contained"
            disabled={!arquivoSelecionado || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {loading ? 'Processando...' : 'Processar CSV'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
