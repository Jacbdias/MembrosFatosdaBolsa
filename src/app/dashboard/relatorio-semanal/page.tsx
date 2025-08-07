'use client';

/**
 * RELATÓRIO SEMANAL - VISUALIZAÇÃO COM PERMISSÕES ATUALIZADAS
 * 
 * ✅ Ajustes implementados:
 * - Internacional separado em 4 subcategorias
 * - Proventos integrados em cada seção
 * - Permissões granulares por plano
 * - Identificação visual de proventos vs notícias
 */

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Globe, Building, Zap, AlertCircle, CheckCircle, BarChart3, Lock, PieChart, LineChart, Coins, Target } from 'lucide-react';

// Interface unificada para items
interface ItemRelatorio {
  ticker: string;
  empresa?: string;
  company?: string; // compatibilidade
  
  // Identificador de tipo
  isProvento?: boolean;
  
  // Campos para notícias
  titulo?: string;
  title?: string; // compatibilidade
  news?: string; // compatibilidade
  resumo?: string;
  summary?: string; // compatibilidade
  analise?: string;
  impacto?: 'positivo' | 'negativo' | 'neutro';
  impact?: 'positive' | 'negative' | 'neutral'; // compatibilidade
  highlight?: string;
  destaque?: string;
  recomendacao?: 'COMPRA' | 'VENDA' | 'MANTER';
  precoAlvo?: number;
  
  // Campos para proventos
  tipoProvento?: 'Dividendo' | 'JCP' | 'Bonificação';
  type?: string; // compatibilidade
  valor?: string;
  value?: string; // compatibilidade
  dy?: string;
  datacom?: string;
  exDate?: string; // compatibilidade
  pagamento?: string;
  payDate?: string; // compatibilidade
}

interface RelatorioData {
  id?: string;
  date: string;
  weekOf?: string;
  semana?: string;
  titulo?: string;
  autor?: string;
  status: 'draft' | 'published';
  
  // Seções nacionais
  macro: ItemRelatorio[];
  dividendos: ItemRelatorio[];
  smallCaps: ItemRelatorio[];
  microCaps: ItemRelatorio[];
  
  // Internacional separado
  exteriorStocks?: ItemRelatorio[];
  exteriorETFs?: ItemRelatorio[];
  exteriorDividendos?: ItemRelatorio[];
  exteriorProjetoAmerica?: ItemRelatorio[];
  
  // Campo legado
  exterior?: ItemRelatorio[];
}

// Import do hook de autenticação
import { useAuthAccess } from '@/hooks/use-auth-access';

// 🆕 MAPEAMENTO ATUALIZADO COM INTERNACIONAL SEPARADO
const mapearSecaoParaPermissao = (sectionKey: string, userPermissions: string[]): boolean => {
  // Macro é sempre visível
  if (sectionKey === 'macro') return true;
  
  // Mapeamento nacional
  const mapeamentoNacional: Record<string, string> = {
    'dividendos': 'dividendos',
    'smallCaps': 'small-caps',
    'microCaps': 'micro-caps'
  };
  
  // Se é seção nacional, verificar permissão direta
  if (mapeamentoNacional[sectionKey]) {
    return userPermissions.includes(mapeamentoNacional[sectionKey]);
  }
  
  // 🆕 MAPEAMENTO INTERNACIONAL GRANULAR
  if (sectionKey === 'exteriorStocks' || sectionKey === 'exteriorETFs') {
    // LITE, VIP e AMERICA podem ver Stocks e ETFs
    return userPermissions.includes('internacional') || 
           userPermissions.includes('internacional-stocks') ||
           userPermissions.includes('internacional-etfs');
  }
  
  if (sectionKey === 'exteriorDividendos') {
    // Apenas VIP e AMERICA podem ver dividendos internacionais
    return userPermissions.includes('internacional-dividendos') ||
           (userPermissions.includes('internacional') && !userPermissions.includes('internacional-stocks')); // VIP tem 'internacional' completo
  }
  
  if (sectionKey === 'exteriorProjetoAmerica') {
    // Apenas AMERICA pode ver Projeto América
    return userPermissions.includes('internacional-projeto-america');
  }
  
  // Campo legado 'exterior' - usar lógica antiga
  if (sectionKey === 'exterior') {
    return userPermissions.includes('internacional');
  }
  
  return false;
};

// Componente para renderizar HTML com segurança
const HTMLContent: React.FC<{ content: string; style?: React.CSSProperties }> = ({ content, style = {} }) => {
  if (!content) return null;

  const sanitizeHTML = (html: string) => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '');
  };

  return (
    <div
      style={{
        lineHeight: '1.6',
        fontSize: '16px',
        color: '#4b5563',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
    />
  );
};

// Header do relatório
const ReportHeader = ({ relatorio, userInfo }: { relatorio: RelatorioData | null; userInfo?: { planName: string, permissions: string[] } }) => (
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
      {userInfo?.planName && (
        <div style={{
          background: '#4cfa00',
          color: 'black',
          padding: '4px 12px',
          borderRadius: '12px',
          display: 'inline-block',
          fontSize: '11px',
          fontWeight: '600',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {userInfo.planName}
        </div>
      )}
      
      <h1 style={{
        fontSize: 'clamp(20px, 5vw, 32px)',
        fontWeight: '700',
        margin: '0 0 8px 0',
        lineHeight: '1.2'
      }}>
        Relatório de Atualização Semanal
      </h1>
      
      <p style={{
        fontSize: 'clamp(12px, 3vw, 14px)',
        color: '#94a3b8',
        margin: '0 0 16px 0',
        fontWeight: '500',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        {relatorio?.semana || relatorio?.weekOf || 'Carregando...'}
      </p>
      
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

// Seção bloqueada
const BlockedSection = ({ title }: { title: string }) => (
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
      fontSize: 'clamp(18px, 4vw, 24px)',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 10px 0'
    }}>
      {title}
    </h3>
    
    <p style={{
      fontSize: 'clamp(14px, 2.5vw, 16px)',
      color: '#6b7280',
      margin: 0
    }}>
      🔒 Conteúdo exclusivo - Upgrade necessário
    </p>
  </div>
);

// Header de seção
const SectionHeader = ({ icon: Icon, title, color, count, proventosCount, noticiasCount }: { 
  icon: any, 
  title: string, 
  color: string, 
  count: number,
  proventosCount?: number,
  noticiasCount?: number
}) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(20px, 3vw, 28px) clamp(16px, 2.5vw, 24px)',
    marginBottom: 'clamp(16px, 2.5vw, 24px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${color}20`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)' }}>
      <div style={{
        width: 'clamp(40px, 5vw, 48px)',
        height: 'clamp(40px, 5vw, 48px)',
        backgroundColor: color,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={22} style={{ color: 'white' }} />
      </div>
      
      <div style={{ flex: 1 }}>
        <h2 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 6px 0'
        }}>
          {title}
        </h2>
        {count > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <p style={{
              fontSize: 'clamp(13px, 2vw, 15px)',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500'
            }}>
              {count} {count === 1 ? 'item' : 'itens'}
            </p>
            {(proventosCount !== undefined && proventosCount > 0) && (
              <span style={{
                fontSize: 'clamp(11px, 1.8vw, 13px)',
                color: '#059669',
                fontWeight: '600'
              }}>
                💰 {proventosCount} provento{proventosCount > 1 ? 's' : ''}
              </span>
            )}
            {(noticiasCount !== undefined && noticiasCount > 0) && (
              <span style={{
                fontSize: 'clamp(11px, 1.8vw, 13px)',
                color: '#2563eb',
                fontWeight: '600'
              }}>
                📰 {noticiasCount} notícia{noticiasCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Cache para logos das empresas
const logoCache = new Map<string, string>();

// Função para buscar logo da empresa
const fetchCompanyLogo = async (ticker: string): Promise<string | null> => {
  try {
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
      logoCache.set(ticker, logoUrl);
      return logoUrl;
    }
    
    logoCache.set(ticker, '');
    return null;
    
  } catch (error) {
    console.log(`❌ [BRAPI] Erro ao buscar logo para ${ticker}:`, error);
    logoCache.set(ticker, '');
    return null;
  }
};

// Componente para exibir logo da empresa
const CompanyLogo = ({ ticker, fallbackColor, isProvento }: { ticker: string, fallbackColor: string, isProvento?: boolean }) => {
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [logoError, setLogoError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    const loadLogo = async () => {
      try {
        const logoUrl = await fetchCompanyLogo(ticker);
        
        if (logoUrl) {
          setLogoSrc(logoUrl);
        } else {
          setLogoError(true);
        }
      } catch (error) {
        setLogoError(true);
      } finally {
        setLoading(false);
      }
    };

    loadLogo();
  }, [ticker]);

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

  if (logoError || !logoSrc) {
    return (
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: isProvento ? '#fbbf24' : fallbackColor,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        {isProvento ? '💰' : '📰'}
      </div>
    );
  }

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
      overflow: 'hidden',
      position: 'relative'
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
          setLogoError(true);
        }}
      />
      {isProvento && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '18px',
          height: '18px',
          backgroundColor: '#fbbf24',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}>
          💰
        </div>
      )}
    </div>
  );
};

// 🆕 Card unificado para notícias e proventos
const ItemCard = ({ item, sectionColor }: { item: ItemRelatorio, sectionColor: string }) => {
  // Normalizar campos para compatibilidade
  const ticker = item.ticker;
  const empresa = item.empresa || item.company || '';
  const isProvento = item.isProvento || item.type || item.tipoProvento || item.value || item.valor;
  
  return (
    <div style={{
      backgroundColor: isProvento ? '#fefce8' : 'white',
      borderRadius: '12px',
      padding: 'clamp(16px, 2.5vw, 24px)',
      marginBottom: 'clamp(12px, 2vw, 20px)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: `1px solid ${isProvento ? '#fde68a' : `${sectionColor}15`}`
    }}>
      {/* Header com ticker e empresa */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        marginBottom: 'clamp(12px, 2vw, 18px)',
        gap: 'clamp(12px, 2vw, 16px)'
      }}>
        <CompanyLogo ticker={ticker} fallbackColor={sectionColor} isProvento={isProvento} />
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '6px',
            flexWrap: 'wrap'
          }}>
            <h3 style={{
              fontSize: 'clamp(18px, 3vw, 22px)',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>
              {ticker}
            </h3>
            
            {/* Badge de tipo */}
            {isProvento && (
              <span style={{
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                fontWeight: '600',
                color: '#92400e',
                backgroundColor: '#fef3c7',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {item.tipoProvento || item.type || 'Provento'}
              </span>
            )}
            
            {/* Badge de impacto para notícias */}
            {!isProvento && (item.impacto || item.impact) && (
              <span style={{
                fontSize: 'clamp(10px, 1.5vw, 12px)',
                fontWeight: '600',
                color: (item.impacto === 'positivo' || item.impact === 'positive') ? '#059669' : 
                       (item.impacto === 'negativo' || item.impact === 'negative') ? '#dc2626' : '#6b7280',
                backgroundColor: (item.impacto === 'positivo' || item.impact === 'positive') ? '#ecfdf5' : 
                                (item.impacto === 'negativo' || item.impact === 'negative') ? '#fef2f2' : '#f3f4f6',
                padding: '3px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                {(item.impacto === 'positivo' || item.impact === 'positive') ? 'Positivo' : 
                 (item.impacto === 'negativo' || item.impact === 'negative') ? 'Negativo' : 'Neutro'}
              </span>
            )}
          </div>
          
          <p style={{
            fontSize: 'clamp(14px, 2.2vw, 16px)',
            color: '#6b7280',
            margin: 0,
            fontWeight: '500'
          }}>
            {empresa}
          </p>
        </div>
      </div>

      {/* Conteúdo específico baseado no tipo */}
      {isProvento ? (
        // 💰 LAYOUT PARA PROVENTO
        <div>
          <h4 style={{
            fontSize: 'clamp(16px, 2.8vw, 20px)',
            fontWeight: '600',
            color: '#92400e',
            margin: '0 0 12px 0',
            lineHeight: '1.4'
          }}>
            {item.titulo || item.title || item.news || `${item.tipoProvento || item.type || 'Provento'} anunciado`}
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: 'clamp(12px, 2vw, 20px)',
            padding: '16px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fde68a'
          }}>
            {(item.valor || item.value) && (
              <div>
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 13px)', 
                  color: '#92400e', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Valor
                </div>
                <div style={{ 
                  fontSize: 'clamp(16px, 2.5vw, 18px)', 
                  fontWeight: '700', 
                  color: '#78350f' 
                }}>
                  {item.valor || item.value}
                </div>
              </div>
            )}
            
            {item.dy && (
              <div>
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 13px)', 
                  color: '#92400e', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Dividend Yield
                </div>
                <div style={{ 
                  fontSize: 'clamp(16px, 2.5vw, 18px)',
                  fontWeight: '700', 
                  color: '#10b981' 
                }}>
                  {item.dy}
                </div>
              </div>
            )}
            
            {(item.datacom || item.exDate) && (
              <div>
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 13px)', 
                  color: '#92400e', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Data-com
                </div>
                <div style={{ 
                  fontSize: 'clamp(14px, 2.2vw, 16px)',
                  fontWeight: '600', 
                  color: '#78350f' 
                }}>
                  {new Date(item.datacom || item.exDate || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
            
            {(item.pagamento || item.payDate) && (
              <div>
                <div style={{ 
                  fontSize: 'clamp(11px, 1.8vw, 13px)', 
                  color: '#92400e', 
                  marginBottom: '4px',
                  fontWeight: '500'
                }}>
                  Pagamento
                </div>
                <div style={{ 
                  fontSize: 'clamp(14px, 2.2vw, 16px)',
                  fontWeight: '600', 
                  color: '#78350f' 
                }}>
                  {new Date(item.pagamento || item.payDate || '').toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // 📰 LAYOUT PARA NOTÍCIA
        <div>
          <h4 style={{
            fontSize: 'clamp(16px, 2.8vw, 20px)',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 12px 0',
            lineHeight: '1.4'
          }}>
            {item.titulo || item.title || item.news}
          </h4>

          {(item.resumo || item.summary) && (
            <HTMLContent 
              content={item.resumo || item.summary || ''}
              style={{
                fontSize: 'clamp(14px, 2.2vw, 17px)',
                color: '#4b5563',
                lineHeight: '1.6',
                margin: '0 0 16px 0'
              }}
            />
          )}

          {(item.destaque || item.highlight) && (
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
                content={item.destaque || item.highlight || ''}
                style={{
                  fontSize: 'clamp(14px, 2.2vw, 16px)',
                  color: '#374151',
                  margin: 0,
                  fontWeight: '500'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente principal
export default function RelatorioSemanalPage() {
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook de autenticação e permissões
  let userPermissions: string[] = [];
  let planName: string = 'Carregando...';
  
  try {
    const authResult = useAuthAccess();
    
    if (authResult && authResult.planInfo) {
      userPermissions = authResult.planInfo.pages || [];
      planName = authResult.planInfo.displayName || 'Plano Padrão';
      
      // Se for admin, dar todas as permissões
      if (authResult.user?.plan === 'ADMIN') {
        userPermissions = [
          'small-caps', 'micro-caps', 'dividendos', 
          'fundos-imobiliarios', 'internacional',
          'internacional-stocks', 'internacional-etfs',
          'internacional-dividendos', 'internacional-projeto-america'
        ];
        planName = 'Administrador';
      }
      // 🆕 CONFIGURAÇÃO ESPECÍFICA PARA LITE
      else if (authResult.user?.plan === 'LITE' || authResult.user?.plan === 'LITE_V2') {
        // LITE tem acesso limitado ao internacional
        if (!userPermissions.includes('internacional-stocks')) {
          userPermissions.push('internacional-stocks', 'internacional-etfs');
        }
        // Remover acesso a dividendos internacionais e projeto américa se existir
        userPermissions = userPermissions.filter(p => 
          !p.includes('internacional-dividendos') && 
          !p.includes('internacional-projeto-america')
        );
      }
      
    } else {
      throw new Error('Hook retornou dados inválidos');
    }
    
  } catch (error) {
    console.warn('⚠️ Hook useAuthAccess falhou, usando fallback:', error);
    
    // Fallback para testes
    userPermissions = ['small-caps', 'dividendos', 'internacional-stocks', 'internacional-etfs'];
    planName = 'Fallback';
  }

  // Carregar relatório
  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        setLoading(true);
        
        // Buscar o relatório mais recente do IndexedDB
        const request = indexedDB.open('RelatoriosSemanaisDB', 3);
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('relatorios')) {
            setError('Nenhum relatório disponível');
            setLoading(false);
            return;
          }
          
          const transaction = db.transaction(['relatorios'], 'readonly');
          const store = transaction.objectStore('relatorios');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const relatorios = getAllRequest.result || [];
            
            // Filtrar apenas publicados e pegar o mais recente
            const publicados = relatorios
              .filter(r => r.status === 'published')
              .sort((a, b) => {
                if (b.semana && a.semana) return b.semana.localeCompare(a.semana);
                return 0;
              });
            
            if (publicados.length > 0) {
              const relatorioMaisRecente = publicados[0];
              
              // Migrar dados legados se necessário
              if (relatorioMaisRecente.exterior && !relatorioMaisRecente.exteriorStocks) {
                relatorioMaisRecente.exteriorStocks = relatorioMaisRecente.exterior;
                relatorioMaisRecente.exteriorETFs = [];
                relatorioMaisRecente.exteriorDividendos = [];
                relatorioMaisRecente.exteriorProjetoAmerica = [];
              }
              
              setRelatorio(relatorioMaisRecente);
            } else {
              setError('Nenhum relatório publicado disponível');
            }
            
            setLoading(false);
          };
          
          getAllRequest.onerror = () => {
            setError('Erro ao carregar relatórios');
            setLoading(false);
          };
        };
        
        request.onerror = () => {
          setError('Erro ao conectar com o banco de dados');
          setLoading(false);
        };
        
      } catch (error) {
        console.error('❌ Erro ao carregar relatório:', error);
        setError('Erro ao carregar relatório');
        setLoading(false);
      }
    };
    
    loadRelatorio();
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
            Buscando o relatório semanal mais recente...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
            {error || 'Relatório Não Disponível'}
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {error === 'Nenhum relatório publicado disponível' 
              ? 'Ainda não há relatórios publicados. Aguarde a publicação do próximo relatório.'
              : 'Ocorreu um erro ao carregar o relatório. Tente novamente mais tarde.'}
          </p>
        </div>
      </div>
    );
  }

  // 🆕 Configuração das seções com internacional separado
  const sections = [
    { 
      key: 'macro', 
      data: relatorio.macro, 
      title: 'Panorama Macro', 
      icon: Globe, 
      color: '#2563eb',
      alwaysVisible: true 
    },
    { 
      key: 'dividendos', 
      data: relatorio.dividendos, 
      title: 'Dividendos', 
      icon: DollarSign, 
      color: '#059669' 
    },
    { 
      key: 'smallCaps', 
      data: relatorio.smallCaps, 
      title: 'Small Caps', 
      icon: Building, 
      color: '#2563eb' 
    },
    { 
      key: 'microCaps', 
      data: relatorio.microCaps, 
      title: 'Micro Caps', 
      icon: Zap, 
      color: '#ea580c' 
    }
  ];

  // 🆕 Seções internacionais separadas
  const internationalSections = [
    { 
      key: 'exteriorStocks', 
      data: relatorio.exteriorStocks, 
      title: 'Internacional - Stocks', 
      icon: TrendingUp, 
      color: '#7c3aed',
      description: 'Ações internacionais individuais'
    },
    { 
      key: 'exteriorETFs', 
      data: relatorio.exteriorETFs, 
      title: 'Internacional - ETFs', 
      icon: LineChart, 
      color: '#6366f1',
      description: 'ETFs internacionais'
    },
    { 
      key: 'exteriorDividendos', 
      data: relatorio.exteriorDividendos, 
      title: 'Internacional - Dividendos', 
      icon: Coins, 
      color: '#0ea5e9',
      description: 'Empresas internacionais pagadoras de dividendos'
    },
    { 
      key: 'exteriorProjetoAmerica', 
      data: relatorio.exteriorProjetoAmerica, 
      title: 'Projeto América', 
      icon: Target, 
      color: '#dc2626',
      description: 'Conteúdo exclusivo do Projeto América'
    }
  ];

  // Se ainda tem dados no campo legado 'exterior', adicionar como fallback
  if (relatorio.exterior && relatorio.exterior.length > 0 && 
      (!relatorio.exteriorStocks || relatorio.exteriorStocks.length === 0)) {
    internationalSections.push({
      key: 'exterior' as any,
      data: relatorio.exterior,
      title: 'Internacional',
      icon: Globe,
      color: '#7c3aed',
      description: 'Notícias internacionais'
    });
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <ReportHeader 
        relatorio={relatorio} 
        userInfo={{ 
          planName: planName,
          permissions: userPermissions
        }} 
      />
      
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'clamp(24px, 4vw, 40px) clamp(20px, 3vw, 30px)'
      }}>
        {/* Seções nacionais */}
        {sections.map((section) => {
          const hasAccess = section.alwaysVisible || mapearSecaoParaPermissao(section.key, userPermissions);
          const hasData = section.data && section.data.length > 0;
          
          if (!hasData) return null;
          
          // Contar proventos e notícias
          const proventosCount = section.data.filter(item => 
            item.isProvento || item.type || item.tipoProvento || item.value || item.valor
          ).length;
          const noticiasCount = section.data.length - proventosCount;
          
          if (!hasAccess) {
            return (
              <section key={section.key} style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
                <SectionHeader 
                  icon={section.icon}
                  title={section.title}
                  color={section.color}
                  count={section.data.length}
                  proventosCount={proventosCount}
                  noticiasCount={noticiasCount}
                />
                <BlockedSection title={section.title} />
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
                proventosCount={proventosCount}
                noticiasCount={noticiasCount}
              />
              
              <div>
                {section.data.map((item, index) => (
                  <ItemCard key={index} item={item} sectionColor={section.color} />
                ))}
              </div>
            </section>
          );
        })}

        {/* 🆕 Seções internacionais */}
        {internationalSections.some(s => s.data && s.data.length > 0) && (
          <>
            <div style={{
              backgroundColor: '#faf5ff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              border: '1px solid #e9d5ff'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#6b21a8',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌎 Mercado Internacional
              </h3>
            </div>

            {internationalSections.map((section) => {
              const hasAccess = mapearSecaoParaPermissao(section.key, userPermissions);
              const hasData = section.data && section.data.length > 0;
              
              if (!hasData) return null;
              
              // Contar proventos e notícias
              const proventosCount = section.data.filter(item => 
                item.isProvento || item.type || item.tipoProvento || item.value || item.valor
              ).length;
              const noticiasCount = section.data.length - proventosCount;
              
              if (!hasAccess) {
                return (
                  <section key={section.key} style={{ marginBottom: 'clamp(32px, 5vw, 48px)' }}>
                    <SectionHeader 
                      icon={section.icon}
                      title={section.title}
                      color={section.color}
                      count={section.data.length}
                      proventosCount={proventosCount}
                      noticiasCount={noticiasCount}
                    />
                    <BlockedSection title={section.title} />
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
                    proventosCount={proventosCount}
                    noticiasCount={noticiasCount}
                  />
                  
                  {section.description && (
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '-8px 0 16px 0',
                      paddingLeft: '64px'
                    }}>
                      {section.description}
                    </p>
                  )}
                  
                  <div>
                    {section.data.map((item, index) => (
                      <ItemCard key={index} item={item} sectionColor={section.color} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}
        
        {/* Rodapé */}
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '48px'
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
          {relatorio.autor && (
            <p style={{ 
              color: '#9ca3af', 
              fontSize: '11px',
              margin: '4px 0'
            }}>
              Relatório elaborado por: {relatorio.autor}
            </p>
          )}
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '11px',
            margin: 0
          }}>
            Última atualização: {new Date(relatorio.date).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}