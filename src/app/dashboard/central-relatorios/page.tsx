'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';

// ========================================
// SISTEMA DE ARMAZENAMENTO AVANÇADO
// ========================================
class AdvancedStorageManager {
  private dbName = 'RelatoriosDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Inicializar IndexedDB
  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para metadados
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'id' });
        }
        
        // Store para PDFs grandes
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'fileId' });
        }
      };
    });
  }

  // Salvar dados com estratégia inteligente
  async saveData(data: any): Promise<void> {
    try {
      // Separar metadados de arquivos
      const { arquivos, metadados } = this.separateData(data);
      
      // Salvar metadados no localStorage (comprimidos)
      const metadadosComprimidos = this.compressData(metadados);
      localStorage.setItem('relatorios_metadata', metadadosComprimidos);
      
      // Salvar arquivos no IndexedDB
      if (arquivos.length > 0) {
        await this.saveFilesToIndexedDB(arquivos);
      }
      
      console.log(`💾 Dados salvos: ${metadados.totalRelatorios} relatórios, ${arquivos.length} arquivos`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      throw new Error('Falha ao salvar dados no sistema avançado');
    }
  }

  // Carregar dados do sistema híbrido
  async loadData(): Promise<any> {
    try {
      // Carregar metadados do localStorage
      const metadadosComprimidos = localStorage.getItem('relatorios_metadata');
      if (!metadadosComprimidos) {
        return this.loadLegacyData(); // Fallback para dados antigos
      }
      
      const metadados = this.decompressData(metadadosComprimidos);
      
      // Carregar arquivos do IndexedDB quando necessário
      const dadosCompletos = await this.mergeWithFiles(metadados);
      
      console.log(`📂 Dados carregados: ${dadosCompletos.totalRelatorios} relatórios`);
      return dadosCompletos;
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      return this.loadLegacyData();
    }
  }

  // Salvar arquivo individual no IndexedDB
  async saveFile(fileId: string, fileData: string): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      
      const request = store.put({
        fileId,
        data: fileData,
        timestamp: Date.now()
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Carregar arquivo do IndexedDB
  async loadFile(fileId: string): Promise<string | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      
      const request = store.get(fileId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Obter estatísticas de armazenamento
  async getStorageStats(): Promise<any> {
    try {
      const localStorageSize = this.getLocalStorageSize();
      const indexedDBSize = await this.getIndexedDBSize();
      
      return {
        localStorage: {
          used: localStorageSize,
          usedMB: (localStorageSize / 1024 / 1024).toFixed(2),
          limit: 5 * 1024 * 1024, // ~5MB típico
          percentage: (localStorageSize / (5 * 1024 * 1024)) * 100
        },
        indexedDB: {
          used: indexedDBSize,
          usedMB: (indexedDBSize / 1024 / 1024).toFixed(2),
          limit: 50 * 1024 * 1024, // ~50MB típico
          percentage: (indexedDBSize / (50 * 1024 * 1024)) * 100
        },
        total: {
          used: localStorageSize + indexedDBSize,
          usedMB: ((localStorageSize + indexedDBSize) / 1024 / 1024).toFixed(2)
        }
      };
    } catch (error) {
      return null;
    }
  }

  // Comprimir dados usando algoritmo simples
  private compressData(data: any): string {
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
  }

  private decompressData(compressedData: string): any {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch {
      throw new Error('Dados corrompidos');
    }
  }

  // Separar metadados de arquivos
  private separateData(relatorios: any[]): any {
    const metadados: any[] = [];
    const arquivos: any[] = [];
    
    relatorios.forEach(relatorio => {
      const { arquivoPdf, ...metadata } = relatorio;
      
      if (arquivoPdf && arquivoPdf.length > 1000) { // Se tem arquivo grande
        const fileId = `file_${relatorio.id}`;
        metadata.fileId = fileId;
        metadata.hasFile = true;
        metadados.push(metadata);
        
        arquivos.push({
          fileId,
          data: arquivoPdf
        });
      } else {
        metadados.push(relatorio); // Manter arquivos pequenos nos metadados
      }
    });
    
    return {
      metadados: {
        relatorios: metadados,
        totalRelatorios: relatorios.length,
        timestamp: Date.now()
      },
      arquivos
    };
  }

  // Mesclar metadados com arquivos do IndexedDB
  private async mergeWithFiles(metadados: any): Promise<any> {
    const relatorios = [...metadados.relatorios];
    
    // Carregar arquivos grandes do IndexedDB quando necessário
    for (let i = 0; i < relatorios.length; i++) {
      if (relatorios[i].fileId && relatorios[i].hasFile) {
        // Marcar como arquivo em IndexedDB (carregar sob demanda)
        relatorios[i].arquivoNoIndexedDB = true;
      }
    }
    
    return relatorios;
  }

  // Carregar dados antigos (compatibilidade)
  private loadLegacyData(): any {
    try {
      const dadosAntigos = localStorage.getItem('relatorios_central');
      if (!dadosAntigos) return [];
      
      const dados = JSON.parse(dadosAntigos);
      const listaRelatorios: any[] = [];
      
      Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
        if (Array.isArray(relatoriosTicker)) {
          relatoriosTicker.forEach(relatorio => {
            listaRelatorios.push({ ...relatorio, ticker });
          });
        }
      });
      
      return listaRelatorios;
    } catch {
      return [];
    }
  }

  private async saveFilesToIndexedDB(arquivos: any[]): Promise<void> {
    for (const arquivo of arquivos) {
      await this.saveFile(arquivo.fileId, arquivo.data);
    }
  }

  private getLocalStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  private async getIndexedDBSize(): Promise<number> {
    if (!this.db) return 0;
    
    return new Promise((resolve) => {
      let total = 0;
      const transaction = this.db!.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          total += cursor.value.data.length;
          cursor.continue();
        } else {
          resolve(total);
        }
      };
      request.onerror = () => resolve(0);
    });
  }
}

// ========================================
// INTERFACES E TIPOS
// ========================================
export interface RelatorioAdmin {
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
  tipoPdf?: 'localStorage' | 'indexedDB' | 'compressed';
  fileId?: string;
  hasFile?: boolean;
  arquivoNoIndexedDB?: boolean;
}

interface NovoRelatorio {
  ticker: string;
  nome: string;
  tipo: 'trimestral' | 'anual' | 'apresentacao' | 'outros';
  dataReferencia: string;
  linkCanva: string;
  linkExterno: string;
  tipoVisualizacao: 'iframe' | 'canva' | 'link' | 'pdf';
  arquivoPdf: File | null;
}

// ========================================
// CONSTANTES
// ========================================
const LIMITE_LOCALSTORAGE = 500 * 1024; // 500KB para localStorage
const LIMITE_MAXIMO = 50 * 1024 * 1024; // 50MB máximo por arquivo
const TICKERS_DISPONIVEIS = [
  'KEPL3', 'AGRO3', 'LEVE3', 'BBAS3', 'BRSR6', 'ABCB4', 'SANB11',
  'TASA4', 'ROMI3', 'EZTC3', 'EVEN3', 'TRIS3', 'FESA4', 'CEAB3',
  'CSED3', 'YDUQ3', 'ALUP11', 'NEOE3', 'EGIE3', 'ELET3', 'ISAE4',
  'CPLE6', 'BBSE3', 'B3SA3', 'TUPY3', 'RAPT4', 'SHUL4', 'SIMH3',
  'LOGG3', 'VALE3', 'CGRA4', 'RSUL4', 'DEXP3', 'RANI3', 'KLBN11',
  'RECV3', 'PRIO3', 'PETR4', 'UNIP6', 'SAPR4', 'CSMG3', 'FLRY3',
  'ODPV3', 'WIZC3', 'SMTO3', 'JALL3', 'POSI3', 'VIVT3', 'ALOS3'
];

// ========================================
// FUNÇÕES UTILITÁRIAS AVANÇADAS
// ========================================
const converterParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(arquivo);
    } catch (error) {
      reject(error);
    }
  });
};

const processarPdfAvancado = async (arquivo: File, storageManager: AdvancedStorageManager): Promise<any> => {
  try {
    console.log(`📄 Processando PDF avançado: ${arquivo.name} (${(arquivo.size / 1024 / 1024).toFixed(2)}MB)`);
    
    const base64 = await converterParaBase64(arquivo);
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (base64.length <= LIMITE_LOCALSTORAGE) {
      // Arquivo pequeno: localStorage
      console.log('💾 Salvando no localStorage (arquivo pequeno)');
      return {
        arquivoPdf: base64,
        nomeArquivoPdf: arquivo.name,
        tamanhoArquivo: arquivo.size,
        tipoPdf: 'localStorage'
      };
    } else {
      // Arquivo grande: IndexedDB
      console.log('🗄️ Salvando no IndexedDB (arquivo grande)');
      await storageManager.saveFile(fileId, base64);
      
      return {
        fileId,
        nomeArquivoPdf: arquivo.name,
        tamanhoArquivo: arquivo.size,
        tipoPdf: 'indexedDB',
        hasFile: true,
        arquivoNoIndexedDB: true
      };
    }
  } catch (error) {
    console.error('❌ Erro ao processar PDF avançado:', error);
    throw new Error('Falha no processamento avançado do arquivo');
  }
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
export default function CentralRelatoriosAvancada() {
  const [relatorios, setRelatorios] = useState<RelatorioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogStorage, setDialogStorage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageStats, setStorageStats] = useState<any>(null);
  
  // Sistema avançado de armazenamento
  const [storageManager] = useState(() => new AdvancedStorageManager());
  
  // Estados para upload em lote
  const [uploadsLote, setUploadsLote] = useState<NovoRelatorio[]>([]);
  
  // Estados para upload individual
  const [novoRelatorio, setNovoRelatorio] = useState<NovoRelatorio>({
    ticker: '',
    nome: '',
    tipo: 'trimestral',
    dataReferencia: '',
    linkCanva: '',
    linkExterno: '',
    tipoVisualizacao: 'iframe',
    arquivoPdf: null
  });

  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  useEffect(() => {
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      console.log('🚀 Inicializando sistema avançado...');
      await storageManager.initDB();
      await carregarDados();
      await atualizarEstatisticasStorage();
      console.log('✅ Sistema inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    }
  };

  const carregarDados = async () => {
    try {
      console.log('📂 Carregando dados do sistema avançado...');
      const dados = await storageManager.loadData();
      setRelatorios(Array.isArray(dados) ? dados : []);
      console.log(`✅ ${dados.length || 0} relatórios carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setRelatorios([]);
    }
  };

  const atualizarEstatisticasStorage = async () => {
    try {
      const stats = await storageManager.getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
    }
  };

  // ========================================
  // SALVAR DADOS
  // ========================================
  const salvarDadosAvancados = async (novaLista: RelatorioAdmin[]) => {
    try {
      console.log(`💾 Salvando ${novaLista.length} relatórios no sistema avançado...`);
      await storageManager.saveData(novaLista);
      setRelatorios(novaLista);
      await atualizarEstatisticasStorage();
      console.log('✅ Dados salvos com sucesso no sistema avançado!');
    } catch (error) {
      console.error('❌ Erro ao salvar dados avançados:', error);
      throw error;
    }
  };

  // ========================================
  // UPLOAD INDIVIDUAL
  // ========================================
  const salvarRelatorioIndividual = async () => {
    if (!novoRelatorio.ticker || !novoRelatorio.nome) {
      alert('❌ Preencha pelo menos o ticker e nome do relatório');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(10);
      
      console.log('🔄 Iniciando salvamento avançado...');
      
      let dadosPdf = {};
      if (novoRelatorio.arquivoPdf) {
        if (novoRelatorio.arquivoPdf.size > LIMITE_MAXIMO) {
          throw new Error(`Arquivo muito grande. Máximo ${LIMITE_MAXIMO / 1024 / 1024}MB`);
        }
        
        setUploadProgress(30);
        dadosPdf = await processarPdfAvancado(novoRelatorio.arquivoPdf, storageManager);
        setUploadProgress(70);
      }

      const novoId = `${novoRelatorio.ticker}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const relatorioCompleto: RelatorioAdmin = {
        id: novoId,
        ticker: novoRelatorio.ticker,
        nome: novoRelatorio.nome,
        tipo: novoRelatorio.tipo,
        dataReferencia: novoRelatorio.dataReferencia,
        dataUpload: new Date().toISOString(),
        linkCanva: novoRelatorio.linkCanva || undefined,
        linkExterno: novoRelatorio.linkExterno || undefined,
        tipoVisualizacao: novoRelatorio.tipoVisualizacao,
        ...dadosPdf
      };

      setUploadProgress(90);
      
      const novaLista = [...relatorios, relatorioCompleto];
      await salvarDadosAvancados(novaLista);
      
      setUploadProgress(100);
      
      // Reset form
      setNovoRelatorio({
        ticker: '',
        nome: '',
        tipo: 'trimestral',
        dataReferencia: '',
        linkCanva: '',
        linkExterno: '',
        tipoVisualizacao: 'iframe',
        arquivoPdf: null
      });
      
      setDialogAberto(false);
      alert('✅ Relatório salvo no sistema avançado!');
      
    } catch (error: any) {
      console.error('❌ Erro no salvamento avançado:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ========================================
  // OUTRAS FUNÇÕES
  // ========================================
  const excluirRelatorio = async (id: string) => {
    if (confirm('❓ Excluir este relatório permanentemente?')) {
      try {
        const novaLista = relatorios.filter(r => r.id !== id);
        await salvarDadosAvancados(novaLista);
        console.log(`🗑️ Relatório ${id} excluído do sistema avançado`);
      } catch (error) {
        alert('❌ Erro ao excluir relatório');
      }
    }
  };

  const downloadPdf = async (relatorio: RelatorioAdmin) => {
    try {
      let pdfData = relatorio.arquivoPdf;
      
      if (relatorio.arquivoNoIndexedDB && relatorio.fileId) {
        console.log('📥 Carregando PDF do IndexedDB...');
        pdfData = await storageManager.loadFile(relatorio.fileId);
        if (!pdfData) {
          alert('❌ Arquivo não encontrado no sistema');
          return;
        }
      }
      
      if (!pdfData) {
        alert('❌ Nenhum arquivo PDF disponível');
        return;
      }
      
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(pdfData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = relatorio.nomeArquivoPdf || `${relatorio.ticker}_${relatorio.nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('❌ Erro ao baixar PDF:', error);
      alert('❌ Erro ao baixar arquivo');
    }
  };

  // ========================================
  // UPLOAD EM LOTE
  // ========================================
  const adicionarLinhaLote = () => {
    setUploadsLote(prev => [...prev, {
      ticker: '',
      nome: '',
      tipo: 'trimestral',
      dataReferencia: '',
      linkCanva: '',
      linkExterno: '',
      tipoVisualizacao: 'iframe',
      arquivoPdf: null
    }]);
  };

  const atualizarLinhaLote = (index: number, campo: keyof NovoRelatorio, valor: any) => {
    setUploadsLote(prev => {
      const nova = [...prev];
      nova[index] = { ...nova[index], [campo]: valor };
      return nova;
    });
  };

  const removerLinhaLote = (index: number) => {
    setUploadsLote(prev => prev.filter((_, i) => i !== index));
  };

  const salvarLoteCompleto = async () => {
    const linhasValidas = uploadsLote.filter(upload => upload.ticker && upload.nome);
    
    if (linhasValidas.length === 0) {
      alert('❌ Adicione pelo menos um relatório válido');
      return;
    }

    try {
      setLoading(true);
      const novosRelatorios: RelatorioAdmin[] = [];

      for (let i = 0; i < linhasValidas.length; i++) {
        const upload = linhasValidas[i];
        setUploadProgress((i / linhasValidas.length) * 80);
        
        let dadosPdf = {};
        if (upload.arquivoPdf) {
          if (upload.arquivoPdf.size <= LIMITE_MAXIMO) {
            dadosPdf = await processarPdfAvancado(upload.arquivoPdf, storageManager);
          }
        }

        const novoId = `${upload.ticker}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        novosRelatorios.push({
          id: novoId,
          ticker: upload.ticker,
          nome: upload.nome,
          tipo: upload.tipo,
          dataReferencia: upload.dataReferencia,
          dataUpload: new Date().toISOString(),
          linkCanva: upload.linkCanva || undefined,
          linkExterno: upload.linkExterno || undefined,
          tipoVisualizacao: upload.tipoVisualizacao,
          ...dadosPdf
        });
      }

      setUploadProgress(90);
      
      const novaLista = [...relatorios, ...novosRelatorios];
      await salvarDadosAvancados(novaLista);
      
      setUploadsLote([]);
      setUploadProgress(100);
      alert(`✅ ${novosRelatorios.length} relatórios salvos no sistema avançado!`);
      
    } catch (error: any) {
      console.error('❌ Erro no lote avançado:', error);
      alert(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  // ========================================
  // ESTATÍSTICAS
  // ========================================
  const estatisticas = useMemo(() => {
    const totalRelatorios = relatorios.length;
    const relatoriosPorTicker = relatorios.reduce((acc, r) => {
      acc[r.ticker] = (acc[r.ticker] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const tickersComRelatorios = Object.keys(relatoriosPorTicker).length;
    
    const relatoriosComPdf = relatorios.filter(r => 
      r.arquivoPdf || r.nomeArquivoPdf || r.arquivoNoIndexedDB
    ).length;
    
    const tamanhoTotal = relatorios.reduce((sum, r) => sum + (r.tamanhoArquivo || 0), 0);
    
    const sistemasStorage = {
      localStorage: relatorios.filter(r => r.tipoPdf === 'localStorage').length,
      indexedDB: relatorios.filter(r => r.tipoPdf === 'indexedDB' || r.arquivoNoIndexedDB).length
    };
    
    return {
      totalRelatorios,
      tickersComRelatorios,
      relatoriosComPdf,
      tamanhoTotalMB: (tamanhoTotal / 1024 / 1024).toFixed(1),
      sistemasStorage
    };
  }, [relatorios]);

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Central de Relatórios Avançada
          </h1>
          <p className="text-gray-600">
            Sistema híbrido com armazenamento ilimitado
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setDialogStorage(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Armazenamento</span>
          </button>
          <button
            onClick={() => setDialogAberto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Novo Relatório</span>
          </button>
        </div>
      </div>

      {/* Loading Global */}
      {loading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{width: `${uploadProgress}%`}}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Sistema avançado processando... {uploadProgress}%
          </p>
        </div>
      )}

      {/* Estatísticas Avançadas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {estatisticas.totalRelatorios}
          </div>
          <div className="text-sm text-gray-600">Total de Relatórios</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {estatisticas.relatoriosComPdf}
          </div>
          <div className="text-sm text-gray-600">Com PDFs</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {estatisticas.tamanhoTotalMB}
          </div>
          <div className="text-sm text-gray-600">MB Armazenados</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {estatisticas.sistemasStorage.localStorage}
          </div>
          <div className="text-sm text-gray-600">localStorage</div>
        </div>
        <div className="bg-white rounded-lg p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-cyan-600 mb-2">
            {estatisticas.sistemasStorage.indexedDB}
          </div>
          <div className="text-sm text-gray-600">IndexedDB</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setTabAtiva(0)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabAtiva === 0 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Lista de Relatórios
            </button>
            <button
              onClick={() => setTabAtiva(1)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tabAtiva === 1 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📤 Upload em Lote
            </button>
          </nav>
        </div>

        {/* Tab 0: Lista de Relatórios */}
        {tabAtiva === 0 && (
          <div className="p-6">
            {relatorios.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  🚀 Sistema avançado pronto!
                </h3>
                <p className="text-gray-400 mb-6">
                  Comece adicionando relatórios sem limite de tamanho
                </p>
                <button
                  onClick={() => setDialogAberto(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  ➕ Adicionar Primeiro Relatório
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referência</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sistema</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {relatorios.map((relatorio) => (
                      <tr key={relatorio.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {relatorio.ticker}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {relatorio.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {relatorio.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {relatorio.dataReferencia}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {relatorio.nomeArquivoPdf ? (
                            <div className="flex items-center space-x-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {(relatorio.tamanhoArquivo! / 1024 / 1024).toFixed(1)}MB
                              </span>
                              <button
                                onClick={() => downloadPdf(relatorio)}
                                className="text-blue-600 hover:text-blue-900 text-sm"
                              >
                                📥 Baixar
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sem PDF</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            relatorio.tipoPdf === 'localStorage' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : relatorio.arquivoNoIndexedDB 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {relatorio.tipoPdf === 'localStorage' ? 'Local' :
                             relatorio.arquivoNoIndexedDB ? 'IndexedDB' : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => excluirRelatorio(relatorio.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: Upload em Lote */}
        {tabAtiva === 1 && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">📤 Upload em Lote Avançado</h3>
              <div className="flex space-x-4">
                <button
                  onClick={adicionarLinhaLote}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  ➕ Adicionar Linha
                </button>
                <button
                  onClick={salvarLoteCompleto}
                  disabled={uploadsLote.length === 0 || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Processando...' : `Salvar ${uploadsLote.length} Relatórios`}
                </button>
              </div>
            </div>

            {uploadsLote.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-2">🚀 Upload em Lote Avançado:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Sistema híbrido automático (localStorage + IndexedDB)</li>
                  <li>• Suporte a arquivos de até 50MB</li>
                  <li>• Compressão inteligente de dados</li>
                  <li>• Carregamento sob demanda</li>
                </ul>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker *</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome *</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uploadsLote.map((upload, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <select
                            value={upload.ticker}
                            onChange={(e) => atualizarLinhaLote(index, 'ticker', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="">Selecione...</option>
                            {TICKERS_DISPONIVEIS.map(ticker => (
                              <option key={ticker} value={ticker}>{ticker}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={upload.nome}
                            onChange={(e) => atualizarLinhaLote(index, 'nome', e.target.value)}
                            placeholder="Nome do relatório"
                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={upload.tipo}
                            onChange={(e) => atualizarLinhaLote(index, 'tipo', e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2"
                          >
                            <option value="trimestral">Trimestral</option>
                            <option value="anual">Anual</option>
                            <option value="apresentacao">Apresentação</option>
                            <option value="outros">Outros</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={(e) => {
                              const arquivo = e.target.files?.[0];
                              if (arquivo && arquivo.size <= LIMITE_MAXIMO) {
                                atualizarLinhaLote(index, 'arquivoPdf', arquivo);
                              } else if (arquivo) {
                                alert(`❌ Arquivo muito grande! Máximo 50MB.`);
                                e.target.value = '';
                              }
                            }}
                            className="text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => removerLinhaLote(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - Novo Relatório */}
      {dialogAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">🚀 Adicionar Relatório (Sistema Avançado)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticker *</label>
                <select
                  value={novoRelatorio.ticker}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Selecione...</option>
                  {TICKERS_DISPONIVEIS.map(ticker => (
                    <option key={ticker} value={ticker}>{ticker}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Relatório *</label>
                <input
                  type="text"
                  value={novoRelatorio.nome}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">📄 Upload de PDF (Sistema Avançado)</h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">🚀 Sistema Híbrido Avançado:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>≤500KB:</strong> localStorage (acesso instantâneo)</li>
                  <li>• <strong>&gt;500KB:</strong> IndexedDB (carregamento sob demanda)</li>
                  <li>• <strong>Máximo:</strong> 50MB por arquivo</li>
                  <li>• <strong>Sem limite:</strong> número de arquivos</li>
                </ul>
              </div>
              
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) {
                    if (arquivo.size > LIMITE_MAXIMO) {
                      alert(`❌ Arquivo muito grande! Máximo 50MB.`);
                      e.target.value = '';
                      return;
                    }
                    setNovoRelatorio(prev => ({ ...prev, arquivoPdf: arquivo }));
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              
              {novoRelatorio.arquivoPdf && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-green-700">
                    <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                    <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>💾 Sistema:</strong> {
                      novoRelatorio.arquivoPdf.size <= LIMITE_LOCALSTORAGE ? 
                      'localStorage (Instantâneo)' : 
                      'IndexedDB (Sob Demanda)'
                    }
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDialogAberto(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarRelatorioIndividual}
                disabled={!novoRelatorio.ticker || !novoRelatorio.nome || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : '🚀 Salvar no Sistema Avançado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Estatísticas de Armazenamento */}
      {dialogStorage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">💾 Estatísticas de Armazenamento</h2>
            
            {storageStats ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <strong>🚀 Sistema Híbrido Ativo:</strong><br/>
                    O sistema usa automaticamente localStorage + IndexedDB para maximizar o espaço disponível.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📱 localStorage</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{width: `${Math.min(storageStats.localStorage.percentage, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {storageStats.localStorage.usedMB}MB de ~5MB usado
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🗄️ IndexedDB</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${Math.min(storageStats.indexedDB.percentage, 100)}%`}}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {storageStats.indexedDB.usedMB}MB de ~50MB usado
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">📊 Total: {storageStats.total.usedMB}MB</h4>
                  <p className="text-sm text-gray-600">
                    Sistema otimizado para centenas de relatórios
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Carregando estatísticas...</p>
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDialogStorage(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}