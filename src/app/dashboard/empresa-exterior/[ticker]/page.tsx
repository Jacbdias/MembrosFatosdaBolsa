'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { Globe as GlobeIcon } from '@phosphor-icons/react/dist/ssr/Globe';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Target as TargetIcon } from '@phosphor-icons/react/dist/ssr/Target';
import { Warning as WarningIcon } from '@phosphor-icons/react/dist/ssr/Warning';

// 🎯 VERSÃO MELHORADA - USANDO ESTRATÉGIA DA TABELA + RETRY LOGIC
interface DadosFinanceirosExterior {
  precoAtual: number;
  variacao: number;
  variacaoPercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
  moeda: string;
  precoEmUSD?: number;
  cotacaoUSD?: number;
  // ✅ Novos campos baseados na resposta real da BRAPI
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketOpen?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  longName?: string;
  shortName?: string;
}

// 🚀 HOOK PRINCIPAL - REESCRITO COM BASE NA TABELA
function useEmpresaExteriorData(ticker: string, nomeEmpresa: string, moeda: string = 'USD') {
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceirosExterior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>('');

  // 🎯 FUNÇÃO DE BUSCA - MÉTODO DA TABELA EXATO
  const fetchRealQuote = React.useCallback(async () => {
    // ✅ NÃO BUSCAR SE TICKER ESTIVER VAZIO
    if (!ticker || ticker.length === 0) {
      console.log('⚠️ Ticker vazio, aguardando...');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🌐 Buscando ${ticker} usando método da tabela...`);

      // ✅ EXATAMENTE COMO A TABELA FAZ
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const brapiUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`;
      
      console.log(`📡 URL BRAPI (tabela): ${brapiUrl}`);
      
      const response = await fetch(brapiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'International-Dividends-App'
        }
      });

      console.log(`📊 BRAPI Response Status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Erro BRAPI: ${response.status}`);
      }

      const brapiData = await response.json();
      console.log(`✅ BRAPI Response para ${ticker}:`, brapiData);

      if (!brapiData.results || brapiData.results.length === 0) {
        throw new Error(`Nenhum resultado encontrado na BRAPI para ${ticker}`);
      }

      // ✅ MESMA LÓGICA DA TABELA
      const brapiQuote = brapiData.results.find((quote: any) => 
        quote.symbol === ticker || quote.symbol === `${ticker}.SA`
      );

      if (brapiQuote && brapiQuote.regularMarketPrice) {
        console.log(`🎯 ${ticker} encontrado na BRAPI:`, {
          symbol: brapiQuote.symbol,
          price: brapiQuote.regularMarketPrice,
          change: brapiQuote.regularMarketChange,
          currency: brapiQuote.currency
        });

        // ✅ PROCESSAR DADOS COM CAMPOS REAIS DA BRAPI
        const dadosProcessados: DadosFinanceirosExterior = {
          precoAtual: brapiQuote.regularMarketPrice,
          variacao: brapiQuote.regularMarketChange || 0,
          variacaoPercent: brapiQuote.regularMarketChangePercent || 0,
          volume: brapiQuote.regularMarketVolume || 0,
          marketCap: brapiQuote.marketCap,
          pe: brapiQuote.priceEarnings,
          dividendYield: (brapiQuote.dividendYield || 0) * 100,
          moeda: brapiQuote.currency || moeda,
          precoEmUSD: brapiQuote.currency === 'USD' ? brapiQuote.regularMarketPrice : 
                     (brapiQuote.regularMarketPrice * (brapiQuote.exchangeRate || 1)),
          cotacaoUSD: brapiQuote.currency === 'USD' ? 1 : brapiQuote.exchangeRate,
          // ✅ Novos campos da resposta real
          regularMarketDayHigh: brapiQuote.regularMarketDayHigh,
          regularMarketDayLow: brapiQuote.regularMarketDayLow,
          regularMarketOpen: brapiQuote.regularMarketOpen,
          fiftyTwoWeekHigh: brapiQuote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: brapiQuote.fiftyTwoWeekLow,
          longName: brapiQuote.longName,
          shortName: brapiQuote.shortName
        };

        console.log(`✅ Dados processados (BRAPI real):`, dadosProcessados);
        setDadosFinanceiros(dadosProcessados);
        setUltimaAtualizacao(`BRAPI Real-time: ${new Date().toLocaleString('pt-BR')}`);
        setError(null);
        
        // Cache
        try {
          localStorage.setItem(`cache_exterior_${ticker}`, JSON.stringify({
            data: dadosProcessados,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.log('⚠️ Cache error:', e);
        }
        
        return;
      } else {
        console.log(`⚠️ ${ticker}: não encontrado na BRAPI ou sem preço válido`);
        throw new Error(`${ticker} não encontrado na BRAPI ou sem preço válido`);
      }

    } catch (brapiError) {
      console.log(`❌ BRAPI falhou para ${ticker}:`, brapiError);
      
      // ✅ FALLBACK: EXATAMENTE COMO A TABELA FAZ
      console.log(`🎲 Usando fallback para ${ticker} (igual à tabela)`);
      
      const fallbackPrices: Record<string, { price: number, change: number, pe?: number, dy?: number, open?: number, dayHigh?: number, dayLow?: number, week52High?: number, week52Low?: number }> = {
        'TSLA': { price: 248.50, change: -8.40, pe: 62.5, dy: 0, open: 250.00, dayHigh: 252.30, dayLow: 245.60, week52High: 415.00, week52Low: 138.80 },
        'AAPL': { price: 189.50, change: 2.85, pe: 29.2, dy: 0.5, open: 187.20, dayHigh: 191.30, dayLow: 186.90, week52High: 260.10, week52Low: 169.21 },
        'MSFT': { price: 365.20, change: -1.25, pe: 32.1, dy: 0.75, open: 367.00, dayHigh: 368.50, dayLow: 364.10, week52High: 468.35, week52Low: 309.45 },
        'GOOGL': { price: 2850.00, change: 15.30, pe: 25.8, dy: 0, open: 2835.00, dayHigh: 2865.00, dayLow: 2832.00, week52High: 3055.00, week52Low: 2193.62 },
        'AMZN': { price: 3200.00, change: 25.50, pe: 45.2, dy: 0, open: 3180.00, dayHigh: 3215.00, dayLow: 3175.00, week52High: 3773.08, week52Low: 2671.45 },
        'META': { price: 485.20, change: 12.30, pe: 24.8, dy: 0, open: 478.00, dayHigh: 487.60, dayLow: 476.20, week52High: 542.81, week52Low: 279.49 },
        'NVDA': { price: 875.40, change: -15.60, pe: 65.2, dy: 0.1, open: 890.00, dayHigh: 892.50, dayLow: 873.20, week52High: 1140.00, week52Low: 390.40 }
      };

      const fallbackData = fallbackPrices[ticker] || { 
        price: 125.75, 
        change: 1.25, 
        pe: 20.0, 
        dy: 2.0,
        open: 124.50,
        dayHigh: 127.30,
        dayLow: 124.10,
        week52High: 150.00,
        week52Low: 95.50
      };

      const dadosProcessados: DadosFinanceirosExterior = {
        precoAtual: fallbackData.price,
        variacao: fallbackData.change,
        variacaoPercent: (fallbackData.change / (fallbackData.price - fallbackData.change)) * 100,
        volume: 5000000,
        marketCap: fallbackData.price * 1000000000,
        pe: fallbackData.pe,
        dividendYield: fallbackData.dy || 0,
        moeda: moeda,
        precoEmUSD: moeda === 'USD' ? fallbackData.price : fallbackData.price * 1.12,
        cotacaoUSD: moeda === 'USD' ? 1 : 1.12,
        regularMarketOpen: fallbackData.open,
        regularMarketDayHigh: fallbackData.dayHigh,
        regularMarketDayLow: fallbackData.dayLow,
        fiftyTwoWeekHigh: fallbackData.week52High,
        fiftyTwoWeekLow: fallbackData.week52Low,
        longName: nomeEmpresa,
        shortName: ticker
      };

      console.log(`🎲 Dados fallback aplicados para ${ticker}:`, dadosProcessados);
      setDadosFinanceiros(dadosProcessados);
      setUltimaAtualizacao(`Dados de referência: ${new Date().toLocaleString('pt-BR')}`);
      setError(`Usando dados de referência para ${ticker}`);
    } finally {
      setLoading(false);
    }
  }, [ticker, moeda, nomeEmpresa]); // ✅ ADICIONADO nomeEmpresa nas dependências

  useEffect(() => {
    // ✅ SÓ BUSCAR SE TICKER EXISTIR
    if (ticker && ticker.length > 0) {
      fetchRealQuote();
      
      // ✅ AUTO-REFRESH COMO A TABELA (10 minutos)
      const interval = setInterval(fetchRealQuote, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchRealQuote, ticker]); // ✅ ADICIONADO ticker como dependência

  return {
    dadosFinanceiros,
    loading,
    error,
    ultimaAtualizacao,
    refresh: fetchRealQuote,
  };
}

// ✅ COMPONENTE PRINCIPAL
export default function EmpresaExteriorDetalhes() {
  // 🎯 PEGAR TICKER DA URL DINÂMICAMENTE
  const [ticker, setTicker] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  
  // ✅ Extrair ticker da URL atual
  useEffect(() => {
    const path = window.location.pathname;
    const tickerFromUrl = path.split('/').pop() || '';
    setTicker(tickerFromUrl.toUpperCase());
    
    // Mapear nomes das empresas
    const empresasMap: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'BAC': 'Bank of America Corp.',
      'VZ': 'Verizon Communications Inc.',
      'OXY': 'Occidental Petroleum Corporation',
      'O': 'Realty Income Corporation',
      'ADC': 'Agree Realty Corporation',
      'AVB': 'AvalonBay Communities Inc.',
      'STAG': 'Stag Industrial Inc.'
    };
    
    setNomeEmpresa(empresasMap[tickerFromUrl.toUpperCase()] || `${tickerFromUrl.toUpperCase()} Corporation`);
  }, []);

  const moeda = 'USD';

  const { dadosFinanceiros, loading, error, ultimaAtualizacao, refresh } = useEmpresaExteriorData(ticker, nomeEmpresa, moeda);

  if (loading || !ticker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">🌎 Carregando dados de {ticker || 'ações internacionais'}...</p>
              <p className="text-slate-400 text-sm mt-2">Método da tabela em execução</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = dadosFinanceiros ? dadosFinanceiros.variacao >= 0 : false;
  const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
  const trendBg = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header com breadcrumb */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeftIcon size={20} />
              <span>Voltar</span>
            </button>
            <div className="h-6 w-px bg-slate-300"></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {dadosFinanceiros?.longName || nomeEmpresa}
              </h1>
              <p className="text-slate-600">
                {ticker} • {moeda} • {dadosFinanceiros?.shortName || 'Carregando...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Status da API */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <WarningIcon size={20} className="text-yellow-600" />
              <p className="text-yellow-800 font-medium">Status da API</p>
            </div>
            <p className="text-yellow-700 mt-1">{error}</p>
            <button 
              onClick={refresh}
              className="mt-2 text-yellow-800 underline hover:no-underline text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Card Principal de Preço */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">{ticker}</h2>
                <p className="text-slate-300">
                  {dadosFinanceiros?.shortName || nomeEmpresa}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {dadosFinanceiros ? `$${dadosFinanceiros.precoAtual.toFixed(2)}` : 'N/A'}
                </div>
                {dadosFinanceiros && (
                  <div className={`flex items-center justify-end space-x-2 mt-2 ${trendColor}`}>
                    <TrendIcon size={20} />
                    <span className="font-semibold">
                      {dadosFinanceiros.variacao > 0 ? '+' : ''}
                      {dadosFinanceiros.variacao.toFixed(2)} 
                      ({dadosFinanceiros.variacaoPercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métricas Completas - FORÇAR RENDERIZAÇÃO PARA DEBUG */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">🔧 TESTE - Layout Rico Carregando...</h3>
            
            {dadosFinanceiros ? (
              <>
                {/* Range do Dia */}
                {dadosFinanceiros.regularMarketDayHigh && dadosFinanceiros.regularMarketDayLow ? (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-slate-600 mb-2">Range do Dia</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-900 font-medium">
                        ${dadosFinanceiros.regularMarketDayLow.toFixed(2)}
                      </span>
                      <div className="flex-1 mx-4 h-2 bg-slate-200 rounded-full relative">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${((dadosFinanceiros.precoAtual - dadosFinanceiros.regularMarketDayLow) / 
                                     (dadosFinanceiros.regularMarketDayHigh - dadosFinanceiros.regularMarketDayLow)) * 100}%`
                          }}
                        />
                        <div 
                          className="absolute top-0 w-1 h-full bg-slate-800 rounded-full"
                          style={{
                            left: `${((dadosFinanceiros.precoAtual - dadosFinanceiros.regularMarketDayLow) / 
                                     (dadosFinanceiros.regularMarketDayHigh - dadosFinanceiros.regularMarketDayLow)) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-slate-900 font-medium">
                        ${dadosFinanceiros.regularMarketDayHigh.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-red-50 rounded-lg">
                    <p className="text-red-600">⚠️ Range do dia não disponível</p>
                    <p className="text-xs text-red-500">
                      High: {dadosFinanceiros.regularMarketDayHigh || 'null'} | 
                      Low: {dadosFinanceiros.regularMarketDayLow || 'null'}
                    </p>
                  </div>
                )}

                {/* Grid de Métricas - SEMPRE RENDERIZAR */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                      <TrendUpIcon size={24} className="text-blue-600" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Volume</p>
                    <p className="text-slate-900 text-lg font-bold">
                      {(dadosFinanceiros.volume / 1000000).toFixed(1)}M
                    </p>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                      <CurrencyDollarIcon size={24} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Abertura</p>
                    <p className="text-slate-900 text-lg font-bold">
                      ${dadosFinanceiros.regularMarketOpen ? dadosFinanceiros.regularMarketOpen.toFixed(2) : 'N/A'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                      <ArrowUpIcon size={24} className="text-purple-600" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Máx. 52s</p>
                    <p className="text-slate-900 text-lg font-bold">
                      ${dadosFinanceiros.fiftyTwoWeekHigh ? dadosFinanceiros.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}
                    </p>
                  </div>

                  <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-3">
                      <ArrowDownIcon size={24} className="text-red-600" />
                    </div>
                    <p className="text-slate-600 text-sm font-medium">Mín. 52s</p>
                    <p className="text-slate-900 text-lg font-bold">
                      ${dadosFinanceiros.fiftyTwoWeekLow ? dadosFinanceiros.fiftyTwoWeekLow.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Métricas Financeiras Adicionais - SEMPRE RENDERIZAR */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicadores Financeiros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                        <GlobeIcon size={24} className="text-green-600" />
                      </div>
                      <p className="text-slate-600 text-sm font-medium">Market Cap</p>
                      <p className="text-slate-900 text-xl font-bold">
                        {dadosFinanceiros.marketCap ? 
                          `${(dadosFinanceiros.marketCap / 1000000000).toFixed(1)}B` : 
                          'N/A'
                        }
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                        <TargetIcon size={24} className="text-purple-600" />
                      </div>
                      <p className="text-slate-600 text-sm font-medium">P/E Ratio</p>
                      <p className="text-slate-900 text-xl font-bold">
                        {dadosFinanceiros.pe ? dadosFinanceiros.pe.toFixed(1) : 'N/A'}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                        <CurrencyDollarIcon size={24} className="text-yellow-600" />
                      </div>
                      <p className="text-slate-600 text-sm font-medium">Dividend Yield</p>
                      <p className="text-slate-900 text-xl font-bold">
                        {dadosFinanceiros.dividendYield ? 
                          `${dadosFinanceiros.dividendYield.toFixed(2)}%` : 
                          '0.00%'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 bg-red-50 rounded-lg border-2 border-red-200">
                <h3 className="text-red-600 font-bold text-lg">❌ Dados não carregados!</h3>
                <p className="text-red-500 mt-2">dadosFinanceiros é null ou undefined</p>
              </div>
            )}
          </div>

          {/* Footer com timestamp */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-600">
                <CalendarIcon size={16} />
                <span className="text-sm">
                  {ultimaAtualizacao || 'Carregando...'}
                </span>
              </div>
              <button 
                onClick={refresh}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-slate-800 text-slate-300 rounded-lg p-4 font-mono text-sm">
          <p className="text-slate-100 font-bold mb-2">🔧 Debug Info:</p>
          <p>• URL: {window.location.pathname}</p>
          <p>• Ticker extraído: {ticker}</p>
          <p>• Empresa: {nomeEmpresa}</p>
          <p>• Método: Tabela BRAPI + Fallback</p>
          <p>• Status: {loading ? 'Carregando...' : dadosFinanceiros ? 'Dados carregados' : 'Erro'}</p>
          <p>• Última atualização: {ultimaAtualizacao}</p>
          {error && <p className="text-yellow-400">• Erro: {error}</p>}
        </div>
      </div>
    </div>
  );
}
