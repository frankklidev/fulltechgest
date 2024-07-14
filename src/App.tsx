// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Categories from './components/Categories';
import Subcategories from './components/Subcategories';
import Products from './components/Products';
import HomePage from './components/HomePage';
import SpecialOffers from './components/SpecialOffers';

import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import { AuthProvider } from './components/context/AuthContext';
import { Box } from '@mui/material';
import Testimonials from './components/Testimonial';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute>
                  <Categories />
                </PrivateRoute>
              }
            />
            <Route
              path="/subcategories"
              element={
                <PrivateRoute>
                  <Subcategories />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <Products />
                </PrivateRoute>
              }
            />
            <Route
              path="/special-offers"
              element={
                <PrivateRoute>
                  <SpecialOffers />
                </PrivateRoute>
              }
            />
            <Route
              path="/testimonials"
              element={
                <PrivateRoute>
                  <Testimonials />
                </PrivateRoute>
              }
            />
            {/* Otras rutas pueden ir aquí */}
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
  );
};

export default App;
