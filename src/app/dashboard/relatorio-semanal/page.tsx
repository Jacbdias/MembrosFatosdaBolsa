'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Globe, Building, Zap, AlertCircle, CheckCircle, BarChart3, Lock, ChevronLeft, ChevronRight, ChevronDown, Clock, Archive, List, Eye } from 'lucide-react';
import { useAuthAccess } from '@/hooks/use-auth-access';

// 🎯 INTERFACES COMPATÍVEIS COM ARQUIVO 2
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
  semana: string;
  dataPublicacao: string;
  autor: string;
  titulo: string;
  macro: ItemRelatorioSemanal[];
  proventos: ProventoItem[];
  dividendos: ItemRelatorioSemanal[];
  smallCaps: ItemRelatorioSemanal[];
  microCaps: ItemRelatorioSemanal[];
  exterior: ItemRelatorioSemanal[];
  status: 'draft' | 'published';
}

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
        fontSize: '16px',
        color: '#4b5563',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

// CSS global para estilizar o conteúdo formatado
const HTMLContentStyles = () => (
  <style>{`
    .html-content {
      word-wrap: break-word;
    }
    .html-content p {
      margin: 0 0 12px 0;
    }
    .html-content strong, .html-content b {
      font-weight: 700;
      color: #1f2937;
    }
    .html-content em, .html-content i {
      font-style: italic;
    }
    .html-content u {
      text-decoration: underline;
    }
    .html-content strike, .html-content s {
      text-decoration: line-through;
    }
    .html-content a {
      color: #2563eb;
      text-decoration: underline;
      transition: color 0.2s;
    }
    .html-content a:hover {
      color: #1d4ed8;
    }
    .html-content ul, .html-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    .html-content li {
      margin: 6px 0;
    }
    .html-content ul li {
      list-style-type: disc;
    }
    .html-content ol li {
      list-style-type: decimal;
    }
  `}</style>
);

// 🎯 COMPONENTE DE NAVEGAÇÃO POR SEMANAS
const WeekNavigation = ({ 
  semanaAtual, 
  semanasDisponiveis, 
  onSemanaChange,
  loading 
}: {
  semanaAtual: string;
  semanasDisponiveis: string[];
  onSemanaChange: (semana: string) => void;
  loading: boolean;
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const indiceSemanaAtual = semanasDisponiveis.indexOf(semanaAtual);
  const podeVoltar = indiceSemanaAtual < semanasDisponiveis.length - 1;
  const podeAvancar = indiceSemanaAtual > 0;

  const navegarAnterior = () => {
    if (podeVoltar) {
      onSemanaChange(semanasDisponiveis[indiceSemanaAtual + 1]);
    }
  };

  const navegarProxima = () => {
    if (podeAvancar) {
      onSemanaChange(semanasDisponiveis[indiceSemanaAtual - 1]);
    }
  };

  const formatarSemana = (semana: string) => {
    if (!semana) return 'Carregando...';
    const [ano, week] = semana.split('-W');
    return `${week}ª Semana de ${ano}`;
  };

  const formatarSemanaCompleta = (semana: string) => {
    if (!semana) return 'Carregando...';
    const [ano, week] = semana.split('-W');
    const semanaNum = parseInt(week);
    const dataInicio = new Date(parseInt(ano), 0, 1 + (semanaNum - 1) * 7);
    const dataFim = new Date(dataInicio.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    return {
      titulo: `${week}ª Semana de ${ano}`,
      periodo: `${dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${dataFim.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    };
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #4cfa00',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Carregando semanas disponíveis...
        </p>
      </div>
    );
  }

  if (semanasDisponiveis.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        marginBottom: '32px',
        textAlign: 'center',
        border: '2px dashed #e5e7eb'
      }}>
        <Archive size={48} style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          Nenhum Relatório Disponível
        </h3>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Ainda não há relatórios semanais publicados.
        </p>
      </div>
    );
  }

  const semanaInfo = formatarSemanaCompleta(semanaAtual);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      marginBottom: '32px',
      border: '1px solid #e5e7eb'
    }}>
      {/* Header da Navegação */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', margin: '0 0 4px 0' }}>
              Navegação de Relatórios
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              {semanasDisponiveis.length} semana{semanasDisponiveis.length > 1 ? 's' : ''} disponível{semanasDisponiveis.length > 1 ? 'is' : ''}
            </p>
          </div>
        </div>

        {/* Contador de Semanas */}
        <div style={{
          backgroundColor: '#f0fdf4',
          color: '#166534',
          padding: '8px 16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600',
          border: '1px solid #86efac'
        }}>
          {indiceSemanaAtual + 1} de {semanasDisponiveis.length}
        </div>
      </div>

      {/* Navegação Principal */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '16px',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '16px'
      }}>
        {/* Botão Anterior */}
        <button
          onClick={navegarAnterior}
          disabled={!podeVoltar}
          style={{
            backgroundColor: podeVoltar ? '#3b82f6' : '#e5e7eb',
            color: podeVoltar ? 'white' : '#9ca3af',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            cursor: podeVoltar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: podeVoltar ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
          }}
          title="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Seletor de Semana */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px 20px',
              width: '100%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s',
              boxShadow: dropdownOpen ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '2px' }}>
                {semanaInfo.titulo}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>
                {semanaInfo.periodo}
              </div>
            </div>
            <ChevronDown 
              size={18} 
              style={{ 
                color: '#6b7280',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }} 
            />
          </button>

          {/* Dropdown de Semanas */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid #e5e7eb',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '8px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  padding: '8px 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Selecionar Semana
                </div>
                {semanasDisponiveis.map((semana, index) => {
                  const info = formatarSemanaCompleta(semana);
                  const isAtual = semana === semanaAtual;
                  
                  return (
                    <button
                      key={semana}
                      onClick={() => {
                        onSemanaChange(semana);
                        setDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px',
                        backgroundColor: isAtual ? '#f0fdf4' : 'transparent',
                        border: isAtual ? '1px solid #86efac' : '1px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isAtual) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isAtual) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: isAtual ? '600' : '500', 
                          color: isAtual ? '#166534' : '#1f2937',
                          marginBottom: '2px'
                        }}>
                          {info.titulo}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: isAtual ? '#16a34a' : '#6b7280'
                        }}>
                          {info.periodo}
                        </div>
                      </div>
                      {isAtual && (
                        <div style={{
                          backgroundColor: '#22c55e',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          Atual
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botão Próxima */}
        <button
          onClick={navegarProxima}
          disabled={!podeAvancar}
          style={{
            backgroundColor: podeAvancar ? '#3b82f6' : '#e5e7eb',
            color: podeAvancar ? 'white' : '#9ca3af',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            cursor: podeAvancar ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: podeAvancar ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
          }}
          title="Próxima semana"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Informações Adicionais */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '16px',
        padding: '12px 16px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={14} />
          Histórico disponível
        </div>
        <div>
          Use as setas ou clique na semana para navegar
        </div>
      </div>
    </div>
  );
};

// Header otimizado com informações da semana
const ReportHeader = ({ relatorio, planName }: { relatorio: RelatorioSemanalData | null; planName?: string }) => {
  if (!relatorio) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
        color: 'white',
        padding: '60px 30px',
        textAlign: 'center',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <AlertCircle size={64} style={{ color: '#f59e0b', marginBottom: '20px' }} />
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>
            Selecione uma Semana
          </h1>
          <p style={{ fontSize: '16px', color: '#d1d5db' }}>
            Use a navegação acima para escolher um relatório semanal
          </p>
        </div>
      </div>
    );
  }

  const formatarSemana = (semana: string) => {
    const [ano, week] = semana.split('-W');
    return {
      semana: `${week}ª Semana`,
      ano: ano,
      mes: new Date(parseInt(ano), 0, 1 + (parseInt(week) - 1) * 7).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase()
    };
  };

  const semanaInfo = formatarSemana(relatorio.semana);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 75%, #1a1a1a 100%)',
      color: 'white',
      padding: '40px 30px 50px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Pattern de fundo */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(76, 250, 0, 0.08) 0%, transparent 50%),
                          radial-gradient(circle at 75% 75%, rgba(76, 250, 0, 0.04) 0%, transparent 50%)`,
        opacity: 0.7
      }} />
      
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
        {/* Badge do plano */}
        {planName && (
          <div style={{
            background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
            color: '#000000',
            padding: '8px 20px',
            borderRadius: '25px',
            display: 'inline-block',
            fontSize: '12px',
            fontWeight: '800',
            marginBottom: '20px',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            boxShadow: '0 6px 20px rgba(76, 250, 0, 0.25)'
          }}>
            {planName}
          </div>
        )}
        
        {/* Subtítulo */}
        <div style={{ 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <div style={{
            height: '1px',
            width: '50px',
            background: 'linear-gradient(90deg, transparent, #4cfa00, transparent)'
          }} />
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#4cfa00'
          }}>
            {relatorio.semana} • AÇÕES BRASILEIRAS • EXTERIOR
          </span>
          <div style={{
            height: '1px',
            width: '50px',
            background: 'linear-gradient(90deg, transparent, #4cfa00, transparent)'
          }} />
        </div>
        
        {/* Título principal */}
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: '900',
          margin: '0 0 15px 0',
          lineHeight: '1.1',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {relatorio.titulo || `Relatório Semanal`}
        </h1>
        
        {/* Data */}
        <div style={{
          margin: '25px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            fontSize: 'clamp(22px, 3.5vw, 32px)',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {semanaInfo.semana}
          </div>
          
          <div style={{
            fontSize: '16px',
            color: '#a3a3a3',
            fontWeight: '500',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {semanaInfo.mes} de {semanaInfo.ano}
          </div>
        </div>
        
        {/* Logo */}
        <div style={{
          marginTop: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(76, 250, 0, 0.15) 0%, rgba(76, 250, 0, 0.04) 100%)',
            border: '2px solid #4cfa00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(76, 250, 0, 0.25)'
          }}>
            <BarChart3 size={26} style={{ color: '#4cfa00' }} />
          </div>
          
          <div style={{
            fontSize: '15px',
            fontWeight: '800',
            textAlign: 'left',
            letterSpacing: '0.8px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              FATOS
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              DA BOLSA
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Seção bloqueada
const BlockedSection = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div style={{
    backgroundColor: '#f9f9f9',
    padding: '40px',
    marginBottom: '30px',
    borderRadius: '0px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    opacity: 0.6
  }}>
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '40px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Lock size={20} style={{ color: 'white' }} />
    </div>
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={30} style={{ color: '#9ca3af' }} />
      </div>
      
      <div>
        <h2 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#9ca3af',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#ef4444',
          margin: '5px 0 0 0',
          fontWeight: '600'
        }}>
          🔒 Conteúdo exclusivo - Upgrade necessário
        </p>
      </div>
    </div>
  </div>
);

// Seção com design do PDF
const SectionHeader = ({ icon: Icon, title, color, count }: { icon: any, title: string, color: string, count: number }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '40px',
    marginBottom: '30px',
    borderRadius: '0px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '200px',
      height: '100%',
      background: `linear-gradient(45deg, ${color}15, ${color}05)`,
      clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }} />
    
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '40px',
      display: 'flex',
      gap: '4px',
      alignItems: 'end'
    }}>
      {[20, 30, 25, 40, 35, 45].map((height, i) => (
        <div key={i} style={{
          width: '8px',
          height: `${height}px`,
          backgroundColor: '#4cfa00',
          borderRadius: '2px'
        }} />
      ))}
    </div>
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: color,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={30} style={{ color: 'white' }} />
        </div>
        
        <div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </h2>
          {count > 0 && (
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '5px 0 0 0',
              fontWeight: '500'
            }}>
              {count} {count === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Sistema de logos (simplificado para o exemplo)
const CompanyLogo = ({ ticker, fallbackColor }: { ticker: string, fallbackColor: string }) => (
  <div style={{
    width: '60px',
    height: '60px',
    background: `linear-gradient(135deg, ${fallbackColor}20, ${fallbackColor}10)`,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${fallbackColor}40`,
    fontSize: '14px',
    fontWeight: '700',
    color: fallbackColor,
    textAlign: 'center'
  }}>
    {ticker?.substring(0, 4) || 'TICK'}
  </div>
);

// Card de ação com HTML renderizado
const StockCard = ({ item, sectionColor }: { item: ItemRelatorioSemanal, sectionColor: string }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: `3px solid ${sectionColor}15`
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ marginRight: '15px' }}>
        <CompanyLogo ticker={item.ticker} fallbackColor={sectionColor} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          {item.impacto && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: item.impacto === 'positivo' ? '#4cfa00' : item.impacto === 'negativo' ? '#ef4444' : '#6b7280',
              backgroundColor: item.impacto === 'positivo' ? '#4cfa0015' : item.impacto === 'negativo' ? '#ef444415' : '#6b728015',
              padding: '4px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              {item.impacto}
            </span>
          )}
        </div>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0,
          fontWeight: '500'
        }}>
          {item.empresa}
        </p>
      </div>
    </div>

    <h4 style={{
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: '0 0 15px 0',
      lineHeight: '1.3'
    }}>
      {item.titulo}
    </h4>

    {item.resumo && (
      <HTMLContent 
        content={item.resumo}
        style={{
          fontSize: '16px',
          color: '#4b5563',
          lineHeight: '1.6',
          margin: '0 0 15px 0'
        }}
      />
    )}

    {item.analise && (
      <div style={{
        padding: '15px 0',
        margin: '15px 0',
        borderLeft: `4px solid ${sectionColor}`,
        paddingLeft: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: sectionColor,
          marginBottom: '8px'
        }}>
          📊 Análise Completa
        </div>
        <HTMLContent 
          content={item.analise}
          style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: 0
          }}
        />
      </div>
    )}

    {item.destaque && (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #4cfa0030',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#15803d',
          marginBottom: '8px'
        }}>
          💡 Destaque Especial
        </div>
        <HTMLContent 
          content={item.destaque}
          style={{
            fontSize: '16px',
            color: '#166534',
            margin: 0,
            fontWeight: '500'
          }}
        />
      </div>
    )}

    {item.recomendacao && (
      <div style={{
        backgroundColor: item.recomendacao === 'COMPRA' ? '#f0fdf4' : item.recomendacao === 'VENDA' ? '#fef2f2' : '#fef3c7',
        border: `1px solid ${item.recomendacao === 'COMPRA' ? '#4cfa0030' : item.recomendacao === 'VENDA' ? '#ef444430' : '#fde68a'}`,
        borderRadius: '8px',
        padding: '15px',
        marginTop: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: item.recomendacao === 'COMPRA' ? '#15803d' : item.recomendacao === 'VENDA' ? '#dc2626' : '#92400e',
          marginBottom: '8px'
        }}>
          🎯 Recomendação: {item.recomendacao}
        </div>
        {item.precoAlvo && (
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            Preço Alvo: R$ {item.precoAlvo.toFixed(2)}
          </div>
        )}
      </div>
    )}
  </div>
);

// Card de provento
const ProventoCard = ({ item }: { item: ProventoItem }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '3px solid #4cfa0015'
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ marginRight: '15px' }}>
        <CompanyLogo ticker={item.ticker} fallbackColor="#4cfa00" />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: item.tipo === 'JCP' ? '#7c3aed' : '#2563eb',
            backgroundColor: item.tipo === 'JCP' ? '#7c3aed15' : '#2563eb15',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            {item.tipo}
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          {item.empresa}
        </p>
      </div>
    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: '20px' 
    }}>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Valor</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{item.valor}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>DY</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#4cfa00' }}>{item.dy}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Data-com</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.datacom ? new Date(item.datacom).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pagamento</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.pagamento ? new Date(item.pagamento).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
    </div>
  </div>
);

export default function RelatorioSemanalPage() {
  const [semanasDisponiveis, setSemanasDisponiveis] = useState<string[]>([]);
  const [semanaAtual, setSemanaAtual] = useState<string>('');
  const [relatorioAtual, setRelatorioAtual] = useState<RelatorioSemanalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hook de permissões
  const { planInfo, loading: authLoading, hasAccessSync, user, debugInfo } = useAuthAccess();

  // 🎯 CARREGAR SEMANAS DISPONÍVEIS
  useEffect(() => {
    const loadSemanasDisponiveis = async () => {
      try {
        console.log('📅 Carregando semanas disponíveis...');
        
        const request = indexedDB.open('RelatoriosSemanaisDB', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('relatorios')) {
            const store = db.createObjectStore('relatorios', { keyPath: 'id' });
            store.createIndex('semana', 'semana', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['relatorios'], 'readonly');
          const store = transaction.objectStore('relatorios');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const todosRelatorios = getAllRequest.result || [];
            
            // Filtrar apenas relatórios publicados e extrair semanas
            const relatoriosPublicados = todosRelatorios.filter(r => r.status === 'published');
            const semanas = relatoriosPublicados
              .map(r => r.semana)
              .filter((semana, index, array) => array.indexOf(semana) === index)
              .sort((a, b) => b.localeCompare(a)); // Ordem decrescente (mais recente primeiro)
            
            console.log(`📅 ${semanas.length} semanas encontradas:`, semanas);
            setSemanasDisponiveis(semanas);
            
            // Definir semana atual como a mais recente
            if (semanas.length > 0) {
              setSemanaAtual(semanas[0]);
            }
            
            setLoading(false);
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Erro ao carregar semanas');
            setError('Erro ao carregar semanas disponíveis');
            setLoading(false);
          };
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao conectar com IndexedDB');
          setError('Erro ao conectar com o banco de dados');
          setLoading(false);
        };
        
      } catch (error) {
        console.error('❌ Erro geral ao carregar semanas:', error);
        setError('Erro ao carregar semanas');
        setLoading(false);
      }
    };
    
    loadSemanasDisponiveis();
  }, []);

  // 🎯 CARREGAR RELATÓRIO DA SEMANA ATUAL
  useEffect(() => {
    if (!semanaAtual) return;
    
    const loadRelatorioSemana = async () => {
      setLoadingRelatorio(true);
      setError(null);
      
      try {
        console.log(`📖 Carregando relatório da semana: ${semanaAtual}`);
        
        const request = indexedDB.open('RelatoriosSemanaisDB', 1);
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['relatorios'], 'readonly');
          const store = transaction.objectStore('relatorios');
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            const todosRelatorios = getAllRequest.result || [];
            
            // Encontrar relatório da semana atual que esteja publicado
            const relatorio = todosRelatorios.find(r => 
              r.semana === semanaAtual && r.status === 'published'
            );
            
            if (relatorio) {
              console.log(`✅ Relatório encontrado para ${semanaAtual}:`, relatorio);
              setRelatorioAtual(relatorio);
            } else {
              console.log(`❌ Nenhum relatório publicado encontrado para ${semanaAtual}`);
              setRelatorioAtual(null);
              setError(`Relatório da semana ${semanaAtual} não encontrado`);
            }
            
            setLoadingRelatorio(false);
          };
          
          getAllRequest.onerror = () => {
            console.error('❌ Erro ao carregar relatório');
            setError('Erro ao carregar relatório');
            setLoadingRelatorio(false);
          };
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao conectar com IndexedDB');
          setError('Erro ao conectar com o banco de dados');
          setLoadingRelatorio(false);
        };
        
      } catch (error) {
        console.error('❌ Erro ao carregar relatório:', error);
        setError('Erro ao carregar relatório');
        setLoadingRelatorio(false);
      }
    };
    
    loadRelatorioSemana();
  }, [semanaAtual]);

  // Função para mudar de semana
  const handleSemanaChange = useCallback((novaSemana: string) => {
    setSemanaAtual(novaSemana);
  }, []);

  // Sistema de permissões
  const getSectionPermissions = () => {
    return {
      'macro': [],
      'proventos': ['dividendos', 'fundos-imobiliarios'],
      'dividendos': ['dividendos'],
      'smallCaps': ['small-caps'],
      'microCaps': ['micro-caps'],
      'exterior': ['internacional', 'internacional-etfs', 'internacional-stocks']
    };
  };

  const hasAccessToSection = (sectionKey: string): boolean => {
    const sectionPermissions = getSectionPermissions();
    const requiredPermissions = sectionPermissions[sectionKey] || [];
    
    if (requiredPermissions.length === 0) return true;
    if (!user) return false;
    if (user.plan === 'ADMIN') return true;
    
    return requiredPermissions.some(permission => hasAccessSync(permission));
  };

  if (loading || authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #4cfa00', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
            Carregando Relatórios
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {loading ? 'Buscando semanas disponíveis...' : 'Verificando permissões...'}
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { key: 'macro', data: relatorioAtual?.macro || [], title: 'Panorama Macro', icon: Globe, color: '#2563eb' },
    { key: 'proventos', data: relatorioAtual?.proventos || [], title: 'Proventos', icon: DollarSign, color: '#4cfa00' },
    { key: 'dividendos', data: relatorioAtual?.dividendos || [], title: 'Dividendos', icon: Calendar, color: '#22c55e' },
    { key: 'smallCaps', data: relatorioAtual?.smallCaps || [], title: 'Small Caps', icon: Building, color: '#2563eb' },
    { key: 'microCaps', data: relatorioAtual?.microCaps || [], title: 'Micro Caps', icon: Zap, color: '#ea580c' },
    { key: 'exterior', data: relatorioAtual?.exterior || [], title: 'Exterior', icon: TrendingUp, color: '#7c3aed' }
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
      
      <ReportHeader relatorio={relatorioAtual} planName={planInfo?.displayName} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px 20px' }}>
        {/* Navegação por Semanas */}
        <WeekNavigation 
          semanaAtual={semanaAtual}
          semanasDisponiveis={semanasDisponiveis}
          onSemanaChange={handleSemanaChange}
          loading={loadingRelatorio}
        />

        {/* Conteúdo do Relatório */}
        {relatorioAtual ? (
          sections.map((section) => {
            const hasAccess = hasAccessToSection(section.key);
            const hasData = section.data && section.data.length > 0;
            
            if (!hasData) return null;
            
            if (!hasAccess) {
              return (
                <section key={section.key} style={{ marginBottom: '60px' }}>
                  <BlockedSection 
                    icon={section.icon}
                    title={section.title}
                    color={section.color}
                  />
                </section>
              );
            }
            
            return (
              <section key={section.key} style={{ marginBottom: '60px' }}>
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
          })
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '64px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '2px dashed #e5e7eb'
          }}>
            <AlertCircle size={64} style={{ color: '#f59e0b', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
              Relatório Não Encontrado
            </h3>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>
              {error || `O relatório da semana ${semanaAtual} não está disponível.`}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              Selecione uma semana diferente ou aguarde a publicação.
            </p>
          </div>
        )}

        {/* Debug para admins */}
        {debugInfo?.isAdmin && (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '40px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <h3 style={{ marginBottom: '10px', color: '#374151' }}>🐛 Debug Info (Admin Only)</h3>
            <pre style={{ margin: 0, color: '#6b7280' }}>
              {JSON.stringify({ semanaAtual, semanasDisponiveis, hasRelatorio: !!relatorioAtual }, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Rodapé */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '60px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #4cfa00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={20} style={{ color: '#4cfa00' }} />
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              FATOS DA BOLSA
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            © Fatos da Bolsa - contato@fatosdabolsa.com.br
          </p>
        </div>
      </div>
    </div>
  );
}