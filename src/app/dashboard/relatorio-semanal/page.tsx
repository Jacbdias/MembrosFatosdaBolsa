'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ IMPORTAÇÃO DINÂMICA SIMPLIFICADA
const AdminRelatorioSemanal = dynamic(
  () => import('@/components/RelatorioSemanal'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid #e5e7eb', 
            borderTop: '3px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Carregando relatório...</p>
        </div>
      </div>
    )
  }
);

export default function RelatorioSemanalPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Carregando...
      </div>
    }>
      <AdminRelatorioSemanal />
    </Suspense>
  );
}