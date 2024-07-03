// src/components/Header.tsx
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';


const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Gestion Fulltech
        </Typography>
        <IconButton color="inherit" onClick={() => navigate('/')}>
          <HomeIcon />
        </IconButton>
        {isAuthenticated && (
          <Button color="inherit" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
