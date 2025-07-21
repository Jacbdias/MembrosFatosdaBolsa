import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase } from 'lucide-react';

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
  const [showPreview, setShowPreview] = useState(false);

  // 📚 CARREGAR RELATÓRIO EXISTENTE
  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        console.log('🔄 Carregando relatório...');
        const response = await fetch('/api/relatorio-semanal');
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setRelatorio(data);
          }
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
      const token = 'fake-admin-token';
      const userEmail = 'admin@fatosdobolsa.com';
      const method = relatorio.id ? 'PUT' : 'POST';
      
      const response = await fetch('/api/relatorio-semanal', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail
        },
        body: JSON.stringify(relatorio)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}`);
      }
      
      const savedRelatorio = await response.json();
      setRelatorio(savedRelatorio);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
    } catch (error) {
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao publicar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // Funções de manipulação (simplificadas para o exemplo)
  const addMacroNews = () => {
    const newNews: MacroNews = {
      id: Date.now().toString(),
      title: '',
      summary: '',
      impact: 'medium',
      sectors: [],
      recommendations: []
    };
    setRelatorio(prev => ({ ...prev, macro: [...prev.macro, newNews] }));
  };

  const updateMacroNews = (id: string, field: keyof MacroNews, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      macro: prev.macro.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeMacroNews = (id: string) => {
    setRelatorio(prev => ({
      ...prev,
      macro: prev.macro.filter(item => item.id !== id)
    }));
  };

  const addProvento = () => {
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
    setRelatorio(prev => ({ ...prev, proventos: [...prev.proventos, newProvento] }));
  };

  const updateProvento = (id: string, field: keyof DividendoInfo, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      proventos: prev.proventos.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeProvento = (id: string) => {
    setRelatorio(prev => ({
      ...prev,
      proventos: prev.proventos.filter(item => item.id !== id)
    }));
  };

  const addStockNews = (section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior') => {
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
  };

  const updateStockNews = (section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', id: string, field: keyof StockNews, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeStockNews = (section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', id: string) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  // Calcular estatísticas
  const totalItems = relatorio.macro.length + relatorio.proventos.length + 
                    relatorio.dividendos.length + relatorio.smallCaps.length + 
                    relatorio.microCaps.length + relatorio.exterior.length;

  const tabs = [
    { 
      id: 'macro', 
      label: 'Panorama Macro', 
      icon: Globe, 
      color: '#2563eb',
      count: relatorio.macro.length,
      description: 'Notícias macroeconômicas'
    },
    { 
      id: 'proventos', 
      label: 'Proventos', 
      icon: DollarSign, 
      color: '#4cfa00',
      count: relatorio.proventos.length,
      description: 'JCP e Dividendos'
    },
    { 
      id: 'dividendos', 
      label: 'Dividendos', 
      icon: Calendar, 
      color: '#22c55e',
      count: relatorio.dividendos.length,
      description: 'Notícias de dividendos'
    },
    { 
      id: 'smallcaps', 
      label: 'Small Caps', 
      icon: Building, 
      color: '#2563eb',
      count: relatorio.smallCaps.length,
      description: 'Empresas de médio porte'
    },
    { 
      id: 'microcaps', 
      label: 'Micro Caps', 
      icon: Zap, 
      color: '#ea580c',
      count: relatorio.microCaps.length,
      description: 'Empresas de pequeno porte'
    },
    { 
      id: 'exterior', 
      label: 'Exterior', 
      icon: TrendingUp, 
      color: '#7c3aed',
      count: relatorio.exterior.length,
      description: 'Ações internacionais'
    }
  ];

  const getCurrentTab = () => tabs.find(tab => tab.id === activeTab);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Moderno */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        color: 'white',
        borderBottom: '4px solid #4cfa00'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4cfa00 0%, #22c55e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  Relatório Semanal
                </h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  Painel Administrativo - Fatos da Bolsa
                </p>
              </div>
            </div>
            
            {/* Status Cards */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                minWidth: '100px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#4cfa00' }}>
                  {totalItems}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total de Itens</div>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                minWidth: '100px'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: relatorio.status === 'published' ? '#4cfa00' : '#fbbf24'
                }}>
                  {relatorio.status === 'published' ? '✅ PUBLICADO' : '📝 RASCUNHO'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Action Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Configurações do Relatório
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {saved && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#22c55e',
                  backgroundColor: '#f0fdf4',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <CheckCircle size={16} />
                  Salvo com sucesso
                </div>
              )}
              
              {error && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              
              <button
                onClick={saveRelatorio}
                disabled={saving}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              
              <button
                onClick={publishRelatorio}
                disabled={saving}
                style={{
                  backgroundColor: '#4cfa00',
                  color: '#1e293b',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(76, 250, 0, 0.3)'
                }}
              >
                <Eye size={16} />
                Publicar Relatório
              </button>
            </div>
          </div>

          {/* Informações Gerais - Layout moderno */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                📅 Data do Relatório
              </label>
              <input
                type="date"
                value={relatorio.date}
                onChange={(e) => setRelatorio(prev => ({ ...prev, date: e.target.value }))}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  ':focus': { borderColor: '#4cfa00' }
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                📆 Semana de Referência
              </label>
              <input
                type="text"
                value={relatorio.weekOf}
                onChange={(e) => setRelatorio(prev => ({ ...prev, weekOf: e.target.value }))}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Semana de 22/06/2025"
              />
            </div>
          </div>
        </div>

        {/* Tabs Modernas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Tab Navigation */}
          <div style={{ 
            background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', padding: '8px', gap: '4px', overflowX: 'auto' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      minWidth: '180px',
                      transition: 'all 0.2s',
                      backgroundColor: isActive ? tab.color : 'transparent',
                      color: isActive ? 'white' : '#64748b',
                      boxShadow: isActive ? `0 4px 12px ${tab.color}40` : 'none'
                    }}
                  >
                    <Icon size={18} />
                    <div style={{ textAlign: 'left' }}>
                      <div>{tab.label}</div>
                      <div style={{ 
                        fontSize: '12px', 
                        opacity: 0.8,
                        color: isActive ? 'rgba(255,255,255,0.8)' : '#94a3b8'
                      }}>
                        {tab.count} itens
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {/* Header da seção ativa */}
            {getCurrentTab() && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: `${getCurrentTab()!.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <getCurrentTab()!.icon size={24} style={{ color: getCurrentTab()!.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        {getCurrentTab()!.label}
                      </h3>
                      <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
                        {getCurrentTab()!.description}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (activeTab === 'macro') addMacroNews();
                      else if (activeTab === 'proventos') addProvento();
                      else addStockNews(activeTab as any);
                    }}
                    style={{
                      backgroundColor: getCurrentTab()!.color,
                      color: 'white',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      boxShadow: `0 4px 12px ${getCurrentTab()!.color}40`
                    }}
                  >
                    <Plus size={16} />
                    Adicionar Item
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo simplificado para demonstração */}
            {activeTab === 'macro' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {relatorio.macro.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '16px',
                    border: '2px dashed #cbd5e1'
                  }}>
                    <Globe size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                    <h4 style={{ color: '#475569', marginBottom: '8px' }}>Nenhuma notícia macro ainda</h4>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Clique em "Adicionar Item" para começar</p>
                  </div>
                ) : (
                  relatorio.macro.map((news) => (
                    <div key={news.id} style={{
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      backgroundColor: '#fefefe'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontWeight: '600', color: '#1e293b', margin: 0, fontSize: '16px' }}>
                          📰 Notícia Macroeconômica
                        </h4>
                        <button
                          onClick={() => removeMacroNews(news.id)}
                          style={{ 
                            color: '#dc2626', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: '20px' }}>
                        {/* Campos do formulário com melhor design */}
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151', 
                            marginBottom: '8px' 
                          }}>
                            💭 Título da Notícia
                          </label>
                          <input
                            type="text"
                            value={news.title}
                            onChange={(e) => updateMacroNews(news.id, 'title', e.target.value)}
                            style={{
                              width: '100%',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                            placeholder="Ex: Copom eleva Selic para 11,75%"
                          />
                        </div>

                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#374151', 
                            marginBottom: '8px' 
                          }}>
                            📝 Resumo e Análise
                          </label>
                          <textarea
                            value={news.summary}
                            onChange={(e) => updateMacroNews(news.id, 'summary', e.target.value)}
                            rows={4}
                            style={{
                              width: '100%',
                              border: '2px solid #e5e7eb',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              fontSize: '14px',
                              resize: 'vertical',
                              boxSizing: 'border-box'
                            }}
                            placeholder="Descreva o contexto, impactos esperados e análise da notícia..."
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151', 
                              marginBottom: '8px' 
                            }}>
                              ⚡ Nível de Impacto
                            </label>
                            <select
                              value={news.impact}
                              onChange={(e) => updateMacroNews(news.id, 'impact', e.target.value)}
                              style={{
                                width: '100%',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <option value="low">🟢 Baixo Impacto</option>
                              <option value="medium">🟡 Médio Impacto</option>
                              <option value="high">🔴 Alto Impacto</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151', 
                              marginBottom: '8px' 
                            }}>
                              🏭 Setores Afetados
                            </label>
                            <input
                              type="text"
                              value={news.sectors.join(', ')}
                              onChange={(e) => updateMacroNews(news.id, 'sectors', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                              style={{
                                width: '100%',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                              }}
                              placeholder="Bancos, Energia, Varejo"
                            />
                          </div>

                          <div>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '14px', 
                              fontWeight: '600', 
                              color: '#374151', 
                              marginBottom: '8px' 
                            }}>
                              🎯 Ações Recomendadas
                            </label>
                            <input
                              type="text"
                              value={news.recommendations.join(', ')}
                              onChange={(e) => updateMacroNews(news.id, 'recommendations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                              style={{
                                width: '100%',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '14px',
                                boxSizing: 'border-box'
                              }}
                              placeholder="PETR4, ITUB4, VALE3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Placeholder para outras abas */}
            {activeTab !== 'macro' && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1'
              }}>
                <getCurrentTab()!.icon size={48} style={{ color: getCurrentTab()!.color, marginBottom: '16px' }} />
                <h4 style={{ color: '#475569', marginBottom: '8px' }}>
                  Seção {getCurrentTab()!.label}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                  Interface completa disponível na implementação final
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo do Relatório */}
        <div style={{
          marginTop: '32px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          padding: '32px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', color: '#1e293b' }}>
            📊 Resumo do Relatório
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {tabs.map((tab) => (
              <div key={tab.id} style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: `${tab.color}08`,
                border: `2px solid ${tab.color}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <tab.icon size={20} style={{ color: tab.color }} />
                  <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                    {tab.label}
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: tab.color }}>
                  {tab.count}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {tab.count === 1 ? 'item' : 'itens'}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '14px' }}>
              <div>
                <span style={{ color: '#64748b' }}>📅 Data:</span>
                <span style={{ marginLeft: '8px', fontWeight: '600', color: '#1e293b' }}>
                  {new Date(relatorio.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>📆 Semana:</span>
                <span style={{ marginLeft: '8px', fontWeight: '600', color: '#1e293b' }}>
                  {relatorio.weekOf}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>📊 Total de Itens:</span>
                <span style={{ marginLeft: '8px', fontWeight: '700', color: '#4cfa00' }}>
                  {totalItems}
                </span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>🚀 Status:</span>
                <span style={{ 
                  marginLeft: '8px', 
                  fontWeight: '600',
                  color: relatorio.status === 'published' ? '#22c55e' : '#f59e0b'
                }}>
                  {relatorio.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorioSemanal;