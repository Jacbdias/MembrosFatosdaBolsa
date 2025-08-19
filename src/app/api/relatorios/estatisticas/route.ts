import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔐 FUNÇÃO DE AUTENTICAÇÃO FLEXÍVEL
async function getAuthenticatedUser(request: NextRequest) {
  try {
    console.log('🔍 [AUTH] Iniciando autenticação flexível...');
    
    const userEmail = request.headers.get('x-user-email');
    console.log('🔍 [AUTH] Email do header:', userEmail);
    
    if (!userEmail) {
      console.log('⚠️ [AUTH] Email não fornecido - permitindo acesso público');
      return { isPublic: true, user: null };
    }

    // Buscar no banco de dados
    console.log('🔍 [AUTH] Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        plan: true,
        status: true
      }
    });

    if (!user) {
      console.log('⚠️ [AUTH] Usuário não encontrado - permitindo acesso público');
      return { isPublic: true, user: null };
    }

    console.log('✅ [AUTH] Usuário encontrado:', user.email, 'Plano:', user.plan);
    return { isPublic: false, user };
  } catch (error) {
    console.log('⚠️ [AUTH] Erro na autenticação - fallback para público:', error);
    return { isPublic: true, user: null };
  }
}

// 👑 VERIFICAR PERMISSÕES FLEXÍVEIS
function getPermissions(user: any, isPublic: boolean) {
  if (isPublic) {
    // ACESSO PÚBLICO: ver todos os relatórios (sem restrição)
    return { 
      canView: true, 
      viewAll: true, 
      accessType: 'public' 
    };
  }
  
  if (!user) {
    return { 
      canView: true, 
      viewAll: true, 
      accessType: 'public' 
    };
  }
  
  // USUÁRIOS LOGADOS: permissões baseadas no plano
  const PERMISSOES_RELATORIOS = {
    'ADMIN': { canView: true, viewAll: true, accessType: 'admin' },
    'VIP': { canView: true, viewAll: true, accessType: 'vip' },
    'LITE': { canView: true, viewAll: true, accessType: 'lite' },        // ✅ LITE pode ver todos
    'LITE_V2': { canView: true, viewAll: true, accessType: 'lite_v2' },  // ✅ LITE_V2 pode ver todos
    'RENDA_PASSIVA': { canView: true, viewAll: true, accessType: 'renda_passiva' },
    'FIIS': { canView: true, viewAll: true, accessType: 'fiis' },
    'AMERICA': { canView: true, viewAll: true, accessType: 'america' }
  };
  
  const permissao = PERMISSOES_RELATORIOS[user.plan] || { 
    canView: true, 
    viewAll: true, 
    accessType: 'default' 
  };
  
  console.log(`👑 [PERM] Usuário ${user.email} (${user.plan}):`, permissao);
  
  return permissao;
}

// 📊 GET - Obter estatísticas dos relatórios (ACESSO PÚBLICO)
export async function GET(request: NextRequest) {
  try {
    console.log('📊 [STATS] INICIO - Obter estatísticas (acesso público permitido)');
    
    // 🔐 Autenticação flexível
    const { isPublic, user } = await getAuthenticatedUser(request);
    
    // 👑 Verificar permissões (sempre permite acesso)
    const { canView, viewAll, accessType } = getPermissions(user, isPublic);
    
    console.log(`🔓 [STATS] Acesso permitido - Tipo: ${accessType}`);
    
    // 📋 Buscar TODOS os relatórios (sem filtro de usuário)
    // Para a página dos ativos, mostramos todos os relatórios disponíveis
    console.log(`🌍 [STATS] Buscando todos os relatórios disponíveis`);

    const relatorios = await prisma.relatorio.findMany({
      // SEM WHERE CLAUSE - mostra todos os relatórios
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

    console.log(`✅ [STATS] Retornando ${totalRelatorios} relatórios (acesso ${accessType})`);

    return NextResponse.json({
      success: true,
      totalRelatorios,
      totalTickers,
      relatoriosComPdf,
      tamanhoTotalMB: Number(tamanhoTotalMB.toFixed(2)),
      dataUltimoUpload,
      relatorios: relatoriosFormatados,
      estatisticasPorTicker,
      // 🔐 Informações de contexto
      context: {
        accessType,
        isPublic,
        userEmail: user?.email || 'público',
        userPlan: user?.plan || 'público',
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