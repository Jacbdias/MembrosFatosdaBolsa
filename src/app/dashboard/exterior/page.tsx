/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import { ExteriorTable } from '@/components/dashboard/exterior/exterior-table';

const investimentosExterior = [
  {
    id: '1',
    avatar: 'https://logo.clearbit.com/apple.com',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '15/03/2024',
    precoEntrada: 'USD 180,50',
    precoAtual: 'USD 195,30',
    quantity: '50',
    totalValue: 'USD 9.765,00',
    gainLoss: 'USD 740,00',
    gainLossPercent: '+8,2%',
    vies: 'Compra',
  },
  {
    id: '2',
    avatar: 'https://logo.clearbit.com/microsoft.com',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '10/02/2024',
    precoEntrada: 'USD 320,00',
    precoAtual: 'USD 378,85',
    quantity: '25',
    totalValue: 'USD 9.471,25',
    gainLoss: 'USD 1.471,25',
    gainLossPercent: '+18,4%',
    vies: 'Compra',
  },
  {
    id: '3',
    avatar: 'https://logo.clearbit.com/tesla.com',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '20/04/2024',
    precoEntrada: 'USD 250,00',
    precoAtual: 'USD 238,45',
    quantity: '30',
    totalValue: 'USD 7.153,50',
    gainLoss: 'USD -346,50',
    gainLossPercent: '-4,6%',
    vies: 'Venda',
  },
  {
    id: '4',
    avatar: 'https://logo.clearbit.com/asml.com',
    ticker: 'ASML',
    name: 'ASML Holding',
    country: 'Netherlands',
    currency: 'EUR',
    dataEntrada: '05/01/2024',
    precoEntrada: 'EUR 650,00',
    precoAtual: 'EUR 742,30',
    quantity: '15',
    totalValue: 'EUR 11.134,50',
    gainLoss: 'EUR 1.384,50',
    gainLossPercent: '+14,2%',
    vies: 'Compra',
  },
  {
    id: '5',
    avatar: 'https://logo.clearbit.com/shopify.com',
    ticker: 'SHOP',
    name: 'Shopify Inc.',
    country: 'Canada',
    currency: 'CAD',
    dataEntrada: '12/03/2024',
    precoEntrada: 'CAD 85,00',
    precoAtual: 'CAD 92,15',
    quantity: '100',
    totalValue: 'CAD 9.215,00',
    gainLoss: 'CAD 715,00',
    gainLossPercent: '+8,4%',
    vies: 'Compra',
  },
  {
    id: '6',
    avatar: 'https://logo.clearbit.com/google.com',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '28/01/2024',
    precoEntrada: 'USD 145,20',
    precoAtual: 'USD 158,75',
    quantity: '40',
    totalValue: 'USD 6.350,00',
    gainLoss: 'USD 542,00',
    gainLossPercent: '+9,3%',
    vies: 'Compra',
  },
  {
    id: '7',
    avatar: 'https://logo.clearbit.com/nvidia.com',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '18/12/2023',
    precoEntrada: 'USD 485,00',
    precoAtual: 'USD 892,50',
    quantity: '10',
    totalValue: 'USD 8.925,00',
    gainLoss: 'USD 4.075,00',
    gainLossPercent: '+84,0%',
    vies: 'Compra',
  },
  {
    id: '8',
    avatar: 'https://logo.clearbit.com/amazon.com',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '22/11/2023',
    precoEntrada: 'USD 148,30',
    precoAtual: 'USD 182,90',
    quantity: '35',
    totalValue: 'USD 6.401,50',
    gainLoss: 'USD 1.211,00',
    gainLossPercent: '+23,3%',
    vies: 'Compra',
  },
  {
    id: '9',
    avatar: 'https://logo.clearbit.com/meta.com',
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '14/09/2023',
    precoEntrada: 'USD 295,89',
    precoAtual: 'USD 485,20',
    quantity: '20',
    totalValue: 'USD 9.704,00',
    gainLoss: 'USD 3.786,20',
    gainLossPercent: '+64,0%',
    vies: 'Compra',
  },
  {
    id: '10',
    avatar: 'https://logo.clearbit.com/netflix.com',
    ticker: 'NFLX',
    name: 'Netflix Inc.',
    country: 'USA',
    currency: 'USD',
    dataEntrada: '30/08/2023',
    precoEntrada: 'USD 445,50',
    precoAtual: 'USD 680,90',
    quantity: '12',
    totalValue: 'USD 8.170,80',
    gainLoss: 'USD 2.824,80',
    gainLossPercent: '+52,8%',
    vies: 'Compra',
  },
];

export default function Page(): React.JSX.Element {
  // DADOS DOS CARDS - ALTERE AQUI PARA MODIFICAR OS VALORES
  const dadosCards = {
    sp500: { value: "5.870", trend: "up" as const, diff: 2.3 },
    nasdaq: { value: "19.280", trend: "up" as const, diff: 1.8 },
    carteiraExterior: { value: "USD 76.140", trend: "up" as const }, // Verde, sem número embaixo
    dollarRate: { value: "R$ 5,42", trend: "down" as const, diff: -1.2 },
    totalInvested: { value: "USD 58.500", trend: "up" as const }, // Verde, sem número embaixo  
    totalReturn: { value: "+30,1%", trend: "up" as const, diff: 30.1 },
  };

  return (
    <div style={{ padding: '20px' }}>
      <ExteriorTable 
        count={investimentosExterior.length} 
        rows={investimentosExterior} 
        page={0} 
        rowsPerPage={5}
        cardsData={dadosCards}
      />
    </div>
  );
}
