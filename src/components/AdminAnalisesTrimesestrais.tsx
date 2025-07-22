'use client';

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Palette, ExternalLink, PieChart, Activity, Image, Upload, Edit, Archive, Search, Filter } from 'lucide-react';

// Interfaces
interface MetricaTrimestreData {
  valor: number;
  unidade: string;
  variacao?: number;
  margem?: number;
}

interface AnaliseTrimestreData {
  id?: string;
  ticker: string;
  empresa: string;
  trimestre: string;
  dataPublicacao: string;
  autor: string;
  categoria: 'resultado_trimestral' | 'analise_setorial' | 'tese_investimento';
  
  // Conteúdo principal
  titulo: string;
  resumoExecutivo: string;
  analiseCompleta: string;
  
  // Métricas do trimestre
  metricas: {
    receita?: MetricaTrimestreData;
    ebitda?: MetricaTrimestreData;
    lucroLiquido?: MetricaTrimestreData;
    roe?: MetricaTrimestreData;
  };
  
  // Análise
  pontosFavoraveis: string;
  pontosAtencao: string;
  
  // Recomendação
  recomendacao: 'COMPRA' | 'VENDA' | 'MANTER';
  precoAlvo?: number;
  risco: 'BAIXO' | 'MÉDIO' | 'ALTO';
  
  // Links externos
  linkResultado?: string;
  linkConferencia?: string;
  
  status: 'draft' | 'published';
}

// Rich Text Editor Component (mesmo código anterior)
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite seu texto...",
  style = {},
  minHeight = "120px"
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
  });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;
    
    setCurrentFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough')
    });
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormatState();
    
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, updateFormatState]);

  const insertLink = useCallback(() => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImageByUrl = useCallback(() => {
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      try {
        new URL(url);
        execCommand('insertImage', url);
        
        setTimeout(() => {
          if (editorRef.current) {
            const images = editorRef.current.querySelectorAll('img');
            const lastImage = images[images.length - 1];
            if (lastImage) {
              lastImage.style.maxWidth = '100%';
              lastImage.style.height = 'auto';
              lastImage.style.borderRadius = '8px';
              lastImage.style.margin = '8px 0';
              lastImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }
          }
        }, 100);
      } catch (error) {
        alert('URL inválida. Por favor, digite uma URL válida.');
      }
    }
  }, [execCommand]);

  const uploadImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('Arquivo muito grande. Máximo 5MB permitido.');
          return;
        }
        
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            execCommand('insertImage', base64);
            
            setTimeout(() => {
              if (editorRef.current) {
                const images = editorRef.current.querySelectorAll('img');
                const lastImage = images[images.length - 1];
                if (lastImage) {
                  lastImage.style.maxWidth = '100%';
                  lastImage.style.height = 'auto';
                  lastImage.style.borderRadius = '8px';
                  lastImage.style.margin = '8px 0';
                  lastImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  lastImage.setAttribute('title', file.name);
                  lastImage.setAttribute('alt', file.name.split('.')[0]);
                }
              }
            }, 100);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [execCommand]);

  const changeTextColor = useCallback((color: string) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  const changeFontSize = useCallback((size: string) => {
    execCommand('fontSize', size);
  }, [execCommand]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormatState();
  }, [onChange, updateFormatState]);

  const handleFocus = useCallback(() => {
    setIsEditorFocused(true);
    updateFormatState();
  }, [updateFormatState]);

  const handleBlur = useCallback(() => {
    setIsEditorFocused(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  }, [execCommand]);

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      title: 'Negrito (Ctrl+B)',
      active: currentFormat.bold
    },
    {
      icon: Italic,
      command: 'italic',
      title: 'Itálico (Ctrl+I)',
      active: currentFormat.italic
    },
    {
      icon: Underline,
      command: 'underline',
      title: 'Sublinhado (Ctrl+U)',
      active: currentFormat.underline
    },
    {
      icon: Strikethrough,
      command: 'strikeThrough',
      title: 'Riscado',
      active: currentFormat.strikethrough
    }
  ];

  const alignmentButtons = [
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      title: 'Alinhar à esquerda'
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      title: 'Centralizar'
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      title: 'Alinhar à direita'
    }
  ];

  const listButtons = [
    {
      icon: List,
      command: 'insertUnorderedList',
      title: 'Lista com marcadores'
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      title: 'Lista numerada'
    }
  ];

  const colors = [
    '#000000', '#444444', '#666666', '#999999', '#cccccc',
    '#1a73e8', '#4285f4', '#34a853', '#fbbc04', '#ea4335',
    '#9c27b0', '#ff9800', '#795548', '#607d8b', '#e91e63'
  ];

  const fontSizes = [
    { label: 'Pequeno', value: '1' },
    { label: 'Normal', value: '3' },
    { label: 'Grande', value: '5' },
    { label: 'Muito Grande', value: '7' }
  ];

  return (
    <div style={{
      border: `2px solid ${isEditorFocused ? '#2563eb' : '#e5e7eb'}`,
      borderRadius: '12px',
      backgroundColor: 'white',
      transition: 'border-color 0.2s',
      ...style
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '12px 12px 0 0'
      }}>
        {/* Formatação de texto */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {toolbarButtons.map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command)}
              title={button.title}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: button.active ? '#2563eb' : 'transparent',
                color: button.active ? 'white' : '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!button.active) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!button.active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        {/* Tamanho da fonte */}
        <select
          onChange={(e) => changeFontSize(e.target.value)}
          style={{
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
          title="Tamanho da fonte"
        >
          <option value="">Tamanho</option>
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        {/* Alinhamento */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {alignmentButtons.map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command)}
              title={button.title}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        {/* Listas */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {listButtons.map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command)}
              title={button.title}
              style={{
                padding: '8px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        {/* Botões de imagem */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          padding: '4px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <button
            onClick={uploadImage}
            title="📤 Upload de imagem (máx 5MB)"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0ea5e9';
            }}
          >
            <Upload size={14} />
            Upload
          </button>

          <button
            onClick={insertImageByUrl}
            title="🔗 Inserir imagem por URL"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#06b6d4',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0891b2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#06b6d4';
            }}
          >
            <Image size={14} />
            URL
          </button>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        {/* Link */}
        <button
          onClick={insertLink}
          title="Inserir link"
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Link size={16} />
        </button>

        {/* Cores */}
        <div style={{ position: 'relative' }}>
          <details style={{ position: 'relative' }}>
            <summary style={{
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              listStyle: 'none',
              transition: 'all 0.2s'
            }}>
              <Palette size={16} />
            </summary>
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 10,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              minWidth: '140px'
            }}>
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => changeTextColor(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: color,
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title={`Cor: ${color}`}
                />
              ))}
            </div>
          </details>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          padding: '16px',
          minHeight: minHeight,
          outline: 'none',
          lineHeight: '1.6',
          fontSize: '16px',
          color: '#1f2937',
          borderRadius: '0 0 12px 12px'
        }}
        data-placeholder={placeholder}
      />

      {/* CSS para placeholder */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          margin: 8px 0;
          padding-left: 24px;
        }
        
        [contenteditable] li {
          margin: 4px 0;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        [contenteditable] img:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        
        [contenteditable] img.selected {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

// 🎯 COMPONENTE DE CRIAÇÃO DE ANÁLISE
const CriarAnaliseForm = memo(({ onSave }: { onSave: (analise: AnaliseTrimestreData) => void }) => {
  const [analise, setAnalise] = useState<AnaliseTrimestreData>({
    id: Date.now().toString(),
    ticker: '',
    empresa: '',
    trimestre: '',
    dataPublicacao: new Date().toISOString().split('T')[0],
    autor: '',
    categoria: 'resultado_trimestral',
    titulo: '',
    resumoExecutivo: '',
    analiseCompleta: '',
    metricas: {},
    pontosFavoraveis: '',
    pontosAtencao: '',
    recomendacao: 'MANTER',
    risco: 'MÉDIO',
    status: 'draft'
  });

  const [salvando, setSalvando] = useState(false);

  const updateField = useCallback((field: keyof AnaliseTrimestreData, value: any) => {
    setAnalise(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMetrica = useCallback((metrica: keyof AnaliseTrimestreData['metricas'], campo: keyof MetricaTrimestreData, valor: any) => {
    setAnalise(prev => {
      const metricasAtuais = { ...prev.metricas };
      if (!metricasAtuais[metrica]) {
        metricasAtuais[metrica] = { valor: 0, unidade: 'milhões' };
      }
      metricasAtuais[metrica]![campo] = valor;
      return { ...prev, metricas: metricasAtuais };
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSalvando(true);
    
    try {
      // Validações básicas
      if (!analise.ticker || !analise.empresa || !analise.titulo) {
        alert('Por favor, preencha pelo menos Ticker, Empresa e Título.');
        return;
      }
      
      await onSave(analise);
      
      // Limpar formulário após salvar
      setAnalise({
        id: Date.now().toString(),
        ticker: '',
        empresa: '',
        trimestre: '',
        dataPublicacao: new Date().toISOString().split('T')[0],
        autor: '',
        categoria: 'resultado_trimestral',
        titulo: '',
        resumoExecutivo: '',
        analiseCompleta: '',
        metricas: {},
        pontosFavoraveis: '',
        pontosAtencao: '',
        recomendacao: 'MANTER',
        risco: 'MÉDIO',
        status: 'draft'
      });
      
      alert('✅ Análise salva com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar análise');
    } finally {
      setSalvando(false);
    }
  }, [analise, onSave]);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
          ✨ Criar Nova Análise
        </h3>
        
        <button
          onClick={handleSave}
          disabled={salvando}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: salvando ? 'not-allowed' : 'pointer',
            opacity: salvando ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}
        >
          <Save size={16} />
          {salvando ? 'Salvando...' : 'Salvar Análise'}
        </button>
      </div>

      {/* Mesma estrutura de formulário do AnaliseCard, mas adaptada */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Seção 1: Informações Básicas */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} />
            Informações Básicas
          </h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Ticker *
              </label>
              <input
                type="text"
                value={analise.ticker}
                onChange={(e) => updateField('ticker', e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontWeight: '600'
                }}
                placeholder="TUPY3"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Empresa *
              </label>
              <input
                type="text"
                value={analise.empresa}
                onChange={(e) => updateField('empresa', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Tupy S.A."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Trimestre
              </label>
              <input
                type="text"
                value={analise.trimestre}
                onChange={(e) => updateField('trimestre', e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="3T24"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Categoria
              </label>
              <select
                value={analise.categoria}
                onChange={(e) => updateField('categoria', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="resultado_trimestral">Resultado Trimestral</option>
                <option value="analise_setorial">Análise Setorial</option>
                <option value="tese_investimento">Tese de Investimento</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Data de Publicação
              </label>
              <input
                type="date"
                value={analise.dataPublicacao}
                onChange={(e) => updateField('dataPublicacao', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Autor
              </label>
              <input
                type="text"
                value={analise.autor}
                onChange={(e) => updateField('autor', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Seu Nome"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Conteúdo */}
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #fde68a'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} />
            Conteúdo da Análise
          </h5>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Título da Análise *
              </label>
              <input
                type="text"
                value={analise.titulo}
                onChange={(e) => updateField('titulo', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="TUPY3 - 3T24: Avanços ofuscados por volumes fracos"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Resumo Executivo
              </label>
              <RichTextEditor
                value={analise.resumoExecutivo}
                onChange={(value) => updateField('resumoExecutivo', value)}
                placeholder="Principais pontos do trimestre (3-4 bullets)..."
                minHeight="150px"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Análise Completa
              </label>
              <RichTextEditor
                value={analise.analiseCompleta}
                onChange={(value) => updateField('analiseCompleta', value)}
                placeholder="Análise detalhada dos resultados, contexto setorial, perspectivas..."
                minHeight="200px"
              />
            </div>
          </div>
        </div>

        {/* Seção 3: Métricas do Trimestre */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #7dd3fc'
        }}>
          <h5 style={{ fontSize: '18px', fontWeight: '600', color: '#0c4a6e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} />
            Métricas do Trimestre
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Receita */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h6 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#059669', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💰 Receita Líquida
              </h6>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Valor
                    </label>
                    <input
                      type="number"
                      placeholder="1200"
                      value={analise.metricas.receita?.valor || ''}
                      onChange={(e) => updateMetrica('receita', 'valor', parseFloat(e.target.value) || 0)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Unidade
                    </label>
                    <select
                      value={analise.metricas.receita?.unidade || 'milhões'}
                      onChange={(e) => updateMetrica('receita', 'unidade', e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="milhões">R$ Mi</option>
                      <option value="bilhões">R$ Bi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                    Variação vs mesmo período ano anterior (%)
                  </label>
                  <input
                    type="number"
                    placeholder="-8.5"
                    value={analise.metricas.receita?.variacao || ''}
                    onChange={(e) => updateMetrica('receita', 'variacao', parseFloat(e.target.value))}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* EBITDA */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h6 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#0ea5e9', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 EBITDA Ajustado
              </h6>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Valor
                    </label>
                    <input
                      type="number"
                      placeholder="180"
                      value={analise.metricas.ebitda?.valor || ''}
                      onChange={(e) => updateMetrica('ebitda', 'valor', parseFloat(e.target.value) || 0)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Unidade
                    </label>
                    <select
                      value={analise.metricas.ebitda?.unidade || 'milhões'}
                      onChange={(e) => updateMetrica('ebitda', 'unidade', e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="milhões">R$ Mi</option>
                      <option value="bilhões">R$ Bi</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Margem EBITDA (%)
                    </label>
                    <input
                      type="number"
                      placeholder="15.0"
                      value={analise.metricas.ebitda?.margem || ''}
                      onChange={(e) => updateMetrica('ebitda', 'margem', parseFloat(e.target.value))}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Variação (%)
                    </label>
                    <input
                      type="number"
                      placeholder="131.6"
                      value={analise.metricas.ebitda?.variacao || ''}
                      onChange={(e) => updateMetrica('ebitda', 'variacao', parseFloat(e.target.value))}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lucro Líquido */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h6 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#7c3aed', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                💎 Lucro Líquido
              </h6>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Valor
                    </label>
                    <input
                      type="number"
                      placeholder="45"
                      value={analise.metricas.lucroLiquido?.valor || ''}
                      onChange={(e) => updateMetrica('lucroLiquido', 'valor', parseFloat(e.target.value) || 0)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                      Unidade
                    </label>
                    <select
                      value={analise.metricas.lucroLiquido?.unidade || 'milhões'}
                      onChange={(e) => updateMetrica('lucroLiquido', 'unidade', e.target.value)}
                      style={{ 
                        width: '100%',
                        padding: '10px 12px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="milhões">R$ Mi</option>
                      <option value="bilhões">R$ Bi</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                    Variação vs mesmo período ano anterior (%)
                  </label>
                  <input
                    type="number"
                    placeholder="-25.0"
                    value={analise.metricas.lucroLiquido?.variacao || ''}
                    onChange={(e) => updateMetrica('lucroLiquido', 'variacao', parseFloat(e.target.value))}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* ROE */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h6 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#dc2626', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎯 ROE (Return on Equity)
              </h6>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#6b7280', marginBottom: '4px' }}>
                    ROE do período (%)
                  </label>
                  <input
                    type="number"
                    placeholder="12.5"
                    value={analise.metricas.roe?.valor || ''}
                    onChange={(e) => updateMetrica('roe', 'valor', parseFloat(e.target.value) || 0)}
                    style={{ 
                      width: '100%',
                      padding: '10px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: '8px', 
                      fontSize: '14px',
                      fontWeight: '600',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção 4: Análise Qualitativa */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#15803d', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} />
            Análise Qualitativa
          </h5>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                ✅ Pontos Favoráveis
              </label>
              <RichTextEditor
                value={analise.pontosFavoraveis}
                onChange={(value) => updateField('pontosFavoraveis', value)}
                placeholder="Aspectos positivos do resultado e perspectivas..."
                minHeight="120px"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                ⚠️ Pontos de Atenção
              </label>
              <RichTextEditor
                value={analise.pontosAtencao}
                onChange={(value) => updateField('pontosAtencao', value)}
                placeholder="Aspectos que merecem atenção e riscos..."
                minHeight="120px"
              />
            </div>
          </div>
        </div>

        {/* Seção 5: Recomendação */}
        <div style={{
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #d8b4fe'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#7c2d12', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} />
            Recomendação de Investimento
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Recomendação
              </label>
              <select
                value={analise.recomendacao}
                onChange={(e) => updateField('recomendacao', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontWeight: '600'
                }}
              >
                <option value="COMPRA">🟢 COMPRA</option>
                <option value="MANTER">🟡 MANTER</option>
                <option value="VENDA">🔴 VENDA</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Preço Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={analise.precoAlvo || ''}
                onChange={(e) => updateField('precoAlvo', parseFloat(e.target.value) || undefined)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="25.50"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Nível de Risco
              </label>
              <select
                value={analise.risco}
                onChange={(e) => updateField('risco', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="BAIXO">🟢 BAIXO</option>
                <option value="MÉDIO">🟡 MÉDIO</option>
                <option value="ALTO">🔴 ALTO</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção 6: Links Externos */}
        <div style={{
          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #cbd5e1'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#475569', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExternalLink size={18} />
            Links e Materiais
          </h5>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Link do Release de Resultados
              </label>
              <input
                type="url"
                value={analise.linkResultado || ''}
                onChange={(e) => updateField('linkResultado', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://ri.tupy.com.br/resultados-trimestrais"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Link da Conference Call
              </label>
              <input
                type="url"
                value={analise.linkConferencia || ''}
                onChange={(e) => updateField('linkConferencia', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 📋 COMPONENTE DE LISTA DE ANÁLISES PUBLICADAS
const AnalisesPublicadas = memo(({ 
  analises, 
  onEdit, 
  onUnpublish,
  onDelete 
}: { 
  analises: AnaliseTrimestreData[];
  onEdit: (analise: AnaliseTrimestreData) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [filtroTicker, setFiltroTicker] = useState('');
  const [filtroTrimestre, setFiltroTrimestre] = useState('');

  const analisesPublicadas = analises.filter(a => a.status === 'published');
  
  const analisesFiltradas = analisesPublicadas.filter(analise => {
    const matchTicker = !filtroTicker || analise.ticker.toLowerCase().includes(filtroTicker.toLowerCase());
    const matchTrimestre = !filtroTrimestre || analise.trimestre.toLowerCase().includes(filtroTrimestre.toLowerCase());
    return matchTicker && matchTrimestre;
  });

  // Agrupar por ticker
  const analisesPorTicker = analisesFiltradas.reduce((acc, analise) => {
    if (!acc[analise.ticker]) {
      acc[analise.ticker] = [];
    }
    acc[analise.ticker].push(analise);
    return acc;
  }, {} as Record<string, AnaliseTrimestreData[]>);

  const getBadgeRecomendacao = (recomendacao: string) => {
    const cores = {
      'COMPRA': { bg: '#dcfce7', color: '#166534', emoji: '🟢' },
      'VENDA': { bg: '#fef2f2', color: '#dc2626', emoji: '🔴' },
      'MANTER': { bg: '#fef3c7', color: '#92400e', emoji: '🟡' }
    };
    
    const config = cores[recomendacao as keyof typeof cores] || cores.MANTER;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {config.emoji} {recomendacao}
      </span>
    );
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} />
          Filtros
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Filtrar por Ticker
            </label>
            <input
              type="text"
              value={filtroTicker}
              onChange={(e) => setFiltroTicker(e.target.value)}
              placeholder="Digite o ticker..."
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Filtrar por Trimestre
            </label>
            <input
              type="text"
              value={filtroTrimestre}
              onChange={(e) => setFiltroTrimestre(e.target.value)}
              placeholder="Ex: 3T24"
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              onClick={() => {
                setFiltroTicker('');
                setFiltroTrimestre('');
              }}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Limpar Filtros
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
          Mostrando {analisesFiltradas.length} de {analisesPublicadas.length} análises publicadas
        </div>
      </div>

      {/* Lista de Análises Publicadas */}
      {analisesFiltradas.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '64px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            {analisesPublicadas.length === 0 ? 'Nenhuma Análise Publicada' : 'Nenhuma análise corresponde aos filtros'}
          </h3>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
            {analisesPublicadas.length === 0 
              ? 'Publique suas primeiras análises para vê-las aqui.'
              : 'Tente ajustar os filtros para encontrar as análises desejadas.'
            }
          </p>
        </div>
      ) : (
        Object.entries(analisesPorTicker).map(([ticker, analisesDoTicker]) => (
          <div key={ticker} style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Header do ticker */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 4px 0' }}>
                  {ticker}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  {analisesDoTicker[0]?.empresa} • {analisesDoTicker.length} análise{analisesDoTicker.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                color: '#0c4a6e',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid #7dd3fc'
              }}>
                📊 {analisesDoTicker.length} análise{analisesDoTicker.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Grid de análises */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {analisesDoTicker
                .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
                .map((analise, index) => (
                <div key={analise.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: index === 0 ? '#f8fafc' : 'white',
                  position: 'relative'
                }}>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '16px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      🆕 MAIS RECENTE
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                          {analise.titulo}
                        </h4>
                        <span style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {analise.trimestre}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                        <span>📅 {new Date(analise.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                        <span>✍️ {analise.autor}</span>
                        <span style={{
                          backgroundColor: '#e2e8f0',
                          color: '#64748b',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {analise.categoria.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Resumo */}
                      {analise.resumoExecutivo && (
                        <p style={{
                          color: '#64748b',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          margin: '0 0 12px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {analise.resumoExecutivo.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      {/* Métricas resumidas */}
                      {Object.keys(analise.metricas).length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          flexWrap: 'wrap',
                          marginTop: '12px'
                        }}>
                          {analise.metricas.receita && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              Receita: R$ {analise.metricas.receita.valor.toFixed(1)} {analise.metricas.receita.unidade === 'bilhões' ? 'bi' : 'mi'}
                            </span>
                          )}
                          
                          {analise.metricas.ebitda && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#f0f9ff',
                              color: '#0369a1',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              EBITDA: R$ {analise.metricas.ebitda.valor.toFixed(1)} {analise.metricas.ebitda.unidade === 'bilhões' ? 'bi' : 'mi'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ 
                      textAlign: 'right',
                      minWidth: '150px',
                      marginLeft: '20px'
                    }}>
                      {/* Recomendação */}
                      <div style={{ marginBottom: '12px' }}>
                        {getBadgeRecomendacao(analise.recomendacao)}
                      </div>
                      
                      {analise.precoAlvo && (
                        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                          Alvo: R$ {analise.precoAlvo.toFixed(2)}
                        </div>
                      )}
                      
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                        Risco: {analise.risco}
                      </div>
                      
                      {/* Botões de ação */}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onEdit(analise)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '600'
                          }}
                          title="Editar análise"
                        >
                          <Edit size={14} />
                          Editar
                        </button>
                        
                        <button
                          onClick={() => onUnpublish(analise.id!)}
                          style={{
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '600'
                          }}
                          title="Despublicar (volta para rascunho)"
                        >
                          <Archive size={14} />
                          Despublicar
                        </button>
                        
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.')) {
                              onDelete(analise.id!);
                            }
                          }}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: '600'
                          }}
                          title="Excluir análise"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
});

// 📝 COMPONENTE DE RASCUNHOS
const RascunhosAnalises = memo(({ 
  analises, 
  onEdit, 
  onPublish,
  onDelete 
}: { 
  analises: AnaliseTrimestreData[];
  onEdit: (analise: AnaliseTrimestreData) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const rascunhos = analises.filter(a => a.status === 'draft');

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {rascunhos.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '64px',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
            Nenhum Rascunho
          </h3>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
            Todos os seus rascunhos foram publicados ou você ainda não criou nenhum.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
            📝 Rascunhos ({rascunhos.length})
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {rascunhos.map((analise) => (
              <div key={analise.id} style={{
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#fefce8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                        {analise.titulo || 'Título não definido'}
                      </h4>
                      {analise.ticker && (
                        <span style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {analise.ticker}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                      {analise.empresa || 'Empresa não definida'} 
                      {analise.trimestre && ` • ${analise.trimestre}`}
                    </div>
                    
                    <div style={{ fontSize: '12px', color: '#a16207' }}>
                      Criado em: {new Date(analise.dataPublicacao).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEdit(analise)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600'
                      }}
                    >
                      <Edit size={14} />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => onPublish(analise.id!)}
                      style={{
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600'
                      }}
                    >
                      <Eye size={14} />
                      Publicar
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este rascunho?')) {
                          onDelete(analise.id!);
                        }
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600'
                      }}
                    >
                      <Trash2 size={14} />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// 🏠 COMPONENTE PRINCIPAL COM ABAS
const AdminAnalisesTrimesestrais = () => {
  const [analises, setAnalises] = useState<AnaliseTrimestreData[]>([]);
  const [activeTab, setActiveTab] = useState<'criar' | 'publicadas' | 'rascunhos'>('criar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analiseEditando, setAnaliseEditando] = useState<AnaliseTrimestreData | null>(null);

  // 📚 CARREGAR ANÁLISES DO INDEXEDDB
  useEffect(() => {
    const loadAnalises = async () => {
      try {
        console.log('🔄 Carregando análises do IndexedDB...');
        
        const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('analises')) {
            const store = db.createObjectStore('analises', { keyPath: 'id' });
            store.createIndex('ticker', 'ticker', { unique: false });
            store.createIndex('trimestre', 'trimestre', { unique: false });
            store.createIndex('dataPublicacao', 'dataPublicacao', { unique: false });
            console.log('✅ Object store "analises" criado');
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['analises'], 'readonly');
          const store = transaction.objectStore('analises');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const analisesSalvas = getAllRequest.result || [];
            console.log(`✅ ${analisesSalvas.length} análises carregadas do IndexedDB`);
            setAnalises(analisesSalvas);
            setLoading(false);
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Erro ao carregar análises do IndexedDB');
            setError('Erro ao carregar análises');
            setLoading(false);
          };
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao abrir IndexedDB');
          setError('Erro ao conectar com o banco de dados');
          setLoading(false);
        };
        
      } catch (error) {
        console.error('❌ Erro geral ao carregar análises:', error);
        setError('Erro ao carregar análises');
        setLoading(false);
      }
    };
    
    loadAnalises();
  }, []);

  // 💾 SALVAR ANÁLISE
  const saveAnalise = useCallback(async (analise: AnaliseTrimestreData) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando análise no IndexedDB...', analise);
      
      const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['analises'], 'readwrite');
        const store = transaction.objectStore('analises');
        
        // Se é uma nova análise ou edição
        const putRequest = store.put(analise);
        
        putRequest.onsuccess = () => {
          console.log('✅ Análise salva no IndexedDB');
          
          // Atualizar estado local
          setAnalises(prev => {
            const existing = prev.find(a => a.id === analise.id);
            if (existing) {
              return prev.map(a => a.id === analise.id ? analise : a);
            } else {
              return [...prev, analise];
            }
          });
          
          setAnaliseEditando(null);
        };
        
        putRequest.onerror = () => {
          throw new Error('Erro ao salvar no IndexedDB');
        };
      };
      
      request.onerror = () => {
        throw new Error('Erro ao conectar com IndexedDB');
      };
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }, []);

  // 📤 PUBLICAR ANÁLISE
  const publishAnalise = useCallback(async (id: string) => {
    const analise = analises.find(a => a.id === id);
    if (!analise) return;
    
    const analisePublicada = { ...analise, status: 'published' as const };
    await saveAnalise(analisePublicada);
  }, [analises, saveAnalise]);

  // 📥 DESPUBLICAR ANÁLISE
  const unpublishAnalise = useCallback(async (id: string) => {
    const analise = analises.find(a => a.id === id);
    if (!analise) return;
    
    const analiseRascunho = { ...analise, status: 'draft' as const };
    await saveAnalise(analiseRascunho);
  }, [analises, saveAnalise]);

  // 🗑️ DELETAR ANÁLISE
  const deleteAnalise = useCallback(async (id: string) => {
    setSaving(true);
    
    try {
      const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['analises'], 'readwrite');
        const store = transaction.objectStore('analises');
        
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          setAnalises(prev => prev.filter(a => a.id !== id));
          console.log('✅ Análise excluída');
        };
      };
      
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  // ✏️ EDITAR ANÁLISE
  const editAnalise = useCallback((analise: AnaliseTrimestreData) => {
    setAnaliseEditando(analise);
    setActiveTab('criar');
  }, []);

  const totalAnalises = analises.length;
  const analisesDraft = analises.filter(a => a.status === 'draft').length;
  const analisesPublicadas = analises.filter(a => a.status === 'published').length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Carregando análises...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Moderno */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', 
        color: 'white',
        borderBottom: '4px solid #3b82f6'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PieChart size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  Análises Trimestrais
                </h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  Central de Análises de Resultados - Fatos da Bolsa
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                  {totalAnalises}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total</div>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                minWidth: '100px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#fbbf24' }}>
                  {analisesDraft}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Rascunhos</div>
              </div>
              
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center',
                minWidth: '100px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                  {analisesPublicadas}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Publicadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Sistema de Abas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '32px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          {/* Tab Headers */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <button
              onClick={() => setActiveTab('criar')}
              style={{
                flex: 1,
                padding: '20px 24px',
                border: 'none',
                backgroundColor: activeTab === 'criar' ? 'white' : 'transparent',
                color: activeTab === 'criar' ? '#1e293b' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'criar' ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={20} />
              {analiseEditando ? 'Editar Análise' : 'Criar Análises'}
              {analiseEditando && (
                <span style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  EDITANDO
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('publicadas')}
              style={{
                flex: 1,
                padding: '20px 24px',
                border: 'none',
                backgroundColor: activeTab === 'publicadas' ? 'white' : 'transparent',
                color: activeTab === 'publicadas' ? '#1e293b' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'publicadas' ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Eye size={20} />
              Publicadas ({analisesPublicadas})
            </button>
            
            <button
              onClick={() => setActiveTab('rascunhos')}
              style={{
                flex: 1,
                padding: '20px 24px',
                border: 'none',
                backgroundColor: activeTab === 'rascunhos' ? 'white' : 'transparent',
                color: activeTab === 'rascunhos' ? '#1e293b' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'rascunhos' ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileText size={20} />
              Rascunhos ({analisesDraft})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {activeTab === 'criar' && (
              analiseEditando ? (
                <div>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '16px', fontWeight: '600' }}>
                      ✏️ Editando Análise
                    </h4>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                      Você está editando: <strong>{analiseEditando.titulo || analiseEditando.ticker}</strong>
                    </p>
                    <button
                      onClick={() => setAnaliseEditando(null)}
                      style={{
                        marginTop: '12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar Edição
                    </button>
                  </div>
                  <CriarAnaliseForm onSave={saveAnalise} />
                </div>
              ) : (
                <CriarAnaliseForm onSave={saveAnalise} />
              )
            )}
            
            {activeTab === 'publicadas' && (
              <AnalisesPublicadas 
                analises={analises}
                onEdit={editAnalise}
                onUnpublish={unpublishAnalise}
                onDelete={deleteAnalise}
              />
            )}
            
            {activeTab === 'rascunhos' && (
              <RascunhosAnalises 
                analises={analises}
                onEdit={editAnalise}
                onPublish={publishAnalise}
                onDelete={deleteAnalise}
              />
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        {/* Instrução Final */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #7dd3fc'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0c4a6e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} />
            Sistema de Análises Trimestrais
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                ✨ Criar
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Formulário limpo para novas análises</li>
                <li>Rich Text Editor com imagens</li>
                <li>Métricas financeiras detalhadas</li>
                <li>Salva automaticamente como rascunho</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                📋 Publicadas
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Todas as análises já publicadas</li>
                <li>Opção de editar análises publicadas</li>
                <li>Despublicar (volta para rascunho)</li>
                <li>Filtros por ticker e trimestre</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                📝 Rascunhos
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Análises ainda não publicadas</li>
                <li>Continuar editando antes de publicar</li>
                <li>Publicar quando estiver pronto</li>
                <li>Excluir rascunhos desnecessários</li>
              </ul>
            </div>
          </div>
          
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            border: '1px solid #93c5fd'
          }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>
              💡 <strong>Novo Fluxo:</strong> Crie → Edite nos Rascunhos → Publique → Gerencie nas Publicadas. 
              Análises publicadas aparecem automaticamente nas páginas dos ativos correspondentes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalisesTrimesestrais;