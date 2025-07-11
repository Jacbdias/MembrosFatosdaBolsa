import React, { useState } from 'react';

const EnhancedAdminFeedback = ({ carteira, onSave, onCancel }) => {
  const [activeSection, setActiveSection] = useState('general');
  const [feedbackData, setFeedbackData] = useState({
    pontuacaoGeral: carteira?.pontuacao || 8.0,
    avaliacoes: {
      qualidade: carteira?.avaliacaoQualidade || 85,
      diversificacao: carteira?.avaliacaoDiversificacao || 80,
      adaptacao: carteira?.avaliacaoAdaptacao || 85
    },
    feedbackGeral: carteira?.feedback || '',
    recomendacoes: carteira?.recomendacoes || [],
    ativosAnalise: carteira?.ativosAnalise || [],
    setoresAnalise: carteira?.setoresAnalise || [],
    alertas: carteira?.alertas || [],
    proximosPassos: carteira?.proximosPassos || []
  });

  const [novaRecomendacao, setNovaRecomendacao] = useState({
    categoria: '',
    prioridade: 'média',
    titulo: '',
    descricao: '',
    impacto: ''
  });

  const [novoAtivo, setNovoAtivo] = useState({
    codigo: '',
    tipo: 'acao',
    status: 'bom',
    nota: 7.0,
    comentario: '',
    recomendacao: 'manter'
  });

  const categorias = ['Diversificação', 'Qualidade', 'Risco', 'Setores', 'Alocação', 'Compliance'];
  const prioridades = ['baixa', 'média', 'alta'];
  const statusAtivos = ['excelente', 'bom', 'regular', 'ruim', 'alerta'];

  const handleSave = () => {
    const dadosCompletos = {
      ...carteira,
      pontuacao: feedbackData.pontuacaoGeral,
      avaliacaoQualidade: feedbackData.avaliacoes.qualidade,
      avaliacaoDiversificacao: feedbackData.avaliacoes.diversificacao,
      avaliacaoAdaptacao: feedbackData.avaliacoes.adaptacao,
      feedback: feedbackData.feedbackGeral,
      recomendacoes: feedbackData.recomendacoes.map(r => r.titulo || r),
      status: 'ANALISADA',
      dataAnalise: new Date().toISOString(),
      dadosEstruturados: {
        avaliacoes: feedbackData.avaliacoes,
        recomendacoesDetalhadas: feedbackData.recomendacoes,
        ativosAnalise: feedbackData.ativosAnalise,
        setoresAnalise: feedbackData.setoresAnalise,
        alertas: feedbackData.alertas,
        proximosPassos: feedbackData.proximosPassos
      }
    };
    
    onSave(dadosCompletos);
  };

  const addRecomendacao = () => {
    if (novaRecomendacao.titulo && novaRecomendacao.descricao) {
      setFeedbackData(prev => ({
        ...prev,
        recomendacoes: [...prev.recomendacoes, { ...novaRecomendacao, id: Date.now() }]
      }));
      setNovaRecomendacao({
        categoria: '',
        prioridade: 'média',
        titulo: '',
        descricao: '',
        impacto: ''
      });
    }
  };

  const removeRecomendacao = (index) => {
    setFeedbackData(prev => ({
      ...prev,
      recomendacoes: prev.recomendacoes.filter((_, i) => i !== index)
    }));
  };

  const addAtivo = () => {
    if (novoAtivo.codigo && novoAtivo.comentario) {
      setFeedbackData(prev => ({
        ...prev,
        ativosAnalise: [...prev.ativosAnalise, { ...novoAtivo, id: Date.now() }]
      }));
      setNovoAtivo({
        codigo: '',
        tipo: 'acao',
        status: 'bom',
        nota: 7.0,
        comentario: '',
        recomendacao: 'manter'
      });
    }
  };

  const ScoreSlider = ({ label, value, onChange, max = 100 }) => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{label}</label>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
          outline: 'none',
          appearance: 'none'
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );

  const SectionButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        textAlign: 'left',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: active ? '#eff6ff' : 'transparent',
        color: active ? '#1d4ed8' : '#6b7280',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: '16px' }}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '2px solid #e5e7eb',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      maxWidth: '1200px',
      margin: '20px auto'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #374151 0%, #111827 100%)',
        color: 'white',
        padding: '24px 32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 8px 0' }}>
              📊 Análise Avançada de Carteira
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Cliente: <strong>{carteira?.cliente?.name || 'N/A'}</strong> • 
              Arquivo: <strong>{carteira?.nomeArquivo}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onCancel}
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'transparent',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ❌ Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                border: 'none',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              💾 Salvar Análise
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div style={{
          width: '250px',
          backgroundColor: '#f8fafc',
          borderRight: '1px solid #e5e7eb',
          padding: '24px 16px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', margin: '0 0 12px 0' }}>
              Seções da Análise
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <SectionButton
              id="general"
              label="Avaliação Geral"
              icon="📈"
              active={activeSection === 'general'}
              onClick={setActiveSection}
            />
            <SectionButton
              id="recommendations"
              label="Recomendações"
              icon="💡"
              active={activeSection === 'recommendations'}
              onClick={setActiveSection}
            />
            <SectionButton
              id="assets"
              label="Análise de Ativos"
              icon="🏢"
              active={activeSection === 'assets'}
              onClick={setActiveSection}
            />
            <SectionButton
              id="feedback"
              label="Feedback Textual"
              icon="✏️"
              active={activeSection === 'feedback'}
              onClick={setActiveSection}
            />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '32px' }}>
          {/* Avaliação Geral */}
          {activeSection === 'general' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                📊 Avaliação Geral da Carteira
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '32px',
                marginBottom: '32px'
              }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
                    Pontuação Geral (0-10)
                  </h4>
                  <ScoreSlider
                    label="Nota da Carteira"
                    value={feedbackData.pontuacaoGeral * 10}
                    max={100}
                    onChange={(val) => setFeedbackData(prev => ({
                      ...prev,
                      pontuacaoGeral: val / 10
                    }))}
                  />
                  <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    marginTop: '16px'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#1d4ed8' }}>
                      {feedbackData.pontuacaoGeral.toFixed(1)}/10
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Pontuação Final</div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
                    Métricas Detalhadas
                  </h4>
                  <ScoreSlider
                    label="🏆 Qualidade dos Ativos"
                    value={feedbackData.avaliacoes.qualidade}
                    onChange={(val) => setFeedbackData(prev => ({
                      ...prev,
                      avaliacoes: { ...prev.avaliacoes, qualidade: val }
                    }))}
                  />
                  <ScoreSlider
                    label="🎯 Diversificação"
                    value={feedbackData.avaliacoes.diversificacao}
                    onChange={(val) => setFeedbackData(prev => ({
                      ...prev,
                      avaliacoes: { ...prev.avaliacoes, diversificacao: val }
                    }))}
                  />
                  <ScoreSlider
                    label="⚖️ Adaptação ao Perfil"
                    value={feedbackData.avaliacoes.adaptacao}
                    onChange={(val) => setFeedbackData(prev => ({
                      ...prev,
                      avaliacoes: { ...prev.avaliacoes, adaptacao: val }
                    }))}
                  />
                </div>
              </div>

              {/* Preview das métricas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginTop: '24px'
              }}>
                {[
                  { label: 'Qualidade', value: feedbackData.avaliacoes.qualidade, color: '#10b981' },
                  { label: 'Diversificação', value: feedbackData.avaliacoes.diversificacao, color: '#3b82f6' },
                  { label: 'Adaptação', value: feedbackData.avaliacoes.adaptacao, color: '#8b5cf6' }
                ].map((metric, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: metric.color }}>
                      {metric.value}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recomendações */}
          {activeSection === 'recommendations' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                💡 Recomendações Personalizadas
              </h3>
              
              {/* Form para nova recomendação */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fbbf24',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#92400e' }}>
                  ➕ Adicionar Nova Recomendação
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                      Categoria
                    </label>
                    <select
                      value={novaRecomendacao.categoria}
                      onChange={(e) => setNovaRecomendacao(prev => ({...prev, categoria: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione...</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                      Prioridade
                    </label>
                    <select
                      value={novaRecomendacao.prioridade}
                      onChange={(e) => setNovaRecomendacao(prev => ({...prev, prioridade: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {prioridades.map(pri => (
                        <option key={pri} value={pri}>{pri.charAt(0).toUpperCase() + pri.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Título da Recomendação
                  </label>
                  <input
                    type="text"
                    value={novaRecomendacao.titulo}
                    onChange={(e) => setNovaRecomendacao(prev => ({...prev, titulo: e.target.value}))}
                    placeholder="Ex: Aumentar exposição internacional"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Descrição
                  </label>
                  <textarea
                    value={novaRecomendacao.descricao}
                    onChange={(e) => setNovaRecomendacao(prev => ({...prev, descricao: e.target.value}))}
                    placeholder="Descreva a recomendação em detalhes..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Impacto Esperado
                  </label>
                  <input
                    type="text"
                    value={novaRecomendacao.impacto}
                    onChange={(e) => setNovaRecomendacao(prev => ({...prev, impacto: e.target.value}))}
                    placeholder="Ex: Redução de risco país e proteção cambial"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <button
                  onClick={addRecomendacao}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Adicionar Recomendação
                </button>
              </div>

              {/* Lista de recomendações */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {feedbackData.recomendacoes.map((rec, index) => (
                  <div key={index} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: 
                            rec.prioridade === 'alta' ? '#fee2e2' :
                            rec.prioridade === 'média' ? '#fef3c7' : '#dbeafe',
                          color:
                            rec.prioridade === 'alta' ? '#dc2626' :
                            rec.prioridade === 'média' ? '#d97706' : '#2563eb'
                        }}>
                          {rec.prioridade?.charAt(0).toUpperCase() + rec.prioridade?.slice(1)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{rec.categoria}</span>
                      </div>
                      <button
                        onClick={() => removeRecomendacao(index)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
                      {rec.titulo}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.5' }}>
                      {rec.descricao}
                    </p>
                    {rec.impacto && (
                      <p style={{ fontSize: '14px', color: '#059669', margin: 0 }}>
                        <strong>💥 Impacto:</strong> {rec.impacto}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Análise de Ativos */}
          {activeSection === 'assets' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                🏢 Análise Individual de Ativos
              </h3>
              
              {/* Form para novo ativo */}
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#065f46' }}>
                  ➕ Analisar Novo Ativo
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                      Código do Ativo
                    </label>
                    <input
                      type="text"
                      value={novoAtivo.codigo}
                      onChange={(e) => setNovoAtivo(prev => ({...prev, codigo: e.target.value.toUpperCase()}))}
                      placeholder="Ex: ITUB4"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={novoAtivo.status}
                      onChange={(e) => setNovoAtivo(prev => ({...prev, status: e.target.value}))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      {statusAtivos.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                      Nota (0-10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={novoAtivo.nota}
                      onChange={(e) => setNovoAtivo(prev => ({...prev, nota: parseFloat(e.target.value)}))}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                    Comentário sobre o Ativo
                  </label>
                  <textarea
                    value={novoAtivo.comentario}
                    onChange={(e) => setNovoAtivo(prev => ({...prev, comentario: e.target.value}))}
                    placeholder="Análise detalhada do ativo..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <button
                  onClick={addAtivo}
                  style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Adicionar Análise
                </button>
              </div>

              {/* Lista de ativos analisados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {feedbackData.ativosAnalise.map((ativo, index) => (
                  <div key={index} style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#1f2937' }}>
                          {ativo.codigo}
                        </h4>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: 
                            ativo.status === 'excelente' ? '#d1fae5' :
                            ativo.status === 'bom' ? '#dbeafe' :
                            ativo.status === 'regular' ? '#fef3c7' :
                            ativo.status === 'alerta' ? '#fed7aa' : '#fee2e2',
                          color:
                            ativo.status === 'excelente' ? '#065f46' :
                            ativo.status === 'bom' ? '#1e40af' :
                            ativo.status === 'regular' ? '#d97706' :
                            ativo.status === 'alerta' ? '#ea580c' : '#dc2626'
                        }}>
                          {ativo.status.charAt(0).toUpperCase() + ativo.status.slice(1)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{
                              color: i < Math.floor(ativo.nota / 2) ? '#fbbf24' : '#e5e7eb',
                              fontSize: '14px'
                            }}>
                              ⭐
                            </span>
                          ))}
                          <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '600' }}>
                            {ativo.nota}/10
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setFeedbackData(prev => ({
                          ...prev,
                          ativosAnalise: prev.ativosAnalise.filter((_, i) => i !== index)
                        }))}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Remover
                      </button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
                      {ativo.comentario}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Textual */}
          {activeSection === 'feedback' && (
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
                ✏️ Feedback Textual da Carteira
              </h3>
              
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: '#374151'
                }}>
                  Análise Completa da Carteira
                </label>
                <textarea
                  value={feedbackData.feedbackGeral}
                  onChange={(e) => setFeedbackData(prev => ({...prev, feedbackGeral: e.target.value}))}
                  placeholder="Escreva uma análise geral da carteira, pontos fortes, pontos de atenção, e orientações gerais para o cliente..."
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <span>💡 Dica: Seja específico e construtivo no feedback</span>
                  <span>{feedbackData.feedbackGeral.length} caracteres</span>
                </div>
              </div>

              {/* Preview do feedback */}
              {feedbackData.feedbackGeral && (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  marginTop: '24px'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                    👁️ Preview do Feedback
                  </h4>
                  <div style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#374151',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {feedbackData.feedbackGeral}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminFeedback;