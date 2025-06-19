'use client';
import React, { useState } from 'react';

export default function PortfolioAnalysisForm() {
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: '',
    email: '',
    phone: '',
    
    // Perguntas do questionário
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
    
    // Alocação por classe de ativo
    stocks: 0,
    fiis: 0,
    international: 0,
    fixedIncome: 0,
    others: 0,
    othersDescription: '',
    
    // Observações adicionais
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSliderChange = (field) => (event) => {
    const value = parseInt(event.target.value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field) => (event) => {
    const value = parseFloat(event.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validações obrigatórias
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.investmentTime) newErrors.investmentTime = 'Campo obrigatório';
    if (!formData.investmentReason.trim()) newErrors.investmentReason = 'Campo obrigatório';
    if (!formData.portfolioObjective) newErrors.portfolioObjective = 'Campo obrigatório';
    if (!formData.crashExperience.trim()) newErrors.crashExperience = 'Campo obrigatório';
    if (!formData.emergencyReserve) newErrors.emergencyReserve = 'Campo obrigatório';
    if (!formData.knowledgeLevel) newErrors.knowledgeLevel = 'Campo obrigatório';
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação da alocação (deve somar 100%)
    const totalAllocation = formData.stocks + formData.fiis + formData.international + formData.fixedIncome + formData.others;
    if (totalAllocation > 0 && Math.abs(totalAllocation - 100) > 0.1) {
      newErrors.allocation = 'A soma das alocações deve ser igual a 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Aqui você implementaria o envio dos dados
      // Por exemplo, para uma API ou serviço de armazenamento
      console.log('Dados do formulário:', formData);
      
      // Simular delay de envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      // Aqui você pode adicionar tratamento de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAllocationTotal = () => {
    return formData.stocks + formData.fiis + formData.international + formData.fixedIncome + formData.others;
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Formulário enviado com sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Recebemos sua solicitação de análise de carteira. Nossa equipe irá avaliar suas informações e retornar com a análise personalizada.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800">
              <strong>Prazo de resposta:</strong> 15 a 30 dias úteis
            </p>
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Voltar para Recursos Exclusivos
        </button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Análise de Carteira
        </h1>
        <p className="text-gray-600">
          Preencha o formulário abaixo para receber uma análise detalhada e personalizada da sua carteira de investimentos.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <p className="text-blue-800">
          <strong>Tempo de resposta:</strong> 15 a 30 dias úteis. Fazemos questão de analisar cada carteira individualmente para oferecer recomendações precisas.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="space-y-8">
          {/* Dados Pessoais */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Questionário de Perfil */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Perfil do Investidor
            </h2>
            <div className="space-y-6">
              {/* Pergunta 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Há quanto tempo investe na bolsa? *
                </label>
                <select
                  value={formData.investmentTime}
                  onChange={handleInputChange('investmentTime')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                {errors.investmentTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.investmentTime}</p>
                )}
              </div>

              {/* Pergunta 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Qual motivo o(a) levou até o mercado de ativos? *
                </label>
                <textarea
                  value={formData.investmentReason}
                  onChange={handleInputChange('investmentReason')}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.investmentReason ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descreva sua motivação para investir..."
                />
                {errors.investmentReason && (
                  <p className="text-red-500 text-sm mt-1">{errors.investmentReason}</p>
                )}
              </div>

              {/* Pergunta 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Qual seu objetivo com sua carteira? *
                </label>
                <div className="space-y-2">
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
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.portfolioObjective && (
                  <p className="text-red-500 text-sm mt-1">{errors.portfolioObjective}</p>
                )}
              </div>

              {/* Pergunta 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. Quanto você suportaria ver sua carteira oscilar para baixo? *
                </label>
                <div className="px-3 py-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={formData.riskTolerance}
                    onChange={handleSliderChange('riskTolerance')}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0%</span>
                    <span className="font-semibold text-blue-600">{formData.riskTolerance}%</span>
                    <span>50%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    0% = Muito conservador | 50% = Muito agressivo
                  </p>
                </div>
              </div>

              {/* Pergunta 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  5. Já passou por uma queda muito forte? Qual foi o seu comportamento? *
                </label>
                <textarea
                  value={formData.crashExperience}
                  onChange={handleInputChange('crashExperience')}
                  rows={3}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.crashExperience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Vendi tudo, Mantive posição, Aproveitei para comprar mais..."
                />
                {errors.crashExperience && (
                  <p className="text-red-500 text-sm mt-1">{errors.crashExperience}</p>
                )}
              </div>

              {/* Pergunta 6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6. Você já possui reserva de emergência? *
                </label>
                <div className="space-y-2 mb-4">
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
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.emergencyReserve && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyReserve}</p>
                )}

                {formData.emergencyReserve === 'sim' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onde está alocada sua reserva de emergência?
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyReserveLocation}
                      onChange={handleInputChange('emergencyReserveLocation')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Poupança, CDB, Tesouro Selic, etc."
                    />
                  </div>
                )}
              </div>

              {/* Pergunta 7 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  7. Já possui uma reserva de oportunidade?
                </label>
                <div className="space-y-2">
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
                        className="mr-2"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Pergunta 8 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  8. Qual sua renda mensal? (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange('monthlyIncome')}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5.000,00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Informação confidencial - ajuda na análise de perfil
                </p>
              </div>

              {/* Pergunta 9 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  9. Quanto sobra para aportar todos os meses? (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">R$</span>
                  <input
                    type="text"
                    value={formData.monthlyContribution}
                    onChange={handleInputChange('monthlyContribution')}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1.000,00"
                  />
                </div>
              </div>

              {/* Pergunta 10 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  10. Como você avalia seu conhecimento sobre a bolsa? *
                </label>
                <select
                  value={formData.knowledgeLevel}
                  onChange={handleInputChange('knowledgeLevel')}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.knowledgeLevel ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma opção</option>
                  <option value="nao-sei-nada">Não sei nada</option>
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
                {errors.knowledgeLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.knowledgeLevel}</p>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Alocação da Carteira */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Alocação da Carteira por Classe de Ativo
            </h2>
            <p className="text-gray-600 mb-4">
              Informe o percentual que você possui em cada classe de ativo. A soma deve totalizar 100%.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ações (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.stocks}
                    onChange={handleNumberChange('stocks')}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  FIIs - Fundos Imobiliários (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.fiis}
                    onChange={handleNumberChange('fiis')}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exterior (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.international}
                    onChange={handleNumberChange('international')}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renda Fixa (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.fixedIncome}
                    onChange={handleNumberChange('fixedIncome')}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outros (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.others}
                    onChange={handleNumberChange('others')}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full pr-8 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-3 text-gray-500">%</span>
                </div>
              </div>
              
              {formData.others > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especifique 'Outros'
                  </label>
                  <input
                    type="text"
                    value={formData.othersDescription}
                    onChange={handleInputChange('othersDescription')}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Criptomoedas, Commodities, etc."
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Total alocado:
              </span>
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

          {/* Observações Adicionais */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Observações Adicionais
            </h2>
            <textarea
              value={formData.additionalNotes}
              onChange={handleInputChange('additionalNotes')}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Qualquer informação adicional que considere relevante para a análise..."
            />
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={() => window.location.href = '/dashboard/recursos-exclusivos'}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-w-32"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Análise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
