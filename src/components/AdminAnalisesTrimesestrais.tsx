'use client';

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { 
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, DollarSign, 
  Building, Globe, Zap, Bell, Plus, Trash2, Save, Eye, AlertCircle, 
  CheckCircle, BarChart3, Users, Clock, FileText, Target, Briefcase, 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Link, Palette, ExternalLink, PieChart, 
  Activity, Image, Upload, Edit, Archive, Search, Filter 
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES - CORRIGIDOS
// ============================================================================

interface MetricaTrimestreData {
  valor: number;
  unidade: string;
  variacao?: number;        // Variação trimestre vs trimestre anterior
  variacaoYoY?: number;     // Variação ano vs ano (campo principal)
  margem?: number;
}

interface DadosExtraidosPDF {
  empresa?: string;
  trimestre?: string;
  dataReferencia?: string;
  
  dadosFinanceiros?: {
    lucroLiquido?: { valor: number; variacaoAA?: number; variacaoTT?: number; };
    receita?: { valor: number; variacaoAA?: number; variacaoTT?: number; };
    ebitda?: { valor: number; variacaoAA?: number; variacaoTT?: number; margem?: number; };
    roe?: { valor: number; variacaoAA?: number; };
    roa?: { valor: number; variacaoAA?: number; };
    endividamento?: { valor: number; variacaoAA?: number; };
    outrasMetricas?: Array<{
      nome: string;
      valor: string;
      variacao?: string;
    }>;
  };
  
relatorioGerado?: {
  titulo: string;
  destaques: string[];
  pontosAtencao: string[];
  conclusao: string;
  recomendacao: 'COMPRA' | 'VENDA' | 'MANTER';
  nota?: number;
};
  
  contextoMercado?: string;
  outlook?: string;
  conteudoCompleto?: string;
}

interface AnaliseTrimestreData {
  id?: string;
  ticker: string;
  empresa: string;
  trimestre: string;
  dataPublicacao: string;
  autor: string;
  categoria: 'resultado_trimestral' | 'analise_setorial' | 'tese_investimento';
  
  titulo: string;
  analiseCompleta: string;
  
  metricas: {
    receita?: MetricaTrimestreData;
    ebitda?: MetricaTrimestreData;
    lucroLiquido?: MetricaTrimestreData;
    roe?: MetricaTrimestreData;
  };
  
  dadosExtraidos?: DadosExtraidosPDF;
  fonteDados?: 'manual' | 'pdf' | 'misto';
  nomeArquivoPDF?: string;
  dataProcessamentoPDF?: string;
  
  pontosFavoraveis: string;
  pontosAtencao: string;
  
  recomendacao: 'COMPRA' | 'VENDA' | 'MANTER';
  precoAlvo?: number;
  risco: 'BAIXO' | 'MÉDIO' | 'ALTO';
  
  linkResultado?: string;
  linkConferencia?: string;
  
  status: 'draft' | 'published';
}

// ============================================================================
// SERVIÇOS DE API REAIS
// ============================================================================

const API_BASE = '/api/analises-trimestrais';

const analiseAPI = {
  async listar(filtros?: { status?: string; ticker?: string; userId?: string }): Promise<AnaliseTrimestreData[]> {
    try {
      const params = new URLSearchParams();
      if (filtros?.status) params.append('status', filtros.status);
      if (filtros?.ticker) params.append('ticker', filtros.ticker);
      if (filtros?.userId) params.append('userId', filtros.userId);
      
      const url = filtros ? `${API_BASE}?${params.toString()}` : API_BASE;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao listar análises:', error);
      throw error;
    }
  },

  async criar(analise: Omit<AnaliseTrimestreData, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnaliseTrimestreData> {
    try {
      // CORRIGIDO: Garantir que sempre tenha um ID único
      const analiseComId = {
        ...analise,
        id: analise.id || `analise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analiseComId)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao criar análise:', error);
      throw error;
    }
  },

  async atualizar(id: string, analise: Partial<AnaliseTrimestreData>): Promise<AnaliseTrimestreData> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analise)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao atualizar análise:', error);
      throw error;
    }
  },

  async deletar(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar análise:', error);
      throw error;
    }
  },

  async analisarPDF(textoPDF: string): Promise<DadosExtraidosPDF> {
    try {
      const response = await fetch(`${API_BASE}/analisar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoPDF })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Erro HTTP: ${response.status}`);
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na análise da IA');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro na análise OpenAI:', error);
      throw error;
    }
  }
};

// ============================================================================
// RICH TEXT EDITOR COMPONENT (mantido igual)
// ============================================================================

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = memo(({
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

  const toolbarButtons = useMemo(() => [
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
  ], [currentFormat]);

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
        backgroundColor: '#f8fafc'
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
                cursor: 'pointer'
              }}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={uploadImage}
            title="Upload de imagem"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Upload size={14} style={{ marginRight: '4px' }} />
            Upload
          </button>

          <button
            onClick={insertImageByUrl}
            title="Inserir imagem por URL"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#06b6d4',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <Image size={14} style={{ marginRight: '4px' }} />
            URL
          </button>
        </div>

        <button
          onClick={insertLink}
          title="Inserir link"
          style={{
            padding: '8px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            cursor: 'pointer'
          }}
        >
          <Link size={16} />
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
          padding: '16px',
          minHeight: minHeight,
          outline: 'none',
          lineHeight: '1.6',
          fontSize: '16px',
          color: '#1f2937'
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
});

// ============================================================================
// FUNÇÕES AUXILIARES PARA PDF E IA (mantidas iguais, mas comentadas para brevidade)
// ============================================================================

const extrairTrimestre = (texto: string): string | null => {
  const patterns = [
    /([1-4])T(\d{2,4})/gi,
    /([1-4])Q(\d{2,4})/gi,
    /Q[1-4]['´`'\s]*(\d{2,4})/gi,
    /([1-4])º\s*trimestre\s*(\d{4})/gi,
    /([1-4])°\s*trimestre\s*(\d{4})/gi,
    /(primeiro|segundo|terceiro|quarto)\s*trimestre\s*(\d{4})/gi
  ];
  
  for (const pattern of patterns) {
    const matches = [...texto.matchAll(pattern)];
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1] && match[2]) {
        return `${match[1]}T${match[2]}`.toUpperCase();
      } else if (match[0]) {
        return match[0].toUpperCase().replace(/[´`']/g, '');
      }
    }
  }
  return null;
};

const extrairData = (texto: string): string | null => {
  const patterns = [
    /(\d{1,2}[\/.]\d{1,2}[\/.]\d{4})/g,
    /(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})/gi,
    /(\d{4}-\d{2}-\d{2})/g,
    /(\d{1,2}\.\d{1,2}\.\d{4})/g
  ];
  
  for (const pattern of patterns) {
    const matches = [...texto.matchAll(pattern)];
    if (matches.length > 0) {
      return matches[0][1];
    }
  }
  return null;
};

const extrairValoresFinanceiros = (texto: string): { [key: string]: number } => {
  console.log('🔍 Iniciando extração de valores financeiros...');
  
  const valores: { [key: string]: number } = {};
  
  const metricas = {
    receita: [
      /receita\s+líquida\s+de\s+vendas[^\d]+([\d.,]+)/gi,
      /receita\s+operacional\s+líquida[^\d]+([\d.,]+)/gi,
      /receita\s+líquida[^\d]+([\d.,]+)/gi,
      /net\s+revenue[^\d]+([\d.,]+)/gi,
      /revenue[^\d]+([\d.,]+)/gi
    ],
    ebitda: [
      /ebitda\s+ajustado[^\d]+([\d.,]+)/gi,
      /ebitda\s+proforma[^\d]+([\d.,]+)/gi,
      /ebitda[^\d]+([\d.,]+)/gi,
      /ebit\s+ajustado[^\d]+([\d.,]+)/gi
    ],
    lucroLiquido: [
      /lucro\s+líquido\s+\(prejuízo\)\s+atribuível\s+aos\s+shareholders[^\d]+([\d.,\-\(\)]+)/gi,
      /lucro\s+líquido\s+proforma[^\d]+([\d.,\-\(\)]+)/gi,
      /lucro\s+líquido[^\d]+([\d.,\-\(\)]+)/gi,
      /net\s+income[^\d]+([\d.,\-\(\)]+)/gi,
      /net\s+profit[^\d]+([\d.,\-\(\)]+)/gi
    ]
  };
  
  for (const [metrica, patterns] of Object.entries(metricas)) {
    for (const pattern of patterns) {
      const matches = [...texto.matchAll(pattern)];
      
      if (matches.length > 0) {
        for (const match of matches) {
          let numeroStr = match[1];
          
          if (numeroStr) {
            let valor = numeroStr
              .replace(/[^\d.,\-\(\)]/g, '')
              .replace(/\(/g, '-')
              .replace(/\)/g, '')
              .replace(/,(\d{3})/g, '$1')
              .replace(/\.(\d{3})/g, '$1')
              .replace(/,(\d{1,2})$/, '.$1');
            
            const numeroFinal = parseFloat(valor);
            
            if (!isNaN(numeroFinal) && numeroFinal !== 0) {
              valores[metrica] = Math.abs(numeroFinal);
              break;
            }
          }
        }
      }
    }
  }
  
  return valores;
};

// ============================================================================
// HOOK PARA PROCESSAMENTO DE PDF COM API REAL (mantido igual)
// ============================================================================

const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<DadosExtraidosPDF | null>(null);

  const loadPdfJs = useCallback(async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve((window as any).pdfjsLib);
      };
      script.onerror = () => reject(new Error('Falha ao carregar PDF.js'));
      document.head.appendChild(script);
    });
  }, []);

  const extractTextFromPDF = useCallback(async (file: File, pdfjsLib: any): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let textoCompleto = '';
      const maxPages = Math.min(pdf.numPages, 10);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .filter((item: any) => item.str && item.str.trim().length > 0)
          .map((item: any) => item.str.trim())
          .join(' ');
        
        textoCompleto += `\n--- PÁGINA ${pageNum} ---\n${pageText}\n`;
      }
      
      return textoCompleto;
      
    } catch (error) {
      console.error('❌ Erro na extração de texto:', error);
      throw new Error('Falha na extração de texto do PDF: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  }, []);

  const analisarComIA = useCallback(async (textoPDF: string): Promise<DadosExtraidosPDF> => {
    try {
      const resultado = await analiseAPI.analisarPDF(textoPDF);
      return resultado;
    } catch (error) {
      console.error('❌ Erro na análise OpenAI:', error);
      return gerarAnaliseFallback(textoPDF);
    }
  }, []);

  const gerarAnaliseFallback = useCallback((textoPDF: string): DadosExtraidosPDF => {
    const textoLower = textoPDF.toLowerCase();
    
    let empresa = "Empresa Identificada";
    let ticker = "TICKER";
    
    const empresasComuns = [
      { nomes: ['vale', 'vale s.a.', 'vale sa'], empresa: "Vale S.A.", ticker: "VALE3" },
      { nomes: ['petrobras', 'petróleo brasileiro', 'petroleo brasileiro'], empresa: "Petróleo Brasileiro S.A.", ticker: "PETR4" },
      { nomes: ['itaú', 'itau', 'itaú unibanco'], empresa: "Itaú Unibanco Holding S.A.", ticker: "ITUB4" },
      { nomes: ['ambev', 'companhia de bebidas'], empresa: "Ambev S.A.", ticker: "ABEV3" },
      { nomes: ['magazine luiza', 'magalu', 'mglu'], empresa: "Magazine Luiza S.A.", ticker: "MGLU3" },
      { nomes: ['natura', 'natura & co'], empresa: "Natura & Co Holding S.A.", ticker: "NTCO3" },
      { nomes: ['suzano', 'suzano papel'], empresa: "Suzano S.A.", ticker: "SUZB3" }
    ];
    
    for (const { nomes, empresa: emp, ticker: tick } of empresasComuns) {
      if (nomes.some(nome => textoLower.includes(nome))) {
        empresa = emp;
        ticker = tick;
        break;
      }
    }
    
    const valoresExtraidos = extrairValoresFinanceiros(textoPDF);
    const trimestreExtraido = extrairTrimestre(textoPDF);
    const dataExtraida = extrairData(textoPDF);

    return {
      empresa: empresa,
      trimestre: trimestreExtraido || "3T24",
      dataReferencia: dataExtraida || "30/09/2024",
      
      dadosFinanceiros: {
        receita: { 
          valor: valoresExtraidos.receita || 1000,
          variacaoAA: 5.2,
          variacaoTT: 1.8 
        },
        ebitda: { 
          valor: valoresExtraidos.ebitda || 300,
          variacaoAA: 3.1,
          variacaoTT: -1.2,
          margem: valoresExtraidos.ebitda && valoresExtraidos.receita ? 
            ((valoresExtraidos.ebitda / valoresExtraidos.receita) * 100) : 30.0
        },
        lucroLiquido: { 
          valor: valoresExtraidos.lucroLiquido || 200,
          variacaoAA: -2.1,
          variacaoTT: 0.5 
        },
        roe: {
          valor: 15.5,
          variacaoAA: 1.2
        }
      },
      
      relatorioGerado: {
        titulo: `${ticker} - ${trimestreExtraido || '3T24'}: Análise baseada em processamento local aprimorado`,
        destaques: [
          valoresExtraidos.receita ? `Receita extraída: ${valoresExtraidos.receita.toLocaleString('pt-BR')} milhões` : "Sistema de extração ativo",
          valoresExtraidos.ebitda ? `EBITDA identificado: ${valoresExtraidos.ebitda.toLocaleString('pt-BR')} milhões` : "Algoritmos de padrão financeiro funcionais",
          `Empresa identificada automaticamente: ${empresa}`,
          `Período reconhecido: ${trimestreExtraido || '3T24'}`,
          "Extração via regex aprimorada para relatórios financeiros",
          "Sistema de fallback com identificação automática de empresas"
        ],
        pontosAtencao: [
          valoresExtraidos.receita || valoresExtraidos.ebitda || valoresExtraidos.lucroLiquido ? 
            "Valores extraídos automaticamente - recomenda-se validação manual" :
            "Valores padrão utilizados - PDF pode ter estrutura não reconhecida",
          "Variações percentuais estimadas - verificar dados originais",
          "Sistema em modo fallback - integração IA temporariamente indisponível",
          "Dados de margem calculados automaticamente podem precisar ajuste"
        ],
        conclusao: `A análise da ${empresa} (${ticker}) foi processada com sucesso utilizando algoritmos aprimorados de extração de dados financeiros. ${valoresExtraidos.receita && valoresExtraidos.ebitda ? 'Os principais valores financeiros foram identificados automaticamente no documento.' : 'O sistema utilizou valores estimados devido à estrutura específica do PDF.'} O período ${trimestreExtraido || '3T24'} foi reconhecido no documento. Recomenda-se revisão manual dos dados extraídos para garantir precisão total, especialmente para variações percentuais e métricas comparativas.`,
        recomendacao: 'MANTER',
        nota: 8.5
      }
    };
  }, []);

  const processFile = useCallback(async (file: File): Promise<DadosExtraidosPDF> => {
    if (file.type !== 'application/pdf') {
      throw new Error('Por favor, selecione apenas arquivos PDF.');
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo 20MB permitido.');
    }

    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const pdfjsLib = await loadPdfJs();
      const pdfText = await extractTextFromPDF(file, pdfjsLib);
      const analiseCompleta = await analisarComIA(pdfText);
      
      setExtractedData(analiseCompleta);
      return analiseCompleta;
      
    } catch (error) {
      console.error('❌ Erro no processamento:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [loadPdfJs, extractTextFromPDF, analisarComIA]);

  const resetProcessor = useCallback(() => {
    setUploadedFile(null);
    setExtractedData(null);
    setIsProcessing(false);
  }, []);

  return {
    processFile,
    resetProcessor,
    isProcessing,
    uploadedFile,
    extractedData
  };
};

// ============================================================================
// COMPONENTE PDF UPLOADER (mantido igual)
// ============================================================================

interface PDFUploaderProps {
  onExtractData: (dados: DadosExtraidosPDF) => void;
  disabled?: boolean;
}

const PDFUploader: React.FC<PDFUploaderProps> = memo(({ onExtractData, disabled = false }) => {
  const { processFile, resetProcessor, isProcessing, uploadedFile, extractedData } = usePDFProcessor();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dadosExtraidos = await processFile(file);
      onExtractData(dadosExtraidos);
    } catch (error) {
      console.error('❌ Erro ao processar PDF:', error);
      alert(`❌ Erro ao processar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      resetProcessor();
    }
  }, [processFile, onExtractData, resetProcessor]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
      padding: '24px',
      borderRadius: '16px',
      border: '2px solid #f59e0b',
      marginBottom: '24px'
    }}>
      <h5 style={{ 
        fontSize: '18px', 
        fontWeight: '700', 
        color: '#92400e', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FileText size={20} />
        📄 Importar Relatório PDF
      </h5>

      {!uploadedFile && (
        <div>
          <p style={{ color: '#92400e', marginBottom: '16px', fontSize: '14px' }}>
            Faça upload do relatório trimestral em PDF para extrair automaticamente os dados financeiros.
          </p>
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={disabled || isProcessing}
            style={{ display: 'none' }}
            id="pdf-upload"
          />
          
          <label
            htmlFor="pdf-upload"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#059669',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              cursor: disabled || isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              opacity: disabled || isProcessing ? 0.5 : 1,
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Upload size={20} />
            {isProcessing ? 'Processando PDF...' : 'Selecionar PDF'}
          </label>
        </div>
      )}

      {uploadedFile && (
        <div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#92400e', margin: '0 0 8px 0', fontWeight: '600' }}>
              📁 Arquivo selecionado:
            </p>
            <p style={{ color: '#92400e', margin: '0', fontSize: '14px' }}>
              {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          </div>

          {isProcessing && (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔄</div>
              <p style={{ color: '#92400e', fontWeight: '600', margin: '0' }}>
                Analisando PDF e gerando relatório completo...
              </p>
              <p style={{ color: '#92400e', fontSize: '14px', margin: '8px 0 0 0' }}>
                Extraindo dados financeiros, identificando destaques e redigindo conclusão
              </p>
            </div>
          )}

          {extractedData && !isProcessing && (
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #22c55e'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <CheckCircle size={24} style={{ color: '#059669' }} />
                <div>
                  <h6 style={{ 
                    color: '#059669', 
                    fontWeight: '700', 
                    margin: 0,
                    fontSize: '18px'
                  }}>
                    ✅ Relatório Gerado e Inserido Automaticamente!
                  </h6>
                  <p style={{ 
                    color: '#059669', 
                    margin: '4px 0 0 0',
                    fontSize: '14px'
                  }}>
                    {extractedData.relatorioGerado?.titulo || 'Análise completa processada'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  flex: 1
                }}>
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>
                    📊 Todos os campos foram pré-preenchidos automaticamente:
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                    Título • Resumo • Análise Completa • Destaques • Pontos de Atenção • Recomendação • Preço Alvo
                  </div>
                </div>
                
                <button
                  onClick={resetProcessor}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Novo Upload
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '16px', 
        fontSize: '12px', 
        color: '#92400e', 
        opacity: 0.8 
      }}>
        💡 Suporta PDFs de até 20MB. O sistema gera automaticamente um relatório completo com análise, destaques e recomendações.
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE DE CRIAÇÃO/EDIÇÃO DE ANÁLISE - CORRIGIDO
// ============================================================================

interface CriarAnaliseFormProps {
  onSave: (analise: AnaliseTrimestreData) => void;
  analiseEditando?: AnaliseTrimestreData | null;
}

const CriarAnaliseForm = memo(({ onSave, analiseEditando }: CriarAnaliseFormProps) => {
  const [analise, setAnalise] = useState<AnaliseTrimestreData>(() => {
    if (analiseEditando) {
      return { ...analiseEditando };
    }
    
    return {
      // CORRIGIDO: Garantir ID único mesmo no estado inicial
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticker: '',
      empresa: '',
      trimestre: '',
      dataPublicacao: new Date().toISOString().split('T')[0],
      autor: '',
      categoria: 'resultado_trimestral',
      titulo: '',
      analiseCompleta: '',
      metricas: {},
      pontosFavoraveis: '',
      pontosAtencao: '',
      recomendacao: 'MANTER',
      status: 'draft'
    };
  });

  const [salvando, setSalvando] = useState(false);

  const gerarAnaliseCompleta = useCallback((relatorio: DadosExtraidosPDF['relatorioGerado']) => {
    if (!relatorio) return '';
    
    let analiseCompleta = `<h3>Resumo dos Resultados</h3>\n`;
    
    if (relatorio.destaques && relatorio.destaques.length > 0) {
      analiseCompleta += `<h3>Principais Destaques</h3>\n<ul>\n`;
      relatorio.destaques.forEach(destaque => {
        analiseCompleta += `<li>${destaque}</li>\n`;
      });
      analiseCompleta += `</ul>\n\n`;
    }
    
    if (relatorio.pontosAtencao && relatorio.pontosAtencao.length > 0) {
      analiseCompleta += `<h3>Pontos de Atenção</h3>\n<ul>\n`;
      relatorio.pontosAtencao.forEach(ponto => {
        analiseCompleta += `<li>${ponto}</li>\n`;
      });
      analiseCompleta += `</ul>\n\n`;
    }
    
    if (relatorio.conclusao) {
      analiseCompleta += `<h3>Conclusão</h3>\n`;
      const paragrafos = relatorio.conclusao.split('\n\n');
      paragrafos.forEach(paragrafo => {
        analiseCompleta += `<p>${paragrafo}</p>\n`;
      });
    }
    
    return analiseCompleta;
  }, []);

  useEffect(() => {
    if (analiseEditando) {
      setAnalise({ ...analiseEditando });
    }
  }, [analiseEditando]);

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

  // CORRIGIDO: Mapeamento correto dos campos do PDF para as métricas
  const handleImportarDadosPDF = useCallback((dadosPDF: DadosExtraidosPDF) => {
    console.log('📊 Importando relatório completo do PDF:', dadosPDF);
    
    setAnalise(prev => ({
      ...prev,
      empresa: dadosPDF.empresa || prev.empresa,
      trimestre: dadosPDF.trimestre || prev.trimestre,
      titulo: dadosPDF.relatorioGerado?.titulo || prev.titulo,
      analiseCompleta: dadosPDF.relatorioGerado ? 
        gerarAnaliseCompleta(dadosPDF.relatorioGerado) : prev.analiseCompleta,
      pontosFavoraveis: dadosPDF.relatorioGerado?.destaques ? 
        dadosPDF.relatorioGerado.destaques.map(d => `• ${d}`).join('\n') : prev.pontosFavoraveis,
      pontosAtencao: dadosPDF.relatorioGerado?.pontosAtencao ? 
        dadosPDF.relatorioGerado.pontosAtencao.map(p => `• ${p}`).join('\n') : prev.pontosAtencao,
      recomendacao: dadosPDF.relatorioGerado?.recomendacao || prev.recomendacao,
nota: dadosPDF.relatorioGerado?.nota || prev.nota,
      // CORRIGIDO: Mapeamento correto variacaoAA -> variacaoYoY
      metricas: {
        receita: dadosPDF.dadosFinanceiros?.receita ? {
          valor: dadosPDF.dadosFinanceiros.receita.valor,
          unidade: 'milhões',
          variacao: dadosPDF.dadosFinanceiros.receita.variacaoTT,
          variacaoYoY: dadosPDF.dadosFinanceiros.receita.variacaoAA // ✅ CORRIGIDO
        } : prev.metricas.receita,
        ebitda: dadosPDF.dadosFinanceiros?.ebitda ? {
          valor: dadosPDF.dadosFinanceiros.ebitda.valor,
          unidade: 'milhões',
          variacao: dadosPDF.dadosFinanceiros.ebitda.variacaoTT,
          variacaoYoY: dadosPDF.dadosFinanceiros.ebitda.variacaoAA, // ✅ CORRIGIDO
          margem: dadosPDF.dadosFinanceiros.ebitda.margem
        } : prev.metricas.ebitda,
        lucroLiquido: dadosPDF.dadosFinanceiros?.lucroLiquido ? {
          valor: dadosPDF.dadosFinanceiros.lucroLiquido.valor,
          unidade: 'milhões',
          variacao: dadosPDF.dadosFinanceiros.lucroLiquido.variacaoTT,
          variacaoYoY: dadosPDF.dadosFinanceiros.lucroLiquido.variacaoAA // ✅ CORRIGIDO
        } : prev.metricas.lucroLiquido,
        roe: dadosPDF.dadosFinanceiros?.roe ? {
          valor: dadosPDF.dadosFinanceiros.roe.valor,
          unidade: '%',
          variacaoYoY: dadosPDF.dadosFinanceiros.roe.variacaoAA // ✅ CORRIGIDO
        } : prev.metricas.roe
      },
      dadosExtraidos: dadosPDF,
      fonteDados: 'pdf',
      dataProcessamentoPDF: new Date().toISOString()
    }));
    
    console.log('✅ Relatório completo importado e análise pré-preenchida');
  }, [gerarAnaliseCompleta]);

  const handleSave = useCallback(async () => {
    setSalvando(true);
    
    try {
      if (!analise.ticker || !analise.empresa || !analise.titulo) {
        alert('Por favor, preencha pelo menos Ticker, Empresa e Título.');
        return;
      }
      
      // CORRIGIDO: Garantir ID único antes de salvar
      const analiseParaSalvar = {
        ...analise,
        id: analise.id && analise.id !== 'temp' && !analise.id.startsWith('temp-') ? 
            analise.id : 
            `analise-${analise.ticker}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      await onSave(analiseParaSalvar);
      
      if (!analiseEditando) {
        // Reset para nova análise
        setAnalise({
          id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ticker: '',
          empresa: '',
          trimestre: '',
          dataPublicacao: new Date().toISOString().split('T')[0],
          autor: '',
          categoria: 'resultado_trimestral',
          titulo: '',
          analiseCompleta: '',
          metricas: {},
          pontosFavoraveis: '',
          pontosAtencao: '',
          recomendacao: 'MANTER',
          risco: 'MÉDIO',
          status: 'draft'
        });
        
        alert('✅ Análise criada e salva com sucesso!');
      } else {
        alert('✅ Análise editada e salva com sucesso!');
      }
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar análise');
    } finally {
      setSalvando(false);
    }
  }, [analise, onSave, analiseEditando]);

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
          {analiseEditando ? '✏️ Editar Análise' : '✨ Criar Nova Análise'}
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
          {salvando 
            ? 'Salvando...' 
            : analiseEditando 
              ? 'Atualizar Análise' 
              : 'Salvar Análise'
          }
        </button>
      </div>

      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Informações Básicas */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
            📋 Informações Básicas
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
          </div>
        </div>

        {/* Upload de PDF */}
        <PDFUploader 
          onExtractData={handleImportarDadosPDF} 
          disabled={salvando} 
        />

        {/* Mostrar dados extraídos - melhorado */}
        {analise.dadosExtraidos && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            padding: '20px',
            borderRadius: '12px',
            border: '2px solid #22c55e'
          }}>
            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#15803d', marginBottom: '16px' }}>
              ✅ Relatório Gerado Automaticamente
            </h5>
            
            {analise.dadosExtraidos.relatorioGerado && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  backgroundColor: '#bbf7d0', 
                  padding: '12px', 
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <h6 style={{ color: '#15803d', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                    📊 {analise.dadosExtraidos.relatorioGerado.titulo}
                  </h6>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {analise.dadosExtraidos.dadosFinanceiros?.receita && (
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Receita</div>
                      <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '700' }}>
                        R$ {analise.dadosExtraidos.dadosFinanceiros.receita.valor}M
                      </div>
                      {/* CORRIGIDO: Mostrar variacaoAA que será mapeada para variacaoYoY */}
                      {analise.dadosExtraidos.dadosFinanceiros.receita.variacaoAA && (
                        <div style={{ fontSize: '11px', color: analise.dadosExtraidos.dadosFinanceiros.receita.variacaoAA >= 0 ? '#059669' : '#dc2626' }}>
                          {analise.dadosExtraidos.dadosFinanceiros.receita.variacaoAA >= 0 ? '+' : ''}{analise.dadosExtraidos.dadosFinanceiros.receita.variacaoAA}% A/A
                        </div>
                      )}
                    </div>
                  )}
                  
                  {analise.dadosExtraidos.dadosFinanceiros?.ebitda && (
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>EBITDA</div>
                      <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '700' }}>
                        R$ {analise.dadosExtraidos.dadosFinanceiros.ebitda.valor}M
                      </div>
                      {analise.dadosExtraidos.dadosFinanceiros.ebitda.margem && (
                        <div style={{ fontSize: '11px', color: '#15803d' }}>
                          Margem: {analise.dadosExtraidos.dadosFinanceiros.ebitda.margem}%
                        </div>
                      )}
                    </div>
                  )}
                  
                  {analise.dadosExtraidos.dadosFinanceiros?.lucroLiquido && (
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Lucro Líquido</div>
                      <div style={{ fontSize: '14px', color: '#15803d', fontWeight: '700' }}>
                        R$ {analise.dadosExtraidos.dadosFinanceiros.lucroLiquido.valor}M
                      </div>
                      {/* CORRIGIDO: Mostrar variacaoAA */}
                      {analise.dadosExtraidos.dadosFinanceiros.lucroLiquido.variacaoAA && (
                        <div style={{ fontSize: '11px', color: analise.dadosExtraidos.dadosFinanceiros.lucroLiquido.variacaoAA >= 0 ? '#059669' : '#dc2626' }}>
                          {analise.dadosExtraidos.dadosFinanceiros.lucroLiquido.variacaoAA >= 0 ? '+' : ''}{analise.dadosExtraidos.dadosFinanceiros.lucroLiquido.variacaoAA}% A/A
                        </div>
                      )}
                    </div>
                  )}
                  
                  {analise.dadosExtraidos.relatorioGerado.recomendacao && (
                    <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Recomendação</div>
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: '700',
                        color: analise.dadosExtraidos.relatorioGerado.recomendacao === 'COMPRA' ? '#059669' : 
                               analise.dadosExtraidos.relatorioGerado.recomendacao === 'VENDA' ? '#dc2626' : '#f59e0b'
                      }}>
                        {analise.dadosExtraidos.relatorioGerado.recomendacao === 'COMPRA' ? '🟢 COMPRA' : 
                         analise.dadosExtraidos.relatorioGerado.recomendacao === 'VENDA' ? '🔴 VENDA' : '🟡 MANTER'}
                      </div>
{analise.dadosExtraidos.relatorioGerado.nota && (
  <div style={{ fontSize: '11px', color: '#15803d' }}>
    Nota: {analise.dadosExtraidos.relatorioGerado.nota}/10
  </div>
)}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div style={{ fontSize: '12px', color: '#15803d', opacity: 0.8 }}>
              ✨ Relatório completo importado - todos os campos foram pré-preenchidos e podem ser editados abaixo
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #fde68a'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '16px' }}>
            📝 Conteúdo da Análise
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
                placeholder="TUPY3 - 3T24: Resultados sólidos com expansão internacional"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Pontos Favoráveis
              </label>
              <RichTextEditor
                value={analise.pontosFavoraveis}
                onChange={(value) => updateField('pontosFavoraveis', value)}
                placeholder="• Principais destaques positivos do trimestre..."
                minHeight="120px"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Pontos de Atenção
              </label>
              <RichTextEditor
                value={analise.pontosAtencao}
                onChange={(value) => updateField('pontosAtencao', value)}
                placeholder="• Principais riscos e preocupações identificadas..."
                minHeight="120px"
              />
            </div>
          </div>
        </div>

        {/* Métricas Financeiras Editáveis */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #0ea5e9'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e', marginBottom: '16px' }}>
            📊 Métricas Financeiras
          </h5>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {/* Receita */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <h6 style={{ color: '#0c4a6e', fontWeight: '600', margin: '0 0 12px 0' }}>💰 Receita</h6>
              <div style={{ display: 'grid', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.receita?.valor || ''}
                  onChange={(e) => updateMetrica('receita', 'valor', parseFloat(e.target.value) || 0)}
                  placeholder="1234.5"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <select
                  value={analise.metricas.receita?.unidade || 'milhões'}
                  onChange={(e) => updateMetrica('receita', 'unidade', e.target.value)}
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                >
                  <option value="milhões">R$ Milhões</option>
                  <option value="bilhões">R$ Bilhões</option>
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.receita?.variacaoYoY || ''}
                  onChange={(e) => updateMetrica('receita', 'variacaoYoY', parseFloat(e.target.value) || undefined)}
                  placeholder="Variação A/A (%)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* EBITDA */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <h6 style={{ color: '#0c4a6e', fontWeight: '600', margin: '0 0 12px 0' }}>📈 EBITDA</h6>
              <div style={{ display: 'grid', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.ebitda?.valor || ''}
                  onChange={(e) => updateMetrica('ebitda', 'valor', parseFloat(e.target.value) || 0)}
                  placeholder="185.7"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.ebitda?.margem || ''}
                  onChange={(e) => updateMetrica('ebitda', 'margem', parseFloat(e.target.value) || undefined)}
                  placeholder="Margem (%)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.ebitda?.variacaoYoY || ''}
                  onChange={(e) => updateMetrica('ebitda', 'variacaoYoY', parseFloat(e.target.value) || undefined)}
                  placeholder="Variação A/A (%)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Lucro Líquido */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <h6 style={{ color: '#0c4a6e', fontWeight: '600', margin: '0 0 12px 0' }}>💎 Lucro Líquido</h6>
              <div style={{ display: 'grid', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.lucroLiquido?.valor || ''}
                  onChange={(e) => updateMetrica('lucroLiquido', 'valor', parseFloat(e.target.value) || 0)}
                  placeholder="89.2"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.lucroLiquido?.margem || ''}
                  onChange={(e) => updateMetrica('lucroLiquido', 'margem', parseFloat(e.target.value) || undefined)}
                  placeholder="Margem (%)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.lucroLiquido?.variacaoYoY || ''}
                  onChange={(e) => updateMetrica('lucroLiquido', 'variacaoYoY', parseFloat(e.target.value) || undefined)}
                  placeholder="Variação A/A (%)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* ROE */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '16px', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
              <h6 style={{ color: '#0c4a6e', fontWeight: '600', margin: '0 0 12px 0' }}>🎯 ROE</h6>
              <div style={{ display: 'grid', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.roe?.valor || ''}
                  onChange={(e) => updateMetrica('roe', 'valor', parseFloat(e.target.value) || 0)}
                  placeholder="15.3"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                  type="number"
                  step="0.1"
                  value={analise.metricas.roe?.variacaoYoY || ''}
                  onChange={(e) => updateMetrica('roe', 'variacaoYoY', parseFloat(e.target.value) || undefined)}
                  placeholder="Variação A/A (p.p.)"
                  style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '14px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recomendação */}
        <div style={{
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #d8b4fe'
        }}>
          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#7c2d12', marginBottom: '16px' }}>
            🎯 Recomendação de Investimento
          </h5>

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
  <div>
    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
      Recomendação
    </label>
    <select
      value={analise.recomendacao}
      onChange={(e) => updateField('recomendacao', e.target.value as AnaliseTrimestreData['recomendacao'])}
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
      Nota (0-10)
    </label>
    <input
      type="number"
      step="0.1"
      min="0"
      max="10"
      value={analise.nota || ''}
      onChange={(e) => updateField('nota', parseFloat(e.target.value) || undefined)}
      style={{
        width: '100%',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '14px',
        boxSizing: 'border-box'
      }}
      placeholder="8.5"
    />
  </div>
</div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTES DE LISTAGEM (mantidos iguais, mas com keys corrigidas)
// ============================================================================

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
  const analisesPublicadas = analises.filter(a => a.status === 'published');
  
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {analisesPublicadas.length === 0 ? (
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
            Nenhuma Análise Publicada
          </h3>
          <p style={{ fontSize: '16px', color: '#64748b' }}>
            Publique suas primeiras análises para vê-las aqui.
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
            📊 Análises Publicadas ({analisesPublicadas.length})
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {analisesPublicadas.map((analise, index) => {
              // CORRIGIDO: Key única garantida
              const keyUnica = analise.id || `publicada-${analise.ticker}-${index}-${Date.now()}`;
              
              return (
                <div key={keyUnica} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' }}>
                        {analise.titulo}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                        {analise.ticker} • {analise.empresa} • {analise.trimestre}
                        {analise.fonteDados === 'pdf' && (
                          <span style={{ 
                            marginLeft: '8px', 
                            backgroundColor: '#fbbf24', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            📄 PDF
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(analise.dataPublicacao).toLocaleDateString('pt-BR')}
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
                          fontWeight: '600'
                        }}
                      >
                        Editar
                      </button>
                      
                      <button
                        onClick={() => onUnpublish(analise.id!)}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Despublicar
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta análise?')) {
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
                          fontWeight: '600'
                        }}
                      >
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
          <p style={{ fontSize: '16px', color: '#64748b' }}>
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
            {rascunhos.map((analise, index) => {
              // CORRIGIDO: Key única garantida
              const keyUnica = analise.id || `rascunho-${analise.ticker}-${index}-${Date.now()}`;
              
              return (
                <div key={keyUnica} style={{
                  border: '1px solid #fde68a',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#fefce8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: '0 0 8px 0' }}>
                        {analise.titulo || 'Título não definido'}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                        {analise.ticker || 'Ticker'} • {analise.empresa || 'Empresa'} • {analise.trimestre || 'Trimestre'}
                        {analise.fonteDados === 'pdf' && (
                          <span style={{ 
                            marginLeft: '8px', 
                            backgroundColor: '#fbbf24', 
                            color: 'white', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            📄 PDF
                          </span>
                        )}
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
                          fontWeight: '600'
                        }}
                      >
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
                          fontWeight: '600'
                        }}
                      >
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
                          fontWeight: '600'
                        }}
                      >
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

// ============================================================================
// COMPONENTE PRINCIPAL COM APIS REAIS - CORRIGIDO
// ============================================================================

const AdminAnalisesTrimesestrais = () => {
  const [analises, setAnalises] = useState<AnaliseTrimestreData[]>([]);
  const [activeTab, setActiveTab] = useState<'criar' | 'publicadas' | 'rascunhos'>('criar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analiseEditando, setAnaliseEditando] = useState<AnaliseTrimestreData | null>(null);

  const totalAnalises = analises.length;
  const analisesDraft = analises.filter(a => a.status === 'draft').length;
  const analisesPublicadas = analises.filter(a => a.status === 'published').length;

  // ✅ CARREGAMENTO VIA API REAL
  useEffect(() => {
    const loadAnalises = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Carregando análises via API...');
        const analisesCarregadas = await analiseAPI.listar();
        
        console.log(`✅ ${analisesCarregadas.length} análises carregadas`);
        setAnalises(analisesCarregadas);
        
      } catch (error) {
        console.error('❌ Erro ao carregar análises:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        setError(`Erro ao carregar análises: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalises();
  }, []);

  // ✅ SALVAR VIA API REAL - CORRIGIDO
  const saveAnalise = useCallback(async (analise: AnaliseTrimestreData) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('💾 Salvando análise via API...', analise.ticker);
      
      let analiseSalva: AnaliseTrimestreData;
      
      const isEdit = analise.id && 
                     analise.id !== 'temp' && 
                     !analise.id.startsWith('temp-') &&
                     analises.some(a => a.id === analise.id);
      
      if (isEdit) {
        analiseSalva = await analiseAPI.atualizar(analise.id!, analise);
        setAnalises(prev => prev.map(a => a.id === analiseSalva.id ? analiseSalva : a));
        console.log('✅ Análise atualizada com sucesso:', analiseSalva.id);
      } else {
        // CORRIGIDO: Para novas análises, remover o id temporário
        const { id, ...analiseParaCriar } = analise;
        analiseSalva = await analiseAPI.criar(analiseParaCriar);
        setAnalises(prev => [...prev, analiseSalva]);
        console.log('✅ Análise criada com sucesso:', analiseSalva.id);
      }
      
      setAnaliseEditando(null);
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao salvar: ${errorMessage}`);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [analises]);

  // ✅ PUBLICAR/DESPUBLICAR VIA API REAL
  const publishAnalise = useCallback(async (id: string) => {
    const analise = analises.find(a => a.id === id);
    if (!analise) return;
    
    const analisePublicada = { ...analise, status: 'published' as const };
    await saveAnalise(analisePublicada);
  }, [analises, saveAnalise]);

  const unpublishAnalise = useCallback(async (id: string) => {
    const analise = analises.find(a => a.id === id);
    if (!analise) return;
    
    const analiseRascunho = { ...analise, status: 'draft' as const };
    await saveAnalise(analiseRascunho);
  }, [analises, saveAnalise]);

  // ✅ DELETAR VIA API REAL
  const deleteAnalise = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    
    try {
      console.log('🗑️ Deletando análise via API:', id);
      
      await analiseAPI.deletar(id);
      setAnalises(prev => prev.filter(a => a.id !== id));
      
      console.log('✅ Análise deletada com sucesso');
      alert('✅ Análise excluída com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao deletar: ${errorMessage}`);
      alert(`❌ Erro ao excluir análise: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }, []);

  const editAnalise = useCallback((analise: AnaliseTrimestreData) => {
    console.log('✏️ Editando análise:', analise.id);
    
    const analiseExistente = analises.find(a => a.id === analise.id);
    
    if (!analiseExistente) {
      console.error('❌ Análise não encontrada no estado local:', analise.id);
      alert('❌ Erro: Análise não encontrada. Recarregue a página.');
      return;
    }
    
    setAnaliseEditando(analiseExistente);
    setActiveTab('criar');
  }, [analises]);

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
      {/* Header */}
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
                borderBottom: activeTab === 'criar' ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
              {analiseEditando ? 'Editar Análise' : 'Criar Análises'}
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
                borderBottom: activeTab === 'publicadas' ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
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
                borderBottom: activeTab === 'rascunhos' ? '3px solid #3b82f6' : '3px solid transparent'
              }}
            >
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
                  <CriarAnaliseForm 
                    key={analiseEditando.id} 
                    analiseEditando={analiseEditando}
                    onSave={saveAnalise} 
                  />
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
      </div>
    </div>
  );
};

export default AdminAnalisesTrimesestrais;