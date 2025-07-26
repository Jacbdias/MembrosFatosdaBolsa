'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // 🔥 CRIAR QUERY CLIENT (só uma vez por sessão)
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60000, // 1 minuto
        cacheTime: 300000, // 5 minutos
        retry: 1, // Tentar novamente apenas 1 vez em caso de erro
        refetchOnWindowFocus: true, // 🔥 SYNC AO VOLTAR PARA ABA
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}