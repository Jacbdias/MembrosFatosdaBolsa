'use client';
import * as React from 'react';
import type { User } from '@/types/user';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';

export interface UserContextValue {
  user: User | null;
  error: string | null;
  isLoading: boolean;
  checkSession?: () => Promise<void>;
}

export const UserContext = React.createContext<UserContextValue | undefined>(undefined);

export interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<{ user: User | null; error: string | null; isLoading: boolean }>({
    user: null,
    error: null,
    isLoading: true,
  });

  const checkSession = React.useCallback(async (): Promise<void> => {
    try {
      console.log('🔍 Verificando sessão do usuário...');

      // Primeiro verificar se tem token válido via authClient
      const { data: authUser, error: authError } = await authClient.getUser();
      
      if (authError || !authUser) {
        console.log('❌ Sem sessão válida no authClient');
        setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
        return;
      }

      console.log('✅ Sessão válida no authClient para:', authUser.email);

      // Buscar dados reais do usuário no banco
      try {
        const token = localStorage.getItem('custom-auth-token');
        const userEmail = localStorage.getItem('user-email');

        if (!token || !userEmail) {
          console.log('❌ Token ou email não encontrado');
          setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
          return;
        }

        console.log('🔍 Buscando dados reais do usuário:', userEmail);

        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail || '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const realUserData = await response.json();
          console.log('✅ Dados reais carregados:', realUserData);
          
          // Combinar dados do authClient com dados reais
          const combinedUser: User = {
            ...authUser,
            ...realUserData,
            // Garantir que temos os campos essenciais
            id: realUserData.id || authUser.id,
            email: realUserData.email || authUser.email,
            firstName: realUserData.firstName || authUser.firstName,
            lastName: realUserData.lastName || authUser.lastName,
            plan: realUserData.plan || authUser.plan,
            customPermissions: realUserData.customPermissions || []
          };

          // ✅ ADICIONAR: Verificar se há avatar personalizado no localStorage
          const userDataFromStorage = localStorage.getItem('user-data');
          if (userDataFromStorage) {
            try {
              const parsedUserData = JSON.parse(userDataFromStorage);
              if (parsedUserData.avatar) {
                console.log('🎯 Avatar personalizado encontrado no localStorage');
                combinedUser.avatar = parsedUserData.avatar;
              }
            } catch (error) {
              console.error('Erro ao parsear user-data do localStorage:', error);
            }
          }

          setState((prev) => ({ 
            ...prev, 
            user: combinedUser, 
            error: null, 
            isLoading: false 
          }));
        } else {
          console.log('⚠️ API falhou, usando dados do authClient:', response.status);
          
          // Fallback para dados do authClient
          const userWithAvatar = { ...authUser };

          // ✅ ADICIONAR: Verificar avatar no localStorage para fallback
          const userDataFromStorage = localStorage.getItem('user-data');
          if (userDataFromStorage) {
            try {
              const parsedUserData = JSON.parse(userDataFromStorage);
              if (parsedUserData.avatar) {
                console.log('🎯 Avatar personalizado encontrado no localStorage (fallback)');
                userWithAvatar.avatar = parsedUserData.avatar;
              }
            } catch (error) {
              console.error('Erro ao parsear user-data do localStorage:', error);
            }
          }

          setState((prev) => ({ 
            ...prev, 
            user: userWithAvatar, 
            error: null, 
            isLoading: false 
          }));
        }

      } catch (apiError) {
        console.log('⚠️ Erro na API, usando dados do authClient:', apiError);
        
        // Fallback para dados do authClient
        const userWithAvatar = { ...authUser };

        // ✅ ADICIONAR: Verificar avatar no localStorage para catch
        const userDataFromStorage = localStorage.getItem('user-data');
        if (userDataFromStorage) {
          try {
            const parsedUserData = JSON.parse(userDataFromStorage);
            if (parsedUserData.avatar) {
              console.log('🎯 Avatar personalizado encontrado no localStorage (catch)');
              userWithAvatar.avatar = parsedUserData.avatar;
            }
          } catch (error) {
            console.error('Erro ao parsear user-data do localStorage:', error);
          }
        }

        setState((prev) => ({ 
          ...prev, 
          user: userWithAvatar, 
          error: null, 
          isLoading: false 
        }));
      }

    } catch (err) {
      logger.error(err);
      setState((prev) => ({ 
        ...prev, 
        user: null, 
        error: 'Something went wrong', 
        isLoading: false 
      }));
    }
  }, []);

  React.useEffect(() => {
    checkSession().catch((err: unknown) => {
      logger.error(err);
      // noop
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Expected
  }, []);

  // ✅ ADICIONAR: Escutar mudanças no localStorage para atualizar o avatar
  React.useEffect(() => {
    const handleUserDataUpdate = () => {
      const userDataFromStorage = localStorage.getItem('user-data');
      if (userDataFromStorage && state.user) {
        try {
          const parsedUserData = JSON.parse(userDataFromStorage);
          if (parsedUserData.avatar) {
            console.log('🔄 UserProvider: Atualizando avatar do contexto');
            setState((prev) => ({
              ...prev,
              user: prev.user ? { ...prev.user, avatar: parsedUserData.avatar } : null
            }));
          }
        } catch (error) {
          console.error('Erro ao parsear user-data do localStorage:', error);
        }
      }
    };

    // Escutar evento customizado
    window.addEventListener('user-data-updated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate);
    };
  }, [state.user]);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;