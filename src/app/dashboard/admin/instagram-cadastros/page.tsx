'use client';

import React, { useState, useEffect } from 'react';

const AdminInstagramPage = () => {
  const [cadastros, setCadastros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCadastros();
  }, []);

  const loadCadastros = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/instagram-cadastros');
      
      if (response.ok) {
        const data = await response.json();
        setCadastros(data.data || []);
      } else {
        setError('Erro ao carregar cadastros');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const exportarCSV = () => {
    const csvContent = [
      ['Nome', 'Email', 'Instagram Atual', 'Instagram Anterior', 'Status Cadastro', 'Plano', 'Data Cadastro', 'Última Atualização'].join(','),
      ...cadastrosFiltrados.map(cadastro => [
        `"${cadastro.user.firstName} ${cadastro.user.lastName}"`,
        `"${cadastro.user.email}"`,
        `"@${cadastro.instagram}"`,
        `"${cadastro.previousInstagram ? '@' + cadastro.previousInstagram : 'N/A'}"`,
        `"${cadastro.isUpdated ? 'ATUALIZADO' : 'NOVO'}"`,
        `"${cadastro.user.plan}"`,
        `"${new Date(cadastro.createdAt).toLocaleDateString('pt-BR')}"`,
        `"${cadastro.updatedAt !== cadastro.createdAt ? new Date(cadastro.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `instagram_cadastros_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const copiarInstagrams = () => {
    const instagrams = cadastrosFiltrados.map(c => `@${c.instagram}`).join('\n');
    navigator.clipboard.writeText(instagrams);
    alert('Lista de @s copiada para a área de transferência!');
  };

  const deleteCadastro = async (cadastroId) => {
    if (!confirm('Tem certeza que deseja remover este cadastro?')) return;
    
    try {
      const response = await fetch(`/api/admin/instagram-cadastros?id=${cadastroId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadCadastros(); // Recarregar lista
        alert('Cadastro removido com sucesso!');
      } else {
        alert('Erro ao remover cadastro');
      }
    } catch (error) {
      console.error('Erro ao remover cadastro:', error);
      alert('Erro ao remover cadastro');
    }
  };

  const cadastrosFiltrados = cadastros.filter(cadastro => 
    cadastro.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cadastro.instagram.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas melhoradas
  const stats = {
    total: cadastrosFiltrados.length,
    novos: cadastrosFiltrados.filter(c => !c.isUpdated).length,
    atualizados: cadastrosFiltrados.filter(c => c.isUpdated).length,
    hoje: cadastrosFiltrados.filter(c => {
      const hoje = new Date();
      const cadastro = new Date(c.createdAt);
      return cadastro.toDateString() === hoje.toDateString();
    }).length,
    pro: cadastrosFiltrados.filter(c => c.user.plan === 'PRO').length
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '18px',
          color: '#64748b'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '3px solid #e2e8f0',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Carregando cadastros...
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          📱 Admin - Cadastros Instagram
        </h1>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: 0
        }}>
          Gerencie os cadastros do Close Friends do Instagram com histórico completo
        </p>
      </div>

      {/* Estatísticas Melhoradas */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 32px auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Total de Cadastros
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🆕</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {stats.novos}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Cadastros Novos
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔄</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b' }}>
            {stats.atualizados}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Atualizados
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6' }}>
            {stats.hoje}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Cadastros Hoje
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💎</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
            {stats.pro}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Usuários PRO
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#06b6d4' }}>
            {stats.total > 0 ? Math.round((stats.atualizados / stats.total) * 100) : 0}%
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            Taxa Atualização
          </div>
        </div>
      </div>

      {/* Controles */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 24px auto',
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          {/* Busca */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <input
              type="text"
              placeholder="Buscar por nome, email ou Instagram..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={copiarInstagrams}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📋 Copiar @s
            </button>
            
            <button
              onClick={exportarCSV}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📊 Exportar CSV
            </button>

            <button
              onClick={loadCadastros}
              style={{
                backgroundColor: '#64748b',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔄 Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Cadastros */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        {cadastrosFiltrados.length === 0 ? (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '48px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <h3 style={{ fontSize: '20px', color: '#64748b', margin: 0 }}>
              {searchTerm ? 'Nenhum cadastro encontrado' : 'Nenhum cadastro ainda'}
            </h3>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            {/* Header da Tabela */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '0.8fr 1.8fr 1.5fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
              gap: '12px',
              padding: '16px 20px',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151'
            }}>
              <div>Status</div>
              <div>Nome/Email</div>
              <div>Instagram Atual</div>
              <div>Histórico</div>
              <div>Plano</div>
              <div>Data</div>
              <div>Status</div>
              <div>Ações</div>
            </div>

            {/* Linhas da Tabela */}
            {cadastrosFiltrados.map((cadastro, index) => (
              <div
                key={cadastro.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '0.8fr 1.8fr 1.5fr 1.5fr 1fr 1fr 0.8fr 0.8fr',
                  gap: '12px',
                  padding: '16px 20px',
                  borderBottom: index < cadastrosFiltrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                  fontSize: '13px',
                  alignItems: 'center'
                }}
              >
                {/* Status Novo/Atualizado */}
                <div>
                  {cadastro.isUpdated ? (
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🔄 ATUALIZADO
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      🆕 NOVO
                    </span>
                  )}
                </div>

                {/* Nome/Email */}
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                    {cadastro.user.firstName} {cadastro.user.lastName}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>
                    {cadastro.user.email}
                  </div>
                </div>
                
                {/* Instagram Atual */}
                <div style={{
                  fontWeight: '600',
                  color: '#3b82f6',
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📱 @{cadastro.instagram}
                </div>
                
                {/* Histórico */}
                <div>
                  {cadastro.previousInstagram ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#94a3b8' }}>@{cadastro.previousInstagram}</span>
                      <span style={{ color: '#94a3b8' }}>→</span>
                      <span style={{ color: '#3b82f6', fontWeight: '600' }}>@{cadastro.instagram}</span>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic' }}>
                      Primeiro cadastro
                    </span>
                  )}
                </div>
                
                {/* Plano */}
                <div>
                  <span style={{
                    backgroundColor: cadastro.user.plan === 'PRO' ? '#dcfce7' : '#f1f5f9',
                    color: cadastro.user.plan === 'PRO' ? '#166534' : '#475569',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {cadastro.user.plan}
                  </span>
                </div>
                
                {/* Data */}
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  <div>
                    {new Date(cadastro.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  {cadastro.updatedAt !== cadastro.createdAt && (
                    <div style={{ color: '#f59e0b', fontWeight: '600' }}>
                      Atualizado
                    </div>
                  )}
                </div>
                
                {/* Status do Usuário */}
                <div>
                  <span style={{
                    backgroundColor: cadastro.user.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                    color: cadastro.user.status === 'ACTIVE' ? '#166534' : '#dc2626',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {cadastro.user.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Ações */}
                <div>
                  <button
                    onClick={() => deleteCadastro(cadastro.id)}
                    style={{
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fca5a5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstagramPage;