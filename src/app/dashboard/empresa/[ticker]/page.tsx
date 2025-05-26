'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { FileText as FileTextIcon } from '@phosphor-icons/react/dist/ssr/FileText';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

interface Provento {
  tipo: string;
  valor: string;
  dataEx: string;
  dataPagamento: string;
  status: string;
}

interface Relatorio {
  nome: string;
  data: string;
  tipo: string;
}

interface EmpresaBase {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  precoAtual: string;
  variacao: string;
  tendencia: 'up' | 'down';
  dataEntrada: string;
  precoIniciou: string;
  dy: string;
  precoTeto: string;
  viesAtual: string;
  variacaoHoje: string;
  rendProventos: string;
  ibovespaEpoca: string;
  ibovespaVariacao: string;
  percentualCarteira: string;
  proventos?: Provento[];
  relatorios?: Relatorio[];
}

interface Empresa extends EmpresaBase {
  tipo?: never;
  marketCap: string;
  pl: string;
  pvp: string;
  roe: string;
}

interface FII extends EmpresaBase {
  tipo: 'FII';
  patrimonio: string;
  p_vp: string;
  vacancia: string;
  imoveis: number;
  gestora: string;
}

const empresasData: { [key: string]: Empresa } = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa integrada de energia, focada em óleo, gás natural e energia de baixo carbono.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
    precoAtual: 'R$ 38,47',
    variacao: '+2.3%',
    tendencia: 'up',
    dataEntrada: '15/03/2022',
    precoIniciou: 'R$ 28,90',
    dy: '18.4%',
    precoTeto: 'R$ 45,00',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+24.7%',
    ibovespaEpoca: '112.200',
    ibovespaVariacao: '+18.2%',
    percentualCarteira: '12.5%',
    marketCap: 'R$ 512,8 bi',
    pl: '3.8',
    pvp: '1.2',
    roe: '31.5%',
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
      { tipo: 'Dividendo', valor: 'R$ 1,95', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', tipo: 'Anual' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', tipo: 'Trimestral' },
      { nome: 'Demonstrações Financeiras Q3 2023', data: '2023-11-15', tipo: 'Trimestral' }
    ]
  },
'ALOS3': {
  ticker: 'ALOS3',
  nomeCompleto: 'Allos S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
  precoAtual: 'R$ 21,75',
  variacao: '-18.5%',
  tendencia: 'down',
  dataEntrada: '15/01/2021',
  precoIniciou: 'R$ 26,68',
  dy: '5,96%',
  precoTeto: 'R$ 23,76',
  viesAtual: 'Neutro',
  variacaoHoje: '-1.2%',
  rendProventos: '-16.6%',
  ibovespaEpoca: '108.500',
  ibovespaVariacao: '+12.8%',
  percentualCarteira: '4.2%',
  marketCap: 'R$ 8.2 bi',
  pl: '12.5',
  pvp: '0.8',
  roe: '15.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,45', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,32', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
  ]
},
'TUPY3': {
  ticker: 'TUPY3',
  nomeCompleto: 'Tupy S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Tupy é líder mundial na fundição de ferro fundido para a indústria automotiva.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
  precoAtual: 'R$ 18,93',
  variacao: '-7.0%',
  tendencia: 'down',
  dataEntrada: '04/11/2020',
  precoIniciou: 'R$ 20,36',
  dy: '1,71%',
  precoTeto: 'R$ 31,50',
  viesAtual: 'Compra',
  variacaoHoje: '+2.1%',
  rendProventos: '+31.5%',
  ibovespaEpoca: '115.200',
  ibovespaVariacao: '+8.5%',
  percentualCarteira: '6.8%',
  marketCap: 'R$ 3.8 bi',
  pl: '8.2',
  pvp: '1.4',
  roe: '18.7%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 0,65', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Anual 2023', data: '2024-04-10', tipo: 'Anual' },
    { nome: 'Balanço Q1 2024', data: '2024-05-08', tipo: 'Trimestral' }
  ]
},
'RECV3': {
  ticker: 'RECV3',
  nomeCompleto: 'Recap DRE S.A.',
  setor: 'Financeiro',
  descricao: 'A Recap é uma empresa de recuperação de créditos inadimplentes.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
  precoAtual: 'R$ 13,37',
  variacao: '-39.9%',
  tendencia: 'down',
  dataEntrada: '23/07/2023',
  precoIniciou: 'R$ 22,29',
  dy: '11,67%',
  precoTeto: 'R$ 31,37',
  viesAtual: 'Compra',
  variacaoHoje: '+3.2%',
  rendProventos: '+83.7%',
  ibovespaEpoca: '111.800',
  ibovespaVariacao: '+14.2%',
  percentualCarteira: '7.5%',
  marketCap: 'R$ 4.2 bi',
  pl: '6.8',
  pvp: '1.1',
  roe: '24.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,25', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 0,95', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-22', tipo: 'Anual' },
    { nome: 'Demonstrações Q1 2024', data: '2024-05-14', tipo: 'Trimestral' }
  ]
},
  'CSED3': {
  ticker: 'CSED3',
  nomeCompleto: 'Cruzeiro do Sul Educacional S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Cruzeiro do Sul é uma das maiores organizações educacionais privadas do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
  precoAtual: 'R$ 5,12',
  variacao: '-52.7%',
  tendencia: 'down',
  dataEntrada: '10/12/2023',
  precoIniciou: 'R$ 10,83',
  dy: '4,96%',
  precoTeto: 'R$ 8,35',
  viesAtual: 'Venda',
  variacaoHoje: '-2.8%',
  rendProventos: '-30.9%',
  ibovespaEpoca: '124.500',
  ibovespaVariacao: '+2.8%',
  percentualCarteira: '2.1%',
  marketCap: 'R$ 1.8 bi',
  pl: '15.2',
  pvp: '0.6',
  roe: '8.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,12', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-20', tipo: 'Trimestral' }
  ]
},
'PRIO3': {
  ticker: 'PRIO3',
  nomeCompleto: 'PetroRio S.A.',
  setor: 'Petróleo, Gás e Biocombustíveis',
  descricao: 'A PetroRio é uma empresa independente de exploração e produção de petróleo e gás.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/PRIO.png',
  precoAtual: 'R$ 39,11',
  variacao: '+67.5%',
  tendencia: 'up',
  dataEntrada: '04/08/2022',
  precoIniciou: 'R$ 23,35',
  dy: '0,18%',
  precoTeto: 'R$ 48,70',
  viesAtual: 'Compra',
  variacaoHoje: '+2.9%',
  rendProventos: '+48.3%',
  ibovespaEpoca: '109.200',
  ibovespaVariacao: '+16.8%',
  percentualCarteira: '9.2%',
  marketCap: 'R$ 45.2 bi',
  pl: '4.2',
  pvp: '1.8',
  roe: '42.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 2,85', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1,95', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 1,75', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Produção Q1 2024', data: '2024-04-18', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'RAPT4': {
  ticker: 'RAPT4',
  nomeCompleto: 'Randon S.A. Implementos e Participações',
  setor: 'Bens Industriais',
  descricao: 'A Randon é líder na fabricação de implementos rodoviários na América Latina.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/RAPT.png',
  precoAtual: 'R$ 8,29',
  variacao: '-22.5%',
  tendencia: 'down',
  dataEntrada: '16/09/2021',
  precoIniciou: 'R$ 10,69',
  dy: '4,80%',
  precoTeto: 'R$ 14,00',
  viesAtual: 'Neutro',
  variacaoHoje: '-0.8%',
  rendProventos: '-11.4%',
  ibovespaEpoca: '118.200',
  ibovespaVariacao: '+6.2%',
  percentualCarteira: '3.5%',
  marketCap: 'R$ 1.5 bi',
  pl: '11.8',
  pvp: '0.9',
  roe: '12.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,28', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-12', tipo: 'Trimestral' }
  ]
},
'SMTO3': {
  ticker: 'SMTO3',
  nomeCompleto: 'São Martinho S.A.',
  setor: 'Consumo Não Cíclico',
  descricao: 'A São Martinho é uma das maiores produtoras de açúcar e etanol do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
  precoAtual: 'R$ 20,98',
  variacao: '-25.7%',
  tendencia: 'down',
  dataEntrada: '10/11/2022',
  precoIniciou: 'R$ 28,20',
  dy: '3,51%',
  precoTeto: 'R$ 35,00',
  viesAtual: 'Compra',
  variacaoHoje: '+1.9%',
  rendProventos: '+32.3%',
  ibovespaEpoca: '116.500',
  ibovespaVariacao: '+9.8%',
  percentualCarteira: '5.8%',
  marketCap: 'R$ 11.2 bi',
  pl: '9.5',
  pvp: '1.3',
  roe: '16.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,20', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,85', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Safra 2023/24', data: '2024-04-05', tipo: 'Anual' },
    { nome: 'Balanço Q1 2024', data: '2024-05-10', tipo: 'Trimestral' }
  ]
},
  'FESA4': {
  ticker: 'FESA4',
  nomeCompleto: 'Ferbasa S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Ferbasa é líder na produção de ligas de ferro e especialidades metálicas.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/FESA.png',
  precoAtual: 'R$ 6,92',
  variacao: '+54.1%',
  tendencia: 'up',
  dataEntrada: '11/12/2020',
  precoIniciou: 'R$ 4,49',
  dy: '5,68%',
  precoTeto: 'R$ 14,07',
  viesAtual: 'Compra',
  variacaoHoje: '+1.4%',
  rendProventos: '+14.7%',
  ibovespaEpoca: '125.800',
  ibovespaVariacao: '+1.2%',
  percentualCarteira: '2.8%',
  marketCap: 'R$ 485 mi',
  pl: '7.8',
  pvp: '0.7',
  roe: '18.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,80', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-18', tipo: 'Trimestral' }
  ]
},
'UNIP6': {
  ticker: 'UNIP6',
  nomeCompleto: 'Unipar Carbocloro S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Unipar é líder na produção de cloro-soda e PVC na América Latina.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/UNIP.png',
  precoAtual: 'R$ 61,00',
  variacao: '+43.8%',
  tendencia: 'up',
  dataEntrada: '08/12/2020',
  precoIniciou: 'R$ 42,41',
  dy: '6,77%',
  precoTeto: 'R$ 117,90',
  viesAtual: 'Compra',
  variacaoHoje: '+0.9%',
  rendProventos: '+34.0%',
  ibovespaEpoca: '105.200',
  ibovespaVariacao: '+18.5%',
  percentualCarteira: '8.2%',
  marketCap: 'R$ 14.8 bi',
  pl: '6.2',
  pvp: '1.5',
  roe: '28.4%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 2,20', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 1,65', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-12', tipo: 'Anual' },
    { nome: 'Demonstrações Q1 2024', data: '2024-05-06', tipo: 'Trimestral' }
  ]
},
'FLRY3': {
  ticker: 'FLRY3',
  nomeCompleto: 'Fleury S.A.',
  setor: 'Saúde',
  descricao: 'A Fleury é uma das maiores redes de medicina diagnóstica do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/FLRY.png',
  precoAtual: 'R$ 12,59',
  variacao: '-13.9%',
  tendencia: 'down',
  dataEntrada: '19/05/2022',
  precoIniciou: 'R$ 14,63',
  dy: '3,20%',
  precoTeto: 'R$ 17,50',
  viesAtual: 'Neutro',
  variacaoHoje: '-1.5%',
  rendProventos: '-19.7%',
  ibovespaEpoca: '113.800',
  ibovespaVariacao: '+10.2%',
  percentualCarteira: '4.1%',
  marketCap: 'R$ 8.1 bi',
  pl: '22.5',
  pvp: '1.8',
  roe: '9.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,28', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Resultados Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'EZTC3': {
  ticker: 'EZTC3',
  nomeCompleto: 'EZTec Empreendimentos e Participações S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A EZTec é uma incorporadora imobiliária focada em empreendimentos de alto padrão.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/EZTC.png',
  precoAtual: 'R$ 13,17',
  variacao: '-50.1%',
  tendencia: 'down',
  dataEntrada: '07/10/2022',
  precoIniciou: 'R$ 26,41',
  dy: '7,83%',
  precoTeto: 'R$ 30,00',
  viesAtual: 'Compra',
  variacaoHoje: '+2.8%',
  rendProventos: '+33.4%',
  ibovespaEpoca: '121.500',
  ibovespaVariacao: '+5.8%',
  percentualCarteira: '5.2%',
  marketCap: 'R$ 3.5 bi',
  pl: '8.5',
  pvp: '1.1',
  roe: '15.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,18', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,85', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Vendas Q1 2024', data: '2024-05-08', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-22', tipo: 'Anual' }
  ]
},
'JALL3': {
  ticker: 'JALL3',
  nomeCompleto: 'Jalles Machado S.A.',
  setor: 'Consumo Não Cíclico',
  descricao: 'A Jalles Machado é produtora de açúcar, etanol e energia elétrica.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/JALL.png',
  precoAtual: 'R$ 4,33',
  variacao: '-48.2%',
  tendencia: 'down',
  dataEntrada: '17/06/2022',
  precoIniciou: 'R$ 8,36',
  dy: '1,15%',
  precoTeto: 'R$ 11,90',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '+13.6%',
  ibovespaEpoca: '126.200',
  ibovespaVariacao: '+1.8%',
  percentualCarteira: '2.5%',
  marketCap: 'R$ 1.2 bi',
  pl: '12.8',
  pvp: '0.8',
  roe: '8.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,46', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Safra 2023/24', data: '2024-04-28', tipo: 'Anual' }
  ]
},
  'YDUQ3': {
  ticker: 'YDUQ3',
  nomeCompleto: 'Yduqs Participações S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Yduqs é uma das maiores organizações educacionais privadas do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/YDUQ.png',
  precoAtual: 'R$ 15,54',
  variacao: '-42.7%',
  tendencia: 'down',
  dataEntrada: '11/11/2020',
  precoIniciou: 'R$ 27,16',
  dy: '2,64%',
  precoTeto: 'R$ 15,00',
  viesAtual: 'Venda',
  variacaoHoje: '-3.2%',
  rendProventos: '-34.5%',
  ibovespaEpoca: '119.800',
  ibovespaVariacao: '+7.2%',
  percentualCarteira: '1.8%',
  marketCap: 'R$ 2.8 bi',
  pl: '18.5',
  pvp: '0.5',
  roe: '4.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,15', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-25', tipo: 'Trimestral' }
  ]
},
'SIMH3': {
  ticker: 'SIMH3',
  nomeCompleto: 'SIMPAR S.A.',
  setor: 'Bens Industriais',
  descricao: 'A SIMPAR é uma holding com foco em concessões rodoviárias e locação de veículos.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SIMH.png',
  precoAtual: 'R$ 1,76',
  variacao: '-72.0%',
  tendencia: 'down',
  dataEntrada: '03/12/2020',
  precoIniciou: 'R$ 6,28',
  dy: '0,00%',
  precoTeto: 'R$ 10,79',
  viesAtual: 'Venda',
  variacaoHoje: '-4.8%',
  rendProventos: '-47.0%',
  ibovespaEpoca: '107.500',
  ibovespaVariacao: '+19.8%',
  percentualCarteira: '1.2%',
  marketCap: 'R$ 4.1 bi',
  pl: '25.8',
  pvp: '0.4',
  roe: '2.8%',
  proventos: [],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-30', tipo: 'Trimestral' }
  ]
},
  'ALUP11': {
  ticker: 'ALUP11',
  nomeCompleto: 'Alupar Investimento S.A.',
  setor: 'Utilidade Pública',
  descricao: 'A Alupar atua na transmissão de energia elétrica e geração de energia renovável.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
  precoAtual: 'R$ 30,53',
  variacao: '+25.1%',
  tendencia: 'up',
  dataEntrada: '25/11/2020',
  precoIniciou: 'R$ 24,40',
  dy: '4,46%',
  precoTeto: 'R$ 29,00',
  viesAtual: 'Compra',
  variacaoHoje: '+1.5%',
  rendProventos: '+25.1%',
  ibovespaEpoca: '102.800',
  ibovespaVariacao: '+24.8%',
  percentualCarteira: '6.5%',
  marketCap: 'R$ 23.5 bi',
  pl: '14.2',
  pvp: '1.6',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,78', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,65', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 0,52', dataEx: '15/11/2023', dataPagamento: '29/11/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-15', tipo: 'Anual' },
    { nome: 'Demonstrações Q1 2024', data: '2024-05-12', tipo: 'Trimestral' }
  ]
},
'NEOE3': {
  ticker: 'NEOE3',
  nomeCompleto: 'Neoenergia S.A.',
  setor: 'Utilidade Pública',
  descricao: 'A Neoenergia é uma das maiores empresas do setor elétrico brasileiro.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/NEOE.png',
  precoAtual: 'R$ 24,40',
  variacao: '+53.0%',
  tendencia: 'up',
  dataEntrada: '04/05/2021',
  precoIniciou: 'R$ 15,94',
  dy: '4,29%',
  precoTeto: 'R$ 21,00',
  viesAtual: 'Compra',
  variacaoHoje: '+0.6%',
  rendProventos: '+53.0%',
  ibovespaEpoca: '127.200',
  ibovespaVariacao: '+0.8%',
  percentualCarteira: '4.8%',
  marketCap: 'R$ 16.2 bi',
  pl: '11.5',
  pvp: '1.3',
  roe: '13.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,68', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,52', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Resultados Q1 2024', data: '2024-05-08', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-18', tipo: 'Anual' }
  ]
},
};

const fiisData: { [key: string]: FII } = {
  'MALL11': {
    ticker: 'MALL11',
    nomeCompleto: 'Shopping Outlets Premium FII',
    setor: 'Shopping',
    tipo: 'FII',
    descricao: 'O Shopping Outlets Premium FII é especializado em shopping centers premium e outlets.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
    precoAtual: 'R$ 109,23',
    variacao: '-7.65%',
    tendencia: 'down',
    dataEntrada: '26/01/2022',
    precoIniciou: 'R$ 118,27',
    dy: '10,09%',
    precoTeto: 'R$ 109,68',
    viesAtual: 'Compra',
    variacaoHoje: '-0.8%',
    rendProventos: '+12.4%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '8.5%',
    patrimonio: 'R$ 2.1 bilhões',
    p_vp: '1.08',
    vacancia: '4,2%',
    imoveis: 47,
    gestora: 'BTG Pactual',
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
      { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
    ]
  }
};

const MetricCard = ({ title, value, color = 'primary' }: { title: string; value: string; color?: string }) => (
  <Card sx={{ height: '100%', border: '1px solid #e5e7eb' }}>
    <CardContent sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h5" sx={{ 
        fontWeight: 700, 
        color: color === 'success' ? '#22c55e' : color === 'error' ? '#ef4444' : 'inherit' 
      }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default function EmpresaDetalhes() {
  const params = useParams();
  const ticker = params?.ticker as string;
  
  const empresa = empresasData[ticker] || fiisData[ticker];

  if (!empresa) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center', 
        minHeight: '60vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center' 
      }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          🔍 Empresa não encontrada
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto' }}>
          O ticker "<strong>{ticker}</strong>" não foi encontrado na nossa base de dados.
        </Typography>
        <Button 
          startIcon={<ArrowLeftIcon />} 
          onClick={() => window.history.back()}
          variant="contained"
          size="large"
        >
          Voltar à Lista
        </Button>
      </Box>
    );
  }

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';
  const isFII = empresa.tipo === 'FII';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowLeftIcon />} 
        onClick={() => window.history.back()} 
        variant="outlined" 
        sx={{ mb: 3 }}
      >
        Voltar
      </Button>

      <Card sx={{ 
  mb: 4, 
  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
  color: 'black' 
}}>
        <CardContent sx={{ p: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3} 
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Avatar 
              src={empresa.avatar} 
              alt={empresa.ticker} 
              sx={{ 
                width: { xs: 100, md: 120 }, 
                height: { xs: 100, md: 120 },
                border: '4px solid rgba(255,255,255,0.2)'
              }} 
            />
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack 
                direction="row" 
                spacing={2} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-start' }} 
                sx={{ mb: 1 }}
              >
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {empresa.ticker}
                </Typography>
                {isFII && (
                  <Chip 
                    label="FII" 
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 600
                    }} 
                  />
                )}
              </Stack>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                {empresa.nomeCompleto}
              </Typography>
              <Chip 
                label={empresa.setor} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  color: 'black',
                  mb: 2,
                  fontWeight: 600
                }} 
              />
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                {empresa.descricao}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
              <Typography variant="h2" sx={{ fontWeight: 700, color: 'black' }}>
                {empresa.precoAtual}
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
                <TrendIcon size={24} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 700, fontSize: '1.2rem' }}>
                  {empresa.variacao}
                </Typography>
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                Variação hoje: {empresa.variacaoHoje}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Dividend Yield" 
            value={empresa.dy} 
            color="success"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Viés Atual" 
            value={empresa.viesAtual}
            color={empresa.viesAtual === 'Compra' ? 'success' : empresa.viesAtual === 'Venda' ? 'error' : 'primary'}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="% Carteira" 
            value={empresa.percentualCarteira} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title={isFII ? "P/VP" : "P/L"} 
            value={isFII ? (empresa as FII).p_vp : (empresa as Empresa).pl} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Preço Teto" 
            value={empresa.precoTeto} 
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <MetricCard 
            title="Rendimento" 
            value={empresa.rendProventos}
            color="success" 
          />
        </Grid>
      </Grid>
<Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📊 Dados da Posição
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Data de Entrada</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Preço Inicial</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa na Época</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.ibovespaEpoca}</Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1 
                }}>
                  <Typography variant="body2" color="text.secondary">Ibovespa Variação</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                    {empresa.ibovespaVariacao}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                📈 {isFII ? 'Dados do Fundo' : 'Dados Fundamentalistas'}
              </Typography>
              <Stack spacing={2}>
                {isFII ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Patrimônio</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).patrimonio}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Vacância</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).vacancia}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Nº de Imóveis</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).imoveis}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Gestora</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as FII).gestora}</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as Empresa).marketCap}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">P/VPA</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{(empresa as Empresa).pvp}</Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      p: 2, 
                      backgroundColor: '#f8fafc', 
                      borderRadius: 1 
                    }}>
                      <Typography variant="body2" color="text.secondary">ROE</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#22c55e' }}>
                        {(empresa as Empresa).roe}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                💰 Histórico de Proventos
              </Typography>
              
              {empresa.proventos && empresa.proventos.length > 0 ? (
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Data Ex</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pagamento</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {empresa.proventos.map((provento, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Chip 
                              label={provento.tipo} 
                              size="small" 
                              color={provento.tipo === 'Dividendo' ? 'primary' : 'secondary'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            {provento.valor}
                          </TableCell>
                          <TableCell>{provento.dataEx}</TableCell>
                          <TableCell>{provento.dataPagamento}</TableCell>
                          <TableCell>
                            <Chip 
                              label={provento.status} 
                              size="small"
                              sx={{ 
                                backgroundColor: provento.status === 'Pago' ? '#dcfce7' : '#dbeafe', 
                                color: provento.status === 'Pago' ? '#22c55e' : '#3b82f6', 
                                fontWeight: 600
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    📭 Nenhum provento encontrado para esta empresa.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                📄 Relatórios e Documentos
              </Typography>
              
              <Grid container spacing={2}>
                {empresa.relatorios && empresa.relatorios.map((relatorio, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-2px)', 
                          boxShadow: 3 
                        },
                        border: '1px solid #e5e7eb'
                      }}
                      onClick={() => alert('Abrir relatório: ' + relatorio.nome)}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <FileTextIcon size={24} style={{ color: '#3b82f6', marginTop: 4 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              {relatorio.nome}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <CalendarIcon size={16} style={{ color: '#6b7280' }} />
                              <Typography variant="caption" color="text.secondary">
                                {relatorio.data}
                              </Typography>
                            </Stack>
                            <Chip 
                              label={relatorio.tipo} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          </Box>
                          <DownloadIcon size={20} style={{ color: '#6b7280' }} />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center' 
              }}>
                🎯 Análise de Performance
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Performance vs Ibovespa
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Ação</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={25} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="success"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        +24.7%
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Ibovespa no período
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Ibovespa</Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={18} 
                          sx={{ height: 8, borderRadius: 1, backgroundColor: '#e5e7eb' }}
                          color="info"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 60 }}>
                        +18.2%
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Resumo do Investimento
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Investido em:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.dataEntrada}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Preço inicial:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoIniciou}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Preço atual:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{empresa.precoAtual}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Rendimento total:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#22c55e' }}>
                          {empresa.rendProventos}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
