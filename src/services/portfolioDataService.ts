// src/services/portfolioDataService.ts
import React from 'react';

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

  // Verificar se estamos em ambiente browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // Métodos para gerenciar ativos
  obterAtivos(): Ativo[] {
    try {
      if (!this.isBrowser()) {
        return this.dadosIniciais;
      }

      const dados = localStorage.getItem(this.ATIVOS_KEY);
      if (dados) {
        return JSON.parse(dados);
      }
      // Se não existe, criar com dados iniciais
      this.salvarAtivos(this.dadosIniciais);
      return this.dadosIniciais;
    } catch (error) {
      console.error('Erro ao obter ativos:', error);
      return this.dadosIniciais;
    }
  }

  obterAtivoPorTicker(ticker: string): Ativo | null {
    const ativos = this.obterAtivos();
    return ativos.find(ativo => ativo.ticker.toLowerCase() === ticker.toLowerCase()) || null;
  }

  salvarAtivos(ativos: Ativo[]): void {
    try {
      if (!this.isBrowser()) {
        console.warn('localStorage não disponível - executando em ambiente servidor');
        return;
      }

      localStorage.setItem(this.ATIVOS_KEY, JSON.stringify(ativos));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar ativos:', error);
      throw new Error('Falha ao salvar dados dos ativos');
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

  // Métodos para gerenciar configurações
  obterConfiguracoes(): Configuracao[] {
    try {
      if (!this.isBrowser()) {
        return this.configsIniciais;
      }

      const dados = localStorage.getItem(this.CONFIGS_KEY);
      if (dados) {
        return JSON.parse(dados);
      }
      this.salvarConfiguracoes(this.configsIniciais);
      return this.configsIniciais;
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      return this.configsIniciais;
    }
  }

  obterConfiguracao(chave: string): string | null {
    const configs = this.obterConfiguracoes();
    const config = configs.find(c => c.chave === chave);
    return config ? config.valor : null;
  }

  salvarConfiguracoes(configuracoes: Configuracao[]): void {
    try {
      if (!this.isBrowser()) {
        console.warn('localStorage não disponível - executando em ambiente servidor');
        return;
      }

      localStorage.setItem(this.CONFIGS_KEY, JSON.stringify(configuracoes));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw new Error('Falha ao salvar configurações');
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

  // Métodos para gerenciar proventos
  obterProventos(ticker?: string): DadosProventos[] {
    try {
      if (!this.isBrowser()) {
        return [];
      }

      const dados = localStorage.getItem(this.PROVENTOS_KEY);
      const proventos = dados ? JSON.parse(dados) : [];
      
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
      if (!this.isBrowser()) {
        console.warn('localStorage não disponível - executando em ambiente servidor');
        return;
      }

      const todosProventos = this.obterProventos();
      
      // Remove proventos antigos do ticker
      const proventosFiltrados = todosProventos.filter(p => p.ticker !== ticker);
      
      // Adiciona novos proventos
      const novosProventos = proventos.map(p => ({ ...p, ticker }));
      const proventosFinais = [...proventosFiltrados, ...novosProventos];
      
      localStorage.setItem(this.PROVENTOS_KEY, JSON.stringify(proventosFinais));
      this.notificarListeners();
    } catch (error) {
      console.error('Erro ao salvar proventos:', error);
      throw new Error('Falha ao salvar dados de proventos');
    }
  }

  // Métodos para exportar/importar dados
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
      
      if (dados.configuracoes) {
        this.salvarConfiguracoes(dados.configuracoes);
      }
      
      if (dados.proventos && this.isBrowser()) {
        localStorage.setItem(this.PROVENTOS_KEY, JSON.stringify(dados.proventos));
      }

      return { sucesso: true, mensagem: 'Dados importados com sucesso' };
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro ao processar arquivo JSON' };
    }
  }

  // Sistema de listeners para sincronização
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
        console.error('Erro ao notificar listener:', error);
      }
    });
  }

  // Métodos utilitários
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
    if (!this.isBrowser()) {
      console.warn('localStorage não disponível - executando em ambiente servidor');
      return;
    }

    localStorage.removeItem(this.ATIVOS_KEY);
    localStorage.removeItem(this.CONFIGS_KEY);
    localStorage.removeItem(this.PROVENTOS_KEY);
    this.notificarListeners();
  }
}

// Singleton para garantir uma única instância
export const portfolioDataService = new PortfolioDataService();

// Hook personalizado para usar em componentes React
export function usePortfolioData() {
  const [ativos, setAtivos] = React.useState<Ativo[]>([]);
  const [configuracoes, setConfiguracoes] = React.useState<Configuracao[]>([]);
  const [loading, setLoading] = React.useState(true);

  const atualizarDados = React.useCallback(() => {
    try {
      setAtivos(portfolioDataService.obterAtivos());
      setConfiguracoes(portfolioDataService.obterConfiguracoes());
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    atualizarDados();
    portfolioDataService.adicionarListener(atualizarDados);
    
    return () => {
      portfolioDataService.removerListener(atualizarDados);
    };
  }, [atualizarDados]);

  return {
    ativos,
    configuracoes,
    loading,
    service: portfolioDataService,
    refetch: atualizarDados
  };
}

// Hook para um ativo específico
export function useAtivo(ticker: string) {
  const [ativo, setAtivo] = React.useState<Ativo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const atualizarAtivo = React.useCallback(() => {
    try {
      const ativoEncontrado = portfolioDataService.obterAtivoPorTicker(ticker);
      setAtivo(ativoEncontrado);
    } catch (error) {
      console.error('Erro ao obter ativo:', error);
      setAtivo(null);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  React.useEffect(() => {
    atualizarAtivo();
    portfolioDataService.adicionarListener(atualizarAtivo);
    
    return () => {
      portfolioDataService.removerListener(atualizarAtivo);
    };
  }, [atualizarAtivo]);

  return {
    ativo,
    loading,
    refetch: atualizarAtivo
  };
}
