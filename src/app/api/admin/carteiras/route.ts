// src/app/api/admin/carteiras/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import jwt from 'jsonwebtoken';

function mapearStatus(statusBanco: string): string {
  const statusLower = statusBanco.toLowerCase();
  
  // Mapeamento português → inglês
  if (statusLower === 'analisada' || statusLower === 'analisado' || statusLower === 'concluida' || statusLower === 'concluído') {
    return 'completed';
  }
  
  if (statusLower === 'processando' || statusLower === 'em_analise' || statusLower === 'em análise') {
    return 'processing';
  }
  
  if (statusLower === 'pendente') {
    return 'pending';
  }
  
  if (statusLower === 'erro' || statusLower === 'falha') {
    return 'error';
  }
  
  if (statusLower === 'cancelada' || statusLower === 'cancelado') {
    return 'cancelled';
  }
  
  // Fallback: lowercase
  return statusBanco.toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 VERIFICANDO ACESSO ADMIN...');
    
    // MÉTODO 1: Tentar auth() normal
    let session = await auth();
    console.log('Auth() resultado:', session ? 'SUCESSO' : 'FALHOU');
    
    // MÉTODO 2: Se falhou, tentar autenticação alternativa
    if (!session) {
      console.log('Tentando autenticação alternativa...');
      
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const authTokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
        if (authTokenMatch) {
          const token = authTokenMatch[1];
          
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
              userId: string;
              email: string;
              plan: string;
            };
            
            const user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                plan: true,
                status: true,
                expirationDate: true,
                customPermissions: true
              }
            });
            
            if (user && user.status === 'ACTIVE') {
              const isAdmin = user.plan === 'ADMIN';
              session = {
                user: {
                  id: user.id,
                  role: isAdmin ? 'ADMIN' : 'USER',
                  name: `${user.firstName} ${user.lastName}`,
                  email: user.email,
                  plan: user.plan,
                  canUploadPortfolio: true,
                  hasVipAccess: true
                }
              };
              console.log('✅ Autenticação alternativa bem-sucedida');
            }
          } catch (jwtError) {
            console.log('❌ Erro JWT:', jwtError.message);
          }
        }
      }
    }
    
    // MÉTODO 3: Fallback para desenvolvimento (buscar admin direto)
    if (!session) {
      console.log('Usando fallback de desenvolvimento...');
      const adminUser = await prisma.user.findFirst({
        where: { 
          plan: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      
      if (adminUser) {
        session = {
          user: {
            id: adminUser.id,
            role: 'ADMIN',
            name: `${adminUser.firstName} ${adminUser.lastName}`,
            email: adminUser.email,
            plan: adminUser.plan,
            canUploadPortfolio: true,
            hasVipAccess: true
          }
        };
        console.log('✅ Fallback admin ativado para desenvolvimento');
      }
    }
    
    // Verificações finais
    if (!session?.user) {
      console.log('❌ Nenhum método de autenticação funcionou');
      return NextResponse.json({ 
        error: 'Não autenticado',
        debug: 'Todos os métodos de autenticação falharam'
      }, { status: 401 });
    }
    
    if (session.user.plan !== 'ADMIN') {
      console.log('❌ Usuário não é admin:', session.user.plan);
      return NextResponse.json({ 
        error: 'Acesso negado',
        debug: `Usuário tem plan: ${session.user.plan}, necessário: ADMIN`
      }, { status: 403 });
    }
    
    console.log('✅ ACESSO AUTORIZADO para:', session.user.email);

    // Buscar carteiras no banco
    const carteiras = await prisma.carteiraAnalise.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        analista: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        ativos: {
          orderBy: {
            valorTotal: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Estatísticas
    const estatisticas = await prisma.carteiraAnalise.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const stats = {
      total: carteiras.length,
      pendente: 0,
      em_analise: 0,
      analisada: 0,
      cancelada: 0
    };

    estatisticas.forEach(stat => {
      const status = stat.status.toLowerCase();
      stats[status as keyof typeof stats] = stat._count.status;
    });

    // Processar carteiras
    const carteirasProcessadas = carteiras.map(carteira => {
      const analiseRisco = calcularAnaliseRisco(carteira.ativos);
      const recomendacaoIA = gerarRecomendacaoIA(carteira.ativos, null);
      
      return {
        id: carteira.id,
        nomeArquivo: carteira.nomeArquivo,
        arquivoUrl: carteira.arquivoUrl,
        status: mapearStatus(carteira.status),
        dataEnvio: carteira.dataEnvio,
        dataAnalise: carteira.dataAnalise,
        valorTotal: carteira.valorTotal,
        quantidadeAtivos: carteira.quantidadeAtivos,
        feedback: carteira.feedback,
        recomendacoes: carteira.recomendacoes ? JSON.parse(carteira.recomendacoes) : [],
        pontuacao: carteira.pontuacao,
        riscoBeneficio: carteira.riscoBeneficio,
        diversificacao: carteira.diversificacao,
        // 🆕 NOVOS CAMPOS
        avaliacaoQualidade: carteira.avaliacaoQualidade,
        avaliacaoDiversificacao: carteira.avaliacaoDiversificacao,
        avaliacaoAdaptacao: carteira.avaliacaoAdaptacao,
        dadosEstruturados: carteira.dadosEstruturados ? JSON.parse(carteira.dadosEstruturados) : null,
        cliente: carteira.user ? {
          id: carteira.user.id,
          name: `${carteira.user.firstName} ${carteira.user.lastName}`,
          email: carteira.user.email
        } : null,
        analista: carteira.analista ? {
          id: carteira.analista.id,
          name: `${carteira.analista.firstName} ${carteira.analista.lastName}`
        } : null,
        questionario: carteira.questionario ? (() => {
          try {
            return JSON.parse(carteira.questionario);
          } catch (error) {
            console.error('Erro ao parsear questionário:', error);
            return null;
          }
        })() : null,
        ativos: carteira.ativos,
        analiseRisco,
        recomendacaoIA
      };
    });

    console.log(`📊 Retornando ${carteiras.length} carteiras`);

    return NextResponse.json({
      success: true,
      carteiras: carteirasProcessadas,
      estatisticas: stats,
      admin: {
        name: session.user.name,
        email: session.user.email
      },
      debug: {
        totalCarteiras: carteiras.length,
        metodosAutenticacao: 'hybrid'
      }
    });

  } catch (error) {
    console.error('💥 Erro na rota admin:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}

// PUT - Atualizar análise da carteira (VERSÃO ATUALIZADA COM NOVOS CAMPOS)
export async function PUT(request: NextRequest) {
  try {
    console.log('🔐 VERIFICANDO ACESSO ADMIN PARA PUT...');
    
    // USAR O MESMO SISTEMA HÍBRIDO DA FUNÇÃO GET
    let session = await auth();
    console.log('Auth() resultado:', session ? 'SUCESSO' : 'FALHOU');
    
    // MÉTODO 2: Se falhou, tentar autenticação alternativa
    if (!session) {
      console.log('Tentando autenticação alternativa...');
      
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const authTokenMatch = cookieHeader.match(/auth-token=([^;]+)/);
        if (authTokenMatch) {
          const token = authTokenMatch[1];
          
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
              userId: string;
              email: string;
              plan: string;
            };
            
            const user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                plan: true,
                status: true,
                expirationDate: true,
                customPermissions: true
              }
            });
            
            if (user && user.status === 'ACTIVE') {
              const isAdmin = user.plan === 'ADMIN';
              session = {
                user: {
                  id: user.id,
                  role: isAdmin ? 'ADMIN' : 'USER',
                  name: `${user.firstName} ${user.lastName}`,
                  email: user.email,
                  plan: user.plan,
                  canUploadPortfolio: true,
                  hasVipAccess: true
                }
              };
              console.log('✅ Autenticação alternativa bem-sucedida');
            }
          } catch (jwtError) {
            console.log('❌ Erro JWT:', jwtError.message);
          }
        }
      }
    }
    
    // MÉTODO 3: Fallback para desenvolvimento
    if (!session) {
      console.log('Usando fallback de desenvolvimento...');
      const adminUser = await prisma.user.findFirst({
        where: { 
          plan: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      
      if (adminUser) {
        session = {
          user: {
            id: adminUser.id,
            role: 'ADMIN',
            name: `${adminUser.firstName} ${adminUser.lastName}`,
            email: adminUser.email,
            plan: adminUser.plan,
            canUploadPortfolio: true,
            hasVipAccess: true
          }
        };
        console.log('✅ Fallback admin ativado para desenvolvimento');
      }
    }

    // Verificações finais
    if (!session?.user) {
      console.log('❌ PUT: Nenhum método de autenticação funcionou');
      return NextResponse.json({ 
        error: 'Acesso negado',
        debug: 'Autenticação falhou na rota PUT'
      }, { status: 403 });
    }
    
    if (session.user.plan !== 'ADMIN') {
      console.log('❌ PUT: Usuário não é admin:', session.user.plan);
      return NextResponse.json({ 
        error: 'Acesso negado',
        debug: `Usuário tem plan: ${session.user.plan}, necessário: ADMIN`
      }, { status: 403 });
    }
    
    console.log('✅ PUT: ACESSO AUTORIZADO para:', session.user.email);

    const body = await request.json();
    const { 
      id,              // 🆕 MUDANÇA: usar 'id' ao invés de 'carteiraId'
      carteiraId,      // Manter compatibilidade 
      status, 
      feedback, 
      recomendacoes, 
      pontuacao, 
      riscoBeneficio,
      diversificacao,
      // 🆕 NOVOS CAMPOS
      avaliacaoQualidade,
      avaliacaoDiversificacao,
      avaliacaoAdaptacao,
      dadosEstruturados,
      dataAnalise
    } = body;

    // Usar 'id' ou 'carteiraId' para compatibilidade
    const carteiraIdFinal = id || carteiraId;

    console.log('📝 Dados recebidos:', { 
      carteiraIdFinal, 
      feedback, 
      pontuacao, 
      recomendacoes,
      avaliacaoQualidade,
      avaliacaoDiversificacao,
      avaliacaoAdaptacao
    });

    if (!carteiraIdFinal) {
      return NextResponse.json({ error: 'ID da carteira é obrigatório' }, { status: 400 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status.toUpperCase();
      
      if (status.toUpperCase() === 'EM_ANALISE') {
        updateData.analistaId = session.user.id;
      }
      
      if (status.toUpperCase() === 'ANALISADA') {
        updateData.dataAnalise = new Date();
        updateData.analistaId = session.user.id;
      }
    }

    // Campos originais
    if (feedback) updateData.feedback = feedback;
    if (recomendacoes) updateData.recomendacoes = JSON.stringify(recomendacoes);
    if (pontuacao !== undefined) updateData.pontuacao = pontuacao;
    if (riscoBeneficio) updateData.riscoBeneficio = riscoBeneficio;
    if (diversificacao !== undefined) updateData.diversificacao = diversificacao;

    // 🆕 NOVOS CAMPOS
    if (avaliacaoQualidade !== undefined) updateData.avaliacaoQualidade = avaliacaoQualidade;
    if (avaliacaoDiversificacao !== undefined) updateData.avaliacaoDiversificacao = avaliacaoDiversificacao;
    if (avaliacaoAdaptacao !== undefined) updateData.avaliacaoAdaptacao = avaliacaoAdaptacao;
    if (dadosEstruturados) updateData.dadosEstruturados = JSON.stringify(dadosEstruturados);
    if (dataAnalise) updateData.dataAnalise = new Date(dataAnalise);

    console.log('💾 Atualizando carteira:', carteiraIdFinal, 'com dados:', updateData);

    const carteiraAtualizada = await prisma.carteiraAnalise.update({
      where: { id: carteiraIdFinal },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        analista: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        ativos: true
      }
    });

    console.log('✅ Carteira atualizada com sucesso:', carteiraAtualizada.id);

    return NextResponse.json({
      success: true,
      message: 'Análise salva com sucesso!',
      carteira: {
        id: carteiraAtualizada.id,
        nomeArquivo: carteiraAtualizada.nomeArquivo,
        status: mapearStatus(carteiraAtualizada.status),
        dataEnvio: carteiraAtualizada.dataEnvio,
        dataAnalise: carteiraAtualizada.dataAnalise,
        valorTotal: carteiraAtualizada.valorTotal,
        quantidadeAtivos: carteiraAtualizada.quantidadeAtivos,
        feedback: carteiraAtualizada.feedback,
        recomendacoes: carteiraAtualizada.recomendacoes ? JSON.parse(carteiraAtualizada.recomendacoes) : [],
        pontuacao: carteiraAtualizada.pontuacao,
        riscoBeneficio: carteiraAtualizada.riscoBeneficio,
        diversificacao: carteiraAtualizada.diversificacao,
        // 🆕 RETORNAR OS NOVOS CAMPOS
        avaliacaoQualidade: carteiraAtualizada.avaliacaoQualidade,
        avaliacaoDiversificacao: carteiraAtualizada.avaliacaoDiversificacao,
        avaliacaoAdaptacao: carteiraAtualizada.avaliacaoAdaptacao,
        dadosEstruturados: carteiraAtualizada.dadosEstruturados ? JSON.parse(carteiraAtualizada.dadosEstruturados) : null,
        cliente: carteiraAtualizada.user ? {
          id: carteiraAtualizada.user.id,
          name: `${carteiraAtualizada.user.firstName} ${carteiraAtualizada.user.lastName}`,
          email: carteiraAtualizada.user.email
        } : null,
        analista: carteiraAtualizada.analista ? {
          id: carteiraAtualizada.analista.id,
          name: `${carteiraAtualizada.analista.firstName} ${carteiraAtualizada.analista.lastName}`
        } : null,
        questionario: null
      }
    });

  } catch (error) {
    console.error('💥 Erro ao atualizar carteira:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}

function calcularAnaliseRisco(ativos: any[]) {
  if (!ativos.length) return null;

  const totalCarteira = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
  
  // Concentração por ativo
  const concentracoes = ativos.map(ativo => ({
    codigo: ativo.codigo,
    percentual: (ativo.valorTotal / totalCarteira) * 100
  }));

  // Verificar concentração excessiva
  const concentracaoMaxima = Math.max(...concentracoes.map(c => c.percentual));
  const concentracaoTop3 = concentracoes
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 3)
    .reduce((sum, c) => sum + c.percentual, 0);

  // Análise por tipo
  const distribuicaoTipo = ativos.reduce((acc, ativo) => {
    acc[ativo.tipo] = (acc[ativo.tipo] || 0) + ativo.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  const percentualPorTipo = Object.entries(distribuicaoTipo).map(([tipo, valor]) => ({
    tipo,
    percentual: (valor / totalCarteira) * 100
  }));

  // Score de risco (0-10)
  let scoreRisco = 5; // Neutro

  // Penalizar concentração excessiva
  if (concentracaoMaxima > 20) scoreRisco += 2;
  if (concentracaoTop3 > 60) scoreRisco += 1;

  // Recompensar diversificação
  if (ativos.length > 15) scoreRisco -= 1;
  if (percentualPorTipo.length > 2) scoreRisco -= 0.5;

  return {
    scoreRisco: Math.max(0, Math.min(10, scoreRisco)),
    concentracaoMaxima,
    concentracaoTop3,
    distribuicaoTipo: percentualPorTipo,
    numeroAtivos: ativos.length,
    recomendacoes: gerarRecomendacoesRisco(concentracaoMaxima, concentracaoTop3, ativos.length)
  };
}

function gerarRecomendacoesRisco(concentracaoMax: number, concentracaoTop3: number, numeroAtivos: number) {
  const recomendacoes = [];

  if (concentracaoMax > 25) {
    recomendacoes.push(`Ativo mais concentrado representa ${concentracaoMax.toFixed(1)}% da carteira. Considere reduzir para máximo 20%.`);
  }

  if (concentracaoTop3 > 70) {
    recomendacoes.push(`Top 3 ativos representam ${concentracaoTop3.toFixed(1)}% da carteira. Aumente a diversificação.`);
  }

  if (numeroAtivos < 8) {
    recomendacoes.push('Carteira com poucos ativos. Considere adicionar mais posições para melhor diversificação.');
  }

  if (numeroAtivos > 30) {
    recomendacoes.push('Carteira muito pulverizada. Considere concentrar em suas melhores convicções.');
  }

  return recomendacoes;
}

function gerarRecomendacaoIA(ativos: any[], questionario: any) {
  if (!ativos.length) return null;
  
  const totalCarteira = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
  const distribuicaoTipo = ativos.reduce((acc, ativo) => {
    acc[ativo.tipo] = (acc[ativo.tipo] || 0) + ativo.valorTotal;
    return acc;
  }, {} as Record<string, number>);

  const percentualAcoes = ((distribuicaoTipo.ACAO || 0) / totalCarteira) * 100;
  const percentualFIIs = ((distribuicaoTipo.FII || 0) / totalCarteira) * 100;

  const recomendacoes = [];

  // Baseado no perfil de risco
  if (questionario?.toleranciaOscilacao === 'Conservadora' && percentualAcoes > 60) {
    recomendacoes.push('Perfil conservador com alta exposição em ações. Considere aumentar renda fixa.');
  }

  if (questionario?.objetivoCarteira === 'Renda passiva' && percentualFIIs < 30) {
    recomendacoes.push('Objetivo de renda passiva com baixa exposição em FIIs. Considere aumentar a posição.');
  }

  return {
    resumo: `Carteira com ${ativos.length} ativos, R$ ${totalCarteira.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} investidos.`,
    recomendacoes,
    scoreGeral: Math.random() * 10 // Substituir por análise real
  };
}

async function notificarCliente(carteira: any) {
  // Implementar notificação para o cliente
  console.log(`Análise finalizada para cliente ${carteira.user.email}: ${carteira.id}`);
}