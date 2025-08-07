// components/BrapiIntegration.tsx
import React, { useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Zap, Download, BarChart3, DollarSign, Activity, Percent, Calculator, PieChart, Target, Building, ArrowUp, ArrowDown } from 'lucide-react';
import { useBrapi } from '@/hooks/useBrapi';
import { DadosTrimestre } from '@/lib/brapi-config';

interface BrapiIntegrationProps {
  ticker: string;
  trimestre: string;
  onImportarDados: (dados: DadosTrimestre) => void;
  disabled?: boolean;
}

export const BrapiIntegration: React.FC<BrapiIntegrationProps> = ({
  ticker,
  trimestre,
  onImportarDados,
  disabled = false
}) => {
  const { buscarDadosTrimestre, buscarCotacao, loading, error } = useBrapi();
  const [dadosEncontrados, setDadosEncontrados] = useState<DadosTrimestre | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [cotacaoAtual, setCotacaoAtual] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'resumo' | 'dre' | 'margens' | 'historico'>('resumo');

  const handleBuscarDados = useCallback(async () => {
    if (!ticker || !trimestre) {
      alert('Por favor, preencha Ticker e Trimestre primeiro');
      return;
    }

    try {
      console.log(`🔍 Iniciando busca completa: ${ticker} - ${trimestre}`);
      
      // Buscar dados do trimestre e cotação atual em paralelo
      const [dados, cotacao] = await Promise.all([
        buscarDadosTrimestre(ticker, trimestre),
        buscarCotacao(ticker)
      ]);
      
      setDadosEncontrados(dados);
      setCotacaoAtual(cotacao);
      setShowPreview(true);
      setActiveTab('resumo'); // Reset para aba inicial
      
      console.log('✅ Dados completos carregados com sucesso');
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao buscar dados BRAPI: ${message}`);
    }
  }, [ticker, trimestre, buscarDadosTrimestre, buscarCotacao]);

  const handleImportarDados = useCallback(() => {
    if (dadosEncontrados) {
      onImportarDados(dadosEncontrados);
      alert('✅ Dados completos importados com sucesso!');
      setShowPreview(false);
    }
  }, [dadosEncontrados, onImportarDados]);

  const formatarNumero = useCallback((num: number, decimais: number = 1): string => {
    if (isNaN(num) || !isFinite(num)) return '0';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
  }, []);

  const formatarVariacao = useCallback((variacao: number) => {
    if (isNaN(variacao) || !isFinite(variacao)) variacao = 0;
    
    const isPositivo = variacao >= 0;
    return {
      texto: `${isPositivo ? '+' : ''}${formatarNumero(variacao, 1)}%`,
      cor: isPositivo ? '#22c55e' : '#dc2626',
      icone: isPositivo ? <ArrowUp size={14} /> : <ArrowDown size={14} />
    };
  }, [formatarNumero]);

  const getBadgeColor = useCallback((tipo: string) => {
    switch (tipo) {
      case 'success': return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'error': return { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
      case 'info': return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      default: return { bg: '#f1f5f9', color: '#1e293b', border: '#e2e8f0' };
    }
  }, []);

  // Estado inicial - Sem ticker ou trimestre
  if (!ticker || !trimestre) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '2px dashed #cbd5e1',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
        <h4 style={{ color: '#64748b', margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
          Integração BRAPI Avançada
        </h4>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Preencha Ticker e Trimestre para buscar dados completos da BRAPI
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      overflow: 'hidden',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header da integração */}
      <div style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        color: 'white',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                Dados BRAPI Completos
              </h4>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                {ticker.toUpperCase()} • {trimestre} • DRE + Margens + Análise
              </p>
            </div>
          </div>

          <button
            onClick={handleBuscarDados}
            disabled={loading || disabled}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: loading || disabled ? 'not-allowed' : 'pointer',
              opacity: loading || disabled ? 0.6 : 1,
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>⏳ Buscando...</>
            ) : (
              <>
                <Download size={16} />
                Buscar Dados Completos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#dc2626'
        }}>
          <AlertCircle size={16} />
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Preview dos dados encontrados */}
      {showPreview && dadosEncontrados && (
        <div>
          {/* Header do preview com ação */}
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                  📊 Análise Completa • {trimestre}
                </h5>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                  {dadosEncontrados.nomeEmpresa} • {dadosEncontrados.dataReferencia}
                </p>
              </div>
              <button
                onClick={handleImportarDados}
                style={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                <CheckCircle size={16} />
                Importar Todos os Dados
              </button>
            </div>

            {/* Análise automática - Situação geral */}
            <div style={{
              backgroundColor: dadosEncontrados.analiseAutomatica.situacaoLucro === 'lucro' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${dadosEncontrados.analiseAutomatica.situacaoLucro === 'lucro' ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h6 style={{ 
                margin: '0 0 8px 0', 
                fontSize: '14px', 
                color: dadosEncontrados.analiseAutomatica.situacaoLucro === 'lucro' ? '#15803d' : '#991b1b',
                fontWeight: '600'
              }}>
                🎯 Análise Automática
              </h6>
              <div style={{ 
                fontSize: '13px', 
                color: dadosEncontrados.analiseAutomatica.situacaoLucro === 'lucro' ? '#15803d' : '#991b1b'
              }}>
                <strong>Situação:</strong> {dadosEncontrados.analiseAutomatica.situacaoLucro === 'lucro' ? '✅ Lucro' : '❌ Prejuízo'} • 
                <strong> Eficiência Op.:</strong> {dadosEncontrados.analiseAutomatica.eficienciaOperacional} • 
                <strong> Alavancagem:</strong> {dadosEncontrados.analiseAutomatica.alavancagemFinanceira} • 
                <strong> Qualidade Lucro:</strong> {dadosEncontrados.analiseAutomatica.qualidadeLucro}
              </div>
            </div>

            {/* Badges categorizados */}
            {dadosEncontrados.badges && dadosEncontrados.badges.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h6 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  🏷️ Insights por Categoria
                </h6>
                
                {/* Agrupar badges por categoria */}
                {['crescimento', 'rentabilidade', 'eficiencia', 'financeiro', 'alerta'].map(categoria => {
                  const badgesCategoria = dadosEncontrados.badges.filter(b => b.categoria === categoria);
                  if (badgesCategoria.length === 0) return null;
                  
                  return (
                    <div key={categoria} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', textTransform: 'capitalize' }}>
                        {categoria === 'crescimento' && '📈'} 
                        {categoria === 'rentabilidade' && '💰'} 
                        {categoria === 'eficiencia' && '⚡'} 
                        {categoria === 'financeiro' && '💸'} 
                        {categoria === 'alerta' && '⚠️'} 
                        {categoria}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                        {badgesCategoria.map((badge, index) => {
                          const colors = getBadgeColor(badge.tipo);
                          return (
                            <div 
                              key={index} 
                              title={badge.descricao}
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.color,
                                border: `1px solid ${colors.border}`,
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'help'
                              }}
                            >
                              {badge.texto}
                              {badge.valor && ` (${formatarNumero(badge.valor, 1)})`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabs de navegação */}
          <div style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', padding: '0 24px' }}>
              {[
                { id: 'resumo', label: '📊 Resumo', icon: <BarChart3 size={16} /> },
                { id: 'dre', label: '💰 DRE Completa', icon: <Calculator size={16} /> },
                { id: 'margens', label: '📈 Margens', icon: <Percent size={16} /> },
                { id: 'historico', label: '⏱️ Histórico', icon: <Activity size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                    cursor: 'pointer',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo das tabs */}
          <div style={{ padding: '24px' }}>
            {/* Tab Resumo */}
            {activeTab === 'resumo' && (
              <div>
                <h6 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Métricas Principais
                </h6>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '16px'
                }}>
                  {/* Card Receita */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h6 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        Receita Bruta
                      </h6>
                      <DollarSign size={16} style={{ color: '#64748b' }} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                      R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.receitaBruta)}M
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <div style={{ 
                        color: formatarVariacao(dadosEncontrados.variacoes.receita.variacaoQoQ).cor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {formatarVariacao(dadosEncontrados.variacoes.receita.variacaoQoQ).icone}
                        {formatarVariacao(dadosEncontrados.variacoes.receita.variacaoQoQ).texto} QoQ
                      </div>
                      <div style={{ 
                        color: formatarVariacao(dadosEncontrados.variacoes.receita.variacaoYoY).cor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {formatarVariacao(dadosEncontrados.variacoes.receita.variacaoYoY).icone}
                        {formatarVariacao(dadosEncontrados.variacoes.receita.variacaoYoY).texto} YoY
                      </div>
                    </div>
                  </div>

                  {/* Card Lucro Bruto */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h6 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        Lucro Bruto
                      </h6>
                      <Building size={16} style={{ color: '#64748b' }} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                      R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.lucroBruto)}M
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Margem: {formatarNumero(dadosEncontrados.margens.margemBruta, 1)}%
                    </div>
                  </div>

                  {/* Card EBIT */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h6 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        EBIT
                      </h6>
                      <BarChart3 size={16} style={{ color: '#64748b' }} />
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                      R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.ebit)}M
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Margem: {formatarNumero(dadosEncontrados.margens.margemEbit, 1)}%
                    </div>
                  </div>

                  {/* Card Lucro Líquido */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h6 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        Lucro Líquido
                      </h6>
                      <Activity size={16} style={{ color: '#64748b' }} />
                    </div>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: '700', 
                      color: dadosEncontrados.demonstrativoResultados.lucroLiquido >= 0 ? '#1e293b' : '#dc2626', 
                      marginBottom: '4px' 
                    }}>
                      R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.lucroLiquido)}M
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Margem: {formatarNumero(dadosEncontrados.margens.margemLiquida, 1)}% • 
                      LPA: R$ {formatarNumero(dadosEncontrados.porAcao.lpaBasico, 2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab DRE Completa */}
            {activeTab === 'dre' && (
              <div>
                <h6 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Demonstrativo de Resultados Completo
                </h6>
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr style={{ backgroundColor: '#e2e8f0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Receita Bruta</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.receitaBruta, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(-) Custo dos Produtos</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.custoProdutos, 0)}M
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>(=) Lucro Bruto</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.lucroBruto, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(-) Despesas Administrativas</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.despesasAdministrativas, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(-) Despesas de Vendas</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.despesasVendas, 0)}M
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>(=) Resultado Operacional</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: dadosEncontrados.demonstrativoResultados.resultadoOperacional >= 0 ? '#1e293b' : '#dc2626' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.resultadoOperacional, 0)}M
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#e2e8f0' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>(=) EBIT</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.ebit, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(+) Receitas Financeiras</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#22c55e' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.receitasFinanceiras, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(-) Despesas Financeiras</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.despesasFinanceiras, 0)}M
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>(=) Lucro Antes do IR</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.lucroAntesImposto, 0)}M
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '12px 16px', color: '#64748b' }}>(-) Imposto de Renda</td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                          R$ {formatarNumero(Math.abs(dadosEncontrados.demonstrativoResultados.impostoRenda), 0)}M
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: dadosEncontrados.demonstrativoResultados.lucroLiquido >= 0 ? '#f0fdf4' : '#fef2f2' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#374151' }}>(=) Lucro Líquido</td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'right', 
                          fontWeight: '700', 
                          fontSize: '16px',
                          color: dadosEncontrados.demonstrativoResultados.lucroLiquido >= 0 ? '#15803d' : '#dc2626'
                        }}>
                          R$ {formatarNumero(dadosEncontrados.demonstrativoResultados.lucroLiquido, 0)}M
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab Margens */}
            {activeTab === 'margens' && (
              <div>
                <h6 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Análise de Margens
                </h6>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '16px'
                }}>
                  {[
                    { nome: 'Margem Bruta', valor: dadosEncontrados.margens.margemBruta, icone: <PieChart size={16} /> },
                    { nome: 'Margem Operacional', valor: dadosEncontrados.margens.margemOperacional, icone: <Target size={16} /> },
                    { nome: 'Margem EBIT', valor: dadosEncontrados.margens.margemEbit, icone: <BarChart3 size={16} /> },
                    { nome: 'Margem Líquida', valor: dadosEncontrados.margens.margemLiquida, icone: <Activity size={16} /> }
                  ].map((margem, index) => (
                    <div key={index} style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        {margem.icone}
                      </div>
                      <h6 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                        {margem.nome}
                      </h6>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: margem.valor >= 0 ? '#1e293b' : '#dc2626',
                        marginBottom: '4px'
                      }}>
                        {formatarNumero(margem.valor, 1)}%
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: '#e2e8f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(Math.abs(margem.valor), 100)}%`,
                          backgroundColor: margem.valor >= 20 ? '#22c55e' : 
                                         margem.valor >= 10 ? '#f59e0b' : '#dc2626',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Histórico */}
            {activeTab === 'historico' && dadosEncontrados.historicoComparativo && (
              <div>
                <h6 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                  Histórico Comparativo (últimos 6 trimestres)
                </h6>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    fontSize: '12px',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Trimestre</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Receita</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>L.Bruto</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>EBIT</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>L.Líquido</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Mg.Bruta</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>Mg.Líq</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>LPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dadosEncontrados.historicoComparativo.slice(0, 6).map((item, index) => (
                        <tr key={index} style={{ 
                          backgroundColor: index === 0 ? '#f0f9ff' : index % 2 === 1 ? '#f8fafc' : 'white',
                          fontWeight: index === 0 ? '600' : 'normal'
                        }}>
                          <td style={{ padding: '10px 8px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            {item.trimestre}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            R$ {formatarNumero(item.receita, 0)}M
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            R$ {formatarNumero(item.lucroBruto, 0)}M
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            R$ {formatarNumero(item.ebit, 0)}M
                          </td>
                          <td style={{ 
                            padding: '10px 8px', 
                            textAlign: 'right', 
                            color: item.lucroLiquido >= 0 ? '#1e293b' : '#dc2626',
                            borderBottom: '1px solid #f1f5f9'
                          }}>
                            R$ {formatarNumero(item.lucroLiquido, 0)}M
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            {formatarNumero(item.margemBruta, 1)}%
                          </td>
                          <td style={{ 
                            padding: '10px 8px', 
                            textAlign: 'right', 
                            color: item.margemLiquida >= 0 ? '#1e293b' : '#dc2626',
                            borderBottom: '1px solid #f1f5f9'
                          }}>
                            {formatarNumero(item.margemLiquida, 1)}%
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}>
                            R$ {formatarNumero(item.lpaBasico, 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};