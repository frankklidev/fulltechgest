// src/components/Header.tsx
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestion Fulltech
        </Typography>
        {isAuthenticated ? (
          <>
            <Box sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
              <Button color="inherit" onClick={() => navigate('/')}>
                <HomeIcon />
              </Button>
              <Button color="inherit" onClick={() => navigate('/products')}>
                Productos
              </Button>
              <Button color="inherit" onClick={() => navigate('/categories')}>
                Categorías
              </Button>
              <Button color="inherit" onClick={() => navigate('/subcategories')}>
                Subcategorías
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
                  <HomeIcon />
                  Home
                </MenuItem>
                <MenuItem onClick={() => handleNavigation('/products')}>Productos</MenuItem>
                <MenuItem onClick={() => handleNavigation('/categories')}>Categorías</MenuItem>
                <MenuItem onClick={() => handleNavigation('/subcategories')}>Subcategorías</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: 'red' }}>
                  <LogoutIcon />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
            <Button color="inherit" onClick={handleLogout} sx={{ display: { xs: 'none', md: 'block' } }}>
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Iniciar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
