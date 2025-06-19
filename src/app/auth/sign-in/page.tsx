'use client';

import * as React from 'react';
import { Box, Button, TextField, Typography, Stack } from '@mui/material';

export default function LoginPage() {
  return (
    <Box
      sx={{
        backgroundColor: '#000',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src="/assets/logo.svg"
          alt="Fatos da Bolsa"
          sx={{ width: 120, height: 120, margin: '0 auto', mb: 2 }}
        />

        <Stack spacing={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Username"
            InputProps={{
              sx: {
                backgroundColor: '#111',
                color: '#fff',
                borderRadius: '30px',
              },
            }}
          />
          <TextField
            fullWidth
            type="password"
            variant="outlined"
            placeholder="Password"
            InputProps={{
              sx: {
                backgroundColor: '#111',
                color: '#fff',
                borderRadius: '30px',
              },
            }}
          />
          <Button
            fullWidth
            sx={{
              backgroundColor: '#00FF00',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '30px',
              paddingY: 1.5,
              '&:hover': {
                backgroundColor: '#00e600',
              },
            }}
          >
            Entrar
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            color: '#fff',
            fontSize: 14,
          }}
        >
          <Typography variant="body2" component="a" href="#" sx={{ cursor: 'pointer' }}>
            Create Account
          </Typography>
          <Typography variant="body2" component="a" href="#" sx={{ cursor: 'pointer' }}>
            Need Help?
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
