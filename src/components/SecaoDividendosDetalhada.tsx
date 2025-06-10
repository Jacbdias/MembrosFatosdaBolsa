// 🎯 src/components/SecaoDividendosDetalhada.tsx
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
  Divider
} from '@mui/material';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { useDividendosAtivo } from '@/hooks/useDividendosAtivo';

interface SecaoDividendosProps {
  ticker: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  isFII?: boolean;
}

export function SecaoDividendosDetalhada({ 
  ticker, 
  dataEntrada, 
  precoEntrada, 
  precoAtual,
  isFII = false 
}: SecaoDividendosProps) {
  const { dividendos, performance, loading, error } = useDividendosAtivo(
    ticker, 
    dataEntrada, 
    precoEntrada, 
    precoAtual
  );

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            💰 Análise de Dividendos
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Carregando histórico de dividendos...
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
            💰 Análise de Dividendos
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Erro ao carregar dividendos: {error}
          </Alert>
          {performance && (
            <Typography variant="body2" color="text.secondary">
              Mostrando apenas performance de capital: {performance.performanceCapital.toFixed(2)}%
            </Typography>
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
            💰 Análise de Dividendos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Dados insuficientes para análise de dividendos.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = performance.performanceTotal >= 0 ? TrendUpIcon : TrendDownIcon;
  const trendColor = performance.performanceTotal >= 0 ? '#22c55e' : '#ef4444';

  return (
    <Grid container spacing={3}>
      {/* Cards de Performance */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              💰 Análise de Rentabilidade Completa
            </Typography>
            
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

              {/* Performance de Dividendos */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f0f9ff', border: '1px solid #e5e7eb' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: '#0891b2',
                      mb: 1
                    }}>
                      +{performance.dividendosPercentual.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      💰 {isFII ? 'Rendimentos' : 'Dividendos'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      R$ {performance.dividendosTotal.toFixed(2).replace('.', ',')} recebidos
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
                      Capital + {isFII ? 'Rendimentos' : 'Dividendos'}
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
                      {performance.quantidadeDividendos}x
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      📊 Pagamentos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Média: R$ {performance.mediaAnual.toFixed(2).replace('.', ',')} /ano
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Histórico Detalhado */}
      <Grid item xs={12}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              📋 Histórico de {isFII ? 'Rendimentos' : 'Dividendos'}
            </Typography>
            
            {dividendos.length > 0 ? (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>% sobre Entrada</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dividendos.map((dividendo, index) => {
                      const precoEntradaNum = parseFloat(precoEntrada.replace('R$ ', '').replace(',', '.'));
                      const percentualSobreEntrada = precoEntradaNum > 0 
                        ? (dividendo.value / precoEntradaNum) * 100 
                        : 0;
                      
                      return (
                        <TableRow key={index} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {dividendo.dataFormatada}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={dividendo.type} 
                              size="small" 
                              color={dividendo.type === 'Dividendo' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#22c55e' }}>
                            {dividendo.valorFormatado}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#0891b2' }}>
                            {percentualSobreEntrada.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  📭 Nenhum {isFII ? 'rendimento' : 'dividendo'} encontrado desde a entrada.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Data de entrada: {dataEntrada}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
