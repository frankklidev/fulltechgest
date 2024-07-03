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
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Categorías
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las categorías de productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/categories')}>
                Ir a Categorías
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Subcategorías
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona las subcategorías de productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/subcategories')}>
                Ir a Subcategorías
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                Productos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona los productos.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleNavigate('/products')}>
                Ir a Productos
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
