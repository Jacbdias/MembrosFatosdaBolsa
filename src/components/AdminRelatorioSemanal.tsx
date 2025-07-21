import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Palette } from 'lucide-react';

// ✅ REUTILIZANDO O RICHTEXTEDITOR ORIGINAL
const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Digite seu texto...",
  style = {},
  minHeight = "120px"
}) => {
  const editorRef = useRef(null);
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

  const execCommand = useCallback((command, value) => {
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

  const changeTextColor = useCallback((color) => {
    execCommand('foreColor', color);
  }, [execCommand]);

  const changeFontSize = useCallback((size) => {
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

  const handleKeyDown = useCallback((e) => {
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
    { icon: Bold, command: 'bold', title: 'Negrito (Ctrl+B)', active: currentFormat.bold },
    { icon: Italic, command: 'italic', title: 'Itálico (Ctrl+I)', active: currentFormat.italic },
    { icon: Underline, command: 'underline', title: 'Sublinhado (Ctrl+U)', active: currentFormat.underline },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Riscado', active: currentFormat.strikethrough }
  ];

  const alignmentButtons = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Alinhar à esquerda' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Centralizar' },
    { icon: AlignRight, command: 'justifyRight', title: 'Alinhar à direita' }
  ];

  const listButtons = [
    { icon: List, command: 'insertUnorderedList', title: 'Lista com marcadores' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Lista numerada' }
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
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

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

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

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
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

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
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

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
        >
          <Link size={16} />
        </button>

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

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] a { color: #2563eb; text-decoration: underline; }
        [contenteditable] ul, [contenteditable] ol { margin: 8px 0; padding-left: 24px; }
        [contenteditable] li { margin: 4px 0; }
      `}</style>
    </div>
  );
};

// 🔥 SISTEMA INTEGRADO DE ANÁLISES NO ADMIN EXISTENTE
// 🆕 INTERFACES PARA ANÁLISES DE RESULTADOS
interface AnaliseResultado {
  id?: string;
  ticker: string;
  trimestre: string;
  ano: number;
  titulo: string;
  resumo: string;
  conteudo: string;
  metricas: {
    receita?: number;
    receitaVariacao?: number;
    lucroLiquido?: number;
    lucroVariacao?: number;
    ebitda?: number;
    ebitdaVariacao?: number;
    margem?: number;
    roe?: number;
    dividendos?: number;
  };
  destaques: string[];
  recomendacao: 'COMPRA' | 'MANTER' | 'VENDA' | 'AGUARDAR';
  precoAlvo?: number;
  dataPublicacao: string;
  autor: string;
  status: 'published' | 'draft';
  categoria: 'trimestral' | 'anual' | 'especial';
}

const AdminRelatorioSemanal = () => {
  // ✅ ESTADOS EXISTENTES (mantidos do seu sistema)
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

  // 🆕 NOVOS ESTADOS PARA ANÁLISES
  const [analises, setAnalises] = useState<AnaliseResultado[]>([]);

  const [activeTab, setActiveTab] = useState('macro');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CARREGAR RELATÓRIO EXISTENTE (mantido)
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

  // 🆕 CARREGAR ANÁLISES EXISTENTES
  useEffect(() => {
    const carregarAnalises = () => {
      try {
        const analisesSalvas = localStorage.getItem('analises_resultados_central');
        if (analisesSalvas) {
          const dados = JSON.parse(analisesSalvas);
          if (Array.isArray(dados)) {
            const analisesOrdenadas = dados.sort((a, b) => 
              new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
            );
            setAnalises(analisesOrdenadas);
            console.log(`✅ ${dados.length} análises carregadas`);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar análises:', error);
        setAnalises([]);
      }
    };

    carregarAnalises();
  }, []);

  // 🔄 CARREGAR ANÁLISES EXISTENTES
  useEffect(() => {
    const carregarAnalises = () => {
      try {
        const analisesSalvas = localStorage.getItem('analises_resultados_central');
        if (analisesSalvas) {
          const dados = JSON.parse(analisesSalvas);
          if (Array.isArray(dados)) {
            const analisesOrdenadas = dados.sort((a, b) => 
              new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
            );
            setAnalises(analisesOrdenadas);
            console.log(`✅ ${dados.length} análises carregadas`);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar análises:', error);
        setAnalises([]);
      }
    };

    carregarAnalises();
  }, []);

  // 🆕 HANDLERS PARA ANÁLISES
  const updateAnalise = useCallback((id, field, value) => {
    setAnalises(prev => 
      prev.map(analise => 
        analise.id === id ? { ...analise, [field]: value } : analise
      )
    );
  }, []);

  const removeAnalise = useCallback((id) => {
    setAnalises(prev => prev.filter(analise => analise.id !== id));
  }, []);

  const addAnalise = useCallback(() => {
    const novaAnalise = {
      id: Date.now().toString(),
      ticker: '',
      trimestre: '',
      ano: new Date().getFullYear(),
      titulo: '',
      resumo: '',
      conteudo: '',
      metricas: {},
      destaques: [],
      recomendacao: 'MANTER',
      precoAlvo: undefined,
      dataPublicacao: new Date().toISOString().split('T')[0],
      autor: 'admin@fatosdobolsa.com',
      status: 'draft',
      categoria: 'trimestral'
    };
    setAnalises(prev => [novaAnalise, ...prev]);
  }, []);

  // 💾 SALVAR TUDO (RELATÓRIO + ANÁLISES) - MODIFICADO
  const saveRelatorio = async () => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando relatório e análises...');
      
      // 🆕 Salvar análises primeiro
      try {
        localStorage.setItem('analises_resultados_central', JSON.stringify(analises));
        
        // Salvar também por ticker individual para performance
        const analisesPorTicker: { [key: string]: AnaliseResultado[] } = {};
        analises.forEach(analise => {
          if (analise.ticker) {
            if (!analisesPorTicker[analise.ticker]) {
              analisesPorTicker[analise.ticker] = [];
            }
            analisesPorTicker[analise.ticker].push(analise);
          }
        });

        Object.entries(analisesPorTicker).forEach(([ticker, analisesTicker]) => {
          localStorage.setItem(`analises_${ticker}`, JSON.stringify(analisesTicker));
        });
        
        console.log(`✅ ${analises.length} análises salvas`);
      } catch (analyzeError) {
        console.error('❌ Erro ao salvar análises:', analyzeError);
        // Continua mesmo se análises falharem
      }

      // ✅ Salvar relatório (código original mantido)
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
      
      console.log('✅ Relatório e análises salvos com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao salvar: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  // 📤 PUBLICAR RELATÓRIO (mantido igual)
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

  // ✅ SEÇÕES ORIGINAIS (mantidas) + NOVA SEÇÃO DE ANÁLISES
  const MacroSection = useMemo(() => (
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
        <MacroNewsCard 
          key={news.id} 
          news={news} 
          onUpdate={updateMacroNews} 
          onRemove={removeMacroNews} 
        />
      ))}
    </div>
  ), [relatorio.macro, addMacroNews, updateMacroNews, removeMacroNews]);

  const ProventosSection = useMemo(() => (
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
        <ProventoCard 
          key={prov.id} 
          provento={prov} 
          onUpdate={updateProvento} 
          onRemove={removeProvento} 
        />
      ))}
    </div>
  ), [relatorio.proventos, addProvento, updateProvento, removeProvento]);

  // Função factory para criar seções de stock (mantida)
  const createStockSection = useCallback((section: 'dividendos' | 'smallCaps' | 'microCaps' | 'exterior', title: string, color: string) => {
    const addHandler = () => addStockNews(section);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{title}</h3>
          <button
            onClick={addHandler}
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
          <StockCard 
            key={stock.id} 
            stock={stock} 
            section={section}
            title={title}
            onUpdate={updateStockNews} 
            onRemove={removeStockNews} 
          />
        ))}
      </div>
    );
  }, [relatorio, addStockNews, updateStockNews, removeStockNews]);
    const [novoDestaque, setNovoDestaque] = useState('');

    const trimestres = [
      { value: '1T24', label: '1º Trimestre 2024' },
      { value: '2T24', label: '2º Trimestre 2024' },
      { value: '3T24', label: '3º Trimestre 2024' },
      { value: '4T24', label: '4º Trimestre 2024' },
      { value: '1T25', label: '1º Trimestre 2025' },
      { value: '2T25', label: '2º Trimestre 2025' },
      { value: '3T25', label: '3º Trimestre 2025' },
      { value: '4T25', label: '4º Trimestre 2025' },
    ];

    const getCoresRecomendacao = (recomendacao) => {
      switch (recomendacao) {
        case 'COMPRA': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
        case 'MANTER': return { bg: '#fefce8', text: '#ca8a04', border: '#fde047' };
        case 'VENDA': return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
        case 'AGUARDAR': return { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' };
        default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
      }
    };

    const cores = getCoresRecomendacao(analise.recomendacao);

    const updateMetrica = (metrica, valor) => {
      const novasMetricas = { ...analise.metricas, [metrica]: valor };
      updateAnalise(analise.id, 'metricas', novasMetricas);
    };

    const adicionarDestaque = () => {
      if (novoDestaque.trim() && !analise.destaques.includes(novoDestaque.trim())) {
        const novosDestaques = [...analise.destaques, novoDestaque.trim()];
        updateAnalise(analise.id, 'destaques', novosDestaques);
        setNovoDestaque('');
      }
    };

    const removerDestaque = (index) => {
      const novosDestaques = analise.destaques.filter((_, i) => i !== index);
      updateAnalise(analise.id, 'destaques', novosDestaques);
    };

    return (
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h4 style={{ fontWeight: '600', color: '#111827', margin: 0, fontSize: '18px' }}>
              📊 Análise de Resultado
            </h4>
            <div style={{
              backgroundColor: cores.bg,
              color: cores.text,
              border: `1px solid ${cores.border}`,
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {analise.recomendacao}
            </div>
          </div>
          <button
            onClick={() => removeAnalise(analise.id)}
            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* Dados Básicos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                📈 Ticker
              </label>
              <input
                type="text"
                value={analise.ticker}
                onChange={(e) => updateAnalise(analise.id, 'ticker', e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxSizing: 'border-box'
                }}
                placeholder="PETR4"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                📅 Trimestre
              </label>
              <select
                value={analise.trimestre}
                onChange={(e) => updateAnalise(analise.id, 'trimestre', e.target.value)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Selecione...</option>
                {trimestres.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                🎯 Recomendação
              </label>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                💰 Preço Alvo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={analise.precoAlvo || ''}
                onChange={(e) => updateAnalise(analise.id!, 'precoAlvo', parseFloat(e.target.value) || undefined)}
                style={{
                  width: '100%',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="42.50"
              />
            </div>
          </div>

          {/* Título */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📝 Título da Análise
            </label>
            <input
              type="text"
              value={analise.titulo}
              onChange={(e) => updateAnalise(analise.id!, 'titulo', e.target.value)}
              style={{
                width: '100%',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                boxSizing: 'border-box'
              }}
              placeholder="Ex: Petrobras - Resultados 3T24: Forte geração de caixa"
            />
          </div>

          {/* Resumo */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📄 Resumo Executivo
            </label>
            <RichTextEditor
              value={analise.resumo}
              onChange={(value) => updateAnalise(analise.id!, 'resumo', value)}
              placeholder="Resumo dos principais pontos do resultado..."
              minHeight="120px"
            />
          </div>

          {/* Análise Completa */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📋 Análise Completa
            </label>
            <RichTextEditor
              value={analise.conteudo}
              onChange={(value) => updateAnalise(analise.id!, 'conteudo', value)}
              placeholder="Análise detalhada dos resultados, contexto, perspectivas..."
              minHeight="300px"
            />
          </div>
        </div>
      </div>
    );
  });

  // ✅ TABS ATUALIZADAS (inclui a nova aba + mantém as originais)
  const totalItems = relatorio.macro.length + relatorio.proventos.length + 
                    relatorio.dividendos.length + relatorio.smallCaps.length + 
                    relatorio.microCaps.length + relatorio.exterior.length + 
                    analises.length; // ✅ Incluir análises no total

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
    },
    // 🆕 NOVA ABA DE ANÁLISES
    { 
      id: 'analises', 
      label: 'Análises Resultados', 
      icon: FileText, 
      color: '#c026d3',
      count: analises.length,
      description: 'Análises trimestrais'
    }
  ];

  // ✅ SEÇÃO DE ANÁLISES
  const AnalisesSection = useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Análises de Resultados</h3>
        <button
          onClick={addAnalise}
          style={{
            backgroundColor: '#c026d3',
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
          Nova Análise
        </button>
      </div>

      {analises.map((analise) => (
        <AnaliseCard key={analise.id} analise={analise} />
      ))}

      {analises.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <FileText size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#4b5563', margin: '0 0 8px 0' }}>
            Nenhuma análise criada
          </h4>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Crie análises de resultados trimestrais para as empresas da sua cobertura.
          </p>
          <button
            onClick={addAnalise}
            style={{
              backgroundColor: '#c026d3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ➕ Criar Primeira Análise
          </button>
        </div>
      )}
    </div>
  ), [analises, addAnalise]); trimestrais'
    }
  ];

  // ✅ SEÇÃO DE ANÁLISES
  const AnalisesSection = useMemo(() => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Análises de Resultados</h3>
        <button
          onClick={addAnalise}
          style={{
            backgroundColor: '#c026d3',
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
          Nova Análise
        </button>
      </div>

      {analises.map((analise) => (
        <AnaliseCard key={analise.id} analise={analise} />
      ))}

      {analises.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <FileText size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
          <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#4b5563', margin: '0 0 8px 0' }}>
            Nenhuma análise criada
          </h4>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px 0' }}>
            Crie análises de resultados trimestrais para as empresas da sua cobertura.
          </p>
          <button
            onClick={addAnalise}
            style={{
              backgroundColor: '#c026d3',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ➕ Criar Primeira Análise
          </button>
        </div>
      )}
    </div>
  ), [analises, addAnalise]);

  const totalItems = relatorio.macro.length + relatorio.proventos.length + 
                    relatorio.dividendos.length + relatorio.smallCaps.length + 
                    relatorio.microCaps.length + relatorio.exterior.length + 
                    analises.length; // ✅ Incluir análises no total

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
                  Painel Administrativo
                </h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
                  Relatórios Semanais + Análises de Resultados
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
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#c026d3' }}>
                  {analises.length}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Análises</div>
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
              Central de Conteúdo
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
                onClick={saveAll}
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
                {saving ? 'Salvando...' : 'Salvar Tudo'}
              </button>
            </div>
          </div>

          {/* Estatísticas rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0369a1' }}>
                {relatorio.macro.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Macro</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>
                {relatorio.proventos.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Proventos</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#fef7ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#c026d3' }}>
                {analises.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Análises</div>
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
            {activeTab === 'macro' && (
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
                {relatorio.macro.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                    <Globe size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p>Nenhuma notícia macro adicionada</p>
                  </div>
                ) : (
                  <div>Aqui renderizariam os cards de macro news existentes</div>
                )}
              </div>
            )}
            {activeTab === 'analises' && AnalisesSection}
            {/* Outras tabs renderizariam suas seções correspondentes */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorioSemanalComAnalises;