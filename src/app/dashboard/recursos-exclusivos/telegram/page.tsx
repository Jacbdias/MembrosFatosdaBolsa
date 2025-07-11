'use client';

import React, { useState, useEffect } from 'react';

const TelegramPage = () => {
  const [instagram, setInstagram] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [existingInstagram, setExistingInstagram] = useState('');

  // Carregar Instagram existente quando a página carregar
  useEffect(() => {
    const loadExistingInstagram = async () => {
      try {
        const response = await fetch('/api/instagram-cadastro');
        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.instagram) {
            setExistingInstagram(data.data.instagram);
            setInstagram(data.data.instagram);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar Instagram existente:', err);
      }
    };

    loadExistingInstagram();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!instagram.trim()) {
      setError('Por favor, insira seu @ do Instagram');
      return;
    }

    const cleanInstagram = instagram.replace('@', '');
    
    if (cleanInstagram.length < 3) {
      setError('@ do Instagram deve ter pelo menos 3 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/instagram-cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instagram: cleanInstagram
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setExistingInstagram(cleanInstagram);
      } else {
        setError(data.error || 'Erro ao cadastrar. Tente novamente.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setError('');
  };

  if (isSubmitted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '100%'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            {existingInstagram ? 'Instagram Atualizado!' : 'Cadastro Realizado!'}
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '32px',
            lineHeight: '1.5'
          }}>
            Seu @ do Instagram foi {existingInstagram ? 'atualizado' : 'cadastrado'} com sucesso. Você será adicionado aos Close Friends do Fatos da Bolsa em breve!
          </p>
          <button
            onClick={resetForm}
            style={{
              backgroundColor: '#374151',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Voltar
          </button>
        </div>
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
        textAlign: 'center',
        marginBottom: '48px' 
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 16px 0'
        }}>
          📱 Close Friends - Instagram
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '20px',
          margin: '0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Cadastre seu @ do Instagram para receber conteúdos exclusivos nos Stories do Close Friends
        </p>
      </div>

      {/* Card Principal */}
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Mostrar Instagram atual se existir */}
          {existingInstagram && (
            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #10b981'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#065f46',
                marginBottom: '8px'
              }}>
                ✅ Instagram Cadastrado:
              </h4>
              <p style={{
                color: '#065f46',
                fontSize: '16px',
                margin: 0,
                fontWeight: '600'
              }}>
                @{existingInstagram}
              </p>
              <p style={{
                color: '#065f46',
                fontSize: '14px',
                margin: '8px 0 0 0'
              }}>
                Você pode atualizar seu @ abaixo se necessário.
              </p>
            </div>
          )}

          {/* Info sobre Close Friends */}
          <div style={{
            backgroundColor: '#f0f9ff',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '32px',
            border: '1px solid #0ea5e9'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0c4a6e',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⭐ O que é Close Friends?
            </h3>
            <p style={{
              color: '#0c4a6e',
              fontSize: '14px',
              margin: '0',
              lineHeight: '1.5'
            }}>
              Close Friends é uma função do Instagram que permite compartilhar Stories exclusivos apenas para uma lista selecionada de pessoas. 
              Você receberá conteúdos especiais, análises em primeira mão e insights exclusivos do mercado financeiro.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                {existingInstagram ? 'Atualizar @ do Instagram:' : 'Seu @ do Instagram:'}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  @
                </span>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value);
                    setError('');
                  }}
                  placeholder="seunome"
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 40px',
                    fontSize: '16px',
                    border: error ? '2px solid #ef4444' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    backgroundColor: '#ffffff'
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                  maxLength={30}
                />
              </div>
              {error && (
                <p style={{
                  color: '#ef4444',
                  fontSize: '14px',
                  marginTop: '8px',
                  margin: '8px 0 0 0'
                }}>
                  {error}
                </p>
              )}
              <p style={{
                color: '#64748b',
                fontSize: '12px',
                marginTop: '8px',
                margin: '8px 0 0 0'
              }}>
                Digite apenas o nome de usuário, sem o @
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#94a3b8' : '#374151',
                color: 'white',
                padding: '16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {existingInstagram ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  📱 {existingInstagram ? 'Atualizar Instagram' : 'Cadastrar no Close Friends'}
                </>
              )}
            </button>
          </form>

          {/* Informações adicionais */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: '#fef3c7',
            borderRadius: '12px',
            border: '1px solid #f59e0b'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#92400e',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚡ Importante:
            </h4>
            <ul style={{
              color: '#92400e',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: 0,
              paddingLeft: '20px'
            }}>
              <li style={{ marginBottom: '8px' }}>Seu perfil deve estar <strong>público</strong> ou você deve seguir @fatosbolsa</li>
              <li style={{ marginBottom: '8px' }}>A adição pode levar até <strong>48 horas</strong> para ser processada</li>
              <li style={{ marginBottom: '8px' }}>Você receberá conteúdos <strong>exclusivos</strong> nos Stories</li>
              <li>Caso não seja adicionado, verifique se seu @ está correto</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS para animação de loading */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TelegramPage;