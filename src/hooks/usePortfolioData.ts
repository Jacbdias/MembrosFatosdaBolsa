// src/hooks/usePortfolioData.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  portfolioDataService, 
  type Ativo, 
  type Configuracao,
  type UsePortfolioDataReturn,
  type UseAtivoReturn
} from '../services/portfolioDataService';

// Hook personalizado para usar em componentes React
export function usePortfolioData(): UsePortfolioDataReturn {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [loading, setLoading] = useState(true);

  const atualizarDados = useCallback(() => {
    try {
      setLoading(true);
      const novosAtivos = portfolioDataService.obterAtivos();
      const novasConfiguracoes = portfolioDataService.obterConfiguracoes();
      
      setAtivos(novosAtivos);
      setConfiguracoes(novasConfiguracoes);
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      // Em caso de erro, manter dados vazios mas parar loading
      setAtivos([]);
      setConfiguracoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Carrega dados iniciais
    atualizarDados();
    
    // Adiciona listener para mudanças
    portfolioDataService.adicionarListener(atualizarDados);
    
    // Cleanup
    return () => {
      portfolioDataService.removerListener(atualizarDados);
    };
  }, [atualizarDados]);

  return {
    ativos,
    configuracoes,
    loading,
    service: portfolioDataService,
    refetch: atualizarDados
  };
}

// Hook para um ativo específico
export function useAtivo(ticker: string): UseAtivoReturn {
  const [ativo, setAtivo] = useState<Ativo | null>(null);
  const [loading, setLoading] = useState(true);

  const atualizarAtivo = useCallback(() => {
    try {
      setLoading(true);
      const ativoEncontrado = portfolioDataService.obterAtivoPorTicker(ticker);
      setAtivo(ativoEncontrado);
    } catch (error) {
      console.error('Erro ao obter ativo:', error);
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

    // Carrega ativo inicial
    atualizarAtivo();
    
    // Adiciona listener para mudanças
    portfolioDataService.adicionarListener(atualizarAtivo);
    
    // Cleanup
    return () => {
      portfolioDataService.removerListener(atualizarAtivo);
    };
  }, [atualizarAtivo, ticker]);

  return {
    ativo,
    loading,
    refetch: atualizarAtivo
  };
}

// Hook para estatísticas do portfolio
export function usePortfolioStats() {
  const [stats, setStats] = useState(portfolioDataService.obterEstatisticas());
  const [loading, setLoading] = useState(true);

  const atualizarStats = useCallback(() => {
    try {
      setLoading(true);
      const novasStats = portfolioDataService.obterEstatisticas();
      setStats(novasStats);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    atualizarStats();
    portfolioDataService.adicionarListener(atualizarStats);
    
    return () => {
      portfolioDataService.removerListener(atualizarStats);
    };
  }, [atualizarStats]);

  return {
    stats,
    loading,
    refetch: atualizarStats
  };
}

// Hook para configurações específicas
export function useConfiguracao(chave: string) {
  const [valor, setValor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const atualizarConfiguracao = useCallback(() => {
    try {
      setLoading(true);
      const novoValor = portfolioDataService.obterConfiguracao(chave);
      setValor(novoValor);
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      setValor(null);
    } finally {
      setLoading(false);
    }
  }, [chave]);

  const atualizar = useCallback((novoValor: string) => {
    try {
      const sucesso = portfolioDataService.atualizarConfiguracao(chave, novoValor);
      if (sucesso) {
        setValor(novoValor);
      }
      return sucesso;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return false;
    }
  }, [chave]);

  useEffect(() => {
    if (!chave) {
      setValor(null);
      setLoading(false);
      return;
    }

    atualizarConfiguracao();
    portfolioDataService.adicionarListener(atualizarConfiguracao);
    
    return () => {
      portfolioDataService.removerListener(atualizarConfiguracao);
    };
  }, [atualizarConfiguracao, chave]);

  return {
    valor,
    loading,
    atualizar,
    refetch: atualizarConfiguracao
  };
}
