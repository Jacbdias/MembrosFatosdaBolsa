'use client';

import { useState, useCallback } from 'react';

// Interface principal dos relatórios (mantendo compatibilidade)
export interface RelatorioAPI {
  id: string;
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  dataUpload: string;
  linkCanva?: string;
  linkExterno?: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  tipoPdf?: 'base64' | 'referencia';
  hashArquivo?: string;
  solicitarReupload?: boolean;
}

export interface EstatisticasRelatorios {
  totalRelatorios: number;
  totalTickers: number;
  relatoriosComPdf: number;
  tamanhoTotalMB: number;
  dataUltimoUpload?: string;
  relatorios: RelatorioAPI[];
}

export interface MetadataUpload {
  nomeArquivo?: string;
  tamanhoArquivo?: number;
  totalItens?: number;
  itensProcessados?: number;
}

// 🔄 HOOK DE ESTATÍSTICAS
// 🔄 HOOK DE ESTATÍSTICAS - VERSÃO PERSISTENTE (SUBSTITUA O EXISTENTE)
export function useRelatoriosEstatisticas() {
  const [estatisticas, setEstatisticas] = useState<EstatisticasRelatorios>({
    totalRelatorios: 0,
    totalTickers: 0,
    relatoriosComPdf: 0,
    tamanhoTotalMB: 0,
    relatorios: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carregado, setCarregado] = useState(false); // ✅ NOVO: Controle de carregamento

  const carregarEstatisticas = useCallback(async (forcarRecarregar = false) => {
    // ✅ SÓ CARREGA SE NÃO FOI CARREGADO AINDA OU SE FORÇADO
    if (carregado && !forcarRecarregar) {
      console.log('📋 Dados já carregados, pulando requisição...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Carregando relatórios...');
      
      const response = await fetch('/api/relatorios/estatisticas');
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const dados = await response.json();
      console.log('✅ Dados carregados com sucesso:', dados.totalRelatorios, 'relatórios');
      
      setEstatisticas(dados);
      setCarregado(true); // ✅ NOVO: Marca como carregado
      setError(null);

    } catch (error) {
      console.error('Erro ao carregar estatísticas dos relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Fallback para dados vazios em caso de erro
      setEstatisticas({
        totalRelatorios: 0,
        totalTickers: 0,
        relatoriosComPdf: 0,
        tamanhoTotalMB: 0,
        relatorios: []
      });
    } finally {
      setLoading(false);
    }
  }, [carregado]); // ✅ NOVO: Dependência do carregado

  return {
    estatisticas,
    loading,
    error,
    carregado, // ✅ NOVO: Exposar status de carregamento
    carregarEstatisticas
  };
}

// 📤 HOOK DE UPLOAD E CRUD
export function useRelatoriosUpload() {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadRelatorio = useCallback(async (
    relatorio: Omit<RelatorioAPI, 'id' | 'dataUpload'>, 
    metadata?: MetadataUpload
  ) => {
    setLoading(true);
    setProgresso(0);
    setError(null);

    try {
      // Simular progresso
      setProgresso(25);

      const response = await fetch('/api/relatorios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...relatorio,
          metadata
        }),
      });

      setProgresso(75);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      setProgresso(100);

      return resultado;

    } catch (error) {
      console.error('Erro no upload do relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro no upload');
      throw error;
    } finally {
      setLoading(false);
      // Reset progresso após delay
      setTimeout(() => setProgresso(0), 1000);
    }
  }, []);

  const uploadRelatoriosLote = useCallback(async (
    relatorios: Omit<RelatorioAPI, 'id' | 'dataUpload'>[], 
    metadata?: MetadataUpload
  ) => {
    setLoading(true);
    setProgresso(0);
    setError(null);

    try {
      const response = await fetch('/api/relatorios/lote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relatorios,
          metadata
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      setProgresso(100);

      return resultado;

    } catch (error) {
      console.error('Erro no upload em lote:', error);
      setError(error instanceof Error ? error.message : 'Erro no upload em lote');
      throw error;
    } finally {
      setLoading(false);
      setTimeout(() => setProgresso(0), 1000);
    }
  }, []);

  const excluirRelatorio = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/relatorios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao excluir relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluirRelatorios = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/relatorios/excluir-multiplos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao excluir relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir múltiplos');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluirPorTicker = useCallback(async (ticker: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/relatorios/ticker/${ticker}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao excluir relatórios do ticker:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir por ticker');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const limparTodos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/relatorios/limpar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao limpar todos os relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro ao limpar tudo');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    uploadRelatorio,
    uploadRelatoriosLote,
    excluirRelatorio,
    excluirRelatorios,
    excluirPorTicker,
    limparTodos,
    loading,
    progresso,
    error
  };
}

// 📥 HOOK DE EXPORTAÇÃO
export function useRelatoriosExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportarDados = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/relatorios/exportar');

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorios_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      return true;

    } catch (error) {
      console.error('Erro ao exportar relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro na exportação');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const importarDados = useCallback(async (dadosJson: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/relatorios/importar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: dadosJson,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao importar relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro na importação');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportarDados,
    importarDados,
    loading,
    error
  };
}