'use client';

import React, { useState, useEffect, useMemo } from 'react';

const EmpresaExteriorDetalhes = ({ params }) => {
  const { ticker } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [staticInfo, setStaticInfo] = useState(null);

  // Base de dados de empresas com cobertura
  const empresasComCobertura = {
    'AAPL': {
      name: 'Apple Inc.',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      country: 'United States',
      exchange: 'NASDAQ',
      currency: 'USD',
      logo: 'https://logo.clearbit.com/apple.com'
    },
    'MSFT': {
      name: 'Microsoft Corporation',
      sector: 'Technology', 
      industry: 'Software',
      country: 'United States',
      exchange: 'NASDAQ',
      currency: 'USD',
      logo: 'https://logo.clearbit.com/microsoft.com'
    },
    'GOOGL': {
      name: 'Alphabet Inc.',
      sector: 'Technology',
      industry: 'Internet Services',
      country: 'United States', 
      exchange: 'NASDAQ',
      currency: 'USD',
      logo: 'https://logo.clearbit.com/google.com'
    },
    'AMZN': {
      name: 'Amazon.com Inc.',
      sector: 'Consumer Cyclical',
      industry: 'E-commerce',
      country: 'United States',
      exchange: 'NASDAQ', 
      currency: 'USD',
      logo: 'https://logo.clearbit.com/amazon.com'
    },
    'TSLA': {
      name: 'Tesla, Inc.',
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      country: 'United States',
      exchange: 'NASDAQ',
      currency: 'USD', 
      logo: 'https://logo.clearbit.com/tesla.com'
    },
    'META': {
      name: 'Meta Platforms Inc.',
      sector: 'Technology',
      industry: 'Social Media',
      country: 'United States',
      exchange: 'NASDAQ',
      currency: 'USD',
      logo: 'https://logo.clearbit.com/meta.com'
    },
    'NVDA': {
      name: 'NVIDIA Corporation', 
      sector: 'Technology',
      industry: 'Semiconductors',
      country: 'United States',
      exchange: 'NASDAQ',
      currency: 'USD',
      logo: 'https://logo.clearbit.com/nvidia.com'
    }
  };

  useEffect(() => {
    const buscarDados = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verificar se tem dados estáticos (empresa com cobertura)
        if (empresasComCobertura[ticker]) {
          setStaticInfo(empresasComCobertura[ticker]);
          console.log(`✅ Empresa ${ticker} tem cobertura estática`);
        }

        // Buscar preço em cache primeiro
        const cacheKey = `cache_exterior_${ticker}`;
        const dadosCache = localStorage.getItem(cacheKey);
        
        if (dadosCache) {
          try {
            const parsed = JSON.parse(dadosCache);
            const agora = Date.now();
            const idadeCache = agora - parsed.timestamp;
            const CACHE_VALIDO = 5 * 60 * 1000; // 5 minutos
            
            if (idadeCache < CACHE_VALIDO) {
              setPriceData(parsed.data);
              console.log(`✅ Dados de ${ticker} carregados do cache (${Math.round(idadeCache/1000)}s)`);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.log('❌ Erro ao parsear cache:', err);
          }
        }

        // Buscar da API
        console.log(`🔍 Buscando ${ticker} da API...`);
        const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=Tsk8pikBpjr6ai1H8TGCeKJGnIbaN3GX`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || data.length === 0) {
          throw new Error(`Dados não encontrados para ${ticker}`);
        }

        const empresaData = data[0];
        setPriceData(empresaData);

        // Salvar no cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: empresaData,
          timestamp: Date.now()
        }));

        console.log(`✅ Dados de ${ticker} salvos no cache`);

      } catch (err) {
        console.error('❌ Erro ao buscar dados:', err);
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      buscarDados();
    }
  }, [ticker]);

  // ========================================
  // COMPONENTE HISTÓRICO DE DIVIDENDOS  
  // ========================================
  const HistoricoDividendos = ({ ticker, dataEntrada, isFII = false }) => {
    const [proventos, setProventos] = useState([]);
    const [mostrarTodos, setMostrarTodos] = useState(false);

    useEffect(() => {
      console.log('🎯 HistoricoDividendos montado para:', ticker, 'isFII:', isFII);
      
      if (ticker && typeof window !== 'undefined') {
        let dadosSalvos = null;
        
        // ✅ CORREÇÃO: Buscar dados de múltiplas fontes possíveis
        if (isFII) {
          // Para FIIs, tentar várias chaves possíveis
          dadosSalvos = localStorage.getItem(`dividendos_fii_${ticker}`) || 
                       localStorage.getItem(`proventos_${ticker}`) ||
                       localStorage.getItem(`rendimentos_${ticker}`);
          
          console.log(`🔍 Buscando dados FII para ${ticker}:`, {
            dividendos_fii: !!localStorage.getItem(`dividendos_fii_${ticker}`),
            proventos: !!localStorage.getItem(`proventos_${ticker}`),
            rendimentos: !!localStorage.getItem(`rendimentos_${ticker}`)
          });
        } else {
          // Para ações, usar a chave padrão
          dadosSalvos = localStorage.getItem(`proventos_${ticker}`);
        }

        // ✅ NOVO: Buscar do sistema central como fallback
        if (!dadosSalvos) {
          const proventosCentral = localStorage.getItem('proventos_central_master');
          if (proventosCentral) {
            try {
              const todosDados = JSON.parse(proventosCentral);
              const dadosTicker = todosDados.filter((item) => item.ticker === ticker);
              if (dadosTicker.length > 0) {
                dadosSalvos = JSON.stringify(dadosTicker);
                console.log(`✅ Dados encontrados no sistema central para ${ticker}:`, dadosTicker.length);
              }
            } catch (err) {
              console.error('Erro ao buscar do sistema central:', err);
            }
          }
        }
        
        if (dadosSalvos) {
          try {
            const proventosSalvos = JSON.parse(dadosSalvos);
            const proventosLimitados = proventosSalvos.slice(0, 500).map((item) => ({
              ...item,
              dataObj: new Date(item.dataCom || item.data || item.dataObj || item.dataFormatada)
            }));
            
            // Filtrar dados inválidos
            const proventosValidos = proventosLimitados.filter((item) => 
              item.dataObj && !isNaN(item.dataObj.getTime()) && item.valor && item.valor > 0
            );
            
            proventosValidos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());
            setProventos(proventosValidos);
            
            console.log(`✅ Proventos carregados para ${ticker}:`, {
              total: proventosValidos.length,
              isFII,
              primeiros2: proventosValidos.slice(0, 2)
            });
            
          } catch (err) {
            console.error('Erro ao carregar proventos salvos:', err);
            setProventos([]);
          }
        } else {
          console.log(`❌ Nenhum dado encontrado para ${ticker}. Chaves verificadas:`, {
            localStorage_keys: Object.keys(localStorage).filter(key => 
              key.includes(ticker) || key.includes('provento') || key.includes('dividendo')
            )
          });
          setProventos([]);
        }
      }
    }, [ticker, isFII]);

    const { totalProventos, mediaProvento, ultimoProvento } = useMemo(() => {
      const total = proventos.reduce((sum, item) => sum + item.valor, 0);
      const media = proventos.length > 0 ? total / proventos.length : 0;
      const ultimo = proventos.length > 0 ? proventos[0] : null;

      return {
        totalProventos: total,
        mediaProvento: media,
        ultimoProvento: ultimo
      };
    }, [proventos]);

    const formatarValor = (valor, moeda = 'BRL') => {
      if (!valor || valor === 0) return moeda === 'USD' ? '$0.00' : 'R$ 0,00';
      
      if (moeda === 'USD') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(valor);
      }
      
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(valor);
    };

    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        marginTop: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {isFII ? '💰 Histórico de Rendimentos (FII)' : '💰 Histórico de Proventos'}
          </h3>
        </div>

        {proventos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              {isFII ? `❌ Nenhum rendimento encontrado para ${ticker}` : `📊 Dados de dividendos não disponíveis para ${ticker}`}
            </p>
            <p style={{ margin: '8px 0', fontSize: '12px', color: '#9ca3af' }}>
              💡 Para adicionar dados de dividendos internacionais, use a mesma estrutura:<br/>
              <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px', fontSize: '10px' }}>
                localStorage.setItem('proventos_{ticker}', JSON.stringify(dados))
              </code>
            </p>
            <p style={{ margin: '8px 0', fontSize: '11px', color: '#9ca3af' }}>
              🔍 {Object.keys(localStorage).filter(k => k.includes('proventos_')).length} empresas com dados disponíveis
            </p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '16px', 
              marginBottom: '24px' 
            }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#0ea5e9' 
                }}>
                  {proventos.length}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Pagamentos</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px', 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#22c55e' 
                }}>
                  {formatarValor(totalProventos, proventos[0]?.moeda).replace(/[R$\s]/, '').replace('$', '$')}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px', 
                backgroundColor: '#fefce8', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#eab308' 
                }}>
                  {formatarValor(mediaProvento, proventos[0]?.moeda).replace(/[R$\s]/, '').replace('$', '$')}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Média</div>
              </div>
              <div style={{ 
                textAlign: 'center', 
                padding: '16px', 
                backgroundColor: '#fdf4ff', 
                borderRadius: '8px' 
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: '#a855f7' 
                }}>
                  {ultimoProvento ? 
                    (ultimoProvento.dataFormatada?.replace(/\/\d{4}/, '') || 
                     ultimoProvento.dataObj.toLocaleDateString('pt-BR').replace(/\/\d{4}/, '')) : 'N/A'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Último</div>
              </div>
            </div>
            
            {proventos.length > 10 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <button
                  onClick={() => setMostrarTodos(!mostrarTodos)}
                  style={{
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    color: '#64748b',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {mostrarTodos 
                    ? `📋 Mostrar apenas 10 recentes` 
                    : `📋 Mostrar todos os ${proventos.length} proventos`
                  }
                </button>
              </div>
            )}

            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              maxHeight: mostrarTodos ? '400px' : 'auto',
              overflowY: mostrarTodos ? 'auto' : 'visible'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '700', fontSize: '14px' }}>Ativo</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>Valor</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>Data Com</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>Pagamento</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '700', fontSize: '14px' }}>Tipo</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '700', fontSize: '14px' }}>DY</th>
                  </tr>
                </thead>
                <tbody>
                 {(mostrarTodos ? proventos : proventos.slice(0, 10)).map((provento, index) => (
                    <tr key={`${provento.data || provento.dataCom}-${index}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        {ticker}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#22c55e' }}>
                        {provento.valorFormatado || formatarValor(provento.valor, provento.moeda)}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>
                        {provento.dataComFormatada || 
                         provento.dataFormatada || 
                         provento.dataObj?.toLocaleDateString('pt-BR') || 
                         'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '500' }}>
                        {provento.dataPagamentoFormatada || 
                         provento.dataFormatada || 
                         provento.dataObj?.toLocaleDateString('pt-BR') || 
                         'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          {provento.tipo || (isFII ? 'Rendimento' : 'Dividendo')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#1976d2' }}>
                          {provento.dividendYield ? `${(!isFII && provento.dividendYield > 0 && provento.dividendYield < 1 ? provento.dividendYield * 100 : provento.dividendYield).toFixed(2)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {proventos.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: '#6b7280' 
              }}>
                {mostrarTodos 
                  ? `Mostrando todos os ${proventos.length} proventos com rolagem`
                  : `Mostrando os 10 mais recentes • Total: ${proventos.length}`
                }
              </p>
            </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ color: '#6c757d', margin: 0 }}>
            🔍 Carregando dados de {params.ticker}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>❌ Erro</h2>
          <p style={{ color: '#6c757d', marginBottom: '24px' }}>
            Não foi possível carregar os dados da empresa {params.ticker}
          </p>
          <p style={{ fontSize: '14px', color: '#adb5bd' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa', 
      padding: '24px 0' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 24px' 
      }}>
        {/* Header da empresa */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Logo */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {staticInfo?.logo ? (
                <img 
                  src={staticInfo.logo} 
                  alt={`${ticker} logo`}
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    objectFit: 'contain' 
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#e9ecef',
                borderRadius: '12px',
                display: staticInfo?.logo ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#6c757d'
