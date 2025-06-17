// src/services/portfolioDataService.ts

export interface Ativo {
  id: string;
  ticker: string;
  nomeCompleto: string;
  setor: string;
  tipo: 'ACAO' | 'FII';
  descricao: string;
  avatar: string;
  dataEntrada: string;
  precoIniciou: string;
  precoTeto: string;
  viesAtual: string;
  ibovespaEpoca: string;
  percentualCarteira: string;
  gestora?: string;
  dy?: string;
  ativo: boolean;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Configuracao {
  id: string;
  chave: string;
  valor: string;
  descricao: string;
  tipo: 'text' | 'number' | 'boolean' | 'select';
  opcoes?: string[];
}

export interface DadosProventos {
  ticker: string;
  data: string;
  valor: number;
  tipo: string;
}

export interface UsePortfolioDataReturn {
  ativos: Ativo[];
  configuracoes: Configuracao[];
  loading: boolean;
  service: PortfolioDataService;
  refetch: () => void;
}

export interface UseAtivoReturn {
  ativo: Ativo | null;
  loading: boolean;
  refetch: () => void;
}

// Constantes para as chaves
const STORAGE_KEYS = {
  ATIVOS: 'portfolioDataAdmin',
  CONFIGS: 'configuracoesAdmin',
  PROVENTOS: 'proventosData'
} as const;

// Dados iniciais mais compactos
const DADOS_INICIAIS: Ativo[] = [
  {
    id: '1',
    ticker: 'ALOS3',
    nomeCompleto: 'Allos S.A.',
    setor: 'Shoppings',
    tipo: 'ACAO',
    descricao: 'Empresa de shopping centers de alto padrão.',
    avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
    dataEntrada: '15/01/2021',
    precoIniciou: 'R$ 26,68',
    precoTeto: 'R$ 23,76',
    viesAtual: 'Aguardar',
    ibovespaEpoca: '108.500',
    percentualCarteira: '4.2%',
    dy: '5,95%',
    ativo: true,
    observacoes: 'Potencial de recuperação',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-06-16T15:30:00Z'
  },
  {
    id: '2',
    ticker: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
    setor: 'Petróleo',
    tipo: 'ACAO',
    descricao: 'Empresa brasileira de energia e petróleo.',
    avatar: 'https://www.fundamentus.com.br/logos/PETR4.png',
    dataEntrada: '10/03/2022',
    precoIniciou: 'R$ 28,50',
    precoTeto: 'R$ 35,00',
    viesAtual: 'Compra',
    ibovespaEpoca: '112.500',
    percentualCarteira: '6.8%',
    dy: '12,45%',
    ativo: true,
    observacoes: 'Dividendos consistentes',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-06-16T15:30:00Z'
  },
  {
    id: '3',
    ticker: 'HGLG11',
    nomeCompleto: 'CSHG Logística FII',
    setor: 'Fundos Logísticos',
    tipo: 'FII',
    descricao: 'FII focado em ativos logísticos.',
    avatar: 'https://fundamentus.com.br/logos/HGLG11.png',
    dataEntrada: '20/02/2023',
    precoIniciou: 'R$ 165,00',
    precoTeto: 'R$ 180,00',
    viesAtual: 'Compra Forte',
    ibovespaEpoca: '115.200',
    percentualCarteira: '8.5%',
    dy: '9,80%',
    gestora: 'CSHG Asset Management',
    ativo: true,
    observacoes: 'Boa distribuição',
    criadoEm: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-06-16T15:30:00Z'
  }
];

const CONFIGS_INICIAIS: Configuracao[] = [
  {
    id: '1',
    chave: 'BRAPI_TOKEN',
    valor: 'jJrMYVy9MATGEicx3GxBp8',
    descricao: 'Token de acesso à API BRAPI',
    tipo: 'text'
  },
  {
    id: '2',
    chave: 'ATUALIZACAO_AUTOMATICA',
    valor: 'true',
    descricao: 'Atualização automática de preços',
    tipo: 'boolean'
  },
  {
    id: '3',
    chave: 'INTERVALO_ATUALIZACAO',
    valor: '300000',
    descricao: 'Intervalo de atualização (ms)',
    tipo: 'number'
  },
  {
    id: '4',
    chave: 'TEMA_INTERFACE',
    valor: 'claro',
    descricao: 'Tema da interface',
    tipo: 'select',
    opcoes: ['claro', 'escuro', 'auto']
  }
];

class PortfolioDataService {
  private listeners: (() => void)[] = [];

  // Storage helper com lazy evaluation
  private getStorage(): Storage | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      
      // Teste rápido
      const test = '__test__';
      window.localStorage.setItem(test, '1');
      window.localStorage.removeItem(test);
      return window.localStorage;
    } catch {
      return null;
    }
  }

  // Métodos de ativo otimizados
  obterAtivos(): Ativo[] {
    const storage = this.getStorage();
    if (!storage) return [...DADOS_INICIAIS];

    try {
      const data = storage.getItem(STORAGE_KEYS.ATIVOS);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DADOS_INICIAIS];
      }
      
      this.salvarAtivos(DADOS_INICIAIS);
      return [...DADOS_INICIAIS];
    } catch {
      return [...DADOS_INICIAIS];
    }
  }

  obterAtivoPorTicker(ticker: string): Ativo | null {
    return this.obterAtivos().find(a => 
      a.ticker?.toLowerCase() === ticker.toLowerCase()
    ) || null;
  }

  salvarAtivos(ativos: Ativo[]): void {
    const storage = this.getStorage();
    if (!storage || !Array.isArray(ativos)) return;

    try {
      storage.setItem(STORAGE_KEYS.ATIVOS, JSON.stringify(ativos));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar ativos:', error);
    }
  }

  adicionarAtivo(ativo: Omit<Ativo, 'id' | 'criadoEm' | 'atualizadoEm'>): Ativo {
    const ativos = this.obterAtivos();
    const novoAtivo: Ativo = {
      ...ativo,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    
    ativos.push(novoAtivo);
    this.salvarAtivos(ativos);
    return novoAtivo;
  }

  atualizarAtivo(id: string, dados: Partial<Ativo>): Ativo | null {
    const ativos = this.obterAtivos();
    const index = ativos.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    ativos[index] = {
      ...ativos[index],
      ...dados,
      atualizadoEm: new Date().toISOString()
    };
    
    this.salvarAtivos(ativos);
    return ativos[index];
  }

  excluirAtivo(id: string): boolean {
    const ativos = this.obterAtivos();
    const filtrados = ativos.filter(a => a.id !== id);
    
    if (filtrados.length === ativos.length) return false;
    
    this.salvarAtivos(filtrados);
    return true;
  }

  // Métodos de configuração otimizados
  obterConfiguracoes(): Configuracao[] {
    const storage = this.getStorage();
    if (!storage) return [...CONFIGS_INICIAIS];

    try {
      const data = storage.getItem(STORAGE_KEYS.CONFIGS);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [...CONFIGS_INICIAIS];
      }
      
      this.salvarConfiguracoes(CONFIGS_INICIAIS);
      return [...CONFIGS_INICIAIS];
    } catch {
      return [...CONFIGS_INICIAIS];
    }
  }

  obterConfiguracao(chave: string): string | null {
    return this.obterConfiguracoes().find(c => c.chave === chave)?.valor || null;
  }

  salvarConfiguracoes(configs: Configuracao[]): void {
    const storage = this.getStorage();
    if (!storage || !Array.isArray(configs)) return;

    try {
      storage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  atualizarConfiguracao(chave: string, valor: string): boolean {
    const configs = this.obterConfiguracoes();
    const index = configs.findIndex(c => c.chave === chave);
    
    if (index === -1) return false;
    
    configs[index].valor = valor;
    this.salvarConfiguracoes(configs);
    return true;
  }

  // Métodos de proventos
  obterProventos(ticker?: string): DadosProventos[] {
    const storage = this.getStorage();
    if (!storage) return [];

    try {
      const data = storage.getItem(STORAGE_KEYS.PROVENTOS);
      const proventos = data ? JSON.parse(data) : [];
      
      if (!Array.isArray(proventos)) return [];
      
      return ticker ? proventos.filter(p => p.ticker === ticker) : proventos;
    } catch {
      return [];
    }
  }

  salvarProventos(ticker: string, proventos: Omit<DadosProventos, 'ticker'>[]): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      const todos = this.obterProventos();
      const filtrados = todos.filter(p => p.ticker !== ticker);
      const novos = proventos.map(p => ({ ...p, ticker }));
      
      storage.setItem(STORAGE_KEYS.PROVENTOS, JSON.stringify([...filtrados, ...novos]));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar proventos:', error);
    }
  }

  // Utilitários
  exportarDados(): string {
    return JSON.stringify({
      ativos: this.obterAtivos(),
      configuracoes: this.obterConfiguracoes(),
      proventos: this.obterProventos(),
      exportadoEm: new Date().toISOString(),
      versao: '1.0'
    }, null, 2);
  }

  importarDados(json: string): { sucesso: boolean; mensagem: string } {
    try {
      const dados = JSON.parse(json);
      
      if (!Array.isArray(dados.ativos)) {
        return { sucesso: false, mensagem: 'Dados de ativos inválidos' };
      }

      if (!dados.ativos.every((a: any) => a.ticker && a.nomeCompleto && a.setor)) {
        return { sucesso: false, mensagem: 'Estrutura de ativos inválida' };
      }

      this.salvarAtivos(dados.ativos);
      
      if (Array.isArray(dados.configuracoes)) {
        this.salvarConfiguracoes(dados.configuracoes);
      }
      
      if (Array.isArray(dados.proventos)) {
        const storage = this.getStorage();
        storage?.setItem(STORAGE_KEYS.PROVENTOS, JSON.stringify(dados.proventos));
      }

      return { sucesso: true, mensagem: 'Dados importados com sucesso' };
    } catch {
      return { sucesso: false, mensagem: 'Erro ao processar JSON' };
    }
  }

  obterEstatisticas() {
    const ativos = this.obterAtivos();
    return {
      totalAtivos: ativos.length,
      ativosAtivos: ativos.filter(a => a.ativo).length,
      totalAcoes: ativos.filter(a => a.tipo === 'ACAO').length,
      totalFIIs: ativos.filter(a => a.tipo === 'FII').length,
      setoresUnicos: new Set(ativos.map(a => a.setor)).size,
      ultimaAtualizacao: new Date().toISOString()
    };
  }

  limparDados(): void {
    const storage = this.getStorage();
    if (!storage) return;

    try {
      Object.values(STORAGE_KEYS).forEach(key => storage.removeItem(key));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }

  // Sistema de listeners
  adicionarListener(callback: () => void): void {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  removerListener(callback: () => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  private notificarListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro no listener:', error);
      }
    });
  }
}

// Singleton
export const portfolioDataService = new PortfolioDataService();
