'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, Grid, LinearProgress, Stack
} from '@mui/material';

const ArrowLeftIcon = () => <span>←</span>;
const UploadIcon = () => <span>📤</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const CheckIcon = () => <span>✅</span>;
const DeleteIcon = () => <span>🗑️</span>;
const DownloadIcon = () => <span>📥</span>;
const SyncIcon = () => <span>🔄</span>;

interface ProventoCentral {
  ticker: string;
  data: string;
  dataObj: Date;
  valor: number;
  tipo: string;
  dataFormatada: string;
  valorFormatado: string;
}

interface RelatorioImportacao {
  ticker: string;
  quantidade: number;
  totalValor: number;
  ultimaData: string;
  proventos: ProventoCentral[];
}

export default function CentralProventos() {
  const router = useRouter();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [proventosProcessados, setProventosProcessados] = useState<ProventoCentral[]>([]);
  const [relatorioImportacao, setRelatorioImportacao] = useState<RelatorioImportacao[]>([]);
  const [etapaProcessamento, setEtapaProcessamento] = useState<string>('');
  const [progresso, setProgresso] = useState(0);
  const [estatisticasGerais, setEstatisticasGerais] = useState({
    totalEmpresas: 0,
    totalProventos: 0,
    valorTotal: 0,
    dataUltimoUpload: ''
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const carregarEstatisticas = useCallback(() => {
    if (typeof window === 'undefined') return;
    const masterData = localStorage.getItem('proventos_central_master');
    if (masterData) {
      const dados = JSON.parse(masterData);
      const tickers = new Set();
      let totalValor = 0;
      dados.forEach((item: any) => {
        tickers.add(item.ticker);
        totalValor += item.valor;
      });
      setEstatisticasGerais({
        totalEmpresas: tickers.size,
        totalProventos: dados.length,
        valorTotal: totalValor,
        dataUltimoUpload: localStorage.getItem('proventos_central_data_upload') || ''
      });
    } else {
      setEstatisticasGerais({
        totalEmpresas: 0,
        totalProventos: 0,
        valorTotal: 0,
        dataUltimoUpload: ''
      });
    }
  }, []);

  React.useEffect(() => {
    carregarEstatisticas();
  }, [carregarEstatisticas]);

  const handleUploadArquivo = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    if (arquivo.type !== 'text/csv' && !arquivo.name.endsWith('.csv')) {
      alert('Por favor, selecione apenas arquivos CSV');
      event.target.value = '';
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande! Máximo 10MB permitido.');
      event.target.value = '';
      return;
    }
    setArquivoSelecionado(arquivo);
  }, []);

  const parseData = (data: string): Date | null => {
    if (data.includes('/')) {
      const [dia, mes, ano] = data.split('/');
      const dt = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      return isNaN(dt.getTime()) ? null : dt;
    } else if (data.includes('-')) {
      const dt = new Date(data);
      return isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  const formatarMoeda = useCallback((valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor), []);

  const processarCSV = useCallback(async () => {
    if (!arquivoSelecionado) return;

    setLoading(true);
    setProgresso(0);
    setEtapaProcessamento('Lendo arquivo CSV...');
    setProventosProcessados([]);
    setRelatorioImportacao([]);

    try {
      setProgresso(20);
      await delay(300);
      const text = await arquivoSelecionado.text();
      const linhas = text.split('\n').filter(l => l.trim());
      if (linhas.length < 2) throw new Error('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados');

      setEtapaProcessamento('Validando dados...');
      setProgresso(40);
      await delay(300);

      const proventosValidos: ProventoCentral[] = [];
      const erros: string[] = [];
      const maxLinhas = Math.min(linhas.length, 1001);

      for (let i = 1; i < maxLinhas; i++) {
        const partes = (linhas[i].includes(';') ? linhas[i].split(';') : linhas[i].split(','))
          .map(p => p.trim().replace(/"/g, '').replace(/\r/g, ''));
        if (partes.length < 4) {
          erros.push(`Linha ${i + 1}: Formato inválido`);
          continue;
        }
        const [ticker, data, valor, tipo] = partes;
        if (!ticker || !data || !valor || !tipo) {
          erros.push(`Linha ${i + 1}: Dados obrigatórios em branco`);
          continue;
        }

        const valorNum = parseFloat(valor.replace('R$', '').replace(/\s/g, '').replace(',', '.').trim());
        if (isNaN(valorNum)) {
          erros.push(`Linha ${i + 1}: Valor inválido`);
          continue;
        }

        const dataObj = parseData(data);
        if (!dataObj) {
          erros.push(`Linha ${i + 1}: Data inválida`);
          continue;
        }

        proventosValidos.push({
          ticker: ticker.toUpperCase(),
          data,
          dataObj,
          valor: valorNum,
          tipo,
          dataFormatada: dataObj.toLocaleDateString('pt-BR'),
          valorFormatado: formatarMoeda(valorNum)
        });
      }

      if (proventosValidos.length === 0) throw new Error('Nenhum provento válido encontrado no arquivo');

      setEtapaProcessamento('Agrupando por empresa...');
      setProgresso(60);
      await delay(300);

      const proventosPorTicker: Record<string, ProventoCentral[]> = {};
      proventosValidos.forEach(p => {
        if (!proventosPorTicker[p.ticker]) proventosPorTicker[p.ticker] = [];
        proventosPorTicker[p.ticker].push(p);
      });

      const relatorio: RelatorioImportacao[] = Object.entries(proventosPorTicker).map(([ticker, proventos]) => {
        const totalValor = proventos.reduce((sum, p) => sum + p.valor, 0);
        const proventosOrdenados = proventos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
        return {
          ticker,
          quantidade: proventos.length,
          totalValor,
          ultimaData: proventosOrdenados[0].dataFormatada,
          proventos: proventosOrdenados.slice(0, 5)
        };
      });

      setEtapaProcessamento('Salvando dados...');
      setProgresso(80);
      await delay(300);

      if (typeof window !== 'undefined') {
        localStorage.setItem('proventos_central_master', JSON.stringify(proventosValidos));
        localStorage.setItem('proventos_central_data_upload', new Date().toISOString());
        Object.entries(proventosPorTicker).forEach(([ticker, proventos]) => {
          localStorage.setItem(`proventos_${ticker}`, JSON.stringify(proventos));
        });
      }

      setProgresso(100);
      setEtapaProcessamento('Concluído!');
      setProventosProcessados(proventosValidos);
      setRelatorioImportacao(relatorio);
      await delay(500);
      carregarEstatisticas();
      await delay(1000);
      setDialogAberto(false);
      setArquivoSelecionado(null);
      alert(`✅ Sucesso!\n\n${proventosValidos.length} proventos processados\n${Object.keys(proventosPorTicker).length} empresas atualizadas`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setEtapaProcessamento(`Erro: ${msg}`);
      alert(`❌ Erro ao processar CSV:\n\n${msg}`);
    } finally {
      setLoading(false);
    }
  }, [arquivoSelecionado, carregarEstatisticas]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Seu JSX render original (Cards, Buttons, Dialog etc) */}
      {/* Eu posso complementar com o JSX completo se desejar */}
    </Box>
  );
}
