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
import { authClient } from '@/lib/auth/client';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

// Hook para carregar ativos dinamicamente do localStorage
function useAtivos() {
  const [ativos, setAtivos] = React.useState<Array<{ticker: string, nome: string, setor: string}>>([]);

  React.useEffect(() => {
    const carregarAtivos = () => {
      try {
        // Tentar carregar dados do admin primeiro
        const dadosAdmin = localStorage.getItem('portfolioDataAdmin');
        if (dadosAdmin) {
          const ativosAdmin = JSON.parse(dadosAdmin);
          const ativosFormatados = ativosAdmin.map((ativo: any) => ({
            ticker: ativo.ticker,
            nome: ativo.nomeCompleto || ativo.nome || ativo.ticker,
            setor: ativo.setor || 'Outros'
          }));
          setAtivos(ativosFormatados);
          return;
        }

        // Fallback para dados estáticos (caso não haja dados do admin)
        const ativosFallback = [
          { ticker: 'KEPL3', nome: 'Kepler Weber S.A.', setor: 'Agricultura' },
          { ticker: 'AGRO3', nome: 'BrasilAgro S.A.', setor: 'Agricultura' },
          { ticker: 'LEVE3', nome: 'Metal Leve S.A.', setor: 'Automotivo' },
          { ticker: 'BBAS3', nome: 'Banco do Brasil S.A.', setor: 'Bancos' },
          { ticker: 'BRSR6', nome: 'Banrisul S.A.', setor: 'Bancos' },
          { ticker: 'ABCB4', nome: 'Banco ABC Brasil S.A.', setor: 'Bancos' },
          { ticker: 'SANB11', nome: 'Banco Santander Brasil S.A.', setor: 'Bancos' },
          { ticker: 'TASA4', nome: 'Taurus Armas S.A.', setor: 'Bens Industriais' },
          { ticker: 'ROMI3', nome: 'Indústrias Romi S.A.', setor: 'Bens Industriais' },
          { ticker: 'EZTC3', nome: 'EZ Tec Empreendimentos e Participações S.A.', setor: 'Construção Civil' },
          { ticker: 'EVEN3', nome: 'Even Construtora e Incorporadora S.A.', setor: 'Construção Civil' },
          { ticker: 'TRIS3', nome: 'Trisul S.A.', setor: 'Construção Civil' },
          { ticker: 'FESA4', nome: 'Ferbasa S.A.', setor: 'Commodities' },
          { ticker: 'CEAB3', nome: 'C&A Modas S.A.', setor: 'Consumo Cíclico' },
          { ticker: 'CSED3', nome: 'Cruzeiro do Sul Educacional S.A.', setor: 'Educação' },
          { ticker: 'YDUQ3', nome: 'Yduqs Participações S.A.', setor: 'Educação' },
          { ticker: 'ALUP11', nome: 'Alupar Investimento S.A.', setor: 'Energia' },
          { ticker: 'NEOE3', nome: 'Neoenergia S.A.', setor: 'Energia' },
          { ticker: 'EGIE3', nome: 'Engie Brasil Energia S.A.', setor: 'Energia' },
          { ticker: 'ELET3', nome: 'Centrais Elétricas Brasileiras S.A. - Eletrobras', setor: 'Energia' },
          { ticker: 'ISAE4', nome: 'ISA CTEEP S.A.', setor: 'Energia' },
          { ticker: 'CPLE6', nome: 'Copel S.A.', setor: 'Energia' },
          { ticker: 'BBSE3', nome: 'BB Seguridade Participações S.A.', setor: 'Financeiro' },
          { ticker: 'B3SA3', nome: 'B3 S.A. - Brasil, Bolsa, Balcão', setor: 'Financeiro' },
          { ticker: 'TUPY3', nome: 'Tupy S.A.', setor: 'Industrial' },
          { ticker: 'RAPT4', nome: 'Randon S.A. Implementos e Participações', setor: 'Industrial' },
          { ticker: 'SHUL4', nome: 'Schulz S.A.', setor: 'Industrial' },
          { ticker: 'SIMH3', nome: 'SIMPAR S.A.', setor: 'Logística' },
          { ticker: 'LOGG3', nome: 'Log Commercial Properties e Participações S.A.', setor: 'Logística' },
          { ticker: 'VALE3', nome: 'Vale S.A.', setor: 'Mineração' },
          { ticker: 'CGRA4', nome: 'Grazziotin S.A.', setor: 'Nanocap' },
          { ticker: 'RSUL4', nome: 'Riograndense S.A.', setor: 'Nanocap' },
          { ticker: 'DEXP3', nome: 'Dexco S.A.', setor: 'Nanocap' },
          { ticker: 'RANI3', nome: 'Irani Papel e Embalagem S.A.', setor: 'Papel' },
          { ticker: 'KLBN11', nome: 'Klabin S.A.', setor: 'Papel e Celulose' },
          { ticker: 'RECV3', nome: 'PetroRecôncavo S.A.', setor: 'Petróleo' },
          { ticker: 'PRIO3', nome: 'PetroRio S.A.', setor: 'Petróleo' },
          { ticker: 'PETR4', nome: 'Petróleo Brasileiro S.A. - Petrobras', setor: 'Petróleo' },
          { ticker: 'UNIP6', nome: 'Unipar Carbocloro S.A.', setor: 'Químico' },
          { ticker: 'SAPR4', nome: 'Sanepar S.A.', setor: 'Saneamento' },
          { ticker: 'CSMG3', nome: 'Copasa MG S.A.', setor: 'Saneamento' },
          { ticker: 'FLRY3', nome: 'Fleury S.A.', setor: 'Saúde' },
          { ticker: 'ODPV3', nome: 'Odontoprev S.A.', setor: 'Saúde' },
          { ticker: 'WIZC3', nome: 'Wiz Soluções e Corretagem de Seguros S.A.', setor: 'Seguros' },
          { ticker: 'SMTO3', nome: 'São Martinho S.A.', setor: 'Sucroenergético' },
          { ticker: 'JALL3', nome: 'Jalles Machado S.A.', setor: 'Sucroenergético' },
          { ticker: 'POSI3', nome: 'Positivo Tecnologia S.A.', setor: 'Tecnologia' },
          { ticker: 'VIVT3', nome: 'Telefônica Brasil S.A.', setor: 'Telecom' },
          { ticker: 'ALOS3', nome: 'Allos S.A.', setor: 'Shoppings' }
        ];
        
        setAtivos(ativosFallback);
      } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        setAtivos([]);
      }
    };

    carregarAtivos();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portfolioDataAdmin') {
        carregarAtivos();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return ativos;
}

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchMode, setSearchMode] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const router = useRouter();
  
  // 🔥 NOVA ABORDAGEM: Verificação direta do localStorage
  const { user } = useUser();
  const [userAvatar, setUserAvatar] = React.useState<string>('/assets/avatar.png');
  const [lastCheck, setLastCheck] = React.useState<string>('');
  
  // Carregar ativos dinamicamente
  const ativos = useAtivos();

  // Verificar localStorage diretamente a cada segundo
  React.useEffect(() => {
    const checkAvatar = () => {
      try {
        const userData = localStorage.getItem('user-data');
        if (userData) {
          const parsed = JSON.parse(userData);
          const currentCheck = userData; // Usar string completa como "fingerprint"
          
          if (currentCheck !== lastCheck) {
            if (parsed.avatar && parsed.avatar !== userAvatar) {
              console.log('🔄 AVATAR ATUALIZADO!');
              setUserAvatar(parsed.avatar);
            }
            setLastCheck(currentCheck);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar avatar:', error);
      }
    };

    // Verificar imediatamente
    checkAvatar();
    
    // Verificar a cada 500ms
    const interval = setInterval(checkAvatar, 500);
    
    return () => clearInterval(interval);
  }, [userAvatar, lastCheck]);

  // Navegar para o ativo selecionado
  const handleAtivoSelect = (ativo: {ticker: string, nome: string, setor: string} | null) => {
    if (ativo) {
      router.push(`/dashboard/empresa/${ativo.ticker}`);
      setSearchMode(false);
    }
  };

  // Função para filtrar opções
  const filterOptions = (options: typeof ativos, { inputValue }: { inputValue: string }) => {
    if (!inputValue) return [];
    
    return options.filter(ativo => 
      ativo.ticker.toLowerCase().includes(inputValue.toLowerCase()) ||
      ativo.nome.toLowerCase().includes(inputValue.toLowerCase()) ||
      ativo.setor.toLowerCase().includes(inputValue.toLowerCase())
    ).slice(0, 8); // Limitar a 8 resultados
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
            
            {/* Campo de busca de ativos */}
            {searchMode ? (
              <Box sx={{ minWidth: 300, maxWidth: 400 }}>
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
                      placeholder="Buscar ativo (ex: PETR4, Vale...)"
                      variant="outlined"
                      size="small"
                      autoFocus
                      onBlur={() => {
                        // Pequeno delay para permitir seleção
                        setTimeout(() => setSearchMode(false), 150);
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ p: 1.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ fontWeight: 600, fontSize: '14px', color: 'primary.main' }}>
                            {option.ticker}
                          </Box>
                          <Box sx={{ fontSize: '12px', color: 'text.secondary', lineHeight: 1.2 }}>
                            {option.nome}
                          </Box>
                        </Box>
                        <Chip 
                          label={option.setor} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '10px', height: '20px' }}
                        />
                      </Stack>
                    </Box>
                  )}
                  noOptionsText="Nenhum ativo encontrado"
                />
              </Box>
            ) : (
              <Tooltip title="Buscar ativos">
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
              key={userAvatar} // Força re-render
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