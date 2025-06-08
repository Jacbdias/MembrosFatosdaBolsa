import React, { useState, useEffect } from 'react';

// Dados existentes do seu sistema (importados do arquivo original)
const dadosIniciais = {
  empresas: {
    'ALOS3': {
      ticker: 'ALOS3',
      nomeCompleto: 'Allos S.A.',
      setor: 'Consumo Cíclico',
      descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
      dataEntrada: '15/01/2021',
      precoIniciou: 'R$ 26,68',
      precoTeto: 'R$ 23,76',
      viesAtual: 'Neutro',
      ibovespaEpoca: '108.500',
      percentualCarteira: '4.2%',
      marketCap: 'R$ 8.2 bi',
      pl: '12.5',
      pvp: '0.8',
      roe: '15.2%',
      proventos: [
        { tipo: 'Dividendo', valor: 'R$ 0,45', dataEx: '15/04/2024', dataPagamento: '29/04/2024', status: 'Pago' },
        { tipo: 'JCP', valor: 'R$ 0,32', dataEx: '15/01/2024', dataPagamento: '28/01/2024', status: 'Pago' }
      ],
      relatorios: [
        { nome: 'Relatório Trimestral Q1 2024', data: '2024-05-15', tipo: 'Trimestral' },
        { nome: 'Demonstrações Financeiras 2023', data: '2024-03-20', tipo: 'Anual' }
      ]
    },
    'TUPY3': {
      ticker: 'TUPY3',
      nomeCompleto: 'Tupy S.A.',
      setor: 'Bens Industriais',
      descricao: 'A Tupy é líder mundial na fundição de ferro fundido para a indústria automotiva.',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/TUPY.png',
      dataEntrada: '04/11/2020',
      precoIniciou: 'R$ 20,36',
      precoTeto: 'R$ 31,50',
      viesAtual: 'Compra',
      ibovespaEpoca: '115.200',
      percentualCarteira: '6.8%',
      marketCap: 'R$ 3.8 bi',
      pl: '8.2',
      pvp: '1.4',
      roe: '18.7%',
      proventos: [
        { tipo: 'Dividendo', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
        { tipo: 'Dividendo', valor: 'R$ 0,65', dataEx: '15/02/2024', dataPagamento: '28/02/2024', status: 'Pago' }
      ],
      relatorios: [
        { nome: 'Relatório Anual 2023', data: '2024-04-10', tipo: 'Anual' },
        { nome: 'Balanço Q1 2024', data: '2024-05-08', tipo: 'Trimestral' }
      ]
    }
    // Adicione mais empresas aqui...
  },
  fiis: {
    'MALL11': {
      ticker: 'MALL11',
      nomeCompleto: 'Shopping Outlets Premium FII',
      setor: 'Shopping',
      tipo: 'FII',
      descricao: 'O Shopping Outlets Premium FII é especializado em shopping centers premium e outlets.',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/MALL.png',
      dataEntrada: '26/01/2022',
      precoIniciou: 'R$ 118,27',
      precoTeto: 'R$ 109,68',
      viesAtual: 'Compra',
      ibovespaEpoca: '114.200',
      percentualCarteira: '8.5%',
      patrimonio: 'R$ 2.1 bilhões',
      p_vp: '1.08',
      vacancia: '4,2%',
      imoveis: 47,
      gestora: 'BTG Pactual',
      proventos: [
        { tipo: 'Rendimento', valor: 'R$ 0,85', dataEx: '15/05/2024', dataPagamento: '29/05/2024', status: 'Pago' },
        { tipo: 'Rendimento', valor: 'R$ 0,92', dataEx: '15/04/2024', dataPagamento: '28/04/2024', status: 'Pago' }
      ],
      relatorios: [
        { nome: 'Informe Mensal - Maio 2024', data: '2024-06-01', tipo: 'Mensal' },
        { nome: 'Relatório Trimestral Q1 2024', data: '2024-04-15', tipo: 'Trimestral' }
      ]
    }
    // Adicione mais FIIs aqui...
  }
};

// Interface para dados da API (preços em tempo real)
interface DadosAPI {
  [ticker: string]: {
    precoAtual: string;
    variacao: string;
    variacaoHoje: string;
    dy: string;
    tendencia: 'up' | 'down';
    rendProventos: string;
    ibovespaVariacao: string;
  };
}

interface BaseAtivo {
  ticker: string;
  nomeCompleto: string;
  setor: string;
  descricao: string;
  avatar: string;
  dataEntrada: string;
  precoIniciou: string;
  precoTeto: string;
  viesAtual: string;
  ibovespaEpoca: string;
  percentualCarteira: string;
  proventos: Provento[];
  relatorios: Relatorio[];
  // Dados dinâmicos da API
  precoAtual?: string;
  variacao?: string;
  variacaoHoje?: string;
  dy?: string;
  tendencia?: 'up' | 'down';
  rendProventos?: string;
  ibovespaVariacao?: string;
}

interface Empresa extends BaseAtivo {
  tipo?: never;
  marketCap: string;
  pl: string;
  pvp: string;
  roe: string;
}

interface FII extends BaseAtivo {
  tipo: 'FII';
  patrimonio: string;
  p_vp: string;
  vacancia: string;
  imoveis: number;
  gestora: string;
}

interface Provento {
  tipo: string;
  valor: string;
  dataEx: string;
  dataPagamento: string;
  status: string;
}

interface Relatorio {
  nome: string;
  data: string;
  tipo: string;
  canvaUrl?: string;
  downloadUrl?: string;
}

type Ativo = Empresa | FII;

const AdminIntegrado = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [dadosAPI, setDadosAPI] = useState<DadosAPI>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAtivo, setEditingAtivo] = useState<Ativo | null>(null);
  const [formData, setFormData] = useState<Partial<Ativo>>({});
  const [proventosTemp, setProventosTemp] = useState<Provento[]>([]);
  const [relatoriosTemp, setRelatoriosTemp] = useState<Relatorio[]>([]);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });
  const [isLoadingAPI, setIsLoadingAPI] = useState(false);

  const [dadosIbovespa, setDadosIbovespa] = useState<{valor: string, variacao: string}>({valor: '', variacao: ''});

  // Inicializar dados na primeira execução
  useEffect(() => {
    inicializarDados();
    buscarDadosAPI();
    buscarIbovespa();
    
    // Atualizar dados da API a cada 30 segundos
    const interval = setInterval(() => {
      buscarDadosAPI();
      buscarIbovespa();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const inicializarDados = () => {
    const dadosSalvos = localStorage.getItem('portfolioDataAdmin');
    
    if (dadosSalvos) {
      // Se já tem dados salvos, usar eles
      setAtivos(JSON.parse(dadosSalvos));
      showNotification('Dados carregados do storage local');
    } else {
      // Primeira execução - carregar dados iniciais
      const ativosIniciais = [
        ...Object.values(dadosIniciais.empresas),
        ...Object.values(dadosIniciais.fiis)
      ];
      setAtivos(ativosIniciais);
      localStorage.setItem('portfolioDataAdmin', JSON.stringify(ativosIniciais));
      showNotification('Dados iniciais carregados e salvos');
    }
  };

  // Buscar dados do Ibovespa
  const buscarIbovespa = async () => {
    try {
      const response = await fetch(
        `https://brapi.dev/api/quote/^BVSP?token=jJrMYVy9MATGEicx3GxBp8`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results[0]) {
          const ibov = data.results[0];
          setDadosIbovespa({
            valor: `${Math.round(ibov.regularMarketPrice).toLocaleString('pt-BR')}`,
            variacao: `${ibov.regularMarketChangePercent >= 0 ? '+' : ''}${ibov.regularMarketChangePercent.toFixed(2)}%`.replace('.', ',')
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar Ibovespa:', error);
    }
  };

  // Buscar dados da API Brapi
  const buscarDadosAPI = async () => {
    setIsLoadingAPI(true);
    try {
      // Extrair apenas os tickers dos ativos para buscar na API
      const tickers = ativos.map(ativo => ativo.ticker).join(',');
      
      if (!tickers) {
        showNotification('Nenhum ativo para buscar na API');
        setIsLoadingAPI(false);
        return;
      }

      // Chamada para a API da Brapi
      const response = await fetch(
        `https://brapi.dev/api/quote/${tickers}?token=jJrMYVy9MATGEicx3GxBp8&fundamental=true&dividends=true`
      );
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        throw new Error('Nenhum dado retornado da API');
      }

      // Processar dados da API Brapi
      const dadosProcessados: DadosAPI = {};
      
      data.results.forEach((stock: any) => {
        const ticker = stock.symbol;
        const preco = stock.regularMarketPrice;
        const variacao = stock.regularMarketChangePercent;
        const variacaoHoje = stock.regularMarketChangePercent;
        
        // Calcular DY se disponível
        let dy = '0,00%';
        if (stock.dividendsData && stock.dividendsData.yield) {
          dy = `${(stock.dividendsData.yield * 100).toFixed(2)}%`.replace('.', ',');
        } else if (stock.summaryProfile && stock.summaryProfile.dividendYield) {
          dy = `${(stock.summaryProfile.dividendYield * 100).toFixed(2)}%`.replace('.', ',');
        }

        // Determinar tendência baseada na variação
        const tendencia: 'up' | 'down' = variacao >= 0 ? 'up' : 'down';
        
        // Calcular rendimento total baseado no preço inicial
        const ativoOriginal = ativos.find(a => a.ticker === ticker);
        let rendProventos = '0,00%';
        if (ativoOriginal && ativoOriginal.precoIniciou) {
          const precoInicial = parseFloat(ativoOriginal.precoIniciou.replace('R$ ', '').replace(',', '.'));
          if (precoInicial > 0) {
            const rendimento = ((preco - precoInicial) / precoInicial) * 100;
            rendProventos = `${rendimento >= 0 ? '+' : ''}${rendimento.toFixed(1)}%`.replace('.', ',');
          }
        }

        dadosProcessados[ticker] = {
          precoAtual: `R$ ${preco.toFixed(2)}`.replace('.', ','),
          variacao: `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%`.replace('.', ','),
          variacaoHoje: `${variacaoHoje >= 0 ? '+' : ''}${variacaoHoje.toFixed(1)}%`.replace('.', ','),
          dy: dy,
          tendencia: tendencia,
          rendProventos: rendProventos,
          ibovespaVariacao: dadosIbovespa.variacao || '+0,00%'
        };
      });
      
      setDadosAPI(dadosProcessados);
      showNotification(`Cotações atualizadas via Brapi (${Object.keys(dadosProcessados).length} ativos)`);
    } catch (error) {
      console.error('Erro ao buscar dados da API Brapi:', error);
      showNotification('Erro ao atualizar cotações via Brapi', 'error');
    } finally {
      setIsLoadingAPI(false);
    }
  };

  const salvarDados = (novosAtivos: Ativo[]) => {
    // Salvar apenas dados estáticos (sem os dados da API)
    const dadosEstaticos = novosAtivos.map(ativo => {
      const { precoAtual, variacao, variacaoHoje, dy, tendencia, rendProventos, ibovespaVariacao, ...dadosEstaticos } = ativo;
      return dadosEstaticos;
    });
    
    localStorage.setItem('portfolioDataAdmin', JSON.stringify(dadosEstaticos));
    setAtivos(novosAtivos);
  };

  // Combinar dados estáticos com dados da API
  const ativosCombinados = ativos.map(ativo => ({
    ...ativo,
    ...(dadosAPI[ativo.ticker] || {})
  }));

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => setNotification({ open: false, message: '', type: 'success' }), 4000);
  };

  const handleOpenDialog = (ativo?: Ativo) => {
    if (ativo) {
      setEditingAtivo(ativo);
      // Não incluir dados da API no formulário (apenas dados estáticos)
      const { precoAtual, variacao, variacaoHoje, dy, tendencia, rendProventos, ibovespaVariacao, ...dadosEstaticos } = ativo;
      setFormData(dadosEstaticos);
      setProventosTemp(ativo.proventos || []);
      setRelatoriosTemp(ativo.relatorios || []);
    } else {
      setEditingAtivo(null);
      setFormData({
        tipo: undefined,
        proventos: [],
        relatorios: [],
        tendencia: 'up'
      });
      setProventosTemp([]);
      setRelatoriosTemp([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAtivo(null);
    setFormData({});
    setProventosTemp([]);
    setRelatoriosTemp([]);
  };

  const handleSaveAtivo = () => {
    if (!formData.ticker || !formData.nomeCompleto) {
      showNotification('Ticker e Nome Completo são obrigatórios', 'error');
      return;
    }

    const ativoCompleto: Ativo = {
      ...formData,
      proventos: proventosTemp,
      relatorios: relatoriosTemp,
      // Manter dados da API se existir
      ...(dadosAPI[formData.ticker!] || {})
    } as Ativo;

    let novosAtivos;
    if (editingAtivo) {
      novosAtivos = ativos.map(a => a.ticker === editingAtivo.ticker ? ativoCompleto : a);
      showNotification('Ativo atualizado com sucesso!');
    } else {
      if (ativos.find(a => a.ticker === formData.ticker)) {
        showNotification('Ticker já existe!', 'error');
        return;
      }
      novosAtivos = [...ativos, ativoCompleto];
      showNotification('Ativo criado com sucesso!');
    }

    salvarDados(novosAtivos);
    handleCloseDialog();
  };

  const handleDeleteAtivo = (ticker: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      const novosAtivos = ativos.filter(a => a.ticker !== ticker);
      salvarDados(novosAtivos);
      showNotification('Ativo excluído com sucesso!');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      ativos: ativos,
      dadosAPI: dadosAPI,
      timestamp: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Dados exportados com sucesso!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData.ativos) {
            salvarDados(importedData.ativos);
            showNotification('Dados importados com sucesso!');
          } else {
            showNotification('Formato de arquivo inválido', 'error');
          }
        } catch (error) {
          showNotification('Erro ao importar dados. Verifique o formato do arquivo.', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const addProvento = () => {
    setProventosTemp([...proventosTemp, {
      tipo: 'Dividendo',
      valor: '',
      dataEx: '',
      dataPagamento: '',
      status: 'Aprovado'
    }]);
  };

  const addRelatorio = () => {
    setRelatoriosTemp([...relatoriosTemp, {
      nome: '',
      data: '',
      tipo: 'Trimestral',
      canvaUrl: '',
      downloadUrl: ''
    }]);
  };

  const removeProvento = (index: number) => {
    setProventosTemp(proventosTemp.filter((_, i) => i !== index));
  };

  const removeRelatorio = (index: number) => {
    setRelatoriosTemp(relatoriosTemp.filter((_, i) => i !== index));
  };

  const updateProvento = (index: number, field: keyof Provento, value: string) => {
    const updated = [...proventosTemp];
    updated[index] = { ...updated[index], [field]: value };
    setProventosTemp(updated);
  };

  const updateRelatorio = (index: number, field: keyof Relatorio, value: string) => {
    const updated = [...relatoriosTemp];
    updated[index] = { ...updated[index], [field]: value };
    setRelatoriosTemp(updated);
  };

  const isFII = formData.tipo === 'FII';

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '32px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    headerTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      margin: '0 0 8px 0'
    },
    headerSubtitle: {
      fontSize: '1rem',
      opacity: 0.9,
      margin: 0
    },
    apiStatus: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: 'rgba(255,255,255,0.2)'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    cardContent: {
      padding: '24px'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: 'white',
      borderRadius: '12px 12px 0 0'
    },
    tab: {
      padding: '16px 24px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      fontSize: '1rem',
      fontWeight: '500',
      borderBottom: '2px solid transparent'
    },
    activeTab: {
      borderBottomColor: '#3b82f6',
      color: '#3b82f6',
      fontWeight: '600'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    buttonPrimary: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db'
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
      color: 'white'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const
    },
    th: {
      padding: '16px',
      textAlign: 'left' as const,
      backgroundColor: '#f8fafc',
      fontWeight: '600',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #e5e7eb'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      marginBottom: '16px'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      marginBottom: '16px',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '1rem',
      marginBottom: '16px',
      minHeight: '80px',
      resize: 'vertical' as const
    },
    grid: {
      display: 'grid',
      gap: '16px'
    },
    gridCols2: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
    },
    gridCols3: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    },
    gridCols4: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '90%',
      overflow: 'auto'
    },
    modalHeader: {
      padding: '24px 24px 0 24px',
      borderBottom: '1px solid #e5e7eb'
    },
    modalBody: {
      padding: '24px'
    },
    modalFooter: {
      padding: '0 24px 24px 24px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    notification: {
      position: 'fixed' as const,
      top: '24px',
      right: '24px',
      padding: '16px 24px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      zIndex: 2000,
      transform: 'translateX(0)',
      transition: 'transform 0.3s ease'
    },
    notificationSuccess: {
      backgroundColor: '#22c55e'
    },
    notificationError: {
      backgroundColor: '#ef4444'
    },
    chip: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    chipPrimary: {
      backgroundColor: '#dbeafe',
      color: '#1d4ed8'
    },
    chipSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    chipError: {
      backgroundColor: '#fecaca',
      color: '#991b1b'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={styles.headerTitle}>🛠️ Administração do Portfólio</h1>
            <p style={styles.headerSubtitle}>Gerencie seus ativos com dados em tempo real</p>
            <div style={styles.apiStatus}>
              <span>{isLoadingAPI ? '🔄' : '🟢'}</span>
              <span>{isLoadingAPI ? 'Atualizando...' : 'Brapi Conectada'}</span>
              {dadosIbovespa.valor && (
                <span style={{ marginLeft: '16px' }}>
                  📊 Ibovespa: {dadosIbovespa.valor} ({dadosIbovespa.variacao})
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              style={{...styles.button, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white'}}
              onClick={() => {
                buscarDadosAPI();
                buscarIbovespa();
              }}
              disabled={isLoadingAPI}
            >
              🔄 Atualizar Brapi
            </button>
            <button
              style={{...styles.button, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white'}}
              onClick={handleExportData}
            >
              📥 Exportar Dados
            </button>
            <label style={{...styles.button, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer'}}>
              📤 Importar Dados
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.card}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 0 ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(0)}
          >
            📈 Ações ({ativosCombinados.filter(a => !a.tipo).length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 1 ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(1)}
          >
            🏢 FIIs ({ativosCombinados.filter(a => a.tipo === 'FII').length})
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 2 ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab(2)}
          >
            ⚙️ Configurações
          </button>
        </div>
      </div>

      {/* Lista de Ativos */}
      {activeTab < 2 && (
        <div style={styles.card}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontWeight: '600' }}>
                {activeTab === 0 ? 'Ações' : 'FIIs'}
                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal', marginLeft: '8px' }}>
                  (Preços atualizados via API)
                </span>
              </h2>
              <button
                style={{...styles.button, ...styles.buttonPrimary}}
                onClick={() => handleOpenDialog()}
              >
                ➕ Adicionar {activeTab === 0 ? 'Ação' : 'FII'}
              </button>
            </div>
          </div>

          <div style={{ overflow: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ticker</th>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Preço (API)</th>
                  <th style={styles.th}>Variação (API)</th>
                  <th style={styles.th}>DY (API)</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ativosCombinados
                  .filter(a => activeTab === 0 ? !a.tipo : a.tipo === 'FII')
                  .map((ativo) => (
                  <tr key={ativo.ticker}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={ativo.avatar} 
                          alt={ativo.ticker}
                          style={{ width: '32px', height: '32px', borderRadius: '4px' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e5e7eb"/><text x="16" y="20" text-anchor="middle" fill="%236b7280" font-size="12">?</text></svg>';
                          }}
                        />
                        <span style={{ fontWeight: '600' }}>{ativo.ticker}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{ativo.nomeCompleto}</div>
                        {ativo.tipo === 'FII' && (
                          <span style={{...styles.chip, ...styles.chipPrimary, marginTop: '4px'}}>FII</span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>{ativo.setor}</td>
                    <td style={{...styles.td, fontWeight: '600'}}>
                      {ativo.precoAtual || 'N/A'}
                      {dadosAPI[ativo.ticker] && (
                        <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>●</div>
                      )}
                    </td>
                    <td style={{
                      ...styles.td,
                      fontWeight: '600',
                      color: ativo.tendencia === 'up' ? '#22c55e' : '#ef4444'
                    }}>
                      {ativo.variacao || 'N/A'}
                    </td>
                    <td style={{...styles.td, fontWeight: '600', color: '#22c55e'}}>
                      {ativo.dy || 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          style={{...styles.button, ...styles.buttonSecondary, padding: '8px'}}
                          onClick={() => handleOpenDialog(ativo)}
                        >
                          ✏️
                        </button>
                        <button
                          style={{...styles.button, ...styles.buttonDanger, padding: '8px'}}
                          onClick={() => handleDeleteAtivo(ativo.ticker)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configurações */}
      {activeTab === 2 && (
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h2 style={{ marginTop: 0, fontWeight: '600' }}>⚙️ Configurações do Sistema</h2>
            
            <div style={{...styles.grid, ...styles.gridCols2}}>
              <div style={{...styles.card, margin: 0}}>
                <div style={styles.cardContent}>
                  <h3 style={{ marginTop: 0, fontWeight: '600' }}>📊 Estatísticas do Portfólio</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total de Ações:</span>
                      <span style={{ fontWeight: '600' }}>{ativosCombinados.filter(a => !a.tipo).length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total de FIIs:</span>
                      <span style={{ fontWeight: '600' }}>{ativosCombinados.filter(a => a.tipo === 'FII').length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total de Ativos:</span>
                      <span style={{ fontWeight: '600' }}>{ativosCombinados.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ativos com API:</span>
                      <span style={{ fontWeight: '600', color: '#22c55e' }}>
                        {Object.keys(dadosAPI).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{...styles.card, margin: 0}}>
                <div style={styles.cardContent}>
                  <h3 style={{ marginTop: 0, fontWeight: '600' }}>🔄 Ações de Sistema</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      style={{...styles.button, ...styles.buttonPrimary}}
                      onClick={() => {
                        const ativosIniciais = [
                          ...Object.values(dadosIniciais.empresas),
                          ...Object.values(dadosIniciais.fiis)
                        ];
                        salvarDados(ativosIniciais);
                        showNotification('Dados iniciais restaurados!');
                      }}
                    >
                      🔄 Restaurar Dados Iniciais
                    </button>
                    <button
                      style={{...styles.button, ...styles.buttonSecondary}}
                      onClick={() => {
                        buscarDadosAPI();
                        buscarIbovespa();
                      }}
                      disabled={isLoadingAPI}
                    >
                      🔄 Atualizar Brapi Manualmente
                    </button>
                    <button
                      style={{...styles.button, ...styles.buttonDanger}}
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
                          localStorage.removeItem('portfolioDataAdmin');
                          setAtivos([]);
                          setDadosAPI({});
                          showNotification('Dados limpos com sucesso!');
                        }
                      }}
                    >
                      🗑️ Limpar Todos os Dados
                    </button>
                  </div>
                </div>
              </div>

              <div style={{...styles.card, margin: 0}}>
                <div style={styles.cardContent}>
                  <h3 style={{ marginTop: 0, fontWeight: '600' }}>🔌 Status da Brapi</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Status:</span>
                      <span style={{ 
                        fontWeight: '600', 
                        color: isLoadingAPI ? '#f59e0b' : '#22c55e' 
                      }}>
                        {isLoadingAPI ? 'Carregando...' : 'Conectado'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Última atualização:</span>
                      <span style={{ fontWeight: '600' }}>
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ativos com cotação:</span>
                      <span style={{ fontWeight: '600', color: '#22c55e' }}>
                        {Object.keys(dadosAPI).length}
                      </span>
                    </div>
                    {dadosIbovespa.valor && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Ibovespa:</span>
                        <span style={{ fontWeight: '600' }}>
                          {dadosIbovespa.valor} ({dadosIbovespa.variacao})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{...styles.card, margin: 0}}>
                <div style={styles.cardContent}>
                  <h3 style={{ marginTop: 0, fontWeight: '600' }}>📋 Integração Brapi</h3>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <p><strong>Via Brapi API (automático):</strong></p>
                    <p>• Preços em tempo real, Variações, DY</p>
                    <p>• Dados fundamentalistas</p>
                    <p>• Ibovespa atual</p>
                    <p><strong>Via Admin (manual):</strong></p>
                    <p>• Dados da empresa, Proventos, Relatórios</p>
                    <p>• Informações de posição e análise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      {openDialog && (
        <div style={styles.modal} onClick={handleCloseDialog}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: '0 0 16px 0' }}>
                {editingAtivo ? `Editar ${editingAtivo.ticker}` : 'Adicionar Novo Ativo'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {editingAtivo ? 'Editando dados estáticos. Preços são atualizados via API.' : 'Dados de preço serão buscados via API automaticamente.'}
              </p>
            </div>
            <div style={styles.modalBody}>
              <div style={{...styles.grid, ...styles.gridCols2}}>
                {/* Tipo de Ativo */}
                <select
                  style={styles.select}
                  value={formData.tipo || ''}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value as 'FII' | undefined})}
                >
                  <option value="">Ação</option>
                  <option value="FII">FII</option>
                </select>

                {/* Dados Básicos */}
                <input
                  style={styles.input}
                  placeholder="Ticker *"
                  value={formData.ticker || ''}
                  onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                />
              </div>

              <input
                style={styles.input}
                placeholder="Nome Completo *"
                value={formData.nomeCompleto || ''}
                onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
              />

              <div style={{...styles.grid, ...styles.gridCols2}}>
                <input
                  style={styles.input}
                  placeholder="Setor"
                  value={formData.setor || ''}
                  onChange={(e) => setFormData({...formData, setor: e.target.value})}
                />
                <input
                  style={styles.input}
                  placeholder="URL do Avatar"
                  value={formData.avatar || ''}
                  onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                />
              </div>

              <textarea
                style={styles.textarea}
                placeholder="Descrição"
                value={formData.descricao || ''}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              />

              {/* Dados de Posição */}
              <h3>📊 Dados de Posição</h3>
              <div style={{...styles.grid, ...styles.gridCols4}}>
                <input
                  style={styles.input}
                  placeholder="Data Entrada"
                  value={formData.dataEntrada || ''}
                  onChange={(e) => setFormData({...formData, dataEntrada: e.target.value})}
                />
                <input
                  style={styles.input}
                  placeholder="Preço Inicial"
                  value={formData.precoIniciou || ''}
                  onChange={(e) => setFormData({...formData, precoIniciou: e.target.value})}
                />
                <input
                  style={styles.input}
                  placeholder="Preço Teto"
                  value={formData.precoTeto || ''}
                  onChange={(e) => setFormData({...formData, precoTeto: e.target.value})}
                />
                <select
                  style={styles.select}
                  value={formData.viesAtual || ''}
                  onChange={(e) => setFormData({...formData, viesAtual: e.target.value})}
                >
                  <option value="">Viés Atual</option>
                  <option value="Compra">Compra</option>
                  <option value="Venda">Venda</option>
                  <option value="Neutro">Neutro</option>
                </select>
              </div>

              <div style={{...styles.grid, ...styles.gridCols3}}>
                <input
                  style={styles.input}
                  placeholder="Ibovespa na Época"
                  value={formData.ibovespaEpoca || ''}
                  onChange={(e) => setFormData({...formData, ibovespaEpoca: e.target.value})}
                />
                <input
                  style={styles.input}
                  placeholder="% Carteira"
                  value={formData.percentualCarteira || ''}
                  onChange={(e) => setFormData({...formData, percentualCarteira: e.target.value})}
                />
              </div>

              {/* Dados Específicos */}
              {isFII ? (
                <>
                  <h3>🏢 Dados do FII</h3>
                  <div style={{...styles.grid, ...styles.gridCols2}}>
                    <input
                      style={styles.input}
                      placeholder="Patrimônio"
                      value={(formData as FII).patrimonio || ''}
                      onChange={(e) => setFormData({...formData, patrimonio: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="Gestora"
                      value={(formData as FII).gestora || ''}
                      onChange={(e) => setFormData({...formData, gestora: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="P/VP"
                      value={(formData as FII).p_vp || ''}
                      onChange={(e) => setFormData({...formData, p_vp: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="Vacância"
                      value={(formData as FII).vacancia || ''}
                      onChange={(e) => setFormData({...formData, vacancia: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="Número de Imóveis"
                      type="number"
                      value={(formData as FII).imoveis || ''}
                      onChange={(e) => setFormData({...formData, imoveis: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h3>📈 Dados da Empresa</h3>
                  <div style={{...styles.grid, ...styles.gridCols3}}>
                    <input
                      style={styles.input}
                      placeholder="Market Cap"
                      value={(formData as Empresa).marketCap || ''}
                      onChange={(e) => setFormData({...formData, marketCap: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="P/L"
                      value={(formData as Empresa).pl || ''}
                      onChange={(e) => setFormData({...formData, pl: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="P/VP"
                      value={(formData as Empresa).pvp || ''}
                      onChange={(e) => setFormData({...formData, pvp: e.target.value})}
                    />
                    <input
                      style={styles.input}
                      placeholder="ROE"
                      value={(formData as Empresa).roe || ''}
                      onChange={(e) => setFormData({...formData, roe: e.target.value})}
                    />
                  </div>
                </>
              )}

              {/* Seção de Proventos */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>💰 Proventos</h3>
                  <button
                    style={{...styles.button, ...styles.buttonSecondary, padding: '8px 16px'}}
                    onClick={addProvento}
                  >
                    ➕ Adicionar
                  </button>
                </div>
                {proventosTemp.map((provento, index) => (
                  <div key={index} style={{...styles.card, margin: '0 0 16px 0'}}>
                    <div style={{ padding: '16px' }}>
                      <div style={{...styles.grid, ...styles.gridCols4}}>
                        <input
                          style={styles.input}
                          placeholder="Tipo"
                          value={provento.tipo}
                          onChange={(e) => updateProvento(index, 'tipo', e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Valor"
                          value={provento.valor}
                          onChange={(e) => updateProvento(index, 'valor', e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Data Ex"
                          value={provento.dataEx}
                          onChange={(e) => updateProvento(index, 'dataEx', e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Status"
                          value={provento.status}
                          onChange={(e) => updateProvento(index, 'status', e.target.value)}
                        />
                      </div>
                      <input
                        style={styles.input}
                        placeholder="Data Pagamento"
                        value={provento.dataPagamento}
                        onChange={(e) => updateProvento(index, 'dataPagamento', e.target.value)}
                      />
                      <button
                        style={{...styles.button, ...styles.buttonDanger, padding: '8px 16px'}}
                        onClick={() => removeProvento(index)}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Seção de Relatórios */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>📄 Relatórios</h3>
                  <button
                    style={{...styles.button, ...styles.buttonSecondary, padding: '8px 16px'}}
                    onClick={addRelatorio}
                  >
                    ➕ Adicionar
                  </button>
                </div>
                {relatoriosTemp.map((relatorio, index) => (
                  <div key={index} style={{...styles.card, margin: '0 0 16px 0'}}>
                    <div style={{ padding: '16px' }}>
                      <div style={{...styles.grid, ...styles.gridCols3}}>
                        <input
                          style={styles.input}
                          placeholder="Nome do Relatório"
                          value={relatorio.nome}
                          onChange={(e) => updateRelatorio(index, 'nome', e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder="Data (YYYY-MM-DD)"
                          value={relatorio.data}
                          onChange={(e) => updateRelatorio(index, 'data', e.target.value)}
                        />
                        <select
                          style={styles.select}
                          value={relatorio.tipo}
                          onChange={(e) => updateRelatorio(index, 'tipo', e.target.value)}
                        >
                          <option value="Trimestral">Trimestral</option>
                          <option value="Anual">Anual</option>
                          <option value="Mensal">Mensal</option>
                          <option value="Especial">Especial</option>
                        </select>
                      </div>
                      <input
                        style={styles.input}
                        placeholder="URL do Canva (iframe) - https://www.canva.com/design/DAFXXX/view?embed"
                        value={relatorio.canvaUrl || ''}
                        onChange={(e) => updateRelatorio(index, 'canvaUrl', e.target.value)}
                      />
                      <input
                        style={styles.input}
                        placeholder="URL para Download (PDF) - https://exemplo.com/relatorio.pdf"
                        value={relatorio.downloadUrl || ''}
                        onChange={(e) => updateRelatorio(index, 'downloadUrl', e.target.value)}
                      />
                      <button
                        style={{...styles.button, ...styles.buttonDanger, padding: '8px 16px'}}
                        onClick={() => removeRelatorio(index)}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={styles.modalFooter}>
              <button
                style={{...styles.button, ...styles.buttonSecondary}}
                onClick={handleCloseDialog}
              >
                Cancelar
              </button>
              <button
                style={{...styles.button, ...styles.buttonPrimary}}
                onClick={handleSaveAtivo}
              >
                {editingAtivo ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificação */}
      {notification.open && (
        <div
          style={{
            ...styles.notification,
            ...(notification.type === 'success' ? styles.notificationSuccess : styles.notificationError)
          }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdminIntegrado;
