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

// Interface para o hook personalizado
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

class PortfolioDataService {
  private readonly ATIVOS_KEY = 'portfolioDataAdmin';
  private readonly CONFIGS_KEY = 'configuracoesAdmin';
  private readonly PROVENTOS_KEY = 'proventosData';
  
  // Event listeners para sincronização
  private listeners: (() => void)[] = [];

  // Dados iniciais de fallback
  private readonly dadosIniciais: Ativo[] = [
    {
      id: '1',
      ticker: 'ALOS3',
      nomeCompleto: 'Allos S.A.',
      setor: 'Shoppings',
      tipo: 'ACAO',
      descricao: 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
      avatar: 'https://www.ivalor.com.br/media/emp/logos/ALOS.png',
      dataEntrada: '15/01/2021',
      precoIniciou: 'R$ 26,68',
      precoTeto: 'R$ 23,76',
      viesAtual: 'Aguardar',
      ibovespaEpoca: '108.500',
      percentualCarteira: '4.2%',
      dy: '5,95%',
      ativo: true,
      observacoes: 'Ação com potencial de recuperação',
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
      observacoes: 'FII com boa distribuição',
      criadoEm: '2024-01-15T10:00:00Z',
      atualizadoEm: '2024-06-16T15:30:00Z'
    }
  ];

  private readonly configsIniciais: Configuracao[] = [
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
      descricao: 'Habilitar atualização automática de preços',
      tipo: 'boolean'
    },
    {
      id: '3',
      chave: 'INTERVALO_ATUALIZACAO',
      valor: '300000',
      descricao: 'Intervalo de atualização em milissegundos (5 min)',
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

  // Verificar se localStorage está disponível de forma segura
  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Teste se consegue usar localStorage
        const testKey = '__test__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        return window.localStorage;
      }
    } catch (error) {
      console.warn('localStorage não disponível:', error);
    }
    return null;
  }

  // Métodos para gerenciar ativos
  obterAtivos(): Ativo[] {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return [...this.dadosIniciais];
      }

      const dados = storage.getItem(this.ATIVOS_KEY);
      if (dados) {
        const parsedData = JSON.parse(dados);
        // Validar se os dados são válidos
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          return parsedData;
        }
      }
      
      // Se não existe ou dados inválidos, criar com dados iniciais
      this.salvarAtivos(this.dadosIniciais);
      return [...this.dadosIniciais];
    } catch (error) {
      console.error('Erro ao obter ativos:', error);
      return [...this.dadosIniciais];
    }
  }

  obterAtivoPorTicker(ticker: string): Ativo | null {
    try {
      const ativos = this.obterAtivos();
      return ativos.find(ativo => 
        ativo.ticker && ativo.ticker.toLowerCase() === ticker.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Erro ao obter ativo por ticker:', error);
      return null;
    }
  }

  salvarAtivos(ativos: Ativo[]): void {
    try {
      if (!Array.isArray(ativos)) {
        throw new Error('Dados de ativos devem ser um array');
      }

      const storage = this.getStorage();
      if (!storage) {
        console.warn('localStorage não disponível - dados não salvos');
        return;
      }

      storage.setItem(this.ATIVOS_KEY, JSON.stringify(ativos));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar ativos:', error);
      throw new Error('Falha ao salvar dados dos ativos');
    }
  }

  adicionarAtivo(ativo: Omit<Ativo, 'id' | 'criadoEm' | 'atualizadoEm'>): Ativo {
    try {
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
    } catch (error) {
      console.error('Erro ao adicionar ativo:', error);
      throw error;
    }
  }

  atualizarAtivo(id: string, dadosAtualizados: Partial<Ativo>): Ativo | null {
    try {
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
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      return null;
    }
  }

  excluirAtivo(id: string): boolean {
    try {
      const ativos = this.obterAtivos();
      const novosAtivos = ativos.filter(ativo => ativo.id !== id);
      
      if (novosAtivos.length === ativos.length) return false;
      
      this.salvarAtivos(novosAtivos);
      return true;
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      return false;
    }
  }

  // Métodos para gerenciar configurações
  obterConfiguracoes(): Configuracao[] {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return [...this.configsIniciais];
      }

      const dados = storage.getItem(this.CONFIGS_KEY);
      if (dados) {
        const parsedData = JSON.parse(dados);
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      }
      
      this.salvarConfiguracoes(this.configsIniciais);
      return [...this.configsIniciais];
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return [...this.configsIniciais];
    }
  }

  obterConfiguracao(chave: string): string | null {
    try {
      const configs = this.obterConfiguracoes();
      const config = configs.find(c => c.chave === chave);
      return config ? config.valor : null;
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      return null;
    }
  }

  salvarConfiguracoes(configuracoes: Configuracao[]): void {
    try {
      if (!Array.isArray(configuracoes)) {
        throw new Error('Configurações devem ser um array');
      }

      const storage = this.getStorage();
      if (!storage) {
        console.warn('localStorage não disponível - configurações não salvas');
        return;
      }

      storage.setItem(this.CONFIGS_KEY, JSON.stringify(configuracoes));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Falha ao salvar configurações');
    }
  }

  atualizarConfiguracao(chave: string, valor: string): boolean {
    try {
      const configs = this.obterConfiguracoes();
      const indice = configs.findIndex(c => c.chave === chave);
      
      if (indice === -1) return false;
      
      configs[indice].valor = valor;
      this.salvarConfiguracoes(configs);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return false;
    }
  }

  // Métodos para gerenciar proventos
  obterProventos(ticker?: string): DadosProventos[] {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return [];
      }

      const dados = storage.getItem(this.PROVENTOS_KEY);
      const proventos = dados ? JSON.parse(dados) : [];
      
      if (!Array.isArray(proventos)) {
        return [];
      }
      
      if (ticker) {
        return proventos.filter((p: DadosProventos) => p.ticker === ticker);
      }
      
      return proventos;
    } catch (error) {
      console.error('Erro ao obter proventos:', error);
      return [];
    }
  }

  salvarProventos(ticker: string, proventos: Omit<DadosProventos, 'ticker'>[]): void {
    try {
      const storage = this.getStorage();
      if (!storage) {
        console.warn('localStorage não disponível - proventos não salvos');
        return;
      }

      const todosProventos = this.obterProventos();
      
      // Remove proventos antigos do ticker
      const proventosFiltrados = todosProventos.filter(p => p.ticker !== ticker);
      
      // Adiciona novos proventos
      const novosProventos = proventos.map(p => ({ ...p, ticker }));
      const proventosFinais = [...proventosFiltrados, ...novosProventos];
      
      storage.setItem(this.PROVENTOS_KEY, JSON.stringify(proventosFinais));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar proventos:', error);
      throw new Error('Falha ao salvar dados de proventos');
    }
  }

  // Métodos para exportar/importar dados
  exportarDados(): string {
    try {
      const dados = {
        ativos: this.obterAtivos(),
        configuracoes: this.obterConfiguracoes(),
        proventos: this.obterProventos(),
        exportadoEm: new Date().toISOString(),
        versao: '1.0'
      };
      return JSON.stringify(dados, null, 2);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw new Error('Falha ao exportar dados');
    }
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
        const storage = this.getStorage();
        if (storage) {
          storage.setItem(this.PROVENTOS_KEY, JSON.stringify(dados.proventos));
        }
      }

      return { sucesso: true, mensagem: 'Dados importados com sucesso' };
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return { sucesso: false, mensagem: 'Erro ao processar arquivo JSON' };
    }
  }

  // Sistema de listeners para sincronização
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
        if (typeof callback === 'function') {
          callback();
        }
      } catch (error) {
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // Métodos utilitários
  obterEstatisticas() {
    try {
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
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalAtivos: 0,
        ativosAtivos: 0,
        totalAcoes: 0,
        totalFIIs: 0,
        setoresUnicos: 0,
        ultimaAtualizacao: new Date().toISOString()
      };
    }
  }

  limparDados(): void {
    try {
      const storage = this.getStorage();
      if (!storage) {
        console.warn('localStorage não disponível - não é possível limpar dados');
        return;
      }

      storage.removeItem(this.ATIVOS_KEY);
      storage.removeItem(this.CONFIGS_KEY);
      storage.removeItem(this.PROVENTOS_KEY);
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}

// Singleton para garantir uma única instância
export const portfolioDataService = new PortfolioDataService();
