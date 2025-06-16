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
import Paper from '@mui/material/Paper';
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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Gear as SettingsIcon } from '@phosphor-icons/react/dist/ssr/Gear';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { WarningCircle as WarningIcon } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CheckCircle as CheckIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Trash as DeleteIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { FileText as FileIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { CaretDown as ExpandMoreIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';

// 🔑 TOKEN BRAPI VALIDADO
const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

interface DadosFinanceiros {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pl?: number;
  pvp?: number;
  roe?: number;
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
  arquivo: string; // Base64 ou URL
  tamanho: string;
}

// 🔍 COMPONENTE DEBUG PARA VERIFICAR DIVIDENDOS
const DebugDividendos = ({ ticker }: { ticker: string }) => {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testarTodasEstrategias = async () => {
    setLoading(true);
    setResultados([]);

    const estrategias = [
      {
        nome: '1. Endpoint Básico com Dividendos',
        url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&dividends=true`,
        extrair: (data: any) => {
          console.log('📊 Estrutura completa da resposta:', data);
          return {
            results: data.results,
            dividendsData: data.results?.[0]?.dividendsData,
            cashDividends: data.results?.[0]?.dividendsData?.cashDividends,
            stockDividends: data.results?.[0]?.dividendsData?.stockDividends
          };
        }
      },
      {
        nome: '2. Endpoint Fundamental + Dividends',
        url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`,
        extrair: (data: any) => {
          return {
            results: data.results,
            fundamentals: data.results?.[0]?.summaryProfile,
            dividendsData: data.results?.[0]?.dividendsData
          };
        }
      },
      {
        nome: '3. Endpoint Direto de Dividendos',
        url: `https://brapi.dev/api/quote/${ticker}/dividends?token=${BRAPI_TOKEN}`,
        extrair: (data: any) => {
          return {
            dividends: data.dividends,
            cashDividends: data.cashDividends,
            stockDividends: data.stockDividends
          };
        }
      },
      {
        nome: '4. Com Módulos Específicos',
        url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&modules=dividends`,
        extrair: (data: any) => {
          return {
            results: data.results,
            dividends: data.results?.[0]?.dividends,
            modules: data.results?.[0]
          };
        }
      },
      {
        nome: '5. Range 5 Anos',
        url: `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&range=5y&dividends=true`,
        extrair: (data: any) => {
          return {
            results: data.results,
            dividendsData: data.results?.[0]?.dividendsData,
            historicalData: data.results?.[0]?.historicalDataPrice?.length || 0
          };
        }
      },
      {
        nome: '6. Ticker com .SA',
        url: `https://brapi.dev/api/quote/${ticker}.SA?token=${BRAPI_TOKEN}&dividends=true`,
        extrair: (data: any) => {
          return {
            results: data.results,
            dividendsData: data.results?.[0]?.dividendsData
          };
        }
      }
    ];

    const resultadosCompletos = [];

    for (const estrategia of estrategias) {
      try {
        console.log(`🔍 Testando: ${estrategia.nome}`);
        console.log(`📡 URL: ${estrategia.url}`);

        const response = await fetch(estrategia.url);
        const data = await response.json();
        
        const dadosExtraidos = estrategia.extrair(data);
        
        resultadosCompletos.push({
          estrategia: estrategia.nome,
          url: estrategia.url,
          status: response.status,
          success: response.ok,
          dataCompleta: data,
          dadosExtraidos,
          dividendosEncontrados: contarDividendos(dadosExtraidos),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        resultadosCompletos.push({
          estrategia: estrategia.nome,
          url: estrategia.url,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        });
      }
    }

    setResultados(resultadosCompletos);
    setLoading(false);
  };

  const contarDividendos = (dados: any): number => {
    let total = 0;
    
    if (dados.cashDividends && Array.isArray(dados.cashDividends)) {
      total += dados.cashDividends.length;
    }
    if (dados.stockDividends && Array.isArray(dados.stockDividends)) {
      total += dados.stockDividends.length;
    }
    if (dados.dividends && Array.isArray(dados.dividends)) {
      total += dados.dividends.length;
    }
    
    return total;
  };

  const testarPETR4 = () => {
    // Teste com PETR4 que sabemos que tem dividendos
    window.open(`/dashboard/empresa/PETR4`, '_blank');
  };

  return (
    <Card sx={{ mt: 3, border: '2px solid #3b82f6' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#3b82f6' }}>
          🔍 Debug Completo - Dividendos {ticker}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Este componente testa todas as estratégias possíveis para buscar dividendos na BRAPI.
        </Alert>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={testarTodasEstrategias}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Testando...' : 'Testar Todas Estratégias'}
          </Button>
          
          <Button 
            variant="outlined" 
            onClick={testarPETR4}
          >
            Testar com PETR4
          </Button>
        </Stack>

        {resultados.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Resultados dos Testes:
            </Typography>

            {resultados.map((resultado, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Typography variant="subtitle2">
                      {resultado.estrategia}
                    </Typography>
                    <Chip 
                      label={resultado.success ? `${resultado.status} ✓` : 'ERRO'}
                      color={resultado.success ? 'success' : 'error'}
                      size="small"
                    />
                    {resultado.dividendosEncontrados > 0 && (
                      <Chip 
                        label={`${resultado.dividendosEncontrados} dividendos`}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      <strong>URL:</strong> {resultado.url}
                    </Typography>
                    
                    {resultado.error && (
                      <Alert severity="error">
                        <strong>Erro:</strong> {resultado.error}
                      </Alert>
                    )}
                    
                    {resultado.success && (
                      <>
                        <Typography variant="subtitle2">
                          Dividendos Encontrados: {resultado.dividendosEncontrados}
                        </Typography>
                        
                        {resultado.dividendosEncontrados > 0 ? (
                          <Alert severity="success">
                            🎉 <strong>DIVIDENDOS ENCONTRADOS!</strong> Esta estratégia funcionou.
                          </Alert>
                        ) : (
                          <Alert severity="warning">
                            📭 Nenhum dividendo encontrado nesta estratégia.
                          </Alert>
                        )}
                        
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Estrutura da Resposta:
                          </Typography>
                          <Box component="pre" sx={{ 
                            fontSize: '0.7rem', 
                            backgroundColor: '#f5f5f5', 
                            p: 2, 
                            borderRadius: 1,
                            overflow: 'auto',
                            maxHeight: 300
                          }}>
                            {JSON.stringify(resultado.dadosExtraidos, null, 2)}
                          </Box>
                        </Box>

                        {resultado.dataCompleta && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Resposta Completa da API:
                            </Typography>
                            <Box component="pre" sx={{ 
                              fontSize: '0.6rem', 
                              backgroundColor: '#f0f0f0', 
                              p: 2, 
                              borderRadius: 1,
                              overflow: 'auto',
                              maxHeight: 200
                            }}>
                              {JSON.stringify(resultado.dataCompleta, null, 2)}
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// 🚀 HOOK PARA BUSCAR DADOS FINANCEIROS
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

      const quoteUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      
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
          
          let dividendYield = 0;
          if (quote.dividendYield) {
            dividendYield = quote.dividendYield;
          } else if (quote.dividendsData?.yield) {
            dividendYield = quote.dividendsData.yield;
          }

          const pl = quote.priceEarnings || quote.pe;
          const pvp = quote.priceToBook;
          const roe = quote.returnOnEquity ? quote.returnOnEquity * 100 : undefined;
          const marketCap = quote.marketCap;

          const dadosProcessados: DadosFinanceiros = {
            precoAtual: precoAtual,
            variacao: quote.regularMarketChange || 0,
            variacaoPercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || quote.volume || 0,
            dy: dividendYield,
            marketCap: marketCap,
            pl: pl,
            pvp: pvp,
            roe: roe
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

// 🎯 HOOK PARA DIVIDENDOS (usando seu hook customizado)
interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
}

interface PerformanceDetalhada {
  performanceCapital: number;
  dividendosTotal: number;
  dividendosPercentual: number;
  performanceTotal: number;
  quantidadeDividendos: number;
  ultimoDividendo: string;
  dividendosPorAno: { [ano: string]: number };
  mediaAnual: number;
  status: 'success' | 'partial' | 'error';
}

function useDividendosAtivo(
  ticker: string, 
  dataEntrada: string, 
  precoEntrada: string, 
  precoAtual: string
) {
  const [dividendos, setDividendos] = React.useState<DividendoDetalhado[]>([]);
  const [performance, setPerformance] = React.useState<PerformanceDetalhada | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const buscarDividendos = React.useCallback(async () => {
    if (!ticker || !dataEntrada || !precoEntrada) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 === BUSCA COMPLETA DE PROVENTOS PARA ${ticker} ===`);

      // 🔍 TODAS AS ESTRATÉGIAS POSSÍVEIS
      const estrategias = [
        {
          nome: 'Dividendos Direto',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}/dividends?token=${BRAPI_TOKEN}`,
          extrair: (data: any) => data.dividends || []
        },
        {
          nome: 'Quote com Dividends Module',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&modules=dividends`,
          extrair: (data: any) => data.results?.[0]?.dividends || []
        },
        {
          nome: 'Quote Fundamental Completo',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&fundamental=true`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.splits || []),
              ...(result?.earnings || [])
            ];
          }
        },
        {
          nome: 'Histórico 5 Anos',
          getUrl: (t: string) => `https://brapi.dev/api/quote/${t}?token=${BRAPI_TOKEN}&range=5y&fundamental=true&modules=dividends,splits,earnings`,
          extrair: (data: any) => {
            const result = data.results?.[0];
            return [
              ...(result?.dividends || []),
              ...(result?.stockSplits || []),
              ...(result?.capitalGains || [])
            ];
          }
        }
      ];

      // 🔍 VARIAÇÕES DO TICKER
      const tickerVariacoes = [
        ticker,
        ticker.replace(/[34]$/, ''),
        ticker + '.SA',
        ticker.replace(/[34]$/, '') + '.SA',
        ticker.toUpperCase(),
        ticker.toLowerCase()
      ];

      let todosResultados: any[] = [];
      let melhorEstrategia = '';

      // 🔄 TESTAR CADA COMBINAÇÃO
      for (const tickerTeste of tickerVariacoes) {
        console.log(`\n🎯 === TESTANDO TICKER: ${tickerTeste} ===`);
        
        for (const estrategia of estrategias) {
          try {
            const url = estrategia.getUrl(tickerTeste);
            console.log(`📡 ${estrategia.nome}: Buscando...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(url, {
              method: 'GET',
              headers: { 
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; DividendSearcher/1.0)'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              console.log(`❌ HTTP ${response.status}`);
              continue;
            }

            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
              console.log(`⚠️ Não é JSON: ${contentType}`);
              continue;
            }

            let responseText;
            try {
              responseText = await response.text();
            } catch (textError) {
              console.log(`❌ Erro ao ler texto:`, textError);
              continue;
            }

            if (responseText.trim().startsWith('<')) {
              console.log(`⚠️ Resposta é HTML`);
              continue;
            }

            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.log(`❌ JSON inválido:`, parseError);
              continue;
            }

            const resultados = estrategia.extrair(data);
            
            if (resultados && resultados.length > 0) {
              console.log(`✅ ${estrategia.nome} (${tickerTeste}): ${resultados.length} resultados!`);
              
              resultados.forEach((item: any, i: number) => {
                console.log(`  ${i + 1}. ${item.date || 'sem data'} - ${item.type || item.eventType || 'sem tipo'} - ${item.value || item.amount || 'sem valor'}`);
              });

              todosResultados = [...todosResultados, ...resultados];
              melhorEstrategia = `${estrategia.nome} (${tickerTeste})`;
              
              if (resultados.length >= 5) {
                console.log(`🎉 Muitos resultados encontrados, usando: ${melhorEstrategia}`);
                break;
              }
            } else {
              console.log(`📭 ${estrategia.nome} (${tickerTeste}): Sem resultados`);
            }

          } catch (err) {
            console.log(`❌ ${estrategia.nome} (${tickerTeste}): ${err}`);
          }
        }

        if (todosResultados.length >= 5) break;
      }

      // 🔄 PROCESSAR RESULTADOS
      console.log(`\n📊 === PROCESSAMENTO FINAL ===`);
      console.log(`Total bruto encontrado: ${todosResultados.length}`);
      console.log(`Melhor estratégia: ${melhorEstrategia}`);

      if (todosResultados.length > 0) {
        const resultadosUnicos = removeDuplicatas(todosResultados);
        console.log(`Após remoção de duplicatas: ${resultadosUnicos.length}`);

        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        console.log(`Data de entrada: ${dataEntradaDate.toISOString()}`);
        
        const dividendosProcessados = resultadosUnicos
          .filter((item: any) => {
            if (!item.date) return false;
            
            const valor = item.value || item.amount || item.rate || 0;
            if (valor <= 0) return false;
            
            try {
              const dataItem = new Date(item.date);
              const isAfterEntry = dataItem >= dataEntradaDate;
              
              console.log(`📅 ${item.date} (${item.type || 'N/A'}) - R$ ${valor} - Após entrada: ${isAfterEntry}`);
              return isAfterEntry;
            } catch {
              return false;
            }
          })
          .map((item: any) => ({
            date: item.date,
            value: item.value || item.amount || item.rate || 0,
            type: item.type || item.eventType || 'Provento',
            dataFormatada: new Date(item.date).toLocaleDateString('pt-BR'),
            valorFormatado: `R$ ${(item.value || item.amount || item.rate || 0).toFixed(2).replace('.', ',')}`
          }))
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        console.log(`✅ FINAL: ${dividendosProcessados.length} proventos válidos desde ${dataEntrada}`);
        
        setDividendos(dividendosProcessados);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, dividendosProcessados));

        if (dividendosProcessados.length === 0) {
          setError(`Encontrados ${todosResultados.length} proventos, mas todos anteriores à entrada (${dataEntrada})`);
        }

      } else {
        console.log(`📭 NENHUM resultado encontrado em todas as estratégias`);
        setDividendos([]);
        setPerformance(calcularPerformance(precoEntrada, precoAtual, []));
        setError('Nenhum provento encontrado em nenhuma fonte. Pode não estar disponível na API.');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro geral:`, err);
      setError(errorMessage);
      
      setDividendos([]);
      const performanceFallback = calcularPerformance(precoEntrada, precoAtual, []);
      performanceFallback.status = 'error';
      setPerformance(performanceFallback);
      
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada, precoEntrada, precoAtual]);

  React.useEffect(() => {
    if (ticker && dataEntrada && precoEntrada) {
      const timer = setTimeout(buscarDividendos, 500);
      return () => clearTimeout(timer);
    }
  }, [buscarDividendos]);

  return {
    dividendos,
    performance,
    loading,
    error,
    refetch: buscarDividendos
  };
}

// 🔄 FUNÇÃO PARA REMOVER DUPLICATAS
function removeDuplicatas(items: any[]): any[] {
  const vistos = new Set();
  return items.filter(item => {
    const chave = `${item.date}_${item.type || 'default'}_${item.value || item.amount || 0}`;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

// 📊 FUNÇÃO DE CÁLCULO
function calcularPerformance(
  precoEntrada: string,
  precoAtual: string,
  dividendos: DividendoDetalhado[]
): PerformanceDetalhada {
  const precoEntradaNum = parseFloat(precoEntrada.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
  const precoAtualNum = parseFloat(precoAtual.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

  const performanceCapital = precoEntradaNum > 0 
    ? ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100 
    : 0;

  const dividendosTotal = dividendos.reduce((sum, div) => sum + (div.value || 0), 0);
  const dividendosPercentual = precoEntradaNum > 0 ? (dividendosTotal / precoEntradaNum) * 100 : 0;
  const performanceTotal = performanceCapital + dividendosPercentual;

  const ultimoDividendo = dividendos.length > 0 ? dividendos[0].dataFormatada : 'Nenhum';

  const dividendosPorAno: { [ano: string]: number } = {};
  dividendos.forEach(div => {
    try {
      const ano = new Date(div.date).getFullYear().toString();
      dividendosPorAno[ano] = (dividendosPorAno[ano] || 0) + (div.value || 0);
    } catch {
      // Ignorar datas inválidas
    }
  });

  const anos = Object.keys(dividendosPorAno);
  const mediaAnual = anos.length > 0 
    ? Object.values(dividendosPorAno).reduce((sum, valor) => sum + valor, 0) / anos.length
    : 0;

  return {
    performanceCapital,
    dividendosTotal,
    dividendosPercentual,
    performanceTotal,
    quantidadeDividendos: dividendos.length,
    ultimoDividendo,
    dividendosPorAno,
    mediaAnual,
    status: dividendos.length > 0 ? 'success' : 'partial'
  };
}

// 🎯 FUNÇÃO PARA CALCULAR VIÉS
function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
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
}

// 🔥 FUNÇÃO PARA FORMATAR VALORES
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

// 📊 COMPONENTE DE MÉTRICA NO ESTILO MODERNO
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
    borderRadius: 2,
    overflow: 'hidden',
    border: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    '&:hover': { 
      transform: 'translateY(-2px)', 
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)' 
    }
  }}>
    {/* Header com título */}
    <Box sx={{ 
      backgroundColor: '#374151',
      color: 'white',
      py: 1.5,
      px: 2,
      position: 'relative'
    }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="body2" sx={{ 
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {title}
        </Typography>
        {showInfo && (
          <Box sx={{ 
            width: 16, 
            height: 16, 
            borderRadius: '50%', 
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            ?
          </Box>
        )}
      </Stack>
    </Box>

    {/* Conteúdo principal */}
    <CardContent sx={{ 
      backgroundColor: 'white',
      p: 2.5,
      textAlign: 'center',
      '&:last-child': { pb: 2.5 }
    }}>
      {loading ? (
        <Skeleton variant="text" height={40} />
      ) : (
        <>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              fontSize: '1.75rem',
              color: '#1f2937',
              lineHeight: 1
            }}>
              {value}
            </Typography>
            {trend && (
              <Box sx={{ ml: 0.5 }}>
                {trend === 'up' ? (
                  <TrendUpIcon size={16} style={{ color: '#10b981' }} />
                ) : (
                  <TrendDownIcon size={16} style={{ color: '#ef4444' }} />
                )}
              </Box>
            )}
          </Stack>
          
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: '#6b7280',
              fontSize: '0.7rem',
              display: 'block',
              mt: 0.5,
              lineHeight: 1.2
            }}>
              {subtitle}
            </Typography>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

// 📄 COMPONENTE PARA UPLOAD DE RELATÓRIOS PDF
const GerenciadorRelatorios = ({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoRelatorio, setNovoRelatorio] = useState({
    nome: '',
    tipo: 'trimestral' as const,
    dataReferencia: '',
    arquivo: null as File | null
  });

  // Carregar relatórios do localStorage
  useEffect(() => {
    const chave = `relatorios_${ticker}`;
    const relatoriosExistentes = localStorage.getItem(chave);
    if (relatoriosExistentes) {
      setRelatorios(JSON.parse(relatoriosExistentes));
    }
  }, [ticker]);

  const salvarRelatorio = () => {
    if (novoRelatorio.arquivo && novoRelatorio.nome) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const relatorio: Relatorio = {
          id: Date.now().toString(),
          nome: novoRelatorio.nome,
          tipo: novoRelatorio.tipo,
          dataUpload: new Date().toISOString(),
          dataReferencia: novoRelatorio.dataReferencia,
          arquivo: e.target?.result as string, // Base64
          tamanho: `${(novoRelatorio.arquivo!.size / 1024 / 1024).toFixed(1)} MB`
        };

        const chave = `relatorios_${ticker}`;
        const relatoriosExistentes = JSON.parse(localStorage.getItem(chave) || '[]');
        relatoriosExistentes.push(relatorio);
        localStorage.setItem(chave, JSON.stringify(relatoriosExistentes));
        
        setRelatorios(relatoriosExistentes);
        setDialogAberto(false);
        setNovoRelatorio({ nome: '', tipo: 'trimestral', dataReferencia: '', arquivo: null });
      };
      reader.readAsDataURL(novoRelatorio.arquivo);
    }
  };

  const excluirRelatorio = (id: string) => {
    const chave = `relatorios_${ticker}`;
    const relatoriosAtualizados = relatorios.filter(r => r.id !== id);
    localStorage.setItem(chave, JSON.stringify(relatoriosAtualizados));
    setRelatorios(relatoriosAtualizados);
  };

  const baixarRelatorio = (relatorio: Relatorio) => {
    const link = document.createElement('a');
    link.href = relatorio.arquivo;
    link.download = `${relatorio.nome}.pdf`;
    link.click();
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
            Adicionar PDF
          </Button>
        </Stack>

        {relatorios.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <FileIcon size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography>Nenhum relatório cadastrado ainda</Typography>
            <Typography variant="caption">Clique em "Adicionar PDF" para começar</Typography>
          </Box>
        ) : (
          <List>
            {relatorios.map((relatorio) => (
              <ListItem key={relatorio.id} divider sx={{ px: 0 }}>
                <ListItemText
                  primary={relatorio.nome}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={relatorio.tipo} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption">
                        {relatorio.dataReferencia} • {relatorio.tamanho}
                      </Typography>
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => baixarRelatorio(relatorio)}
                    sx={{ mr: 1 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => excluirRelatorio(relatorio.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Dialog para upload */}
        <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Adicionar Novo Relatório</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nome do Relatório"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio({...novoRelatorio, nome: e.target.value})}
                fullWidth
                placeholder="Ex: Resultados 3T24"
              />
              
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
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
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
            <Button 
              onClick={salvarRelatorio} 
              variant="contained" 
              disabled={!novoRelatorio.arquivo || !novoRelatorio.nome}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

// 💰 COMPONENTE DE HISTÓRICO DE DIVIDENDOS MELHORADO
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, Typography, Stack, Box, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';

interface DividendoDetalhado {
  date: string;
  value: number;
  type: string;
  dataFormatada: string;
  valorFormatado: string;
}

const HistoricoDividendos = ({ ticker, dataEntrada }: { ticker: string; dataEntrada: string }) => {
  const [proventos, setProventos] = useState<DividendoDetalhado[]>([]);

  const handleArquivo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let dados: DividendoDetalhado[] = [];

        if (file.name.endsWith('.json')) {
          dados = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          dados = text
            .split('\n')
            .slice(1)
            .map((linha) => {
              const partes = linha.split(',');
              if (partes.length < 4) return null;

              const [csvTicker, date, value, type] = partes.map((p) => p?.trim());
              if (!csvTicker || !date || !value || !type) return null;
              if (csvTicker !== ticker) return null;

              const numValue = parseFloat(value.replace(',', '.'));

              return {
                date: date,
                value: numValue,
                type: type,
                dataFormatada: new Date(date).toLocaleDateString('pt-BR'),
                valorFormatado: `R$ ${numValue.toFixed(2).replace('.', ',')}`,
              };
            })
            .filter((item): item is DividendoDetalhado => item !== null);
        }

        const dataEntradaDate = new Date(dataEntrada.split('/').reverse().join('-'));
        dataEntradaDate.setHours(0, 0, 0, 0);

        const dadosFiltrados = dados
          .filter((div) => {
            const dataDiv = new Date(div.date);
            dataDiv.setHours(0, 0, 0, 0);
            return dataDiv >= dataEntradaDate;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setProventos(dadosFiltrados);
      } catch (err) {
        alert('Erro ao carregar arquivo: ' + err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            💰 Proventos Carregados
          </Typography>
          <Box>
            <input
              type="file"
              accept=".csv,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleArquivo(file);
              }}
              style={{ display: 'none' }}
              id="upload-proventos"
            />
            <label htmlFor="upload-proventos">
              <Button component="span" variant="outlined" size="small" startIcon={<UploadIcon />}>
                Carregar Proventos
              </Button>
            </label>
          </Box>
        </Stack>

        {proventos.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhum provento carregado para {ticker}. Selecione um arquivo CSV ou JSON.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="right">Tipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proventos.map((div, index) => (
                  <TableRow key={index}>
                    <TableCell>{div.dataFormatada}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#16a34a' }}>
                      {div.valorFormatado}
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={div.type}
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
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricoDividendos;

// 📈 COMPONENTE DE RESUMO EXECUTIVO
const ResumoExecutivo = ({ empresa, dados }: { empresa: EmpresaCompleta; dados: DadosFinanceiros | null }) => {
  const calcularResumo = () => {
    const precoEntrada = parseFloat(empresa.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const precoTeto = parseFloat(empresa.precoTeto.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const precoAtual = dados?.precoAtual || precoEntrada;
    
    const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
    const potencialTeto = ((precoTeto - precoAtual) / precoAtual) * 100;
    
    return {
      performance,
      potencialTeto,
      statusInvestimento: performance > 0 ? 'Lucro' : 'Prejuízo',
      recomendacao: potencialTeto > 20 ? 'Oportunidade' : potencialTeto > 0 ? 'Neutro' : 'Atenção'
    };
  };

  const resumo = calcularResumo();

  return (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      mb: 4
    }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          📈 Resumo Executivo
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatarValor(resumo.performance, 'percent')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Performance Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {formatarValor(resumo.potencialTeto, 'percent')}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Potencial até Teto
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={resumo.statusInvestimento}
                sx={{ 
                  backgroundColor: resumo.performance > 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                Status Atual
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Chip 
                label={resumo.recomendacao}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 0.5 }}>
                Recomendação
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// 🔥 DADOS BASE
const ativosBase = [
  {
    ticker: 'ALOS3',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
    setor: 'Shoppings'
  }
];

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
  const ticker = params?.ticker as string;
  
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');
  
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  // 📊 BUSCAR DY DOS DADOS DA TABELA PRINCIPAL
  const buscarDYDaTabela = (ticker: string): string => {
    try {
      const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
      
      if (dadosAdmin) {
        const ativos = JSON.parse(dadosAdmin);
        const ativoEncontrado = ativos.find((a: any) => a.ticker === ticker);
        
        if (ativoEncontrado && ativoEncontrado.dy) {
          return ativoEncontrado.dy;
        }
      }

      const ativoBase = ativosBase?.find(a => a.ticker === ticker);
      if (ativoBase && ativoBase.dy) {
        return ativoBase.dy;
      }

      if (ticker === 'ALOS3') return '5,95%';
      
      return 'N/A';
    } catch (err) {
      return 'N/A';
    }
  };

  useEffect(() => {
    if (!ticker) return;

    const carregarDados = () => {
      try {
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

        const ativoFallback = dadosFallback[ticker];
        if (ativoFallback) {
          setEmpresa(ativoFallback);
          setDataSource('fallback');
          return;
        }

        setDataSource('not_found');
      } catch (err) {
        setDataSource('not_found');
      }
    };

    carregarDados();
  }, [ticker]);

  // 🔥 COMBINAR DADOS
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

  // 📊 CALCULAR PERFORMANCE
  const calcularPerformance = () => {
    if (!empresaCompleta || !empresaCompleta.dadosFinanceiros) return 'N/A';
    
    const precoEntradaStr = empresaCompleta.precoIniciou.replace('R$ ', '').replace('.', '').replace(',', '.');
    const precoEntrada = parseFloat(precoEntradaStr);
    const precoAtual = empresaCompleta.dadosFinanceiros.precoAtual;
    
    if (precoEntrada > 0 && precoAtual > 0) {
      const performance = ((precoAtual - precoEntrada) / precoEntrada) * 100;
      return formatarValor(performance, 'percent');
    }
    
    return 'N/A';
  };

  const dyDaTabela = buscarDYDaTabela(ticker);

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

  const isFII = empresaCompleta.tipo === 'FII';
  const dados = empresaCompleta.dadosFinanceiros;
  const precoAtualFormatado = dados?.precoAtual ? formatarValor(dados.precoAtual) : empresaCompleta.precoIniciou;
  const tendencia = dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : 'up';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header com navegação */}
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
              <WarningIcon size={16} />
              Erro na API: {dadosError}
            </Alert>
          ) : dados && dados.precoAtual > 0 ? (
            <Alert severity="success" sx={{ py: 0.5 }}>
              <CheckIcon size={16} />
              Dados atualizados via API BRAPI
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0.5 }}>
              Usando dados estáticos
            </Alert>
          )}
          
          <Tooltip title="Atualizar dados">
            <IconButton onClick={refetch} disabled={dadosLoading}>
              <RefreshIcon size={20} />
            </IconButton>
          </Tooltip>
          
          <Button 
            startIcon={<SettingsIcon />} 
            onClick={() => window.open('/admin', '_blank')}
            variant="outlined"
            size="small"
          >
            Gerenciar
          </Button>
        </Stack>
      </Stack>

      {/* Card principal da empresa */}
      <Card sx={{ 
        mb: 4, 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
        color: 'black' 
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
                border: '4px solid rgba(255,255,255,0.2)'
              }} 
            />
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
                {isFII && (
                  <Chip 
                    label="FII" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                {empresaCompleta.nomeCompleto}
              </Typography>
              <Chip 
                label={empresaCompleta.setor} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'black',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {empresaCompleta.descricao}
              </Typography>
              {ultimaAtualizacao && (
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  Última atualização: {ultimaAtualizacao}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              {dadosLoading ? (
                <Skeleton variant="text" width={150} height={60} />
              ) : (
                <>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'black' }}>
                    {precoAtualFormatado}
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    alignItems="center" 
                    justifyContent={{ xs: 'center', md: 'flex-end' }}
                  >
                    {tendencia === 'up' ? (
                      <TrendUpIcon size={24} style={{ color: '#22c55e' }} />
                    ) : (
                      <TrendDownIcon size={24} style={{ color: '#ef4444' }} />
                    )}
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
                  </Stack>
                </>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* NOVO: Resumo Executivo */}
      <ResumoExecutivo empresa={empresaCompleta} dados={dados} />

      {/* Cards de métricas - ESTILO MODERNO */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="COTAÇÃO" 
            value={precoAtualFormatado.replace('R$ ', 'R$ ')}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="VARIAÇÃO HOJE" 
            value={dados?.variacaoPercent ? formatarValor(dados.variacaoPercent, 'percent') : 'N/A'}
            loading={dadosLoading}
            trend={dados?.variacaoPercent ? (dados.variacaoPercent >= 0 ? 'up' : 'down') : undefined}
            subtitle="variação hoje"
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="VARIAÇÃO (12M)" 
            value={calcularPerformance()}
            loading={dadosLoading}
            trend={calcularPerformance().includes('-') ? 'down' : 'up'}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/L" 
            value={dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="P/VP" 
            value={dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <MetricCard 
            title="DY" 
            value={dyDaTabela}
            loading={dadosLoading}
            showInfo={true}
          />
        </Grid>
      </Grid>

      {/* Cards adicionais - Segunda linha */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="VIÉS ATUAL" 
            value={empresaCompleta.viesAtual}
            color={
              empresaCompleta.viesAtual.includes('Compra') ? 'success' : 
              empresaCompleta.viesAtual === 'Venda' ? 'error' : 'primary'
            }
            loading={dadosLoading}
            subtitle="Automático"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="% CARTEIRA" 
            value={empresaCompleta.percentualCarteira || 'N/A'} 
            subtitle="Participação"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="PREÇO TETO" 
            value={empresaCompleta.precoTeto} 
            subtitle="Meta definida"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard 
            title="ROE" 
            value={dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
            loading={dadosLoading}
            subtitle="Retorno patrimônio"
          />
        </Grid>
      </Grid>

      {/* COMPONENTE DEBUG ADICIONADO AQUI */}
      <DebugDividendos ticker={ticker} />

      {/* NOVAS SEÇÕES EM GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Upload de Relatórios */}
        <Grid item xs={12} md={6}>
          <GerenciadorRelatorios ticker={ticker} />
        </Grid>
        
        {/* Histórico de Dividendos */}
        <Grid item xs={12} md={6}>
          <HistoricoDividendos ticker={ticker} empresa={empresaCompleta} />
        </Grid>
      </Grid>
      
      {/* Dados da posição */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📈 {isFII ? 'Dados do Fundo' : 'Dados Fundamentalistas'}
              </Typography>
              
              {dadosLoading ? (
                <Stack spacing={2}>
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={50} />
                  ))}
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.marketCap ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.marketCap ? formatarValor(dados.marketCap, 'millions') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.pl ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">P/L</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.pl ? formatarValor(dados.pl, 'number') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.pvp ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">P/VPA</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dados?.pvp ? formatarValor(dados.pvp, 'number') : 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    p: 2, 
                    backgroundColor: dados?.roe ? '#e8f5e8' : '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" color="text.secondary">ROE</Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: dados?.roe ? '#22c55e' : 'inherit'
                    }}>
                      {dados?.roe ? formatarValor(dados.roe, 'percent') : 'N/A'}
                    </Typography>
                  </Box>
                </Stack>
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
                  🎯 Análise de Performance com Dados Reais
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
                          <Typography variant="body2" color="text.secondary">DY da tabela:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                            {dyDaTabela}
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
                  startIcon={<SettingsIcon />} 
                  onClick={() => window.open('/admin', '_blank')}
                  variant="outlined"
                  size="small"
                >
                  Editar no Admin
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.google.com/search?q=${empresaCompleta.ticker}+dividendos+${new Date().getFullYear()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  🔍 Pesquisar Dividendos
                </Button>
                <Button 
                  onClick={() => window.open(`https://statusinvest.com.br/${isFII ? 'fundos-imobiliarios' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
                  variant="outlined"
                  size="small"
                >
                  📊 Ver no Status Invest
                </Button>
                <Button 
                  onClick={() => window.open(`https://www.investidor10.com.br/${isFII ? 'fiis' : 'acoes'}/${empresaCompleta.ticker.toLowerCase()}`, '_blank')}
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
