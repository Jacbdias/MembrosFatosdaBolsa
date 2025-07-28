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
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'smallCaps':
          ativos = await prisma.userSmallCaps.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'dividendos':
          ativos = await prisma.userDividendos.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'fiis':
          ativos = await prisma.userFiis.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'dividendosInternacional':
          ativos = await prisma.userDividendosInternacional.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'etfs':
          ativos = await prisma.userEtfs.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'projetoAmerica':
          ativos = await prisma.userProjetoAmerica.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
          });
          break;
        case 'exteriorStocks':
          ativos = await prisma.userExteriorStocks.findMany({
            where: { userId: user.id },
            orderBy: { editadoEm: 'asc' }
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

// 🔍 PUT - EDITAR ATIVO
export async function PUT(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  try {
    debugLog('✏️ INICIO PUT - Carteira:', params.carteira);
    
    // Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Parse do body
    const body = await request.json();
    debugLog('✏️ Body recebido:', body);
    
    const { id, ...dadosAtualizacao } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    // Preparar dados para atualização
    const dadosUpdate: any = {
      ticker: dadosAtualizacao.ticker?.toUpperCase(),
      setor: dadosAtualizacao.setor,
      dataEntrada: dadosAtualizacao.dataEntrada,
      precoEntrada: parseFloat(dadosAtualizacao.precoEntrada),
      editadoEm: new Date()
    };
    
    // Campos opcionais
    if (dadosAtualizacao.precoTeto) dadosUpdate.precoTeto = parseFloat(dadosAtualizacao.precoTeto);
    if (dadosAtualizacao.precoTetoBDR) dadosUpdate.precoTetoBDR = parseFloat(dadosAtualizacao.precoTetoBDR);
    if (dadosAtualizacao.posicaoEncerrada !== undefined) dadosUpdate.posicaoEncerrada = dadosAtualizacao.posicaoEncerrada;
    if (dadosAtualizacao.dataSaida) dadosUpdate.dataSaida = dadosAtualizacao.dataSaida;
    if (dadosAtualizacao.precoSaida) dadosUpdate.precoSaida = parseFloat(dadosAtualizacao.precoSaida);
    if (dadosAtualizacao.motivoEncerramento) dadosUpdate.motivoEncerramento = dadosAtualizacao.motivoEncerramento;
    
    debugLog('✏️ Dados para atualizar:', dadosUpdate);
    
    let ativoAtualizado;
    
    switch (params.carteira) {
      case 'smallCaps':
        ativoAtualizado = await prisma.userSmallCaps.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'microCaps':
        ativoAtualizado = await prisma.userMicroCaps.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'dividendos':
        ativoAtualizado = await prisma.userDividendos.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'fiis':
        ativoAtualizado = await prisma.userFiis.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'dividendosInternacional':
        ativoAtualizado = await prisma.userDividendosInternacional.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'etfs':
        ativoAtualizado = await prisma.userEtfs.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'projetoAmerica':
        ativoAtualizado = await prisma.userProjetoAmerica.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      case 'exteriorStocks':
        ativoAtualizado = await prisma.userExteriorStocks.update({
          where: { 
            id: id,
            userId: user.id 
          },
          data: dadosUpdate
        });
        break;
      default:
        return NextResponse.json({ error: 'Carteira não implementada' }, { status: 400 });
    }
    
    debugLog('✅ Ativo atualizado:', ativoAtualizado.id);
    console.log(`✅ Ativo ${dadosUpdate.ticker} atualizado na carteira ${params.carteira}`);
    
    return NextResponse.json(ativoAtualizado);
    
  } catch (error) {
    debugLog('❌ Erro PUT:', error);
    console.error(`❌ Erro PUT carteira ${params.carteira}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// 🔍 DELETE - REMOVER ATIVO
export async function DELETE(
  request: NextRequest,
  { params }: { params: { carteira: string } }
) {
  try {
    debugLog('🗑️ INICIO DELETE - Carteira:', params.carteira);
    
    // Autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Parse do body
    const body = await request.json();
    debugLog('🗑️ Body recebido:', body);
    
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }
    
    debugLog('🗑️ Removendo ativo ID:', id);
    
    let ativoRemovido;
    
    switch (params.carteira) {
      case 'smallCaps':
        ativoRemovido = await prisma.userSmallCaps.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'microCaps':
        ativoRemovido = await prisma.userMicroCaps.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'dividendos':
        ativoRemovido = await prisma.userDividendos.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'fiis':
        ativoRemovido = await prisma.userFiis.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'dividendosInternacional':
        ativoRemovido = await prisma.userDividendosInternacional.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'etfs':
        ativoRemovido = await prisma.userEtfs.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'projetoAmerica':
        ativoRemovido = await prisma.userProjetoAmerica.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      case 'exteriorStocks':
        ativoRemovido = await prisma.userExteriorStocks.delete({
          where: { 
            id: id,
            userId: user.id 
          }
        });
        break;
      default:
        return NextResponse.json({ error: 'Carteira não implementada' }, { status: 400 });
    }
    
    debugLog('✅ Ativo removido:', ativoRemovido.id);
    console.log(`✅ Ativo ${ativoRemovido.ticker} removido da carteira ${params.carteira}`);
    
    return NextResponse.json({ success: true, ativo: ativoRemovido });
    
  } catch (error) {
    debugLog('❌ Erro DELETE:', error);
    console.error(`❌ Erro DELETE carteira ${params.carteira}:`, error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}