/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { SettingsFilters } from '@/components/dashboard/settings/settings-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

// DADOS ESPECÍFICOS PARA DIVIDENDOS - baseados na tabela fornecida
const dividendosAtivos = [
  {
    id: '1',
    avatar: '/api/placeholder/32/32', // Ícone de shopping/loja
    ticker: 'MALL11',
    setor: 'Shopping',
    dataEntrada: '24/01/2022',
    precoEntrada: 'R$ 113,27',
    precoAtual: 'R$ 101,52',
    dy: '10,00%',
    precoTeto: 'R$ 103,68',
    vies: 'Compra',
  },
  {
    id: '2',
    avatar: '/api/placeholder/32/32', // Ícone de papel/documento
    ticker: 'KLBC11',
    setor: 'Papel',
    dataEntrada: '24/01/2022',
    precoEntrada: 'R$ 9,24',
    precoAtual: 'R$ 13,67',
    dy: '11,22%',
    precoTeto: 'R$ 9,18',
    vies: 'Compra',
  },
  {
    id: '3',
    avatar: '/api/placeholder/32/32', // Ícone de shopping
    ticker: 'IRDM11',
    setor: 'Shopping',
    dataEntrada: '05/01/2025',
    precoEntrada: 'R$ 148,00',
    precoAtual: 'R$ 15,94',
    dy: '10,77%',
    precoTeto: 'R$ 19,20',
    vies: 'Compra',
  },
  {
    id: '4',
    avatar: '/api/placeholder/32/32', // Ícone de papel
    ticker: 'RURA11',
    setor: 'Papel',
    dataEntrada: '14/12/2022',
    precoEntrada: 'R$ 10,25',
    precoAtual: 'R$ 14,47',
    dy: '15,75%',
    precoTeto: 'R$ 8,70',
    vies: 'Compra',
  },
  {
    id: '5',
    avatar: '/api/placeholder/32/32', // Ícone de logística/caminhão
    ticker: 'XPLG11',
    setor: 'Logística',
    dataEntrada: '14/12/2022',
    precoEntrada: 'R$ 92,12',
    precoAtual: 'R$ 15,23',
    dy: '14,00%',
    precoTeto: 'R$ 99,19',
    vies: 'Compra',
  },
  {
    id: '6',
    avatar: '/api/placeholder/32/32', // Ícone de PDF/documento
    ticker: 'BRFF11',
    setor: 'PDF',
    dataEntrada: '08/01/2024',
    precoEntrada: 'R$ 72,12',
    precoAtual: 'R$ 60,40',
    dy: '12,50%',
    precoTeto: 'R$ 66,64',
    vies: 'Compra',
  },
  {
    id: '7',
    avatar: '/api/placeholder/32/32', // Ícone de FII/real estate
    ticker: 'HCRF11',
    setor: 'FII',
    dataEntrada: '03/04/2023',
    precoEntrada: 'R$ 49,15',
    precoAtual: 'R$ 74,00',
    dy: '11,12%',
    precoTeto: 'R$ 71,59',
    vies: 'Compra',
  },
  {
    id: '8',
    avatar: '/api/placeholder/32/32', // Ícone de logística
    ticker: 'RBCO11',
    setor: 'Logística',
    dataEntrada: '20/03/2022',
    precoEntrada: 'R$ 79,25',
    precoAtual: 'R$ 108,84',
    dy: '10,18%',
    precoTeto: 'R$ 159,90',
    vies: 'Compra',
  },
  {
    id: '9',
    avatar: '/api/placeholder/32/32', // Ícone de híbrido/misto
    ticker: 'HBRF11',
    setor: 'Híbrido',
    dataEntrada: '20/03/2022',
    precoEntrada: 'R$ 99,02',
    precoAtual: 'R$ 144,00',
    dy: '10,58%',
    precoTeto: 'R$ 101,66',
    vies: 'Compra',
  },
  {
    id: '10',
    avatar: '/api/placeholder/32/32', // Ícone de logística
    ticker: 'XPCI11',
    setor: 'Logística',
    dataEntrada: '20/04/2022',
    precoEntrada: 'R$ 161,80',
    precoAtual: 'R$ 159,72',
    dy: '8,62%',
    precoTeto: 'R$ 146,67',
    vies: 'Compra',
  },
  {
    id: '11',
    avatar: '/api/placeholder/32/32', // Ícone de shoppings
    ticker: 'JSML11',
    setor: 'Shoppings',
    dataEntrada: '14/04/2022',
    precoEntrada: 'R$ 78,00',
    precoAtual: 'R$ 84,67',
    dy: '10,84%',
    precoTeto: 'R$ 92,40',
    vies: 'Compra',
  },
  {
    id: '12',
    avatar: '/api/placeholder/32/32', // Ícone de híbrido
    ticker: 'RBRP11',
    setor: 'Híbrido',
    dataEntrada: '13/04/2022',
    precoEntrada: 'R$ 55,99',
    precoAtual: 'R$ 61,61',
    dy: '12,51%',
    precoTeto: 'R$ 88,00',
    vies: 'Compra',
  },
  {
    id: '13',
    avatar: '/api/placeholder/32/32', // Ícone de papel
    ticker: 'AFHI11',
    setor: 'Papel',
    dataEntrada: '05/07/2022',
    precoEntrada: 'R$ 99,91',
    precoAtual: 'R$ 92,79',
    dy: '12,55%',
    precoTeto: 'R$ 92,10',
    vies: 'Compra',
  },
  {
    id: '14',
    avatar: '/api/placeholder/32/32', // Ícone de logística
    ticker: 'BTCI11',
    setor: 'Logística',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 100,14',
    precoAtual: 'R$ 100,20',
    dy: '9,50%',
    precoTeto: 'R$ 104,00',
    vies: 'Compra',
  },
  {
    id: '15',
    avatar: '/api/placeholder/32/32', // Ícone de papel
    ticker: 'VTRA11',
    setor: 'Papel',
    dataEntrada: '27/12/2022',
    precoEntrada: 'R$ 88,20',
    precoAtual: 'R$ 91,84',
    dy: '12,30%',
    precoTeto: 'R$ 84,29',
    vies: 'Compra',
  },
  {
    id: '16',
    avatar: '/api/placeholder/32/32', // Ícone de papel
    ticker: 'CPTS11',
    setor: 'Papel',
    dataEntrada: '18/10/2022',
    precoEntrada: 'R$ 41,29',
    precoAtual: 'R$ 82,47',
    dy: '10,02%',
    precoTeto: 'R$ 41,23',
    vies: 'Compra',
  },
  {
    id: '17',
    avatar: '/api/placeholder/32/32', // Ícone de renda fixa
    ticker: 'JORU11',
    setor: 'Renda Fixa',
    dataEntrada: '17/01/2022',
    precoEntrada: 'R$ 15,00',
    precoAtual: 'R$ 104,34',
    dy: '10,35%',
    precoTeto: 'R$ 138,57',
    vies: 'Compra',
  },
  {
    id: '18',
    avatar: '/api/placeholder/32/32', // Ícone de híbrido
    ticker: 'ALZR11',
    setor: 'Híbrido',
    dataEntrada: '20/02/2022',
    precoEntrada: 'R$ 118,89',
    precoAtual: 'R$ 140,07',
    dy: '9,14%',
    precoTeto: 'R$ 101,16',
    vies: 'Compra',
  },
  {
    id: '19',
    avatar: '/api/placeholder/32/32', // Ícone de híbrido
    ticker: 'KNRI11',
    setor: 'Híbrido',
    dataEntrada: '27/06/2022',
    precoEntrada: 'R$ 131,12',
    precoAtual: 'R$ 144,12',
    dy: '8,62%',
    precoTeto: 'R$ 146,67',
    vies: 'Compra',
  },
  {
    id: '20',
    avatar: '/api/placeholder/32/32', // Ícone de papel
    ticker: 'BDAM11',
    setor: 'Papel',
    dataEntrada: '05/01/2022',
    precoEntrada: 'R$ 107,04',
    precoAtual: 'R$ 89,20',
    dy: '12,01%',
    precoTeto: 'R$ 72,30',
    vies: 'Compra',
  },
  {
    id: '21',
    avatar: '/api/placeholder/32/32', // Ícone de FII/real estate
    ticker: 'MXRF11',
    setor: 'FIIS',
    dataEntrada: '12/07/2022',
    precoEntrada: 'R$ 9,49',
    precoAtual: 'R$ 9,63',
    dy: '12,91%',
    precoTeto: 'R$ 9,40',
    vies: 'Compra',
  }
];

export default function SettingsPage(): React.JSX.Element {
  // DADOS DOS CARDS ESPECÍFICOS PARA DIVIDENDOS
  const dadosCards = {
    ibovespa: { value: "158k", trend: "up" as const, diff: 3.2 },
    indiceSmall: { value: "2.100k", trend: "up" as const, diff: 1.8 },
    carteiraHoje: { value: "92.1%", trend: "up" as const },
    dividendYield: { value: "8.8%", trend: "up" as const },
    ibovespaPeriodo: { value: "7.1%", trend: "up" as const, diff: 7.1 },
    carteiraPeriodo: { value: "11.4%", trend: "up" as const, diff: 11.4 },
  };

  return (
    <Grid container spacing={3}>
      {/* Filtros */}
      <Grid xs={12}>
        <SettingsFilters />
      </Grid>
      
      {/* Tabela principal com cards e dados */}
      <Grid xs={12}>
        <SettingsTable 
          count={dividendosAtivos.length} 
          rows={dividendosAtivos} 
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
        />
      </Grid>
    </Grid>
  );
}
