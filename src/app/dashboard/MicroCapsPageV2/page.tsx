/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';

// 🚀 HOOKS CUSTOMIZADOS
import { useMicroCapsData } from '@/hooks/micro-caps/useMicroCapsData';
import { useMarketData, useIbovespaPeriodo } from '@/hooks/micro-caps/useMarketData';

// 🧮 UTILITÁRIOS
import { calcularMetricasCarteira, formatCurrency, formatPercentage } from '@/utils/micro-caps/calculationUtils';

// 🎨 ESTILOS RESPONSIVOS
const styles = {
  container: (isMobile: boolean) => ({
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: isMobile ? '16px' : '24px'
  }),
  
  header: (isMobile: boolean) => ({
    marginBottom: isMobile ? '24px' : '32px'
  }),
  
  title: (isMobile: boolean) => ({
    fontSize: isMobile ? '32px' : '48px',
    fontWeight: '800',
    color: '#1e293b',
    margin: '0 0 8px 0',
    lineHeight: 1.2
  }),
  
  metricsGrid: (isMobile: boolean) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: isMobile ? '12px' : '16px',
    marginBottom: isMobile ? '24px' : '32px'
  }),
  
  card: (isMobile: boolean) => ({
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }),
  
  cardLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '8px'
  },
  
  cardValue: (isMobile: boolean, color = '#1e293b') => ({
    fontSize: isMobile ? '20px' : '24px',
    fontWeight: '700',
    color,
    lineHeight: '1'
  })
};

// 🔥 CSS ANIMATIONS
const cssAnimations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .card-hover {
    transition: all 0.2s ease;
  }
  
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

// 🏷️ COMPONENTE: Loading State
const LoadingState: React.FC<{ isMobile: boolean; screenWidth: number }> = ({ isMobile, screenWidth }) => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  }}>
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '48px',
      textAlign: 'center',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #e2e8f0',
        borderTop: '4px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 8px 0'
      }}>
        Carregando Micro Caps V2
      </h3>
      <p style={{
        color: '#64748b',
        fontSize: '14px',
        margin: '0'
      }}>
        📱 Dispositivo: {isMobile ? 'Mobile' : 'Desktop'} ({screenWidth}px)
      </p>
    </div>
  </div>
);

// 🏷️ COMPONENTE: Metrics Card
const MetricCard: React.FC<{
  label: string;
  value: string;
  color?: string;
  subValue?: string;
  isMobile: boolean;
}> = ({ label, value, color = '#1e293b', subValue, isMobile }) => (
  <div style={styles.card(isMobile)} className="card-hover">
    <div style={styles.cardLabel}>{label}</div>
    <div style={styles.cardValue(isMobile, color)}>{value}</div>
    {subValue && (
      <div style={{
        fontSize: '11px',
        color: '#64748b',
        lineHeight: '1',
        marginTop: '4px'
      }}>
        {subValue}
      </div>
    )}
  </div>
);

// 🏷️ COMPONENTE: Asset Card (Mobile)
const AssetCard: React.FC<{ ativo: any; index: number }> = ({ ativo, index }) => (
  <div
    key={ativo.id || index}
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    }}
    className="card-hover"
  >
    {/* Header do Card */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
        color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: '700'
      }}>
        {ativo.ticker.slice(0, 2)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#1e293b'
        }}>
          {ativo.ticker}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#64748b'
        }}>
          {ativo.setor}
        </div>
      </div>
      <div style={{
        fontSize: '20px',
        fontWeight: '800',
        color: ativo.performance >= 0 ? '#10b981' : '#ef4444',
        textAlign: 'right'
      }}>
        {formatPercentage(ativo.performance)}
      </div>
    </div>

    {/* Dados do Card */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      fontSize: '14px'
    }}>
      <div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>Entrada</div>
        <div style={{ fontWeight: '600' }}>{ativo.dataEntrada}</div>
      </div>
      <div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>Preço Atual</div>
        <div style={{ fontWeight: '600' }}>{formatCurrency(ativo.precoAtual)}</div>
      </div>
      <div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>DY 12M</div>
        <div style={{ fontWeight: '600' }}>{ativo.dy}</div>
      </div>
      <div>
        <div style={{ color: '#64748b', marginBottom: '4px' }}>Viés</div>
        <span style={{
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
          color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
        }}>
          {ativo.vies}
        </span>
      </div>
    </div>
  </div>
);

// 🏷️ COMPONENTE PRINCIPAL DA PÁGINA
export default function MicroCapsV2Page() {
  // 🚀 HOOKS CUSTOMIZADOS
  const { ativosAtualizados, loading, error, refetch, isMobile, screenWidth, stats } = useMicroCapsData();
  const { smllData, ibovespaData } = useMarketData();
  const { ibovespaPeriodo } = useIbovespaPeriodo(ativosAtualizados);

  // 🧮 CALCULAR MÉTRICAS
  const metricas = React.useMemo(() => 
    calcularMetricasCarteira(ativosAtualizados, 1000), 
    [ativosAtualizados]
  );

  // 🔄 REFRESH MANUAL
  const handleRefresh = React.useCallback(() => {
    console.log('🔄 Refresh manual solicitado');
    refetch();
  }, [refetch]);

  // 🔍 DEBUG DE PROVENTOS (TEMPORÁRIO)
  const debugProventos = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const debugInfo = [];
    
    const master = localStorage.getItem('proventos_central_master');
    debugInfo.push(`Master: ${master ? 'EXISTE' : 'NÃO EXISTE'}`);
    
    if (master) {
      try {
        const dados = JSON.parse(master);
        debugInfo.push(`Total proventos no master: ${dados.length}`);
        const tickers = new Set(dados.map((d: any) => d.ticker));
        debugInfo.push(`Tickers no master: ${Array.from(tickers).slice(0, 5).join(', ')}...`);
      } catch (e: any) {
        debugInfo.push(`Erro no master: ${e.message}`);
      }
    }
    
    const tickersAmostra = ativosAtualizados.slice(0, 3).map(a => a.ticker);
    tickersAmostra.forEach(ticker => {
      const individual = localStorage.getItem(`proventos_${ticker}`);
      debugInfo.push(`${ticker} individual: ${individual ? 'EXISTE' : 'NÃO EXISTE'}`);
    });
    
    alert(debugInfo.join('\n'));
  }, [ativosAtualizados]);

  // 🔄 LOADING STATE
  if (loading) {
    return (
      <>
        <style>{cssAnimations}</style>
        <LoadingState isMobile={isMobile} screenWidth={screenWidth} />
      </>
    );
  }

  return (
    <div style={styles.container(isMobile)}>
      <style>{cssAnimations}</style>

      {/* 📱 Header Responsivo */}
      <div style={styles.header(isMobile)} className="fade-in">
        <h1 style={styles.title(isMobile)}>
          🚀 Micro Caps V2 - Refatorado
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '16px'
        }}>
          <p style={{ 
            color: '#64748b', 
            fontSize: isMobile ? '16px' : '18px',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Hooks customizados • App Router • {metricas.quantidadeAtivos} ativos • 📱 {isMobile ? 'Mobile' : 'Desktop'} ({screenWidth}px)
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: isMobile ? '12px 20px' : '12px 24px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              className="card-hover"
            >
              🔄 Atualizar
            </button>
            
            <button
              onClick={debugProventos}
              style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: isMobile ? '12px 20px' : '12px 24px',
                fontSize: isMobile ? '14px' : '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              className="card-hover"
            >
              🔍 Debug
            </button>
          </div>
        </div>
        
        {error && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#991b1b'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* 📊 Cards de Métricas */}
      <div style={styles.metricsGrid(isMobile)} className="fade-in">
        <MetricCard
          label="Rentabilidade total"
          value={formatPercentage(metricas.rentabilidadeTotal)}
          color={metricas.rentabilidadeTotal >= 0 ? '#10b981' : '#ef4444'}
          isMobile={isMobile}
        />

        <MetricCard
          label="DY médio 12M"
          value={`${metricas.dyMedio.toFixed(1)}%`}
          isMobile={isMobile}
        />

        <MetricCard
          label="SMLL Index"
          value={smllData?.valorFormatado || '2.205'}
          color={smllData?.trend === 'up' ? '#10b981' : '#ef4444'}
          subValue={smllData ? formatPercentage(smllData.variacaoPercent) : '+0.4%'}
          isMobile={isMobile}
        />

        <MetricCard
          label="Ibovespa"
          value={ibovespaData?.valorFormatado || '137.213'}
          color={ibovespaData?.trend === 'up' ? '#10b981' : '#ef4444'}
          subValue={ibovespaData ? formatPercentage(ibovespaData.variacaoPercent) : '+0.2%'}
          isMobile={isMobile}
        />

        <MetricCard
          label="Ibovespa período"
          value={ibovespaPeriodo ? formatPercentage(ibovespaPeriodo.performancePeriodo) : '+19.2%'}
          color={ibovespaPeriodo?.performancePeriodo >= 0 ? '#10b981' : '#ef4444'}
          subValue={`Desde ${ibovespaPeriodo?.dataInicial || 'jan/2020'}`}
          isMobile={isMobile}
        />

        <MetricCard
          label="No Verde"
          value={metricas.ativosPositivos.toString()}
          color="#10b981"
          isMobile={isMobile}
        />

        <MetricCard
          label="No Vermelho"
          value={metricas.ativosNegativos.toString()}
          color="#ef4444"
          isMobile={isMobile}
        />
      </div>

      {/* 📋 Tabela/Cards dos Ativos */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        marginBottom: isMobile ? '24px' : '32px'
      }} className="fade-in">
        {/* Header */}
        <div style={{
          padding: isMobile ? '20px' : '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: isMobile ? '20px' : '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0'
          }}>
            Micro Caps • Performance Individual
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: isMobile ? '14px' : '16px',
            margin: '0'
          }}>
            Hooks refatorados • {stats.ativosComCotacao}/{stats.totalAtivos} cotações • {stats.ativosComDY}/{stats.totalAtivos} DY
          </p>
        </div>

        {/* Conteúdo */}
        {isMobile ? (
          <div style={{ padding: '16px' }}>
            {ativosAtualizados.map((ativo, index) => (
              <AssetCard key={ativo.id || index} ativo={ativo} index={index} />
            ))}
          </div>
        ) : (
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
                    PREÇO ATUAL
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    PERFORMANCE
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    DY 12M
                  </th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151', fontSize: '14px' }}>
                    VIÉS
                  </th>
                </tr>
              </thead>
              <tbody>
                {ativosAtualizados.map((ativo, index) => (
                  <tr 
                    key={ativo.id || index}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: ativo.performance >= 0 ? '#dcfce7' : '#fee2e2',
                          color: ativo.performance >= 0 ? '#065f46' : '#991b1b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700'
                        }}>
                          {ativo.ticker.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px' }}>
                            {ativo.ticker}
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
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#374151' }}>
                      {formatCurrency(ativo.precoAtual)}
                    </td>
                    <td style={{ 
                      padding: '16px', 
                      textAlign: 'center', 
                      fontWeight: '800',
                      fontSize: '16px',
                      color: ativo.performance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {formatPercentage(ativo.performance)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#1e293b' }}>
                      {ativo.dy}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: ativo.vies === 'Compra' ? '#dcfce7' : '#fef3c7',
                        color: ativo.vies === 'Compra' ? '#065f46' : '#92400e'
                      }}>
                        {ativo.vies}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📊 Debug Info */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        fontSize: '12px',
        color: '#64748b'
      }}>
        <div>✅ REFATORADO V2 • App Router • Next.js 13+ • Device: {isMobile ? 'Mobile' : 'Desktop'} • Screen: {screenWidth}px</div>
        <div>🔄 Hooks: useMicroCapsData + useMarketData + useApiStrategy + useResponsive • Ativos: {stats.totalAtivos}</div>
        <div>📈 API: {stats.ativosComCotacao} cotações + {stats.ativosComDY} DY • Layout: {isMobile ? 'Cards' : 'Table'}</div>
        <div>📍 Rota: /dashboard/MicroCapsPageV2 • Performance: Total Return (ação + proventos)</div>
      </div>
    </div>
  );
}