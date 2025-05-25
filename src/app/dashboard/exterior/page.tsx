/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';

export default function Page(): React.JSX.Element {
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4">Página Exterior Funcionando!</Typography>
      <Typography variant="body1">Esta é uma página simples sem dependências externas.</Typography>
    </div>
  );
}
