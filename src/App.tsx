// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Categories from './components/Categories';
import Subcategories from './components/Subcategories';
import Products from './components/Products';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/subcategories" element={<Subcategories />} />
        <Route path="/products" element={<Products />} />
        {/* Otras rutas pueden ir aquí */}
      </Routes>
    </Router>
  );
};

export default App;
