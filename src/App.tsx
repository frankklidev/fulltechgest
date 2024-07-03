import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Categories from './components/Categories';
import Subcategories from './components/Subcategories';
import Products from './components/Products';
import Header from './components/Header';
import HomePage from './components/HomePage';
import { Box } from '@mui/material';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Box sx={{ mt: 10 }}> {/* Ajusta el margen superior */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/subcategories" element={<Subcategories />} />
          <Route path="/products" element={<Products />} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App;
