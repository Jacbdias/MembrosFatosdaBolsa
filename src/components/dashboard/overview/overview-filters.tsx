// overview-filters.tsx
import * as React from 'react';
import { Card, CardContent } from '@mui/material/Card';
import { Button } from '@mui/material/Button';

export interface OverviewFiltersProps {
  // Props específicas para overview
}

export function OverviewFilters(props: OverviewFiltersProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button variant="outlined">
            Filtro Overview 1
          </Button>
          <Button variant="outlined">
            Filtro Overview 2
          </Button>
          <Button variant="outlined">
            Período
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
