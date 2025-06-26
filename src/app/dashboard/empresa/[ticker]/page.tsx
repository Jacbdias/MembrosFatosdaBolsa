'use client';

import React, { useState, useEffect } from 'react';

// 🚨 VERSÃO ULTRA SIMPLES PARA TESTAR VERCEL
export default function EmpresaExteriorDetalhes() {
  const [ticker, setTicker] = useState('');
  
  useEffect(() => {
    const path = window.location.pathname;
    const tickerFromUrl = path.split('/').pop() || '';
    setTicker(tickerFromUrl.toUpperCase());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            {ticker || 'AAPL'}
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Apple Inc. • USD • Ações Internacionais
          </p>
        </div>

        {/* Preço Principal */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ 
            background: 'linear-gradient(90deg, #1f2937 0%, #374151 100%)', 
            color: 'white', 
            padding: '24px' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>AAPL</h2>
                <p style={{ color: '#d1d5db', margin: 0 }}>Apple Inc.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>$201.56</div>
                <div style={{ color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span>↗</span>
                  <span style={{ marginLeft: '8px', fontWeight: '600' }}>+1.26 (0.63%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas - CSS PURO */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>$200.62</span>
                <div style={{ 
                  flex: 1, 
                  margin: '0 16px', 
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
                    width: '45%',
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    borderRadius: '6px'
                  }} />
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: '45%',
                    width: '2px',
                    height: '100%',
                    background: '#1f2937',
                    borderRadius: '1px'
                  }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>$203.66</span>
              </div>
            </div>

            {/* Grid de Métricas - CSS PURO */}
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
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>5.0M</p>
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
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>$200.12</p>
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
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>$260.10</p>
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
                <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>$169.21</p>
              </div>
            </div>

            {/* Indicadores Financeiros */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
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
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>$3.1T</p>
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
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>29.2</p>
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
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>0.50%</p>
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
            ✅ Layout Rico com CSS Puro - Teste Vercel • {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}
