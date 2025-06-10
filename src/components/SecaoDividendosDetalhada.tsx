// 🎯 src/components/SecaoProventosDetalhada.tsx - TODOS OS TIPOS
'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  CircularProgress,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { ArrowClockwise as RefreshIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { useProventosAtivo } from '@/hooks/useProventosAtivo';

interface SecaoProventosProps {
  ticker: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  isFII?: boolean;
}

export function SecaoProventosDetalhada({ 
  ticker, 
  dataEntrada, 
  precoEntrada, 
  precoAtual,
  isFII = false 
}: SecaoProventosProps) {
  const { proventos, performance, loading, error, refetch } = useProventosAtivo(
    ticker, 
    dataEntrada, 
    precoEntrada, 
    precoAtual
  );

  const [tabAtual, setTabAtual] = React.useState(0);

  // 📊 FILTRAR PROVENTOS POR CATEGORIA
  const proventosMonetarios = proventos.filter(p => p.categoria === 'monetario');
  const proventosAcao = proventos.filter(p => p.categoria === 'acao');
  const outrosProventos = proventos.filter(p => p.categoria === 'outro');

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            💰 Análise Completa de Proventos
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Carregando histórico completo de proventos...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            💰 Análise Completa de Proventos
          </Typography>
          
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={refetch}
                startIcon={<RefreshIcon size={16} />}
              >
                Tentar Novamente
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Erro ao carregar proventos
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>

          {performance && (
            <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                📈 Performance de Capital (sem proventos)
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(Math.abs(performance.performanceCapital), 100)} 
                    sx={{ 
                      height: 12, 
                      borderRadius: 1, 
                      backgroundColor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: performance.performanceCapital >= 0 ? '#22c55e' : '#ef4444'
                      }
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: performance.performanceCapital >= 0 ? '#22c55e' : '#ef4444'
                }}>
                  {performance.performanceCapital > 0 ? '+' : ''}{performance.performanceCapital.toFixed(1)}%
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!performance) {
    return (
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            💰 Análise Completa de Proventos
          </Typography>
          <Alert severity="info">
            Dados insuficientes para análise de proventos.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = performance.performanceTotal >= 0 ? TrendUpIcon : TrendDownIcon;
  const trendColor = performance.performanceTotal >= 0 ? '#22c55e' : '#ef4444';

  // 🏷️ FUNÇÃO PARA OBTER COR DO TIPO DE PROVENTO
  const getProventoColor = (tipo: string) => {
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes('dividend')) return '#22c55e';
    if (tipoLower.includes('jcp')) return '#3b82f6';
    if (tipoLower.includes('split')) return '#f59e0b';
    if (tipoLower.includes('bonificação') || tipoLower.includes('bonus')) return '#8b5cf6';
    return '#6b7280';
  };

  return (
    <Grid container spacing={3}>
      {/* Cards de Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                💰 Análise Completa de Rentabilidade
              </Typography>
              
              <Stack direction="row" spacing={1}>
                {performance.quantidadeProventos > 0 && (
                  <Alert severity="success" sx={{ py: 0.5 }}>
                    ✅ {performance.quantidadeProventos} proventos encontrados
                  </Alert>
                )}
              </Stack>
            </Stack>
            
            <Grid container spacing={3}>
              {/* Performance de Capital */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: performance.performanceCapital >= 0 ? '#22c55e' : '#ef4444',
                      mb: 1
                    }}>
                      {performance.performanceCapital > 0 ? '+' : ''}{performance.performanceCapital.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      📈 Valorização
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {precoEntrada} → {precoAtual}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Proventos Monetários */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f0f9ff', border: '1px solid #e5e7eb' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#0891b2',
                      mb: 1
                    }}>
                      +{performance.proventosPercentual.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      💰 Proventos $
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      R$ {performance.proventosMonetarios.toFixed(2).replace('.', ',')} recebidos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Performance Total */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f0fdf4', border: '2px solid #22c55e' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
                      <TrendIcon size={24} style={{ color: trendColor, marginRight: 8 }} />
                      <Typography variant="h4" sx={{ 
                        fontWeight: 700, 
                        color: trendColor
                      }}>
                        {performance.performanceTotal > 0 ? '+' : ''}{performance.performanceTotal.toFixed(1)}%
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      🎯 TOTAL
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Capital + Proventos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Estatísticas */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fefce8', border: '1px solid #e5e7eb' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#ca8a04',
                      mb: 1
                    }}>
                      {performance.quantidadeProventos}x
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      📊 Eventos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Object.keys(performance.proventosPorTipo).length} tipos diferentes
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Resumo por Tipo */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📋 Histórico Completo de Proventos
            </Typography>
            
            <Tabs value={tabAtual} onChange={(_, newValue) => setTabAtual(newValue)} sx={{ mb: 3 }}>
              <Tab label={`💰 Monetários (${proventosMonetarios.length})`} />
              <Tab label={`📈 Ações (${proventosAcao.length})`} />
              <Tab label={`📊 Todos (${proventos.length})`} />
            </Tabs>

            {/* Tab Proventos Monetários */}
            {tabAtual === 0 && (
              <ProventosTabela 
                proventos={proventosMonetarios}
                precoEntrada={precoEntrada}
                emptyMessage="💰 Nenhum provento monetário encontrado"
              />
            )}

            {/* Tab Proventos em Ações */}
            {tabAtual === 1 && (
              <ProventosTabela 
                proventos={proventosAcao}
                precoEntrada={precoEntrada}
                emptyMessage="📈 Nenhum provento em ações encontrado"
              />
            )}

            {/* Tab Todos os Proventos */}
            {tabAtual === 2 && (
              <ProventosTabela 
                proventos={proventos}
                precoEntrada={precoEntrada}
                emptyMessage="📊 Nenhum provento encontrado desde a entrada"
                showCategory={true}
              />
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

// 📊 COMPONENTE AUXILIAR PARA TABELA DE PROVENTOS
function ProventosTabela({ 
  proventos, 
  precoEntrada, 
  emptyMessage,
  showCategory = false 
}: { 
  proventos: any[], 
  precoEntrada: string, 
  emptyMessage: string,
  showCategory?: boolean 
}) {
  if (proventos.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8fafc' }}>
            <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
            {showCategory && (
              <TableCell sx={{ fontWeight: 600 }}>Categoria</TableCell>
            )}
            <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Impacto</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {proventos.map((provento, index) => {
            const getProventoColor = (tipo: string) => {
              const tipoLower = tipo.toLowerCase();
              if (tipoLower.includes('dividend')) return '#22c55e';
              if (tipoLower.includes('jcp')) return '#3b82f6';
              if (tipoLower.includes('split')) return '#f59e0b';
              if (tipoLower.includes('bonificação') || tipoLower.includes('bonus')) return '#8b5cf6';
              return '#6b7280';
            };

            const getCategoriaInfo = (categoria: string) => {
              switch (categoria) {
                case 'monetario':
                  return { label: '💰 Monetário', color: '#22c55e' };
                case 'acao':
                  return { label: '📈 Ação', color: '#f59e0b' };
                default:
                  return { label: '📊 Outro', color: '#6b7280' };
              }
            };

            return (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {provento.dataFormatada}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={provento.type} 
                    size="small" 
                    sx={{
                      backgroundColor: getProventoColor(provento.type),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                {showCategory && (
                  <TableCell>
                    <Chip 
                      label={getCategoriaInfo(provento.categoria).label} 
                      size="small" 
                      variant="outlined"
                      sx={{
                        borderColor: getCategoriaInfo(provento.categoria).color,
                        color: getCategoriaInfo(provento.categoria).color
                      }}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ 
                  fontWeight: 600, 
                  fontSize: '1.1rem', 
                  color: provento.categoria === 'monetario' ? '#22c55e' : '#f59e0b' 
                }}>
                  {provento.valorFormatado}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#0891b2' }}>
                  {provento.impactoPercentual > 0 
                    ? `+${provento.impactoPercentual.toFixed(2)}%`
                    : provento.categoria === 'acao' 
                      ? `${provento.value}x`
                      : '0%'
                  }
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}, fontWeight: 600 }}>
              📊 Resumo por Tipo de Provento
            </Typography>
            
            {Object.keys(performance.proventosPorTipo).length > 0 ? (
              <Stack spacing={2}>
                {Object.entries(performance.proventosPorTipo)
                  .sort(([,a], [,b]) => b - a)
                  .map(([tipo, quantidade]) => (
                  <Box key={tipo} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 1,
                    borderLeft: `4px solid ${getProventoColor(tipo)}`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {tipo}
                    </Typography>
                    <Chip 
                      label={`${quantidade}x`} 
                      size="small"
                      sx={{ 
                        backgroundColor: getProventoColor(tipo),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum provento encontrado
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Proventos por Ano */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📅 Proventos Monetários por Ano
            </Typography>
            
            {Object.keys(performance.proventosPorAno).length > 0 ? (
              <Stack spacing={2}>
                {Object.entries(performance.proventosPorAno)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([ano, valor]) => (
                  <Box key={ano} sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 1 
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ano}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600, 
                      color: '#22c55e'
                    }}>
                      R$ {valor.toFixed(2).replace('.', ',')}
                    </Typography>
                  </Box>
                ))}
                
                <Divider />
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2, 
                  backgroundColor: '#e0f2fe', 
                  borderRadius: 1 
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Média Anual
                  </Typography>
                  <Typography variant="subtitle2" sx={{ 
                    fontWeight: 700, 
                    color: '#0891b2'
                  }}>
                    R$ {performance.mediaAnual.toFixed(2).replace('.', ',')}
                  </Typography>
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nenhum provento monetário encontrado
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Histórico Detalhado com Tabs */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3
