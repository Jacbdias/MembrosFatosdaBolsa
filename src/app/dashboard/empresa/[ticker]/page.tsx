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
  'DEXP3': {
  ticker: 'DEXP3',
  nomeCompleto: 'Dexco S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Dexco é líder em soluções completas para banheiros, metais e louças sanitárias.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
  precoAtual: 'R$ 9,39',
  variacao: '+18.0%',
  tendencia: 'up',
  dataEntrada: '27/01/2023',
  precoIniciou: 'R$ 7,96',
  dy: '5,91%',
  precoTeto: 'R$ 13,10',
  viesAtual: 'Compra',
  variacaoHoje: '+1.2%',
  rendProventos: '+18.0%',
  ibovespaEpoca: '109.500',
  ibovespaVariacao: '+15.2%',
  percentualCarteira: '3.8%',
  marketCap: 'R$ 6.8 bi',
  pl: '11.2',
  pvp: '1.1',
  roe: '14.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,32', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,28', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
  ]
},
'KEPL3': {
  ticker: 'KEPL3',
  nomeCompleto: 'Kepler Weber S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Kepler Weber é especializada em sistemas de armazenagem e equipamentos para agronegócio.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
  precoAtual: 'R$ 7,76',
  variacao: '-13.0%',
  tendencia: 'down',
  dataEntrada: '21/12/2020',
  precoIniciou: 'R$ 8,92',
  dy: '7,76%',
  precoTeto: 'R$ 11,00',
  viesAtual: 'Neutro',
  variacaoHoje: '-0.8%',
  rendProventos: '-13.0%',
  ibovespaEpoca: '104.800',
  ibovespaVariacao: '+22.5%',
  percentualCarteira: '2.1%',
  marketCap: 'R$ 1.8 bi',
  pl: '9.5',
  pvp: '0.9',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,48', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,35', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Anual 2023', data: '2024-04-10', tipo: 'Anual' },
    { nome: 'Balanço Q1 2024', data: '2024-05-08', tipo: 'Trimestral' }
  ]
},
'EVEN3': {
  ticker: 'EVEN3',
  nomeCompleto: 'Even Construtora e Incorporadora S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Even é uma incorporadora imobiliária focada em empreendimentos residenciais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/EVEN.png',
  precoAtual: 'R$ 6,57',
  variacao: '-28.6%',
  tendencia: 'down',
  dataEntrada: '06/06/2022',
  precoIniciou: 'R$ 9,20',
  dy: '19,57%',
  precoTeto: 'R$ 8,50',
  viesAtual: 'Venda',
  variacaoHoje: '-1.5%',
  rendProventos: '-28.6%',
  ibovespaEpoca: '112.800',
  ibovespaVariacao: '+12.5%',
  percentualCarteira: '1.8%',
  marketCap: 'R$ 1.2 bi',
  pl: '18.5',
  pvp: '0.6',
  roe: '6.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,12', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 0,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Vendas Q1 2024', data: '2024-05-14', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-22', tipo: 'Anual' }
  ]
},
'WIZC3': {
  ticker: 'WIZC3',
  nomeCompleto: 'WIZ Soluções e Corretagem de Seguros S.A.',
  setor: 'Financeiro',
  descricao: 'A WIZ é uma das maiores corretoras de seguros do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/WIZC.png',
  precoAtual: 'R$ 7,06',
  variacao: '-35.5%',
  tendencia: 'down',
  dataEntrada: '30/04/2021',
  precoIniciou: 'R$ 10,94',
  dy: '4,21%',
  precoTeto: 'R$ 12,00',
  viesAtual: 'Neutro',
  variacaoHoje: '-2.1%',
  rendProventos: '-35.5%',
  ibovespaEpoca: '118.500',
  ibovespaVariacao: '+8.2%',
  percentualCarteira: '2.5%',
  marketCap: 'R$ 3.2 bi',
  pl: '14.8',
  pvp: '1.2',
  roe: '9.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,28', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,22', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-20', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
  'RANI3': {
  ticker: 'RANI3',
  nomeCompleto: 'Irani Papel e Embalagem S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Irani é uma empresa integrada de papel, embalagem e floresta.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/RANI.png',
  precoAtual: 'R$ 7,63',
  variacao: '+64.0%',
  tendencia: 'up',
  dataEntrada: '19/11/2020',
  precoIniciou: 'R$ 4,65',
  dy: '7,61%',
  precoTeto: 'R$ 10,57',
  viesAtual: 'Compra',
  variacaoHoje: '+2.8%',
  rendProventos: '+64.0%',
  ibovespaEpoca: '103.200',
  ibovespaVariacao: '+24.8%',
  percentualCarteira: '4.2%',
  marketCap: 'R$ 2.1 bi',
  pl: '8.5',
  pvp: '1.1',
  roe: '16.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,45', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,38', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-15', tipo: 'Anual' },
    { nome: 'Demonstrações Q1 2024', data: '2024-05-12', tipo: 'Trimestral' }
  ]
},
'SHUL4': {
  ticker: 'SHUL4',
  nomeCompleto: 'Sul América S.A.',
  setor: 'Financeiro',
  descricao: 'A Sul América é uma das maiores seguradoras do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SHUL.png',
  precoAtual: 'R$ 5,45',
  variacao: '-26.5%',
  tendencia: 'down',
  dataEntrada: '04/03/2021',
  precoIniciou: 'R$ 7,42',
  dy: '5,00%',
  precoTeto: 'R$ 5,45',
  viesAtual: 'Neutro',
  variacaoHoje: '-1.2%',
  rendProventos: '-26.5%',
  ibovespaEpoca: '115.800',
  ibovespaVariacao: '+10.5%',
  percentualCarteira: '2.1%',
  marketCap: 'R$ 4.8 bi',
  pl: '12.5',
  pvp: '0.8',
  roe: '8.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,28', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,22', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-18', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'RSUL4': {
  ticker: 'RSUL4',
  nomeCompleto: 'Metalúrgica Riosulense S.A.',
  setor: 'Saúde',
  descricao: 'Fabricante de autopeças e acessórios como guias, sedes e tuchos de válvulas, rolamentos e peças fundidas.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/RSUL.png',
  precoAtual: 'R$ 67,75',
  variacao: '-20.3%',
  tendencia: 'down',
  dataEntrada: '06/08/2021',
  precoIniciou: 'R$ 85,00',
  dy: '3,55%',
  precoTeto: 'R$ 100,00',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '-20.3%',
  ibovespaEpoca: '121.500',
  ibovespaVariacao: '+5.2%',
  percentualCarteira: '8.5%',
  marketCap: 'R$ 95.2 bi',
  pl: '18.2',
  pvp: '2.1',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1.85', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1.42', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 1.15', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Resultados Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
  
'TASA4': {
  ticker: 'TASA4',
  nomeCompleto: 'Taurus Armas S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Taurus é uma das maiores fabricantes de armas pequenas do mundo.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/TASA.png',
  precoAtual: 'R$ 7,82',
  variacao: '-54.5%',
  tendencia: 'down',
  dataEntrada: '27/06/2022',
  precoIniciou: 'R$ 17,14',
  dy: '2,90%',
  precoTeto: 'R$ 25,50',
  viesAtual: 'Venda',
  variacaoHoje: '-2.8%',
  rendProventos: '-54.5%',
  ibovespaEpoca: '114.200',
  ibovespaVariacao: '+12.8%',
  percentualCarteira: '1.5%',
  marketCap: 'R$ 1.8 bi',
  pl: '15.2',
  pvp: '0.9',
  roe: '8.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,22', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-20', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'TRIS3': {
  ticker: 'TRIS3',
  nomeCompleto: 'Trisul S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Trisul é uma incorporadora imobiliária focada em empreendimentos residenciais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/TRIS.png',
  precoAtual: 'R$ 7,17',
  variacao: '+39.0%',
  tendencia: 'up',
  dataEntrada: '25/02/2022',
  precoIniciou: 'R$ 5,15',
  dy: '3,59%',
  precoTeto: 'R$ 5,79',
  viesAtual: 'Compra',
  variacaoHoje: '+2.1%',
  rendProventos: '+39.0%',
  ibovespaEpoca: '108.800',
  ibovespaVariacao: '+17.2%',
  percentualCarteira: '3.2%',
  marketCap: 'R$ 1.2 bi',
  pl: '8.5',
  pvp: '0.7',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,25', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,18', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Vendas Q1 2024', data: '2024-05-08', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-22', tipo: 'Anual' }
  ]
},
'CGRA4': {
  ticker: 'CGRA4',
  nomeCompleto: 'Grazziotin S.A.',
  setor: 'Consumo Cíclico',
  descricao: 'A Grazziotin é uma rede de lojas de departamento focada no Sul do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/CGRA.png',
  precoAtual: 'R$ 6,99',
  variacao: '+35.9%',
  tendencia: 'up',
  dataEntrada: '09/03/2023',
  precoIniciou: 'R$ 5,14',
  dy: '10,61%',
  precoTeto: 'R$ 12,50',
  viesAtual: 'Compra',
  variacaoHoje: '+1.8%',
  rendProventos: '+35.9%',
  ibovespaEpoca: '107.500',
  ibovespaVariacao: '+19.2%',
  percentualCarteira: '2.8%',
  marketCap: 'R$ 485 mi',
  pl: '9.2',
  pvp: '1.1',
  roe: '14.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,68', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 0,52', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-18', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-30', tipo: 'Anual' }
  ]
},
'ROMI3': {
  ticker: 'ROMI3',
  nomeCompleto: 'Indústrias Romi S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Romi é líder na fabricação de máquinas-ferramenta e equipamentos industriais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ROMI.png',
  precoAtual: 'R$ 9,30',
  variacao: '-22.6%',
  tendencia: 'down',
  dataEntrada: '19/07/2022',
  precoIniciou: 'R$ 12,02',
  dy: '8,00%',
  precoTeto: 'R$ 19,40',
  viesAtual: 'Neutro',
  variacaoHoje: '-1.2%',
  rendProventos: '-22.6%',
  ibovespaEpoca: '117.800',
  ibovespaVariacao: '+8.5%',
  percentualCarteira: '2.5%',
  marketCap: 'R$ 1.8 bi',
  pl: '12.5',
  pvp: '1.2',
  roe: '10.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,72', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,58', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-12', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
  ]
},
'POSI3': {
  ticker: 'POSI3',
  nomeCompleto: 'Positivo Tecnologia S.A.',
  setor: 'Tecnologia da Informação',
  descricao: 'A Positivo é uma das maiores fabricantes de computadores do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/POSI.png',
  precoAtual: 'R$ 4,96',
  variacao: '-42.8%',
  tendencia: 'down',
  dataEntrada: '22/04/2022',
  precoIniciou: 'R$ 8,67',
  dy: '6,86%',
  precoTeto: 'R$ 10,16',
  viesAtual: 'Venda',
  variacaoHoje: '-2.5%',
  rendProventos: '-42.8%',
  ibovespaEpoca: '111.200',
  ibovespaVariacao: '+14.8%',
  percentualCarteira: '1.8%',
  marketCap: 'R$ 1.2 bi',
  pl: '18.5',
  pvp: '0.8',
  roe: '6.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,32', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,28', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-20', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'CCAS3': {
  ticker: 'CCAS3',
  nomeCompleto: 'Casa de Bolos S.A.',
  setor: 'Consumo Não Cíclico',
  descricao: 'A Casa de Bolos é uma rede de confeitarias e panificadoras.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/CCAS.png',
  precoAtual: 'R$ 7,06',
  variacao: '-16.0%',
  tendencia: 'down',
  dataEntrada: '04/05/2023',
  precoIniciou: 'R$ 8,40',
  dy: '6,00%',
  precoTeto: 'R$ 10,94',
  viesAtual: 'Neutro',
  variacaoHoje: '-0.8%',
  rendProventos: '-16.0%',
  ibovespaEpoca: '113.500',
  ibovespaVariacao: '+11.2%',
  percentualCarteira: '2.1%',
  marketCap: 'R$ 485 mi',
  pl: '14.5',
  pvp: '1.1',
  roe: '8.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,32', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'LOGG3': {
  ticker: 'LOGG3',
  nomeCompleto: 'Log-In Logística Intermodal S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Log-In é especializada em soluções logísticas e transporte intermodal.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/LOGG.png',
  precoAtual: 'R$ 21,63',
  variacao: '+14.1%',
  tendencia: 'up',
  dataEntrada: '25/11/2022',
  precoIniciou: 'R$ 18,96',
  dy: '2,99%',
  precoTeto: 'R$ 25,00',
  viesAtual: 'Compra',
  variacaoHoje: '+1.5%',
  rendProventos: '+14.1%',
  ibovespaEpoca: '124.800',
  ibovespaVariacao: '+2.5%',
  percentualCarteira: '3.8%',
  marketCap: 'R$ 3.2 bi',
  pl: '11.5',
  pvp: '1.3',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,58', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,42', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Operações Q1 2024', data: '2024-05-08', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-22', tipo: 'Anual' }
  ]
},
  
'AGRO3': {
  ticker: 'AGRO3',
  nomeCompleto: 'BrasilAgro - Companhia Brasileira de Propriedades Agrícolas',
  setor: 'Consumo Não Cíclico',
  descricao: 'A BrasilAgro é uma empresa de desenvolvimento e exploração de propriedades agrícolas.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/AGRO.png',
  precoAtual: 'R$ 21,60',
  variacao: '-6.1%',
  tendencia: 'down',
  dataEntrada: '09/10/2020',
  precoIniciou: 'R$ 23,00',
  dy: '6,59%',
  precoTeto: 'R$ 31,80',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '-6.1%',
  ibovespaEpoca: '101.500',
  ibovespaVariacao: '+26.8%',
  percentualCarteira: '5.2%',
  marketCap: 'R$ 2.8 bi',
  pl: '8.5',
  pvp: '1.2',
  roe: '15.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,98', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 0,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 0,72', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Safra 2023/24', data: '2024-04-28', tipo: 'Anual' },
    { nome: 'Demonstrações Q1 2024', data: '2024-05-15', tipo: 'Trimestral' }
  ]
},

  'LEVE3': {
  ticker: 'LEVE3',
  nomeCompleto: 'Metal Leve S.A.',
  setor: 'Bens Industriais',
  descricao: 'A Metal Leve é líder na fabricação de pistões, blocos de motores e componentes automotivos.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/LEVE.png',
  precoAtual: 'R$ 30,92',
  variacao: '+11.5%',
  tendencia: 'up',
  dataEntrada: '06/12/2024',
  precoIniciou: 'R$ 27,74',
  dy: '8,14%',
  precoTeto: 'R$ 35,27',
  viesAtual: 'Compra',
  variacaoHoje: '+1.8%',
  rendProventos: '+11.5%',
  ibovespaEpoca: '128.500',
  ibovespaVariacao: '+1.2%',
  percentualCarteira: '4.5%',
  marketCap: 'R$ 4.2 bi',
  pl: '9.8',
  pvp: '1.4',
  roe: '16.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,85', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1,42', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-15', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
  ]
},
'EQTL3': {
  ticker: 'EQTL3',
  nomeCompleto: 'Equatorial Energia S.A.',
  setor: 'Utilidade Pública',
  descricao: 'A Equatorial é uma das principais empresas do setor elétrico brasileiro.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/EQTL.png',
  precoAtual: 'R$ 41,00',
  variacao: '-5.1%',
  tendencia: 'down',
  dataEntrada: '31/03/2022',
  precoIniciou: 'R$ 43,13',
  dy: '6,29%',
  precoTeto: 'R$ 50,34',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '-5.1%',
  ibovespaEpoca: '109.800',
  ibovespaVariacao: '+16.2%',
  percentualCarteira: '6.8%',
  marketCap: 'R$ 42.5 bi',
  pl: '12.8',
  pvp: '1.8',
  roe: '14.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1.95', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 1.58', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Resultados Q3 2024', data: '2024-11-08', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'VALE3': {
  ticker: 'VALE3',
  nomeCompleto: 'Vale S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Vale é uma das maiores empresas de mineração do mundo, líder na produção de minério de ferro.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
  precoAtual: 'R$ 53,99',
  variacao: '-23.5%',
  tendencia: 'down',
  dataEntrada: '17/07/2023',
  precoIniciou: 'R$ 70,56',
  dy: '11,27%',
  precoTeto: 'R$ 78,20',
  viesAtual: 'Compra',
  variacaoHoje: '-1.2%',
  rendProventos: '-23.5%',
  ibovespaEpoca: '119.500',
  ibovespaVariacao: '+7.8%',
  percentualCarteira: '12.5%',
  marketCap: 'R$ 285.8 bi',
  pl: '4.2',
  pvp: '0.9',
  roe: '22.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 3.85', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 2.95', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 2.15', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Produção Q3 2024', data: '2024-10-28', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-15', tipo: 'Anual' }
  ]
},
'BBAS3': {
  ticker: 'BBAS3',
  nomeCompleto: 'Banco do Brasil S.A.',
  setor: 'Financeiro',
  descricao: 'O Banco do Brasil é uma das maiores instituições financeiras do país.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
  precoAtual: 'R$ 24,70',
  variacao: '+58.4%',
  tendencia: 'up',
  dataEntrada: '20/10/2021',
  precoIniciou: 'R$ 15,60',
  dy: '9,62%',
  precoTeto: 'R$ 30,10',
  viesAtual: 'Compra',
  variacaoHoje: '+2.1%',
  rendProventos: '+58.4%',
  ibovespaEpoca: '105.800',
  ibovespaVariacao: '+21.2%',
  percentualCarteira: '8.5%',
  marketCap: 'R$ 158.2 bi',
  pl: '6.8',
  pvp: '1.1',
  roe: '18.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1.85', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1.42', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 1.15', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-05', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'BBSR6': {
  ticker: 'BBSR6',
  nomeCompleto: 'Banco do Brasil Pref',
  setor: 'Financeiro',
  descricao: 'Ações preferenciais do Banco do Brasil S.A.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
  precoAtual: 'R$ 12,30',
  variacao: '+22.0%',
  tendencia: 'up',
  dataEntrada: '12/05/2022',
  precoIniciou: 'R$ 10,08',
  dy: '4,92%',
  precoTeto: 'R$ 15,10',
  viesAtual: 'Compra',
  variacaoHoje: '+1.5%',
  rendProventos: '+22.0%',
  ibovespaEpoca: '112.500',
  ibovespaVariacao: '+13.8%',
  percentualCarteira: '3.2%',
  marketCap: 'R$ 158.2 bi',
  pl: '6.8',
  pvp: '1.1',
  roe: '18.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0.48', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0.38', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-05', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'PETR4': {
  ticker: 'PETR4',
  nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
  setor: 'Petróleo, Gás e Biocombustíveis',
  descricao: 'A Petrobras é uma empresa integrada de energia, focada em óleo, gás natural e energia de baixo carbono.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/PETR.png',
  precoAtual: 'R$ 31,45',
  variacao: '-11.8%',
  tendencia: 'down',
  dataEntrada: '24/05/2022',
  precoIniciou: 'R$ 35,67',
  dy: '18,01%',
  precoTeto: 'R$ 37,50',
  viesAtual: 'Compra',
  variacaoHoje: '+1.8%',
  rendProventos: '-11.8%',
  ibovespaEpoca: '113.800',
  ibovespaVariacao: '+11.5%',
  percentualCarteira: '12.5%',
  marketCap: 'R$ 512.8 bi',
  pl: '3.8',
  pvp: '1.2',
  roe: '31.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 3.25', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 2.85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 2.15', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Produção Q3 2024', data: '2024-10-30', tipo: 'Trimestral' },
    { nome: 'Demonstrações Financeiras 2023', data: '2024-03-15', tipo: 'Anual' }
  ]
},
'SAPR4': {
  ticker: 'SAPR4',
  nomeCompleto: 'Sanepar S.A.',
  setor: 'Utilidade Pública',
  descricao: 'A Sanepar é a companhia de saneamento do Paraná.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SAPR.png',
  precoAtual: 'R$ 6,43',
  variacao: '+68.8%',
  tendencia: 'up',
  dataEntrada: '27/10/2021',
  precoIniciou: 'R$ 3,81',
  dy: '5,30%',
  precoTeto: 'R$ 6,00',
  viesAtual: 'Compra',
  variacaoHoje: '+2.2%',
  rendProventos: '+68.8%',
  ibovespaEpoca: '106.200',
  ibovespaVariacao: '+20.5%',
  percentualCarteira: '2.8%',
  marketCap: 'R$ 3.2 bi',
  pl: '8.5',
  pvp: '0.9',
  roe: '12.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0.28', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0.22', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-12', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-18', tipo: 'Anual' }
  ]
},
'ELET3': {
  ticker: 'ELET3',
  nomeCompleto: 'Centrais Elétricas Brasileiras S.A. - Eletrobras',
  setor: 'Utilidade Pública',
  descricao: 'A Eletrobras é a maior empresa de energia elétrica da América Latina.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ELET.png',
  precoAtual: 'R$ 41,00',
  variacao: '+1.5%',
  tendencia: 'up',
  dataEntrada: '20/11/2023',
  precoIniciou: 'R$ 40,41',
  dy: '1,12%',
  precoTeto: 'R$ 58,27',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '+1.5%',
  ibovespaEpoca: '125.800',
  ibovespaVariacao: '+1.8%',
  percentualCarteira: '5.5%',
  marketCap: 'R$ 85.2 bi',
  pl: '9.8',
  pvp: '1.4',
  roe: '15.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0.42', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-10', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-20', tipo: 'Anual' }
  ]
},
'ABCB4': {
  ticker: 'ABCB4',
  nomeCompleto: 'Banco ABC Brasil S.A.',
  setor: 'Financeiro',
  descricao: 'O ABC Brasil é um banco de investimento focado no segmento corporativo.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ABCB.png',
  precoAtual: 'R$ 21,81',
  variacao: '+22.0%',
  tendencia: 'up',
  dataEntrada: '19/06/2023',
  precoIniciou: 'R$ 17,87',
  dy: '7,42%',
  precoTeto: 'R$ 22,30',
  viesAtual: 'Compra',
  variacaoHoje: '+1.5%',
  rendProventos: '+22.0%',
  ibovespaEpoca: '116.500',
  ibovespaVariacao: '+9.8%',
  percentualCarteira: '3.8%',
  marketCap: 'R$ 4.8 bi',
  pl: '8.5',
  pvp: '1.2',
  roe: '16.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1.25', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 0.95', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-08', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'SMTO3': {
  ticker: 'SMTO3',
  nomeCompleto: 'São Martinho S.A.',
  setor: 'Consumo Não Cíclico',
  descricao: 'A São Martinho é uma das maiores produtoras de açúcar e etanol do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
  precoAtual: 'R$ 24,71',
  variacao: '+87.9%',
  tendencia: 'up',
  dataEntrada: '19/08/2022',
  precoIniciou: 'R$ 13,15',
  dy: '15,69%',
  precoTeto: 'R$ 19,16',
  viesAtual: 'Compra',
  variacaoHoje: '+1.9%',
  rendProventos: '+87.9%',
  ibovespaEpoca: '118.200',
  ibovespaVariacao: '+8.8%',
  percentualCarteira: '5.8%',
  marketCap: 'R$ 11.2 bi',
  pl: '9.5',
  pvp: '1.3',
  roe: '16.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 2.85', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 2.15', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório de Safra 2023/24', data: '2024-04-05', tipo: 'Anual' },
    { nome: 'Balanço Q3 2024', data: '2024-11-10', tipo: 'Trimestral' }
  ]
},
'BBSE3': {
  ticker: 'BBSE3',
  nomeCompleto: 'BB Seguridade Participações S.A.',
  setor: 'Financeiro',
  descricao: 'A BB Seguridade é a holding de seguros, previdência e capitalização do Banco do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BBSE.png',
  precoAtual: 'R$ 37,96',
  variacao: '+49.0%',
  tendencia: 'up',
  dataEntrada: '30/06/2022',
  precoIniciou: 'R$ 25,48',
  dy: '7,62%',
  precoTeto: 'R$ 33,20',
  viesAtual: 'Compra',
  variacaoHoje: '+2.1%',
  rendProventos: '+49.0%',
  ibovespaEpoca: '114.800',
  ibovespaVariacao: '+11.2%',
  percentualCarteira: '6.2%',
  marketCap: 'R$ 78.5 bi',
  pl: '12.5',
  pvp: '2.8',
  roe: '25.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 2.15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1.85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 1.42', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-05', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'ISAE4': {
  ticker: 'ISAE4',
  nomeCompleto: 'Saneamento de Goiás S.A. - Saneago',
  setor: 'Utilidade Pública',
  descricao: 'A Saneago é responsável pelos serviços de saneamento básico em Goiás.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ISAE.png',
  precoAtual: 'R$ 23,55',
  variacao: '-1.9%',
  tendencia: 'down',
  dataEntrada: '22/10/2021',
  precoIniciou: 'R$ 24,00',
  dy: '9,07%',
  precoTeto: 'R$ 26,50',
  viesAtual: 'Neutro',
  variacaoHoje: '-0.5%',
  rendProventos: '-1.9%',
  ibovespaEpoca: '106.800',
  ibovespaVariacao: '+19.8%',
  percentualCarteira: '2.8%',
  marketCap: 'R$ 2.1 bi',
  pl: '8.5',
  pvp: '1.1',
  roe: '14.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1.85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 1.25', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-12', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-18', tipo: 'Anual' }
  ]
},
'WIZC3': {
  ticker: 'WIZC3',
  nomeCompleto: 'WIZ Soluções e Corretagem de Seguros S.A.',
  setor: 'Financeiro',
  descricao: 'A WIZ é uma das maiores corretoras de seguros do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/WIZC.png',
  precoAtual: 'R$ 27,69',
  variacao: '+21.5%',
  tendencia: 'up',
  dataEntrada: '05/04/2022',
  precoIniciou: 'R$ 22,80',
  dy: '3,13%',
  precoTeto: 'R$ 29,00',
  viesAtual: 'Compra',
  variacaoHoje: '+1.8%',
  rendProventos: '+21.5%',
  ibovespaEpoca: '111.500',
  ibovespaVariacao: '+14.5%',
  percentualCarteira: '4.2%',
  marketCap: 'R$ 3.2 bi',
  pl: '14.8',
  pvp: '1.2',
  roe: '9.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0.68', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0.52', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-20', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'KLBN11': {
  ticker: 'KLBN11',
  nomeCompleto: 'Klabin S.A.',
  setor: 'Materiais Básicos',
  descricao: 'A Klabin é a maior produtora e exportadora de papéis do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/KLBN.png',
  precoAtual: 'R$ 19,23',
  variacao: '-12.4%',
  tendencia: 'down',
  dataEntrada: '09/06/2022',
  precoIniciou: 'R$ 21,94',
  dy: '4,55%',
  precoTeto: 'R$ 27,68',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '-12.4%',
  ibovespaEpoca: '114.200',
  ibovespaVariacao: '+12.5%',
  percentualCarteira: '4.8%',
  marketCap: 'R$ 22.5 bi',
  pl: '18.5',
  pvp: '1.1',
  roe: '7.8%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,68', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,52', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-15', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-20', tipo: 'Anual' }
  ]
},
'SANB11': {
  ticker: 'SANB11',
  nomeCompleto: 'Banco Santander (Brasil) S.A.',
  setor: 'Financeiro',
  descricao: 'O Santander Brasil é uma das maiores instituições financeiras privadas do país.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/SANB.png',
  precoAtual: 'R$ 29,91',
  variacao: '+8.2%',
  tendencia: 'up',
  dataEntrada: '08/12/2022',
  precoIniciou: 'R$ 27,63',
  dy: '5,96%',
  precoTeto: 'R$ 31,78',
  viesAtual: 'Compra',
  variacaoHoje: '+1.5%',
  rendProventos: '+8.2%',
  ibovespaEpoca: '124.500',
  ibovespaVariacao: '+3.2%',
  percentualCarteira: '7.8%',
  marketCap: 'R$ 168.5 bi',
  pl: '8.5',
  pvp: '1.4',
  roe: '18.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 1,35', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
    { tipo: 'JCP', valor: 'R$ 1,15', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    { tipo: 'Dividendo', valor: 'R$ 0,95', dataEx: '15/12/2023', dataPagamento: '29/12/2023', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-08', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-25', tipo: 'Anual' }
  ]
},
'B3SA3': {
  ticker: 'B3SA3',
  nomeCompleto: 'B3 S.A. - Brasil, Bolsa, Balcão',
  setor: 'Financeiro',
  descricao: 'A B3 é a bolsa de valores oficial do Brasil, operando mercados de ações, derivativos e commodities.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/B3SA.png',
  precoAtual: 'R$ 14,38',
  variacao: '+31.7%',
  tendencia: 'up',
  dataEntrada: '28/07/2022',
  precoIniciou: 'R$ 10,92',
  dy: '3,76%',
  precoTeto: 'R$ 12,20',
  viesAtual: 'Compra',
  variacaoHoje: '+2.1%',
  rendProventos: '+31.7%',
  ibovespaEpoca: '117.500',
  ibovespaVariacao: '+9.2%',
  percentualCarteira: '5.5%',
  marketCap: 'R$ 78.2 bi',
  pl: '16.8',
  pvp: '2.8',
  roe: '18.5%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,48', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,35', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-12', tipo: 'Trimestral' },
    { nome: 'Relatório Anual 2023', data: '2024-03-28', tipo: 'Anual' }
  ]
},
'CPLE6': {
  ticker: 'CPLE6',
  nomeCompleto: 'Companhia Paranaense de Energia - Copel',
  setor: 'Utilidade Pública',
  descricao: 'A Copel é uma das maiores empresas de energia elétrica do Sul do Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/CPLE.png',
  precoAtual: 'R$ 12,40',
  variacao: '+127.5%',
  tendencia: 'up',
  dataEntrada: '10/11/2021',
  precoIniciou: 'R$ 5,45',
  dy: '2,26%',
  precoTeto: 'R$ 7,25',
  viesAtual: 'Compra',
  variacaoHoje: '+1.8%',
  rendProventos: '+127.5%',
  ibovespaEpoca: '105.200',
  ibovespaVariacao: '+21.8%',
  percentualCarteira: '3.2%',
  marketCap: 'R$ 35.8 bi',
  pl: '12.5',
  pvp: '1.8',
  roe: '15.2%',
  proventos: [
    { tipo: 'Dividendo', valor: 'R$ 0,25', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
    { tipo: 'JCP', valor: 'R$ 0,18', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Relatório Trimestral Q3 2024', data: '2024-11-10', tipo: 'Trimestral' },
    { nome: 'Relatório de Sustentabilidade 2023', data: '2024-04-15', tipo: 'Anual' }
  ]
}
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
  },
  'KNSC11': {
    ticker: 'KNSC11',
    nomeCompleto: 'Kinea Securities FII',
    setor: 'Títulos e Valores Mobiliários',
    tipo: 'FII',
    descricao: 'Fundo de investimento imobiliário especializado em títulos e valores mobiliários do setor imobiliário.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png',
    precoAtual: 'R$ 8,87',
    variacao: '-4.7%',
    tendencia: 'down',
    dataEntrada: '22/04/2022',
    precoIniciou: 'R$ 9,31',
    dy: '10,98%',
    precoTeto: 'R$ 9,16',
    viesAtual: 'Compra',
    variacaoHoje: '+0.5%',
    rendProventos: '-4.7%',
    ibovespaEpoca: '111.500',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '3.2%',
    patrimonio: 'R$ 485 milhões',
    p_vp: '0.97',
    vacancia: '0%',
    imoveis: 0,
    gestora: 'Kinea',
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,08', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
      { tipo: 'Rendimento', valor: 'R$ 0,09', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
    ],
    relatorios: [
      { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
      { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
    ]
  },
'KNHF11': {
  ticker: 'KNHF11',
  nomeCompleto: 'Kinea Hedge Fund Imobiliário FII',
  setor: 'Títulos e Valores Mobiliários',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário focado em estratégias hedge fund do setor imobiliário.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/KNHF.png',
  precoAtual: 'R$ 91,05',
  variacao: '+19.3%',
  tendencia: 'up',
  dataEntrada: '25/01/2025',
  precoIniciou: 'R$ 76,31',
  dy: '15,0%',
  precoTeto: 'R$ 90,50',
  viesAtual: 'Compra',
  variacaoHoje: '+1.2%',
  rendProventos: '+19.3%',
  ibovespaEpoca: '128.500',
  ibovespaVariacao: '+0.8%',
  percentualCarteira: '4.8%',
  patrimonio: 'R$ 1.2 bilhões',
  p_vp: '1.01',
  vacancia: '0%',
  imoveis: 0,
  gestora: 'Kinea',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 1,15', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 1,08', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'HGBS11': {
  ticker: 'HGBS11',
  nomeCompleto: 'CSHG Brasil Shopping FII',
  setor: 'Shopping',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em shopping centers no Brasil.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png',
  precoAtual: 'R$ 199,60',
  variacao: '+7.3%',
  tendencia: 'up',
  dataEntrada: '09/02/2025',
  precoIniciou: 'R$ 186,08',
  dy: '10,5%',
  precoTeto: 'R$ 192,00',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '+7.3%',
  ibovespaEpoca: '128.200',
  ibovespaVariacao: '+1.2%',
  percentualCarteira: '6.2%',
  patrimonio: 'R$ 3.8 bilhões',
  p_vp: '1.04',
  vacancia: '3.8%',
  imoveis: 25,
  gestora: 'CSHG',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 1,75', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 1,68', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'RURA11': {
  ticker: 'RURA11',
  nomeCompleto: 'Rura Investimento Imobiliário FII',
  setor: 'Agronegócio',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário focado em ativos do agronegócio e propriedades rurais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png',
  precoAtual: 'R$ 8,47',
  variacao: '-17.4%',
  tendencia: 'down',
  dataEntrada: '23/03/2022',
  precoIniciou: 'R$ 10,25',
  dy: '13,21%',
  precoTeto: 'R$ 8,70',
  viesAtual: 'Compra',
  variacaoHoje: '-0.5%',
  rendProventos: '-17.4%',
  ibovespaEpoca: '110.800',
  ibovespaVariacao: '+17.2%',
  percentualCarteira: '2.8%',
  patrimonio: 'R$ 685 milhões',
  p_vp: '0.97',
  vacancia: '8.5%',
  imoveis: 12,
  gestora: 'Rura',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,09', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,11', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'BCIA11': {
  ticker: 'BCIA11',
  nomeCompleto: 'BC Investimentos Ativos Imobiliários FII',
  setor: 'Híbrido',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário híbrido com estratégia diversificada de ativos imobiliários.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BCIA.png',
  precoAtual: 'R$ 85,75',
  variacao: '+4.2%',
  tendencia: 'up',
  dataEntrada: '08/04/2022',
  precoIniciou: 'R$ 82,28',
  dy: '9,77%',
  precoTeto: 'R$ 87,81',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '+4.2%',
  ibovespaEpoca: '111.200',
  ibovespaVariacao: '+16.5%',
  percentualCarteira: '4.5%',
  patrimonio: 'R$ 1.8 bilhões',
  p_vp: '0.98',
  vacancia: '5.2%',
  imoveis: 18,
  gestora: 'BC Investimentos',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,70', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,68', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'BPFF11': {
  ticker: 'BPFF11',
  nomeCompleto: 'BTG Pactual Fundo de Fundos FII',
  setor: 'Fundo de Fundos',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário que investe em cotas de outros fundos imobiliários.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png',
  precoAtual: 'R$ 60,40',
  variacao: '-16.3%',
  tendencia: 'down',
  dataEntrada: '26/10/2023',
  precoIniciou: 'R$ 72,12',
  dy: '11,0%',
  precoTeto: 'R$ 66,26',
  viesAtual: 'Compra',
  variacaoHoje: '-0.8%',
  rendProventos: '-16.3%',
  ibovespaEpoca: '124.800',
  ibovespaVariacao: '+3.2%',
  percentualCarteira: '5.5%',
  patrimonio: 'R$ 2.8 bilhões',
  p_vp: '0.91',
  vacancia: '0%',
  imoveis: 0,
  gestora: 'BTG Pactual',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,55', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,58', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'HGFF11': {
  ticker: 'HGFF11',
  nomeCompleto: 'CSHG Fundo de Fundos FII',
  setor: 'Fundo de Fundos',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário que investe em cotas de outros fundos imobiliários.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png',
  precoAtual: 'R$ 71,40',
  variacao: '+3.3%',
  tendencia: 'up',
  dataEntrada: '30/03/2022',
  precoIniciou: 'R$ 69,15',
  dy: '9,25%',
  precoTeto: 'R$ 73,59',
  viesAtual: 'Compra',
  variacaoHoje: '+0.5%',
  rendProventos: '+3.3%',
  ibovespaEpoca: '111.800',
  ibovespaVariacao: '+15.8%',
  percentualCarteira: '4.2%',
  patrimonio: 'R$ 1.5 bilhões',
  p_vp: '0.97',
  vacancia: '0%',
  imoveis: 0,
  gestora: 'CSHG',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,55', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,52', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'BRCO11': {
  ticker: 'BRCO11',
  nomeCompleto: 'BRC Fundo de Investimento Imobiliário',
  setor: 'Logística',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em ativos logísticos e industriais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BRCO.png',
  precoAtual: 'R$ 108,66',
  variacao: '+9.5%',
  tendencia: 'up',
  dataEntrada: '16/04/2022',
  precoIniciou: 'R$ 99,25',
  dy: '8,44%',
  precoTeto: 'R$ 109,89',
  viesAtual: 'Compra',
  variacaoHoje: '+1.2%',
  rendProventos: '+9.5%',
  ibovespaEpoca: '111.500',
  ibovespaVariacao: '+15.8%',
  percentualCarteira: '6.8%',
  patrimonio: 'R$ 3.2 bilhões',
  p_vp: '0.99',
  vacancia: '2.8%',
  imoveis: 32,
  gestora: 'BRC',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,76', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,72', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'XPML11': {
  ticker: 'XPML11',
  nomeCompleto: 'XP Malls FII',
  setor: 'Shopping',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em shopping centers.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/XPML.png',
  precoAtual: 'R$ 104,80',
  variacao: '+12.3%',
  tendencia: 'up',
  dataEntrada: '03/05/2022',
  precoIniciou: 'R$ 93,32',
  dy: '8,44%',
  precoTeto: 'R$ 110,40',
  viesAtual: 'Compra',
  variacaoHoje: '+0.8%',
  rendProventos: '+12.3%',
  ibovespaEpoca: '112.200',
  ibovespaVariacao: '+15.2%',
  percentualCarteira: '5.8%',
  patrimonio: 'R$ 2.5 bilhões',
  p_vp: '0.95',
  vacancia: '4.5%',
  imoveis: 18,
  gestora: 'XP Asset',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,74', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,76', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'HGLG11': {
  ticker: 'HGLG11',
  nomeCompleto: 'CSHG Logística FII',
  setor: 'Logística',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em ativos logísticos.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/HGLG.png',
  precoAtual: 'R$ 159,72',
  variacao: '-1.3%',
  tendencia: 'down',
  dataEntrada: '28/04/2022',
  precoIniciou: 'R$ 161,80',
  dy: '8,44%',
  precoTeto: 'R$ 146,67',
  viesAtual: 'Compra',
  variacaoHoje: '+0.2%',
  rendProventos: '-1.3%',
  ibovespaEpoca: '112.800',
  ibovespaVariacao: '+14.5%',
  percentualCarteira: '7.2%',
  patrimonio: 'R$ 4.8 bilhões',
  p_vp: '1.09',
  vacancia: '3.2%',
  imoveis: 28,
  gestora: 'CSHG',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 1,12', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 1,08', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'HSML11': {
  ticker: 'HSML11',
  nomeCompleto: 'HSI Malls FII',
  setor: 'Shopping',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em shopping centers.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/HSML.png',
  precoAtual: 'R$ 84,47',
  variacao: '+8.3%',
  tendencia: 'up',
  dataEntrada: '22/04/2022',
  precoIniciou: 'R$ 78,00',
  dy: '8,91%',
  precoTeto: 'R$ 93,60',
  viesAtual: 'Compra',
  variacaoHoje: '+0.5%',
  rendProventos: '+8.3%',
  ibovespaEpoca: '112.500',
  ibovespaVariacao: '+14.8%',
  percentualCarteira: '4.8%',
  patrimonio: 'R$ 1.8 bilhões',
  p_vp: '0.90',
  vacancia: '6.2%',
  imoveis: 15,
  gestora: 'HSI',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,63', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,65', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'VGIP11': {
  ticker: 'VGIP11',
  nomeCompleto: 'Valora GP Investimentos Imobiliários FII',
  setor: 'Híbrido',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário com estratégia híbrida e diversificada.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/VGIP.png',
  precoAtual: 'R$ 81,61',
  variacao: '-15.9%',
  tendencia: 'down',
  dataEntrada: '15/01/2022',
  precoIniciou: 'R$ 96,99',
  dy: '13,67%',
  precoTeto: 'R$ 88,00',
  viesAtual: 'Compra',
  variacaoHoje: '-0.8%',
  rendProventos: '-15.9%',
  ibovespaEpoca: '109.200',
  ibovespaVariacao: '+18.2%',
  percentualCarteira: '4.2%',
  patrimonio: 'R$ 1.8 bilhões',
  p_vp: '0.93',
  vacancia: '7.8%',
  imoveis: 22,
  gestora: 'Valora',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,93', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,89', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'AFHI11': {
  ticker: 'AFHI11',
  nomeCompleto: 'AF Invest Híbrido FII',
  setor: 'Híbrido',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário com estratégia híbrida, investindo em diversos tipos de ativos.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png',
  precoAtual: 'R$ 92,79',
  variacao: '-7.1%',
  tendencia: 'down',
  dataEntrada: '01/05/2022',
  precoIniciou: 'R$ 99,91',
  dy: '13,08%',
  precoTeto: 'R$ 93,20',
  viesAtual: 'Compra',
  variacaoHoje: '+0.2%',
  rendProventos: '-7.1%',
  ibovespaEpoca: '112.800',
  ibovespaVariacao: '+14.2%',
  percentualCarteira: '5.2%',
  patrimonio: 'R$ 2.1 bilhões',
  p_vp: '1.00',
  vacancia: '5.8%',
  imoveis: 28,
  gestora: 'AF Invest',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 1,01', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,98', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'BTLG11': {
  ticker: 'BTLG11',
  nomeCompleto: 'BTG Pactual Logística FII',
  setor: 'Logística',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em ativos logísticos e galpões industriais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png',
  precoAtual: 'R$ 100,20',
  variacao: '-2.9%',
  tendencia: 'down',
  dataEntrada: '02/02/2022',
  precoIniciou: 'R$ 103,14',
  dy: '8,42%',
  precoTeto: 'R$ 104,00',
  viesAtual: 'Neutro',
  variacaoHoje: '+0.1%',
  rendProventos: '-2.9%',
  ibovespaEpoca: '109.800',
  ibovespaVariacao: '+17.5%',
  percentualCarteira: '6.8%',
  patrimonio: 'R$ 3.5 bilhões',
  p_vp: '0.96',
  vacancia: '3.2%',
  imoveis: 42,
  gestora: 'BTG Pactual',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,70', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,72', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'VRTA11': {
  ticker: 'VRTA11',
  nomeCompleto: 'Vértice FII',
  setor: 'Escritórios',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em edifícios comerciais e escritórios.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/VRTA.png',
  precoAtual: 'R$ 81,86',
  variacao: '-7.3%',
  tendencia: 'down',
  dataEntrada: '08/02/2022',
  precoIniciou: 'R$ 88,30',
  dy: '9,66%',
  precoTeto: 'R$ 94,33',
  viesAtual: 'Compra',
  variacaoHoje: '-0.5%',
  rendProventos: '-7.3%',
  ibovespaEpoca: '110.200',
  ibovespaVariacao: '+16.8%',
  percentualCarteira: '4.5%',
  patrimonio: 'R$ 1.5 bilhões',
  p_vp: '0.87',
  vacancia: '12.5%',
  imoveis: 8,
  gestora: 'Vértice',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,66', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,68', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'LVBI11': {
  ticker: 'LVBI11',
  nomeCompleto: 'Loft Valor Brick Imóveis FII',
  setor: 'Residencial',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário focado em imóveis residenciais e habitacionais.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/LVBI.png',
  precoAtual: 'R$ 102,67',
  variacao: '-9.8%',
  tendencia: 'down',
  dataEntrada: '10/01/2022',
  precoIniciou: 'R$ 113,85',
  dy: '7,90%',
  precoTeto: 'R$ 122,51',
  viesAtual: 'Compra',
  variacaoHoje: '+0.3%',
  rendProventos: '-9.8%',
  ibovespaEpoca: '109.500',
  ibovespaVariacao: '+17.8%',
  percentualCarteira: '5.8%',
  patrimonio: 'R$ 2.8 bilhões',
  p_vp: '0.84',
  vacancia: '8.5%',
  imoveis: 145,
  gestora: 'Loft Valor',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,68', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,65', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'HGRU11': {
  ticker: 'HGRU11',
  nomeCompleto: 'CSHG Renda Urbana FII',
  setor: 'Híbrido',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário com foco em renda urbana e ativos diversificados.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/HGRU.png',
  precoAtual: 'R$ 124,94',
  variacao: '+8.6%',
  tendencia: 'up',
  dataEntrada: '20/04/2022',
  precoIniciou: 'R$ 115,00',
  dy: '8,44%',
  precoTeto: 'R$ 138,57',
  viesAtual: 'Compra',
  variacaoHoje: '+1.2%',
  rendProventos: '+8.6%',
  ibovespaEpoca: '111.800',
  ibovespaVariacao: '+15.2%',
  percentualCarteira: '7.2%',
  patrimonio: 'R$ 4.5 bilhões',
  p_vp: '0.90',
  vacancia: '4.8%',
  imoveis: 38,
  gestora: 'CSHG',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,88', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,85', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
'ALZR11': {
  ticker: 'ALZR11',
  nomeCompleto: 'Alianza Trust Renda Imobiliária FII',
  setor: 'Escritórios',
  tipo: 'FII',
  descricao: 'Fundo de investimento imobiliário especializado em edifícios comerciais e escritórios corporativos.',
  avatar: 'https://www.ivalor.com.br/media/emp/logos/ALZR.png',
  precoAtual: 'R$ 100,70',
  variacao: '-13.1%',
  tendencia: 'down',
  dataEntrada: '30/01/2022',
  precoIniciou: 'R$ 115,89',
  dy: '8,44%',
  precoTeto: 'R$ 101,60',
  viesAtual: 'Neutro',
  variacaoHoje: '-0.5%',
  rendProventos: '-13.1%',
  ibovespaEpoca: '109.800',
  ibovespaVariacao: '+17.2%',
  percentualCarteira: '4.8%',
  patrimonio: 'R$ 2.2 bilhões',
  p_vp: '0.99',
  vacancia: '15.2%',
  imoveis: 12,
  gestora: 'Alianza Trust',
  proventos: [
    { tipo: 'Rendimento', valor: 'R$ 0,71', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
    { tipo: 'Rendimento', valor: 'R$ 0,68', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
  ],
  relatorios: [
    { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
    { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
  ]
},
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
