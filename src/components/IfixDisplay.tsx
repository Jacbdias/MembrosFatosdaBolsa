// components/IfixDisplay.tsx
import { useIfixRealTime } from './hooks/useIfixRealTime';

export function IfixDisplay() {
  const { ifixData, loading, error, refetch } = useIfixRealTime();

  if (loading && !ifixData) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando IFIX...</span>
      </div>
    );
  }

  if (!ifixData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">Erro ao carregar dados do IFIX</p>
        <button 
          onClick={refetch}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">IFIX</h2>
        <button 
          onClick={refetch}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? '...' : '🔄'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">
            {ifixData.valorFormatado}
          </span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            ifixData.trend === 'up' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {ifixData.trend === 'up' ? '↗' : '↘'} 
            {Math.abs(ifixData.variacaoPercent).toFixed(2)}%
          </span>
        </div>

        <div className="text-sm text-gray-600">
          <p>Variação: {ifixData.variacao > 0 ? '+' : ''}{ifixData.variacao.toFixed(2)}</p>
          <p>Fonte: {ifixData.fonte}</p>
          {error && (
            <p className="text-yellow-600 mt-1">⚠️ {error}</p>
          )}
        </div>

        <div className="text-xs text-gray-400">
          <p>{ifixData.nota}</p>
          <p>Atualizado: {new Date(ifixData.timestamp).toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}
