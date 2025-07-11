/**
 * 🔗 ARQUIVO DE INTEGRAÇÃO PARA RENTABILIDADES
 * Facilita a migração do método antigo para o novo Total Return Contínuo
 */

import { usePerformanceCalculator } from '../hooks/usePerformanceCalculator';
import { PERFORMANCE_CONFIG } from './performanceConfig';

// 🔄 FUNÇÃO PARA MIGRAÇÃO GRADUAL
export const usarNovoCalculador = true; // Altere para false para usar o método antigo

// 🎯 FUNÇÃO WRAPPER PARA FACILITAR A INTEGRAÇÃO
export const useCalculadorRentabilidades = (dadosCarteira, cotacoesAtuais = {}, valorPorAtivo = 1000) => {
  // Se quiser testar o novo método
  if (usarNovoCalculador) {
    return usePerformanceCalculator(dadosCarteira, cotacoesAtuais, valorPorAtivo);
  }
  
  // Se quiser manter o método antigo (fallback)
  return {
    metricas: calcularMetricasAntigas(dadosCarteira, cotacoesAtuais, valorPorAtivo),
    loading: false,
    erro: null,
    metodo: 'Método Anterior',
    versao: '1.0.0'
  };
};

// 🔧 FUNÇÃO PARA MANTER COMPATIBILIDADE COM CÓDIGO ANTIGO
const calcularMetricasAntigas = (dadosCarteira, cotacoesAtuais, valorPorAtivo) => {
  // Aqui você pode colocar a lógica do seu método antigo
  // Por enquanto, retorno um objeto compatível
  return {
    valorInicial: dadosCarteira.length * valorPorAtivo,
    valorFinal: dadosCarteira.length * valorPorAtivo,
    rentabilidadeTotal: 0,
    rentabilidadeAnualizada: 0,
    totalProventos: 0,
    quantidadeAtivos: dadosCarteira.length,
    ativosComCalculos: dadosCarteira.map(ativo => ({
      ...ativo,
      rentabilidadeTotal: 0,
      valorInicial: valorPorAtivo,
      valorFinal: valorPorAtivo
    })),
    melhorAtivo: null,
    piorAtivo: null,
    metodo: 'Método Anterior'
  };
};

// 🎯 FUNÇÃO PARA COMPARAR MÉTODOS (útil para testes)
export const compararMetodos = (dadosCarteira, cotacoesAtuais, valorPorAtivo) => {
  const novoMetodo = usePerformanceCalculator(dadosCarteira, cotacoesAtuais, valorPorAtivo);
  const metodoAntigo = calcularMetricasAntigas(dadosCarteira, cotacoesAtuais, valorPorAtivo);
  
  return {
    novo: novoMetodo.metricas,
    antigo: metodoAntigo,
    diferenca: {
      rentabilidade: novoMetodo.metricas.rentabilidadeTotal - metodoAntigo.rentabilidadeTotal,
      valorFinal: novoMetodo.metricas.valorFinal - metodoAntigo.valorFinal
    }
  };
};

// 📊 FUNÇÕES DE FORMATAÇÃO REUTILIZÁVEIS
export const formatarMoeda = (valor, moeda = 'BRL') => {
  const currency = moeda === 'USD' ? 'USD' : 'BRL';
  const locale = moeda === 'USD' ? 'en-US' : 'pt-BR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(valor);
};

export const formatarPercentual = (valor) => {
  const signal = valor >= 0 ? '+' : '';
  return signal + valor.toFixed(PERFORMANCE_CONFIG.CASAS_DECIMAIS_RENTABILIDADE) + '%';
};