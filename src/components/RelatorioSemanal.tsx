'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle } from 'lucide-react';

// Todas as suas interfaces aqui (não mudei nada das interfaces)
interface MacroNews {
  id: string;
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  sectors: string[];
  recommendations: string[];
}

interface DividendoInfo {
  id: string;
  ticker: string;
  company: string;
  type: 'JCP' | 'Dividendo';
  value: string;
  dy: string;
  exDate: string;
  payDate: string;
  status: 'confirmed' | 'announced';
}

interface StockNews {
  id: string;
  ticker: string;
  company: string;
  news: string;
  impact: 'positive' | 'negative' | 'neutral';
  highlight: string;
  recommendation: string;
}

interface RelatorioData {
  id?: string;
  date: string;
  weekOf: string;
  macro: MacroNews[];
  proventos: DividendoInfo[];
  dividendos: StockNews[];
  smallCaps: StockNews[];
  microCaps: StockNews[];
  exterior: StockNews[];
  status: 'draft' | 'published';
}

// ✅ COMPONENTE PRINCIPAL
function AdminRelatorioSemanal() {
  const [relatorio, setRelatorio] = useState<RelatorioData>({
    date: new Date().toISOString().split('T')[0],
    weekOf: `Semana de ${new Date().toLocaleDateString('pt-BR')}`,
    macro: [],
    proventos: [],
    dividendos: [],
    smallCaps: [],
    microCaps: [],
    exterior: [],
    status: 'draft'
  });

  const [activeTab, setActiveTab] = useState('macro');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📚 CARREGAR RELATÓRIO EXISTENTE
  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        console.log('🔄 Carregando relatório...');
        const response = await fetch('/api/relatorio-semanal');
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📄 Dados recebidos:', data);
          
          if (data && data.id) {
            setRelatorio(data);
            console.log('✅ Relatório carregado com sucesso');
          } else {
            console.log('ℹ️ Nenhum relatório encontrado');
          }
        } else {
          console.warn('⚠️ Erro ao carregar relatório:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar relatório:', error);
        setError('Erro ao carregar relatório');
      }
    };
    
    loadRelatorio();
  }, []);

  // 💾 SALVAR RELATÓRIO
  const saveRelatorio = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando relatório...', relatorio);
      
      // Simular token e email do admin para teste
      const token = 'fake-admin-token';
      const userEmail = 'admin@fatosdobolsa.com';
      
      const method = relatorio.id ? 'PUT' : 'POST';
      console.log(`📤 Enviando ${method} para /api/relatorio-semanal`);
      
      const response = await fetch('/api/relatorio-semanal', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail
        },
        body: JSON.stringify(relatorio)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.error || `Erro ${response.status}`);
      }
      
      const savedRelatorio = await response.json();
      console.log('✅ Relatório salvo:', savedRelatorio);
      
      setRelatorio(savedRelatorio);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // 📤 PUBLICAR RELATÓRIO
  const publishRelatorio = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('📤 Publicando relatório...');
      
      const publishedReport = { ...relatorio, status: 'published' as const };
      
      const token = 'fake-admin-token';
      const userEmail = 'admin@fatosdobolsa.com';
      
      const response = await fetch('/api/relatorio-semanal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail
        },
        body: JSON.stringify(publishedReport)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao publicar');
      }
      
      const savedRelatorio = await response.json();
      setRelatorio(savedRelatorio);
      alert('✅ Relatório publicado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao publicar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao publicar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Resto das suas funções aqui (addMacroNews, updateMacroNews, etc.)
  // ... (mantenha todas as outras funções como estão)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '20px' }}>
        <h1>Admin - Relatório Semanal</h1>
        <p>Componente carregado com sucesso!</p>
        
        {error && (
          <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={saveRelatorio} 
            disabled={saving}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            {saving ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          <button 
            onClick={publishRelatorio} 
            disabled={saving}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#059669', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1
            }}
          >
            Publicar
          </button>
        </div>
        
        {saved && (
          <div style={{ color: 'green', marginTop: '10px' }}>
            ✅ Salvo com sucesso!
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ EXPORTS FINAIS - CRÍTICOS PARA O FUNCIONAMENTO
export default AdminRelatorioSemanal;
export { AdminRelatorioSemanal };
export const RelatorioSemanal = AdminRelatorioSemanal;