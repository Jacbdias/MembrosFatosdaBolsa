'use client';

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Palette, ExternalLink, PieChart, Activity, Image, Upload, Edit, Archive, Search, Filter } from 'lucide-react';

// Interfaces para Relatório Semanal
interface ItemRelatorioSemanal {
  ticker: string;
  empresa: string;
  titulo: string;
  resumo: string;
  analise: string;
  recomendacao?: 'COMPRA' | 'VENDA' | 'MANTER';
  impacto?: 'positivo' | 'negativo' | 'neutro';
  precoAlvo?: number;
  destaque?: string;
}

interface ProventoItem {
  ticker: string;
  empresa: string;
  tipo: 'Dividendo' | 'JCP' | 'Bonificação';
  valor: string;
  dy: string;
  datacom: string;
  pagamento: string;
}

interface RelatorioSemanalData {
  id?: string;
  semana: string; // Ex: "2025-W03" (3ª semana de 2025)
  dataPublicacao: string;
  autor: string;
  titulo: string;
  
  // Seções do relatório
  macro: ItemRelatorioSemanal[];
  proventos: ProventoItem[];
  dividendos: ItemRelatorioSemanal[];
  smallCaps: ItemRelatorioSemanal[];
  microCaps: ItemRelatorioSemanal[];
  exterior: ItemRelatorioSemanal[];
  
  status: 'draft' | 'published';
}

// Rich Text Editor Component (mesmo da página anterior)
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

  return (
    <div style={{
      border: `2px solid ${isEditorFocused ? '#2563eb' : '#e5e7eb'}`,
      borderRadius: '12px',
      backgroundColor: 'white',
      transition: 'border-color 0.2s',
      ...style
    }}>
      {/* Toolbar simplificada */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '12px 12px 0 0'
      }}>
        <button
          onClick={() => execCommand('bold')}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: currentFormat.bold ? '#2563eb' : 'transparent',
            color: currentFormat.bold ? 'white' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          <Bold size={14} />
        </button>
        <button
          onClick={() => execCommand('italic')}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: currentFormat.italic ? '#2563eb' : 'transparent',
            color: currentFormat.italic ? 'white' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          <Italic size={14} />
        </button>
        <button
          onClick={() => execCommand('insertUnorderedList')}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer'
          }}
        >
          <List size={14} />
        </button>
        <button
          onClick={insertLink}
          style={{
            padding: '6px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer'
          }}
        >
          <Link size={14} />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          padding: '12px',
          minHeight: minHeight,
          outline: 'none',
          lineHeight: '1.5',
          fontSize: '14px',
          color: '#1f2937',
          borderRadius: '0 0 12px 12px'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

// Utilitário para gerar número da semana
const getWeekNumber = (date: Date): string => {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.ceil(diff / oneWeek);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Componente para criar item de seção
const ItemEditor = memo(({ 
  item, 
  onUpdate, 
  onRemove,
  secaoNome 
}: { 
  item: ItemRelatorioSemanal | ProventoItem;
  onUpdate: (item: any) => void;
  onRemove: () => void;
  secaoNome: string;
}) => {
  const isProvento = 'tipo' in item;

  if (isProvento) {
    const provento = item as ProventoItem;
    return (
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '16px',
        backgroundColor: '#fefce8',
        position: 'relative'
      }}>
        <button
          onClick={onRemove}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Trash2 size={12} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <input
            placeholder="Ticker"
            value={provento.ticker}
            onChange={(e) => onUpdate({ ...provento, ticker: e.target.value.toUpperCase() })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
          <input
            placeholder="Empresa"
            value={provento.empresa}
            onChange={(e) => onUpdate({ ...provento, empresa: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
          <select
            value={provento.tipo}
            onChange={(e) => onUpdate({ ...provento, tipo: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          >
            <option value="Dividendo">Dividendo</option>
            <option value="JCP">JCP</option>
            <option value="Bonificação">Bonificação</option>
          </select>
          <input
            placeholder="Valor (R$ 0,50)"
            value={provento.valor}
            onChange={(e) => onUpdate({ ...provento, valor: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
          <input
            placeholder="DY (5,2%)"
            value={provento.dy}
            onChange={(e) => onUpdate({ ...provento, dy: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
          <input
            type="date"
            placeholder="Data-com"
            value={provento.datacom}
            onChange={(e) => onUpdate({ ...provento, datacom: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
          <input
            type="date"
            placeholder="Pagamento"
            value={provento.pagamento}
            onChange={(e) => onUpdate({ ...provento, pagamento: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    );
  }

  const itemNormal = item as ItemRelatorioSemanal;
  
  return (
    <div style={{
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      padding: '16px',
      backgroundColor: 'white',
      position: 'relative'
    }}>
      <button
        onClick={onRemove}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Trash2 size={12} />
      </button>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            placeholder="Ticker"
            value={itemNormal.ticker}
            onChange={(e) => onUpdate({ ...itemNormal, ticker: e.target.value.toUpperCase() })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          />
          <input
            placeholder="Empresa"
            value={itemNormal.empresa}
            onChange={(e) => onUpdate({ ...itemNormal, empresa: e.target.value })}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '14px'
            }}
          />
        </div>

        <input
          placeholder="Título da notícia/análise"
          value={itemNormal.titulo}
          onChange={(e) => onUpdate({ ...itemNormal, titulo: e.target.value })}
          style={{
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '14px'
          }}
        />

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Resumo/Destaque
          </label>
          <RichTextEditor
            value={itemNormal.resumo}
            onChange={(value) => onUpdate({ ...itemNormal, resumo: value })}
            placeholder="Resumo dos principais pontos..."
            minHeight="80px"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
            Análise Completa
          </label>
          <RichTextEditor
            value={itemNormal.analise}
            onChange={(value) => onUpdate({ ...itemNormal, analise: value })}
            placeholder="Análise detalhada..."
            minHeight="100px"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Recomendação
            </label>
            <select
              value={itemNormal.recomendacao || ''}
              onChange={(e) => onUpdate({ ...itemNormal, recomendacao: e.target.value || undefined })}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione</option>
              <option value="COMPRA">🟢 COMPRA</option>
              <option value="MANTER">🟡 MANTER</option>
              <option value="VENDA">🔴 VENDA</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Impacto
            </label>
            <select
              value={itemNormal.impacto || ''}
              onChange={(e) => onUpdate({ ...itemNormal, impacto: e.target.value || undefined })}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione</option>
              <option value="positivo">📈 Positivo</option>
              <option value="neutro">➖ Neutro</option>
              <option value="negativo">📉 Negativo</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Preço Alvo (R$)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="25.50"
              value={itemNormal.precoAlvo || ''}
              onChange={(e) => onUpdate({ ...itemNormal, precoAlvo: parseFloat(e.target.value) || undefined })}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {itemNormal.destaque && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Destaque Especial
            </label>
            <RichTextEditor
              value={itemNormal.destaque}
              onChange={(value) => onUpdate({ ...itemNormal, destaque: value })}
              placeholder="Destaque especial ou observação importante..."
              minHeight="60px"
            />
          </div>
        )}
      </div>
    </div>
  );
});

// Componente para seção do relatório
const SecaoEditor = memo(({ 
  titulo, 
  items, 
  onAddItem, 
  onUpdateItem, 
  onRemoveItem,
  cor,
  icone: Icone,
  isProvento = false
}: {
  titulo: string;
  items: any[];
  onAddItem: () => void;
  onUpdateItem: (index: number, item: any) => void;
  onRemoveItem: (index: number) => void;
  cor: string;
  icone: any;
  isProvento?: boolean;
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: cor,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Icone size={20} />
          {titulo} ({items.length})
        </h4>
        
        <button
          onClick={onAddItem}
          style={{
            backgroundColor: cor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '600'
          }}
        >
          <Plus size={14} />
          Adicionar
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {items.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#64748b',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}>
            <Icone size={32} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
            <p style={{ margin: 0, fontSize: '14px' }}>
              Nenhum item adicionado ainda.
              <br />
              Clique em "Adicionar" para começar.
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <ItemEditor
              key={index}
              item={item}
              onUpdate={(updatedItem) => onUpdateItem(index, updatedItem)}
              onRemove={() => onRemoveItem(index)}
              secaoNome={titulo}
            />
          ))
        )}
      </div>
    </div>
  );
});

// 🎯 COMPONENTE DE CRIAÇÃO DE RELATÓRIO
const CriarRelatorioForm = memo(({ 
  onSave,
  relatorioEditando 
}: { 
  onSave: (relatorio: RelatorioSemanalData) => void;
  relatorioEditando?: RelatorioSemanalData | null;
}) => {
  const [relatorio, setRelatorio] = useState<RelatorioSemanalData>(() => {
    if (relatorioEditando) {
      return relatorioEditando;
    }
    
    const hoje = new Date();
    return {
      id: Date.now().toString(),
      semana: getWeekNumber(hoje),
      dataPublicacao: hoje.toISOString().split('T')[0],
      autor: '',
      titulo: '',
      macro: [],
      proventos: [],
      dividendos: [],
      smallCaps: [],
      microCaps: [],
      exterior: [],
      status: 'draft'
    };
  });

  const [salvando, setSalvando] = useState(false);

  // Atualizar quando relatorioEditando mudar
  useEffect(() => {
    if (relatorioEditando) {
      setRelatorio(relatorioEditando);
    }
  }, [relatorioEditando]);

  const updateField = useCallback((field: keyof RelatorioSemanalData, value: any) => {
    setRelatorio(prev => ({ ...prev, [field]: value }));
  }, []);

  const addItem = useCallback((secao: keyof Pick<RelatorioSemanalData, 'macro' | 'proventos' | 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior'>) => {
    setRelatorio(prev => {
      const newItem = secao === 'proventos' 
        ? { ticker: '', empresa: '', tipo: 'Dividendo', valor: '', dy: '', datacom: '', pagamento: '' }
        : { ticker: '', empresa: '', titulo: '', resumo: '', analise: '' };
      
      return {
        ...prev,
        [secao]: [...(prev[secao] as any[]), newItem]
      };
    });
  }, []);

  const updateItem = useCallback((secao: keyof Pick<RelatorioSemanalData, 'macro' | 'proventos' | 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior'>, index: number, item: any) => {
    setRelatorio(prev => ({
      ...prev,
      [secao]: (prev[secao] as any[]).map((existing, i) => i === index ? item : existing)
    }));
  }, []);

  const removeItem = useCallback((secao: keyof Pick<RelatorioSemanalData, 'macro' | 'proventos' | 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior'>, index: number) => {
    setRelatorio(prev => ({
      ...prev,
      [secao]: (prev[secao] as any[]).filter((_, i) => i !== index)
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setSalvando(true);
    
    try {
      // Validações básicas
      if (!relatorio.semana || !relatorio.titulo) {
        alert('Por favor, preencha pelo menos a Semana e o Título.');
        return;
      }
      
      await onSave(relatorio);
      
      // Limpar formulário apenas se não estiver editando
      if (!relatorioEditando) {
        const hoje = new Date();
        setRelatorio({
          id: Date.now().toString(),
          semana: getWeekNumber(hoje),
          dataPublicacao: hoje.toISOString().split('T')[0],
          autor: '',
          titulo: '',
          macro: [],
          proventos: [],
          dividendos: [],
          smallCaps: [],
          microCaps: [],
          exterior: [],
          status: 'draft'
        });
      }
      
      alert('✅ Relatório salvo com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar relatório');
    } finally {
      setSalvando(false);
    }
  }, [relatorio, onSave, relatorioEditando]);

  const secoes = [
    { key: 'macro' as const, titulo: 'Panorama Macro', cor: '#2563eb', icone: Globe },
    { key: 'proventos' as const, titulo: 'Proventos', cor: '#4cfa00', icone: DollarSign, isProvento: true },
    { key: 'dividendos' as const, titulo: 'Dividendos', cor: '#22c55e', icone: Calendar },
    { key: 'smallCaps' as const, titulo: 'Small Caps', cor: '#2563eb', icone: Building },
    { key: 'microCaps' as const, titulo: 'Micro Caps', cor: '#ea580c', icone: Zap },
    { key: 'exterior' as const, titulo: 'Exterior', cor: '#7c3aed', icone: TrendingUp }
  ];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Header com botão salvar */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' }}>
            {relatorioEditando ? '✏️ Editando Relatório' : '✨ Criar Novo Relatório'}
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Relatório semanal organizado por seções
          </p>
        </div>
        
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
          {salvando ? 'Salvando...' : 'Salvar Relatório'}
        </button>
      </div>

      {/* Informações básicas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Informações Básicas
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Semana *
            </label>
            <input
              type="text"
              value={relatorio.semana}
              onChange={(e) => updateField('semana', e.target.value)}
              placeholder="2025-W03"
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '14px',
                boxSizing: 'border-box',
                fontWeight: '600'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Data de Publicação
            </label>
            <input
              type="date"
              value={relatorio.dataPublicacao}
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
              value={relatorio.autor}
              onChange={(e) => updateField('autor', e.target.value)}
              placeholder="Seu Nome"
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
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            Título do Relatório *
          </label>
          <input
            type="text"
            value={relatorio.titulo}
            onChange={(e) => updateField('titulo', e.target.value)}
            placeholder="Relatório Semanal - 3ª Semana de Janeiro de 2025"
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
      </div>

      {/* Seções do relatório */}
      {secoes.map((secao) => (
        <SecaoEditor
          key={secao.key}
          titulo={secao.titulo}
          items={relatorio[secao.key]}
          onAddItem={() => addItem(secao.key)}
          onUpdateItem={(index, item) => updateItem(secao.key, index, item)}
          onRemoveItem={(index) => removeItem(secao.key, index)}
          cor={secao.cor}
          icone={secao.icone}
          isProvento={secao.isProvento}
        />
      ))}
    </div>
  );
});

// 📋 COMPONENTE DE RELATÓRIOS PUBLICADOS
const RelatoriosPublicados = memo(({ 
  relatorios, 
  onEdit, 
  onUnpublish,
  onDelete 
}: { 
  relatorios: RelatorioSemanalData[];
  onEdit: (relatorio: RelatorioSemanalData) => void;
  onUnpublish: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [filtroSemana, setFiltroSemana] = useState('');

  const relatoriosPublicados = relatorios.filter(r => r.status === 'published');
  
  const relatoriosFiltrados = relatoriosPublicados.filter(relatorio => {
    return !filtroSemana || relatorio.semana.toLowerCase().includes(filtroSemana.toLowerCase());
  });

  // Agrupar por semana e ordenar
  const relatoriosPorSemana = relatoriosFiltrados
    .sort((a, b) => b.semana.localeCompare(a.semana))
    .reduce((acc, relatorio) => {
      if (!acc[relatorio.semana]) {
        acc[relatorio.semana] = [];
      }
      acc[relatorio.semana].push(relatorio);
      return acc;
    }, {} as Record<string, RelatorioSemanalData[]>);

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
              Filtrar por Semana
            </label>
            <input
              type="text"
              value={filtroSemana}
              onChange={(e) => setFiltroSemana(e.target.value)}
              placeholder="Ex: 2025-W03"
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
              onClick={() => setFiltroSemana('')}
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
          Mostrando {relatoriosFiltrados.length} de {relatoriosPublicados.length} relatórios publicados
        </div>
      </div>

      {/* Lista de Relatórios */}
      {relatoriosFiltrados.length === 0 ? (
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
            {relatoriosPublicados.length === 0 ? 'Nenhum Relatório Publicado' : 'Nenhum relatório corresponde aos filtros'}
          </h3>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>
            {relatoriosPublicados.length === 0 
              ? 'Publique seus primeiros relatórios para vê-los aqui.'
              : 'Tente ajustar os filtros para encontrar os relatórios desejados.'
            }
          </p>
        </div>
      ) : (
        Object.entries(relatoriosPorSemana).map(([semana, relatoriosDaSemana]) => (
          <div key={semana} style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Header da semana */}
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
                  Semana {semana}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  {relatoriosDaSemana.length} relatório{relatoriosDaSemana.length > 1 ? 's' : ''}
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
                📅 {semana}
              </div>
            </div>

            {/* Grid de relatórios */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {relatoriosDaSemana.map((relatorio) => {
                const totalItens = relatorio.macro.length + relatorio.proventos.length + 
                  relatorio.dividendos.length + relatorio.smallCaps.length + 
                  relatorio.microCaps.length + relatorio.exterior.length;

                return (
                  <div key={relatorio.id} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                          {relatorio.titulo}
                        </h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                          <span>📅 {new Date(relatorio.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                          <span>✍️ {relatorio.autor}</span>
                          <span>📊 {totalItens} itens</span>
                        </div>

                        {/* Resumo das seções */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          flexWrap: 'wrap',
                          marginTop: '12px'
                        }}>
                          {relatorio.macro.length > 0 && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              Macro: {relatorio.macro.length}
                            </span>
                          )}
                          
                          {relatorio.proventos.length > 0 && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              Proventos: {relatorio.proventos.length}
                            </span>
                          )}

                          {relatorio.smallCaps.length > 0 && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              Small Caps: {relatorio.smallCaps.length}
                            </span>
                          )}

                          {relatorio.exterior.length > 0 && (
                            <span style={{ 
                              fontSize: '12px',
                              backgroundColor: '#faf5ff',
                              color: '#7c2d12',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontWeight: '600'
                            }}>
                              Exterior: {relatorio.exterior.length}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ 
                        textAlign: 'right',
                        minWidth: '150px',
                        marginLeft: '20px'
                      }}>
                        {/* Botões de ação */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => onEdit(relatorio)}
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
                            title="Editar relatório"
                          >
                            <Edit size={14} />
                            Editar
                          </button>
                          
                          <button
                            onClick={() => onUnpublish(relatorio.id!)}
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
                              if (confirm('Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita.')) {
                                onDelete(relatorio.id!);
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
                            title="Excluir relatório"
                          >
                            <Trash2 size={14} />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
});

// 📝 COMPONENTE DE RASCUNHOS
const RascunhosRelatorios = memo(({ 
  relatorios, 
  onEdit, 
  onPublish,
  onDelete 
}: { 
  relatorios: RelatorioSemanalData[];
  onEdit: (relatorio: RelatorioSemanalData) => void;
  onPublish: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const rascunhos = relatorios.filter(r => r.status === 'draft');

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
            {rascunhos.map((relatorio) => {
              const totalItens = relatorio.macro.length + relatorio.proventos.length + 
                relatorio.dividendos.length + relatorio.smallCaps.length + 
                relatorio.microCaps.length + relatorio.exterior.length;

              return (
                <div key={relatorio.id} style={{
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fefce8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: 0 }}>
                          {relatorio.titulo || 'Título não definido'}
                        </h4>
                        <span style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {relatorio.semana}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                        {relatorio.autor || 'Autor não definido'} • {totalItens} itens
                      </div>
                      
                      <div style={{ fontSize: '12px', color: '#a16207' }}>
                        Criado em: {new Date(relatorio.dataPublicacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onEdit(relatorio)}
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
                        onClick={() => onPublish(relatorio.id!)}
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
                            onDelete(relatorio.id!);
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

// 🏠 COMPONENTE PRINCIPAL
const AdminRelatorioSemanal = () => {
  const [relatorios, setRelatorios] = useState<RelatorioSemanalData[]>([]);
  const [activeTab, setActiveTab] = useState<'criar' | 'publicados' | 'rascunhos'>('criar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatorioEditando, setRelatorioEditando] = useState<RelatorioSemanalData | null>(null);

  // 📚 CARREGAR RELATÓRIOS DO INDEXEDDB
  useEffect(() => {
    const loadRelatorios = async () => {
      try {
        console.log('🔄 Carregando relatórios semanais do IndexedDB...');
        
        const request = indexedDB.open('RelatoriosSemanaisDB', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('relatorios')) {
            const store = db.createObjectStore('relatorios', { keyPath: 'id' });
            store.createIndex('semana', 'semana', { unique: false });
            store.createIndex('dataPublicacao', 'dataPublicacao', { unique: false });
            store.createIndex('status', 'status', { unique: false });
            console.log('✅ Object store "relatorios" criado');
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['relatorios'], 'readonly');
          const store = transaction.objectStore('relatorios');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const relatoriosSalvos = getAllRequest.result || [];
            console.log(`✅ ${relatoriosSalvos.length} relatórios carregados do IndexedDB`);
            setRelatorios(relatoriosSalvos);
            setLoading(false);
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Erro ao carregar relatórios do IndexedDB');
            setError('Erro ao carregar relatórios');
            setLoading(false);
          };
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao abrir IndexedDB');
          setError('Erro ao conectar com o banco de dados');
          setLoading(false);
        };
        
      } catch (error) {
        console.error('❌ Erro geral ao carregar relatórios:', error);
        setError('Erro ao carregar relatórios');
        setLoading(false);
      }
    };
    
    loadRelatorios();
  }, []);

  // 💾 SALVAR RELATÓRIO
  const saveRelatorio = useCallback(async (relatorio: RelatorioSemanalData) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando relatório no IndexedDB...', relatorio);
      
      const request = indexedDB.open('RelatoriosSemanaisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['relatorios'], 'readwrite');
        const store = transaction.objectStore('relatorios');
        
        const putRequest = store.put(relatorio);
        
        putRequest.onsuccess = () => {
          console.log('✅ Relatório salvo no IndexedDB');
          
          // Atualizar estado local
          setRelatorios(prev => {
            const existing = prev.find(r => r.id === relatorio.id);
            if (existing) {
              return prev.map(r => r.id === relatorio.id ? relatorio : r);
            } else {
              return [...prev, relatorio];
            }
          });
          
          setRelatorioEditando(null);
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

  // 📤 PUBLICAR RELATÓRIO
  const publishRelatorio = useCallback(async (id: string) => {
    const relatorio = relatorios.find(r => r.id === id);
    if (!relatorio) return;
    
    const relatorioPublicado = { ...relatorio, status: 'published' as const };
    await saveRelatorio(relatorioPublicado);
  }, [relatorios, saveRelatorio]);

  // 📥 DESPUBLICAR RELATÓRIO
  const unpublishRelatorio = useCallback(async (id: string) => {
    const relatorio = relatorios.find(r => r.id === id);
    if (!relatorio) return;
    
    const relatorioRascunho = { ...relatorio, status: 'draft' as const };
    await saveRelatorio(relatorioRascunho);
  }, [relatorios, saveRelatorio]);

  // 🗑️ DELETAR RELATÓRIO
  const deleteRelatorio = useCallback(async (id: string) => {
    setSaving(true);
    
    try {
      const request = indexedDB.open('RelatoriosSemanaisDB', 1);
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['relatorios'], 'readwrite');
        const store = transaction.objectStore('relatorios');
        
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => {
          setRelatorios(prev => prev.filter(r => r.id !== id));
          console.log('✅ Relatório excluído');
        };
      };
      
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
    } finally {
      setSaving(false);
    }
  }, []);

  // ✏️ EDITAR RELATÓRIO
  const editRelatorio = useCallback((relatorio: RelatorioSemanalData) => {
    setRelatorioEditando(relatorio);
    setActiveTab('criar');
  }, []);

  const totalRelatorios = relatorios.length;
  const relatoriosDraft = relatorios.filter(r => r.status === 'draft').length;
  const relatoriosPublicados = relatorios.filter(r => r.status === 'published').length;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Carregando relatórios...
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
        borderBottom: '4px solid #22c55e'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={28} style={{ color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>
                  Relatórios Semanais
                </h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  Central de Relatórios Semanais - Fatos da Bolsa
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
                  {totalRelatorios}
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
                  {relatoriosDraft}
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                  {relatoriosPublicados}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Publicados</div>
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
                borderBottom: activeTab === 'criar' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Plus size={20} />
              {relatorioEditando ? 'Editar Relatório' : 'Criar Relatórios'}
              {relatorioEditando && (
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
              onClick={() => setActiveTab('publicados')}
              style={{
                flex: 1,
                padding: '20px 24px',
                border: 'none',
                backgroundColor: activeTab === 'publicados' ? 'white' : 'transparent',
                color: activeTab === 'publicados' ? '#1e293b' : '#64748b',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'publicados' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Eye size={20} />
              Publicados ({relatoriosPublicados})
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
                borderBottom: activeTab === 'rascunhos' ? '3px solid #22c55e' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileText size={20} />
              Rascunhos ({relatoriosDraft})
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {activeTab === 'criar' && (
              relatorioEditando ? (
                <div>
                  <div style={{
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '16px', fontWeight: '600' }}>
                      ✏️ Editando Relatório
                    </h4>
                    <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
                      Você está editando: <strong>{relatorioEditando.titulo || relatorioEditando.semana}</strong>
                    </p>
                    <button
                      onClick={() => setRelatorioEditando(null)}
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
                  <CriarRelatorioForm onSave={saveRelatorio} relatorioEditando={relatorioEditando} />
                </div>
              ) : (
                <CriarRelatorioForm onSave={saveRelatorio} />
              )
            )}
            
            {activeTab === 'publicados' && (
              <RelatoriosPublicados 
                relatorios={relatorios}
                onEdit={editRelatorio}
                onUnpublish={unpublishRelatorio}
                onDelete={deleteRelatorio}
              />
            )}
            
            {activeTab === 'rascunhos' && (
              <RascunhosRelatorios 
                relatorios={relatorios}
                onEdit={editRelatorio}
                onPublish={publishRelatorio}
                onDelete={deleteRelatorio}
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
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #86efac'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#15803d', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={24} />
            Sistema de Relatórios Semanais
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#15803d', marginBottom: '12px' }}>
                ✨ Criar
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Formulário organizado por seções</li>
                <li>Macro, Proventos, Small Caps, Exterior</li>
                <li>Rich Text Editor para análises</li>
                <li>Organização automática por semana</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#15803d', marginBottom: '12px' }}>
                📋 Publicados
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Relatórios organizados por semana</li>
                <li>Visualização de todas as seções</li>
                <li>Editar relatórios publicados</li>
                <li>Filtros por período</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#15803d', marginBottom: '12px' }}>
                📝 Rascunhos
              </h4>
              <ul style={{ color: '#0f172a', lineHeight: '1.6', paddingLeft: '20px' }}>
                <li>Relatórios ainda não publicados</li>
                <li>Continuar editando seções</li>
                <li>Publicar quando estiver completo</li>
                <li>Gerenciar trabalho em progresso</li>
              </ul>
            </div>
          </div>
          
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            border: '1px solid #86efac'
          }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '14px', fontWeight: '500' }}>
              💡 <strong>Fluxo Semanal:</strong> Crie um novo relatório da semana → Adicione itens em cada seção → 
              Publique quando estiver pronto → Os relatórios ficam organizados automaticamente por semana no banco de dados local!
            </p>
          </div>
          
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
              🗂️ <strong>Organização:</strong> Cada relatório é identificado pela semana (ex: 2025-W03) e contém 
              seções específicas para Macro, Proventos, Small Caps, Micro Caps e Exterior. Você tem controle total sobre o conteúdo!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorioSemanal;