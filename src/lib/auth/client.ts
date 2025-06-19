// ✅ PERMISSÕES DETALHADAS conforme especificado
const planPermissions = {
  'VIP': {
    displayName: 'Close Friends VIP',
    pages: [
      'small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-analise', 'recursos-ebooks', 
      'recursos-imposto', 'recursos-lives', 'recursos-milhas', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'LITE': {
    displayName: 'Close Friends LITE',
    pages: [
      'small-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'internacional', 'internacional-etfs', 'internacional-stocks', // SEM internacional-dividendos
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
      // SEM recursos-analise, recursos-imposto, recursos-lives, recursos-milhas
    ]
  },
  'RENDA_PASSIVA': {
    displayName: 'Projeto Renda Passiva',
    pages: [
      'dividendos', 'fundos-imobiliarios', 'rentabilidades',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'FIIS': {
    displayName: 'Projeto FIIs',
    pages: [
      'fundos-imobiliarios', 'rentabilidades',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-planilhas', 'recursos-telegram'
    ]
  },
  'AMERICA': {
    displayName: 'Projeto América',
    pages: [
      'internacional', 'internacional-etfs', 'internacional-stocks', 'internacional-dividendos',
      'recursos-exclusivos', 'recursos-dicas', 'recursos-ebooks', 'recursos-lives', 'recursos-planilhas', 'recursos-telegram'
      // SEM recursos-analise, recursos-imposto, recursos-milhas
    ]
  }
} as const;
