import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔐 FUNÇÃO DE AUTENTICAÇÃO (SEGUINDO O PADRÃO EXISTENTE)
async function getAuthenticatedUser(request: NextRequest) {
  try {
    console.log('🔍 [AUTH] Iniciando autenticação...');
    
    const userEmail = request.headers.get('x-user-email');
    console.log('🔍 [AUTH] Email do header:', userEmail);
    
    if (!userEmail) {
      console.log('❌ [AUTH] Email não fornecido');
      return null;
    }

    // Buscar no banco de dados (igual ao padrão existente)
    console.log('🔍 [AUTH] Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        plan: true,     // 👑 Plano do usuário
        status: true
      }
    });

    if (!user) {
      console.log('❌ [AUTH] Usuário não encontrado no banco');
      return null;
    }

    console.log('✅ [AUTH] Usuário encontrado:', user.email, 'Plano:', user.plan);
    return user;
  } catch (error) {
    console.log('❌ [AUTH] Erro na autenticação:', error);
    return null;
  }
}

// 👑 VERIFICAR SE USUÁRIO TEM PERMISSÃO PARA VER RELATÓRIOS
function canViewRelatorios(user: any): { canView: boolean; viewAll: boolean } {
  if (!user) {
    return { canView: false, viewAll: false };
  }
  
  // 🔧 DEFINIR PERMISSÕES POR PLANO (adapte conforme sua regra de negócio)
  const PERMISSOES_RELATORIOS = {
    'ADMIN': { canView: true, viewAll: true },      // Admin vê tudo
    'VIP': { canView: true, viewAll: true },        // VIP vê tudo  
    'LITE': { canView: true, viewAll: false },      // LITE vê só próprios
    'LITE_V2': { canView: true, viewAll: false },   // LITE_V2 vê só próprios
    'RENDA_PASSIVA': { canView: true, viewAll: false }, // RENDA_PASSIVA vê só próprios
    'FIIS': { canView: true, viewAll: false },      // FIIS vê só próprios
    'AMERICA': { canView: true, viewAll: false }    // AMERICA vê só próprios
  };
  
  const permissao = PERMISSOES_RELATORIOS[user.plan] || { canView: false, viewAll: false };
  
  console.log(`👑 [PERM] Usuário ${user.email} (${user.plan}):`, permissao);
  
  return permissao;
}

// 📊 GET - Obter estatísticas dos relatórios (SEGUINDO PADRÃO EXISTENTE)
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [STATS] INICIO - Obter estatísticas dos relatórios');
    
    // 🔐 Autenticação (seguindo padrão existente)
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      console.log('❌ [STATS] Usuário não autenticado');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuário não autenticado',
          totalRelatorios: 0,
          totalTickers: 0,
          relatoriosComPdf: 0,
          tamanhoTotalMB: 0,
          relatorios: []
        },
        { status: 401 }
      );
    }
    
    // 👑 Verificar permissões
    const { canView, viewAll } = canViewRelatorios(user);
    
    if (!canView) {
      console.log(`🚫 [STATS] Usuário ${user.email} (${user.plan}) sem permissão para ver relatórios`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sem permissão para acessar relatórios',
          totalRelatorios: 0,
          totalTickers: 0,
          relatoriosComPdf: 0,
          tamanhoTotalMB: 0,
          relatorios: []
        },
        { status: 403 }
      );
    }
    
    // 📋 Determinar filtro baseado nas permissões
    let whereClause: any = {};
    
    if (!viewAll) {
      // Usuário normal: ver apenas seus próprios relatórios
      whereClause = { userId: user.id };
      console.log(`🔍 [STATS] Filtro aplicado: userId = ${user.id}`);
    } else {
      // Admin/VIP: ver todos os relatórios
      console.log(`👑 [STATS] Admin/VIP: vendo todos os relatórios`);
      
      // 🔧 CORREÇÃO ESPECIAL: Para dados existentes com 'SEM_USER_ID'
      // (Remova esta seção após migrar os dados existentes)
      const isDev = process.env.NODE_ENV === 'development';
      if (isDev) {
        whereClause = {
          OR: [
            { userId: user.id },           // Relatórios do usuário
            { userId: null },              // Relatórios sem userId
            { userId: 'SEM_USER_ID' },     // Relatórios com placeholder
            { userId: '' }                 // Relatórios com string vazia
          ]
        };
        console.log(`🔧 [STATS] Modo DEV: incluindo dados órfãos`);
      }
    }

    console.log('🔍 [STATS] Where clause:', whereClause);

    // Buscar relatórios com filtro apropriado
    const relatorios = await prisma.relatorio.findMany({
      where: whereClause,
      orderBy: [
        { ticker: 'asc' },
        { dataReferencia: 'desc' }
      ]
    });

    console.log('📋 [STATS] Relatórios encontrados:', relatorios.length);

    // Calcular estatísticas
    const totalRelatorios = relatorios.length;
    
    // Contar tickers únicos
    const tickersUnicos = new Set(relatorios.map(r => r.ticker));
    const totalTickers = tickersUnicos.size;
    
    // Contar relatórios com PDF
    const relatoriosComPdf = relatorios.filter(r => 
      r.arquivoPdf || r.nomeArquivoPdf
    ).length;
    
    // Calcular tamanho total em MB
    const tamanhoTotalBytes = relatorios.reduce((sum, r) => 
      sum + (r.tamanhoArquivo || 0), 0
    );
    const tamanhoTotalMB = tamanhoTotalBytes / (1024 * 1024);
    
    // Data do último upload
    const ultimoUpload = relatorios.length > 0 
      ? Math.max(...relatorios.map(r => r.dataUpload.getTime()))
      : null;
    
    const dataUltimoUpload = ultimoUpload 
      ? new Date(ultimoUpload).toISOString()
      : undefined;

    // Converter relatórios para o formato da interface
    const relatoriosFormatados = relatorios.map(relatorio => ({
      id: relatorio.id,
      ticker: relatorio.ticker,
      nome: relatorio.nome,
      tipo: relatorio.tipo as 'trimestral' | 'anual' | 'apresentacao' | 'outros',
      dataReferencia: relatorio.dataReferencia,
      dataUpload: relatorio.dataUpload.toISOString(),
      linkCanva: relatorio.linkCanva || undefined,
      linkExterno: relatorio.linkExterno || undefined,
      tipoVisualizacao: relatorio.tipoVisualizacao as 'iframe' | 'canva' | 'link' | 'pdf',
      arquivoPdf: relatorio.arquivoPdf || undefined,
      nomeArquivoPdf: relatorio.nomeArquivoPdf || undefined,
      tamanhoArquivo: relatorio.tamanhoArquivo || undefined,
      tipoPdf: (relatorio.tipoPdf as 'base64' | 'referencia') || undefined,
      hashArquivo: relatorio.hashArquivo || undefined,
      solicitarReupload: relatorio.solicitarReupload || undefined
    }));

    // Estatísticas por ticker
    const estatisticasPorTicker = Array.from(tickersUnicos).map(ticker => {
      const relatoriosDoTicker = relatorios.filter(r => r.ticker === ticker);
      return {
        ticker,
        total: relatoriosDoTicker.length,
        comPdf: relatoriosDoTicker.filter(r => r.arquivoPdf || r.nomeArquivoPdf).length,
        tamanhoMB: relatoriosDoTicker.reduce((sum, r) => 
          sum + (r.tamanhoArquivo || 0), 0
        ) / (1024 * 1024)
      };
    }).sort((a, b) => b.total - a.total);

    // Estatísticas por tipo
    const estatisticasPorTipo = {
      trimestral: relatorios.filter(r => r.tipo === 'trimestral').length,
      anual: relatorios.filter(r => r.tipo === 'anual').length,
      apresentacao: relatorios.filter(r => r.tipo === 'apresentacao').length,
      outros: relatorios.filter(r => r.tipo === 'outros').length
    };

    console.log(`✅ [STATS] Retornando ${totalRelatorios} relatórios para ${user.email} (${user.plan})`);

    return NextResponse.json({
      success: true,
      totalRelatorios,
      totalTickers,
      relatoriosComPdf,
      tamanhoTotalMB: Number(tamanhoTotalMB.toFixed(2)),
      dataUltimoUpload,
      relatorios: relatoriosFormatados,
      estatisticasPorTicker,
      estatisticasPorTipo,
      resumo: {
        base64: relatorios.filter(r => r.tipoPdf === 'base64').length,
        referencia: relatorios.filter(r => r.tipoPdf === 'referencia').length,
        semPdf: relatorios.filter(r => !r.arquivoPdf && !r.nomeArquivoPdf).length
      },
      // 🔐 Informações de contexto (útil para debug)
      context: {
        isAuthenticated: true,
        userEmail: user.email,
        userPlan: user.plan,
        canViewAll: viewAll,
        environment: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('❌ [STATS] Erro ao calcular estatísticas dos relatórios:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor ao calcular estatísticas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        // Retornar dados vazios em caso de erro
        totalRelatorios: 0,
        totalTickers: 0,
        relatoriosComPdf: 0,
        tamanhoTotalMB: 0,
        relatorios: []
      },
      { status: 500 }
    );
  }
}