/* eslint-disable @typescript-eslint/explicit-function-return-type */
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

function noop(): void {
  // Função vazia para props obrigatórias
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string; // Mudando para string (emoji)
  trend?: 'up' | 'down';
  diff?: number;
}

function StatCard({ title, value, icon, trend, diff }: StatCardProps): React.JSX.Element {
  const trendSymbol = trend === 'up' ? '↗' : '↘';
  const trendColor = trend === 'up' ? '#10b981' : '#ef4444';
  
  return (
    <Card sx={{
      minHeight: 120,
      flex: '1 1 200px',
      maxWidth: { xs: '100%', sm: '300px' },
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography 
              color="text.secondary" 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
            <Avatar sx={{ 
              backgroundColor: '#374151',
              height: 32, 
              width: 32,
              fontSize: '16px',
              color: 'white'
            }}>
              {icon}
            </Avatar>
          </Stack>
          
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: trend && diff !== undefined ? 
                  (trend === 'up' ? '#10b981' : '#ef4444') 
                  : 'text.primary',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {value}
            </Typography>
          </Box>
          
          {diff !== undefined && trend && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography sx={{ 
                color: trendColor,
                fontWeight: 600,
                fontSize: '0.8rem'
              }}>
                {trendSymbol} {diff > 0 ? '+' : ''}{diff}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function getSetorIcon(setor: string): string {
  switch (setor.toLowerCase()) {
    case 'shopping':
    case 'shoppings':
      return '🏬';
    case 'papel':
    case 'papel e celulose':
      return '📄';
    case 'logística':
    case 'logistico':
      return '🚛';
    case 'fii':
    case 'fiis':
    case 'híbrido':
    case 'hibrido':
    case 'hedge fund':
    case 'fof':
    case 'fiagro':
    case 'renda urbana':
      return '🏢';
    case 'renda fixa':
      return '📈';
    default:
      return '💼';
  }
}

export interface SettingsData {
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
  performance?: number;
  variacao?: number;
  variacaoPercent?: number;
  volume?: number;
  statusApi?: string;
}

interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: SettingsData[];
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

export function SettingsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  cardsData = {},
}: SettingsTableProps): React.JSX.Element {
  
  // Dados reais dos ativos baseados na tabela fornecida
  const dadosReais: SettingsData[] = [
    {
      id: "1",
      avatar: "",
      ticker: "MALL11",
      setor: "Shopping",
      dataEntrada: "26/01/2022",
      precoEntrada: "R$ 118,37",
      precoAtual: "R$ 103,53",
      dy: "8.40%",
      precoTeto: "R$ 103,68",
      vies: "Compra"
    },
    {
      id: "2",
      avatar: "",
      ticker: "KNSC11",
      setor: "Papel",
      dataEntrada: "24/05/2022",
      precoEntrada: "R$ 9,31",
      precoAtual: "R$ 8,87",
      dy: "10.98%",
      precoTeto: "R$ 9,16",
      vies: "Compra"
    },
    {
      id: "3",
      avatar: "",
      ticker: "KNHF11",
      setor: "Hedge Fund",
      dataEntrada: "20/12/2024",
      precoEntrada: "R$ 76,31",
      precoAtual: "R$ 91,05",
      dy: "15.00%",
      precoTeto: "R$ 90,50",
      vies: "Compra"
    },
    {
      id: "4",
      avatar: "",
      ticker: "HGBS11",
      setor: "Shopping",
      dataEntrada: "02/01/2025",
      precoEntrada: "R$ 186,08",
      precoAtual: "R$ 199,60",
      dy: "10.50%",
      precoTeto: "R$ 192,00",
      vies: "Compra"
    },
    {
      id: "5",
      avatar: "",
      ticker: "RURA11",
      setor: "Fiagro",
      dataEntrada: "14/02/2023",
      precoEntrada: "R$ 10,25",
      precoAtual: "R$ 8,47",
      dy: "13.21%",
      precoTeto: "R$ 8,70",
      vies: "Compra"
    }
  ];

  // 🔥 CORREÇÃO: PRIORIZAR DADOS DA API (rows) SOBRE DADOS ESTÁTICOS
  const dadosParaUsar = rows.length > 0 ? rows : dadosReais;

  console.log("✅ SettingsTable iniciado!");
  console.log("📊 Dados recebidos via props (API):", rows.length, "itens");
  console.log("📊 Dados estáticos (fallback):", dadosReais.length, "itens");
  console.log("🎯 Usando dados:", rows.length > 0 ? "DA API (REAL)" : "ESTÁTICOS (FALLBACK)");
  console.log("🔍 Primeiro ativo da API:", rows[0]?.ticker, "- Preço atual:", rows[0]?.precoAtual);
  console.log("🔍 Performance do primeiro ativo:", rows[0]?.performance);

  const defaultCards = {
    ibovespa: { value: "158.268", trend: "up" as const, diff: 10.09 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "R$ 118,27", trend: "up" as const, diff: 10.09 },
    dividendYield: { value: "10,9%", trend: "up" as const, diff: 10.9 },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  const cards = { ...defaultCards, ...cardsData };

  return (
    <Box>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}>
        <StatCard 
          title="IBOVESPA" 
          value={cards.ibovespa.value} 
          icon="📈"
          trend={cards.ibovespa.trend} 
          diff={cards.ibovespa.diff} 
        />
        <StatCard 
          title="IFIX HOJE" 
          value={cards.indiceSmall.value} 
          icon="🏢"
          trend={cards.indiceSmall.trend} 
          diff={cards.indiceSmall.diff} 
        />
        <StatCard 
          title="CARTEIRA HOJE" 
          value={cards.carteiraHoje.value} 
          icon="💼"
          trend={cards.carteiraHoje.trend}
          diff={cards.carteiraHoje.diff}
        />
        <StatCard 
          title="DIVIDEND YIELD" 
          value={cards.dividendYield.value} 
          icon="💎"
          trend={cards.dividendYield.trend}
          diff={cards.dividendYield.diff}
        />
        <StatCard 
          title="IFIX PERÍODO" 
          value={cards.ibovespaPeriodo.value} 
          icon="📊"
          trend={cards.ibovespaPeriodo.trend} 
          diff={cards.ibovespaPeriodo.diff} 
        />
        <StatCard 
          title="CARTEIRA PERÍODO" 
          value={cards.carteiraPeriodo.value} 
          icon="⬆️"
          trend={cards.carteiraPeriodo.trend} 
          diff={cards.carteiraPeriodo.diff} 
        />
      </Box>
      
      <Card sx={{ boxShadow: 2 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '80px' }}>
                  Posição
                </TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Setor</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Data de Entrada</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço que Iniciou</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Atual</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>DY</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Preço Teto</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Viés</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dadosParaUsar.map((row, index) => {
                // 🔥 FUNÇÃO PARA CALCULAR O VIÉS AUTOMATICAMENTE
                const calcularVies = (precoTeto: string, precoAtual: string) => {
                  // Remover formatação e converter para números
                  const precoTetoNum = parseFloat(precoTeto.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(precoAtual.replace('R$ ', '').replace(',', '.'));
                  
                  // Verificar se os valores são válidos
                  if (isNaN(precoTetoNum) || isNaN(precoAtualNum) || precoAtual === 'N/A') {
                    return 'Aguardar'; // Default se não conseguir calcular
                  }
                  
                  // 🎯 LÓGICA: Preço Atual <= Preço Teto = COMPRA
                  if (precoAtualNum <= precoTetoNum) {
                    return 'Compra';
                  } else {
                    return 'Aguardar';
                  }
                };
                
                // 🎨 FUNÇÃO PARA DEFINIR CORES DO VIÉS
                const getViesStyle = (vies: string) => {
                  if (vies === 'Compra') {
                    return {
                      backgroundColor: '#dcfce7', // Verde claro
                      color: '#059669', // Verde escuro
                      border: '1px solid #bbf7d0' // Borda verde
                    };
                  } else { // Aguardar
                    return {
                      backgroundColor: '#fef3c7', // Amarelo claro
                      color: '#d97706', // Amarelo escuro
                      border: '1px solid #fde68a' // Borda amarela
                    };
                  }
                };
                
                // Calcular o viés baseado na lógica
                const viesCalculado = calcularVies(row.precoTeto, row.precoAtual);
                const estiloVies = getViesStyle(viesCalculado);
                
                // Calcular performance se não estiver disponível
                let performance = row.performance;
                if (performance === undefined) {
                  const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
                  const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
                  performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
                }
                
                return (
                  <TableRow 
                    hover 
                    key={row.id}
                    onClick={() => window.location.href = `/dashboard/empresa/${row.ticker}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <TableCell sx={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>
                      {index + 1}º
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          width: 32, 
                          height: 32,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px'
                        }}>
                          {getSetorIcon(row.setor)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {row.ticker}
                          </Typography>
                          {performance !== 0 && (
                            <Typography variant="caption" sx={{ 
                              color: performance >= 0 ? '#059669' : '#dc2626',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'normal', 
                      textAlign: 'center', 
                      lineHeight: 1.2,
                      fontSize: '0.875rem'
                    }}>
                      {row.setor}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{row.dataEntrada}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500, textAlign: 'center' }}>{row.precoEntrada}</TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap', 
                      fontWeight: 700, 
                      textAlign: 'center',
                      color: performance >= 0 ? '#059669' : '#dc2626'
                    }}>
                      {row.precoAtual}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500, textAlign: 'center' }}>{row.dy}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500, textAlign: 'center' }}>{row.precoTeto}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {/* 🔥 VIÉS CALCULADO AUTOMATICAMENTE COM CORES VERDE/AMARELO */}
                      <Box sx={{
                        ...estiloVies, // Aplica as cores baseadas no cálculo
                        px: 2,
                        py: 0.75,
                        borderRadius: '20px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        display: 'inline-block',
                        textAlign: 'center',
                        minWidth: '80px',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}>
                        {viesCalculado}
                      </Box>
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
          count={count || dadosParaUsar.length}
          onPageChange={noop}
          onRowsPerPageChange={noop}
          page={page}
          rowsPerPage={rowsPerPage || dadosParaUsar.length}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count: totalCount }) => 
            `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
          }
        />
      </Card>
    </Box>
  );
}
