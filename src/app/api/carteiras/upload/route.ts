// src/app/api/carteiras/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // 🔧 CORRIGIDO: Usar a mesma estratégia de autenticação que funciona
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'Usuário não autenticado' 
      }, { status: 401 });
    }

    // Buscar usuário no banco pelo email
    const user = await prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    console.log('UPLOAD: Tentativa de upload de carteira por:', user.id);

    // VERIFICACAO: Usuário já enviou carteira?
    const carteiraExistente = await prisma.carteiraAnalise.findFirst({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        status: true,
        dataEnvio: true,
        nomeArquivo: true,
        createdAt: true
      }
    });

    if (carteiraExistente) {
      console.log('REJEITADO: Upload rejeitado - usuário já enviou carteira');
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

    console.log('SUCESSO: Usuário pode enviar carteira - prosseguindo...');

    const data = await request.formData();
    const file: File | null = data.get('arquivo') as unknown as File;
    
    // NOVO: Capturar dados do questionário
    const questionarioData = data.get('questionario');
    let questionario = null;
    
    if (questionarioData) {
      try {
        questionario = typeof questionarioData === 'string' 
          ? questionarioData 
          : questionarioData.toString();
        
        // Validar se é JSON válido
        JSON.parse(questionario);
        console.log('SUCESSO: Questionário recebido e validado');
      } catch (error) {
        console.error('ERRO: Erro ao processar questionário:', error);
        questionario = null;
      }
    } else {
      console.log('AVISO: Nenhum questionário enviado');
    }

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ 
        error: 'Apenas arquivos Excel (.xlsx, .xls) são aceitos' 
      }, { status: 400 });
    }

    // Validar tamanho (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 10MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salvar arquivo
    const timestamp = Date.now();
    const fileName = `carteira_${user.id}_${timestamp}_${file.name}`;
    const filePath = join(process.cwd(), 'uploads', 'carteiras', fileName);
    
    await writeFile(filePath, buffer);

    // Processar Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const ativos = await processarCarteira(workbook);

    // Calcular totais
    const valorTotal = ativos.reduce((sum, ativo) => sum + ativo.valorTotal, 0);
    const quantidadeAtivos = ativos.length;

    // NOVO: Salvar no banco COM questionário
    const carteira = await prisma.carteiraAnalise.create({
      data: {
        userId: user.id, // CORRIGIDO: Usar user.id em vez de session.user.id
        nomeArquivo: file.name,
        arquivoUrl: `/uploads/carteiras/${fileName}`,
        valorTotal,
        quantidadeAtivos,
        questionario, // NOVO: INCLUIR O QUESTIONÁRIO
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

    console.log('SUCESSO: Carteira salva com ID:', carteira.id);
    console.log('INFO: Questionário salvo:', !!questionario);

    // Notificar analistas (implementar webhook/email)
    await notificarAnalistas(carteira.id);

    return NextResponse.json({
      success: true,
      carteiraId: carteira.id,
      message: 'Carteira enviada com sucesso!',
      resumo: {
        valorTotal,
        quantidadeAtivos,
        arquivoProcessado: true,
        questionarioIncluido: !!questionario // NOVO: INFORMAR SE QUESTIONÁRIO FOI SALVO
      }
    });

  } catch (error) {
    console.error('Erro no upload da carteira:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message
    }, { status: 500 });
  }
}

async function processarCarteira(workbook: XLSX.WorkBook) {
  const ativos = [];
  
  // Processar primeira planilha (assumindo formato padrão)
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  for (const row of data) {
    // Validar e limpar dados
    const codigo = String(row['Código'] || row['codigo'] || '').trim().toUpperCase();
    const quantidade = Number(row['Quantidade'] || row['quantidade'] || 0);
    const precoMedio = Number(row['Preço Médio'] || row['preco_medio'] || 0);
    
    if (!codigo || quantidade <= 0 || precoMedio <= 0) {
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
  }

  return ativos;
}

function determinarTipoAtivo(codigo: string): string {
  if (codigo.endsWith('11')) return 'FII';
  if (codigo.endsWith('3') || codigo.endsWith('4')) return 'ACAO';
  if (codigo.includes('ETF')) return 'ETF';
  return 'OUTRO';
}

async function notificarAnalistas(carteiraId: string) {
  // Implementar notificação para analistas
  // Pode ser via webhook, email, push notification, etc.
  console.log(`Nova carteira para análise: ${carteiraId}`);
  
  // Exemplo: webhook para Slack/Discord
  // await fetch(process.env.WEBHOOK_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     text: `Nova carteira enviada para análise: ${carteiraId}`
  //   })
  // });
}