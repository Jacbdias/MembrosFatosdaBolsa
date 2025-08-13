'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const getStatusColor = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
    case 'analisada':
      return '#10b981'; // Verde
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return '#f59e0b'; // Amarelo
    case 'pending':
    case 'pendente':
      return '#64748b'; // Cinza
    default:
      return '#64748b';
  }
};

const getStatusText = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
    case 'analisada':
      return 'Analisada';
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return 'Em Análise';
    case 'pending':
    case 'pendente':
      return 'Pendente';
    default:
      return 'Pendente';
  }
};

const getStatusIcon = (status) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
    case 'analisada':
      return '✅';
    case 'processing':
    case 'em_analise':
    case 'em análise':
      return '⏳';
    case 'pending':
    case 'pendente':
      return '📋';
    default:
      return '📋';
  }
};

function AnaliseCarteiraClientePage() {
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [respostas, setRespostas] = useState({
    tempoInvestimento: '',
    motivoMercado: '',
    objetivoCarteira: '',
    toleranciaOscilacao: '',
    comportamentoQueda: '',
    reservaEmergencia: '',
    reservaOportunidade: '',
    rendaMensal: '',
    valorAporte: '',
    nivelConhecimento: ''
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jaEnviouCarteira, setJaEnviouCarteira] = useState(false);
  const [carregandoVerificacao, setCarregandoVerificacao] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const verificarSeJaEnviou = async () => {
      try {
        const response = await fetch('/api/carteiras/minhas');
        const data = await response.json();
        
        if (response.ok && data.carteiras && data.carteiras.length > 0) {
          setJaEnviouCarteira(true);
        }
      } catch (error) {
        console.error('Erro ao verificar carteiras:', error);
      } finally {
        setCarregandoVerificacao(false);
      }
    };

    verificarSeJaEnviou();
  }, []);

  const perguntas = [
    {
      id: 'tempoInvestimento',
      pergunta: 'Há quanto tempo investe na bolsa?',
      tipo: 'select',
      opcoes: [
        'Nunca investi',
        'Menos de 1 ano',
        '1-2 anos',
        '3-5 anos',
        '6-10 anos',
        'Mais de 10 anos'
      ]
    },
    {
      id: 'motivoMercado',
      pergunta: 'Qual motivo o(a) levou até o mercado de ativos?',
      tipo: 'textarea'
    },
    {
      id: 'objetivoCarteira',
      pergunta: 'Qual seu objetivo com sua carteira?',
      tipo: 'select',
      opcoes: [
        'Dividendos (renda passiva)',
        'Crescimento (valorização)',
        'Equilibrio (dividendos + crescimento)',
        'Preservação de capital',
        'Aposentadoria',
        'Objetivo específico (casa, viagem, etc.)'
      ]
    },
    {
      id: 'toleranciaOscilacao',
      pergunta: 'Quanto você suportaria ver sua carteira total (% patrimônio líquido) oscilar para baixo?',
      tipo: 'select',
      opcoes: [
        'Até 5%',
        '5% - 10%',
        '10% - 20%',
        '20% - 30%',
        '30% - 50%',
        'Mais de 50%'
      ]
    },
    {
      id: 'comportamentoQueda',
      pergunta: 'Já passou por uma queda muito forte? Qual foi o seu comportamento?',
      tipo: 'textarea'
    },
    {
      id: 'reservaEmergencia',
      pergunta: 'Você já possui reserva de emergência? Onde está alocada?',
      tipo: 'textarea'
    },
    {
      id: 'reservaOportunidade',
      pergunta: 'Já possui uma reserva de oportunidade?',
      tipo: 'select',
      opcoes: [
        'Sim, tenho reserva de oportunidade',
        'Não, mas pretendo criar',
        'Não sei o que é reserva de oportunidade',
        'Não acho necessário'
      ]
    },
    {
      id: 'rendaMensal',
      pergunta: 'Qual sua renda mensal?',
      tipo: 'select',
      opcoes: [
        'Até R$ 2.000',
        'R$ 2.001 - R$ 5.000',
        'R$ 5.001 - R$ 10.000',
        'R$ 10.001 - R$ 20.000',
        'R$ 20.001 - R$ 50.000',
        'Acima de R$ 50.000'
      ]
    },
    {
      id: 'valorAporte',
      pergunta: 'Quanto sobra para aportar todos os meses?',
      tipo: 'select',
      opcoes: [
        'Até R$ 500',
        'R$ 501 - R$ 1.000',
        'R$ 1.001 - R$ 2.000',
        'R$ 2.001 - R$ 5.000',
        'R$ 5.001 - R$ 10.000',
        'Acima de R$ 10.000'
      ]
    },
    {
      id: 'nivelConhecimento',
      pergunta: 'Como você avalia seu conhecimento em relação à bolsa?',
      tipo: 'select',
      opcoes: [
        'Não sei nada',
        'Básico',
        'Intermediário',
        'Avançado',
        'Especialista'
      ]
    }
  ];

  const handleRespostaChange = (id, valor) => {
    setRespostas(prev => ({
      ...prev,
      [id]: valor
    }));
  };

  const todasPerguntasRespondidas = () => {
    return perguntas.every(pergunta => 
      respostas[pergunta.id] && respostas[pergunta.id].trim() !== ''
    );
  };

  const handleFileUpload = (file) => {
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setUploadedFile(file);
    } else {
      alert('Por favor, envie apenas arquivos Excel (.xlsx ou .xls)');
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !todasPerguntasRespondidas()) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('arquivo', uploadedFile);
      formData.append('questionario', JSON.stringify(respostas));
      
      console.log('📋 Enviando questionário:', respostas);
      console.log('📎 Enviando arquivo:', uploadedFile.name);
      
      const response = await fetch('/api/carteiras/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        setJaEnviouCarteira(true);
        setEtapaAtual(3);
        
        if (result.resumo) {
          alert(`Carteira enviada com sucesso!
          
Resumo do processamento:
• Valor total: R$ ${result.resumo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Quantidade de ativos: ${result.resumo.quantidadeAtivos}
• Arquivo processado: ${result.resumo.arquivoProcessado ? 'Sim' : 'Não'}
• Questionário incluído: ${result.resumo.questionarioIncluido ? 'Sim' : 'Não'}

Nossa equipe entrará em contato em breve com a análise completa.`);
        } else {
          alert('Carteira enviada com sucesso! Nossa equipe entrará em contato em breve.');
        }
        
        setRespostas({
          tempoInvestimento: '',
          motivoMercado: '',
          objetivoCarteira: '',
          toleranciaOscilacao: '',
          comportamentoQueda: '',
          reservaEmergencia: '',
          reservaOportunidade: '',
          rendaMensal: '',
          valorAporte: '',
          nivelConhecimento: ''
        });
        setUploadedFile(null);
      } else {
        alert(`Erro: ${result.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro no envio:', error);
      alert('Erro ao enviar análise. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const gerarModeloProfissional = () => {
    const wb = XLSX.utils.book_new();
    
    // ===========================================
    // 1. ABA INSTRUÇÕES
    // ===========================================
    const instrucoes = [
      ['FATOS DA BOLSA - ANÁLISE DE CARTEIRA PROFISSIONAL'],
      [''],
      ['INSTRUÇÕES DE PREENCHIMENTO'],
      [''],
      ['📋 IMPORTANTE:'],
      ['• Preencha apenas as células com 🔵 AZUL'],
      ['• NÃO altere as células com ⚪ CINZA (calculadas automaticamente)'],
      ['• Use vírgula (,) para decimais. Ex: 15,75'],
      ['• Para ações, use códigos da B3: PETR4, VALE3, ITUB4, etc.'],
      ['• Para FIIs, use códigos: HGLG11, BCFF11, XPML11, etc.'],
      [''],
      ['🎨 LEGENDA:'],
      ['🔵 AZUL = Células para você preencher'],
      ['⚪ CINZA = Células calculadas automaticamente'],
      ['⭐ VERDE = Totais e resumos'],
      [''],
      ['💡 DICA: Siga os exemplos já preenchidos!'],
    ];
    
    const wsInstrucoes = XLSX.utils.aoa_to_sheet(instrucoes);
    wsInstrucoes['!cols'] = [{ width: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstrucoes, '📋 INSTRUÇÕES');
    
    // ===========================================
    // 2. ABA AÇÕES - FÓRMULAS CORRIGIDAS
    // ===========================================
    const acoes = [
      ['FATOS DA BOLSA - AÇÕES BRASILEIRAS'],
      [''],
      ['🔵 AZUL = Preencher  |  ⚪ CINZA = Automático'],
      [''],
      ['🔵 CÓDIGO', '🔵 NOME/EMPRESA', '🔵 QUANTIDADE', '🔵 PREÇO MÉDIO (R$)', '⚪ COTAÇÃO ATUAL', '⚪ VALOR INVESTIDO', '⚪ VALOR ATUAL', '⚪ % CARTEIRA'],
      [''],
      ['PETR4', 'Petrobras PN', 100, 25.50, '', '', '', ''],
      ['VALE3', 'Vale ON', 50, 85.00, '', '', '', ''],
      ['ITUB4', 'Itaú Unibanco PN', '', '', '', '', '', ''],
      ['BBSE3', 'BB Seguridade ON', '', '', '', '', '', ''],
    ];

    // Adicionar mais 15 linhas vazias
    for (let i = 0; i < 15; i++) {
      acoes.push(['', '', '', '', '', '', '', '']);
    }

    acoes.push(['']); // Linha em branco
    acoes.push(['⭐ TOTAL AÇÕES:', '', '', '', '', '', '', '']);

    const wsAcoes = XLSX.utils.aoa_to_sheet(acoes);

    // FÓRMULAS CORRIGIDAS PARA AÇÕES (linha total = 26)
    for (let i = 7; i <= 25; i++) {
      // Cotação Atual: Se vazio, usa o preço médio
      wsAcoes[`E${i}`] = { f: `IF(D${i}="","",IF(E${i}="",D${i},E${i}))` };
      
      // Valor Investido = Quantidade × Preço Médio
      wsAcoes[`F${i}`] = { f: `IF(AND(C${i}<>"",D${i}<>""),C${i}*D${i},"")` };
      
      // Valor Atual = Quantidade × Cotação Atual
      wsAcoes[`G${i}`] = { f: `IF(AND(C${i}<>"",E${i}<>""),C${i}*E${i},"")` };
      
      // % Carteira = Valor Atual ÷ Total da Aba × 100 (SEM $)
      wsAcoes[`H${i}`] = { f: `IF(G${i}="","",IF(G26=0,0,G${i}/G26*100))` };
    }

    // Fórmulas de TOTAL (linha 26)
    wsAcoes['F26'] = { f: 'SUM(F7:F25)' }; // Total Valor Investido
    wsAcoes['G26'] = { f: 'SUM(G7:G25)' }; // Total Valor Atual
    wsAcoes['H26'] = { f: 'SUM(H7:H25)' }; // Total % (deve dar 100%)

    wsAcoes['!cols'] = [
      { width: 12 }, { width: 30 }, { width: 12 }, { width: 18 }, 
      { width: 18 }, { width: 20 }, { width: 18 }, { width: 15 }
    ];
    wsAcoes['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    XLSX.utils.book_append_sheet(wb, wsAcoes, '🏢 AÇÕES');

    // ===========================================
    // 3. ABA FIIs - FÓRMULAS CORRIGIDAS
    // ===========================================
    const fiis = [
      ['FATOS DA BOLSA - FUNDOS IMOBILIÁRIOS (FIIs)'],
      [''],
      ['🔵 AZUL = Preencher  |  ⚪ CINZA = Automático'],
      [''],
      ['🔵 CÓDIGO', '🔵 NOME/DESCRIÇÃO', '🔵 QUANTIDADE', '🔵 PREÇO MÉDIO (R$)', '⚪ COTAÇÃO ATUAL', '⚪ VALOR INVESTIDO', '⚪ VALOR ATUAL', '⚪ % CARTEIRA'],
      [''],
      ['HGLG11', 'Cshg Logística FII', 10, 150.00, '', '', '', ''],
      ['BCFF11', 'Btg Pactual Fof FII', 20, 85.50, '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ];

    for (let i = 0; i < 17; i++) {
      fiis.push(['', '', '', '', '', '', '', '']);
    }

    fiis.push(['']);
    fiis.push(['⭐ TOTAL FIIs:', '', '', '', '', '', '', '']);

    const wsFiis = XLSX.utils.aoa_to_sheet(fiis);

    // FÓRMULAS CORRIGIDAS PARA FIIs (linha total = 26)
    for (let i = 7; i <= 25; i++) {
      // Cotação Atual: Se vazio, usa o preço médio
      wsFiis[`E${i}`] = { f: `IF(D${i}="","",IF(E${i}="",D${i},E${i}))` };
      
      // Valor Investido = Quantidade × Preço Médio
      wsFiis[`F${i}`] = { f: `IF(AND(C${i}<>"",D${i}<>""),C${i}*D${i},"")` };
      
      // Valor Atual = Quantidade × Cotação Atual
      wsFiis[`G${i}`] = { f: `IF(AND(C${i}<>"",E${i}<>""),C${i}*E${i},"")` };
      
      // % Carteira = Valor Atual ÷ Total da Aba × 100 (SEM $)
      wsFiis[`H${i}`] = { f: `IF(G${i}="","",IF(G26=0,0,G${i}/G26*100))` };
    }

    // Totais FIIs
    wsFiis['F26'] = { f: 'SUM(F7:F25)' };
    wsFiis['G26'] = { f: 'SUM(G7:G25)' };
    wsFiis['H26'] = { f: 'SUM(H7:H25)' };

    wsFiis['!cols'] = [
      { width: 12 }, { width: 30 }, { width: 12 }, { width: 18 }, 
      { width: 18 }, { width: 20 }, { width: 18 }, { width: 15 }
    ];
    wsFiis['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    XLSX.utils.book_append_sheet(wb, wsFiis, '🏘️ FIIs');

    // ===========================================
    // 4. ABA RENDA FIXA - FÓRMULAS CORRIGIDAS
    // ===========================================
    const rendaFixa = [
      ['FATOS DA BOLSA - RENDA FIXA'],
      [''],
      ['🔵 AZUL = Preencher  |  ⚪ CINZA = Automático'],
      [''],
      ['🔵 PRODUTO', '🔵 BANCO/CORRETORA', '🔵 VALOR INVESTIDO (R$)', '⚪ VALOR ATUAL (R$)', '🔵 VENCIMENTO', '⚪ % DA CARTEIRA'],
      [''],
      ['CDB 120% CDI', 'Banco Inter', 10000, '', '31/12/2025', ''],
      ['LCI 95% CDI', 'Nubank', 5000, '', '15/06/2026', ''],
      ['Tesouro IPCA+', 'Tesouro Direto', 15000, '', '15/05/2035', ''],
      ['', '', '', '', '', ''],
    ];

    for (let i = 0; i < 12; i++) {
      rendaFixa.push(['', '', '', '', '', '']);
    }

    rendaFixa.push(['']);
    rendaFixa.push(['⭐ TOTAL RENDA FIXA:', '', '', '', '', '']);

    const wsRendaFixa = XLSX.utils.aoa_to_sheet(rendaFixa);

    // FÓRMULAS CORRIGIDAS PARA RENDA FIXA (linha total = 20)
    for (let i = 7; i <= 19; i++) {
      // Valor Atual: Se vazio, usa valor investido
      wsRendaFixa[`D${i}`] = { f: `IF(C${i}="","",IF(D${i}="",C${i},D${i}))` };
      
      // % Carteira = Valor Atual ÷ Total da Aba × 100 (linha total = 20)
      wsRendaFixa[`F${i}`] = { f: `IF(D${i}="","",IF(D20=0,0,D${i}/D20*100))` };
    }

    // Totais Renda Fixa (linha 20)
    wsRendaFixa['C20'] = { f: 'SUM(C7:C19)' }; // Total Investido
    wsRendaFixa['D20'] = { f: 'SUM(D7:D19)' }; // Total Atual
    wsRendaFixa['F20'] = { f: 'SUM(F7:F19)' }; // Total %

    wsRendaFixa['!cols'] = [
      { width: 25 }, { width: 20 }, { width: 20 }, { width: 18 }, { width: 15 }, { width: 15 }
    ];
    wsRendaFixa['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    XLSX.utils.book_append_sheet(wb, wsRendaFixa, '💰 RENDA FIXA');

    // ===========================================
    // 5. ABA EXTERIOR - FÓRMULAS CORRIGIDAS
    // ===========================================
    const exterior = [
      ['FATOS DA BOLSA - INVESTIMENTOS NO EXTERIOR'],
      [''],
      ['🔵 AZUL = Preencher  |  ⚪ CINZA = Automático'],
      [''],
      ['🔵 CÓDIGO', '🔵 NOME/DESCRIÇÃO', '🔵 QUANTIDADE', '🔵 PREÇO MÉDIO (USD)', '⚪ COTAÇÃO (USD)', '⚪ VALOR INVEST. (R$)', '⚪ VALOR ATUAL (R$)', '⚪ % CARTEIRA'],
      [''],
      ['AAPL', 'Apple Inc', 5, 150.00, '', '', '', ''],
      ['VTI', 'Vanguard Total Stock', 3, 220.00, '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
    ];

    for (let i = 0; i < 12; i++) {
      exterior.push(['', '', '', '', '', '', '', '']);
    }

    exterior.push(['']);
    exterior.push(['⭐ TOTAL EXTERIOR:', '', '', '', '', '', '', '']);

    const wsExterior = XLSX.utils.aoa_to_sheet(exterior);

    // FÓRMULAS CORRIGIDAS PARA EXTERIOR (linha total = 19, USD para BRL = 5.5)
    for (let i = 7; i <= 18; i++) {
      // Cotação USD: Se vazio, usa preço médio
      wsExterior[`E${i}`] = { f: `IF(D${i}="","",IF(E${i}="",D${i},E${i}))` };
      
      // Valor Investido em R$ = Quantidade × Preço Médio USD × Taxa
      wsExterior[`F${i}`] = { f: `IF(AND(C${i}<>"",D${i}<>""),C${i}*D${i}*5.5,"")` };
      
      // Valor Atual em R$ = Quantidade × Cotação USD × Taxa
      wsExterior[`G${i}`] = { f: `IF(AND(C${i}<>"",E${i}<>""),C${i}*E${i}*5.5,"")` };
      
      // % Carteira = Valor Atual ÷ Total da Aba × 100 (linha total = 19)
      wsExterior[`H${i}`] = { f: `IF(G${i}="","",IF(G19=0,0,G${i}/G19*100))` };
    }

    // Totais Exterior (linha 19)
    wsExterior['F19'] = { f: 'SUM(F7:F18)' };
    wsExterior['G19'] = { f: 'SUM(G7:G18)' };
    wsExterior['H19'] = { f: 'SUM(H7:H18)' };

    wsExterior['!cols'] = [
      { width: 12 }, { width: 25 }, { width: 12 }, { width: 18 }, 
      { width: 18 }, { width: 20 }, { width: 18 }, { width: 15 }
    ];
    wsExterior['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

    XLSX.utils.book_append_sheet(wb, wsExterior, '🌎 EXTERIOR');

    // ===========================================
    // 6. ABA CRIPTO - FÓRMULAS CORRIGIDAS
    // ===========================================
    const cripto = [
      ['FATOS DA BOLSA - CRIPTOMOEDAS'],
      [''],
      ['🔵 AZUL = Preencher  |  ⚪ CINZA = Automático'],
      [''],
      ['🔵 CRIPTOMOEDA', '🔵 QUANTIDADE', '🔵 PREÇO MÉDIO (R$)', '⚪ VALOR ATUAL (R$)', '🔵 EXCHANGE', '⚪ % DA CARTEIRA'],
      [''],
      ['Bitcoin (BTC)', 0.5, 150000, '', 'Binance', ''],
      ['Ethereum (ETH)', 2, 8000, '', 'Binance', ''],
      ['', '', '', '', '', ''],
    ];

    for (let i = 0; i < 8; i++) {
      cripto.push(['', '', '', '', '', '']);
    }

    cripto.push(['']);
    cripto.push(['⭐ TOTAL CRIPTO:', '', '', '', '', '']);

    const wsCripto = XLSX.utils.aoa_to_sheet(cripto);

    // FÓRMULAS CORRIGIDAS PARA CRIPTO (linha total = 16)
    for (let i = 7; i <= 15; i++) {
      // Valor Atual = Quantidade × Preço Médio (se não tiver cotação atual)
      wsCripto[`D${i}`] = { f: `IF(AND(B${i}<>"",C${i}<>""),B${i}*C${i},"")` };
      
      // % Carteira = Valor Atual ÷ Total da Aba × 100 (linha total = 16)
      wsCripto[`F${i}`] = { f: `IF(D${i}="","",IF(D16=0,0,D${i}/D16*100))` };
    }

    // Totais Cripto (linha 16)
    wsCripto['C16'] = { f: 'SUM(C7:C15)' }; // Total Preço Médio
    wsCripto['D16'] = { f: 'SUM(D7:D15)' }; // Total Valor Atual
    wsCripto['F16'] = { f: 'SUM(F7:F15)' }; // Total %

    wsCripto['!cols'] = [
      { width: 20 }, { width: 15 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 15 }
    ];
    wsCripto['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

    XLSX.utils.book_append_sheet(wb, wsCripto, '₿ CRIPTO');

    // ===========================================
    // 7. ABA RESERVA - COM FÓRMULAS
    // ===========================================
    const reserva = [
      ['FATOS DA BOLSA - RESERVA DE EMERGÊNCIA'],
      [''],
      ['🔵 AZUL = Preencher'],
      [''],
      ['🔵 ONDE ESTÁ', '🔵 BANCO/INSTITUIÇÃO', '🔵 VALOR (R$)', '🔵 OBSERVAÇÕES'],
      [''],
      ['Conta Corrente', 'Banco do Brasil', 5000, 'Uso diário'],
      ['Poupança', 'Caixa Econômica', 10000, 'Emergência'],
      ['CDB Liquidez Diária', 'Inter', 15000, 'Reserva rápida'],
      ['', '', '', ''],
    ];

    for (let i = 0; i < 6; i++) {
      reserva.push(['', '', '', '']);
    }

    reserva.push(['']);
    reserva.push(['⭐ TOTAL RESERVA:', '', '', '']);

    const wsReserva = XLSX.utils.aoa_to_sheet(reserva);

    // FÓRMULA para Total Reserva
    wsReserva['C16'] = { f: 'SUM(C7:C15)' };

    wsReserva['!cols'] = [
      { width: 25 }, { width: 25 }, { width: 18 }, { width: 35 }
    ];
    wsReserva['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    XLSX.utils.book_append_sheet(wb, wsReserva, '🏦 RESERVA');

    // ===========================================
    // 8. ABA RESUMO MANUAL (SEM LINKS EXTERNOS)
    // ===========================================
    const resumoSimples = [
      ['FATOS DA BOLSA - RESUMO DA CARTEIRA'],
      [''],
      ['📋 INSTRUÇÕES:'],
      ['1. Complete todas as abas de investimentos'],
      ['2. Anote os totais de cada aba aqui:'],
      [''],
      ['CLASSE DE ATIVO', 'VALOR TOTAL (R$)', '% DA CARTEIRA'],
      [''],
      ['🏢 Ações Brasileiras', 0, ''],
      ['🏘️ Fundos Imobiliários', 0, ''],
      ['💰 Renda Fixa', 0, ''],
      ['🌎 Exterior', 0, ''],
      ['₿ Criptomoedas', 0, ''],
      ['🏦 Reserva Emergência', 0, ''],
      [''],
      ['💎 PATRIMÔNIO TOTAL', '', '100%'],
      [''],
      ['💡 DICA: Digite os valores na coluna B'],
      ['Os percentuais serão calculados automaticamente!'],
    ];

    const wsResumoSimples = XLSX.utils.aoa_to_sheet(resumoSimples);

    // Fórmulas simples sem referências externas
    wsResumoSimples['B16'] = { f: 'SUM(B9:B14)' }; // Total
    wsResumoSimples['C9'] = { f: 'IF($B$16=0,"0%",ROUND(B9/$B$16*100,1)&"%")' };
    wsResumoSimples['C10'] = { f: 'IF($B$16=0,"0%",ROUND(B10/$B$16*100,1)&"%")' };
    wsResumoSimples['C11'] = { f: 'IF($B$16=0,"0%",ROUND(B11/$B$16*100,1)&"%")' };
    wsResumoSimples['C12'] = { f: 'IF($B$16=0,"0%",ROUND(B12/$B$16*100,1)&"%")' };
    wsResumoSimples['C13'] = { f: 'IF($B$16=0,"0%",ROUND(B13/$B$16*100,1)&"%")' };
    wsResumoSimples['C14'] = { f: 'IF($B$16=0,"0%",ROUND(B14/$B$16*100,1)&"%")' };

    wsResumoSimples['!cols'] = [
      { width: 30 }, { width: 20 }, { width: 18 }
    ];
    wsResumoSimples['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
    ];

    XLSX.utils.book_append_sheet(wb, wsResumoSimples, '📊 RESUMO MANUAL');

    // ===========================================
    // CONFIGURAÇÕES FINAIS
    // ===========================================
    wb.Props = {
      Title: "Análise Profissional de Carteira - Fatos da Bolsa",
      Subject: "Modelo com emojis visuais e fórmulas automáticas funcionais",
      Author: "Fatos da Bolsa - Equipe de Análise",
      CreatedDate: new Date(),
      ModifiedDate: new Date()
    };

    // Download
    XLSX.writeFile(wb, 'Fatos-da-Bolsa-Modelo-SEM-LINKS-EXTERNOS-v6.xlsx');

    // Alerta explicativo
    alert(`📊 MODELO EXCEL GERADO COM SUCESSO!

🎨 VERSÃO SEM LINKS EXTERNOS:
• 🔵 Emojis visuais nos cabeçalhos
• ⚪ Fórmulas automáticas funcionais
• ⭐ Cálculos de totais e percentuais
• 📊 Resumo manual (sem alertas de atualização)

🚀 COMO USAR:
1. Preencha apenas células com 🔵 AZUL
2. As células ⚪ CINZA calculam sozinhas
3. No RESUMO MANUAL: digite os totais manualmente
4. Os percentuais se calcularão automaticamente

✅ SEM ALERTAS DE ATUALIZAÇÃO!`);
  };

  // Componente para exibir score com barra visual
  const ScoreDisplay = ({ label, score, color, maxScore = 100 }) => (
    <div style={{
      backgroundColor: '#ffffff',
      padding: isMobile ? '16px' : '20px',
      borderRadius: isMobile ? '8px' : '12px',
      border: '1px solid #e2e8f0',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: isMobile ? '10px' : '12px', 
        color: '#64748b', 
        marginBottom: '6px', 
        textTransform: 'uppercase', 
        fontWeight: '600' 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: isMobile ? '24px' : '32px', 
        fontWeight: '800', 
        color: color, 
        marginBottom: '6px' 
      }}>
        {score}%
      </div>
      <div style={{
        width: '100%',
        height: isMobile ? '6px' : '8px',
        backgroundColor: '#f1f5f9',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(score / maxScore) * 100}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );

  // Componente para análise individual de ativos
  const AtivoAnaliseCard = ({ ativo }) => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: isMobile ? '8px' : '12px',
      padding: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '12px' : '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'start', 
        marginBottom: '12px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h4 style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: '700', 
            margin: 0, 
            color: '#1e293b' 
          }}>
            {ativo.codigo}
          </h4>
          <span style={{
            padding: isMobile ? '3px 8px' : '4px 12px',
            borderRadius: '16px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: '600',
            backgroundColor: 
              ativo.status === 'excelente' ? '#dcfce7' :
              ativo.status === 'bom' ? '#dbeafe' :
              ativo.status === 'regular' ? '#fef3c7' :
              ativo.status === 'alerta' ? '#fed7aa' : '#fecaca',
            color:
              ativo.status === 'excelente' ? '#166534' :
              ativo.status === 'bom' ? '#1e40af' :
              ativo.status === 'regular' ? '#d97706' :
              ativo.status === 'alerta' ? '#ea580c' : '#dc2626'
          }}>
            {ativo.status.charAt(0).toUpperCase() + ativo.status.slice(1)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{
                color: i < Math.floor(ativo.nota / 2) ? '#fbbf24' : '#e5e7eb',
                fontSize: isMobile ? '12px' : '16px'
              }}>
                ⭐
              </span>
            ))}
          </div>
          <span style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '700', 
            color: '#3b82f6' 
          }}>
            {ativo.nota}/10
          </span>
        </div>
      </div>
      <p style={{ 
        fontSize: isMobile ? '13px' : '14px', 
        color: '#64748b', 
        margin: 0, 
        lineHeight: '1.6' 
      }}>
        {ativo.comentario}
      </p>
    </div>
  );

  // Componente para recomendações estruturadas
  const RecomendacaoCard = ({ recomendacao }) => (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: isMobile ? '8px' : '12px',
      padding: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '12px' : '16px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'start', 
        marginBottom: '12px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            padding: isMobile ? '3px 8px' : '4px 12px',
            borderRadius: '16px',
            fontSize: isMobile ? '10px' : '12px',
            fontWeight: '600',
            backgroundColor: 
              recomendacao.prioridade === 'alta' ? '#fecaca' :
              recomendacao.prioridade === 'média' ? '#fef3c7' : '#dbeafe',
            color:
              recomendacao.prioridade === 'alta' ? '#dc2626' :
              recomendacao.prioridade === 'média' ? '#d97706' : '#2563eb'
          }}>
            {recomendacao.prioridade?.charAt(0).toUpperCase() + recomendacao.prioridade?.slice(1)}
          </span>
          <span style={{ 
            fontSize: isMobile ? '10px' : '12px', 
            color: '#64748b', 
            fontWeight: '500' 
          }}>
            {recomendacao.categoria}
          </span>
        </div>
      </div>
      <h4 style={{ 
        fontSize: isMobile ? '14px' : '16px', 
        fontWeight: '700', 
        marginBottom: '8px', 
        color: '#1e293b' 
      }}>
        {recomendacao.titulo}
      </h4>
      <p style={{ 
        fontSize: isMobile ? '13px' : '14px', 
        color: '#64748b', 
        marginBottom: '12px', 
        lineHeight: '1.6' 
      }}>
        {recomendacao.descricao}
      </p>
      {recomendacao.impacto && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #3b82f6',
          borderRadius: '6px',
          padding: isMobile ? '10px' : '12px',
          marginTop: '12px'
        }}>
          <p style={{ 
            fontSize: isMobile ? '12px' : '14px', 
            color: '#1e40af', 
            margin: 0, 
            fontWeight: '500' 
          }}>
            <strong>💥 Impacto Esperado:</strong> {recomendacao.impacto}
          </p>
        </div>
      )}
    </div>
  );

  // Componente do botão PDF
  const BotaoDownloadPDF = ({ carteiraId, nomeArquivo }) => {
    const [baixando, setBaixando] = useState(false);

    const handleDownload = async () => {
      setBaixando(true);
      
      try {
        const response = await fetch(`/api/carteiras/${carteiraId}/download-pdf`);
        
        if (!response.ok) {
          throw new Error('Erro ao gerar PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Analise-Carteira-${nomeArquivo}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Erro no download:', error);
        alert('Erro ao baixar PDF. Tente novamente.');
      } finally {
        setBaixando(false);
      }
    };

    return (
      <button
        onClick={handleDownload}
        disabled={baixando}
        style={{
          backgroundColor: baixando ? '#9ca3af' : '#10b981',
          color: 'white',
          padding: isMobile ? '6px 12px' : '8px 16px',
          borderRadius: '6px',
          border: 'none',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: '600',
          cursor: baixando ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 0.2s'
        }}
      >
        {baixando ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            {isMobile ? 'PDF...' : 'Gerando PDF...'}
          </>
        ) : (
          <>
            📥 {isMobile ? 'PDF' : 'Baixar PDF'}
          </>
        )}
      </button>
    );
  };

  // Histórico de carteiras APRIMORADO
  const HistoricoCarteiras = () => {
    const [carteiras, setCarteiras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [carteiraExpandida, setCarteiraExpandida] = useState(null);

    useEffect(() => {
      const buscarCarteiras = async () => {
        try {
          const response = await fetch('/api/carteiras/minhas');
          const data = await response.json();
          
          if (response.ok) {
            setCarteiras(data.carteiras);
          }
        } catch (error) {
          console.error('Erro ao buscar carteiras:', error);
        } finally {
          setLoading(false);
        }
      };

      buscarCarteiras();
    }, []);

    const toggleExpansao = (carteiraId) => {
      setCarteiraExpandida(carteiraExpandida === carteiraId ? null : carteiraId);
    };

    if (loading) {
      return (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: isMobile ? '12px' : '16px',
          border: '1px solid #e2e8f0',
          padding: isMobile ? '24px' : '32px',
          textAlign: 'center',
          marginTop: isMobile ? '20px' : '32px'
        }}>
          <div style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: '12px' }}>⏳</div>
          <p style={{ color: '#64748b', fontSize: isMobile ? '14px' : '16px' }}>Carregando histórico...</p>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: isMobile ? '12px' : '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        padding: isMobile ? '20px' : '32px',
        marginTop: isMobile ? '20px' : '32px'
      }}>
        <h3 style={{ 
          fontSize: isMobile ? '18px' : '24px', 
          fontWeight: '700', 
          color: '#1e293b', 
          marginBottom: isMobile ? '16px' : '24px',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '8px' : '12px'
        }}>
          📊 Minhas Análises de Carteira
        </h3>
        
        {carteiras.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '32px 16px' : '48px',
            backgroundColor: '#f8fafc',
            borderRadius: isMobile ? '8px' : '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' }}>📈</div>
            <h4 style={{ 
              fontSize: isMobile ? '16px' : '18px', 
              fontWeight: '600', 
              color: '#64748b', 
              margin: '0 0 8px 0' 
            }}>
              Nenhuma carteira enviada ainda
            </h4>
            <p style={{ 
              color: '#64748b', 
              fontSize: isMobile ? '13px' : '14px', 
              margin: 0 
            }}>
              Envie sua primeira carteira para receber uma análise personalizada!
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: isMobile ? '16px' : '20px' }}>
            {carteiras.map((carteira) => (
              <div key={carteira.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: isMobile ? '8px' : '12px',
                backgroundColor: '#f8fafc',
                overflow: 'hidden'
              }}>
                {/* Header da carteira */}
                <div 
                  style={{
                    padding: isMobile ? '16px' : '24px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => toggleExpansao(carteira.id)}
                  onMouseEnter={(e) => !isMobile && (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => !isMobile && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start', 
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ flex: 1, minWidth: isMobile ? '200px' : 'auto' }}>
                      <h4 style={{ 
                        fontSize: isMobile ? '14px' : '18px', 
                        fontWeight: '600', 
                        color: '#1e293b', 
                        margin: '0 0 6px 0',
                        lineHeight: '1.3'
                      }}>
                        📎 {carteira.nomeArquivo}
                      </h4>
                      <p style={{ 
                        fontSize: isMobile ? '12px' : '14px', 
                        color: '#64748b', 
                        margin: '0'
                      }}>
                        Enviado em: {new Date(carteira.dataEnvio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: isMobile ? '6px' : '12px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        padding: isMobile ? '4px 8px' : '8px 16px',
                        borderRadius: '16px',
                        fontSize: isMobile ? '10px' : '12px',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(carteira.status),
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                          {getStatusIcon(carteira.status)}
                        </span>
                        {getStatusText(carteira.status)}                      
                      </div>
                      
                      {getStatusText(carteira.status) === 'Analisada' && (
                        <BotaoDownloadPDF 
                          carteiraId={carteira.id} 
                          nomeArquivo={carteira.nomeArquivo} 
                        />
                      )}
                      
                      <button style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: isMobile ? '14px' : '18px',
                        cursor: 'pointer',
                        transform: carteiraExpandida === carteira.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>
                        ⬇️
                      </button>
                    </div>
                  </div>

                  {/* Métricas básicas */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: isMobile ? '12px' : '16px',
                  }}>
                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: isMobile ? '8px' : '12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: '#64748b', 
                        marginBottom: '3px' 
                      }}>
                        VALOR TOTAL
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: '700', 
                        color: '#10b981' 
                      }}>
                        {carteira.valorTotal ? 
                          `R$ ${carteira.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : 'Processando...'
                        }
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: isMobile ? '8px' : '12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        color: '#64748b', 
                        marginBottom: '3px' 
                      }}>
                        ATIVOS
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? '12px' : '16px', 
                        fontWeight: '700', 
                        color: '#3b82f6' 
                      }}>
                        {carteira.quantidadeAtivos || 'Processando...'}
                      </div>
                    </div>

                    {carteira.pontuacao && (
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: isMobile ? '8px' : '12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ 
                          fontSize: isMobile ? '10px' : '12px', 
                          color: '#64748b', 
                          marginBottom: '3px' 
                        }}>
                          PONTUAÇÃO GERAL
                        </div>
                        <div style={{ 
                          fontSize: isMobile ? '12px' : '16px', 
                          fontWeight: '700', 
                          color: '#f59e0b' 
                        }}>
                          {carteira.pontuacao.toFixed(1)}/10
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {carteiraExpandida === carteira.id && (getStatusText(carteira.status) === 'Analisada') && (
                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    padding: isMobile ? '20px' : '32px'
                  }}>
                    {/* Scores detalhados */}
                    {carteira.dadosEstruturados?.avaliacoes && (
                      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                        <h4 style={{
                          fontSize: isMobile ? '16px' : '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          marginBottom: isMobile ? '16px' : '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📊 Avaliação Detalhada
                        </h4>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: isMobile ? '16px' : '20px',
                          marginBottom: isMobile ? '20px' : '24px'
                        }}>
                          <ScoreDisplay 
                            label="Qualidade dos Ativos" 
                            score={carteira.dadosEstruturados.avaliacoes.qualidade} 
                            color="#10b981"
                          />
                          <ScoreDisplay 
                            label="Diversificação" 
                            score={carteira.dadosEstruturados.avaliacoes.diversificacao} 
                            color="#3b82f6"
                          />
                          <ScoreDisplay 
                            label="Adaptação ao Perfil" 
                            score={carteira.dadosEstruturados.avaliacoes.adaptacao} 
                            color="#8b5cf6"
                          />
                        </div>
                      </div>
                    )}

                    {/* Feedback geral */}
                    {carteira.feedback && (
                      <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '2px solid #3b82f6',
                        borderRadius: isMobile ? '8px' : '12px',
                        padding: isMobile ? '16px' : '24px',
                        marginBottom: isMobile ? '24px' : '32px'
                      }}>
                        <h4 style={{
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '700',
                          color: '#1e40af',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          💬 Análise Geral da Carteira
                        </h4>
                        <p style={{
                          fontSize: isMobile ? '13px' : '14px',
                          color: '#1e40af',
                          margin: 0,
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {carteira.feedback}
                        </p>
                        
                        {carteira.analista && (
                          <p style={{
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#1e40af',
                            margin: '12px 0 0 0',
                            textAlign: 'right',
                            fontStyle: 'italic'
                          }}>
                            Analisado por {carteira.analista.name} em {' '}
                            {carteira.dataAnalise ? new Date(carteira.dataAnalise).toLocaleDateString('pt-BR') : ''}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Recomendações estruturadas */}
                    {carteira.dadosEstruturados?.recomendacoesDetalhadas?.length > 0 && (
                      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                        <h4 style={{
                          fontSize: isMobile ? '16px' : '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          marginBottom: isMobile ? '16px' : '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          💡 Recomendações Personalizadas
                        </h4>
                        
                        {carteira.dadosEstruturados.recomendacoesDetalhadas.map((rec, index) => (
                          <RecomendacaoCard key={index} recomendacao={rec} />
                        ))}
                      </div>
                    )}

                    {/* Análise de ativos individuais */}
                    {carteira.dadosEstruturados?.ativosAnalise?.length > 0 && (
                      <div style={{ marginBottom: isMobile ? '24px' : '32px' }}>
                        <h4 style={{
                          fontSize: isMobile ? '16px' : '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          marginBottom: isMobile ? '16px' : '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          🏢 Análise Individual de Ativos
                        </h4>
                        
                        {carteira.dadosEstruturados.ativosAnalise.map((ativo, index) => (
                          <AtivoAnaliseCard key={index} ativo={ativo} />
                        ))}
                      </div>
                    )}

                    {/* Distribuição da carteira (dados existentes) */}
                    {carteira.estatisticas?.distribuicaoTipo && (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #10b981',
                        borderRadius: isMobile ? '8px' : '12px',
                        padding: isMobile ? '16px' : '24px'
                      }}>
                        <h4 style={{
                          fontSize: isMobile ? '14px' : '16px',
                          fontWeight: '700',
                          color: '#065f46',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          📈 Distribuição da Carteira
                        </h4>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(100px, 1fr))' : 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: isMobile ? '8px' : '12px'
                        }}>
                          {carteira.estatisticas.distribuicaoTipo.map((dist, distIndex) => (
                            <div key={distIndex} style={{
                              backgroundColor: '#ffffff',
                              padding: isMobile ? '8px' : '12px',
                              borderRadius: '6px',
                              textAlign: 'center',
                              border: '1px solid #10b981'
                            }}>
                              <div style={{ 
                                fontSize: isMobile ? '9px' : '11px', 
                                color: '#065f46', 
                                marginBottom: '3px', 
                                fontWeight: '600' 
                              }}>
                                {dist.tipo}
                              </div>
                              <div style={{ 
                                fontSize: isMobile ? '13px' : '16px', 
                                fontWeight: '700', 
                                color: '#059669' 
                              }}>
                                {dist.percentual.toFixed(1)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (carregandoVerificacao) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{ fontSize: isMobile ? '32px' : '48px' }}>⏳</div>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '14px' : '16px', 
          textAlign: 'center' 
        }}>
          Carregando suas análises...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5', 
      padding: isMobile ? '12px' : '24px'
    }}>
      {/* Header modificado */}
      <div style={{ marginBottom: isMobile ? '20px' : '32px' }}>
        <h1 style={{ 
          fontSize: isMobile ? '24px' : '48px', 
          fontWeight: '800', 
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: '1.2'
        }}>
          {jaEnviouCarteira ? 'Minhas Análises de Carteira' : 'Análise de Carteira Personalizada'}
        </h1>
        <p style={{ 
          color: '#64748b', 
          fontSize: isMobile ? '14px' : '18px',
          margin: '0',
          lineHeight: '1.5'
        }}>
          {jaEnviouCarteira 
            ? 'Acompanhe o status e resultados da sua análise de carteira'
            : 'Responda algumas perguntas e envie sua carteira para receber uma análise completa'
          }
        </p>
      </div>

      {!jaEnviouCarteira && (
        <>
          {/* Progress Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: isMobile ? '8px' : '12px',
            padding: isMobile ? '16px' : '20px',
            marginBottom: isMobile ? '20px' : '32px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: isMobile ? '8px' : '16px',
              flexWrap: 'wrap'
            }}>
              {[
                { numero: 1, titulo: 'Questionário', ativo: etapaAtual === 1 },
                { numero: 2, titulo: 'Upload da Carteira', ativo: etapaAtual === 2 },
                { numero: 3, titulo: 'Enviado', ativo: etapaAtual === 3 }
              ].map((etapa, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
                  <div style={{
                    width: isMobile ? '24px' : '32px',
                    height: isMobile ? '24px' : '32px',
                    borderRadius: '50%',
                    backgroundColor: etapa.ativo ? '#3b82f6' : (etapaAtual > etapa.numero ? '#10b981' : '#e2e8f0'),
                    color: etapa.ativo || etapaAtual > etapa.numero ? 'white' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: isMobile ? '11px' : '14px'
                  }}>
                    {etapaAtual > etapa.numero ? '✓' : etapa.numero}
                  </div>
                  <span style={{
                    fontWeight: '600',
                    color: etapa.ativo ? '#3b82f6' : (etapaAtual > etapa.numero ? '#10b981' : '#64748b'),
                    fontSize: isMobile ? '12px' : '16px'
                  }}>
                    {isMobile && etapa.titulo === 'Upload da Carteira' ? 'Upload' : etapa.titulo}
                  </span>
                  {index < 2 && (
                    <div style={{
                      width: isMobile ? '20px' : '40px',
                      height: '2px',
                      backgroundColor: etapaAtual > etapa.numero ? '#10b981' : '#e2e8f0'
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Etapa 1: Questionário */}
          {etapaAtual === 1 && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '12px' : '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: isMobile ? '20px' : '32px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
                <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' }}>📋</div>
                <h2 style={{
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Questionário de Perfil
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0'
                }}>
                  Essas informações nos ajudam a fazer uma análise mais precisa e personalizada
                </p>
              </div>

              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {perguntas.map((pergunta, index) => (
                  <div key={pergunta.id} style={{
                    marginBottom: isMobile ? '24px' : '32px',
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: '#f8fafc',
                    borderRadius: isMobile ? '8px' : '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <label style={{
                      display: 'block',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {index + 1}. {pergunta.pergunta}
                    </label>
                    
                    {pergunta.tipo === 'select' ? (
                      <select
                        value={respostas[pergunta.id]}
                        onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: isMobile ? '10px' : '12px',
                          fontSize: isMobile ? '13px' : '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        <option value="">Selecione uma opção...</option>
                        {pergunta.opcoes.map((opcao, i) => (
                          <option key={i} value={opcao}>{opcao}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        value={respostas[pergunta.id]}
                        onChange={(e) => handleRespostaChange(pergunta.id, e.target.value)}
                        placeholder="Digite sua resposta..."
                        style={{
                          width: '100%',
                          minHeight: isMobile ? '60px' : '80px',
                          padding: isMobile ? '10px' : '12px',
                          fontSize: isMobile ? '13px' : '14px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    )}
                  </div>
                ))}

                <div style={{ textAlign: 'center', marginTop: isMobile ? '24px' : '32px' }}>
                  <button
                    onClick={() => setEtapaAtual(2)}
                    disabled={!todasPerguntasRespondidas()}
                    style={{
                      backgroundColor: todasPerguntasRespondidas() ? '#3b82f6' : '#9ca3af',
                      color: 'white',
                      padding: isMobile ? '12px 24px' : '16px 32px',
                      borderRadius: isMobile ? '8px' : '12px',
                      border: 'none',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '700',
                      cursor: todasPerguntasRespondidas() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      margin: '0 auto',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isMobile ? 'Próximo: Upload' : 'Próximo: Upload da Carteira'}
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 2: Upload */}
          {etapaAtual === 2 && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '12px' : '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: isMobile ? '20px' : '32px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '32px' }}>
                <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' }}>📊</div>
                <h2 style={{
                  fontSize: isMobile ? '20px' : '28px',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Envie sua Carteira de Investimentos
                </h2>
                <p style={{
                  color: '#64748b',
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '0'
                }}>
                  Use nosso modelo Excel para organizar seus investimentos
                </p>
              </div>

              {/* Botão para baixar modelo */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #3b82f6',
                borderRadius: isMobile ? '8px' : '12px',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '20px' : '32px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: '#1e40af',
                  margin: '0 0 8px 0'
                }}>
                  📥 Baixe o Modelo Oficial
                </h3>
                <p style={{
                  color: '#1e40af',
                  fontSize: isMobile ? '13px' : '14px',
                  marginBottom: '12px',
                  lineHeight: '1.4'
                }}>
                  Modelo com as abas: Ações, FIIs, Exterior, Renda Fixa, Criptomoeda e Reserva de Emergência
                </p>
                <button
                  onClick={gerarModeloProfissional}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: isMobile ? '10px 20px' : '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '0 auto'
                  }}
                >
                  📥 Baixar Modelo Excel
                </button>
              </div>

              {/* Upload Area */}
              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: isMobile ? '8px' : '12px',
                padding: isMobile ? '24px 16px' : '48px',
                textAlign: 'center',
                backgroundColor: uploadedFile ? '#f0fdf4' : '#fafafa',
                borderColor: uploadedFile ? '#10b981' : '#d1d5db',
                marginBottom: isMobile ? '20px' : '24px'
              }}>
                {uploadedFile ? (
                  <div>
                    <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' }}>✅</div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      fontSize: isMobile ? '14px' : '18px', 
                      marginBottom: '6px',
                      lineHeight: '1.3'
                    }}>
                      {uploadedFile.name}
                    </div>
                    <div style={{ 
                      color: '#64748b', 
                      fontSize: isMobile ? '12px' : '14px', 
                      marginBottom: '12px' 
                    }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      style={{
                        color: '#ef4444',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        textDecoration: 'underline'
                      }}
                    >
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '12px' }}>📎</div>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#1e293b', 
                      fontSize: isMobile ? '14px' : '18px', 
                      marginBottom: '8px' 
                    }}>
                      {isMobile ? 'Toque para escolher arquivo' : 'Arraste seu arquivo Excel aqui'}
                    </div>
                    {!isMobile && (
                      <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>ou</div>
                    )}
                    <label style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: isMobile ? '10px 20px' : '12px 24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: '600',
                      border: 'none',
                      display: 'inline-block'
                    }}>
                      Escolher arquivo
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept=".xlsx,.xls"
                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                      />
                    </label>
                    <div style={{ 
                      fontSize: isMobile ? '11px' : '12px', 
                      color: '#64748b', 
                      marginTop: '8px' 
                    }}>
                      Formatos aceitos: .xlsx, .xls (máximo 10MB)
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de navegação */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: isMobile ? '20px' : '32px',
                gap: '12px',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}>
                <button
                  onClick={() => setEtapaAtual(1)}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: isMobile ? '10px 16px' : '12px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    order: isMobile ? 2 : 1
                  }}
                >
                  ← {isMobile ? 'Voltar' : 'Voltar ao Questionário'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!uploadedFile || isSubmitting}
                  style={{
                    backgroundColor: uploadedFile && !isSubmitting ? '#10b981' : '#9ca3af',
                    color: 'white',
                    padding: isMobile ? '12px 20px' : '16px 32px',
                    borderRadius: isMobile ? '8px' : '12px',
                    border: 'none',
                    fontSize: isMobile ? '14px' : '16px',
                    fontWeight: '700',
                    cursor: uploadedFile && !isSubmitting ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    order: isMobile ? 1 : 2,
                    flex: isMobile ? '1' : 'auto'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                      {isMobile ? 'Enviando...' : 'Enviando Análise...'}
                    </>
                  ) : (
                    <>
                      🚀 {isMobile ? 'Enviar' : 'Enviar para Análise'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Etapa 3: Enviado */}
          {etapaAtual === 3 && (
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '12px' : '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: isMobile ? '32px 20px' : '48px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: isMobile ? '48px' : '64px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: '800',
                color: '#10b981',
                margin: '0 0 12px 0'
              }}>
                Análise Enviada com Sucesso!
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: isMobile ? '14px' : '18px',
                margin: '0 0 24px 0',
                lineHeight: '1.6'
              }}>
                Recebemos seu questionário e carteira. Nossa equipe de especialistas irá analisar tudo com cuidado e enviar um feedback detalhado em até 48 horas.
              </p>
              
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #10b981',
                borderRadius: isMobile ? '8px' : '12px',
                padding: isMobile ? '16px' : '24px',
                marginBottom: isMobile ? '24px' : '32px',
                maxWidth: '500px',
                margin: '0 auto 24px auto'
              }}>
                <h3 style={{
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: '#065f46',
                  margin: '0 0 8px 0'
                }}>
                  📧 Próximos Passos:
                </h3>
                <ul style={{
                  color: '#059669',
                  fontSize: isMobile ? '12px' : '14px',
                  margin: '0',
                  padding: '0 0 0 16px',
                  textAlign: 'left'
                }}>
                  <li>Análise detalhada da sua carteira</li>
                  <li>Recomendações personalizadas</li>
                  <li>Sugestões de otimização</li>
                  <li>Feedback sobre seu perfil de risco</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setEtapaAtual(1);
                  setRespostas({
                    tempoInvestimento: '', motivoMercado: '', objetivoCarteira: '',
                    toleranciaOscilacao: '', comportamentoQueda: '', reservaEmergencia: '',
                    reservaOportunidade: '', rendaMensal: '', valorAporte: '', nivelConhecimento: ''
                  });
                  setUploadedFile(null);
                }}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: isMobile ? '10px 20px' : '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Nova Análise
              </button>
            </div>
          )}
        </>
      )}

      {/* Histórico sempre visível */}
      <HistoricoCarteiras />
    </div>
  );
}

export default AnaliseCarteiraClientePage;