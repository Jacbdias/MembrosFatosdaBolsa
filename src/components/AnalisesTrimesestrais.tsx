import React from 'react';

interface Props {
  ticker: string;
}

const AnalisesTrimesestrais: React.FC<Props> = ({ ticker }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0'
      }}>
        📊 Análises Trimestrais
      </h3>
      
      <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
          Sistema em desenvolvimento
        </h4>
        <p style={{ marginBottom: '16px' }}>
          Análises trimestrais para <strong>{ticker}</strong> em breve
        </p>
      </div>
    </div>
  );
};

export default AnalisesTrimesestrais;