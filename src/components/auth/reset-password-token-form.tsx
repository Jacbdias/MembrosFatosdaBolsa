'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

const schema = zod.object({
  password: zod
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
    .regex(/[A-Za-z]/, { message: 'Senha deve conter pelo menos uma letra' })
    .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' }),
  confirmPassword: zod.string().min(1, { message: 'Confirmação é obrigatória' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { password: '', confirmPassword: '' } satisfies Values;

interface ResetPasswordWithTokenFormProps {
  token: string;
}

export function ResetPasswordWithTokenForm({ token }: ResetPasswordWithTokenFormProps): React.JSX.Element {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      console.log('🔐 Redefinindo senha com token:', token);

      try {
        const response = await fetch(`/api/auth/reset-password/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: values.password,
            confirmPassword: values.confirmPassword,
          }),
        });

        if (response.ok) {
          console.log('✅ Senha redefinida com sucesso');
          setSuccess(true);
          
          // Redirecionar após 3 segundos
          setTimeout(() => {
            router.push('/auth/sign-in');
          }, 3000);
        } else {
          const errorData = await response.json();
          console.log('❌ Erro ao redefinir:', errorData);
          setError('root', { type: 'server', message: errorData.error });
        }
      } catch (error) {
        console.error('💥 Erro na redefinição:', error);
        setError('root', { type: 'server', message: 'Erro de conexão. Tente novamente.' });
      } finally {
        setIsPending(false);
      }
    },
    [token, router, setError]
  );

  if (success) {
    return (
      <Stack spacing={3} textAlign="center">
        <Alert severity="success">
          🎉 Senha redefinida com sucesso!
        </Alert>
        <Typography sx={{ color: '#ccc' }}>
          Redirecionando para a página de login...
        </Typography>
        <Button
          onClick={() => router.push('/auth/sign-in')}
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
          Ir para Login
        </Button>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <FormControl error={Boolean(errors.password)}>
              <InputLabel sx={{ color: '#ccc' }}>Nova Senha</InputLabel>
              <OutlinedInput
                {...field}
                endAdornment={
                  showPassword ? (
                    <EyeIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(false)}
                      style={{ color: '#ccc' }}
                    />
                  ) : (
                    <EyeSlashIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(true)}
                      style={{ color: '#ccc' }}
                    />
                  )
                }
                label="Nova Senha"
                type={showPassword ? 'text' : 'password'}
                sx={{
                  backgroundColor: '#111',
                  color: '#fff',
                  borderRadius: '30px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00FF00' },
                }}
              />
              {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
            </FormControl>
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormControl error={Boolean(errors.confirmPassword)}>
              <InputLabel sx={{ color: '#ccc' }}>Confirmar Senha</InputLabel>
              <OutlinedInput
                {...field}
                endAdornment={
                  showConfirmPassword ? (
                    <EyeIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowConfirmPassword(false)}
                      style={{ color: '#ccc' }}
                    />
                  ) : (
                    <EyeSlashIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowConfirmPassword(true)}
                      style={{ color: '#ccc' }}
                    />
                  )
                }
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                sx={{
                  backgroundColor: '#111',
                  color: '#fff',
                  borderRadius: '30px',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00FF00' },
                }}
              />
              {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
            </FormControl>
          )}
        />

        <Typography variant="caption" sx={{ color: '#ccc', textAlign: 'left' }}>
          A senha deve ter pelo menos 6 caracteres, incluindo letras e números.
        </Typography>

        {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

        <Button
          disabled={isPending}
          type="submit"
          sx={{
            backgroundColor: '#00FF00',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '30px',
            paddingY: 1.5,
            '&:hover': {
              backgroundColor: '#00e600',
            },
            '&:disabled': {
              backgroundColor: '#555',
              color: '#ccc',
            },
          }}
        >
          {isPending ? 'Redefinindo...' : 'Redefinir Senha'}
        </Button>
      </Stack>
    </form>
  );
}