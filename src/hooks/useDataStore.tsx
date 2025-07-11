// src/hooks/useDataStore.tsx - SISTEMA CENTRALIZADO DE DADOS COM SINCRONIZAÇÃO E SUPORTE BDR
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 🎯 DADOS INICIAIS DAS CARTEIRAS - AGORA COM SUPORTE A PREÇO TETO BDR
const DADOS_INICIAIS = {
  smallCaps: [
    { id: 'sc1', ticker: "ALOS3", dataEntrada: "15/01/2021", precoEntrada: 26.68, precoTeto: 23.76, setor: "Shoppings" },
    { id: 'sc2', ticker: "TUPY3", dataEntrada: "04/11/2020", precoEntrada: 20.36, precoTeto: 31.50, setor: "Industrial" },
    { id: 'sc3', ticker: "RECV3", dataEntrada: "23/07/2023", precoEntrada: 22.29, precoTeto: 31.37, setor: "Petróleo" },
    { id: 'sc4', ticker: "CSED3", dataEntrada: "10/12/2023", precoEntrada: 4.49, precoTeto: 8.35, setor: "Educação" },
    { id: 'sc5', ticker: "PRIO3", dataEntrada: "04/08/2022", precoEntrada: 23.35, precoTeto: 48.70, setor: "Petróleo" },
    { id: 'sc6', ticker: "RAPT4", dataEntrada: "16/09/2021", precoEntrada: 16.69, precoTeto: 14.00, setor: "Industrial" },
    { id: 'sc7', ticker: "SMTO3", dataEntrada: "10/11/2022", precoEntrada: 28.20, precoTeto: 35.00, setor: "Sucroenergético" },
    { id: 'sc8', ticker: "FESA4", dataEntrada: "11/12/2020", precoEntrada: 4.49, precoTeto: 14.07, setor: "Commodities" },
    { id: 'sc9', ticker: "UNIP6", dataEntrada: "08/12/2020", precoEntrada: 42.41, precoTeto: 117.90, setor: "Químico" },
    { id: 'sc10', ticker: "FLRY3", dataEntrada: "19/05/2022", precoEntrada: 14.63, precoTeto: 17.50, setor: "Saúde" },
    { id: 'sc11', ticker: "EZTC3", dataEntrada: "07/10/2022", precoEntrada: 22.61, precoTeto: 30.00, setor: "Construção Civil" },
    { id: 'sc12', ticker: "JALL3", dataEntrada: "17/06/2022", precoEntrada: 8.36, precoTeto: 11.90, setor: "Sucroenergético" },
    { id: 'sc13', ticker: "YDUQ3", dataEntrada: "11/11/2020", precoEntrada: 27.16, precoTeto: 15.00, setor: "Educação" },
    { id: 'sc14', ticker: "SIMH3", dataEntrada: "03/12/2020", precoEntrada: 7.98, precoTeto: 10.79, setor: "Logística" },
    { id: 'sc15', ticker: "ALUP11", dataEntrada: "25/11/2020", precoEntrada: 24.40, precoTeto: 29.00, setor: "Energia" },
    { id: 'sc16', ticker: "NEOE3", dataEntrada: "04/05/2021", precoEntrada: 15.94, precoTeto: 21.00, setor: "Energia" }
  ],
  microCaps: [
    { id: 'mc1', ticker: "DEXP3", dataEntrada: "27/01/2023", precoEntrada: 7.96, precoTeto: 13.10, setor: "Nanocap/Químico" },
    { id: 'mc2', ticker: "KEPL3", dataEntrada: "21/12/2020", precoEntrada: 9.16, precoTeto: 11.00, setor: "Agricultura" },
    { id: 'mc3', ticker: "EVEN3", dataEntrada: "06/06/2022", precoEntrada: 5.18, precoTeto: 8.50, setor: "C. Civil" },
    { id: 'mc4', ticker: "WIZC3", dataEntrada: "30/04/2021", precoEntrada: 10.94, precoTeto: 12.00, setor: "Seguros" },
    { id: 'mc5', ticker: "RANI3", dataEntrada: "19/11/2020", precoEntrada: 4.65, precoTeto: 10.57, setor: "Papel" },
    { id: 'mc6', ticker: "SHUL4", dataEntrada: "04/03/2021", precoEntrada: 3.47, precoTeto: 5.45, setor: "Industrial" },
    { id: 'mc7', ticker: "RSUL4", dataEntrada: "06/08/2021", precoEntrada: 85.00, precoTeto: 100.00, setor: "Nanocap/Industrial" },
    { id: 'mc8', ticker: "TASA4", dataEntrada: "27/06/2022", precoEntrada: 17.14, precoTeto: 25.50, setor: "Bens Industriais" },
    { id: 'mc9', ticker: "TRIS3", dataEntrada: "25/02/2022", precoEntrada: 5.15, precoTeto: 5.79, setor: "C. Civil" },
    { id: 'mc10', ticker: "CGRA4", dataEntrada: "09/03/2023", precoEntrada: 29.00, precoTeto: 42.50, setor: "Nanocap/C. cíclico" },
    { id: 'mc11', ticker: "ROMI3", dataEntrada: "19/07/2022", precoEntrada: 12.02, precoTeto: 19.40, setor: "Bens Industriais" },
    { id: 'mc12', ticker: "POSI3", dataEntrada: "22/04/2022", precoEntrada: 8.67, precoTeto: 10.16, setor: "Tecnologia" },
    { id: 'mc13', ticker: "CEAB3", dataEntrada: "04/05/2023", precoEntrada: 2.95, precoTeto: 10.94, setor: "Consumo cíclico" },
    { id: 'mc14', ticker: "LOGG3", dataEntrada: "25/11/2022", precoEntrada: 18.96, precoTeto: 25.00, setor: "Logística" },
    { id: 'mc15', ticker: "AGRO3", dataEntrada: "09/10/2020", precoEntrada: 23.00, precoTeto: 31.80, setor: "Agricultura" }
  ],
  dividendos: [
    { id: 'div1', ticker: "LEVE3", dataEntrada: "06/12/2024", precoEntrada: 27.74, precoTeto: 35.27, setor: "Automotivo" },
    { id: 'div2', ticker: "EGIE3", dataEntrada: "31/03/2022", precoEntrada: 43.13, precoTeto: 50.34, setor: "Energia" },
    { id: 'div3', ticker: "VALE3", dataEntrada: "17/07/2023", precoEntrada: 68.61, precoTeto: 78.20, setor: "Mineração" },
    { id: 'div4', ticker: "BBAS3", dataEntrada: "20/10/2021", precoEntrada: 15.60, precoTeto: 30.10, setor: "Bancos" },
    { id: 'div5', ticker: "BRSR6", dataEntrada: "12/05/2022", precoEntrada: 10.60, precoTeto: 15.10, setor: "Bancos" },
    { id: 'div6', ticker: "PETR4", dataEntrada: "24/05/2022", precoEntrada: 30.97, precoTeto: 37.50, setor: "Petróleo" },
    { id: 'div7', ticker: "SAPR4", dataEntrada: "27/10/2021", precoEntrada: 3.81, precoTeto: 6.00, setor: "Saneamento" },
    { id: 'div8', ticker: "ELET3", dataEntrada: "20/11/2023", precoEntrada: 40.41, precoTeto: 58.27, setor: "Energia" },
    { id: 'div9', ticker: "ABCB4", dataEntrada: "19/06/2023", precoEntrada: 17.87, precoTeto: 22.30, setor: "Bancos" },
    { id: 'div10', ticker: "CSMG3", dataEntrada: "19/08/2022", precoEntrada: 13.68, precoTeto: 19.16, setor: "Saneamento" },
    { id: 'div11', ticker: "BBSE3", dataEntrada: "30/06/2022", precoEntrada: 25.48, precoTeto: 33.20, setor: "Financeiro" },
    { id: 'div12', ticker: "ISAE4", dataEntrada: "22/10/2021", precoEntrada: 24.00, precoTeto: 26.50, setor: "Energia" },
    { id: 'div13', ticker: "VIVT3", dataEntrada: "05/04/2022", precoEntrada: 54.60, precoTeto: 29.00, setor: "Telecom" },
    { id: 'div14', ticker: "KLBN11", dataEntrada: "09/06/2022", precoEntrada: 21.94, precoTeto: 27.60, setor: "Papel e Celulose" },
    { id: 'div15', ticker: "SANB11", dataEntrada: "08/12/2022", precoEntrada: 27.60, precoTeto: 31.76, setor: "Bancos" },
    { id: 'div16', ticker: "CPLE6", dataEntrada: "10/11/2021", precoEntrada: 6.28, precoTeto: 7.25, setor: "Energia" }
  ],
  fiis: [
    { id: 'fii1', ticker: "MALL11", dataEntrada: "26/01/2022", precoEntrada: 118.37, precoTeto: 103.68, setor: "Shopping" },
    { id: 'fii2', ticker: "KNSC11", dataEntrada: "24/05/2022", precoEntrada: 9.31, precoTeto: 9.16, setor: "Papel" },
    { id: 'fii3', ticker: "KNHF11", dataEntrada: "20/12/2024", precoEntrada: 76.31, precoTeto: 90.50, setor: "Hedge Fund" },
    { id: 'fii4', ticker: "HGBS11", dataEntrada: "02/01/2025", precoEntrada: 186.08, precoTeto: 192.00, setor: "Shopping" },
    { id: 'fii5', ticker: "RURA11", dataEntrada: "14/02/2023", precoEntrada: 10.25, precoTeto: 8.70, setor: "Fiagro" },
    { id: 'fii6', ticker: "BCIA11", dataEntrada: "12/04/2023", precoEntrada: 82.28, precoTeto: 87.81, setor: "FoF" },
    { id: 'fii7', ticker: "BPFF11", dataEntrada: "08/01/2024", precoEntrada: 72.12, precoTeto: 66.26, setor: "FoF" },
    { id: 'fii8', ticker: "HGFF11", dataEntrada: "03/04/2023", precoEntrada: 69.15, precoTeto: 73.59, setor: "FoF" },
    { id: 'fii9', ticker: "BRCO11", dataEntrada: "09/05/2022", precoEntrada: 99.25, precoTeto: 109.89, setor: "Logística" },
    { id: 'fii10', ticker: "XPML11", dataEntrada: "16/02/2022", precoEntrada: 93.32, precoTeto: 110.40, setor: "Shopping" },
    { id: 'fii11', ticker: "HGLG11", dataEntrada: "20/06/2022", precoEntrada: 161.80, precoTeto: 146.67, setor: "Logística" },
    { id: 'fii12', ticker: "HSML11", dataEntrada: "14/06/2022", precoEntrada: 78.00, precoTeto: 93.60, setor: "Shopping" },
    { id: 'fii13', ticker: "VGIP11", dataEntrada: "02/12/2021", precoEntrada: 96.99, precoTeto: 88.00, setor: "Papel" },
    { id: 'fii14', ticker: "AFHI11", dataEntrada: "05/07/2022", precoEntrada: 99.91, precoTeto: 93.20, setor: "Papel" },
    { id: 'fii15', ticker: "BTLG11", dataEntrada: "05/01/2022", precoEntrada: 103.14, precoTeto: 104.00, setor: "Logística" },
    { id: 'fii16', ticker: "VRTA11", dataEntrada: "27/12/2022", precoEntrada: 88.30, precoTeto: 94.33, setor: "Papel" },
    { id: 'fii17', ticker: "LVBI11", dataEntrada: "18/10/2022", precoEntrada: 113.85, precoTeto: 122.51, setor: "Logística" },
    { id: 'fii18', ticker: "HGRU11", dataEntrada: "17/05/2022", precoEntrada: 115.00, precoTeto: 138.57, setor: "Renda Urbana" },
    { id: 'fii19', ticker: "ALZR11", dataEntrada: "02/02/2022", precoEntrada: 115.89, precoTeto: 101.60, setor: "Híbrido" },
    { id: 'fii20', ticker: "BCRI11", dataEntrada: "25/11/2021", precoEntrada: 104.53, precoTeto: 87.81, setor: "Papel" },
    { id: 'fii21', ticker: "KNRI11", dataEntrada: "27/06/2022", precoEntrada: 131.12, precoTeto: 146.67, setor: "Híbrido" },
    { id: 'fii22', ticker: "IRDM11", dataEntrada: "05/01/2022", precoEntrada: 107.04, precoTeto: 73.20, setor: "Papel" },
    { id: 'fii23', ticker: "MXRF11", dataEntrada: "12/07/2022", precoEntrada: 9.69, precoTeto: 9.40, setor: "Papel" }
  ],
  // 🔥 CARTEIRAS INTERNACIONAIS COM EXEMPLOS DE PREÇO TETO BDR
  dividendosInternacional: [
    { 
      id: 'dint1', 
      ticker: "OXY", 
      dataEntrada: "14/04/2023", 
      precoEntrada: 37.92, 
      precoTeto: 60.10, 
      precoTetoBDR: 351.58, // 🔥 EXEMPLO: Preço teto em BRL
      setor: "Petroleum" 
    },
    { id: 'dint2', ticker: "ADC", dataEntrada: "19/01/2023", precoEntrada: 73.74, precoTeto: 99.01, setor: "REIT - Retail" },
    { id: 'dint3', ticker: "VZ", dataEntrada: "28/03/2022", precoEntrada: 51.17, precoTeto: 51.12, setor: "Telecom" },
    { 
      id: 'dint4', 
      ticker: "O", 
      dataEntrada: "01/02/2024", 
      precoEntrada: 54.39, 
      precoTetoBDR: 344.60, // 🔥 EXEMPLO: Preço teto em BRL (sem USD)
      setor: "REIT - Net Lease" 
    },
    { id: 'dint5', ticker: "AVB", dataEntrada: "10/02/2022", precoEntrada: 242.00, precoTeto: 340.00, setor: "REIT - Apartamentos" },
    { id: 'dint6', ticker: "STAG", dataEntrada: "24/03/2022", precoEntrada: 40.51, precoTeto: 42.87, setor: "REIT - Industrial" }
  ],
  etfs: [
    { id: 'etf1', ticker: "VOO", dataEntrada: "03/06/2021", precoEntrada: 383.95, setor: "Large Cap" },
    { id: 'etf2', ticker: "IJS", dataEntrada: "21/07/2021", precoEntrada: 100.96, setor: "Small Caps" },
    { id: 'etf3', ticker: "QUAL", dataEntrada: "11/06/2021", precoEntrada: 130.13, setor: "Total Market" },
    { id: 'etf4', ticker: "QQQ", dataEntrada: "09/06/2021", precoEntrada: 337.18, setor: "Large Cap" },
    { id: 'etf5', ticker: "VNQ", dataEntrada: "12/07/2021", precoEntrada: 105.96, setor: "Real Estate" },
    { id: 'etf6', ticker: "SCHP", dataEntrada: "22/11/2021", precoEntrada: 63.14, setor: "Renda Fixa" },
    { id: 'etf7', ticker: "IAU", dataEntrada: "07/06/2021", precoEntrada: 36.04, setor: "Ouro" },
    { id: 'etf8', ticker: "HERO", dataEntrada: "15/07/2021", precoEntrada: 31.28, setor: "Games" },
    { id: 'etf9', ticker: "SOXX", dataEntrada: "04/08/2021", precoEntrada: 156.03, setor: "Semicondutores" },
    { id: 'etf10', ticker: "MCHI", dataEntrada: "01/02/2023", precoEntrada: 53.58, setor: "China" },
    { id: 'etf11', ticker: "TFLO", dataEntrada: "21/03/2023", precoEntrada: 50.50, setor: "Renda Fixa" }
  ],
  projetoAmerica: [
    { 
      id: 'pa1', 
      ticker: "NVDA", 
      dataEntrada: "09/04/2025", 
      precoEntrada: 98.88, 
      precoTeto: 110.00,
      precoTetoBDR: 643.50, // 🔥 EXEMPLO: Preço teto em BRL
      setor: "Tecnologia" 
    },
    { id: 'pa2', ticker: "AMZN", dataEntrada: "16/04/2025", precoEntrada: 176.29, precoTeto: 203.00, setor: "Varejo" },
    { id: 'pa3', ticker: "PEP", dataEntrada: "22/04/2025", precoEntrada: 141.78, precoTeto: 149.66, setor: "Consumo" },
    { id: 'pa4', ticker: "IAU", dataEntrada: "30/04/2025", precoEntrada: 62.48, setor: "ETF" },
    { id: 'pa5', ticker: "WPC", dataEntrada: "07/05/2025", precoEntrada: 62.17, precoTeto: 65.00, setor: "REIT" },
    { id: 'pa6', ticker: "NOBL", dataEntrada: "14/05/2025", precoEntrada: 99.26, setor: "ETF" },
    { id: 'pa7', ticker: "CRM", dataEntrada: "21/05/2025", precoEntrada: 285.85, precoTeto: 310.00, setor: "Tecnologia" },
    { id: 'pa8', ticker: "AMD", dataEntrada: "29/05/2025", precoEntrada: 112.86, precoTeto: 135.20, setor: "Tecnologia" },
    { id: 'pa9', ticker: "TLT", dataEntrada: "05/06/2025", precoEntrada: 86.62, setor: "ETF" },
    { id: 'pa10', ticker: "QQQ", dataEntrada: "12/06/2025", precoEntrada: 353.38, setor: "ETF" },
    { id: 'pa11', ticker: "NNN", dataEntrada: "18/06/2025", precoEntrada: 42.90, precoTeto: 45.10, setor: "REIT" }
  ],
  exteriorStocks: [
    { 
      id: 'es1', 
      ticker: "AMD", 
      dataEntrada: "29/05/2025", 
      precoEntrada: 112.86, 
      precoTeto: 135.20,
      precoTetoBDR: 791.42, // 🔥 EXEMPLO: Preço teto em BRL
      setor: "Tecnologia" 
    },
    { id: 'es2', ticker: "XP", dataEntrada: "26/05/2023", precoEntrada: 18.41, precoTeto: 24.34, setor: "Financial Services" },
    { id: 'es3', ticker: "HD", dataEntrada: "24/02/2023", precoEntrada: 299.31, precoTeto: 366.78, setor: "Varejo" },
    { id: 'es4', ticker: "AAPL", dataEntrada: "05/05/2022", precoEntrada: 156.77, precoTeto: 170.00, setor: "Tecnologia" },
    { id: 'es5', ticker: "FIVE", dataEntrada: "17/03/2022", precoEntrada: 163.41, precoTeto: 179.00, setor: "Varejo" },
    { id: 'es6', ticker: "AMAT", dataEntrada: "07/04/2022", precoEntrada: 122.40, precoTeto: 151.30, setor: "Semicondutores" },
    { id: 'es7', ticker: "COST", dataEntrada: "23/06/2022", precoEntrada: 459.00, precoTeto: 571.00, setor: "Consumer" },
    { 
      id: 'es8', 
      ticker: "GOOGL", 
      dataEntrada: "06/03/2022", 
      precoEntrada: 131.83, 
      precoTetoBDR: 896.83, // 🔥 EXEMPLO: Preço teto em BRL (sem USD)
      setor: "Tecnologia" 
    },
    { id: 'es9', ticker: "META", dataEntrada: "17/02/2022", precoEntrada: 213.92, precoTeto: 322.00, setor: "Tecnologia" },
    { id: 'es10', ticker: "BRK.B", dataEntrada: "11/05/2021", precoEntrada: 286.35, precoTeto: 330.00, setor: "Holding" }
  ]
};

// 🎯 CONFIGURAÇÕES DAS CARTEIRAS - ATUALIZADA COM SUPORTE BDR
const CARTEIRAS_CONFIG = {
  smallCaps: { 
    nome: 'Small Caps', 
    icon: '📈', 
    color: '#3b82f6',
    moeda: 'BRL',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto'],
    suportaBDR: false
  },
  microCaps: { 
    nome: 'Micro Caps', 
    icon: '🔥', 
    color: '#10b981',
    moeda: 'BRL',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto'],
    suportaBDR: false
  },
  dividendos: { 
    nome: 'Dividendos', 
    icon: '💰', 
    color: '#f59e0b',
    moeda: 'BRL',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto'],
    suportaBDR: false
  },
  fiis: { 
    nome: 'FIIs', 
    icon: '🏢', 
    color: '#8b5cf6',
    moeda: 'BRL',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto'],
    suportaBDR: false
  },
  // 🔥 CARTEIRAS INTERNACIONAIS COM SUPORTE BDR
  dividendosInternacional: { 
    nome: 'Div. Internacional', 
    icon: '🌎', 
    color: '#ef4444',
    moeda: 'USD',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto', 'precoTetoBDR'],
    suportaBDR: true
  },
  etfs: { 
    nome: 'ETFs', 
    icon: '📊', 
    color: '#06b6d4',
    moeda: 'USD',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada'],
    suportaBDR: false // ETFs não têm preço teto
  },
  projetoAmerica: { 
    nome: 'Projeto América', 
    icon: '🇺🇸', 
    color: '#1e40af',
    moeda: 'USD',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto', 'precoTetoBDR'],
    suportaBDR: true
  },
  exteriorStocks: { 
    nome: 'Exterior Stocks', 
    icon: '🌍', 
    color: '#059669',
    moeda: 'USD',
    campos: ['ticker', 'setor', 'dataEntrada', 'precoEntrada', 'precoTeto', 'precoTetoBDR'],
    suportaBDR: true
  }
};

const STORAGE_KEY = 'carteiras-dados';

// 🎯 CONTEXT DO STORE
const DataStoreContext = createContext(null);

// 🎯 HOOK PRINCIPAL PARA USAR O STORE - COM VERIFICAÇÃO MELHORADA
export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  
  // 🔧 DEBUG: Log para ajudar a diagnosticar
  console.log('🔍 useDataStore chamado - context:', context);
  
  if (!context) {
    // 🚨 ERRO MAIS DETALHADO
    console.error(`
❌ ERRO: useDataStore foi chamado fora do DataStoreProvider!

🔧 Para corrigir:
1. Certifique-se que o DataStoreProvider está envolvendo sua aplicação
2. Verifique se está no arquivo app/layout.tsx ou _app.tsx:

   import { DataStoreProvider } from '@/hooks/useDataStore';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <DataStoreProvider>
             {children}
           </DataStoreProvider>
         </body>
       </html>
     );
   }

📍 Componente atual: ${new Error().stack?.split('\n')[2] || 'Desconhecido'}
    `);
    
    throw new Error('useDataStore deve ser usado dentro do DataStoreProvider');
  }
  
  return context;
};

// 🎯 PROVIDER DO STORE COM SINCRONIZAÇÃO AUTOMÁTICA
export const DataStoreProvider = ({ children }) => {
  const [dados, setDados] = useState(DADOS_INICIAIS);
  const [cotacoes, setCotacoes] = useState({});
  const [cotacaoUSD, setCotacaoUSD] = useState(5.85); // 🔥 NOVA: Cotação USD/BRL
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 📖 LER DADOS DO LOCALSTORAGE
  const lerDados = useCallback(() => {
    try {
      // 🔧 Verificação se estamos no browser
      if (typeof window === 'undefined') return DADOS_INICIAIS;
      
      const dadosStorage = localStorage.getItem(STORAGE_KEY);
      if (dadosStorage) {
        const dadosParsed = JSON.parse(dadosStorage);
        console.log('📖 Dados lidos do localStorage:', dadosParsed);
        return { ...DADOS_INICIAIS, ...dadosParsed };
      }
      return DADOS_INICIAIS;
    } catch (error) {
      console.error('❌ Erro ao ler dados do localStorage:', error);
      return DADOS_INICIAIS;
    }
  }, []);

  // 💾 SALVAR DADOS NO LOCALSTORAGE E DISPARAR EVENTOS
  const salvarDados = useCallback((novosDados) => {
    try {
      // 🔧 Verificação se estamos no browser
      if (typeof window === 'undefined') return false;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novosDados));
      console.log('💾 Dados salvos no localStorage:', novosDados);
      
      // 🔥 DISPARAR EVENTOS PARA SINCRONIZAÇÃO
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('localStorageUpdate'));
        window.dispatchEvent(new CustomEvent('dataStoreUpdate', { 
          detail: novosDados 
        }));
        console.log('🔔 Eventos de sincronização disparados');
      }, 100);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados no localStorage:', error);
      return false;
    }
  }, []);

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    console.log('🚀 DataStore: Carregando dados iniciais...');
    const dadosIniciais = lerDados();
    setDados(dadosIniciais);
    setIsInitialized(true);
    console.log('✅ DataStore: Inicializado com sucesso');
  }, [lerDados]);

  // 🔄 BUSCAR COTAÇÃO USD NA INICIALIZAÇÃO
  useEffect(() => {
    if (isInitialized) {
      console.log('🚀 DataStore inicializado - buscando cotação USD...');
      buscarCotacaoUSD();
    }
  }, [isInitialized]);

  // 🔄 ATUALIZAÇÃO AUTOMÁTICA DA COTAÇÃO USD (5 minutos)
  useEffect(() => {
    if (!isInitialized) return;
    
    const interval = setInterval(() => {
      console.log('⏰ Atualizando cotação USD/BRL automaticamente...');
      buscarCotacaoUSD();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, [isInitialized]);

  // 🔥 LISTENER PARA MUDANÇAS DO LOCALSTORAGE (SINCRONIZAÇÃO AUTOMÁTICA)
  useEffect(() => {
    // 🔧 Verificação se estamos no browser
    if (typeof window === 'undefined') return;
    
    console.log('👂 DataStore: Configurando listeners de sincronização...');
    
    const handleStorageChange = (event) => {
      console.log('🔄 DataStore: Mudança detectada no localStorage');
      
      // Verificar se a mudança é na nossa chave
      if (event?.key === STORAGE_KEY || !event?.key) {
        const novosDados = lerDados();
        console.log('📊 DataStore: Atualizando dados para:', novosDados);
        setDados(novosDados);
      }
    };

    const handleCustomUpdate = (event) => {
      console.log('🔄 DataStore: Evento customizado detectado:', event.type);
      const novosDados = lerDados();
      setDados(novosDados);
    };

    // 🎯 ADICIONAR LISTENERS PARA TODOS OS TIPOS DE EVENTOS
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomUpdate);
    window.addEventListener('dataStoreUpdate', handleCustomUpdate);

    // 🔄 POLLING COMO BACKUP (a cada 3 segundos)
    const pollingInterval = setInterval(() => {
      const dadosAtuais = lerDados();
      const dadosString = JSON.stringify(dadosAtuais);
      const dadosAtuaisString = JSON.stringify(dados);
      
      if (dadosString !== dadosAtuaisString) {
        console.log('🔄 DataStore: Mudança detectada via polling');
        setDados(dadosAtuais);
      }
    }, 3000);

    return () => {
      console.log('🗑️ DataStore: Removendo listeners...');
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomUpdate);
      window.removeEventListener('dataStoreUpdate', handleCustomUpdate);
      clearInterval(pollingInterval);
    };
  }, [lerDados, dados]);

  // 🔄 SETTER CUSTOMIZADO QUE SALVA AUTOMATICAMENTE
  const atualizarDados = useCallback((novosDados) => {
    console.log('🔄 DataStore: Atualizando dados via setter:', novosDados);
    
    let dadosFinais;
    
    if (typeof novosDados === 'function') {
      dadosFinais = novosDados(dados);
    } else {
      dadosFinais = novosDados;
    }
    
    setDados(dadosFinais);
    salvarDados(dadosFinais);
  }, [dados, salvarDados]);

  // 🔄 BUSCAR COTAÇÕES DA API
  const buscarCotacoes = useCallback(async (tickers) => {
    try {
      setLoading(true);
      const BRAPI_TOKEN = 'jJrMYVy9MATGEicx3GxBp8';
      const response = await fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${BRAPI_TOKEN}`);
      
      if (!response.ok) throw new Error('Erro na API');
      
      const data = await response.json();
      const novasCotacoes = {};
      
      data.results?.forEach(item => {
        novasCotacoes[item.symbol] = item.regularMarketPrice;
      });
      
      setCotacoes(prev => ({ ...prev, ...novasCotacoes }));
      return novasCotacoes;
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔥 NOVA: BUSCAR COTAÇÃO USD/BRL - VERSÃO CORRIGIDA
  const buscarCotacaoUSD = useCallback(async () => {
    try {
      console.log('🔄 Buscando cotação USD/BRL da ExchangeRate-API...');
      
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Resposta completa da API:', data);
      
      if (!data.rates || !data.rates.BRL) {
        throw new Error('Taxa BRL não encontrada na resposta da API');
      }
      
      const cotacao = parseFloat(data.rates.BRL);
      console.log('💱 Cotação USD/BRL obtida:', cotacao);
      
      setCotacaoUSD(cotacao);
      
      // Log de confirmação
      console.log(`✅ Cotação USD/BRL atualizada de ${cotacaoUSD} para ${cotacao}`);
      
      return cotacao;
    } catch (error) {
      console.error('❌ Erro ao buscar cotação USD/BRL:', error);
      console.log('🔄 Mantendo cotação atual:', cotacaoUSD);
      return cotacaoUSD;
    }
  }, [cotacaoUSD]);

  // 📊 OBTER DADOS DE UMA CARTEIRA COM COTAÇÕES
  const obterCarteira = useCallback((nomeCarteira) => {
    const dadosCarteira = dados[nomeCarteira] || [];
    return dadosCarteira.map(item => ({
      ...item,
      precoAtual: cotacoes[item.ticker] || null,
      isReal: !!cotacoes[item.ticker]
    }));
  }, [dados, cotacoes]);

  // ➕ ADICIONAR ATIVO
  const adicionarAtivo = useCallback((carteira, novoAtivo) => {
    const id = `${carteira.slice(0,3)}${Date.now()}`;
    const ativoComId = {
      ...novoAtivo,
      id,
      criadoEm: new Date().toISOString(),
      editadoEm: new Date().toISOString()
    };

    const novosDados = {
      ...dados,
      [carteira]: [...(dados[carteira] || []), ativoComId]
    };

    setDados(novosDados);
    salvarDados(novosDados);

    // Buscar cotação do novo ativo
    buscarCotacoes([novoAtivo.ticker]);
    
    console.log(`➕ Ativo adicionado em ${carteira}:`, ativoComId);
    return ativoComId;
  }, [dados, salvarDados, buscarCotacoes]);

  // ✏️ EDITAR ATIVO
  const editarAtivo = useCallback((carteira, id, dadosAtualizados) => {
    const novosDados = {
      ...dados,
      [carteira]: dados[carteira].map(item => 
        item.id === id 
          ? { ...item, ...dadosAtualizados, editadoEm: new Date().toISOString() }
          : item
      )
    };

    setDados(novosDados);
    salvarDados(novosDados);
    
    console.log(`✏️ Ativo editado em ${carteira}:`, id, dadosAtualizados);
    return novosDados[carteira].find(a => a.id === id);
  }, [dados, salvarDados]);

  // 🗑️ REMOVER ATIVO
  const removerAtivo = useCallback((carteira, ativoId) => {
    const novosDados = {
      ...dados,
      [carteira]: dados[carteira].filter(ativo => ativo.id !== ativoId)
    };

    setDados(novosDados);
    salvarDados(novosDados);
    
    console.log(`🗑️ Ativo removido de ${carteira}:`, ativoId);
    return true;
  }, [dados, salvarDados]);

  // 🔄 REORDENAR ATIVOS
  const reordenarAtivos = useCallback((carteira, novosAtivos) => {
    const novosDados = {
      ...dados,
      [carteira]: novosAtivos.map((ativo, index) => ({
        ...ativo,
        editadoEm: new Date().toISOString()
      }))
    };

    setDados(novosDados);
    salvarDados(novosDados);
    
    console.log(`🔄 Ativos reordenados em ${carteira}`);
  }, [dados, salvarDados]);

  // 🔄 ATUALIZAR TODAS AS COTAÇÕES - VERSÃO CORRIGIDA
  const atualizarTodasCotacoes = useCallback(async () => {
    console.log('🔄 Iniciando atualização de todas as cotações...');
    
    const todosTickers = Object.values(dados)
      .flat()
      .map(item => item.ticker)
      .filter((ticker, index, arr) => arr.indexOf(ticker) === index); // Remove duplicatas

    // Buscar cotações dos ativos
    if (todosTickers.length > 0) {
      console.log('📈 Buscando cotações de', todosTickers.length, 'ativos...');
      await buscarCotacoes(todosTickers);
    }
    
    // 🔥 GARANTIR que a cotação USD seja atualizada
    console.log('💱 Buscando cotação USD/BRL...');
    await buscarCotacaoUSD();
    
    console.log('✅ Todas as cotações atualizadas!');
  }, [dados, buscarCotacoes, buscarCotacaoUSD]);

  // 🔥 NOVA: CONVERTER PREÇOS USD PARA BRL EM LOTE
  const converterUSDparaBRL = useCallback((carteira, cotacaoCustomizada = null) => {
    const carteiraConfig = CARTEIRAS_CONFIG[carteira];
    if (!carteiraConfig || !carteiraConfig.suportaBDR) {
      console.warn(`Carteira ${carteira} não suporta conversão BDR`);
      return false;
    }
    
    const cotacaoUsada = cotacaoCustomizada || cotacaoUSD;
    const ativosCarteira = dados[carteira] || [];
    const ativosParaConverter = ativosCarteira.filter(ativo => 
      ativo.precoTeto && !ativo.precoTetoBDR
    );
    
    if (ativosParaConverter.length === 0) {
      console.log(`Nenhum ativo para converter em ${carteira}`);
      return false;
    }
    
    const ativosAtualizados = ativosCarteira.map(ativo => {
      if (ativo.precoTeto && !ativo.precoTetoBDR) {
        return {
          ...ativo,
          precoTetoBDR: parseFloat((ativo.precoTeto * cotacaoUsada).toFixed(2)),
          editadoEm: new Date().toISOString()
        };
      }
      return ativo;
    });
    
    const novosDados = {
      ...dados,
      [carteira]: ativosAtualizados
    };
    
    setDados(novosDados);
    salvarDados(novosDados);
    
    console.log(`💱 ${ativosParaConverter.length} ativos convertidos em ${carteira} (cotação: ${cotacaoUsada})`);
    return ativosParaConverter.length;
  }, [dados, cotacaoUSD, salvarDados]);

  // 🔧 FUNÇÃO PARA TESTAR A API USD MANUALMENTE
  const testarApiUSD = useCallback(async () => {
    console.log('🧪 TESTE: Buscando cotação USD/BRL...');
    
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      console.log('📊 TESTE - Resposta da API:', data);
      console.log('💱 TESTE - Taxa BRL:', data.rates.BRL);
      console.log('📅 TESTE - Última atualização:', data.date);
      
      return data;
    } catch (error) {
      console.error('❌ TESTE - Erro:', error);
      return null;
    }
  }, []);

  // 📊 ESTATÍSTICAS APRIMORADAS COM DADOS BDR
  const obterEstatisticas = useCallback(() => {
    const totalAtivos = Object.values(dados).reduce((acc, carteira) => acc + (Array.isArray(carteira) ? carteira.length : 0), 0);
    const carteirasPorTamanho = Object.entries(dados)
      .map(([nome, carteira]) => ({ nome, count: Array.isArray(carteira) ? carteira.length : 0 }))
      .sort((a, b) => b.count - a.count);

    // 🔥 NOVA: Estatísticas BDR
    const carteirasInternacionais = Object.keys(CARTEIRAS_CONFIG).filter(
      key => CARTEIRAS_CONFIG[key].suportaBDR
    );
    
    let ativosComBDR = 0;
    let ativosComUSD = 0;
    let ativosSemPrecoTeto = 0;
    
    carteirasInternacionais.forEach(carteira => {
      const ativos = dados[carteira] || [];
      ativos.forEach(ativo => {
        if (ativo.precoTetoBDR) ativosComBDR++;
        else if (ativo.precoTeto) ativosComUSD++;
        else ativosSemPrecoTeto++;
      });
    });

    return {
      totalAtivos,
      totalCarteiras: Object.keys(dados).length,
      carteirasPorTamanho,
      // 🔥 NOVAS estatísticas BDR
      bdr: {
        ativosComBDR,
        ativosComUSD,
        ativosSemPrecoTeto,
        cotacaoUSDAtual: cotacaoUSD
      },
      ultimaAtualizacao: new Date().toISOString()
    };
  }, [dados, cotacaoUSD]);

  // 🔧 FUNÇÃO DEBUG APRIMORADA
  const debug = useCallback(() => {
    console.log('🔍 === DEBUG DataStore ===');
    console.log('📊 Dados atuais:', dados);
    console.log('💾 localStorage:', typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : 'N/A (SSR)');
    console.log('📈 Estatísticas:', obterEstatisticas());
    console.log('🏁 Inicializado:', isInitialized);
    console.log('💱 Cotação USD/BRL:', cotacaoUSD);
    
    // 🔥 DEBUG específico para BDR
    const carteirasComBDR = Object.keys(CARTEIRAS_CONFIG).filter(
      key => CARTEIRAS_CONFIG[key].suportaBDR
    );
    
    console.log('💱 === ANÁLISE BDR ===');
    carteirasComBDR.forEach(carteira => {
      const ativos = dados[carteira] || [];
      const ativosComBDR = ativos.filter(a => a.precoTetoBDR);
      const ativosComUSD = ativos.filter(a => a.precoTeto && !a.precoTetoBDR);
      
      console.log(`📊 ${carteira}:`, {
        total: ativos.length,
        comBDR: ativosComBDR.length,
        comUSD: ativosComUSD.length,
        ativosComBDR: ativosComBDR.map(a => ({ ticker: a.ticker, precoTetoBDR: a.precoTetoBDR })),
        ativosComUSD: ativosComUSD.map(a => ({ ticker: a.ticker, precoTeto: a.precoTeto }))
      });
    });
    
    return {
      dados,
      localStorage: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
      estatisticas: obterEstatisticas(),
      isInitialized,
      cotacaoUSD,
      testarApiUSD
    };
  }, [dados, obterEstatisticas, isInitialized, cotacaoUSD, testarApiUSD]);

  // 🔧 DISPONIBILIZAR FUNÇÃO DEBUG GLOBALMENTE
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.debugDataStore = debug;
      console.log('🔧 Função debugDataStore() disponibilizada globalmente');
      return () => {
        delete window.debugDataStore;
      };
    }
  }, [debug]);

  // 🚨 PROTEÇÃO: Aguardar inicialização
  if (!isInitialized) {
    console.log('⏳ DataStore ainda inicializando...');
    return (
      <DataStoreContext.Provider value={null}>
        {children}
      </DataStoreContext.Provider>
    );
  }

  const value = {
    // Dados
    dados,
    cotacoes,
    cotacaoUSD, // 🔥 NOVA: Cotação USD/BRL
    loading,
    isInitialized,
    
    // Configurações
    CARTEIRAS_CONFIG,
    
    // Métodos
    setDados: atualizarDados,
    obterCarteira,
    adicionarAtivo,
    editarAtivo,
    removerAtivo,
    reordenarAtivos,
    buscarCotacoes,
    buscarCotacaoUSD, // 🔥 NOVA
    atualizarTodasCotacoes,
    converterUSDparaBRL, // 🔥 NOVA
    testarApiUSD, // 🔥 NOVA
    obterEstatisticas,
    debug
  };

  console.log('✅ DataStore: Provider renderizando com valor:', { ...value, dados: 'DADOS_EXISTEM' });

  return (
    <DataStoreContext.Provider value={value}>
      {children}
    </DataStoreContext.Provider>
  );
};

// 🎯 HOOKS ESPECÍFICOS PARA CADA CARTEIRA - COM PROTEÇÃO
export const useSmallCaps = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('smallCaps');
};

export const useMicroCaps = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('microCaps');
};

export const useDividendos = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('dividendos');
};

export const useFiis = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('fiis');
};

export const useDividendosInternacional = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('dividendosInternacional');
};

export const useETFs = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('etfs');
};

export const useProjetoAmerica = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('projetoAmerica');
};

export const useExteriorStocks = () => {
  const { obterCarteira } = useDataStore();
  return obterCarteira('exteriorStocks');
};