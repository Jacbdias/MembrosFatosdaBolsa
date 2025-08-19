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

// 🔧 FUNÇÕES HELPER PARA CACHE E DEBUG
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
});

const getUrlWithTimestamp = (url: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}&_r=${Math.random()}`;
};

// 🔄 HOOK DE ESTATÍSTICAS - ATUALIZADO
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

  const carregarEstatisticas = useCallback(async () => {
    console.log('🔄 [VERCEL-DEBUG] Iniciando carregamento estatísticas...', new Date().toISOString());
    
    setLoading(true);
    setError(null);

    try {
      // 🔥 URL com timestamp para forçar reload
      const url = getUrlWithTimestamp('/api/relatorios/estatisticas');
      console.log('📡 [VERCEL-DEBUG] URL estatísticas:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      console.log('📊 [VERCEL-DEBUG] Response status estatísticas:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const dados = await response.json();
      console.log('✅ [VERCEL-DEBUG] Dados estatísticas recebidos:', {
        totalRelatorios: dados.totalRelatorios,
        totalTickers: dados.totalTickers,
        timestamp: new Date().toISOString()
      });

      setEstatisticas(dados);

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao carregar estatísticas:', error);
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
  }, []);

  return {
    estatisticas,
    loading,
    error,
    carregarEstatisticas
  };
}

// 📤 HOOK DE UPLOAD E CRUD - ATUALIZADO
export function useRelatoriosUpload() {
  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadRelatorio = useCallback(async (
    relatorio: Omit<RelatorioAPI, 'id' | 'dataUpload'>, 
    metadata?: MetadataUpload
  ) => {
    console.log('🚀 [VERCEL-DEBUG] Upload relatório iniciado:', relatorio.nome);
    
    setLoading(true);
    setProgresso(0);
    setError(null);

    try {
      // Simular progresso
      setProgresso(25);

      const url = getUrlWithTimestamp('/api/relatorios');
      console.log('📤 [VERCEL-DEBUG] URL upload:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...relatorio,
          metadata
        }),
      });

      setProgresso(75);
      console.log('📤 [VERCEL-DEBUG] Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      setProgresso(100);
      console.log('✅ [VERCEL-DEBUG] Upload relatório concluído:', resultado);

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro no upload do relatório:', error);
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
    console.log('📦 [VERCEL-DEBUG] Upload lote iniciado:', relatorios.length, 'relatórios');
    
    setLoading(true);
    setProgresso(0);
    setError(null);

    try {
      const url = getUrlWithTimestamp('/api/relatorios/lote');

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          relatorios,
          metadata
        }),
      });

      console.log('📦 [VERCEL-DEBUG] Upload lote response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      setProgresso(100);
      console.log('✅ [VERCEL-DEBUG] Upload lote concluído');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro no upload em lote:', error);
      setError(error instanceof Error ? error.message : 'Erro no upload em lote');
      throw error;
    } finally {
      setLoading(false);
      setTimeout(() => setProgresso(0), 1000);
    }
  }, []);

  const excluirRelatorio = useCallback(async (id: string) => {
    console.log('🗑️ [VERCEL-DEBUG] Excluindo relatório:', id);
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp(`/api/relatorios/${id}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('🗑️ [VERCEL-DEBUG] Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ [VERCEL-DEBUG] Relatório excluído com sucesso');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao excluir relatório:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluirRelatorios = useCallback(async (ids: string[]) => {
    console.log('🗑️ [VERCEL-DEBUG] Excluindo múltiplos relatórios:', ids.length);
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp('/api/relatorios/excluir-multiplos');

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({ ids }),
      });

      console.log('🗑️ [VERCEL-DEBUG] Delete múltiplos response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ [VERCEL-DEBUG] Múltiplos relatórios excluídos');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao excluir relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir múltiplos');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const excluirPorTicker = useCallback(async (ticker: string) => {
    console.log('🗑️ [VERCEL-DEBUG] Excluindo por ticker:', ticker);
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp(`/api/relatorios/ticker/${ticker}`);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('🗑️ [VERCEL-DEBUG] Delete ticker response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ [VERCEL-DEBUG] Relatórios do ticker excluídos');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao excluir relatórios do ticker:', error);
      setError(error instanceof Error ? error.message : 'Erro ao excluir por ticker');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const limparTodos = useCallback(async () => {
    console.log('🧹 [VERCEL-DEBUG] Limpando todos os relatórios');
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp('/api/relatorios/limpar');

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders()
      });

      console.log('🧹 [VERCEL-DEBUG] Limpar tudo response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ [VERCEL-DEBUG] Todos os relatórios limpos');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao limpar todos os relatórios:', error);
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

// 📥 HOOK DE EXPORTAÇÃO - ATUALIZADO
export function useRelatoriosExport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportarDados = useCallback(async () => {
    console.log('📤 [VERCEL-DEBUG] Exportando dados');
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp('/api/relatorios/exportar');

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });

      console.log('📤 [VERCEL-DEBUG] Export response:', response.status);

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `relatorios_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      console.log('✅ [VERCEL-DEBUG] Export concluído');

      return true;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao exportar relatórios:', error);
      setError(error instanceof Error ? error.message : 'Erro na exportação');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const importarDados = useCallback(async (dadosJson: string) => {
    console.log('📥 [VERCEL-DEBUG] Importando dados');
    
    setLoading(true);
    setError(null);

    try {
      const url = getUrlWithTimestamp('/api/relatorios/importar');

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(),
        body: dadosJson,
      });

      console.log('📥 [VERCEL-DEBUG] Import response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }

      const resultado = await response.json();
      console.log('✅ [VERCEL-DEBUG] Import concluído');

      return resultado;

    } catch (error) {
      console.error('❌ [VERCEL-DEBUG] Erro ao importar relatórios:', error);
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