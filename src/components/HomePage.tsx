import React from 'react';
import { Container, Grid, Card, CardContent, CardActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ marginTop: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                Categorías
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las categorías de productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleNavigate('/categories')}
                sx={{ marginLeft: 'auto' }}
              >
                Ir a Categorías
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                Subcategorías
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las subcategorías de productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleNavigate('/subcategories')}
                sx={{ marginLeft: 'auto' }}
              >
                Ir a Subcategorías
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                Productos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona los productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleNavigate('/products')}
                sx={{ marginLeft: 'auto' }}
              >
                Ir a Productos
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                Ofertas Especiales
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las ofertas especiales.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleNavigate('/special-offers')}
                sx={{ marginLeft: 'auto' }}
              >
                Ir a Ofertas Especiales
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
