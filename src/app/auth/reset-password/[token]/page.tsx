'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { ResetPasswordWithTokenForm } from '@/components/auth/reset-password-token-form';

export default function ResetPasswordTokenPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = React.useState(true);
  const [valid, setValid] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password/${token}`);
        const data = await response.json();
        
        if (data.valid) {
          setValid(true);
          setUserEmail(data.user.email);
        } else {
          setError(data.error || 'Token inválido');
        }
      } catch (err) {
        setError('Erro ao verificar token');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: '#000',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box textAlign="center" sx={{ color: '#fff' }}>
          <CircularProgress sx={{ color: '#00FF00', mb: 2 }} />
          <Typography>Verificando link...</Typography>
        </Box>
      </Box>
    );
  }

  if (!valid || error) {
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
            sx={{ width: 120, height: 120, margin: '0 auto', mb: 3 }}
          />
          
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Link inválido ou expirado'}
          </Alert>
          
          <Typography sx={{ color: '#ccc', mb: 2 }}>
            Solicite um novo link de recuperação de senha.
          </Typography>
          
          <Box
            component="button"
            onClick={() => router.push('/auth/reset-password')}
            sx={{
              backgroundColor: '#00FF00',
              color: '#000',
              border: 'none',
              borderRadius: '30px',
              padding: '12px 24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '#00e600',
              },
            }}
          >
            Solicitar novo link
          </Box>
        </Box>
      </Box>
    );
  }

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
          sx={{ width: 120, height: 120, margin: '0 auto', mb: 1 }}
        />
        
        <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
          Redefinir Senha
        </Typography>
        
        <Typography sx={{ color: '#ccc', mb: 3 }}>
          Para: {userEmail}
        </Typography>
        
        <ResetPasswordWithTokenForm token={token} />
      </Box>
    </Box>
  );
}