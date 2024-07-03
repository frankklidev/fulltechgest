// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Categories from './components/Categories';
import Subcategories from './components/Subcategories';
import Products from './components/Products';
import HomePage from './components/HomePage';

import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import { AuthProvider } from './components/context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
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
          {/* Otras rutas pueden ir aquí */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
