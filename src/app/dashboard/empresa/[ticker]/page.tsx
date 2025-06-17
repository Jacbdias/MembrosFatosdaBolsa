'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
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

// Ícones mock
const ArrowLeftIcon = () => <span>←</span>;
const TrendUpIcon = () => <span style={{ color: '#22c55e' }}>↗</span>;
const TrendDownIcon = () => <span style={{ color: '#ef4444' }}>↘</span>;
const SettingsIcon = () => <span>⚙</span>;
const RefreshIcon = () => <span>🔄</span>;
const WarningIcon = () => <span>⚠</span>;
const CheckIcon = () => <span>✓</span>;
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;

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
  arquivo: string;
  tamanho: string;
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
const MetricCard = ({ 
  title, 
  value, 
  color = 'primary', 
  subtitle, 
  loading = false,
  trend,
  highlight = false,
  showInfo = false
}: { 
  title: string; 
  value: string; 
  color?: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  highlight?: boolean;
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
);

// Componente para histórico de dividendos
const HistoricoDividendos = ({ ticker, dataEntrada }: { ticker: string; dataEntrada: string }) => {
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
          const proventosComData = proventosSalvos.map((item: any) => ({
            ...item,
            dataObj: new Date(item.dataObj)
          }));
          setProventos(proventosComData);
        } catch (err) {
          console.error('Erro ao carregar proventos salvos:', err);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(chaveStorage);
          }
        }
      }
    }
  }, [ticker]);

  const salvarProventos = (novosProventos: any[]) => {
    if (ticker && typeof window !== 'undefined') {
      const chaveStorage = `proventos_${ticker}`;
      localStorage.setItem(chaveStorage, JSON.stringify(novosProventos));
    }
  };

  const limparProventos = () => {
    if (ticker && typeof window !== 'undefined') {
      const chaveStorage = `proventos_${ticker}`;
      localStorage.removeItem(chaveStorage);
      setProventos([]);
      setError(null);
    }
  };

  const handleArquivoCSV = (file: File) => {
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

        const dados = linhas
          .slice(1)
          .map((linha, index) => {
            const partes = linha.split(',').map(p => p.trim().replace(/"/g, ''));
            
            if (partes.length < 4) {
              console.warn(`Linha ${index + 2} ignorada: dados insuficientes`);
              return null;
            }

            const [csvTicker, data, valor, tipo] = partes;
            
            if (!csvTicker || !data || !valor || !tipo) return null;
            if (csvTicker.toUpperCase() !== ticker.toUpperCase()) return null;

            const valorNum = parseFloat(valor.replace(',', '.'));
            if (isNaN(valorNum)) {
              console.warn(`Linha ${index + 2} ignorada: valor inválido`);
              return null;
            }

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
              console.warn(`Linha ${index + 2} ignorada: data inválida`);
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
        console.error('Erro ao processar CSV:', err);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo');
      setLoading(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const totalProventos = proventos.reduce((sum, item) => sum + item.valor, 0);
  const mediaProvento = proventos.length > 0 ? totalProventos / proventos.length : 0;
  const ultimoProvento = proventos.length > 0 ? proventos[0] : null;

  const proventosPorAno = proventos.reduce((acc, item) => {
    const ano = item.dataObj.getFullYear().toString();
    if (!acc[ano]) acc[ano] = [];
    acc[ano].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const totalPorAno = Object.entries(proventosPorAno).map(([ano, items]) => ({
    ano,
    total: items.reduce((sum, item) => sum + item.valor, 0),
    quantidade: items.length
  })).sort((a, b) => parseInt(b.ano) - parseInt(a.ano));

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
            <strong>Formato do CSV esperado:</strong>
          </Typography>
          <Typography variant="caption" component="div">
            ticker,data,valor,tipo<br/>
            ALOS3,15/03/2024,0.45,Dividendo<br/>
            ALOS3,15/06/2024,0.52,JCP
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
            <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
              Carregue um arquivo CSV com o histórico de proventos
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: '#22c55e' }}>
              💾 Os dados serão salvos automaticamente e mantidos após recarregar a página
            </Typography>
          </Box>
        ) : (
          <>
            {proventos.length > 0 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                💾 <strong>{proventos.length} proventos carregados</strong> - Os dados estão salvos localmente e persistem entre as sessões.
              </Alert>
            )}

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                📊 Resumo dos Proventos
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: 2,
                    border: '1px solid #0ea5e9',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#0ea5e9', mb: 1 }}>
                      {proventos.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Pagamentos
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: 2,
                    border: '1px solid #22c55e',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e', mb: 1 }}>
                      {formatarValor(totalProventos).replace('R$ ', '')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Total Recebido
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    backgroundColor: '#fefce8', 
                    borderRadius: 2,
                    border: '1px solid #eab308',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#eab308', mb: 1 }}>
                      {formatarValor(mediaProvento).replace('R$ ', '')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Média por Pagamento
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    p: 3, 
                    backgroundColor: '#fdf4ff', 
                    borderRadius: 2,
                    border: '1px solid #a855f7',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#a855f7', mb: 1 }}>
                      {ultimoProvento ? ultimoProvento.dataFormatada.replace(/\/\d{4}/, '') : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Último Pagamento
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {totalPorAno.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                  📈 Resumo por Ano
                </Typography>
                <Grid container spacing={2}>
                  {totalPorAno.map((item) => (
                    <Grid item xs={6} sm={4} md={3} key={item.ano}>
                      <Card sx={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }
                      }}>
                        <CardContent sx={{ textAlign: 'center', p: 2.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
                            {item.ano}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: '#22c55e', my: 1 }}>
                            {formatarValor(item.total)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantidade} pagamentos • Média: {formatarValor(item.total / item.quantidade)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>
                📋 Histórico Detalhado
              </Typography>
              <TableContainer sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Data</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>Valor</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Tipo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#374151' }}>Ano</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {proventos.slice(0, 10).map((provento, index) => (
                      <TableRow 
                        key={`${provento.data}-${index}`}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { 
                            backgroundColor: '#e5e7eb',
                            transform: 'scale(1.01)',
                            transition: 'all 0.1s ease'
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{provento.dataFormatada}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#22c55e', fontSize: '0.95rem' }}>
                          {provento.valorFormatado}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={provento.tipo}
                            size="small"
                            variant="outlined"
                            color={
                              provento.tipo.toLowerCase().includes('jcp') ? 'secondary' :
                              provento.tipo.toLowerCase().includes('jscp') ? 'warning' :
                              'primary'
                            }
                            sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          {provento.dataObj.getFullYear()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {proventos.length > 10 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Mostrando os 10 proventos mais recentes • Total: {proventos.length} registros
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para gerenciar relatórios
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';

// Ícones mock
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const FileIcon = () => <span>📄</span>;
const ViewIcon = () => <span>👁</span>;
const LinkIcon = () => <span>🔗</span>;
const CloseIcon = () => <span>✕</span>;

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

const GerenciadorRelatorios = ({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<Relatorio | null>(null);
  const [loadingIframe, setLoadingIframe] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(1); // Começa na aba Iframe
  
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    tipo: 'trimestral' as const,
    dataReferencia: '',
    arquivo: null as File | null,
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe' as 'pdf' | 'iframe' | 'canva' | 'link'
  });

  // Carregar relatórios salvos
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

  // Salvar relatório
  const salvarRelatorio = () => {
    if (!novoRelatorio.nome) {
      alert('Digite o nome do relatório');
      return;
    }

    if (novoRelatorio.tipoVisualizacao === 'pdf' && !novoRelatorio.arquivo) {
      alert('Selecione um arquivo PDF');
      return;
    }

    if (novoRelatorio.tipoVisualizacao === 'iframe' && !novoRelatorio.linkExterno) {
      alert('Insira a URL para iframe');
      return;
    }

    if (novoRelatorio.tipoVisualizacao === 'canva' && !novoRelatorio.linkCanva) {
      alert('Insira o link do Canva');
      return;
    }

    if (novoRelatorio.tipoVisualizacao === 'link' && !novoRelatorio.linkExterno) {
      alert('Insira o link externo');
      return;
    }

    const processarRelatorio = () => {
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
      resetForm();
    };

    if (novoRelatorio.tipoVisualizacao === 'pdf' && novoRelatorio.arquivo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        processarRelatorio();
      };
      reader.readAsDataURL(novoRelatorio.arquivo);
    } else {
      processarRelatorio();
    }
  };

  const resetForm = () => {
    setNovoRelatorio({
      nome: '',
      tipo: 'trimestral',
      dataReferencia: '',
      arquivo: null,
      linkCanva: '',
      linkExterno: '',
      tipoVisualizacao: 'iframe'
    });
    setTabAtiva(1); // Volta para a aba iframe
  };

  const excluirRelatorio = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      const chave = `relatorios_${ticker}`;
      const relatoriosAtualizados = relatorios.filter(r => r.id !== id);
      localStorage.setItem(chave, JSON.stringify(relatoriosAtualizados));
      setRelatorios(relatoriosAtualizados);
    }
  };

  const visualizarRelatorio = (relatorio: Relatorio) => {
    setRelatorioSelecionado(relatorio);
    setLoadingIframe(true);
    setDialogVisualizacao(true);
  };

  const formatarLinkCanva = (link: string) => {
    if (link.includes('canva.com') && !link.includes('/embed')) {
      return link.replace('/design/', '/embed/') + '?embed';
    }
    return link;
  };

  const renderVisualizador = () => {
    if (!relatorioSelecionado) return null;

    const handleIframeLoad = () => {
      setLoadingIframe(false);
    };

    switch (relatorioSelecionado.tipoVisualizacao) {
      case 'iframe':
        return (
          <Box sx={{ position: 'relative', height: '80vh' }}>
            {loadingIframe && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                p: 3
              }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                  Carregando conteúdo...
                </Typography>
              </Box>
            )}
            <iframe
              src={relatorioSelecionado.linkExterno}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              allowFullScreen
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </Box>
        );

      case 'canva':
        return (
          <Box sx={{ position: 'relative', height: '80vh' }}>
            {loadingIframe && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                p: 3
              }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                  Carregando apresentação do Canva...
                </Typography>
              </Box>
            )}
            <iframe
              src={formatarLinkCanva(relatorioSelecionado.linkCanva!)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </Box>
        );

      case 'link':
        return (
          <Box sx={{ position: 'relative', height: '80vh' }}>
            {loadingIframe && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 2,
                p: 3
              }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                  Carregando conteúdo...
                </Typography>
              </Box>
            )}
            <iframe
              src={relatorioSelecionado.linkExterno}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          </Box>
        );

      case 'pdf':
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <FileIcon style={{ fontSize: '4rem', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Visualização de PDF
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Para uma melhor experiência, recomendamos baixar o arquivo
            </Typography>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Baixar PDF
            </Button>
          </Box>
        );

      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="error">
              Tipo de visualização não suportado
            </Typography>
          </Box>
        );
    }
  };

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  };

  const getCorChipPorTipo = (tipo: string) => {
    switch (tipo) {
      case 'iframe': return 'primary';
      case 'canva': return 'secondary';
      case 'link': return 'info';
      case 'pdf': return 'default';
      default: return 'default';
    }
  };

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
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <FileIcon style={{ fontSize: '3rem', opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Nenhum relatório cadastrado ainda
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Adicione relatórios, apresentações do Canva ou qualquer conteúdo via iframe
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<UploadIcon />}
              onClick={() => setDialogAberto(true)}
            >
              Adicionar Primeiro Conteúdo
            </Button>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} divider sx={{ px: 0, py: 2 }}>
                <Box sx={{ mr: 2, fontSize: '1.5rem' }}>
                  {getIconePorTipo(relatorio.tipoVisualizacao)}
                </Box>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {relatorio.nome}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip 
                        label={relatorio.tipo} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={relatorio.tipoVisualizacao.toUpperCase()} 
                        size="small" 
                        color={getCorChipPorTipo(relatorio.tipoVisualizacao)}
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {relatorio.dataReferencia}
                        {relatorio.tamanho && ` • ${relatorio.tamanho}`}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => visualizarRelatorio(relatorio)}
                      title="Visualizar"
                      sx={{
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.16)' }
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    {relatorio.tipoVisualizacao === 'pdf' && (
                      <IconButton 
                        size="small" 
                        color="info"
                        title="Baixar"
                        sx={{
                          backgroundColor: 'rgba(2, 136, 209, 0.08)',
                          '&:hover': { backgroundColor: 'rgba(2, 136, 209, 0.16)' }
                        }}
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => excluirRelatorio(relatorio.id)}
                      title="Excluir"
                      sx={{
                        backgroundColor: 'rgba(211, 47, 47, 0.08)',
                        '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.16)' }
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

        {/* Dialog para adicionar novo relatório */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h6">Adicionar Novo Conteúdo</Typography>
            <Typography variant="body2" color="text.secondary">
              Adicione relatórios, apresentações ou qualquer conteúdo visualizável
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nome do Relatório"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, nome: e.target.value})}
                fullWidth
                placeholder="Ex: Resultados 3T24, Apresentação Investidores"
                required
              />
              
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={novoRelatorio.tipo}
                  onChange={(e) => setNovoRelatorio({...novoRelatorio, tipo: e.target.value as any})}
                >
                  <MenuItem value="trimestral">Resultado Trimestral</MenuItem>
                  <MenuItem value="anual">Resultado Anual</MenuItem>
                  <MenuItem value="apresentacao">Apresentação</MenuItem>
                  <MenuItem value="outros">Outros</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Data de Referência"
                type="date"
                value={novoRelatorio.dataReferencia}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, dataReferencia: e.target.value})}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              {/* Tabs para tipo de conteúdo */}
              <Box>
                <Tabs 
                  value={tabAtiva} 
                  onChange={(e, newValue) => {
                    setTabAtiva(newValue);
                    const tipos = ['pdf', 'iframe', 'canva', 'link'];
                    setNovoRelatorio({...novoRelatorio, tipoVisualizacao: tipos[newValue] as any});
                  }}
                  variant="fullWidth"
                  sx={{ 
                    '& .MuiTab-root': { 
                      minWidth: 'auto',
                      fontSize: '0.8rem',
                      padding: '8px 12px'
                    }
                  }}
                >
                  <Tab label="📄 PDF" />
                  <Tab label="🖼️ Iframe" />
                  <Tab label="🎨 Canva" />
                  <Tab label="🔗 Link" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                  {tabAtiva === 0 && (
                    <Box>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const arquivo = e.target.files?.[0];
                          if (arquivo) {
                            setNovoRelatorio({...novoRelatorio, arquivo});
                          }
                        }}
                        style={{ display: 'none' }}
                        id="upload-pdf"
                      />
                      <label htmlFor="upload-pdf">
                        <Button component="span" variant="outlined" fullWidth startIcon={<UploadIcon />}>
                          {novoRelatorio.arquivo ? novoRelatorio.arquivo.name : 'Selecionar PDF'}
                        </Button>
                      </label>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Upload de PDF para armazenamento local
                      </Alert>
                    </Box>
                  )}

                  {tabAtiva === 1 && (
                    <Box>
                      <TextField
                        label="URL para Iframe"
                        value={novoRelatorio.linkExterno}
                        onChange={(e) => setNovoRelatorio({...novoRelatorio, linkExterno: e.target.value})}
                        fullWidth
                        placeholder="https://exemplo.com/relatorio"
                        multiline
                        rows={3}
                        helperText="Cole aqui qualquer URL que suporte iframe"
                      />
                      <Alert severity="success" sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                          🎯 Funciona com:
                        </Typography>
                        <Typography variant="caption" component="div">
                          • <strong>Canva</strong> (links de incorporação)<br/>
                          • <strong>Google Docs/Sheets</strong> (links públicos)<br/>
                          • <strong>Google Drive</strong> (arquivos públicos)<br/>
                          • <strong>Notion</strong> (páginas públicas)<br/>
                          • <strong>YouTube, Vimeo</strong><br/>
                          • <strong>Qualquer site</strong> que permita iframe
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  {tabAtiva === 2 && (
                    <Box>
                      <TextField
                        label="Link do Canva"
                        value={novoRelatorio.linkCanva}
                        onChange={(e) => setNovoRelatorio({...novoRelatorio, linkCanva: e.target.value})}
                        fullWidth
                        placeholder="https://www.canva.com/design/..."
                        multiline
                        rows={2}
                      />
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                          Como obter o link do Canva:
                        </Typography>
                        <Typography variant="caption" component="div">
                          1. Abra sua apresentação no Canva<br/>
                          2. Clique em "Compartilhar" no canto superior direito<br/>
                          3. Selecione "Mais" e depois "Incorporar"<br/>
                          4. Cole o link aqui
                        </Typography>
                      </Alert>
                    </Box>
                  )}

                  {tabAtiva === 3 && (
                    <Box>
                      <TextField
                        label="Link Direto"
                        value={novoRelatorio.linkExterno}
                        onChange={(e) => setNovoRelatorio({...novoRelatorio, linkExterno: e.target.value})}
                        fullWidth
                        placeholder="https://exemplo.com/relatorio"
                        multiline
                        rows={2}
                      />
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Link direto abrirá em nova aba (não incorporado)
                      </Alert>
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={salvarRelatorio} 
              variant="contained" 
              disabled={!novoRelatorio.nome}
            >
              Salvar Conteúdo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para visualização */}
        <Dialog 
          open={dialogVisualizacao} 
          onClose={() => setDialogVisualizacao(false)} 
          maxWidth="lg" 
          fullWidth
          PaperProps={{
            sx: { height: '95vh', maxHeight: '95vh' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
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
            <IconButton 
              onClick={() => setDialogVisualizacao(false)}
              sx={{ 
                backgroundColor: 'rgba(0,0,0,0.04)',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, height: '100%' }}>
            {renderVisualizador()}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GerenciadorRelatorios;
// Dados de fallback
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

  const calcularPerformance = () => {
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
  };

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
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button 
            startIcon={<ArrowLeftIcon />} 
            onClick={() => window.history.back()}
            variant="contained"
            size="large"
          >
            Voltar à Lista
          </Button>
        </Stack>
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
              Carregando dados da API...
            </Alert>
          ) : dadosError ? (
            <Alert severity="warning" sx={{ py: 0.5 }}>
              <WarningIcon />
              Erro na API: {dadosError}
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              <CheckIcon />
              Dados atualizados via API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Usando dados estáticos
            </Alert>
          )}
          
          <Tooltip title="Atualizar dados">
            <IconButton onClick={refetch} disabled={dadosLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' 
      }}>
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
                border: '4px solid rgba(255,255,255,0.2)',
                backgroundColor: '#ffffff',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#374151'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const ticker = empresaCompleta.ticker;
                
                if (!target.dataset.fallbackAttempt) {
                  target.dataset.fallbackAttempt = '1';
                  target.src = `https://raw.githubusercontent.com/thefintz/b3-assets/main/assets/${ticker}/${ticker}.png`;
                } else if (target.dataset.fallbackAttempt === '1') {
                  target.dataset.fallbackAttempt = '2';
                  target.src = `https://investidor10.com.br/img/acoes/${ticker.toLowerCase()}.png`;
                } else if (target.dataset.fallbackAttempt === '2') {
                  target.dataset.fallbackAttempt = '3';
                  target.src = `https://statusinvest.com.br/Content/img/empresa/${ticker.toLowerCase()}.png`;
                }
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
                  <Chip 
                    label="FII" 
                    color="primary"
                  />
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
              {ultimaAtualizacao && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                  Última atualização: {ultimaAtualizacao}
                </Typography>
              )}
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
                        <Box>
                          <Typography sx={{ 
                            color: tendencia === 'up' ? '#22c55e' : '#ef4444', 
                            fontWeight: 700, 
                            fontSize: '1.2rem',
                            lineHeight: 1
                          }}>
                            {dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            display: 'block',
                            textAlign: { xs: 'center', md: 'right' }
                          }}>
                            variação hoje
                          </Typography>
                        </Box>
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
            value={precoAtualFormatado.replace('R$ ', 'R$ ')}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="VARIAÇÃO HOJE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
            subtitle="variação hoje"
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="PERFORMANCE" 
            value={calcularPerformance()}
            loading={dadosLoading}
            trend={calcularPerformance().includes('-') ? 'down' : 'up'}
            subtitle="desde entrada"
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="P/L" 
            value={dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
            loading={dadosLoading}
            subtitle="preço/lucro"
            showInfo={true}
          />
        </Grid>
      </Grid>

      {/* Cards adicionais - Segunda linha */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="% CARTEIRA" 
            value={empresaCompleta.percentualCarteira || 'N/A'} 
            subtitle="Participação na carteira"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="PREÇO TETO" 
            value={empresaCompleta.precoTeto} 
            subtitle="Meta de preço definida"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="DY ESTIMADO" 
            value={dados?.dy ? formatarValor(dados.dy, 'percent') : 'N/A'}
            loading={dadosLoading}
            subtitle="Dividend yield"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="MARKET CAP" 
            value={dados?.marketCap ? formatarValor(dados.marketCap, 'millions') : 'N/A'}
            loading={dadosLoading}
            subtitle="Valor de mercado"
          />
        </Grid>
      </Grid>

      {/* Histórico de Dividendos - SEÇÃO COMPLETA HORIZONTAL */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <HistoricoDividendos ticker={ticker} dataEntrada={empresaCompleta.dataEntrada} />
        </Grid>
      </Grid>

      {/* Seções secundárias */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Upload de Relatórios */}
        <Grid item xs={12} md={6}>
          <GerenciadorRelatorios ticker={ticker} />
        </Grid>
        
        {/* Dados da posição */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.dataEntrada}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.precoIniciou}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: dados?.precoAtual ? '#e8f5e8' : '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Atual</Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: dados?.precoAtual ? '#22c55e' : 'inherit' 
                  }}>
                    {precoAtualFormatado}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresaCompleta.ibovespaEpoca}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dados fundamentalistas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📈 Dados Fundamentalistas
              </Typography>
              
              {dadosLoading ? (
                <Grid container spacing={2}>
                  {[...Array(2)].map((_, index) => (
                    <Grid item xs={6} key={index}>
                      <Skeleton variant="rectangular" height={80} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: dados?.marketCap ? '#e8f5e8' : '#f8fafc', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {dados?.marketCap ? formatarValor(dados.marketCap, 'millions') : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ 
                      p: 2, 
                      backgroundColor: dados?.pl ? '#e8f5e8' : '#f8fafc', 
                      borderRadius: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body2" color="text.secondary">P/L</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Análise de performance */}
      {dados && dados.precoAtual > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  fontWeight: 600, 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  🎯 Análise de Performance
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Performance vs Preço de Entrada
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {empresaCompleta.ticker} - {calcularPerformance()}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(Math.abs(
                              parseFloat(calcularPerformance().replace('%', '').replace(',', '.')) || 0
                            ), 100)} 
                            sx={{ 
                              height: 12, 
                              borderRadius: 1, 
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          minWidth: 80,
                          color: calcularPerformance().includes('-') ? '#ef4444' : '#22c55e'
                        }}>
                          {calcularPerformance()}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Distância do Preço Teto
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Potencial até o teto
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 100)} 
                            sx={{ 
                              height: 12, 
                              borderRadius: 1, 
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444'
                              }
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          minWidth: 80,
                          color: (dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) < 0.9 ? '#22c55e' : '#ef4444'
                        }}>
                          {formatarValor((dados.precoAtual / parseFloat(empresaCompleta.precoTeto.replace('R$ ', '').replace(',', '.'))) * 100, 'percent')}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        💡 Resumo da Análise
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Viés calculado:</Typography>
                          <Chip 
                            label={empresaCompleta.viesAtual} 
                            size="small"
                            color={
                              empresaCompleta.viesAtual.includes('Compra') ? 'success' : 
                              empresaCompleta.viesAtual === 'Venda' ? 'error' : 'default'
                            }
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">DY estimado:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                            {dados?.dy ? formatarValor(dados.dy, 'percent') : 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">P/L atual:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Fonte dos dados:</Typography>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 600, 
                            color: dados && dados.precoAtual > 0 ? '#22c55e' : '#f59e0b' 
                          }}>
                            {dados && dados.precoAtual > 0 ? 'API BRAPI' : 'Estático'}
                          </Typography>
                        </Box>
                        {ultimaAtualizacao && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Atualizado:</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ultimaAtualizacao.split(' ')[1]}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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
                  onClick={() => window.open(`https://www.google.com/search?q=${empresaCompleta.ticker}+dividendos+${new Date().getFullYear()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  🔍 Pesquisar Dividendos
                </Button>
                <Button 
                  onClick={() => window.open(`https://statusinvest.com.br/${empresaCompleta.tipo === 'FII' ? 'fundos-imobiliarios' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📊 Ver no Status Invest
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.investidor10.com.br/${empresaCompleta.tipo === 'FII' ? 'fiis' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📈 Ver no Investidor10
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
