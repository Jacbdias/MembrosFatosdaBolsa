'use client';

import React, { useState } from 'react';

const EbooksPage = () => {
  const [ebookExpandido, setEbookExpandido] = useState(null);

  const handleDownloadPlanilha = () => {
    // URL da planilha para download
    const planilhaUrl = "https://docs.google.com/spreadsheets/d/1ewnyAOmTj0qfB6GF1iLXGqTdciHHlaaNLQFpNxUZxsk/export?format=xlsx";
    
    // Criar elemento link temporário para download
    const link = document.createElement('a');
    link.href = planilhaUrl;
    link.download = 'Planilha_Milhas_Aereas.xlsx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = (ebook) => {
    // Criar elemento link temporário para download
    const link = document.createElement('a');
    link.href = ebook.arquivoPdf;
    link.download = `${ebook.titulo.replace(/\s+/g, '_')}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ebooks = [
    {
      id: 1,
      titulo: "Milhas Aéreas",
      subtitulo: "O Guia Completo para Maximizar suas Viagens",
      descricao: "Aprenda estratégias avançadas para acumular milhas aéreas, escolher os melhores cartões de crédito e viajar mais gastando menos.",
      capa: "✈️",
      categoria: "Viagens",
      cor: "#3b82f6",
      arquivoPdf: "/pdfs/milhas-aereas.pdf", // Caminho para o PDF
      topicos: [
        "Melhores cartões de crédito para milhas",
        "Estratégias de acúmulo acelerado",
        "Como usar milhas para upgrades",
        "Programas de fidelidade mais vantajosos",
        "Dicas para voos internacionais",
        "Como transferir pontos entre programas"
      ],
      beneficios: [
        "Economize até 70% em passagens aéreas",
        "Viaje na classe executiva pagando econômica",
        "Acesse salas VIP nos aeroportos",
        "Maximize pontos em compras do dia a dia"
      ],
      preview: "Este ebook te ensina desde o básico sobre programas de milhas até estratégias avançadas usadas por viajantes experientes. Descubra como transformar suas compras cotidianas em passagens aéreas gratuitas."
    },
    {
      id: 2,
      titulo: "Estudo IFIX vs IPCA",
      subtitulo: "Análise Comparativa de Rendimentos",
      descricao: "Análise detalhada da performance histórica dos Fundos Imobiliários versus a inflação, com projeções e estratégias de investimento.",
      capa: "🏢",
      categoria: "Investimentos",
      cor: "#10b981",
      arquivoPdf: "/pdfs/ifix-vs-ipca.pdf", // Caminho para o PDF
      topicos: [
        "Performance histórica IFIX x IPCA",
        "Análise de ciclos econômicos",
        "Melhores FIIs por segmento",
        "Estratégias de diversificação",
        "Reinvestimento de dividendos",
        "Projeções futuras do setor"
      ],
      beneficios: [
        "Compreenda a real rentabilidade dos FIIs",
        "Identifique os melhores momentos para investir",
        "Diversifique sua carteira imobiliária",
        "Proteja seu patrimônio da inflação"
      ],
      preview: "Uma análise profunda que todo investidor em FIIs precisa conhecer. Dados históricos, gráficos comparativos e insights valiosos para suas decisões de investimento."
    },
    {
      id: 3,
      titulo: "O que nunca te contaram sobre investir nos EUA",
      subtitulo: "Segredos do Mercado Americano",
      descricao: "Descubra estratégias exclusivas, regulamentações importantes e oportunidades únicas no mercado financeiro americano.",
      capa: "🌍",
      categoria: "Investimentos Internacionais",
      cor: "#dc2626",
      arquivoPdf: "/pdfs/investir-nos-eua.pdf", // Caminho para o PDF
      topicos: [
        "Abertura de conta em corretoras americanas",
        "Tributação de investimentos no exterior",
        "REITs vs FIIs brasileiros",
        "ETFs americanos mais rentáveis",
        "Estratégias de hedge cambial",
        "Declaração no Imposto de Renda"
      ],
      beneficios: [
        "Diversifique internacionalmente",
        "Acesse os maiores mercados do mundo",
        "Proteja-se contra riscos do Real",
        "Invista nas melhores empresas globais"
      ],
      preview: "Informações que as corretoras brasileiras não te contam sobre investir no exterior. Um guia completo para investidores que querem ir além das fronteiras nacionais."
    },
    {
      id: 4,
      titulo: "Guia Definitivo do Investidor em Ações",
      subtitulo: "Da Teoria à Prática",
      descricao: "Manual completo para investir em ações com segurança e consistência, desde conceitos básicos até estratégias avançadas de análise.",
      capa: "📈",
      categoria: "Renda Variável",
      cor: "#f59e0b",
      arquivoPdf: "/pdfs/guia-investidor-acoes.pdf", // Caminho para o PDF
      topicos: [
        "Análise fundamentalista completa",
        "Análise técnica para timing",
        "Construção de carteiras diversificadas",
        "Gestão de riscos e stop loss",
        "Estratégias de dividendos",
        "Psychology trading e controle emocional"
      ],
      beneficios: [
        "Monte uma carteira vencedora",
        "Identifique ações subvalorizadas",
        "Controle suas emoções ao investir",
        "Maximize seus retornos no longo prazo"
      ],
      preview: "O guia mais completo sobre investimento em ações do mercado brasileiro. Teoria e prática unidos para formar investidores de sucesso."
    }
  ];

  const EbookCard = ({ ebook }) => {
    const isExpandido = ebookExpandido === ebook.id;
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => setEbookExpandido(isExpandido ? null : ebook.id)}
      onMouseEnter={(e) => {
        if (!isExpandido) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExpandido) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        }
      }}
      >
        {/* Decoração lateral */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          backgroundColor: '#374151'
        }} />

        {/* Header do Card */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '20px',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '48px' }}>{ebook.capa}</span>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 4px 0',
                  lineHeight: '1.2'
                }}>
                  {ebook.titulo}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {ebook.subtitulo}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#374151',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            {ebook.categoria}
          </div>
        </div>

        {/* Descrição */}
        <p style={{
          color: '#374151',
          fontSize: '16px',
          marginBottom: '16px',
          lineHeight: '1.6'
        }}>
          {ebook.descricao}
        </p>

        {/* Preview */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#475569',
            margin: 0,
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            {ebook.preview}
          </p>
        </div>

{/* Botões Download */}
<div style={{
  display: 'flex',
  justifyContent: 'center',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: isExpandido ? '24px' : '0'
}}>
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleDownload(ebook);
    }}
    style={{
      backgroundColor: '#374151',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
    }}
  >
    📥 Baixar Ebook
  </button>
  
  {ebook.titulo === "Milhas Aéreas" && (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        window.open('https://docs.google.com/spreadsheets/d/1ewnyAOmTj0qfB6GF1iLXGqTdciHHlaaNLQFpNxUZxsk/edit', '_blank');
      }}
      style={{
        backgroundColor: '#374151',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '12px',
        border: 'none',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer'
      }}
    >
      📊 Abrir Planilha
    </button>
  )}
</div>

        {/* Conteúdo Expandido */}
        {isExpandido && (
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '24px',
            marginTop: '24px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {/* Tópicos Abordados */}
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  📚 Tópicos Abordados
                </h4>
                {ebook.topicos.map((topico, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#374151',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: ebook.cor, marginTop: '2px' }}>•</span>
                    {topico}
                  </div>
                ))}
              </div>

              {/* Benefícios */}
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${ebook.cor}33`
              }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✨ O que você vai conquistar
                </h4>
                {ebook.beneficios.map((beneficio, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#065f46',
                    marginBottom: '8px',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: '#10b981', marginTop: '2px' }}>✓</span>
                    {beneficio}
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action Expandido */}
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                🎯 Pronto para dar o próximo passo?
              </h4>
              <p style={{
                color: '#64748b',
                fontSize: '14px',
                marginBottom: '16px',
                lineHeight: '1.5'
              }}>
                Baixe agora e comece a aplicar as estratégias que vão transformar seus resultados!
              </p>
              <button               style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '14px 40px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(ebook);
              }}
              >
                🚀 Baixar Agora
              </button>
            </div>
          </div>
        )}

        {/* Indicador de expansão */}
        <div style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '12px',
          color: '#64748b'
        }}>
          {isExpandido ? '👆 Clique para recolher' : '👆 Clique para ver mais detalhes'}
        </div>
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
          📚 Ebooks Exclusivos
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
          Conteúdos exclusivos e estratégias comprovadas para acelerar seus resultados financeiros e de investimentos
        </p>
      </div>



      {/* Lista de Ebooks */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {ebooks.map((ebook) => (
          <EbookCard key={ebook.id} ebook={ebook} />
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '64px',
        padding: '32px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '64px auto 0 auto'
      }}>
        <h3 style={{
          fontWeight: '600',
          fontSize: '24px',
          margin: '0 0 16px 0',
          color: '#1e293b'
        }}>
          🎓 Conhecimento que Transforma
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Estes ebooks foram criados com base em anos de experiência prática no mercado financeiro. 
          Baixe todos e comece a aplicar as estratégias que realmente funcionam!
        </p>
      </div>
    </div>
  );
};

export default EbooksPage;