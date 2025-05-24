import type { Icon } from '@phosphor-icons/react/dist/lib/types';

import { ChartPie } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { ChartBar } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { ChartLineUp } from '@phosphor-icons/react/dist/ssr/ChartLineUp';
import { Buildings } from '@phosphor-icons/react/dist/ssr/Buildings';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'chart-pie': ChartPie,
  'chart-bar': ChartBar,
  'chart-line-up': ChartLineUp,
  'buildings': Buildings,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'user': UserIcon,
  'users': UsersIcon,
} as Record<string, Icon>;
