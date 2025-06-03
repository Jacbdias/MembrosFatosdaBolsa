import { NextRequest, NextResponse } from 'next/server';

// 🛡️ CONFIGURAÇÃO PARA VERCEL - EVITA ERRO DE STATIC GENERATION
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// 🔧 FUNÇÕES AUXILIARES
function getTrendDirection(change: number): 'up' | 'down' {
  return change >= 0 ? 'up' : 'down';
}

function isMarketOpen(): boolean {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const day = nyTime.getDay(); // 0 = domingo, 6 = sábado
  const hour = nyTime.getHours();
  const minute = nyTime.getMinutes();
  const totalMinutes = hour * 60 + minute;
  
  // Mercado aberto de segunda a sexta, 9:30 às 16:00 (hora de NY)
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = totalMinutes >= (9 * 60 + 30) && totalMinutes <= (16 * 60);
  
  return isWeekday && isMarketHours;
}

// 🌎 FUNÇÃO PARA BUSCAR DADOS REAIS (você pode integrar com APIs externas aqui)
async function fetchRealMarketData() {
  try {
    // Aqui você pode integrar com APIs reais como:
    // - Yahoo Finance
    // - Alpha Vantage  
    // - IEX Cloud
    // - Polygon.io
    
    // Por enquanto, vamos simular dados dinâmicos realistas
    const baseValues = {
      sp500: 5845.32,
      nasdaq: 19345.67,
      dow: 42156.89
    };
    
    // Adicionar variação al
