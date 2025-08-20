'use client';

import React, { useState, useEffect } from 'react';
import EnhancedAdminFeedback from '@/components/EnhancedAdminFeedback';

export default function AdminCarteirasPage() {
  const [carteiras, setCarteiras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [pontuacao, setPontuacao] = useState('');
  const [recomendacoes, setRecomendacoes] = useState('');
  const [showAdvancedFeedback, setShowAdvancedFeedback] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pendente: 0,
    em_analise: 0,
    analisada: 0,
    cancelada: 0
  });

  useEffect(() => {
    carregarCarteiras();
  }, []);

  const carregarCarteiras = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/carteiras');
      const data = await response.json();

      if (response.ok) {
        setCarteiras(data.carteiras || []);
        setStats(data.estatisticas || stats);
      } else {
        setError(data.error || 'Erro ao carregar carteiras');
      }
    } catch (err) {
      setError('Erro de conexão');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar carteira
  const handleDeleteCarteira = async (carteiraId, clienteNome) => {
    const clienteEmail = carteiras.find(c => c.id === carteiraId)?.cliente?.email || 
                        carteiras.find(c => c.id === carteiraId)?.user?.email || 
                        'Email não encontrado';
    
    if (!confirm(`Tem certeza que deseja DELETAR a carteira de ${clienteNome}?\n\nEsta ação permitirá que o cliente envie uma nova carteira.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/carteiras/${carteiraId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Sucesso: ${result.message}\n\nO cliente ${clienteEmail} agora pode enviar uma nova carteira.`);
        carregarCarteiras(); // Recarrega a lista em vez de window.location.reload()
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      alert('Erro ao remover carteira');
      console.error(error);
    }
  };

  const salvarAnalise = async (dadosAnalise) => {
    try {
      const response = await fetch('/api/admin/carteiras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dadosAnalise.id,
          feedback: dadosAnalise.feedback,
          pontuacao: dadosAnalise.pontuacao,
          recomendacoes: dadosAnalise.recomendacoes,
          status: dadosAnalise.status,
          avaliacaoQualidade: dadosAnalise.avaliacaoQualidade,
          avaliacaoDiversificacao: dadosAnalise.avaliacaoDiversificacao,
          avaliacaoAdaptacao: dadosAnalise.avaliacaoAdaptacao,
          dadosEstruturados: dadosAnalise.dadosEstruturados,
          dataAnalise: dadosAnalise.dataAnalise
        })
      });

      if (response.ok) {
        alert('Análise salva com sucesso!');
        setEditando(null);
        setShowAdvancedFeedback(false);
        carregarCarteiras();
      } else {
        const data = await response.json();
        alert('Erro: ' + data.error);
      }
    } catch (err) {
      alert('Erro ao salvar análise');
      console.error(err);
    }
  };

  // Função original para análise simples
  const salvarAnaliseSimples = async (carteiraId) => {
    try {
      const response = await fetch('/api/admin/carteiras', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: carteiraId,
          feedback,
          pontuacao: parseFloat(pontuacao),
          recomendacoes: recomendacoes.split('\n').filter(r => r.trim()),
          status: 'ANALISADA'
        })
      });

      if (response.ok) {
        alert('Análise salva com sucesso!');
        setEditando(null);
        setFeedback('');
        setPontuacao('');
        setRecomendacoes('');
        carregarCarteiras();
      } else {
        const data = await response.json();
        alert('Erro: ' + data.error);
      }
    } catch (err) {
      alert('Erro ao salvar análise');
      console.error(err);
    }
  };

  const iniciarEdicao = (carteira) => {
    setEditando(carteira.id);
    setFeedback(carteira.feedback || '');
    setPontuacao(carteira.pontuacao || '');
    setRecomendacoes(carteira.recomendacoes ? carteira.recomendacoes.join('\n') : '');
  };

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'analisada': 
      return '#10b981'; // Verde
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return '#f59e0b'; // Amarelo
    case 'pending':
    case 'pendente':
      return '#64748b'; // Cinza
    case 'error':
    case 'erro':
      return '#ef4444'; // Vermelho
    case 'cancelled':
    case 'cancelada':
    case 'cancelado':
      return '#6b7280'; // Cinza escuro
    default: 
      return '#64748b'; // Cinza padrão
  }
};

const getStatusText = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'analisada':
      return 'Analisada';
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return 'Em Análise';
    case 'pending':
    case 'pendente':
      return 'Pendente';
    case 'error':
    case 'erro':
      return 'Erro';
    case 'cancelled':
    case 'cancelada':
    case 'cancelado':
      return 'Cancelada';
    default: 
      return 'Pendente';
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'analisada':
      return '✅';
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return '⏳';
    case 'pending':
    case 'pendente':
      return '📋';
    case 'error':
    case 'erro':
      return '❌';
    case 'cancelled':
    case 'cancelada':
    case 'cancelado':
      return '🚫';
    default: 
      return '📋';
  }
};

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        gap: '16px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ color: '#64748b' }}>🔐 Carregando painel administrativo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '24px',
        margin: '20px',
        color: '#dc2626',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Erro de Acesso</h3>
        <p style={{ marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={carregarCarteiras}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1e293b',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              👨‍💼 Painel Administrativo
            </h1>
            <p style={{
              color: '#64748b',
              margin: 0,
              fontSize: '16px'
            }}>
              Gerencie e analise as carteiras enviadas pelos usuários
            </p>
          </div>
          
          <button
            onClick={carregarCarteiras}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '32px', color: '#3b82f6', fontWeight: '800', marginBottom: '8px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Total de Carteiras</div>
        </div>
        
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '32px', color: '#10b981', fontWeight: '800', marginBottom: '8px' }}>
            {stats.analisada}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Analisadas</div>
        </div>
        
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '32px', color: '#f59e0b', fontWeight: '800', marginBottom: '8px' }}>
            {stats.pendente}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Pendentes</div>
        </div>
        
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '32px', color: '#ef4444', fontWeight: '800', marginBottom: '8px' }}>
            {stats.em_analise}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Em Análise</div>
        </div>
      </div>

      {/* Lista de Carteiras */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            📊 Carteiras de Investimentos
          </h2>
        </div>

        {carteiras.length === 0 ? (
          <div style={{
            padding: '64px',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>📈</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
              Nenhuma carteira enviada ainda
            </h3>
            <p style={{ fontSize: '16px', margin: 0 }}>
              As carteiras aparecerão aqui quando os usuários enviarem para análise
            </p>
          </div>
        ) : (
          <div>
            {carteiras.map((carteira, index) => (
              <div key={carteira.id} style={{
                padding: '24px',
                borderBottom: index < carteiras.length - 1 ? '1px solid #e2e8f0' : 'none'
              }}>
                {/* Header da Carteira */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: '0 0 8px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📎 {carteira.nomeArquivo}
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      marginBottom: '8px'
                    }}>
                      👤 <strong>
                        {carteira.cliente?.name || 
                         (carteira.user ? `${carteira.user.firstName || ''} ${carteira.user.lastName || ''}`.trim() : '') || 
                         'Cliente não informado'}
                      </strong>
                      {(carteira.cliente?.email || carteira.user?.email) && (
                        <span style={{ marginLeft: '8px' }}>
                          ({carteira.cliente?.email || carteira.user?.email})
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      📅 Enviado em: {new Date(carteira.dataEnvio).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {/* Indicador de prazo */}
                    {(() => {
                      const diasDesdeEnvio = Math.floor((new Date() - new Date(carteira.dataEnvio)) / (1000 * 60 * 60 * 24));
                      const diasRestantes = 30 - diasDesdeEnvio;
                      
                      let corPrazo = '#10b981'; // Verde
                      let iconePrazo = '✅';
                      let textoPrazo = `${diasDesdeEnvio} dias atrás`;
                      
                      if (diasRestantes <= 0) {
                        corPrazo = '#dc2626'; // Vermelho
                        iconePrazo = '🚨';
                        textoPrazo = `ATRASADO (${Math.abs(diasRestantes)} dias)`;
                      } else if (diasRestantes <= 5) {
                        corPrazo = '#ea580c'; // Laranja
                        iconePrazo = '⚠️';
                        textoPrazo = `URGENTE (${diasRestantes} dias restantes)`;
                      } else if (diasRestantes <= 10) {
                        corPrazo = '#f59e0b'; // Amarelo
                        iconePrazo = '⏰';
                        textoPrazo = `${diasRestantes} dias restantes`;
                      }
                      
                      return (
                        <div style={{
                          fontSize: '13px',
                          color: corPrazo,
                          fontWeight: '600',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <span>{iconePrazo}</span>
                          {textoPrazo}
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#9ca3af',
                            fontWeight: '400'
                          }}>
                            (prazo: 30 dias)
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    backgroundColor: getStatusColor(carteira.status),
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>{getStatusIcon(carteira.status)}</span>
                    {getStatusText(carteira.status)}
                  </div>
                </div>

                {/* Questionário do Cliente */}
                {carteira.questionario && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1e40af',
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      📋 Questionário do Cliente
                    </h4>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '12px',
                      fontSize: '14px'
                    }}>
                      {(() => {
                        try {
                          const questionarioData = typeof carteira.questionario === 'string' 
                            ? JSON.parse(carteira.questionario) 
                            : carteira.questionario;
                            
                          return Object.entries(questionarioData).map(([key, value], index) => (
                            <div key={index} style={{
                              backgroundColor: '#ffffff',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0'
                            }}>
                              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                              </div>
                              <div style={{ color: '#64748b' }}>
                                {typeof value === 'string' && value.length > 100 ? 
                                  value.substring(0, 100) + '...' : 
                                  String(value)
                                }
                              </div>
                            </div>
                          ));
                        } catch (error) {
                          console.error('Erro ao parsear questionário:', error);
                          return (
                            <div style={{ 
                              color: '#ef4444', 
                              fontSize: '14px',
                              padding: '12px',
                              backgroundColor: '#fee2e2',
                              borderRadius: '6px'
                            }}>
                              ⚠️ Erro ao carregar questionário - dados corrompidos
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Dados da Carteira */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                      💰 VALOR TOTAL
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                      {carteira.valorTotal ? 
                        `R$ ${carteira.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : 'N/A'
                      }
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                      📈 ATIVOS
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                      {carteira.quantidadeAtivos || 'N/A'}
                    </div>
                  </div>

                  {carteira.pontuacao && (
                    <div style={{
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                        ⭐ PONTUAÇÃO
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                        {carteira.pontuacao.toFixed(1)}/10
                      </div>
                    </div>
                  )}
                </div>

                {/* Análise Existente */}
                {carteira.feedback && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#065f46',
                      margin: '0 0 12px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      💬 Análise Atual
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#374151',
                      margin: '0 0 12px 0',
                      lineHeight: '1.6'
                    }}>
                      {carteira.feedback}
                    </p>
                    
                    {carteira.recomendacoes && carteira.recomendacoes.length > 0 && (
                      <div>
                        <strong style={{ fontSize: '14px', color: '#065f46', display: 'block', marginBottom: '8px' }}>
                          🎯 Recomendações:
                        </strong>
                        <ul style={{
                          fontSize: '14px',
                          color: '#374151',
                          margin: '0',
                          paddingLeft: '20px',
                          lineHeight: '1.5'
                        }}>
                          {carteira.recomendacoes.map((rec, recIndex) => (
                            <li key={recIndex} style={{ marginBottom: '4px' }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Botões de Análise */}
                {editando === carteira.id && showAdvancedFeedback ? (
                  <EnhancedAdminFeedback
                    carteira={carteira}
                    onSave={salvarAnalise}
                    onCancel={() => {
                      setEditando(null);
                      setShowAdvancedFeedback(false);
                    }}
                  />
                ) : editando === carteira.id ? (
                  <div style={{
                    backgroundColor: '#fefce8',
                    border: '2px solid #fbbf24',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#92400e',
                      margin: '0 0 20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      ✏️ Análise Simples
                    </h4>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: '#374151'
                      }}>
                        ⭐ Pontuação (0-10):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={pontuacao}
                        onChange={(e) => setPontuacao(e.target.value)}
                        style={{
                          width: '120px',
                          padding: '10px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: '#374151'
                      }}>
                        💬 Feedback da Análise:
                      </label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Escreva sua análise detalhada da carteira..."
                        rows={5}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: '#374151'
                      }}>
                        🎯 Recomendações (uma por linha):
                      </label>
                      <textarea
                        value={recomendacoes}
                        onChange={(e) => setRecomendacoes(e.target.value)}
                        placeholder="Digite cada recomendação em uma linha separada..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          lineHeight: '1.5'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => salvarAnaliseSimples(carteira.id)}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        💾 Salvar Análise
                      </button>
                      
                      <button
                        onClick={() => setEditando(null)}
                        style={{
                          backgroundColor: '#6b7280',
                          color: 'white',
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        setEditando(carteira.id);
                        setShowAdvancedFeedback(true);
                      }}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🚀 {carteira.feedback ? 'Editar Análise Avançada' : 'Nova Análise Avançada'}
                    </button>
                    
                    <button
                      onClick={() => iniciarEdicao(carteira)}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      ✏️ Análise Simples
                    </button>

                    {/* Botão de Delete */}
                    <button
                      onClick={() => handleDeleteCarteira(
                        carteira.id, 
                        carteira.cliente?.name || 
                        (carteira.user ? `${carteira.user.firstName || ''} ${carteira.user.lastName || ''}`.trim() : '') || 
                        'Cliente não informado'
                      )}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      🗑️ Deletar Carteira
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}