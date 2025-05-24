/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { IntegrationsTable } from '@/components/dashboard/integrations/integrations-table';

// DADOS ESPECÍFICOS PARA DIVIDENDOS - diferentes das outras páginas
const dividendosAtivos = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    ticker: 'PETR4',
    setor: 'Petróleo/Gás',
    dataEntrada: '15/03/2022',
    precoEntrada: 'R$ 28,90',
    precoAtual: 'R$ 38,47',
    dy: '18,4%',
    precoTeto: 'R$ 45,00',
    vies: 'Compra',
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ITUB.png',
    ticker: 'ITUB4',
    setor: 'Bancos',
    dataEntrada: '22/01/2022',
    precoEntrada: 'R$ 24,80',
    precoAtual: 'R$ 29,15',
    dy: '12,8%',
    precoTeto: 'R$ 35,00',
    vies: 'Compra',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBDC.png',
    ticker: 'BBDC4',
    setor: 'Bancos',
    dataEntrada: '10/05/2022',
    precoEntrada: 'R$ 18,45',
    precoAtual: 'R$ 22,30',
    dy: '11,2%',
    precoTeto: 'R$ 26,00',
    vies: 'Compra',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    ticker: 'VALE3',
    setor: 'Mineração',
    dataEntrada: '08/02/2022',
    precoEntrada: 'R$ 85,20',
    precoAtual: 'R$ 91,75',
    dy: '9,8%',
    precoTeto: 'R$ 110,00',
    vies: 'Compra',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
    ticker: 'BBAS3',
    setor: 'Bancos',
    dataEntrada: '30/03/2022',
    precoEntrada: 'R$ 42,15',
    precoAtual: 'R$ 48,90',
    dy: '8,9%',
    precoTeto: 'R$ 55,00',
    vies: 'Compra',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/WEGE.png',
    ticker: 'WEGE3',
    setor: 'Industrial',
    dataEntrada: '12/04/2022',
    precoEntrada: 'R$ 32,80',
    precoAtual: 'R$ 38,65',
    dy: '2,1%',
    precoTeto: 'R$ 45,00',
    vies: 'Compra',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TAEE.png',
    ticker: 'TAEE11',
    setor: 'Energia Elétrica',
    dataEntrada: '25/06/2022',
    precoEntrada: 'R$ 35,40',
    precoAtual: 'R$ 41,20',
    dy: '7,5%',
    precoTeto: 'R$ 48,00',
    vies: 'Compra',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
    ticker: 'ALUP11',
    setor: 'Energia Elétrica',
    dataEntrada: '18/08/2022',
    precoEntrada: 'R$ 24,40',
    precoAtual: 'R$ 30,53',
    dy: '4,46%',
    precoTeto: 'R$ 29,00',
    vies: 'Compra',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBSE.png',
    ticker: 'BBSE3',
    setor: 'Seguros',
    dataEntrada: '05/09/2022',
    precoEntrada: 'R$ 28,90',
    precoAtual: 'R$ 34,15',
    dy: '6,8%',
    precoTeto: 'R$ 40,00',
    vies: 'Compra',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CPLE.png',
    ticker: 'CPLE6',
    setor: 'Energia Elétrica',
    dataEntrada: '20/10/2022',
    precoEntrada: 'R$ 45,80',
    precoAtual: 'R$ 52,30',
    dy: '5,2%',
    precoTeto: 'R$ 60,00',
    vies: 'Compra',
  }
];

export default function Page(): React.JSX.Element {
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
      {/* Filtros (vazio por enquanto) */}
      <Grid xs={12}>
        <IntegrationsFilters />
      </Grid>
      
      {/* Tabela principal com cards e dados */}
      <Grid xs={12}>
        <IntegrationsTable 
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
