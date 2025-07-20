import React from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Globe, Building, Zap, AlertCircle, CheckCircle } from 'lucide-react';

// Função server-side para buscar o relatório
async function getRelatorio() {
  try {
    console.log('📖 [DEBUG] Buscando relatório publicado...');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/relatorio-semanal`, {
      next: { revalidate: 300 } // Revalidar a cada 5 minutos
    });
    
    console.log('📖 [DEBUG] Response status:', response.status);
    
    if (!response.ok) {
      console.log('📖 [DEBUG] Response não ok');
      return null;
    }
    
    const data = await response.json();
    console.log('📖 [DEBUG] Dados recebidos:', data);
    
    return data;
  } catch (error) {
    console.error('📖 [DEBUG] Erro ao carregar relatório:', error);
    return null;
  }
}

// Componente para exibir item macro
const MacroItem = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '16px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
      <Globe size={20} style={{ color: '#2563eb', marginRight: '8px' }} />
      <span style={{
        fontSize: '12px',
        fontWeight: '500',
        color: item.impact === 'high' ? '#dc2626' : item.impact === 'medium' ? '#d97706' : '#059669',
        backgroundColor: item.impact === 'high' ? '#fef2f2' : item.impact === 'medium' ? '#fff7ed' : '#f0fdf4',
        padding: '2px 8px',
        borderRadius: '12px',
        textTransform: 'uppercase'
      }}>
        Impacto {item.impact === 'high' ? 'Alto' : item.impact === 'medium' ? 'Médio' : 'Baixo'}
      </span>
    </div>
    
    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
      {item.title}
    </h3>
    
    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', marginBottom: '12px' }}>
      {item.summary}
    </p>
    
    {item.sectors && item.sectors.length > 0 && (
      <div style={{ marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Setores: </span>
        {item.sectors.map((setor: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#2563eb',
            backgroundColor: '#eff6ff',
            padding: '2px 6px',
            borderRadius: '4px',
            marginRight: '4px'
          }}>
            {setor}
          </span>
        ))}
      </div>
    )}
    
    {item.recommendations && item.recommendations.length > 0 && (
      <div>
        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Recomendações: </span>
        {item.recommendations.map((rec: string, index: number) => (
          <span key={index} style={{
            fontSize: '12px',
            color: '#059669',
            backgroundColor: '#f0fdf4',
            padding: '2px 6px',
            borderRadius: '4px',
            marginRight: '4px',
            fontWeight: '500'
          }}>
            {rec}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Componente para exibir provento
const ProventoItem = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '12px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DollarSign size={16} style={{ color: '#059669', marginRight: '6px' }} />
        <span style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>
          {item.ticker}
        </span>
        <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
          {item.company}
        </span>
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: '500',
        color: item.type === 'JCP' ? '#7c3aed' : '#2563eb',
        backgroundColor: item.type === 'JCP' ? '#f3e8ff' : '#eff6ff',
        padding: '2px 8px',
        borderRadius: '12px'
      }}>
        {item.type}
      </span>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
      <div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Valor</span>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.value}</div>
      </div>
      <div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>DY</span>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669' }}>{item.dy}</div>
      </div>
      <div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Data-com</span>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
          {item.exDate ? new Date(item.exDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
      <div>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Pagamento</span>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
          {item.payDate ? new Date(item.payDate).toLocaleDateString('pt-BR') : '-'}
        </div>
      </div>
    </div>
  </div>
);

// Componente para exibir ação
const StockItem = ({ item }: { item: any }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    marginBottom: '12px'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TrendingUp size={16} style={{ color: '#2563eb', marginRight: '6px' }} />
        <span style={{ fontWeight: '600', color: '#111827', fontSize: '16px' }}>
          {item.ticker}
        </span>
        <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
          {item.company}
        </span>
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: '500',
        color: item.impact === 'positive' ? '#059669' : item.impact === 'negative' ? '#dc2626' : '#6b7280',
        backgroundColor: item.impact === 'positive' ? '#f0fdf4' : item.impact === 'negative' ? '#fef2f2' : '#f9fafb',
        padding: '2px 8px',
        borderRadius: '12px'
      }}>
        {item.impact === 'positive' ? 'Positivo' : item.impact === 'negative' ? 'Negativo' : 'Neutro'}
      </span>
    </div>
    
    <div style={{ fontSize: '14px', color: '#111827', marginBottom: '8px', fontWeight: '500' }}>
      {item.news}
    </div>
    
    {item.highlight && (
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontStyle: 'italic' }}>
        💡 {item.highlight}
      </div>
    )}
    
    {item.recommendation && (
      <div style={{ 
        fontSize: '14px', 
        color: '#374151', 
        backgroundColor: '#f9fafb', 
        padding: '8px', 
        borderRadius: '4px',
        borderLeft: '3px solid #2563eb'
      }}>
        <strong>Recomendação:</strong> {item.recommendation}
      </div>
    )}
  </div>
);

export default async function RelatorioSemanalPage() {
  const relatorio = await getRelatorio();
  
  console.log('📖 [DEBUG] Renderizando página com relatório:', relatorio);
  
  if (!relatorio) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <AlertCircle size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            Relatório Não Disponível
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            O relatório semanal ainda não foi publicado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                📊 Relatório Semanal
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>{relatorio.weekOf}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} style={{ color: '#059669' }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#059669' }}>
                Publicado em {new Date(relatorio.date).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Debug Info */}
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '24px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          📖 DEBUG: ID={relatorio.id}, Status={relatorio.status}, 
          Macro={relatorio.macro?.length || 0}, 
          Proventos={relatorio.proventos?.length || 0}, 
          Dividendos={relatorio.dividendos?.length || 0}
        </div>

        {/* Panorama Macro */}
        {relatorio.macro && relatorio.macro.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <Globe style={{ marginRight: '8px', color: '#2563eb' }} />
              Panorama Macro
            </h2>
            {relatorio.macro.map((item: any, index: number) => (
              <MacroItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Proventos */}
        {relatorio.proventos && relatorio.proventos.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <DollarSign style={{ marginRight: '8px', color: '#059669' }} />
              Proventos
            </h2>
            {relatorio.proventos.map((item: any, index: number) => (
              <ProventoItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Dividendos */}
        {relatorio.dividendos && relatorio.dividendos.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <Calendar style={{ marginRight: '8px', color: '#22c55e' }} />
              Dividendos
            </h2>
            {relatorio.dividendos.map((item: any, index: number) => (
              <StockItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Small Caps */}
        {relatorio.smallCaps && relatorio.smallCaps.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <Building style={{ marginRight: '8px', color: '#2563eb' }} />
              Small Caps
            </h2>
            {relatorio.smallCaps.map((item: any, index: number) => (
              <StockItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Micro Caps */}
        {relatorio.microCaps && relatorio.microCaps.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <Zap style={{ marginRight: '8px', color: '#ea580c' }} />
              Micro Caps
            </h2>
            {relatorio.microCaps.map((item: any, index: number) => (
              <StockItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Exterior */}
        {relatorio.exterior && relatorio.exterior.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
              <TrendingUp style={{ marginRight: '8px', color: '#7c3aed' }} />
              Exterior
            </h2>
            {relatorio.exterior.map((item: any, index: number) => (
              <StockItem key={index} item={item} />
            ))}
          </section>
        )}

        {/* Rodapé */}
        <div style={{ 
          textAlign: 'center', 
          padding: '24px', 
          borderTop: '1px solid #e5e7eb', 
          marginTop: '40px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          <p>© Fatos da Bolsa - Relatório Semanal</p>
          <p>Última atualização: {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Relatório Semanal - Fatos da Bolsa',
  description: 'Atualizações semanais do mercado de ações brasileiro e internacional',
};