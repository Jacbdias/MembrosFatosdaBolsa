import type { Metadata } from 'next';
import { config } from '@/config';
import { SettingsView } from '@/components/dashboard/settings/settings-view';

export const metadata: Metadata = { 
  title: `Settings | Dashboard | ${config.site.name}` 
};

export default function Page(): React.JSX.Element {
  return <SettingsView />;
}
