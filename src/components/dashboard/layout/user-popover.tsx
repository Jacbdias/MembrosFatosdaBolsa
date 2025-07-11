import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const router = useRouter();
  
  // ✅ Estado para dados completos do usuário (incluindo avatar)
  const [userData, setUserData] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  } | null>(null);

  // ✅ Carregar dados do usuário
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: user } = await authClient.getUser();
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    if (open) { // Só carregar quando o popover abrir
      loadUserData();
    }
  }, [open]);

  // ✅ Recarregar dados quando localStorage mudar (quando avatar for atualizado)
  React.useEffect(() => {
    const handleStorageChange = () => {
      if (open) {
        const userDataFromStorage = localStorage.getItem('user-data');
        if (userDataFromStorage) {
          try {
            const parsedUser = JSON.parse(userDataFromStorage);
            setUserData(parsedUser);
          } catch (error) {
            console.error('Error parsing user data from storage:', error);
          }
        }
      }
    };

    // Escutar mudanças no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar mudanças quando o popover abrir
    if (open) {
      handleStorageChange();
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [open]);

  // ✅ NOVO: Escutar evento customizado de atualização do avatar
  React.useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      console.log('🔄 Evento capturado no user-popover!', event.detail);
      
      // Recarregar dados do localStorage
      const userDataFromStorage = localStorage.getItem('user-data');
      if (userDataFromStorage) {
        try {
          const parsedUser = JSON.parse(userDataFromStorage);
          setUserData(parsedUser);
          console.log('✅ Avatar atualizado no popover!', parsedUser.avatar ? 'Com avatar' : 'Sem avatar');
        } catch (error) {
          console.error('Error parsing user data from storage:', error);
        }
      }
    };

    // Escutar o evento customizado
    window.addEventListener('user-data-updated', handleUserDataUpdate as EventListener);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate as EventListener);
    };
  }, []); // Array vazio = executa apenas uma vez

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      const { error } = await authClient.signOut();
      if (error) {
        logger.error('Sign out error', error);
        return;
      }
      // Refresh the auth state
      await checkSession?.();
      // UserProvider, for this case, will not refresh the router and we need to do it manually
      router.refresh();
      // After refresh, AuthGuard will handle the redirect
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [checkSession, router]);

  // ✅ Calcular dados dinâmicos
  const displayName = userData 
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    : 'Carregando...';
  
  const displayEmail = userData?.email || 'carregando...';
  const avatarSrc = userData?.avatar || '/assets/avatar.png';

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      {/* ✅ NOVO: Header com avatar */}
      <Box sx={{ p: '16px 20px' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={avatarSrc}
            sx={{ 
              width: 40, 
              height: 40,
              border: '2px solid #E2E8F0'
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: '600',
                color: '#1E293B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayName}
            </Typography>
            <Typography 
              color="text.secondary" 
              variant="body2"
              sx={{
                color: '#64748B',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {displayEmail}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Minha Conta
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </MenuList>
    </Popover>
  );
}