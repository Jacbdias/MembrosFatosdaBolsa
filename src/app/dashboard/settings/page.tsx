import * as React from 'react';
import { SettingsFilters } from '@/components/dashboard/settings/settings-filters';
import { SettingsTable } from '@/components/dashboard/settings/settings-table';

export default function SettingsPage(): React.JSX.Element {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Página Settings</h1>
      <SettingsFilters />
      <SettingsTable />
    </div>
  );
}
