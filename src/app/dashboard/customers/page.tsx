'use client';

import * as React from 'react';
import { AtivosTable } from '@/components/dashboard/customer/customers-table';

const ativos = [
  {
    id: '1',
    avatar: '/logos/alos3.png',
    ticker: 'ALOS3',
    setor: 'Shoppings',
    dataEntrada: '15/01/2021',
    precoEntrada: 'R$ 26,68',
    precoAtual: 'R$ 21,36',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
  },
  {
    id: '2',
    avatar: '/logos/tupy3.png',
    ticker: 'TUPY3',
    setor: 'Industrial',
    dataEntrada: '04/11/2020',
    precoEntrada: 'R$ 20,36',
    precoAtual: 'R$ 18,78',
    dy: '1,71%',
    precoTeto: 'R$ 23,50',
  },
  {
    id: '3',
    avatar: '/logos/recv3.png',
    ticker: 'RECV3',
    setor: 'Petróleo',
    dataEntrada: '23/07/2023',
    precoEntrada: 'R$ 22,29',
    precoAtual: 'R$ 13,97',
    dy: '11,67%',
    precoTeto: 'R$ 31,37',
  },
  // Adicione os outros ativos conforme necessário
];

export default function Page() {
  return (
    <div style={{ padding: '20px' }}>
      <AtivosTable count={ativos.length} rows={ativos} page={0} rowsPerPage={5} />
    </div>
  );
}
