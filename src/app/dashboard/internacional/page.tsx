/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export default function Page(): React.JSX.Element {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4">Investimentos Internacionais</Typography>
      <Typography variant="body1">Página funcionando perfeitamente!</Typography>
    </Box>
  );
}
