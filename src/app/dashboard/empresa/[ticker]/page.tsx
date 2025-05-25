/* eslint-disable @typescript-eslint/explicit-function-return-type */
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
import Divider from '@mui/material/Divider';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { TrendDown as TrendDownIcon } from '@phosphor-icons/react/dist/ssr/TrendDown';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';

const empresasData: { [key: string]: any } = {
  'PETR4': {
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo, Gás e Biocombustíveis',
    descricao: 'A Petrobras é uma empresa de energia, focada em óleo, gás natural e energia de baixo carbono.',
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
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
      { nome: 'Balanço Q4 2023', data: '2024-02-28', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,15', dataEx: '15/06/2024', dataPagamento: '29/06/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 1,85', dataEx: '15/03/2024', dataPagamento: '28/03/2024', status: 'Pago' },
    ]
  },
  'DEXP3': {
    ticker: 'DEXP3',
    nomeCompleto: 'Dexxos Participações S.A.',
    setor: 'Nanocap/Químico',
    descricao: 'Empresa especializada em soluções químicas inovadoras.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/DEXP.png',
    precoAtual: 'R$ 9,33',
    variacao: '+5.9%',
    tendencia: 'up',
    dataEntrada: '27/01/2023',
    precoIniciou: 'R$ 7,96',
    dy: '5.91%',
    precoTeto: 'R$ 13,10',
    viesAtual: 'Compra',
    variacaoHoje: '+3.2%',
    rendProventos: '+17.2%',
    ibovespaEpoca: '108.500',
    ibovespaVariacao: '+19.1%',
    percentualCarteira: '8.7%',
    marketCap: 'R$ 1,2 bi',
    pl: '12.3',
    pvp: '0.8',
    roe: '15.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-10', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,42', dataEx: '15/05/2024', dataPagamento: '30/05/2024', status: 'Aprovado' },
      { tipo: 'JCP', valor: 'R$ 0,38', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' },
    ]
  },
  'ALOS3': {
    ticker: 'ALOS3',
    nomeCompleto: 'Alos Participações S.A.',
    setor: 'Shoppings',
    descricao: 'Empresa do setor de shoppings com foco em desenvolvimento imobiliário.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    precoAtual: 'R$ 21,67',
    variacao: '-18.8%',
    tendencia: 'down',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    dy: '5,95%',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Compra',
    variacaoHoje: '-1.2%',
    rendProventos: '+12.4%',
    ibovespaEpoca: '118.500',
    ibovespaVariacao: '+22.1%',
    percentualCarteira: '6.2%',
    marketCap: 'R$ 890M',
    pl: '15.2',
    pvp: '1.1',
    roe: '8.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-20', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,29', dataEx: '15/04/2024', dataPagamento: '30/04/2024', status: 'Aprovado' },
    ]
  },
  'TUPY3': {
    ticker: 'TUPY3',
    nomeCompleto: 'Tupy S.A.',
    setor: 'Industrial',
    descricao: 'Líder mundial na fundição de ferro e alumínio para o setor automotivo.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
    precoAtual: 'R$ 18,93',
    variacao: '-7.0%',
    tendencia: 'down',
    dataEntrada: '04/11/2020',
    precoIniciou: 'R$ 20,36',
    dy: '1,71%',
    precoTeto: 'R$ 31,50',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+8.9%',
    ibovespaEpoca: '103.200',
    ibovespaVariacao: '+41.2%',
    percentualCarteira: '4.8%',
    marketCap: 'R$ 2,1 bi',
    pl: '8.7',
    pvp: '0.9',
    roe: '12.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,32', dataEx: '15/05/2024', dataPagamento: '30/05/2024', status: 'Aprovado' },
    ]
  },
  'RECV3': {
    ticker: 'RECV3',
    nomeCompleto: 'Petrorecôncavo S.A.',
    setor: 'Petróleo',
    descricao: 'Empresa de exploração e produção de petróleo e gás natural.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RECV.png',
    precoAtual: 'R$ 13,97',
    variacao: '-37.3%',
    tendencia: 'down',
    dataEntrada: '23/07/2023',
    precoIniciou: 'R$ 22,29',
    dy: '11,07%',
    precoTeto: 'R$ 31,37',
    viesAtual: 'Compra',
    variacaoHoje: '-2.1%',
    rendProventos: '+15.8%',
    ibovespaEpoca: '119.800',
    ibovespaVariacao: '+20.8%',
    percentualCarteira: '7.3%',
    marketCap: 'R$ 3,2 bi',
    pl: '6.2',
    pvp: '0.7',
    roe: '22.4%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-10', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,55', dataEx: '15/06/2024', dataPagamento: '30/06/2024', status: 'Aprovado' },
    ]
  },
  'CSED3': {
    ticker: 'CSED3',
    nomeCompleto: 'Cruzeiro do Sul Educacional S.A.',
    setor: 'Educação',
    descricao: 'Grupo educacional com foco em ensino superior e técnico.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSED.png',
    precoAtual: 'R$ 5,12',
    variacao: '+14.0%',
    tendencia: 'up',
    dataEntrada: '10/12/2023',
    precoIniciou: 'R$ 4,49',
    dy: '4,96%',
    precoTeto: 'R$ 8,35',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+18.7%',
    ibovespaEpoca: '125.800',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '3.2%',
    marketCap: 'R$ 1,8 bi',
    pl: '9.8',
    pvp: '1.4',
    roe: '14.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-18', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,25', dataEx: '15/07/2024', dataPagamento: '30/07/2024', status: 'Aprovado' },
    ]
  },
  'PRIO3': {
    ticker: 'PRIO3',
    nomeCompleto: 'PetroRio S.A.',
    setor: 'Petróleo',
    descricao: 'Empresa independente de exploração e produção de petróleo no Brasil.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/PRIO.png',
    precoAtual: 'R$ 38,80',
    variacao: '+66.2%',
    tendencia: 'up',
    dataEntrada: '04/08/2022',
    precoIniciou: 'R$ 23,35',
    dy: '0,18%',
    precoTeto: 'R$ 48,70',
    viesAtual: 'Compra',
    variacaoHoje: '+2.8%',
    rendProventos: '+72.5%',
    ibovespaEpoca: '107.500',
    ibovespaVariacao: '+35.1%',
    percentualCarteira: '9.1%',
    marketCap: 'R$ 5,1 bi',
    pl: '4.8',
    pvp: '1.3',
    roe: '28.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-25', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,07', dataEx: '15/07/2024', dataPagamento: '30/07/2024', status: 'Aprovado' },
    ]
  },
  'RAPT4': {
    ticker: 'RAPT4',
    nomeCompleto: 'Randon S.A. Implementos e Participações',
    setor: 'Industrial',
    descricao: 'Fabricante de implementos rodoviários, peças e componentes automotivos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RAPT.png',
    precoAtual: 'R$ 8,25',
    variacao: '-50.5%',
    tendencia: 'down',
    dataEntrada: '16/09/2021',
    precoIniciou: 'R$ 16,69',
    dy: '4,80%',
    precoTeto: 'R$ 14,00',
    viesAtual: 'Compra',
    variacaoHoje: '-0.8%',
    rendProventos: '+8.2%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '2.8%',
    marketCap: 'R$ 1,4 bi',
    pl: '11.5',
    pvp: '0.6',
    roe: '5.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-12', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,40', dataEx: '15/08/2024', dataPagamento: '30/08/2024', status: 'Aprovado' },
    ]
  },
  'SMTO3': {
    ticker: 'SMTO3',
    nomeCompleto: 'São Martinho S.A.',
    setor: 'Sucroenergético',
    descricao: 'Produtora de açúcar, etanol e energia elétrica a partir da cana-de-açúcar.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SMTO.png',
    precoAtual: 'R$ 20,97',
    variacao: '-25.6%',
    tendencia: 'down',
    dataEntrada: '10/11/2022',
    precoIniciou: 'R$ 28,20',
    dy: '3,51%',
    precoTeto: 'R$ 35,00',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+5.8%',
    ibovespaEpoca: '117.300',
    ibovespaVariacao: '+24.2%',
    percentualCarteira: '5.1%',
    marketCap: 'R$ 3,8 bi',
    pl: '8.9',
    pvp: '0.9',
    roe: '10.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-22', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,74', dataEx: '15/09/2024', dataPagamento: '30/09/2024', status: 'Aprovado' },
    ]
  },
  'FESA4': {
    ticker: 'FESA4',
    nomeCompleto: 'Ferbasa S.A.',
    setor: 'Commodities',
    descricao: 'Produtora de ferro-ligas e produtos siderúrgicos especiais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FESA.png',
    precoAtual: 'R$ 6,92',
    variacao: '+54.1%',
    tendencia: 'up',
    dataEntrada: '11/12/2020',
    precoIniciou: 'R$ 4,49',
    dy: '5,68%',
    precoTeto: 'R$ 14,07',
    viesAtual: 'Compra',
    variacaoHoje: '+3.2%',
    rendProventos: '+68.4%',
    ibovespaEpoca: '119.000',
    ibovespaVariacao: '+22.5%',
    percentualCarteira: '4.2%',
    marketCap: 'R$ 780M',
    pl: '6.8',
    pvp: '0.7',
    roe: '12.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-08', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,39', dataEx: '15/10/2024', dataPagamento: '30/10/2024', status: 'Aprovado' },
    ]
  },
  'UNIP6': {
    ticker: 'UNIP6',
    nomeCompleto: 'Unipar Carbocloro S.A.',
    setor: 'Químico',
    descricao: 'Produtora de cloro-soda e produtos petroquímicos básicos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/UNIP.png',
    precoAtual: 'R$ 61,00',
    variacao: '+43.8%',
    tendencia: 'up',
    dataEntrada: '08/12/2020',
    precoIniciou: 'R$ 42,41',
    dy: '6,77%',
    precoTeto: 'R$ 117,90',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+55.2%',
    ibovespaEpoca: '118.800',
    ibovespaVariacao: '+22.7%',
    percentualCarteira: '8.9%',
    marketCap: 'R$ 15,2 bi',
    pl: '7.2',
    pvp: '1.8',
    roe: '24.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-28', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 4,13', dataEx: '15/11/2024', dataPagamento: '30/11/2024', status: 'Aprovado' },
    ]
  },
  'FLRY3': {
    ticker: 'FLRY3',
    nomeCompleto: 'Fleury S.A.',
    setor: 'Saúde',
    descricao: 'Rede de medicina diagnóstica e prestação de serviços de saúde.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/FLRY.png',
    precoAtual: 'R$ 12,59',
    variacao: '-13.9%',
    tendencia: 'down',
    dataEntrada: '19/05/2022',
    precoIniciou: 'R$ 14,63',
    dy: '5,20%',
    precoTeto: 'R$ 17,50',
    viesAtual: 'Compra',
    variacaoHoje: '-0.5%',
    rendProventos: '+7.8%',
    ibovespaEpoca: '113.500',
    ibovespaVariacao: '+28.4%',
    percentualCarteira: '3.8%',
    marketCap: 'R$ 6,8 bi',
    pl: '18.5',
    pvp: '1.5',
    roe: '8.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-14', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,65', dataEx: '15/12/2024', dataPagamento: '30/12/2024', status: 'Aprovado' },
    ]
  },
  'EZTC3': {
    ticker: 'EZTC3',
    nomeCompleto: 'Eztec Empreendimentos e Participações S.A.',
    setor: 'Construção Civil',
    descricao: 'Construtora e incorporadora imobiliária focada no segmento residencial.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EZTC.png',
    precoAtual: 'R$ 13,17',
    variacao: '-41.7%',
    tendencia: 'down',
    dataEntrada: '07/10/2022',
    precoIniciou: 'R$ 22,61',
    dy: '7,83%',
    precoTeto: 'R$ 30,00',
    viesAtual: 'Compra',
    variacaoHoje: '-1.2%',
    rendProventos: '+12.8%',
    ibovespaEpoca: '115.200',
    ibovespaVariacao: '+26.5%',
    percentualCarteira: '2.9%',
    marketCap: 'R$ 2,1 bi',
    pl: '9.8',
    pvp: '0.8',
    roe: '8.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-16', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,03', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },
  'JALL3': {
    ticker: 'JALL3',
    nomeCompleto: 'Jalles Machado S.A.',
    setor: 'Sucroenergético',
    descricao: 'Produtora de açúcar, etanol e energia elétrica derivados da cana-de-açúcar.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/JALL.png',
    precoAtual: 'R$ 4,32',
    variacao: '-48.3%',
    tendencia: 'down',
    dataEntrada: '17/06/2022',
    precoIniciou: 'R$ 8,36',
    dy: '1,15%',
    precoTeto: 'R$ 11,90',
    viesAtual: 'Compra',
    variacaoHoje: '+0.5%',
    rendProventos: '+3.2%',
    ibovespaEpoca: '102.800',
    ibovespaVariacao: '+41.8%',
    percentualCarteira: '1.8%',
    marketCap: 'R$ 890M',
    pl: '12.8',
    pvp: '0.5',
    roe: '4.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-11', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,05', dataEx: '15/02/2025', dataPagamento: '28/02/2025', status: 'Aprovado' },
    ]
  },
  'YDUQ3': {
    ticker: 'YDUQ3',
    nomeCompleto: 'Yduqs Participações S.A.',
    setor: 'Educação',
    descricao: 'Grupo educacional com foco em ensino superior presencial e a distância.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/YDUQ.png',
    precoAtual: 'R$ 15,54',
    variacao: '-42.8%',
    tendencia: 'down',
    dataEntrada: '11/11/2020',
    precoIniciou: 'R$ 27,16',
    dy: '2,64%',
    precoTeto: 'R$ 15,00',
    viesAtual: 'Compra',
    variacaoHoje: '-0.8%',
    rendProventos: '+8.5%',
    ibovespaEpoca: '110.500',
    ibovespaVariacao: '+31.8%',
    percentualCarteira: '3.5%',
    marketCap: 'R$ 5,2 bi',
    pl: '14.2',
    pvp: '1.1',
    roe: '7.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-19', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,41', dataEx: '15/03/2025', dataPagamento: '30/03/2025', status: 'Aprovado' },
    ]
  },
  'SIMH3': {
    ticker: 'SIMH3',
    nomeCompleto: 'Simpar S.A.',
    setor: 'Logística',
    descricao: 'Holding com participações em empresas de logística e movimentação de cargas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SIMH.png',
    precoAtual: 'R$ 4,70',
    variacao: '-41.1%',
    tendencia: 'down',
    dataEntrada: '03/12/2020',
    precoIniciou: 'R$ 7,98',
    dy: '0,00%',
    precoTeto: 'R$ 10,79',
    viesAtual: 'Compra',
    variacaoHoje: '+0.2%',
    rendProventos: '+2.1%',
    ibovespaEpoca: '119.200',
    ibovespaVariacao: '+22.2%',
    percentualCarteira: '2.1%',
    marketCap: 'R$ 3,1 bi',
    pl: '25.8',
    pvp: '0.9',
    roe: '3.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-13', url: '#' },
    ],
    proventos: [
      { tipo: 'JCP', valor: 'R$ 0,00', dataEx: '15/04/2025', dataPagamento: '30/04/2025', status: 'Aprovado' },
    ]
  },
  'ALUP11': {
    ticker: 'ALUP11',
    nomeCompleto: 'Alupar Investimento S.A.',
    setor: 'Energia',
    descricao: 'Empresa de transmissão de energia elétrica e geração de energia renovável.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALUP.png',
    precoAtual: 'R$ 30,53',
    variacao: '+25.1%',
    tendencia: 'up',
    dataEntrada: '25/11/2020',
    precoIniciou: 'R$ 24,40',
    dy: '4,46%',
    precoTeto: 'R$ 29,00',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+38.7%',
    ibovespaEpoca: '108.800',
    ibovespaVariacao: '+34.2%',
    percentualCarteira: '7.8%',
    marketCap: 'R$ 12,8 bi',
    pl: '12.5',
    pvp: '1.4',
    roe: '11.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-26', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,36', dataEx: '15/05/2025', dataPagamento: '30/05/2025', status: 'Aprovado' },
    ]
  },
  'NEOE3': {
    ticker: 'NEOE3',
    nomeCompleto: 'Neoenergia S.A.',
    setor: 'Energia',
    descricao: 'Empresa de distribuição de energia elétrica com operações no Nordeste e Sudeste.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/NEOE.png',
    precoAtual: 'R$ 24,40',
    variacao: '+53.0%',
    tendencia: 'up',
    dataEntrada: '04/05/2021',
    precoIniciou: 'R$ 15,94',
    dy: '4,29%',
    precoTeto: 'R$ 21,00',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+68.8%',
    ibovespaEpoca: '120.500',
    ibovespaVariacao: '+20.8%',
    percentualCarteira: '6.5%',
    marketCap: 'R$ 25,8 bi',
    pl: '9.8',
    pvp: '1.2',
    roe: '12.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-27', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,05', dataEx: '15/06/2025', dataPagamento: '30/06/2025', status: 'Aprovado' },
    ]
  },
  'KEPL3': {
    ticker: 'KEPL3',
    nomeCompleto: 'Kepler Weber S.A.',
    setor: 'Agricultura',
    descricao: 'Fabricante de equipamentos para armazenagem de grãos e beneficiamento agrícola.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KEPL.png',
    precoAtual: 'R$ 7,65',
    variacao: '-16.5%',
    tendencia: 'down',
    dataEntrada: '21/12/2020',
    precoIniciou: 'R$ 9,16',
    dy: '7,76%',
    precoTeto: 'R$ 11,00',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+12.4%',
    ibovespaEpoca: '119.000',
    ibovespaVariacao: '+22.5%',
    percentualCarteira: '3.2%',
    marketCap: 'R$ 680M',
    pl: '11.2',
    pvp: '0.8',
    roe: '7.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,59', dataEx: '15/07/2024', dataPagamento: '30/07/2024', status: 'Aprovado' },
    ]
  },
  'EVEN3': {
    ticker: 'EVEN3',
    nomeCompleto: 'Even Construtora e Incorporadora S.A.',
    setor: 'Construção Civil',
    descricao: 'Construtora e incorporadora imobiliária focada em empreendimentos residenciais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EVEN.png',
    precoAtual: 'R$ 6,57',
    variacao: '+26.8%',
    tendencia: 'up',
    dataEntrada: '06/06/2022',
    precoIniciou: 'R$ 5,18',
    dy: '19,57%',
    precoTeto: 'R$ 8,50',
    viesAtual: 'Compra',
    variacaoHoje: '+3.2%',
    rendProventos: '+45.8%',
    ibovespaEpoca: '102.500',
    ibovespaVariacao: '+42.1%',
    percentualCarteira: '4.1%',
    marketCap: 'R$ 1,2 bi',
    pl: '8.5',
    pvp: '0.6',
    roe: '7.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-20', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,29', dataEx: '15/08/2024', dataPagamento: '30/08/2024', status: 'Aprovado' },
    ]
  },
  'WIZC3': {
    ticker: 'WIZC3',
    nomeCompleto: 'Wiz Soluções e Corretagem de Seguros S.A.',
    setor: 'Seguros',
    descricao: 'Corretora de seguros e soluções em gestão de riscos corporativos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/WIZC.png',
    precoAtual: 'R$ 7,00',
    variacao: '-36.0%',
    tendencia: 'down',
    dataEntrada: '30/04/2021',
    precoIniciou: 'R$ 10,94',
    dy: '4,21%',
    precoTeto: 'R$ 12,00',
    viesAtual: 'Compra',
    variacaoHoje: '-1.5%',
    rendProventos: '+8.2%',
    ibovespaEpoca: '121.000',
    ibovespaVariacao: '+20.4%',
    percentualCarteira: '2.8%',
    marketCap: 'R$ 1,8 bi',
    pl: '18.5',
    pvp: '1.2',
    roe: '6.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-18', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,29', dataEx: '15/09/2024', dataPagamento: '30/09/2024', status: 'Aprovado' },
    ]
  },
  'RANI3': {
    ticker: 'RANI3',
    nomeCompleto: 'Irani Papel e Embalagem S.A.',
    setor: 'Papel',
    descricao: 'Produtora de papel e embalagens de papelão ondulado.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RANI.png',
    precoAtual: 'R$ 7,63',
    variacao: '+64.1%',
    tendencia: 'up',
    dataEntrada: '19/11/2020',
    precoIniciou: 'R$ 4,65',
    dy: '7,61%',
    precoTeto: 'R$ 10,57',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+78.5%',
    ibovespaEpoca: '107.800',
    ibovespaVariacao: '+35.2%',
    percentualCarteira: '5.2%',
    marketCap: 'R$ 1,1 bi',
    pl: '9.8',
    pvp: '0.9',
    roe: '9.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-22', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,58', dataEx: '15/10/2024', dataPagamento: '30/10/2024', status: 'Aprovado' },
    ]
  },
  'SHUL4': {
    ticker: 'SHUL4',
    nomeCompleto: 'Schulz S.A.',
    setor: 'Industrial',
    descricao: 'Fabricante de compressores de ar e equipamentos pneumáticos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SHUL.png',
    precoAtual: 'R$ 5,38',
    variacao: '+55.0%',
    tendencia: 'up',
    dataEntrada: '04/03/2021',
    precoIniciou: 'R$ 3,47',
    dy: '5,00%',
    precoTeto: 'R$ 5,45',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+68.9%',
    ibovespaEpoca: '116.500',
    ibovespaVariacao: '+25.1%',
    percentualCarteira: '3.8%',
    marketCap: 'R$ 420M',
    pl: '12.8',
    pvp: '1.1',
    roe: '8.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-14', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,27', dataEx: '15/11/2024', dataPagamento: '30/11/2024', status: 'Aprovado' },
    ]
  },
  'RSUL4': {
    ticker: 'RSUL4',
    nomeCompleto: 'Rio Grande Energia S.A.',
    setor: 'Nanocap/Industrial',
    descricao: 'Distribuidora de energia elétrica com operações no Rio Grande do Sul.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RSUL.png',
    precoAtual: 'R$ 64,95',
    variacao: '-23.6%',
    tendencia: 'down',
    dataEntrada: '06/08/2021',
    precoIniciou: 'R$ 85,00',
    dy: '3,55%',
    precoTeto: 'R$ 100,00',
    viesAtual: 'Compra',
    variacaoHoje: '-0.8%',
    rendProventos: '+8.5%',
    ibovespaEpoca: '124.200',
    ibovespaVariacao: '+17.2%',
    percentualCarteira: '6.8%',
    marketCap: 'R$ 2,8 bi',
    pl: '15.2',
    pvp: '1.8',
    roe: '11.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-19', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,31', dataEx: '15/12/2024', dataPagamento: '30/12/2024', status: 'Aprovado' },
    ]
  },
  'TASA4': {
    ticker: 'TASA4',
    nomeCompleto: 'Taurus Armas S.A.',
    setor: 'Bens Industriais',
    descricao: 'Fabricante de armas de fogo e produtos de defesa e segurança.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TASA.png',
    precoAtual: 'R$ 7,78',
    variacao: '-54.6%',
    tendencia: 'down',
    dataEntrada: '27/06/2022',
    precoIniciou: 'R$ 17,14',
    dy: '2,90%',
    precoTeto: 'R$ 25,50',
    viesAtual: 'Compra',
    variacaoHoje: '-2.1%',
    rendProventos: '+5.8%',
    ibovespaEpoca: '95.800',
    ibovespaVariacao: '+52.1%',
    percentualCarteira: '2.1%',
    marketCap: 'R$ 880M',
    pl: '28.5',
    pvp: '0.7',
    roe: '2.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-16', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,23', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },
  'TRIS3': {
    ticker: 'TRIS3',
    nomeCompleto: 'Trisul S.A.',
    setor: 'Construção Civil',
    descricao: 'Construtora e incorporadora imobiliária com foco no segmento econômico.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/TRIS.png',
    precoAtual: 'R$ 7,16',
    variacao: '+39.0%',
    tendencia: 'up',
    dataEntrada: '25/02/2022',
    precoIniciou: 'R$ 5,15',
    dy: '3,59%',
    precoTeto: 'R$ 5,79',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+45.2%',
    ibovespaEpoca: '112.800',
    ibovespaVariacao: '+29.1%',
    percentualCarteira: '3.1%',
    marketCap: 'R$ 1,5 bi',
    pl: '14.2',
    pvp: '0.9',
    roe: '6.3%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-21', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,26', dataEx: '15/02/2025', dataPagamento: '28/02/2025', status: 'Aprovado' },
    ]
  },
  'CGRA4': {
    ticker: 'CGRA4',
    nomeCompleto: 'Granja Faria S.A.',
    setor: 'Nanocap/Consumo Cíclico',
    descricao: 'Produtora de ovos e derivados avícolas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CGRA.png',
    precoAtual: 'R$ 26,42',
    variacao: '-8.9%',
    tendencia: 'down',
    dataEntrada: '09/03/2023',
    precoIniciou: 'R$ 29,00',
    dy: '10,61%',
    precoTeto: 'R$ 42,50',
    viesAtual: 'Compra',
    variacaoHoje: '+2.8%',
    rendProventos: '+18.5%',
    ibovespaEpoca: '125.500',
    ibovespaVariacao: '+16.1%',
    percentualCarteira: '4.8%',
    marketCap: 'R$ 1,8 bi',
    pl: '8.5',
    pvp: '1.2',
    roe: '14.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-25', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,80', dataEx: '15/03/2025', dataPagamento: '30/03/2025', status: 'Aprovado' },
    ]
  },
  'ROMI3': {
    ticker: 'ROMI3',
    nomeCompleto: 'Indústrias Romi S.A.',
    setor: 'Bens Industriais',
    descricao: 'Fabricante de máquinas-ferramenta e equipamentos industriais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ROMI.png',
    precoAtual: 'R$ 9,24',
    variacao: '-23.1%',
    tendencia: 'down',
    dataEntrada: '19/07/2022',
    precoIniciou: 'R$ 12,02',
    dy: '8,00%',
    precoTeto: 'R$ 19,40',
    viesAtual: 'Compra',
    variacaoHoje: '+0.5%',
    rendProventos: '+12.8%',
    ibovespaEpoca: '104.500',
    ibovespaVariacao: '+39.4%',
    percentualCarteira: '2.9%',
    marketCap: 'R$ 1,1 bi',
    pl: '11.5',
    pvp: '0.8',
    roe: '7.0%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-17', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,74', dataEx: '15/04/2025', dataPagamento: '30/04/2025', status: 'Aprovado' },
    ]
  },
  'POSI3': {
    ticker: 'POSI3',
    nomeCompleto: 'Positivo Tecnologia S.A.',
    setor: 'Tecnologia',
    descricao: 'Desenvolvedora de soluções educacionais e tecnológicas.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/POSI.png',
    precoAtual: 'R$ 4,96',
    variacao: '-42.8%',
    tendencia: 'down',
    dataEntrada: '22/04/2022',
    precoIniciou: 'R$ 8,67',
    dy: '6,86%',
    precoTeto: 'R$ 10,16',
    viesAtual: 'Compra',
    variacaoHoje: '-1.2%',
    rendProventos: '+12.5%',
    ibovespaEpoca: '118.200',
    ibovespaVariacao: '+23.2%',
    percentualCarteira: '2.2%',
    marketCap: 'R$ 780M',
    pl: '15.8',
    pvp: '0.9',
    roe: '5.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-12', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,34', dataEx: '15/05/2025', dataPagamento: '30/05/2025', status: 'Aprovado' },
    ]
  },
  'CEAB3': {
    ticker: 'CEAB3',
    nomeCompleto: 'C&A Modas S.A.',
    setor: 'Consumo Cíclico',
    descricao: 'Rede de lojas de roupas e acessórios de moda.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CEAB.png',
    precoAtual: 'R$ 16,74',
    variacao: '+467.5%',
    tendencia: 'up',
    dataEntrada: '04/05/2023',
    precoIniciou: 'R$ 2,95',
    dy: '0,00%',
    precoTeto: 'R$ 10,94',
    viesAtual: 'Compra',
    variacaoHoje: '+8.2%',
    rendProventos: '+467.5%',
    ibovespaEpoca: '124.800',
    ibovespaVariacao: '+16.8%',
    percentualCarteira: '7.2%',
    marketCap: 'R$ 3,2 bi',
    pl: '18.5',
    pvp: '2.1',
    roe: '11.3%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-28', url: '#' },
    ],
    proventos: [
      { tipo: 'JCP', valor: 'R$ 0,00', dataEx: '15/06/2025', dataPagamento: '30/06/2025', status: 'Aprovado' },
    ]
  },
  'LOGG3': {
    ticker: 'LOGG3',
    nomeCompleto: 'Log Commercial Properties S.A.',
    setor: 'Logística',
    descricao: 'Desenvolvimento e locação de condomínios logísticos e galpões industriais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LOGG.png',
    precoAtual: 'R$ 21,27',
    variacao: '+12.2%',
    tendencia: 'up',
    dataEntrada: '25/11/2022',
    precoIniciou: 'R$ 18,96',
    dy: '2,99%',
    precoTeto: 'R$ 25,00',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+18.5%',
    ibovespaEpoca: '117.500',
    ibovespaVariacao: '+24.0%',
    percentualCarteira: '5.5%',
    marketCap: 'R$ 4,2 bi',
    pl: '22.8',
    pvp: '1.1',
    roe: '4.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-23', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,64', dataEx: '15/07/2025', dataPagamento: '30/07/2025', status: 'Aprovado' },
    ]
  },
  'AGRO3': {
    ticker: 'AGRO3',
    nomeCompleto: 'BrasilAgro S.A.',
    setor: 'Agricultura',
    descricao: 'Empresa de aquisição, desenvolvimento e venda de propriedades rurais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AGRO.png',
    precoAtual: 'R$ 21,18',
    variacao: '-7.9%',
    tendencia: 'down',
    dataEntrada: '09/10/2020',
    precoIniciou: 'R$ 23,00',
    dy: '6,59%',
    precoTeto: 'R$ 31,80',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+15.2%',
    ibovespaEpoca: '104.200',
    ibovespaVariacao: '+39.8%',
    percentualCarteira: '4.5%',
    marketCap: 'R$ 2,1 bi',
    pl: '12.5',
    pvp: '0.7',
    roe: '5.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-24', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,40', dataEx: '15/08/2025', dataPagamento: '30/08/2025', status: 'Aprovado' },
    ]
  },
  'LEVE3': {
    ticker: 'LEVE3',
    nomeCompleto: 'Mahle-Metal Leve S.A.',
    setor: 'Automotivo',
    descricao: 'Fabricante de componentes automotivos, especializada em pistões, anéis e blocos de motor.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/LEVE.png',
    precoAtual: 'R$ 27,74',
    variacao: '+8.14%',
    tendencia: 'up',
    dataEntrada: '06/12/2024',
    precoIniciou: 'R$ 30,69',
    dy: '12.00%',
    precoTeto: 'R$ 35,27',
    viesAtual: 'Compra',
    variacaoHoje: '+1.2%',
    rendProventos: '+8.5%',
    ibovespaEpoca: '130.500',
    ibovespaVariacao: '+11.8%',
    percentualCarteira: '4.2%',
    marketCap: 'R$ 3,7 bi',
    pl: '8.5',
    pvp: '1.1',
    roe: '13.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 3,33', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },
  'EGIE3': {
    ticker: 'EGIE3',
    nomeCompleto: 'Engie Brasil Energia S.A.',
    setor: 'Energia',
    descricao: 'Empresa de geração e comercialização de energia elétrica com foco em fontes renováveis.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/EGIE.png',
    precoAtual: 'R$ 43,13',
    variacao: '+6.29%',
    tendencia: 'up',
    dataEntrada: '31/03/2022',
    precoIniciou: 'R$ 40,45',
    dy: '9.10%',
    precoTeto: 'R$ 50,34',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+15.8%',
    ibovespaEpoca: '117.200',
    ibovespaVariacao: '+24.5%',
    percentualCarteira: '5.8%',
    marketCap: 'R$ 33,2 bi',
    pl: '9.8',
    pvp: '1.3',
    roe: '13.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-20', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 3,92', dataEx: '15/02/2025', dataPagamento: '28/02/2025', status: 'Aprovado' },
    ]
  },
  'VALE3': {
    ticker: 'VALE3',
    nomeCompleto: 'Vale S.A.',
    setor: 'Mineração',
    descricao: 'Uma das maiores empresas de mineração do mundo, produtora de minério de ferro e níquel.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VALE.png',
    precoAtual: 'R$ 68,61',
    variacao: '+11.27%',
    tendencia: 'up',
    dataEntrada: '17/07/2023',
    precoIniciou: 'R$ 54,32',
    dy: '8.10%',
    precoTeto: 'R$ 78,20',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+23.5%',
    ibovespaEpoca: '119.800',
    ibovespaVariacao: '+21.5%',
    percentualCarteira: '8.9%',
    marketCap: 'R$ 342,5 bi',
    pl: '6.2',
    pvp: '0.9',
    roe: '14.8%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-25', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 5,56', dataEx: '15/03/2025', dataPagamento: '30/03/2025', status: 'Aprovado' },
    ]
  },
  'BBAS3': {
    ticker: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    setor: 'Bancos',
    descricao: 'Instituição financeira brasileira oferecendo serviços bancários completos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBAS.png',
    precoAtual: 'R$ 15,60',
    variacao: '+9.62%',
    tendencia: 'up',
    dataEntrada: '20/10/2021',
    precoIniciou: 'R$ 24,42',
    dy: '10.20%',
    precoTeto: 'R$ 30,10',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+18.7%',
    ibovespaEpoca: '109.500',
    ibovespaVariacao: '+33.2%',
    percentualCarteira: '6.4%',
    marketCap: 'R$ 145,8 bi',
    pl: '5.8',
    pvp: '0.7',
    roe: '12.1%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-18', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,59', dataEx: '15/04/2025', dataPagamento: '30/04/2025', status: 'Aprovado' },
    ]
  },
  'BRSR6': {
    ticker: 'BRSR6',
    nomeCompleto: 'Banrisul S.A.',
    setor: 'Bancos',
    descricao: 'Banco público estadual do Rio Grande do Sul.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BRSR.png',
    precoAtual: 'R$ 10,60',
    variacao: '+4.92%',
    tendencia: 'up',
    dataEntrada: '12/05/2022',
    precoIniciou: 'R$ 12,22',
    dy: '9%',
    precoTeto: 'R$ 15,10',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+8.8%',
    ibovespaEpoca: '108.200',
    ibovespaVariacao: '+34.8%',
    percentualCarteira: '3.1%',
    marketCap: 'R$ 11,2 bi',
    pl: '7.8',
    pvp: '0.8',
    roe: '10.3%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-12', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,95', dataEx: '15/05/2025', dataPagamento: '30/05/2025', status: 'Aprovado' },
    ]
  },
  'SAPR4': {
    ticker: 'SAPR4',
    nomeCompleto: 'Sanepar S.A.',
    setor: 'Saneamento',
    descricao: 'Companhia de saneamento do Paraná, fornecendo água e tratamento de esgoto.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SAPR.png',
    precoAtual: 'R$ 3,81',
    variacao: '+5.30%',
    tendencia: 'up',
    dataEntrada: '27/10/2021',
    precoIniciou: 'R$ 6,40',
    dy: '7.00%',
    precoTeto: 'R$ 6,00',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+12.5%',
    ibovespaEpoca: '106.800',
    ibovespaVariacao: '+37.2%',
    percentualCarteira: '2.8%',
    marketCap: 'R$ 12,5 bi',
    pl: '12.8',
    pvp: '0.6',
    roe: '4.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-14', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,27', dataEx: '15/07/2025', dataPagamento: '30/07/2025', status: 'Aprovado' },
    ]
  },
  'ELET3': {
    ticker: 'ELET3',
    nomeCompleto: 'Centrais Elétricas Brasileiras S.A. - Eletrobras',
    setor: 'Energia',
    descricao: 'Maior empresa de energia elétrica da América Latina.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ELET.png',
    precoAtual: 'R$ 40,41',
    variacao: '+1.12%',
    tendencia: 'up',
    dataEntrada: '20/11/2023',
    precoIniciou: 'R$ 40,45',
    dy: '6.00%',
    precoTeto: 'R$ 58,27',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+8.5%',
    ibovespaEpoca: '127.800',
    ibovespaVariacao: '+13.8%',
    percentualCarteira: '7.2%',
    marketCap: 'R$ 178,5 bi',
    pl: '11.2',
    pvp: '1.4',
    roe: '12.5%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-22', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,43', dataEx: '15/08/2025', dataPagamento: '30/08/2025', status: 'Aprovado' },
    ]
  },
  'ABCB4': {
    ticker: 'ABCB4',
    nomeCompleto: 'Banco ABC Brasil S.A.',
    setor: 'Bancos',
    descricao: 'Banco de atacado focado em corporate banking e investment banking.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ABCB.png',
    precoAtual: 'R$ 17,87',
    variacao: '+7.42%',
    tendencia: 'up',
    dataEntrada: '19/06/2023',
    precoIniciou: 'R$ 21,41',
    dy: '9.00%',
    precoTeto: 'R$ 22,30',
    viesAtual: 'Compra',
    variacaoHoje: '+1.2%',
    rendProventos: '+12.8%',
    ibovespaEpoca: '118.500',
    ibovespaVariacao: '+22.8%',
    percentualCarteira: '3.8%',
    marketCap: 'R$ 3,9 bi',
    pl: '8.5',
    pvp: '0.9',
    roe: '10.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-16', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,61', dataEx: '15/09/2025', dataPagamento: '30/09/2025', status: 'Aprovado' },
    ]
  },
  'CSMG3': {
    ticker: 'CSMG3',
    nomeCompleto: 'Copasa Saneamento de Minas Gerais S.A.',
    setor: 'Saneamento',
    descricao: 'Companhia de saneamento de Minas Gerais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CSMG.png',
    precoAtual: 'R$ 13,66',
    variacao: '+15.99%',
    tendencia: 'up',
    dataEntrada: '19/08/2022',
    precoIniciou: 'R$ 24,28',
    dy: '8.00%',
    precoTeto: 'R$ 19,16',
    viesAtual: 'Compra',
    variacaoHoje: '+2.8%',
    rendProventos: '+18.5%',
    ibovespaEpoca: '113.800',
    ibovespaVariacao: '+28.1%',
    percentualCarteira: '4.2%',
    marketCap: 'R$ 6,8 bi',
    pl: '9.5',
    pvp: '1.1',
    roe: '11.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-19', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,09', dataEx: '15/10/2025', dataPagamento: '30/10/2025', status: 'Aprovado' },
    ]
  },
  'BBSE3': {
    ticker: 'BBSE3',
    nomeCompleto: 'BB Seguridade Participações S.A.',
    setor: 'Financeiro',
    descricao: 'Holding de participações em empresas de seguros, previdência e capitalização.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BBSE.png',
    precoAtual: 'R$ 25,48',
    variacao: '+7.62%',
    tendencia: 'up',
    dataEntrada: '30/06/2022',
    precoIniciou: 'R$ 38,10',
    dy: '10.10%',
    precoTeto: 'R$ 33,20',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+15.8%',
    ibovespaEpoca: '98.500',
    ibovespaVariacao: '+47.8%',
    percentualCarteira: '5.1%',
    marketCap: 'R$ 51,2 bi',
    pl: '11.2',
    pvp: '2.1',
    roe: '18.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-21', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,57', dataEx: '15/11/2025', dataPagamento: '30/11/2025', status: 'Aprovado' },
    ]
  },
  'ISAE4': {
    ticker: 'ISAE4',
    nomeCompleto: 'Isa Cteep S.A.',
    setor: 'Energia',
    descricao: 'Empresa de transmissão de energia elétrica.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ISAE.png',
    precoAtual: 'R$ 24,00',
    variacao: '+9.07%',
    tendencia: 'up',
    dataEntrada: '22/10/2021',
    precoIniciou: 'R$ 23,50',
    dy: '8.80%',
    precoTeto: 'R$ 26,50',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+18.2%',
    ibovespaEpoca: '110.800',
    ibovespaVariacao: '+31.5%',
    percentualCarteira: '4.8%',
    marketCap: 'R$ 16,8 bi',
    pl: '14.2',
    pvp: '1.3',
    roe: '9.2%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-17', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 2,11', dataEx: '15/12/2025', dataPagamento: '30/12/2025', status: 'Aprovado' },
    ]
  },
  'VIVT3': {
    ticker: 'VIVT3',
    nomeCompleto: 'Telefônica Brasil S.A.',
    setor: 'Telecom',
    descricao: 'Empresa de telecomunicações oferecendo serviços de telefonia, internet e TV.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VIVT.png',
    precoAtual: 'R$ 54,60',
    variacao: '+3.13%',
    tendencia: 'up',
    dataEntrada: '05/04/2022',
    precoIniciou: 'R$ 27,69',
    dy: '8.20%',
    precoTeto: 'R$ 29,00',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+105.8%',
    ibovespaEpoca: '115.500',
    ibovespaVariacao: '+26.2%',
    percentualCarteira: '6.8%',
    marketCap: 'R$ 93,2 bi',
    pl: '18.5',
    pvp: '1.8',
    roe: '9.7%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-24', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 4,48', dataEx: '15/01/2026', dataPagamento: '30/01/2026', status: 'Aprovado' },
    ]
  },
  'KLBN11': {
    ticker: 'KLBN11',
    nomeCompleto: 'Klabin S.A.',
    setor: 'Papel e Celulose',
    descricao: 'Produtora integrada de papel e celulose.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KLBN.png',
    precoAtual: 'R$ 21,94',
    variacao: '+4.55%',
    tendencia: 'up',
    dataEntrada: '09/06/2022',
    precoIniciou: 'R$ 19,23',
    dy: '5.70%',
    precoTeto: 'R$ 27,68',
    viesAtual: 'Compra',
    variacaoHoje: '+1.2%',
    rendProventos: '+18.8%',
    ibovespaEpoca: '102.800',
    ibovespaVariacao: '+41.8%',
    percentualCarteira: '5.5%',
    marketCap: 'R$ 30,1 bi',
    pl: '12.8',
    pvp: '1.1',
    roe: '8.6%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-26', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,25', dataEx: '15/02/2026', dataPagamento: '28/02/2026', status: 'Aprovado' },
    ]
  },
  'SANB11': {
    ticker: 'SANB11',
    nomeCompleto: 'Banco Santander (Brasil) S.A.',
    setor: 'Bancos',
    descricao: 'Banco privado oferecendo serviços bancários completos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SANB.png',
    precoAtual: 'R$ 27,63',
    variacao: '+5.95%',
    tendencia: 'up',
    dataEntrada: '08/12/2022',
    precoIniciou: 'R$ 29,93',
    dy: '6.90%',
    precoTeto: 'R$ 31,78',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+12.5%',
    ibovespaEpoca: '120.800',
    ibovespaVariacao: '+20.5%',
    percentualCarteira: '7.1%',
    marketCap: 'R$ 154,8 bi',
    pl: '8.2',
    pvp: '0.9',
    roe: '11.0%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-28', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 1,91', dataEx: '15/03/2026', dataPagamento: '30/03/2026', status: 'Aprovado' },
    ]
  },
  'B3SA3': {
    ticker: 'B3SA3',
    nomeCompleto: 'B3 S.A. - Brasil, Bolsa, Balcão',
    setor: 'Financeiro',
    descricao: 'Bolsa de valores brasileira oferecendo serviços de negociação e pós-negociação.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/B3SA.png',
    precoAtual: 'R$ 10,89',
    variacao: '+3.75%',
    tendencia: 'up',
    dataEntrada: '26/07/2022',
    precoIniciou: 'R$ 14,39',
    dy: '6.70%',
    precoTeto: 'R$ 12,20',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+8.2%',
    ibovespaEpoca: '105.200',
    ibovespaVariacao: '+38.5%',
    percentualCarteira: '3.8%',
    marketCap: 'R$ 58,1 bi',
    pl: '15.8',
    pvp: '2.1',
    roe: '13.3%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-13', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,73', dataEx: '15/04/2026', dataPagamento: '30/04/2026', status: 'Aprovado' },
    ]
  },
  'CPFE3': {
    ticker: 'CPFE3',
    nomeCompleto: 'CPFL Energia S.A.',
    setor: 'Energia',
    descricao: 'Grupo de distribuição e geração de energia elétrica.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/CPFE.png',
    precoAtual: 'R$ 6,28',
    variacao: '+2.26%',
    tendencia: 'up',
    dataEntrada: '10/11/2021',
    precoIniciou: 'R$ 12,49',
    dy: '5.50%',
    precoTeto: 'R$ 7,25',
    viesAtual: 'Compra',
    variacaoHoje: '+1.2%',
    rendProventos: '+8.8%',
    ibovespaEpoca: '107.200',
    ibovespaVariacao: '+35.8%',
    percentualCarteira: '2.9%',
    marketCap: 'R$ 16,8 bi',
    pl: '11.5',
    pvp: '0.8',
    roe: '7.0%',
    relatorios: [
      { nome: 'Relatório Anual 2023', data: '2024-03-11', url: '#' },
    ],
    proventos: [
      { tipo: 'Dividendo', valor: 'R$ 0,35', dataEx: '15/05/2026', dataPagamento: '30/05/2026', status: 'Aprovado' },
    ]
  }
};

// Base de dados dos FIIs (novos dados adicionados)
const fiisData: { [key: string]: any } = {
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
    administradora: 'Banco BTG Pactual S.A.',
    cnpj: '28.467.495/0001-85',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'KNSC11': {
    ticker: 'KNSC11',
    nomeCompleto: 'Kinea Securities FII',
    setor: 'Papel',
    tipo: 'FII',
    descricao: 'Fundo especializado em recebíveis imobiliários e títulos de renda fixa.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KNSC.png',
    precoAtual: 'R$ 9,87',
    variacao: '+7.17%',
    tendencia: 'up',
    dataEntrada: '26/01/2022',
    precoIniciou: 'R$ 9,21',
    dy: '11,22%',
    precoTeto: 'R$ 9,14',
    viesAtual: 'Compra',
    variacaoHoje: '+1.2%',
    rendProventos: '+18.5%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '3.2%',
    patrimonio: 'R$ 890 milhões',
    p_vp: '0.95',
    vacancia: '2,1%',
    imoveis: 23,
    gestora: 'Kinea Investimentos',
    administradora: 'Itaú Unibanco S.A.',
    cnpj: '29.641.226/0001-53',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,092', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'HGBS11': {
    ticker: 'HGBS11',
    nomeCompleto: 'HGBS Shopping FII',
    setor: 'Shopping',
    tipo: 'FII',
    descricao: 'Fundo imobiliário especializado em shopping centers de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGBS.png',
    precoAtual: 'R$ 119,36',
    variacao: '+1.08%',
    tendencia: 'up',
    dataEntrada: '07/01/2023',
    precoIniciou: 'R$ 118,08',
    dy: '10,77%',
    precoTeto: 'R$ 119,30',
    viesAtual: 'Compra',
    variacaoHoje: '+0.5%',
    rendProventos: '+12.8%',
    ibovespaEpoca: '125.800',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '6.8%',
    patrimonio: 'R$ 1.8 bilhões',
    p_vp: '1.02',
    vacancia: '5,8%',
    imoveis: 35,
    gestora: 'Hedge Gestão',
    administradora: 'Banco Bradesco S.A.',
    cnpj: '33.412.957/0001-81',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 1,07', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'RURA11': {
    ticker: 'RURA11',
    nomeCompleto: 'RB Capital Recebíveis Imobiliários FII',
    setor: 'Papel',
    tipo: 'FII',
    descricao: 'Fundo especializado em investimentos em recebíveis imobiliários.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RURA.png',
    precoAtual: 'R$ 9,67',
    variacao: '-5.66%',
    tendencia: 'down',
    dataEntrada: '14/01/2023',
    precoIniciou: 'R$ 10,25',
    dy: '12,73%',
    precoTeto: 'R$ 8,70',
    viesAtual: 'Compra',
    variacaoHoje: '-0.3%',
    rendProventos: '+14.2%',
    ibovespaEpoca: '125.800',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '2.8%',
    patrimonio: 'R$ 650 milhões',
    p_vp: '0.88',
    vacancia: '0%',
    imoveis: 15,
    gestora: 'RB Capital',
    administradora: 'Banco Bradesco S.A.',
    cnpj: '31.285.394/0001-45',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,123', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'HSLG11': {
    ticker: 'HSLG11',
    nomeCompleto: 'HSI Logística FII',
    setor: 'Híbrido',
    tipo: 'FII',
    descricao: 'Fundo imobiliário híbrido com foco em ativos logísticos e corporativos.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HSLG.png',
    precoAtual: 'R$ 10,36',
    variacao: '+2.73%',
    tendencia: 'up',
    dataEntrada: '13/01/2024',
    precoIniciou: 'R$ 10,08',
    dy: '11,09%',
    precoTeto: 'R$ 10,81',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+13.2%',
    ibovespaEpoca: '134.200',
    ibovespaVariacao: '+8.5%',
    percentualCarteira: '4.1%',
    patrimonio: 'R$ 1.2 bilhões',
    p_vp: '0.98',
    vacancia: '3,2%',
    imoveis: 28,
    gestora: 'HSI Asset Management',
    administradora: 'Banco Itaú S.A.',
    cnpj: '34.567.123/0001-99',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 0,95', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'BPFF11': {
    ticker: 'BPFF11',
    nomeCompleto: 'BRZ Properties FII',
    setor: 'PDF',
    tipo: 'FII',
    descricao: 'Fundo especializado em edifícios corporativos premium.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BPFF.png',
    precoAtual: 'R$ 82,40',
    variacao: '+14.25%',
    tendencia: 'up',
    dataEntrada: '08/01/2024',
    precoIniciou: 'R$ 72,12',
    dy: '12,20%',
    precoTeto: 'R$ 66,34',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+22.8%',
    ibovespaEpoca: '134.200',
    ibovespaVariacao: '+8.5%',
    percentualCarteira: '9.2%',
    patrimonio: 'R$ 3.8 bilhões',
    p_vp: '1.12',
    vacancia: '6,1%',
    imoveis: 42,
    gestora: 'BRZ Investimentos',
    administradora: 'Banco do Brasil S.A.',
    cnpj: '35.678.234/0001-88',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 8,35', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'HGFF11': {
    ticker: 'HGFF11',
    nomeCompleto: 'Hedge Top FII',
    setor: 'FII',
    tipo: 'FII',
    descricao: 'Fundo de investimento imobiliário diversificado.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HGFF.png',
    precoAtual: 'R$ 71,40',
    variacao: '+3.21%',
    tendencia: 'up',
    dataEntrada: '03/01/2023',
    precoIniciou: 'R$ 69,18',
    dy: '11,12%',
    precoTeto: 'R$ 73,59',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+14.8%',
    ibovespaEpoca: '125.800',
    ibovespaVariacao: '+15.2%',
    percentualCarteira: '5.9%',
    patrimonio: 'R$ 2.5 bilhões',
    p_vp: '1.05',
    vacancia: '4,8%',
    imoveis: 38,
    gestora: 'Hedge Gestão',
    administradora: 'Banco Itaú S.A.',
    cnpj: '36.789.345/0001-77',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 6,62', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'RBCO11': {
    ticker: 'RBCO11',
    nomeCompleto: 'RBR Crédito Imobiliário FII',
    setor: 'Logística',
    tipo: 'FII',
    descricao: 'Fundo especializado em créditos imobiliários e logística.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/RBCO.png',
    precoAtual: 'R$ 108,66',
    variacao: '+83.39%',
    tendencia: 'up',
    dataEntrada: '03/01/2022',
    precoIniciou: 'R$ 59,25',
    dy: '10,18%',
    precoTeto: 'R$ 109,89',
    viesAtual: 'Compra',
    variacaoHoje: '+2.8%',
    rendProventos: '+95.2%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '7.8%',
    patrimonio: 'R$ 1.9 bilhões',
    p_vp: '1.15',
    vacancia: '2,5%',
    imoveis: 32,
    gestora: 'RBR Asset Management',
    administradora: 'Banco Bradesco S.A.',
    cnpj: '37.890.456/0001-66',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 9,20', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'SNAG11': {
    ticker: 'SNAG11',
    nomeCompleto: 'Santander Agro FII',
    setor: 'Logística',
    tipo: 'FII',
    descricao: 'Fundo imobiliário focado em propriedades do agronegócio.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/SNAG.png',
    precoAtual: 'R$ 163,44',
    variacao: '+75.45%',
    tendencia: 'up',
    dataEntrada: '03/01/2022',
    precoIniciou: 'R$ 93,12',
    dy: '10,41%',
    precoTeto: 'R$ 136,00',
    viesAtual: 'Compra',
    variacaoHoje: '+3.2%',
    rendProventos: '+88.8%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '11.2%',
    patrimonio: 'R$ 4.2 bilhões',
    p_vp: '1.22',
    vacancia: '1,8%',
    imoveis: 28,
    gestora: 'Santander Asset Management',
    administradora: 'Banco Santander S.A.',
    cnpj: '38.901.567/0001-55',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 14,12', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'HSOG11': {
    ticker: 'HSOG11',
    nomeCompleto: 'HSI Logística FII',
    setor: 'Logística',
    tipo: 'FII',
    descricao: 'Fundo especializado em galpões logísticos e industriais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HSOG.png',
    precoAtual: 'R$ 157,72',
    variacao: '+11.23%',
    tendencia: 'up',
    dataEntrada: '27/01/2020',
    precoIniciou: 'R$ 141,80',
    dy: '8,62%',
    precoTeto: 'R$ 148,67',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+24.5%',
    ibovespaEpoca: '116.500',
    ibovespaVariacao: '+25.1%',
    percentualCarteira: '8.9%',
    patrimonio: 'R$ 3.1 bilhões',
    p_vp: '1.08',
    vacancia: '3,5%',
    imoveis: 45,
    gestora: 'HSI Asset Management',
    administradora: 'Banco Itaú S.A.',
    cnpj: '39.012.678/0001-44',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 11,32', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'USIM11': {
    ticker: 'USIM11',
    nomeCompleto: 'Usiminas Shopping FII',
    setor: 'Shopping',
    tipo: 'FII',
    descricao: 'Fundo imobiliário focado em shopping centers.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/USIM.png',
    precoAtual: 'R$ 81,67',
    variacao: '+4.71%',
    tendencia: 'up',
    dataEntrada: '14/04/2022',
    precoIniciou: 'R$ 78,00',
    dy: '10,95%',
    precoTeto: 'R$ 93,40',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+18.2%',
    ibovespaEpoca: '118.200',
    ibovespaVariacao: '+23.2%',
    percentualCarteira: '5.8%',
    patrimonio: 'R$ 1.8 bilhões',
    p_vp: '0.95',
    vacancia: '7,2%',
    imoveis: 22,
    gestora: 'Usiminas Gestão',
    administradora: 'Banco do Brasil S.A.',
    cnpj: '40.123.789/0001-33',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 7,45', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'AFHI11': {
    ticker: 'AFHI11',
    nomeCompleto: 'Ativa FII',
    setor: 'Papel',
    tipo: 'FII',
    descricao: 'Fundo de investimento imobiliário diversificado.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/AFHI.png',
    precoAtual: 'R$ 91,79',
    variacao: '-8.12%',
    tendencia: 'down',
    dataEntrada: '05/07/2022',
    precoIniciou: 'R$ 99,91',
    dy: '12,25%',
    precoTeto: 'R$ 93,30',
    viesAtual: 'Compra',
    variacaoHoje: '-1.2%',
    rendProventos: '+8.8%',
    ibovespaEpoca: '102.500',
    ibovespaVariacao: '+42.1%',
    percentualCarteira: '4.2%',
    patrimonio: 'R$ 1.5 bilhões',
    p_vp: '0.92',
    vacancia: '5,1%',
    imoveis: 25,
    gestora: 'Ativa Investimentos',
    administradora: 'Banco Itaú S.A.',
    cnpj: '41.234.890/0001-22',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 9,35', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'BTLG11': {
    ticker: 'BTLG11',
    nomeCompleto: 'BTG Pactual Logística FII',
    setor: 'Logística',
    tipo: 'FII',
    descricao: 'Fundo especializado em ativos logísticos e industriais.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/BTLG.png',
    precoAtual: 'R$ 100,20',
    variacao: '+0.06%',
    tendencia: 'up',
    dataEntrada: '08/01/2022',
    precoIniciou: 'R$ 100,14',
    dy: '9,58%',
    precoTeto: 'R$ 104,09',
    viesAtual: 'Compra',
    variacaoHoje: '+0.8%',
    rendProventos: '+12.5%',
    ibovespaEpoca: '114.200',
    ibovespaVariacao: '+27.8%',
    percentualCarteira: '6.1%',
    patrimonio: 'R$ 2.8 bilhões',
    p_vp: '1.02',
    vacancia: '2,8%',
    imoveis: 35,
    gestora: 'BTG Pactual Asset Management',
    administradora: 'Banco BTG Pactual S.A.',
    cnpj: '42.345.901/0001-11',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 8,00', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'VGTA11': {
    ticker: 'VGTA11',
    nomeCompleto: 'Vig Group FII',
    setor: 'Papel',
    tipo: 'FII',
    descricao: 'Fundo de recebíveis imobiliários.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/VGTA.png',
    precoAtual: 'R$ 51,18',
    variacao: '+4.02%',
    tendencia: 'up',
    dataEntrada: '27/12/2022',
    precoIniciou: 'R$ 49,20',
    dy: '12,50%',
    precoTeto: 'R$ 54,23',
    viesAtual: 'Compra',
    variacaoHoje: '+1.5%',
    rendProventos: '+18.8%',
    ibovespaEpoca: '120.800',
    ibovespaVariacao: '+20.5%',
    percentualCarteira: '3.8%',
    patrimonio: 'R$ 980 milhões',
    p_vp: '0.89',
    vacancia: '1,2%',
    imoveis: 18,
    gestora: 'Vig Gestão',
    administradora: 'Banco Bradesco S.A.',
    cnpj: '43.456.012/0001-00',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 5,32', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'HCRJ11': {
    ticker: 'HCRJ11',
    nomeCompleto: 'Hospital da Criança FII',
    setor: 'Híbrido',
    tipo: 'FII',
    descricao: 'Fundo imobiliário híbrido com foco em saúde.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/HCRJ.png',
    precoAtual: 'R$ 126,97',
    variacao: '+11.43%',
    tendencia: 'up',
    dataEntrada: '21/09/2020',
    precoIniciou: 'R$ 113,95',
    dy: '10,01%',
    precoTeto: 'R$ 120,25',
    viesAtual: 'Compra',
    variacaoHoje: '+2.1%',
    rendProventos: '+22.8%',
    ibovespaEpoca: '110.500',
    ibovespaVariacao: '+31.8%',
    percentualCarteira: '7.5%',
    patrimonio: 'R$ 2.2 bilhões',
    p_vp: '1.12',
    vacancia: '0%',
    imoveis: 8,
    gestora: 'Hedge Gestão',
    administradora: 'Banco Itaú S.A.',
    cnpj: '44.567.123/0001-99',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 10,58', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'KCRJ11': {
    ticker: 'KCRJ11',
    nomeCompleto: 'Kinea Renda Fixa FII',
    setor: 'Renda Fixa',
    tipo: 'FII',
    descricao: 'Fundo de renda fixa imobiliária.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/KCRJ.png',
    precoAtual: 'R$ 124,86',
    variacao: '+10.47%',
    tendencia: 'up',
    dataEntrada: '17/08/2022',
    precoIniciou: 'R$ 113,00',
    dy: '10,35%',
    precoTeto: 'R$ 138,57',
    viesAtual: 'Compra',
    variacaoHoje: '+1.8%',
    rendProventos: '+18.2%',
    ibovespaEpoca: '113.800',
    ibovespaVariacao: '+28.1%',
    percentualCarteira: '6.2%',
    patrimonio: 'R$ 1.9 bilhões',
    p_vp: '0.95',
    vacancia: '0%',
    imoveis: 0,
    gestora: 'Kinea Investimentos',
    administradora: 'Itaú Unibanco S.A.',
    cnpj: '45.678.234/0001-88',
    relatorios: [
      { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
    ],
    proventos: [
      { tipo: 'Rendimento', valor: 'R$ 10,75', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
    ]
  },

  'ALRZ11': {
    ticker: 'ALRZ11',
    nomeCompleto: 'Alianza Trust FII',
    setor: 'Híbrido',
    tipo: 'FII',
    descricao: 'Fundo imobiliário híbrido diversificado.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALRZ.png',
    precoAtual: 'R$ 110,07',
    variacao: '-3.48%',
    tendencia: 'down',
   dataEntrada: '03/02/2022',
   precoIniciou: 'R$ 113,99',
   dy: '9,14%',
   precoTeto: 'R$ 110,16',
   viesAtual: 'Compra',
   variacaoHoje: '-0.5%',
   rendProventos: '+12.8%',
   ibovespaEpoca: '115.200',
   ibovespaVariacao: '+26.5%',
   percentualCarteira: '5.2%',
   patrimonio: 'R$ 1.7 bilhões',
   p_vp: '0.98',
   vacancia: '4,5%',
   imoveis: 28,
   gestora: 'Alianza Asset Management',
   administradora: 'Banco Santander S.A.',
   cnpj: '46.789.345/0001-77',
   relatorios: [
     { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
   ],
   proventos: [
     { tipo: 'Rendimento', valor: 'R$ 8,38', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
   ]
 },

 'BNFS11': {
   ticker: 'BNFS11',
   nomeCompleto: 'Banestes Recebíveis FII',
   setor: 'Híbrido',
   tipo: 'FII',
   descricao: 'Fundo híbrido especializado em recebíveis.',
   avatar: 'https://www.ivalor.com.br/media/emp/logos/BNFS.png',
   precoAtual: 'R$ 148,19',
   variacao: '+80.35%',
   tendencia: 'up',
   dataEntrada: '20/10/2022',
   precoIniciou: 'R$ 82,17',
   dy: '12,67%',
   precoTeto: 'R$ 115,66',
   viesAtual: 'Compra',
   variacaoHoje: '+3.8%',
   rendProventos: '+92.5%',
   ibovespaEpoca: '115.200',
   ibovespaVariacao: '+26.5%',
   percentualCarteira: '8.9%',
   patrimonio: 'R$ 2.8 bilhões',
   p_vp: '1.25',
   vacancia: '0%',
   imoveis: 15,
   gestora: 'Banestes Asset Management',
   administradora: 'Banco Banestes S.A.',
   cnpj: '48.901.567/0001-55',
   relatorios: [
     { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
   ],
   proventos: [
     { tipo: 'Rendimento', valor: 'R$ 15,62', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
   ]
 },

 'HGMJ11': {
   ticker: 'HGMJ11',
   nomeCompleto: 'Hedge Memorial FII',
   setor: 'Papel',
   tipo: 'FII',
   descricao: 'Fundo imobiliário diversificado.',
   avatar: 'https://www.ivalor.com.br/media/emp/logos/HGMJ.png',
   precoAtual: 'R$ 49,30',
   variacao: '-53.94%',
   tendencia: 'down',
   dataEntrada: '05/01/2022',
   precoIniciou: 'R$ 107,04',
   dy: '12,21%',
   precoTeto: 'R$ 73,20',
   viesAtual: 'Compra',
   variacaoHoje: '-2.1%',
   rendProventos: '+8.2%',
   ibovespaEpoca: '114.200',
   ibovespaVariacao: '+27.8%',
   percentualCarteira: '2.8%',
   patrimonio: 'R$ 850 milhões',
   p_vp: '0.65',
   vacancia: '12,5%',
   imoveis: 18,
   gestora: 'Hedge Gestão',
   administradora: 'Banco Bradesco S.A.',
   cnpj: '49.012.678/0001-44',
   relatorios: [
     { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
   ],
   proventos: [
     { tipo: 'Rendimento', valor: 'R$ 5,01', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
   ]
 },

 'XVED11': {
   ticker: 'XVED11',
   nomeCompleto: 'XP Vendas FII',
   setor: 'Papel',
   tipo: 'FII',
   descricao: 'Fundo especializado em recebíveis de vendas.',
   avatar: 'https://www.ivalor.com.br/media/emp/logos/XVED.png',
   precoAtual: 'R$ 9,02',
   variacao: '-6.91%',
   tendencia: 'down',
   dataEntrada: '12/07/2022',
   precoIniciou: 'R$ 9,69',
   dy: '12,91%',
   precoTeto: 'R$ 9,90',
   viesAtual: 'Compra',
   variacaoHoje: '-0.8%',
   rendProventos: '+8.5%',
   ibovespaEpoca: '102.800',
   ibovespaVariacao: '+41.8%',
   percentualCarteira: '2.1%',
   patrimonio: 'R$ 520 milhões',
   p_vp: '0.88',
   vacancia: '0%',
   imoveis: 0,
   gestora: 'XP Asset Management',
   administradora: 'Banco XP S.A.',
   cnpj: '50.123.789/0001-33',
   relatorios: [
     { nome: 'Relatório Mensal - Dezembro 2024', data: '2024-12-15', url: '#' },
   ],
   proventos: [
     { tipo: 'Rendimento', valor: 'R$ 0,97', dataEx: '15/01/2025', dataPagamento: '30/01/2025', status: 'Aprovado' },
   ]
 }
};
export default function EmpresaDetalhes(): React.JSX.Element {
  const params = useParams();
  const ticker = params?.ticker as string;
  const empresa = empresasData[ticker];

  if (!empresa) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5">Empresa não encontrada</Typography>
        <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()}>
          Voltar
        </Button>
      </Box>
    );
  }

  const TrendIcon = empresa.tendencia === 'up' ? TrendUpIcon : TrendDownIcon;
  const trendColor = empresa.tendencia === 'up' ? '#22c55e' : '#ef4444';

  return (
    <Box sx={{ p: 3 }}>
      <Button startIcon={<ArrowLeftIcon />} onClick={() => window.history.back()} variant="outlined" sx={{ mb: 2 }}>
        Voltar
      </Button>

      {/* Header da Empresa */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="flex-start">
            <Avatar src={empresa.avatar} alt={empresa.ticker} sx={{ width: 80, height: 80 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{empresa.ticker}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>{empresa.nomeCompleto}</Typography>
              <Chip label={empresa.setor} color="primary" variant="outlined" sx={{ mb: 2 }} />
              <Typography variant="body1">{empresa.descricao}</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: trendColor }}>{empresa.precoAtual}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <TrendIcon size={20} style={{ color: trendColor }} />
                <Typography sx={{ color: trendColor, fontWeight: 600 }}>{empresa.variacao}</Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Dados da Posição */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Dados da Posição na Carteira</Typography>
              <Grid container spacing={3}>
                {[
                  { label: 'SETOR', value: empresa.setor },
                  { label: 'DATA DE ENTRADA', value: empresa.dataEntrada },
                  { label: 'PREÇO QUE INICIOU', value: empresa.precoIniciou },
                  { label: 'PREÇO ATUAL', value: empresa.precoAtual },
                  { label: 'DIVIDEND YIELD', value: empresa.dy },
                  { label: 'PREÇO TETO', value: empresa.precoTeto },
                  { label: 'VIÉS ATUAL', value: empresa.viesAtual },
                  { label: 'VARIAÇÃO HOJE', value: empresa.variacaoHoje }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                      {item.label === 'VIÉS ATUAL' ? (
                        <Chip label={item.value} sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32', fontWeight: 600 }} />
                      ) : (
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance e Indicadores */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Performance e Benchmark</Typography>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Rendimento com Proventos', value: empresa.rendProventos, color: '#22c55e' },
                      { label: 'Ibovespa na Época da Compra', value: empresa.ibovespaEpoca, color: '#3b82f6' },
                      { label: 'Variação Ibovespa no Período', value: empresa.ibovespaVariacao, color: '#10b981' },
                      { label: 'Percentual na Carteira', value: empresa.percentualCarteira, color: '#8b5cf6' }
                    ].map((item, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: item.color, mb: 1 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Indicadores Financeiros</Typography>
                  <Grid container spacing={3}>
                    {[
                      { label: 'Market Cap', value: empresa.marketCap, color: '#22c55e' },
                      { label: 'P/L', value: empresa.pl },
                      { label: 'P/VP', value: empresa.pvp },
                      { label: 'ROE', value: empresa.roe }
                    ].map((item, index) => (
                      <Grid item xs={6} key={index}>
                        <Box sx={{ textAlign: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: item.color || 'inherit' }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Agenda de Proventos */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>📅 Agenda de Proventos</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      {['Tipo', 'Valor por Ação', 'Data Ex-Dividendo', 'Data Pagamento', 'Status'].map(header => (
                        <th key={header} style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 600,
                          borderBottom: '1px solid #e5e7eb',
                          color: '#374151'
                        }}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {empresa.proventos.map((provento, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Chip
                            label={provento.tipo}
                            size="small"
                            sx={{
                              backgroundColor: provento.tipo === 'Dividendo' ? '#dbeafe' : '#fef3c7',
                              color: provento.tipo === 'Dividendo' ? '#1e40af' : '#92400e',
                              fontWeight: 600
                            }}
                          />
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 700, color: '#059669' }}>
                          {provento.valor}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>{provento.dataEx}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>{provento.dataPagamento}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <Chip
                            label={provento.status}
                            size="small"
                            sx={{
                              backgroundColor: provento.status === 'Pago' ? '#d1fae5' : '#dbeafe',
                              color: provento.status === 'Pago' ? '#065f46' : '#1e40af',
                              fontWeight: 600
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* Resumo dos Proventos */}
              <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  💰 Resumo de Proventos (Últimos 12 meses)
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#059669' }}>
                        {empresa.ticker === 'PETR4' ? 'R$ 9,25' : 'R$ 1,44'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Total por Ação</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                        {empresa.ticker === 'PETR4' ? '5' : '2'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Pagamentos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                        {empresa.dy}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Dividend Yield</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Pizza + Relatórios */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Participação na Carteira</Typography>
                  <Box sx={{ width: 200, height: 200, margin: '0 auto', position: 'relative' }}>
                    <Box sx={{
                      width: 180,
                      height: 180,
                      borderRadius: '50%',
                      background: `conic-gradient(#8b5cf6 0% ${parseFloat(empresa.percentualCarteira)}%, #e5e7eb ${parseFloat(empresa.percentualCarteira)}% 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Box sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                          {empresa.percentualCarteira}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">da carteira</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Stack direction="row" justifyContent="center" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#8b5cf6', borderRadius: '50%' }} />
                        <Typography variant="caption">{empresa.ticker}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, backgroundColor: '#e5e7eb', borderRadius: '50%' }} />
                        <Typography variant="caption">Outros</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Relatórios Financeiros</Typography>
                  <Stack spacing={2}>
                    {empresa.relatorios.map((relatorio, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{relatorio.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">{relatorio.data}</Typography>
                          </Box>
                          <Button size="small" startIcon={<DownloadIcon />}>Download</Button>
                        </Stack>
                        {index < empresa.relatorios.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
