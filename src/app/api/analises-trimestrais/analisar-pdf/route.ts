import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Prompt para análises trimestrais
const PROMPT_ANALISE_TRIMESTRAL = `
Você é um analista financeiro especialista em análise fundamentalista de empresas brasileiras.

Analise o texto do relatório trimestral fornecido e extraia as seguintes informações em formato JSON:

{
  "empresa": "Nome da empresa",
  "ticker": "Código da ação (ex: VALE3)",
  "trimestre": "Período (ex: 3T24)",
  "dataReferencia": "Data de referência",
  
  "dadosFinanceiros": {
    "receita": {
      "valor": número em milhões,
      "variacaoAA": variação ano/ano em %,
      "variacaoTT": variação trimestre/trimestre em %
    },
    "ebitda": {
      "valor": número em milhões,
      "variacaoAA": variação ano/ano em %,
      "variacaoTT": variação trimestre/trimestre em %,
      "margem": margem em %
    },
    "lucroLiquido": {
      "valor": número em milhões,
      "variacaoAA": variação ano/ano em %,
      "variacaoTT": variação trimestre/trimestre em %,
      "margem": margem em %
    },
    "roe": {
      "valor": valor em %,
      "variacaoAA": variação em pontos percentuais
    },
    "outrasMetricas": [
      {
        "nome": "Nome da métrica",
        "valor": "Valor formatado",
        "variacao": "Variação formatada"
      }
    ]
  },
  
  "relatorioGerado": {
    "titulo": "Título profissional da análise",
    "resumoExecutivo": "Resumo de 2-3 parágrafos sobre os principais resultados",
    "destaques": [
      "Lista de 4-6 pontos positivos principais"
    ],
    "pontosAtencao": [
      "Lista de 4-6 pontos de atenção ou riscos"
    ],
    "conclusao": "Conclusão detalhada em 3-4 parágrafos sobre a situação da empresa, perspectivas e posicionamento competitivo",
    "recomendacao": "COMPRA" | "MANTER" | "VENDA",
    "precoAlvo": número (preço alvo em R$)
  }
}

INSTRUÇÕES ESPECÍFICAS:
- Use linguagem profissional de análise financeira
- Identifique métricas específicas do setor (ex: produção para mineradoras, NIM para bancos)
- Analise variações e contextualize com o cenário macroeconômico
- Seja crítico e equilibrado na análise
- Para recomendação, considere múltiplos, crescimento e cenário setorial
- Preço alvo deve ser baseado em múltiplos comparáveis ou DCF implícito

Texto do relatório:
`;

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Iniciando análise com OpenAI...');
    
    const { textoPDF } = await request.json();
    
    if (!textoPDF) {
      return NextResponse.json(
        { error: 'Texto do PDF é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Chave da OpenAI não configurada');
      return NextResponse.json(
        { error: 'Serviço de IA temporariamente indisponível' },
        { status: 500 }
      );
    }
    
    console.log('📊 Enviando texto para OpenAI...');
    console.log(`📄 Tamanho do texto: ${textoPDF.length} caracteres`);
    
    // Truncar texto se muito grande (OpenAI tem limite de tokens)
    let textoParaAnalise = textoPDF;
    if (textoPDF.length > 15000) {
      console.log('✂️ Truncando texto devido ao tamanho...');
      textoParaAnalise = textoPDF.substring(0, 15000) + "\n\n[TEXTO TRUNCADO DEVIDO AO TAMANHO]";
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um analista financeiro especialista em análise fundamentalista. Retorne APENAS um JSON válido, sem comentários adicionais."
        },
        {
          role: "user",
          content: PROMPT_ANALISE_TRIMESTRAL + textoParaAnalise
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const respostaIA = completion.choices[0].message.content;
    console.log('✅ Resposta recebida da OpenAI');
    
    if (!respostaIA) {
      throw new Error('Resposta vazia da OpenAI');
    }

    let analiseJSON;
    try {
      analiseJSON = JSON.parse(respostaIA);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da OpenAI:', parseError);
      throw new Error('Resposta da IA em formato inválido');
    }

    console.log('📋 Análise parseada com sucesso');

    const resultado = {
      empresa: analiseJSON.empresa,
      ticker: analiseJSON.ticker,
      trimestre: analiseJSON.trimestre,
      dataReferencia: analiseJSON.dataReferencia,
      dadosFinanceiros: analiseJSON.dadosFinanceiros,
      relatorioGerado: analiseJSON.relatorioGerado,
      contextoMercado: `Análise gerada via OpenAI GPT-4o em ${new Date().toLocaleString('pt-BR')}`,
      outlook: "Baseado em dados do relatório trimestral processado",
      success: true
    };

    console.log('🎯 Análise OpenAI finalizada com sucesso');
    return NextResponse.json(resultado, { status: 200 });

  } catch (error) {
    console.error('❌ Erro na análise OpenAI:', error);
    
    let errorMessage = 'Erro interno do servidor';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Erro de autenticação com IA';
        statusCode = 401;
      } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
        errorMessage = 'Limite de uso da IA atingido. Tente novamente em alguns minutos.';
        statusCode = 429;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout na análise da IA. Tente novamente.';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        success: false,
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: statusCode }
    );
  }
}