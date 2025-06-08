'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { FIIOverviewTable } from '@/components/dashboard/overview/fii-overview-table';

// 🏢 DADOS DOS FIIs BASEADOS NA SUA TABELA
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
    vies: 'Aguardar',
    rank: '1º'
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NSLU.png',
    ticker: 'NSLU11',
    setor: 'Papel',
    dataEntrada: '23/05/2022',
    precoEntrada: 'R$ 9,31',
    precoAtual: 'R$ 8,85',
    dy: '11,52%',
    precoTeto: 'R$ 9,16',
    vies: 'Compra',
    rank: '2º'
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
    vies: 'Compra',
    rank: '3º'
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
    vies: 'Aguardar',
    rank: '4º'
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
    vies: 'Aguardar',
    rank: '5º'
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BDIA.png',
    ticker: 'BDIA11',
    setor: 'FoF',
    dataEntrada: '12/04/2023',
    precoEntrada: 'R$ 82,28',
    precoAtual: 'R$ 85,43',
    dy: '11,80%',
    precoTeto: 'R$ 87,81',
    vies: 'Compra',
    rank: '6º'
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
    vies: 'Aguardar',
    rank: '7º'
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
    vies: 'Compra',
    rank: '8º'
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RBCO.png',
    ticker: 'RBCO11',
    setor: 'Logística',
    dataEntrada: '09/05/2022',
    precoEntrada: 'R$ 99,25',
    precoAtual: 'R$ 102,15',
    dy: '10,18%',
    precoTeto: 'R$ 109,89',
    vies: 'Compra',
    rank: '9º'
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
    vies: 'Compra',
    rank: '10º'
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
    vies: 'Aguardar',
    rank: '11º'
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
    vies: 'Compra',
    rank: '12º'
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
    vies: 'Aguardar',
    rank: '13º'
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
    vies: 'Aguardar',
    rank: '14º'
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
    vies: 'Aguardar',
    rank: '15º'
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VTAL.png',
    ticker: 'VTAL11',
    setor: 'Papel',
    dataEntrada: '27/12/2022',
    precoEntrada: 'R$ 88,30',
    precoAtual: 'R$ 89,45',
    dy: '12,30%',
    precoTeto: 'R$ 94,33',
    vies: 'Compra',
    rank: '16º'
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
    vies: 'Compra',
    rank: '17º'
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
    vies: 'Compra',
    rank: '18º'
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
    vies: 'Aguardar',
    rank: '19º'
  },
  {
    id: '20',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RBRI.png',
    ticker: 'RBRI11',
    setor: 'Papel',
    dataEntrada: '25/11/2021',
    precoEntrada: 'R$ 104,53',
    precoAtual: 'R$ 106,78',
    dy: '14,71%',
    precoTeto: 'R$ 87,81',
    vies: 'Aguardar',
    rank: '20º'
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
    vies: 'Compra',
    rank: '21º'
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
    vies: 'Aguardar',
    rank: '22º'
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
    vies: 'Aguardar',
    rank: '23º'
  }
];

export default function SettingsPage() {
  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <FIIOverviewTable 
          count={fiisData.length} 
          rows={fiisData}
          page={0} 
          rowsPerPage={10}
        />
      </Grid>
    </Grid>
  );
}
