'use client';

/**
 * RELATÓRIO SEMANAL - LAYOUT OTIMIZADO
 * 
 * ✅ Melhorias implementadas:
 * - Header compacto e responsivo (70% menor)
 * - Ícones uniformes com fundo cinza escuro
 * - Cards otimizados com melhor proporção
 * - Tipografia responsiva com clamp()
 * - Layout 100% mobile-friendly
 * - Design clean e profissional
 * - Performance otimizada
 * 
 * 🆕 NOVA FUNCIONALIDADE:
 * - Integração com API Brapi para logos das empresas
 * - Cache inteligente para evitar chamadas desnecessárias
 * - Sistema de fallback robusto
 * - Loading states suaves
 * - Logs detalhados para debugging
 * 
 * 📝 TIPOGRAFIA APRIMORADA:
 * - Fontes significativamente maiores no desktop
 * - Títulos de cards: 18-22px (era 16-18px)
 * - Texto principal: 14-17px (era 13px)
 * - Headers de seção: 20-28px (era 18-24px)
 * - Espaçamentos maiores e mais respiração
 * - Mantém responsividade total para mobile
 */

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Globe, Building, Zap, AlertCircle, CheckCircle, BarChart3, Lock } from 'lucide-react';

// Componente para renderizar HTML formatado com segurança
interface HTMLContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const HTMLContent: React.FC<HTMLContentProps> = ({
  content,
  className = '',
  style = {}
}) => {
  if (!content) return null;

  const sanitizeHTML = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  };

  const cleanContent = sanitizeHTML(content);

  return (
    <div
      className={`html-content ${className}`}
      style={{
        lineHeight: '1.6',
        fontSize: '16px', // Tamanho base maior para desktop
        color: '#4b5563',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

// CSS responsivo para o conteúdo HTML com fontes maiores
const HTMLContentStyles = () => (
  <style>{`
    .html-content {
      word-wrap: break-word;
    }
    
    .html-content p {
      margin: 0 0 10px 0;
    }
    
    .html-content strong, .html-content b {
      font-weight: 600;
      color: #1f2937;
    }
    
    .html-content em, .html-content i {
      font-style: italic;
    }
    
    .html-content u {
      text-decoration: underline;
    }
    
    .html-content a {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .html-content ul, .html-content ol {
      margin: 10px 0;
      padding-left: 24px;
    }
    
    .html-content li {
      margin: 6px 0;
    }
    
    /* Responsividade com fontes maiores */
    @media (min-width: 769px) {
      .html-content {
        font-size: 16px; /* Aumentado para desktop */
      }
      
      .html-content ul, .html-content ol {
        padding-left: 28px;
      }
    }
    
    @media (max-width: 768px) {
      .html-content {
        font-size: 14px; /* Mantido para mobile */
      }
      
      .html-content ul, .html-content ol {
        padding-left: 20px;
      }
    }
  `}</style>
);

// Header redesenhado - muito mais compacto e responsivo com gradiente preto e verde vibrante
const ReportHeader = ({ relatorio, planName }: { relatorio: any; planName?: string }) => (
  <div style={{
    background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #2d2d2d 75%, #000000 100%)',
    color: 'white',
    padding: '20px 16px 30px',
    textAlign: 'center',
    position: 'relative'
  }}>
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Badge do plano */}
      {planName && (
        <div style={{
          background: '#4cfa00',
          color: 'black', // Mudei para preto para melhor contraste com o verde vibrante
          padding: '4px 12px',
          borderRadius: '12px',
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {planName}
        </div>
      )}
      
      {/* Título principal responsivo */}
      <h1 style={{
        fontSize: 'clamp(20px, 5vw, 32px)',
        fontWeight: '700',
        margin: '0 0 8px 0',
        lineHeight: '1.2'
      }}>
        Relatório de Atualização
      </h1>
      
      {/* Subtítulo */}
      <p style={{
        fontSize: 'clamp(12px, 3vw, 14px)',
        color: '#94a3b8',
        margin: '0 0 16px 0',
        fontWeight: '500',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        Ações Brasileiras • Exterior
      </p>
      
      {/* Data */}
      <div style={{
        fontSize: 'clamp(14px, 3.5vw, 18px)',
        fontWeight: '600',
        color: '#4cfa00'
      }}>
        {relatorio?.date ? new Date(relatorio.date).toLocaleDateString('pt-BR', { 
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }) : 'Carregando...'}
      </div>
      
      {/* Logo compacto */}
      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: '#4cfa00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BarChart3 size={18} style={{ color: 'black' }} />
        </div>
        <span style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#e2e8f0'
        }}>
          FATOS DA BOLSA
        </span>
      </div>
    </div>
  </div>
);

// Seção bloqueada redesenhada com fontes maiores
const BlockedSection = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div style={{
    backgroundColor: '#f8fafc',
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: 'clamp(24px, 3vw, 32px) 16px',
    marginBottom: '20px',
    textAlign: 'center',
    position: 'relative'
  }}>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'clamp(48px, 6vw, 56px)',
      height: 'clamp(48px, 6vw, 56px)',
      borderRadius: '12px',
      backgroundColor: '#fee2e2',
      marginBottom: 'clamp(12px, 2vw, 16px)'
    }}>
      <Lock size={26} style={{ color: '#dc2626' }} />
    </div>
    
    <h3 style={{
      fontSize: 'clamp(18px, 4vw, 24px)', // Aumentado
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 10px 0'
    }}>
      {title}
    </h3>
    
    <p style={{
      fontSize: 'clamp(14px, 2.5vw, 16px)', // Aumentado
      color: '#6b7280',
      margin: 0
    }}>
      🔒 Conteúdo exclusivo - Upgrade necessário
    </p>
  </div>
);

// Header de seção redesenhado com ícones cinza escuro e melhor espaçamento
const SectionHeader = ({ icon: Icon, title, color, count }: { icon: any, title: string, color: string, count: number }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(20px, 3vw, 28px) clamp(16px, 2.5vw, 24px)', // Padding maior e responsivo
    marginBottom: 'clamp(16px, 2.5vw, 24px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${color}20`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
      <div style={{
        width: 'clamp(40px, 5vw, 48px)', // Ícone ligeiramente maior no desktop
        height: 'clamp(40px, 5vw, 48px)',
        backgroundColor: '#374151', // Cinza escuro para todos os ícones
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={22} style={{ color: 'white' }} />
      </div>
      
      <div style={{ flex: 1 }}>
        <h2 style={{
          fontSize: 'clamp(20px, 4vw, 28px)', // Aumentado para desktop
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 6px 0'
        }}>
          {title}
        </h2>
        {count > 0 && (
          <p style={{
            fontSize: 'clamp(13px, 2vw, 15px)', // Ligeiramente maior
            color: '#6b7280',
            margin: 0,
            fontWeight: '500'
          }}>
            {count} {count === 1 ? 'item' : 'itens'}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Cache para logos para evitar múltiplas chamadas à API
const logoCache = new Map<string, string>();

// Função para buscar logo da API Brapi
const fetchCompanyLogo = async (ticker: string): Promise<string | null> => {
  try {
    // Verificar cache primeiro
    if (logoCache.has(ticker)) {
      return logoCache.get(ticker) || null;
    }

    const response = await fetch(
      `https://brapi.dev/api/quote/${ticker}?token=jJrMYVy9MATGEicx3GxBp8&fundamental=false&dividends=false`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.results?.[0]?.logourl) {
      const logoUrl = data.results[0].logourl;
      logoCache.set(ticker, logoUrl); // Salvar no cache
      return logoUrl;
    }
    
    // Se não encontrou logo, marcar no cache como null
    logoCache.set(ticker, '');
    return null;
    
  } catch (error) {
    console.log(`❌ [BRAPI] Erro ao buscar logo para ${ticker}:`, error);
    logoCache.set(ticker, ''); // Marcar como tentativa falhada
    return null;
  }
};

// Logo da empresa com integração Brapi
const CompanyLogo = ({ ticker, fallbackColor }: { ticker: string, fallbackColor: string }) => {
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [logoError, setLogoError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    console.log(`🔍 [BRAPI] Buscando logo para: ${ticker}`);
    
    const loadLogo = async () => {
      try {
        const logoUrl = await fetchCompanyLogo(ticker);
        
        if (logoUrl) {
          console.log(`✅ [BRAPI] Logo encontrado para ${ticker}: ${logoUrl}`);
          setLogoSrc(logoUrl);
        } else {
          console.log(`⚠️ [BRAPI] Nenhum logo encontrado para ${ticker}`);
          setLogoError(true);
        }
      } catch (error) {
        console.log(`❌ [BRAPI] Erro ao carregar logo para ${ticker}:`, error);
        setLogoError(true);
      } finally {
        setLoading(false);
      }
    };

    loadLogo();
  }, [ticker]);

  // Mostrar loading
  if (loading) {
    return (
      <div style={{
        width: '40px',
        height: '40px',
        background: `${fallbackColor}10`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${fallbackColor}20`
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: `2px solid ${fallbackColor}30`,
          borderTop: `2px solid ${fallbackColor}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Fallback se não encontrou logo ou erro
  if (logoError || !logoSrc) {
    return (
      <div style={{
        width: '40px',
        height: '40px',
        background: `${fallbackColor}15`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${fallbackColor}30`,
        fontSize: '11px',
        fontWeight: '700',
        color: fallbackColor,
        textAlign: 'center'
      }}>
        {ticker?.substring(0, 4) || 'TICK'}
      </div>
    );
  }

  // Mostrar logo encontrado
  return (
    <div style={{
      width: '40px',
      height: '40px',
      backgroundColor: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${fallbackColor}20`,
      overflow: 'hidden'
    }}>
      <img 
        src={logoSrc}
        alt={`Logo ${ticker}`}
        style={{
          width: '32px',
          height: '32px',
          objectFit: 'contain'
        }}
        onError={() => {
          console.log(`❌ [BRAPI] Erro ao exibir logo de ${ticker}`);
          setLogoError(true);
        }}
      />
    </div>
  );
};

// Card de ação redesenhado e responsivo com fontes maiores
const StockCard = ({ item, sectionColor }: { item: any, sectionColor: string }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(16px, 2.5vw, 24px)', // Padding responsivo
    marginBottom: 'clamp(12px, 2vw, 20px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${sectionColor}15`
  }}>
    {/* Header com logo e ticker */}
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      marginBottom: 'clamp(12px, 2vw, 18px)',
      gap: 'clamp(12px, 2vw, 16px)'
    }}>
      <CompanyLogo ticker={item.ticker} fallbackColor={sectionColor} />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '6px',
          flexWrap: 'wrap'
        }}>
          <h3 style={{
            fontSize: 'clamp(18px, 3vw, 22px)', // Aumentado significativamente
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          {item.impact && (
            <span style={{
              fontSize: 'clamp(10px, 1.5vw, 12px)',
              fontWeight: '600',
              color: item.impact === 'positive' ? '#059669' : item.impact === 'negative' ? '#dc2626' : '#6b7280',
              backgroundColor: item.impact === 'positive' ? '#ecfdf5' : item.impact === 'negative' ? '#fef2f2' : '#f3f4f6',
              padding: '3px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {item.impact === 'positive' ? 'Positivo' : item.impact === 'negative' ? 'Negativo' : 'Neutro'}
            </span>
          )}
        </div>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
          color: '#6b7280',
          margin: 0,
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.company}
        </p>
      </div>
    </div>

    {/* Título da notícia */}
    <h4 style={{
      fontSize: 'clamp(16px, 2.8vw, 20px)', // Aumentado bastante
      fontWeight: '600',
      color: '#1f2937',
      margin: '0 0 12px 0',
      lineHeight: '1.4'
    }}>
      {item.news || item.title}
    </h4>

    {/* Resumo */}
    {item.summary && (
      <HTMLContent 
        content={item.summary}
        style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)', // Aumentado
          color: '#4b5563',
          lineHeight: '1.6',
          margin: '0 0 16px 0'
        }}
      />
    )}

    {/* Destaque */}
    {item.highlight && (
      <div style={{
        padding: 'clamp(12px, 2vw, 16px)',
        margin: '12px 0',
        borderLeft: `3px solid ${sectionColor}`,
        backgroundColor: `${sectionColor}08`,
        borderRadius: '0 6px 6px 0'
      }}>
        <div style={{
          fontSize: 'clamp(11px, 1.8vw, 13px)',
          fontWeight: '600',
          color: sectionColor,
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>
          💡 Destaque
        </div>
        <HTMLContent 
          content={item.highlight}
          style={{
            fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
            color: '#374151',
            margin: 0,
            fontWeight: '500'
          }}
        />
      </div>
    )}

    {/* Recomendação */}
    {item.recommendation && (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: 'clamp(12px, 2vw, 16px)',
        marginTop: '12px'
      }}>
        <div style={{
          fontSize: 'clamp(11px, 1.8vw, 13px)',
          fontWeight: '600',
          color: '#166534',
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>
          Recomendação
        </div>
        <HTMLContent 
          content={item.recommendation}
          style={{
            fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
            color: '#166534',
            margin: 0,
            fontWeight: '500'
          }}
        />
      </div>
    )}

    {/* Tags */}
    {(item.sectors?.length > 0 || item.recommendations?.length > 0) && (
      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px' 
      }}>
        {item.sectors?.map((setor: string, index: number) => (
          <span key={index} style={{
            fontSize: 'clamp(10px, 1.5vw, 12px)',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: '500'
          }}>
            {setor}
          </span>
        ))}
        {item.recommendations?.map((rec: string, index: number) => (
          <span key={index} style={{
            fontSize: 'clamp(10px, 1.5vw, 12px)',
            color: '#059669',
            backgroundColor: '#ecfdf5',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: '600'
          }}>
            {rec}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Card de provento redesenhado com fontes maiores
const ProventoCard = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(16px, 2.5vw, 24px)', // Padding responsivo
    marginBottom: 'clamp(12px, 2vw, 20px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #10b98115'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-start', 
      marginBottom: 'clamp(12px, 2vw, 18px)',
      gap: 'clamp(12px, 2vw, 16px)'
    }}>
      <CompanyLogo ticker={item.ticker} fallbackColor="#10b981" />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '6px',
          flexWrap: 'wrap'
        }}>
          <h3 style={{
            fontSize: 'clamp(18px, 3vw, 22px)', // Aumentado
            fontWeight: '700',
            color: '#1f2937',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          <span style={{
            fontSize: 'clamp(10px, 1.5vw, 12px)',
            fontWeight: '600',
            color: item.type === 'JCP' ? '#7c3aed' : '#2563eb',
            backgroundColor: item.type === 'JCP' ? '#f3e8ff' : '#eff6ff',
            padding: '3px 8px',
            borderRadius: '4px'
          }}>
            {item.type}
          </span>
        </div>
        <p style={{
          fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
          color: '#6b7280',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {item.company}
        </p>
      </div>
    </div>

    {/* Grid responsivo para dados com fontes maiores */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', 
      gap: 'clamp(12px, 2vw, 20px)',
      marginTop: '16px'
    }}>
      <div>
        <div style={{ 
          fontSize: 'clamp(11px, 1.8vw, 13px)', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          Valor
        </div>
        <div style={{ 
          fontSize: 'clamp(16px, 2.5vw, 18px)', // Aumentado 
          fontWeight: '700', 
          color: '#1f2937' 
        }}>
          {item.value}
        </div>
      </div>
      <div>
        <div style={{ 
          fontSize: 'clamp(11px, 1.8vw, 13px)', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          DY
        </div>
        <div style={{ 
          fontSize: 'clamp(16px, 2.5vw, 18px)', // Aumentado
          fontWeight: '700', 
          color: '#10b981' 
        }}>
          {item.dy}
        </div>
      </div>
      <div>
        <div style={{ 
          fontSize: 'clamp(11px, 1.8vw, 13px)', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          Data-com
        </div>
        <div style={{ 
          fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
          fontWeight: '600', 
          color: '#1f2937' 
        }}>
          {item.exDate ? new Date(item.exDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
      <div>
        <div style={{ 
          fontSize: 'clamp(11px, 1.8vw, 13px)', 
          color: '#6b7280', 
          marginBottom: '4px',
          fontWeight: '500'
        }}>
          Pagamento
        </div>
        <div style={{ 
          fontSize: 'clamp(14px, 2.2vw, 16px)', // Aumentado
          fontWeight: '600', 
          color: '#1f2937' 
        }}>
          {item.payDate ? new Date(item.payDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
    </div>
  </div>
);

// Componente principal
export default function RelatorioSemanalPage() {
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock do hook de auth para demonstração
  const planInfo = { displayName: 'Plano Premium' };
  const hasAccessToSection = (section: string) => {
    // Mock: algumas seções liberadas, outras bloqueadas
    return ['macro', 'proventos', 'dividendos'].includes(section);
  };

  useEffect(() => {
    // Simulando carregamento de dados
    setTimeout(() => {
      setRelatorio({
        date: new Date().toISOString(),
        status: 'published',
        macro: [
          {
            ticker: 'IBOV',
            company: 'Índice Bovespa',
            title: 'Ibovespa fecha em alta de 2,1%',
            news: 'Ibovespa fecha em alta de 2,1%',
            summary: '<p>O índice Bovespa encerrou o pregão desta sexta-feira em <strong>alta de 2,1%</strong>, aos 129.840 pontos, impulsionado pelos papéis do setor financeiro e commodities.</p><p>O volume financeiro negociado foi de R$ 18,2 bilhões.</p>',
            highlight: '<p>Destaque para <strong>VALE3</strong> (+3,8%) e <strong>PETR4</strong> (+2,9%) que lideraram as altas.</p>',
            impact: 'positive'
          }
        ],
        proventos: [
          {
            ticker: 'VALE3',
            company: 'Vale S.A.',
            type: 'Dividendo',
            value: 'R$ 2,50',
            dy: '3,2%',
            exDate: '2024-01-15',
            payDate: '2024-02-01'
          },
          {
            ticker: 'ITUB4',
            company: 'Itaú Unibanco',
            type: 'JCP',
            value: 'R$ 0,85',
            dy: '2,8%',
            exDate: '2024-01-20',
            payDate: '2024-02-10'
          },
          {
            ticker: 'BBAS3',
            company: 'Banco do Brasil',
            type: 'Dividendo',
            value: 'R$ 1,20',
            dy: '4,1%',
            exDate: '2024-01-25',
            payDate: '2024-02-15'
          }
        ],
        dividendos: [
          {
            ticker: 'BBDC4',
            company: 'Banco Bradesco',
            title: 'Bradesco anuncia dividendos de R$ 0,75',
            news: 'Bradesco anuncia dividendos de R$ 0,75',
            summary: '<p>O Bradesco anunciou o pagamento de <strong>R$ 0,75 por ação</strong> em dividendos, referente aos resultados do último trimestre.</p><p>O dividend yield projetado é de aproximadamente <strong>3,5%</strong>.</p>',
            impact: 'positive'
          },
          {
            ticker: 'PETR4',
            company: 'Petrobras',
            title: 'Petrobras distribui R$ 2,1 bi em dividendos',
            news: 'Petrobras distribui R$ 2,1 bi em dividendos',
            summary: '<p>A Petrobras aprovou a distribuição de <strong>R$ 2,1 bilhões</strong> em dividendos aos acionistas, equivalente a R$ 1,60 por ação.</p>',
            impact: 'positive'
          }
        ],
        smallCaps: [
          {
            ticker: 'ALOS3',
            company: 'Allos S.A.',
            title: 'Allos reporta crescimento de 15% na receita',
            news: 'Allos reporta crescimento de 15% na receita',
            summary: '<p>A Allos divulgou resultados do último trimestre com <strong>crescimento de 15%</strong> na receita líquida comparado ao mesmo período do ano anterior.</p>',
            impact: 'positive'
          }
        ],
        microCaps: [],
        exterior: [
          {
            ticker: 'AAPL',
            company: 'Apple Inc.',
            title: 'Apple lança novos produtos em evento',
            news: 'Apple lança novos produtos em evento',
            summary: '<p>A Apple apresentou seus novos produtos em evento especial, incluindo novos <strong>iPhones</strong> e <strong>MacBooks</strong> com chips mais avançados.</p>',
            impact: 'positive'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '300px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e5e7eb', 
            borderTop: '3px solid #10b981', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937', 
            marginBottom: '8px' 
          }}>
            Carregando Relatório
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Buscando o relatório semanal...
          </p>
        </div>
      </div>
    );
  }

  if (error || !relatorio) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '32px 20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px'
        }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h1 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '8px' 
          }}>
            {error ? 'Erro ao Carregar' : 'Relatório Não Disponível'}
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {error || 'O relatório semanal ainda não foi publicado.'}
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'macro', data: relatorio.macro, title: 'Panorama Macro', icon: Globe, color: '#2563eb' },
    { key: 'proventos', data: relatorio.proventos, title: 'Proventos', icon: DollarSign, color: '#10b981' },
    { key: 'dividendos', data: relatorio.dividendos, title: 'Dividendos', icon: Calendar, color: '#059669' },
    { key: 'smallCaps', data: relatorio.smallCaps, title: 'Small Caps', icon: Building, color: '#2563eb' },
    { key: 'microCaps', data: relatorio.microCaps, title: 'Micro Caps', icon: Zap, color: '#ea580c' },
    { key: 'exterior', data: relatorio.exterior, title: 'Exterior', icon: TrendingUp, color: '#7c3aed' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <HTMLContentStyles />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <ReportHeader relatorio={relatorio} planName={planInfo?.displayName} />
      
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(24px, 4vw, 40px) clamp(20px, 3vw, 30px)' // Padding maior e responsivo
      }}>
        {sections.map((section) => {
          const hasAccess = hasAccessToSection(section.key);
          const hasData = section.data && section.data.length > 0;
          
          if (!hasData) return null;
          
          if (!hasAccess) {
            return (
              <section key={section.key} style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
                <SectionHeader 
                  icon={section.icon}
                  title={section.title}
                  color={section.color}
                  count={section.data.length}
                />
                <BlockedSection 
                  icon={section.icon}
                  title={section.title}
                  color={section.color}
                />
              </section>
            );
          }
          
          return (
            <section key={section.key} style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
              <SectionHeader 
                icon={section.icon}
                title={section.title}
                color={section.color}
                count={section.data.length}
              />
              
              <div>
                {section.data.map((item: any, index: number) => (
                  section.key === 'proventos' ? (
                    <ProventoCard key={index} item={item} />
                  ) : (
                    <StockCard key={index} item={item} sectionColor={section.color} />
                  )
                ))}
              </div>
            </section>
          );
        })}
        
        {/* Rodapé compacto */}
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: '#4cfa00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={14} style={{ color: 'white' }} />
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              FATOS DA BOLSA
            </span>
          </div>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '12px',
            margin: '0 0 4px 0'
          }}>
            © Fatos da Bolsa - contato@fatosdabolsa.com.br
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '11px',
            margin: 0
          }}>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}