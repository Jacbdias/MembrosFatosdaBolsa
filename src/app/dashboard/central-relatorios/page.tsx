'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Simulação do sistema IndexedDB (substitua pelo arquivo real)
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
  arquivoPdf?: string;
  nomeArquivoPdf?: string;
  tamanhoArquivo?: number;
  tipoPdf?: 'base64' | 'referencia';
  hashArquivo?: string;
  solicitarReupload?: boolean;
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

// Hook simulado para IndexedDB
function useRelatoriosDB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const salvarRelatorios = useCallback(async (relatorios: RelatorioAdmin[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Simular armazenamento em IndexedDB
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('relatorios_indexeddb_sim', JSON.stringify(relatorios));
      return true;
    } catch (err: any) {
      setError('Erro ao salvar: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarRelatorios = useCallback(async (): Promise<RelatorioAdmin[]> => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const dados = localStorage.getItem('relatorios_indexeddb_sim');
      return dados ? JSON.parse(dados) : [];
    } catch (err: any) {
      setError('Erro ao carregar: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const exportarBackup = useCallback(async (): Promise<string | null> => {
    setLoading(true);
    try {
      const dados = localStorage.getItem('relatorios_indexeddb_sim');
      return dados || '{}';
    } catch (err: any) {
      setError('Erro ao exportar: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importarBackup = useCallback(async (dadosJson: string): Promise<boolean> => {
    setLoading(true);
    try {
      localStorage.setItem('relatorios_indexeddb_sim', dadosJson);
      return true;
    } catch (err: any) {
      setError('Erro ao importar: ' + err.message);
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
    exportarBackup,
    importarBackup
  };
}

const LIMITE_BASE64 = 3 * 1024 * 1024; // 3MB
const TICKERS_DISPONIVEIS = [
  'KEPL3', 'AGRO3', 'LEVE3', 'BBAS3', 'BRSR6', 'ABCB4', 'SANB11',
  'TASA4', 'ROMI3', 'EZTC3', 'EVEN3', 'TRIS3', 'FESA4', 'CEAB3'
];

// Ícones como emoji
const UploadIcon = () => <span>📤</span>;
const DownloadIcon = () => <span>📥</span>;
const DeleteIcon = () => <span>🗑</span>;
const AddIcon = () => <span>➕</span>;
const SaveIcon = () => <span>💾</span>;
const BackupIcon = () => <span>💿</span>;
const RestoreIcon = () => <span>🔄</span>;
const CloudUploadIcon = () => <span>☁️</span>;
const DatabaseIcon = () => <span>🗃️</span>;

const calcularHash = async (arquivo: File): Promise<string> => {
  const arrayBuffer = await arquivo.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const converterParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(arquivo);
  });
};

const processarPdfHibrido = async (arquivo: File): Promise<any> => {
  if (arquivo.size <= LIMITE_BASE64) {
    const base64 = await converterParaBase64(arquivo);
    return {
      arquivoPdf: base64,
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      tipoPdf: 'base64'
    };
  } else {
    const hash = await calcularHash(arquivo);
    return {
      nomeArquivoPdf: arquivo.name,
      tamanhoArquivo: arquivo.size,
      hashArquivo: hash,
      tipoPdf: 'referencia',
      solicitarReupload: true
    };
  }
};

export default function CentralRelatorios() {
  // Usar o hook do IndexedDB
  const { 
    loading: dbLoading, 
    error: dbError, 
    salvarRelatorios, 
    carregarRelatorios, 
    exportarBackup, 
    importarBackup 
  } = useRelatoriosDB();

  const [relatorios, setRelatorios] = useState<RelatorioAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabAtiva, setTabAtiva] = useState(0);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogBackup, setDialogBackup] = useState(false);
  const [migracaoFeita, setMigracaoFeita] = useState(false);
  
  const [uploadsLote, setUploadsLote] = useState<NovoRelatorio[]>([]);
  
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

  // Carregar dados na inicialização
  useEffect(() => {
    inicializarDados();
  }, []);

  const inicializarDados = useCallback(async () => {
    try {
      // Verificar se existe dados no localStorage para migrar
      const dadosLocalStorage = localStorage.getItem('relatorios_central');
      if (dadosLocalStorage && !migracaoFeita) {
        const confirmarMigracao = window.confirm(
          '🔄 Detectamos dados no localStorage.\n\n' +
          'Deseja migrar para o novo sistema IndexedDB?\n' +
          '(Recomendado para melhor performance e capacidade)'
        );
        
        if (confirmarMigracao) {
          await migrarDados(dadosLocalStorage);
        }
        setMigracaoFeita(true);
      }
      
      // Carregar dados do IndexedDB
      const dadosCarregados = await carregarRelatorios();
      setRelatorios(dadosCarregados);
      
    } catch (error) {
      console.error('Erro ao inicializar dados:', error);
    }
  }, [carregarRelatorios, migracaoFeita]);

  const migrarDados = useCallback(async (dadosLocalStorage: string) => {
    try {
      setLoading(true);
      
      // Converter estrutura localStorage para lista flat
      const dados = JSON.parse(dadosLocalStorage);
      const listaRelatorios: RelatorioAdmin[] = [];
      
      Object.entries(dados).forEach(([ticker, relatoriosTicker]: [string, any[]]) => {
        relatoriosTicker.forEach(relatorio => {
          listaRelatorios.push({
            ...relatorio,
            ticker
          });
        });
      });
      
      // Salvar no IndexedDB
      const sucesso = await salvarRelatorios(listaRelatorios);
      
      if (sucesso) {
        // Fazer backup do localStorage
        const blob = new Blob([dadosLocalStorage], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_localStorage_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        // Remover do localStorage
        localStorage.removeItem('relatorios_central');
        
        alert('✅ Migração concluída!\nBackup do localStorage foi baixado automaticamente.');
      }
      
    } catch (error) {
      console.error('Erro na migração:', error);
      alert('❌ Erro na migração. Dados preservados no localStorage.');
    } finally {
      setLoading(false);
    }
  }, [salvarRelatorios]);

  const salvarDadosCentralizados = useCallback(async (novaLista: RelatorioAdmin[]) => {
    const sucesso = await salvarRelatorios(novaLista);
    if (sucesso) {
      setRelatorios(novaLista);
    } else {
      alert('❌ Erro ao salvar dados. Tente novamente.');
    }
  }, [salvarRelatorios]);

  const salvarRelatorioIndividual = useCallback(async () => {
    if (!novoRelatorio.ticker || !novoRelatorio.nome) {
      alert('Preencha ticker e nome do relatório');
      return;
    }

    try {
      setLoading(true);
      
      let dadosPdf = {};
      if (novoRelatorio.arquivoPdf) {
        dadosPdf = await processarPdfHibrido(novoRelatorio.arquivoPdf);
      }

      const novoId = `${novoRelatorio.ticker}_${Date.now()}`;
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

      const novaLista = [...relatorios, relatorioCompleto];
      await salvarDadosCentralizados(novaLista);
      
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
      
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      alert('Erro ao processar relatório');
    } finally {
      setLoading(false);
    }
  }, [novoRelatorio, relatorios, salvarDadosCentralizados]);

  const adicionarLinhaLote = useCallback(() => {
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
  }, []);

  const atualizarLinhaLote = useCallback((index: number, campo: keyof NovoRelatorio, valor: any) => {
    setUploadsLote(prev => {
      const nova = [...prev];
      nova[index] = { ...nova[index], [campo]: valor };
      return nova;
    });
  }, []);

  const removerLinhaLote = useCallback((index: number) => {
    setUploadsLote(prev => prev.filter((_, i) => i !== index));
  }, []);

  const salvarLoteCompleto = useCallback(async () => {
    const linhasValidas = uploadsLote.filter(upload => upload.ticker && upload.nome);
    
    if (linhasValidas.length === 0) {
      alert('Adicione pelo menos um relatório válido (ticker + nome)');
      return;
    }

    try {
      setLoading(true);
      const novosRelatorios: RelatorioAdmin[] = [];

      for (const upload of linhasValidas) {
        let dadosPdf = {};
        if (upload.arquivoPdf) {
          dadosPdf = await processarPdfHibrido(upload.arquivoPdf);
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

      const novaLista = [...relatorios, ...novosRelatorios];
      await salvarDadosCentralizados(novaLista);
      
      setUploadsLote([]);
      alert(`✅ ${novosRelatorios.length} relatórios salvos com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao salvar lote:', error);
      alert('Erro ao processar lote de relatórios');
    } finally {
      setLoading(false);
    }
  }, [uploadsLote, relatorios, salvarDadosCentralizados]);

  const excluirRelatorio = useCallback((id: string) => {
    if (confirm('Excluir este relatório?')) {
      const novaLista = relatorios.filter(r => r.id !== id);
      salvarDadosCentralizados(novaLista);
    }
  }, [relatorios, salvarDadosCentralizados]);

  const exportarDados = useCallback(async () => {
    const dados = await exportarBackup();
    if (!dados) {
      alert('Nenhum dado para exportar');
      return;
    }

    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorios_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportarBackup]);

  const importarDados = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const dados = e.target?.result as string;
        const sucesso = await importarBackup(dados);
        
        if (sucesso) {
          const dadosCarregados = await carregarRelatorios();
          setRelatorios(dadosCarregados);
          alert('✅ Dados importados com sucesso!');
          setDialogBackup(false);
        }
      } catch (error) {
        alert('❌ Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [importarBackup, carregarRelatorios]);

  const estatisticas = useMemo(() => {
    const totalRelatorios = relatorios.length;
    const relatoriosPorTicker = Object.groupBy?.(relatorios, r => r.ticker) || {};
    const tickersComRelatorios = Object.keys(relatoriosPorTicker).length;
    
    const relatoriosComPdf = relatorios.filter(r => r.arquivoPdf || r.nomeArquivoPdf).length;
    const tamanhoTotal = relatorios.reduce((sum, r) => sum + (r.tamanhoArquivo || 0), 0);
    
    return {
      totalRelatorios,
      tickersComRelatorios,
      relatoriosComPdf,
      tamanhoTotalMB: (tamanhoTotal / 1024 / 1024).toFixed(1)
    };
  }, [relatorios]);

  const isCarregando = loading || dbLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗃️ Central de Relatórios (IndexedDB)
          </h1>
          <p className="text-gray-600">
            Sistema aprimorado com IndexedDB - Sem limitações de espaço
          </p>
          {dbError && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
              ⚠️ {dbError}
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setDialogBackup(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <BackupIcon /> Backup/Restore
          </button>
          <button
            onClick={() => setDialogAberto(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <AddIcon /> Novo Relatório
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {estatisticas.totalRelatorios}
          </div>
          <div className="text-gray-600 text-sm">Total de Relatórios</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {estatisticas.tickersComRelatorios}
          </div>
          <div className="text-gray-600 text-sm">Tickers com Relatórios</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {estatisticas.relatoriosComPdf}
          </div>
          <div className="text-gray-600 text-sm">Relatórios com PDF</div>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {estatisticas.tamanhoTotalMB}
          </div>
          <div className="text-gray-600 text-sm">MB Armazenados</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setTabAtiva(0)}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                tabAtiva === 0 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Lista de Relatórios
            </button>
            <button
              onClick={() => setTabAtiva(1)}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                tabAtiva === 1 
                ? 'border-blue-500 text-blue-600 bg-blue-50' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📤 Upload em Lote
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isCarregando && (
          <div className="w-full bg-blue-200 h-1">
            <div className="bg-blue-600 h-1 animate-pulse"></div>
          </div>
        )}

        {/* Tab 0: Lista de Relatórios */}
        {tabAtiva === 0 && (
          <div className="p-6">
            {relatorios.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  🗃️ Nenhum relatório cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece adicionando um novo relatório no sistema IndexedDB
                </p>
                <button
                  onClick={() => setDialogAberto(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <AddIcon /> Adicionar Primeiro Relatório
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Ticker</th>
                      <th className="text-left py-3 px-4 font-semibold">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold">Referência</th>
                      <th className="text-left py-3 px-4 font-semibold">Visualização</th>
                      <th className="text-left py-3 px-4 font-semibold">PDF</th>
                      <th className="text-left py-3 px-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorios.map((relatorio) => (
                      <tr key={relatorio.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {relatorio.ticker}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{relatorio.nome}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {relatorio.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4">{relatorio.dataReferencia}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {relatorio.tipoVisualizacao === 'canva' && '🎨 '}
                            {relatorio.tipoVisualizacao === 'iframe' && '🖼️ '}
                            {relatorio.tipoVisualizacao === 'link' && '🔗 '}
                            {relatorio.tipoVisualizacao === 'pdf' && '📄 '}
                            {relatorio.tipoVisualizacao}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {relatorio.nomeArquivoPdf ? (
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                relatorio.tipoPdf === 'base64' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {(relatorio.tamanhoArquivo! / 1024 / 1024).toFixed(1)}MB
                              </span>
                              {relatorio.tipoPdf === 'referencia' && <span>⚠️</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sem PDF</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => excluirRelatorio(relatorio.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <DeleteIcon />
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
              <h3 className="text-lg font-semibold">📤 Upload em Lote</h3>
              <div className="flex gap-3">
                <button
                  onClick={adicionarLinhaLote}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <AddIcon /> Adicionar Linha
                </button>
                <button
                  onClick={salvarLoteCompleto}
                  disabled={uploadsLote.length === 0 || isCarregando}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <SaveIcon /> 
                  {isCarregando ? 'Processando...' : `Salvar ${uploadsLote.length} Relatórios`}
                </button>
              </div>
            </div>

            {uploadsLote.length === 0 ? (
              <div className="text-center py-16 bg-blue-50 rounded-lg">
                <div className="text-blue-600 mb-4">
                  <DatabaseIcon />
                </div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Sistema IndexedDB Ativo
                </h3>
                <p className="text-blue-700 mb-6 max-w-md mx-auto">
                  • Capacidade muito maior que localStorage<br/>
                  • Performance aprimorada para grandes volumes<br/>
                  • Suporte a transações e consultas avançadas
                </p>
                <button
                  onClick={adicionarLinhaLote}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <AddIcon /> Começar Upload em Lote
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-3 font-semibold border">Ticker *</th>
                      <th className="text-left py-3 px-3 font-semibold border">Nome *</th>
                      <th className="text-left py-3 px-3 font-semibold border">Tipo</th>
                      <th className="text-left py-3 px-3 font-semibold border">Referência</th>
                      <th className="text-left py-3 px-3 font-semibold border">Visualização</th>
                      <th className="text-left py-3 px-3 font-semibold border">Link</th>
                      <th className="text-left py-3 px-3 font-semibold border">PDF</th>
                      <th className="text-left py-3 px-3 font-semibold border">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadsLote.map((upload, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-3 border">
                          <select
                            value={upload.ticker}
                            onChange={(e) => atualizarLinhaLote(index, 'ticker', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="">Selecione...</option>
                            {TICKERS_DISPONIVEIS.map(ticker => (
                              <option key={ticker} value={ticker}>{ticker}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 border">
                          <input
                            type="text"
                            value={upload.nome}
                            onChange={(e) => atualizarLinhaLote(index, 'nome', e.target.value)}
                            placeholder="Nome do relatório"
                            className="w-full p-2 border rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 border">
                          <select
                            value={upload.tipo}
                            onChange={(e) => atualizarLinhaLote(index, 'tipo', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="trimestral">Trimestral</option>
                            <option value="anual">Anual</option>
                            <option value="apresentacao">Apresentação</option>
                            <option value="outros">Outros</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 border">
                          <input
                            type="text"
                            value={upload.dataReferencia}
                            onChange={(e) => atualizarLinhaLote(index, 'dataReferencia', e.target.value)}
                            placeholder="Q1 2024"
                            className="w-full p-2 border rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 border">
                          <select
                            value={upload.tipoVisualizacao}
                            onChange={(e) => atualizarLinhaLote(index, 'tipoVisualizacao', e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="iframe">🖼️ Iframe</option>
                            <option value="canva">🎨 Canva</option>
                            <option value="link">🔗 Link</option>
                            <option value="pdf">📄 PDF</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 border">
                          <input
                            type="text"
                            value={
                              upload.tipoVisualizacao === 'canva' 
                                ? upload.linkCanva 
                                : upload.linkExterno
                            }
                            onChange={(e) => {
                              const campo = upload.tipoVisualizacao === 'canva' ? 'linkCanva' : 'linkExterno';
                              atualizarLinhaLote(index, campo, e.target.value);
                            }}
                            placeholder="https://..."
                            className="w-full p-2 border rounded text-sm"
                          />
                        </td>
                        <td className="py-2 px-3 border">
                          <input
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            id={`upload-pdf-${index}`}
                            onChange={(e) => {
                              const arquivo = e.target.files?.[0];
                              if (arquivo) {
                                atualizarLinhaLote(index, 'arquivoPdf', arquivo);
                              }
                            }}
                          />
                          <label htmlFor={`upload-pdf-${index}`}>
                            <button
                              type="button"
                              className={`px-3 py-1 text-sm rounded border ${
                                upload.arquivoPdf 
                                  ? 'bg-green-50 border-green-200 text-green-700' 
                                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {upload.arquivoPdf ? '✅' : 'PDF'}
                            </button>
                          </label>
                          {upload.arquivoPdf && (
                            <div className="text-xs text-gray-600 mt-1">
                              {(upload.arquivoPdf.size / 1024 / 1024).toFixed(1)}MB
                              {upload.arquivoPdf.size > LIMITE_BASE64 ? ' (Ref)' : ' (B64)'}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 border">
                          <button
                            onClick={() => removerLinhaLote(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <DeleteIcon />
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

      {/* Dialog - Novo Relatório Individual */}
      {dialogAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">➕ Adicionar Novo Relatório</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ticker *</label>
                  <select
                    value={novoRelatorio.ticker}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, ticker: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Selecione um ticker...</option>
                    {TICKERS_DISPONIVEIS.map(ticker => (
                      <option key={ticker} value={ticker}>{ticker}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Relatório *</label>
                  <input
                    type="text"
                    value={novoRelatorio.nome}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Nome do relatório"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={novoRelatorio.tipo}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipo: e.target.value as any }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="trimestral">Trimestral</option>
                    <option value="anual">Anual</option>
                    <option value="apresentacao">Apresentação</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data de Referência</label>
                  <input
                    type="text"
                    value={novoRelatorio.dataReferencia}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, dataReferencia: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Q1 2024"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Visualização</label>
                <select
                  value={novoRelatorio.tipoVisualizacao}
                  onChange={(e) => setNovoRelatorio(prev => ({ ...prev, tipoVisualizacao: e.target.value as any }))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="iframe">🖼️ Iframe Genérico</option>
                  <option value="canva">🎨 Canva</option>
                  <option value="link">🔗 Link Externo</option>
                  <option value="pdf">📄 PDF para Download</option>
                </select>
              </div>

              {novoRelatorio.tipoVisualizacao === 'canva' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Link do Canva</label>
                  <input
                    type="text"
                    value={novoRelatorio.linkCanva}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkCanva: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="https://www.canva.com/design/..."
                  />
                </div>
              )}

              {(novoRelatorio.tipoVisualizacao === 'iframe' || novoRelatorio.tipoVisualizacao === 'link') && (
                <div>
                  <label className="block text-sm font-medium mb-2">Link Externo</label>
                  <input
                    type="text"
                    value={novoRelatorio.linkExterno}
                    onChange={(e) => setNovoRelatorio(prev => ({ ...prev, linkExterno: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">📄 Upload de PDF (Sistema Híbrido IndexedDB)</label>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    <strong>🗃️ Sistema IndexedDB:</strong><br/>
                    • <strong>≤3MB:</strong> Base64 (acesso instantâneo)<br/>
                    • <strong>&gt;3MB:</strong> Referência (re-upload quando necessário)<br/>
                    • <strong>Vantagem:</strong> Muito mais espaço disponível que localStorage
                  </p>
                </div>
                
                <input
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  id="upload-pdf-individual"
                  type="file"
                  onChange={(e) => {
                    const arquivo = e.target.files?.[0];
                    if (arquivo) {
                      if (arquivo.size > 10 * 1024 * 1024) {
                        alert('Arquivo muito grande! Máximo 10MB.');
                        e.target.value = '';
                        return;
                      }
                      setNovoRelatorio(prev => ({ ...prev, arquivoPdf: arquivo }));
                    }
                  }}
                />
                <label htmlFor="upload-pdf-individual">
                  <button
                    type="button"
                    className={`w-full py-3 px-4 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 ${
                      novoRelatorio.arquivoPdf 
                        ? 'border-green-300 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CloudUploadIcon />
                    {novoRelatorio.arquivoPdf ? '✅ PDF Selecionado' : '📁 Selecionar PDF'}
                  </button>
                </label>
                
                {novoRelatorio.arquivoPdf && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>📄 Arquivo:</strong> {novoRelatorio.arquivoPdf.name}<br/>
                      <strong>📊 Tamanho:</strong> {(novoRelatorio.arquivoPdf.size / 1024 / 1024).toFixed(2)} MB<br/>
                      <strong>💾 Estratégia:</strong> {novoRelatorio.arquivoPdf.size <= LIMITE_BASE64 ? 'Base64 (Instantâneo)' : 'Referência (Re-upload)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setDialogAberto(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarRelatorioIndividual}
                disabled={!novoRelatorio.ticker || !novoRelatorio.nome || isCarregando}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <SaveIcon />
                {isCarregando ? 'Salvando...' : 'Salvar Relatório'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog - Backup/Restore */}
      {dialogBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">💿 Backup & Restore (IndexedDB)</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>💡 Sistema IndexedDB:</strong><br/>
                  • Backup inclui dados binários (PDFs em Base64)<br/>
                  • Compatível com formato localStorage anterior<br/>
                  • Restauração automática de estruturas
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">📤 Exportar Dados</h3>
                <button
                  onClick={exportarDados}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <DownloadIcon /> Baixar Backup Completo
                </button>
              </div>
              
              <hr className="my-4" />
              
              <div>
                <h3 className="font-medium mb-2">📥 Importar Dados</h3>
                <input
                  accept=".json"
                  style={{ display: 'none' }}
                  id="import-backup"
                  type="file"
                  onChange={importarDados}
                />
                <label htmlFor="import-backup">
                  <button
                    type="button"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <RestoreIcon /> Restaurar do Backup
                  </button>
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-700">
                  <strong>⚠️ Atenção:</strong> Importar dados irá <strong>substituir</strong> todos os relatórios existentes no IndexedDB!
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setDialogBackup(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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