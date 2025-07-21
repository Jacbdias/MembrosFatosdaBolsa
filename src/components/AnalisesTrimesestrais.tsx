import React, { useState, useEffect, useCallback, memo } from 'react';
import { Eye, Calendar, TrendingUp, TrendingDown, BarChart3, Target, AlertCircle, ExternalLink, FileText, Building } from 'lucide-react';

// Interfaces (mesmas do componente admin)
interface MetricaTrimestreData {
  valor: number;
  unidade: string;
  variacao?: number;
  margem?: number;
}

interface AnaliseTrimestreData {
  id?: string;
  ticker: string;
  empresa: string;
  trimestre: string;
  dataPublicacao: string;
  autor: string;
  categoria: 'resultado_trimestral' | 'analise_setorial' | 'tese_investimento';
  
  // Conteúdo principal
  titulo: string;
  resumoExecutivo: string;
  analiseCompleta: string;
  
  // Métricas do trimestre
  metricas: {
    receita?: MetricaTrimestreData;
    ebitda?: MetricaTrimestreData;
    lucroLiquido?: MetricaTrimestreData;
    roe?: MetricaTrimestreData;
  };
  
  // Análise
  pontosFavoraveis: string;
  pontosAtencao: string;
  
  // Recomendação
  recomendacao: 'COMPRA' | 'VENDA' | 'MANTER';
  precoAlvo?: number;
  risco: 'BAIXO' | 'MÉDIO' | 'ALTO';
  
  // Links externos
  linkResultado?: string;
  linkConferencia?: string;
  
  status: 'draft' | 'published';
}

// Função para formatar valores
const formatarValorMetrica = (metrica: MetricaTrimestreData | undefined): string => {
  if (!metrica || !metrica.valor) return 'N/A';
  
  const valor = metrica.valor;
  const unidade = metrica.unidade === 'bilhões' ? 'bi' : 'mi';
  
  if (valor >= 1000 && unidade === 'mi') {
    return `R$ ${(valor / 1000).toFixed(1)} bi`;
  }
  
  return `R$ ${valor.toFixed(1)} ${unidade}`;
};

// Componente do Modal de Análise Completa
const ModalAnaliseCompleta = memo(({ 
  analise, 
  isOpen, 
  onClose 
}: { 
  analise: AnaliseTrimestreData | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen || !analise) return null;

  const getBadgeRecomendacao = (recomendacao: string) => {
    const cores = {
      'COMPRA': { bg: '#dcfce7', color: '#166534', emoji: '🟢' },
      'VENDA': { bg: '#fef2f2', color: '#dc2626', emoji: '🔴' },
      'MANTER': { bg: '#fef3c7', color: '#92400e', emoji: '🟡' }
    };
    
    const config = cores[recomendacao as keyof typeof cores] || cores.MANTER;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {config.emoji} {recomendacao}
      </span>
    );
  };

  const getBadgeRisco = (risco: string) => {
    const cores = {
      'BAIXO': { bg: '#dcfce7', color: '#166534' },
      'MÉDIO': { bg: '#fef3c7', color: '#92400e' },
      'ALTO': { bg: '#fef2f2', color: '#dc2626' }
    };
    
    const config = cores[risco as keyof typeof cores] || cores.MÉDIO;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        {risco}
      </span>
    );
  };

  return (
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
        borderRadius: '16px',
        width: '90%',
        height: '90%',
        maxWidth: '1200px',
        maxHeight: '800px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header do Modal */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {analise.ticker}
                </h2>
                <span style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {analise.trimestre}
                </span>
                <span style={{
                  backgroundColor: '#e2e8f0',
                  color: '#64748b',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {analise.categoria.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
                {analise.titulo}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                <span>📅 {new Date(analise.dataPublicacao).toLocaleDateString('pt-BR')}</span>
                <span>✍️ {analise.autor}</span>
              </div>
            </div>
            
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '8px',
                borderRadius: '8px'
              }}
            >
              ✕
            </button>
          </div>
          
          {/* Recomendação e Risco */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {getBadgeRecomendacao(analise.recomendacao)}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#64748b' }}>Risco:</span>
              {getBadgeRisco(analise.risco)}
            </div>
            {analise.precoAlvo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#64748b' }}>Preço Alvo:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  R$ {analise.precoAlvo.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {/* Resumo Executivo */}
          {analise.resumoExecutivo && (
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} />
                Resumo Executivo
              </h4>
              <div 
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.6'
                }}
                dangerouslySetInnerHTML={{ __html: analise.resumoExecutivo }}
              />
            </div>
          )}

          {/* Métricas do Trimestre */}
          {Object.keys(analise.metricas).length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Métricas do Trimestre
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {analise.metricas.receita && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#15803d', fontWeight: '600' }}>💰 Receita</h5>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#166534' }}>
                      {formatarValorMetrica(analise.metricas.receita)}
                    </div>
                    {analise.metricas.receita.variacao && (
                      <div style={{ fontSize: '12px', color: '#15803d', marginTop: '4px' }}>
                        {analise.metricas.receita.variacao >= 0 ? '↗' : '↘'} {analise.metricas.receita.variacao.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {analise.metricas.ebitda && (
                  <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #7dd3fc' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0c4a6e', fontWeight: '600' }}>📊 EBITDA</h5>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0369a1' }}>
                      {formatarValorMetrica(analise.metricas.ebitda)}
                    </div>
                    {analise.metricas.ebitda.margem && (
                      <div style={{ fontSize: '12px', color: '#0c4a6e', marginTop: '4px' }}>
                        Margem: {analise.metricas.ebitda.margem.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {analise.metricas.lucroLiquido && (
                  <div style={{ backgroundColor: '#fdf4ff', padding: '16px', borderRadius: '8px', border: '1px solid #d8b4fe' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#7c2d12', fontWeight: '600' }}>💎 Lucro Líquido</h5>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400e' }}>
                      {formatarValorMetrica(analise.metricas.lucroLiquido)}
                    </div>
                    {analise.metricas.lucroLiquido.variacao && (
                      <div style={{ fontSize: '12px', color: '#7c2d12', marginTop: '4px' }}>
                        {analise.metricas.lucroLiquido.variacao >= 0 ? '↗' : '↘'} {analise.metricas.lucroLiquido.variacao.toFixed(1)}%
                      </div>
                    )}
                  </div>
                )}

                {analise.metricas.roe && (
                  <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>🎯 ROE</h5>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                      {analise.metricas.roe.valor.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise Completa */}
          {analise.analiseCompleta && (
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} />
                Análise Completa
              </h4>
              <div 
                style={{
                  lineHeight: '1.7',
                  color: '#374151'
                }}
                dangerouslySetInnerHTML={{ __html: analise.analiseCompleta }}
              />
            </div>
          )}

          {/* Pontos Favoráveis vs Atenção */}
          {(analise.pontosFavoraveis || analise.pontosAtencao) && (
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                📝 Análise Qualitativa
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {analise.pontosFavoraveis && (
                  <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#15803d' }}>
                      ✅ Pontos Favoráveis
                    </h5>
                    <div 
                      style={{ lineHeight: '1.6', color: '#166534' }}
                      dangerouslySetInnerHTML={{ __html: analise.pontosFavoraveis }}
                    />
                  </div>
                )}

                {analise.pontosAtencao && (
                  <div style={{ backgroundColor: '#fef3c7', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#92400e' }}>
                      ⚠️ Pontos de Atenção
                    </h5>
                    <div 
                      style={{ lineHeight: '1.6', color: '#92400e' }}
                      dangerouslySetInnerHTML={{ __html: analise.pontosAtencao }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Links Externos */}
          {(analise.linkResultado || analise.linkConferencia) && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>
                🔗 Materiais Oficiais
              </h4>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {analise.linkResultado && (
                  <a
                    href={analise.linkResultado}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <FileText size={16} />
                    Release de Resultados
                    <ExternalLink size={14} />
                  </a>
                )}

                {analise.linkConferencia && (
                  <a
                    href={analise.linkConferencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <Building size={16} />
                    Conference Call
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Componente Principal
const AnalisesTrimesestrais = memo(({ ticker }: { ticker: string }) => {
  const [analises, setAnalises] = useState<AnaliseTrimestreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analiseModalAberta, setAnaliseModalAberta] = useState<AnaliseTrimestreData | null>(null);

  // Carregar análises do IndexedDB
  useEffect(() => {
    const loadAnalises = async () => {
      if (!ticker) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`🔍 Buscando análises para ${ticker}...`);
        
        const request = indexedDB.open('AnalisesTrimesestraisDB', 1);
        
        request.onerror = () => {
          console.error('❌ Erro ao abrir IndexedDB');
          setError('Erro ao conectar com o banco de dados');
          setLoading(false);
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('analises')) {
            console.log('ℹ️ Object store "analises" não encontrado');
            setAnalises([]);
            setLoading(false);
            return;
          }
          
          const transaction = db.transaction(['analises'], 'readonly');
          const store = transaction.objectStore('analises');
const index = store.index('ticker');

          
getRequest.onsuccess = () => {
  const todasAnalises = getRequest.result || [];
  console.log(`✅ Total de análises carregadas: ${todasAnalises.length}`);
  
  // Filtrar manualmente por ticker
  const analisesEncontradas = todasAnalises.filter((analise: AnaliseTrimestreData) => 
    analise.ticker && analise.ticker.toUpperCase() === ticker.toUpperCase()
  );
  
  console.log(`✅ ${analisesEncontradas.length} análises encontradas para ${ticker}`);
  
  // Filtrar apenas análises publicadas e ordenar por data
  const analisesPublicadas = analisesEncontradas
    .filter((analise: AnaliseTrimestreData) => analise.status === 'published')
    .sort((a: AnaliseTrimestreData, b: AnaliseTrimestreData) => 
      new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
    );
  
  setAnalises(analisesPublicadas);
  setLoading(false);
};
    
    loadAnalises();
  }, [ticker]);

  const abrirModal = useCallback((analise: AnaliseTrimestreData) => {
    setAnaliseModalAberta(analise);
  }, []);

  const fecharModal = useCallback(() => {
    setAnaliseModalAberta(null);
  }, []);

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
          margin: '0 0 20px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 Análises Trimestrais
        </h3>
        
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>⏳</div>
          <p>Carregando análises de {ticker}...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          📊 Análises Trimestrais
        </h3>
        
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: '#dc2626', marginBottom: '16px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3b82f6',
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
      </div>
    );
  }

  if (analises.length === 0) {
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
          📊 Análises Trimestrais
        </h3>
        
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h4 style={{ marginBottom: '8px', color: '#1e293b' }}>
            Nenhuma análise encontrada
          </h4>
          <p style={{ marginBottom: '16px' }}>
            Ainda não há análises trimestrais para <strong>{ticker}</strong>
          </p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            💡 As análises aparecerão aqui após serem publicadas
          </p>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 Análises Trimestrais
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {analises.length}
            </span>
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {analises.slice(0, 4).map((analise, index) => {
            const isRecente = index === 0;
            
            return (
              <div key={analise.id || index} style={{
                border: `2px solid ${isRecente ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: isRecente ? '#f8fafc' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => abrirModal(analise)}>
                
                {isRecente && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    🆕 MAIS RECENTE
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: 0
                      }}>
                        {analise.titulo}
                      </h4>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {analise.trimestre}
                      </span>
                      
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        📅 {new Date(analise.dataPublicacao).toLocaleDateString('pt-BR')}
                      </span>
                      
                      <span style={{ fontSize: '14px', color: '#64748b' }}>
                        ✍️ {analise.autor}
                      </span>
                    </div>

                    {/* Resumo Executivo (sem HTML) */}
                    {analise.resumoExecutivo && (
                      <p style={{
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '8px 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {analise.resumoExecutivo.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    minWidth: '120px',
                    marginLeft: '20px'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: (() => {
                        switch (analise.recomendacao) {
                          case 'COMPRA': return '#dcfce7';
                          case 'VENDA': return '#fef2f2';
                          default: return '#fef3c7';
                        }
                      })(),
                      color: (() => {
                        switch (analise.recomendacao) {
                          case 'COMPRA': return '#166534';
                          case 'VENDA': return '#dc2626';
                          default: return '#92400e';
                        }
                      })(),
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '8px'
                    }}>
                      {analise.recomendacao === 'COMPRA' ? '🟢' : analise.recomendacao === 'VENDA' ? '🔴' : '🟡'} {analise.recomendacao}
                    </div>
                    
                    {analise.precoAlvo && (
                      <div style={{ fontSize: '14px', color: '#64748b' }}>
                        Alvo: R$ {analise.precoAlvo.toFixed(2)}
                      </div>
                    )}
                    
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                      Risco: {analise.risco}
                    </div>
                  </div>
                </div>

                {/* Métricas Resumidas */}
                {Object.keys(analise.metricas).length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}>
                    {analise.metricas.receita && (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>Receita: </span>
                        <span style={{ fontWeight: '600', color: '#059669' }}>
                          {formatarValorMetrica(analise.metricas.receita)}
                        </span>
                        {analise.metricas.receita.variacao && (
                          <span style={{ color: analise.metricas.receita.variacao >= 0 ? '#059669' : '#dc2626', marginLeft: '4px' }}>
                            ({analise.metricas.receita.variacao >= 0 ? '+' : ''}{analise.metricas.receita.variacao.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}
                    
                    {analise.metricas.ebitda && (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>EBITDA: </span>
                        <span style={{ fontWeight: '600', color: '#0ea5e9' }}>
                          {formatarValorMetrica(analise.metricas.ebitda)}
                        </span>
                        {analise.metricas.ebitda.margem && (
                          <span style={{ color: '#0ea5e9', marginLeft: '4px' }}>
                            ({analise.metricas.ebitda.margem.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    )}

                    {analise.metricas.roe && (
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: '#64748b' }}>ROE: </span>
                        <span style={{ fontWeight: '600', color: '#dc2626' }}>
                          {analise.metricas.roe.valor.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Botão Ver Análise */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <button style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Eye size={16} />
                    Ver Análise Completa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {analises.length > 4 && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>
              Mostrando as 4 análises mais recentes • Total: {analises.length}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Análise Completa */}
      <ModalAnaliseCompleta 
        analise={analiseModalAberta}
        isOpen={!!analiseModalAberta}
        onClose={fecharModal}
      />
    </>
  );
});

export default AnalisesTrimesestrais;