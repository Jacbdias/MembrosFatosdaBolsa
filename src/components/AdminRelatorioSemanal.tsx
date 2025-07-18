'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Globe, DollarSign, Building, Zap, TrendingUp, Calendar, Plus, Trash2, Save, Eye, CheckCircle, FileText, BarChart3 } from 'lucide-react';

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

const AdminRelatorioSemanal = () => {
  // Estados
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Carregar relatório existente
  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        const response = await fetch('/api/relatorio-semanal');
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setRelatorio(data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
      }
    };
    
    loadRelatorio();
  }, []);

  // Função de debug
  const debugRelatorioPublico = useCallback(async () => {
    try {
      console.log('🔍 Testando API pública...');
      
      const response = await fetch('/api/relatorio-semanal', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Dados públicos:', data);
      
      setDebugInfo({
        status: 'success',
        data: data,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        message: data ? `Relatório encontrado (${data.status})` : 'Nenhum relatório publicado'
      });
      
    } catch (error: any) {
      console.error('❌ Erro no debug:', error);
      setDebugInfo({
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        message: 'Erro ao buscar relatório público'
      });
    }
  }, []);

  // Salvar relatório
  const saveRelatorio = useCallback(async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const method = relatorio.id ? 'PUT' : 'POST';
      const response = await fetch('/api/relatorio-semanal', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify(relatorio)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar relatório');
      }
      
      const savedRelatorio = await response.json();
      setRelatorio(savedRelatorio);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar relatório');
    } finally {
      setSaving(false);
    }
  }, [relatorio]);

  // Publicar relatório
  const publishRelatorio = useCallback(async () => {
    setSaving(true);
    try {
      const publishedReport = { ...relatorio, status: 'published' as const };
      
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const response = await fetch('/api/relatorio-semanal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify(publishedReport)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao publicar relatório');
      }
      
      const savedRelatorio = await response.json();
      setRelatorio(savedRelatorio);
      alert('✅ Relatório publicado com sucesso!');
    } catch (error) {
      console.error('Erro ao publicar:', error);
      alert('❌ Erro ao publicar relatório');
    } finally {
      setSaving(false);
    }
  }, [relatorio]);

  // Funções para Macro
  const addMacroNews = useCallback(() => {
    const newNews: MacroNews = {
      id: Date.now().toString(),
      title: '',
      summary: '',
      impact: 'medium',
      sectors: [],
      recommendations: []
    };
    setRelatorio(prev => ({
      ...prev,
      macro: [...prev.macro, newNews]
    }));
  }, []);

  const updateMacroNews = useCallback((id: string, field: keyof MacroNews, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      macro: prev.macro.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const removeMacroNews = useCallback((id: string) => {
    setRelatorio(prev => ({
      ...prev,
      macro: prev.macro.filter(item => item.id !== id)
    }));
  }, []);

  // Funções para Proventos
  const addProvento = useCallback(() => {
    const newProvento: DividendoInfo = {
      id: Date.now().toString(),
      ticker: '',
      company: '',
      type: 'JCP',
      value: '',
      dy: '',
      exDate: '',
      payDate: '',
      status: 'announced'
    };
    setRelatorio(prev => ({
      ...prev,
      proventos: [...prev.proventos, newProvento]
    }));
  }, []);

  const updateProvento = useCallback((id: string, field: keyof DividendoInfo, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      proventos: prev.proventos.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const removeProvento = useCallback((id: string) => {
    setRelatorio(prev => ({
      ...prev,
      proventos: prev.proventos.filter(item => item.id !== id)
    }));
  }, []);

  // Funções para Stocks
  const addStockNews = useCallback((section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior') => {
    const newStock: StockNews = {
      id: Date.now().toString(),
      ticker: '',
      company: '',
      news: '',
      impact: 'positive',
      highlight: '',
      recommendation: ''
    };
    setRelatorio(prev => ({
      ...prev,
      [section]: [...prev[section], newStock]
    }));
  }, []);

  const updateStockNews = useCallback((section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', id: string, field: keyof StockNews, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const removeStockNews = useCallback((section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', id: string) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  }, []);

  // Função para contar total de itens
  const getTotalItems = useCallback(() => {
    return relatorio.macro.length + 
           relatorio.proventos.length + 
           relatorio.dividendos.length + 
           relatorio.smallCaps.length + 
           relatorio.microCaps.length + 
           relatorio.exterior.length;
  }, [relatorio]);

  // Configuração das tabs
  const tabs = [
    { id: 'macro', label: 'Panorama Macro', icon: Globe, color: '#2563eb' },
    { id: 'proventos', label: 'Proventos', icon: DollarSign, color: '#059669' },
    { id: 'dividendos', label: 'Dividendos', icon: Calendar, color: '#22c55e' },
    { id: 'smallcaps', label: 'Small Caps', icon: Building, color: '#2563eb' },
    { id: 'microcaps', label: 'Micro Caps', icon: Zap, color: '#ea580c' },
    { id: 'exterior', label: 'Exterior', icon: TrendingUp, color: '#7c3aed' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>
                Relatório Semanal
              </h1>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                Gerencie o conteúdo do relatório de atualização semanal
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {saved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', backgroundColor: '#ecfdf5', padding: '8px 12px', borderRadius: '8px' }}>
                  <CheckCircle size={16} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Salvo automaticamente</span>
                </div>
              )}
              <button
                onClick={() => setShowDebug(!showDebug)}
                style={{
                  backgroundColor: showDebug ? '#7c3aed' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🔍 Debug
              </button>
              <button
                onClick={saveRelatorio}
                disabled={saving}
                style={{
                  backgroundColor: 'white',
                  color: '#2563eb',
                  border: '1px solid #2563eb',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              <button
                onClick={publishRelatorio}
                disabled={saving}
                style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <Eye size={16} />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Debug Panel */}
        {showDebug && (
          <div style={{
            backgroundColor: '#1f2937',
            color: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>🔍 Painel de Debug</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={debugRelatorioPublico}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Testar API Pública
                </button>
                <button
                  onClick={() => setShowDebug(false)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
            
            {/* Status atual */}
            <div style={{ marginBottom: '16px' }}>
              <strong>📊 Relatório Atual:</strong>
              <div style={{ backgroundColor: '#374151', padding: '12px', borderRadius: '6px', marginTop: '8px' }}>
                <div>ID: {relatorio.id || 'SEM ID'}</div>
                <div>Status: {relatorio.status}</div>
                <div>Data: {relatorio.date}</div>
                <div>Total de itens: {getTotalItems()}</div>
                <div>Macro: {relatorio.macro.length} | Proventos: {relatorio.proventos.length} | Dividendos: {relatorio.dividendos.length}</div>
              </div>
            </div>

            {/* Resultado do debug */}
            {debugInfo && (
              <div>
                <strong>🔍 Resultado do Teste ({debugInfo.timestamp}):</strong>
                <div style={{ 
                  backgroundColor: debugInfo.status === 'success' ? '#065f46' : '#991b1b', 
                  padding: '12px', 
                  borderRadius: '6px', 
                  marginTop: '8px' 
                }}>
                  <div style={{ marginBottom: '8px' }}>
                    {debugInfo.status === 'success' ? '✅' : '❌'} {debugInfo.message}
                  </div>
                  
                  {debugInfo.error && (
                    <div style={{ color: '#fca5a5' }}>Erro: {debugInfo.error}</div>
                  )}
                  
                  {debugInfo.data && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer', color: '#a7f3d0' }}>Ver dados completos</summary>
                      <pre style={{ 
                        fontSize: '12px', 
                        overflow: 'auto', 
                        maxHeight: '200px',
                        marginTop: '8px',
                        backgroundColor: '#1f2937',
                        padding: '8px',
                        borderRadius: '4px'
                      }}>
                        {JSON.stringify(debugInfo.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '12px', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={24} color="#2563eb" />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>
                  Data do Relatório
                </p>
                <input
                  type="date"
                  value={relatorio.date}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, date: e.target.value }))}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                backgroundColor: '#faf5ff', 
                padding: '12px', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} color="#7c3aed" />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>
                  Semana de Referência
                </p>
                <input
                  type="text"
                  value={relatorio.weekOf}
                  onChange={(e) => setRelatorio(prev => ({ ...prev, weekOf: e.target.value }))}
                  style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#111827',
                    minWidth: '200px'
                  }}
                  placeholder="Semana de 22/06/2025"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                backgroundColor: '#ecfdf5', 
                padding: '12px', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={24} color="#059669" />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>
                  Total de Itens
                </p>
                <p style={{ color: '#111827', fontSize: '20px', fontWeight: '700', margin: 0 }}>
                  {getTotalItems()}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                backgroundColor: relatorio.status === 'published' ? '#ecfdf5' : '#fef3c7', 
                padding: '12px', 
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Eye size={24} color={relatorio.status === 'published' ? '#059669' : '#d97706'} />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0', fontWeight: '500' }}>
                  Status
                </p>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  backgroundColor: relatorio.status === 'published' ? '#ecfdf5' : '#fef3c7',
                  color: relatorio.status === 'published' ? '#059669' : '#d97706'
                }}>
                  {relatorio.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafbfc' }}>
            <nav style={{ display: 'flex', padding: '0 24px', gap: '8px' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: isActive ? tab.color : '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Conteúdo das tabs - implementação básica */}
            {activeTab === 'macro' && (
              <div>
                <h3>Panorama Macro</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
            {activeTab === 'proventos' && (
              <div>
                <h3>Proventos</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
            {activeTab === 'dividendos' && (
              <div>
                <h3>Dividendos</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
            {activeTab === 'smallcaps' && (
              <div>
                <h3>Small Caps</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
            {activeTab === 'microcaps' && (
              <div>
                <h3>Micro Caps</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
            {activeTab === 'exterior' && (
              <div>
                <h3>Exterior</h3>
                <p>Funcionalidade em desenvolvimento...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default AdminRelatorioSemanal;