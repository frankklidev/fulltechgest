import React, { useContext } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { useBoolean } from '../hooks/use-boolean.js';
import Iconify from '../components/iconify';
import FormProvider, { RHFTextField } from '../components/hook-form';

const Login: React.FC = () => {
  const passwordShow = useBoolean(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const LoginSchema = Yup.object().shape({
    usuario: Yup.string().required('Usuario es requerido'),
    contraseña: Yup.string()
      .required('Contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  });

  const defaultValues = {
    usuario: '',
    contraseña: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (login(data.usuario, data.contraseña)) {
        navigate('/');
      } else {
        console.error('Credenciales incorrectas');
      }
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  const renderHead = (
    <div>
      <Typography variant="h3" paragraph>
        Iniciar sesión
      </Typography>
    </div>
  );

  const renderForm = (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack spacing={2.5} alignItems="flex-end">
        <RHFTextField name="usuario" label="Usuario" />

        <RHFTextField
          name="contraseña"
          label="Contraseña"
          type={passwordShow.value ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={passwordShow.onToggle} edge="end">
                  <Iconify icon={passwordShow.value ? 'carbon:view' : 'carbon:view-off'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <LoadingButton
          fullWidth
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Iniciar sesión
        </LoadingButton>
      </Stack>
    </FormProvider>
  );

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2, // Ajuste para redondear los bordes
          }}
        >
          {renderHead}
          {renderForm}
          <Divider sx={{ width: '100%', mt: 3, mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              Fulltech
            </Typography>
          </Divider>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
