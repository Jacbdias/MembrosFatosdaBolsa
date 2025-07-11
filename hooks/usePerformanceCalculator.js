/**
 * 🎯 HOOK CUSTOMIZADO PARA CÁLCULO DE PERFORMANCE
 * Gerencia estado, cache e integração com Total Return Calculator
 */

import { useState, useEffect, useMemo } from 'react';
import { calcularPerformanceCarteira } from '../utils/totalReturnCalculator';

export const usePerformanceCalculator = (dadosCarteira, cotacoesAtuais = {}, valorPorAtivo = 1000) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  // 🔄 CALCULAR PERFORMANCE COM CACHE INTELIGENTE
  const metricas = useMemo(() => {
    if (!dadosCarteira || dadosCarteira.length === 0) {
      return {
        valorInicial: 0,
        valorFinal: 0,
        rentabilidadeTotal: 0,
        rentabilidadeAnualizada: 0,
        totalProventos: 0,
        quantidadeAtivos: 0,
        ativosComCalculos: [],
        melhorAtivo: null,
        piorAtivo: null,
        metodo: 'Total Return Contínuo',
        loading: false,
        erro: null
      };
    }

    console.log('🎯 Hook: Recalculando performance da carteira...');
    setLoading(true);
    setErro(null);

    try {
      const resultado = calcularPerformanceCarteira(dadosCarteira, cotacoesAtuais, valorPorAtivo);
      
      setUltimaAtualizacao(new Date());
      setLoading(false);
      
      return {
        ...resultado,
        loading: false,
        erro: null,
        ultimaAtualizacao: new Date()
      };
      
    } catch (error) {
      console.error('❌ Hook: Erro ao calcular performance:', error);
      setErro(error.message);
      setLoading(false);
      
      return {
        valorInicial: 0,
        valorFinal: 0,
        rentabilidadeTotal: 0,
        rentabilidadeAnualizada: 0,
        totalProventos: 0,
        quantidadeAtivos: 0,
        ativosComCalculos: [],
        melhorAtivo: null,
        piorAtivo: null,
        metodo: 'Total Return Contínuo',
        loading: false,
        erro: error.message
      };
    }
  }, [dadosCarteira, cotacoesAtuais, valorPorAtivo]);

  // 🚀 FUNÇÃO PARA FORÇAR RECÁLCULO
  const recalcular = () => {
    console.log('🔄 Hook: Forçando recálculo...');
    setUltimaAtualizacao(new Date());
  };

  // 📊 FUNÇÕES DE FORMATAÇÃO
  const formatCurrency = (value, moeda = 'BRL') => {
    const currency = moeda === 'USD' ? 'USD' : 'BRL';
    const locale = moeda === 'USD' ? 'en-US' : 'pt-BR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value) => {
    const signal = value >= 0 ? '+' : '';
    return signal + value.toFixed(1) + '%';
  };

  // 📈 MÉTRICAS FORMATADAS PARA EXIBIÇÃO
  const metricasFormatadas = useMemo(() => ({
    ...metricas,
    valorInicialFormatado: formatCurrency(metricas.valorInicial),
    valorFinalFormatado: formatCurrency(metricas.valorFinal),
    rentabilidadeTotalFormatada: formatPercentage(metricas.rentabilidadeTotal),
    rentabilidadeAnualizadaFormatada: formatPercentage(metricas.rentabilidadeAnualizada),
    totalProventosFormatado: formatCurrency(metricas.totalProventos),
    ganhoTotalFormatado: formatCurrency(metricas.valorFinal - metricas.valorInicial),
    
    // Formatação dos ativos individuais
    ativosComCalculosFormatados: metricas.ativosComCalculos?.map(ativo => ({
      ...ativo,
      valorInicialFormatado: formatCurrency(ativo.valorInicial),
      valorFinalFormatado: formatCurrency(ativo.valorFinal),
      rentabilidadeTotalFormatada: formatPercentage(ativo.rentabilidadeTotal),
      rentabilidadeAnualizadaFormatada: formatPercentage(ativo.rentabilidadeAnualizada),
      totalProventosFormatado: formatCurrency(ativo.totalProventos),
      cotaFinalFormatada: formatCurrency(ativo.cotaFinal)
    })) || []
  }), [metricas]);

  // 🎯 ESTATÍSTICAS ADICIONAIS
  const estatisticas = useMemo(() => {
    if (!metricas.ativosComCalculos || metricas.ativosComCalculos.length === 0) {
      return {
        ativosPositivos: 0,
        ativosNegativos: 0,
        percentualPositivos: 0,
        mediaRentabilidade: 0,
        medianRentabilidade: 0,
        volatilidade: 0
      };
    }

    const rentabilidades = metricas.ativosComCalculos.map(a => a.rentabilidadeTotal);
    const ativosPositivos = rentabilidades.filter(r => r > 0).length;
    const ativosNegativos = rentabilidades.filter(r => r < 0).length;
    
    const media = rentabilidades.reduce((acc, r) => acc + r, 0) / rentabilidades.length;
    
    const rentabilidadesOrdenadas = [...rentabilidades].sort((a, b) => a - b);
    const mediana = rentabilidadesOrdenadas.length % 2 === 0
      ? (rentabilidadesOrdenadas[rentabilidadesOrdenadas.length / 2 - 1] + rentabilidadesOrdenadas[rentabilidadesOrdenadas.length / 2]) / 2
      : rentabilidadesOrdenadas[Math.floor(rentabilidadesOrdenadas.length / 2)];
    
    // Volatilidade (desvio padrão)
    const variancia = rentabilidades.reduce((acc, r) => acc + Math.pow(r - media, 2), 0) / rentabilidades.length;
    const volatilidade = Math.sqrt(variancia);

    return {
      ativosPositivos,
      ativosNegativos,
      percentualPositivos: (ativosPositivos / rentabilidades.length) * 100,
      mediaRentabilidade: media,
      medianRentabilidade: mediana,
      volatilidade: volatilidade,
      sharpeRatio: volatilidade > 0 ? media / volatilidade : 0 // Simplificado
    };
  }, [metricas]);

  return {
    // Métricas principais
    metricas: metricasFormatadas,
    
    // Estados
    loading: loading || metricas.loading,
    erro: erro || metricas.erro,
    ultimaAtualizacao,
    
    // Estatísticas adicionais
    estatisticas,
    
    // Funções utilitárias
    recalcular,
    formatCurrency,
    formatPercentage,
    
    // Informações do método
    metodo: 'Total Return Contínuo com Reinvestimento',
    versao: '2.0.0'
  };
};