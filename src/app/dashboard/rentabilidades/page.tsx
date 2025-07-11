'use client';

import React, { useState, useEffect } from 'react';
import { useDataStore } from '../../../hooks/useDataStore';

export default function RentabilidadesPage() {
  const { dados, CARTEIRAS_CONFIG, buscarCotacoes, loading } = useDataStore();
  const [carteiraAtiva, setCarteiraAtiva] = useState('smallCaps');
  const [cotacoesAtualizadas, setCotacoesAtualizadas] = useState({});

  // 🔄 BUSCAR COTAÇÕES AO CARREGAR E QUANDO MUDAR CARTEIRA
  useEffect(() => {
    const buscarCotacoesIniciais = async () => {
      console.log('🔄 Iniciando busca de cotações...');
      
      // Buscar apenas ativos da carteira ativa para otimizar
      const ativosCarteira = dados[carteiraAtiva] || [];
      const tickers = ativosCarteira.map(ativo => ativo.ticker);
      
      console.log('📊 Tickers a buscar:', tickers);
      
      if (tickers.length > 0) {
        try {
          console.log('🌐 Chamando API BRAPI individualmente...');
          const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
          
          const novasCotacoes = {};
          
          // 🚀 BUSCAR EM PARALELO COM PROMISE.ALL (MAIS RÁPIDO)
          const promises = tickers.map(async (ticker, index) => {
            try {
              // 🔄 DELAY ESCALONADO PARA EVITAR RATE LIMIT
              await new Promise(resolve => setTimeout(resolve, index * 50));
              
              console.log('🔍 Buscando:', ticker);
              
              const apiUrl = 'https://brapi.dev/api/quote/' + ticker + '?token=' + BRAPI_TOKEN;
              const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'Rentabilidades-App'
                }
              });
              
              if (response.ok) {
                const data = await response.json();
                
                if (data.results && data.results.length > 0) {
                  const quote = data.results[0];
                  if (quote.regularMarketPrice) {
                    // 🔥 ATUALIZAR ESTADO IMEDIATAMENTE PARA CADA TICKER
                    setCotacoesAtualizadas(prev => ({
                      ...prev,
                      [ticker]: quote.regularMarketPrice
                    }));
                    console.log('✅ ' + ticker + ': R$ ' + quote.regularMarketPrice.toFixed(2));
                    return { ticker, price: quote.regularMarketPrice };
                  }
                } else {
                  console.log('⚠️ Sem dados para:', ticker);
                }
              } else {
                console.log('❌ Erro HTTP para ' + ticker + ':', response.status);
              }
              
            } catch (error) {
              console.error('❌ Erro individual para ' + ticker + ':', error);
            }
            return null;
          });
          
          // 🎯 AGUARDAR TODAS AS REQUISIÇÕES
          const results = await Promise.all(promises);
          const successCount = results.filter(r => r !== null).length;
          
          console.log('✅ Busca concluída: ' + successCount + '/' + tickers.length + ' cotações obtidas');
          
        } catch (error) {
          console.error('❌ Erro geral ao buscar cotações:', error);
          setCotacoesAtualizadas({});
        }
      }
    };

    buscarCotacoesIniciais();
  }, [dados, carteiraAtiva]); // Buscar quando mudar carteira também

  // 🧮 CALCULAR MÉTRICAS DA CARTEIRA COM MÉTODO "TOTAL RETURN"
  const calcularMetricas = (dadosCarteira) => {
    if (!dadosCarteira || dadosCarteira.length === 0) {
      return {
        valorInicial: 0,
        valorAtual: 0,
        rentabilidadeTotal: 0,
        rentabilidadeComProventos: 0,
        totalProventos: 0,
        melhorAtivo: null,
        piorAtivo: null,
        quantidadeAtivos: 0,
        tempoMedio: 0,
        rentabilidadeAnualizada: 0,
        rentabilidadeAnualizadaComProventos: 0
      };
    }

    // 💰 MÉTODO "TOTAL RETURN" - COMO NO MAIS RETORNO
    let valorInicialTotal = 0;
    let valorFinalTotal = 0;
    let totalProventos = 0;
    
    const ativosComCalculos = dadosCarteira.map(ativo => {
      // Investimento de R$ 1.000 por ativo (como no PDF)
      const valorInvestido = valorPorAtivo;
      
      // Quantas ações foram "compradas" com R$ 1.000
      const quantidadeAcoes = valorInvestido / ativo.precoEntrada;
      
      // 🔥 PARA POSIÇÕES ENCERRADAS, USAR PREÇO DE SAÍDA
      const precoAtual = ativo.posicaoEncerrada 
        ? ativo.precoSaida 
        : (cotacoesAtualizadas[ativo.ticker] || ativo.precoEntrada);
      
      // Proventos recebidos no período
      const proventosAtivo = calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
      
      // 🎯 TOTAL RETURN = Valor atual das ações + Proventos (simulando reinvestimento)
      // No método Total Return, os proventos são "reinvestidos" automaticamente
      const valorAtualAcoes = quantidadeAcoes * precoAtual;
      
      // Simular reinvestimento dos proventos (método simplificado)
      // Os proventos aumentam a quantidade de ações ao longo do tempo
      const dividendYieldPeriodo = ativo.precoEntrada > 0 ? (proventosAtivo / ativo.precoEntrada) : 0;
      const fatorReinvestimento = 1 + dividendYieldPeriodo;
      
      // Valor final considerando reinvestimento dos proventos
      const valorFinalComReinvestimento = valorAtualAcoes * fatorReinvestimento;
      
      // Performance individual
      const performanceTotal = ((valorFinalComReinvestimento - valorInvestido) / valorInvestido) * 100;
      const performanceAcao = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
      
      // Acumular totais
      valorInicialTotal += valorInvestido;
      valorFinalTotal += valorFinalComReinvestimento;
      totalProventos += proventosAtivo;
      
      return {
        ...ativo,
        quantidadeAcoes,
        precoAtual,
        valorInvestido,
        valorFinalComReinvestimento,
        proventosAtivo,
        performanceAcao,
        performanceTotal,
        dividendYieldPeriodo
      };
    });

    // 📊 RENTABILIDADES FINAIS (MÉTODO TOTAL RETURN)
    const rentabilidadeTotal = valorInicialTotal > 0 ? 
      ((valorFinalTotal - valorInicialTotal) / valorInicialTotal) * 100 : 0;
      
    // Para compatibilidade, calcular também sem reinvestimento
    const valorAtualSemReinvestimento = ativosComCalculos.reduce((sum, ativo) => 
      sum + (ativo.quantidadeAcoes * ativo.precoAtual), 0);
    
    const rentabilidadeSemProventos = valorInicialTotal > 0 ? 
      ((valorAtualSemReinvestimento - valorInicialTotal) / valorInicialTotal) * 100 : 0;
    
    // Encontrar melhor e pior ativo (baseado na performance total com reinvestimento)
    let melhorAtivo = null;
    let piorAtivo = null;
    let melhorPerformance = -Infinity;
    let piorPerformance = Infinity;

    ativosComCalculos.forEach((ativo) => {
      if (ativo.performanceTotal > melhorPerformance) {
        melhorPerformance = ativo.performanceTotal;
        melhorAtivo = { ...ativo, performance: ativo.performanceTotal };
      }
      
      if (ativo.performanceTotal < piorPerformance) {
        piorPerformance = ativo.performanceTotal;
        piorAtivo = { ...ativo, performance: ativo.performanceTotal };
      }
    });

    // Calcular tempo médio de investimento
    const hoje = new Date();
    const tempoMedio = dadosCarteira.reduce((sum, ativo) => {
      const [dia, mes, ano] = ativo.dataEntrada.split('/');
      const dataEntrada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      const tempoAnos = (hoje.getTime() - dataEntrada.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return sum + tempoAnos;
    }, 0) / dadosCarteira.length;

    return {
      valorInicial: valorInicialTotal,
      valorAtual: valorFinalTotal,
      rentabilidadeTotal: rentabilidadeTotal, // TOTAL RETURN (com reinvestimento)
      rentabilidadeComProventos: rentabilidadeTotal, // Mesmo valor no Total Return
      rentabilidadeSemProventos: rentabilidadeSemProventos, // Apenas valorização
      totalProventos,
      melhorAtivo,
      piorAtivo,
      quantidadeAtivos: dadosCarteira.length,
      tempoMedio: tempoMedio,
      rentabilidadeAnualizada: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
      rentabilidadeAnualizadaComProventos: tempoMedio > 0 ? rentabilidadeTotal / tempoMedio : 0,
      ativosComCalculos,
      // Valores para exibição
      valorFinalTotal,
      valorAtualSemReinvestimento
    };
  };

  // 💰 FUNÇÃO PARA CALCULAR PROVENTOS DE UM ATIVO NO PERÍODO
  const calcularProventosAtivo = (ticker, dataEntrada) => {
    try {
      // Buscar proventos do localStorage da Central de Proventos
      const proventosKey = 'proventos_' + ticker;
      const proventosData = localStorage.getItem(proventosKey);
      if (!proventosData) return 0;
      
      const proventos = JSON.parse(proventosData);
      const [dia, mes, ano] = dataEntrada.split('/');
      const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      
      // Filtrar proventos pagos após a data de entrada
      const proventosFiltrados = proventos.filter(provento => {
        try {
          let dataProventoObj;
          
          // Tentar diferentes formatos de data
          if (provento.dataPagamento) {
            if (provento.dataPagamento.includes('/')) {
              const [d, m, a] = provento.dataPagamento.split('/');
              dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
            } else if (provento.dataPagamento.includes('-')) {
              dataProventoObj = new Date(provento.dataPagamento);
            }
          } else if (provento.data) {
            if (provento.data.includes('/')) {
              const [d, m, a] = provento.data.split('/');
              dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
            } else if (provento.data.includes('-')) {
              dataProventoObj = new Date(provento.data);
            }
          } else if (provento.dataObj) {
            dataProventoObj = new Date(provento.dataObj);
          }
          
          return dataProventoObj && dataProventoObj >= dataEntradaObj;
        } catch (error) {
          console.error('Erro ao processar data do provento:', error);
          return false;
        }
      });
      
      // Somar valores dos proventos
      return proventosFiltrados.reduce((total, provento) => {
        const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor) || 0;
        return total + valor;
      }, 0);
      
    } catch (error) {
      console.error('Erro ao calcular proventos para ' + ticker + ':', error);
      return 0;
    }
  };

  // 🎯 OBTER DADOS DA CARTEIRA ATIVA (INCLUINDO POSIÇÕES ENCERRADAS)
  const dadosAtivos = dados[carteiraAtiva] || [];
  const carteiraConfig = CARTEIRAS_CONFIG[carteiraAtiva];
  const nomeCarteira = carteiraConfig?.nome || 'Carteira';

  // 📊 Separar ativos ativos e encerrados
  const ativosAtivos = dadosAtivos.filter(ativo => !ativo.posicaoEncerrada);
  const ativosEncerrados = dadosAtivos.filter(ativo => ativo.posicaoEncerrada);

  // 📊 Simular valor investido (R$ 1.000 por ativo para demonstração) - DEFINIR ANTES DO CÁLCULO
  const valorPorAtivo = 1000;

  // 🧮 CALCULAR MÉTRICAS INCLUINDO POSIÇÕES ENCERRADAS
  const metricas = calcularMetricas(dadosAtivos);

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

  // 📊 Simular valor investido - MOVER PARA DEPOIS DOS CÁLCULOS
  const valorTotalInvestido = metricas.quantidadeAtivos * valorPorAtivo;
  const valorTotalAtual = valorTotalInvestido * (1 + metricas.rentabilidadeTotal / 100);
  const ganhoPerda = valorTotalAtual - valorTotalInvestido;

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          Performance das Carteiras
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Resultados reais das nossas recomendações de investimento • Dados sincronizados em tempo real
        </p>
      </div>

      {/* Alerta de Transparência */}
      <div style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <h3 style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', margin: '0' }}>
            Transparência Total • Dados Sincronizados
          </h3>
        </div>
        <p style={{ color: '#1e40af', fontSize: '14px', margin: '0', lineHeight: '1.5' }}>
          Todas as rentabilidades são baseadas nos preços reais de entrada das nossas recomendações. 
          Os valores simulam um investimento de {formatCurrency(valorPorAtivo, carteiraConfig?.moeda)} por ativo para facilitar a compreensão.
          {loading && <span style={{ marginLeft: '12px', color: '#f59e0b' }}>🔄 Atualizando cotações...</span>}
          {Object.keys(cotacoesAtualizadas).length > 0 && (
            <span style={{ marginLeft: '12px', color: '#10b981' }}>
              ✅ {Object.keys(cotacoesAtualizadas).length} cotações atualizadas
            </span>
          )}
        </p>
      </div>

      {/* Seletores de Carteira */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(CARTEIRAS_CONFIG).map(([chave, config]) => {
          const qtdAtivos = dados[chave]?.length || 0;
          return (
            <button
              key={chave}
              onClick={() => setCarteiraAtiva(chave)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: carteiraAtiva === chave ? '2px solid' : '1px solid #e2e8f0',
                borderColor: carteiraAtiva === chave ? config.color : '#e2e8f0',
                backgroundColor: carteiraAtiva === chave ? config.color : '#ffffff',
                color: carteiraAtiva === chave ? '#ffffff' : '#64748b',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <span style={{ fontSize: '18px' }}>{config.icon}</span>
              {config.nome}
              <span style={{
                backgroundColor: carteiraAtiva === chave ? 'rgba(255,255,255,0.2)' : config.color,
                color: carteiraAtiva === chave ? 'white' : 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                {qtdAtivos}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botão para Atualizar Cotações Manualmente */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <button
          onClick={async () => {
            console.log('🔄 Atualizando cotações manualmente...');
            const ativosCarteira = dados[carteiraAtiva] || [];
            const tickers = ativosCarteira.map(ativo => ativo.ticker);
            
            if (tickers.length > 0) {
              try {
                const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
                const novasCotacoes = {};
                
                // 🔥 BUSCAR CADA TICKER INDIVIDUALMENTE
                for (const ticker of tickers) {
                  try {
                    console.log('🔍 Atualizando:', ticker);
                    
                    const apiUrl = 'https://brapi.dev/api/quote/' + ticker + '?token=' + BRAPI_TOKEN;
                    const response = await fetch(apiUrl, {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Rentabilidades-App'
                      }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      
                      if (data.results && data.results.length > 0) {
                        const quote = data.results[0];
                        if (quote.regularMarketPrice) {
                          novasCotacoes[ticker] = quote.regularMarketPrice;
                        }
                      }
                    }
                    
                    // 🔄 DELAY ENTRE REQUISIÇÕES
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                  } catch (error) {
                    console.error('❌ Erro para ' + ticker + ':', error);
                  }
                }
                
                setCotacoesAtualizadas(novasCotacoes);
                console.log('✅ Cotações atualizadas:', novasCotacoes);
              } catch (error) {
                console.error('❌ Erro geral:', error);
              }
            }
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto'
          }}
        >
          🔄 Atualizar Cotações da {nomeCarteira}
        </button>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Rentabilidade Total Return */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
              TOTAL RETURN (MÉTODO MAIS RETORNO)
            </span>
            <span style={{ fontSize: '32px' }}>
              {metricas.rentabilidadeTotal >= 0 ? '💎' : '📉'}
            </span>
          </div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: '900', 
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444',
            marginBottom: '12px'
          }}>
            {formatPercentage(metricas.rentabilidadeTotal)}
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
            Anualizada: {formatPercentage(metricas.rentabilidadeAnualizada)}
          </div>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>
            Inclui reinvestimento de proventos
          </div>
        </div>

        {/* Rentabilidade Apenas Ações */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (metricas.rentabilidadeSemProventos >= 0 ? '#3b82f6' : '#ef4444'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
              APENAS VALORIZAÇÃO DAS AÇÕES
            </span>
            <span style={{ fontSize: '32px' }}>
              {metricas.rentabilidadeSemProventos >= 0 ? '📈' : '📉'}
            </span>
          </div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: '900', 
            color: metricas.rentabilidadeSemProventos >= 0 ? '#3b82f6' : '#ef4444',
            marginBottom: '12px'
          }}>
            {formatPercentage(metricas.rentabilidadeSemProventos || 0)}
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
            Sem considerar proventos
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Apenas price appreciation
          </div>
        </div>

        {/* Valor Total Return */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid #3b82f6',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
              VALOR TOTAL RETURN
            </span>
            <span style={{ fontSize: '32px' }}>💰</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
            {formatCurrency(metricas.valorFinalTotal || valorTotalAtual, carteiraConfig?.moeda)}
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
            Investido: {formatCurrency(valorTotalInvestido, carteiraConfig?.moeda)}
          </div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444'
          }}>
            {metricas.rentabilidadeTotal >= 0 ? 'Ganho Total' : 'Perda Total'}: {formatCurrency(Math.abs((metricas.valorFinalTotal || valorTotalAtual) - valorTotalInvestido), carteiraConfig?.moeda)}
          </div>
        </div>

        {/* Melhor Ativo */}
        {metricas.melhorAtivo && (
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #10b981',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ color: '#065f46', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
                DESTAQUE POSITIVO
              </span>
              <span style={{ fontSize: '32px' }}>🏆</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#065f46', marginBottom: '8px' }}>
              {metricas.melhorAtivo.ticker}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>
              {formatPercentage(metricas.melhorAtivo.performance)}
            </div>
            <div style={{ fontSize: '14px', color: '#065f46' }}>
              {metricas.melhorAtivo.setor}
            </div>
          </div>
        )}

        {/* Diversificação */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          borderLeft: '6px solid ' + (carteiraConfig?.color || '#f59e0b'),
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>
              DIVERSIFICAÇÃO
            </span>
            <span style={{ fontSize: '32px' }}>{carteiraConfig?.icon || '🎯'}</span>
          </div>
          <div style={{ fontSize: '42px', fontWeight: '900', color: carteiraConfig?.color || '#f59e0b', marginBottom: '8px' }}>
            {metricas.quantidadeAtivos}
          </div>
          <div style={{ fontSize: '16px', color: '#64748b', marginBottom: '8px' }}>
            Ativos na carteira {nomeCarteira}
          </div>
          <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
            Moeda: {carteiraConfig?.moeda || 'BRL'}
          </div>
        </div>
      </div>

      {/* Tabela de Ativos Ativos */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            📊 Performance Individual - Posições Ativas
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0'
          }}>
            Baseado nos preços reais de entrada das nossas recomendações • Total: {ativosAtivos.length} ativos ativos
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  ATIVO
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  ENTRADA
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  PREÇO INICIAL
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  PREÇO ATUAL
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  PROVENTOS
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  PERFORMANCE
                </th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                  VALOR SIMULADO
                </th>
              </tr>
            </thead>
            <tbody>
              {ativosAtivos.map((ativo, index) => {
                const precoAtual = cotacoesAtualizadas[ativo.ticker] || ativo.precoEntrada;
                const performance = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
                const proventosAtivo = calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
                const performanceComProventos = performance + ((proventosAtivo / ativo.precoEntrada) * 100);
                const valorAtualSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
                const temCotacaoReal = !!cotacoesAtualizadas[ativo.ticker];
                
                return (
                  <tr key={ativo.id || index} style={{ 
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: performanceComProventos >= 0 ? '#dcfce7' : '#fee2e2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          color: performanceComProventos >= 0 ? '#065f46' : '#991b1b'
                        }}>
                          {ativo.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                            {ativo.ticker}
                            {!temCotacaoReal && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '12px', 
                                color: '#f59e0b',
                                backgroundColor: '#fef3c7',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                SIM
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '14px' }}>
                            {ativo.setor}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
                      {ativo.dataEntrada}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                      {formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: performance >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(precoAtual, carteiraConfig?.moeda)}
                      {temCotacaoReal && (
                        <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '500' }}>
                          ✅ API
                        </div>
                      )}
                      {!temCotacaoReal && (
                        <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                          📊 Simulado
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ 
                        fontWeight: '700',
                        color: proventosAtivo > 0 ? '#059669' : '#64748b',
                        fontSize: '14px'
                      }}>
                        {proventosAtivo > 0 ? formatCurrency(proventosAtivo, carteiraConfig?.moeda) : '-'}
                      </div>
                      {proventosAtivo > 0 && (
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>
                          📈 Central
                        </div>
                      )}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      fontWeight: '800',
                      fontSize: '16px'
                    }}>
                      <div style={{ color: performanceComProventos >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatPercentage(performanceComProventos)}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b', 
                        fontWeight: '500',
                        marginTop: '4px'
                      }}>
                        Ação: {formatPercentage(performance)}
                      </div>
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      fontWeight: '700',
                      color: '#1e293b',
                      backgroundColor: performanceComProventos >= 0 ? '#f0fdf4' : '#fef2f2'
                    }}>
                      {formatCurrency(valorAtualSimulado, carteiraConfig?.moeda)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 TABELA DE POSIÇÕES ENCERRADAS (VENDIDAS) */}
      {ativosEncerrados.length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid #fecaca',
            backgroundColor: '#fef2f2'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#991b1b',
              margin: '0 0 8px 0'
            }}>
              🔒 Performance Individual - Posições Vendidas
            </h3>
            <p style={{
              color: '#b91c1c',
              fontSize: '16px',
              margin: '0'
            }}>
              Histórico completo de posições encerradas com performance final • Total: {ativosEncerrados.length} ativos vendidos
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fee2e2' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    ATIVO
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    ENTRADA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    SAÍDA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    PREÇO ENTRADA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    PREÇO SAÍDA
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    PROVENTOS
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    PERFORMANCE FINAL
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    VALOR FINAL
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#991b1b', fontSize: '14px' }}>
                    MOTIVO
                  </th>
                </tr>
              </thead>
              <tbody>
                {ativosEncerrados.map((ativo, index) => {
                  const performanceAcao = ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
                  const proventosAtivo = calcularProventosAtivo(ativo.ticker, ativo.dataEntrada);
                  const performanceComProventos = performanceAcao + ((proventosAtivo / ativo.precoEntrada) * 100);
                  const valorFinalSimulado = valorPorAtivo * (1 + performanceComProventos / 100);
                  
                  return (
                    <tr key={ativo.id || ('encerrado-' + index)} style={{ 
                      borderBottom: '1px solid #fecaca',
                      backgroundColor: '#fef2f2'
                    }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: performanceComProventos >= 0 ? '#dcfce7' : '#fee2e2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            color: performanceComProventos >= 0 ? '#065f46' : '#991b1b'
                          }}>
                            {ativo.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#991b1b', fontSize: '16px' }}>
                              {ativo.ticker}
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '12px', 
                                color: '#dc2626',
                                backgroundColor: '#fecaca',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                VENDIDA
                              </span>
                            </div>
                            <div style={{ color: '#b91c1c', fontSize: '14px' }}>
                              {ativo.setor}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#991b1b' }}>
                        {ativo.dataEntrada}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#991b1b' }}>
                        {ativo.dataSaida}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#991b1b' }}>
                        {formatCurrency(ativo.precoEntrada, carteiraConfig?.moeda)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: performanceAcao >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatCurrency(ativo.precoSaida, carteiraConfig?.moeda)}
                        <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '500' }}>
                          🔒 FINAL
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ 
                          fontWeight: '700',
                          color: proventosAtivo > 0 ? '#059669' : '#64748b',
                          fontSize: '14px'
                        }}>
                          {proventosAtivo > 0 ? formatCurrency(proventosAtivo, carteiraConfig?.moeda) : '-'}
                        </div>
                        {proventosAtivo > 0 && (
                          <div style={{ fontSize: '10px', color: '#059669', fontWeight: '500' }}>
                            📈 Período
                          </div>
                        )}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '800',
                        fontSize: '16px'
                      }}>
                        <div style={{ color: performanceComProventos >= 0 ? '#10b981' : '#ef4444' }}>
                          {formatPercentage(performanceComProventos)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#64748b', 
                          fontWeight: '500',
                          marginTop: '4px'
                        }}>
                          Ação: {formatPercentage(performanceAcao)}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontWeight: '700',
                        color: '#1e293b',
                        backgroundColor: performanceComProventos >= 0 ? '#f0fdf4' : '#fef2f2'
                      }}>
                        {formatCurrency(valorFinalSimulado, carteiraConfig?.moeda)}
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center', 
                        fontSize: '12px', 
                        color: '#991b1b',
                        fontWeight: '600'
                      }}>
                        {ativo.motivoEncerramento}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer com Informações sobre Posições Vendidas */}
      {ativosEncerrados.length > 0 && (
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#10b981',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>
            🔒 Histórico Completo de Posições
          </h3>
          <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
            Nossa página de rentabilidades agora inclui o histórico completo de {ativosEncerrados.length} posições vendidas, 
            mostrando performance final com preços reais de entrada e saída. Transparência total em cada decisão de investimento.
          </p>
        </div>
      )}
    </div>
  );
}