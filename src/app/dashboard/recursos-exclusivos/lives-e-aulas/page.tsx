'use client';

import React, { useState, useEffect } from 'react';

const LivesAulasPage = () => {
  const [videoExpandido, setVideoExpandido] = useState(null);
  const [videoTocando, setVideoTocando] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const lives = [
    {
      id: 1,
      titulo: "Como montar uma carteira de dividendos",
      descricao: "Aprenda estratégias fundamentais para construir uma carteira focada em dividendos consistentes e crescimento no longo prazo.",
      capa: "💰",
      categoria: "Dividendos",
      duracao: "45min",
      cor: "#374151",
      vimeoId: "723332993", // Substitua pelo ID real do Vimeo
      topicos: [
        "Seleção de empresas pagadoras de dividendos",
        "Análise de histórico de pagamentos",
        "Diversificação por setores",
        "Reinvestimento de dividendos",
        "Estratégias de timing para compras",
        "Acompanhamento e rebalanceamento"
      ],
      beneficios: [
        "Renda passiva consistente",
        "Proteção contra inflação",
        "Crescimento patrimonial sustentável",
        "Estratégia de longo prazo comprovada"
      ],
      preview: "Nesta live exclusiva, você aprenderá a construir uma carteira robusta focada em dividendos, desde a seleção das melhores empresas até estratégias avançadas de reinvestimento."
    },
    {
      id: 2,
      titulo: "Como montar uma carteira de fundos imobiliários - Parte 1",
      descricao: "Fundamentos essenciais para investir em FIIs, incluindo análise de indicadores, tipos de fundos e estratégias iniciais.",
      capa: "🏢",
      categoria: "Fundos Imobiliários",
      duracao: "52min",
      cor: "#374151",
      vimeoId: "739492960", // Substitua pelo ID real do Vimeo
      topicos: [
        "Introdução aos Fundos Imobiliários",
        "Tipos de FIIs (Papel, Tijolo, Híbridos)",
        "Principais indicadores (P/VP, DY, Vacância)",
        "Como escolher os primeiros FIIs",
        "Diversificação por segmentos",
        "Análise de relatórios gerenciais"
      ],
      beneficios: [
        "Exposição ao mercado imobiliário",
        "Dividendos mensais isentos de IR",
        "Liquidez superior aos imóveis físicos",
        "Diversificação geográfica e setorial"
      ],
      preview: "Primeira parte do curso completo sobre FIIs. Aqui você entenderá os conceitos fundamentais e como dar os primeiros passos no mercado imobiliário."
    },
    {
      id: 3,
      titulo: "Como montar uma carteira de fundos imobiliários - Parte 2",
      descricao: "Estratégias avançadas para FIIs, gestão de carteira, análise setorial e técnicas de otimização de portfólio.",
      capa: "🏗️",
      categoria: "Fundos Imobiliários",
      duracao: "48min",
      cor: "#374151",
      vimeoId: "739492960", // Substitua pelo ID real do Vimeo
      topicos: [
        "Estratégias avançadas de seleção",
        "Análise setorial aprofundada",
        "Gestão ativa vs passiva",
        "Rebalanceamento de carteira",
        "Análise de ciclos do mercado imobiliário",
        "Estratégias para diferentes perfis"
      ],
      beneficios: [
        "Otimização de rendimentos",
        "Gestão profissional da carteira",
        "Redução de riscos setoriais",
        "Maximização do potencial dos FIIs"
      ],
      preview: "Continuação do curso de FIIs com foco em estratégias avançadas. Ideal para quem já tem conhecimento básico e quer aprofundar suas técnicas."
    },
    {
      id: 4,
      titulo: "Como montar uma carteira de investimentos no exterior",
      descricao: "Guia completo para diversificação internacional, abertura de contas, tributação e seleção de ativos globais.",
      capa: "🌍",
      categoria: "Investimentos Internacionais",
      duracao: "1h 15min",
      cor: "#374151",
      vimeoId: "753923520", // Substitua pelo ID real do Vimeo
      topicos: [
        "Abertura de conta em corretoras internacionais",
        "ETFs americanos vs brasileiros",
        "Stocks individuais vs ETFs",
        "Tributação e declaração no IR",
        "Estratégias de hedge cambial",
        "Diversificação geográfica e setorial"
      ],
      beneficios: [
        "Proteção cambial",
        "Acesso aos maiores mercados",
        "Diversificação internacional",
        "Exposição a empresas globais"
      ],
      preview: "Live completa sobre investimentos internacionais. Desde os primeiros passos até estratégias avançadas para construir um portfólio global diversificado."
    },
    {
      id: 5,
      titulo: "Participando de uma OPA na Prática",
      descricao: "Aprenda como funciona uma Oferta Pública de Aquisição (OPA), quando participar e como maximizar seus ganhos nesse processo.",
      capa: "📊",
      categoria: "Operações Especiais",
      duracao: "38min",
      cor: "#374151",
      vimeoId: "821844401", // Substitua pelo ID real do Vimeo
      topicos: [
        "O que é uma OPA e tipos existentes",
        "Análise de viabilidade da OPA",
        "Quando vale a pena participar",
        "Processo prático de participação",
        "Riscos e oportunidades",
        "Casos reais e lições aprendidas"
      ],
      beneficios: [
        "Oportunidades de ganhos extras",
        "Compreensão de operações especiais",
        "Estratégias de arbitragem",
        "Conhecimento de mercado avançado"
      ],
      preview: "Aula prática sobre como participar de OPAs. Com exemplos reais e passo a passo detalhado para você não perder nenhuma oportunidade."
    }
  ];

  const VideoCard = ({ live }) => {
    const isExpandido = videoExpandido === live.id;
    const estaTocando = videoTocando === live.id;
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '12px' : '16px',
        border: '1px solid #e2e8f0',
        padding: isMobile ? '16px' : '24px',
        marginBottom: isMobile ? '16px' : '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => setVideoExpandido(isExpandido ? null : live.id)}
      onMouseEnter={(e) => {
        if (!isExpandido && !isMobile) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpandido && !isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        }
      }}
      >
        {/* Decoração lateral */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: isMobile ? '3px' : '4px',
          backgroundColor: '#374151'
        }} />

        {/* Header do Card */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: isMobile ? '16px' : '20px',
          gap: isMobile ? '12px' : '16px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <div style={{ flex: 1, width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: isMobile ? '8px' : '12px', 
              marginBottom: '8px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? '8px' : '12px',
                width: '100%'
              }}>
                <span style={{ fontSize: isMobile ? '32px' : '48px' }}>{live.capa}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: isMobile ? '18px' : '24px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 4px 0',
                    lineHeight: '1.2'
                  }}>
                    {live.titulo}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      fontSize: isMobile ? '12px' : '14px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      🕒 {live.duracao}
                    </span>
                    {estaTocando && (
                      <span style={{
                        fontSize: isMobile ? '10px' : '12px',
                        color: '#dc2626',
                        fontWeight: '600',
                        backgroundColor: '#fee2e2',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        ▶️ Reproduzindo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#374151',
            color: 'white',
            padding: isMobile ? '4px 8px' : '6px 12px',
            borderRadius: '16px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: '700',
            textAlign: 'center',
            alignSelf: isMobile ? 'flex-start' : 'auto',
            whiteSpace: 'nowrap'
          }}>
            {live.categoria}
          </div>
        </div>

        {/* Player de Vídeo */}
        {(isExpandido || estaTocando) && (
          <div style={{
            marginBottom: isMobile ? '16px' : '20px',
            borderRadius: isMobile ? '8px' : '12px',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}>
            <iframe
              src={`https://player.vimeo.com/video/${live.vimeoId}?title=0&byline=0&portrait=0&color=000000&transparent=0&autoplay=${estaTocando ? 1 : 0}`}
              width="100%"
              height={isMobile ? "250" : "400"}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={live.titulo}
              style={{ borderRadius: isMobile ? '8px' : '12px' }}
            />
          </div>
        )}

        {/* Descrição */}
        <p style={{
          color: '#374151',
          fontSize: isMobile ? '14px' : '16px',
          marginBottom: '12px',
          lineHeight: '1.6'
        }}>
          {live.descricao}
        </p>

        {/* Preview */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: isMobile ? '12px' : '16px',
          borderRadius: isMobile ? '8px' : '12px',
          marginBottom: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: isMobile ? '13px' : '14px',
            color: '#475569',
            margin: 0,
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            {live.preview}
          </p>
        </div>

        {/* Botão Assistir */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: isExpandido ? (isMobile ? '16px' : '24px') : '0'
        }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setVideoTocando(videoTocando === live.id ? null : live.id);
              setVideoExpandido(live.id);
            }}
            style={{
              backgroundColor: estaTocando ? '#dc2626' : '#374151',
              color: 'white',
              padding: isMobile ? '10px 24px' : '12px 32px',
              borderRadius: isMobile ? '8px' : '12px',
              border: 'none',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {estaTocando ? '⏸️ Pausar' : (isMobile ? '▶️ Assistir' : '▶️ Assistir Agora')}
          </button>
        </div>

        {/* Conteúdo Expandido */}
        {isExpandido && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '16px' : '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: isMobile ? '16px' : '24px',
              marginBottom: isMobile ? '16px' : '24px'
            }}>
              {/* Tópicos Abordados */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: isMobile ? '16px' : '20px',
                borderRadius: isMobile ? '8px' : '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: isMobile ? '12px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📚 Tópicos Abordados
                </h4>
                {live.topicos.map((topico, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#374151',
                    marginBottom: '6px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: '#374151', marginTop: '2px', fontSize: '12px' }}>•</span>
                    {topico}
                  </div>
                ))}
              </div>

              {/* Benefícios */}
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: isMobile ? '16px' : '20px',
                borderRadius: isMobile ? '8px' : '12px',
                border: '1px solid #374151'
              }}>
                <h4 style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: isMobile ? '12px' : '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✨ O que você vai aprender
                </h4>
                {live.beneficios.map((beneficio, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: isMobile ? '13px' : '14px',
                    color: '#065f46',
                    marginBottom: '6px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: '#10b981', marginTop: '2px', fontSize: '12px' }}>✓</span>
                    {beneficio}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action Expandido */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: isMobile ? '16px' : '20px',
              borderRadius: isMobile ? '8px' : '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '6px'
              }}>
                🎯 Pronto para assistir?
              </h4>
              <p style={{
                color: '#64748b',
                fontSize: isMobile ? '13px' : '14px',
                marginBottom: isMobile ? '12px' : '16px',
                lineHeight: '1.5'
              }}>
                Clique no botão acima para começar a assistir e aplicar os conhecimentos imediatamente!
              </p>
            </div>
          </div>
        )}

        {/* Indicador de expansão */}
        <div style={{
          textAlign: 'center',
          marginTop: isMobile ? '12px' : '16px',
          fontSize: isMobile ? '11px' : '12px',
          color: '#64748b'
        }}>
          {isExpandido ? '👆 Clique para recolher' : (isMobile ? '👆 Clique para ver detalhes' : '👆 Clique para ver mais detalhes e assistir')}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '12px' : '24px'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: isMobile ? '32px' : '48px'
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '28px' : '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 12px 0',
          lineHeight: '1.2'
        }}>
          🎥 Lives e Aulas Exclusivas
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '14px' : '20px',
          margin: '0',
          maxWidth: isMobile ? '100%' : '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6',
          padding: isMobile ? '0 8px' : '0'
        }}>
          Conteúdos em vídeo com estratégias práticas e detalhadas para acelerar seus resultados no mercado financeiro
        </p>
      </div>

      {/* Lista de Lives */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        padding: isMobile ? '0 4px' : '0'
      }}>
        {lives.map((live) => (
          <VideoCard key={live.id} live={live} />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: isMobile ? '48px' : '64px',
        padding: isMobile ? '24px' : '32px',
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '8px' : '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: isMobile ? '48px 4px 12px 4px' : '64px auto 0 auto'
      }}>
        <h3 style={{
          fontWeight: '600',
          fontSize: isMobile ? '18px' : '24px',
          margin: '0 0 12px 0',
          color: '#1e293b',
          lineHeight: '1.3'
        }}>
          🎓 Conhecimento em Ação
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: isMobile ? '14px' : '16px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Estas lives foram gravadas com foco na aplicação prática. Assista, anote e coloque em prática para maximizar seus resultados!
        </p>
      </div>
    </div>
  );
};

export default LivesAulasPage;