// src/lib/financial-utils.ts
export class FinancialUtils {
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  static formatPercent(value: number): string {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  static getTrendDirection(value: number): 'up' | 'down' {
    return value >= 0 ? 'up' : 'down';
  }

  static getStockLogoUrl(ticker: string): string {
    const cleanTicker = ticker.replace(/\d+$/, '');
    return `https://raw.githubusercontent.com/thefintz/b3-assets/main/assets/${cleanTicker}/logo.svg`;
  }

  static formatMarketValue(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value.toLocaleString('pt-BR');
  }
}
