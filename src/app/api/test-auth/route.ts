import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  console.log('Session completa:', session);
  return NextResponse.json(session);
}