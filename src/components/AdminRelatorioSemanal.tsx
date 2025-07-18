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
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

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

  const saveRelatorio = async () => {
    setSaving(true);
    try {
      console.log('💾 Salvando relatório:', relatorio);
      
      const token = localStorage.getItem('custom-auth-token');
      const userEmail = localStorage.getItem('user-email');
      
      const method = relatorio.id ? 'PUT' : 'POST';
      console.log('📡 Método HTTP:', method);
      
      const response = await fetch('/api/relatorio-semanal', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`,
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify(relatorio)
      });
      
      console.log('📡 Response status:', response.status);
      
      const responseData = await response.json();
      console.log('📡 Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || `HTTP ${response.status}`);
      }
      
      setRelatorio(responseData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error('❌ Erro completo ao salvar:', error);
      
      let errorMessage = 'Erro desconhecido ao salvar relatório';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      alert(`❌ Erro ao salvar relatório: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const publishRelatorio = useCallback(async () => {
    setSaving(true);
    try {
      let relatorioToPublish = relatorio;
      
      // ✅ Se não tem ID, salvar primeiro
      if (!relatorio.id) {
        console.log('📝 Relatório sem ID, salvando primeiro...');
        
        const token = localStorage.getItem('custom-auth-token');
        const userEmail = localStorage.getItem('user-email');
        
        const saveResponse = await fetch('/api/relatorio-semanal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`,
            'x-user-email': userEmail || ''
          },
          body: JSON.stringify(relatorio)
        });
        
        if (!saveResponse.ok) {
          const saveError = await saveResponse.json();
          throw new Error(saveError.error || saveError.details || 'Erro ao salvar primeiro');
        }
        
        const savedRelatorio = await saveResponse.json();
        console.log('✅ Relatório salvo com ID:', savedRelatorio.id);
        
        // Atualizar o estado local
        setRelatorio(savedRelatorio);
        relatorioToPublish = savedRelatorio;
      }
      
      // ✅ Agora publicar com o ID correto
      const publishedReport = { ...relatorioToPublish, status: 'published' as const };
      
      console.log('📤 Publicando relatório:', publishedReport);
      
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
      
      console.log('📡 Response status:', response.status);
      
      const responseData = await response.json();
      console.log('📡 Response data:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || `HTTP ${response.status}`);
      }
      
      setRelatorio(responseData);
      alert('✅ Relatório publicado com sucesso! Verifique a página pública.');
    } catch (error: any) {
      console.error('❌ Erro completo ao publicar:', error);
      
      let errorMessage = 'Erro desconhecido ao publicar relatório';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      } else if (error.toString) {
        errorMessage = error.toString();
      }
      
      alert(`❌ Erro ao publicar relatório: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }, [relatorio]);

  return (

  // Funções de manipulação de dados com useCallback
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

  // Componentes de seção memoizados
  const MacroSection = React.memo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>Panorama Macro</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Notícias e análises macroeconômicas</p>
        </div>
        <button
          onClick={addMacroNews}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Nova Notícia
        </button>
      </div>

      {relatorio.macro.length === 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '2px dashed #cbd5e1',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Globe size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
            Nenhuma notícia macro adicionada
          </p>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Clique em "Nova Notícia" para começar
          </p>
        </div>
      )}

      {relatorio.macro.map((news) => (
        <div key={news.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: '#eff6ff',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Globe size={20} color="#2563eb" />
              </div>
              <h4 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>Notícia Macro</h4>
            </div>
            <button
              onClick={() => removeMacroNews(news.id)}
              style={{ 
                color: '#dc2626', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Título
              </label>
              <input
                type="text"
                value={news.title}
                onChange={(e) => updateMacroNews(news.id, 'title', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Ex: Copom eleva Selic para 15%"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Resumo
              </label>
              <textarea
                value={news.summary}
                onChange={(e) => updateMacroNews(news.id, 'summary', e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                placeholder="Resumo da notícia e impactos..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Impacto
                </label>
                <select
                  value={news.impact}
                  onChange={(e) => updateMacroNews(news.id, 'impact', e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Setores (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={news.sectors.join(', ')}
                  onChange={(e) => updateMacroNews(news.id, 'sectors', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Energia, Petróleo, Bancos"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Recomendações (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={news.recommendations.join(', ')}
                  onChange={(e) => updateMacroNews(news.id, 'recommendations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="PETR4, PRIO3, RECV3"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ));

  const ProventosSection = React.memo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>Proventos</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Dividendos e JCPs programados</p>
        </div>
        <button
          onClick={addProvento}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Novo Provento
        </button>
      </div>

      {relatorio.proventos.length === 0 && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '2px dashed #86efac',
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <DollarSign size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: '#166534', fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
            Nenhum provento adicionado
          </p>
          <p style={{ color: '#22c55e', fontSize: '14px', margin: 0 }}>
            Clique em "Novo Provento" para começar
          </p>
        </div>
      )}

      {relatorio.proventos.map((prov) => (
        <div key={prov.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: '#ecfdf5',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} color="#059669" />
              </div>
              <h4 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>Dividendo/JCP</h4>
            </div>
            <button
              onClick={() => removeProvento(prov.id)}
              style={{ 
                color: '#dc2626', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { key: 'ticker', label: 'Ticker', placeholder: 'SAPR11', type: 'text' },
              { key: 'company', label: 'Empresa', placeholder: 'Sanepar', type: 'text' },
              { key: 'type', label: 'Tipo', placeholder: '', type: 'select', options: [{ value: 'JCP', label: 'JCP' }, { value: 'Dividendo', label: 'Dividendo' }] },
              { key: 'value', label: 'Valor', placeholder: 'R$ 1,196', type: 'text' },
              { key: 'dy', label: 'DY', placeholder: '3,295%', type: 'text' },
              { key: 'exDate', label: 'Data-com', placeholder: '', type: 'date' },
              { key: 'payDate', label: 'Data Pagamento', placeholder: '', type: 'date' },
              { key: 'status', label: 'Status', placeholder: '', type: 'select', options: [{ value: 'announced', label: 'Anunciado' }, { value: 'confirmed', label: 'Confirmado' }] }
            ].map((field) => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={prov[field.key as keyof DividendoInfo]}
                    onChange={(e) => updateProvento(prov.id, field.key as keyof DividendoInfo, e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: 'white'
                    }}
                  >
                    {field.options?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={prov[field.key as keyof DividendoInfo]}
                    onChange={(e) => updateProvento(prov.id, field.key as keyof DividendoInfo, field.key === 'ticker' ? e.target.value.toUpperCase() : e.target.value)}
                    style={{
                      width: '100%',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ));

  const StockSection = React.memo(({ section, title, color, icon: Icon }: { 
    section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', 
    title: string, 
    color: string,
    icon: any
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 4px 0', color: '#111827' }}>{title}</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Análises e recomendações de ações</p>
        </div>
        <button
          onClick={() => addStockNews(section)}
          style={{
            backgroundColor: color,
            color: 'white',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <Plus size={16} />
          Nova Ação
        </button>
      </div>

      {relatorio[section].length === 0 && (
        <div style={{
          backgroundColor: `${color}08`,
          border: `2px dashed ${color}40`,
          borderRadius: '8px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Icon size={48} color={color} style={{ margin: '0 auto 16px' }} />
          <p style={{ color: color, fontSize: '16px', fontWeight: '500', margin: '0 0 8px 0' }}>
            Nenhuma ação adicionada em {title}
          </p>
          <p style={{ color: `${color}aa`, fontSize: '14px', margin: 0 }}>
            Clique em "Nova Ação" para começar
          </p>
        </div>
      )}

      {relatorio[section].map((stock) => (
        <div key={stock.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                backgroundColor: `${color}15`,
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={20} color={color} />
              </div>
              <h4 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '16px' }}>Ação {title}</h4>
            </div>
            <button
              onClick={() => removeStockNews(section, stock.id)}
              style={{ 
                color: '#dc2626', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Ticker
                </label>
                <input
                  type="text"
                  value={stock.ticker}
                  onChange={(e) => updateStockNews(section, stock.id, 'ticker', e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="JALL3"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Empresa
                </label>
                <input
                  type="text"
                  value={stock.company}
                  onChange={(e) => updateStockNews(section, stock.id, 'company', e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Jalles"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Impacto
                </label>
                <select
                  value={stock.impact}
                  onChange={(e) => updateStockNews(section, stock.id, 'impact', e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="positive">Positivo</option>
                  <option value="neutral">Neutro</option>
                  <option value="negative">Negativo</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Notícia
              </label>
              <input
                type="text"
                value={stock.news}
                onChange={(e) => updateStockNews(section, stock.id, 'news', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="4T25 com forte desempenho operacional"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Destaque Principal
              </label>
              <textarea
                value={stock.highlight}
                onChange={(e) => updateStockNews(section, stock.id, 'highlight', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                placeholder="EBITDA ajustado de R$ 297,5 milhões (+131,6%)"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Recomendação
              </label>
              <textarea
                value={stock.recommendation}
                onChange={(e) => updateStockNews(section, stock.id, 'recommendation', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                placeholder="Manutenção para quem já tem entre 2% e 3% da carteira"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  ));

  const tabs = [
    { id: 'macro', label: 'Panorama Macro', icon: Globe, color: '#2563eb' },
    { id: 'proventos', label: 'Proventos', icon: DollarSign, color: '#059669' },
    { id: 'dividendos', label: 'Dividendos', icon: Calendar, color: '#22c55e' },
    { id: 'smallcaps', label: 'Small Caps', icon: Building, color: '#2563eb' },
    { id: 'microcaps', label: 'Micro Caps', icon: Zap, color: '#ea580c' },
    { id: 'exterior', label: 'Exterior', icon: TrendingUp, color: '#7c3aed' }
  ];

  // 🔍 FUNÇÃO DE DEBUG
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
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      setDebugInfo({
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        message: 'Erro ao buscar relatório público'
      });
    }
  }, []);
    return relatorio.macro.length + 
           relatorio.proventos.length + 
           relatorio.dividendos.length + 
           relatorio.smallCaps.length + 
           relatorio.microCaps.length + 
           relatorio.exterior.length;
  }, [relatorio]);

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
        {/* 🔍 DEBUG PANEL */}
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
            
            {/* Dados atuais do relatório */}
            <div style={{ marginBottom: '16px' }}>
              <strong>📊 Relatório Atual:</strong>
              <div style={{ backgroundColor: '#374151', padding: '12px', borderRadius: '6px', marginTop: '8px', overflow: 'auto' }}>
                <div>ID: {relatorio.id || 'SEM ID'}</div>
                <div>Status: {relatorio.status}</div>
                <div>Data: {relatorio.date}</div>
                <div>Total de itens: {getTotalItems()}</div>
                <div>Macro: {relatorio.macro.length} | Proventos: {relatorio.proventos.length} | Dividendos: {relatorio.dividendos.length}</div>
              </div>
            </div>

            {/* Informações de debug */}
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

            {/* Dicas */}
            <div style={{ marginTop: '16px', fontSize: '12px', color: '#9ca3af' }}>
              <strong>💡 Dicas:</strong>
              <ul style={{ margin: '4px 0 0 16px', paddingLeft: '0' }}>
                <li>Primeiro adicione conteúdo nas abas</li>
                <li>Clique em "Salvar Rascunho" para obter um ID</li>
                <li>Clique em "Publicar" para disponibilizar publicamente</li>
                <li>Use "Testar API Pública" para verificar se foi publicado</li>
              </ul>
            </div>
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
                      borderBottom: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
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
            {activeTab === 'macro' && <MacroSection />}
            {activeTab === 'proventos' && <ProventosSection />}
            {activeTab === 'dividendos' && <StockSection section="dividendos" title="Dividendos" color="#22c55e" icon={Calendar} />}
            {activeTab === 'smallcaps' && <StockSection section="smallCaps" title="Small Caps" color="#2563eb" icon={Building} />}
            {activeTab === 'microcaps' && <StockSection section="microCaps" title="Micro Caps" color="#ea580c" icon={Zap} />}
            {activeTab === 'exterior' && <StockSection section="exterior" title="Exterior" color="#7c3aed" icon={TrendingUp} />}
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