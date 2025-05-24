/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { OverviewFilters } from '@/components/dashboard/overview/overview-filters';
import { OverviewTable } from '@/components/dashboard/overview/overview-table';

const ativos = [
  {
    id: '1',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    ticker: 'ALOS3',
    setor: 'Shoppings',
    dataEntrada: '15/01/2021',
    precoEntrada: 'R$ 26,68',
    precoAtual: 'R$ 21,67',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
    vies: 'Compra',
  },
  {
    id: '2',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
    ticker: 'TUPY3',
    setor: 'Industrial',
    dataEntrada: '04/11/2020',
    precoEntrada: 'R$ 20,36',
    precoAtual: 'R$ 18,93',
    dy: '1,71%',
    precoTeto: 'R$ 31,50',
    vies: 'Compra',
  },
  {
    id: '3',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    ticker: 'RECV3',
    setor: 'Petróleo',
    dataEntrada: '23/07/2023',
    precoEntrada: 'R$ 22,29',
    precoAtual: 'R$ 13,97',
    dy: '11,07%',
    precoTeto: 'R$ 31,37',
    vies: 'Compra',
  },
  {
    id: '4',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    ticker: 'CSED3',
    setor: 'Educação',
    dataEntrada: '10/12/2023',
    precoEntrada: 'R$ 4,49',
    precoAtual: 'R$ 5,12',
    dy: '4,96%',
    precoTeto: 'R$ 8,35',
    vies: 'Compra',
  },
  {
    id: '5',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PRIO.png',
    ticker: 'PRIO3',
    setor: 'Petróleo',
    dataEntrada: '04/08/2022',
    precoEntrada: 'R$ 23,35',
    precoAtual: 'R$ 38,80',
    dy: '0,18%',
    precoTeto: 'R$ 48,70',
    vies: 'Compra',
  },
  {
    id: '6',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RAPT.png',
    ticker: 'RAPT4',
    setor: 'Industrial',
    dataEntrada: '16/09/2021',
    precoEntrada: 'R$ 16,69',
    precoAtual: 'R$ 8,25',
    dy: '4,80%',
    precoTeto: 'R$ 14,00',
    vies: 'Compra',
  },
  {
    id: '7',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
    ticker: 'SMTO3',
    setor: 'Sucroenergetico',
    dataEntrada: '10/11/2022',
    precoEntrada: 'R$ 28,20',
    precoAtual: 'R$ 20,97',
    dy: '3,51%',
    precoTeto: 'R$ 35,00',
    vies: 'Compra',
  },
  {
    id: '8',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FESA.png',
    ticker: 'FESA4',
    setor: 'Commodities',
    dataEntrada: '11/12/2020',
    precoEntrada: 'R$ 4,49',
    precoAtual: 'R$ 6,92',
    dy: '5,68%',
    precoTeto: 'R$ 14,07',
    vies: 'Compra',
  },
  {
    id: '9',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/UNIP.png',
    ticker: 'UNIP6',
    setor: 'Químico',
    dataEntrada: '08/12/2020',
    precoEntrada: 'R$ 42,41',
    precoAtual: 'R$ 61,00',
    dy: '6,77%',
    precoTeto: 'R$ 117,90',
    vies: 'Compra',
  },
  {
    id: '10',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FLRY.png',
    ticker: 'FLRY3',
    setor: 'Saúde',
    dataEntrada: '19/05/2022',
    precoEntrada: 'R$ 14,63',
    precoAtual: 'R$ 12,59',
    dy: '5,20%',
    precoTeto: 'R$ 17,50',
    vies: 'Compra',
  },
  {
    id: '11',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EZTC.png',
    ticker: 'EZTC3',
    setor: 'Construção Civil',
    dataEntrada: '07/10/2022',
    precoEntrada: 'R$ 22,61',
    precoAtual: 'R$ 13,17',
    dy: '7,83%',
    precoTeto: 'R$ 30,00',
    vies: 'Compra',
  },
  {
    id: '12',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/JALL.png',
    ticker: 'JALL3',
    setor: 'Sucroenergetico',
    dataEntrada: '17/06/2022',
    precoEntrada: 'R$ 8,36',
    precoAtual: 'R$ 4,32',
    dy: '1,15%',
    precoTeto: 'R$ 11,90',
    vies: 'Compra',
  },
  {
    id: '13',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/YDUQ.png',
    ticker: 'YDUQ3',
    setor: 'Educação',
    dataEntrada: '11/11/2020',
    precoEntrada: 'R$ 27,16',
    precoAtual: 'R$ 15,54',
    dy: '2,64%',
    precoTeto: 'R$ 15,00',
    vies: 'Compra',
  },
  {
    id: '14',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SIMH.png',
    ticker: 'SIMH3',
    setor: 'Logística',
    dataEntrada: '03/12/2020',
    precoEntrada: 'R$ 7,98',
    precoAtual: 'R$ 4,70',
    dy: '0,00%',
    precoTeto: 'R$ 10,79',
    vies: 'Compra',
  },
  {
    id: '15',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
    ticker: 'ALUP11',
    setor: 'Energia',
    dataEntrada: '25/11/2020',
    precoEntrada: 'R$ 24,40',
    precoAtual: 'R$ 30,53',
    dy: '4,46%',
    precoTeto: 'R$ 29,00',
    vies: 'Compra',
  },
  {
    id: '16',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NEOE.png',
    ticker: 'NEOE3',
    setor: 'Energia',
    dataEntrada: '04/05/2021',
    precoEntrada: 'R$ 15,94',
    precoAtual: 'R$ 24,40',
    dy: '4,29%',
    precoTeto: 'R$ 21,00',
    vies: 'Compra',
  },
];

export default function Page(): React.JSX.Element {
  // DADOS DOS CARDS - ALTERE AQUI PARA MODIFICAR OS VALORES
  const dadosCards = {
    ibovespa: { value: "145k", trend: "up" as const, diff: 2.8 },
    indiceSmall: { value: "1.950k", trend: "down" as const, diff: -1.2 },
    carteiraHoje: { value: "88.7%", trend: "up" as const }, // Verde, sem número embaixo
    dividendYield: { value: "7.4%", trend: "up" as const }, // Verde, sem número embaixo  
    ibovespaPeriodo: { value: "6.1%", trend: "up" as const, diff: 6.1 },
    carteiraPeriodo: { value: "9.3%", trend: "up" as const, diff: 9.3 },
  };

  return (
    <Grid container spacing={3}>
      {/* Filtros de busca */}
      <Grid xs={12}>
        <OverviewFilters />
      </Grid>
      
      {/* Tabela principal com cards e dados */}
      <Grid xs={12}>
        <OverviewTable 
          count={ativos.length} 
          rows={ativos} 
          page={0} 
          rowsPerPage={5}
          cardsData={dadosCards}
        />
      </Grid>
    </Grid>
  );
}
