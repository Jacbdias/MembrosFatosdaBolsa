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
      const { data: authUser, error: authError } = await authClient.getUser();
      
      if (authError || !authUser) {
        setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
        return;
      }

      // Buscar dados reais do usuário no banco
      try {
        const token = localStorage.getItem('custom-auth-token');
        const userEmail = localStorage.getItem('user-email');

        if (!token || !userEmail) {
          setState((prev) => ({ ...prev, user: null, error: null, isLoading: false }));
          return;
        }

        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Email': userEmail || '',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const realUserData = await response.json();
          
          const combinedUser: User = {
            ...authUser,
            ...realUserData,
            id: realUserData.id || authUser.id,
            email: realUserData.email || authUser.email,
            firstName: realUserData.firstName || authUser.firstName,
            lastName: realUserData.lastName || authUser.lastName,
            plan: realUserData.plan || authUser.plan,
            customPermissions: realUserData.customPermissions || []
          };

          // Verificar avatar no localStorage
          const userDataFromStorage = localStorage.getItem('user-data');
          if (userDataFromStorage) {
            try {
              const parsedUserData = JSON.parse(userDataFromStorage);
              if (parsedUserData.avatar) {
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
          // Fallback para dados do authClient
          const userWithAvatar = { ...authUser };

          const userDataFromStorage = localStorage.getItem('user-data');
          if (userDataFromStorage) {
            try {
              const parsedUserData = JSON.parse(userDataFromStorage);
              if (parsedUserData.avatar) {
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
        // Fallback para dados do authClient
        const userWithAvatar = { ...authUser };

        const userDataFromStorage = localStorage.getItem('user-data');
        if (userDataFromStorage) {
          try {
            const parsedUserData = JSON.parse(userDataFromStorage);
            if (parsedUserData.avatar) {
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
    });
  }, []);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}

export const UserConsumer = UserContext.Consumer;