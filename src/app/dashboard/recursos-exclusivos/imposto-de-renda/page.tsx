'use client';

import React, { useState } from 'react';

const ImpostoRendaPage = () => {
  const [secaoAtiva, setSecaoAtiva] = useState('renda-variavel-brasil');
  const [passoExpandido, setPassoExpandido] = useState(null);
  const [videoTocando, setVideoTocando] = useState(null);

  const videos = [
    { id: 1, titulo: "Declaração pré-preenchida", vimeoId: "SEU_VIDEO_ID_1" },
    { id: 2, titulo: "Resumo da Declaração IRPF - O que é e para que serve", vimeoId: "SEU_VIDEO_ID_2" },
    { id: 3, titulo: "Como Baixar o Programa IRPF", vimeoId: "SEU_VIDEO_ID_3" },
    { id: 4, titulo: "Como Fazer Backup da Declaração IRPF", vimeoId: "SEU_VIDEO_ID_4" },
    { id: 5, titulo: "Como Retificar a Declaração IRPF", vimeoId: "SEU_VIDEO_ID_5" },
    { id: 6, titulo: "Tributação na bolsa de valores", vimeoId: "SEU_VIDEO_ID_6" },
    { id: 7, titulo: "Nota de corretagem", vimeoId: "SEU_VIDEO_ID_7" },
    { id: 8, titulo: "Calculando preço médio", vimeoId: "SEU_VIDEO_ID_8" },
    { id: 9, titulo: "Planilha de controle de operações", vimeoId: "SEU_VIDEO_ID_9" },
    { id: 10, titulo: "Como declarar posição em ações", vimeoId: "SEU_VIDEO_ID_10" },
    { id: 11, titulo: "Como declarar vendas de ações em RV", vimeoId: "SEU_VIDEO_ID_11" },
    { id: 12, titulo: "Como gerar DARF e pagar IR dos lucros", vimeoId: "SEU_VIDEO_ID_12" },
    { id: 13, titulo: "Como pagar DARF atrasado", vimeoId: "SEU_VIDEO_ID_13" },
    { id: 14, titulo: "Como compensar prejuízo", vimeoId: "SEU_VIDEO_ID_14" },
    { id: 15, titulo: "Como declarar vendas de fundos imobiliários", vimeoId: "SEU_VIDEO_ID_15" },
    { id: 16, titulo: "Como declarar rendimentos isentos", vimeoId: "SEU_VIDEO_ID_16" },
    { id: 17, titulo: "Como declarar lucros isentos em vendas de ações", vimeoId: "SEU_VIDEO_ID_17" },
    { id: 18, titulo: "Como declarar rendimentos de FIIs", vimeoId: "SEU_VIDEO_ID_18" },
    { id: 19, titulo: "Como declarar recebimento de bonificações de ações", vimeoId: "SEU_VIDEO_ID_19" },
    { id: 20, titulo: "Como declarar juros sobre capital próprio", vimeoId: "SEU_VIDEO_ID_20" },
    { id: 21, titulo: "Como declarar saldo em conta na corretora do Brasil", vimeoId: "SEU_VIDEO_ID_21" },
    { id: 22, titulo: "Como declarar BDR", vimeoId: "SEU_VIDEO_ID_22" },
    { id: 23, titulo: "Como declarar ETF", vimeoId: "SEU_VIDEO_ID_23" },
    { id: 24, titulo: "Como declarar grupamento e desdobramento", vimeoId: "SEU_VIDEO_ID_24" },
    { id: 25, titulo: "Tributação de Investimentos no Exterior", vimeoId: "SEU_VIDEO_ID_25" },
    { id: 26, titulo: "Investimentos no Exterior (ganhos de capital)", vimeoId: "SEU_VIDEO_ID_26" },
    { id: 27, titulo: "Como Declarar Saldo Em Conta no Exterior", vimeoId: "SEU_VIDEO_ID_27" },
    { id: 28, titulo: "Carnê Leão - Quem precisa fazer", vimeoId: "SEU_VIDEO_ID_28" },
    { id: 29, titulo: "Carnê Leão para dividendos", vimeoId: "SEU_VIDEO_ID_29" },
    { id: 30, titulo: "Criptomoedas", vimeoId: "SEU_VIDEO_ID_30" },
    { id: 31, titulo: "Criptos - Tributação e Obrigações para Investidores", vimeoId: "SEU_VIDEO_ID_31" },
    { id: 32, titulo: "Como Declarar Criptos no IRPF", vimeoId: "SEU_VIDEO_ID_32" }
  ];

  const navegacao = [
    { id: 'renda-variavel-brasil', titulo: 'Renda Variável - Brasil', icon: '📈' },
    { id: 'renda-variavel-exterior', titulo: 'Renda Variável - Exterior', icon: '🌍' },
    { id: 'renda-fixa', titulo: 'Renda Fixa', icon: '🏦' },
    { id: 'videos', titulo: 'Vídeos', icon: '🎥' },
    { id: 'dicas-gerais', titulo: 'Dicas Gerais', icon: '💡' }
  ];

  const rendaVariavelBrasil = [
    {
      id: 1,
      titulo: "Bens e Direitos - Ações",
      categoria: "Cadastro de Ativos",
      icone: "📋",
      descricao: "Como cadastrar suas ações na ficha de Bens e Direitos",
      passos: [
        "Acesse a aba 'Bens e Direitos' no programa da Receita",
        "Clique em 'Novo' e selecione o código '31 - Ações (inclusive as listadas em bolsa)'",
        "No campo 'Localização', coloque 'Brasil'",
        "Em 'Discriminação', informe: 'X ações da empresa NOME4, CNPJ: XX.XXX.XXX/0001-XX'",
        "Valor em 31/12/ano anterior: coloque o valor total das ações no final do ano passado",
        "Valor em 31/12/ano atual: coloque o valor total das ações no final deste ano",
        "Repita o processo para cada empresa diferente que você possui ações"
      ],
      dicas: [
        "Use sempre o preço de fechamento do último dia útil do ano",
        "Agrupe ações da mesma empresa em uma única linha",
        "Mantenha os informes de rendimentos das corretoras organizados",
        "O CNPJ da empresa pode ser encontrado no site da CVM"
      ],
      documentos: [
        "Informe de Rendimentos da corretora",
        "Extratos de movimentação",
        "Nota de corretagem das operações"
      ]
    },
    {
      id: 2,
      titulo: "Bens e Direitos - FIIs",
      categoria: "Cadastro de Ativos",
      icone: "🏢",
      descricao: "Como declarar Fundos de Investimento Imobiliário",
      passos: [
        "Na aba 'Bens e Direitos', clique em 'Novo'",
        "Selecione o código '73 - Fundo de Investimento Imobiliário'",
        "No campo 'Localização', coloque 'Brasil'",
        "Em 'Discriminação', informe: 'X cotas do FII NOME11, CNPJ: XX.XXX.XXX/0001-XX'",
        "Valor em 31/12/ano anterior: valor total das cotas no ano passado",
        "Valor em 31/12/ano atual: valor total das cotas neste ano",
        "Cadastre cada FII separadamente"
      ],
      dicas: [
        "FIIs são declarados separadamente das ações",
        "Use o preço de fechamento do último dia útil",
        "Os dividendos de FIIs são isentos para pessoa física",
        "Guarde todos os informes de rendimentos"
      ],
      documentos: [
        "Informe de Rendimentos da corretora",
        "Informe de Rendimentos do FII",
        "Extrato de posição em 31/12"
      ]
    },
    {
      id: 3,
      titulo: "Rendimentos Isentos - Dividendos",
      categoria: "Rendimentos",
      icone: "💰",
      descricao: "Como declarar dividendos recebidos de ações",
      passos: [
        "Acesse a aba 'Rendimentos Isentos e Não Tributáveis'",
        "Clique em 'Novo' e selecione '09 - Lucros e dividendos recebidos'",
        "No campo 'Tipo de beneficiário', selecione 'Titular'",
        "Em 'CNPJ da Fonte Pagadora', informe o CNPJ da empresa",
        "Digite o nome da empresa no campo 'Nome da Fonte Pagadora'",
        "Informe o valor total de dividendos recebidos da empresa no ano",
        "Repita para cada empresa que pagou dividendos"
      ],
      dicas: [
        "Dividendos de ações são isentos de Imposto de Renda",
        "Some todos os dividendos da mesma empresa no ano",
        "Verifique no Informe de Rendimentos da corretora",
        "Guarde comprovantes dos dividendos recebidos"
      ],
      documentos: [
        "Informe de Rendimentos da corretora",
        "Comprovantes de dividendos",
        "Extrato da conta corrente (comprovação do recebimento)"
      ]
    },
    {
      id: 4,
      titulo: "Ganhos de Capital - Day Trade",
      categoria: "Tributação",
      icone: "⚡",
      descricao: "Como declarar ganhos com day trade (20%)",
      passos: [
        "Acesse 'Rendimentos Tributáveis Recebidos de PJ'",
        "Clique em 'Novo' e selecione '10 - Outros'",
        "CNPJ da Fonte: informe o CNPJ da corretora",
        "Nome da Fonte: nome da corretora",
        "Valor: total dos ganhos líquidos com day trade no ano",
        "IR Retido na Fonte: valor do imposto já recolhido (se houver)",
        "Na aba 'Ganhos de Capital', declare também os ganhos líquidos"
      ],
      dicas: [
        "Day trade tem alíquota de 20% sobre o ganho líquido",
        "Perdas de day trade só compensam ganhos de day trade",
        "Declare apenas o resultado líquido mensal",
        "Mantenha o controle mensal de ganhos e perdas"
      ],
      documentos: [
        "Informe de Rendimentos da corretora",
        "DARF recolhidas mensalmente",
        "Controle de operações day trade"
      ]
    },
    {
      id: 5,
      titulo: "Ganhos de Capital - Swing Trade",
      categoria: "Tributação",
      icone: "📊",
      descricao: "Como declarar ganhos com operações normais (15%)",
      passos: [
        "Acesse a aba 'Ganhos de Capital'",
        "Clique em 'Novo' e selecione '05 - Ações'",
        "Mês: informe o mês da operação",
        "Valor da alienação: total vendido no mês",
        "Custo de aquisição: total do custo das ações vendidas",
        "Resultado: ganho ou perda do mês",
        "IR devido: 15% sobre ganhos acima de R$ 20.000/mês",
        "Repita para cada mês que teve operações"
      ],
      dicas: [
        "Vendas até R$ 20.000/mês são isentas de IR",
        "Perdas podem compensar ganhos futuros",
        "Use o método FIFO (primeiro que entra, primeiro que sai)",
        "Mantenha controle detalhado de compras e vendas"
      ],
      documentos: [
        "Notas de corretagem",
        "Planilha de controle de operações",
        "DARF pagas (se houver imposto devido)"
      ]
    }
  ];

  const rendaVariavelExterior = [
    {
      id: 1,
      titulo: "Bens e Direitos - Ativos no Exterior",
      categoria: "Cadastro de Ativos",
      icone: "🌎",
      descricao: "Como cadastrar ações e ETFs internacionais",
      passos: [
        "Na aba 'Bens e Direitos', clique em 'Novo'",
        "Para ações: código '31 - Ações' / Para ETFs: código '99 - Outros bens e direitos'",
        "Localização: País onde está o ativo (ex: Estados Unidos)",
        "Discriminação: 'X ações da AAPL na corretora NOME' ou 'X cotas do ETF VTI'",
        "Valor em 31/12: converta o valor em dólares para reais pela cotação do BC",
        "Use a cotação de venda do dólar do último dia útil do ano",
        "Declare cada ativo separadamente"
      ],
      dicas: [
        "Use sempre a cotação oficial do Banco Central",
        "Declare em reais, mesmo que o ativo seja em outra moeda",
        "Para ETFs, use o código 99 (Outros bens e direitos)",
        "Mantenha extratos da corretora internacional"
      ],
      documentos: [
        "Extratos da corretora internacional",
        "Comprovantes de transferência de recursos",
        "Cotação do dólar do BC em 31/12"
      ]
    },
    {
      id: 2,
      titulo: "CBE - Capitais Brasileiros no Exterior",
      categoria: "Obrigação Especial",
      icone: "📄",
      descricao: "Declaração obrigatória para valores acima de US$ 100.000",
      passos: [
        "Se o total de ativos no exterior for superior a US$ 100.000 em 31/12, é obrigatório",
        "Acesse o site do Banco Central e baixe o programa CBE",
        "Cadastre-se no sistema Sisbacen do BC",
        "Declare todos os ativos no exterior em detalhes",
        "Prazo: até 5º dia útil de abril",
        "Após enviar, imprima o protocolo de entrega"
      ],
      dicas: [
        "CBE é diferente da declaração do IR",
        "Multa por atraso pode chegar a 25% do valor",
        "Declare mesmo que não tenha ganhos",
        "Mantenha cópia da declaração enviada"
      ],
      documentos: [
        "Protocolo de entrega do CBE",
        "Extratos detalhados da corretora",
        "Comprovantes de todas as transferências"
      ]
    },
    {
      id: 3,
      titulo: "Rendimentos do Exterior",
      categoria: "Tributação",
      icone: "💵",
      descricao: "Como declarar dividendos e ganhos internacionais",
      passos: [
        "Acesse 'Rendimentos Recebidos do Exterior'",
        "Para dividendos: selecione 'Dividendos'",
        "País de origem: país que pagou o dividendo",
        "Valor em moeda estrangeira: valor original",
        "Valor em reais: converta pela cotação do dia do recebimento",
        "IR pago no exterior: valor do imposto retido no país de origem",
        "O IR pago no exterior pode ser compensado no Brasil"
      ],
      dicas: [
        "Dividendos do exterior são tributáveis no Brasil",
        "Use a cotação do dia do recebimento para conversão",
        "IR pago no exterior compensa IR devido no Brasil",
        "Mantenha comprovantes de IR retido no exterior"
      ],
      documentos: [
        "Comprovantes de dividendos recebidos",
        "Tax forms do país de origem",
        "Extratos de movimentação internacional"
      ]
    },
    {
      id: 4,
      titulo: "Ganhos de Capital no Exterior",
      categoria: "Tributação",
      icone: "💹",
      descricao: "Como declarar ganhos com venda de ativos internacionais",
      passos: [
        "Acesse 'Ganhos de Capital'",
        "Selecione '99 - Outros ganhos de capital'",
        "Discriminação: 'Venda de ações/ETFs no exterior'",
        "Valor da alienação: total vendido convertido em reais",
        "Custo de aquisição: valor de compra convertido em reais",
        "Use a cotação do dólar na data de cada operação",
        "Aplique a tabela progressiva (15% a 22,5%)"
      ],
      dicas: [
        "Ganhos no exterior seguem tabela progressiva",
        "Considere variação cambial no cálculo",
        "Mantenha controle detalhado das operações",
        "Perdas podem compensar ganhos"
      ],
      documentos: [
        "Histórico de operações da corretora",
        "Controle de cotações do dólar",
        "Planilha de ganhos e perdas"
      ]
    }
  ];

  const rendaFixa = [
    {
      id: 1,
      titulo: "Bens e Direitos - CDB/LCI/LCA",
      categoria: "Cadastro de Ativos",
      icone: "🏦",
      descricao: "Como declarar investimentos em renda fixa",
      passos: [
        "Na aba 'Bens e Direitos', clique em 'Novo'",
        "Para CDB: código '45 - Aplicação de renda fixa'",
        "Para LCI/LCA: código '45 - Aplicação de renda fixa'",
        "Localização: Brasil",
        "Discriminação: 'CDB Banco NOME, vencimento DD/MM/AAAA'",
        "Valor em 31/12/ano anterior: valor aplicado + rendimentos até 31/12",
        "Valor em 31/12/ano atual: valor atualizado em 31/12"
      ],
      dicas: [
        "Declare pelo valor bruto (antes do IR)",
        "LCI e LCA são isentas de IR para pessoa física",
        "CDB tem tributação regressiva",
        "Use o extrato de posição em 31/12"
      ],
      documentos: [
        "Informe de Rendimentos do banco",
        "Extrato de posição em 31/12",
        "Contratos de aplicação"
      ]
    },
    {
      id: 2,
      titulo: "Tesouro Direto",
      categoria: "Cadastro de Ativos",
      icone: "🇧🇷",
      descricao: "Como declarar títulos públicos",
      passos: [
        "Na aba 'Bens e Direitos', selecione código '45 - Aplicação de renda fixa'",
        "Localização: Brasil",
        "Discriminação: 'Tesouro IPCA+ 2029 - X títulos'",
        "Valor: use o valor líquido informado no extrato do Tesouro",
        "Para cada tipo de título, faça uma linha separada",
        "O valor já considera descontos de taxa de custódia"
      ],
      dicas: [
        "Use o extrato anual do Tesouro Direto",
        "Valor líquido já considera taxas",
        "Títulos diferentes = linhas separadas",
        "IR é retido na fonte automaticamente"
      ],
      documentos: [
        "Extrato anual do Tesouro Direto",
        "Informe de Rendimentos",
        "Comprovantes de aplicação"
      ]
    },
    {
      id: 3,
      titulo: "Rendimentos Tributáveis - CDB",
      categoria: "Tributação",
      icone: "💸",
      descricao: "Como declarar rendimentos de CDB sujeitos ao IR",
      passos: [
        "Acesse 'Rendimentos Tributáveis Recebidos de PJ'",
        "Selecione '06 - Rendimentos de aplicações financeiras'",
        "CNPJ da Fonte: CNPJ do banco",
        "Nome da Fonte: nome do banco",
        "Valor: total de rendimentos tributáveis no ano",
        "IR Retido: valor do imposto descontado na fonte",
        "Use os dados do Informe de Rendimentos"
      ],
      dicas: [
        "Declare apenas se houve resgate ou vencimento",
        "IR é retido na fonte conforme tabela regressiva",
        "22,5% até 180 dias, 15% acima de 720 dias",
        "LCI e LCA não entram aqui (são isentas)"
      ],
      documentos: [
        "Informe de Rendimentos do banco",
        "Comprovantes de resgate",
        "Extratos bancários"
      ]
    },
    {
      id: 4,
      titulo: "Fundos de Investimento",
      categoria: "Tributação",
      icone: "📈",
      descricao: "Como declarar cotas de fundos",
      passos: [
        "Bens e Direitos: código '73 - Fundos de investimento'",
        "Discriminação: 'X cotas do Fundo NOME, CNPJ XX.XXX.XXX/0001-XX'",
        "Valor: total das cotas em 31/12",
        "Se houve resgate: declare em 'Rendimentos Tributáveis'",
        "IR Fonte: '06 - Rendimentos de aplicações financeiras'",
        "Use o Informe de Rendimentos do fundo"
      ],
      dicas: [
        "Fundos têm come-cotas (IR antecipado)",
        "Declare pelo valor da cota em 31/12",
        "IR só na declaração se houve resgate",
        "Mantenha informes de todos os fundos"
      ],
      documentos: [
        "Informe de Rendimentos do fundo",
        "Extrato de posição",
        "Histórico de aplicações e resgates"
      ]
    }
  ];

  const dicasGerais = [
    {
      titulo: "📅 Organize-se Durante o Ano",
      descricao: "Manter a documentação organizada facilita muito na hora da declaração",
      dicas: [
        "Guarde todos os informes de rendimentos",
        "Mantenha planilha de controle de operações",
        "Arquive notas de corretagem",
        "Faça backup digital de todos os documentos"
      ]
    },
    {
      titulo: "💻 Use o Programa da Receita",
      descricao: "O programa oficial oferece todas as ferramentas necessárias",
      dicas: [
        "Baixe sempre a versão mais atual",
        "Faça backup do arquivo .dec",
        "Use a função 'Verificar Pendências'",
        "Confira o cálculo antes de transmitir"
      ]
    },
    {
      titulo: "🎯 Atenção aos Prazos",
      descricao: "Cumprir os prazos evita multas e complicações",
      dicas: [
        "IRPF: até 30 de abril (ou maio se prorrogado)",
        "CBE: até 5º dia útil de abril",
        "DARF de ganhos de capital: até último dia útil do mês seguinte",
        "Day trade: recolhimento até último dia útil do mês"
      ]
    },
    {
      titulo: "⚠️ Evite Erros Comuns",
      descricao: "Alguns erros podem gerar problemas com a Receita",
      dicas: [
        "Não esqueça de declarar ativos no exterior",
        "Confira CNPJ das empresas e corretoras",
        "Use cotações oficiais do Banco Central",
        "Declare todos os rendimentos, mesmo isentos"
      ]
    },
    {
      titulo: "🔍 Guarde Comprovantes",
      descricao: "A Receita pode solicitar comprovação a qualquer momento",
      dicas: [
        "Mantenha documentos por 5 anos",
        "Organize por ano-calendário",
        "Digitalize documentos importantes",
        "Tenha backup em nuvem"
      ]
    },
    {
      titulo: "💡 Quando Buscar Ajuda",
      descricao: "Alguns casos exigem orientação profissional",
      dicas: [
        "Operações complexas no exterior",
        "Grandes volumes de day trade",
        "Planejamento tributário",
        "Dúvidas sobre enquadramento"
      ]
    }
  ];

  const VideoCard = ({ video }) => {
    const estaTocando = videoTocando === video.id;
    
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 8px 0',
              lineHeight: '1.3'
            }}>
              🎬 {video.titulo}
            </h3>
            {estaTocando && (
              <span style={{
                fontSize: '11px',
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
          
          <button
            onClick={() => setVideoTocando(videoTocando === video.id ? null : video.id)}
            style={{
              backgroundColor: estaTocando ? '#dc2626' : '#374151',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {estaTocando ? '⏸️ Pausar' : '▶️ Assistir'}
          </button>
        </div>

        {estaTocando && (
          <div style={{
            marginTop: '16px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}>
            <iframe
              src={`https://player.vimeo.com/video/${video.vimeoId}?title=0&byline=0&portrait=0&color=000000&transparent=0&autoplay=1`}
              width="100%"
              height="300"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={video.titulo}
              style={{ borderRadius: '8px' }}
            />
          </div>
        )}
      </div>
    );
  };

  const PassoCard = ({ passo, dados }) => {
    const isExpandido = passoExpandido === passo.id;
    
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
      onClick={() => setPassoExpandido(isExpandido ? null : passo.id)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>{passo.icone}</span>
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                {passo.titulo}
              </h3>
              <span style={{
                backgroundColor: '#374151',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {passo.categoria}
              </span>
            </div>
          </div>
          <div style={{
            backgroundColor: '#f8fafc',
            color: '#64748b',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700'
          }}>
            {isExpandido ? 'Ver menos' : 'Ver passo a passo'}
          </div>
        </div>

        <p style={{
          color: '#64748b',
          fontSize: '16px',
          marginBottom: isExpandido ? '24px' : '0',
          lineHeight: '1.5'
        }}>
          {passo.descricao}
        </p>

        {isExpandido && (
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              📋 Passo a Passo:
            </h4>

            <div style={{ marginBottom: '24px' }}>
              {passo.passos.map((step, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{
                    backgroundColor: '#374151',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </span>
                  <span style={{
                    fontSize: '14px',
                    color: '#374151',
                    lineHeight: '1.5'
                  }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {passo.dicas && (
              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '16px',
                borderRadius: '12px',
                marginBottom: '16px',
                border: '1px solid #10b981'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: '12px'
                }}>
                  💡 Dicas Importantes:
                </h5>
                {passo.dicas.map((dica, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#065f46',
                    marginBottom: '6px'
                  }}>
                    <span style={{ color: '#10b981', marginTop: '2px' }}>✓</span>
                    {dica}
                  </div>
                ))}
              </div>
            )}

            {passo.documentos && (
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f59e0b'
              }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#92400e',
                  marginBottom: '12px'
                }}>
                  📄 Documentos Necessários:
                </h5>
                {passo.documentos.map((doc, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#92400e',
                    marginBottom: '6px'
                  }}>
                    <span style={{ color: '#f59e0b', marginTop: '2px' }}>•</span>
                    {doc}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const DicaCard = ({ dica, index }) => (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease'
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
  );

  const getDadosSecao = () => {
    switch(secaoAtiva) {
      case 'renda-variavel-brasil': return rendaVariavelBrasil;
      case 'renda-variavel-exterior': return rendaVariavelExterior;
      case 'renda-fixa': return rendaFixa;
      default: return [];
    }
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
          📊 Guia do Imposto de Renda
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
          Passo a passo completo para declarar seus investimentos no IRPF de forma correta e sem complicações
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
              backgroundColor: secaoAtiva === item.id ? '#374151' : '#ffffff',
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
        
        {/* Vídeos */}
        {secaoAtiva === 'videos' && (
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
                🎥 Vídeos sobre Declaração
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Tutoriais em vídeo com passo a passo detalhado para declarar seus investimentos:
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '16px'
            }}>
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        )}

        {/* Seções de Investimentos */}
        {secaoAtiva !== 'dicas-gerais' && secaoAtiva !== 'videos' && (
          <div>
            {getDadosSecao().map((passo) => (
              <PassoCard key={passo.id} passo={passo} dados={getDadosSecao()} />
            ))}
          </div>
        )}

        {/* Dicas Gerais */}
        {secaoAtiva === 'dicas-gerais' && (
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
                💡 Dicas Gerais para o IR
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                textAlign: 'center',
                lineHeight: '1.6',
                margin: '0'
              }}>
                Orientações importantes para uma declaração sem problemas:
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {dicasGerais.map((dica, index) => (
                <DicaCard key={index} dica={dica} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '64px',
        padding: '32px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontWeight: '600',
          fontSize: '24px',
          margin: '0 0 16px 0',
          color: '#1e293b'
        }}>
          ⚖️ Importante
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '16px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          Este guia é apenas informativo. Para casos complexos ou dúvidas específicas, 
          sempre consulte um contador qualificado. A Receita Federal é a fonte oficial para esclarecimentos.
        </p>
      </div>
    </div>
  );
};

export default ImpostoRendaPage;