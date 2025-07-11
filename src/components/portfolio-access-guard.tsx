// src/components/portfolio-access-guard.tsx
'use client';

import React from 'react';
import { useAuthAccess } from '@/hooks/use-auth-access';

interface PortfolioAccessGuardProps {
  children: React.ReactNode;
}

export function PortfolioAccessGuard({ children }: PortfolioAccessGuardProps) {
  const { user, loading, hasContentAccess } = useAuthAccess();

  // Verificar se tem acesso aos recursos exclusivos (onde está a análise de carteira)
  const hasAccess = hasContentAccess('recursos-exclusivos') || 
                   hasContentAccess('recursos-analise') ||
                   user?.plan === 'VIP' || 
                   user?.plan === 'ADMIN';

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '48px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#64748b' }}>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '48px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
          <h2 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '24px', fontWeight: '700' }}>
            Login Necessário
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Faça login para acessar a análise de carteira.
          </p>
          <button
            onClick={() => window.location.href = '/auth/sign-in'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '48px',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>👑</div>
          <h2 style={{ color: '#1e293b', marginBottom: '16px', fontSize: '24px', fontWeight: '700' }}>
            Acesso VIP Necessário
          </h2>
          <p style={{ color: '#64748b', marginBottom: '8px' }}>
            A análise personalizada de carteira é um recurso exclusivo do plano
          </p>
          <p style={{ color: '#3b82f6', fontWeight: '600', marginBottom: '24px', fontSize: '18px' }}>
            Close Friends VIP
          </p>
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'left'
          }}>
            <h3 style={{ color: '#1e40af', fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0' }}>
              ✨ O que você ganha com o VIP:
            </h3>
            <ul style={{ color: '#1e40af', fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
              <li>Análise personalizada da sua carteira</li>
              <li>Recomendações de otimização</li>
              <li>Feedback de especialistas</li>
              <li>Sugestões baseadas no seu perfil</li>
              <li>Acesso a todos os recursos exclusivos</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.href = '/pricing'}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            👑 Assinar Close Friends VIP
          </button>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '16px' }}>
            Seu plano atual: <strong>{user.plan}</strong>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}