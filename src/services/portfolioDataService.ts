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

// Classe principal do serviço
class PortfolioDataService {
  private readonly STORAGE_KEYS = {
    ATIVOS: 'portfolioDataAdmin',
    CONFIGS: 'configuracoesAdmin',
    PROVENTOS: 'proventosData'
  };
  
  private listeners: Array<() => void> = [];

  // Dados padrão otimizados
  private readonly dadosIniciais: Ativo[] = [
    {
      id: '1',
      ticker: 'ALOS3',
      nomeCompleto: 'Allos S.A.',
      setor: 'Shoppings',
      tipo: 'ACAO',
      descricao: 'Empresa de shopping centers focada em empreendimentos de alto padrão.',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
      dataEntrada: '15/01/2021',
      precoIniciou: 'R$ 26,68',
      precoTeto: 'R$ 23,76',
      viesAtual: 'Aguardar',
      ibovespaEpoca: '108.500',
      percentualCarteira: '4.2%',
      dy: '5,95%',
      ativo: true,
      observacoes: 'Ação com potencial de recuperação no setor de shoppings',
      criadoEm: '2024-01-15T10:00:00Z',
      atualizadoEm: '2024-06-16T15:30:00Z'
    },
    {
      id: '2',
      ticker: 'PETR4',
      nomeCompleto: 'Petróleo Brasileiro S.A. - Petrobras',
      setor: 'Petróleo',
      tipo: 'ACAO',
      descricao: 'Empresa brasileira de energia, atuando principalmente na exploração e produção de petróleo.',
      avatar: 'https://www.fundamentus.com.br/logos/PETR4.png',
      dataEntrada: '10/03/2022',
      precoIniciou: 'R$ 28,50',
      precoTeto: 'R$ 35,00',
      viesAtual: 'Compra',
      ibovespaEpoca: '112.500',
      percentualCarteira: '6.8%',
      dy: '12,45%',
      ativo: true,
      observacoes: 'Dividendos consistentes e boa posição no setor energético',
      criadoEm: '2024-01-15T10:00:00Z',
      atualizadoEm: '2024-06-16T15:30:00Z'
    },
    {
      id: '3',
      ticker: 'HGLG11',
      nomeCompleto: 'CSHG Logística FII',
      setor: 'Fundos Logísticos',
      tipo: 'FII',
      descricao: 'Fundo de investimento imobiliário focado em ativos logísticos de alta qualidade.',
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
      observacoes: 'FII com boa distribuição de rendimentos e gestão sólida',
      criadoEm: '2024-01-15T10:00:00Z',
      atualizadoEm: '2024-06-16T15:30:00Z'
    }
  ];

  private readonly configsIniciais: Configuracao[] = [
    {
      id: '1',
      chave: 'BRAPI_TOKEN',
      valor: 'jJrMYVy9MATGEicx3GxBp8',
      descricao: 'Token de acesso à API BRAPI para cotações',
      tipo: 'text'
    },
    {
      id: '2',
      chave: 'ATUALIZACAO_AUTOMATICA',
      valor: 'true',
      descricao: 'Habilitar atualização automática de preços',
      tipo: 'boolean'
    },
    {
      id: '3',
      chave: 'INTERVALO_ATUALIZACAO',
      valor: '300000',
      descricao: 'Intervalo de atualização em milissegundos (5 minutos)',
      tipo: 'number'
    },
    {
      id: '4',
      chave: 'TEMA_INTERFACE',
      valor: 'claro',
      descricao: 'Tema da interface do usuário',
      tipo: 'select',
      opcoes: ['claro', 'escuro', 'auto']
    }
  ];

  // Verificação de ambiente
  private isClientSide(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // Métodos de storage seguros
  private getStorageItem(key: string): any {
    if (!this.isClientSide()) return null;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Erro ao ler ${key} do localStorage:`, error);
      return null;
    }
  }

  private setStorageItem(key: string, value: any): boolean {
    if (!this.isClientSide()) return false;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
      return false;
    }
  }

  // ===== MÉTODOS DE ATIVOS =====
  
  obterAtivos(): Ativo[] {
    const stored = this.getStorageItem(this.STORAGE_KEYS.ATIVOS);
    
    if (stored && Array.isArray(stored) && stored.length > 0) {
      return stored;
    }
    
    // Inicializar com dados padrão se não existir
    this.salvarAtivos(this.dadosIniciais);
    return [...this.dadosIniciais];
  }

  obterAtivoPorTicker(ticker: string): Ativo | null {
    if (!ticker) return null;
    
    const ativos = this.obterAtivos();
    return ativos.find(ativo => 
      ativo.ticker && ativo.ticker.toLowerCase() === ticker.toLowerCase()
    ) || null;
  }

  salvarAtivos(ativos: Ativo[]): void {
    if (!Array.isArray(ativos)) {
      console.error('Dados de ativos devem ser um array');
      return;
    }
    
    const success = this.setStorageItem(this.STORAGE_KEYS.ATIVOS, ativos);
    if (success) {
      this.notificarListeners();
    }
  }

  adicionarAtivo(ativo: Omit<Ativo, 'id' | 'criadoEm' | 'atualizadoEm'>): Ativo {
    const ativos = this.obterAtivos();
    const timestamp = new Date().toISOString();
    
    const novoAtivo: Ativo = {
      ...ativo,
      id: Date.now().toString(),
      criadoEm: timestamp,
      atualizadoEm: timestamp
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

  // ===== MÉTODOS DE CONFIGURAÇÕES =====
  
  obterConfiguracoes(): Configuracao[] {
    const stored = this.getStorageItem(this.STORAGE_KEYS.CONFIGS);
    
    if (stored && Array.isArray(stored)) {
      return stored;
    }
    
    this.salvarConfiguracoes(this.configsIniciais);
    return [...this.configsIniciais];
  }

  obterConfiguracao(chave: string): string | null {
    const configs = this.obterConfiguracoes();
    const config = configs.find(c => c.chave === chave);
    return config ? config.valor : null;
  }

  salvarConfiguracoes(configuracoes: Configuracao[]): void {
    if (!Array.isArray(configuracoes)) {
      console.error('Configurações devem ser um array');
      return;
    }
    
    const success = this.setStorageItem(this.STORAGE_KEYS.CONFIGS, configuracoes);
    if (success) {
      this.notificarListeners();
    }
  }

  atualizarConfiguracao(chave: string, valor: string): boolean {
    const configs = this.obterConfiguracoes();
    const indice = configs.findIndex(c => c.chave === chave);
    
    if (indice === -1) return false;
    
    configs[indice].valor = valor;
    this.salvarConfiguracoes(configs);
    return true;
  }

  // ===== MÉTODOS DE PROVENTOS =====
  
  obterProventos(ticker?: string): DadosProventos[] {
    const stored = this.getStorageItem(this.STORAGE_KEYS.PROVENTOS);
    const proventos = stored && Array.isArray(stored) ? stored : [];
    
    if (ticker) {
      return proventos.filter((p: DadosProventos) => p.ticker === ticker);
    }
    
    return proventos;
  }

  salvarProventos(ticker: string, proventos: Omit<DadosProventos, 'ticker'>[]): void {
    const todosProventos = this.obterProventos();
    
    // Remove proventos antigos do ticker
    const proventosFiltrados = todosProventos.filter(p => p.ticker !== ticker);
    
    // Adiciona novos proventos
    const novosProventos = proventos.map(p => ({ ...p, ticker }));
    const proventosFinais = [...proventosFiltrados, ...novosProventos];
    
    const success = this.setStorageItem(this.STORAGE_KEYS.PROVENTOS, proventosFinais);
    if (success) {
      this.notificarListeners();
    }
  }

  // ===== MÉTODOS DE IMPORTAÇÃO/EXPORTAÇÃO =====
  
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
        return { sucesso: false, mensagem: 'Dados de ativos inválidos' };
      }

      // Validar estrutura básica dos ativos
      const ativoValido = dados.ativos.every((ativo: any) => 
        ativo.ticker && ativo.nomeCompleto && ativo.setor
      );

      if (!ativoValido) {
        return { sucesso: false, mensagem: 'Estrutura de ativos inválida' };
      }

      // Importar dados
      this.salvarAtivos(dados.ativos);
      
      if (dados.configuracoes && Array.isArray(dados.configuracoes)) {
        this.salvarConfiguracoes(dados.configuracoes);
      }
      
      if (dados.proventos && Array.isArray(dados.proventos)) {
        this.setStorageItem(this.STORAGE_KEYS.PROVENTOS, dados.proventos);
      }

      return { sucesso: true, mensagem: 'Dados importados com sucesso' };
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro ao processar arquivo JSON' };
    }
  }

  // ===== SISTEMA DE LISTENERS =====
  
  adicionarListener(callback: () => void): void {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  removerListener(callback: () => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notificarListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // ===== MÉTODOS UTILITÁRIOS =====
  
  obterEstatisticas() {
    const ativos = this.obterAtivos();
    const ativosAtivos = ativos.filter(a => a.ativo);
    
    return {
      totalAtivos: ativos.length,
      ativosAtivos: ativosAtivos.length,
      totalAcoes: ativos.filter(a => a.tipo === 'ACAO').length,
      totalFIIs: ativos.filter(a => a.tipo === 'FII').length,
      setoresUnicos: [...new Set(ativos.map(a => a.setor))].length,
      ultimaAtualizacao: new Date().toISOString()
    };
  }

  limparDados(): void {
    if (!this.isClientSide()) return;
    
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        window.localStorage.removeItem(key);
      });
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}

// Singleton para garantir uma única instância
export const portfolioDataService = new PortfolioDataService();
