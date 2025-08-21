// ====================================================================
// src/app/api/answers/[id]/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Marcar/desmarcar resposta como FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || user.plan !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const answer = await prisma.answer.findUnique({
      where: { id: params.id },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true
          }
        }
      }
    });

    if (!answer) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 });
    }

    const body = await request.json();
    const { isFaq, faqTitle, faqOrder = 0 } = body;

    // Validações
    if (typeof isFaq !== 'boolean') {
      return NextResponse.json({ 
        error: 'isFaq must be a boolean' 
      }, { status: 400 });
    }

    if (isFaq && faqTitle && typeof faqTitle !== 'string') {
      return NextResponse.json({ 
        error: 'faqTitle must be a string' 
      }, { status: 400 });
    }

    if (typeof faqOrder !== 'number' || faqOrder < 0) {
      return NextResponse.json({ 
        error: 'faqOrder must be a non-negative number' 
      }, { status: 400 });
    }

    // Se está marcando como FAQ, gerar um título se não fornecido
    let finalFaqTitle = faqTitle;
    if (isFaq && !finalFaqTitle) {
      finalFaqTitle = answer.question.title;
    }

    // Verificar se já existe FAQ com mesmo título na categoria (se marcando como FAQ)
    if (isFaq && finalFaqTitle) {
      const existingFaq = await prisma.answer.findFirst({
        where: {
          isFaq: true,
          faqTitle: finalFaqTitle.trim(),
          question: {
            category: answer.question.category
          },
          id: { not: params.id } // Excluir a resposta atual
        }
      });

      if (existingFaq) {
        return NextResponse.json({ 
          error: 'A FAQ with this title already exists in this category' 
        }, { status: 400 });
      }
    }

    const updatedAnswer = await prisma.answer.update({
      where: { id: params.id },
      data: {
        isFaq,
        faqTitle: isFaq && finalFaqTitle ? finalFaqTitle.trim() : null,
        faqOrder: isFaq ? faqOrder : 0
      },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true
          }
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json({ 
      answer: updatedAnswer,
      message: isFaq ? 'Resposta adicionada ao FAQ' : 'Resposta removida do FAQ'
    });

  } catch (error) {
    console.error('Error updating FAQ status:', error);
    
    // Tratamento específico de erros do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Answer not found' 
        }, { status: 404 });
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ====================================================================
// src/app/api/faq/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Categorias válidas
const VALID_CATEGORIES = [
  'SMALL_CAPS',
  'MICRO_CAPS', 
  'DIVIDENDOS',
  'FIIS',
  'INTERNACIONAL_ETFS',
  'INTERNACIONAL_STOCKS',
  'INTERNACIONAL_DIVIDENDOS',
  'PROJETO_AMERICA',
  'GERAL',
  'TECNICO',
  'FISCAL'
];

// GET - Listar FAQs públicas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Máximo 100

    // Validar categoria se fornecida
    if (category && category !== 'ALL' && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ 
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` 
      }, { status: 400 });
    }

    // Validar page e limit
    if (page < 1) {
      return NextResponse.json({ 
        error: 'Page must be greater than 0' 
      }, { status: 400 });
    }

    if (limit < 1) {
      return NextResponse.json({ 
        error: 'Limit must be greater than 0' 
      }, { status: 400 });
    }

    let whereClause: any = {
      isFaq: true
    };

    if (category && category !== 'ALL') {
      whereClause.question = {
        category: category
      };
    }

    // Adicionar busca por texto se fornecida
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      whereClause.OR = [
        {
          faqTitle: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          content: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          question: {
            title: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    const faqs = await prisma.answer.findMany({
      where: whereClause,
      include: {
        question: {
          select: {
            id: true,
            title: true,
            content: true,
            category: true,
            createdAt: true
          }
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { faqOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    });

    const total = await prisma.answer.count({
      where: whereClause
    });

    // Agrupar por categoria para melhor organização
    const groupedFaqs = faqs.reduce((acc, faq) => {
      const category = faq.question.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(faq);
      return acc;
    }, {} as Record<string, typeof faqs>);

    return NextResponse.json({
      faqs,
      groupedFaqs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      categories: VALID_CATEGORIES
    });

  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ====================================================================
// src/app/api/response-templates/[id]/use/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Incrementar uso do template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userEmail = request.headers.get('X-User-Email');
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!userEmail || !token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user || user.plan !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verificar se template existe e está ativo
    const template = await prisma.responseTemplate.findUnique({
      where: { id: params.id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!template.isActive) {
      return NextResponse.json({ 
        error: 'Cannot use inactive template' 
      }, { status: 400 });
    }

    const updatedTemplate = await prisma.responseTemplate.update({
      where: { id: params.id },
      data: {
        usageCount: {
          increment: 1
        }
      },
      include: {
        creator: { // ✅ CORRETO: usar 'creator' não 'createdBy'
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      template: updatedTemplate,
      message: 'Template usage recorded'
    });

  } catch (error) {
    console.error('Error recording template usage:', error);
    
    // Tratamento específico de erros do Prisma
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      if (prismaError.code === 'P2025') {
        return NextResponse.json({ 
          error: 'Template not found' 
        }, { status: 404 });
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}