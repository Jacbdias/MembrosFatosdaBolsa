'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { useDataStore } from '@/hooks/useDataStore';
import { authClient } from '@/lib/auth/client';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

// Hook para buscar ativos
function useAtivos() {
  const { dados, CARTEIRAS_CONFIG, isInitialized } = useDataStore();
  const [ativos, setAtivos] = React.useState([]);

  React.useEffect(() => {
    if (!isInitialized) return;

    try {
      const todosAtivos = [];
      
      Object.entries(dados).forEach(([nomeCarteira, ativosCarteira]) => {
        const configCarteira = CARTEIRAS_CONFIG[nomeCarteira];
        
        if (!configCarteira || !Array.isArray(ativosCarteira)) return;
        
        ativosCarteira.forEach(ativo => {
          todosAtivos.push({
            ticker: ativo.ticker,
            nome: ativo.nome || ativo.ticker,
            setor: ativo.setor || 'Outros',
            carteira: configCarteira.nome,
            carteiraIcon: configCarteira.icon,
            carteiraColor: configCarteira.color,
            moeda: configCarteira.moeda,
            dataEntrada: ativo.dataEntrada,
            precoEntrada: ativo.precoEntrada,
            precoTeto: ativo.precoTeto,
            precoTetoBDR: ativo.precoTetoBDR,
            fonte: 'datastore',
            id: ativo.id
          });
        });
      });

      const ativosUnicos = todosAtivos.reduce((acc, ativo) => {
        const existing = acc.find(a => a.ticker === ativo.ticker);
        if (!existing) {
          acc.push(ativo);
        } else {
          if (ativo.nome && ativo.nome !== ativo.ticker && (!existing.nome || existing.nome === existing.ticker)) {
            existing.nome = ativo.nome;
          }
        }
        return acc;
      }, []);

      ativosUnicos.sort((a, b) => a.ticker.localeCompare(b.ticker));
      setAtivos(ativosUnicos);

    } catch (error) {
      console.error('❌ Erro ao carregar ativos do DataStore:', error);
      setAtivos([]);
    }
  }, [dados, CARTEIRAS_CONFIG, isInitialized]);

  return ativos;
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchMode, setSearchMode] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const router = useRouter();
  
  const { user } = useUser();
  const [userAvatar, setUserAvatar] = React.useState<string>('/assets/avatar.png');
  
  const ativos = useAtivos();

  // Verificar localStorage para avatar
  React.useEffect(() => {
    const checkAvatar = () => {
      try {
        // Primeiro tentar do contexto user
        if (user?.avatar) {
          setUserAvatar(user.avatar);
          return;
        }

        // Depois tentar do localStorage
        const userData = localStorage.getItem('user-data');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.avatar && parsed.avatar !== userAvatar) {
            console.log('🔄 MainNav: Avatar atualizado');
            setUserAvatar(parsed.avatar);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar avatar:', error);
      }
    };

    // Verificar imediatamente
    checkAvatar();
    
    // Verificar a cada 1 segundo
    const interval = setInterval(checkAvatar, 1000);
    
    // NOVO: Escutar evento storage
    window.addEventListener('storage', checkAvatar);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkAvatar);
    };
  }, [user, userAvatar]);

  // NOVO: Sync entre dispositivos via banco
  React.useEffect(() => {
    const syncWithDatabase = async () => {
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
            if (userData.user?.avatar && userData.user.avatar !== userAvatar) {
              console.log('🔄 MainNav: Sincronizando do banco');
              setUserAvatar(userData.user.avatar);
              
              // Atualizar localStorage também
              const currentUserData = localStorage.getItem('user-data') || '{}';
              const parsedUserData = JSON.parse(currentUserData);
              parsedUserData.avatar = userData.user.avatar;
              localStorage.setItem('user-data', JSON.stringify(parsedUserData));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
      }
    };

    // Verificar a cada 10 segundos
    const interval = setInterval(syncWithDatabase, 10000);
    
    return () => clearInterval(interval);
  }, [userAvatar]);

  const handleAtivoSelect = (ativo) => {
    if (ativo) {
      router.push(`/dashboard/ativo/${ativo.ticker}`);
      setSearchMode(false);
    }
  };

  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return [];
    
    const searchTerm = inputValue.toLowerCase();
    
    return options.filter(ativo => 
      ativo.ticker.toLowerCase().includes(searchTerm) ||
      ativo.nome.toLowerCase().includes(searchTerm) ||
      ativo.setor.toLowerCase().includes(searchTerm) ||
      (ativo.carteira && ativo.carteira.toLowerCase().includes(searchTerm))
    ).slice(0, 12);
  };

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            
            {searchMode ? (
              <Box sx={{ minWidth: 350, maxWidth: 500 }}>
                <Autocomplete
                  options={ativos}
                  getOptionLabel={(option) => `${option.ticker} - ${option.nome}`}
                  filterOptions={filterOptions}
                  onChange={(event, value) => handleAtivoSelect(value)}
                  onClose={() => setSearchMode(false)}
                  open={true}
                  clearOnEscape
                  blurOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={`Buscar entre ${ativos.length} ativos (ex: PETR4, Vale, Tecnologia...)`}
                      variant="outlined"
                      size="small"
                      autoFocus
                      onBlur={() => {
                        setTimeout(() => setSearchMode(false), 150);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          backgroundColor: 'white',
                          '& fieldset': {
                            borderColor: '#010101',
                          },
                          '&:hover fieldset': {
                            borderColor: '#010101',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#010101',
                          },
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        {option.carteiraIcon && (
                          <Box sx={{ fontSize: '16px', minWidth: '20px' }}>
                            {option.carteiraIcon}
                          </Box>
                        )}
                        
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ fontWeight: 600, fontSize: '14px', color: 'primary.main' }}>
                              {option.ticker}
                            </Box>
                            {option.moeda && (
                              <Chip 
                                label={option.moeda} 
                                size="small" 
                                variant="outlined"
                                sx={{ 
                                  fontSize: '9px', 
                                  height: '16px',
                                  color: option.moeda === 'USD' ? 'green' : 'blue'
                                }}
                              />
                            )}
                          </Stack>
                          
                          <Box sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.2 }}>
                            {option.nome}
                          </Box>
                          
                          {option.carteira && (
                            <Box sx={{ fontSize: '10px', color: 'text.disabled', fontStyle: 'italic' }}>
                              📂 {option.carteira}
                            </Box>
                          )}
                        </Box>
                        
                        <Chip 
                          label={option.setor} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: '10px', 
                            height: '20px',
                            backgroundColor: option.carteiraColor ? `${option.carteiraColor}10` : undefined,
                            borderColor: option.carteiraColor || undefined
                          }}
                        />
                      </Stack>
                    </Box>
                  )}
                  noOptionsText={`Nenhum ativo encontrado entre ${ativos.length} disponíveis`}
                />
              </Box>
            ) : (
              <Tooltip title={`Buscar entre ${ativos.length} ativos`}>
                <IconButton onClick={() => setSearchMode(true)}>
                  <MagnifyingGlassIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notifications">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            <Avatar
              onClick={userPopover.handleOpen}
              ref={userPopover.anchorRef}
              src={userAvatar}
              sx={{ 
                cursor: 'pointer',
                border: '2px solid #E2E8F0',
                width: 40,
                height: 40,
                '&:hover': {
                  border: '2px solid #3B82F6'
                }
              }}            
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}