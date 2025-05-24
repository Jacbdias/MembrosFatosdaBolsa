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
