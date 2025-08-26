// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para verificar se está autenticado
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('custom-auth-token');
    const userEmail = localStorage.getItem('user-email');
    const hasTokens = Boolean(token && userEmail);
    
    console.log('isAuthenticated check:', { hasTokens, token: token?.substring(0, 10) });
    
    return hasTokens;
  }, []);

  // Função para limpar estado quando não autenticado
  const clearState = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
    setLoading(false);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('custom-auth-token');
    const userEmail = localStorage.getItem('user-email');
    
    if (!token || !userEmail) {
      throw new Error('Authentication required');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'X-User-Email': userEmail,
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    // Verificar auth antes de fazer request
    if (!isAuthenticated()) {
      console.log('useNotifications: Usuário não autenticado, limpando estado');
      clearState();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const response = await fetch('/api/notifications', {
        headers
      });

      if (!response.ok) {
        // Tratar diferentes tipos de erro
        if (response.status === 401 || response.status === 404) {
          console.log('useNotifications: Auth inválida, limpando estado');
          clearState();
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch notifications`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      
      console.log('useNotifications: Dados carregados', {
        total: data.notifications?.length || 0,
        unread: data.unreadCount || 0
      });

    } catch (err) {
      console.error('useNotifications: Error fetching notifications:', err);
      
      // Se erro de auth, limpar estado completamente
      if (err instanceof Error && err.message.includes('Authentication required')) {
        clearState();
        return;
      }
      
      // Para outros erros, manter dados mas mostrar erro
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, isAuthenticated, clearState]);

  const markAsRead = useCallback(async (id: string) => {
    if (!isAuthenticated()) {
      clearState();
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          clearState();
          return;
        }
        throw new Error('Failed to mark notification as read');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (err instanceof Error && err.message.includes('Authentication required')) {
        clearState();
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [getAuthHeaders, isAuthenticated, clearState]);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated()) {
      clearState();
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          clearState();
          return;
        }
        throw new Error('Failed to mark all notifications as read');
      }

      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      if (err instanceof Error && err.message.includes('Authentication required')) {
        clearState();
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [getAuthHeaders, isAuthenticated, clearState]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!isAuthenticated()) {
      clearState();
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          clearState();
          return;
        }
        throw new Error('Failed to delete notification');
      }

      // Atualizar estado local
      const notificationToDelete = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      if (err instanceof Error && err.message.includes('Authentication required')) {
        clearState();
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [getAuthHeaders, notifications, isAuthenticated, clearState]);

  const refreshNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Effect para monitorar mudanças de auth
  useEffect(() => {
    const handleAuthChange = () => {
      if (!isAuthenticated()) {
        console.log('useNotifications: Auth perdida, limpando estado');
        clearState();
      } else {
        console.log('useNotifications: Auth detectada, carregando dados');
        fetchNotifications();
      }
    };

    // Verificar imediatamente
    handleAuthChange();

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleAuthChange);
    
    return () => window.removeEventListener('storage', handleAuthChange);
  }, [fetchNotifications, isAuthenticated, clearState]);

  // Polling condicional (apenas se autenticado)
  useEffect(() => {
    const authStatus = isAuthenticated();
    console.log('useNotifications POLLING: isAuth =', authStatus);
    
    if (!authStatus) {
      console.log('useNotifications POLLING: Não autenticado, pulando polling');
      return;
    }

    console.log('useNotifications POLLING: Iniciando interval de 30s');
    const interval = setInterval(() => {
      const stillAuth = isAuthenticated();
      console.log('useNotifications POLLING: Executando... isAuth =', stillAuth);
      
      if (stillAuth) {
        console.log('useNotifications POLLING: Fazendo fetchNotifications');
        fetchNotifications();
      } else {
        console.log('useNotifications POLLING: Não autenticado, pulando fetch');
      }
    }, 30000); // 30 segundos

    return () => {
      console.log('useNotifications POLLING: Limpando interval');
      clearInterval(interval);
    };
  }, [fetchNotifications, isAuthenticated]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
}