// ===== ARQUIVO: src/app/api/meus-ativos/[carteira]/route.ts =====
// VERSÃO COM DEBUG DETALHADO

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔍 FUNÇÃO DE DEBUG
function debugLog(message: string, data?: any) {
  console.log(`🔍 [DEBUG] ${message}`, data || '');
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

    // Verificar se é admin (buscar usuário real no banco)
    if (userEmail === 'admin@fatosdobolsa.com') {
      debugLog('✅ Usuário admin identificado, buscando ID real no banco...');
      
      const adminUser = await prisma.user.findUnique({
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
      
      if (!adminUser) {
        debugLog('❌ Usuário admin não encontrado no banco');
        return null;
      }
      
      debugLog('✅ Usuário admin encontrado com ID real:', adminUser.id);
      return adminUser;
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

    debugLog('✅ Usuário encontrado:', user.email);
    return user;
  } catch (error) {
    debugLog('❌ Erro na autenticação:', error);
    return null;
  }
}

// 🔍 GET - BUSCAR ATIVOS
export async function GET(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  try {
    debugLog('📊 INICIO GET - Carteira:', params.carteira);
    
    // 1. Autenticação
    debugLog('🔍 Passo 1: Autenticação');
    const user = await getAuthenticatedUser(request);
    if (!user) {
      debugLog('❌ Falha na autenticação - retornando 401');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    debugLog('✅ Autenticação OK - User ID:', user.id);

    // 2. Validar carteira
    debugLog('🔍 Passo 2: Validando carteira');
    const carteirasValidas = [
      'microCaps', 'smallCaps', 'dividendos', 'fiis', 
      'dividendosInternacional', 'etfs', 'projetoAmerica', 'exteriorStocks'
    ];
    
    if (!carteirasValidas.includes(params.carteira)) {
      debugLog('❌ Carteira inválida:', params.carteira);
      return NextResponse.json({ error: 'Carteira inválida' }, { status: 400 });
    }
    debugLog('✅ Carteira válida:', params.carteira);

    // 3. Buscar dados
    debugLog('🔍 Passo 3: Buscando dados no banco');
    console.log(`📊 Buscando carteira pessoal ${params.carteira} para usuário ${user.email}`);
    
    let ativos = [];
    
    try {
      switch (params.carteira) {
        case 'microCaps':
          ativos = await prisma.userMicroCaps.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'smallCaps':
          ativos = await prisma.userSmallCaps.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'dividendos':
          ativos = await prisma.userDividendos.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'fiis':
          ativos = await prisma.userFiis.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'dividendosInternacional':
          ativos = await prisma.userDividendosInternacional.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'etfs':
          ativos = await prisma.userEtfs.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'projetoAmerica':
          ativos = await prisma.userProjetoAmerica.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        case 'exteriorStocks':
          ativos = await prisma.userExteriorStocks.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'desc' }
          });
          break;
        default:
          debugLog('❌ Switch case não encontrado');
          return NextResponse.json({ error: 'Carteira não implementada' }, { status: 400 });
      }
      
      debugLog('✅ Dados encontrados:', ativos.length);
      debugLog('📊 Dados brutos:', JSON.stringify(ativos, null, 2));
      console.log(`✅ Encontrados ${ativos.length} ativos na carteira ${params.carteira}`);
      
    } catch (dbError) {
      debugLog('❌ Erro na consulta ao banco:', dbError);
      throw dbError;
    }

    // 4. Retornar resposta
    debugLog('🔍 Passo 4: Preparando resposta');
    
    // Converter Dates para strings para evitar problemas de serialização
    const ativosSerializados = ativos.map(ativo => ({
      ...ativo,
      createdAt: ativo.createdAt?.toISOString(),
      updatedAt: ativo.updatedAt?.toISOString(), 
      editadoEm: ativo.editadoEm?.toISOString()
    }));
    
    debugLog('📊 Ativos serializados:', ativosSerializados.length);
    debugLog('🔧 JSON stringified:', JSON.stringify(ativosSerializados).substring(0, 200) + '...');
    
    const response = NextResponse.json(ativosSerializados);
    debugLog('✅ Response criado, enviando...');
    
    return response;
    
  } catch (error) {
    debugLog('❌ Erro GET:', error);
    console.error(`❌ Erro GET carteira ${params.carteira}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// 🔍 POST - CRIAR ATIVO  
export async function POST(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  try {
    debugLog('📝 INICIO POST - Carteira:', params.carteira);
    
    // Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Parse do body
    const body = await request.json();
    debugLog('📝 Body recebido:', body);
    
    // Dados comuns
    const dadosComuns = {
      userId: user.id,
      ticker: body.ticker?.toUpperCase(),
      setor: body.setor,
      dataEntrada: body.dataEntrada,
      precoEntrada: parseFloat(body.precoEntrada),
      editadoEm: new Date()
    };
    
    // Dados específicos por carteira
    const dadosEspecificos: any = { ...dadosComuns };
    
    if (body.precoTeto) dadosEspecificos.precoTeto = parseFloat(body.precoTeto);
    if (body.precoTetoBDR) dadosEspecificos.precoTetoBDR = parseFloat(body.precoTetoBDR);
    
    debugLog('📝 Dados para inserir:', dadosEspecificos);
    
    let novoAtivo;
    
    switch (params.carteira) {
      case 'projetoAmerica':
        novoAtivo = await prisma.userProjetoAmerica.create({
          data: dadosEspecificos
        });
        break;
      case 'microCaps':
        novoAtivo = await prisma.userMicroCaps.create({
          data: dadosEspecificos
        });
        break;
      case 'smallCaps':
        novoAtivo = await prisma.userSmallCaps.create({
          data: dadosEspecificos
        });
        break;
      case 'dividendos':
        novoAtivo = await prisma.userDividendos.create({
          data: dadosEspecificos
        });
        break;
      case 'fiis':
        novoAtivo = await prisma.userFiis.create({
          data: dadosEspecificos
        });
        break;
      case 'dividendosInternacional':
        novoAtivo = await prisma.userDividendosInternacional.create({
          data: dadosEspecificos
        });
        break;
      case 'etfs':
        novoAtivo = await prisma.userEtfs.create({
          data: dadosEspecificos
        });
        break;
      case 'exteriorStocks':
        novoAtivo = await prisma.userExteriorStocks.create({
          data: dadosEspecificos
        });
        break;
      default:
        debugLog('❌ Carteira não implementada:', params.carteira);
        return NextResponse.json({ error: 'Carteira não implementada' }, { status: 400 });
    }
    
    debugLog('✅ Ativo criado:', novoAtivo.id);
    console.log(`✅ Ativo ${body.ticker} criado com sucesso na carteira ${params.carteira}`);
    
    return NextResponse.json(novoAtivo, { status: 201 });
    
  } catch (error) {
    debugLog('❌ Erro POST:', error);
    console.error(`❌ Erro POST carteira ${params.carteira}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}