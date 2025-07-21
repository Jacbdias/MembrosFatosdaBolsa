'use client';

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Palette, ExternalLink, PieChart, Activity, Image, Upload } from 'lucide-react';

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

// Rich Text Editor Component (copiado do sistema existente)
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

  // Atualizar o conteúdo do editor quando o value mudar
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Verificar formatação atual
  const updateFormatState = useCallback(() => {
    if (!editorRef.current) return;
    
    setCurrentFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikeThrough')
    });
  }, []);

  // Executar comando de formatação
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateFormatState();
    
    // Disparar onChange
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, updateFormatState]);

  // Inserir link
  const insertLink = useCallback(() => {
    const url = prompt('Digite a URL do link:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  // 🖼️ INSERIR IMAGEM POR URL
  const insertImageByUrl = useCallback(() => {
    console.log('🖼️ Função insertImageByUrl chamada');
    const url = prompt('Digite a URL da imagem:');
    if (url) {
      console.log('🔗 URL fornecida:', url);
      // Validar se é uma URL válida
      try {
        new URL(url);
        console.log('✅ URL válida, inserindo imagem...');
        execCommand('insertImage', url);
        
        // Adicionar estilos à imagem inserida
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
              console.log('🎨 Estilos aplicados à imagem');
            }
          }
        }, 100);
      } catch (error) {
        console.error('❌ URL inválida:', error);
        alert('URL inválida. Por favor, digite uma URL válida.');
      }
    } else {
      console.log('❌ Nenhuma URL fornecida');
    }
  }, [execCommand]);

  // 📤 UPLOAD DE IMAGEM
  const uploadImage = useCallback(() => {
    console.log('📤 Função uploadImage chamada');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      console.log('📁 Arquivo selecionado');
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('📊 Arquivo:', file.name, file.size, file.type);
        
        // Verificar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          console.error('❌ Arquivo muito grande:', file.size);
          alert('Arquivo muito grande. Máximo 5MB permitido.');
          return;
        }
        
        // Verificar tipo
        if (!file.type.startsWith('image/')) {
          console.error('❌ Tipo inválido:', file.type);
          alert('Por favor, selecione apenas arquivos de imagem.');
          return;
        }
        
        console.log('✅ Arquivo válido, convertendo para Base64...');
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64) {
            console.log('🔧 Base64 gerado, inserindo imagem...');
            // Inserir imagem como Base64
            execCommand('insertImage', base64);
            
            // Adicionar estilos à imagem inserida
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
                  console.log('🎨 Estilos aplicados à imagem uploadada');
                }
              }
            }, 100);
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.log('❌ Nenhum arquivo selecionado');
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [execCommand]);

  // Alterar cor do texto
  const changeTextColor = useCallback((color: string) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  // Alterar tamanho da fonte
  const changeFontSize = useCallback((size: string) => {
    execCommand('fontSize', size);
  }, [execCommand]);

  // Lidar com mudanças no editor
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateFormatState();
  }, [onChange, updateFormatState]);

  // Lidar com foco
  const handleFocus = useCallback(() => {
    setIsEditorFocused(true);
    updateFormatState();
  }, [updateFormatState]);

  const handleBlur = useCallback(() => {
    setIsEditorFocused(false);
  }, []);

  // Prevenir comportamento padrão em alguns casos
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Atalhos de teclado
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

        {/* 🖼️ BOTÕES DE IMAGEM - DESTACADOS */}
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

// Componente AnaliseCard isolado
const AnaliseCard = memo(({ 
  analise, 
  onUpdate, 
  onRemove 
}: { 
  analise: AnaliseTrimestreData;
  onUpdate: (id: string, field: keyof AnaliseTrimestreData, value: any) => void;
  onRemove: (id: string) => void;
}) => {
  // Handlers estáveis para cada campo específico
  const updateTicker = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'ticker', e.target.value.toUpperCase());
  }, [analise.id, onUpdate]);

  const updateEmpresa = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'empresa', e.target.value);
  }, [analise.id, onUpdate]);

  const updateTrimestre = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'trimestre', e.target.value.toUpperCase());
  }, [analise.id, onUpdate]);

  const updateCategoria = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(analise.id!, 'categoria', e.target.value as AnaliseTrimestreData['categoria']);
  }, [analise.id, onUpdate]);

  const updateTitulo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'titulo', e.target.value);
  }, [analise.id, onUpdate]);

  const updateResumoExecutivo = useCallback((value: string) => {
    onUpdate(analise.id!, 'resumoExecutivo', value);
  }, [analise.id, onUpdate]);

  const updateAnaliseCompleta = useCallback((value: string) => {
    onUpdate(analise.id!, 'analiseCompleta', value);
  }, [analise.id, onUpdate]);

  const updatePontosFavoraveis = useCallback((value: string) => {
    onUpdate(analise.id!, 'pontosFavoraveis', value);
  }, [analise.id, onUpdate]);

  const updatePontosAtencao = useCallback((value: string) => {
    onUpdate(analise.id!, 'pontosAtencao', value);
  }, [analise.id, onUpdate]);

  const updateRecomendacao = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(analise.id!, 'recomendacao', e.target.value as AnaliseTrimestreData['recomendacao']);
  }, [analise.id, onUpdate]);

  const updateRisco = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate(analise.id!, 'risco', e.target.value as AnaliseTrimestreData['risco']);
  }, [analise.id, onUpdate]);

  const updatePrecoAlvo = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseFloat(e.target.value);
    onUpdate(analise.id!, 'precoAlvo', isNaN(valor) ? undefined : valor);
  }, [analise.id, onUpdate]);

  const updateLinkResultado = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'linkResultado', e.target.value);
  }, [analise.id, onUpdate]);

  const updateLinkConferencia = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'linkConferencia', e.target.value);
  }, [analise.id, onUpdate]);

  const updateDataPublicacao = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'dataPublicacao', e.target.value);
  }, [analise.id, onUpdate]);

  const updateAutor = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(analise.id!, 'autor', e.target.value);
  }, [analise.id, onUpdate]);

  // Handlers para métricas
  const updateMetrica = useCallback((metrica: keyof AnaliseTrimestreData['metricas'], campo: keyof MetricaTrimestreData, valor: any) => {
    const metricasAtuais = { ...analise.metricas };
    if (!metricasAtuais[metrica]) {
      metricasAtuais[metrica] = { valor: 0, unidade: 'milhões' };
    }
    metricasAtuais[metrica]![campo] = valor;
    onUpdate(analise.id!, 'metricas', metricasAtuais);
  }, [analise.id, analise.metricas, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(analise.id!);
  }, [analise.id, onRemove]);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '32px',
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <h4 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
          📊 Análise Trimestral
        </h4>
        <button
          onClick={handleRemove}
          style={{ 
            color: '#dc2626', 
            background: 'rgba(220, 38, 38, 0.1)', 
            border: 'none', 
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Remover análise"
        >
          <Trash2 size={16} />
        </button>
      </div>

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
                Ticker
              </label>
              <input
                type="text"
                value={analise.ticker}
                onChange={updateTicker}
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
                Empresa
              </label>
              <input
                type="text"
                value={analise.empresa}
                onChange={updateEmpresa}
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
                onChange={updateTrimestre}
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
                onChange={updateCategoria}
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
                onChange={updateDataPublicacao}
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
                onChange={updateAutor}
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
                Título da Análise
              </label>
              <input
                type="text"
                value={analise.titulo}
                onChange={updateTitulo}
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
                onChange={updateResumoExecutivo}
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
                onChange={updateAnaliseCompleta}
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
                onChange={updatePontosFavoraveis}
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
                onChange={updatePontosAtencao}
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
                onChange={updateRecomendacao}
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
                onChange={updatePrecoAlvo}
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
                onChange={updateRisco}
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
                onChange={updateLinkResultado}
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
                onChange={updateLinkConferencia}
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

const AdminAnalisesTrimesestrais = () => {
  const [analises, setAnalises] = useState<AnaliseTrimestreData[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 📚 CARREGAR ANÁLISES EXISTENTES DO INDEXEDDB
  useEffect(() => {
    const loadAnalises = async () => {
      try {
        console.log('🔄 Carregando análises do IndexedDB...');
        
        // Abrir conexão com IndexedDB
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
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Erro ao carregar análises do IndexedDB');
            setError('Erro ao carregar análises');
          };
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao abrir IndexedDB');
          setError('Erro ao conectar com o banco de dados');
        };
        
      } catch (error) {
        console.error('❌ Erro geral ao carregar análises:', error);
        setError('Erro ao carregar análises');
      }
    };
    
    loadAnalises();
  }, []);

  // Handler principal para atualizar análise
  const updateAnalise = useCallback((id: string, field: keyof AnaliseTrimestreData, value: any) => {
    setAnalises(prev => prev.map(analise => 
      analise.id === id ? { ...analise, [field]: value } : analise
    ));
  }, []);

  // Remover análise
  const removeAnalise = useCallback((id: string) => {
    setAnalises(prev => prev.filter(analise => analise.id !== id));
  }, []);

  // Adicionar nova análise
  const addAnalise = useCallback(() => {
    const newAnalise: AnaliseTrimestreData = {
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
    };
    setAnalises(prev => [...prev, newAnalise]);
  }, []);

  // 💾 SALVAR ANÁLISES NO INDEXEDDB
  const saveAnalises = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando análises no IndexedDB...', analises);
      
      const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['analises'], 'readwrite');
        const store = transaction.objectStore('analises');
        
        // Limpar store existente
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Adicionar todas as análises
          analises.forEach(analise => {
            store.add(analise);
          });
          
          console.log('✅ Análises salvas no IndexedDB');
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        };
        
        clearRequest.onerror = () => {
          throw new Error('Erro ao limpar dados existentes');
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
  };

  // 📤 PUBLICAR ANÁLISES
  const publishAnalises = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('📤 Publicando análises...');
      
      const analisePublicadas = analises.map(analise => ({
        ...analise,
        status: 'published' as const
      }));
      
      // Salvar com status publicado
      const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['analises'], 'readwrite');
        const store = transaction.objectStore('analises');
        
        // Limpar store existente
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Adicionar todas as análises publicadas
          analisePublicadas.forEach(analise => {
            store.add(analise);
          });
          
          setAnalises(analisePublicadas);
          console.log('✅ Análises publicadas com sucesso');
          alert('✅ Análises publicadas com sucesso!');
        };
      };
      
    } catch (error) {
      console.error('❌ Erro ao publicar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao publicar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const totalAnalises = analises.length;
  const analisesDraft = analises.filter(a => a.status === 'draft').length;
  const analisesPublicadas = analises.filter(a => a.status === 'published').length;

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
                  Painel de Análises de Resultados - Fatos da Bolsa
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
        {/* Action Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
              Gerenciar Análises Trimestrais
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
                onClick={addAnalise}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Plus size={16} />
                Nova Análise
              </button>
              
              <button
                onClick={saveAnalises}
                disabled={saving}
                style={{
                  backgroundColor: '#059669',
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
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar Tudo'}
              </button>
              
              <button
                onClick={publishAnalises}
                disabled={saving}
                style={{
                  backgroundColor: '#dc2626',
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
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
                }}
              >
                <Eye size={16} />
                Publicar Todas
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Análises */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {analises.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '64px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                Nenhuma Análise Criada
              </h3>
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
                Comece criando sua primeira análise trimestral clicando no botão "Nova Análise" acima.
              </p>
              <button
                onClick={addAnalise}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Plus size={20} />
                Criar Primeira Análise
              </button>
            </div>
          ) : (
            analises.map((analise) => (
              <AnaliseCard 
                key={analise.id} 
                analise={analise} 
                onUpdate={updateAnalise} 
                onRemove={removeAnalise} 
              />
            ))
          )}
        </div>

        {/* Estatísticas */}
        {analises.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '32px',
            marginTop: '32px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '24px' }}>
              📈 Estatísticas das Análises
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>
                  {totalAnalises}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Total de Análises</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fefce8', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>
                  {analisesDraft}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Em Rascunho</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#22c55e', marginBottom: '8px' }}>
                  {analisesPublicadas}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Publicadas</div>
              </div>
              
              <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#0ea5e9', marginBottom: '8px' }}>
                  {new Set(analises.map(a => a.ticker)).size}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Ativos Únicos</div>
              </div>
            </div>
            
            {/* Últimas análises por ticker */}
            <div style={{ marginTop: '32px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                📊 Análises por Ativo
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {Object.entries(
                  analises.reduce((acc, analise) => {
                    if (!analise.ticker) return acc;
                    if (!acc[analise.ticker]) {
                      acc[analise.ticker] = [];
                    }
                    acc[analise.ticker].push(analise);
                    return acc;
                  }, {} as Record<string, AnaliseTrimestreData[]>)
                ).map(([ticker, analisesDoTicker]) => (
                  <div key={ticker} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                        {ticker}
                      </h5>
                      <span style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {analisesDoTicker.length} análise{analisesDoTicker.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Empresa:</strong> {analisesDoTicker[0]?.empresa || 'N/A'}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Último trimestre:</strong> {analisesDoTicker
                          .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())[0]
                          ?.trimestre || 'N/A'}
                      </div>
                      <div>
                        <strong>Última recomendação:</strong> 
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: (() => {
                            const ultimaRec = analisesDoTicker
                              .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())[0]
                              ?.recomendacao;
                            switch (ultimaRec) {
                              case 'COMPRA': return '#dcfce7';
                              case 'VENDA': return '#fef2f2';
                              default: return '#fef3c7';
                            }
                          })(),
                          color: (() => {
                            const ultimaRec = analisesDoTicker
                              .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())[0]
                              ?.recomendacao;
                            switch (ultimaRec) {
                              case 'COMPRA': return '#166534';
                              case 'VENDA': return '#dc2626';
                              default: return '#92400e';
                            }
                          })()
                        }}>
                          {analisesDoTicker
                            .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())[0]
                            ?.recomendacao || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instruções de Uso */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '16px',
          padding: '32px',
          marginTop: '32px',
          border: '1px solid #7dd3fc'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#0c4a6e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} />
            Como Usar o Sistema de Análises
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                📝 1. Criar Análise
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Clique em "Nova Análise" para adicionar uma análise</li>
                <li>Preencha ticker, empresa e trimestre</li>
                <li>Use o Rich Text Editor para formatação avançada</li>
                <li>Adicione métricas financeiras do período</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                💾 2. Salvar e Gerenciar
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Salve como rascunho para continuar editando</li>
                <li>Todas as análises ficam no IndexedDB</li>
                <li>Edite métricas, textos e recomendações</li>
                <li>Remova análises que não precisar mais</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>
                🚀 3. Publicar
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Publique todas as análises de uma vez</li>
                <li>Análises publicadas aparecem na página do ativo</li>
                <li>Sistema filtra automaticamente por ticker</li>
                <li>Histórico completo de todas as análises</li>
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
              💡 <strong>Dica:</strong> As análises serão exibidas automaticamente na página de cada ativo, 
              organizadas por trimestre e data de publicação. Use o Rich Text Editor para criar análises 
              visualmente atrativas com formatação profissional.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalisesTrimesestrais;