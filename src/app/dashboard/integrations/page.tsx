/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { IntegrationsFilters } from '@/components/dashboard/integrations/integrations-filters';
import { IntegrationsTable } from '@/components/dashboard/integrations/integrations-table';

// DADOS ESPECÍFICOS PARA DIVIDENDOS - baseados na tabela fornecida
const dividendosAtivos = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LEVE.png',
    ticker: 'LEVE3',
    setor: 'Automotivo',
    dataEntrada: '06/12/2024',
    precoEntrada: 'R$ 27,74',
    precoAtual: 'R$ 30,66',
    dy: '8,14%',
    precoTeto: 'R$ 35,27',
    vies: 'Compra',
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EGIE.png',
    ticker: 'EGIE3',
    setor: 'Energia',
    dataEntrada: '31/03/2022',
    precoEntrada: 'R$ 43,13',
    precoAtual: 'R$ 40,45',
    dy: '6,29%',
    precoTeto: 'R$ 50,34',
    vies: 'Compra',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    ticker: 'VALE3',
    setor: 'Mineração',
    dataEntrada: '17/07/2023',
    precoEntrada: 'R$ 68,61',
    precoAtual: 'R$ 54,32',
    dy: '11,27%',
    precoTeto: 'R$ 78,20',
    vies: 'Compra',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
    ticker: 'BBAS3',
    setor: 'Bancos',
    dataEntrada: '20/10/2021',
    precoEntrada: 'R$ 15,60',
    precoAtual: 'R$ 24,42',
    dy: '9,62%',
    precoTeto: 'R$ 30,10',
    vies: 'Compra',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BRSR.png',
    ticker: 'BRSR6',
    setor: 'Bancos',
    dataEntrada: '12/05/2022',
    precoEntrada: 'R$ 10,60',
    precoAtual: 'R$ 12,22',
    dy: '4,92%',
    precoTeto: 'R$ 15,10',
    vies: 'Compra',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    ticker: 'PETR4',
    setor: 'Petróleo',
    dataEntrada: '24/05/2022',
    precoEntrada: 'R$ 30,97',
    precoAtual: 'R$ 31,40',
    dy: '18,01%',
    precoTeto: 'R$ 37,50',
    vies: 'Compra',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SAPR.png',
    ticker: 'SAPR4',
    setor: 'Saneamento',
    dataEntrada: '27/10/2021',
    precoEntrada: 'R$ 3,81',
    precoAtual: 'R$ 6,40',
    dy: '5,30%',
    precoTeto: 'R$ 6,00',
    vies: 'Compra',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ELET.png',
    ticker: 'ELET3',
    setor: 'Energia',
    dataEntrada: '20/11/2023',
    precoEntrada: 'R$ 40,41',
    precoAtual: 'R$ 40,45',
    dy: '1,12%',
    precoTeto: 'R$ 58,27',
    vies: 'Compra',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ABCB.png',
    ticker: 'ABCB4',
    setor: 'Bancos',
    dataEntrada: '19/06/2023',
    precoEntrada: 'R$ 17,87',
    precoAtual: 'R$ 21,41',
    dy: '7,42%',
    precoTeto: 'R$ 22,30',
    vies: 'Compra',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSMG.png',
    ticker: 'CSMG3',
    setor: 'Saneamento',
    dataEntrada: '19/08/2022',
    precoEntrada: 'R$ 13,68',
    precoAtual: 'R$ 24,28',
    dy: '15,89%',
    precoTeto: 'R$ 19,16',
    vies: 'Compra',
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBSE.png',
    ticker: 'BBSE3',
    setor: 'Financeiro',
    dataEntrada: '30/06/2022',
    precoEntrada: 'R$ 25,48',
    precoAtual: 'R$ 38,10',
    dy: '7,62%',
    precoTeto: 'R$ 33,20',
    vies: 'Compra',
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ISAE.png',
    ticker: 'ISAE4',
    setor: 'Energia',
    dataEntrada: '22/10/2021',
    precoEntrada: 'R$ 24,00',
    precoAtual: 'R$ 23,50',
    dy: '9,07%',
    precoTeto: 'R$ 26,50',
    vies: 'Compra',
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VIVT.png',
    ticker: 'VIVT3',
    setor: 'Telecom',
    dataEntrada: '05/04/2022',
    precoEntrada: 'R$ 54,60',
    precoAtual: 'R$ 27,66',
    dy: '3,15%',
    precoTeto: 'R$ 29,00',
    vies: 'Compra',
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KLBN.png',
    ticker: 'KLBN11',
    setor: 'Papel e Celulose',
    dataEntrada: '09/06/2022',
    precoEntrada: 'R$ 21,94',
    precoAtual: 'R$ 19,22',
    dy: '4,59%',
    precoTeto: 'R$ 27,60',
    vies: 'Compra',
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SANB.png',
    ticker: 'SANB11',
    setor: 'Bancos',
    dataEntrada: '08/12/2022',
    precoEntrada: 'R$ 27,60',
    precoAtual: 'R$ 29,93',
    dy: '4,96%',
    precoTeto: 'R$ 31,76',
    vies: 'Compra',
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
    ticker: 'BBAS3',
    setor: 'Bancos',
    dataEntrada: '28/07/2022',
    precoEntrada: 'R$ 10,88',
    precoAtual: 'R$ 14,59',
    dy: '5,75%',
    precoTeto: 'R$ 12,20',
    vies: 'Compra',
  },
  {
    id: '17',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CPLE.png',
    ticker: 'CPLE6',
    setor: 'Energia',
    dataEntrada: '10/11/2021',
    precoEntrada: 'R$ 6,28',
    precoAtual: 'R$ 12,40',
    dy: '2,26%',
    precoTeto: 'R$ 7,25',
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
