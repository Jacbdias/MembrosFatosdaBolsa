// 🚀 EXPORTAÇÕES CENTRALIZADAS DOS HOOKS DE MICRO CAPS

// Hooks principais
export { useMicroCapsData } from './useMicroCapsData';
export { useMarketData, useIbovespaPeriodo } from './useMarketData';
export { useApiStrategy } from './useApiStrategy';
export { useResponsive } from './useResponsive';

// Tipos
export type {
  Ativo,
  Cotacao,
  SmllData,
  IbovespaData,
  IbovespaPeriodo,
  CarteiraMetricas,
  ApiStrategy,
  ResponsiveInfo
} from '@/types/microCaps';

// Utilitários
export {
  calcularViesAutomatico,
  calcularProventosAtivo,
  calcularMetricasCarteira,
  formatCurrency,
  formatPercentage,
  formatNumber
} from '@/utils/micro-caps/calculationUtils';

// Configurações
export { API_CONFIG, buildApiUrl, buildBatchApiUrl } from '@/config/apiConfig';