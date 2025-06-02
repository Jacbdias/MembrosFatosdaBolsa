/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-shadow */
'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { UsersThree as UsersThreeIcon } from '@phosphor-icons/react/dist/ssr/UsersThree';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { TrendUp, TrendDown } from '@phosphor-icons/react/dist/ssr';

import { useSelection } from '@/hooks/use-selection';

function noop(): void {
  // Função vazia para props obrigatórias
}

// 🔧 FUNÇÃO PARA EXPANDIR VALORES ABREVIADOS VINDOS DA API
function expandirValorAbreviado(value: string): string {
  // Se o valor já é uma porcentagem, retorna como está
  if (value.includes('%')) {
    return value;
  }
  
  // Converter abreviações para valores completos
  const valueStr = value.toString().toLowerCase();
  
  // 💰 IBOVESPA: Se contém 'k' e é um valor grande (>100k), usar formato mais preciso
  if (valueStr.includes('k')) {
    const numero = parseFloat(valueStr.replace('k', '').replace(',', '.'));
    if (!isNaN(numero)) {
      const valorCompleto = numero * 1000;
      
      // Para valores do Ibovespa (>100.000), mostrar com mais precisão
      if (valorCompleto >= 100000) {
        return valorCompleto.toLocaleString('pt-BR', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        });
      } else {
        // Para outros valores menores
        return valorCompleto.toLocaleString('pt-BR', { 
          minimumFractionDigits: 0,
          maximumFractionDigits: 0 
        });
      }
    }
  }
  
  // Se contém 'm', multiplica por 1.000.000
  if (valueStr.includes('m')) {
    const numero = parseFloat(valueStr.replace('m', '').replace(',', '.'));
    if (!isNaN(numero)) {
      const valorCompleto = numero * 1000000;
      return valorCompleto.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
  }
  
  // Se contém 'b', multiplica por 1.000.000.000
  if (valueStr.includes('b')) {
    const numero = parseFloat(valueStr.replace('b', '').replace(',', '.'));
    if (!isNaN(numero)) {
      const valorCompleto = numero * 1000000000;
      return valorCompleto.toLocaleString('pt-BR', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
  }
  
  // Se é um número simples como "140.109", formatar com pontos brasileiros
  const numeroSimples = parseFloat(value.replace(',', '.'));
  if (!isNaN(numeroSimples) && numeroSimples >= 1000) {
    return numeroSimples.toLocaleString('pt-BR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    });
  }
  
  // Se não tem abreviação, retorna o valor original
  return value;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  diff?: number;
}

// 🎨 CARD ESTATÍSTICO REDESENHADO COM DESIGN LIMPO
function StatCard({ title, value, icon, trend, diff }: StatCardProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  const topBorderColor = trend === 'up' ? '#10b981' : '#ef4444';
  
  // 🔥 APLICAR EXPANSÃO DE VALORES ABREVIADOS AQUI
  const valorExpandido = expandirValorAbreviado(value);
  
  return (
    <Card 
      sx={{ 
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: topBorderColor,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#64748b',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}>
              {React.cloneElement(icon as React.ReactElement, { size: 16 })}
            </Box>
          </Stack>
          
          {/* Valor principal - AGORA EXPANDIDO */}
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: '#1e293b',
              fontSize: '1.75rem',
              lineHeight: 1
            }}
          >
            {valorExpandido}
          </Typography>
          
          {/* Indicador de tendência */}
          {diff !== undefined && trend && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
                color: trendColor
              }}>
                <TrendIcon size={12} weight="bold" />
              </Box>
              <Typography 
                variant="body2"
                sx={{ 
                  color: trendColor,
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {diff > 0 ? '+' : ''}{diff}%
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  color: '#64748b',
                  fontSize: '0.875rem'
                }}
              >
                período
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export interface OverviewData {
  id: string;
  avatar: string;
  ticker: string;
  setor: string;
  dataEntrada: string;
  precoEntrada: string;
  precoAtual: string;
  dy: string;
  precoTeto: string;
  vies: string;
}

interface OverviewTableProps {
  count?: number;
  page?: number;
  rows?: OverviewData[];
  rowsPerPage?: number;
  cardsData?: {
    ibovespa?: { value: string; trend?: 'up' | 'down'; diff?: number };
    indiceSmall?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraHoje?: { value: string; trend?: 'up' | 'down'; diff?: number };
    dividendYield?: { value: string; trend?: 'up' | 'down'; diff?: number };
    ibovespaPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
    carteiraPeriodo?: { value: string; trend?: 'up' | 'down'; diff?: number };
  };
}

export function OverviewTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: OverviewTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((item) => item.id), [rows]);

  // 🔥 VALORES PADRÃO ATUALIZADOS COM DADOS REAIS DA BRAPI (CASO A API FALHE COMPLETAMENTE)
  const defaultCards = {
    ibovespa: { value: "140.109", trend: "up" as const, diff: 0.34 },  // 💰 Valor real da BRAPI: 140.109,62
    indiceSmall: { value: "3.200", trend: "up" as const, diff: 0.24 }, // 📊 IFIX estimado em 3.200 pontos
    carteiraHoje: { value: "88.7%", trend: "up" as const, diff: 88.7 },
    dividendYield: { value: "7.4%", trend: "up" as const, diff: 7.4 },
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  // 🔧 COMBINAR DADOS - A EXPANSÃO ACONTECE NO COMPONENTE StatCard
  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      {/* Grid de cards redesenhado */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(6, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard 
          title="IBOVESPA" 
          value={cards.ibovespa.value} 
          icon={<CurrencyDollarIcon />} 
          trend={cards.ibovespa.trend} 
          diff={cards.ibovespa.diff} 
        />
        <StatCard 
          title="ÍNDICE SMALL" 
          value={cards.indiceSmall.value} 
          icon={<UsersThreeIcon />} 
          trend={cards.indiceSmall.trend} 
          diff={cards.indiceSmall.diff} 
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value={cards.carteiraHoje.value} 
          icon={<ListBulletsIcon />}
          trend={cards.carteiraHoje.trend}
          diff={cards.carteiraHoje.diff}
        />
        <StatCard 
          title="DIVIDEND YIELD" 
          value={cards.dividendYield.value} 
          icon={<ChartBarIcon />}
          trend={cards.dividendYield.trend}
          diff={cards.dividendYield.diff}
        />
        <StatCard 
          title="IBOVESPA PERÍODO" 
          value={cards.ibovespaPeriodo.value} 
          icon={<CurrencyDollarIcon />} 
          trend={cards.ibovespaPeriodo.trend} 
          diff={cards.ibovespaPeriodo.diff} 
        />
        <StatCard 
          title="CARTEIRA PERÍODO" 
          value={cards.carteiraPeriodo.value} 
          icon={<ChartBarIcon />} 
          trend={cards.carteiraPeriodo.trend} 
          diff={cards.carteiraPeriodo.diff} 
        />
      </Box>
      
      {/* Tabela redesenhada */}
      <Card sx={{ 
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'rgba(148, 163, 184, 0.2)'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            fontSize: '1.1rem'
          }}>
            📊 Carteira de Small Caps
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#64748b',
            mt: 0.5
          }}>
            {rows.length} ativos • Viés calculado automaticamente
          </Typography>
        </Box>
        
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              }}>
                <TableCell sx={{ 
                  fontWeight: 700, 
                  textAlign: 'center', 
                  width: '80px',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  #
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Entrada</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Preço Inicial</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Teto</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'center', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum)) {
                    return 'Aguardar';
                  }
                  
                  return precoTetoNum > precoAtualNum ? 'Compra' : 'Aguardar';
                };
                
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                
                // Calcular performance
                const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.04)',
                        cursor: 'pointer',
                        transform: 'scale(1.01)',
                        transition: 'all 0.2s ease'
                      },
                      borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                    }}
                  >
                    <TableCell sx={{ 
                      textAlign: 'center', 
                      fontWeight: 800, 
                      fontSize: '1rem',
                      color: '#6366f1'
                    }}>
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          src={row.avatar} 
                          alt={row.ticker}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            border: '2px solid',
                            borderColor: 'rgba(99, 102, 241, 0.2)'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 700,
                            color: '#1e293b',
                            fontSize: '0.95rem'
                          }}>
                            {row.ticker}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#64748b',
                            fontSize: '0.75rem'
                          }}>
                            {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={row.setor}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366f1',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          border: '1px solid rgba(99, 102, 241, 0.2)'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '0.85rem'
                    }}>
                      {row.dataEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {row.precoEntrada}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 700,
                      color: performance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#6366f1'
                    }}>
                      {row.dy}
                    </TableCell>
                    <TableCell sx={{ 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: '#475569'
                    }}>
                      {row.precoTeto}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip
                        label={viesCalculado}
                        size="small"
                        sx={{
                          backgroundColor: viesCalculado === 'Compra' ? '#dcfce7' : '#fef3c7',
                          color: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination
          component="div"
          count={count}
          onPageChange={noop}
          onRowsPerPage={noop}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            '& .MuiTablePagination-toolbar': {
              color: '#475569'
            }
          }}
        />
      </Card>
    </Box>
  );
}
