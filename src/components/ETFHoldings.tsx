'use client';

import React, { useState, useEffect } from 'react';

// 🏢 FUNÇÃO PARA DETECTAR ETFs AUTOMATICAMENTE
const isETF = (ticker: string): boolean => {
  if (!ticker) return false;
  
  // Lista de ETFs conhecidos
  const etfsConhecidos = [
    'QQQ', 'SPY', 'VTI', 'VEA', 'VWO', 'QUAL', 'SOXX', 'XLF', 'XLK', 'XLV', 'XLE',
    'HERO', 'MCHI', 'TFLO', 'TLT', 'IEF', 'SHY', 'NOBL', 'VNQ', 'SCHP', 'VTEB',
    'VOO', 'IVV', 'VXUS', 'BND', 'AGG', 'LQD', 'HYG', 'EMB', 'VB', 'VTV', 'VUG',
    'IWM', 'IWN', 'IWO', 'IJH', 'IJR', 'IJK', 'IJJ', 'IJS', 'IWV', 'ITOT',
    'XLC', 'XLI', 'XLB', 'XLRE', 'XLP', 'XLY', 'XLU', 'GLD', 'SLV', 'IAU',
    'PDBC', 'DBA', 'USO', 'UNG', 'ARKK', 'ARKQ', 'ARKW', 'ARKG', 'ARKF'
  ];
  
  // Verificar se está na lista de ETFs conhecidos
  if (etfsConhecidos.includes(ticker.toUpperCase())) {
    return true;
  }
  
  // Verificar padrões comuns de ETFs
  const etfPatterns = [
    /ETF$/i,           // Termina com ETF
    /^[A-Z]{3,4}$/,    // 3-4 letras (maioria dos ETFs)
    /^I[A-Z]{2}$/,     // iShares (IVV, IJH, etc)
    /^V[A-Z]{2,3}$/,   // Vanguard (VOO, VTI, etc)
    /^XL[A-Z]$/,       // SPDR Sector (XLF, XLK, etc)
    /^ARK[A-Z]$/       // ARK ETFs (ARKK, ARKQ, etc)
  ];
  
  return etfPatterns.some(pattern => pattern.test(ticker));
};

// 📊 DADOS MOCK DE ETFs PARA FALLBACK
const getETFHoldingsMock = (ticker: string) => {
  const etfData: Record<string, any> = {
    'QUAL': {
      name: 'iShares MSCI USA Quality Factor ETF',
      description: 'Tracks investment results of an index composed of U.S. large- and mid-cap stocks with quality characteristics.',
      totalHoldings: 125,
      topHoldings: [
        { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.12, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 7.89, sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 4.21, sector: 'Communication Services' },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 3.84, sector: 'Financial Services' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 3.52, sector: 'Technology' },
        { symbol: 'JNJ', name: 'Johnson & Johnson', weight: 3.14, sector: 'Healthcare' },
        { symbol: 'V', name: 'Visa Inc. Class A', weight: 2.98, sector: 'Financial Services' },
        { symbol: 'HD', name: 'The Home Depot Inc.', weight: 2.76, sector: 'Consumer Discretionary' },
        { symbol: 'PG', name: 'The Procter & Gamble Company', weight: 2.43, sector: 'Consumer Staples' },
        { symbol: 'MA', name: 'Mastercard Incorporated Class A', weight: 2.31, sector: 'Financial Services' }
      ],
      sectorBreakdown: [
        { sector: 'Technology', weight: 28.5 },
        { sector: 'Healthcare', weight: 15.2 },
        { sector: 'Consumer Discretionary', weight: 12.8 },
        { sector: 'Financial Services', weight: 11.3 },
        { sector: 'Communication Services', weight: 8.7 },
        { sector: 'Consumer Staples', weight: 7.4 },
        { sector: 'Industrials', weight: 6.9 },
        { sector: 'Real Estate', weight: 4.2 },
        { sector: 'Materials', weight: 2.8 },
        { sector: 'Energy', weight: 2.2 }
      ]
    },
    'QQQ': {
      name: 'Invesco QQQ Trust',
      description: 'Tracks the Nasdaq-100 Index, which includes 100 of the largest domestic and international non-financial companies.',
      totalHoldings: 100,
      topHoldings: [
        { symbol: 'AAPL', name: 'Apple Inc.', weight: 12.1, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 11.8, sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 7.2, sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.8, sector: 'Consumer Discretionary' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 4.3, sector: 'Communication Services' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 4.1, sector: 'Communication Services' },
        { symbol: 'META', name: 'Meta Platforms Inc.', weight: 4.0, sector: 'Communication Services' },
        { symbol: 'TSLA', name: 'Tesla Inc.', weight: 3.9, sector: 'Consumer Discretionary' },
        { symbol: 'AVGO', name: 'Broadcom Inc.', weight: 2.8, sector: 'Technology' },
        { symbol: 'COST', name: 'Costco Wholesale Corporation', weight: 2.1, sector: 'Consumer Staples' }
      ],
      sectorBreakdown: [
        { sector: 'Technology', weight: 48.2 },
        { sector: 'Communication Services', weight: 17.8 },
        { sector: 'Consumer Discretionary', weight: 15.4 },
        { sector: 'Consumer Staples', weight: 6.1 },
        { sector: 'Healthcare', weight: 5.8 },
        { sector: 'Industrials', weight: 4.2 },
        { sector: 'Utilities', weight: 1.8 },
        { sector: 'Materials', weight: 0.7 }
      ]
    },
    'SPY': {
      name: 'SPDR S&P 500 ETF Trust',
      description: 'Seeks to provide investment results that correspond to the price and yield performance of the S&P 500 Index.',
      totalHoldings: 503,
      topHoldings: [
        { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.1, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.8, sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 4.2, sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.4, sector: 'Consumer Discretionary' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.1, sector: 'Communication Services' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 2.0, sector: 'Communication Services' },
        { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.2, sector: 'Communication Services' },
        { symbol: 'TSLA', name: 'Tesla Inc.', weight: 2.1, sector: 'Consumer Discretionary' },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.8, sector: 'Financial Services' },
        { symbol: 'LLY', name: 'Eli Lilly and Company', weight: 1.6, sector: 'Healthcare' }
      ],
      sectorBreakdown: [
        { sector: 'Technology', weight: 27.8 },
        { sector: 'Financial Services', weight: 13.1 },
        { sector: 'Healthcare', weight: 12.9 },
        { sector: 'Consumer Discretionary', weight: 10.4 },
        { sector: 'Communication Services', weight: 8.7 },
        { sector: 'Industrials', weight: 8.2 },
        { sector: 'Consumer Staples', weight: 6.1 },
        { sector: 'Energy', weight: 4.2 },
        { sector: 'Utilities', weight: 2.8 },
        { sector: 'Real Estate', weight: 2.5 },
        { sector: 'Materials', weight: 2.4 }
      ]
    },
    'VTI': {
      name: 'Vanguard Total Stock Market ETF',
      description: 'Seeks to track the performance of the CRSP US Total Market Index, which covers the entire U.S. stock market.',
      totalHoldings: 4157,
      topHoldings: [
        { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.1, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.7, sector: 'Technology' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 4.1, sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.3, sector: 'Consumer Discretionary' },
        { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.0, sector: 'Communication Services' },
        { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.2, sector: 'Communication Services' },
        { symbol: 'GOOG', name: 'Alphabet Inc. Class C', weight: 1.9, sector: 'Communication Services' },
        { symbol: 'TSLA', name: 'Tesla Inc.', weight: 2.0, sector: 'Consumer Discretionary' },
        { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.7, sector: 'Financial Services' },
        { symbol: 'LLY', name: 'Eli Lilly and Company', weight: 1.5, sector: 'Healthcare' }
      ],
      sectorBreakdown: [
        { sector: 'Technology', weight: 26.8 },
        { sector: 'Financial Services', weight: 14.2 },
        { sector: 'Healthcare', weight: 13.1 },
        { sector: 'Consumer Discretionary', weight: 10.8 },
        { sector: 'Communication Services', weight: 8.9 },
        { sector: 'Industrials', weight: 8.1 },
        { sector: 'Consumer Staples', weight: 5.9 },
        { sector: 'Energy', weight: 4.1 },
        { sector: 'Real Estate', weight: 3.8 },
        { sector: 'Materials', weight: 2.7 },
        { sector: 'Utilities', weight: 2.6 }
      ]
    }
  };
  
  return etfData[ticker.toUpperCase()] || null;
};

// 🎨 INTERFACES
interface Holding {
  symbol: string;
  name: string;
  weight: number;
  sector: string;
}

interface SectorBreakdown {
  sector: string;
  weight: number;
}

interface ETFData {
  name: string;
  description: string;
  totalHoldings: number;
  topHoldings: Holding[];
  sectorBreakdown: SectorBreakdown[];
}

interface ETFHoldingsProps {
  ticker: string;
  dadosYahoo?: any;
  loading?: boolean;
}

// 📊 COMPONENTE PRINCIPAL ETF HOLDINGS
const ETFHoldings: React.FC<ETFHoldingsProps> = ({ ticker, dadosYahoo, loading = false }) => {
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [etfData, setETFData] = useState<ETFData | null>(null);
  
  // Verificar se é ETF
  const ehETF = isETF(ticker);
  
  useEffect(() => {
    if (!ehETF) return;
    
    console.log(`🔍 Verificando se ${ticker} é ETF:`, ehETF);
    
    // Tentar obter dados do Yahoo Finance primeiro
    if (dadosYahoo && dadosYahoo.holdings) {
      console.log(`📊 Dados de holdings encontrados no Yahoo Finance para ${ticker}:`, dadosYahoo.holdings);
      setETFData({
        name: dadosYahoo.longName || dadosYahoo.shortName || `${ticker} ETF`,
        description: dadosYahoo.description || `Exchange Traded Fund ${ticker}`,
        totalHoldings: dadosYahoo.holdings.length || 0,
        topHoldings: dadosYahoo.holdings.slice(0, 10),
        sectorBreakdown: dadosYahoo.sectorBreakdown || []
      });
    } else {
      // Usar dados mock como fallback
      const mockData = getETFHoldingsMock(ticker);
      if (mockData) {
        console.log(`📊 Usando dados mock para ETF ${ticker}`);
        setETFData(mockData);
      } else {
        console.log(`❌ Nenhum dado encontrado para ETF ${ticker}`);
      }
    }
  }, [ticker, dadosYahoo, ehETF]);
  
  // Se não é ETF, não renderizar
  if (!ehETF) {
    console.log(`❌ ${ticker} não é identificado como ETF`);
    return null;
  }
  
  // Se não tem dados e não está carregando, não renderizar
  if (!etfData && !loading) {
    console.log(`❌ Sem dados para ETF ${ticker} e não está carregando`);
    return null;
  }
  
  console.log(`✅ Renderizando ETFHoldings para ${ticker}`, { etfData, loading });
  
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📊 Composição do ETF
        <span style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          ETF
        </span>
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <p>Carregando composição do ETF...</p>
        </div>
      ) : etfData ? (
        <div>
          {/* Informações básicas do ETF */}
          <div style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #7dd3fc'
          }}>
            <h4 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#0c4a6e',
              margin: '0 0 8px 0'
            }}>
              {etfData.name}
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#0369a1',
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              {etfData.description}
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                📈 {etfData.totalHoldings || 0} Holdings
              </span>
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                🏢 Top {Math.min(10, etfData.topHoldings?.length || 0)} Mostrados
              </span>
            </div>
          </div>

          {/* Top Holdings */}
          {etfData.topHoldings && etfData.topHoldings.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: 0
                }}>
                  💼 Principais Holdings
                </h4>
                {etfData.topHoldings.length > 5 && (
                  <button
                    onClick={() => setMostrarTodos(!mostrarTodos)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {mostrarTodos ? 'Mostrar menos' : `Ver todos (${etfData.topHoldings.length})`}
                  </button>
                )}
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        #
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        TICKER
                      </th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        EMPRESA
                      </th>
                      <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        PESO (%)
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        SETOR
                      </th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '12px', color: '#64748b' }}>
                        AÇÃO
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(mostrarTodos ? etfData.topHoldings : etfData.topHoldings.slice(0, 5)).map((holding, index) => (
                      <tr key={holding.symbol} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1e293b'
                          }}>
                            {holding.symbol}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: '14px',
                            color: '#374151'
                          }}>
                            {holding.name}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#059669'
                          }}>
                            {holding.weight.toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            backgroundColor: '#f0f9ff',
                            color: '#1e40af',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {holding.sector}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => {
                              // Verificar se a página individual existe
                              const url = `/dashboard/ativo/${holding.symbol}`;
                              // Tentar navegar (ou mostrar que não existe)
                              window.open(url, '_blank');
                            }}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '10px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                            title={`Ver página de ${holding.symbol}`}
                          >
                            👁️ Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {etfData.topHoldings.length > 5 && !mostrarTodos && (
                <div style={{ textAlign: 'center', marginTop: '12px' }}>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Mostrando os 5 principais • Total: {etfData.topHoldings.length} holdings
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Breakdown por Setor */}
          {etfData.sectorBreakdown && etfData.sectorBreakdown.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 16px 0'
              }}>
                📈 Distribuição por Setor
              </h4>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                padding: '16px'
              }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {etfData.sectorBreakdown.map((sector, index) => (
                    <div key={sector.sector} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          minWidth: '150px'
                        }}>
                          {sector.sector}
                        </span>
                        <div style={{
                          flex: 1,
                          height: '8px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${sector.weight}%`,
                            height: '100%',
                            backgroundColor: `hsl(${index * 30}, 70%, 50%)`,
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1e293b',
                        minWidth: '60px',
                        textAlign: 'right'
                      }}>
                        {sector.weight.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #7dd3fc'
          }}>
            <p style={{ fontSize: '12px', margin: 0, color: '#0c4a6e' }}>
              💡 <strong>Sobre ETFs:</strong> Exchange Traded Funds são fundos que replicam índices ou estratégias específicas.
              <br/>📊 <strong>Holdings:</strong> Empresas/ativos que compõem o portfólio do ETF.
              <br/>🔄 <strong>Atualização:</strong> Dados podem variar conforme rebalanceamentos periódicos do fundo.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '48px' }}>📊</div>
          <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
            ETF Detectado
          </h4>
          <p style={{ marginBottom: '16px' }}>
            <strong>{ticker}</strong> foi identificado como um ETF, mas os dados de composição não estão disponíveis no momento.
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            💡 Tentando buscar dados de holdings via Yahoo Finance...
          </p>
        </div>
      )}
    </div>
  );
};

export default ETFHoldings;