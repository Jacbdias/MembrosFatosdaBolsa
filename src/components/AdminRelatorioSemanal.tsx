'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, Calendar, Building, DollarSign, Globe, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

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
  dividendos: DividendoInfo[];
  smallCaps: StockNews[];
  microCaps: StockNews[];
  exterior: StockNews[];
  status: 'draft' | 'published';
}

const AdminRelatorioSemanal = () => {
  const [relatorio, setRelatorio] = useState<RelatorioData>({
    date: new Date().toLocaleDateString('pt-BR'),
    weekOf: `Semana de ${new Date().toLocaleDateString('pt-BR')}`,
    macro: [],
    dividendos: [],
    smallCaps: [],
    microCaps: [],
    exterior: [],
    status: 'draft'
  });

  const [activeTab, setActiveTab] = useState('macro');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 📚 CARREGAR RELATÓRIO EXISTENTE
  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        const response = await fetch('/api/relatorio-semanal');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setRelatorio(data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar relatório:', error);
      }
    };
    
    loadRelatorio();
  }, []);

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

  // 💰 DIVIDENDOS - Adicionar Novo Dividendo
  const addDividendo = () => {
    const newDividendo: DividendoInfo = {
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
      dividendos: [...prev.dividendos, newDividendo]
    }));
  };

  const updateDividendo = (id: string, field: keyof DividendoInfo, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      dividendos: prev.dividendos.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeDividendo = (id: string) => {
    setRelatorio(prev => ({
      ...prev,
      dividendos: prev.dividendos.filter(item => item.id !== id)
    }));
  };

  // 🏢 SMALL CAPS - Adicionar Nova Ação
  const addStockNews = (section: 'smallCaps' | 'microCaps' | 'exterior') => {
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

  const updateStockNews = (section: 'smallCaps' | 'microCaps' | 'exterior', id: string, field: keyof StockNews, value: any) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeStockNews = (section: 'smallCaps' | 'microCaps' | 'exterior', id: string) => {
    setRelatorio(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  // 💾 SALVAR RELATÓRIO
  const saveRelatorio = async () => {
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
  };

  // 📤 PUBLICAR RELATÓRIO
  const publishRelatorio = async () => {
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
  };

  // 📄 COMPONENTES DE FORMULÁRIO
  const MacroSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Panorama Macro</h3>
        <button
          onClick={addMacroNews}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Notícia
        </button>
      </div>

      {relatorio.macro.map((news) => (
        <div key={news.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-900">Notícia Macro</h4>
            <button
              onClick={() => removeMacroNews(news.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                value={news.title}
                onChange={(e) => updateMacroNews(news.id, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Copom eleva Selic para 15%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resumo</label>
              <textarea
                value={news.summary}
                onChange={(e) => updateMacroNews(news.id, 'summary', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Resumo da notícia e impactos..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impacto</label>
                <select
                  value={news.impact}
                  onChange={(e) => updateMacroNews(news.id, 'impact', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Baixo</option>
                  <option value="medium">Médio</option>
                  <option value="high">Alto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Setores (separados por vírgula)</label>
                <input
                  type="text"
                  value={news.sectors.join(', ')}
                  onChange={(e) => updateMacroNews(news.id, 'sectors', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Energia, Petróleo, Bancos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recomendações (separadas por vírgula)</label>
                <input
                  type="text"
                  value={news.recommendations.join(', ')}
                  onChange={(e) => updateMacroNews(news.id, 'recommendations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PETR4, PRIO3, RECV3"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const DividendosSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dividendos</h3>
        <button
          onClick={addDividendo}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Dividendo
        </button>
      </div>

      {relatorio.dividendos.map((div) => (
        <div key={div.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-900">Dividendo/JCP</h4>
            <button
              onClick={() => removeDividendo(div.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticker</label>
              <input
                type="text"
                value={div.ticker}
                onChange={(e) => updateDividendo(div.id, 'ticker', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="SAPR11"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
              <input
                type="text"
                value={div.company}
                onChange={(e) => updateDividendo(div.id, 'company', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Sanepar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={div.type}
                onChange={(e) => updateDividendo(div.id, 'type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="JCP">JCP</option>
                <option value="Dividendo">Dividendo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor</label>
              <input
                type="text"
                value={div.value}
                onChange={(e) => updateDividendo(div.id, 'value', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="R$ 1,196"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">DY</label>
              <input
                type="text"
                value={div.dy}
                onChange={(e) => updateDividendo(div.id, 'dy', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="3,295%"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data-com</label>
              <input
                type="date"
                value={div.exDate}
                onChange={(e) => updateDividendo(div.id, 'exDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Pagamento</label>
              <input
                type="date"
                value={div.payDate}
                onChange={(e) => updateDividendo(div.id, 'payDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={div.status}
                onChange={(e) => updateDividendo(div.id, 'status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

  const StockSection = ({ section, title, color }: { section: 'smallCaps' | 'microCaps' | 'exterior', title: string, color: string }) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => addStockNews(section)}
          className={`${color} text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Nova Ação
        </button>
      </div>

      {relatorio[section].map((stock) => (
        <div key={stock.id} className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium text-gray-900">Ação {title}</h4>
            <button
              onClick={() => removeStockNews(section, stock.id)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ticker</label>
                <input
                  type="text"
                  value={stock.ticker}
                  onChange={(e) => updateStockNews(section, stock.id, 'ticker', e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="JALL3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                <input
                  type="text"
                  value={stock.company}
                  onChange={(e) => updateStockNews(section, stock.id, 'company', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jalles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Impacto</label>
                <select
                  value={stock.impact}
                  onChange={(e) => updateStockNews(section, stock.id, 'impact', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="positive">Positivo</option>
                  <option value="neutral">Neutro</option>
                  <option value="negative">Negativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notícia</label>
              <input
                type="text"
                value={stock.news}
                onChange={(e) => updateStockNews(section, stock.id, 'news', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="4T25 com forte desempenho operacional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destaque Principal</label>
              <textarea
                value={stock.highlight}
                onChange={(e) => updateStockNews(section, stock.id, 'highlight', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="EBITDA ajustado de R$ 297,5 milhões (+131,6%)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recomendação</label>
              <textarea
                value={stock.recommendation}
                onChange={(e) => updateStockNews(section, stock.id, 'recommendation', e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Manutenção para quem já tem entre 2% e 3% da carteira"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'macro', label: 'Panorama Macro', icon: Globe },
    { id: 'dividendos', label: 'Dividendos', icon: DollarSign },
    { id: 'smallcaps', label: 'Small Caps', icon: Building },
    { id: 'microcaps', label: 'Micro Caps', icon: Zap },
    { id: 'exterior', label: 'Exterior', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin - Relatório Semanal</h1>
              <p className="text-gray-600">Gerencie o conteúdo do relatório de atualização</p>
            </div>
            <div className="flex items-center gap-3">
              {saved && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Salvo automaticamente</span>
                </div>
              )}
              <button
                onClick={saveRelatorio}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </button>
              <button
                onClick={publishRelatorio}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Informações Gerais */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Informações Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data do Relatório</label>
              <input
                type="date"
                value={relatorio.date}
                onChange={(e) => setRelatorio(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semana de Referência</label>
              <input
                type="text"
                value={relatorio.weekOf}
                onChange={(e) => setRelatorio(prev => ({ ...prev, weekOf: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Semana de 22/06/2025"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'macro' && <MacroSection />}
            {activeTab === 'dividendos' && <DividendosSection />}
            {activeTab === 'smallcaps' && <StockSection section="smallCaps" title="Small Caps" color="bg-blue-600" />}
            {activeTab === 'microcaps' && <StockSection section="microCaps" title="Micro Caps" color="bg-orange-600" />}
            {activeTab === 'exterior' && <StockSection section="exterior" title="Exterior" color="bg-purple-600" />}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Preview do Relatório</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Data:</strong> {relatorio.date}</p>
              <p><strong>Semana:</strong> {relatorio.weekOf}</p>
              <p><strong>Notícias Macro:</strong> {relatorio.macro.length}</p>
              <p><strong>Dividendos:</strong> {relatorio.dividendos.length}</p>
              <p><strong>Small Caps:</strong> {relatorio.smallCaps.length}</p>
              <p><strong>Micro Caps:</strong> {relatorio.microCaps.length}</p>
              <p><strong>Exterior:</strong> {relatorio.exterior.length}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  relatorio.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
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