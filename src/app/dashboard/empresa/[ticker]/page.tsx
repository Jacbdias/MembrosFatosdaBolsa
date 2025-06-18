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

// ========================================
// ÍCONES MOCK
// ========================================
const ArrowLeftIcon = () => <span>←</span>;
const TrendUpIcon = () => <span style={{ color: '#22c55e' }}>↗</span>;
const TrendDownIcon = () => <span style={{ color: '#ef4444' }}>↘</span>;
const RefreshIcon = () => <span>🔄</span>;
const WarningIcon = () => <span>⚠</span>;
const CheckIcon = () => <span>✓</span>;
const UploadIcon = () => <span>📤</span>;
const DownloadIconCustom = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;
const ViewIcon = () => <span>👁</span>;
const CloseIcon = () => <span>✕</span>;
const CloudUploadIconCustom = () => <span>☁️</span>;
const PictureAsPdfIconCustom = () => <span>📄</span>;

// ========================================
// CONSTANTES E CONFIGURAÇÕES
// ========================================
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

// ========================================
// INTERFACES E TIPOS
// ========================================
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

export type TipoVisualizacao = 'iframe' | 'canva' | 'link' | 'pdf';

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
  tipoVisualizacao: TipoVisualizacao;
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  dataUploadPdf?: string;
}

// ========================================
// DADOS DE FALLBACK
// ========================================
const dadosFallback: { [key: string]: EmpresaCompleta } = {
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Shoppings',
    descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '108.500',
    percentualCarteira: '4.2%'
  }
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
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

// ========================================
// HOOK PERSONALIZADO - DADOS FINANCEIROS
// ========================================
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

// ========================================
// COMPONENTE DE MÉTRICA
// ========================================
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

// ========================================
// COMPONENTE HISTÓRICO DE DIVIDENDOS
// ========================================
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
    if (file.size > 5 * 1024 * 1024) {
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
          .slice(0, 1000)
          .map((linha, index) => {
            const partes = linha.split(',').map(p => p.trim().replace(/"/g, ''));
            
            if (partes.length < 4) return null;

            const [csvTicker, data, valor, tipo] = partes;
            
            if (!csvTicker || !data || !valor || !tipo) return null;
           
            if (!csvTicker || typeof csvTicker !== 'string' || csvTicker.trim() === '') {
              return null;
            }

            if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
              return null;
            }

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

// ========================================
// COMPONENTE GERENCIADOR DE RELATÓRIOS
// ========================================
const GerenciadorRelatorios = React.memo(({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
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

  const [arquivoPdfSelecionado, setArquivoPdfSelecionado] = useState<File | null>(null);

  // FUNÇÃO PARA DOWNLOAD DE PDF
  const baixarPdf = useCallback((relatorio: Relatorio) => {
    console.log('⬇️ Iniciando download do PDF...');
    console.log('Relatório:', relatorio.nome);
    
    if (!relatorio.arquivoPdf) {
      alert('❌ Arquivo PDF não encontrado!');
      console.error('❌ URL do PDF não existe');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = relatorio.arquivoPdf;
      link.download = relatorio.nomeArquivoPdf || `${relatorio.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ Download iniciado com sucesso');
      
      // Feedback visual
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #22c55e;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      toast.textContent = '📥 Download iniciado!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro no download:', error);
      alert('❌ Erro ao baixar o arquivo. Tente novamente.');
    }
  }, []);
  
  useEffect(() => {
    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = localStorage.getItem(chave);
    
    if (relatoriosExistentes) {
      try {
        setRelatorios(JSON.parse(relatoriosExistentes));
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      }
    }
  }, [ticker]);

  useEffect(() => {
    if (relatorioSelecionado) {
      setTimeoutError(false);
      setLoadingIframe(true);
      
      const timer = setTimeout(() => {
        setLoadingIframe(false);
        setTimeoutError(true);
      }, 60000);
      
      return () => clearTimeout(timer);
    }
  }, [relatorioSelecionado]);

  const handleUploadPdf = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    
    if (!arquivo) {
      console.log('❌ Nenhum arquivo selecionado');
      return;
    }
    
    if (arquivo.type !== 'application/pdf') {
      console.error('❌ Arquivo deve ser PDF');
      alert('Por favor, selecione apenas arquivos PDF');
      event.target.value = '';
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > maxSize) {
      console.error('❌ Arquivo muito grande (máximo 10MB)');
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    
    console.log('✅ PDF selecionado:', arquivo.name);
    console.log('📊 Tamanho:', (arquivo.size / 1024 / 1024).toFixed(2), 'MB');
    setArquivoPdfSelecionado(arquivo);
  }, []);

  const salvarPdfNoServidor = useCallback(async (arquivo: File): Promise<string> => {
    console.log('💾 Processando PDF para armazenamento local...');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const urlLocal = URL.createObjectURL(arquivo);
      console.log('✅ PDF processado com URL local:', urlLocal);
      
      return urlLocal;
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      throw new Error('Erro ao processar arquivo PDF');
    }
  }, []);

  const salvarRelatorio = useCallback(async () => {
    if (!novoRelatorio.nome) {
      alert('Digite o nome do relatório');
      return;
    }

    try {
      let relatorioParaSalvar: any = { ...novoRelatorio };
      
      if (novoRelatorio.tipoVisualizacao === 'pdf') {
        if (!arquivoPdfSelecionado) {
          alert('Por favor, selecione um arquivo PDF');
          return;
        }
        
        console.log('📄 Fazendo upload do PDF...');
        const urlPdf = await salvarPdfNoServidor(arquivoPdfSelecionado);
        
        relatorioParaSalvar = {
          ...relatorioParaSalvar,
          arquivoPdf: urlPdf,
          nomeArquivoPdf: arquivoPdfSelecionado.name,
          tamanhoArquivo: arquivoPdfSelecionado.size,
          dataUploadPdf: new Date().toISOString(),
        };
        
        console.log('✅ PDF salvo com sucesso:', urlPdf);
      }

      const relatorio: Relatorio = {
        id: Date.now().toString(),
        nome: relatorioParaSalvar.nome,
        tipo: relatorioParaSalvar.tipo,
        dataUpload: new Date().toISOString(),
        dataReferencia: relatorioParaSalvar.dataReferencia,
        tipoVisualizacao: relatorioParaSalvar.tipoVisualizacao,
        linkCanva: relatorioParaSalvar.linkCanva || undefined,
        linkExterno: relatorioParaSalvar.linkExterno || undefined,
        tamanho: relatorioParaSalvar.arquivo ? `${(relatorioParaSalvar.arquivo.size / 1024 / 1024).toFixed(1)} MB` : undefined,
        arquivoPdf: relatorioParaSalvar.arquivoPdf,
        nomeArquivoPdf: relatorioParaSalvar.nomeArquivoPdf,
        tamanhoArquivo: relatorioParaSalvar.tamanhoArquivo,
        dataUploadPdf: relatorioParaSalvar.dataUploadPdf
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
      setArquivoPdfSelecionado(null);
      setTabAtiva(1);
      
    } catch (error) {
      console.error('❌ Erro ao salvar relatório:', error);
      alert('Erro ao salvar relatório. Tente novamente.');
    }
  }, [novoRelatorio, ticker, arquivoPdfSelecionado, salvarPdfNoServidor]);

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

    const processarUrl = (url: string, tipo: string): string => {
      console.log('🔍 DEBUG - processarUrl chamada');
      console.log('URL original:', url);
      console.log('Tipo:', tipo);
      
      if (!url) {
        console.log('❌ URL vazia!');
        return '';
      }
      
      try {
        if (tipo === 'canva' || url.includes('canva.com')) {
          console.log('🎨 Processando URL do Canva...');
          
          if (url.includes('?embed')) {
            console.log('✅ URL já tem ?embed, usando diretamente:', url);
            return url;
          }
          
          if (url.includes('/view')) {
            const urlComEmbed = url + '?embed';
            console.log('✅ Adicionando ?embed à URL /view:', urlComEmbed);
            return urlComEmbed;
          }
          
          if (url.includes('/design/') && !url.includes('/view')) {
            const urlView = url.replace(/\/(edit|preview).*$/, '/view?embed');
            console.log('✅ Convertendo para /view?embed:', urlView);
            return urlView;
          }
          
          console.log('⚠️ URL do Canva não reconhecida, usando original:', url);
          return url;
        }
        
        console.log('🔗 Processando URL genérica...');
        return url;
        
      } catch (error) {
        console.error('❌ Erro ao processar URL:', error);
        return url;
      }
    };

    const handleIframeLoad = () => {
      console.log('✅ Iframe carregou com sucesso!');
      setLoadingIframe(false);
      setTimeoutError(false);
    };

    const handleIframeError = () => {
      console.log('❌ Erro no iframe detectado');
      setLoadingIframe(false);
      setTimeoutError(true);
    };

    const src = relatorioSelecionado.tipoVisualizacao === 'canva' 
      ? processarUrl(relatorioSelecionado.linkCanva || '', 'canva')
      : processarUrl(relatorioSelecionado.linkExterno || '', relatorioSelecionado.tipoVisualizacao);

    if (!src) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error" sx={{ mb: 2 }}>
            ⚠️ URL não encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nenhuma URL foi configurada para este relatório.
          </Typography>
        </Box>
      );
    }

    if (relatorioSelecionado.tipoVisualizacao === 'pdf') {
      return (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'grey.50',
          borderRadius: 1,
          p: 4
        }}>
          <Box sx={{ fontSize: 80, color: '#ef4444', mb: 2, textAlign: 'center' }}>
            <PictureAsPdfIconCustom />
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
            📄 {relatorioSelecionado.nome}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {relatorioSelecionado.tipo} • {relatorioSelecionado.dataReferencia}
          </Typography>
          
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1, 
            border: 1, 
            borderColor: 'divider',
            mb: 3,
            minWidth: 300
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📋 Informações do Arquivo:
            </Typography>
            <Typography variant="body2">
              <strong>📄 Nome:</strong> {relatorioSelecionado.nomeArquivoPdf || 'Arquivo PDF'}<br/>
              {relatorioSelecionado.tamanhoArquivo && (
                <>
                  <strong>📊 Tamanho:</strong> {(relatorioSelecionado.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB<br/>
                </>
              )}
              {relatorioSelecionado.dataUploadPdf && (
                <>
                  <strong>📅 Upload:</strong> {new Date(relatorioSelecionado.dataUploadPdf).toLocaleDateString('pt-BR')}<br/>
                </>
              )}
            </Typography>
          </Box>
          
          <Button 
            variant="contained"
            color="success"
            size="large"
            startIcon={<DownloadIconCustom />}
            onClick={() => {
              console.log('⬇️ Botão de download clicado');
              baixarPdf(relatorioSelecionado);
            }}
            sx={{ py: 1.5, px: 4 }}
          >
            ⬇️ Baixar PDF
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
            💡 Clique no botão acima para fazer o download do arquivo
          </Typography>
        </Box>
      );
    }

    switch (relatorioSelecionado.tipoVisualizacao) {
      case 'iframe':
      case 'canva':
      case 'link':
        return (
          <Box sx={{ position: 'relative', height: '80vh' }}>
            
            {loadingIframe && !timeoutError && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                textAlign: 'center'
              }}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Carregando conteúdo...
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {relatorioSelecionado.tipoVisualizacao.toUpperCase()}
                </Typography>
              </Box>
            )}

            {timeoutError && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 2,
                textAlign: 'center',
                maxWidth: 400,
                p: 3
              }}>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                  ⚠️ Erro ao Carregar
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  O conteúdo não pôde ser carregado. Isso pode acontecer se:
                </Typography>
                <ul style={{ textAlign: 'left', fontSize: '0.875rem', color: '#666' }}>
                  <li>A URL não permite incorporação (iframe)</li>
                  <li>O site tem restrições de segurança</li>
                  <li>A conexão está lenta</li>
                  <li>A URL está incorreta</li>
                </ul>
                
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setTimeoutError(false);
                      setLoadingIframe(true);
                      const iframe = document.querySelector('iframe[data-report-src]') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    size="small"
                  >
                    🔄 Tentar Novamente
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => {
                      console.log('🔗 Clique no botão Nova Aba');
                      console.log('relatorioSelecionado:', relatorioSelecionado);
                      console.log('src calculado:', src);
                      
                      let urlParaAbrir = '';
                      
                      if (relatorioSelecionado.tipoVisualizacao === 'canva') {
                        urlParaAbrir = relatorioSelecionado.linkCanva || '';
                        console.log('URL do Canva (original):', urlParaAbrir);
                        
                        if (urlParaAbrir.includes('?embed')) {
                          urlParaAbrir = urlParaAbrir.replace('?embed', '');
                          console.log('URL sem ?embed para nova aba:', urlParaAbrir);
                        }
                      } else {
                        urlParaAbrir = relatorioSelecionado.linkExterno || '';
                      }
                      
                      console.log('URL final para nova aba:', urlParaAbrir);
                      
                      if (urlParaAbrir) {
                        try {
                          window.open(urlParaAbrir, '_blank', 'noopener,noreferrer');
                          console.log('✅ Nova aba aberta');
                        } catch (error) {
                          console.error('❌ Erro ao abrir nova aba:', error);
                        }
                      } else {
                        console.error('❌ URL vazia para nova aba');
                      }
                    }}
                    size="small"
                  >
                    🔗 Abrir em Nova Aba
                  </Button>
                </Stack>
              </Box>
            )}

            <iframe
              data-report-src={src}
              src={src}
              style={{ 
                width: '100%', 
                height: '100%', 
                border: 'none', 
                borderRadius: '8px',
                opacity: timeoutError ? 0.3 : 1
              }}
              allowFullScreen
              onLoad={() => {
                console.log('🎯 Iframe onLoad disparado');
                handleIframeLoad();
              }}
              onError={() => {
                console.log('🚨 Iframe onError disparado');
                handleIframeError();
              }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
            
            {!loadingIframe && !timeoutError && (
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                zIndex: 1
              }}>
                <IconButton
                  size="small"
                  onClick={() => window.open(src, '_blank')}
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                  }}
                  title="Abrir em nova aba"
                >
                  🔗
                </IconButton>
              </Box>
            )}
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FileIcon style={{ fontSize: '4rem', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Tipo não suportado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Tipo: {relatorioSelecionado.tipoVisualizacao}
            </Typography>
            <Button 
              variant="outlined"
              onClick={() => window.open(src, '_blank')}
              sx={{ mt: 2 }}
              size="small"
            >
              🔗 Abrir Link Direto
            </Button>
          </Box>
        );
    }
  }, [relatorioSelecionado, loadingIframe, timeoutError, baixarPdf]);

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📋 Relatórios da Empresa
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                alert(`💡 FUNCIONALIDADES DISPONÍVEIS:

🖼️ Iframe Genérico - Para sites que permitem iframe
🎨 Canva - Para designs do Canva
🔗 Link Externo - Abre em nova aba
📄 PDF - Upload e download de arquivos PDF

📄 SISTEMA PDF:
• Faça upload de PDFs até 10MB
• Download direto do arquivo
• Armazenamento local no navegador
• Feedback visual do processo`);
              }}
            >
              💡 Como Funciona
            </Button>
            <Button 
              variant="contained" 
              onClick={() => setDialogAberto(true)}
              size="small"
            >
              + Adicionar Relatório
            </Button>
          </Stack>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum relatório cadastrado para {ticker}
            </Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} sx={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: 2, 
                mb: 1,
                backgroundColor: 'white',
                '&:hover': { backgroundColor: '#f8fafc' }
              }}>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{getIconePorTipo(relatorio.tipoVisualizacao)}</span>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {relatorio.nome}
                      </Typography>
                      {relatorio.tipoVisualizacao === 'pdf' && (
                        <Chip 
                          label="PDF" 
                          size="small" 
                          color="error" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        {relatorio.tipo} • {relatorio.dataReferencia}
                      </Typography>
                      {relatorio.tipoVisualizacao === 'pdf' && relatorio.tamanhoArquivo && (
                        <Typography variant="caption" color="text.secondary">
                          📊 {(relatorio.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      )}
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    {relatorio.tipoVisualizacao === 'pdf' ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => baixarPdf(relatorio)}
                        startIcon={<DownloadIconCustom />}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        Download
                      </Button>
                    ) : (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setRelatorioSelecionado(relatorio);
                          setDialogVisualizacao(true);
                        }}
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          '&:hover': { backgroundColor: '#bbdefb' }
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => excluirRelatorio(relatorio.id)}
                      color="error"
                      sx={{ 
                        backgroundColor: '#ffebee',
                        '&:hover': { backgroundColor: '#ffcdd2' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog para adicionar relatório */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Relatório</DialogTitle>
          <DialogContent>
            <Tabs value={tabAtiva} onChange={(_, newValue) => setTabAtiva(newValue)} sx={{ mb: 3 }}>
              <Tab label="Informações Básicas" />
              <Tab label="Link/URL" />
            </Tabs>

            {tabAtiva === 0 && (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Nome do Relatório"
                  value={novoRelatorio.nome}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                />
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={novoRelatorio.tipo}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
                  >
                    <MenuItem value="trimestral">Trimestral</MenuItem>
                    <MenuItem value="anual">Anual</MenuItem>
                    <MenuItem value="apresentacao">Apresentação</MenuItem>
                    <MenuItem value="outros">Outros</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Data de Referência"
                  value={novoRelatorio.dataReferencia}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, dataReferencia: e.target.value }))}
                  placeholder="Ex: Q1 2024"
                />
              </Stack>
            )}

            {tabAtiva === 1 && (
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Visualização</InputLabel>
                  <Select
                    value={novoRelatorio.tipoVisualizacao}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipoVisualizacao: e.target.value as any }))}
                  >
                    <MenuItem value="iframe">🖼️ Iframe Genérico</MenuItem>
                    <MenuItem value="canva">🎨 Canva</MenuItem>
                    <MenuItem value="link">🔗 Link Externo</MenuItem>
                    <MenuItem value="pdf">📄 PDF para Download</MenuItem>
                  </Select>
                </FormControl>

                {novoRelatorio.tipoVisualizacao === 'canva' && (
                  <TextField
                    fullWidth
                    label="Link do Canva"
                    value={novoRelatorio.linkCanva}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkCanva: e.target.value }))}
                    placeholder="https://www.canva.com/design/..."
                    helperText="Cole o link do seu design no Canva"
                  />
                )}

                {(novoRelatorio.tipoVisualizacao === 'iframe' || novoRelatorio.tipoVisualizacao === 'link') && (
                  <TextField
                    fullWidth
                    label="Link Externo"
                    value={novoRelatorio.linkExterno}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkExterno: e.target.value }))}
                    placeholder="https://..."
                    helperText="URL do documento ou apresentação"
                  />
                )}
                
{novoRelatorio.tipoVisualizacao !== 'canva' && (
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#d32f2f' }}>
      📄 Upload de Arquivo PDF (Opcional)
    </Typography>
                    
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>📋 Instruções:</strong><br/>
- {novoRelatorio.tipoVisualizacao === 'pdf' ? 'Arquivo PDF obrigatório para este tipo' : 'Arquivo PDF opcional - complementa a visualização'}<br/>
- Selecione arquivos PDF até 10MB<br/>
- {novoRelatorio.tipoVisualizacao === 'pdf' ? 'Só download disponível' : 'Visualização + download disponíveis'}<br/>
- Formatos aceitos: .pdf apenas
                      </Typography>
                    </Alert>
                    
                    <input
                      accept="application/pdf"
                      style={{ display: 'none' }}
                      id="upload-pdf-input"
                      type="file"
                      onChange={handleUploadPdf}
                    />
                    <label htmlFor="upload-pdf-input">
                      <Button 
                        variant={arquivoPdfSelecionado ? 'outlined' : 'contained'}
                        component="span"
                        startIcon={<CloudUploadIconCustom />}
                        fullWidth
                        sx={{ 
                          mb: 2, 
                          py: 2,
                          backgroundColor: arquivoPdfSelecionado ? '#e8f5e8' : undefined,
                          borderColor: arquivoPdfSelecionado ? '#22c55e' : undefined,
                          color: arquivoPdfSelecionado ? '#22c55e' : undefined,
                          '&:hover': {
                            backgroundColor: arquivoPdfSelecionado ? '#d4edda' : undefined
                          }
                        }}
                      >
                        {arquivoPdfSelecionado ? '✅ Arquivo Selecionado' : '📁 Selecionar Arquivo PDF'}
                      </Button>
                    </label>
                    
                    {arquivoPdfSelecionado && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          <strong>📄 Arquivo Selecionado:</strong><br/>
                          <strong>Nome:</strong> {arquivoPdfSelecionado.name}<br/>
                          <strong>Tamanho:</strong> {(arquivoPdfSelecionado.size / 1024 / 1024).toFixed(2)} MB<br/>
                          <strong>Tipo:</strong> {arquivoPdfSelecionado.type}<br/>
                          <strong>Selecionado em:</strong> {new Date().toLocaleString('pt-BR')}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => {
                            setArquivoPdfSelecionado(null);
                            const input = document.getElementById('upload-pdf-input') as HTMLInputElement;
                            if (input) input.value = '';
                          }}
                          sx={{ mt: 1 }}
                        >
                          🗑️ Remover Arquivo
                        </Button>
                      </Alert>
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                      ℹ️ O arquivo PDF será armazenado localmente e ficará disponível para download pelos usuários
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setDialogAberto(false);
              setArquivoPdfSelecionado(null);
              setTabAtiva(1);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={salvarRelatorio} 
              variant="contained"
disabled={
  !novoRelatorio.nome || 
  (novoRelatorio.tipoVisualizacao === 'pdf' && !arquivoPdfSelecionado) ||
  (novoRelatorio.tipoVisualizacao === 'canva' && !novoRelatorio.linkCanva) ||
  ((novoRelatorio.tipoVisualizacao === 'iframe' || novoRelatorio.tipoVisualizacao === 'link') && !novoRelatorio.linkExterno && !arquivoPdfSelecionado)
}
            >
              💾 Salvar Relatório
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de visualização */}
        <Dialog 
          open={dialogVisualizacao} 
          onClose={() => {
            setDialogVisualizacao(false);
            setLoadingIframe(false);
            setTimeoutError(false);
            setRelatorioSelecionado(null);
          }} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{ 
            sx: { 
              height: '95vh',
              backgroundColor: '#f8fafc'
            } 
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <Box>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getIconePorTipo(relatorioSelecionado?.tipoVisualizacao || '')} 
                {relatorioSelecionado?.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {relatorioSelecionado?.tipo} • {relatorioSelecionado?.dataReferencia}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              {relatorioSelecionado && (
                <IconButton 
                  onClick={() => {
                    const src = relatorioSelecionado.tipoVisualizacao === 'canva' 
                      ? relatorioSelecionado.linkCanva 
                      : relatorioSelecionado.linkExterno;
                    if (src) window.open(src, '_blank');
                  }}
                  title="Abrir em nova aba"
                >
                  🔗
                </IconButton>
              )}
              <IconButton 
                onClick={() => {
                  setDialogVisualizacao(false);
                  setLoadingIframe(false);
                  setTimeoutError(false);
                  setRelatorioSelecionado(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0, height: '100%', backgroundColor: '#f8fafc' }}>
            {renderVisualizador}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

// ========================================
// COMPONENTE PRINCIPAL - DETALHES DA EMPRESA
// ========================================
export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = (params?.ticker as string) || '';
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
        if (typeof window !== 'undefined') {
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
        }

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  const empresaCompleta = React.useMemo(() => {
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

  const calcularPerformance = useCallback(() => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    try {
      const precoEntradaStr = empresaCompleta.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.');
      const precoEntrada = parseFloat(precoEntradaStr);
      const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
      
      if (precoEntrada > 0 && precoAtual > 0) {
        const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
        return formatarValor(performance, 'percent');
      }
    } catch (error) {
      console.error('Erro ao calcular performance:', error);
    }
    
    return 'N/A';
  }, [empresaCompleta]);

  if (!empresaCompleta || dataSource === 'not_found') {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
        >
          Voltar à Lista
        </Button>
      </Box>
    );
  }

  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual) : empresaCompleta.precoIniciou;
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()} 
          variant="outlined"
        >
          Voltar
        </Button>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {dadosLoading ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              Carregando...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              Erro na API
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              Dados da API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Dados estáticos
            </Alert>
          )}
          
          <IconButton onClick={refetch} disabled={dadosLoading}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresaCompleta.avatar} 
              alt={empresaCompleta.ticker} 
              sx={{ 
                width: { xs: 100, md: 120 }, 
                height: { xs: 100, md: 120 },
                backgroundColor: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#374151'
              }}
            >
              {empresaCompleta.ticker.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-start' }} 
                sx={{ mb: 1 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {empresaCompleta.ticker}
                </Typography>
                {empresaCompleta.tipo === 'FII' && (
                  <Chip label="FII" color="primary" />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Typography variant="body1" sx={{ maxWidth: 600 }}>
                {empresaCompleta.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700 }}>
                    {precoAtualFormatado}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                  >
                    {tendencia && (
                      <>
                        {tendencia === 'up' ? <TrendUpIcon /> : <TrendDownIcon />}
                        <Typography sx={{ 
                          color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                          fontWeight: 700, 
                          fontSize: '1.2rem'
                        }}>
                          {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Cards de métricas */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="COTAÇÃO" 
            value={precoAtualFormatado}
            loading={dadosLoading}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="VARIAÇÃO HOJE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="PERFORMANCE" 
            value={calcularPerformance()}
            trend={calcularPerformance().includes('-') ? 'down' : 'up'}
            subtitle="desde entrada"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="P/L" 
            value={dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
            loading={dadosLoading}
          />
        </Grid>
      </Grid>

      {/* Histórico de Dividendos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <HistoricoDividendos ticker={ticker} dataEntrada={empresaCompleta.dataEntrada} />
        </Grid>
      </Grid>

      {/* Seções secundárias */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <GerenciadorRelatorios ticker={ticker} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.dataEntrada}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.precoIniciou}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, backgroundColor: dados?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: dados?.precoAtual ? '#22c55e' : 'inherit' }}>
                    {precoAtualFormatado}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ações rápidas */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#f8fafc' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                🚀 Ações Rápidas
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  startIcon={<RefreshIcon />} 
                  onClick={refetch}
                  variant="contained"
                  size="small"
                  disabled={dadosLoading}
                >
                  {dadosLoading ? 'Atualizando...' : 'Atualizar Dados'}
                </Button>
                <Button 
                  onClick={() => window.open(`https://statusinvest.com.br/${empresaCompleta.tipo === 'FII' ? 'fundos-imobiliarios' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📊 Status Invest
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.investidor10.com.br/${empresaCompleta.tipo === 'FII' ? 'fiis' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📈 Investidor10
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
