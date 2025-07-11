'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';
import Alert from '@mui/material/Alert';

interface AccountDetailsFormProps {
  user: any;
  onUpdate: (data: any) => void;
}

export function AccountDetailsForm({ user, onUpdate }: AccountDetailsFormProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || ''
  });

  // Atualizar form quando user mudar
  React.useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userEmail = localStorage.getItem('user-email');
      const token = localStorage.getItem('custom-auth-token');

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail || '',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          avatar: user?.avatar // Manter avatar atual
        })
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate({
          firstName: formData.firstName,
          lastName: formData.lastName
        });
        
        // Atualizar localStorage também
        const userData = localStorage.getItem('user-data');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.firstName = formData.firstName;
          parsedUser.lastName = formData.lastName;
          localStorage.setItem('user-data', JSON.stringify(parsedUser));
        }
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ 
        backgroundColor: '#FFFFFF', 
        borderRadius: 3, 
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <CardHeader 
          title="Informações Pessoais" 
          subheader="Atualize suas informações básicas"
          sx={{
            '& .MuiCardHeader-title': {
              color: '#1E293B',
              fontWeight: '600',
              fontSize: '1.1rem'
            },
            '& .MuiCardHeader-subheader': {
              color: '#64748B'
            }
          }}
        />
        <Divider />
        <CardContent sx={{ p: 3 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              ✅ Perfil atualizado com sucesso!
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Nome</InputLabel>
                <OutlinedInput 
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  label="Nome" 
                  name="firstName"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6', borderWidth: '2px' }
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Sobrenome</InputLabel>
                <OutlinedInput 
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  label="Sobrenome" 
                  name="lastName"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3B82F6', borderWidth: '2px' }
                  }}
                />
              </FormControl>
            </Grid>
            
            <Grid md={12} xs={12}>
              <FormControl fullWidth disabled>
                <InputLabel>Email</InputLabel>
                <OutlinedInput 
                  value={user?.email || ''} 
                  label="Email" 
                  name="email"
                  sx={{
                    backgroundColor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' }
                  }}
                />
              </FormControl>
              <Alert severity="info" sx={{ mt: 1 }}>
                📧 O email não pode ser alterado por questões de segurança.
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button 
            type="submit"
            variant="contained" 
            disabled={loading}
            sx={{
              bgcolor: '#3B82F6',
              '&:hover': { bgcolor: '#2563EB' },
              px: 3
            }}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}