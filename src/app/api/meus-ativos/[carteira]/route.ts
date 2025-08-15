// ===== ARQUIVO: src/app/api/meus-ativos/[carteira]/route.ts =====
// 🔒 VERSÃO FINAL INTEGRADA - AUDITORIA + CACHE + PERMISSÕES + CORREÇÕES CRÍTICAS

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔍 SISTEMA DE AUDITORIA E CACHE PARA 4 MIL USUÁRIOS
interface AuditLog {
  userEmail: string;
  userPlan: string;
  carteira: string;
  acessoPermitido: boolean;
  totalItensRetornados: number;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// 🔍 CACHE EM MEMÓRIA PARA PERFORMANCE (4 mil usuários)
const cachePermissoes = new Map<string, boolean>();
const cacheDadosMestres = new Map<string, { data: any[], timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// 📊 ESTATÍSTICAS EM TEMPO REAL
let estatisticasUso = {
  totalRequests: 0,
  requestsPorPlano: {} as Record<string, number>,
  requestsPorCarteira: {} as Record<string, number>,
  acessosNegados: 0,
  ultimaLimpezaCache: Date.now()
};

// 🔍 FUNÇÃO DE DEBUG
function debugLog(message: string, data?: any) {
  console.log(`🔍 [DEBUG] ${message}`, data || '');
}

// 🔒 FUNÇÃO DE AUDITORIA (CRÍTICA PARA SEGURANÇA)
function registrarAcessoAuditoria(auditData: AuditLog) {
  // Log detalhado para auditoria
  console.log(`🔍 [AUDIT] ${auditData.userEmail} (${auditData.userPlan}) → ${auditData.carteira} | ${auditData.acessoPermitido ? '✅ PERMITIDO' : '❌ NEGADO'} | ${auditData.totalItensRetornados} itens`);
  
  // Incrementar estatísticas
  estatisticasUso.totalRequests++;
  estatisticasUso.requestsPorPlano[auditData.userPlan] = (estatisticasUso.requestsPorPlano[auditData.userPlan] || 0) + 1;
  estatisticasUso.requestsPorCarteira[auditData.carteira] = (estatisticasUso.requestsPorCarteira[auditData.carteira] || 0) + 1;
  
  if (!auditData.acessoPermitido) {
    estatisticasUso.acessosNegados++;
    // 🚨 ALERTA DE SEGURANÇA
    console.warn(`🚨 [SECURITY] ACESSO NEGADO: ${auditData.userEmail} tentou acessar ${auditData.carteira} sem permissão`);
  }
  
  // A cada 100 requests, mostrar estatísticas
  if (estatisticasUso.totalRequests % 100 === 0) {
    console.log('📊 [STATS]', estatisticasUso);
  }
}

// ✅ FUNÇÃO DE AUTENTICAÇÃO (igual ao /api/user/me)
async function getAuthenticatedUser(request: NextRequest) {
  try {
    debugLog('🔍 Iniciando autenticação...');
    
    const userEmail = request.headers.get('x-user-email');
    debugLog('🔍 Email do header:', userEmail);
    
    if (!userEmail) {
      debugLog('❌ Email não fornecido');
      return null;
    }

    // Buscar no banco de dados
    debugLog('🔍 Buscando usuário no banco...');
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
      debugLog('❌ Usuário não encontrado no banco');
      return null;
    }

    debugLog('✅ Usuário encontrado:', user.email, 'ID:', user.id);
    return user;
  } catch (error) {
    debugLog('❌ Erro na autenticação:', error);
    return null;
  }
}

// 🔒 FUNÇÃO DE VERIFICAÇÃO DE PERMISSÕES (CRÍTICA!)
function verificarPermissaoCarteiraPorPlano(plano: string, carteira: string): boolean {
  const PERMISSOES_POR_PLANO = {
    'VIP': ['smallCaps', 'microCaps', 'dividendos', 'fiis', 'dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'],
    'LITE': ['smallCaps', 'dividendos', 'fiis', 'dividendosInternacional', 'etfs', 'exteriorStocks'],
    'LITE_V2': ['smallCaps', 'dividendos', 'fiis'], // 🔒 RESTRITO
    'RENDA_PASSIVA': ['dividendos', 'fiis'], // 🔒 MUITO RESTRITO
    'FIIS': ['fiis'], // 🔒 SÓ FIIS
    'AMERICA': ['dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'], // 🔒 SÓ INTERNACIONAL
    'ADMIN': ['smallCaps', 'microCaps', 'dividendos', 'fiis', 'dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'] // 🔓 TUDO
  };
  
  const carteirasPermitidas = PERMISSOES_POR_PLANO[plano] || [];
  const temPermissao = carteirasPermitidas.includes(carteira);
  
  console.log(`🔍 [SEGURANÇA] Plano ${plano} - Carteira ${carteira}: ${temPermissao ? '✅ PERMITIDO' : '❌ NEGADO'}`);
  
  return temPermissao;
}

// 🔒 VERIFICAÇÃO DE PERMISSÃO COM CACHE
function verificarPermissaoComCache(plano: string, carteira: string): boolean {
  const chaveCache = `perm_${plano}_${carteira}`;
  
  // Verificar cache de permissões
  if (cachePermissoes.has(chaveCache)) {
    return cachePermissoes.get(chaveCache)!;
  }
  
  // Calcular permissão
  const temPermissao = verificarPermissaoCarteiraPorPlano(plano, carteira);
  
  // Cachear resultado (permissões não mudam)
  cachePermissoes.set(chaveCache, temPermissao);
  
  return temPermissao;
}

// 📊 FUNÇÃO PARA BUSCAR DADOS MESTRES - CORRIGIDA!
async function buscarDadosMestres(carteira: string): Promise<any[]> {
  // 🔧 CORREÇÃO: Buscar o ID real do admin no banco
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@fatosdobolsa.com' },
    select: { id: true }
  });
  
  if (!adminUser) {
    console.error('❌ Usuário admin não encontrado no banco!');
    return [];
  }
  
  const ADMIN_USER_ID = adminUser.id; // ✅ Agora usando ID real
  console.log(`📊 Buscando dados mestres para ${carteira} - Admin ID: ${ADMIN_USER_ID}`);
  
  switch (carteira) {
    case 'microCaps':
      return await prisma.userMicroCaps.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'smallCaps':
      return await prisma.userSmallCaps.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'dividendos':
      return await prisma.userDividendos.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'fiis':
      return await prisma.userFiis.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'dividendosInternacional':
      return await prisma.userDividendosInternacional.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'etfs':
      return await prisma.userEtfs.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'projetoAmerica':
      return await prisma.userProjetoAmerica.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    case 'exteriorStocks':
      return await prisma.userExteriorStocks.findMany({
        where: { userId: ADMIN_USER_ID },
        orderBy: { editadoEm: 'asc' }
      });
    default:
      throw new Error('Carteira não implementada');
  }
}

// ⚡ FUNÇÃO DE CACHE PARA PERFORMANCE
function obterDadosMestresComCache(carteira: string): Promise<any[]> {
  const chaveCache = `dados_mestres_${carteira}`;
  const agora = Date.now();
  
  // Verificar cache
  const dadosCache = cacheDadosMestres.get(chaveCache);
  if (dadosCache && (agora - dadosCache.timestamp) < CACHE_TTL) {
    console.log(`⚡ [CACHE] Hit para ${carteira} - dados em cache`);
    return Promise.resolve(dadosCache.data);
  }
  
  // Cache miss - buscar dados
  console.log(`🔄 [CACHE] Miss para ${carteira} - buscando dados frescos`);
  
  return buscarDadosMestres(carteira).then(dados => {
    // Atualizar cache
    cacheDadosMestres.set(chaveCache, {
      data: dados,
      timestamp: agora
    });
    
    // Limpeza periódica do cache
    if (agora - estatisticasUso.ultimaLimpezaCache > CACHE_TTL * 2) {
      limparCacheExpirado();
      estatisticasUso.ultimaLimpezaCache = agora;
    }
    
    return dados;
  });
}

// 🧹 LIMPEZA DE CACHE
function limparCacheExpirado() {
  const agora = Date.now();
  let removidos = 0;
  
  for (const [chave, valor] of cacheDadosMestres.entries()) {
    if (agora - valor.timestamp > CACHE_TTL) {
      cacheDadosMestres.delete(chave);
      removidos++;
    }
  }
  
  console.log(`🧹 [CACHE] Limpeza: ${removidos} entradas removidas`);
}

// 🔒 FILTROS RIGOROSOS POR PLANO
function aplicarFiltrosRigorososPorPlano(
  dados: any[], 
  plano: string, 
  carteira: string,
  userEmail: string
): any[] {
  
  console.log(`🔒 [FILTRO] Aplicando filtros para plano ${plano} na carteira ${carteira}`);
  console.log(`📊 [FILTRO] Dados de entrada: ${dados.length} itens`);
  
  // 🔒 CONFIGURAÇÃO DE LIMITES E FILTROS POR PLANO
  const CONFIGURACAO_PLANOS = {
    'VIP': {
      limites: { default: 50, smallCaps: 50, microCaps: 30 },
      filtros: {} // VIP vê tudo
    },
    'LITE': {
      limites: { default: 20, smallCaps: 15, dividendos: 20 },
      filtros: {
        smallCaps: (item: any) => ['Technology', 'Financial', 'Healthcare'].includes(item.setor)
      }
    },
    'LITE_V2': {
      limites: { default: 10, smallCaps: 8, dividendos: 12 },
      filtros: {
        smallCaps: (item: any) => ['Technology', 'Healthcare'].includes(item.setor),
        dividendos: (item: any) => ['Bancos', 'Telecomunicações'].includes(item.setor)
      }
    },
    'RENDA_PASSIVA': {
      limites: { dividendos: 15, fiis: 15 },
      filtros: {
        dividendos: (item: any) => ['Bancos', 'Energia', 'Telecomunicações', 'Utilities'].includes(item.setor),
        fiis: (item: any) => ['Logística', 'Lajes Corporativas', 'Shoppings'].includes(item.setor)
      }
    },
    'FIIS': {
      limites: { fiis: 20 },
      filtros: {
        fiis: (item: any) => true // FIIS vê todos os FIIs
      }
    },
    'AMERICA': {
      limites: { default: 20, exteriorStocks: 25, projetoAmerica: 20 },
      filtros: {} // América vê tudo do internacional
    },
    'ADMIN': {
      limites: { default: 9999 },
      filtros: {} // Admin vê tudo
    }
  };
  
  const config = CONFIGURACAO_PLANOS[plano];
  if (!config) {
    console.log(`❌ [FILTRO] Plano ${plano} não reconhecido - retornando vazio`);
    return [];
  }
  
  let dadosFiltrados = [...dados];
  
  // 1. Aplicar filtros de conteúdo se existirem
  const filtroConteudo = config.filtros[carteira];
  if (filtroConteudo) {
    dadosFiltrados = dadosFiltrados.filter(filtroConteudo);
    console.log(`🔍 [FILTRO] Após filtro de conteúdo: ${dadosFiltrados.length} itens`);
  }
  
  // 2. Aplicar limite quantitativo
  const limite = config.limites[carteira] || config.limites.default || 5;
  dadosFiltrados = dadosFiltrados.slice(0, limite);
  
  console.log(`📊 [FILTRO] Resultado final - Limite ${limite}: ${dadosFiltrados.length} itens`);
  console.log(`👤 [FILTRO] Usuário ${userEmail} (${plano}) acessando ${carteira}`);
  
  return dadosFiltrados;
}

// 📊 FUNÇÃO PARA NÍVEL DE ACESSO
function getAccessLevel(plano: string, carteira: string): string {
  if (plano === 'ADMIN') return 'FULL';
  if (plano === 'VIP') return 'PREMIUM';
  if (['LITE', 'LITE_V2'].includes(plano)) return 'STANDARD';
  return 'LIMITED';
}

// 🔍 GET - BUSCAR ATIVOS - VERSÃO FINAL INTEGRADA
export async function GET(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  const inicioRequest = Date.now();
  let auditData: Partial<AuditLog> = {
    carteira: params.carteira,
    timestamp: new Date()
  };
  
  try {
    debugLog('📊 INICIO GET - Carteira:', params.carteira);
    
    // Extrair informações de auditoria
    auditData.ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    auditData.userAgent = request.headers.get('user-agent') || 'unknown';
    
    // 1. Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      auditData.acessoPermitido = false;
      auditData.totalItensRetornados = 0;
      auditData.userEmail = 'UNKNOWN';
      auditData.userPlan = 'UNKNOWN';
      registrarAcessoAuditoria(auditData as AuditLog);
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    auditData.userEmail = user.email;
    auditData.userPlan = user.plan;
    
    // 2. Validar carteira
    const carteirasValidas = [
      'microCaps', 'smallCaps', 'dividendos', 'fiis', 
      'dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'
    ];
    
    if (!carteirasValidas.includes(params.carteira)) {
      auditData.acessoPermitido = false;
      auditData.totalItensRetornados = 0;
      registrarAcessoAuditoria(auditData as AuditLog);
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }

    // 3. ⚡ VERIFICAR PERMISSÕES COM CACHE
    const temPermissao = verificarPermissaoComCache(user.plan, params.carteira);
    auditData.acessoPermitido = temPermissao;
    
    if (!temPermissao) {
      debugLog(`🚫 Plano ${user.plan} NÃO tem acesso à carteira ${params.carteira}`);
      auditData.totalItensRetornados = 0;
      registrarAcessoAuditoria(auditData as AuditLog);
      return NextResponse.json([]); // Retorna vazio para planos sem acesso
    }

    debugLog(`✅ Plano ${user.plan} tem acesso à carteira ${params.carteira}`);

    // 4. ⚡ BUSCAR DADOS MESTRES COM CACHE
    const dadosMestres = await obterDadosMestresComCache(params.carteira);
    debugLog(`📊 Dados mestres encontrados: ${dadosMestres.length} itens`);

    // 5. 🔒 APLICAR FILTROS RIGOROSOS
    const dadosFiltrados = aplicarFiltrosRigorososPorPlano(
      dadosMestres, 
      user.plan, 
      params.carteira,
      user.email
    );

    debugLog(`🔒 Após filtro do plano ${user.plan}: ${dadosFiltrados.length} itens`);
    auditData.totalItensRetornados = dadosFiltrados.length;

    // 6. Preparar resposta otimizada
    const ativosSerializados = dadosFiltrados.map(ativo => ({
      ...ativo,
      createdAt: ativo.createdAt?.toISOString(),
      updatedAt: ativo.updatedAt?.toISOString(), 
      editadoEm: ativo.editadoEm?.toISOString(),
      // Metadados de performance e segurança
      isFiltered: true,
      userPlan: user.plan,
      accessLevel: getAccessLevel(user.plan, params.carteira),
      cached: true,
      requestTime: Date.now() - inicioRequest
    }));
    
    // 7. Registrar auditoria de sucesso
    registrarAcessoAuditoria(auditData as AuditLog);
    
    // 8. Headers de performance
    const response = NextResponse.json(ativosSerializados);
    response.headers.set('X-Cache-Status', 'INTEGRATED');
    response.headers.set('X-Items-Count', dadosFiltrados.length.toString());
    response.headers.set('X-Access-Level', getAccessLevel(user.plan, params.carteira));
    response.headers.set('X-Request-Time', (Date.now() - inicioRequest).toString());
    
    return response;
    
  } catch (error) {
    debugLog('❌ Erro GET:', error);
    auditData.acessoPermitido = false;
    auditData.totalItensRetornados = 0;
    registrarAcessoAuditoria(auditData as AuditLog);
    
    console.error(`❌ [ERROR] ${auditData.userEmail} - ${params.carteira}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// 🔥 POST - CRIAR NOVO ATIVO - VERSÃO CORRIGIDA
export async function POST(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  const inicioRequest = Date.now();
  
  try {
    console.log('➕ INICIO POST - Carteira:', params.carteira);
    
    // 1. Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    console.log(`✅ Usuário autenticado: ${user.email} (${user.plan})`);
    
    // 2. Validar carteira
    const carteirasValidas = [
      'microCaps', 'smallCaps', 'dividendos', 'fiis', 
      'dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'
    ];
    
    if (!carteirasValidas.includes(params.carteira)) {
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }

    // 3. Verificar permissões
    const temPermissao = verificarPermissaoComCache(user.plan, params.carteira);
    if (!temPermissao) {
      console.log(`🚫 Plano ${user.plan} NÃO tem permissão para criar na carteira ${params.carteira}`);
      return NextResponse.json({ error: 'Sem permissão para esta carteira' }, { status: 403 });
    }

    console.log(`✅ Plano ${user.plan} tem permissão para criar na carteira ${params.carteira}`);
    
    // 4. Parse do body e VALIDAÇÃO
    const body = await request.json();
    console.log('➕ Body recebido:', body);
    
    // 🔥 VALIDAÇÕES OBRIGATÓRIAS
    if (!body.ticker || !body.setor || !body.dataEntrada || body.precoEntrada === undefined || body.precoEntrada === null) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: ticker, setor, dataEntrada, precoEntrada',
        received: {
          ticker: body.ticker,
          setor: body.setor,
          dataEntrada: body.dataEntrada,
          precoEntrada: body.precoEntrada
        }
      }, { status: 400 });
    }
    
    // 5. 🔥 CORREÇÃO: Preparar dados SEM ID (Prisma gera automaticamente)
    const dadosCreate: any = {
      userId: user.id,
      ticker: body.ticker?.toString().toUpperCase(),
      setor: body.setor?.toString(),
      dataEntrada: body.dataEntrada?.toString(),
      precoEntrada: parseFloat(body.precoEntrada),
      editadoEm: new Date(),
      // 🔥 NÃO INCLUIR ID - Prisma gera automaticamente
    };
    
    // Campos opcionais com validação
    if (body.precoTeto !== undefined && body.precoTeto !== null && body.precoTeto !== '') {
      const precoTeto = parseFloat(body.precoTeto);
      if (!isNaN(precoTeto)) {
        dadosCreate.precoTeto = precoTeto;
      }
    }
    if (body.precoTetoBDR !== undefined && body.precoTetoBDR !== null && body.precoTetoBDR !== '') {
      const precoTetoBDR = parseFloat(body.precoTetoBDR);
      if (!isNaN(precoTetoBDR)) {
        dadosCreate.precoTetoBDR = precoTetoBDR;
      }
    }
    if (body.posicaoEncerrada !== undefined) {
      dadosCreate.posicaoEncerrada = Boolean(body.posicaoEncerrada);
    }
    if (body.dataSaida && body.dataSaida !== '') {
      dadosCreate.dataSaida = body.dataSaida.toString();
    }
    if (body.precoSaida !== undefined && body.precoSaida !== null && body.precoSaida !== '') {
      const precoSaida = parseFloat(body.precoSaida);
      if (!isNaN(precoSaida)) {
        dadosCreate.precoSaida = precoSaida;
      }
    }
    if (body.motivoEncerramento && body.motivoEncerramento !== '') {
      dadosCreate.motivoEncerramento = body.motivoEncerramento.toString();
    }
    
    console.log('➕ Dados LIMPOS para criar:', dadosCreate);
    
    let ativoCriado;
    
    // 6. 🔥 CORREÇÃO: Criar com try/catch individual
    try {
      switch (params.carteira) {
        case 'smallCaps':
          ativoCriado = await prisma.userSmallCaps.create({ data: dadosCreate });
          break;
        case 'microCaps':
          ativoCriado = await prisma.userMicroCaps.create({ data: dadosCreate });
          break;
        case 'dividendos':
          ativoCriado = await prisma.userDividendos.create({ data: dadosCreate });
          break;
        case 'fiis':
          ativoCriado = await prisma.userFiis.create({ data: dadosCreate });
          break;
        case 'dividendosInternacional':
          ativoCriado = await prisma.userDividendosInternacional.create({ data: dadosCreate });
          break;
        case 'etfs':
          ativoCriado = await prisma.userEtfs.create({ data: dadosCreate });
          break;
        case 'projetoAmerica':
          ativoCriado = await prisma.userProjetoAmerica.create({ data: dadosCreate });
          break;
        case 'exteriorStocks':
          ativoCriado = await prisma.userExteriorStocks.create({ data: dadosCreate });
          break;
        default:
          return NextResponse.json({ error: 'Carteira não implementada' }, { status: 400 });
      }
    } catch (createError) {
      console.error('❌ Erro específico na criação:', createError);
      return NextResponse.json({ 
        error: 'Erro ao criar ativo no banco', 
        details: (createError as Error).message 
      }, { status: 500 });
    }
    
    console.log(`✅ SUCESSO: Ativo ${dadosCreate.ticker} criado na carteira ${params.carteira}`);
    console.log('✅ Ativo criado com ID:', ativoCriado.id);
    
    // 7. Preparar resposta
    const response = NextResponse.json({
      success: true,
      ativo: ativoCriado,
      message: `Ativo ${dadosCreate.ticker} criado com sucesso`
    });
    
    response.headers.set('X-Operation', 'CREATE');
    response.headers.set('X-Request-Time', (Date.now() - inicioRequest).toString());
    
    return response;
    
  } catch (error) {
    console.error('❌ ERRO GERAL POST:', error);
    return NextResponse.json({ 
      error: 'Erro interno no servidor',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// 🔥 PUT - EDITAR ATIVO - VERSÃO CORRIGIDA
export async function PUT(request: NextRequest, { params }: { params: { carteira: string } }) {
  try {
    console.log('✏️ INICIO PUT - Carteira:', params.carteira);
    
    // 1. Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { carteira } = params;
    const body = await request.json();
    console.log('✏️ Body completo recebido:', body);
    
    const { id, ...dadosAtualizacao } = body;
    
    // 🔥 VALIDAÇÃO CRÍTICA DO ID
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    // 🔥 CONVERSÃO SEGURA DO ID
    let idNumerico: number;
    if (typeof id === 'string') {
      idNumerico = parseInt(id, 10);
      if (isNaN(idNumerico)) {
        return NextResponse.json({ error: 'ID deve ser um número válido' }, { status: 400 });
      }
    } else if (typeof id === 'number') {
      idNumerico = id;
    } else {
      return NextResponse.json({ error: 'ID deve ser número ou string numérica' }, { status: 400 });
    }
    
    console.log('✏️ ID validado:', idNumerico);
    console.log('✏️ Dados para atualização:', dadosAtualizacao);
    
    // 2. Validar carteira
    const CARTEIRA_MODELS = {
      microCaps: 'userMicroCaps',
      smallCaps: 'userSmallCaps', 
      dividendos: 'userDividendos',
      fiis: 'userFiis',
      dividendosInternacional: 'userDividendosInternacional',
      etfs: 'userEtfs',
      projetoAmerica: 'userProjetoAmerica',
      exteriorStocks: 'userExteriorStocks'
    } as const;
    
    const modelName = CARTEIRA_MODELS[carteira as keyof typeof CARTEIRA_MODELS];
    if (!modelName) {
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }

    const model = (prisma as any)[modelName];
    
    // 3. 🔥 VERIFICAR SE ATIVO EXISTE ANTES DE ATUALIZAR
    console.log('🔍 Verificando se ativo existe...');
    const ativoExistente = await model.findFirst({
      where: { 
        id: idNumerico,
        userId: user.id 
      }
    });
    
    if (!ativoExistente) {
      console.log('❌ Ativo não encontrado ou não pertence ao usuário');
      return NextResponse.json({ 
        error: 'Ativo não encontrado ou sem permissão' 
      }, { status: 404 });
    }
    
    console.log('✅ Ativo encontrado:', ativoExistente.ticker);
    
    // 4. 🔥 PREPARAR DADOS LIMPOS PARA ATUALIZAÇÃO
    const dadosUpdate: any = {
      editadoEm: new Date()
    };
    
    // Validação e conversão de campos
    if (dadosAtualizacao.ticker !== undefined) {
      dadosUpdate.ticker = dadosAtualizacao.ticker.toString().toUpperCase();
    }
    if (dadosAtualizacao.setor !== undefined) {
      dadosUpdate.setor = dadosAtualizacao.setor.toString();
    }
    if (dadosAtualizacao.dataEntrada !== undefined) {
      dadosUpdate.dataEntrada = dadosAtualizacao.dataEntrada.toString();
    }
    if (dadosAtualizacao.precoEntrada !== undefined && dadosAtualizacao.precoEntrada !== null) {
      const precoEntrada = parseFloat(dadosAtualizacao.precoEntrada);
      if (!isNaN(precoEntrada)) {
        dadosUpdate.precoEntrada = precoEntrada;
      }
    }
    if (dadosAtualizacao.precoTeto !== undefined) {
      if (dadosAtualizacao.precoTeto === null || dadosAtualizacao.precoTeto === '') {
        dadosUpdate.precoTeto = null;
      } else {
        const precoTeto = parseFloat(dadosAtualizacao.precoTeto);
        if (!isNaN(precoTeto)) {
          dadosUpdate.precoTeto = precoTeto;
        }
      }
    }
    if (dadosAtualizacao.precoTetoBDR !== undefined) {
      if (dadosAtualizacao.precoTetoBDR === null || dadosAtualizacao.precoTetoBDR === '') {
        dadosUpdate.precoTetoBDR = null;
      } else {
        const precoTetoBDR = parseFloat(dadosAtualizacao.precoTetoBDR);
        if (!isNaN(precoTetoBDR)) {
          dadosUpdate.precoTetoBDR = precoTetoBDR;
        }
      }
    }
    if (dadosAtualizacao.posicaoEncerrada !== undefined) {
      dadosUpdate.posicaoEncerrada = Boolean(dadosAtualizacao.posicaoEncerrada);
    }
    if (dadosAtualizacao.dataSaida !== undefined) {
      dadosUpdate.dataSaida = dadosAtualizacao.dataSaida ? dadosAtualizacao.dataSaida.toString() : null;
    }
    if (dadosAtualizacao.precoSaida !== undefined) {
      if (dadosAtualizacao.precoSaida === null || dadosAtualizacao.precoSaida === '') {
        dadosUpdate.precoSaida = null;
      } else {
        const precoSaida = parseFloat(dadosAtualizacao.precoSaida);
        if (!isNaN(precoSaida)) {
          dadosUpdate.precoSaida = precoSaida;
        }
      }
    }
    if (dadosAtualizacao.motivoEncerramento !== undefined) {
      dadosUpdate.motivoEncerramento = dadosAtualizacao.motivoEncerramento ? dadosAtualizacao.motivoEncerramento.toString() : null;
    }
    
    console.log('✏️ Dados LIMPOS para atualizar:', dadosUpdate);
    
    // 5. 🔥 ATUALIZAR COM TRY/CATCH ESPECÍFICO
    let ativoAtualizado;
    try {
      ativoAtualizado = await model.update({
        where: { 
          id: idNumerico,
          userId: user.id
        },
        data: dadosUpdate
      });
    } catch (updateError) {
      console.error('❌ Erro específico na atualização:', updateError);
      return NextResponse.json({ 
        error: 'Erro ao atualizar ativo no banco', 
        details: (updateError as Error).message 
      }, { status: 500 });
    }
    
    console.log(`✅ SUCESSO: Ativo ${ativoAtualizado.ticker} atualizado na carteira ${carteira}`);
    
    return NextResponse.json({
      success: true,
      ativo: ativoAtualizado,
      message: `Ativo ${ativoAtualizado.ticker} atualizado com sucesso`
    });
    
  } catch (error) {
    console.error('❌ ERRO GERAL PUT:', error);
    return NextResponse.json({ 
      error: 'Erro interno no servidor',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// 🔥 DELETE - REMOVER ATIVO - VERSÃO CORRIGIDA
export async function DELETE(request: NextRequest, { params }: { params: { carteira: string } }) {
  try {
    console.log('🗑️ INICIO DELETE - Carteira:', params.carteira);
    
    // 1. Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { carteira } = params;
    const body = await request.json();
    console.log('🗑️ Body recebido:', body);
    
    const { id } = body;
    
    // 🔥 VALIDAÇÃO CRÍTICA DO ID
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    // 🔥 CONVERSÃO SEGURA DO ID
    let idNumerico: number;
    if (typeof id === 'string') {
      idNumerico = parseInt(id, 10);
      if (isNaN(idNumerico)) {
        return NextResponse.json({ error: 'ID deve ser um número válido' }, { status: 400 });
      }
    } else if (typeof id === 'number') {
      idNumerico = id;
    } else {
      return NextResponse.json({ error: 'ID deve ser número ou string numérica' }, { status: 400 });
    }
    
    console.log('🗑️ ID validado:', idNumerico);
    
    // 2. Validar carteira
    const CARTEIRA_MODELS = {
      microCaps: 'userMicroCaps',
      smallCaps: 'userSmallCaps', 
      dividendos: 'userDividendos',
      fiis: 'userFiis',
      dividendosInternacional: 'userDividendosInternacional',
      etfs: 'userEtfs',
      projetoAmerica: 'userProjetoAmerica',
      exteriorStocks: 'userExteriorStocks'
    } as const;
    
    const modelName = CARTEIRA_MODELS[carteira as keyof typeof CARTEIRA_MODELS];
    if (!modelName) {
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }

    const model = (prisma as any)[modelName];
    
    // 3. 🔥 VERIFICAR SE ATIVO EXISTE ANTES DE DELETAR
    console.log('🔍 Verificando se ativo existe...');
    const ativoExistente = await model.findFirst({
      where: { 
        id: idNumerico,
        userId: user.id 
      }
    });
    
    if (!ativoExistente) {
      console.log('❌ Ativo não encontrado ou não pertence ao usuário');
      return NextResponse.json({ 
        error: 'Ativo não encontrado ou sem permissão' 
      }, { status: 404 });
    }
    
    console.log('✅ Ativo encontrado para remoção:', ativoExistente.ticker);
    
    // 4. 🔥 DELETAR COM TRY/CATCH ESPECÍFICO
    let ativoRemovido;
    try {
      ativoRemovido = await model.delete({
        where: { 
          id: idNumerico,
          userId: user.id
        }
      });
    } catch (deleteError) {
      console.error('❌ Erro específico na remoção:', deleteError);
      return NextResponse.json({ 
        error: 'Erro ao remover ativo do banco', 
        details: (deleteError as Error).message 
      }, { status: 500 });
    }
    
    console.log(`✅ SUCESSO: Ativo ${ativoRemovido.ticker} removido da carteira ${carteira}`);
    
    return NextResponse.json({
      success: true,
      ativo: ativoRemovido,
      message: `Ativo ${ativoRemovido.ticker} removido com sucesso`
    });
    
  } catch (error) {
    console.error('❌ ERRO GERAL DELETE:', error);
    return NextResponse.json({ 
      error: 'Erro interno no servidor',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// 📊 ENDPOINT PARA ESTATÍSTICAS (ADMIN ONLY)
export async function OPTIONS(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  
  if (user?.plan !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }
  
  return NextResponse.json({
    estatisticas: estatisticasUso,
    cache: {
      permissoes: cachePermissoes.size,
      dadosMestres: cacheDadosMestres.size,
      ultimaLimpeza: new Date(estatisticasUso.ultimaLimpezaCache)
    },
    performance: {
      cacheHitRate: ((estatisticasUso.totalRequests - Object.values(estatisticasUso.requestsPorCarteira).length) / estatisticasUso.totalRequests * 100).toFixed(2) + '%',
      acessosNegadosPercent: (estatisticasUso.acessosNegados / estatisticasUso.totalRequests * 100).toFixed(2) + '%'
    }
  });
}