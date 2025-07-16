 
// ========================================
// SISTEMA DE ARMAZENAMENTO COM INDEXEDDB
// Substitui o localStorage para resolver limitações de espaço
// ========================================

interface RelatorioAdmin {
  id: string;
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  dataUpload: string;
  linkCanva?: string;
  linkExterno?: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  // PDF System (Híbrido)
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  tipoPdf?: 'base64' | 'referencia';
  hashArquivo?: string;
  solicitarReupload?: boolean;
}

// ========================================
// CLASSE PARA GERENCIAR INDEXEDDB
// ========================================
class RelatoriosDB {
  private dbName = 'RelatoriosDatabase';
  private version = 1;
  private db: IDBDatabase | null = null;

  // Inicializar o banco de dados
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para relatórios por ticker
        if (!db.objectStoreNames.contains('relatorios')) {
          const store = db.createObjectStore('relatorios', { keyPath: 'ticker' });
          store.createIndex('ticker', 'ticker', { unique: true });
        }
        
        // Store para metadados e configurações
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };
    });
  }

  // Salvar relatórios de um ticker específico
  async salvarRelatoriosTicker(ticker: string, relatorios: Omit<RelatorioAdmin, 'ticker'>[]): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['relatorios'], 'readwrite');
      const store = transaction.objectStore('relatorios');
      
      const request = store.put({
        ticker,
        relatorios,
        lastUpdated: new Date().toISOString()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Buscar relatórios de um ticker específico
  async buscarRelatoriosTicker(ticker: string): Promise<Omit<RelatorioAdmin, 'ticker'>[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['relatorios'], 'readonly');
      const store = transaction.objectStore('relatorios');
      const request = store.get(ticker);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.relatorios : []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Buscar todos os relatórios (formato flat para a Central)
  async buscarTodosRelatorios(): Promise<RelatorioAdmin[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['relatorios'], 'readonly');
      const store = transaction.objectStore('relatorios');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result;
        const todosRelatorios: RelatorioAdmin[] = [];
        
        results.forEach(item => {
          item.relatorios.forEach((relatorio: Omit<RelatorioAdmin, 'ticker'>) => {
            todosRelatorios.push({
              ...relatorio,
              ticker: item.ticker
            });
          });
        });
        
        resolve(todosRelatorios);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Salvar todos os relatórios (para a Central)
  async salvarTodosRelatorios(relatorios: RelatorioAdmin[]): Promise<void> {
    if (!this.db) await this.init();
    
    // Agrupar por ticker
    const relatoriosPorTicker: { [ticker: string]: Omit<RelatorioAdmin, 'ticker'>[] } = {};
    
    relatorios.forEach(relatorio => {
      if (!relatoriosPorTicker[relatorio.ticker]) {
        relatoriosPorTicker[relatorio.ticker] = [];
      }
      
      const { ticker, ...relatorioSemTicker } = relatorio;
      relatoriosPorTicker[relatorio.ticker].push(relatorioSemTicker);
    });
    
    // Salvar cada ticker
    const promessas = Object.entries(relatoriosPorTicker).map(([ticker, relatoriosTicker]) =>
      this.salvarRelatoriosTicker(ticker, relatoriosTicker)
    );
    
    await Promise.all(promessas);
  }

  // Excluir relatório específico
  async excluirRelatorio(ticker: string, relatorioId: string): Promise<void> {
    const relatorios = await this.buscarRelatoriosTicker(ticker);
    const relatoriosFiltrados = relatorios.filter(r => r.id !== relatorioId);
    await this.salvarRelatoriosTicker(ticker, relatoriosFiltrados);
  }

  // Backup completo
  async exportarBackup(): Promise<string> {
    const todosRelatorios = await this.buscarTodosRelatorios();
    
    // Converter para formato de localStorage para compatibilidade
    const dadosEstruturados: { [ticker: string]: Omit<RelatorioAdmin, 'ticker'>[] } = {};
    
    todosRelatorios.forEach(relatorio => {
      if (!dadosEstruturados[relatorio.ticker]) {
        dadosEstruturados[relatorio.ticker] = [];
      }
      
      const { ticker, ...relatorioSemTicker } = relatorio;
      dadosEstruturados[relatorio.ticker].push(relatorioSemTicker);
    });
    
    return JSON.stringify(dadosEstruturados);
  }

  // Importar backup
  async importarBackup(dadosJson: string): Promise<void> {
    const dados = JSON.parse(dadosJson);
    
    // Converter formato de volta para lista flat
    const listaRelatorios: RelatorioAdmin[] = [];
    Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
      relatoriosTicker.forEach(relatorio => {
        listaRelatorios.push({
          ...relatorio,
          ticker
        });
      });
    });
    
    await this.salvarTodosRelatorios(listaRelatorios);
  }

  // Limpar todos os dados
  async limparTudo(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['relatorios'], 'readwrite');
      const store = transaction.objectStore('relatorios');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Obter estatísticas de uso
  async obterEstatisticas(): Promise<{
    totalTickers: number;
    totalRelatorios: number;
    tamanhoEstimado: number;
  }> {
    const todosRelatorios = await this.buscarTodosRelatorios();
    const tickers = new Set(todosRelatorios.map(r => r.ticker));
    
    const tamanhoEstimado = todosRelatorios.reduce((total, relatorio) => {
      return total + (relatorio.tamanhoArquivo || 0);
    }, 0);
    
    return {
      totalTickers: tickers.size,
      totalRelatorios: todosRelatorios.length,
      tamanhoEstimado
    };
  }
}

// ========================================
// INSTÂNCIA SINGLETON
// ========================================
export const relatoriosDB = new RelatoriosDB();

// ========================================
// HOOK REACT PARA USAR O SISTEMA
// ========================================
import { useState, useEffect, useCallback } from 'react';

export function useRelatoriosDB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar DB na primeira execução
  useEffect(() => {
    relatoriosDB.init().catch(err => {
      setError('Erro ao inicializar banco de dados: ' + err.message);
    });
  }, []);

  // Função para salvar relatórios com tratamento de erro
  const salvarRelatorios = useCallback(async (relatorios: RelatorioAdmin[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await relatoriosDB.salvarTodosRelatorios(relatorios);
      return true;
    } catch (err: any) {
      setError('Erro ao salvar relatórios: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para carregar relatórios
  const carregarRelatorios = useCallback(async (): Promise<RelatorioAdmin[]> => {
    try {
      setLoading(true);
      setError(null);
      return await relatoriosDB.buscarTodosRelatorios();
    } catch (err: any) {
      setError('Erro ao carregar relatórios: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para carregar relatórios de um ticker específico
  const carregarRelatoriosTicker = useCallback(async (ticker: string): Promise<Omit<RelatorioAdmin, 'ticker'>[]> => {
    try {
      setLoading(true);
      setError(null);
      return await relatoriosDB.buscarRelatoriosTicker(ticker);
    } catch (err: any) {
      setError('Erro ao carregar relatórios do ticker: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para fazer backup
  const exportarBackup = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      return await relatoriosDB.exportarBackup();
    } catch (err: any) {
      setError('Erro ao exportar backup: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para importar backup
  const importarBackup = useCallback(async (dadosJson: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await relatoriosDB.importarBackup(dadosJson);
      return true;
    } catch (err: any) {
      setError('Erro ao importar backup: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    salvarRelatorios,
    carregarRelatorios,
    carregarRelatoriosTicker,
    exportarBackup,
    importarBackup,
    relatoriosDB
  };
}

// ========================================
// FUNÇÃO DE MIGRAÇÃO DO LOCALSTORAGE
// ========================================
export async function migrarDoLocalStorage(): Promise<boolean> {
  try {
    const dadosLocalStorage = localStorage.getItem('relatorios_central');
    if (!dadosLocalStorage) {
      console.log('Nenhum dado para migrar do localStorage');
      return true;
    }

    console.log('Iniciando migração do localStorage para IndexedDB...');
    
    // Importar dados para IndexedDB
    await relatoriosDB.importarBackup(dadosLocalStorage);
    
    // Criar backup do localStorage antes de remover
    const backup = `relatorios_localStorage_backup_${new Date().toISOString().split('T')[0]}.json`;
    const blob = new Blob([dadosLocalStorage], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup;
    link.click();
    URL.revokeObjectURL(url);
    
    // Remover do localStorage
    localStorage.removeItem('relatorios_central');
    
    console.log('✅ Migração concluída com sucesso!');
    alert('✅ Dados migrados para IndexedDB com sucesso!\nUm backup do localStorage foi baixado automaticamente.');
    
    return true;
  } catch (error) {
    console.error('Erro na migração:', error);
    alert('❌ Erro na migração. Os dados do localStorage foram preservados.');
    return false;
  }
}