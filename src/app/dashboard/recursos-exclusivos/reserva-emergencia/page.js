'use client';

import React, { useState } from 'react';

const ReservaEmergenciaPage = () => {
  const [calculadoraAberta, setCalculadoraAberta] = useState(false);
  const [rendaMensal, setRendaMensal] = useState('');
  const [mesesReserva, setMesesReserva] = useState(6);
  const [investimentoSelecionado, setInvestimentoSelecionado] = useState(null);

  const investimentos = [
    {
      id: 1,
      nome: "CDB Pós-fixado - BTG Pactual",
      rentabilidade: "101% CDI",
      aplicacaoMinima: "R$ 50,00",
      resgate: "D+0 (até 17h)",
      onde: "Corretora BTG Pactual",
      pros: ["Rentabilidade acima dos outros bancos de igual porte"],
      contras: ["Não há"],
      obs: "Opção de CDB 102,5% CDI disponível com carência de 90 dias",
      destaque: true,
      cor: "#10b981"
    },
    {
      id: 2,
      nome: "Tesouro Selic 2029",
      rentabilidade: "~100% CDI",
      aplicacaoMinima: "R$ 114,56",
      resgate: "D+1",
      onde: "Todas as plataformas",
      pros: ["Risco soberano por ser título público"],
      contras: ["D+1 se resgatar após 13h", "D+0 se resgatar antes das 13h"],
      obs: "Taxa de custódia de 0,2% semestral (somente acima de R$ 10 mil)",
      destaque: false,
      cor: "#3b82f6"
    },
    {
      id: 3,
      nome: "CDB Pós-fixado - Sofisa Direto",
      rentabilidade: "110% CDI",
      aplicacaoMinima: "R$ 0,00",
      resgate: "D+0",
      onde: "Sofisa Direto",
      pros: ["Maior rentabilidade do grupo"],
      contras: ["Lentidão no app relatada por usuários"],
      obs: "Melhor rentabilidade para liquidez diária",
      destaque: true,
      cor: "#8b5cf6"
    },
    {
      id: 4,
      nome: "CDB Liquidez Diária - Banco Inter",
      rentabilidade: "100% CDI",
      aplicacaoMinima: "R$ 100,00",
      resgate: "D+0 (até 21h50)",
      onde: "Banco Inter",
      pros: ["Facilidade", "Horário estendido para resgate"],
      contras: ["Existem opções com taxas melhores"],
      obs: "Boa opção para quem já é cliente Inter",
      destaque: false,
      cor: "#f59e0b"
    },
    {
      id: 5,
      nome: "CDB Liquidez Diária - Banco Itaú",
      rentabilidade: "100% CDI",
      aplicacaoMinima: "R$ 0,00",
      resgate: "D+0",
      onde: "Banco Itaú",
      pros: ["Facilidade", "Sem valor mínimo"],
      contras: ["Existem opções com taxas melhores"],
      obs: "Conveniente para clientes Itaú",
      destaque: false,
      cor: "#ef4444"
    },
    {
      id: 6,
      nome: "Trend DI FIC FIRF - XP",
      rentabilidade: "100% CDI",
      aplicacaoMinima: "R$ 100,00",
      resgate: "D+0 (até 15h)",
      onde: "XP Investimentos",
      pros: ["Facilidade de encontrar", "Plataforma robusta"],
      contras: ["Taxa de 0,2% a.a."],
      obs: "Similar ao Tesouro Selic em custos",
      destaque: false,
      cor: "#6366f1"
    }
  ];

  const tesouroDireto = {
    nome: "Tesouro IPCA+ (Longo Prazo)",
    descricao: "Para quem tem objetivo de carregar até o vencimento",
    rentabilidade: "IPCA + Taxa fixa",
    tributacao: "IR regressivo (15% após 720 dias)",
    taxa: "0,2% a.a. de administração",
    observacao: "Venda antecipada sujeita à marcação a mercado (pode gerar prejuízo)"
  };

  const calcularReserva = () => {
    if (!rendaMensal) return 0;
    const renda = parseFloat(rendaMensal.replace(/[^\d,]/g, '').replace(',', '.'));
    return renda * mesesReserva;
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const InvestmentCard = ({ investimento }) => (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: investimento.destaque ? `2px solid ${investimento.cor}` : '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '20px',
        position: 'relative',
        boxShadow: investimento.destaque ? `0 8px 32px ${investimento.cor}20` : '0 2px 8px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setInvestimentoSelecionado(investimento.id === investimentoSelecionado ? null : investimento.id)}
    >
      {investimento.destaque && (
        <div style={{
          position: 'absolute',
          top: '-1px',
          right: '20px',
          backgroundColor: investimento.cor,
          color: 'white',
          padding: '6px 16px',
          borderRadius: '0 0 12px 12px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase'
        }}>
          ⭐ Destaque
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 8px 0'
        }}>
          {investimento.nome}
        </h3>
        <div style={{
          display: 'inline-block',
          backgroundColor: `${investimento.cor}15`,
          color: investimento.cor,
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '700'
        }}>
          {investimento.rentabilidade}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
            APLICAÇÃO MÍNIMA
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
            {investimento.aplicacaoMinima}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
            RESGATE
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
            {investimento.resgate}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
            ONDE ENCONTRAR
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
            {investimento.onde}
          </div>
        </div>
      </div>

      {investimentoSelecionado === investimento.id && (
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '20px',
          marginTop: '16px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#059669', margin: '0 0 8px 0' }}>
                ✅ PRÓS
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#064e3b' }}>
                {investimento.pros.map((pro, index) => (
                  <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>{pro}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', margin: '0 0 8px 0' }}>
                ❌ CONTRAS
              </h4>
              <ul style={{ margin: 0, paddingLeft: '16px', color: '#7f1d1d' }}>
                {investimento.contras.map((contra, index) => (
                  <li key={index} style={{ fontSize: '14px', marginBottom: '4px' }}>{contra}</li>
                ))}
              </ul>
            </div>
          </div>
          {investimento.obs && (
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
                💡 OBSERVAÇÃO
              </div>
              <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                {investimento.obs}
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        fontSize: '12px',
        color: '#64748b'
      }}>
        {investimentoSelecionado === investimento.id ? '👆 Clique para recolher' : '👆 Clique para mais detalhes'}
      </div>
    </div>
  );

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
          🏦 Reserva de Emergência
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: '20px',
          margin: '0 0 24px 0',
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          As melhores opções de investimento para sua reserva de emergência com liquidez diária e baixo risco
        </p>

        {/* Calculadora Toggle */}
        <button
          onClick={() => setCalculadoraAberta(!calculadoraAberta)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 auto',
            transition: 'all 0.2s'
          }}
        >
          🧮 {calculadoraAberta ? 'Fechar' : 'Abrir'} Calculadora de Reserva
        </button>
      </div>

      {/* Calculadora */}
      {calculadoraAberta && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          padding: '32px',
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px auto'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            📊 Calcule sua Reserva Ideal
          </h3>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Renda Mensal (R$):
              </label>
              <input
                type="text"
                value={rendaMensal}
                onChange={(e) => setRendaMensal(e.target.value)}
                placeholder="Ex: 5.000,00"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Meses de Reserva: {mesesReserva}
              </label>
              <input
                type="range"
                min="3"
                max="12"
                value={mesesReserva}
                onChange={(e) => setMesesReserva(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: '#e2e8f0',
                  outline: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#64748b',
                marginTop: '4px'
              }}>
                <span>3 meses</span>
                <span>6 meses</span>
                <span>12 meses</span>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px', fontWeight: '600' }}>
                SUA RESERVA IDEAL
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
                {formatarMoeda(calcularReserva())}
              </div>
              <div style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>
                {mesesReserva} meses de despesas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investimentos Principais */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          💰 Opções para Reserva de Emergência
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          {investimentos.map((investimento) => (
            <InvestmentCard key={investimento.id} investimento={investimento} />
          ))}
        </div>

        {/* Tesouro IPCA - Seção Especial */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #f59e0b',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>
              📈 Longo Prazo
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: 0
            }}>
              {tesouroDireto.nome}
            </h3>
          </div>

          <p style={{
            fontSize: '16px',
            color: '#64748b',
            marginBottom: '24px',
            lineHeight: '1.6'
          }}>
            {tesouroDireto.descricao}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#fff7ed',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                RENTABILIDADE
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                {tesouroDireto.rentabilidade}
              </div>
            </div>
            <div style={{
              backgroundColor: '#fff7ed',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                TRIBUTAÇÃO
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                {tesouroDireto.tributacao}
              </div>
            </div>
            <div style={{
              backgroundColor: '#fff7ed',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #f59e0b'
            }}>
              <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
                TAXA ANUAL
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#92400e' }}>
                {tesouroDireto.taxa}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                IMPORTANTE - LONGO PRAZO
              </div>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#92400e',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {tesouroDireto.observacao}
            </p>
          </div>
        </div>

        {/* Dicas Importantes */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            💡 Dicas Importantes
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#065f46', marginBottom: '8px' }}>
                Objetivo da Reserva
              </h4>
              <p style={{ fontSize: '14px', color: '#065f46', margin: 0, lineHeight: '1.5' }}>
                A reserva de emergência deve cobrir de 6 a 12 meses de seus gastos essenciais. Priorize liquidez e segurança sobre rentabilidade.
              </p>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #3b82f6',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>
                Liquidez Diária
              </h4>
              <p style={{ fontSize: '14px', color: '#1e40af', margin: 0, lineHeight: '1.5' }}>
                Escolha investimentos com resgate em D+0 ou D+1. Em emergências, você precisa acessar o dinheiro rapidamente.
              </p>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛡️</div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>
                Segurança
              </h4>
              <p style={{ fontSize: '14px', color: '#92400e', margin: 0, lineHeight: '1.5' }}>
                Invista apenas em produtos com garantia do FGC (até R$ 250 mil) ou risco soberano (Tesouro Direto).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaEmergenciaPage;