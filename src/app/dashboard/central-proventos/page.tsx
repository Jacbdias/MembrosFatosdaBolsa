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

// Ícones mock (substitua pelos ícones do seu sistema)
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
      if (typeof window === 'undefined') return;
      
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
    setProventosProcessados([]);
    setRelatorioImportacao([]);

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
      await new Promise(resolve => setTimeout(resolve, 300));

      // Etapa 2: Processar dados
      const proventosValidos: ProventoCentral[] = [];
      const erros: string[] = [];

      for (let i = 1; i < linhas.length && i <= 10000; i++) {
        const linha = linhas[i];
        const partes = linha.split(',').map(p => p.trim().replace(/"/g, ''));
        
        if (partes.length < 4) {
          erros.push(`Linha ${i + 1}: Formato inválido (mínimo 4 colunas)`);
          continue;
        }

        const [ticker, data, valor, tipo] = partes;
        
        if (!ticker || !data || !valor || !tipo) {
          erros.push(`Linha ${i + 1}: Dados obrigatórios em branco`);
          continue;
        }

        const valorNum = parseFloat(valor.replace(',', '.'));
        if (isNaN(valorNum)) {
          erros.push(`Linha ${i + 1}: Valor inválido (${valor})`);
          continue;
        }

        let dataObj: Date;
        try {
          if (data.includes('/')) {
            const [dia, mes, ano] = data.split('/');
            dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
          } else if (data.includes('-')) {
            dataObj = new Date(data);
          } else {
            throw new Error('Formato não reconhecido');
          }
          
          if (isNaN(dataObj.getTime())) {
            throw new Error('Data inválida');
          }
        } catch {
          erros.push(`Linha ${i + 1}: Data inválida (${data})`);
          continue;
        }

        proventosValidos.push({
          ticker: ticker.toUpperCase(),
          data: data,
          dataObj: dataObj,
          valor: valorNum,
          tipo: tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valorNum)
        });
      }

      setProgresso(60);
      setEtapaProcessamento('Agrupando por empresa...');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Etapa 3: Agrupar por ticker e gerar relatório
      const proventosPorTicker = proventosValidos.reduce((acc, provento) => {
        if (!acc[provento.ticker]) {
          acc[provento.ticker] = [];
        }
        acc[provento.ticker].push(provento);
        return acc;
      }, {} as Record<string, ProventoCentral[]>);

      const relatorio: RelatorioImportacao[] = Object.entries(proventosPorTicker).map(([ticker, proventos]) => {
        const totalValor = proventos.reduce((sum, p) => sum + p.valor, 0);
        const ultimaData = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime())[0];
        
        return {
          ticker,
          quantidade: proventos.length,
          totalValor,
          ultimaData: ultimaData.dataFormatada,
          proventos: proventos.slice(0, 5)
        };
      });

      setProgresso(80);
      setEtapaProcessamento('Salvando dados...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Etapa 4: Salvar no localStorage
      if (typeof window !== 'undefined') {
        // Salvar master file
        localStorage.setItem('proventos_central_master', JSON.stringify(proventosValidos));
        localStorage.setItem('proventos_central_data_upload', new Date().toISOString());

        // Distribuir para cada ticker
        Object.entries(proventosPorTicker).forEach(([ticker, proventos]) => {
          const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
          localStorage.setItem(`proventos_${ticker}`, JSON.stringify(proventosOrdenados));
        });
      }

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      
      setProventosProcessados(proventosValidos);
      setRelatorioImportacao(relatorio);
      
      // Atualizar estatísticas
      carregarEstatisticas();

      await new Promise(resolve => setTimeout(resolve, 500));
      setDialogAberto(false);

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      setEtapaProcessamento(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      alert(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar dados');
    }
  }, []);

  const limparTodosDados = useCallback(() => {
    if (confirm('⚠️ ATENÇÃO!\n\nIsto irá remover TODOS os proventos de TODAS as empresas.\n\nTem certeza que deseja continuar?')) {
      try {
        if (typeof window === 'undefined') return;
        
        // Remover dados centrais
        localStorage.removeItem('proventos_central_master');
        localStorage.removeItem('proventos_central_data_upload');
        
        // Remover dados individuais de cada ticker
        const chaves = Object.keys(localStorage);
        chaves.forEach(chave => {
          if (chave.startsWith('proventos_') && chave !== 'proventos_central_master') {
            localStorage.removeItem(chave);
          }
        });

        // Reset do estado
        setProventosProcessados([]);
        setRelatorioImportacao([]);
        
        // Atualizar estatísticas
        carregarEstatisticas();

        alert('✅ Todos os dados foram removidos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('❌ Erro ao limpar dados. Tente novamente.');
      }
    }
  }, [carregarEstatisticas]);

  const toggleDetalhes = useCallback((ticker: string) => {
    setExpandirDetalhes(prev => 
      prev.includes(ticker) 
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  }, []);

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

      {/* Relatório de Importação */}
      {relatorioImportacao.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📊 Relatório da Última Importação
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>✅ Importação concluída com sucesso!</strong><br/>
                {proventosProcessados.length} proventos processados para {relatorioImportacao.length} empresas
              </Typography>
            </Alert>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Empresa</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Proventos</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Valor Total</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Último Provento</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Detalhes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relatorioImportacao.map((item) => (
                    <React.Fragment key={item.ticker}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{item.ticker}</TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.quantidade}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: '#22c55e' }}>
                          {formatarMoeda(item.totalValor)}
                        </TableCell>
                        <TableCell align="center">{item.ultimaData}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small"
                            onClick={() => toggleDetalhes(item.ticker)}
                          >
                            {expandirDetalhes.includes(item.ticker) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={expandirDetalhes.includes(item.ticker)}>
                            <Box sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                Últimos 5 proventos de {item.ticker}:
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell>Tipo</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {item.proventos.map((provento, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{provento.dataFormatada}</TableCell>
                                      <TableCell align="right">{provento.valorFormatado}</TableCell>
                                      <TableCell>{provento.tipo}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

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
              Recomendamos fazer um backup antes de continuar.
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
                sx={{ 
                  py: 3,
                  backgroundColor: arquivoSelecionado ? '#e8f5e8' : undefined,
                  borderColor: arquivoSelecionado ? '#22c55e' : undefined,
                  color: arquivoSelecionado ? '#22c55e' : undefined
                }}
              >
                {arquivoSelecionado ? `✅ ${arquivoSelecionado.name}` : '📁 Selecionar Arquivo CSV'}
              </Button>
            </label>

            {arquivoSelecionado && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>📄 Arquivo:</strong> {arquivoSelecionado.name}<br/>
                  <strong>📊 Tamanho:</strong> {(arquivoSelecionado.size / 1024).toFixed(1)} KB<br/>
                  <strong>📅 Selecionado:</strong> {new Date().toLocaleString('pt-BR')}
                </Typography>
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Formato esperado do CSV:
            </Typography>
            
            <Box sx={{ p: 2, backgroundColor: '#f1f5f9', borderRadius: 1, fontFamily: 'monospace' }}>
              <Typography variant="body2">
                ticker,data,valor,tipo<br/>
                VALE3,15/03/2024,1.50,Dividendo<br/>
                PETR4,20/03/2024,2.30,JCP<br/>
                BBAS3,10/04/2024,0.45,Dividendo<br/>
                VALE3,15/06/2024,1.80,Dividendo
              </Typography>
            </Box>
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
          <Button 
            onClick={() => {
              setDialogAberto(false);
              setArquivoSelecionado(null);
              setLoading(false);
              setProgresso(0);
            }}
            disabled={loading}
          >
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
