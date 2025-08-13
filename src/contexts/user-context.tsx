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

  // 🔥 NOVO: Escutar evento de atualização de perfil
  React.useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('🎯 4. UserContext recebeu evento:', event.detail);
      
      setState((prev) => {
        if (!prev.user) return prev;
        
        const updatedUser = {
          ...prev.user,
          ...event.detail,
          // Força re-render com timestamp
          _lastUpdate: Date.now()
        };
        
        console.log('🎯 5. UserContext atualizou estado:', updatedUser);
        
        return {
          ...prev,
          user: updatedUser
        };
      });
    };

    // Escutar o evento correto
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  // ✅ MANTER: Escutar mudanças no localStorage (para compatibilidade)
  React.useEffect(() => {
    const handleUserDataUpdate = () => {
      const userDataFromStorage = localStorage.getItem('user-data');
      if (userDataFromStorage && state.user) {
        try {
          const parsedUserData = JSON.parse(userDataFromStorage);
          if (parsedUserData.avatar && parsedUserData.avatar !== state.user.avatar) {
            console.log('🔄 UserProvider: Atualizando avatar do contexto via localStorage');
            setState((prev) => ({
              ...prev,
              user: prev.user ? { 
                ...prev.user, 
                avatar: parsedUserData.avatar,
                _lastUpdate: Date.now()
              } : null
            }));
          }
        } catch (error) {
          console.error('Erro ao parsear user-data do localStorage:', error);
        }
      }
    };

    // Escutar evento customizado (manter por compatibilidade)
    window.addEventListener('user-data-updated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate);
    };
  }, [state.user]);

  // 🔄 NOVO: Sync automático quando página fica ativa
  React.useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('🔄 Página ficou ativa - sincronizando avatar...');
        
        try {
          const token = localStorage.getItem('custom-auth-token');
          const userEmail = localStorage.getItem('user-email');
          
          if (token && userEmail) {
            const response = await fetch('/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'X-User-Email': userEmail,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData.user?.avatar && userData.user.avatar !== state.user?.avatar) {
                console.log('🔄 Avatar desatualizado - atualizando!');
                
                // Atualizar localStorage
                const currentUserData = localStorage.getItem('user-data') || '{}';
                const parsedUserData = JSON.parse(currentUserData);
                parsedUserData.avatar = userData.user.avatar;
                localStorage.setItem('user-data', JSON.stringify(parsedUserData));
                
                // Disparar evento
                window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                  detail: { avatar: userData.user.avatar }
                }));
              }
            }
          }
        } catch (error) {
          console.error('Erro ao sincronizar avatar:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.user]);

  return <UserContext.Provider value={{ ...state, checkSession }}>{children}</UserContext.Provider>;
}