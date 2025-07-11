import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    console.log('=== DEBUG AUTH ROUTE ===');
    console.log('Session:', session);
    console.log('========================');
    
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    
    return NextResponse.json({
      success: true,
      user: session.user
    });
    
  } catch (error) {
    console.error('Erro na auth:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}