// src/components/dashboard/layout/nav-icons.ts
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChartBar } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Globe } from '@phosphor-icons/react/dist/ssr/Globe';
import { Package } from '@phosphor-icons/react/dist/ssr/Package';

export const navIcons = {
  'chart-pie': ChartPie,
  'chart-bar': ChartBar,
  'chart-line-up': ChartLineUp,
  'buildings': Buildings,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'user': UserIcon,
  'users': UsersIcon,
  'globe': Globe,
  'package': Package,
} as Record<string, Icon>;

// DEBUG: Adicione temporariamente para debug
console.log('=== DEBUG NAV ICONS ===');
console.log('Available icons:', Object.keys(navIcons));
console.log('Package icon exists:', !!navIcons['package']);
console.log('======================');
