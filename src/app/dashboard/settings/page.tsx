'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
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
import { CircularProgress } from '@mui/material';

function noop() {}

// 🏢 DADOS DOS FIIs CORRIGIDOS BASEADOS NA PLANILHA EXCEL
const fiisData = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
    ticker: 'MALL11',
    setor: 'Shopping',
    dataEntrada: '26/01/2022',
    precoEntrada: 'R$ 118,37',
    precoAtual: 'R$ 109,23',
    dy: '10,09%',
    precoTeto: 'R$ 103,68',
    vies: 'Aguardar'
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png',
    ticker: 'KNSC11',
    setor: 'Papel',
    dataEntrada: '24/05/2022',
    precoEntrada: 'R$ 9,31',
    precoAtual: 'R$ 8,85',
    dy: '11,52%',
    precoTeto: 'R$ 9,16',
    vies: 'Compra'
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png',
    ticker: 'KNHF11',
    setor: 'Hedge Fund',
    dataEntrada: '20/12/2024',
    precoEntrada: 'R$ 76,31',
    precoAtual: 'R$ 78,45',
    dy: '12,17%',
    precoTeto: 'R$ 90,50',
    vies: 'Compra'
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png',
    ticker: 'HGBS11',
    setor: 'Shopping',
    dataEntrada: '02/01/2025',
    precoEntrada: 'R$ 186,08',
    precoAtual: 'R$ 178,92',
    dy: '10,77%',
    precoTeto: 'R$ 19,20',
    vies: 'Aguardar'
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png',
    ticker: 'RURA11',
    setor: 'Fiagro',
    dataEntrada: '14/02/2023',
    precoEntrada: 'R$ 10,25',
    precoAtual: 'R$ 9,87',
    dy: '13,75%',
    precoTeto: 'R$ 8,70',
    vies: 'Aguardar'
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BCIA.png',
    ticker: 'BCIA11',
    setor: 'FoF',
    dataEntrada: '12/04/2023',
    precoEntrada: 'R$ 82,28',
    precoAtual: 'R$ 85,43',
    dy: '11,80%',
    precoTeto: 'R$ 87,81',
    vies: 'Compra'
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png',
    ticker: 'BPFF11',
    setor: 'FoF',
    dataEntrada: '08/01/2024',
    precoEntrada: 'R$ 72,12',
    precoAtual: 'R$ 71,85',
    dy: '12,26%',
    precoTeto: 'R$ 66,26',
    vies: 'Aguardar'
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png',
    ticker: 'HGFF11',
    setor: 'FoF',
    dataEntrada: '03/04/2023',
    precoEntrada: 'R$ 69,15',
    precoAtual: 'R$ 68,92',
    dy: '11,12%',
    precoTeto: 'R$ 73,59',
    vies: 'Compra'
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BRCO.png',
    ticker: 'BRCO11',
    setor: 'Logística',
    dataEntrada: '09/05/2022',
    precoEntrada: 'R$ 99,25',
    precoAtual: 'R$ 102,15',
    dy: '10,18%',
    precoTeto: 'R$ 109,89',
    vies: 'Compra'
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png',
    ticker: 'XPML11',
    setor: 'Shopping',
    dataEntrada: '16/02/2022',
    precoEntrada: 'R$ 93,32',
    precoAtual: 'R$ 95,78',
    dy: '10,58%',
    precoTeto: 'R$ 110,40',
    vies: 'Compra'
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png',
    ticker: 'HGLG11',
    setor: 'Logística',
    dataEntrada: '20/06/2022',
    precoEntrada: 'R$ 161,80',
    precoAtual: 'R$ 158,34',
    dy: '8,62%',
    precoTeto: 'R$ 146,67',
    vies: 'Aguardar'
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HSML.png',
    ticker: 'HSML11',
    setor: 'Shopping',
    dataEntrada: '14/06/2022',
    precoEntrada: 'R$ 78,00',
    precoAtual: 'R$ 76,45',
    dy: '10,86%',
    precoTeto: 'R$ 93,60',
    vies: 'Compra'
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VGIP.png',
    ticker: 'VGIP11',
    setor: 'Papel',
    dataEntrada: '02/12/2021',
    precoEntrada: 'R$ 96,99',
    precoAtual: 'R$ 98,23',
    dy: '12,51%',
    precoTeto: 'R$ 88,00',
    vies: 'Aguardar'
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png',
    ticker: 'AFHI11',
    setor: 'Papel',
    dataEntrada: '05/07/2022',
    precoEntrada: 'R$ 99,91',
    precoAtual: 'R$ 97,56',
    dy: '12,25%',
    precoTeto: 'R$ 93,20',
    vies: 'Aguardar'
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png',
    ticker: 'BTLG11',
    setor: 'Logística',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 103,14',
    precoAtual: 'R$ 105,67',
    dy: '9,56%',
    precoTeto: 'R$ 104,00',
    vies: 'Aguardar'
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VRTA.png',
    ticker: 'VRTA11',
    setor: 'Papel',
    dataEntrada: '27/12/2022',
    precoEntrada: 'R$ 88,30',
    precoAtual: 'R$ 89,45',
    dy: '12,30%',
    precoTeto: 'R$ 94,33',
    vies: 'Compra'
  },
  {
    id: '17',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LVBI.png',
    ticker: 'LVBI11',
    setor: 'Logística',
    dataEntrada: '18/10/2022',
    precoEntrada: 'R$ 113,85',
    precoAtual: 'R$ 116,23',
    dy: '10,82%',
    precoTeto: 'R$ 122,51',
    vies: 'Compra'
  },
  {
    id: '18',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGRU.png',
    ticker: 'HGRU11',
    setor: 'Renda Urbana',
    dataEntrada: '17/05/2022',
    precoEntrada: 'R$ 115,00',
    precoAtual: 'R$ 112,87',
    dy: '10,35%',
    precoTeto: 'R$ 138,57',
    vies: 'Compra'
  },
  {
    id: '19',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALZR.png',
    ticker: 'ALZR11',
    setor: 'Híbrido',
    dataEntrada: '02/02/2022',
    precoEntrada: 'R$ 115,89',
    precoAtual: 'R$ 118,45',
    dy: '9,14%',
    precoTeto: 'R$ 10,16',
    vies: 'Aguardar'
  },
  {
    id: '20',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BCRI.png',
    ticker: 'BCRI11',
    setor: 'Papel',
    dataEntrada: '25/11/2021',
    precoEntrada: 'R$ 104,53',
    precoAtual: 'R$ 106,78',
    dy: '14,71%',
    precoTeto: 'R$ 87,81',
    vies: 'Aguardar'
  },
  {
    id: '21',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNRI.png',
    ticker: 'KNRI11',
    setor: 'Híbrido',
    dataEntrada: '27/06/2022',
    precoEntrada: 'R$ 131,12',
    precoAtual: 'R$ 134,56',
    dy: '8,82%',
    precoTeto: 'R$ 146,67',
    vies: 'Compra'
  },
  {
    id: '22',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/IRDM.png',
    ticker: 'IRDM11',
    setor: 'Papel',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 107,04',
    precoAtual: 'R$ 109,23',
    dy: '13,21%',
    precoTeto: 'R$ 73,20',
    vies: 'Aguardar'
  },
  {
    id: '23',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MXRF.png',
    ticker: 'MXRF11',
    setor: 'Papel',
    dataEntrada: '12/07/2022',
    precoEntrada: 'R$ 9,69',
    precoAtual: 'R$ 9,85',
    dy: '12,91%',
    precoTeto: 'R$ 9,40',
    vies: 'Aguardar'
  }
];

// 🎨 COMPONENTE DA TABELA INTERNO
interface SettingsTableProps {
  count?: number;
  page?: number;
  rows?: any[];
  rowsPerPage?: number;
}

function SettingsTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
}: SettingsTableProps): React.JSX.Element {
  return (
    <Card sx={{ 
      borderRadius: 3,
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
    }}>
      {/* Header da Tabela */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        p: 3,
        color: 'white'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          🏢 Carteira de FIIs Premium
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
          {rows.length} fundos imobiliários • Viés calculado automaticamente
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fundo Imobiliário</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Setor</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Entrada</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Preço Inicial</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Preço Atual</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Dividend Yield</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Preço Teto</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Viés</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const precoEntradaNum = parseFloat(row.precoEntrada.replace('R$ ', '').replace(',', '.'));
              const precoAtualNum = parseFloat(row.precoAtual.replace('R$ ', '').replace(',', '.'));
              const performance = ((precoAtualNum - precoEntradaNum) / precoEntradaNum) * 100;
              
              // Calcular viés automaticamente
              const precoTetoNum = parseFloat(row.precoTeto.replace('R$ ', '').replace(',', '.'));
              const viesCalculado = precoAtualNum < precoTetoNum ? 'Compra' : 'Aguardar';

              // Cores dos setores
              const setorColors: Record<string, { bg: string; color: string }> = {
                'Shopping': { bg: '#dbeafe', color: '#1d4ed8' },
                'Papel': { bg: '#fef3c7', color: '#d97706' },
                'Hedge Fund': { bg: '#f3e8ff', color: '#7c3aed' },
                'Fiagro': { bg: '#dcfce7', color: '#16a34a' },
                'FoF': { bg: '#fee2e2', color: '#dc2626' },
                'Logística': { bg: '#fef2f2', color: '#ef4444' },
                'Híbrido': { bg: '#f0f9ff', color: '#0284c7' },
                'Renda Urbana': { bg: '#ecfdf5', color: '#059669' }
              };
              
              const setorStyle = setorColors[row.setor] || { bg: '#f8fafc', color: '#475569' };

              return (
                <TableRow 
                  hover 
                  key={row.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <TableCell align="center" sx={{ fontWeight: 800, fontSize: '1rem' }}>
                    {index + 1}º
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar 
                        src={row.avatar} 
                        alt={row.ticker} 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          border: '2px solid rgba(59, 130, 246, 0.2)'
                        }} 
                      />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                          {row.ticker}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ 
                            fontWeight: 600, 
                            color: performance >= 0 ? '#059669' : '#dc2626',
                            backgroundColor: performance >= 0 ? '#dcfce7' : '#fee2e2',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                          }}
                        >
                          {performance > 0 ? '+' : ''}{performance.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={row.setor} 
                      size="small" 
                      sx={{
                        backgroundColor: setorStyle.bg,
                        color: setorStyle.color,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {row.dataEntrada}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                    {row.precoEntrada}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ 
                      fontWeight: 800, 
                      color: performance >= 0 ? '#10b981' : '#ef4444',
                      fontSize: '0.95rem'
                    }}
                  >
                    {row.precoAtual}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      display: 'inline-block',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {row.dy}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#475569' }}>
                    {row.precoTeto}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={viesCalculado}
                      size="medium"
                      sx={{
                        backgroundColor: viesCalculado === 'Compra' ? '#dcfce7' : '#fef3c7',
                        color: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        border: '2px solid',
                        borderColor: viesCalculado === 'Compra' ? '#bbf7d0' : '#fde68a',
                        textTransform: 'uppercase',
                        minWidth: 80,
                        '&:hover': {
                          backgroundColor: viesCalculado === 'Compra' ? '#059669' : '#d97706',
                          color: 'white',
                          transform: 'scale(1.05)'
                        }
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
        onRowsPerPageChange={noop}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="FIIs por página:"
        labelDisplayedRows={({ from, to, count: totalCount }) => 
          `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`} FIIs`
        }
        sx={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          p: 3
        }}
      />
    </Card>
  );
}

// 🎯 COMPONENTE PRINCIPAL DA PÁGINA
export default function SettingsPage(): React.JSX.Element {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} />
        <Box ml={2} sx={{ fontSize: '1.1rem' }}>
          🏢 Carregando carteira de FIIs...
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <SettingsTable 
        count={fiisData.length} 
        rows={fiisData}
        page={0} 
        rowsPerPage={10}
      />
    </Box>
  );
}
