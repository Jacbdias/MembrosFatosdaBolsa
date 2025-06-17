'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// Ícones mock
const ArrowLeftIcon = () => <span>←</span>;
const TrendUpIcon = () => <span style={{ color: '#22c55e' }}>↗</span>;
const TrendDownIcon = () => <span style={{ color: '#ef4444' }}>↘</span>;
const RefreshIcon = () => <span>🔄</span>;
const WarningIcon = () => <span>⚠</span>;
const CheckIcon = () => <span>✓</span>;
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;
const ViewIcon = () => <span>👁</span>;
const CloseIcon = () => <span>✕</span>;

// Token da API
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
  dy?: number;
}

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
  tipo?: 'FII';
  gestora?: string;
  dadosFinanceiros?: DadosFinanceiros;
  statusApi?: string;
  ultimaAtualizacao?: string;
}

interface Relatorio {
  id: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataUpload: string;
  dataReferencia: string;
  arquivo?: string;
  linkCanva?: string;
  linkExterno?: string;
  tamanho?: string;
  tipoVisualizacao: 'pdf' | 'iframe' | 'canva' | 'link';
}

// Hook para buscar dados financeiros
function useDadosFinanceiros(ticker: string) {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  const buscarDados = React.useCallback(async () => {
    if (!ticker) return;

    try {
      setLoading(true);
      setError(null);

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true`;
      
      const response = await fetch(quoteUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-Details-App',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const quote = data.results[0];
          
          const precoAtual = quote.regularMarketPrice || quote.currentPrice || quote.price || 0;
          const dividendYield = quote.dividendYield || 0;

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: precoAtual,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            dy: dividendYield,
            marketCap: quote.marketCap,
            pl: quote.priceEarnings || quote.pe
          };

          setDadosFinanceiros(dadosProcessados);
          setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
          
        } else {
          throw new Error('Nenhum resultado encontrado');
        }
      } else {
        throw new Error(`Erro HTTP ${response.status}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

// Função para calcular viés
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  try {
    const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace('.', '').replace(',', '.'));
    
    if (isNaN(precoTetoNum) || precoAtual <= 0) {
      return 'Aguardar';
    }
    
    const percentualDoTeto = (precoAtual / precoTetoNum) * 100;
    
    if (percentualDoTeto <= 80) {
      return 'Compra Forte';
    } else if (percentualDoTeto <= 95) {
      return 'Compra';
    } else if (percentualDoTeto <= 105) {
      return 'Neutro';
    } else if (percentualDoTeto <= 120) {
      return 'Aguardar';
    } else {
      return 'Venda';
    }
  } catch {
    return 'Aguardar';
  }
}

// Função para formatar valores
function formatarValor(valor: number | undefined, tipo: 'currency' | 'percent' | 'number' | 'millions' = 'currency'): string {
  if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
  
  switch (tipo) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(valor);
    
    case 'percent':
      return `${valor.toFixed(2).replace('.', ',')}%`;
    
    case 'millions':
      if (valor >= 1000000000) {
        return `R$ ${(valor / 1000000000).toFixed(1).replace('.', ',')} bi`;
      } else if (valor >= 1000000) {
        return `R$ ${(valor / 1000000).toFixed(1).replace('.', ',')} mi`;
      } else {
        return formatarValor(valor, 'currency');
      }
    
    case 'number':
      return valor.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    
    default:
      return valor.toString();
  }
}

// Componente de métrica
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  showInfo = false
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  showInfo?: boolean;
}) => (
  <Card sx={{ 
    borderRadius: 3,
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    '&:hover': { 
      transform: 'translateY(-4px)', 
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)' 
    },
    height: '100%'
  }}>
    <Box sx={{ 
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      py: 2,
      px: 2.5,
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ 
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: '#64748b'
        }}>
          {title}
        </Typography>
        {showInfo && (
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            border: '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#64748b',
            backgroundColor: 'white'
          }}>
            ?
          </Box>
        )}
      </Stack>
    </Box>

    <CardContent sx={{ 
      backgroundColor: 'white',
      p: 3,
      textAlign: 'center',
      '&:last-child': { pb: 3 }
    }}>
      {loading ? (
        <Skeleton variant="text" height={50} />
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              fontSize: '2rem',
              color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#1e293b',
              lineHeight: 1,
              letterSpacing: '-0.5px'
            }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ ml: 0.5 }}>
                {trend === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
              </Box>
            )}
          </Stack>
          
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#64748b',
              fontSize: '0.75rem',
              display: 'block',
              mt: 1,
              lineHeight: 1.3,
              fontWeight: 500
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
));

// Componente para histórico de dividendos - OTIMIZADO
const HistoricoDividendos = React.memo(({ ticker, dataEntrada }: { ticker: string; dataEntrada: string }) => {
  const [proventos, setProventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticker && typeof window !== 'undefined') {
      const chaveStorage = `proventos_${ticker}`;
      const dadosSalvos = localStorage.getItem(chaveStorage);
      
      if (dadosSalvos) {
        try {
          const proventosSalvos = JSON.parse(dadosSalvos);
          // Otimização: Limitar dados carregados
          const proventosLimitados = proventosSalvos.slice(0, 500).map((item: any) => ({
            ...item,
            dataObj: new Date(item.dataObj)
          }));
          setProventos(proventosLimitados);
        } catch (err) {
          console.error('Erro ao carregar proventos salvos:', err);
          localStorage.removeItem(chaveStorage);
        }
      }
    }
  }, [ticker]);

  const salvarProventos = useCallback((novosProventos: any[]) => {
    if (ticker && typeof window !== 'undefined') {
      const chaveStorage = `proventos_${ticker}`;
      // Otimização: Salvar apenas dados essenciais
      const dadosMinimos = novosProventos.slice(0, 500).map(item => ({
        ticker: item.ticker,
        data: item.data,
        dataObj: item.dataObj,
        valor: item.valor,
        tipo: item.tipo,
        dataFormatada: item.dataFormatada,
        valorFormatado: item.valorFormatado
      }));
      localStorage.setItem(chaveStorage, JSON.stringify(dadosMinimos));
    }
  }, [ticker]);

  const limparProventos = useCallback(() => {
    if (ticker && typeof window !== 'undefined') {
      const chaveStorage = `proventos_${ticker}`;
      localStorage.removeItem(chaveStorage);
      setProventos([]);
      setError(null);
    }
  }, [ticker]);

  const handleArquivoCSV = useCallback((file: File) => {
    // Otimização: Limite de tamanho
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const linhas = text.split('\n').filter(linha => linha.trim());
        
        if (linhas.length < 2) {
          throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');
        }

        if (linhas.length > 5000) {
          alert('CSV muito grande. Máximo 5000 linhas.');
          return;
        }

        const dados = linhas
          .slice(1)
          .slice(0, 1000) // Limitar a 1000 registros
          .map((linha, index) => {
            const partes = linha.split(',').map(p => p.trim().replace(/"/g, ''));
            
            if (partes.length < 4) return null;

            const [csvTicker, data, valor, tipo] = partes;
            
            if (!csvTicker || !data || !valor || !tipo) return null;
            
            // Validação segura antes de usar toUpperCase()
            if (!csvTicker || typeof csvTicker !== 'string' || csvTicker.trim() === '') {
                return null;
            }

            if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
                return null;
            }

            // Agora é seguro usar toUpperCase()
            const tickerLimpo = csvTicker.trim().toUpperCase();
            const tickerAtual = ticker.trim().toUpperCase();

            if (tickerLimpo !== tickerAtual) {
                return null;
            }

            const valorNum = parseFloat(valor.replace(',', '.'));
            if (isNaN(valorNum)) return null;

            let dataObj;
            try {
              if (data.includes('/')) {
                const [dia, mes, ano] = data.split('/');
                dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
              } else if (data.includes('-')) {
                dataObj = new Date(data);
              } else {
                throw new Error('Formato de data não reconhecido');
              }
              
              if (isNaN(dataObj.getTime())) {
                throw new Error('Data inválida');
              }
            } catch {
              return null;
            }

            return {
              ticker: csvTicker.toUpperCase(),
              data: data,
              dataObj: dataObj,
              valor: valorNum,
              tipo: tipo || 'Dividendo',
              dataFormatada: dataObj.toLocaleDateString('pt-BR'),
              valorFormatado: `R$ ${valorNum.toFixed(2).replace('.', ',')}`
            };
          })
          .filter(item => item !== null);

        let dadosFiltrados = dados;
        if (dataEntrada) {
          try {
            const dataEntradaObj = new Date(dataEntrada.split('/').reverse().join('-'));
            dadosFiltrados = dados.filter(item => item.dataObj >= dataEntradaObj);
          } catch (err) {
            console.warn('Erro ao filtrar por data de entrada:', err);
          }
        }

        dadosFiltrados.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());

        setProventos(dadosFiltrados);
        salvarProventos(dadosFiltrados);
        
        if (dadosFiltrados.length === 0) {
          setError(`Nenhum provento encontrado para ${ticker} após ${dataEntrada || 'a data de entrada'}`);
        } else {
          setError(null);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo CSV';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file, 'UTF-8');
  }, [ticker, dataEntrada, salvarProventos]);

  // Cálculos memoizados
  const { totalProventos, mediaProvento, ultimoProvento, totalPorAno } = useMemo(() => {
    const total = proventos.reduce((sum, item) => sum + item.valor, 0);
    const media = proventos.length > 0 ? total / proventos.length : 0;
    const ultimo = proventos.length > 0 ? proventos[0] : null;

    const proventosPorAno = proventos.reduce((acc, item) => {
      const ano = item.dataObj.getFullYear().toString();
      if (!acc[ano]) acc[ano] = [];
      acc[ano].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    const totalAno = Object.entries(proventosPorAno).map(([ano, items]) => ({
      ano,
      total: items.reduce((sum, item) => sum + item.valor, 0),
      quantidade: items.length
    })).sort((a, b) => parseInt(b.ano) - parseInt(a.ano));

    return {
      totalProventos: total,
      mediaProvento: media,
      ultimoProvento: ultimo,
      totalPorAno: totalAno
    };
  }, [proventos]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💰 Histórico de Proventos
          </Typography>
          <Stack direction="row" spacing={1}>
            {proventos.length > 0 && (
              <Button 
                variant="outlined" 
                size="small" 
                color="error"
                onClick={limparProventos}
                sx={{ mr: 1 }}
              >
                🗑️ Limpar
              </Button>
            )}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleArquivoCSV(file);
              }}
              style={{ display: 'none' }}
              id="upload-proventos-csv"
            />
            <label htmlFor="upload-proventos-csv">
              <Button 
                component="span" 
                variant="outlined" 
                size="small" 
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Carregar CSV'}
              </Button>
            </label>
          </Stack>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Formato CSV:</strong> ticker,data,valor,tipo
          </Typography>
          <Typography variant="caption">
            Máximo 5MB e 5000 linhas
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {proventos.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum provento carregado para {ticker}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              📅 Data de entrada: {dataEntrada}
            </Typography>
          </Box>
        ) : (
          <>
            {proventos.length > 0 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                💾 <strong>{proventos.length} proventos carregados</strong>
              </Alert>
            )}

            {/* Resumo compacto */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0f9ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0ea5e9' }}>
                    {proventos.length}
                  </Typography>
                  <Typography variant="caption">Pagamentos</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e' }}>
                    {formatarValor(totalProventos).replace('R$ ', '')}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fefce8', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#eab308' }}>
                    {formatarValor(mediaProvento).replace('R$ ', '')}
                  </Typography>
                  <Typography variant="caption">Média</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fdf4ff', borderRadius: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#a855f7' }}>
                    {ultimoProvento ? ultimoProvento.dataFormatada.replace(/\/\d{4}/, '') : 'N/A'}
                  </Typography>
                  <Typography variant="caption">Último</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Histórico simplificado */}
            <TableContainer sx={{ backgroundColor: 'white', borderRadius: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Valor</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proventos.slice(0, 10).map((provento, index) => (
                    <TableRow key={`${provento.data}-${index}`}>
                      <TableCell sx={{ fontWeight: 500 }}>{provento.dataFormatada}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#22c55e' }}>
                        {provento.valorFormatado}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={provento.tipo}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {proventos.length > 10 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Mostrando os 10 mais recentes • Total: {proventos.length}
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

// Componente para gerenciar relatórios - OTIMIZADO
const GerenciadorRelatorios = React.memo(({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(1);
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    tipo: 'trimestral' as const,
    dataReferencia: '',
    arquivo: null as File | null,
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe' as const
  });

  useEffect(() => {
    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = localStorage.getItem(chave);
    
    if (relatoriosExistentes) {
      try {
        const dadosSalvos = JSON.parse(relatoriosExistentes);
        // Adiciona validação para garantir que os dados são um array
        if(Array.isArray(dadosSalvos)) {
            setRelatorios(dadosSalvos);
        }
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      }
    }
  }, [ticker]);

  const salvarRelatorio = useCallback(() => {
    if (!novoRelatorio.nome) {
      alert('Digite o nome do relatório');
      return;
    }

    const relatorio: Relatorio = {
      id: Date.now().toString(),
      nome: novoRelatorio.nome,
      tipo: novoRelatorio.tipo,
      dataUpload: new Date().toISOString(),
      dataReferencia: novoRelatorio.dataReferencia,
      tipoVisualizacao: novoRelatorio.tipoVisualizacao,
      linkCanva: novoRelatorio.linkCanva || undefined,
      linkExterno: novoRelatorio.linkExterno || undefined,
      tamanho: novoRelatorio.arquivo ? `${(novoRelatorio.arquivo.size / 1024 / 1024).toFixed(1)} MB` : undefined
    };

    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = JSON.parse(localStorage.getItem(chave) || '[]');
    relatoriosExistentes.push(relatorio);
    localStorage.setItem(chave, JSON.stringify(relatoriosExistentes));
    
    setRelatorios(relatoriosExistentes);
    setDialogAberto(false);
    setNovoRelatorio({
      nome: '',
      tipo: 'trimestral',
      dataReferencia: '',
      arquivo: null,
      linkCanva: '',
      linkExterno: '',
      tipoVisualizacao: 'iframe'
    });
    setTabAtiva(1);
  }, [novoRelatorio, ticker]);

  const excluirRelatorio = useCallback((id: string) => {
    if (confirm('Excluir relatório?')) {
      const chave = `relatorios_${ticker}`;
      const relatoriosAtualizados = relatorios.filter(r => r.id !== id);
      localStorage.setItem(chave, JSON.stringify(relatoriosAtualizados));
      setRelatorios(relatoriosAtualizados);
    }
  }, [relatorios, ticker]);

  const getIconePorTipo = useCallback((tipo: string) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  }, []);

  const renderVisualizador = useMemo(() => {
    if (!relatorioSelecionado) return null;

    const handleIframeLoad = () => setLoadingIframe(false);

    switch (relatorioSelecionado.tipoVisualizacao) {
      case 'iframe':
      case 'canva':
      case 'link':
        const src = relatorioSelecionado.tipoVisualizacao === 'canva' 
          ? (relatorioSelecionado.linkCanva?.includes('/embed') 
              ? relatorioSelecionado.linkCanva 
              : relatorioSelecionado.linkCanva?.replace('/design/', '/embed/') + '?embed')
          : relatorioSelecionado.linkExterno;

        return (
          <Box sx={{ position: 'relative', height: '80vh' }}>
            {loadingIframe && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1
              }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Carregando...
                </Typography>
              </Box>
            )}
            <iframe
              src={src}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              allowFullScreen
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FileIcon style={{ fontSize: '4rem', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Tipo não suportado
            </Typography>
          </Box>
        );
    }
  }, [relatorioSelecionado, loadingIframe]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📄 Relatórios e Apresentações
          </Typography>
          <Button 
            startIcon={<UploadIcon />}
            onClick={() => setDialogAberto(true)}
            variant="contained"
            size="small"
          >
            Adicionar Conteúdo
          </Button>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <FileIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Nenhum relatório cadastrado
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Adicione apresentações do Canva ou qualquer conteúdo via iframe
            </Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} divider sx={{ px: 0, py: 2 }}>
                <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                  {getIconePorTipo(relatorio.tipoVisualizacao)}
                </Box>
                <ListItemText
                  primary={relatorio.nome}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip 
                        label={relatorio.tipo} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      {/* ############# INÍCIO DA CORREÇÃO ############# */}
                      <Chip 
                        label={relatorio.tipoVisualizacao?.toUpperCase() || 'N/D'} 
                        size="small" 
                        color="primary"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      {/* ############# FIM DA CORREÇÃO ############# */}
                      <Typography variant="caption" color="text.secondary">
                        {relatorio.dataReferencia}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => {
                        setRelatorioSelecionado(relatorio);
                        setLoadingIframe(true);
                        setDialogVisualizacao(true);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => excluirRelatorio(relatorio.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog compacto para adicionar */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Conteúdo</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nome"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                fullWidth
                required
              />
              
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
                  label="Tipo"
                >
                  <MenuItem value="trimestral">Trimestral</MenuItem>
                  <MenuItem value="anual">Anual</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="outros">Outros</MenuItem>
                </Select>
              </FormControl>
              
              {/* Mais campos do formulário aqui... */}
              
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button onClick={salvarRelatorio} variant="contained">Salvar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para visualizar */}
        <Dialog open={dialogVisualizacao} onClose={() => setDialogVisualizacao(false)} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {relatorioSelecionado?.nome || 'Visualizador'}
                    <IconButton onClick={() => setDialogVisualizacao(false)}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                {renderVisualizador}
            </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
});

// Mock do componente principal da página para o código funcionar
export default function EmpresaPage() {
    const params = useParams();
    const ticker = Array.isArray(params.ticker) ? params.ticker[0] : params.ticker;

    // Dados mock para o exemplo
    const empresa: EmpresaCompleta | null = ticker ? {
        ticker: ticker,
        nomeCompleto: 'Allos',
        setor: 'Shoppings',
        descricao: 'Descrição da empresa Allos...',
        avatar: '',
        dataEntrada: '01/01/2023',
        precoIniciou: 'R$ 20,00',
        precoTeto: 'R$ 30,00',
        viesAtual: 'Compra',
        ibovespaEpoca: '110.000',
        percentualCarteira: '5%',
    } : null;

    const { dadosFinanceiros, loading: loadingFinanceiro, error: errorFinanceiro, refetch, ultimaAtualizacao } = useDadosFinanceiros(empresa?.ticker || '');
  
    if (!empresa) {
        return (
            <Box sx={{ p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={4}>
                {/* Aqui viriam os outros componentes como Header, MetricCards etc. */}
                <Typography variant="h4">{empresa.nomeCompleto} ({empresa.ticker})</Typography>
                
                <HistoricoDividendos ticker={empresa.ticker} dataEntrada={empresa.dataEntrada} />
                <GerenciadorRelatorios ticker={empresa.ticker} />
            </Stack>
        </Box>
    );
}
