// src/app/dashboard/notifications/page.tsx

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
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Container,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useNotifications } from '@/hooks/useNotifications';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - notifDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Agora há pouco';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  return `${Math.floor(diffInSeconds / 86400)}d atrás`;
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon sx={{ color: '#4bf700', fontSize: 20 }} />;
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
    default:
      return <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  
  const [tabValue, setTabValue] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [localLoading, setLocalLoading] = React.useState(false);

  // Filtrar notificações baseado na aba e busca
  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filtro por aba
    if (tabValue === 1) {
      filtered = filtered.filter(n => !n.read); // Apenas não lidas
    } else if (tabValue === 2) {
      filtered = filtered.filter(n => n.read); // Apenas lidas
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term) ||
        n.category.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      setLocalLoading(true);
      await markAsRead(notification.id);
      setLocalLoading(false);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAsReadLocal = async (notificationId: string) => {
    setLocalLoading(true);
    await markAsRead(notificationId);
    setLocalLoading(false);
  };

  const handleDeleteLocal = async (notificationId: string) => {
    if (confirm('Deseja realmente deletar esta notificação?')) {
      setLocalLoading(true);
      await deleteNotification(notificationId);
      setLocalLoading(false);
    }
  };

  const handleMarkAllAsReadLocal = async () => {
    if (confirm('Marcar todas as notificações como lidas?')) {
      setLocalLoading(true);
      await markAllAsRead();
      setLocalLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: 'grey.700' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'grey.800' }}>
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} não lidas`}
              size="small"
              sx={{
                backgroundColor: '#4bf700',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="Buscar notificações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'grey.500' }} />
                </InputAdornment>
              )
            }}
          />
          
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<MarkEmailReadIcon />}
              onClick={handleMarkAllAsReadLocal}
              disabled={localLoading}
              sx={{
                textTransform: 'none',
                borderColor: '#4bf700',
                color: '#4bf700',
                '&:hover': {
                  backgroundColor: 'rgba(75, 247, 0, 0.08)',
                  borderColor: '#42d800'
                }
              }}
            >
              Marcar todas como lidas
            </Button>
          )}
        </Stack>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'grey.200',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500
            },
            '& .Mui-selected': {
              color: '#4bf700 !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4bf700'
            }
          }}
        >
          <Tab label={`Todas (${notifications.length})`} />
          <Tab label={`Não lidas (${notifications.filter(n => !n.read).length})`} />
          <Tab label={`Lidas (${notifications.filter(n => n.read).length})`} />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsReadLocal}
            onDelete={handleDeleteLocal}
            onClick={handleNotificationClick}
            loading={localLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsReadLocal}
            onDelete={handleDeleteLocal}
            onClick={handleNotificationClick}
            loading={localLoading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <NotificationList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsReadLocal}
            onDelete={handleDeleteLocal}
            onClick={handleNotificationClick}
            loading={localLoading}
          />
        </TabPanel>
      </Box>
    </Container>
  );
}

// Componente para lista de notificações
function NotificationList({ 
  notifications, 
  onMarkAsRead, 
  onDelete, 
  onClick, 
  loading 
}: {
  notifications: any[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: any) => void;
  loading: boolean;
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <InfoIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            Nenhuma notificação encontrada
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Você está em dia com suas notificações
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={1}>
      {notifications.map((notification, index) => (
        <Card 
          key={notification.id}
          sx={{
            border: !notification.read ? '1px solid rgba(75, 247, 0, 0.3)' : '1px solid',
            borderColor: !notification.read ? 'rgba(75, 247, 0, 0.3)' : 'grey.200',
            backgroundColor: !notification.read ? 'rgba(75, 247, 0, 0.02)' : 'white',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: !notification.read ? 'rgba(75, 247, 0, 0.06)' : 'grey.50',
              cursor: notification.actionUrl ? 'pointer' : 'default'
            }
          }}
          onClick={() => onClick(notification)}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* Icon */}
              <Box sx={{ mt: 0.5 }}>
                {getNotificationIcon(notification.type)}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '16px',
                      fontWeight: notification.read ? 400 : 600,
                      color: notification.read ? 'text.secondary' : 'text.primary',
                      lineHeight: 1.3
                    }}
                  >
                    {notification.title}
                  </Typography>
                  
                  {!notification.read && (
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#4bf700',
                      mt: 1
                    }} />
                  )}
                </Stack>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 2,
                    lineHeight: 1.4
                  }}
                >
                  {notification.message}
                </Typography>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip 
                      label={notification.category.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: '11px',
                        height: 20,
                        textTransform: 'capitalize'
                      }}
                    />
                    <Typography variant="caption" color="text.disabled">
                      {formatDateTime(notification.createdAt)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    {!notification.read && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        disabled={loading}
                        sx={{
                          color: 'grey.500',
                          '&:hover': {
                            color: '#4bf700',
                            backgroundColor: 'rgba(75, 247, 0, 0.1)'
                          }
                        }}
                      >
                        <MarkEmailReadIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      disabled={loading}
                      sx={{
                        color: 'grey.500',
                        '&:hover': {
                          color: 'error.main',
                          backgroundColor: 'error.50'
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}