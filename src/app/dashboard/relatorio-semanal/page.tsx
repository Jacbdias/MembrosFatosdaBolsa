'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

console.log('🔵 [DEBUG] page.tsx carregado');

// ✅ IMPORTAÇÃO DINÂMICA COM DEBUG
const AdminRelatorioSemanal = dynamic(
  () => {
    console.log('🔵 [DEBUG] Iniciando importação dinâmica...');
    return import('@/components/RelatorioSemanal').then(mod => {
      console.log('🔵 [DEBUG] Módulo importado:', mod);
      console.log('🔵 [DEBUG] Exports disponíveis:', Object.keys(mod));
      console.log('🔵 [DEBUG] Default export:', typeof mod.default);
      console.log('🔵 [DEBUG] RelatorioSemanal export:', typeof mod.RelatorioSemanal);
      
      // Verificar qual export usar
      if (mod.RelatorioSemanal) {
        console.log('✅ [DEBUG] Usando mod.RelatorioSemanal');
        return { default: mod.RelatorioSemanal };
      } else if (mod.default) {
        console.log('✅ [DEBUG] Usando mod.default');
        return { default: mod.default };
      } else {
        console.error('❌ [DEBUG] Nenhum export válido encontrado!');
        throw new Error('Componente não encontrado');
      }
    }).catch(error => {
      console.error('❌ [DEBUG] Erro na importação:', error);
      throw error;
    });
  },
  { 
    ssr: false,
    loading: () => {
      console.log('🔵 [DEBUG] Mostrando loading...');
      return (
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
            <p style={{ color: '#6b7280', fontSize: '14px' }}>🔵 [DEBUG] Carregando componente...</p>
          </div>
        </div>
      );
    }
  }
);

console.log('🔵 [DEBUG] AdminRelatorioSemanal definido');

export default function RelatorioSemanalPage() {
  console.log('🔵 [DEBUG] RelatorioSemanalPage renderizando...');
  
  return (
    <div>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        background: '#1f2937', 
        color: 'white', 
        padding: '8px 12px', 
        fontSize: '12px',
        zIndex: 9999,
        borderBottomLeftRadius: '4px'
      }}>
        🔵 DEBUG MODE - Check Console
      </div>
      
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔵</div>
            <p style={{ color: '#6b7280' }}>Suspense Fallback - Carregando...</p>
          </div>
        </div>
      }>
        <AdminRelatorioSemanal />
      </Suspense>
    </div>
  );
}

console.log('🔵 [DEBUG] page.tsx completamente carregado');