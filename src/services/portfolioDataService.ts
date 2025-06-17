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

class PortfolioDataService {
  private readonly ATIVOS_KEY = 'portfolioDataAdmin';
  private readonly CONFIGS_KEY = 'configuracoesAdmin';
  private readonly PROVENTOS_KEY = 'proventosData';
  
  private listeners: Array<() => void> = [];

  private getDefaultAtivos(): Ativo[] {
    return [
      {
        id: '1',
        ticker: 'ALOS3',
        nomeCompleto: 'Allos S.A.',
        setor: 'Shoppings',
        tipo: 'ACAO',
        descricao: 'Empresa de shopping centers.',
        avatar: '',
        dataEntrada: '15/01/2021',
        precoIniciou: 'R$ 26,68',
        precoTeto: 'R$ 23,76',
        viesAtual: 'Aguardar',
        ibovespaEpoca: '108.500',
        percentualCarteira: '4.2%',
        dy: '5,95%',
        ativo: true,
        observacoes: '',
        criadoEm: '2024-01-15T10:00:00Z',
        atualizadoEm: '2024-06-16T15:30:00Z'
      },
      {
        id: '2',
        ticker: 'PETR4',
        nomeCompleto: 'Petróleo Brasileiro S.A.',
        setor: 'Petróleo',
        tipo: 'ACAO',
        descricao: 'Empresa de energia.',
        avatar: '',
        dataEntrada: '10/03/2022',
        precoIniciou: 'R$ 28,50',
        precoTeto: 'R$ 35,00',
        viesAtual: 'Compra',
        ibovespaEpoca: '112.500',
        percentualCarteira: '6.8%',
        dy: '12,45%',
        ativo: true,
        observacoes: '',
        criadoEm: '2024-01-15T10:00:00Z',
        atualizadoEm: '2024-06-16T15:30:00Z'
      }
    ];
  }

  private getDefaultConfigs(): Configuracao[] {
    return [
      {
        id: '1',
        chave: 'BRAPI_TOKEN',
        valor: 'jJrMYVy9MATGEicx3GxBp8',
        descricao: 'Token API',
        tipo: 'text'
      },
      {
        id: '2',
        chave: 'TEMA_INTERFACE',
        valor: 'claro',
        descricao: 'Tema',
        tipo: 'select',
        opcoes: ['claro', 'escuro']
      }
    ];
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getFromStorage(key: string): any {
    if (!this.isClient()) return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao ler storage:', error);
      return null;
    }
  }

  private setToStorage(key: string, value: any): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar storage:', error);
    }
  }

  obterAtivos(): Ativo[] {
    const stored = this.getFromStorage(this.ATIVOS_KEY);
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    
    const defaults = this.getDefaultAtivos();
    this.salvarAtivos(defaults);
    return defaults;
  }

  obterAtivoPorTicker(ticker: string): Ativo | null {
    const ativos = this.obterAtivos();
    return ativos.find(ativo => 
      ativo.ticker.toLowerCase() === ticker.toLowerCase()
    ) || null;
  }

  salvarAtivos(ativos: Ativo[]): void {
    this.setToStorage(this.ATIVOS_KEY, ativos);
    this.notificarListeners();
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

  atualizarAtivo(id: string, dadosAtualizados: Partial<Ativo>): Ativo | null {
    const ativos = this.obterAtivos();
    const indice = ativos.findIndex(ativo => ativo.id === id);
    
    if (indice === -1) return null;
    
    ativos[indice] = {
      ...ativos[indice],
      ...dadosAtualizados,
      atualizadoEm: new Date().toISOString()
    };
    
    this.salvarAtivos(ativos);
    return ativos[indice];
  }

  excluirAtivo(id: string): boolean {
    const ativos = this.obterAtivos();
    const novosAtivos = ativos.filter(ativo => ativo.id !== id);
    
    if (novosAtivos.length === ativos.length) return false;
    
    this.salvarAtivos(novosAtivos);
    return true;
  }

  obterConfiguracoes(): Configuracao[] {
    const stored = this.getFromStorage(this.CONFIGS_KEY);
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    
    const defaults = this.getDefaultConfigs();
    this.salvarConfiguracoes(defaults);
    return defaults;
  }

  obterConfiguracao(chave: string): string | null {
    const configs = this.obterConfiguracoes();
    const config = configs.find(c => c.chave === chave);
    return config ? config.valor : null;
  }

  salvarConfiguracoes(configuracoes: Configuracao[]): void {
    this.setToStorage(this.CONFIGS_KEY, configuracoes);
    this.notificarListeners();
  }

  atualizarConfiguracao(chave: string, valor: string): boolean {
    const configs = this.obterConfiguracoes();
    const indice = configs.findIndex(c => c.chave === chave);
    
    if (indice === -1) return false;
    
    configs[indice].valor = valor;
    this.salvarConfiguracoes(configs);
    return true;
  }

  obterProventos(ticker?: string): DadosProventos[] {
    const stored = this.getFromStorage(this.PROVENTOS_KEY);
    const proventos = stored && Array.isArray(stored) ? stored : [];
    
    if (ticker) {
      return proventos.filter((p: DadosProventos) => p.ticker === ticker);
    }
    
    return proventos;
  }

  salvarProventos(ticker: string, proventos: Omit<DadosProventos, 'ticker'>[]): void {
    const todosProventos = this.obterProventos();
    const proventosFiltrados = todosProventos.filter(p => p.ticker !== ticker);
    const novosProventos = proventos.map(p => ({ ...p, ticker }));
    const proventosFinais = [...proventosFiltrados, ...novosProventos];
    
    this.setToStorage(this.PROVENTOS_KEY, proventosFinais);
    this.notificarListeners();
  }

  exportarDados(): string {
    const dados = {
      ativos: this.obterAtivos(),
      configuracoes: this.obterConfiguracoes(),
      proventos: this.obterProventos(),
      exportadoEm: new Date().toISOString(),
      versao: '1.0'
    };
    return JSON.stringify(dados, null, 2);
  }

  importarDados(dadosJson: string): { sucesso: boolean; mensagem: string } {
    try {
      const dados = JSON.parse(dadosJson);
      
      if (!dados.ativos || !Array.isArray(dados.ativos)) {
        return { sucesso: false, mensagem: 'Dados inválidos' };
      }

      this.salvarAtivos(dados.ativos);
      
      if (dados.configuracoes && Array.isArray(dados.configuracoes)) {
        this.salvarConfiguracoes(dados.configuracoes);
      }
      
      if (dados.proventos && Array.isArray(dados.proventos)) {
        this.setToStorage(this.PROVENTOS_KEY, dados.proventos);
      }

      return { sucesso: true, mensagem: 'Importado com sucesso' };
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro no JSON' };
    }
  }

  adicionarListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  removerListener(callback: () => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
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

  obterEstatisticas() {
    const ativos = this.obterAtivos();
    return {
      totalAtivos: ativos.length,
      ativosAtivos: ativos.filter(a => a.ativo).length,
      totalAcoes: ativos.filter(a => a.tipo === 'ACAO').length,
      totalFIIs: ativos.filter(a => a.tipo === 'FII').length,
      setoresUnicos: [...new Set(ativos.map(a => a.setor))].length,
      ultimaAtualizacao: new Date().toISOString()
    };
  }

  limparDados(): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(this.ATIVOS_KEY);
      localStorage.removeItem(this.CONFIGS_KEY);
      localStorage.removeItem(this.PROVENTOS_KEY);
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}

export const portfolioDataService = new PortfolioDataService();
