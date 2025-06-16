/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';

// Seu código dos hooks e componentes auxiliares aqui... (mantido como no seu envio)

// O fechamento correto para o TableRow no map:
<TableCell sx={{ 
  textAlign: 'center',
  fontWeight: 600,
  color: '#475569',
  whiteSpace: 'nowrap',
  fontSize: '0.9rem'
}}>
  {row.precoQueIniciou}
</TableCell>
<TableCell sx={{ 
  textAlign: 'center',
  fontWeight: 700,
  color: row.precoAtual === 'N/A' ? '#64748b' :
         isPositive ? '#10b981' : '#ef4444',
  whiteSpace: 'nowrap',
  fontSize: '0.9rem'
}}>
  {row.precoAtual}
</TableCell>
<TableCell sx={{ textAlign: 'center' }}>
  <Typography 
    variant="body2" 
    sx={{ 
      color: '#059669',
      fontWeight: 700,
      backgroundColor: '#dcfce7',
      px: 1,
      py: 0.5,
      borderRadius: 1.5,
      display: 'inline-block',
      fontSize: '0.8rem',
      border: '1px solid #bbf7d0'
    }}
  >
    {row.dy}
  </Typography>
</TableCell>
<TableCell sx={{ 
  textAlign: 'center',
  fontWeight: 600,
  color: '#475569',
  whiteSpace: 'nowrap'
}}>
  {row.precoTeto}
</TableCell>
<TableCell sx={{ textAlign: 'center' }}>
  <Chip
    label={row.viesAtual}
    size="medium"
    sx={{
      backgroundColor: row.viesAtual === 'COMPRA' ? '#dcfce7' : '#fef3c7',
      color: row.viesAtual === 'COMPRA' ? '#059669' : '#d97706',
      fontWeight: 700,
      fontSize: '0.8rem',
      border: '1px solid',
      borderColor: row.viesAtual === 'COMPRA' ? '#bbf7d0' : '#fde68a',
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
  count={dividendosInternacionais.length}
  onPageChange={noop}
  onRowsPerPage={noop}
  page={0}
  rowsPerPage={dividendosInternacionais.length}
  rowsPerPageOptions={[5, 10, 25]}
  labelRowsPerPage="Itens por página:"
  labelDisplayedRows={({ from, to, count: totalCount }) => 
    `${from}-${to} de ${totalCount !== -1 ? totalCount : `mais de ${to}`}`
  }
  sx={{
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    p: 2,
    '& .MuiTablePagination-toolbar': {
      color: '#475569'
    }
  }}
/>
</Card>
</Box>
);
}
