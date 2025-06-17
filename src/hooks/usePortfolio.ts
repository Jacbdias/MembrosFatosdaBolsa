// src/hooks/usePortfolio.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { portfolioDataService, type Ativo, type Configuracao } from '../services/portfolioDataService';

export function usePortfolioData() {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      setAtivos(portfolioDataService.obterAtivos());
      setConfiguracoes(portfolioDataService.obterConfiguracoes());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    portfolioDataService.adicionarListener(loadData);
    
    return () => {
      portfolioDataService.removerListener(loadData);
    };
  }, [loadData]);

  return {
    ativos,
    configuracoes,
    loading,
    service: portfolioDataService,
    refetch: loadData
  };
}

export function useAtivo(ticker: string) {
  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAtivo = useCallback(() => {
    try {
      const found = portfolioDataService.obterAtivoPorTicker(ticker);
      setAtivo(found);
    } catch (error) {
      console.error('Erro ao carregar ativo:', error);
      setAtivo(null);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    if (!ticker) {
      setAtivo(null);
      setLoading(false);
      return;
    }

    loadAtivo();
    portfolioDataService.adicionarListener(loadAtivo);
    
    return () => {
      portfolioDataService.removerListener(loadAtivo);
    };
  }, [loadAtivo, ticker]);

  return {
    ativo,
    loading,
    refetch: loadAtivo
  };
}

export function usePortfolioStats() {
  const [stats, setStats] = useState(() => portfolioDataService.obterEstatisticas());

  const loadStats = useCallback(() => {
    try {
      setStats(portfolioDataService.obterEstatisticas());
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    portfolioDataService.adicionarListener(loadStats);
    return () => {
      portfolioDataService.removerListener(loadStats);
    };
  }, [loadStats]);

  return {
    stats,
    refetch: loadStats
  };
}
