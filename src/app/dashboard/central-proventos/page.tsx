'use client';

import React, { useState, useCallback } from 'react';
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

  // Função para delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Carregar estatísticas
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
    
    console.log('Arquivo selecionado:', arquivo.name, arquivo.size);
    setArquivoSelecionado(arquivo);
  }, []);

  // FUNÇÃO CORRIGIDA - processarCSV
  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) {
      console.log('Nenhum arquivo selecionado');
      return;
    }

    console.log('Iniciando processamento do CSV...');
    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');
    setProventosProcessados([]);
    setRelatorioImportacao([]);

    try {
      // Etapa 1: Ler arquivo
      console.log('Etapa 1: Lendo arquivo...');
      setProgresso(20);
      await delay(300);

      const text = await arquivoSelecionado.text();
      console.log('Conteúdo do arquivo:', text.substring(0, 200) + '...');
      
      const linhas = text.split('\n').filter(linha => linha.trim());
      console.log('Número de linhas:', linhas.length);
      
      if (linhas.length < 2) {
        throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
      }

      // Etapa 2: Validar dados
      console.log('Etapa 2: Validando dados...');
      setEtapaProcessamento('Validando dados...');
      setProgresso(40);
      await delay(300);

      const proventosValidos: ProventoCentral[] = [];
      const erros: string[] = [];

      // Processar apenas as primeiras 1000 linhas para teste
      const maxLinhas = Math.min(linhas.length, 1001); // header + 1000 linhas
      
      for (let i = 1; i < maxLinhas; i++) {
        const linha = linhas[i];
        
        // ✅ SUPORTE PARA PONTO E VÍRGULA OU VÍRGULA
        let partes;
        if (linha.includes(';')) {
          partes = linha.split(';').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));
        } else {
          partes = linha.split(',').map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));
        }
        
        console.log(`Processando linha ${i}:`, partes);
        
        if (partes.length < 4) {
          erros.push(`Linha ${i + 1}: Formato inválido (${partes.length} colunas, mínimo 4)`);
          console.log(`Erro linha ${i + 1}: formato inválido`);
          continue;
        }

        const [ticker, data, valor, tipo] = partes;
        
        if (!ticker || !data || !valor || !tipo) {
          erros.push(`Linha ${i + 1}: Dados obrigatórios em branco`);
          console.log(`Erro linha ${i + 1}: dados em branco`);
          continue;
        }

        // ✅ LIMPEZA E CONVERSÃO DE VALOR MELHORADA
let valorLimpo = valor.toString()
  .replace('R$', '')         // Remove símbolo R$
  .replace(/\s/g, '')        // Remove espaços
  .replace(',', '.')         // Troca vírgula por ponto (para parseFloat)
  .trim();

const valorNum = parseFloat(valorLimpo);
if (isNaN(valorNum)) {
  erros.push(`Linha ${i + 1}: Valor inválido (${valor} -> ${valorLimpo})`);
  console.log(`Erro linha ${i + 1}: valor inválido`);
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
          console.log(`Erro linha ${i + 1}: data inválida`);
          continue;
        }

        const proventoValido: ProventoCentral = {
          ticker: ticker.toUpperCase(),
          data: data,
          dataObj: dataObj,
          valor: valorNum,
          tipo: tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valorNum)
        };

        proventosValidos.push(proventoValido);
        console.log(`Provento válido adicionado:`, proventoValido);
      }

      console.log(`Processamento concluído: ${proventosValidos.length} proventos válidos, ${erros.length} erros`);
      
      if (erros.length > 0) {
        console.log('Erros encontrados:', erros.slice(0, 5)); // Mostrar apenas os primeiros 5
      }

      if (proventosValidos.length === 0) {
        throw new Error('Nenhum provento válido encontrado no arquivo');
      }

      // Etapa 3: Agrupar por ticker
      console.log('Etapa 3: Agrupando por ticker...');
      setEtapaProcessamento('Agrupando por empresa...');
      setProgresso(60);
      await delay(300);

      const proventosPorTicker: Record<string, ProventoCentral[]> = {};
      
      proventosValidos.forEach(provento => {
        if (!proventosPorTicker[provento.ticker]) {
          proventosPorTicker[provento.ticker] = [];
        }
        proventosPorTicker[provento.ticker].push(provento);
      });

      console.log('Tickers encontrados:', Object.keys(proventosPorTicker));

      // Gerar relatório
      const relatorio: RelatorioImportacao[] = Object.entries(proventosPorTicker).map(([ticker, proventos]) => {
        const totalValor = proventos.reduce((sum, p) => sum + p.valor, 0);
        const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
        const ultimaData = proventosOrdenados[0];
        
        return {
          ticker,
          quantidade: proventos.length,
          totalValor,
          ultimaData: ultimaData.dataFormatada,
          proventos: proventosOrdenados.slice(0, 5)
        };
      });

      // Etapa 4: Salvar dados
      console.log('Etapa 4: Salvando dados...');
      setEtapaProcessamento('Salvando dados...');
      setProgresso(80);
      await delay(300);

      if (typeof window !== 'undefined') {
        try {
          // Salvar master file
          const masterDataString = JSON.stringify(proventosValidos);
          localStorage.setItem('proventos_central_master', masterDataString);
          localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
          
          console.log('Master data salvo:', proventosValidos.length, 'proventos');

          // Distribuir para cada ticker
          Object.entries(proventosPorTicker).forEach(([ticker, proventos]) => {
            const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
            const tickerDataString = JSON.stringify(proventosOrdenados);
            localStorage.setItem(`proventos_${ticker}`, tickerDataString);
            console.log(`Dados salvos para ${ticker}:`, proventosOrdenados.length, 'proventos');
          });

        } catch (storageError) {
          console.error('Erro ao salvar no localStorage:', storageError);
          throw new Error('Erro ao salvar dados no navegador');
        }
      }

      // Etapa 5: Finalizar
      console.log('Etapa 5: Finalizando...');
      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      
      setProventosProcessados(proventosValidos);
      setRelatorioImportacao(relatorio);
      
      // Atualizar estatísticas
      await delay(500);
      carregarEstatisticas();

      console.log('Processamento concluído com sucesso!');
      
      // Fechar dialog
      await delay(1000);
      setDialogAberto(false);
      
      // Reset do form
      setArquivoSelecionado(null);
      
      // Mostrar mensagem de sucesso
      alert(`✅ Sucesso!\n\n${proventosValidos.length} proventos processados\n${Object.keys(proventosPorTicker).length} empresas atualizadas`);

    } catch (error) {
      console.error('Erro durante processamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setEtapaProcessamento(`Erro: ${errorMessage}`);
      alert(`❌ Erro ao processar CSV:\n\n${errorMessage}`);
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

  const resetarForm = useCallback(() => {
    setArquivoSelecionado(null);
    setLoading(false);
    setProgresso(0);
    setEtapaProcessamento('');
    
    // Reset do input file
    const fileInput = document.getElementById('upload-csv-central') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
            disabled={loading}
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
              <strong>Formato do CSV aceito:</strong><br/>
              <code>ticker,data,valor,tipo</code> OU <code>ticker;data;valor;tipo</code><br/>
              <code>VALE3,15/03/2024,1.50,Dividendo</code><br/>
              <code>PETR4;20/03/2024;2,30;JCP</code> (aceita R$ e vírgula)
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => {
          if (!loading) {
            setDialogAberto(false);
            resetarForm();
          }
        }} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={loading}
      >
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
              disabled={loading}
            />
            <label htmlFor="upload-csv-central">
              <Button 
                variant={arquivoSelecionado ? 'outlined' : 'contained'}
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                disabled={loading}
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
                  <strong>📊 Tamanho:</strong> {(arquivoSelecionado.size / 1024).toFixed(1)} KB
                </Typography>
              </Alert>
            )}
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
              resetarForm();
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
          .replace(/\s/g, '')          // Remove espaços
          .replace(',', '.')           // Vírgula vira ponto
          .trim();
        
        const valorNum = parseFloat(valorLimpo);
        if (isNaN(valorNum)) {
          erros.push(`Linha ${i + 1}: Valor inválido (${valor} -> ${valorLimpo})`);
          console.log(`Erro linha ${i + 1}: valor inválido`);
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
          console.log(`Erro linha ${i + 1}: data inválida`);
          continue;
        }

        const proventoValido: ProventoCentral = {
          ticker: ticker.toUpperCase(),
          data: data,
          dataObj: dataObj,
          valor: valorNum,
          tipo: tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valorNum)
        };

        proventosValidos.push(proventoValido);
        console.log(`Provento válido adicionado:`, proventoValido);
      }

      console.log(`Processamento concluído: ${proventosValidos.length} proventos válidos, ${erros.length} erros`);
      
      if (erros.length > 0) {
        console.log('Erros encontrados:', erros.slice(0, 5)); // Mostrar apenas os primeiros 5
      }

      if (proventosValidos.length === 0) {
        throw new Error('Nenhum provento válido encontrado no arquivo');
      }

      // Etapa 3: Agrupar por ticker
      console.log('Etapa 3: Agrupando por ticker...');
      setEtapaProcessamento('Agrupando por empresa...');
      setProgresso(60);
      await delay(300);

      const proventosPorTicker: Record<string, ProventoCentral[]> = {};
      
      proventosValidos.forEach(provento => {
        if (!proventosPorTicker[provento.ticker]) {
          proventosPorTicker[provento.ticker] = [];
        }
        proventosPorTicker[provento.ticker].push(provento);
      });

      console.log('Tickers encontrados:', Object.keys(proventosPorTicker));

      // Gerar relatório
      const relatorio: RelatorioImportacao[] = Object.entries(proventosPorTicker).map(([ticker, proventos]) => {
        const totalValor = proventos.reduce((sum, p) => sum + p.valor, 0);
        const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
        const ultimaData = proventosOrdenados[0];
        
        return {
          ticker,
          quantidade: proventos.length,
          totalValor,
          ultimaData: ultimaData.dataFormatada,
          proventos: proventosOrdenados.slice(0, 5)
        };
      });

      // Etapa 4: Salvar dados
      console.log('Etapa 4: Salvando dados...');
      setEtapaProcessamento('Salvando dados...');
      setProgresso(80);
      await delay(300);

      if (typeof window !== 'undefined') {
        try {
          // Salvar master file
          const masterDataString = JSON.stringify(proventosValidos);
          localStorage.setItem('proventos_central_master', masterDataString);
          localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
          
          console.log('Master data salvo:', proventosValidos.length, 'proventos');

          // Distribuir para cada ticker
          Object.entries(proventosPorTicker).forEach(([ticker, proventos]) => {
            const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
            const tickerDataString = JSON.stringify(proventosOrdenados);
            localStorage.setItem(`proventos_${ticker}`, tickerDataString);
            console.log(`Dados salvos para ${ticker}:`, proventosOrdenados.length, 'proventos');
          });

        } catch (storageError) {
          console.error('Erro ao salvar no localStorage:', storageError);
          throw new Error('Erro ao salvar dados no navegador');
        }
      }

      // Etapa 5: Finalizar
      console.log('Etapa 5: Finalizando...');
      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      
      setProventosProcessados(proventosValidos);
      setRelatorioImportacao(relatorio);
      
      // Atualizar estatísticas
      await delay(500);
      carregarEstatisticas();

      console.log('Processamento concluído com sucesso!');
      
      // Fechar dialog
      await delay(1000);
      setDialogAberto(false);
      
      // Reset do form
      setArquivoSelecionado(null);
      
      // Mostrar mensagem de sucesso
      alert(`✅ Sucesso!\n\n${proventosValidos.length} proventos processados\n${Object.keys(proventosPorTicker).length} empresas atualizadas`);

    } catch (error) {
      console.error('Erro durante processamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setEtapaProcessamento(`Erro: ${errorMessage}`);
      alert(`❌ Erro ao processar CSV:\n\n${errorMessage}`);
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

  const resetarForm = useCallback(() => {
    setArquivoSelecionado(null);
    setLoading(false);
    setProgresso(0);
    setEtapaProcessamento('');
    
    // Reset do input file
    const fileInput = document.getElementById('upload-csv-central') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
            disabled={loading}
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
        </CardContent>
      </Card>

      {/* Dialog de Upload */}
      <Dialog 
        open={dialogAberto} 
        onClose={() => {
          if (!loading) {
            setDialogAberto(false);
            resetarForm();
          }
        }} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown={loading}
      >
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
              disabled={loading}
            />
            <label htmlFor="upload-csv-central">
              <Button 
                variant={arquivoSelecionado ? 'outlined' : 'contained'}
                component="span"
                startIcon={<UploadIcon />}
                fullWidth
                disabled={loading}
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
                  <strong>📊 Tamanho:</strong> {(arquivoSelecionado.size / 1024).toFixed(1)} KB
                </Typography>
              </Alert>
            )}
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
              resetarForm();
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
