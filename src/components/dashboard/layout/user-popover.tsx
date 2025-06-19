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
  
  // ✅ ADICIONAR: Estado para dados do usuário
  const [userData, setUserData] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);

  // ✅ ADICIONAR: Carregar dados do usuário
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

  // ✅ ADICIONAR: Calcular nome e email dinâmicos
  const displayName = userData 
    ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    : 'Carregando...';
  
  const displayEmail = userData?.email || 'carregando...';

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        {/* ✅ MODIFICADO: Usar dados dinâmicos */}
        <Typography variant="subtitle1">{displayName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {displayEmail}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
