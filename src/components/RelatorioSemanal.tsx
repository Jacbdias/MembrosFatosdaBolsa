'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Calendar, DollarSign, Building, Globe, Zap, Bell } from 'lucide-react';

interface MacroNews {
  title: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  sectors: string[];
  recommendations: string[];
}

interface DividendoInfo {
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
  ticker: string;
  company: string;
  news: string;
  impact: 'positive' | 'negative' | 'neutral';
  highlight: string;
  recommendation: string;
}

interface RelatorioData {
  date: string;
  weekOf: string;
  macro: MacroNews[];
  dividendos: DividendoInfo[];
  smallCaps: StockNews[];
  microCaps: StockNews[];
  exterior: StockNews[];
  status: 'draft' | 'published';
}

interface RelatorioSemanalProps {
  data: RelatorioData;
}

const RelatorioSemanal: React.FC<RelatorioSemanalProps> = ({ data }) => {
  const [expandedSections, setExpandedSections] = useState({
    macro: true,
    dividendos: false,
    smallCaps: false,
    microCaps: false,
    exterior: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100'; 
      case 'neutral': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const Section = ({ title, icon: Icon, sectionKey, children, count }: any) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button 
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {count && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {expandedSections[sectionKey] ? 
          <ChevronUp className="w-5 h-5 text-gray-500" /> : 
          <ChevronDown className="w-5 h-5 text-gray-500" />
        }
      </button>
      
      {expandedSections[sectionKey] && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Relatório de Atualização</h1>
              <p className="text-green-100 text-lg">Ações Brasileiras | Exterior</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-green-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">{data.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>{data.weekOf}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          
          {/* Panorama Macro */}
          <Section title="Panorama Macro" icon={Globe} sectionKey="macro" count={data.macro.length}>
            <div className="space-y-4">
              {data.macro.map((news, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{news.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(news.impact)}`}>
                      {news.impact === 'high' ? 'Alto Impacto' : news.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{news.summary}</p>
                  
                  {news.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {news.sectors.map((sector, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {sector}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {news.recommendations.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Recomendações:</span>
                      <div className="flex gap-2">
                        {news.recommendations.map((rec, i) => (
                          <span key={i} className="bg-green-100 text-green-800 text-sm font-bold px-2.5 py-0.5 rounded">
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* Dividendos */}
          <Section title="Dividendos" icon={DollarSign} sectionKey="dividendos" count={data.dividendos.length}>
            <div className="grid gap-4 md:grid-cols-2">
              {data.dividendos.map((div, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-green-800 text-sm">{div.ticker}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{div.company}</h3>
                        <span className="text-sm text-gray-600">{div.type}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      div.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {div.status === 'confirmed' ? 'Confirmado' : 'Anunciado'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Valor:</span>
                      <p className="font-semibold text-green-600">{div.value}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">DY:</span>
                      <p className="font-semibold text-green-600">{div.dy}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Data-com:</span>
                      <p className="font-medium">{div.exDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Pagamento:</span>
                      <p className="font-medium">{div.payDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Small Caps */}
          <Section title="Small Caps" icon={Building} sectionKey="smallCaps" count={data.smallCaps.length}>
            <div className="space-y-4">
              {data.smallCaps.map((stock, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-blue-800 text-sm">{stock.ticker}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{stock.company}</h3>
                        <p className="text-gray-700">{stock.news}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(stock.impact)}`}>
                      {stock.impact === 'positive' ? 'Positivo' : stock.impact === 'negative' ? 'Negativo' : 'Neutro'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-900">{stock.highlight}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Recomendação:</span> {stock.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Micro Caps */}
          <Section title="Micro Caps" icon={Zap} sectionKey="microCaps" count={data.microCaps.length}>
            <div className="space-y-4">
              {data.microCaps.map((stock, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-orange-800 text-sm">{stock.ticker}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{stock.company}</h3>
                        <p className="text-gray-700">{stock.news}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(stock.impact)}`}>
                      {stock.impact === 'positive' ? 'Positivo' : stock.impact === 'negative' ? 'Negativo' : 'Neutro'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-900">{stock.highlight}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Recomendação:</span> {stock.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* Exterior */}
          <Section title="Exterior" icon={Globe} sectionKey="exterior" count={data.exterior.length}>
            <div className="space-y-4">
              {data.exterior.map((stock, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-purple-800 text-xs">{stock.ticker}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{stock.company}</h3>
                        <p className="text-gray-700">{stock.news}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(stock.impact)}`}>
                      {stock.impact === 'positive' ? 'Positivo' : stock.impact === 'negative' ? 'Negativo' : 'Neutro'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-gray-900">{stock.highlight}</p>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Recomendação:</span> {stock.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </Section>

        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-lg px-6 py-3 shadow-sm border border-gray-200">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">Fatos da Bolsa</span>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Relatório elaborado em {data.date} • @fatosdabolsa
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatorioSemanal;