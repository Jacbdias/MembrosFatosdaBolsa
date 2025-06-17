// src/hooks/usePortfolio.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  portfolioDataService, 
  type Ativo, 
  type Configuracao,
  type DadosProventos 
} from '../services/portfolioDataService';

// Types para os retornos dos hooks
export interface UsePortfolioDataReturn {
  ativos: Ativo[];
  configuracoes: Configuracao[];
  loading: boolean;
  service: typeof portfolioDataService;
  refetch: () => void;
}

export interface UseAtivoReturn {
  ativo: Ativo | null;
  loading: boolean;
  refetch: () => void;
}

export interface UsePortfolioStatsReturn {
  stats: {
    totalAtivos: number;
    ativosAtivos: number;
    totalAcoes: number;
    totalFIIs: number;
    setoresUnicos: number;
    ultimaAtualizacao: string;
  };
  loading: boolean;
  refetch: () => void;
}

export interface UseConfiguracaoReturn {
  valor: string | null;
  loading: boolean;
  atualizar: (novoValor: string) => boolean;
  refetch: () => void;
}

export interface UseProventosReturn {
  proventos: DadosProventos[];
  loading: boolean;
  refetch: () => void;
}

// Hook principal para dados do portfolio
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
      console.error('Erro ao atualizar dados do portfolio:', error);
      // Em caso de erro, manter dados vazios
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
      
      if (!ticker) {
        setAtivo(null);
        return;
      }
      
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
    atualizarAtivo();
    portfolioDataService.adicionarListener(atualizarAtivo);
    
    return () => {
      portfolioDataService.removerListener(atualizarAtivo);
    };
  }, [atualizarAtivo]);

  return {
    ativo,
    loading,
    refetch: atualizarAtivo
  };
}

// Hook para estatísticas do portfolio
export function usePortfolioStats(): UsePortfolioStatsReturn {
  const [stats, setStats] = useState(() => portfolioDataService.obterEstatisticas());
  const [loading, setLoading] = useState(false);

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

// Hook para configuração específica
export function useConfiguracao(chave: string): UseConfiguracaoReturn {
  const [valor, setValor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const atualizarConfiguracao = useCallback(() => {
    try {
      setLoading(true);
      
      if (!chave) {
        setValor(null);
        return;
      }
      
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
    atualizarConfiguracao();
    portfolioDataService.adicionarListener(atualizarConfiguracao);
    
    return () => {
      portfolioDataService.removerListener(atualizarConfiguracao);
    };
  }, [atualizarConfiguracao]);

  return {
    valor,
    loading,
    atualizar,
    refetch: atualizarConfiguracao
  };
}

// Hook para proventos
export function useProventos(ticker?: string): UseProventosReturn {
  const [proventos, setProventos] = useState<DadosProventos[]>([]);
  const [loading, setLoading] = useState(true);

  const atualizarProventos = useCallback(() => {
    try {
      setLoading(true);
      const novosProventos = portfolioDataService.obterProventos(ticker);
      setProventos(novosProventos);
    } catch (error) {
      console.error('Erro ao obter proventos:', error);
      setProventos([]);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    atualizarProventos();
    portfolioDataService.adicionarListener(atualizarProventos);
    
    return () => {
      portfolioDataService.removerListener(atualizarProventos);
    };
  }, [atualizarProventos]);

  return {
    proventos,
    loading,
    refetch: atualizarProventos
  };
}

// Hook para operações de CRUD de ativos
export function useAtivoOperations() {
  const { refetch } = usePortfolioData();

  const adicionarAtivo = useCallback((ativo: Omit<Ativo, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      const novoAtivo = portfolioDataService.adicionarAtivo(ativo);
      refetch(); // Força atualização dos hooks
      return { sucesso: true, ativo: novoAtivo };
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      return { sucesso: false, erro: 'Falha ao adicionar ativo' };
    }
  }, [refetch]);

  const atualizarAtivo = useCallback((id: string, dadosAtualizados: Partial<Ativo>) => {
    try {
      const ativoAtualizado = portfolioDataService.atualizarAtivo(id, dadosAtualizados);
      if (ativoAtualizado) {
        refetch(); // Força atualização dos hooks
        return { sucesso: true, ativo: ativoAtualizado };
      }
      return { sucesso: false, erro: 'Ativo não encontrado' };
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      return { sucesso: false, erro: 'Falha ao atualizar ativo' };
    }
  }, [refetch]);

  const excluirAtivo = useCallback((id: string) => {
    try {
      const sucesso = portfolioDataService.excluirAtivo(id);
      if (sucesso) {
        refetch(); // Força atualização dos hooks
      }
      return { sucesso };
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      return { sucesso: false, erro: 'Falha ao excluir ativo' };
    }
  }, [refetch]);

  return {
    adicionarAtivo,
    atualizarAtivo,
    excluirAtivo
  };
}
