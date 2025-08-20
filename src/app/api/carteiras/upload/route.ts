// src/app/api/carteiras/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('INICIO - Upload iniciado');
    
    // Verificar autenticação
    console.log('STEP 1 - Verificando auth...');
    const session = await auth();
    console.log('STEP 1.1 - Session resultado:', {
      exists: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });
    
    if (!session?.user?.id) {
      console.log('FALHA STEP 1 - Auth falhou');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    console.log('STEP 1 OK - Auth OK, User ID:', session.user.id);

    // Verificação: Usuário já enviou carteira?
    console.log('STEP 2 - Verificando carteira existente...');
    console.log('STEP 2.1 - Fazendo query para userId:', session.user.id);

    const carteiraExistente = await prisma.carteiraAnalise.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        status: true,
        dataEnvio: true,
        nomeArquivo: true,
        createdAt: true
      }
    });

    console.log('STEP 2.2 - Query resultado:', {
      found: !!carteiraExistente,
      carteiraId: carteiraExistente?.id,
      status: carteiraExistente?.status
    });

    if (carteiraExistente) {
      console.log('FALHA STEP 2 - Upload rejeitado - usuário já enviou carteira');
      return NextResponse.json({
        error: 'Você já enviou uma carteira para análise. Apenas uma análise por usuário é permitida.',
        carteiraExistente: {
          id: carteiraExistente.id,
          status: carteiraExistente.status.toLowerCase(),
          dataEnvio: carteiraExistente.dataEnvio,
          nomeArquivo: carteiraExistente.nomeArquivo
        }
      }, { status: 400 });
    }

    console.log('STEP 2 OK - Usuário pode enviar carteira - prosseguindo...');

    console.log('STEP 3 - Processando FormData...');
    const data = await request.formData();
    console.log('STEP 3.1 - FormData keys:', Array.from(data.keys()));
    
    const file: File | null = data.get('arquivo') as unknown as File;
    console.log('STEP 3.2 - File info:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });
    
    // Capturar dados do questionário
    console.log('STEP 4 - Processando questionário...');
    const questionarioData = data.get('questionario');
    console.log('STEP 4.1 - Questionario raw:', {
      hasQuestionario: !!questionarioData,
      type: typeof questionarioData,
      length: questionarioData?.toString()?.length
    });
    
    let questionario = null;
    
    if (questionarioData) {
      try {
        questionario = typeof questionarioData === 'string' 
          ? questionarioData 
          : questionarioData.toString();
        
        // Validar se é JSON válido
        const parsed = JSON.parse(questionario);
        console.log('STEP 4.2 - Questionário validado, keys:', Object.keys(parsed));
      } catch (error) {
        console.error('STEP 4.2 - Erro ao processar questionário:', error.message);
        questionario = null;
      }
    } else {
      console.log('STEP 4.2 - Nenhum questionário enviado');
    }

    console.log('STEP 5 - Validando arquivo...');
    
    if (!file) {
      console.log('FALHA STEP 5 - Nenhum arquivo enviado');
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      console.log('FALHA STEP 5 - Tipo de arquivo inválido:', file.name);
      return NextResponse.json({ 
        error: 'Apenas arquivos Excel (.xlsx, .xls) são aceitos' 
      }, { status: 400 });
    }

    // Validar tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      console.log('FALHA STEP 5 - Arquivo muito grande:', file.size);
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 10MB.' 
      }, { status: 400 });
    }

    console.log('STEP 5 OK - Arquivo validado');

    console.log('STEP 6 - Processando arquivo...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('STEP 6.1 - Buffer criado, tamanho:', buffer.length);

    // Salvar arquivo
    console.log('STEP 7 - Salvando arquivo...');
    const timestamp = Date.now();
    const fileName = `carteira_${session.user.id}_${timestamp}_${file.name}`;
    const filePath = join(process.cwd(), 'uploads', 'carteiras', fileName);
    console.log('STEP 7.1 - Caminho do arquivo:', filePath);
    
    await writeFile(filePath, buffer);
    console.log('STEP 7 OK - Arquivo salvo');

    // Processar Excel
    console.log('STEP 8 - Processando Excel...');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('STEP 8.1 - Workbook carregado, sheets:', workbook.SheetNames);
    
    const ativos = await processarCarteira(workbook);
    console.log('STEP 8.2 - Ativos processados:', ativos.length);
    
    if (ativos.length === 0) {
      console.log('FALHA STEP 8 - Nenhum ativo válido encontrado');
      return NextResponse.json({ 
        error: 'Nenhum ativo válido encontrado na planilha' 
      }, { status: 400 });
    }

    // Calcular totais
    console.log('STEP 9 - Calculando totais...');
    const valorTotal = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
    const quantidadeAtivos = ativos.length;
    console.log('STEP 9.1 - Totais calculados:', {
      valorTotal,
      quantidadeAtivos
    });

    // Salvar no banco COM questionário
    console.log('STEP 10 - Salvando no banco...');
    console.log('STEP 10.1 - Dados para salvar:', {
      userId: session.user.id,
      nomeArquivo: file.name,
      valorTotal,
      quantidadeAtivos,
      hasQuestionario: !!questionario,
      ativosCount: ativos.length
    });

    const carteira = await prisma.carteiraAnalise.create({
      data: {
        userId: session.user.id,
        nomeArquivo: file.name,
        arquivoUrl: `/uploads/carteiras/${fileName}`,
        valorTotal,
        quantidadeAtivos,
        questionario,
        ativos: {
          create: ativos.map(ativo => ({
            codigo: ativo.codigo,
            quantidade: ativo.quantidade,
            precoMedio: ativo.precoMedio,
            valorTotal: ativo.valorTotal,
            tipo: ativo.tipo,
            setor: ativo.setor
          }))
        }
      },
      include: {
        ativos: true
      }
    });

    console.log('STEP 10 OK - Carteira salva com ID:', carteira.id);
    console.log('STEP 10.1 - Questionário salvo:', !!questionario);

    // Notificar analistas
    console.log('STEP 11 - Notificando analistas...');
    try {
      await notificarAnalistas(carteira.id);
      console.log('STEP 11 OK - Analistas notificados');
    } catch (notifyError) {
      console.log('STEP 11 WARNING - Erro ao notificar analistas:', notifyError.message);
      // Não falhar o upload por conta disso
    }

    console.log('SUCESSO - Upload concluído com sucesso!');

    return NextResponse.json({
      success: true,
      carteiraId: carteira.id,
      message: 'Carteira enviada com sucesso!',
      resumo: {
        valorTotal,
        quantidadeAtivos,
        arquivoProcessado: true,
        questionarioIncluido: !!questionario
      }
    });

  } catch (error) {
    console.log('ERRO GERAL - Tipo:', error.constructor.name);
    console.log('ERRO GERAL - Message:', error.message);
    console.log('ERRO GERAL - Stack:', error.stack);
    
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}

async function processarCarteira(workbook: XLSX.WorkBook) {
  console.log('PROCESSAMENTO - Iniciando processamento da carteira');
  const ativos = [];
  
  // Processar primeira planilha (assumindo formato padrão)
  const sheetName = workbook.SheetNames[0];
  console.log('PROCESSAMENTO - Processando sheet:', sheetName);
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log('PROCESSAMENTO - Linhas encontradas:', data.length);

  for (const [index, row] of data.entries()) {
    try {
      // Validar e limpar dados
      const codigo = String(row['Código'] || row['codigo'] || '').trim().toUpperCase();
      const quantidade = Number(row['Quantidade'] || row['quantidade'] || 0);
      const precoMedio = Number(row['Preço Médio'] || row['preco_medio'] || 0);
      
      console.log(`PROCESSAMENTO - Linha ${index + 1}:`, {
        codigo,
        quantidade,
        precoMedio,
        valid: !(!codigo || quantidade <= 0 || precoMedio <= 0)
      });
      
      if (!codigo || quantidade <= 0 || precoMedio <= 0) {
        console.log(`PROCESSAMENTO - Linha ${index + 1} inválida, pulando`);
        continue; // Pular linhas inválidas
      }

      const valorTotal = quantidade * precoMedio;
      const tipo = determinarTipoAtivo(codigo);
      const setor = String(row['Setor'] || row['setor'] || '').trim();

      ativos.push({
        codigo,
        quantidade,
        precoMedio,
        valorTotal,
        tipo,
        setor: setor || null
      });
      
      console.log(`PROCESSAMENTO - Ativo ${codigo} adicionado`);
    } catch (rowError) {
      console.log(`PROCESSAMENTO - Erro na linha ${index + 1}:`, rowError.message);
    }
  }

  console.log('PROCESSAMENTO - Concluído, total de ativos:', ativos.length);
  return ativos;
}

function determinarTipoAtivo(codigo: string): string {
  if (codigo.endsWith('11')) return 'FII';
  if (codigo.endsWith('3') || codigo.endsWith('4')) return 'ACAO';
  if (codigo.includes('ETF')) return 'ETF';
  return 'OUTRO';
}

async function notificarAnalistas(carteiraId: string) {
  console.log(`NOTIFICACAO - Nova carteira para análise: ${carteiraId}`);
}