import { useState, useEffect, useCallback } from 'react';

// 🔥 HOOK ESPECÍFICO PARA BUSCAR EVENTOS POR TICKER - EXTRAÍDO DO CÓDIGO ORIGINAL
export const useAgendaCorporativaTicker = (ticker: string) => {
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