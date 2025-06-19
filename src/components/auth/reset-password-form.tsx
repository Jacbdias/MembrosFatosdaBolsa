'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  email: zod.string().min(1, { message: 'Email é obrigatório' }).email('Email deve ser válido'),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
  const router = useRouter();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setIsPending(false);
      // Você pode adicionar uma mensagem de sucesso aqui
    },
    [setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ color: '#fff', textAlign: 'center' }}>
          Redefinir senha
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ color: '#ccc', textAlign: 'center' }}>
          Digite seu email para receber o link de recuperação
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel sx={{ color: '#ccc' }}>E-mail</InputLabel>
                <OutlinedInput
                  {...field}
                  label="E-mail"
                  type="email"
                  sx={{
                    backgroundColor: '#111',
                    color: '#fff',
                    borderRadius: '30px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                  }}
                />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
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
            }}
          >
            Enviar link de recuperação
          </Button>
        </Stack>
      </form>
      <Link 
        component={RouterLink} 
        href={paths.auth.signIn} 
        sx={{ 
          color: '#00FF00',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          }
        }}
      >
        <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
        Voltar para login
      </Link>
    </Stack>
  );
}
