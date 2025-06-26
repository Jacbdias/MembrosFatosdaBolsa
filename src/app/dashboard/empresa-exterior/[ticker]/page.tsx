'use client';

import React, { useState, useEffect } from 'react';

export default function EmpresaExteriorDetalhes() {
  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const path = window.location.pathname;
    const tickerFromUrl = path.split('/').pop() || '';
    const cleanTicker = tickerFromUrl.toUpperCase();
    setTicker(cleanTicker);
    
    if (cleanTicker) {
      fetchStockData(cleanTicker);
    }
  }, []);

  // Simula dados diferentes para cada ticker
  const fetchStockData = async (tickerSymbol) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dados mockados baseados no ticker
      const mockData = generateMockData(tickerSymbol);
      setStockData(mockData);
    } catch (err) {
      setError('Erro ao carregar dados da ação');
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (symbol) => {
    // Diferentes dados para cada ticker
    const stockDatabase = {
      'AAPL': {
        name: 'Apple Inc.',
        price: 201.56,
        change: 1.26,
        changePercent: 0.63,
        dayLow: 200.62,
        dayHigh: 203.66,
        open: 200.12,
        volume: '5.0M',
        week52High: 260.10,
        week52Low: 169.21,
        marketCap: '$3.1T',
        peRatio: 29.2,
        dividendYield: '0.50%',
        isPositive: true
      },
      'MSFT': {
        name: 'Microsoft Corporation',
        price: 378.85,
        change: -2.15,
        changePercent: -0.56,
        dayLow: 376.20,
        dayHigh: 382.45,
        open: 380.50,
        volume: '3.2M',
        week52High: 420.82,
        week52Low: 309.45,
        marketCap: '$2.8T',
        peRatio: 32.1,
        dividendYield: '0.72%',
        isPositive: false
      },
      'GOOGL': {
        name: 'Alphabet Inc.',
        price: 142.38,
        change: 3.47,
        changePercent: 2.50,
        dayLow: 140.15,
        dayHigh: 143.82,
        open: 141.20,
        volume: '8.1M',
        week52High: 190.25,
        week52Low: 129.40,
        marketCap: '$1.8T',
        peRatio: 25.4,
        dividendYield: '0.00%',
        isPositive: true
      },
      'TSLA': {
        name: 'Tesla, Inc.',
        price: 248.50,
        change: -5.23,
        changePercent: -2.06,
        dayLow: 246.80,
        dayHigh: 254.60,
        open: 252.30,
        volume: '12.5M',
        week52High: 384.29,
        week52Low: 152.37,
        marketCap: '$789B',
        peRatio: 62.8,
        dividendYield: '0.00%',
        isPositive: false
      }
    };

    // Se o ticker existe no banco, retorna os dados
    if (stockDatabase[symbol]) {
      return stockDatabase[symbol];
    }

    // Senão, gera dados aleatórios
    const basePrice = Math.random() * 300 + 50;
    const change = (Math.random() - 0.5) * 20;
    const isPositive = change > 0;
    
    return {
      name: `${symbol} Corporation`,
      price: Number(basePrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number((change / basePrice * 100).toFixed(2)),
      dayLow: Number((basePrice - Math.random() * 5).toFixed(2)),
      dayHigh: Number((basePrice + Math.random() * 5).toFixed(2)),
      open: Number((basePrice + (Math.random() - 0.5) * 3).toFixed(2)),
      volume: `${(Math.random() * 50 + 1).toFixed(1)}M`,
      week52High: Number((basePrice * (1 + Math.random() * 0.5)).toFixed(2)),
      week52Low: Number((basePrice * (1 - Math.random() * 0.3)).toFixed(2)),
      marketCap: `$${(Math.random() * 500 + 50).toFixed(0)}B`,
      peRatio: Number((Math.random() * 40 + 10).toFixed(1)),
      dividendYield: `${(Math.random() * 3).toFixed(2)}%`,
      isPositive
    };
  };

  // Loading state
  if (!mounted || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Carregando {ticker}</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Buscando dados atualizados...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          border: '2px solid #fca5a5'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>Erro</h2>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>{error}</p>
          <button 
            onClick={() => fetchStockData(ticker)}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stockData) return null;

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '24px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const maxWidthStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const priceCardStyle = {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  };

  const priceHeaderStyle = {
    background: stockData.isPositive 
      ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
      : 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)',
    color: 'white',
    padding: '24px'
  };

  const priceFlexStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  };

  // Calcula posição no range do dia
  const dayRangePercent = ((stockData.price - stockData.dayLow) / (stockData.dayHigh - stockData.dayLow)) * 100;

  return (
    <div style={containerStyle}>
      <div style={maxWidthStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#1f2937' }}>
            {ticker}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            {stockData.name} • USD • Ações Internacionais
          </p>
        </div>

        {/* Preço Principal */}
        <div style={priceCardStyle}>
          <div style={priceHeaderStyle}>
            <div style={priceFlexStyle}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{ticker}</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>{stockData.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${stockData.price}</div>
                <div style={{ 
                  color: stockData.isPositive ? '#10b981' : '#ef4444',
                  marginTop: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-end',
                  gap: '8px'
                }}>
                  <span>{stockData.isPositive ? '↗' : '↘'}</span>
                  <span style={{ fontWeight: '600' }}>
                    {stockData.isPositive ? '+' : ''}{stockData.change} ({stockData.changePercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div style={{ padding: '24px' }}>
            
            {/* Range do Dia */}
            <div style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', margin: '0 0 12px 0' }}>
                📊 Range do Dia
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>${stockData.dayLow}</span>
                <div style={{
                  flex: 1,
                  height: '12px',
                  background: '#e2e8f0',
                  borderRadius: '6px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${dayRangePercent}%`,
                    background: stockData.isPositive 
                      ? 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    borderRadius: '6px'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: `${dayRangePercent}%`,
                    width: '2px',
                    height: '100%',
                    background: '#1f2937',
                    borderRadius: '1px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>${stockData.dayHigh}</span>
              </div>
            </div>

            {/* Grid de Métricas */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginBottom: '32px'
            }}>
              
              {/* Volume */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #93c5fd',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#3b82f6',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>📈</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Volume</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{stockData.volume}</p>
              </div>

              {/* Abertura */}
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #86efac',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#10b981',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>💰</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Abertura</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.open}</p>
              </div>

              {/* Máxima 52s */}
              <div style={{
                background: 'linear-gradient(135deg, #e9d5ff 0%, #ddd6fe 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #c4b5fd',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#8b5cf6',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>⬆️</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Máx. 52s</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.week52High}</p>
              </div>

              {/* Mínima 52s */}
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid #fca5a5',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: '#ef4444',
                  borderRadius: '12px',
                  margin: '0 auto 12px auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>⬇️</div>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Mín. 52s</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>${stockData.week52Low}</p>
              </div>
            </div>

            {/* Indicadores Financeiros */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#1f2937' }}>
                💼 Indicadores Financeiros
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                
                {/* Market Cap */}
                <div style={{
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #a7f3d0',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#059669',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>🌍</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Market Cap</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.marketCap}</p>
                </div>

                {/* P/E Ratio */}
                <div style={{
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #c4b5fd',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#7c3aed',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>🎯</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>P/E Ratio</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.peRatio}</p>
                </div>

                {/* Dividend Yield */}
                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '2px solid #fcd34d',
                  textAlign: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: '#d97706',
                    borderRadius: '16px',
                    margin: '0 auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px'
                  }}>💵</div>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>Dividend Yield</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stockData.dividendYield}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div style={{
          background: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            ✅ Dados Dinâmicos para {ticker} • {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
