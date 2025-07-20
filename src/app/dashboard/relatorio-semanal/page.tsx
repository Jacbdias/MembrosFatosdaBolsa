'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Globe, Building, Zap, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

// Header com design similar ao PDF
const ReportHeader = ({ relatorio }: { relatorio: any }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    color: 'white',
    padding: '60px 40px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background pattern */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      opacity: 0.3
    }} />
    
    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <span style={{
          fontSize: '16px',
          fontWeight: '600',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#22c55e'
        }}>
          AÇÕES BRASILEIRAS | EXTERIOR
        </span>
      </div>
      
      <h1 style={{
        fontSize: '48px',
        fontWeight: '700',
        margin: '0 0 10px 0',
        lineHeight: '1.1'
      }}>
        Relatório de<br/>
        <span style={{ color: '#22c55e' }}>ATUALIZAÇÃO</span>
      </h1>
      
      <div style={{
        fontSize: '36px',
        fontWeight: '700',
        margin: '30px 0 10px 0',
        textTransform: 'uppercase',
        letterSpacing: '3px'
      }}>
        {relatorio?.date ? new Date(relatorio.date).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase() : 'CARREGANDO...'}
      </div>
      
      <div style={{
        fontSize: '18px',
        color: '#a3a3a3',
        borderBottom: '2px solid #22c55e',
        display: 'inline-block',
        paddingBottom: '5px'
      }}>
        {relatorio?.date ? new Date(relatorio.date).toLocaleDateString('pt-BR') : '...'}
      </div>
      
      {/* Logo placeholder */}
      <div style={{
        marginTop: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(34, 197, 94, 0.1)'
        }}>
          <BarChart3 size={30} style={{ color: '#22c55e' }} />
        </div>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          textAlign: 'left'
        }}>
          <div>FATOS</div>
          <div>DA BOLSA</div>
        </div>
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
    {/* Background decorativo */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '200px',
      height: '100%',
      background: `linear-gradient(45deg, ${color}15, ${color}05)`,
      clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }} />
    
    {/* Barras decorativas verdes */}
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
          backgroundColor: '#22c55e',
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

// Card de ação com logo
const StockCard = ({ item, sectionColor }: { item: any, sectionColor: string }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: `3px solid ${sectionColor}15`,
    position: 'relative'
  }}>
    {/* Header com logo e ticker */}
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{
        width: '60px',
        height: '60px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px',
        border: `2px solid ${sectionColor}30`
      }}>
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '700', 
          color: sectionColor,
          textAlign: 'center'
        }}>
          {item.ticker?.substring(0, 4) || 'TICK'}
        </span>
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
          {item.impact && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: item.impact === 'positive' ? '#22c55e' : item.impact === 'negative' ? '#ef4444' : '#6b7280',
              backgroundColor: item.impact === 'positive' ? '#22c55e15' : item.impact === 'negative' ? '#ef444415' : '#6b728015',
              padding: '4px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              {item.impact === 'positive' ? 'Positivo' : item.impact === 'negative' ? 'Negativo' : 'Neutro'}
            </span>
          )}
        </div>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0,
          fontWeight: '500'
        }}>
          {item.company}
        </p>
      </div>
    </div>

    {/* Título da notícia */}
    <h4 style={{
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: '0 0 15px 0',
      lineHeight: '1.3'
    }}>
      {item.news || item.title}
    </h4>

    {/* Conteúdo */}
    {item.summary && (
      <p style={{
        fontSize: '16px',
        color: '#4b5563',
        lineHeight: '1.6',
        margin: '0 0 15px 0'
      }}>
        {item.summary}
      </p>
    )}

    {/* Destaque */}
    {item.highlight && (
      <div style={{
        backgroundColor: '#f0f9ff',
        border: `1px solid ${sectionColor}30`,
        borderRadius: '8px',
        padding: '15px',
        margin: '15px 0',
        borderLeft: `4px solid ${sectionColor}`
      }}>
        <p style={{
          fontSize: '16px',
          color: '#1e40af',
          margin: 0,
          fontWeight: '500',
          fontStyle: 'italic'
        }}>
          💡 {item.highlight}
        </p>
      </div>
    )}

    {/* Recomendação */}
    {item.recommendation && (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e30',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#15803d',
          marginBottom: '5px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Recomendação
        </div>
        <p style={{
          fontSize: '16px',
          color: '#166534',
          margin: 0,
          fontWeight: '500'
        }}>
          {item.recommendation}
        </p>
      </div>
    )}

    {/* Tags de setores/recomendações */}
    {(item.sectors?.length > 0 || item.recommendations?.length > 0) && (
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {item.sectors?.map((setor: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '500'
          }}>
            {setor}
          </span>
        ))}
        {item.recommendations?.map((rec: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#22c55e',
            backgroundColor: '#f0fdf4',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            {rec}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Card de provento
const ProventoCard = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '3px solid #22c55e15'
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{
        width: '50px',
        height: '50px',
        backgroundColor: '#22c55e15',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '15px'
      }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: '700', 
          color: '#22c55e'
        }}>
          {item.ticker?.substring(0, 4)}
        </span>
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
            color: item.type === 'JCP' ? '#7c3aed' : '#2563eb',
            backgroundColor: item.type === 'JCP' ? '#7c3aed15' : '#2563eb15',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            {item.type}
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          {item.company}
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
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{item.value}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>DY</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>{item.dy}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Data-com</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.exDate ? new Date(item.exDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pagamento</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.payDate ? new Date(item.payDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
    </div>
  </div>
);

export default function RelatorioSemanalPage() {
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        console.log('📖 [DEBUG] Buscando relatório publicado (client-side)...');
        
        const response = await fetch('/api/relatorio-semanal');
        console.log('📖 [DEBUG] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📖 [DEBUG] Dados recebidos:', data);
        
        // Só mostrar se estiver publicado
        if (data && data.status === 'published') {
          setRelatorio(data);
        } else {
          console.log('📖 [DEBUG] Relatório não está publicado');
          setRelatorio(null);
        }
        
      } catch (error) {
        console.error('📖 [DEBUG] Erro ao carregar relatório:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
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
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #22c55e', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
            Carregando Relatório
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Buscando o relatório semanal mais recente...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '60px', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px'
        }}>
          <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '15px' 
          }}>
            Erro ao Carregar
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#22c55e',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '60px', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px'
        }}>
          <AlertCircle size={64} style={{ color: '#f59e0b', marginBottom: '20px' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '15px' 
          }}>
            Relatório Não Disponível
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            O relatório semanal ainda não foi publicado pelos nossos analistas.
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    { 
      key: 'macro', 
      data: relatorio.macro, 
      title: 'Panorama Macro', 
      icon: Globe, 
      color: '#2563eb' 
    },
    { 
      key: 'proventos', 
      data: relatorio.proventos, 
      title: 'Dividendos', 
      icon: DollarSign, 
      color: '#22c55e' 
    },
    { 
      key: 'dividendos', 
      data: relatorio.dividendos, 
      title: 'Dividendos', 
      icon: Calendar, 
      color: '#22c55e' 
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
    },
    { 
      key: 'exterior', 
      data: relatorio.exterior, 
      title: 'Exterior', 
      icon: TrendingUp, 
      color: '#7c3aed' 
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <ReportHeader relatorio={relatorio} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px 20px' }}>
        {sections.map((section) => {
          if (!section.data || section.data.length === 0) return null;
          
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
        })}
        
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
              border: '2px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={20} style={{ color: '#22c55e' }} />
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              FATOS DA BOLSA
            </span>
          </div>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            margin: 0
          }}>
            © Fatos da Bolsa - contato@fatosdabolsa.com.br
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '12px',
            margin: '5px 0 0 0'
          }}>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}