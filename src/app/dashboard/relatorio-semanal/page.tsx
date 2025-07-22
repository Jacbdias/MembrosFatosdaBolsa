'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Globe, Building, Zap, AlertCircle, CheckCircle, BarChart3, Lock } from 'lucide-react';
import { useAuthAccess } from '@/hooks/use-auth-access';

// Componente para renderizar HTML formatado com segurança
interface HTMLContentProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const HTMLContent: React.FC<HTMLContentProps> = ({
  content,
  className = '',
  style = {}
}) => {
  if (!content) return null;

  // Sanitizar e limpar o HTML (básico)
  const sanitizeHTML = (html: string) => {
    // Remove scripts e outros elementos perigosos
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '') // remove event handlers
      .replace(/on\w+='[^']*'/gi, '') // remove event handlers
      .replace(/javascript:/gi, ''); // remove javascript: urls
  };

  const cleanContent = sanitizeHTML(content);

  return (
    <div
      className={`html-content ${className}`}
      style={{
        lineHeight: '1.6',
        fontSize: '16px',
        color: '#4b5563',
        ...style
      }}
      dangerouslySetInnerHTML={{ __html: cleanContent }}
    />
  );
};

// CSS global para estilizar o conteúdo formatado
const HTMLContentStyles = () => (
  <style>{`
    .html-content {
      word-wrap: break-word;
    }
    
    .html-content p {
      margin: 0 0 12px 0;
    }
    
    .html-content strong, .html-content b {
      font-weight: 700;
      color: #1f2937;
    }
    
    .html-content em, .html-content i {
      font-style: italic;
    }
    
    .html-content u {
      text-decoration: underline;
    }
    
    .html-content strike, .html-content s {
      text-decoration: line-through;
    }
    
    .html-content a {
      color: #2563eb;
      text-decoration: underline;
      transition: color 0.2s;
    }
    
    .html-content a:hover {
      color: #1d4ed8;
    }
    
    .html-content ul, .html-content ol {
      margin: 12px 0;
      padding-left: 24px;
    }
    
    .html-content li {
      margin: 6px 0;
    }
    
    .html-content ul li {
      list-style-type: disc;
    }
    
    .html-content ol li {
      list-style-type: decimal;
    }
    
    .html-content div[style*="text-align: center"] {
      text-align: center;
    }
    
    .html-content div[style*="text-align: right"] {
      text-align: right;
    }
    
    .html-content div[style*="text-align: left"] {
      text-align: left;
    }
    
    /* Tamanhos de fonte */
    .html-content font[size="1"] {
      font-size: 12px;
    }
    
    .html-content font[size="3"] {
      font-size: 16px;
    }
    
    .html-content font[size="5"] {
      font-size: 20px;
    }
    
    .html-content font[size="7"] {
      font-size: 24px;
    }
    
    /* Cores personalizadas são mantidas via style inline */
  `}</style>
);

// Header com design elegante
const ReportHeader = ({ relatorio, planName }: { relatorio: any; planName?: string }) => (
  <div style={{
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 75%, #1a1a1a 100%)',
    color: 'white',
    padding: '80px 40px 100px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {/* Pattern de fundo mais sofisticado */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `radial-gradient(circle at 25% 25%, rgba(76, 250, 0, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(76, 250, 0, 0.05) 0%, transparent 50%),
                        linear-gradient(45deg, transparent 40%, rgba(76, 250, 0, 0.02) 50%, transparent 60%)`,
      opacity: 0.8
    }} />
    
    {/* Elementos decorativos */}
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '200px',
      height: '200px',
      border: '1px solid rgba(76, 250, 0, 0.1)',
      borderRadius: '50%',
      transform: 'rotate(45deg)'
    }} />
    
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      width: '150px',
      height: '150px',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '50%'
    }} />
    
    <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto' }}>
      {/* Badge do plano mais elegante */}
      {planName && (
        <div style={{
          background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
          color: '#000000',
          padding: '12px 24px',
          borderRadius: '30px',
          display: 'inline-block',
          fontSize: '13px',
          fontWeight: '800',
          marginBottom: '30px',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          boxShadow: '0 8px 25px rgba(76, 250, 0, 0.3)',
          border: '1px solid rgba(76, 250, 0, 0.5)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
            borderRadius: '30px'
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>{planName}</span>
        </div>
      )}
      
      {/* Subtítulo mais refinado */}
      <div style={{ 
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px'
      }}>
        <div style={{
          height: '1px',
          width: '60px',
          background: 'linear-gradient(90deg, transparent, #4cfa00, transparent)'
        }} />
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#4cfa00',
          textShadow: '0 0 20px rgba(76, 250, 0, 0.5)'
        }}>
          AÇÕES BRASILEIRAS • EXTERIOR
        </span>
        <div style={{
          height: '1px',
          width: '60px',
          background: 'linear-gradient(90deg, transparent, #4cfa00, transparent)'
        }} />
      </div>
      
      {/* Título principal mais impactante */}
      <h1 style={{
        fontSize: 'clamp(36px, 6vw, 64px)',
        fontWeight: '900',
        margin: '0 0 20px 0',
        lineHeight: '1.1',
        background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        Relatório de<br/>
        <span style={{
          background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: '0 0 30px rgba(76, 250, 0, 0.5)'
        }}>
          ATUALIZAÇÃO
        </span>
      </h1>
      
      {/* Data com design mais sofisticado */}
      <div style={{
        margin: '40px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px'
      }}>
        <div style={{
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {relatorio?.date ? new Date(relatorio.date).toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase() : 'CARREGANDO...'}
        </div>
        
        <div style={{
          fontSize: '18px',
          color: '#a3a3a3',
          fontWeight: '500',
          padding: '8px 20px',
          borderRadius: '25px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {relatorio?.date ? new Date(relatorio.date).toLocaleDateString('pt-BR') : '...'}
        </div>
      </div>
      
      {/* Logo mais elegante */}
      <div style={{
        marginTop: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(76, 250, 0, 0.2) 0%, rgba(76, 250, 0, 0.05) 100%)',
          border: '2px solid #4cfa00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(76, 250, 0, 0.3), inset 0 0 20px rgba(76, 250, 0, 0.1)',
          position: 'relative'
        }}>
          {/* Efeito de brilho interno */}
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            bottom: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }} />
          <BarChart3 size={32} style={{ color: '#4cfa00', position: 'relative', zIndex: 1 }} />
        </div>
        
        <div style={{
          fontSize: '16px',
          fontWeight: '800',
          textAlign: 'left',
          letterSpacing: '1px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4cfa00 0%, #45e000 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FATOS
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            DA BOLSA
          </div>
        </div>
      </div>
      
      {/* Indicador de scroll sutil */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        <span>Role para ver o relatório</span>
        <div style={{
          width: '2px',
          height: '20px',
          background: 'linear-gradient(180deg, #4cfa00, transparent)',
          borderRadius: '1px',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    </div>
  </div>
);

// Seção bloqueada para mostrar quando usuário não tem acesso
const BlockedSection = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div style={{
    backgroundColor: '#f9f9f9',
    padding: '40px',
    marginBottom: '30px',
    borderRadius: '0px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    overflow: 'hidden',
    opacity: 0.6
  }}>
    {/* Background decorativo desbotado */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '200px',
      height: '100%',
      background: `linear-gradient(45deg, ${color}08, ${color}03)`,
      clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }} />
    
    {/* Ícone de bloqueio */}
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '40px',
      backgroundColor: '#ef4444',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Lock size={20} style={{ color: 'white' }} />
    </div>
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={30} style={{ color: '#9ca3af' }} />
        </div>
        
        <div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#9ca3af',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#ef4444',
            margin: '5px 0 0 0',
            fontWeight: '600'
          }}>
            🔒 Conteúdo exclusivo - Upgrade necessário
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Seção com design do PDF
const SectionHeader = ({ icon: Icon, title, color, count }: { icon: any, title: string, color: string, count: number }) => (
  <div style={{
    backgroundColor: 'white',
    padding: '40px',
    marginBottom: '30px',
    borderRadius: '0px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    {/* Background decorativo */}
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      width: '200px',
      height: '100%',
      background: `linear-gradient(45deg, ${color}15, ${color}05)`,
      clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%)'
    }} />
    
    {/* Barras decorativas verdes */}
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '40px',
      display: 'flex',
      gap: '4px',
      alignItems: 'end'
    }}>
      {[20, 30, 25, 40, 35, 45].map((height, i) => (
        <div key={i} style={{
          width: '8px',
          height: `${height}px`,
          backgroundColor: '#4cfa00',
          borderRadius: '2px'
        }} />
      ))}
    </div>
    
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: color,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={30} style={{ color: 'white' }} />
        </div>
        
        <div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {title}
          </h2>
          {count > 0 && (
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '5px 0 0 0',
              fontWeight: '500'
            }}>
              {count} {count === 1 ? 'item' : 'itens'}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Sistema inteligente para encontrar logos de empresas (mantido igual)
const generateLogoSources = (ticker: string, companyName?: string) => {
  const sources: string[] = [];
  
  // Limpar ticker para diferentes variações
  const cleanTicker = ticker.replace(/[0-9]/g, '').replace(/[^A-Za-z]/g, '').toLowerCase();
  const tickerBase = ticker.replace(/[0-9]/g, '').toLowerCase();
  
  // 1. DOMÍNIOS ESPECÍFICOS CONHECIDOS (prioritários)
  const knownDomains = getKnownDomain(ticker);
  if (knownDomains.length > 0) {
    knownDomains.forEach(domain => {
      sources.push(
        `https://logo.clearbit.com/${domain}`,
        `https://img.logo.dev/${domain}?token=pk_X-1ZO13IREOmTdwhAAEI8Q&size=200`,
        `https://logo.clearbit.com/${domain}?size=200&format=png`
      );
    });
  }
  
  // 2. TENTATIVAS COM TICKER (múltiplas variações)
  sources.push(
    // Polygon (bom para ações americanas)
    `https://s3.polygon.io/logos/${ticker.toLowerCase()}/logo.png`,
    
    // Clearbit com diferentes combinações
    `https://logo.clearbit.com/${tickerBase}.com.br`,
    `https://logo.clearbit.com/${tickerBase}.com`,
    `https://logo.clearbit.com/${cleanTicker}.com.br`,
    `https://logo.clearbit.com/${cleanTicker}.com`,
    
    // Logo.dev
    `https://img.logo.dev/${tickerBase}.com.br?token=pk_X-1ZO13IREOmTdwhAAEI8Q`,
    `https://img.logo.dev/${tickerBase}.com?token=pk_X-1ZO13IREOmTdwhAAEI8Q`,
    `https://img.logo.dev/${cleanTicker}.com.br?token=pk_X-1ZO13IREOmTdwhAAEI8Q`,
    `https://img.logo.dev/${cleanTicker}.com?token=pk_X-1ZO13IREOmTdwhAAEI8Q`
  );
  
  // 3. TENTATIVAS COM NOME DA EMPRESA (se fornecido)
  if (companyName) {
    const cleanCompanyName = companyName
      .toLowerCase()
      .replace(/[^a-z\s]/g, '') // remove caracteres especiais
      .replace(/\s+/g, '') // remove espaços
      .replace(/(sa|ltda|corp|inc|company|cia|s\.a\.|holding|participacoes)/g, ''); // remove sufixos
    
    if (cleanCompanyName.length > 2) {
      sources.push(
        `https://logo.clearbit.com/${cleanCompanyName}.com.br`,
        `https://logo.clearbit.com/${cleanCompanyName}.com`,
        `https://img.logo.dev/${cleanCompanyName}.com.br?token=pk_X-1ZO13IREOmTdwhAAEI8Q`,
        `https://img.logo.dev/${cleanCompanyName}.com?token=pk_X-1ZO13IREOmTdwhAAEI8Q`
      );
      
      // Tentativas com palavras do nome
      const words = companyName.toLowerCase().split(' ').filter(w => w.length > 3);
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (cleanWord.length > 3) {
          sources.push(
            `https://logo.clearbit.com/${cleanWord}.com.br`,
            `https://logo.clearbit.com/${cleanWord}.com`
          );
        }
      });
    }
  }
  
  // 4. APIS ALTERNATIVAS
  sources.push(
    // Brandfetch alternatives
    `https://assets.brandfolder.com/logo/${cleanTicker}`,
    
    // Wikipedia/Wikimedia (muitas empresas têm logos lá)
    `https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/${cleanTicker}_logo.svg/200px-${cleanTicker}_logo.svg.png`,
    `https://upload.wikimedia.org/wikipedia/pt/thumb/0/0a/${cleanTicker}_logo.svg/200px-${cleanTicker}_logo.svg.png`,
    
    // Yahoo Finance alternatives
    `https://s3.yimg.com/uc/finance/1.3.0/images/logos/${ticker}.png`,
    `https://logo.yahoo.com/${cleanTicker}`,
    
    // Google alternatives (menos confiável mas vale tentar)
    `https://logo.googleapis.com/logo?domain=${cleanTicker}.com.br`,
    `https://logo.googleapis.com/logo?domain=${cleanTicker}.com`
  );
  
  // 5. FALLBACK INTELIGENTE - Avatar personalizado
  const avatarBg = getAvatarColor(ticker);
  sources.push(
    `https://ui-avatars.com/api/?name=${ticker.substring(0,4)}&background=${avatarBg}&color=ffffff&size=60&font-size=0.7&bold=true&format=svg`,
    `https://api.dicebear.com/7.x/initials/svg?seed=${ticker}&backgroundColor=${avatarBg}&fontSize=36`
  );
  
  return sources;
};

// Mapeamento de domínios conhecidos (expandido)
const getKnownDomain = (ticker: string) => {
  const domainMap: { [key: string]: string[] } = {
    // Bancos Brasileiros
    'ABCB4': ['abcbrasil.com.br'], 'ITUB4': ['itau.com.br'], 'BBDC4': ['bradesco.com.br'],
    'BBAS3': ['bb.com.br'], 'SANB11': ['santander.com.br'], 'BPAC11': ['btgpactual.com'],
    
    // Energia/Petróleo
    'PETR4': ['petrobras.com.br'], 'VALE3': ['vale.com'], 'CPLE6': ['copel.com'],
    'EGIE3': ['engie.com.br'], 'TAEE11': ['taesa.com.br'], 'CMIG4': ['cemig.com.br'],
    
    // Varejo
    'MGLU3': ['magazineluiza.com.br'], 'VVAR3': ['viavarejo.com.br'], 'AMER3': ['americanas.com.br'],
    'LREN3': ['lojasrenner.com.br'], 'GRND3': ['grendene.com.br'],
    
    // Tecnologia Brasil
    'TOTS3': ['totvs.com'], 'LINX3': ['linx.com.br'], 'POSI3': ['positivo.com.br'],
    
    // Telecomunicações
    'VIVT3': ['vivo.com.br'], 'TIMS3': ['tim.com.br'], 'OIBR3': ['oi.com.br'],
    
    // Saneamento
    'SAPR11': ['sanepar.com.br'], 'SBSP3': ['sabesp.com.br'], 'CSMG3': ['copasa.com.br'],
    
    // Alimentício/Agro
    'SMTO3': ['saomartinho.com.br'], 'BEEF3': ['minervafoods.com'], 'JBSS3': ['jbs.com.br'],
    'BRF3': ['brf-global.com'], 'SLCE3': ['slcagricola.com.br'],
    
    // Papel/Celulose
    'SUZB3': ['suzano.com.br'], 'KROT3': ['klabin.com.br'],
    
    // Siderurgia/Mineração
    'CSNA3': ['csn.com.br'], 'USIM5': ['usiminas.com'], 'GGBR4': ['gerdau.com.br'],
    
    // Educação
    'COGN3': ['cogna.com.br'], 'YDUQ3': ['yduq.com.br'],
    
    // Saúde
    'RDOR3': ['rdorsaocristovao.com.br'], 'HAPV3': ['hapvida.com.br'],
    
    // Logística
    'RAIL3': ['rumo.com.br'], 'CCRO3': ['ccr.com.br'],
    
    // Exterior - Tech Giants
    'AAPL': ['apple.com'], 'MSFT': ['microsoft.com'], 'GOOGL': ['google.com', 'alphabet.com'],
    'AMZN': ['amazon.com'], 'TSLA': ['tesla.com'], 'NVDA': ['nvidia.com'], 'META': ['meta.com'],
    'NFLX': ['netflix.com'], 'CRM': ['salesforce.com'], 'ORCL': ['oracle.com'],
    
    // Exterior - Outros
    'HD': ['homedepot.com'], 'HOME34': ['homedepot.com'], 'WMT': ['walmart.com'],
    'DIS': ['disney.com'], 'NKE': ['nike.com'], 'MCD': ['mcdonalds.com'],
    'KO': ['coca-cola.com'], 'PEP': ['pepsi.com'], 'JNJ': ['jnj.com']
  };
  
  return domainMap[ticker.toUpperCase()] || [];
};

// Gerar cor do avatar baseada no ticker
const getAvatarColor = (ticker: string) => {
  const colors = ['4cfa00', '2563eb', 'ea580c', '7c3aed', 'dc2626', '059669', 'f59e0b'];
  const index = ticker.charCodeAt(0) % colors.length;
  return colors[index];
};

// Componente para logo da empresa (mantido igual)
const CompanyLogo = ({ ticker, fallbackColor, item }: { ticker: string, fallbackColor: string, item?: any }) => {
  const [logoSrc, setLogoSrc] = useState<string>('');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!ticker) return;
    
    console.log(`🔍 [LOGO] Buscando logo para: ${ticker}${item?.company ? ` (${item.company})` : ''}`);
    
    // Gerar todas as fontes possíveis
    const logoSources = generateLogoSources(ticker, item?.company);
    
    console.log(`🔍 [LOGO] Tentando ${logoSources.length} fontes diferentes`);
    
    // Tentar carregar o primeiro logo disponível
    function tryLoadLogo(sources: string[], index = 0) {
      if (index >= sources.length) {
        console.log(`❌ [LOGO] Nenhum logo encontrado para ${ticker}`);
        setLogoError(true);
        return;
      }

      const currentSource = sources[index];
      console.log(`🔄 [LOGO] Tentativa ${index + 1}/${sources.length}: ${currentSource}`);

      const img = new Image();
      img.onload = () => {
        // Verificar se a imagem não é muito pequena (evitar placeholders)
        if (img.width > 16 && img.height > 16) {
          console.log(`✅ [LOGO] Logo encontrado para ${ticker}: ${currentSource}`);
          setLogoSrc(currentSource);
        } else {
          console.log(`⚠️ [LOGO] Logo muito pequeno (${img.width}x${img.height}), tentando próximo`);
          tryLoadLogo(sources, index + 1);
        }
      };
      
      img.onerror = () => {
        console.log(`❌ [LOGO] Falha ao carregar: ${currentSource}`);
        tryLoadLogo(sources, index + 1);
      };
      
      // Timeout para evitar travamento em logos que demoram muito
      const timeout = setTimeout(() => {
        console.log(`⏰ [LOGO] Timeout para: ${currentSource}`);
        tryLoadLogo(sources, index + 1);
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        if (img.width > 16 && img.height > 16) {
          console.log(`✅ [LOGO] Logo encontrado para ${ticker}: ${currentSource}`);
          setLogoSrc(currentSource);
        } else {
          tryLoadLogo(sources, index + 1);
        }
      };
      
      img.src = currentSource;
    }
    
    tryLoadLogo(logoSources);
  }, [ticker, item?.company]);

  if (logoError || !logoSrc) {
    return (
      <div style={{
        width: '60px',
        height: '60px',
        background: `linear-gradient(135deg, ${fallbackColor}20, ${fallbackColor}10)`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${fallbackColor}40`,
        fontSize: '14px',
        fontWeight: '700',
        color: fallbackColor,
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {ticker?.substring(0, 4) || 'TICK'}
      </div>
    );
  }

  return (
    <div style={{
      width: '60px',
      height: '60px',
      backgroundColor: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${fallbackColor}30`,
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={logoSrc}
        alt={`Logo ${ticker}`}
        style={{
          width: '50px',
          height: '50px',
          objectFit: 'contain',
          borderRadius: '4px'
        }}
        onError={() => setLogoError(true)}
      />
    </div>
  );
};

// Card de ação com logo e HTML renderizado (mantido igual)
const StockCard = ({ item, sectionColor }: { item: any, sectionColor: string }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '25px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: `3px solid ${sectionColor}15`,
    position: 'relative'
  }}>
    {/* Header com logo e ticker */}
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ marginRight: '15px' }}>
        <CompanyLogo ticker={item.ticker} fallbackColor={sectionColor} item={item} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          {item.impact && (
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: item.impact === 'positive' ? '#4cfa00' : item.impact === 'negative' ? '#ef4444' : '#6b7280',
              backgroundColor: item.impact === 'positive' ? '#4cfa0015' : item.impact === 'negative' ? '#ef444415' : '#6b728015',
              padding: '4px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}>
              {item.impact === 'positive' ? 'Positivo' : item.impact === 'negative' ? 'Negativo' : 'Neutro'}
            </span>
          )}
        </div>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          margin: 0,
          fontWeight: '500'
        }}>
          {item.company}
        </p>
      </div>
    </div>

    {/* Título da notícia */}
    <h4 style={{
      fontSize: '20px',
      fontWeight: '600',
      color: '#1a1a1a',
      margin: '0 0 15px 0',
      lineHeight: '1.3'
    }}>
      {item.news || item.title}
    </h4>

    {/* MUDANÇA: Renderizando HTML formatado em vez de FormattedText */}
    {item.summary && (
      <HTMLContent 
        content={item.summary}
        style={{
          fontSize: '16px',
          color: '#4b5563',
          lineHeight: '1.6',
          margin: '0 0 15px 0'
        }}
      />
    )}

    {/* Destaque formatado com HTML */}
    {item.highlight && (
      <div style={{
        padding: '15px 0',
        margin: '15px 0',
        borderLeft: `4px solid ${sectionColor}`,
        paddingLeft: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: sectionColor,
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💡 Destaque
        </div>
        <HTMLContent 
          content={item.highlight}
          style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: 0,
            fontWeight: '500'
          }}
        />
      </div>
    )}

    {/* Recomendação formatada com HTML */}
    {item.recommendation && (
      <div style={{
        backgroundColor: '#f0fdf4',
        border: '1px solid #4cfa0030',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '15px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#15803d',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Recomendação
        </div>
        <HTMLContent 
          content={item.recommendation}
          style={{
            fontSize: '16px',
            color: '#166534',
            margin: 0,
            fontWeight: '500'
          }}
        />
      </div>
    )}

    {/* Tags de setores/recomendações */}
    {(item.sectors?.length > 0 || item.recommendations?.length > 0) && (
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {item.sectors?.map((setor: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '500'
          }}>
            {setor}
          </span>
        ))}
        {item.recommendations?.map((rec: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#4cfa00',
            backgroundColor: '#f0fdf4',
            padding: '4px 8px',
            borderRadius: '6px',
            fontWeight: '600'
          }}>
            {rec}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Card de provento com logo (mantido igual)
const ProventoCard = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    border: '3px solid #4cfa0015'
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={{ marginRight: '15px' }}>
        <CompanyLogo ticker={item.ticker} fallbackColor="#4cfa00" item={item} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0
          }}>
            {item.ticker}
          </h3>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: item.type === 'JCP' ? '#7c3aed' : '#2563eb',
            backgroundColor: item.type === 'JCP' ? '#7c3aed15' : '#2563eb15',
            padding: '4px 8px',
            borderRadius: '6px'
          }}>
            {item.type}
          </span>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          {item.company}
        </p>
      </div>
    </div>

    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
      gap: '20px' 
    }}>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Valor</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{item.value}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>DY</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#4cfa00' }}>{item.dy}</div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Data-com</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.exDate ? new Date(item.exDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Pagamento</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>
          {item.payDate ? new Date(item.payDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
    </div>
  </div>
);

export default function RelatorioSemanalPage() {
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 NOVA IMPLEMENTAÇÃO: Hook de permissões
  const { planInfo, loading: authLoading, hasAccessSync, user, debugInfo } = useAuthAccess();

  useEffect(() => {
    const loadRelatorio = async () => {
      try {
        console.log('📖 [DEBUG] Buscando relatório publicado (client-side)...');
        
        const response = await fetch('/api/relatorio-semanal');
        console.log('📖 [DEBUG] Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📖 [DEBUG] Dados recebidos:', data);
        
        // Só mostrar se estiver publicado
        if (data && data.status === 'published') {
          setRelatorio(data);
        } else {
          console.log('📖 [DEBUG] Relatório não está publicado');
          setRelatorio(null);
        }
        
      } catch (error) {
        console.error('📖 [DEBUG] Erro ao carregar relatório:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadRelatorio();
  }, []);

  // 🔥 MAPEAMENTO DAS SEÇÕES PARA PERMISSÕES
  const getSectionPermissions = () => {
    return {
      'macro': [], // Panorama macro disponível para todos
      'proventos': ['dividendos', 'fundos-imobiliarios'], // Proventos = dividendos OU FIIs
      'dividendos': ['dividendos'],
      'smallCaps': ['small-caps'],
      'microCaps': ['micro-caps'],
      'exterior': ['internacional', 'internacional-etfs', 'internacional-stocks'] // Qualquer permissão internacional
    };
  };

  // 🔥 FUNÇÃO PARA VERIFICAR SE USUÁRIO TEM ACESSO À SEÇÃO
  const hasAccessToSection = (sectionKey: string): boolean => {
    const sectionPermissions = getSectionPermissions();
    const requiredPermissions = sectionPermissions[sectionKey] || [];
    
    // Se não requer permissão específica (como macro), libera para todos
    if (requiredPermissions.length === 0) {
      return true;
    }
    
    // Se o usuário não está autenticado
    if (!user) {
      return false;
    }
    
    // Admin sempre tem acesso
    if (user.plan === 'ADMIN') {
      return true;
    }
    
    // Verifica se tem pelo menos uma das permissões necessárias
    return requiredPermissions.some(permission => hasAccessSync(permission));
  };

  // 🔥 LOG DE DEBUG DAS PERMISSÕES
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🎯 [PERMISSIONS DEBUG]', {
        user: user.email,
        plan: user.plan,
        planName: planInfo?.displayName,
        permissions: planInfo?.pages,
        customPermissions: user.customPermissions,
        sectionsAccess: {
          macro: hasAccessToSection('macro'),
          proventos: hasAccessToSection('proventos'),
          dividendos: hasAccessToSection('dividendos'),
          smallCaps: hasAccessToSection('smallCaps'),
          microCaps: hasAccessToSection('microCaps'),
          exterior: hasAccessToSection('exterior')
        }
      });
    }
  }, [user, planInfo, authLoading]);

  if (loading || authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            border: '4px solid #e5e7eb', 
            borderTop: '4px solid #4cfa00', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
            Carregando Relatório
          </h2>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {loading ? 'Buscando o relatório semanal...' : 'Verificando permissões...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '60px', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px'
        }}>
          <AlertCircle size={64} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '15px' 
          }}>
            Erro ao Carregar
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px'
          }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#4cfa00',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!relatorio) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          backgroundColor: 'white', 
          padding: '60px', 
          borderRadius: '16px', 
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px'
        }}>
          <AlertCircle size={64} style={{ color: '#f59e0b', marginBottom: '20px' }} />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1a1a1a', 
            marginBottom: '15px' 
          }}>
            Relatório Não Disponível
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '18px',
            lineHeight: '1.6'
          }}>
            O relatório semanal ainda não foi publicado pelos nossos analistas.
          </p>
        </div>
      </div>
    );
  }

  // 🔥 DEFINIÇÃO DAS SEÇÕES COM VERIFICAÇÃO DE ACESSO
  const sections = [
    { 
      key: 'macro', 
      data: relatorio.macro, 
      title: 'Panorama Macro', 
      icon: Globe, 
      color: '#2563eb' 
    },
    { 
      key: 'proventos', 
      data: relatorio.proventos, 
      title: 'Proventos', 
      icon: DollarSign, 
      color: '#4cfa00'
    },
    { 
      key: 'dividendos', 
      data: relatorio.dividendos, 
      title: 'Dividendos', 
      icon: Calendar, 
      color: '#22c55e' 
    },
    { 
      key: 'smallCaps', 
      data: relatorio.smallCaps, 
      title: 'Small Caps', 
      icon: Building, 
      color: '#2563eb' 
    },
    { 
      key: 'microCaps', 
      data: relatorio.microCaps, 
      title: 'Micro Caps', 
      icon: Zap, 
      color: '#ea580c' 
    },
    { 
      key: 'exterior', 
      data: relatorio.exterior, 
      title: 'Exterior', 
      icon: TrendingUp, 
      color: '#7c3aed' 
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Incluir os estilos do HTML Content */}
      <HTMLContentStyles />
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(5px); }
        }
      `}</style>
      
      <ReportHeader relatorio={relatorio} planName={planInfo?.displayName} />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '50px 20px' }}>
        {sections.map((section) => {
          const hasAccess = hasAccessToSection(section.key);
          const hasData = section.data && section.data.length > 0;
          
          // Se não tem dados para esta seção, não mostra nada
          if (!hasData) return null;
          
          // 🔥 SE NÃO TEM ACESSO, MOSTRA SEÇÃO BLOQUEADA
          if (!hasAccess) {
            return (
              <section key={section.key} style={{ marginBottom: '60px' }}>
                <BlockedSection 
                  icon={section.icon}
                  title={section.title}
                  color={section.color}
                />
              </section>
            );
          }
          
          // 🔥 SE TEM ACESSO, MOSTRA NORMALMENTE
          return (
            <section key={section.key} style={{ marginBottom: '60px' }}>
              <SectionHeader 
                icon={section.icon}
                title={section.title}
                color={section.color}
                count={section.data.length}
              />
              
              <div>
                {section.data.map((item: any, index: number) => (
                  section.key === 'proventos' ? (
                    <ProventoCard key={index} item={item} />
                  ) : (
                    <StockCard key={index} item={item} sectionColor={section.color} />
                  )
                ))}
              </div>
            </section>
          );
        })}
        
        {/* 🔥 SEÇÃO DE DEBUG (apenas para admins) */}
        {debugInfo?.isAdmin && (
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '40px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <h3 style={{ marginBottom: '10px', color: '#374151' }}>🐛 Debug Info (Admin Only)</h3>
            <pre style={{ margin: 0, color: '#6b7280' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Rodapé */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '60px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #4cfa00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={20} style={{ color: '#4cfa00' }} />
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1a1a1a'
            }}>
              FATOS DA BOLSA
            </span>
          </div>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '14px',
            margin: 0
          }}>
            © Fatos da Bolsa - contato@fatosdabolsa.com.br
          </p>
          <p style={{ 
            color: '#9ca3af', 
            fontSize: '12px',
            margin: '5px 0 0 0'
          }}>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
}