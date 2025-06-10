// Versão enxuta do componente EmpresaDetalhes com melhorias aplicadas
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';

// Importações e componentes mantidos como no original
// ... (todos os imports de MUI, icons, etc)

const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';

// Utilitário para parse robusto de valores
function parseReal(value: string): number {
  return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.')) || 0;
}

function useDadosFinanceiros(ticker: string) {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');

  const buscarDados = useCallback(async () => {
    if (!ticker) return;
    try {
      setLoading(true);
      setError(null);
      const url = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&dividends=true`;
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Portfolio-Details-App' }
      });
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
      const { results } = await response.json();
      const quote = results?.[0];
      if (!quote) throw new Error('Sem dados');

      const isFII = ticker.includes('11') || quote.quoteType === 'TRUST' || quote.longName?.includes('Fundo');
      const summary = quote.summaryDetail || {};
      const stats = quote.defaultStatistics || {};
      const fin = quote.financialData || {};
      const div = quote.dividendsData || {};

      const dados: DadosFinanceiros = {
        precoAtual: quote.regularMarketPrice || 0,
        variacao: quote.regularMarketChange || 0,
        variacaoPercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        ...(!isFII && {
          marketCap: summary.marketCap,
          pl: summary.trailingPE || summary.forwardPE,
          pvp: summary.priceToBook,
          roe: stats.returnOnEquity ? stats.returnOnEquity * 100 : undefined,
          ebitda: fin.ebitda,
          dividaLiquida: fin.totalDebt
        }),
        ...(isFII && {
          patrimonio: summary.totalAssets || summary.marketCap,
          valorPatrimonial: summary.bookValue || summary.navPrice,
          pvp: summary.priceToBook || (quote.regularMarketPrice / (summary.bookValue || 1)),
          rendimento12m: div.yield || summary.yield
        }),
        dy: div.yield || summary.dividendYield || summary.yield
      };

      setDadosFinanceiros(dados);
      setUltimaAtualizacao(new Date().toLocaleString('pt-BR'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    buscarDados();
    const interval = setInterval(buscarDados, 300000);
    return () => clearInterval(interval);
  }, [buscarDados]);

  return { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch: buscarDados };
}

function calcularViesInteligente(precoTeto: string, precoAtual: number): string {
  const teto = parseReal(precoTeto);
  if (!teto || precoAtual <= 0) return 'Aguardar';
  const pct = (precoAtual / teto) * 100;
  if (pct <= 80) return 'Compra Forte';
  if (pct <= 95) return 'Compra';
  if (pct <= 105) return 'Neutro';
  if (pct <= 120) return 'Aguardar';
  return 'Venda';
}

function EmpresaDetalhes() {
  const params = useParams();
  const ticker = Array.isArray(params?.ticker) ? params.ticker[0] : params?.ticker;

  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null);
  const [dataSource, setDataSource] = useState<'admin' | 'fallback' | 'not_found'>('not_found');

  const { dadosFinanceiros, loading, error, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  useEffect(() => {
    if (!ticker) return;
    try {
      const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
      if (dadosAdmin) {
        const ativos = JSON.parse(dadosAdmin);
        const encontrado = ativos.find((a: any) => a.ticker === ticker);
        if (encontrado) {
          setEmpresa(encontrado);
          setDataSource('admin');
          return;
        }
      }
      const fallback = dadosFallback[ticker];
      if (fallback) {
        setEmpresa(fallback);
        setDataSource('fallback');
        return;
      }
      setDataSource('not_found');
    } catch {
      setDataSource('not_found');
    }
  }, [ticker]);

  const empresaCompleta = useMemo(() => {
    if (!empresa) return null;
    const precoAtual = dadosFinanceiros?.precoAtual || 0;
    const precoEntrada = parseReal(empresa.precoIniciou);
    const vies = calcularViesInteligente(empresa.precoTeto, precoAtual);

    return {
      ...empresa,
      dadosFinanceiros,
      viesAtual: vies,
      statusApi: dadosFinanceiros ? 'success' : undefined,
      ultimaAtualizacao
    };
  }, [empresa, dadosFinanceiros, ultimaAtualizacao]);

  // ...continua com a renderização completa da página como no original
  // (cards, grids, tabelas, relatórios, etc), usando empresaCompleta

  return <>{/* JSX principal mantido */}</>;
}

export default EmpresaDetalhes;
