'use client';

import React, { useState } from 'react';

export default function PortfolioAnalysisForm() {
  const [formData, setFormData] = useState({

    name: '',
    email: '',
    phone: '',
    investmentTime: '',
    investmentReason: '',
    portfolioObjective: '',
    riskTolerance: 25,
    crashExperience: '',
    emergencyReserve: '',
    emergencyReserveLocation: '',
    opportunityReserve: '',
    monthlyIncome: '',
    monthlyContribution: '',
    knowledgeLevel: '',
    stocks: 0,
    fiis: 0,
    international: 0,
    fixedIncome: 0,
    others: 0,
    othersDescription: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.investmentTime) newErrors.investmentTime = 'Campo obrigatório';
    if (!formData.investmentReason.trim()) newErrors.investmentReason = 'Campo obrigatório';
    if (!formData.portfolioObjective) newErrors.portfolioObjective = 'Campo obrigatório';
    if (!formData.crashExperience.trim()) newErrors.crashExperience = 'Campo obrigatório';
    if (!formData.emergencyReserve) newErrors.emergencyReserve = 'Campo obrigatório';
    if (!formData.knowledgeLevel) newErrors.knowledgeLevel = 'Campo obrigatório';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    const totalAllocation = formData.stocks + formData.fiis + formData.international + formData.fixedIncome + formData.others;
    if (totalAllocation > 0 && Math.abs(totalAllocation - 100) > 0.1) {
      newErrors.allocation = 'A soma das alocações deve ser igual a 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setErrors({ submit: 'Erro ao enviar formulário' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllocationTotal = () => {
    return formData.stocks + formData.fiis + formData.international + formData.fixedIncome + formData.others;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Formulário Enviado com Sucesso!</h2>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de análise de carteira. Nossa equipe irá avaliar suas informações e retornar com a análise personalizada.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">Prazo de resposta: 15 a 30 dias úteis</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Recursos Exclusivos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Recursos Exclusivos
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Análise de Carteira</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Receba uma análise detalhada e personalizada da sua carteira de investimentos
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-lg">
          <div className="flex">
            <svg className="w-6 h-6 text-amber-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-amber-900 font-semibold mb-1">Tempo de Resposta</h3>
              <p className="text-amber-800">15 a 30 dias úteis. Analisamos cada carteira individualmente.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Dados Pessoais */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome completo *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite seu nome completo"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (opcional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Perfil do Investidor */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Perfil do Investidor</h2>
              <div className="space-y-6">
                
                {/* Pergunta 1 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    1. Há quanto tempo investe na bolsa? *
                  </label>
                  <select
                    value={formData.investmentTime}
                    onChange={handleInputChange('investmentTime')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.investmentTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="menos-6-meses">Menos de 6 meses</option>
                    <option value="6-meses-1-ano">6 meses a 1 ano</option>
                    <option value="1-3-anos">1 a 3 anos</option>
                    <option value="3-5-anos">3 a 5 anos</option>
                    <option value="5-10-anos">5 a 10 anos</option>
                    <option value="mais-10-anos">Mais de 10 anos</option>
                  </select>
                  {errors.investmentTime && <p className="text-red-500 text-sm mt-1">{errors.investmentTime}</p>}
                </div>

                {/* Pergunta 2 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    2. Qual motivo o(a) levou até o mercado de ativos? *
                  </label>
                  <textarea
                    value={formData.investmentReason}
                    onChange={handleInputChange('investmentReason')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.investmentReason ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Descreva sua motivação para investir..."
                  />
                  {errors.investmentReason && <p className="text-red-500 text-sm mt-1">{errors.investmentReason}</p>}
                </div>

                {/* Pergunta 3 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    3. Qual seu objetivo com sua carteira? *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'dividendos', label: 'Foco em dividendos (renda passiva)' },
                      { value: 'crescimento', label: 'Foco em crescimento (valorização)' },
                      { value: 'balanceado', label: 'Balanceado (dividendos + crescimento)' },
                      { value: 'preservacao', label: 'Preservação de capital' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="portfolioObjective"
                          value={option.value}
                          checked={formData.portfolioObjective === option.value}
                          onChange={handleInputChange('portfolioObjective')}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.portfolioObjective && <p className="text-red-500 text-sm mt-1">{errors.portfolioObjective}</p>}
                </div>

                {/* Pergunta 4 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    4. Quanto você suportaria ver sua carteira oscilar para baixo? *
                  </label>
                  <div className="px-4 py-6 bg-gray-50 rounded-lg">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={formData.riskTolerance}
                      onChange={(e) => setFormData(prev => ({ ...prev, riskTolerance: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>0%</span>
                      <span className="font-semibold text-blue-600">{formData.riskTolerance}%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>

                {/* Pergunta 5 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    5. Já passou por uma queda muito forte? Qual foi o seu comportamento? *
                  </label>
                  <textarea
                    value={formData.crashExperience}
                    onChange={handleInputChange('crashExperience')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                      errors.crashExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Vendi tudo, Mantive posição, Aproveitei para comprar mais..."
                  />
                  {errors.crashExperience && <p className="text-red-500 text-sm mt-1">{errors.crashExperience}</p>}
                </div>

                {/* Pergunta 6 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    6. Você já possui reserva de emergência? *
                  </label>
                  <div className="space-y-3 mb-4">
                    {[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' },
                      { value: 'parcial', label: 'Parcialmente' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="emergencyReserve"
                          value={option.value}
                          checked={formData.emergencyReserve === option.value}
                          onChange={handleInputChange('emergencyReserve')}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.emergencyReserve && <p className="text-red-500 text-sm mt-1">{errors.emergencyReserve}</p>}

                  {formData.emergencyReserve === 'sim' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onde está alocada sua reserva de emergência?
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyReserveLocation}
                        onChange={handleInputChange('emergencyReserveLocation')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Poupança, CDB, Tesouro Selic, etc."
                      />
                    </div>
                  )}
                </div>

                {/* Pergunta 7 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    7. Já possui uma reserva de oportunidade?
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'sim', label: 'Sim' },
                      { value: 'nao', label: 'Não' },
                      { value: 'parcial', label: 'Parcialmente' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="opportunityReserve"
                          value={option.value}
                          checked={formData.opportunityReserve === option.value}
                          onChange={handleInputChange('opportunityReserve')}
                          className="mr-3 h-4 w-4 text-blue-600"
                        />
                        <span className="text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pergunta 8 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    8. Qual sua renda mensal? (opcional)
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formData.monthlyIncome}
                      onChange={handleInputChange('monthlyIncome')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5.000,00"
                    />
                  </div>
                </div>

                {/* Pergunta 9 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    9. Quanto sobra para aportar todos os meses? (opcional)
                  </label>
                  <div className="relative max-w-sm">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formData.monthlyContribution}
                      onChange={handleInputChange('monthlyContribution')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1.000,00"
                    />
                  </div>
                </div>

                {/* Pergunta 10 */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    10. Como você avalia seu conhecimento sobre a bolsa? *
                  </label>
                  <select
                    value={formData.knowledgeLevel}
                    onChange={handleInputChange('knowledgeLevel')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.knowledgeLevel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="nao-sei-nada">Não sei nada</option>
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                  {errors.knowledgeLevel && <p className="text-red-500 text-sm mt-1">{errors.knowledgeLevel}</p>}
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Alocação da Carteira */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Alocação da Carteira</h2>
              <p className="text-gray-600 mb-6">
                Informe o percentual que você possui em cada classe de ativo. A soma deve totalizar 100%.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { key: 'stocks', label: 'Ações (%)' },
                  { key: 'fiis', label: 'FIIs (%)' },
                  { key: 'international', label: 'Exterior (%)' },
                  { key: 'fixedIncome', label: 'Renda Fixa (%)' },
                  { key: 'others', label: 'Outros (%)' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{item.label}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData[item.key]}
                        onChange={handleNumberChange(item.key)}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full pr-8 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.0"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.others > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especifique "Outros"
                  </label>
                  <input
                    type="text"
                    value={formData.othersDescription}
                    onChange={handleInputChange('othersDescription')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Criptomoedas, Commodities, etc."
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total alocado:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  Math.abs(getAllocationTotal() - 100) < 0.1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {getAllocationTotal().toFixed(1)}%
                </span>
              </div>
              
              {errors.allocation && (
                <p className="text-red-500 text-sm mt-2">{errors.allocation}</p>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Observações Adicionais */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Observações Adicionais</h2>
              <textarea
                value={formData.additionalNotes}
                onChange={handleInputChange('additionalNotes')}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Qualquer informação adicional que considere relevante para a análise..."
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{errors.submit}</p>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Análise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
