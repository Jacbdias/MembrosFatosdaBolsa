'use client';

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

  // 📊 MACRO - Adicionar Nova Notícia
  const addMacroNews = () => {
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

  // 💰 PROVENTOS - Adicionar Novo Provento
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
    setRelatorio(prev => ({
      ...prev,
      proventos: [...prev.proventos, newProvento]
    }));
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

  // 🏢 STOCK NEWS - Adicionar Nova Ação
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

  // 📄 COMPONENTES DE FORMULÁRIO
  const MacroSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Panorama Macro</h3>
        <button
          onClick={addMacroNews}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Nova Notícia
        </button>
      </div>

      {relatorio.macro.map((news) => (
        <div key={news.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>Notícia Macro</h4>
            <button
              onClick={() => removeMacroNews(news.id)}
              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Ex: Copom eleva Selic para 15%"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Resumo
              </label>
              <textarea
                value={news.summary}
                onChange={(e) => updateMacroNews(news.id, 'summary', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Resumo da notícia e impactos..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Impacto
                </label>
                <select
                  value={news.impact}
                  onChange={(e) => updateMacroNews(news.id, 'impact', e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                    padding: '8px 12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Energia, Petróleo, Bancos"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                    padding: '8px 12px',
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
  );

  const ProventosSection = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Proventos</h3>
        <button
          onClick={addProvento}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Novo Provento
        </button>
      </div>

      {relatorio.proventos.map((prov) => (
        <div key={prov.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>Dividendo/JCP</h4>
            <button
              onClick={() => removeProvento(prov.id)}
              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Ticker
              </label>
              <input
                type="text"
                value={prov.ticker}
                onChange={(e) => updateProvento(prov.id, 'ticker', e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="SAPR11"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Empresa
              </label>
              <input
                type="text"
                value={prov.company}
                onChange={(e) => updateProvento(prov.id, 'company', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Sanepar"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Tipo
              </label>
              <select
                value={prov.type}
                onChange={(e) => updateProvento(prov.id, 'type', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="JCP">JCP</option>
                <option value="Dividendo">Dividendo</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Valor
              </label>
              <input
                type="text"
                value={prov.value}
                onChange={(e) => updateProvento(prov.id, 'value', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="R$ 1,196"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                DY
              </label>
              <input
                type="text"
                value={prov.dy}
                onChange={(e) => updateProvento(prov.id, 'dy', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="3,295%"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Data-com
              </label>
              <input
                type="date"
                value={prov.exDate}
                onChange={(e) => updateProvento(prov.id, 'exDate', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Data Pagamento
              </label>
              <input
                type="date"
                value={prov.payDate}
                onChange={(e) => updateProvento(prov.id, 'payDate', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Status
              </label>
              <select
                value={prov.status}
                onChange={(e) => updateProvento(prov.id, 'status', e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="announced">Anunciado</option>
                <option value="confirmed">Confirmado</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const StockSection = ({ section, title, color }: { section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', title: string, color: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{title}</h3>
        <button
          onClick={() => addStockNews(section)}
          style={{
            backgroundColor: color,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Nova Ação
        </button>
      </div>

      {relatorio[section].map((stock) => (
        <div key={stock.id} style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h4 style={{ fontWeight: '500', color: '#111827', margin: 0 }}>Ação {title}</h4>
            <button
              onClick={() => removeStockNews(section, stock.id)}
              style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                    padding: '8px 12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="JALL3"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                    padding: '8px 12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Jalles"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Impacto
                </label>
                <select
                  value={stock.impact}
                  onChange={(e) => updateStockNews(section, stock.id, 'impact', e.target.value)}
                  style={{
                    width: '100%',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="positive">Positivo</option>
                  <option value="neutral">Neutro</option>
                  <option value="negative">Negativo</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
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
                  padding: '8px 12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="4T25 com forte desempenho operacional"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Destaque Principal
              </label>
              <textarea
                value={stock.highlight}
                onChange={(e) => updateStockNews(section, stock.id, 'highlight', e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="EBITDA ajustado de R$ 297,5 milhões (+131,6%)"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Recomendação
              </label>
              <textarea
                value={stock.recommendation}
                onChange={(e) => updateStockNews(section, stock.id, 'recommendation', e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Manutenção para quem já tem entre 2% e 3% da carteira"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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

  const getCurrentTab = () => {
    return tabs.find(tab => tab.id === activeTab);
  };

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
                  boxSizing: 'border-box'
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
            {activeTab === 'macro' && <MacroSection />}
            {activeTab === 'proventos' && <ProventosSection />}
            {activeTab === 'dividendos' && <StockSection section="dividendos" title="Dividendos" color="#22c55e" />}
            {activeTab === 'smallcaps' && <StockSection section="smallCaps" title="Small Caps" color="#2563eb" />}
            {activeTab === 'microcaps' && <StockSection section="microCaps" title="Micro Caps" color="#ea580c" />}
            {activeTab === 'exterior' && <StockSection section="exterior" title="Exterior" color="#7c3aed" />}
          </div>
        </div>

        {/* Preview */}
        <div style={{
          marginTop: '32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Preview do Relatório</h2>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0 }}><strong>ID:</strong> {relatorio.id || 'Novo relatório'}</p>
              <p style={{ margin: 0 }}><strong>Data:</strong> {relatorio.date}</p>
              <p style={{ margin: 0 }}><strong>Semana:</strong> {relatorio.weekOf}</p>
              <p style={{ margin: 0 }}><strong>Notícias Macro:</strong> {relatorio.macro.length}</p>
              <p style={{ margin: 0 }}><strong>Proventos:</strong> {relatorio.proventos.length}</p>
              <p style={{ margin: 0 }}><strong>Dividendos:</strong> {relatorio.dividendos.length}</p>
              <p style={{ margin: 0 }}><strong>Small Caps:</strong> {relatorio.smallCaps.length}</p>
              <p style={{ margin: 0 }}><strong>Micro Caps:</strong> {relatorio.microCaps.length}</p>
              <p style={{ margin: 0 }}><strong>Exterior:</strong> {relatorio.exterior.length}</p>
              <p style={{ margin: 0 }}>
                <strong>Status:</strong>
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: relatorio.status === 'published' ? '#dcfce7' : '#fef3c7',
                  color: relatorio.status === 'published' ? '#166534' : '#92400e'
                }}>
                  {relatorio.status === 'published' ? 'Publicado' : 'Rascunho'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorioSemanal;