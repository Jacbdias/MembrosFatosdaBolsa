import React from 'react';

interface MetricCardOptimizedProps {
  title: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
  color?: string;
}

// 🚀 Card de métrica otimizado com skeleton loading
const MetricCardOptimized = React.memo<MetricCardOptimizedProps>(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend,
  color = '#1e293b'
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      height: '100%',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      
      {/* Título */}
      <h4 style={{
        fontSize: '12px',
        fontWeight: '700',
        color: '#64748b',
        margin: '0 0 12px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {title}
      </h4>
      
      {loading ? (
        /* Skeleton Loading */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '80px',
            height: '32px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            width: '60px',
            height: '16px',
            backgroundColor: '#f1f5f9',
            borderRadius: '4px',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      ) : (
        /* Conteúdo Real */
        <>
          <p style={{
            fontSize: '28px',
            fontWeight: '800',
            color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : color,
            margin: '0 0 8px 0',
            lineHeight: '1.2'
          }}>
            {value}
          </p>
          
          {subtitle && (
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: '0',
              fontWeight: '500',
              opacity: 0.8
            }}>
              {subtitle}
            </p>
          )}
        </>
      )}
      
      {/* CSS para animação pulse */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

MetricCardOptimized.displayName = 'MetricCardOptimized';

export default MetricCardOptimized;