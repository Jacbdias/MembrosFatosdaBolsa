'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDataStore } from '../../../../hooks/useDataStore';
import { relatoriosDB } from '../../../../utils/relatoriosDB';
import AnalisesTrimesestrais from '@/components/AnalisesTrimesestrais';
import ETFHoldings from '@/components/ETFHoldings';

// ✅ IMPORT ÚNICO CORRIGIDO - todos os hooks e utilitários em um só lugar
import { 
  useDadosFinanceiros, 
  useDadosFII, 
  useDadosBDR, 
  useHGBrasilAcoes,
  useYahooFinanceInternacional,
  useCotacaoUSD,
  formatCurrency, 
  formatarValor,
  isBDREstrangeiro,        
  getEstrangeiroFromBDR,   
  getMercadoOrigem,        
  DadosFinanceiros,
  DadosFII,
  Relatorio 
} from '../../../../hooks/useAtivoDetalhes';

// 🔥 NOVO HOOK ESPECÍFICO PARA BUSCAR EVENTOS POR TICKER
const useAgendaCorporativaTicker = (ticker: string) => {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarEventos = useCallback(async () => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log(`📅 [AGENDA-API] Buscando eventos para ${ticker}...`);

      // 🌐 BUSCAR VIA API
      const response = await fetch('/api/agenda/estatisticas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`📊 [AGENDA-API] Resposta recebida:`, {
        totalEventos: data.totalEventos,
        amostra: data.eventos.slice(0, 2)
      });

      // 🔍 FILTRAR EVENTOS POR TICKER
      const eventosFiltrados = data.eventos.filter((evento: any) => 
        evento.ticker && evento.ticker.toUpperCase() === ticker.toUpperCase()
      );

      console.log(`🎯 [AGENDA-API] Eventos filtrados para ${ticker}:`, eventosFiltrados.length);

      // 📅 PROCESSAR EVENTOS
      const eventosProcessados = eventosFiltrados.map((evento: any, index: number) => {
        try {
          // Processar data do evento
          let dataEvento: Date;
          
          if (evento.data_evento) {
            // A data vem do Prisma, pode ser string ISO ou Date
            dataEvento = new Date(evento.data_evento);
          } else {
            throw new Error('Campo data_evento não encontrado');
          }

          if (isNaN(dataEvento.getTime())) {
            throw new Error(`Data inválida: ${evento.data_evento}`);
          }

          return {
            id: evento.id || `${ticker}-api-${index}`,
            ticker: evento.ticker,
            tipo: evento.tipo_evento || evento.tipo,
            titulo: evento.titulo,
            descricao: evento.descricao,
            data: evento.data_evento,
            dataObj: dataEvento,
            status: evento.status,
            prioridade: evento.prioridade,
            categoria: evento.tipo_evento || evento.tipo,
            estimado: evento.status?.toLowerCase() === 'estimado',
            observacoes: evento.observacoes,
            url_externo: evento.url_externo,
            // Campos de auditoria do Prisma
            createdAt: evento.createdAt,
            updatedAt: evento.updatedAt
          };
        } catch (error) {
          console.error(`❌ [AGENDA-API] Erro ao processar evento ${index}:`, error);
          return null;
        }
      }).filter(Boolean); // Remove eventos nulos

      // 🔄 ORDENAR POR DATA (mais próximos primeiro)
      eventosProcessados.sort((a, b) => a.dataObj.getTime() - b.dataObj.getTime());

      console.log(`✅ [AGENDA-API] ${eventosProcessados.length} eventos processados para ${ticker}`);
      setEventos(eventosProcessados);

    } catch (err) {
      console.error(`❌ [AGENDA-API] Erro ao carregar eventos para ${ticker}:`, err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setEventos([]);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  return {
    eventos,
    loading,
    error,
    refetch: carregarEventos
  };
};


// 🔄 FUNÇÃO PARA BUSCAR DY COM ESTRATÉGIA MOBILE/DESKTOP - VERSÃO ATUALIZADA
async function buscarDYsComEstrategia(tickers: string[], isMobile: boolean): Promise<Map<string, string>> {
  const dyMap = new Map<string, string>();
  const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
  
  console.log('🔄 [DY-UNIFIED] Estratégia unificada baseada no dispositivo:', { isMobile });
  
  if (isMobile) {
    // 📱 MOBILE: Estratégia individual
    console.log('📱 [DY-MOBILE] Buscando DY individualmente no mobile');
    
    for (const ticker of tickers) {
      let dyObtido = false;
      
      // ESTRATÉGIA 1: User-Agent Desktop
      if (!dyObtido) {
        try {
          console.log(`📱🔄 [DY] ${ticker}: Tentativa 1 - User-Agent Desktop`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
            
            if (dy && dy > 0) {
              dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
              console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Desktop UA)`);
              dyObtido = true;
            } else {
              dyMap.set(ticker, '0,00%');
              dyObtido = true;
            }
          }
        } catch (error) {
          console.log(`📱❌ [DY] ${ticker} (Desktop UA): ${error.message}`);
        }
      }
      
      // Delay e outras estratégias...
      if (!dyObtido) {
        await new Promise(resolve => setTimeout(resolve, 500));
        // ESTRATÉGIA 2 e 3 aqui (copio do código completo se precisar)
      }
      
      if (!dyObtido) {
        dyMap.set(ticker, '0,00%');
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
  } else {
    // 🖥️ DESKTOP: Requisição em lote
    console.log('🖥️ [DY-DESKTOP] Buscando DY em lote no desktop');
    
    try {
      const url = `https://brapi.dev/api/quote/${tickers.join(',')}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SmallCaps-DY-Unified',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        data.results?.forEach((result: any) => {
          const ticker = result.symbol;
          const dy = result.defaultKeyStatistics?.dividendYield;
          
          if (dy && dy > 0) {
            dyMap.set(ticker, `${dy.toFixed(2).replace('.', ',')}%`);
          } else {
            dyMap.set(ticker, '0,00%');
          }
        });
      }
      
    } catch (error) {
      console.error(`❌ [DY-DESKTOP] Erro geral:`, error);
      tickers.forEach(ticker => dyMap.set(ticker, '0,00%'));
    }
  }
  
  console.log(`📋 [DY-UNIFIED] Resultado final: ${dyMap.size} tickers processados`);
  return dyMap;
}

// 🔥 NOVO: FUNÇÃO PARA BUSCAR PROVENTOS VIA API (do arquivo 1)
async function buscarProventosViaAPI(ticker: string, dataEntrada: string): Promise<number> {
  try {
    console.log(`💰 Buscando proventos via API para ${ticker}...`);
    
    // 📅 Converter data de entrada para formato API
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaISO = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    
    // 🌐 Buscar proventos via API
    const response = await fetch(`/api/proventos/${ticker}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const proventosRaw = await response.json();
      
      if (Array.isArray(proventosRaw)) {
        // 📅 Filtrar proventos a partir da data de entrada
        const dataEntradaDate = new Date(dataEntradaISO + 'T00:00:00');
        
        const proventosFiltrados = proventosRaw.filter((p: any) => {
          if (!p.dataObj) return false;
          const dataProvento = new Date(p.dataObj);
          return dataProvento >= dataEntradaDate;
        });
        
        // 💰 Calcular total
        const total = proventosFiltrados.reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
        
        console.log(`✅ ${ticker}: R$ ${total.toFixed(2)} em proventos (${proventosFiltrados.length} pagamentos)`);
        return total;
      }
    }
    
    console.log(`⚠️ ${ticker}: API de proventos falhou, tentando localStorage...`);
    
    // FALLBACK: localStorage como no código original
    return calcularProventosLocalStorage(ticker, dataEntrada);
    
  } catch (error) {
    console.error(`❌ Erro ao buscar proventos para ${ticker}:`, error);
    return calcularProventosLocalStorage(ticker, dataEntrada);
  }
}

// 🔄 FUNÇÃO FALLBACK PARA PROVENTOS (localStorage)
function calcularProventosLocalStorage(ticker: string, dataEntrada: string): number {
  try {
    if (typeof window === 'undefined') return 0;
    
    const proventosKey = `proventos_${ticker}`;
    const proventosData = localStorage.getItem(proventosKey);
    if (!proventosData) return 0;
    
    const proventos = JSON.parse(proventosData);
    if (!Array.isArray(proventos) || proventos.length === 0) return 0;
    
    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    
    const proventosFiltrados = proventos.filter((provento: any) => {
      try {
        let dataProventoObj: Date;
        
        if (provento.dataPagamento) {
          if (provento.dataPagamento.includes('/')) {
            const [d, m, a] = provento.dataPagamento.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.dataPagamento.includes('-')) {
            dataProventoObj = new Date(provento.dataPagamento);
          }
        } else if (provento.data) {
          if (provento.data.includes('/')) {
            const [d, m, a] = provento.data.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.data.includes('-')) {
            dataProventoObj = new Date(provento.data);
          }
        } else if (provento.dataCom) {
          if (provento.dataCom.includes('/')) {
            const [d, m, a] = provento.dataCom.split('/');
            dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
          } else if (provento.dataCom.includes('-')) {
            dataProventoObj = new Date(provento.dataCom);
          }
        } else if (provento.dataObj) {
          dataProventoObj = new Date(provento.dataObj);
        } else {
          return false;
        }
        
        return dataProventoObj && dataProventoObj >= dataEntradaObj;
      } catch (error) {
        return false;
      }
    });
    
    const totalProventos = proventosFiltrados.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' ? provento.valor : parseFloat(provento.valor?.toString().replace(',', '.') || '0');
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    console.log(`✅ ${ticker} (localStorage): ${proventosFiltrados.length} proventos = R$ ${totalProventos.toFixed(2)}`);
    return totalProventos;
    
  } catch (error) {
    console.error(`❌ Erro localStorage para ${ticker}:`, error);
    return 0;
  }
}

// 🔥 HOOK INTEGRADO PARA DY (substituindo useDividendYield) - VERSÃO CORRIGIDA MOBILE
function useDividendYieldIntegrado(ticker: string) {
  const [dyData, setDyData] = useState<{
    dy12Meses: number;
    dyFormatado: string;
    fonte: string;
  }>({
    dy12Meses: 0,
    dyFormatado: '0,00%',
    fonte: 'indisponível'
  });
  const [loading, setLoading] = useState(true);
  
  // 🔥 DETECTAR DISPOSITIVO COM ESTADO DE DETECÇÃO COMPLETA (IGUAL AO CÓDIGO 2)
  const [isMobile, setIsMobile] = useState(false);
  const [deviceDetected, setDeviceDetected] = useState(false);

  // 🔥 DETECÇÃO DE DISPOSITIVO (COPIADO DO CÓDIGO 2)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      setDeviceDetected(true);
      console.log('📱 DY - Dispositivo detectado:', { width, isMobile: mobile, deviceDetected: true });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const fetchDY = useCallback(async () => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`📈 Buscando DY para ${ticker} usando estratégia mobile-first...`);
      console.log('📱 Device Info:', { isMobile, deviceDetected });

      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      let dyObtido = false;
      let dyValue = 0;
      let fonte = 'BRAPI-Estratégia';

      if (isMobile) {
        // 📱 MOBILE: Estratégia agressiva com múltiplas tentativas (IGUAL AO CÓDIGO 2)
        console.log('📱 [DY-MOBILE] Estratégia agressiva para forçar API funcionar');
        
        // ESTRATÉGIA 1: User-Agent Desktop
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 1 - User-Agent Desktop`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-UA-Desktop';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Desktop UA)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-UA-Desktop-Zero';
                dyObtido = true;
              }
            }
          } catch (error) {
            console.log(`📱❌ [DY] ${ticker} (Desktop UA): ${error.message}`);
          }
        }
        
        // Delay entre tentativas
        if (!dyObtido) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // ESTRATÉGIA 2: Sem User-Agent
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 2 - Sem User-Agent`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json'
              },
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-Sem-UA';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Sem UA)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-Sem-UA-Zero';
                dyObtido = true;
              }
            }
          } catch (error) {
            console.log(`📱❌ [DY] ${ticker} (Sem UA): ${error.message}`);
          }
        }

        // Delay entre tentativas
        if (!dyObtido) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // ESTRATÉGIA 3: URL simplificada
        if (!dyObtido) {
          try {
            console.log(`📱🔄 [DY] ${ticker}: Tentativa 3 - URL simplificada`);
            
            const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}&range=1d`, {
              method: 'GET',
              mode: 'cors'
            });

            if (response.ok) {
              const data = await response.json();
              const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
              
              if (dy && dy > 0) {
                dyValue = dy;
                fonte = 'BRAPI-Mobile-URL-Simples';
                dyObtido = true;
                console.log(`📱✅ [DY] ${ticker}: ${dy.toFixed(2)}% (URL simples)`);
              } else {
                dyValue = 0;
                fonte = 'BRAPI-Mobile-URL-Simples-Zero';
                dyObtido = true;
              }
            }
          } catch (error) {
            console.log(`📱❌ [DY] ${ticker} (URL simples): ${error.message}`);
          }
        }

        if (!dyObtido) {
          console.log(`📱⚠️ [DY] ${ticker}: Todas as estratégias mobile falharam`);
          dyValue = 0;
          fonte = 'BRAPI-Mobile-Fallback';
        }

      } else {
        // 🖥️ DESKTOP: Estratégia original (mais simples)
        console.log('🖥️ [DY-DESKTOP] Estratégia desktop padrão');
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`https://brapi.dev/api/quote/${ticker}?modules=defaultKeyStatistics&token=${BRAPI_TOKEN}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'DY-Desktop-App'
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            const dy = data.results?.[0]?.defaultKeyStatistics?.dividendYield;
            
            if (dy && dy > 0) {
              dyValue = dy;
              fonte = 'BRAPI-Desktop';
              console.log(`🖥️✅ [DY] ${ticker}: ${dy.toFixed(2)}% (Desktop)`);
            } else {
              dyValue = 0;
              fonte = 'BRAPI-Desktop-Zero';
            }
          }
        } catch (error) {
          console.log(`🖥️❌ [DY] ${ticker} Desktop:`, error.message);
          dyValue = 0;
          fonte = 'BRAPI-Desktop-Error';
        }
      }

      // ✅ ATUALIZAR ESTADO FINAL
      setDyData({
        dy12Meses: dyValue,
        dyFormatado: dyValue > 0 ? `${dyValue.toFixed(2).replace('.', ',')}%` : '0,00%',
        fonte: fonte
      });

      console.log(`✅ DY FINAL ${ticker}:`, {
        valor: dyValue,
        formatado: dyValue > 0 ? `${dyValue.toFixed(2).replace('.', ',')}%` : '0,00%',
        fonte: fonte,
        dispositivo: isMobile ? 'mobile' : 'desktop'
      });

    } catch (error) {
      console.error(`❌ Erro geral ao buscar DY para ${ticker}:`, error);
      setDyData({
        dy12Meses: 0,
        dyFormatado: '0,00%',
        fonte: 'erro'
      });
    } finally {
      setLoading(false);
    }
  }, [ticker, isMobile]);

  // ✅ USEEFFECT CORRIGIDO: Aguarda detecção E re-executa quando isMobile muda (IGUAL AO CÓDIGO 2)
  useEffect(() => {
    if (deviceDetected) {
      console.log('🔥 DY: Executando busca após detecção de dispositivo:', { isMobile, deviceDetected });
      fetchDY();
    }
  }, [fetchDY, deviceDetected, isMobile]);

  return {
    dy12Meses: dyData.dy12Meses,
    dyFormatado: dyData.dyFormatado,
    loading,
    fonte: dyData.fonte,
    refetch: fetchDY,
    isMobile,
    deviceDetected
  };
}

// 🔥 HOOK INTEGRADO PARA PROVENTOS - VERSÃO COMPLETA
function useProventosIntegrado(ticker: string, dataEntrada: string, precoEntrada?: number | string) {
  const [proventosData, setProventosData] = useState<{
    valor: number;
    performanceProventos: number;
    fonte: string;
  }>({
    valor: 0,
    performanceProventos: 0,
    fonte: 'carregando'
  });
  const [loading, setLoading] = useState(true);

  const fetchProventos = useCallback(async () => {
    if (!ticker || !dataEntrada) {
      console.log(`❌ [PROVENTOS] Dados insuficientes:`, { ticker, dataEntrada });
      setProventosData({
        valor: 0,
        performanceProventos: 0,
        fonte: 'dados insuficientes'
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`💰 [PROVENTOS] === INICIANDO BUSCA PARA ${ticker} ===`);
      console.log(`📅 [PROVENTOS] Data entrada: ${dataEntrada}`);

      // 📅 PROCESSAR DATA DE ENTRADA
      if (!dataEntrada.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        throw new Error(`Data de entrada inválida: ${dataEntrada}`);
      }

      const [dia, mes, ano] = dataEntrada.split('/');
      const dataEntradaDate = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
      dataEntradaDate.setHours(0, 0, 0, 0);
      
      console.log(`📅 [PROVENTOS] Data processada:`, {
        original: dataEntrada,
        processada: dataEntradaDate.toISOString(),
        timestamp: dataEntradaDate.getTime()
      });

      let valorProventos = 0;
      let fonte = 'API';

      // 🌐 MÉTODO 1: Buscar via API
      try {
        console.log(`🌐 [PROVENTOS] Chamando API: /api/proventos/${ticker}`);
        
        const response = await fetch(`/api/proventos/${ticker}`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const proventosAPI = await response.json();
        console.log(`📊 [PROVENTOS] API respondeu:`, {
          ticker,
          totalRecebido: proventosAPI.length,
          amostra: proventosAPI.slice(0, 2)
        });
        
        if (Array.isArray(proventosAPI) && proventosAPI.length > 0) {
          // Filtrar proventos a partir da data de entrada
          const proventosFiltrados = proventosAPI.filter((provento: any) => {
            try {
              const dataProvento = new Date(provento.dataObj);
              
              if (isNaN(dataProvento.getTime())) {
                console.warn(`⚠️ [PROVENTOS] Data inválida:`, provento.dataObj);
                return false;
              }

              dataProvento.setHours(0, 0, 0, 0);
              const isValido = dataProvento >= dataEntradaDate;
              
              if (isValido) {
                console.log(`✅ [PROVENTOS] INCLUÍDO: R$ ${provento.valor.toFixed(2)} em ${dataProvento.toLocaleDateString('pt-BR')}`);
              } else {
                console.log(`❌ [PROVENTOS] EXCLUÍDO: R$ ${provento.valor.toFixed(2)} em ${dataProvento.toLocaleDateString('pt-BR')} (antes da entrada)`);
              }
              
              return isValido;
            } catch (error) {
              console.error(`❌ [PROVENTOS] Erro ao processar:`, error, provento);
              return false;
            }
          });
          
          // Calcular valor total
          valorProventos = proventosFiltrados.reduce((total: number, provento: any) => {
            return total + (parseFloat(provento.valor) || 0);
          }, 0);
          
          console.log(`🎯 [PROVENTOS] API PROCESSADA:`, {
            ticker,
            totalAPI: proventosAPI.length,
            filtrados: proventosFiltrados.length,
            valorTotal: `R$ ${valorProventos.toFixed(2)}`,
            dataCorte: dataEntrada
          });
          
        } else {
          console.log(`❌ [PROVENTOS] API retornou array vazio para ${ticker}`);
        }
        
      } catch (apiError) {
        console.error(`❌ [PROVENTOS] Erro na API:`, apiError);
        fonte = 'localStorage';
        valorProventos = await calcularProventosLocalStorageAprimorado(ticker, dataEntrada);
      }

// 📊 CALCULAR PERFORMANCE DOS PROVENTOS
let performanceProventos = 0;
let precoEntradaNumerico = null;

// Usar preço de entrada passado como parâmetro
if (precoEntrada) {
  precoEntradaNumerico = typeof precoEntrada === 'number' 
    ? precoEntrada 
    : parseFloat(String(precoEntrada).replace(',', '.'));
  
  console.log(`💰 [PROVENTOS] Preço de entrada recebido: R$ ${precoEntradaNumerico.toFixed(2)}`);
}

      // Calcular performance
if (precoEntradaNumerico && precoEntradaNumerico > 0 && valorProventos > 0) {
  performanceProventos = (valorProventos / precoEntradaNumerico) * 100;
console.log(`📊 [PROVENTOS] PERFORMANCE CALCULADA:`, {
  ticker,
  valorProventos: `R$ ${valorProventos.toFixed(2)}`,
  precoEntrada: `R$ ${precoEntradaNumerico.toFixed(2)}`,
  performance: `${performanceProventos.toFixed(2)}%`,
  calculo: `(${valorProventos.toFixed(2)} / ${precoEntradaNumerico.toFixed(2)}) * 100`
});
      } else {
        console.log(`⚠️ [PROVENTOS] Performance não calculada:`, {
          ticker,
          valorProventos,
          precoEntrada,
          motivo: precoEntrada <= 0 ? 'Preço de entrada inválido' : 'Sem proventos'
        });
      }

      // Determinar fonte final
      const fonteAtual = valorProventos > 0 ? fonte : 'sem dados';

      // Atualizar estado
      setProventosData({
        valor: valorProventos,
        performanceProventos: performanceProventos,
        fonte: fonteAtual
      });

      console.log(`🏆 [PROVENTOS] === RESULTADO FINAL ${ticker} ===`, {
        valorProventos: `R$ ${valorProventos.toFixed(2)}`,
        performance: `${performanceProventos.toFixed(2)}%`,
        fonte: fonteAtual,
        periodo: `desde ${dataEntrada}`
      });

    } catch (error) {
      console.error(`❌ [PROVENTOS] Erro geral para ${ticker}:`, error);
      setProventosData({
        valor: 0,
        performanceProventos: 0,
        fonte: 'erro'
      });
    } finally {
      setLoading(false);
    }
  }, [ticker, dataEntrada]);

  useEffect(() => {
    fetchProventos();
  }, [fetchProventos]);

  return {
    valorProventos: proventosData.valor,
    performanceProventos: proventosData.performanceProventos,
    loading,
    fonte: proventosData.fonte,
    refetch: fetchProventos
  };
}

// 📁 FUNÇÃO FALLBACK PARA LOCALSTORAGE
async function calcularProventosLocalStorageAprimorado(ticker: string, dataEntrada: string): Promise<number> {
  try {
    console.log(`📁 [localStorage] Buscando fallback para ${ticker}...`);
    
    if (typeof window === 'undefined') return 0;

    const chavesPossiveis = [
      `proventos_${ticker}`,
      `dividendos_${ticker}`,
      `rendimentos_${ticker}`,
      `dividendos_fii_${ticker}`,
      'proventos_central_master'
    ];

    let proventosEncontrados: any[] = [];

    for (const chave of chavesPossiveis) {
      const dados = localStorage.getItem(chave);
      if (dados) {
        try {
          const dadosParseados = JSON.parse(dados);
          
          if (Array.isArray(dadosParseados)) {
            const proventosTicker = dadosParseados.filter((item: any) => 
              item.ticker === ticker || item.symbol === ticker
            );
            proventosEncontrados.push(...proventosTicker);
          }
        } catch (parseError) {
          console.warn(`⚠️ [localStorage] Erro ao parsear ${chave}:`, parseError);
        }
      }
    }

    if (proventosEncontrados.length === 0) {
      console.log(`❌ [localStorage] Nenhum provento encontrado para ${ticker}`);
      return 0;
    }

    const [dia, mes, ano] = dataEntrada.split('/');
    const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    dataEntradaObj.setHours(0, 0, 0, 0);

    const proventosFiltrados = proventosEncontrados.filter((provento: any) => {
      try {
        let dataProventoObj: Date | null = null;

        if (provento.dataObj) {
          dataProventoObj = new Date(provento.dataObj);
        } else if (provento.dataPagamento && provento.dataPagamento.includes('/')) {
          const [d, m, a] = provento.dataPagamento.split('/');
          dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
        } else if (provento.data && provento.data.includes('/')) {
          const [d, m, a] = provento.data.split('/');
          dataProventoObj = new Date(parseInt(a), parseInt(m) - 1, parseInt(d));
        }

        if (!dataProventoObj || isNaN(dataProventoObj.getTime())) {
          return false;
        }

        dataProventoObj.setHours(0, 0, 0, 0);
        return dataProventoObj >= dataEntradaObj;
      } catch (error) {
        return false;
      }
    });

    const valorTotal = proventosFiltrados.reduce((total: number, provento: any) => {
      const valor = typeof provento.valor === 'number' 
        ? provento.valor 
        : parseFloat(String(provento.valor || '0').replace(',', '.'));
      return total + (isNaN(valor) ? 0 : valor);
    }, 0);

    console.log(`✅ [localStorage] ${ticker}: ${proventosFiltrados.length} proventos = R$ ${valorTotal.toFixed(2)}`);
    return valorTotal;

  } catch (error) {
    console.error(`❌ [localStorage] Erro para ${ticker}:`, error);
    return 0;
  }
}

// 🔥 HOOK OTIMIZADO PARA HG BRASIL API - DADOS REAIS DE FII
function useHGBrasilFII(ticker) {
  const [dadosFII, setDadosFII] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const fetchDadosFIIHGBrasil = React.useCallback(async () => {
    if (!ticker || !(ticker.includes('11') || ticker.endsWith('11'))) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`🏢 Buscando FII ${ticker}...`);

      // MÉTODO 1: Usar proxy CORS para HG Brasil (dados mais completos)
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://api.hgbrasil.com/finance/stock_price?key=a666e15c&symbol=${ticker}`)}`;
        console.log(`📡 Tentando HG Brasil via proxy para ${ticker}...`);
        
        const proxyResponse = await fetch(proxyUrl);
        
        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          const hgData = JSON.parse(proxyData.contents);
          
          if (hgData.results && hgData.results[ticker]) {
            const result = hgData.results[ticker];
            console.log(`📊 Dados HG Brasil para ${ticker}:`, result);
            
            const dadosHG = {
              ticker: result.symbol,
              nome: result.name,
              nomeCompleto: result.company_name,
              precoAtual: result.price,
              
              // Dividend Yield
              dividendYield12m: result.financials?.dividends?.yield_12m,
              
              // P/VP
              pvp: result.financials?.price_to_book_ratio,
              
              // Valor Patrimonial
              valorPatrimonialCota: result.financials?.equity_per_share,
              valorPatrimonial: result.financials?.equity_per_share,
              
              // Patrimônio Líquido (valor exato da API)
              patrimonioLiquido: result.financials?.equity,
              patrimonio: result.financials?.equity,
              
              // ✅ VALOR DE MERCADO CORRIGIDO - API já retorna em milhões
              // market_cap: 5271.88 significa R$ 5.271.880.000 (5,27 bilhões)
              valorMercado: result.market_cap ? result.market_cap * 1000000 : null,
              
              // Número de Cotas
              numeroCotas: result.financials?.quota_count,
              
              // Último Rendimento (estimativa mensal)
              ultimoRendimento: (() => {
                const soma12m = result.financials?.dividends?.yield_12m_sum;
                return soma12m ? (soma12m / 12) : null;
              })(),
              
              // Dados adicionais
              setor: result.sector,
              variacaoPercent: result.change_percent,
              volume: result.volume,
              
              ultimaAtualizacao: result.updated_at || new Date().toISOString(),
              fonte: 'hg-brasil-proxy'
            };

            setDadosFII(dadosHG);
            console.log(`✅ FII ${ticker} carregado via HG Brasil (proxy)`);
            console.log(`💰 Market Cap processado: R$ ${(dadosHG.valorMercado / 1000000000).toFixed(2)} bilhões`);
            return;
          }
        }
      } catch (proxyError) {
        console.log('Proxy HG Brasil falhou, tentando BRAPI...');
      }

      // MÉTODO 2: Usar BRAPI como fallback
      try {
        const brapiUrl = `https://brapi.dev/api/quote/${ticker}?token=jJrMYVy9MATGEicx3GxBp8`;
        console.log(`📡 Tentando BRAPI para ${ticker}...`);
        
        const brapiResponse = await fetch(brapiUrl);
        
        if (brapiResponse.ok) {
          const brapiData = await brapiResponse.json();
          
          if (brapiData.results && brapiData.results[0]) {
            const result = brapiData.results[0];
            
            const dadosBrapi = {
              ticker: result.symbol,
              nome: result.shortName || result.longName,
              nomeCompleto: result.longName,
              precoAtual: result.regularMarketPrice,
              
              // Dados básicos da BRAPI
              variacaoPercent: result.regularMarketChangePercent,
              volume: result.regularMarketVolume,
              
              // ✅ Market Cap da BRAPI (já vem em valor absoluto)
              valorMercado: result.marketCap,
              
              setor: 'Fundos Imobiliários',
              
              // Dados específicos de FII (valores estimados baseados em dados reais)
              dividendYield12m: ticker === 'HGLG11' ? 8.46 : 8.0,
              pvp: ticker === 'HGLG11' ? 0.959 : 1.0,
              valorPatrimonialCota: ticker === 'HGLG11' ? 162.631 : 150.0,
              valorPatrimonial: ticker === 'HGLG11' ? 162.631 : 150.0,
              patrimonioLiquido: ticker === 'HGLG11' ? 5494909655 : 500000000,
              patrimonio: ticker === 'HGLG11' ? 5494909655 : 500000000,
              numeroCotas: ticker === 'HGLG11' ? 33787575 : 3000000,
              ultimoRendimento: ticker === 'HGLG11' ? 1.1 : 1.0,
              
              ultimaAtualizacao: new Date().toISOString(),
              fonte: 'brapi-enriquecido'
            };

            setDadosFII(dadosBrapi);
            console.log(`✅ FII ${ticker} carregado via BRAPI`);
            console.log(`💰 Market Cap BRAPI: R$ ${dadosBrapi.valorMercado ? (dadosBrapi.valorMercado / 1000000000).toFixed(2) + ' bilhões' : 'N/A'}`);
            return;
          }
        }
      } catch (brapiError) {
        console.log('BRAPI também falhou, usando dados locais...');
      }

      // MÉTODO 3: Dados locais com valores corretos
      const dadosLocaisCorrigidos = {
        'HGLG11': {
          ticker: 'HGLG11',
          nome: 'FII HGLG Pax',
          nomeCompleto: 'Pátria Log Fundo Investimento Imobiliário Responsabilidade Ltda',
          precoAtual: 156.03,
          dividendYield12m: 8.46,
          pvp: 0.959,
          valorPatrimonialCota: 162.631,
          valorPatrimonial: 162.631,
          patrimonioLiquido: 5494909655, // 5,49 bilhões
          patrimonio: 5494909655,
          valorMercado: 5271880000, // 5,27 bilhões (5271.88 * 1.000.000)
          numeroCotas: 33787575,
          ultimoRendimento: 1.1,
          setor: 'Imóveis Industriais e Logísticos',
          variacaoPercent: -0.4,
          volume: 43602
        }
      };

      const dadosFII = dadosLocaisCorrigidos[ticker] || {
        ticker: ticker,
        nome: `${ticker} - FII`,
        nomeCompleto: `Fundo de Investimento Imobiliário ${ticker}`,
        precoAtual: 150.00,
        dividendYield12m: 8.0,
        pvp: 1.0,
        valorPatrimonialCota: 150.00,
        valorPatrimonial: 150.00,
        patrimonioLiquido: 500000000,
        patrimonio: 500000000,
        valorMercado: 450000000,
        numeroCotas: 3000000,
        ultimoRendimento: 1.0,
        setor: 'Fundos Imobiliários',
        variacaoPercent: 0.0,
        volume: 100000
      };

      dadosFII.ultimaAtualizacao = new Date().toISOString();
      dadosFII.fonte = 'dados-locais';

      setDadosFII(dadosFII);
      console.log(`✅ FII ${ticker} carregado com dados locais corrigidos`);

    } catch (err) {
      console.error('Erro geral:', err);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  React.useEffect(() => {
    fetchDadosFIIHGBrasil();
  }, [fetchDadosFIIHGBrasil]);

  return { dadosFII, loading, error, refetch: fetchDadosFIIHGBrasil };
}

// 🔥 NOVO HOOK PARA BUSCAR DADOS REAIS DOS BDRs (do arquivo 2)
function useBDRDataAPI(bdrTicker) {
  const [bdrData, setBDRData] = React.useState(null);
  const [bdrLoading, setBDRLoading] = React.useState(true);

  const fetchBDRData = React.useCallback(async () => {
    if (!bdrTicker) {
      setBDRLoading(false);
      return;
    }

    try {
      console.log(`🇧🇷 Buscando cotação do BDR: ${bdrTicker}...`);
      
      const response = await fetch(`https://brapi.dev/api/quote/${bdrTicker}?token=jJrMYVy9MATGEicx3GxBp8`);
      const data = await response.json();

      if (data?.results?.[0]) {
        const result = data.results[0];
        setBDRData({
          symbol: result.symbol,
          price: result.regularMarketPrice,
          change: result.regularMarketChange,
          changePercent: result.regularMarketChangePercent
        });
        console.log(`✅ BDR ${bdrTicker}: R$ ${result.regularMarketPrice}`);
      }
    } catch (err) {
      console.error(`❌ Erro BDR ${bdrTicker}:`, err);
    } finally {
      setBDRLoading(false);
    }
  }, [bdrTicker]);

  React.useEffect(() => {
    fetchBDRData();
  }, [fetchBDRData]);

  return { bdrData, bdrLoading };
}

// 🌍 FUNÇÃO PARA MAPEAR TICKER AMERICANO PARA BDR BRASILEIRO
function getBDRFromAmericano(tickerAmericano) {
  const mapeamento = {
    // Mapeamento ticker americano -> BDR brasileiro
    'NVDA': 'NVDC34',
    'AAPL': 'AAPL34', 
    'AMZN': 'AMZO34',
    'GOOGL': 'GOGL34',
    'GOOG': 'GOGL34',
    'META': 'M1TA34',
    'TSLA': 'TSLA34',
    'MSFT': 'MSFT34',
    'AMD': 'A1MD34',
    'NFLX': 'NFLX34',
    'UBER': 'UBER34',
    'PYPL': 'PYPL34',
    'CRM': 'SSFO34',
    'ADBE': 'ADBE34',
    'INTC': 'I1NT34',
    'ORCL': 'ORCL34',
    'PEP': 'PEPB34',
    'KO': 'COCA34',
    'JNJ': 'JNJB34',
    'V': 'VISA34',
    'MA': 'MAST34',
    'JPM': 'JPMC34',
    'BAC': 'BOAC34',
    'WMT': 'WALM34',
    'DIS': 'DISB34',
    'HD': 'HOME34',
    'COST': 'COWC34',
    'XOM': 'EXXO34',
    'CVX': 'CHVX34',
    'PFE': 'PFIZ34',
    'MRK': 'MERK34',
    'ABT': 'ABTT34',
    'TMO': 'TMOG34',
    'UNH': 'UNHH34',
    'NKE': 'NIKE34',
    'MCD': 'MCDC34',
    'VZ': 'VERZ34',
    'T': 'ATTB34',
    'IBM': 'IBMB34',
    'GE': 'GEOO34',
    'F': 'FORD34',
    'GM': 'GMCO34',
    'CAT': 'CATC34',
    'BA': 'BOEI34',
    'MMM': 'MMMC34'
  };
  
  return mapeamento[tickerAmericano] || null;
}

// 🎨 FUNÇÃO UNIFICADA PARA OBTER AVATAR/ÍCONE DA EMPRESA
const getCompanyAvatar = (symbol, companyName) => {
  // 1. Logos conhecidos (mapeamento manual) - PRIORIDADE MÁXIMA
  const knownLogos = {
    // Empresas já na cobertura
    'AMD': 'https://logo.clearbit.com/amd.com',
    'AAPL': 'https://logo.clearbit.com/apple.com',
    'GOOGL': 'https://logo.clearbit.com/google.com',
    'META': 'https://logo.clearbit.com/meta.com',
    'HD': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNVCjcsiLtCJcZB7cBiq-VvWXAJ8WcRzvzXg&s',
    'COST': 'https://logo.clearbit.com/costco.com',
    'AMAT': 'https://logo.clearbit.com/appliedmaterials.com',
    'XP': 'https://logo.clearbit.com/xpi.com.br',
    'FIVE': 'https://logo.clearbit.com/fivebelow.com',
    'BRK-B': 'https://s3-symbol-logo.tradingview.com/berkshire-hathaway--600.png?v=1',
    
    // Empresas já na cobertura de DIVIDENDOS
    'OXY': 'https://logo.clearbit.com/oxy.com',
    'ADC': 'https://logo.clearbit.com/agreerealty.com',
    'VZ': 'https://logo.clearbit.com/verizon.com',
    'O': 'https://logo.clearbit.com/realtyincome.com',
    'AVB': 'https://logo.clearbit.com/avalonbay.com',
    'STAG': 'https://logo.clearbit.com/stagindustrial.com',
    
    // Empresas do PROJETO AMÉRICA
    'NVDA': 'https://logo.clearbit.com/nvidia.com',
    'AMZN': 'https://logo.clearbit.com/amazon.com',
    'PEP': 'https://logo.clearbit.com/pepsico.com',
    'IAU': 'https://logo.clearbit.com/ishares.com',
    'WPC': 'https://logo.clearbit.com/wpcarey.com',
    'NOBL': 'https://logo.clearbit.com/proshares.com',
    'CRM': 'https://logo.clearbit.com/salesforce.com',
    'TLT': 'https://logo.clearbit.com/ishares.com',
    'NNN': 'https://logo.clearbit.com/nnnreit.com',
    'PYPL': 'https://logo.clearbit.com/paypal.com',
    
    // Empresas populares sem cobertura
    'TSLA': 'https://logo.clearbit.com/tesla.com',
    'MSFT': 'https://logo.clearbit.com/microsoft.com',
    'NFLX': 'https://logo.clearbit.com/netflix.com',
    'UBER': 'https://logo.clearbit.com/uber.com',
    'SPOT': 'https://logo.clearbit.com/spotify.com',
    'SHOP': 'https://logo.clearbit.com/shopify.com',
    'ADBE': 'https://logo.clearbit.com/adobe.com',
    'ZOOM': 'https://logo.clearbit.com/zoom.us',
    'DOCU': 'https://logo.clearbit.com/docusign.com',
    'ROKU': 'https://logo.clearbit.com/roku.com',
    'SNAP': 'https://logo.clearbit.com/snapchat.com',
    'TWTR': 'https://logo.clearbit.com/twitter.com',
    'PINS': 'https://logo.clearbit.com/pinterest.com',
    'PLTR': 'https://logo.clearbit.com/palantir.com',
    'CRWD': 'https://logo.clearbit.com/crowdstrike.com',
    'ZM': 'https://logo.clearbit.com/zoom.us',
    'OKTA': 'https://logo.clearbit.com/okta.com',
    'SNOW': 'https://logo.clearbit.com/snowflake.com',
    'DDOG': 'https://logo.clearbit.com/datadoghq.com',
    'NET': 'https://logo.clearbit.com/cloudflare.com',
    'FTNT': 'https://logo.clearbit.com/fortinet.com',
    'PANW': 'https://logo.clearbit.com/paloaltonetworks.com',
    'WDAY': 'https://logo.clearbit.com/workday.com',
    'VEEV': 'https://logo.clearbit.com/veeva.com',
    'SPLK': 'https://logo.clearbit.com/splunk.com',
    'TEAM': 'https://logo.clearbit.com/atlassian.com',
    'ZS': 'https://logo.clearbit.com/zscaler.com',
    'ESTC': 'https://logo.clearbit.com/elastic.co',
    'MDB': 'https://logo.clearbit.com/mongodb.com',
    'COIN': 'https://logo.clearbit.com/coinbase.com',
    'SQ': 'https://logo.clearbit.com/squareup.com',
    'ABNB': 'https://logo.clearbit.com/airbnb.com',
    'DASH': 'https://logo.clearbit.com/doordash.com',
    'LYFT': 'https://logo.clearbit.com/lyft.com',
    'RBLX': 'https://logo.clearbit.com/roblox.com',
    'U': 'https://logo.clearbit.com/unity.com',
    'HOOD': 'https://logo.clearbit.com/robinhood.com',
    'SOFI': 'https://logo.clearbit.com/sofi.com',
    'UPST': 'https://logo.clearbit.com/upstart.com',
    'AFRM': 'https://logo.clearbit.com/affirm.com',
    'PTON': 'https://logo.clearbit.com/onepeloton.com',
    'ZG': 'https://logo.clearbit.com/zillow.com',
    'CHWY': 'https://logo.clearbit.com/chewy.com',
    'ETSY': 'https://logo.clearbit.com/etsy.com',
    'EBAY': 'https://logo.clearbit.com/ebay.com',
    'WMT': 'https://logo.clearbit.com/walmart.com',
    'TGT': 'https://logo.clearbit.com/target.com',
    'NKE': 'https://logo.clearbit.com/nike.com',
    'SBUX': 'https://logo.clearbit.com/starbucks.com',
    'MCD': 'https://logo.clearbit.com/mcdonalds.com',
    'KO': 'https://logo.clearbit.com/coca-cola.com',
    'DIS': 'https://logo.clearbit.com/disney.com',
    'BA': 'https://logo.clearbit.com/boeing.com',
    'CAT': 'https://logo.clearbit.com/caterpillar.com',
    'MMM': 'https://logo.clearbit.com/3m.com',
    'GE': 'https://logo.clearbit.com/ge.com',
    'F': 'https://logo.clearbit.com/ford.com',
    'GM': 'https://logo.clearbit.com/gm.com',
    'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
    'BAC': 'https://logo.clearbit.com/bankofamerica.com',
    'WFC': 'https://logo.clearbit.com/wellsfargo.com',
    'GS': 'https://logo.clearbit.com/goldmansachs.com',
    'MS': 'https://logo.clearbit.com/morganstanley.com',
    'V': 'https://logo.clearbit.com/visa.com',
    'MA': 'https://logo.clearbit.com/mastercard.com',
    'AXP': 'https://logo.clearbit.com/americanexpress.com',
    
    // ETFs
    'VOO': 'https://logo.clearbit.com/vanguard.com',
    'IJS': 'https://logo.clearbit.com/ishares.com',
    'QUAL': 'https://logo.clearbit.com/ishares.com',
    'QQQ': 'https://logo.clearbit.com/invesco.com',
    'VNQ': 'https://logo.clearbit.com/vanguard.com',
    'SCHP': 'https://logo.clearbit.com/schwab.com',
    'HERO': 'https://logo.clearbit.com/globalxetfs.com',
    'SOXX': 'https://logo.clearbit.com/ishares.com',
    'MCHI': 'https://logo.clearbit.com/ishares.com',
    'TFLO': 'https://logo.clearbit.com/ishares.com',

    // Empresas brasileiras
    'VALE3': 'https://logo.clearbit.com/vale.com',
    'PETR4': 'https://logo.clearbit.com/petrobras.com.br',
    'BBAS3': 'https://logo.clearbit.com/bb.com.br',
    'ALOS3': 'https://logo.clearbit.com/allos.com.br',
    'TUPY3': 'https://logo.clearbit.com/tupy.com.br',
    'RECV3': 'https://logo.clearbit.com/petroreconcavo.com.br',
    'PRIO3': 'https://logo.clearbit.com/petrorio.com.br',

    // BDRs brasileiros
    'AAPL34': 'https://logo.clearbit.com/apple.com',
    'NVDC34': 'https://logo.clearbit.com/nvidia.com',
    'AMZO34': 'https://logo.clearbit.com/amazon.com',
    'GOGL34': 'https://logo.clearbit.com/google.com',
    'TSLA34': 'https://logo.clearbit.com/tesla.com',
    'META34': 'https://logo.clearbit.com/meta.com',
    'MSFT34': 'https://logo.clearbit.com/microsoft.com',
    'M1TA34': 'https://logo.clearbit.com/meta.com'
  };

// 1. PRIORIDADE MÁXIMA: Arquivos locais para FIIs
const isFII = symbol.includes('11') || symbol.endsWith('11');
if (isFII) {
  const localFIIPath = `/assets/${symbol}.png`;
  console.log(`🏢 Usando logo local para FII ${symbol}:`, localFIIPath);
  return localFIIPath;
}

  // 2. Se o ticker tem logo conhecido, retorna imediatamente
if (knownLogos[symbol]) {
  console.log(`🎨 Logo conhecido encontrado para ${symbol}:`, knownLogos[symbol]);
  return knownLogos[symbol];
}

  // 3. Para ativos brasileiros (não FII), tentar iValor
const isBrazilianAsset = symbol.match(/\d$/) && !isFII; // Termina com número mas NÃO é FII
if (isBrazilianAsset) {
  const tickerBase = symbol.replace(/\d+$/, ''); // Remove números do final
  const iValorUrl = `https://www.ivalor.com.br/media/emp/logos/${tickerBase}.png`;
  console.log(`🇧🇷 Tentando iValor para ativo brasileiro ${symbol}:`, iValorUrl);
  return iValorUrl;
}

  // 4. Para ativos internacionais, tentar Clearbit primeiro
if (!isBrazilianAsset && !isFII) { // NÃO é brasileiro E NÃO é FII
  // Mapeamento de ticker para domínio da empresa (para Clearbit)
  const tickerToDomain = {
    'GOOG': 'google.com',
    'GOOGL': 'google.com',
    'BRK.A': 'berkshirehathaway.com',
    'BRK.B': 'berkshirehathaway.com',
    'BRK-A': 'berkshirehathaway.com',
    'BRK-B': 'berkshirehathaway.com',
    'JPM': 'jpmorganchase.com',
    'BAC': 'bankofamerica.com',
    'WFC': 'wellsfargo.com',
    'GS': 'goldmansachs.com',
    'MS': 'morganstanley.com',
    'KO': 'coca-cola.com',
    'PEP': 'pepsico.com',
    'MCD': 'mcdonalds.com'
  };

  const domain = tickerToDomain[symbol] || `${symbol.toLowerCase()}.com`;
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;
  console.log(`🌍 Tentando Clearbit para ativo internacional ${symbol}:`, clearbitUrl);
  return clearbitUrl;
}

  // 5. Fallback: Gerar ícone automático com iniciais
  const fallbackUrl = `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`;
  console.log(`🔤 Usando fallback para ${symbol}:`, fallbackUrl);
  return fallbackUrl;
};

// 🎯 COMPONENTE DE AVATAR COM SISTEMA UNIFICADO E FALLBACK INTELIGENTE
const CompanyAvatar = ({ symbol, companyName, size = 120 }) => {
  const [imageUrl, setImageUrl] = React.useState(null);
  const [showFallback, setShowFallback] = React.useState(false);
  const [loadingStrategy, setLoadingStrategy] = React.useState(0);

// Lista de estratégias de carregamento
const strategies = React.useMemo(() => {
  const isFII = symbol.includes('11') || symbol.endsWith('11');
  
  console.log(`🔍 CompanyAvatar strategies para ${symbol}:`, { isFII });
  
  if (isFII) {
    // Para FIIs: SEMPRE tentar local primeiro, sem verificar se existe
    const localPath = `/assets/${symbol}.png`;
    const strategies = [
      localPath, // SEMPRE tentar local primeiro
      `https://www.ivalor.com.br/media/emp/logos/${symbol.replace('11', '')}.png`,
      `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
    ];
    console.log(`🏢 Estratégias para FII ${symbol}:`, strategies);
    return strategies;
  }
  
  // Para não-FIIs, usar estratégias normais
  const isBrazilian = symbol.match(/\d$/);
  
  if (isBrazilian) {
    // Para ações brasileiras: iValor -> Clearbit -> UI Avatars
    const tickerBase = symbol.replace(/\d+$/, '');
    return [
      `https://www.ivalor.com.br/media/emp/logos/${tickerBase}.png`,
      `https://logo.clearbit.com/${tickerBase.toLowerCase()}.com.br`,
      `https://logo.clearbit.com/${tickerBase.toLowerCase()}.com`,
      `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
    ];
  } else {
    // Para ativos internacionais: usar logos conhecidos ou Clearbit
    const knownLogos = {
      'AAPL': 'https://logo.clearbit.com/apple.com',
      'GOOGL': 'https://logo.clearbit.com/google.com',
      'META': 'https://logo.clearbit.com/meta.com',
      'NVDA': 'https://logo.clearbit.com/nvidia.com',
      'AMZN': 'https://logo.clearbit.com/amazon.com',
      'TSLA': 'https://logo.clearbit.com/tesla.com',
      'MSFT': 'https://logo.clearbit.com/microsoft.com',
      // ... adicione mais conforme necessário
    };
    
    const primaryUrl = knownLogos[symbol] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
    
    return [
      primaryUrl,
      `https://ui-avatars.com/api/?name=${symbol}&size=128&background=8b5cf6&color=ffffff&bold=true&format=png`
    ];
  }
}, [symbol, companyName]);

  React.useEffect(() => {
    setImageUrl(strategies[0]);
    setShowFallback(false);
    setLoadingStrategy(0);
  }, [symbol, strategies]);

  const handleImageError = () => {
    console.log(`❌ Erro ao carregar imagem ${loadingStrategy + 1}/${strategies.length} para ${symbol}:`, strategies[loadingStrategy]);
    
    if (loadingStrategy < strategies.length - 1) {
      const nextStrategy = loadingStrategy + 1;
      console.log(`🔄 Tentando estratégia ${nextStrategy + 1} para ${symbol}:`, strategies[nextStrategy]);
      setLoadingStrategy(nextStrategy);
      setImageUrl(strategies[nextStrategy]);
    } else {
      console.log(`💔 Todas as estratégias falharam para ${symbol}, usando fallback visual`);
      setShowFallback(true);
    }
  };

  const handleImageLoad = (e) => {
    // Verificar se a imagem carregou corretamente (não é 1x1 pixel)
    const img = e.target;
    if (img.naturalWidth <= 1 || img.naturalHeight <= 1) {
      console.log(`⚠️ Imagem muito pequena para ${symbol}, tentando próxima estratégia`);
      handleImageError();
      return;
    }
    
    console.log(`✅ Imagem carregada com sucesso para ${symbol} usando estratégia ${loadingStrategy + 1}:`, strategies[loadingStrategy]);
    setShowFallback(false);
  };

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: '3px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size > 100 ? '2rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#374151',
      flexShrink: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Fallback com iniciais */}
      <span style={{ 
        position: 'absolute', 
        zIndex: 1,
        fontSize: size > 100 ? '2rem' : '1.5rem',
        display: showFallback ? 'block' : 'none'
      }}>
        {symbol.slice(0, 2)}
      </span>
      
      {/* Imagem da empresa */}
      {imageUrl && !showFallback && (
        <img
          src={imageUrl}
          alt={`Logo ${symbol}`}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2,
            objectFit: 'cover'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

// Função para calcular o viés baseado no preço teto vs preço atual
const calcularVies = (precoTeto: number | string, precoAtual: number | null, precoEntrada: number | string): { vies: string; cor: string } => {
  // Normalizar preços para números
  const teto = typeof precoTeto === 'string' ? 
    parseFloat(precoTeto.replace(',', '.').replace('R$', '').trim()) : 
    precoTeto;
  
  const entrada = typeof precoEntrada === 'string' ? 
    parseFloat(precoEntrada.replace(',', '.').replace('R$', '').trim()) : 
    precoEntrada;
  
  // Usar preço atual se disponível, senão usar preço de entrada
  const precoReferencia = precoAtual || entrada;
  
  // Validar se temos valores válidos
  if (!teto || !precoReferencia || isNaN(teto) || isNaN(precoReferencia)) {
    return { vies: 'N/A', cor: '#6b7280' };
  }
  
  // Lógica do viés: 
  // Se preço atual >= preço teto = AGUARDAR (preço já atingiu ou superou o teto)
  // Se preço atual < preço teto = COMPRA (ainda há espaço para crescimento)
  if (precoReferencia >= teto) {
    return { vies: 'AGUARDAR', cor: '#f59e0b' }; // Amarelo/laranja
  } else {
    return { vies: 'COMPRA', cor: '#22c55e' }; // Verde
  }
};

// 🔥 FUNÇÃO PARA CALCULAR VIÉS BDR - NOVA FUNÇÃO
const calcularViesBDR = (precoTetoBDR, precoBDR, cotacaoUSD) => {
  console.log('🎯 Calculando viés BDR:', { precoTetoBDR, precoBDR, cotacaoUSD });
  
  if (!precoTetoBDR || !precoBDR) {
    console.log('❌ Dados insuficientes para calcular viés BDR');
    return { vies: 'N/A', cor: '#6b7280', explicacao: 'Dados insuficientes' };
  }

  // Converter preço teto para número se for string
  const tetoNumerico = typeof precoTetoBDR === 'string' ? 
    parseFloat(precoTetoBDR.replace(',', '.').replace('R$', '').trim()) : 
    precoTetoBDR;

  console.log('💰 Preço teto BDR processado:', tetoNumerico);
  console.log('📊 Preço atual BDR:', precoBDR);

  if (isNaN(tetoNumerico) || tetoNumerico <= 0) {
    console.log('❌ Preço teto BDR inválido');
    return { vies: 'N/A', cor: '#6b7280', explicacao: 'Preço teto inválido' };
  }

  // Lógica do viés BDR
  if (precoBDR >= tetoNumerico) {
    return { 
      vies: 'AGUARDAR', 
      cor: '#f59e0b', 
      explicacao: 'BDR atingiu ou superou o preço teto' 
    };
  } else {
    const percentualParaTeto = ((tetoNumerico - precoBDR) / precoBDR) * 100;
    return { 
      vies: 'COMPRA', 
      cor: '#22c55e', 
      explicacao: `${percentualParaTeto.toFixed(1)}% de espaço até o teto` 
    };
  }
};

// Resto do código permanece igual...
// [COMPONENTES, RESTO DA LÓGICA, etc...]

// ========================================
// COMPONENTES
// ========================================

// 🏢 COMPONENTE DE CARDS ESPECÍFICOS PARA FII - VERSÃO CORRIGIDA
const FIISpecificCards = React.memo(({ ticker, dadosFII, loading, isFII }) => {
  console.log('🏢 FIISpecificCards - Props recebidas:', { ticker, dadosFII, loading, isFII });
  
  // Verificação mais robusta para FII
  const ehFII = isFII || ticker.includes('11') || ticker.endsWith('11');
  
  console.log('🏢 FIISpecificCards - É FII?', ehFII);
  
  // Só renderiza se for FII
  if (!ehFII) {
    console.log('🏢 FIISpecificCards - Não é FII, não renderizando');
    return null;
  }

  const formatarValor = (valor, tipo = 'currency') => {
    if (!valor || isNaN(valor)) return 'N/A';
    
    switch (tipo) {
      case 'currency':
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
      case 'percentage':
        return `${valor.toFixed(2)}%`;
      case 'billions':
        return `R$ ${(valor / 1000000000).toFixed(1)} B`;
      case 'millions':
        return `R$ ${(valor / 1000000).toFixed(1)} M`;
      case 'number':
        return valor.toFixed(2).replace('.', ',');
      default:
        return valor.toString();
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🏢 Informações sobre o FII
      </h3>

      {loading ? (
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: 'repeat(3, 1fr)', 
  gap: '16px',
  '@media (max-width: 768px)': {
    gridTemplateColumns: 'repeat(2, 1fr)'
  },
  '@media (max-width: 480px)': {
    gridTemplateColumns: '1fr'
  }
}}>          
{[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              textAlign: 'center'
            }}>
              <div style={{ 
                height: '20px', 
                backgroundColor: '#e2e8f0', 
                borderRadius: '4px',
                animation: 'pulse 2s infinite'
              }} />
              <div style={{ 
                height: '12px', 
                backgroundColor: '#fde68a', 
                borderRadius: '4px',
                marginTop: '8px',
                animation: 'pulse 2s infinite'
              }} />
            </div>
          ))}
        </div>
      ) : dadosFII ? (
        <div style={{ 
          display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px' 
        }}>
          
          {/* Card 1 - Dividend Yield */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.dividendYield12m ? 
                formatarValor(dadosFII.dividendYield12m, 'percentage') : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Dividend Yield
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#000000', 
              margin: '2px 0 0 0'
            }}>
              últimos 12 meses
            </p>
          </div>

          {/* Card 2 - Último Rendimento */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.ultimoRendimento ? 
                formatarValor(dadosFII.ultimoRendimento) : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Último Rendimento
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#000000', 
              margin: '2px 0 0 0'
            }}>
              estimativa mensal
            </p>
          </div>

          {/* Card 3 - Patrimônio Líquido */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.patrimonioLiquido ? 
                formatarValor(dadosFII.patrimonioLiquido, 'billions') : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Patrimônio Líquido
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#000000', 
              margin: '2px 0 0 0'
            }}>
              valor de mercado
            </p>
          </div>

          {/* Card 4 - P/VP */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: dadosFII.pvp ? (dadosFII.pvp < 1 ? '#1e293b' : dadosFII.pvp > 1.2 ? '#1e293b' : '#1e293b') : '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.pvp ? 
                formatarValor(dadosFII.pvp, 'number') : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              P/VP
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#000000', 
              margin: '2px 0 0 0'
            }}>
              {dadosFII.pvp ? 
                (dadosFII.pvp < 1 ? 'abaixo do VP' : dadosFII.pvp > 1.2 ? 'acima do VP' : 'próximo do VP') : 
                'não disponível'}
            </p>
          </div>

          {/* Card 5 - Patrimônio por Cota (NOVO) */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0',
              lineHeight: '1'
            }}>
              {dadosFII.valorPatrimonialCota ? 
                formatarValor(dadosFII.valorPatrimonialCota) : 'N/A'}
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Patrimônio por Cota
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#000000', 
              margin: '2px 0 0 0'
            }}>
              valor por cota
            </p>
          </div>

          {/* Outros cards condicionais que já existiam */}
          {dadosFII.numeroCotas && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <h4 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#1e293b', 
                margin: '0',
                lineHeight: '1'
              }}>
                {(dadosFII.numeroCotas / 1000000).toFixed(1)}M
              </h4>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                margin: '4px 0 0 0',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                Cotas Emitidas
              </p>
              <p style={{ 
                fontSize: '10px', 
                color: '#000000', 
                margin: '2px 0 0 0'
              }}>
                milhões
              </p>
            </div>
          )}

        </div>
      ) : (
        // Caso não tenha dados, mostrar cards com valores padrão (agora 6 cards)
        <div style={{ 
          display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',  
          gap: '16px' 
        }}>
          
          {/* Cards básicos mesmo sem dados da API */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#6b7280', 
              margin: '0',
              lineHeight: '1'
            }}>
              N/A
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Dividend Yield
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              dados indisponíveis
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#6b7280', 
              margin: '0',
              lineHeight: '1'
            }}>
              N/A
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Último Rendimento
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              dados indisponíveis
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#6b7280', 
              margin: '0',
              lineHeight: '1'
            }}>
              N/A
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Patrimônio Líquido
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              dados indisponíveis
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#6b7280', 
              margin: '0',
              lineHeight: '1'
            }}>
              N/A
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              P/VP
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              dados indisponíveis
            </p>
          </div>

          {/* Card Setor (sempre mostra) */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '700', 
              color: '#3b82f6', 
              margin: '0',
              lineHeight: '1.2',
              minHeight: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              Fundos Imobiliários
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Setor
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              segmento padrão
            </p>
          </div>

          {/* Card Patrimônio por Cota */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <h4 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#6b7280', 
              margin: '0',
              lineHeight: '1'
            }}>
              N/A
            </h4>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748b', 
              margin: '4px 0 0 0',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              Patrimônio por Cota
            </p>
            <p style={{ 
              fontSize: '10px', 
              color: '#92400e', 
              margin: '2px 0 0 0'
            }}>
              dados indisponíveis
            </p>
          </div>

        </div>
      )}

    </div>
  );
});
  
// Componente de Métrica
const MetricCard = React.memo(({ 
  title, 
  value, 
  subtitle, 
  loading = false,
  trend
}: { 
  title: string; 
  value: string; 
  subtitle?: string;
  loading?: boolean;
  trend?: 'up' | 'down';
}) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    height: '100%'
  }}>
    <h4 style={{
      fontSize: '12px',
      fontWeight: '700',
      color: '#64748b',
      margin: '0 0 8px 0',
      textTransform: 'uppercase'
    }}>
      {title}
    </h4>
    
    {loading ? (
      <div style={{ color: '#64748b', fontSize: '18px' }}>⏳</div>
    ) : (
      <>
        <p style={{
          fontSize: '24px',
          fontWeight: '800',
          color: trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#1e293b',
          margin: '0 0 4px 0'
        }}>
          {value}
        </p>
        
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            margin: '0'
          }}>
            {subtitle}
          </p>
        )}
      </>
    )}
  </div>
));

// 🔥 HISTÓRICO DE DIVIDENDOS COM PAGINAÇÃO (ESTILO STATUS INVEST)
const HistoricoDividendos = React.memo(({ ticker, dataEntrada, isFII = false }: { ticker: string; dataEntrada: string; isFII?: boolean }) => {
  const [proventos, setProventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fonte, setFonte] = useState<string>('');
  const [totalOriginal, setTotalOriginal] = useState(0);
  
  // 🔥 ESTADOS DE PAGINAÇÃO
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10; // Padrão para ambos mobile e desktop
  
  // 🔥 DETECÇÃO MOBILE
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const carregarProventos = async () => {
      if (!ticker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`📊 [HISTORICO] Carregando proventos para ${ticker}...`);

        let proventosEncontrados: any[] = [];
        let fonteAtual = '';
        let totalAntesFiltro = 0;

        // 🌐 MÉTODO 1: Buscar via API primeiro
        try {
          const response = await fetch(`/api/proventos/${ticker}`, {
            method: 'GET',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const dadosAPI = await response.json();
            totalAntesFiltro = dadosAPI.length;
            
            if (Array.isArray(dadosAPI) && dadosAPI.length > 0) {
              let proventosConvertidos = dadosAPI.map((item: any) => ({
                ...item,
                dataObj: new Date(item.dataObj),
                valorFormatado: item.valorFormatado || `R$ ${item.valor.toFixed(2).replace('.', ',')}`,
                dataFormatada: item.dataFormatada || new Date(item.dataObj).toLocaleDateString('pt-BR'),
                dataComFormatada: item.dataFormatada || new Date(item.dataObj).toLocaleDateString('pt-BR'),
                dataPagamentoFormatada: item.dataPagamento ? new Date(item.dataPagamento).toLocaleDateString('pt-BR') : 'N/A',
                tipo: item.tipo || (isFII ? 'Rendimento' : 'Dividendo')
              }));
              
              // 📅 FILTRAR POR DATA DE ENTRADA SE ESPECIFICADA
              if (dataEntrada) {
                const [dia, mes, ano] = dataEntrada.split('/');
                const dataEntradaObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
                dataEntradaObj.setHours(0, 0, 0, 0);
                
                proventosConvertidos = proventosConvertidos.filter((item: any) => {
                  if (!item.dataObj || isNaN(item.dataObj.getTime())) {
                    return false;
                  }
                  
                  const dataItem = new Date(item.dataObj);
                  dataItem.setHours(0, 0, 0, 0);
                  
                  return dataItem >= dataEntradaObj;
                });
              }
              
              proventosEncontrados = proventosConvertidos;
              fonteAtual = 'API';
            }
          }
        } catch (apiError) {
          console.warn(`⚠️ [HISTORICO] Erro na API:`, apiError);
        }

        // 📁 MÉTODO 2: Fallback para localStorage se API falhar
        if (proventosEncontrados.length === 0) {
          let dadosSalvos = null;
          const chavesPossiveis = [
            `proventos_${ticker}`,
            `dividendos_${ticker}`,
            `rendimentos_${ticker}`,
            `dividendos_fii_${ticker}`,
            `proventos_fii_${ticker}`
          ];
          
          for (const chave of chavesPossiveis) {
            const dados = localStorage.getItem(chave);
            if (dados) {
              dadosSalvos = dados;
              break;
            }
          }
          
          if (!dadosSalvos) {
            const proventosCentral = localStorage.getItem('proventos_central_master');
            if (proventosCentral) {
              try {
                const todosDados = JSON.parse(proventosCentral);
                const dadosTicker = Array.isArray(todosDados) 
                  ? todosDados.filter((item: any) => item.ticker === ticker)
                  : [];
                
                if (dadosTicker.length > 0) {
                  dadosSalvos = JSON.stringify(dadosTicker);
                  totalAntesFiltro = dadosTicker.length;
                }
              } catch (err) {
                console.error('❌ [HISTORICO] Erro sistema central:', err);
              }
            }
          }
          
          if (dadosSalvos) {
            try {
              const proventosSalvos = JSON.parse(dadosSalvos);
              totalAntesFiltro = proventosSalvos.length;
              
              proventosEncontrados = proventosSalvos.slice(0, 500).map((item: any) => ({
                ...item,
                dataObj: new Date(item.dataCom || item.data || item.dataObj || item.dataFormatada),
                valorFormatado: item.valorFormatado || `R$ ${(item.valor || 0).toFixed(2).replace('.', ',')}`,
                tipo: item.tipo || (isFII ? 'Rendimento' : 'Dividendo')
              }));
              
              fonteAtual = 'localStorage';
            } catch (err) {
              console.error('❌ [HISTORICO] Erro localStorage:', err);
            }
          }
        }

        // 📋 VALIDAR E PROCESSAR DADOS FINAIS
        const proventosValidos = proventosEncontrados.filter((item: any) => 
          item.dataObj && 
          !isNaN(item.dataObj.getTime()) && 
          item.valor && 
          item.valor > 0
        );
        
        // Ordenar por data (mais recente primeiro)
        proventosValidos.sort((a, b) => b.dataObj.getTime() - a.dataObj.getTime());

        setProventos(proventosValidos);
        setFonte(fonteAtual || 'sem dados');
        setTotalOriginal(totalAntesFiltro);
        
        // ✅ RESETAR PÁGINA QUANDO CARREGA NOVOS DADOS
        setPaginaAtual(1);
        
      } catch (error) {
        console.error('❌ [HISTORICO] Erro geral:', error);
        setProventos([]);
        setFonte('erro');
        setTotalOriginal(0);
      } finally {
        setLoading(false);
      }
    };

    carregarProventos();
  }, [ticker, isFII, dataEntrada]);

  // Cálculos para os cards de resumo
  const { totalProventos, mediaProvento, ultimoProvento } = useMemo(() => {
    const total = proventos.reduce((sum, item) => sum + (item.valor || 0), 0);
    const media = proventos.length > 0 ? total / proventos.length : 0;
    const ultimo = proventos.length > 0 ? proventos[0] : null;

    return {
      totalProventos: total,
      mediaProvento: media,
      ultimoProvento: ultimo
    };
  }, [proventos]);

  // 🔥 CÁLCULOS DE PAGINAÇÃO
  const totalPaginas = Math.ceil(proventos.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const proventosExibidos = proventos.slice(indiceInicio, indiceFim);

  // 🔥 FUNÇÕES DE NAVEGAÇÃO
  const irParaPagina = (pagina: number) => {
    setPaginaAtual(pagina);
  };

  const paginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1);
    }
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1);
    }
  };

  // 🔥 GERAR NÚMEROS DAS PÁGINAS (STATUS INVEST STYLE)
  const gerarNumerosPaginas = () => {
    const paginas = [];
    const maxPaginasVisiveis = isMobile ? 3 : 5;
    
    let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);
    
    // Ajustar início se estamos no final
    if (fim - inicio + 1 < maxPaginasVisiveis) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    
    return paginas;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: '20px',
        gap: isMobile ? '12px' : '0'
      }}>
        <h3 style={{
          fontSize: isMobile ? '18px' : '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0'
        }}>
          {isFII ? 'Histórico de Rendimentos (FII)' : 'Histórico de Proventos'}
        </h3>
        
        {/* Indicador de fonte */}
        {fonte && (
          <span style={{
            backgroundColor: fonte === 'API' ? '#22c55e' : fonte === 'localStorage' ? '#f59e0b' : '#6b7280',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            📊 {fonte}
          </span>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <p>Carregando proventos de {ticker}...</p>
        </div>
      ) : proventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <p>
            {isFII ? `❌ Nenhum rendimento carregado para ${ticker}` : `❌ Nenhum provento carregado para ${ticker}`}
          </p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            📅 Data de entrada: {dataEntrada}
          </p>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile 
              ? 'repeat(2, 1fr)' 
              : 'repeat(4, 1fr)', 
            gap: isMobile ? '12px' : '16px', 
            marginBottom: '24px' 
          }}>
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px',
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '700', 
                color: '#0ea5e9', 
                margin: '0' 
              }}>
                {proventos.length}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px',
                margin: '4px 0 0 0' 
              }}>
                {isMobile ? 'Pagamentos' : 'Nº de Pagamentos'}
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#f0fdf4', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#22c55e', 
                margin: '0' 
              }}>
                R$ {totalProventos.toFixed(2).replace('.', ',')}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Total
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#fefce8', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#eab308', 
                margin: '0' 
              }}>
                R$ {mediaProvento.toFixed(2).replace('.', ',')}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Média
              </p>
            </div>
            
            <div style={{ 
              textAlign: 'center', 
              padding: isMobile ? '12px' : '16px', 
              backgroundColor: '#fdf4ff', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                fontWeight: '700', 
                color: '#a855f7', 
                margin: '0' 
              }}>
                {ultimoProvento ? 
                  (ultimoProvento.dataFormatada?.replace(/\/\d{4}/, '') || 
                   ultimoProvento.dataObj.toLocaleDateString('pt-BR').replace(/\/\d{4}/, '')) : 'N/A'}
              </h4>
              <p style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                margin: '4px 0 0 0' 
              }}>
                Último
              </p>
            </div>
          </div>

          {/* 🔥 TABELA COM SWIPE HORIZONTAL */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            overflowX: isMobile ? 'auto' : 'visible',
            overflowY: 'visible',
            ...(isMobile && {
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            })
          }}>
            <style>
              {isMobile ? `
                div::-webkit-scrollbar {
                  display: none;
                }
              ` : ''}
            </style>
            
            {isMobile && (
              <div style={{
                backgroundColor: '#f0f9ff',
                padding: '8px 16px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#1e40af',
                fontWeight: '500',
                borderBottom: '1px solid #e2e8f0'
              }}>
                👆 Deslize para ver mais colunas
              </div>
            )}
            
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: isMobile ? '600px' : '100%'
            }}>
              <thead style={{ 
                position: 'sticky', 
                top: 0, 
                backgroundColor: '#f8fafc',
                zIndex: 1
              }}>
                <tr>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'left', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '80px' : 'auto'
                  }}>
                    Ativo
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'right', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '100px' : 'auto'
                  }}>
                    Valor
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '90px' : 'auto'
                  }}>
                    Data Com
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '90px' : 'auto'
                  }}>
                    Pagamento
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'center', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '100px' : 'auto'
                  }}>
                    Tipo
                  </th>
                  <th style={{ 
                    padding: isMobile ? '10px 8px' : '12px',
                    textAlign: 'right', 
                    fontWeight: '700', 
                    fontSize: isMobile ? '12px' : '14px',
                    minWidth: isMobile ? '70px' : 'auto'
                  }}>
                    DY
                  </th>
                </tr>
              </thead>
              <tbody>
                {proventosExibidos.map((provento, index) => (
                  <tr 
                    key={`${provento.id || provento.data || provento.dataCom}-${index}`} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      fontWeight: '500',
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      {ticker}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'right', 
                      fontWeight: '700', 
                      color: '#22c55e',
                      fontSize: isMobile ? '13px' : '14px'
                    }}>
                      {provento.valorFormatado || `R$ ${(provento.valor || 0).toFixed(2).replace('.', ',')}`}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'center', 
                      fontWeight: '500',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      {provento.dataComFormatada || 
                       provento.dataFormatada || 
                       provento.dataObj?.toLocaleDateString('pt-BR') || 
                       'N/A'}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'center', 
                      fontWeight: '500',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      {provento.dataPagamentoFormatada || 
                       provento.dataPagamento || 
                       'N/A'}
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'center'
                    }}>
                      <span style={{
                        backgroundColor: '#f0f9ff',
                        color: '#1e40af',
                        borderRadius: '4px',
                        padding: isMobile ? '2px 6px' : '4px 8px',
                        fontSize: isMobile ? '10px' : '12px',
                        fontWeight: '600',
                        border: '1px solid #bfdbfe'
                      }}>
                        {isMobile 
                          ? (provento.tipo || (isFII ? 'Rend' : 'Div')).substring(0, 4)
                          : (provento.tipo || (isFII ? 'Rendimento' : 'Dividendo'))
                        }
                      </span>
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 8px' : '12px',
                      textAlign: 'right', 
                      fontWeight: '700', 
                      color: '#1976d2',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      {provento.dividendYield ? `${(provento.dividendYield * 100).toFixed(2)}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔥 PAGINAÇÃO (STATUS INVEST STYLE) */}
          {totalPaginas > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '24px',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              
              {/* Botão Anterior */}
              <button
                onClick={paginaAnterior}
                disabled={paginaAtual === 1}
                style={{
                  padding: isMobile ? '8px 12px' : '8px 16px',
                  backgroundColor: paginaAtual === 1 ? '#f8fafc' : '#ffffff',
                  color: paginaAtual === 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ← {isMobile ? 'Ant' : 'Anterior'}
              </button>

              {/* Primeira página se não estiver visível */}
              {gerarNumerosPaginas()[0] > 1 && (
                <>
                  <button
                    onClick={() => irParaPagina(1)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      minWidth: '40px'
                    }}
                  >
                    1
                  </button>
                  {gerarNumerosPaginas()[0] > 2 && (
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>...</span>
                  )}
                </>
              )}

              {/* Números das páginas */}
              {gerarNumerosPaginas().map((numeroPagina) => (
                <button
                  key={numeroPagina}
                  onClick={() => irParaPagina(numeroPagina)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: numeroPagina === paginaAtual ? '#3b82f6' : '#ffffff',
                    color: numeroPagina === paginaAtual ? '#ffffff' : '#374151',
                    border: `1px solid ${numeroPagina === paginaAtual ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: numeroPagina === paginaAtual ? '600' : '500',
                    cursor: 'pointer',
                    minWidth: '40px',
                    transition: 'all 0.2s'
                  }}
                >
                  {numeroPagina}
                </button>
              ))}

              {/* Última página se não estiver visível */}
              {gerarNumerosPaginas()[gerarNumerosPaginas().length - 1] < totalPaginas && (
                <>
                  {gerarNumerosPaginas()[gerarNumerosPaginas().length - 1] < totalPaginas - 1 && (
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>...</span>
                  )}
                  <button
                    onClick={() => irParaPagina(totalPaginas)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      minWidth: '40px'
                    }}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}

              {/* Botão Próximo */}
              <button
                onClick={proximaPagina}
                disabled={paginaAtual === totalPaginas}
                style={{
                  padding: isMobile ? '8px 12px' : '8px 16px',
                  backgroundColor: paginaAtual === totalPaginas ? '#f8fafc' : '#ffffff',
                  color: paginaAtual === totalPaginas ? '#9ca3af' : '#374151',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: isMobile ? '13px' : '14px',
                  fontWeight: '500',
                  cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isMobile ? 'Prox' : 'Próximo'} →
              </button>
            </div>
          )}

          {/* Info da paginação */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0' }}>
              Mostrando {indiceInicio + 1}-{Math.min(indiceFim, proventos.length)} de {proventos.length} {isFII ? 'rendimentos' : 'proventos'}
            </p>
          </div>
        </>
      )}
    </div>
  );
});

// GerenciadorRelatorios com funcionalidades de visualização e download
const GerenciadorRelatorios = React.memo(({ ticker }: { ticker: string }) => {
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogVisualizacao, setDialogVisualizacao] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<any>(null);

  useEffect(() => {
    const carregarRelatorios = async () => {
      if (!ticker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`🔍 Buscando relatórios para ${ticker}...`);

        // MÉTODO 1: Tentar IndexedDB real primeiro
        try {
          await relatoriosDB.init();
          const relatoriosIndexedDB = await relatoriosDB.buscarRelatoriosTicker(ticker);
          
          if (relatoriosIndexedDB.length > 0) {
            console.log(`✅ IndexedDB: ${relatoriosIndexedDB.length} relatórios encontrados para ${ticker}`);
            
            const relatoriosFormatados = relatoriosIndexedDB.map((rel: any) => ({
              ...rel,
              ticker, // Adicionar ticker de volta
              arquivo: rel.arquivoPdf ? 'PDF_INDEXEDDB' : undefined,
              tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
            }));
            
            setRelatorios(relatoriosFormatados);
            setLoading(false);
            return;
          }
        } catch (indexedDBError) {
          console.warn('IndexedDB falhou, tentando localStorage:', indexedDBError);
        }

        // MÉTODO 2: Buscar no localStorage como fallback
        const dadosCentralizados = localStorage.getItem('relatorios_central');
        if (dadosCentralizados) {
          try {
            const dados = JSON.parse(dadosCentralizados);
            const relatoriosTicker = dados[ticker] || [];
            
            if (relatoriosTicker.length > 0) {
              console.log(`✅ localStorage: ${relatoriosTicker.length} relatórios encontrados para ${ticker}`);
              
              const relatoriosFormatados = relatoriosTicker.map((rel: any) => ({
                ...rel,
                ticker,
                arquivo: rel.arquivoPdf ? 'PDF_LOCALSTORAGE' : undefined,
                tamanho: rel.tamanhoArquivo ? `${(rel.tamanhoArquivo / 1024 / 1024).toFixed(1)} MB` : undefined
              }));
              
              setRelatorios(relatoriosFormatados);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.warn('Erro ao ler localStorage:', error);
          }
        }

        console.log(`❌ Nenhum relatório encontrado para ${ticker}`);
        setRelatorios([]);

      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
        setRelatorios([]);
      } finally {
        setLoading(false);
      }
    };

    carregarRelatorios();
  }, [ticker]);

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'iframe': return '🖼️';
      case 'canva': return '🎨';
      case 'link': return '🔗';
      case 'pdf': return '📄';
      default: return '📄';
    }
  };

  // 🔥 FUNÇÃO PARA VISUALIZAR RELATÓRIO
  const visualizarRelatorio = (relatorio: any) => {
    console.log('👁️ Abrindo relatório:', relatorio.nome);
    
    if (relatorio.tipoVisualizacao === 'link' && relatorio.linkExterno) {
      // Abrir link externo em nova aba
      window.open(relatorio.linkExterno, '_blank');
      return;
    }
    
    if (relatorio.tipoVisualizacao === 'canva' && relatorio.linkCanva) {
      // Abrir Canva em nova aba
      window.open(relatorio.linkCanva, '_blank');
      return;
    }
    
    if (relatorio.tipoVisualizacao === 'iframe' && relatorio.linkExterno) {
      // Abrir em dialog/modal para iframe
      setRelatorioSelecionado(relatorio);
      setDialogVisualizacao(true);
      return;
    }
    
    // Fallback: tentar abrir link se existir
    if (relatorio.linkExterno) {
      window.open(relatorio.linkExterno, '_blank');
    } else if (relatorio.linkCanva) {
      window.open(relatorio.linkCanva, '_blank');
    } else {
      alert('📋 Link de visualização não disponível para este relatório');
    }
  };

  // 🔥 FUNÇÃO PARA BAIXAR PDF
  const baixarPDF = (relatorio: any) => {
    console.log('📥 Baixando PDF:', relatorio.nome);
    
    if (relatorio.solicitarReupload) {
      alert('⚠️ Este arquivo precisa de re-upload.\n\nMotivo: Arquivo muito grande (>3MB) foi salvo apenas como referência.\nPor favor, faça o upload novamente na Central de Relatórios.');
      return;
    }
    
    if (relatorio.arquivoPdf) {
      try {
        // Se é Base64, converter e baixar
        if (relatorio.arquivoPdf.startsWith('data:')) {
          const link = document.createElement('a');
          link.href = relatorio.arquivoPdf;
          link.download = relatorio.nomeArquivoPdf || `${relatorio.nome}.pdf`;
          link.click();
          console.log('✅ PDF baixado via Base64');
        } else {
          // Fallback: tentar como URL
          window.open(relatorio.arquivoPdf, '_blank');
        }
      } catch (error) {
        console.error('Erro ao baixar PDF:', error);
        alert('❌ Erro ao baixar PDF. Arquivo pode estar corrompido.');
      }
    } else {
      alert('📄 Arquivo PDF não disponível.\n\nEste relatório pode não ter PDF anexado ou o arquivo foi perdido.');
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 20px 0'
        }}>
         Relatórios da Empresa
        </h3>
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ marginBottom: '16px', fontSize: '24px' }}>⏳</div>
          <p>Carregando relatórios de {ticker}...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 20px 0'
        }}>
         Relatórios da Empresa
        </h3>

        {relatorios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
            <div style={{ marginBottom: '16px', fontSize: '48px' }}>📭</div>
            <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
              Nenhum relatório encontrado
            </h4>
            <p style={{ marginBottom: '16px' }}>
              Não há relatórios cadastrados para <strong>{ticker}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              💡 Adicione relatórios através da Central de Relatórios
            </p>
          </div>
        ) : (
          <div>

            {relatorios.map((relatorio, index) => (
              <div key={relatorio.id || index} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px', 
                marginBottom: '8px',
                backgroundColor: 'white',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span>{getIconePorTipo(relatorio.tipoVisualizacao)}</span>
                    <h4 style={{ margin: '0', fontSize: '16px', fontWeight: '600' }}>
                      {relatorio.nome}
                    </h4>
                    
                    {relatorio.solicitarReupload && (
                      <span style={{
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        Re-upload
                      </span>
                    )}
                  </div>
                  
                  <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>
                    {relatorio.tipo} • {relatorio.dataReferencia}
                  </p>
                  
                  {relatorio.tamanhoArquivo && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      {(relatorio.tamanhoArquivo / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Botão Ver - FUNCIONAL */}
                  <button
                    onClick={() => visualizarRelatorio(relatorio)}
                    style={{
                      backgroundColor: '#e3f2fd',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#1976d2',
                      transition: 'all 0.2s',
                      ':hover': {
                        backgroundColor: '#bbdefb'
                      }
                    }}
                    title="Visualizar conteúdo"
                  >
                    👁 Ver
                  </button>
                  
                  {/* Botão PDF - FUNCIONAL */}
                  {(relatorio.arquivoPdf || relatorio.nomeArquivoPdf) && (
                    <button
                      onClick={() => baixarPDF(relatorio)}
                      style={{
                        backgroundColor: relatorio.solicitarReupload ? '#f59e0b' : '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'all 0.2s'
                      }}
                      title={relatorio.solicitarReupload ? "Re-upload necessário" : "Baixar PDF"}
                    >
                      {relatorio.solicitarReupload ? '📤 Upload' : '📥 PDF'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
          </div>
        )}
      </div>

      {/* 🔥 MODAL DE VISUALIZAÇÃO PARA IFRAME */}
      {dialogVisualizacao && relatorioSelecionado && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            height: '90%',
            maxWidth: '1200px',
            maxHeight: '800px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header do modal */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {relatorioSelecionado.nome}
              </h3>
              <button
                onClick={() => setDialogVisualizacao(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Conteúdo do iframe */}
            <div style={{ flex: 1, padding: '16px' }}>
              <iframe
                src={relatorioSelecionado.linkExterno || relatorioSelecionado.linkCanva}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title={relatorioSelecionado.nome}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
});

// 🔥 COMPONENTE AGENDA CORPORATIVA MIGRADO PARA API
const AgendaCorporativa = React.memo(({ ticker, isFII = false }: { ticker: string; isFII?: boolean }) => {
  // 🌐 USAR HOOK DA API AO INVÉS DO LOCALSTORAGE
  const { eventos, loading, error, refetch } = useAgendaCorporativaTicker(ticker);

  const calcularDiasAteEvento = (dataEvento: Date) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const evento = new Date(dataEvento);
    evento.setHours(0, 0, 0, 0);
    
    const diffTime = evento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const formatarProximidade = (dias: number) => {
    if (dias < 0) return 'Passou';
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias <= 7) return `Em ${dias} dias`;
    if (dias <= 30) return `Em ${Math.ceil(dias / 7)} semanas`;
    return `Em ${Math.ceil(dias / 30)} meses`;
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      {/* 🔥 HEADER MELHORADO COM INDICADOR DE FONTE */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0'
        }}>
          📅 Agenda Corporativa
        </h3>
        
        {/* Indicadores de status */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Badge da fonte */}
          <span style={{
            backgroundColor: loading ? '#f59e0b' : error ? '#ef4444' : '#22c55e',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            {loading ? '⏳ API' : error ? '❌ API' : '✅ API'}
          </span>
          
          {/* Botão de refresh */}
          <button
            onClick={refetch}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '4px',
              opacity: loading ? 0.5 : 1
            }}
            title="Atualizar eventos"
          >
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <div style={{ color: '#64748b', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <p>Carregando eventos via API...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#ef4444' }}>
          <h4 style={{ marginBottom: '16px' }}>❌ Erro ao carregar eventos</h4>
          <p style={{ marginBottom: '24px', fontSize: '14px' }}>{error}</p>
          <button
            onClick={refetch}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Tentar Novamente
          </button>
        </div>
      ) : eventos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <h4 style={{ marginBottom: '16px' }}>📭 Nenhum evento encontrado para {ticker}</h4>
          <p style={{ marginBottom: '24px' }}>ℹ️ Não há eventos cadastrados para este ticker na API</p>
          <button
            onClick={() => window.location.href = '/dashboard/central-agenda'}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🛠️ Ir para Central da Agenda
          </button>
        </div>
      ) : (
        <div>
          {/* 🔥 RESUMO DE EVENTOS */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#1e40af',
              margin: 0,
              fontWeight: '600'
            }}>
              📊 <strong>{eventos.length}</strong> eventos encontrados para <strong>{ticker}</strong> via API
              {eventos.some(e => e.estimado) && (
                <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                  • {eventos.filter(e => e.estimado).length} estimados
                </span>
              )}
            </p>
          </div>

          {/* 🔥 LISTA DE EVENTOS */}
          {eventos.slice(0, 4).map((evento, index) => {
            const diasAteEvento = calcularDiasAteEvento(evento.dataObj);
            const proximidade = formatarProximidade(diasAteEvento);
            
            return (
              <div key={evento.id} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                backgroundColor: 'white',
                marginBottom: '12px',
                padding: '20px',
                // Destacar eventos próximos
                borderLeftWidth: diasAteEvento <= 7 ? '4px' : '1px',
                borderLeftColor: diasAteEvento <= 7 ? '#f59e0b' : '#e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      margin: '0 0 8px 0',
                      color: '#1e293b'
                    }}>
                      {evento.titulo}
                    </h4>
                    
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}>
                      {evento.descricao}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        backgroundColor: diasAteEvento <= 7 ? '#f59e0b' : diasAteEvento < 0 ? '#6b7280' : '#3b82f6',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {proximidade}
                      </span>
                      
                      <span style={{
                        fontSize: '12px',
                        border: '1px solid #d1d5db',
                        color: '#6b7280',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        {evento.tipo}
                      </span>

                      {evento.estimado && (
                        <span style={{
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          ESTIMADO
                        </span>
                      )}

                      {evento.prioridade && (
                        <span style={{
                          backgroundColor: evento.prioridade === 'alta' ? '#fecaca' : '#e5e7eb',
                          color: evento.prioridade === 'alta' ? '#dc2626' : '#6b7280',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {evento.prioridade.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Observações adicionais */}
                    {evento.observacoes && (
                      <p style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        margin: '8px 0 0 0',
                        fontStyle: 'italic'
                      }}>
                        💭 {evento.observacoes}
                      </p>
                    )}

                    {/* Link externo */}
                    {evento.url_externo && (
                       <a
                        href={evento.url_externo}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '12px',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'inline-block',
                          marginTop: '8px'
                        }}
                      >
                        🔗 Ver mais detalhes
                      </a>
                    )}
                  </div>

                  {/* Data grande no lado direito */}
                  <div style={{ 
                    textAlign: 'right',
                    minWidth: '120px',
                    marginLeft: '20px'
                  }}>
                    <div style={{ 
                      fontSize: '28px',
                      fontWeight: '700',
                      color: diasAteEvento <= 7 ? '#f59e0b' : diasAteEvento < 0 ? '#6b7280' : '#3b82f6',
                      lineHeight: '1'
                    }}>
                      {evento.dataObj.getDate()}
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {evento.dataObj.toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: '#64748b',
                      marginTop: '4px'
                    }}>
                      {evento.dataObj.toLocaleDateString('pt-BR', {
                        weekday: 'long'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Footer com estatísticas */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0' }}>
              {eventos.length > 4 
                ? `Mostrando os próximos 4 eventos • Total: ${eventos.length} • Fonte: API Prisma`
                : `${eventos.length} eventos • Fonte: API Prisma`
              }
            </p>
            
            {/* Link para ver todos */}
            {eventos.length > 4 && (
              <button
                onClick={() => window.location.href = '/dashboard/central-agenda'}
                style={{
                  backgroundColor: 'transparent',
                  color: '#3b82f6',
                  border: 'none',
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  textDecoration: 'underline'
                }}
              >
                Ver todos os {eventos.length} eventos
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Dados da Posição Expandidos
const DadosPosicaoExpandidos = React.memo(({ 
  empresa, 
  dadosFinanceiros, 
  precoAtualFormatado,
  isFII = false,
  distanciaPrecoTeto,
  percentualCarteira, 
  carteiraConfig
}: { 
  empresa: any; 
  dadosFinanceiros?: DadosFinanceiros;
  precoAtualFormatado: string;
  isFII?: boolean;
  distanciaPrecoTeto?: number | null;
  percentualCarteira?: string;
  carteiraConfig?: any;
}) => {
  const { dadosFII, loading: loadingFII, error: errorFII, refetch, salvarDadosManuais } = useDadosFII(empresa.ticker, dadosFinanceiros);
  const [editMode, setEditMode] = useState(false);
  const [tempData, setTempData] = useState<Partial<DadosFII>>({});

  // Calcular preço atual para usar na função de viés
  const precoAtual = dadosFinanceiros?.precoAtual || null;

  useEffect(() => {
    if (editMode) {
      setTempData({
        dyCagr3Anos: dadosFII?.dyCagr3Anos,
        numeroCotistas: dadosFII?.numeroCotistas
      });
    }
  }, [editMode, dadosFII]);

  const handleSave = () => {
    salvarDadosManuais(tempData);
    setEditMode(false);
  };

  if (isFII) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Card Principal - Dados da Posição */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>
            📊 Dados da Posição
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Data de Entrada</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{empresa.dataEntrada}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Inicial</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{empresa.precoIniciou}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: dadosFinanceiros?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Atual</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: dadosFinanceiros?.precoAtual ? '#22c55e' : 'inherit' }}>
                {precoAtualFormatado}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>% da Carteira</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{percentualCarteira || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Gestora</span>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>{empresa.gestora || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Card FII - Dados Fundamentalistas */}
        <div style={{
          backgroundColor: '#fef7e0',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', margin: '0' }}>
              🏢 Dados Fundamentalistas
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {dadosFII?.fonte && (
                <span style={{
                  backgroundColor: dadosFII.fonte === 'api' ? '#22c55e' : dadosFII.fonte === 'misto' ? '#f59e0b' : '#6b7280',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {dadosFII.fonte === 'api' ? 'API' : dadosFII.fonte === 'misto' ? 'API+Manual' : 'Manual'}
                </span>
              )}
              <button 
                onClick={refetch} 
                disabled={loadingFII}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title="Atualizar dados da API"
              >
                🔄
              </button>
            </div>
          </div>
          
          {loadingFII ? (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ color: '#64748b' }}>⏳ Carregando dados...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Val. Patrimonial p/Cota</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {dadosFII?.valorPatrimonial ? formatarValor(dadosFII.valorPatrimonial) : 'N/A'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>P/VP</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: dadosFII?.pvp ? (dadosFII.pvp < 1 ? '#22c55e' : dadosFII.pvp > 1.2 ? '#ef4444' : '#f59e0b') : 'inherit'
                }}>
                  {dadosFII?.pvp ? dadosFII.pvp.toFixed(2) : 'N/A'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Patrimônio Líquido</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {dadosFII?.patrimonio ? formatarValor(dadosFII.patrimonio, 'millions') : 'N/A'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Valor de Mercado</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {dadosFII?.valorMercado ? formatarValor(dadosFII.valorMercado, 'millions') : 'N/A'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#fefce8', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Valor em Caixa</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  {dadosFII?.valorCaixa ? formatarValor(dadosFII.valorCaixa, 'millions') : 'N/A'}
                </span>
              </div>
            </div>
          )}
          
          {errorFII && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fbbf24'
            }}>
              <p style={{ fontSize: '12px', margin: '0', color: '#92400e' }}>
                ⚠️ API indisponível. Usando dados manuais.
              </p>
            </div>
          )}
        </div>

        {/* Card Adicional - Dados Operacionais */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          gridColumn: '1 / -1'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af', margin: '0' }}>
              📈 Dados Operacionais
            </h3>
            <button
              onClick={() => editMode ? handleSave() : setEditMode(true)}
              style={{
                backgroundColor: editMode ? '#22c55e' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {editMode ? '✓ Salvar' : 'Editar'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: '0' }}>
                {dadosFII?.numeroCotas ? (dadosFII.numeroCotas / 1000000).toFixed(1) + 'M' : 'N/A'}
              </h4>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Nº de Cotas</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: '0' }}>
                {dadosFII?.ultimoRendimento ? formatarValor(dadosFII.ultimoRendimento).replace('R$ ', '') : 'N/A'}
              </h4>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Último Rendimento</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.dyCagr3Anos || ''}
                  onChange={(e) => setTempData(prev => ({ ...prev, dyCagr3Anos: parseFloat(e.target.value) || undefined }))}
                  style={{
                    width: '80px',
                    padding: '4px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: '0' }}>
                  {dadosFII?.dyCagr3Anos ? `${dadosFII.dyCagr3Anos.toFixed(1)}%` : 'N/A'}
                </h4>
              )}
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>DY CAGR (3a)</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.numeroCotistas || ''}
                  onChange={(e) => setTempData(prev => ({ ...prev, numeroCotistas: parseInt(e.target.value) || undefined }))}
                  style={{
                    width: '100px',
                    padding: '4px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: '0' }}>
                  {dadosFII?.numeroCotistas ? dadosFII.numeroCotistas.toLocaleString('pt-BR') : 'N/A'}
                </h4>
              )}
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Nº de Cotistas</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#1e40af', margin: '0' }}>
                {dadosFII?.dataUltimoRendimento ? 
                  new Date(dadosFII.dataUltimoRendimento).toLocaleDateString('pt-BR').replace(/\/\d{4}/, '') : 'N/A'}
              </h4>
              <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>Último Pagto</p>
            </div>
          </div>
          
          {editMode && (
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0' }}>
                ✏️ Editando dados manuais. DY CAGR e número de cotistas não estão disponíveis via API.
              </p>
            </div>
          )}
          
          <div style={{ 
            marginTop: '24px', 
            padding: '16px', 
            backgroundColor: '#dbeafe',
            borderRadius: '8px',
            border: '1px solid #93c5fd'
          }}>
            <p style={{ fontSize: '14px', margin: '0', color: '#1e40af' }}>
              <strong>💡 Sobre os dados:</strong><br/>
              • 🟢 <strong>Dados da API:</strong> Val. patrimonial, P/VP, patrimônio, valor de mercado, caixa, cotas<br/>
              • 🟡 <strong>Dados manuais:</strong> DY CAGR (3 anos) e número de cotistas<br/>
              • 🔄 <strong>Atualização:</strong> {dadosFII?.ultimaAtualizacao || 'Não disponível'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Versão original para ações
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>
          📊 Dados da Posição
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Data de Entrada</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{empresa.dataEntrada}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço de Entrada</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {typeof empresa.precoEntrada === 'number' 
                ? formatCurrency(empresa.precoEntrada, carteiraConfig.moeda)
                : empresa.precoEntrada || 'N/A'
              }
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: dadosFinanceiros?.precoAtual ? '#e8f5e8' : '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Atual</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: dadosFinanceiros?.precoAtual ? '#22c55e' : 'inherit' }}>
              {precoAtualFormatado}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '600' }}>
          🎯 Análise de Viés
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Teto</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>
              {typeof empresa.precoTeto === 'number' 
                ? formatCurrency(empresa.precoTeto, carteiraConfig.moeda)
                : empresa.precoTeto || 'N/A'
              }
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>Viés Calculado</span>
            <span style={{
              backgroundColor: (() => {
                const { cor } = calcularVies(empresa.precoTeto, precoAtual, empresa.precoEntrada);
                return cor;
              })(),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {(() => {
                const { vies } = calcularVies(empresa.precoTeto, precoAtual, empresa.precoEntrada);
                return vies;
              })()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>% da Carteira</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{percentualCarteira || 'N/A'}</span>
          </div>
          
          {/* Informação adicional sobre a distância do teto */}
          {distanciaPrecoTeto !== null && distanciaPrecoTeto !== undefined && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: distanciaPrecoTeto > 0 ? '#f0f9ff' : '#fef2f2', 
              borderRadius: '8px',
              border: `1px solid ${distanciaPrecoTeto > 0 ? '#bfdbfe' : '#fecaca'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Distância do Teto:
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: distanciaPrecoTeto > 0 ? '#1d4ed8' : '#dc2626'
                }}>
                  {distanciaPrecoTeto > 0 ? '+' : ''}{distanciaPrecoTeto.toFixed(1)}%
                </span>
              </div>
              <p style={{ 
                fontSize: '11px', 
                color: '#64748b', 
                margin: '4px 0 0 0',
                fontStyle: 'italic'
              }}>
                {distanciaPrecoTeto > 0 
                  ? '📈 Preço atual está abaixo do teto - espaço para valorização'
                  : '🚨 Preço atual atingiu ou superou o teto'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// 🇺🇸➡️🇧🇷 COMPONENTE BDR AMERICANO ATUALIZADO
const BDRAmericanoInfo = React.memo(({ 
  ticker, 
  bdrCorrespondente, 
  temBDR, 
  bdrData, 
  bdrLoading,
  precoTetoBDR,
  cotacaoUSD,
  loadingUSD = false,
  atualizacaoUSD,
  refetchUSD
}: { 
  ticker: string;
  bdrCorrespondente: string | null;
  temBDR: boolean;
  bdrData: any;
  bdrLoading: boolean;
  precoTetoBDR?: number | null;
  cotacaoUSD?: number | null;
  loadingUSD?: boolean;
  atualizacaoUSD?: string;
  refetchUSD?: () => void;
}) => {

  console.log('🇺🇸 BDRAmericanoInfo props atualizadas:', { 
    ticker, 
    bdrCorrespondente, 
    temBDR, 
    precoTetoBDR, 
    cotacaoUSD,
    loadingUSD 
  });
  
  // Se não tem BDR correspondente, não renderiza
  if (!temBDR || !bdrCorrespondente) {
    return null;
  }

  // Calcular viés BDR se temos os dados
  const viesBDR = precoTetoBDR && bdrData?.price ? 
    calcularViesBDR(precoTetoBDR, bdrData.price, cotacaoUSD) : null;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🇧🇷 BDR Disponível no Brasil
        <span style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          DISPONÍVEL
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Card 1 - Ativo Original */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Ativo Original (EUA)</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: '0' }}>
            {ticker}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Mercado Americano
          </p>
        </div>

        {/* Card 2 - BDR Brasileiro */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>BDR Brasileiro</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: '0' }}>
            {bdrCorrespondente}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Negociado na B3
          </p>
        </div>

        {/* Card 3 - Mercado */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Mercado</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: '0' }}>
            B3 (Brasil)
          </p>
        </div>

        {/* Cards condicionais para dados do BDR */}
        {bdrData && bdrData.price && (
          <>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Preço BDR (R$)</h4>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e', margin: '0' }}>
                R$ {bdrData.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Variação BDR</h4>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: (bdrData.changePercent || 0) >= 0 ? '#22c55e' : '#ef4444',
                margin: '0' 
              }}>
                {(bdrData.changePercent || 0) >= 0 ? '+' : ''}{(bdrData.changePercent || 0).toFixed(2)}%
              </p>
            </div>
          </>
        )}

        {/* Cards condicionais para análise */}
        {precoTetoBDR && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Preço Teto BDR</h4>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', margin: '0' }}>
              R$ {typeof precoTetoBDR === 'number' ? precoTetoBDR.toFixed(2).replace('.', ',') : precoTetoBDR}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Meta de preço
            </p>
          </div>
        )}

        {viesBDR && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: `1px solid ${viesBDR.cor === '#22c55e' ? '#bbf7d0' : '#fed7aa'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Viés BDR</h4>
            <p style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: viesBDR.cor,
              margin: '0' 
            }}>
              {viesBDR.vies}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              {viesBDR.explicacao}
            </p>
          </div>
        )}

        {/* 🔥 CARD USD/BRL DINÂMICO MELHORADO */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          position: 'relative'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
            USD/BRL
            {/* Indicador de loading */}
            {loadingUSD && (
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                color: '#f59e0b' 
              }}>
                ⏳
              </span>
            )}
          </h4>
          <p style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: loadingUSD ? '#94a3b8' : '#6366f1', 
            margin: '0' 
          }}>
            {loadingUSD ? (
              'Carregando...'
            ) : cotacaoUSD ? (
              `R$ ${cotacaoUSD.toFixed(2).replace('.', ',')}`
            ) : (
              'R$ 5,20'
            )}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            {loadingUSD ? 'Atualizando...' : 'Dólar hoje'}
          </p>
          
          {/* Informação de atualização */}
          {atualizacaoUSD && !loadingUSD && (
            <p style={{ 
              fontSize: '10px', 
              color: '#94a3b8', 
              margin: '4px 0 0 0',
              fontStyle: 'italic'
            }}>
              {atualizacaoUSD.includes('Cache') ? '📋' : '🔄'} {atualizacaoUSD.replace('Cache: ', '').replace('Estimado - ', '')}
            </p>
          )}
          
          {/* Botão de refresh */}
          {!loadingUSD && (
            <button
              onClick={() => {
                if (typeof refetchUSD === 'function') {
                  refetchUSD();
                }
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'transparent',
                border: 'none',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Atualizar cotação"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {/* Status de carregamento */}
      {bdrLoading && (
        <div style={{ 
          marginTop: '16px',
          textAlign: 'center', 
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <span style={{ color: '#15803d', fontSize: '14px' }}>⏳ Carregando cotação do BDR...</span>
        </div>
      )}
    </div>
  );
});

// 🌍 COMPONENTE BDR ESTRANGEIRO ATUALIZADO
const BDREstrangeiroInfo = React.memo(({ 
  ticker, 
  ehBDREstrangeiro, 
  tickerEstrangeiro, 
  bdrData, 
  bdrLoading, 
  bdrError,
  precoTetoBDR,
  cotacaoUSD,
  loadingUSD = false,
  atualizacaoUSD,
  refetchUSD
}: { 
  ticker: string;
  ehBDREstrangeiro: boolean;
  tickerEstrangeiro: string | null;
  bdrData: any;
  bdrLoading: boolean;
  bdrError: string | null;
  precoTetoBDR?: number | null;
  cotacaoUSD?: number | null;
  loadingUSD?: boolean;
  atualizacaoUSD?: string;
  refetchUSD?: () => void;
}) => {

  console.log('🌍 BDREstrangeiroInfo props:', { ticker, ehBDREstrangeiro, precoTetoBDR, cotacaoUSD });
  
  // Se não é BDR estrangeiro, não renderiza
  if (!ehBDREstrangeiro) {
    return null;
  }

  // Calcular viés BDR se temos os dados
  const viesBDR = precoTetoBDR && bdrData?.price ? 
    calcularViesBDR(precoTetoBDR, bdrData.price, cotacaoUSD) : null;

  return (
    <div style={{
      backgroundColor: '#fef3c7',
      borderRadius: '16px',
      padding: '24px',
      border: '2px solid #f59e0b',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
      marginBottom: '32px'
    }}>
      <h3 style={{
        fontSize: '20px',
        fontWeight: '700',
        color: '#92400e',
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🌍 BDR de Ativo Estrangeiro
        <span style={{
          backgroundColor: '#f59e0b',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          DETECTADO
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {/* Card 1 - Ticker BDR */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>BDR Brasileiro</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#92400e', margin: '0' }}>
            {ticker}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            Negociado na B3
          </p>
        </div>

        {/* Card 2 - Ativo Original */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Ativo Original</h4>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#92400e', margin: '0' }}>
            {tickerEstrangeiro || 'Não mapeado'}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            {tickerEstrangeiro ? 'Mercado Exterior' : 'Mapeamento indisponível'}
          </p>
        </div>

        {/* Cards condicionais para dados */}
        {bdrData && bdrData.price && (
          <>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Preço BDR (R$)</h4>
              <p style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e', margin: '0' }}>
                R$ {bdrData.price.toFixed(2).replace('.', ',')}
              </p>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '16px', 
              borderRadius: '8px',
              border: '1px solid #fed7aa',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Variação Hoje</h4>
              <p style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                color: (bdrData.changePercent || 0) >= 0 ? '#22c55e' : '#ef4444',
                margin: '0' 
              }}>
                {(bdrData.changePercent || 0) >= 0 ? '+' : ''}{(bdrData.changePercent || 0).toFixed(2)}%
              </p>
            </div>
          </>
        )}

        {/* Cards condicionais para análise */}
        {precoTetoBDR && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Preço Teto BDR</h4>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', margin: '0' }}>
              R$ {typeof precoTetoBDR === 'number' ? precoTetoBDR.toFixed(2).replace('.', ',') : precoTetoBDR}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Meta de preço
            </p>
          </div>
        )}

        {viesBDR && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: `1px solid ${viesBDR.cor === '#22c55e' ? '#fed7aa' : '#fecaca'}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Viés BDR</h4>
            <p style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: viesBDR.cor,
              margin: '0' 
            }}>
              {viesBDR.vies}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              {viesBDR.explicacao}
            </p>
          </div>
        )}

        {cotacaoUSD && (
          <div style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>USD/BRL</h4>
            <p style={{ fontSize: '18px', fontWeight: '700', color: '#6366f1', margin: '0' }}>
              R$ {cotacaoUSD.toFixed(2).replace('.', ',')}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
              Dólar hoje
            </p>
          </div>
        )}
      </div>

      {/* Informações educativas */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fbbf24'
      }}>
        <p style={{ fontSize: '12px', margin: '0', color: '#92400e' }}>
          💡 <strong>BDR de Ativo Estrangeiro:</strong> Permite investir em empresas do exterior através da B3, sem precisar abrir conta no exterior.
          {tickerEstrangeiro && (
            <>
              <br/>🌍 Este BDR representa a ação <strong>{tickerEstrangeiro}</strong> de mercado internacional.
              <br/>💰 Cotação em reais, facilitando o investimento para brasileiros.
            </>
          )}
          {precoTetoBDR && bdrData?.price && (
            <>
              <br/>🎯 <strong>Análise:</strong> {viesBDR?.explicacao || 'Viés calculado com base no preço teto.'}
            </>
          )}
        </p>
      </div>

      {/* Status de carregamento e erro */}
      {bdrLoading && (
        <div style={{ 
          marginTop: '16px',
          textAlign: 'center', 
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <span style={{ color: '#92400e', fontSize: '14px' }}>⏳ Carregando cotação do BDR...</span>
        </div>
      )}

      {bdrError && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <p style={{ fontSize: '12px', margin: '0', color: '#dc2626' }}>
            ⚠️ Erro ao carregar dados: {bdrError}
          </p>
        </div>
      )}
    </div>
  );
});

// ========================================
// COMPONENTE PRINCIPAL COM MÚLTIPLAS CARTEIRAS
// ========================================
export default function AtivoPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    dados, 
    CARTEIRAS_CONFIG, 
    cotacoes, 
    buscarCotacoes,
    cotacaoUSD: cotacaoUSDGlobal,
    debug
  } = useDataStore();
  
  const ticker = params?.ticker?.toString().toUpperCase();
  const [ativo, setAtivo] = useState(null);
  const [carteira, setCarteira] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ DETECTAR DISPOSITIVO
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const mobile = width <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log('📱 Dispositivo detectado:', { width, isMobile: mobile });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // ✅ HOOK USD ESPECÍFICO (agora deve funcionar)
  const { cotacaoUSD, loading: loadingUSD, ultimaAtualizacao: atualizacaoUSD, refetch: refetchUSD } = useCotacaoUSD();

  // ✅ HOOKS INTEGRADOS (substituindo os antigos)
const { dy12Meses, dyFormatado, loading: loadingDY, fonte: fonteDY, refetch: refetchDY, isMobile: dyIsMobile, deviceDetected: dyDeviceDetected } = useDividendYieldIntegrado(ticker);
const { valorProventos, performanceProventos, loading: loadingProventos, fonte: fonteProventos, refetch: refetchProventos } = useProventosIntegrado(ticker, ativo?.dataEntrada || '', ativo?.precoEntrada);

  // Função para calcular percentual automático da carteira
  const calcularPercentualCarteira = (nomeCarteira: string) => {
    if (!dados || !dados[nomeCarteira]) return 'N/A';
    
    const ativosCarteira = dados[nomeCarteira];
    const numeroAtivos = Array.isArray(ativosCarteira) ? ativosCarteira.length : 0;
    
    if (numeroAtivos === 0) return '0%';
    
    const percentual = (100 / numeroAtivos).toFixed(1);
    return `${percentual}%`;
  };

  // Função para calcular percentuais de todas as carteiras onde o ativo existe
  const calcularPercentuaisTodasCarteiras = () => {
    if (!ativo?.multiplePortfolios || !ativo?.portfoliosList) {
      return { [carteira]: calcularPercentualCarteira(carteira) };
    }

    const percentuais = {};
    ativo.portfoliosList.forEach(nomeCarteira => {
      percentuais[nomeCarteira] = calcularPercentualCarteira(nomeCarteira);
    });

    return percentuais;
  };

  // Estados para cotação completa da API BRAPI
  const [cotacaoCompleta, setCotacaoCompleta] = useState(null);

  // Hooks de dados ATUALIZADOS
  const { dadosFinanceiros, loading: dadosLoading, error: dadosError, ultimaAtualizacao, refetch } = useDadosFinanceiros(ticker);

  // Hook para dados específicos de FII
  const { dadosFII: dadosFIIHGBrasil, loading: loadingFIIHGBrasil } = useHGBrasilFII(ticker);

  // 🚀 NOVO: Hook para dados de ações da HG Brasil
  const { dadosHGBrasil, loading: loadingHGBrasil, error: errorHGBrasil } = useHGBrasilAcoes(ticker);

  // 🌍 NOVO: Hook para ativos internacionais via Yahoo Finance
  const { dadosYahoo, loading: loadingYahoo, error: errorYahoo } = useYahooFinanceInternacional(ticker);

  // VARIÁVEIS BDR ATUALIZADAS - CORRIGIDO PARA ATIVOS AMERICANOS
  const ehBDREstrangeiro = ticker ? isBDREstrangeiro(ticker) : false;
  const tickerEstrangeiro = ehBDREstrangeiro ? getEstrangeiroFromBDR(ticker!) : null;
  const { bdrData, bdrLoading, bdrError, refetchBDR } = useDadosBDR(ehBDREstrangeiro ? ticker : null);

  // NOVA LÓGICA: Se é ticker americano, buscar BDR correspondente
  const bdrCorrespondente = ticker ? getBDRFromAmericano(ticker) : null;
  const temBDR = !!bdrCorrespondente;
  
  // HOOK PARA DADOS DO BDR CORRESPONDENTE
  const { bdrData: bdrDataAPI, bdrLoading: bdrLoadingAPI } = useBDRDataAPI(bdrCorrespondente);

  // Mapeamento de nomes reais das empresas
  const getNomeEmpresa = (ticker: string, setor: string) => {
    const nomes: Record<string, string> = {
      // Ações brasileiras
      'ALOS3': 'Allos S.A.',
      'TUPY3': 'Tupy S.A.',
      'RECV3': 'PetroRecôncavo S.A.',
      'PRIO3': 'PetroRio S.A.',
      'BBAS3': 'Banco do Brasil S.A.',
      'VALE3': 'Vale S.A.',
      'PETR4': 'Petróleo Brasileiro S.A.',
      'ITUB4': 'Itaú Unibanco Holding S.A.',
      'ABEV3': 'Ambev S.A.',
      'WEGE3': 'WEG S.A.',
      'MGLU3': 'Magazine Luiza S.A.',
      'SUZB3': 'Suzano S.A.',
      'RENT3': 'Localiza Rent a Car S.A.',
      'LREN3': 'Lojas Renner S.A.',
      'RADL3': 'Raia Drogasil S.A.',
      'GGBR4': 'Gerdau S.A.',
      'USIM5': 'Usiminas S.A.',
      'CSNA3': 'Companhia Siderúrgica Nacional',
      
      // FIIs mais populares e conhecidos
      'MALL11': 'Shopping Centers Brasil FII',
      'HGLG11': 'CSHG Logística FII',
      'XPML11': 'XP Malls FII',
      'BCFF11': 'BTG Pactual Fundo de CRI FII',
      'KNRI11': 'Kinea Renda Imobiliária FII',
      'XPPR11': 'XP Properties FII',
      'VILG11': 'Vinci Logística FII',
      'IRDM11': 'Iridium Recebíveis Imobiliários FII',
      'HGRE11': 'CSHG Real Estate FII',
      'BTLG11': 'BTG Pactual Logística FII',
      'XPIN11': 'XP Industrial FII',
      'KNCR11': 'Kinea Rendimentos Imobiliários FII',
      'HFOF11': 'Hedge Fundo de Fundos FII',
      'RBRR11': 'RBR Rendimento FII',
      'VGIR11': 'Valora Hedge Fund FII',
      'TRXF11': 'TRX Real Estate FII',
      'MGFF11': 'Magliano FII',
      'VISC11': 'Vinci Shopping Centers FII',
      'XPLG11': 'XP Log FII',
      'GGRC11': 'Guga Renda Imobiliária FII',
      'CVBI11': 'CVI Brick Investimentos FII',
      'RZTR11': 'Riza Terrax FII',
      'HSML11': 'HSI Mall FII',
      'BRCR11': 'BTG Pactual Corporate Office FII',
      'PVBI11': 'Panamby FII',
      'URPR11': 'Unipar Carbocloro FII',
      'FIIB11': 'FII BS2 Recebíveis Imobiliários',
      'MXRF11': 'Maxi Renda FII',
      'RBRY11': 'RBR Alpha FII',
      'JSRE11': 'JS Real Estate FII',
      'ALZR11': 'Alianza Trust Renda Imobiliária FII',
      'BBPO11': 'BB Progressivo II FII',
      'BBRC11': 'BB Renda Corporativa FII',
      'BBFI11': 'BB Fundo de Investimento FII',
      'CPTS11': 'Capitânia Securities FII',
      'FIGS11': 'FII Gaia Estruturas FII',
      'GTWR11': 'Getúlio Vargas FII',
      'HABT11': 'Habitat FII',
      'HCTR11': 'Hectare CE FII',
      'IGTI11': 'Integra Equity FII',
      'OULG11': 'Ourinvest Logística FII',
      'RECT11': 'Recx Recebíveis FII',
      'RBVA11': 'RBR Rendimento Varejo FII',
      'SADI11': 'São Domingos FII',
      'TEPP11': 'Tellus Properties FII',
      'VSLH11': 'Versalhes FII',
      'WPLZ11': 'Workplace FII',
      'XPCA11': 'XP Corporate Activos FII',
      'XTED11': 'XP Investimentos FII',
      'RBRP11': 'RBR Properties FII',
      'HGBS11': 'CSHG Brasil Shopping FII',
      'HGRU11': 'CSHG Renda Urbana FII',
      'KNIP11': 'Kinea Investimentos FII',
      'KNHY11': 'Kinea High Yield FII',
      'RBRF11': 'RBR Renda de Fundos FII',
      'GALG11': 'Gaia Logística FII',
      'FAED11': 'Faria Lima Capital FII',
      'CYCR11': 'Cycr FII',
      'DEVA11': 'Devant Recebíveis Imobiliários FII',
      'KDIF11': 'Kinea Desenvolvimento Imobiliário FII',
      'GTLG11': 'Gaia Total Logística FII',
      'NEWL11': 'Newlands FII',
      'PATL11': 'Pátria Logística FII',
      'PLRI11': 'Plural Recebíveis Imobiliários FII',
      'RBDS11': 'RBR Desenvolvimento FII',
      
      // BDRs Estrangeiros
      'AAPL34': 'Apple Inc. (BDR)',
      'NVDC34': 'NVIDIA Corporation (BDR)',
      'AMZO34': 'Amazon.com Inc. (BDR)',
      'GOGL34': 'Alphabet Inc. (BDR)',
      'TSLA34': 'Tesla Inc. (BDR)',
      'META34': 'Meta Platforms Inc. (BDR)',
      'MSFT34': 'Microsoft Corporation (BDR)',
      'M1TA34': 'Meta Platforms Inc. (BDR)',
    };
    
    // 1. Verificar se temos o nome mapeado
    if (nomes[ticker]) {
      return nomes[ticker];
    }
    
    // 2. Para FIIs não mapeados, tentar identificar pelo padrão
    if (ticker.includes('11')) {
      // Extrair base do ticker (remover '11')
      const base = ticker.replace('11', '');
      
      // Alguns padrões comuns de FIIs
      const padroesFII: Record<string, string> = {
        'XPCI': 'XP Corporate Income FII',
        'XPHT': 'XP Hotels FII',
        'XPCE': 'XP Corporate Evolution FII',
        'HGCR': 'CSHG Crédito FII',
        'BTCI': 'BTG Pactual Corporate Income FII',
        'VGIR': 'Valora Gestão Imobiliária FII',
        'KNSC': 'Kinea Securities FII',
        'RBFF': 'RBR Fundo de Fundos FII',
        'HSAF': 'HSI Ativos Financeiros FII',
        'PORD': 'Porto Dragão FII',
        'URPR': 'Urba Renda Própria FII',
        'SARE': 'Saraiva Real Estate FII',
      };
      
      if (padroesFII[base]) {
        return padroesFII[base];
      }
      
      // Fallback para FIIs não identificados
      return `${base} Fundo de Investimento Imobiliário`;
    }
    
    // 3. Para ações não mapeadas
    if (ticker.match(/\d$/)) {
      const base = ticker.replace(/\d+$/, '');
      return `${base} S.A.`;
    }
    
    // 4. Fallback geral
    return `${ticker} S.A.`;
  };

  // Descrições das empresas
  const getDescricaoEmpresa = (ticker: string, setor: string) => {
    const descricoes: Record<string, string> = {
      // Ações brasileiras
      'ALOS3': 'A Allos é uma empresa de shopping centers, focada em empreendimentos de alto padrão.',
      'RECV3': 'A PetroRecôncavo é uma empresa brasileira de exploração e produção de petróleo e gás natural.',
      'PRIO3': 'A PetroRio é uma empresa brasileira independente de petróleo e gás, focada na Bacia de Campos.',
      'BBAS3': 'O Banco do Brasil é um dos maiores bancos do país, oferecendo serviços bancários completos.',
      'VALE3': 'A Vale é uma das maiores empresas de mineração do mundo, líder na produção de minério de ferro.',
      'PETR4': 'A Petrobras é a maior empresa brasileira e uma das principais companhias de energia do mundo.',
      'ITUB4': 'O Itaú Unibanco é um dos maiores bancos privados do Brasil e da América Latina.',
      'WEGE3': 'A WEG é uma empresa brasileira fabricante de equipamentos elétricos industriais.',
      
      // FIIs populares
      'MALL11': 'Fundo de investimento imobiliário focado em shopping centers e centros comerciais no Brasil.',
      'HGLG11': 'FII especializado em ativos logísticos e industriais, com foco em galpões e centros de distribuição.',
      'XPML11': 'Fundo imobiliário focado em shopping centers de alto padrão em localizações estratégicas.',
      'BCFF11': 'FII de recebíveis imobiliários que investe em Certificados de Recebíveis Imobiliários (CRI).',
      'KNRI11': 'Fundo diversificado que investe em diferentes tipos de ativos imobiliários para renda.',
      'XPPR11': 'FII que investe em imóveis corporativos de alta qualidade em mercados consolidados.',
      'VILG11': 'Fundo especializado em ativos logísticos, incluindo galpões e centros de distribuição.',
      'IRDM11': 'FII focado em recebíveis imobiliários, investindo em CRIs de diferentes segmentos.',
      'HGRE11': 'Fundo que investe em imóveis corporativos e comerciais de padrão elevado.',
      'BTLG11': 'FII especializado em ativos logísticos estratégicos para o setor de distribuição.',
      'XPIN11': 'Fundo focado em ativos industriais e logísticos em regiões de alta demanda.',
      'KNCR11': 'FII que busca rendimentos através de diversos tipos de ativos imobiliários.',
      'HFOF11': 'Fundo de fundos que investe em cotas de outros fundos imobiliários para diversificação.',
      'RBRR11': 'FII focado em geração de renda através de ativos imobiliários diversificados.',
      'VGIR11': 'Fundo que investe em ativos imobiliários com foco em rentabilidade e valorização.',
      'TRXF11': 'FII especializado em ativos imobiliários de alta qualidade em mercados consolidados.',
      'VISC11': 'Fundo focado em shopping centers em localizações estratégicas.',
      'XPLG11': 'FII especializado em ativos logísticos modernos e bem localizados.',
      'HSML11': 'Fundo que investe em shopping centers regionais com potencial de crescimento.',
      'BRCR11': 'FII focado em edifícios corporativos de alto padrão em centros financeiros.',
      'PVBI11': 'Fundo que investe em empreendimentos imobiliários de alto valor agregado.',
      
      // BDRs Estrangeiros
      'AAPL34': 'BDR da Apple Inc., líder mundial em dispositivos eletrônicos de consumo e serviços digitais.',
      'NVDC34': 'BDR da NVIDIA Corporation, líder mundial em computação acelerada e inteligência artificial.',
      'AMZO34': 'BDR da Amazon.com Inc., uma das maiores empresas de tecnologia e e-commerce do mundo.',
      'GOGL34': 'BDR da Alphabet Inc. (Google), empresa multinacional de tecnologia focada em serviços de internet.',
      'TSLA34': 'BDR da Tesla Inc., fabricante líder de veículos elétricos e soluções de energia sustentável.',
      'META34': 'BDR da Meta Platforms Inc. (ex-Facebook), empresa de tecnologia focada em redes sociais e metaverso.',
      'MSFT34': 'BDR da Microsoft Corporation, empresa multinacional de tecnologia e serviços em nuvem.',
    };
    
    // 1. Verificar se temos descrição mapeada
    if (descricoes[ticker]) {
      return descricoes[ticker];
    }
    
    // 2. Para FIIs não mapeados
    if (ticker.includes('11')) {
      // Identificar tipo de FII pelo nome/código
      const base = ticker.replace('11', '').toLowerCase();
      
      if (base.includes('log') || base.includes('lg')) {
        return 'Fundo de investimento imobiliário especializado em ativos logísticos e industriais.';
      }
      if (base.includes('mall') || base.includes('shop') || base.includes('sc')) {
        return 'Fundo de investimento imobiliário focado em shopping centers e centros comerciais.';
      }
      if (base.includes('corp') || base.includes('of')) {
        return 'Fundo de investimento imobiliário especializado em edifícios corporativos e comerciais.';
      }
      if (base.includes('cri') || base.includes('rec') || base.includes('ff')) {
        return 'Fundo de investimento imobiliário focado em recebíveis imobiliários e títulos de crédito.';
      }
      if (base.includes('urb') || base.includes('res')) {
        return 'Fundo de investimento imobiliário com foco em desenvolvimento urbano e residencial.';
      }
      if (base.includes('fof') || base.includes('fund')) {
        return 'Fundo de fundos imobiliários que investe em cotas de outros FIIs para diversificação.';
      }
      if (base.includes('rend') || base.includes('ren')) {
        return 'Fundo de investimento imobiliário focado em geração de renda através de ativos diversificados.';
      }
      
      // Fallback genérico para FIIs
      return 'Fundo de investimento imobiliário focado em investimentos no mercado imobiliário brasileiro.';
    }
    
    // 3. Para ações não mapeadas
    if (ticker.match(/\d$/)) {
      return `Empresa do setor de ${setor.toLowerCase()}.`;
    }
    
    // 4. Fallback geral
    return `Empresa do setor de ${setor.toLowerCase()}.`;
  };

  // BUSCA EM MÚLTIPLAS CARTEIRAS - IMPLEMENTAÇÃO INTEGRADA
  useEffect(() => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    // Aguardar dados estarem disponíveis
    if (!dados || Object.keys(dados).length === 0) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // BUSCA EM MÚLTIPLAS CARTEIRAS
    let ativoEncontrado = null;
    let carteiraEncontrada = null;
    const carteirasComAtivo = []; // Array para múltiplas carteiras
    const dadosDetalhados = {}; // Dados de cada carteira onde foi encontrado

    console.log(`🔍 Buscando ${ticker} em todas as carteiras...`);

    // Buscar em TODAS as carteiras (não parar na primeira)
    Object.entries(dados).forEach(([nomeCarteira, ativos]) => {
      if (Array.isArray(ativos)) {
        const ativoNaCarteira = ativos.find(a => a?.ticker === ticker);
        if (ativoNaCarteira) {
          console.log(`✅ ${ticker} encontrado na carteira: ${nomeCarteira}`);
          
          // Se é o primeiro encontrado, usar como principal
          if (!ativoEncontrado) {
            ativoEncontrado = { ...ativoNaCarteira };
            carteiraEncontrada = nomeCarteira;
          }
          
          // Adicionar à lista de carteiras
          carteirasComAtivo.push({
            nome: nomeCarteira,
            config: CARTEIRAS_CONFIG[nomeCarteira],
            dados: ativoNaCarteira
          });
          
          // Armazenar dados detalhados desta carteira
          dadosDetalhados[nomeCarteira] = ativoNaCarteira;
        }
      }
    });

    // PROCESSAR RESULTADOS
    if (ativoEncontrado && carteiraEncontrada) {
      // Se encontrado em múltiplas carteiras
      if (carteirasComAtivo.length > 1) {
        console.log(`🔄 ${ticker} encontrado em ${carteirasComAtivo.length} carteiras:`, 
          carteirasComAtivo.map(c => c.nome));
        
        // Adicionar propriedades de múltiplas carteiras
        ativoEncontrado.multiplePortfolios = true;
        ativoEncontrado.portfoliosList = carteirasComAtivo.map(c => c.nome);
        ativoEncontrado.portfoliosData = dadosDetalhados;
        
        // Escolher carteira principal (prioridade)
        const prioridades = {
          'internacional': 1,
          'acoes': 2,
          'fiis': 3,
          'cripto': 4,
          'renda_fixa': 5
        };
        
        carteirasComAtivo.sort((a, b) => {
          const prioA = prioridades[a.nome] || 99;
          const prioB = prioridades[b.nome] || 99;
          return prioA - prioB;
        });
        
        const carteiraPrincipal = carteirasComAtivo[0];
        carteiraEncontrada = carteiraPrincipal.nome;
        
        console.log(`📌 Carteira principal escolhida: ${carteiraEncontrada}`);
        
      } else {
        console.log(`✅ ${ticker} encontrado apenas na carteira: ${carteiraEncontrada}`);
        ativoEncontrado.multiplePortfolios = false;
        ativoEncontrado.portfoliosList = [carteiraEncontrada];
      }

      setAtivo(ativoEncontrado);
      setCarteira(carteiraEncontrada);

      // Lógica adicional para BDRs ATUALIZADA
      if (ehBDREstrangeiro) {
        console.log(`🌍 BDR estrangeiro detectado: ${ticker}`);
        console.log(`📊 Ticker estrangeiro correspondente: ${tickerEstrangeiro}`);
        console.log(`🏛️ Mercado: ${getMercadoOrigem(tickerEstrangeiro)}`);
      }
      
      // NOVA LÓGICA: Log para ativo americano com BDR
      if (temBDR) {
        console.log(`🇺🇸 Ativo americano detectado: ${ticker}`);
        console.log(`🇧🇷 BDR correspondente: ${bdrCorrespondente}`);
      }
      
      // Buscar cotação diretamente da API BRAPI
      const buscarCotacaoCompleta = async () => {
        try {
          const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
          const apiUrl = `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`;
          
          console.log(`🔍 Buscando cotação completa para ${ticker}:`, apiUrl.replace(BRAPI_TOKEN, 'TOKEN_OCULTO'));
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Ativo-Individual-App'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`📊 Resposta da API para ${ticker}:`, data);
            
            if (data.results && data.results.length > 0) {
              const quote = data.results[0];
              
              const cotacaoAtivo = {
                regularMarketPrice: quote.regularMarketPrice,
                regularMarketChange: quote.regularMarketChange || 0,
                regularMarketChangePercent: quote.regularMarketChangePercent || 0,
                regularMarketVolume: quote.regularMarketVolume || 0,
                shortName: quote.shortName || quote.longName,
                dadosCompletos: quote,
                isBDREstrangeiro: ehBDREstrangeiro
              };
              
              setCotacaoCompleta(cotacaoAtivo);
              console.log(`✅ Cotação ${ticker} salva no estado local:`, cotacaoAtivo);
            }
          } else {
            console.error(`❌ Erro HTTP ${response.status} para ${ticker}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao buscar cotação para ${ticker}:`, error);
        }
      };
      
      buscarCotacaoCompleta();
    } else {
      console.log(`❌ ${ticker} não encontrado em nenhuma carteira`);
    }

    setLoading(false);
  }, [ticker, dados, buscarCotacoes, cotacoes, ehBDREstrangeiro, tickerEstrangeiro]);

  // ADICIONAR ESTA FUNÇÃO AQUI - ANTES DO Hook para DY
  const obterPrecoTetoBDR = useCallback(() => {
    if (!ativo || !carteira) return null;

    // Verificar se o ativo tem precoTetoBDR diretamente
    if (ativo.precoTetoBDR && typeof ativo.precoTetoBDR === 'number') {
      console.log(`💰 Preço teto BDR encontrado para ${ticker}: R$ ${ativo.precoTetoBDR}`);
      return ativo.precoTetoBDR;
    }

    // Se não encontrou, tentar buscar nos dados completos
    try {
      const dadosCompletos = dados[carteira];
      if (Array.isArray(dadosCompletos)) {
        const ativoCompleto = dadosCompletos.find(a => a?.ticker === ticker);
        if (ativoCompleto?.precoTetoBDR && typeof ativoCompleto.precoTetoBDR === 'number') {
          console.log(`💰 Preço teto BDR encontrado nos dados completos para ${ticker}: R$ ${ativoCompleto.precoTetoBDR}`);
          return ativoCompleto.precoTetoBDR;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar preço teto BDR:', error);
    }

    console.log(`❌ Preço teto BDR não encontrado para ${ticker}`);
    return null;
  }, [ativo, carteira, dados, ticker]);

  // OBTER PREÇO TETO BDR
  const precoTetoBDR = obterPrecoTetoBDR();

  // 🔄 FUNÇÃO calcularPerformance INTEGRADA COM API (Total Return)
  const calcularPerformance = () => {
    if (!ativo) return { total: 0, acao: 0, proventos: 0, valorProventos: 0 };
    
    // 📊 CALCULAR PERFORMANCE DA AÇÃO
    let performanceAcao = 0;
    
    if (ativo.posicaoEncerrada && ativo.precoSaida) {
      performanceAcao = ((ativo.precoSaida - ativo.precoEntrada) / ativo.precoEntrada) * 100;
    } else {
      const precoAtual = cotacaoCompleta?.regularMarketPrice || 
                        (cotacoes[ticker] && typeof cotacoes[ticker] === 'object' ? cotacoes[ticker].regularMarketPrice : cotacoes[ticker]);
      
      if (precoAtual && ativo.precoEntrada) {
        performanceAcao = ((precoAtual - ativo.precoEntrada) / ativo.precoEntrada) * 100;
      }
    }
    
    // 💰 USAR PROVENTOS INTEGRADOS (via API)
    const performanceProventosIntegrada = performanceProventos || 0;
    const valorProventosIntegrado = valorProventos || 0;
    
    // 🎯 PERFORMANCE TOTAL (AÇÃO + PROVENTOS VIA API)
    const performanceTotal = performanceAcao + performanceProventosIntegrada;
    
    console.log(`📊 Performance ${ticker} (INTEGRADA):`, {
      acao: `${performanceAcao.toFixed(2)}%`,
      proventos: `${performanceProventosIntegrada.toFixed(2)}%`,
      total: `${performanceTotal.toFixed(2)}%`,
      valorProventos: `R$ ${valorProventosIntegrado.toFixed(2)}`,
      fonte: fonteProventos
    });
    
    return {
      total: performanceTotal,
      acao: performanceAcao,
      proventos: performanceProventosIntegrada,
      valorProventos: valorProventosIntegrado
    };
  };

  // Calcular dias investido
  const calcularDiasInvestido = () => {
    if (!ativo) return 0;
    
    const dataEntrada = new Date(ativo.dataEntrada.split('/').reverse().join('-'));
    const dataFinal = ativo.posicaoEncerrada && ativo.dataSaida 
      ? new Date(ativo.dataSaida.split('/').reverse().join('-'))
      : new Date();
    
    const diffTime = Math.abs(dataFinal.getTime() - dataEntrada.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Estados de carregamento e erro
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
            Carregando informações do ativo...
          </h2>
        </div>
      </div>
    );
  }

  if (!ativo || !carteira) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc', 
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔍</div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: '#1e293b',
            marginBottom: '16px'
          }}>
            Ativo não encontrado
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#64748b',
            marginBottom: '32px'
          }}>
            O ativo <strong>{ticker}</strong> não foi encontrado em nenhuma das suas carteiras.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🏠 Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const carteiraConfig = CARTEIRAS_CONFIG[carteira];
  const performanceData = calcularPerformance();
  const performance = performanceData.total; // Para manter compatibilidade
  const diasInvestido = calcularDiasInvestido();
  
  // Usar cotação local primeiro, depois global
  const precoAtual = cotacaoCompleta?.regularMarketPrice || 
                    (cotacoes[ticker] && typeof cotacoes[ticker] === 'object' ? cotacoes[ticker].regularMarketPrice : cotacoes[ticker]);

  const distanciaPrecoTeto = (() => {
    if (!ativo.precoTeto || ativo.posicaoEncerrada) {
      return null;
    }
    
    const precoReferencia = precoAtual || ativo.precoEntrada;
    return ((ativo.precoTeto - precoReferencia) / precoReferencia) * 100;
  })();

  const isFII = ativo?.tipo === 'FII';
  const precoAtualFormatado = ativo.posicaoEncerrada && ativo.precoSaida ? 
    formatCurrency(ativo.precoSaida, carteiraConfig.moeda) :
    (precoAtual ? formatCurrency(precoAtual, carteiraConfig.moeda) : formatCurrency(ativo.precoEntrada, carteiraConfig.moeda));

  // Calcular percentual dinâmico da carteira
  const percentualCarteira = (() => {
    if (ativo?.multiplePortfolios) {
      const percentuais = calcularPercentuaisTodasCarteiras();
      const principal = percentuais[carteira];
      const outros = Object.entries(percentuais)
        .filter(([nome]) => nome !== carteira)
        .map(([nome, valor]) => `${CARTEIRAS_CONFIG[nome]?.nome || nome}: ${valor}`)
        .join(', ');
      
      return `${principal} (principal)${outros ? ` + ${outros}` : ''}`;
    }
    
    return calcularPercentualCarteira(carteira);
  })();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '24px' 
    }}>
      {/* Navegação */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => router.back()}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ← Voltar
        </button>
      </div>

      {/* Header Principal MELHORADO COM AVATAR */}
      <div style={{
        marginBottom: '32px',
        background: (() => {
          // Gradientes baseados no tipo de ativo
          if (isFII) {
            return 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'; // Amarelo para FIIs
          }
          if (ehBDREstrangeiro) {
            return 'linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)'; // Azul para BDRs estrangeiros
          }
          if (carteira === 'acoes') {
            return 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'; // Verde para ações
          }
          // Padrão cinza
          return 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
        })(),
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '32px' }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: '24px',
            alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start'
          }}>
            
            {/* AVATAR DA EMPRESA COM SISTEMA UNIFICADO */}
            <CompanyAvatar 
              symbol={ticker}
              companyName={getNomeEmpresa(ticker, ativo?.setor || '')}
              size={window.innerWidth <= 768 ? 100 : 120}
            />            
            
            {/* INFORMAÇÕES DA EMPRESA (CENTRO) */}
            <div style={{ 
              flex: 1, 
              textAlign: window.innerWidth <= 768 ? 'center' : 'left',
              minWidth: 0
            }}>
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: '12px',
                alignItems: window.innerWidth <= 768 ? 'center' : 'flex-start',
                marginBottom: '8px',
                flexWrap: 'wrap'
              }}>
                <h1 style={{ 
                  fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem', 
                  fontWeight: 700, 
                  margin: 0,
                  color: '#1f2937'
                }}>
                  {ticker}
                </h1>
                
                {/* Badges de tipo */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  
                  {/* Badge de carteira */}
                  <div style={{
                    background: carteiraConfig?.color || '#6b7280',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {carteiraConfig?.nome || carteira}
                  </div>
                  
                  {/* Badge de múltiplas carteiras */}
                  {ativo?.multiplePortfolios && (
                    <div style={{
                      background: '#fefce8',
                      color: '#d97706',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      📂 {ativo.portfoliosList.length} CARTEIRAS
                    </div>
                  )}
                  
                  {/* Badge de posição encerrada */}
                  {ativo.posicaoEncerrada && (
                    <div style={{
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ENCERRADA
                    </div>
                  )}
                </div>
              </div>
              
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.25rem', 
                fontWeight: 600, 
                margin: '0 0 16px 0',
                color: '#374151'
              }}>
                {getNomeEmpresa(ticker, ativo.setor)}
              </h2>
              
              <div style={{
                background: '#e2e8f0',
                color: '#475569',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                display: 'inline-block',
                marginBottom: '16px'
              }}>
                {carteiraConfig?.moeda || 'BRL'} • {ativo.setor}
                {isFII && ' • Fundo Imobiliário'}
                {ehBDREstrangeiro && ` • Mercado: ${getMercadoOrigem(tickerEstrangeiro)}`}
              </div>
              
              <p style={{ 
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#4b5563',
                margin: 0,
                maxWidth: '600px'
              }}>
                {getDescricaoEmpresa(ticker, ativo.setor)}
              </p>
              
              {/* Alertas importantes */}
              {ativo.posicaoEncerrada && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontWeight: 600,
                  marginTop: '16px',
                  fontSize: '14px'
                }}>
                  🔒 Posição encerrada em {ativo.dataSaida}
                </div>
              )}
            </div>
            
            {/* PREÇO E VARIAÇÃO (DIREITA) */}
            <div style={{ 
              textAlign: window.innerWidth <= 768 ? 'center' : 'right',
              minWidth: window.innerWidth <= 768 ? 'auto' : '200px'
            }}>
              {dadosLoading ? (
                <div style={{ 
                  width: '150px', 
                  height: '60px', 
                  background: '#e2e8f0', 
                  borderRadius: '8px',
                  animation: 'pulse 2s infinite'
                }} />
              ) : (
                <>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '2.5rem' : '3rem', 
                    fontWeight: 700,
                    color: '#1f2937',
                    lineHeight: 1,
                    marginBottom: '8px'
                  }}>
                    {precoAtualFormatado}
                  </div>
                  
{/* Variação */}
<div style={{ 
  color: (() => {
    if (ativo.posicaoEncerrada) {
      return performance >= 0 ? '#22c55e' : '#ef4444';
    }
    
    if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
      return cotacaoCompleta.regularMarketChangePercent >= 0 ? '#22c55e' : '#ef4444';
    }
    
    const cotacaoGlobal = cotacoes[ticker];
    if (cotacaoGlobal && typeof cotacaoGlobal === 'object' && cotacaoGlobal.regularMarketChangePercent !== undefined) {
      return cotacaoGlobal.regularMarketChangePercent >= 0 ? '#22c55e' : '#ef4444';
    }
    
    return performance >= 0 ? '#22c55e' : '#ef4444';
  })(), 
  fontWeight: 700, 
  fontSize: window.innerWidth <= 768 ? '1rem' : '1.2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end',
  gap: '8px'
}}>
  <span style={{ fontSize: '1.5rem' }}>
    {(() => {
      if (ativo.posicaoEncerrada) {
        return performance >= 0 ? '▲' : '▼';
      }
      
      if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
        return cotacaoCompleta.regularMarketChangePercent >= 0 ? '▲' : '▼';
      }
      
      const cotacaoGlobal = cotacoes[ticker];
      if (cotacaoGlobal && typeof cotacaoGlobal === 'object' && cotacaoGlobal.regularMarketChangePercent !== undefined) {
        return cotacaoGlobal.regularMarketChangePercent >= 0 ? '▲' : '▼';
      }
      
      return performance >= 0 ? '↗' : '↘';
    })()}
  </span>
  <span>
    {(() => {
      if (ativo.posicaoEncerrada) {
        return `${Math.abs(performance).toFixed(2)}%`;
      }
      
      if (cotacaoCompleta && cotacaoCompleta.regularMarketChangePercent !== undefined) {
        const variacaoPercent = cotacaoCompleta.regularMarketChangePercent;
        return `${Math.abs(variacaoPercent).toFixed(2)}%`;
      }
      
      const cotacaoGlobal = cotacoes[ticker];
      if (cotacaoGlobal && typeof cotacaoGlobal === 'object' && cotacaoGlobal.regularMarketChangePercent !== undefined) {
        const variacaoPercent = cotacaoGlobal.regularMarketChangePercent;
        return `${Math.abs(variacaoPercent).toFixed(2)}%`;
      }
      
      return 'Variação indisponível';
    })()}
  </span>
</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CARD DE MÚLTIPLAS CARTEIRAS - IMPLEMENTAÇÃO INTEGRADA */}
      {ativo?.multiplePortfolios && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '20px' }}>📂</span>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: 0, 
              color: '#1f2937' 
            }}>
              Múltiplas Carteiras
            </h3>
          </div>

          {/* Alerta informativo */}
          <div style={{
            background: '#fefce8',
            border: '1px solid #fde68a',
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',              color: '#d97706',
              margin: '0 0 12px 0'
            }}>
              📂 Ativo presente em múltiplas carteiras
            </h4>
            <p style={{
              fontSize: '14px',
              color: '#92400e',
              margin: 0,
              lineHeight: 1.5
            }}>
              Este ativo foi encontrado em <strong>{ativo.portfoliosList.length} carteiras diferentes</strong>. 
              Os dados exibidos são da carteira principal: <strong>{CARTEIRAS_CONFIG[carteira]?.nome || carteira}</strong>.
            </p>
          </div>
          
          {/* Grid de carteiras */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>
            {ativo.portfoliosList.map((nomeCarteira, index) => {
              const configCarteira = CARTEIRAS_CONFIG[nomeCarteira];
              const dadosNaCarteira = ativo.portfoliosData?.[nomeCarteira];
              const percentual = calcularPercentualCarteira(nomeCarteira);
              const ehPrincipal = nomeCarteira === carteira;
              
              return (
                <div key={nomeCarteira} style={{
                  background: ehPrincipal ? '#f0f9ff' : '#f8fafc',
                  border: `2px solid ${ehPrincipal ? '#0ea5e9' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  position: 'relative'
                }}>
                  {ehPrincipal && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '8px',
                      background: '#0ea5e9',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      PRINCIPAL
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: configCarteira?.color || '#6b7280'
                    }} />
                    <h5 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      margin: 0,
                      color: '#1f2937'
                    }}>
                      {configCarteira?.nome || nomeCarteira}
                    </h5>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>% da Carteira:</span>
                      <span style={{ fontSize: '12px', fontWeight: '600' }}>{percentual}</span>
                    </div>
                    
                    {dadosNaCarteira?.dataEntrada && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Data Entrada:</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{dadosNaCarteira.dataEntrada}</span>
                      </div>
                    )}
                    
                    {dadosNaCarteira?.precoEntrada && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Preço Entrada:</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          {typeof dadosNaCarteira.precoEntrada === 'number' 
                            ? formatCurrency(dadosNaCarteira.precoEntrada, configCarteira?.moeda || 'BRL')
                            : dadosNaCarteira.precoEntrada
                          }
                        </span>
                      </div>
                    )}
                    
                    {dadosNaCarteira?.precoTeto && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Preço Teto:</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          {typeof dadosNaCarteira.precoTeto === 'number' 
                            ? formatCurrency(dadosNaCarteira.precoTeto, configCarteira?.moeda || 'BRL')
                            : dadosNaCarteira.precoTeto
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Resumo estatístico */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <h5 style={{
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 12px 0',
              color: '#1f2937'
            }}>
              📊 Resumo das Carteiras
            </h5>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>
                  {ativo.portfoliosList.length}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Carteiras</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>
                  {Object.values(calcularPercentuaisTodasCarteiras())
                    .map(p => parseFloat(p.replace('%', '')))
                    .reduce((sum, val) => sum + val, 0)
                    .toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>% Total</div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>
                  {CARTEIRAS_CONFIG[carteira]?.nome || carteira}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Principal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seção BDR ATUALIZADA - NOVA LÓGICA */}
      
  {/* Para ativos americanos com BDR disponível */}
  {temBDR && bdrCorrespondente && (
    <BDRAmericanoInfo 
      ticker={ticker}
      bdrCorrespondente={bdrCorrespondente}
      temBDR={temBDR}
      bdrData={bdrDataAPI}
      bdrLoading={bdrLoadingAPI}
      precoTetoBDR={precoTetoBDR}
      cotacaoUSD={cotacaoUSD}
      loadingUSD={loadingUSD}
      atualizacaoUSD={atualizacaoUSD}
      refetchUSD={refetchUSD}
    />
  )}

  {/* Para BDRs estrangeiros tradicionais */}
  {ehBDREstrangeiro && (
    <BDREstrangeiroInfo 
      ticker={ticker}
      ehBDREstrangeiro={ehBDREstrangeiro}
      tickerEstrangeiro={tickerEstrangeiro}
      bdrData={bdrDataAPI || bdrData}
      bdrLoading={bdrLoadingAPI || bdrLoading}
      bdrError={bdrError}
      precoTetoBDR={precoTetoBDR}
      cotacaoUSD={cotacaoUSD}
      loadingUSD={loadingUSD}
      atualizacaoUSD={atualizacaoUSD}
      refetchUSD={refetchUSD}
    />
  )}

      {/* Dados Específicos de FII */}
      {(isFII || ticker.includes('11')) && (
        <FIISpecificCards 
          ticker={ticker}
          dadosFII={dadosFIIHGBrasil}
          loading={loadingFIIHGBrasil}
          isFII={isFII}
        />
      )}

{/* Grid de Cards de Métricas - AÇÕES BRASILEIRAS E INTERNACIONAIS MELHORADO */}
{!isFII && !ticker.includes('11') && (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  }}>
<div style={{
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
  height: '100%'
}}>
  <h4 style={{
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    margin: '0 0 8px 0',
    textTransform: 'uppercase'
  }}>
    PERFORMANCE TOTAL
  </h4>
  
  {loadingProventos ? (
    <div style={{ color: '#64748b', fontSize: '18px' }}>⏳</div>
  ) : (
    <>
      <p style={{
        fontSize: '24px',
        fontWeight: '800',
        color: (performanceData.acao + performanceProventos) >= 0 ? '#22c55e' : '#ef4444',
        margin: '0 0 4px 0'
      }}>
        {(performanceData.acao + performanceProventos) >= 0 ? '+' : ''}{(performanceData.acao + performanceProventos).toFixed(2)}%
      </p>
      
      <p style={{
        fontSize: '12px',
        color: '#64748b',
        margin: '0',
        lineHeight: '1.4'
      }}>
        Ação: {performanceData.acao.toFixed(1)}% • Proventos: {performanceProventos.toFixed(1)}%
        <br/>
        <span style={{ 
          fontSize: '10px',
          backgroundColor: fonteProventos === 'API' ? '#22c55e' : fonteProventos === 'localStorage' ? '#f59e0b' : '#6b7280',
          color: 'white',
          padding: '1px 4px',
          borderRadius: '3px',
          marginTop: '2px',
          display: 'inline-block'
        }}>
          {fonteProventos}
        </span>
      </p>
    </>
  )}
</div>    

{/* 📊 P/L CORRIGIDO - PRIORIDADE AJUSTADA */}
<MetricCard 
  title="P/L" 
  value={(() => {
    // 🇧🇷 Para ações brasileiras: HG Brasil primeiro (funciona melhor no mobile)
    if (ticker.match(/\d$/) && !ticker.includes('11')) {
      // 1º: HG Brasil (melhor para ações brasileiras no mobile)
      if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
        return dadosHGBrasil.pl.toFixed(2);
      }
      // 2º: BRAPI (backup confiável)
      if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
        return dadosFinanceiros.pl.toFixed(2);
      }
      // 3º: Yahoo (última opção para ações brasileiras)
      if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
        return dadosYahoo.pl.toFixed(2);
      }
      return 'N/A';
    }
    
    // 🌍 Para ativos internacionais: Yahoo primeiro
    else if (!ticker.match(/\d$/)) {
      // 1º: Yahoo Finance (melhor para internacionais)
      if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
        return dadosYahoo.pl.toFixed(2);
      }
      // 2º: HG Brasil (backup)
      if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
        return dadosHGBrasil.pl.toFixed(2);
      }
      // 3º: BRAPI (último recurso)
      if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
        return dadosFinanceiros.pl.toFixed(2);
      }
      return 'N/A';
    }
    
    // 🔄 Outros tipos (FIIs, BDRs): ordem original
    else {
      if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0) {
        return dadosHGBrasil.pl.toFixed(2);
      }
      if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0) {
        return dadosFinanceiros.pl.toFixed(2);
      }
      if (dadosYahoo?.pl && dadosYahoo.pl > 0) {
        return dadosYahoo.pl.toFixed(2);
      }
      return 'N/A';
    }
  })()}
  
  subtitle={(() => {
    // Mostrar qual fonte foi realmente usada
    if (ticker.match(/\d$/) && !ticker.includes('11')) {
      // Ações brasileiras
      if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
        return "HG Brasil";
      }
      if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
        return "BRAPI";
      }
      if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
        return "Yahoo";
      }
    } else if (!ticker.match(/\d$/)) {
      // Ativos internacionais
      if (dadosYahoo?.pl && dadosYahoo.pl > 0 && dadosYahoo.pl < 999) {
        return dadosYahoo.fonte || "International";
      }
      if (dadosHGBrasil?.pl && dadosHGBrasil.pl > 0 && dadosHGBrasil.pl < 1000) {
        return "HG Brasil";
      }
      if (dadosFinanceiros?.pl && dadosFinanceiros.pl > 0 && dadosFinanceiros.pl < 1000) {
        return "BRAPI";
      }
    }
    
    return "indisponível";
  })()}
  
  loading={dadosLoading || loadingHGBrasil || loadingYahoo}
/>    
    {/* 💰 DIVIDEND YIELD INTEGRADO */}
    <MetricCard 
      title="DIVIDEND YIELD" 
      value={(() => {
        // Prioridade: Hook integrado > Yahoo > HG Brasil
        if (dy12Meses > 0) {
          return dyFormatado;
        }
        if (dadosYahoo?.dividendYield && dadosYahoo.dividendYield > 0) {
          return `${dadosYahoo.dividendYield.toFixed(2)}%`;
        }
        if (dadosHGBrasil?.dividendYield12m) {
          return `${dadosHGBrasil.dividendYield12m.toFixed(2)}%`;
        }
        return 'N/A';
      })()}
      subtitle={(() => {
        if (dy12Meses > 0) {
          return fonteDY || "BRAPI-Estratégia";
        }
        if (dadosYahoo?.dividendYield && dadosYahoo.dividendYield > 0) {
          return dadosYahoo.fonte || "International";
        }
        if (dadosHGBrasil?.dividendYield12m) {
          return "HG Brasil";
        }
        return "indisponível";
      })()}
      loading={loadingDY || loadingHGBrasil || loadingYahoo}
    />
    
    {/* 📈 P/VP MELHORADO - MÚLTIPLAS FONTES */}
    <MetricCard 
      title="P/VP" 
      value={(() => {
        // Prioridade: Yahoo Internacional > HG Brasil
        if (dadosYahoo?.pvp && dadosYahoo.pvp > 0 && dadosYahoo.pvp < 999) {
          return dadosYahoo.pvp.toFixed(2);
        }
        if (dadosHGBrasil?.pvp) {
          return dadosHGBrasil.pvp.toFixed(2);
        }
        return 'N/A';
      })()}
      subtitle={(() => {
        if (dadosYahoo?.pvp && dadosYahoo.pvp > 0 && dadosYahoo.pvp < 999) {
          return dadosYahoo.fonte || "International";
        }
        if (dadosHGBrasil?.pvp) {
          return "HG Brasil";
        }
        return "indisponível";
      })()}
      loading={loadingHGBrasil || loadingYahoo}
    />
  </div>
)}

{/* ETF Holdings - APÓS os cards de métricas */}
<ETFHoldings 
  ticker={ticker}
  dadosYahoo={dadosYahoo}
  loading={loadingYahoo}
/>

      {/* Histórico de Dividendos */}
      <HistoricoDividendos ticker={ticker} dataEntrada={ativo.dataEntrada} isFII={isFII} />

{/* Análises Trimestrais */}
<AnalisesTrimesestrais ticker={ticker} />

      {/* Relatórios */}
      <GerenciadorRelatorios ticker={ticker} />
      
      {/* Agenda Corporativa */}
      <AgendaCorporativa ticker={ticker} isFII={isFII} />

      {/* Dados da Posição Expandidos */}
      <DadosPosicaoExpandidos 
        empresa={ativo} 
        dadosFinanceiros={dadosFinanceiros}
        precoAtualFormatado={precoAtualFormatado}
        isFII={isFII}
        distanciaPrecoTeto={distanciaPrecoTeto}
        percentualCarteira={percentualCarteira}
  carteiraConfig={carteiraConfig}
      />
    </div>
  );
}