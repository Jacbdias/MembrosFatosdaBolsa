'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [notification, setNotification] = useState('');
  const router = useRouter();

  const navigateTo = (url: string) => {
    if (url.startsWith('/')) {
      router.push(url);
    } else {
      window.open(url, '_blank');
    }
    showNotification(`Acessando ${getPageName(url)}`);
  };

  const getPageName = (url: string) => {
    if (url.includes('central-proventos')) return 'Central de Proventos';
    if (url.includes('customers')) return 'Gestão de Clientes';
    if (url.includes('empresa')) return 'Gestão de Empresas';
    return 'página solicitada';
  };

  const showComingSoon = (feature: string) => {
    showNotification(`${feature} - Em breve!`);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const cards = document.querySelectorAll('.admin-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          (card as HTMLElement).style.opacity = '1';
          (card as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    adminContainer: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: '24px'
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '48px',
      color: '#1e293b'
    },
    title: {
      fontSize: '2.75rem',
      fontWeight: 700,
      marginBottom: '12px',
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: '0 0 12px 0'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#64748b',
      fontWeight: 400,
      margin: 0
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '24px',
      marginBottom: '48px'
    },
    card: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative' as const,
      overflow: 'hidden',
      opacity: 0,
      transform: 'translateY(30px)'
    },
    cardIcon: {
      width: '56px',
      height: '56px',
      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      fontSize: '22px',
      border: '1px solid #e2e8f0'
    },
    cardTitle: {
      color: '#1e293b',
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '8px',
      margin: '0 0 8px 0'
    },
    cardText: {
      color: '#64748b',
      lineHeight: 1.6,
      marginBottom: '20px',
      margin: '0 0 20px 0',
      fontSize: '0.95rem'
    },
    statusActive: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      background: '#dcfce7',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    statusDevelopment: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fde68a'
    },
    statusPlanned: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      background: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0'
    },
    quickActions: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e2e8f0',
      marginBottom: '48px'
    },
    quickActionsTitle: {
      color: '#1e293b',
      marginBottom: '24px',
      fontSize: '1.5rem',
      fontWeight: 600,
      margin: '0 0 24px 0'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    actionBtn: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      color: 'white',
      border: 'none',
      padding: '14px 20px',
      borderRadius: '12px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '48px',
      color: '#94a3b8',
      fontSize: '0.9rem'
    },
    notification: {
      position: 'fixed' as const,
      top: '24px',
      right: '24px',
      background: '#ffffff',
      color: '#1e293b',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0',
      zIndex: 1000,
      transform: notification ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease',
      fontSize: '0.9rem',
      fontWeight: 500
    }
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    e.currentTarget.style.borderColor = '#cbd5e1';
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
    e.currentTarget.style.borderColor = '#e2e8f0';
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
  };

  return (
    <div style={styles.adminContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Dashboard Administrativo</h1>
          <p style={styles.subtitle}>Centro de Gerenciamento - Fatos da Bolsa</p>
        </div>

        <div style={styles.dashboardGrid}>
          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => navigateTo('/dashboard/central-proventos')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>💰</div>
            <h3 style={styles.cardTitle}>Central de Proventos</h3>
            <p style={styles.cardText}>Gerencie dividendos, JCP e outros proventos das empresas listadas na bolsa.</p>
            <span style={styles.statusActive}>Ativo</span>
          </div>

          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => showComingSoon('Gestão de Usuários')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>👥</div>
            <h3 style={styles.cardTitle}>Gestão de Usuários</h3>
            <p style={styles.cardText}>Administre contas de usuários, permissões e níveis de acesso ao sistema.</p>
            <span style={styles.statusDevelopment}>Em Desenvolvimento</span>
          </div>

          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => showComingSoon('Gestão de Empresas')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>🏢</div>
            <h3 style={styles.cardTitle}>Gestão de Empresas</h3>
            <p style={styles.cardText}>Cadastre e gerencie informações das empresas listadas na bolsa.</p>
            <span style={styles.statusDevelopment}>Em Desenvolvimento</span>
          </div>

          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => showComingSoon('Relatórios')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>📊</div>
            <h3 style={styles.cardTitle}>Relatórios</h3>
            <p style={styles.cardText}>Gere relatórios detalhados e visualize métricas importantes do sistema.</p>
            <span style={styles.statusPlanned}>Planejado</span>
          </div>

          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => showComingSoon('Integrações')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>🔗</div>
            <h3 style={styles.cardTitle}>Integrações</h3>
            <p style={styles.cardText}>Configure e monitore integrações com APIs externas e serviços.</p>
            <span style={styles.statusDevelopment}>Em Desenvolvimento</span>
          </div>

          <div 
            className="admin-card"
            style={styles.card} 
            onClick={() => showComingSoon('Configurações')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>⚙️</div>
            <h3 style={styles.cardTitle}>Configurações</h3>
            <p style={styles.cardText}>Gerencie configurações do sistema, logs e preferências gerais.</p>
            <span style={styles.statusPlanned}>Planejado</span>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.quickActionsTitle}>Ações Rápidas</h2>
          <div style={styles.actionsGrid}>
            <button 
              style={styles.actionBtn} 
              onClick={() => navigateTo('/dashboard/central-proventos')}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              💰 Central Proventos
            </button>
            <button 
              style={styles.actionBtn} 
              onClick={() => showComingSoon('Novo Usuário')}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              👤 Novo Usuário
            </button>
            <button 
              style={styles.actionBtn} 
              onClick={() => showComingSoon('Nova Empresa')}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              🏢 Nova Empresa
            </button>
            <button 
              style={styles.actionBtn} 
              onClick={() => showComingSoon('Relatórios')}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              📊 Relatórios
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <p>© 2025 Fatos da Bolsa - Dashboard Administrativo</p>
        </div>
      </div>

      {notification && (
        <div style={styles.notification}>
          {notification}
        </div>
      )}
    </div>
  );
}
