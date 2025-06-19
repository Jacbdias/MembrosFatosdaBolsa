'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { authClient } from '@/lib/auth/client';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});
  
  const [planInfo, setPlanInfo] = React.useState<{ displayName: string; pages: string[] } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        console.log('🔄 Carregando planInfo...');
        const info = await authClient.getPlanInfo();
        console.log('📋 PlanInfo recebido:', info);
        
        if (info) {
          setPlanInfo(info);
          console.log('✅ PlanInfo definido:', info);
        } else {
          console.log('⚠️ PlanInfo é null, usando fallback VIP');
          setPlanInfo({
            displayName: 'Close Friends VIP',
            pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
          });
        }
      } catch (error) {
        console.error('❌ Error loading plan info:', error);
        console.log('🔄 Usando fallback VIP devido ao erro');
        setPlanInfo({
          displayName: 'Close Friends VIP',
          pages: ['small-caps', 'micro-caps', 'dividendos', 'fundos-imobiliarios', 'rentabilidades', 'internacional', 'recursos-exclusivos']
        });
      } finally {
        setLoading(false);
        console.log('✅ Loading finalizado');
      }
    };

    loadPlanInfo();
  }, []);

  const hasAccessSync = (page: string): boolean => {
    if (!planInfo) {
      console.log('⚠️ planInfo não carregado ainda');
      return true;
    }
    const hasAccess = planInfo.pages.includes(page);
    console.log(`🔑 Acesso para "${page}": ${hasAccess} (disponíveis: ${planInfo.pages.length} páginas)`);
    return hasAccess;
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ✅ NOVA LÓGICA MAIS SIMPLES E DIRETA
  const getFilteredNavItems = (items: NavItemConfig[]): NavItemConfig[] => {
    return items.map(item => {
      // Fazer uma cópia do item para não modificar o original
      const itemCopy = { ...item };
      
      // Se tem subitens, filtrar os subitens
      if (itemCopy.items) {
        const filteredSubItems = itemCopy.items.filter(subItem => {
          // Se não tem página definida, mostrar sempre
          if (!subItem.page) return true;
          // Se tem página, verificar acesso
          return hasAccessSync(subItem.page);
        });
        
        itemCopy.items = filteredSubItems;
        
        // Sempre mostrar o item principal se:
        // 1. Não tem página definida OU
        // 2. Tem acesso à página principal OU  
        // 3. Tem pelo menos um subitem
        return !itemCopy.page || hasAccessSync(itemCopy.page) || filteredSubItems.length > 0;
      }
      
      // Para itens sem subitens
      // Se não tem página definida, mostrar sempre
      if (!itemCopy.page) return true;
      // Se tem página, verificar acesso
      return hasAccessSync(itemCopy.page);
    }).filter(Boolean);
  };

  const filteredNavItems = getFilteredNavItems([...navItems]);

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': '#4dfb01',
        '--NavItem-active-color': '#000000',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': '#000000',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box
          component={RouterLink}
          href={paths.home}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Logo color="light" height={64} width={64} />
        </Box>

        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'var(--mui-palette-neutral-950)',
            border: '1px solid var(--mui-palette-neutral-700)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            p: '4px 12px',
          }}
        >
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography color="var(--mui-palette-neutral-400)" variant="body2">
              Plano
            </Typography>
            <Typography color="inherit" variant="subtitle1">
              {planInfo?.displayName || 'Carregando...'}
            </Typography>
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />

      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {loading ? (
          <Typography color="var(--mui-palette-neutral-400)" variant="body2" sx={{ p: 2 }}>
            Carregando menu...
          </Typography>
        ) : (
          renderNavItems({ 
            pathname, 
            items: filteredNavItems,
            expandedItems, 
            toggleExpanded 
          })
        )}
      </Box>
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
  expandedItems,
  toggleExpanded,
}: {
  items?: NavItemConfig[];
  pathname: string;
  expandedItems: Record<string, boolean>;
  toggleExpanded: (key: string) => void;
}): React.JSX.Element {
  const children = items.reduce(
    (acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
      const { key, ...item } = curr;
      acc.push(
        <NavItem 
          key={key} 
          itemKey={key}
          pathname={pathname} 
          expandedItems={expandedItems}
          toggleExpanded={toggleExpanded}
          {...item} 
        />
      );
      return acc;
    },
    []
  );

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'key'> {
  pathname: string;
  itemKey: string;
  expandedItems: Record<string, boolean>;
  toggleExpanded: (key: string) => void;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  items,
  itemKey,
  expandedItems,
  toggleExpanded,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  const hasChildren = items && items.length > 0;
  const isExpanded = expandedItems[itemKey] || false;

  if (href && hasChildren) {
    return (
      <li>
        <Box sx={{ position: 'relative' }}>
          <Box
            component={external ? 'a' : RouterLink}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            sx={{
              alignItems: 'center',
              borderRadius: 1,
              color: 'var(--NavItem-color)',
              cursor: 'pointer',
              display: 'flex',
              flex: '0 0 auto',
              gap: 1,
              p: '6px 16px',
              pr: '40px',
              position: 'relative',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              ...(disabled && {
                bgcolor: 'var(--NavItem-disabled-background)',
                color: 'var(--NavItem-disabled-color)',
                cursor: 'not-allowed',
              }),
              ...(active && {
                bgcolor: 'var(--NavItem-active-background)',
                color: 'var(--NavItem-active-color)',
              }),
              '&:hover': {
                bgcolor: active ? 'var(--NavItem-active-background)' : 'var(--NavItem-hover-background)',
              }
            }}
          >
            <Box
              sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                flex: '0 0 auto',
              }}
            >
              {Icon ? (
                <Icon
                  fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
                  fontSize="var(--icon-fontSize-md)"
                  weight={active ? 'fill' : undefined}
                />
              ) : null}
            </Box>
            <Box sx={{ flex: '1 1 auto' }}>
              <Typography
                component="span"
                sx={{
                  color: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '28px',
                }}
              >
                {title}
              </Typography>
            </Box>
          </Box>

          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpanded(itemKey);
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--NavItem-icon-color)',
              width: 24,
              height: 24,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <CaretDown
              size={16}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </IconButton>
        </Box>

        <Collapse in={isExpanded}>
          <Box sx={{ pl: 2, mt: 1 }}>
            {renderNavItems({ 
              pathname, 
              items: items, 
              expandedItems, 
              toggleExpanded 
            })}
          </Box>
        </Collapse>
      </li>
    );
  }

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            flex: '0 0 auto',
          }}
        >
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '28px',
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
