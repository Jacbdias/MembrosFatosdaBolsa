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
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

// Lista completa dos ativos
const ATIVOS_DISPONIVEIS = [
  // Agricultura
  { ticker: 'KEPL3', nome: 'Kepler Weber S.A.', setor: 'Agricultura' },
  { ticker: 'AGRO3', nome: 'BrasilAgro S.A.', setor: 'Agricultura' },
  
  // Automotivo
  { ticker: 'LEVE3', nome: 'Metal Leve S.A.', setor: 'Automotivo' },
  
  // Bancos
  { ticker: 'BBAS3', nome: 'Banco do Brasil S.A.', setor: 'Bancos' },
  { ticker: 'BRSR6', nome: 'Banrisul S.A.', setor: 'Bancos' },
  { ticker: 'ABCB4', nome: 'Banco ABC Brasil S.A.', setor: 'Bancos' },
  { ticker: 'SANB11', nome: 'Banco Santander Brasil S.A.', setor: 'Bancos' },
  
  // Bens Industriais
  { ticker: 'TASA4', nome: 'Taurus Armas S.A.', setor: 'Bens Industriais' },
  { ticker: 'ROMI3', nome: 'Indústrias Romi S.A.', setor: 'Bens Industriais' },
  
  // Construção Civil
  { ticker: 'EZTC3', nome: 'EZ Tec Empreendimentos e Participações S.A.', setor: 'Construção Civil' },
  { ticker: 'EVEN3', nome: 'Even Construtora e Incorporadora S.A.', setor: 'Construção Civil' },
  { ticker: 'TRIS3', nome: 'Trisul S.A.', setor: 'Construção Civil' },
  
  // Commodities
  { ticker: 'FESA4', nome: 'Ferbasa S.A.', setor: 'Commodities' },
  
  // Consumo Cíclico
  { ticker: 'CEAB3', nome: 'C&A Modas S.A.', setor: 'Consumo Cíclico' },
  
  // Educação
  { ticker: 'CSED3', nome: 'Cruzeiro do Sul Educacional S.A.', setor: 'Educação' },
  { ticker: 'YDUQ3', nome: 'Yduqs Participações S.A.', setor: 'Educação' },
  
  // Energia
  { ticker: 'ALUP11', nome: 'Alupar Investimento S.A.', setor: 'Energia' },
  { ticker: 'NEOE3', nome: 'Neoenergia S.A.', setor: 'Energia' },
  { ticker: 'EGIE3', nome: 'Engie Brasil Energia S.A.', setor: 'Energia' },
  { ticker: 'ELET3', nome: 'Centrais Elétricas Brasileiras S.A. - Eletrobras', setor: 'Energia' },
  { ticker: 'ISAE4', nome: 'ISA CTEEP S.A.', setor: 'Energia' },
  { ticker: 'CPLE6', nome: 'Copel S.A.', setor: 'Energia' },
  
  // Financeiro
  { ticker: 'BBSE3', nome: 'BB Seguridade Participações S.A.', setor: 'Financeiro' },
  { ticker: 'B3SA3', nome: 'B3 S.A. - Brasil, Bolsa, Balcão', setor: 'Financeiro' },
  
  // Industrial
  { ticker: 'TUPY3', nome: 'Tupy S.A.', setor: 'Industrial' },
  { ticker: 'RAPT4', nome: 'Randon S.A. Implementos e Participações', setor: 'Industrial' },
  { ticker: 'SHUL4', nome: 'Schulz S.A.', setor: 'Industrial' },
  
  // Logística
  { ticker: 'SIMH3', nome: 'SIMPAR S.A.', setor: 'Logística' },
  { ticker: 'LOGG3', nome: 'Log Commercial Properties e Participações S.A.', setor: 'Logística' },
  
  // Mineração
  { ticker: 'VALE3', nome: 'Vale S.A.', setor: 'Mineração' },
  
  // Nanocaps
  { ticker: 'CGRA4', nome: 'Grazziotin S.A.', setor: 'Nanocap/Consumo Cíclico' },
  { ticker: 'RSUL4', nome: 'Riograndense S.A.', setor: 'Nanocap/Industrial' },
  { ticker: 'DEXP3', nome: 'Dexco S.A.', setor: 'Nanocap/Químico' },
  
  // Papel e Celulose
  { ticker: 'RANI3', nome: 'Irani Papel e Embalagem S.A.', setor: 'Papel' },
  { ticker: 'KLBN11', nome: 'Klabin S.A.', setor: 'Papel e Celulose' },
  
  // Petróleo
  { ticker: 'RECV3', nome: 'PetroRecôncavo S.A.', setor: 'Petróleo' },
  { ticker: 'PRIO3', nome: 'PetroRio S.A.', setor: 'Petróleo' },
  { ticker: 'PETR4', nome: 'Petróleo Brasileiro S.A. - Petrobras', setor: 'Petróleo' },
  
  // Químico
  { ticker: 'UNIP6', nome: 'Unipar Carbocloro S.A.', setor: 'Químico' },
  
  // Saneamento
  { ticker: 'SAPR4', nome: 'Sanepar S.A.', setor: 'Saneamento' },
  { ticker: 'CSMG3', nome: 'Copasa MG S.A.', setor: 'Saneamento' },
  
  // Saúde
  { ticker: 'FLRY3', nome: 'Fleury S.A.', setor: 'Saúde' },
  { ticker: 'ODPV3', nome: 'Odontoprev S.A.', setor: 'Saúde' },
  
  // Seguros
  { ticker: 'WIZC3', nome: 'Wiz Soluções e Corretagem de Seguros S.A.', setor: 'Seguros' },
  
  // Sucroenergético
  { ticker: 'SMTO3', nome: 'São Martinho S.A.', setor: 'Sucroenergético' },
  { ticker: 'JALL3', nome: 'Jalles Machado S.A.', setor: 'Sucroenergético' },
  
  // Tecnologia
  { ticker: 'POSI3', nome: 'Positivo Tecnologia S.A.', setor: 'Tecnologia' },
  
  // Telecom
  { ticker: 'VIVT3', nome: 'Telefônica Brasil S.A.', setor: 'Telecom' },
  
  // Shoppings
  { ticker: 'ALOS3', nome: 'Allos S.A.', setor: 'Shoppings' }
];

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const [searchMode, setSearchMode] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const router = useRouter();

  // Navegar para o ativo selecionado
  const handleAtivoSelect = (ativo: typeof ATIVOS_DISPONIVEIS[0] | null) => {
    if (ativo) {
      router.push(`/empresa/${ativo.ticker}`);
      setSearchMode(false);
    }
  };

  // Função para filtrar opções
  const filterOptions = (options: typeof ATIVOS_DISPONIVEIS, { inputValue }: { inputValue: string }) => {
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
                  options={ATIVOS_DISPONIVEIS}
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
              src="/assets/avatar.png"
              sx={{ cursor: 'pointer' }}
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
