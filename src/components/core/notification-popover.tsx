// src\components\core\notification-popover.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Popover,
  Divider,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface NotificationPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

// Hook básico temporário para evitar erros
function useNotifications() {
  return {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    deleteNotification: async () => {}
  };
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    default:
      return <InfoIcon sx={{ color: 'info.main' }} />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'success.light';
    case 'warning':
      return 'warning.light';
    case 'error':
      return 'error.light';
    default:
      return 'info.light';
  }
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora há pouco';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return `${Math.floor(diffInSeconds / 86400)}d atrás`;
};

export function NotificationPopover({ anchorEl, open, onClose }: NotificationPopoverProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    // Marcar como lida se não estiver lida
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Redirecionar se há URL de ação
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    onClose();
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 500,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Notificações
            {unreadCount > 0 && (
              <Chip 
                label={unreadCount} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            sx={{ mt: 1 }}
          >
            Marcar todas como lidas
          </Button>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              Nenhuma notificação
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Você está em dia com todas as suas notificações
            </Typography>
          </Box>
        )}

        {!loading && !error && notifications.length > 0 && (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    cursor: notification.actionUrl ? 'pointer' : 'default',
                    backgroundColor: notification.read ? 'transparent' : getNotificationColor(notification.type),
                    '&:hover': {
                      backgroundColor: notification.read ? 'action.hover' : getNotificationColor(notification.type)
                    },
                    borderLeft: !notification.read ? '4px solid' : 'none',
                    borderLeftColor: !notification.read ? `${notification.type}.main` : 'transparent'
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {formatTimeAgo(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />

                  <Stack direction="column" spacing={0.5}>
                    {!notification.read && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMarkAsRead(e, notification.id)}
                        title="Marcar como lida"
                      >
                        <MarkEmailReadIcon fontSize="small" />
                      </IconButton>
                    )}
                    
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleDelete(e, notification.id)}
                      title="Deletar"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer - apenas se há notificações */}
      {notifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => {
              router.push('/dashboard/notifications');
              onClose();
            }}
          >
            Ver todas as notificações
          </Button>
        </Box>
      )}
    </Popover>
  );
}