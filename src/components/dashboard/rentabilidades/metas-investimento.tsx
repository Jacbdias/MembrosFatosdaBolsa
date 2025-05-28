/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
  Slider,
  Button,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { 
  Target, 
  Calculator, 
  TrendUp, 
  CurrencyDollar, 
  Calendar,
  Trophy,
  Lightbulb,
  Warning
} from '@phosphor-icons/react/dist/ssr';

// 🎯 INTERFACES PARA METAS
interface MetaInvestimento {
  id: string;
  nome: string;
  valorObjetivo: number;
  prazoMeses: number;
  aportesMensais: number;
  rentabilidadeEsperada: number;
  tipo: 'LIBERDADE' | 'COMPRA' | 'EMERGENCIA' | 'APOSENTADORIA' | 'PERSONALIZADA';
  descricao: string;
  icone: React.ReactNode;
  cor: string;
}

interface ResultadoSimulacao {
  valorFinal: number;
  totalAportado: number;
  totalRendimentos: number;
  metaAlcancada: boolean;
  mesesParaAlcancar: number;
  sobraOuFalta: number;
  dadosEvolutivos: DadoEvolutivo[];
}

interface DadoEvolutivo {
  mes: number;
  mesLabel: string;
  aporteAcumulado: number;
  rendimentoAcumulado: number;
  totalAcumulado: number;
  metaLinear: number;
}

// 🎯 METAS PRÉ-DEFINIDAS
const metasPreDefinidas: MetaInvestimento[] = [
  {
    id: 'liberdade',
    nome: 'Liberdade Financeira',
    valorObjetivo: 1000000,
    prazoMeses: 240,
    aportesMensais: 2000,
    rentabilidadeEsperada: 12,
    tipo: 'LIBERDADE',
    descricao: 'Acumular R$ 1 milhão para ter renda passiva de R$ 10k/mês',
    icone: <Trophy />,
    cor: '#f59e0b'
  },
  {
    id: 'casa',
    nome: 'Casa Própria',
    valorObjetivo: 300000,
    prazoMeses: 60,
    aportesMensais: 3500,
    rentabilidadeEsperada: 10,
    tipo: 'COMPRA',
    descricao: 'Entrada + financiamento para casa própria',
    icone: <Target />,
    cor: '#3b82f6'
  },
  {
    id: 'emergencia',
    nome: 'Reserva de Emergência',
    valorObjetivo: 50000,
    prazoMeses: 12,
    aportesMensais: 4000,
    rentabilidadeEsperada: 11,
    tipo: 'EMERGENCIA',
    descricao: '6 meses de gastos para emergências',
    icone: <Warning />,
    cor: '#ef4444'
  },
  {
    id: 'aposentadoria',
    nome: 'Aposentadoria',
    valorObjetivo: 2000000,
    prazoMeses: 360,
    aportesMensais: 1500,
    rentabilidadeEsperada: 11,
    tipo: 'APOSENTADORIA',
    descricao: 'R$ 2 milhões para aposentadoria confortável',
    icone: <Calendar />,
    cor: '#10b981'
  }
];

// 🧮 FUNÇÃO PARA CALCULAR SIMULAÇÃO
function calcularSimulacao(
  valorInicial: number,
  aportesMensais: number,
  prazoMeses: number,
  rentabilidadeAnual: number,
  valorObjetivo: number
): ResultadoSimulacao {
  const rentabilidadeMensal = rentabilidadeAnual / 100 / 12;
  let saldoAtual = valorInicial;
  const dadosEvolutivos: DadoEvolutivo[] = [];
  
  for (let mes = 0; mes <= prazoMeses; mes++) {
    if (mes > 0) {
      // Aplicar rendimento no saldo atual
      saldoAtual = saldoAtual * (1 + rentabilidadeMensal);
      // Adicionar aporte mensal
      saldoAtual += aportesMensais;
    }
    
    const aporteAcumulado = valorInicial + (aportesMensais * mes);
    const rendimentoAcumulado = saldoAtual - aporteAcumulado;
    const metaLinear = valorObjetivo * (mes / prazoMeses);
    
    dadosEvolutivos.push({
      mes,
      mesLabel: mes === 0 ? 'Início' : `${mes}m`,
      aporteAcumulado,
      rendimentoAcumulado: Math.max(0, rendimentoAcumulado),
      totalAcumulado: saldoAtual,
      metaLinear
    });
  }
  
  const totalAportado = valorInicial + (aportesMensais * prazoMeses);
  const totalRendimentos = saldoAtual - totalAportado;
  const metaAlcancada = saldoAtual >= valorObjetivo;
  
  // Calcular meses para alcançar a meta
  let mesesParaAlcancar = prazoMeses;
  for (let i = 0; i < dadosEvolutivos.length; i++) {
    if (dadosEvolutivos[i].totalAcumulado >= valorObjetivo) {
      mesesParaAlcancar = i;
      break;
    }
  }
  
  return {
    valorFinal: saldoAtual,
    totalAportado,
    totalRendimentos,
    metaAlcancada,
    mesesParaAlcancar,
    sobraOuFalta: saldoAtual - valorObjetivo,
    dadosEvolutivos
  };
}

// 💡 COMPONENTE DE INSIGHTS
interface InsightsMetaProps {
  resultado: ResultadoSimulacao;
  meta: MetaInvestimento;
}

function InsightsMeta({ resultado, meta }: InsightsMetaProps) {
  const insights = [];
  
  if (resultado.metaAlcancada) {
    insights.push({
      tipo: 'success',
      titulo: '🎯 Meta Alcançada!',
      descricao: `Você conseguirá alcançar sua meta ${resultado.mesesParaAlcancar < meta.prazoMeses ? `${meta.prazoMeses - resultado.mesesParaAlcancar} meses antes do prazo` : 'no prazo'}.`
    });
    
    if (resultado.sobraOuFalta > 0) {
      insights.push({
        tipo: 'info',
        titulo: '💰 Sobra de Capital',
        descricao: `Você terá R$ ${resultado.sobraOuFalta.toLocaleString('pt-BR')} a mais que o objetivo.`
      });
    }
  } else {
    insights.push({
      tipo: 'warning',
      titulo: '⚠️ Meta Não Alcançada',
      descricao: `Faltarão R$ ${Math.abs(resultado.sobraOuFalta).toLocaleString('pt-BR')} para atingir o objetivo.`
    });
    
    const aporteNecessario = Math.ceil(Math.abs(resultado.sobraOuFalta) / meta.prazoMeses) + meta.aportesMensais;
    insights.push({
      tipo: 'info',
      titulo: '💡 Sugestão',
      descricao: `Aumente o aporte para R$ ${aporteNecessario.toLocaleString('pt-BR')}/mês ou estenda o prazo.`
    });
  }
  
  // Insight sobre juros compostos
  const proporcaoRendimentos = (resultado.totalRendimentos / resultado.valorFinal) * 100;
  insights.push({
    tipo: 'info',
    titulo: '🚀 Poder dos Juros Compostos',
    descricao: `${proporcaoRendimentos.toFixed(0)}% do valor final virá de rendimentos, não de aportes!`
  });
  
  return (
    <Stack spacing={2}>
      {insights.map((insight, index) => (
        <Alert 
          key={index} 
          severity={insight.tipo as any}
          icon={<Lightbulb />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {insight.titulo}
          </Typography>
          <Typography variant="body2">
            {insight.descricao}
          </Typography>
        </Alert>
      ))}
    </Stack>
  );
}

// 🎯 COMPONENTE PRINCIPAL
export function MetasInvestimento() {
  const [metaSelecionada, setMetaSelecionada] = React.useState<MetaInvestimento>(metasPreDefinidas[0]);
  const [valorInicial, setValorInicial] = React.useState(10000);
  const [modoAvancado, setModoAvancado] = React.useState(false);
  
  // Estados para meta personalizada
  const [metaPersonalizada, setMetaPersonalizada] = React.useState<MetaInvestimento>({
    ...metasPreDefinidas[0],
    id: 'personalizada',
    nome: 'Meta Personalizada',
    tipo: 'PERSONALIZADA'
  });
  
  const metaAtual = metaSelecionada.id === 'personalizada' ? metaPersonalizada : metaSelecionada;
  
  const resultado = React.useMemo(() => 
    calcularSimulacao(
      valorInicial,
      metaAtual.aportesMensais,
      metaAtual.prazoMeses,
      metaAtual.rentabilidadeEsperada,
      metaAtual.valorObjetivo
    ), [valorInicial, metaAtual]
  );
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  const formatMeses = (meses: number) => {
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (anos === 0) return `${meses} meses`;
    if (mesesRestantes === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    return `${anos}a ${mesesRestantes}m`;
  };
  
  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    🎯 Simulador de Metas de Investimento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Defina seus objetivos e veja como alcançá-los com disciplina e juros compostos
                  </Typography>
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={modoAvancado}
                      onChange={(e) => setModoAvancado(e.target.checked)}
                    />
                  }
                  label="Modo Avançado"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Seleção de Meta */}
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                🎯 Escolha sua Meta
              </Typography>
              
              <Stack spacing={2}>
                {metasPreDefinidas.map((meta) => (
                  <Box
                    key={meta.id}
                    onClick={() => setMetaSelecionada(meta)}
                    sx={{
                      p: 2,
                      border: '2px solid',
                      borderColor: metaSelecionada.id === meta.id ? meta.cor : '#e2e8f0',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: metaSelecionada.id === meta.id ? `${meta.cor}10` : 'transparent',
                      '&:hover': {
                        borderColor: meta.cor,
                        backgroundColor: `${meta.cor}05`
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ color: meta.cor }}>
                        {React.cloneElement(meta.icone as React.ReactElement, { size: 24 })}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {meta.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(meta.valorObjetivo)} em {formatMeses(meta.prazoMeses)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
                
                {/* Meta Personalizada */}
                <Box
                  onClick={() => setMetaSelecionada({ ...metaPersonalizada, id: 'personalizada' })}
                  sx={{
                    p: 2,
                    border: '2px dashed',
                    borderColor: metaSelecionada.id === 'personalizada' ? '#8b5cf6' : '#e2e8f0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: metaSelecionada.id === 'personalizada' ? '#8b5cf610' : 'transparent',
                    '&:hover': {
                      borderColor: '#8b5cf6',
                      backgroundColor: '#8b5cf605'
                    }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Calculator size={24} color="#8b5cf6" />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        Meta Personalizada
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Crie sua própria meta
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Configurações */}
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                ⚙️ Configurações
              </Typography>
              
              <Stack spacing={3}>
                {/* Valor Inicial */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                    💰 Valor Inicial
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(Number(e.target.value))}
                    type="number"
                    InputProps={{
                      startAdornment: 'R$ '
                    }}
                  />
                </Box>
                
                {/* Meta Personalizada - Campos */}
                {metaSelecionada.id === 'personalizada' && (
                  <>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                        🎯 Valor Objetivo
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={metaPersonalizada.valorObjetivo}
                        onChange={(e) => setMetaPersonalizada(prev => ({
                          ...prev,
                          valorObjetivo: Number(e.target.value)
                        }))}
                        type="number"
                        InputProps={{
                          startAdornment: 'R$ '
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                        📅 Prazo (meses)
                      </Typography>
                      <Slider
                        value={metaPersonalizada.prazoMeses}
                        onChange={(_, value) => setMetaPersonalizada(prev => ({
                          ...prev,
                          prazoMeses: value as number
                        }))}
                        min={6}
                        max={360}
                        step={6}
                        marks={[
                          { value: 12, label: '1a' },
                          { value: 60, label: '5a' },
                          { value: 120, label: '10a' },
                          { value: 240, label: '20a' },
                          { value: 360, label: '30a' }
                        ]}
                        valueLabelDisplay="on"
                        valueLabelFormat={(value) => formatMeses(value)}
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                        💵 Aporte Mensal
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={metaPersonalizada.aportesMensais}
                        onChange={(e) => setMetaPersonalizada(prev => ({
                          ...prev,
                          aportesMensais: Number(e.target.value)
                        }))}
                        type="number"
                        InputProps={{
                          startAdornment: 'R$ '
                        }}
                      />
                    </Box>
                  </>
                )}
                
                {/* Configurações Avançadas */}
                {modoAvancado && (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                      📈 Rentabilidade Anual (%)
                    </Typography>
                    <Slider
                      value={metaAtual.rentabilidadeEsperada}
                      onChange={(_, value) => {
                        if (metaSelecionada.id === 'personalizada') {
                          setMetaPersonalizada(prev => ({
                            ...prev,
                            rentabilidadeEsperada: value as number
                          }));
                        }
                      }}
                      min={5}
                      max={20}
                      step={0.5}
                      marks={[
                        { value: 6, label: '6%' },
                        { value: 10, label: '10%' },
                        { value: 12, label: '12%' },
                        { value: 15, label: '15%' },
                        { value: 18, label: '18%' }
                      ]}
                      valueLabelDisplay="on"
                      valueLabelFormat={(value) => `${value}%`}
                      disabled={metaSelecionada.id !== 'personalizada'}
                    />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Resultados */}
        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                📊 Resultados
              </Typography>
              
              <Stack spacing={3}>
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: resultado.metaAlcancada ? '#f0fdf4' : '#fef2f2',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: resultado.metaAlcancada ? '#bbf7d0' : '#fecaca'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 800,
                    color: resultado.metaAlcancada ? '#059669' : '#dc2626',
                    textAlign: 'center'
                  }}>
                    {formatCurrency(resultado.valorFinal)}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    textAlign: 'center',
                    color: resultado.metaAlcancada ? '#065f46' : '#7f1d1d',
                    fontWeight: 600
                  }}>
                    Valor Final em {formatMeses(metaAtual.prazoMeses)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Aportado:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(resultado.totalAportado)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Rendimentos:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                      {formatCurrency(resultado.totalRendimentos)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Tempo para Meta:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatMeses(resultado.mesesParaAlcancar)}
                    </Typography>
                  </Box>
                  
                  {resultado.metaAlcancada && resultado.sobraOuFalta > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Sobra:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                        {formatCurrency(resultado.sobraOuFalta)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
                
                <Button
                  fullWidth
                  variant="contained"
                  color={resultado.metaAlcancada ? 'success' : 'warning'}
                  sx={{ mt: 2 }}
                >
                  {resultado.metaAlcancada ? '🎯 Meta Alcançável!' : '⚠️ Ajustar Estratégia'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Gráfico de Evolução */}
        <Grid xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                📈 Evolução da Meta
              </Typography>
              
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resultado.dadosEvolutivos.filter((_, i) => i % Math.ceil(resultado.dadosEvolutivos.length / 50) === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="mesLabel" 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#64748b"
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `R$ ${Number(value).toLocaleString('pt-BR')}`,
                        name
                      ]}
                    />
                    <Legend />
                    
                    <Line
                      type="monotone"
                      dataKey="totalAcumulado"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                      name="Valor Acumulado"
                    />
                    <Line
                      type="monotone"
                      dataKey="metaLinear"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Meta Linear"
                    />
                    <Line
                      type="monotone"
                      dataKey="aporteAcumulado"
                      stroke="#64748b"
                      strokeWidth={1}
                      dot={false}
                      name="Apenas Aportes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Insights */}
        <Grid xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                💡 Insights Inteligentes
              </Typography>
              
              <InsightsMeta resultado={resultado} meta={metaAtual} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
