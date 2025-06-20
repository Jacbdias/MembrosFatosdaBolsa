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
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '40px',
      color: 'white'
    },
    title: {
      fontSize: '2.5rem',
      marginBottom: '10px',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '1.1rem',
      opacity: 0.9,
      margin: 0
    },
    dashboardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '25px',
      marginBottom: '40px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative' as const,
      overflow: 'hidden',
      opacity: 0,
      transform: 'translateY(30px)'
    },
    cardIcon: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      color: 'white'
    },
    cardTitle: {
      color: '#333',
      fontSize: '1.4rem',
      marginBottom: '10px',
      margin: '0 0 10px 0'
    },
    cardText: {
      color: '#666',
      lineHeight: 1.6,
      marginBottom: '20px',
      margin: '0 0 20px 0'
    },
    statusActive: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      background: '#e8f5e8',
      color: '#2d5a2d'
    },
    statusDevelopment: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      background: '#fff3cd',
      color: '#856404'
    },
    statusPlanned: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 600,
      textTransform: 'uppercase' as const,
      background: '#e2e3e5',
      color: '#383d41'
    },
    quickActions: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '30px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      marginBottom: '40px'
    },
    quickActionsTitle: {
      color: '#333',
      marginBottom: '20px',
      fontSize: '1.6rem',
      margin: '0 0 20px 0'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    actionBtn: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      border: 'none',
      padding: '15px 20px',
      borderRadius: '10px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '40px',
      color: 'rgba(255, 255, 255, 0.8)'
    },
    notification: {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      background: '#4CAF50',
      color: 'white',
      padding: '15px 25px',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      zIndex: 1000,
      transform: notification ? 'translateX(0)' : 'translateX(400px)',
      transition: 'transform 0.3s ease'
    }
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-5px)';
    e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
  };

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div style={styles.adminContainer}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎯 Dashboard Administrativo</h1>
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
            onClick={() => showComingSoon('Gestão de Clientes')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>👥</div>
            <h3 style={styles.cardTitle}>Gestão de Clientes</h3>
            <p style={styles.cardText}>Administre contas de clientes, permissões e níveis de acesso ao sistema.</p>
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
            onClick={() => showComingSoon('Mercado Internacional')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>🌍</div>
            <h3 style={styles.cardTitle}>Mercado Internacional</h3>
            <p style={styles.cardText}>Ferramentas para análise e gestão de ativos internacionais.</p>
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
            onClick={() => showComingSoon('Gestão de API')}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
          >
            <div style={styles.cardIcon}>⚡</div>
            <h3 style={styles.cardTitle}>Gestão de API</h3>
            <p style={styles.cardText}>Monitore endpoints, logs e performance das APIs do sistema.</p>
            <span style={styles.statusPlanned}>Planejado</span>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h2 style={styles.quickActionsTitle}>⚡ Ações Rápidas</h2>
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
              onClick={() => showComingSoon('Novo Cliente')}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
            >
              👤 Novo Cliente
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
