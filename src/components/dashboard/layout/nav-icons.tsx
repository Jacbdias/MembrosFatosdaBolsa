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
// Novos ícones melhorados
import { Book } from '@phosphor-icons/react/dist/ssr/Book';
import { Receipt } from '@phosphor-icons/react/dist/ssr/Receipt';
import { VideoCamera } from '@phosphor-icons/react/dist/ssr/VideoCamera';
import { Airplane } from '@phosphor-icons/react/dist/ssr/Airplane';
import { Table } from '@phosphor-icons/react/dist/ssr/Table';
import { ChatCircle } from '@phosphor-icons/react/dist/ssr/ChatCircle';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';
import { ChartLine } from '@phosphor-icons/react/dist/ssr/ChartLine';

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
  
  // Ícones dos recursos exclusivos
  'lightbulb': Lightbulb,         // Para Dicas de Investimentos
  'chart-line': ChartLine,        // Para Análise de Carteira
  'book': Book,                   // Para eBooks
  'receipt': Receipt,             // Para Imposto de Renda
  'video': VideoCamera,           // Para Lives e Aulas
  'airplane': Airplane,           // Para Milhas Aéreas
  'table': Table,                 // Para Planilhas
  'chat': ChatCircle,             // Para Telegram
} as Record<string, Icon>;
