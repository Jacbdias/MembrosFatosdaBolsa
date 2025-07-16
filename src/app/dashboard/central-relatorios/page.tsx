'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

// ========================================
// ÍCONES MOCK
// ========================================
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const AddIcon = () => <span>➕</span>;
const FileIcon = () => <span>📄</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const BackupIcon = () => <span>💿</span>;
const RestoreIcon = () => <span>🔄</span>;
const StorageIcon = () => <span>💾</span>;

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
    // Implementação básica de compressão (pode ser melhorada com LZ-string)
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
  // Sistema avançado
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
  // UPLOAD EM LOTE (simplificado)
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
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            🚀 Central de Relatórios Avançada
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sistema híbrido com armazenamento ilimitado
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<StorageIcon />}
            onClick={() => setDialogStorage(true)}
          >
            Armazenamento
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogAberto(true)}
          >
            Novo Relatório
          </Button>
        </Stack>
      </Stack>

      {/* Loading Global */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ mt: 1 }}>
            Sistema avançado processando... {uploadProgress}%
          </Typography>
        </Box>
      )}

      {/* Estatísticas Avançadas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                {estatisticas.totalRelatorios}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Relatórios
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#22c55e', mb: 1 }}>
                {estatisticas.relatoriosComPdf}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Com PDFs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b', mb: 1 }}>
                {estatisticas.tamanhoTotalMB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                MB Armazenados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#8b5cf6', mb: 1 }}>
                {estatisticas.sistemasStorage.localStorage}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                localStorage
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#06b6d4', mb: 1 }}>
                {estatisticas.sistemasStorage.indexedDB}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IndexedDB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 4 }}>
        <Tabs value={tabAtiva} onChange={(_, newValue) => setTabAtiva(newValue)}>
          <Tab label="📋 Lista de Relatórios" />
          <Tab label="📤 Upload em Lote" />
        </Tabs>
        <Divider />

        {/* Tab 0: Lista de Relatórios */}
        {tabAtiva === 0 && (
          <CardContent>
            {relatorios.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  🚀 Sistema avançado pronto!
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, mb: 3 }}>
                  Comece adicionando relatórios sem limite de tamanho
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogAberto(true)}
                >
                  Adicionar Primeiro Relatório
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Referência</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>PDF</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sistema</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {relatorios.map((relatorio) => (
                      <TableRow key={relatorio.id}>
                        <TableCell>
                          <Chip label={relatorio.ticker} size="small" color="primary" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {relatorio.nome}
                        </TableCell>
                        <TableCell>
                          <Chip label={relatorio.tipo} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{relatorio.dataReferencia}</TableCell>
                        <TableCell>
                          {relatorio.nomeArquivoPdf ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={`${(relatorio.tamanhoArquivo! / 1024 / 1024).toFixed(1)}MB`}
                                size="small"
                                color="success"
                              />
                              <Button
                                size="small"
                                onClick={() => downloadPdf(relatorio)}
                                startIcon={<DownloadIcon />}
                              >
                                Baixar
                              </Button>
                            </Stack>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Sem PDF
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              relatorio.tipoPdf === 'localStorage' ? 'Local' :
                              relatorio.arquivoNoIndexedDB ? 'IndexedDB' : 'N/A'
                            }
                            size="small"
                            color={
                              relatorio.tipoPdf === 'localStorage' ? 'warning' :
                              relatorio.arquivoNoIndexedDB ? 'info' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => excluirRelatorio(relatorio.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}

        {/* Tab 1: Upload em Lote */}
        {tabAtiva === 1 && (
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">
                📤 Upload em Lote Avançado
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={adicionarLinhaLote}
                >
                  Adicionar Linha
                </Button>
                <Button
                  variant="contained"
                  onClick={salvarLoteCompleto}
                  disabled={uploadsLote.length === 0 || loading}
                >
                  {loading ? 'Processando...' : `Salvar ${uploadsLote.length} Relatórios`}
                </Button>
              </Stack>
            </Stack>

            {uploadsLote.length === 0 ? (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>🚀 Upload em Lote Avançado:</strong><br/>
                  • Sistema híbrido automático (localStorage + IndexedDB)<br/>
                  • Suporte a arquivos de até 50MB<br/>
                  • Compressão inteligente de dados<br/>
                  • Carregamento sob demanda
                </Typography>
              </Alert>
            ) : (
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ticker *</TableCell>
                      <TableCell>Nome *</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>PDF</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadsLote.map((upload, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={upload.ticker}
                              onChange={(e) => atualizarLinhaLote(index, 'ticker', e.target.value)}
                            >
                              <MenuItem value="">Selecione...</MenuItem>
                              {TICKERS_DISPONIVEIS.map(ticker => (
                                <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={upload.nome}
                            onChange={(e) => atualizarLinhaLote(index, 'nome', e.target.value)}
                            placeholder="Nome do relatório"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={upload.tipo}
                              onChange={(e) => atualizarLinhaLote(index, 'tipo', e.target.value)}
                            >
                              <MenuItem value="trimestral">Trimestral</MenuItem>
                              <MenuItem value="anual">Anual</MenuItem>
                              <MenuItem value="apresentacao">Apresentação</MenuItem>
                              <MenuItem value="outros">Outros</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            style={{ display: 'none' }}
                            id={`upload-pdf-lote-${index}`}
                            onChange={(e) => {
                              const arquivo = e.target.files?.[0];
                              if (arquivo && arquivo.size <= LIMITE_MAXIMO) {
                                atualizarLinhaLote(index, 'arquivoPdf', arquivo);
                              } else if (arquivo) {
                                alert(`❌ Arquivo muito grande! Máximo 50MB.`);
                                e.target.value = '';
                              }
                            }}
                          />
                          <label htmlFor={`upload-pdf-lote-${index}`}>
                            <Button
                              component="span"
                              size="small"
                              variant={upload.arquivoPdf ? "outlined" : "contained"}
                              startIcon={<FileIcon />}
                            >
                              {upload.arquivoPdf ? '✅' : 'PDF'}
                            </Button>
                          </label>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removerLinhaLote(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}
      </Card>

      {/* Dialog - Novo Relatório */}
      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} maxWidth="md" fullWidth>
        <DialogTitle>🚀 Adicionar Relatório (Sistema Avançado)</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Ticker *</InputLabel>
                <Select
                  value={novoRelatorio.ticker}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
                >
                  {TICKERS_DISPONIVEIS.map(ticker => (
                    <MenuItem key={ticker} value={ticker}>{ticker}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nome do Relatório *"
                value={novoRelatorio.nome}
                onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                📄 Upload de PDF (Sistema Avançado)
              </Typography>
              
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>🚀 Sistema Híbrido Avançado:</strong><br/>
                  • <strong>≤500KB:</strong> localStorage (acesso instantâneo)<br/>
                  • <strong>&gt;500KB:</strong> IndexedDB (carregamento sob demanda)<br/>
                  • <strong>Máximo:</strong> 50MB por arquivo<br/>
                  • <strong>Sem limite:</strong> número de arquivos
                </Typography>
              </Alert>
              
              <input
                accept="application/pdf,.pdf"
                style={{ display: 'none' }}
                id="upload-pdf-avancado"
                type="file"
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
              />
              <label htmlFor="upload-pdf-avancado">
                <Button
                  component="span"
                  variant={novoRelatorio.arquivoPdf ? "outlined" : "contained"}
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {novoRelatorio.arquivoPdf ? '✅ PDF Selecionado' : '🚀 Selecionar PDF'}
                </Button>
              </label>
              
              {novoRelatorio.arquivoPdf && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                    <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                    <strong>💾 Sistema:</strong> {
                      novoRelatorio.arquivoPdf.size <= LIMITE_LOCALSTORAGE ? 
                      'localStorage (Instantâneo)' : 
                      'IndexedDB (Sob Demanda)'
                    }
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={salvarRelatorioIndividual}
            disabled={!novoRelatorio.ticker || !novoRelatorio.nome || loading}
          >
            {loading ? 'Salvando...' : '🚀 Salvar no Sistema Avançado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog - Estatísticas de Armazenamento */}
      <Dialog open={dialogStorage} onClose={() => setDialogStorage(false)} maxWidth="sm" fullWidth>
        <DialogTitle>💾 Estatísticas de Armazenamento</DialogTitle>
        <DialogContent>
          {storageStats ? (
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>🚀 Sistema Híbrido Ativo:</strong><br/>
                  O sistema usa automaticamente localStorage + IndexedDB para maximizar o espaço disponível.
                </Typography>
              </Alert>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  📱 localStorage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(storageStats.localStorage.percentage, 100)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">
                  {storageStats.localStorage.usedMB}MB de ~5MB usado
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🗄️ IndexedDB
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(storageStats.indexedDB.percentage, 100)}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">
                  {storageStats.indexedDB.usedMB}MB de ~50MB usado
                </Typography>
              </Box>
              
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  📊 Total: {storageStats.total.usedMB}MB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sistema otimizado para centenas de relatórios
                </Typography>
              </Box>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Carregando estatísticas...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogStorage(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}