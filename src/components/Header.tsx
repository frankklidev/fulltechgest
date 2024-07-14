import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Gestion Fulltech
        </Typography>
        {isAuthenticated ? (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                sx={{ marginRight: 2, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/products')}
                sx={{ marginRight: 2, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Productos
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/categories')}
                sx={{ marginRight: 2, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Categorías
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/subcategories')}
                sx={{ marginRight: 2, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Subcategorías
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/special-offers')}
                sx={{ marginRight: 2, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Ofertas Especiales
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate('/testimonials')}
                sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                Testimonios
              </Button>
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' }, ml: 'auto' }}>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleNavigation('/')}>
                  <HomeIcon sx={{ marginRight: 1 }} />
                  Home
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/products')}>Productos</MenuItem>
                <MenuItem onClick={() => handleNavigation('/categories')}>Categorías</MenuItem>
                <MenuItem onClick={() => handleNavigation('/subcategories')}>Subcategorías</MenuItem>
                <MenuItem onClick={() => handleNavigation('/special-offers')}>Ofertas Especiales</MenuItem>
                <MenuItem onClick={() => handleNavigation('/testimonials')}>Testimonios</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                  <LogoutIcon sx={{ marginRight: 1 }} />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ display: { xs: 'none', md: 'flex' }, fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
            >
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 'bold', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
          >
            Iniciar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
