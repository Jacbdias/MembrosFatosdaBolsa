// src/app/api/carteiras/[id]/download-pdf/route.js
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // Verificar autenticação
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados da carteira REAIS do Prisma
    const carteira = await buscarCarteiraPorId(id, session.user.id);
    
    if (!carteira) {
      return NextResponse.json({ error: 'Carteira não encontrada' }, { status: 404 });
    }

    // Verificar se a carteira pertence ao usuário
    if (carteira.userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Gerar PDF
    const pdfBuffer = await gerarPDF(carteira);

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Analise-Carteira-${carteira.nomeArquivo}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function gerarPDF(carteira) {
  let browser;
  
  try {
    // Configurar Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Configurar viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Gerar HTML do relatório
    const htmlContent = gerarHTMLRelatorio(carteira);

    // Carregar HTML
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Gerar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return pdfBuffer;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function gerarHTMLRelatorio(carteira) {
  const logoPath = path.join(process.cwd(), 'public/assets/avatar.png');
  const logoBase64 = fs.existsSync(logoPath) 
    ? `data:image/png;base64,${fs.readFileSync(logoPath, 'base64')}`
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Análise de Carteira - ${carteira.nomeArquivo}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 0;
            border-bottom: 3px solid #3b82f6;
            margin-bottom: 30px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            border-radius: 8px;
        }
        
        .company-info h1 {
            font-size: 24px;
            color: #1e293b;
            font-weight: 700;
        }
        
        .company-info p {
            color: #64748b;
            font-size: 14px;
        }
        
        .report-info {
            text-align: right;
        }
        
        .report-info h2 {
            font-size: 18px;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        
        .report-info p {
            color: #64748b;
            font-size: 12px;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .resumo-executivo {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 5px solid #3b82f6;
        }
        
        .metricas-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .metrica-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metrica-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .metrica-valor {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 10px;
        }
        
        .metrica-valor.verde { color: #10b981; }
        .metrica-valor.azul { color: #3b82f6; }
        .metrica-valor.roxo { color: #8b5cf6; }
        .metrica-valor.amarelo { color: #f59e0b; }
        
        .score-bar {
            width: 100%;
            height: 8px;
            background: #f1f5f9;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .score-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .score-fill.verde { background: #10b981; }
        .score-fill.azul { background: #3b82f6; }
        .score-fill.roxo { background: #8b5cf6; }
        
        .feedback-geral {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .feedback-titulo {
            font-size: 16px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .feedback-texto {
            color: #1e40af;
            line-height: 1.8;
            white-space: pre-wrap;
        }
        
        .recomendacao-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .recomendacao-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
        }
        
        .prioridade-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .prioridade-alta {
            background: #fecaca;
            color: #dc2626;
        }
        
        .prioridade-media {
            background: #fef3c7;
            color: #d97706;
        }
        
        .prioridade-baixa {
            background: #dbeafe;
            color: #2563eb;
        }
        
        .recomendacao-titulo {
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
        }
        
        .ativo-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .ativo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        
        .ativo-codigo {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
        }
        
        .ativo-nota {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .estrelas {
            color: #fbbf24;
        }
        
        .nota-valor {
            font-size: 16px;
            font-weight: 700;
            color: #3b82f6;
        }
        
        .distribuicao-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .distribuicao-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #10b981;
        }
        
        .distribuicao-tipo {
            font-size: 11px;
            color: #065f46;
            font-weight: 600;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .distribuicao-valor {
            font-size: 16px;
            font-weight: 700;
            color: #059669;
        }
        
        .rodape {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            page-break-inside: avoid;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <!-- CABEÇALHO -->
    <div class="header">
        <div class="logo-section">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" class="logo">` : ''}
            <div class="company-info">
                <h1>Fatos da Bolsa</h1>
                <p>Análise Profissional de Carteiras</p>
            </div>
        </div>
        <div class="report-info">
            <h2>Relatório de Análise</h2>
            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
            <p>Arquivo: ${carteira.nomeArquivo}</p>
        </div>
    </div>

    <!-- RESUMO EXECUTIVO -->
    <div class="section">
        <h2 class="section-title">📊 Resumo Executivo</h2>
        <div class="resumo-executivo">
            <div class="metricas-grid">
                <div class="metrica-card">
                    <div class="metrica-label">Valor Total</div>
                    <div class="metrica-valor verde">
                        ${carteira.valorTotal ? `R$ ${carteira.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </div>
                </div>
                <div class="metrica-card">
                    <div class="metrica-label">Quantidade de Ativos</div>
                    <div class="metrica-valor azul">${carteira.quantidadeAtivos || carteira.ativos?.length || 'N/A'}</div>
                </div>
                <div class="metrica-card">
                    <div class="metrica-label">Data de Envio</div>
                    <div class="metrica-valor roxo">${new Date(carteira.dataEnvio).toLocaleDateString('pt-BR')}</div>
                </div>
                ${carteira.pontuacao ? `
                <div class="metrica-card">
                    <div class="metrica-label">Pontuação Geral</div>
                    <div class="metrica-valor amarelo">${carteira.pontuacao.toFixed(1)}/10</div>
                </div>
                ` : ''}
            </div>
            
            <!-- Informações do Cliente -->
            ${carteira.cliente ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">CLIENTE</div>
                <div style="font-weight: 600; color: #1e293b;">${carteira.cliente.name}</div>
                <div style="font-size: 12px; color: #64748b;">${carteira.cliente.email}</div>
            </div>
            ` : ''}
        </div>
    </div>

    <!-- AVALIAÇÃO DETALHADA -->
    ${carteira.dadosEstruturados?.avaliacoes ? `
    <div class="section">
        <h2 class="section-title">📈 Avaliação Detalhada</h2>
        <div class="metricas-grid">
            <div class="metrica-card">
                <div class="metrica-label">Qualidade dos Ativos</div>
                <div class="metrica-valor verde">${carteira.dadosEstruturados.avaliacoes.qualidade}%</div>
                <div class="score-bar">
                    <div class="score-fill verde" style="width: ${carteira.dadosEstruturados.avaliacoes.qualidade}%"></div>
                </div>
            </div>
            <div class="metrica-card">
                <div class="metrica-label">Diversificação</div>
                <div class="metrica-valor azul">${carteira.dadosEstruturados.avaliacoes.diversificacao}%</div>
                <div class="score-bar">
                    <div class="score-fill azul" style="width: ${carteira.dadosEstruturados.avaliacoes.diversificacao}%"></div>
                </div>
            </div>
            <div class="metrica-card">
                <div class="metrica-label">Adaptação ao Perfil</div>
                <div class="metrica-valor roxo">${carteira.dadosEstruturados.avaliacoes.adaptacao}%</div>
                <div class="score-bar">
                    <div class="score-fill roxo" style="width: ${carteira.dadosEstruturados.avaliacoes.adaptacao}%"></div>
                </div>
            </div>
        </div>
    </div>
    ` : ''}

    <!-- ANÁLISE GERAL -->
    ${carteira.feedback ? `
    <div class="section">
        <h2 class="section-title">💬 Análise Geral da Carteira</h2>
        <div class="feedback-geral">
            <div class="feedback-titulo">
                💼 Parecer do Analista
            </div>
            <div class="feedback-texto">${carteira.feedback}</div>
            ${carteira.analista ? `
            <div style="margin-top: 20px; text-align: right; font-style: italic; font-size: 14px;">
                Analisado por ${carteira.analista.name} em ${carteira.dataAnalise ? new Date(carteira.dataAnalise).toLocaleDateString('pt-BR') : ''}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}

    <!-- RECOMENDAÇÕES -->
    ${carteira.dadosEstruturados?.recomendacoesDetalhadas?.length > 0 ? `
    <div class="section page-break">
        <h2 class="section-title">💡 Recomendações Personalizadas</h2>
        ${carteira.dadosEstruturados.recomendacoesDetalhadas.map(rec => `
            <div class="recomendacao-card">
                <div class="recomendacao-header">
                    <span class="prioridade-badge prioridade-${rec.prioridade || 'baixa'}">
                        ${(rec.prioridade || 'baixa').charAt(0).toUpperCase() + (rec.prioridade || 'baixa').slice(1)} Prioridade
                    </span>
                    <span style="font-size: 12px; color: #64748b;">${rec.categoria || ''}</span>
                </div>
                <div class="recomendacao-titulo">${rec.titulo || ''}</div>
                <div style="color: #64748b; line-height: 1.6;">${rec.descricao || ''}</div>
                ${rec.impacto ? `
                <div style="background: #f0f9ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 12px; margin-top: 12px;">
                    <strong style="color: #1e40af;">💥 Impacto Esperado:</strong> 
                    <span style="color: #1e40af;">${rec.impacto}</span>
                </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- ANÁLISE INDIVIDUAL DOS ATIVOS -->
    ${carteira.dadosEstruturados?.ativosAnalise?.length > 0 ? `
    <div class="section page-break">
        <h2 class="section-title">🏢 Análise Individual de Ativos</h2>
        ${carteira.dadosEstruturados.ativosAnalise.map(ativo => `
            <div class="ativo-card">
                <div class="ativo-header">
                    <div class="ativo-codigo">${ativo.codigo || ''}</div>
                    <div class="ativo-nota">
                        <div class="estrelas">${'⭐'.repeat(Math.floor((ativo.nota || 0) / 2))}</div>
                        <div class="nota-valor">${ativo.nota || 0}/10</div>
                    </div>
                </div>
                <div style="color: #64748b; line-height: 1.6;">${ativo.comentario || ''}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <!-- DISTRIBUIÇÃO DA CARTEIRA -->
    ${carteira.estatisticas?.distribuicaoTipo ? `
    <div class="section">
        <h2 class="section-title">📈 Distribuição da Carteira</h2>
        <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 12px; padding: 25px;">
            <div class="distribuicao-grid">
                ${carteira.estatisticas.distribuicaoTipo.map(dist => `
                    <div class="distribuicao-item">
                        <div class="distribuicao-tipo">${dist.tipo}</div>
                        <div class="distribuicao-valor">${dist.percentual.toFixed(1)}%</div>
                        <div style="font-size: 10px; color: #065f46; margin-top: 2px;">
                            R$ ${dist.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    ` : ''}

    <!-- ATIVOS DA CARTEIRA (se existirem) -->
    ${carteira.ativos && carteira.ativos.length > 0 ? `
    <div class="section page-break">
        <h2 class="section-title">💼 Ativos da Carteira</h2>
        <div style="background: #f8fafc; border-radius: 12px; padding: 20px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background: #e2e8f0;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Código</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #cbd5e1;">Tipo</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #cbd5e1;">Quantidade</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #cbd5e1;">Preço Médio</th>
                        <th style="padding: 8px; text-align: right; border: 1px solid #cbd5e1;">Valor Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${carteira.ativos.slice(0, 20).map((ativo, index) => `
                        <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600;">${ativo.codigo}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1;">${formatarTipoAtivo(ativo.tipo)}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">${ativo.quantidade.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right;">R$ ${ativo.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 600; color: #10b981;">R$ ${ativo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    `).join('')}
                    ${carteira.ativos.length > 20 ? `
                        <tr>
                            <td colspan="5" style="padding: 12px; text-align: center; font-style: italic; color: #64748b; border: 1px solid #cbd5e1;">
                                ... e mais ${carteira.ativos.length - 20} ativos
                            </td>
                        </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
    </div>
    ` : ''}

    <!-- RODAPÉ -->
    <div class="rodape">
        <p><strong>Fatos da Bolsa</strong> - Análise Profissional de Carteiras</p>
        <p>Este relatório foi gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        <p>Para dúvidas ou suporte, entre em contato conosco</p>
    </div>
</body>
</html>
  `;
}

// Função REAL - busca dados do Prisma
async function buscarCarteiraPorId(id, userId) {
  try {
    const carteira = await prisma.carteiraAnalise.findUnique({
      where: { 
        id: id,
        userId: userId // Garantir que é do usuário correto
      },
      include: {
        analista: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        ativos: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!carteira) return null;

    // Processar dados estruturados (se existirem)
    let dadosEstruturados = null;
    if (carteira.dadosEstruturados) {
      try {
        dadosEstruturados = JSON.parse(carteira.dadosEstruturados);
      } catch (e) {
        console.error('Erro ao parsear dadosEstruturados:', e);
      }
    }

    // Processar questionário (se existir)
    let questionarioData = null;
    if (carteira.questionario) {
      try {
        questionarioData = JSON.parse(carteira.questionario);
      } catch (e) {
        console.error('Erro ao parsear questionario:', e);
      }
    }

    // Calcular estatísticas básicas dos ativos
    const estatisticas = calcularEstatisticas(carteira.ativos);

    // Retornar dados formatados
    return {
      id: carteira.id,
      nomeArquivo: carteira.nomeArquivo,
      dataEnvio: carteira.dataEnvio,
      dataAnalise: carteira.dataAnalise,
      valorTotal: carteira.valorTotal,
      quantidadeAtivos: carteira.quantidadeAtivos,
      status: carteira.status,
      pontuacao: carteira.pontuacao,
      feedback: carteira.feedback,
      userId: carteira.userId,
      
      // Analista
      analista: carteira.analista ? {
        name: `${carteira.analista.firstName} ${carteira.analista.lastName}`
      } : null,

      // Cliente
      cliente: {
        name: `${carteira.user.firstName} ${carteira.user.lastName}`,
        email: carteira.user.email
      },

      // Dados estruturados da análise
      dadosEstruturados: dadosEstruturados ? {
        avaliacoes: {
          qualidade: carteira.avaliacaoQualidade || dadosEstruturados.avaliacoes?.qualidade || 0,
          diversificacao: carteira.avaliacaoDiversificacao || dadosEstruturados.avaliacoes?.diversificacao || 0,
          adaptacao: carteira.avaliacaoAdaptacao || dadosEstruturados.avaliacoes?.adaptacao || 0
        },
        recomendacoesDetalhadas: dadosEstruturados.recomendacoesDetalhadas || [],
        ativosAnalise: dadosEstruturados.ativosAnalise || []
      } : null,

      // Estatísticas dos ativos
      estatisticas,

      // Ativos da carteira
      ativos: carteira.ativos,

      // Questionário
      questionario: questionarioData
    };

  } catch (error) {
    console.error('Erro ao buscar carteira:', error);
    throw error;
  }
}

// Função para calcular estatísticas dos ativos
function calcularEstatisticas(ativos) {
  if (!ativos || ativos.length === 0) return null;

  const totalValue = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
  
  // Agrupar por tipo
  const distribuicaoTipo = ativos.reduce((acc, ativo) => {
    const tipo = ativo.tipo;
    if (!acc[tipo]) {
      acc[tipo] = { valorTotal: 0, quantidade: 0 };
    }
    acc[tipo].valorTotal += ativo.valorTotal;
    acc[tipo].quantidade += 1;
    return acc;
  }, {});

  // Converter para array com percentuais
  const distribuicaoArray = Object.entries(distribuicaoTipo).map(([tipo, data]) => ({
    tipo: formatarTipoAtivo(tipo),
    valor: data.valorTotal,
    percentual: (data.valorTotal / totalValue) * 100,
    quantidade: data.quantidade
  }));

  return {
    valorTotal: totalValue,
    quantidadeAtivos: ativos.length,
    distribuicaoTipo: distribuicaoArray
  };
}

// Função para formatar tipos de ativos
function formatarTipoAtivo(tipo) {
  const tipos = {
    'ACAO': 'Ações',
    'FII': 'FIIs',
    'ETF': 'ETFs',
    'OUTRO': 'Outros'
  };
  return tipos[tipo] || tipo;
}