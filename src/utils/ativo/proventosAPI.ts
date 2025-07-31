// 🔥 FUNÇÃO PARA BUSCAR PROVENTOS VIA API
export async function buscarProventosViaAPI(ticker: string, dataEntrada: string): Promise<number> {
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
    
    // FALLBACK: localStorage
    return calcularProventosLocalStorage(ticker, dataEntrada);
    
  } catch (error) {
    console.error(`❌ Erro ao buscar proventos para ${ticker}:`, error);
    return calcularProventosLocalStorage(ticker, dataEntrada);
  }
}

// 🔄 FUNÇÃO FALLBACK PARA PROVENTOS (localStorage)
export function calcularProventosLocalStorage(ticker: string, dataEntrada: string): number {
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