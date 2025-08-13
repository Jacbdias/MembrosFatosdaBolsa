'use client';

import React, { useState } from 'react';

const DicasInvestimentosPage = () => {
  const [secaoAtiva, setSecaoAtiva] = useState('perfis');
  const [perfilExpandido, setPerfilExpandido] = useState(null);
  const [conceitoExpandido, setConceitoExpandido] = useState(null);

  const perfisInvestidor = [
    {
      id: 1,
      titulo: "Investidor Conservador (80/20)",
      percentualRF: 80,
      percentualRV: 20,
      descricao: "Prioriza segurança e preservação do capital com baixo risco",
      caracteristicas: [
        "Baixa tolerância ao risco",
        "Foco em preservação de capital",
        "Retornos estáveis e previsíveis",
        "Horizonte de investimento flexível"
      ],
      sugestaoCarteira: {
        rendaFixa: {
          percentual: 80,
          opcoes: [
            "Tesouro Selic (40%)",
            "CDB/LCI/LCA (25%)",
            "Fundos DI (15%)"
          ]
        },
        rendaVariavel: {
          percentual: 20,
          opcoes: [
            "Ações de empresas consolidadas (10%)",
            "FIIs de papel (5%)",
            "ETFs diversificados (5%)"
          ]
        }
      },
      cor: "#10b981"
    },
    {
      id: 2,
      titulo: "Investidor Moderado (60/40)",
      percentualRF: 60,
      percentualRV: 40,
      descricao: "Equilibra segurança com potencial de crescimento moderado",
      caracteristicas: [
        "Tolerância moderada ao risco",
        "Busca crescimento com segurança",
        "Aceita volatilidade controlada",
        "Horizonte médio a longo prazo"
      ],
      sugestaoCarteira: {
        rendaFixa: {
          percentual: 60,
          opcoes: [
            "Tesouro IPCA+ (30%)",
            "CDB/LCI/LCA (20%)",
            "Fundos multimercado (10%)"
          ]
        },
        rendaVariavel: {
          percentual: 40,
          opcoes: [
            "Ações diversificadas (25%)",
            "FIIs (10%)",
            "ETFs internacionais (5%)"
          ]
        }
      },
      cor: "#3b82f6"
    },
    {
      id: 3,
      titulo: "Investidor Arrojado (Crescimento + Dividendos)",
      percentualRF: 30,
      percentualRV: 70,
      descricao: "Busca crescimento acelerado com estratégia de dividendos",
      caracteristicas: [
        "Alta tolerância ao risco",
        "Foco em crescimento patrimonial",
        "Aceita alta volatilidade",
        "Horizonte de longo prazo"
      ],
      sugestaoCarteira: {
        rendaFixa: {
          percentual: 30,
          opcoes: [
            "Tesouro IPCA+ longo prazo (20%)",
            "Fundos multimercado (10%)"
          ]
        },
        rendaVariavel: {
          percentual: 70,
          opcoes: [
            "Ações de crescimento (35%)",
            "Ações de dividendos (20%)",
            "FIIs (10%)",
            "Exterior/ETFs (5%)"
          ]
        }
      },
      cor: "#f59e0b"
    }
  ];

  const conceitosImportantes = [
    {
      id: 'dividendos',
      titulo: 'Dividendos',
      definicao: 'Distribuição de parte do lucro líquido da empresa para os acionistas',
      detalhes: [
        'Pagos em dinheiro diretamente na conta',
        'Isentos de Imposto de Renda para pessoa física',
        'Declarados por ação (Ex: R$ 0,50 por ação)',
        'Data Com e Data Ex determinam quem recebe',
        'Empresas maduras costumam pagar mais dividendos'
      ],
      exemplo: 'Se você tem 100 ações da ITUB4 e a empresa declara R$ 0,30 de dividendo por ação, você receberá R$ 30,00',
      cor: '#10b981'
    },
    {
      id: 'jcp',
      titulo: 'JCP (Juros sobre Capital Próprio)',
      definicao: 'Remuneração aos acionistas baseada nos juros sobre o patrimônio líquido',
      detalhes: [
        'Tributação de 15% na fonte (descontado automaticamente)',
        'Vantagem fiscal para a empresa (dedutível do IR)',
        'Funciona como uma antecipação de dividendos',
        'Também declarado por ação',
        'Líquido para o investidor após desconto do IR'
      ],
      exemplo: 'JCP de R$ 0,20 por ação = você recebe R$ 0,17 líquido (R$ 0,03 de IR descontado)',
      cor: '#3b82f6'
    },
    {
      id: 'preco-teto',
      titulo: 'Preço Teto',
      definicao: 'Valor máximo que se deve pagar por uma ação baseado em análise fundamentalista',
      detalhes: [
        'Calculado através de múltiplos como P/L, P/VP, EV/EBITDA',
        'Considera crescimento esperado da empresa',
        'Margem de segurança importante (comprar abaixo do teto)',
        'Varia conforme cenário econômico e setorial',
        'Deve ser recalculado periodicamente'
      ],
      exemplo: 'Se o preço teto calculado é R$ 25,00, idealmente compre por R$ 22,00 ou menos (margem de segurança)',
      cor: '#8b5cf6'
    },
    {
      id: 'pl',
      titulo: 'P/L (Preço sobre Lucro)',
      definicao: 'Múltiplo que indica quantos anos levaria para recuperar o investimento através do lucro',
      detalhes: [
        'Cálculo: Preço da ação ÷ Lucro por ação (LPA)',
        'P/L baixo pode indicar ação barata ou empresa em dificuldade',
        'P/L alto pode indicar expectativa de crescimento ou sobrepreço',
        'Compare sempre com empresas do mesmo setor',
        'Histórico da própria empresa também é importante'
      ],
      exemplo: 'Ação a R$ 20 com LPA de R$ 2 = P/L 10 (levaria 10 anos para recuperar via lucro)',
      cor: '#ef4444'
    },
    {
      id: 'pvp',
      titulo: 'P/VP (Preço sobre Valor Patrimonial)',
      definicao: 'Compara o preço da ação com o valor patrimonial por ação',
      detalhes: [
        'Cálculo: Preço da ação ÷ VPA (Valor Patrimonial por Ação)',
        'P/VP < 1 = ação teoricamente abaixo do valor contábil',
        'Útil para bancos e empresas com muitos ativos',
        'Não considera intangíveis (marca, tecnologia)',
        'Deve ser analisado junto com outros indicadores'
      ],
      exemplo: 'Ação a R$ 15 com VPA de R$ 20 = P/VP 0,75 (desconto ao patrimônio)',
      cor: '#f59e0b'
    },
    {
      id: 'roe',
      titulo: 'ROE (Return on Equity)',
      definicao: 'Mede a eficiência da empresa em gerar lucro com o patrimônio dos acionistas',
      detalhes: [
        'Cálculo: Lucro Líquido ÷ Patrimônio Líquido × 100',
        'ROE > 15% é considerado bom na B3',
        'Indica qualidade da gestão',
        'Empresas com ROE consistente são preferíveis',
        'Compare com a taxa básica de juros (Selic)'
      ],
      exemplo: 'ROE de 20% significa que a empresa gera R$ 20 de lucro para cada R$ 100 de patrimônio',
      cor: '#06b6d4'
    }
  ];

  const dicasGerais = [
    {
      titulo: "🎯 Defina seu Perfil de Risco",
      descricao: "Conheça sua tolerância ao risco antes de investir. Seja honesto sobre quanto pode perder sem comprometer seu sono.",
      dicas: [
        "Faça o teste de perfil em uma corretora",
        "Considere sua idade e objetivos",
        "Revisite seu perfil anualmente"
      ]
    },
    {
      titulo: "📊 Diversifique sua Carteira",
      descricao: "Não coloque todos os ovos na mesma cesta. Diversificar reduz riscos e melhora retornos no longo prazo.",
      dicas: [
        "Invista em setores diferentes",
        "Combine renda fixa e variável",
        "Considere investimentos no exterior"
      ]
    },
    {
      titulo: "💰 Reserva de Emergência em Primeiro Lugar",
      descricao: "Antes de investir em renda variável, tenha de 6 a 12 meses de gastos em investimentos líquidos.",
      dicas: [
        "Use Tesouro Selic ou CDB com liquidez diária",
        "Mantenha em conta separada dos investimentos",
        "Não use para especulação"
      ]
    },
    {
      titulo: "📈 Invista Regularmente (Dollar Cost Average)",
      descricao: "Aportes mensais regulares reduzem o risco de timing e aproveitam a volatilidade a seu favor.",
      dicas: [
        "Defina um valor fixo mensal",
        "Invista independente do cenário",
        "Aumente aportes quando possível"
      ]
    },
    {
      titulo: "🔍 Estude Antes de Investir",
      descricao: "Nunca invista em algo que não entende. Conhecimento é a melhor ferramenta contra perdas.",
      dicas: [
        "Leia relatórios das empresas",
        "Acompanhe notícias do setor",
        "Use simuladores antes de investir real"
      ]
    },
    {
      titulo: "⏰ Pense no Longo Prazo",
      descricao: "O mercado pode ser volátil no curto prazo, mas historicamente recompensa quem tem paciência.",
      dicas: [
        "Defina objetivos de 5+ anos",
        "Ignore ruídos diários do mercado",
        "Reinvista dividendos para potencializar ganhos"
      ]
    }
  ];

  const navegacao = [
    { id: 'perfis', titulo: 'Perfis de Investidor', icon: '👤' },
    { id: 'conceitos', titulo: 'Conceitos Importantes', icon: '📚' },
    { id: 'dicas', titulo: 'Dicas Gerais', icon: '💡' }
  ];

  const PerfilCard = ({ perfil }) => {
    const isExpandido = perfilExpandido === perfil.id;
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setPerfilExpandido(isExpandido ? null : perfil.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            {perfil.titulo}
          </h3>
          <div style={{
            backgroundColor: '#f8fafc',
            color: '#64748b',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            RF: {perfil.percentualRF}% | RV: {perfil.percentualRV}%
          </div>
        </div>

        <p style={{
          color: '#64748b',
          fontSize: '16px',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          {perfil.descricao}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: isExpandido ? '24px' : '0'
        }}>
          {perfil.caracteristicas.map((carac, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#374151'
            }}>
              <span style={{ color: perfil.cor }}>✓</span>
              {carac}
            </div>
          ))}
        </div>

        {isExpandido && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              💼 Sugestão de Carteira
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#059669',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🏛️ Renda Fixa ({perfil.sugestaoCarteira.rendaFixa.percentual}%)
                </h5>
                {perfil.sugestaoCarteira.rendaFixa.opcoes.map((opcao, index) => (
                  <div key={index} style={{
                    fontSize: '13px',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    • {opcao}
                  </div>
                ))}
              </div>

              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#dc2626',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📈 Renda Variável ({perfil.sugestaoCarteira.rendaVariavel.percentual}%)
                </h5>
                {perfil.sugestaoCarteira.rendaVariavel.opcoes.map((opcao, index) => (
                  <div key={index} style={{
                    fontSize: '13px',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>
                    • {opcao}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          {isExpandido ? 'Clique para recolher' : 'Clique para ver sugestão de carteira'}
        </div>
      </div>
    );
  };

  const ConceitoCard = ({ conceito }) => {
    const isExpandido = conceitoExpandido === conceito.id;
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setConceitoExpandido(isExpandido ? null : conceito.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: 0
          }}>
            {conceito.titulo}
          </h3>
          <div style={{
            backgroundColor: '#f8fafc',
            color: '#64748b',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            {isExpandido ? 'Ver menos' : 'Ver mais'}
          </div>
        </div>

        <p style={{
          color: '#64748b',
          fontSize: '16px',
          marginBottom: '16px',
          lineHeight: '1.5',
          fontWeight: '500'
        }}>
          {conceito.definicao}
        </p>

        {isExpandido && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              📋 Detalhes Importantes:
            </h4>

            <div style={{ marginBottom: '20px' }}>
              {conceito.detalhes.map((detalhe, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '14px',
                  color: '#374151',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  <span style={{ color: conceito.cor, marginTop: '2px' }}>•</span>
                  {detalhe}
                </div>
              ))}
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              border: `1px solid ${conceito.cor}`,
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#065f46',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                💡 Exemplo Prático:
              </h5>
              <p style={{
                fontSize: '14px',
                color: '#065f46',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {conceito.exemplo}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: '24px' 
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: '48px' 
      }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 16px 0'
        }}>
         Dicas de Investimentos
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '20px',
          margin: '0',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Guia completo com perfis de investidor, conceitos fundamentais e dicas práticas para maximizar seus resultados no mercado financeiro
        </p>
      </div>

      {/* Navegação */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {navegacao.map((item) => (
          <button
            key={item.id}
            onClick={() => setSecaoAtiva(item.id)}
            style={{
              backgroundColor: secaoAtiva === item.id ? '#3b82f6' : '#ffffff',
              color: secaoAtiva === item.id ? 'white' : '#64748b',
              padding: '12px 24px',
              borderRadius: '12px',
              border: secaoAtiva === item.id ? 'none' : '1px solid #e2e8f0',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.titulo}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Perfis de Investidor */}
        {secaoAtiva === 'perfis' && (
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                👤 Perfis de Investidor
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0 0 24px 0'
              }}>
                Conhecer seu perfil de investidor é essencial para administrar melhor suas finanças e ter mais sucesso em suas aplicações. Escolha o perfil que mais se adequa ao seu comportamento:
              </p>
            </div>

            {perfisInvestidor.map((perfil) => (
              <PerfilCard key={perfil.id} perfil={perfil} />
            ))}
          </div>
        )}

        {/* Conceitos Importantes */}
        {secaoAtiva === 'conceitos' && (
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                📚 Conceitos Fundamentais
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Domine os principais conceitos do mercado financeiro para tomar decisões mais assertivas:
              </p>
            </div>

            {conceitosImportantes.map((conceito) => (
              <ConceitoCard key={conceito.id} conceito={conceito} />
            ))}
          </div>
        )}

        {/* Dicas Gerais */}
        {secaoAtiva === 'dicas' && (
          <div>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                💡 Dicas Práticas para Investir
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Estratégias testadas e aprovadas para potencializar seus investimentos:
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {dicasGerais.map((dica, index) => (
                <div key={index} style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '12px'
                  }}>
                    {dica.titulo}
                  </h3>
                  <p style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    {dica.descricao}
                  </p>
                  <div>
                    {dica.dicas.map((item, itemIndex) => (
                      <div key={itemIndex} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '13px',
                        color: '#374151',
                        marginBottom: '6px',
                        lineHeight: '1.4'
                      }}>
                        <span style={{ color: '#10b981', marginTop: '2px' }}>✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default DicasInvestimentosPage;