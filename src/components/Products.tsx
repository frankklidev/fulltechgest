// src/components/Products.tsx
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  link: string;
  categoryId: number;
  subcategoryId: number;
}

const Products: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Categoría 1' },
    { id: 2, name: 'Categoría 2' }
  ]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([
    { id: 1, name: 'Subcategoría 1', categoryId: 1 },
    { id: 2, name: 'Subcategoría 2', categoryId: 2 }
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productLink, setProductLink] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(1);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProductName, setEditProductName] = useState<string>('');
  const [editProductDescription, setEditProductDescription] = useState<string>('');
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductLink, setEditProductLink] = useState<string>('');
  const [editSelectedCategory, setEditSelectedCategory] = useState<number>(1);
  const [editSelectedSubcategory, setEditSelectedSubcategory] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddProduct = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newProduct: Product = {
      id: products.length + 1,
      name: productName,
      description: productDescription,
      price: productPrice,
      link: productLink,
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory
    };
    setProducts([...products, newProduct]);
    setProductName('');
    setProductDescription('');
    setProductPrice(0);
    setProductLink('');
    setSelectedCategory(1);
    setSelectedSubcategory(1);
    setOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.id);
    setEditProductName(product.name);
    setEditProductDescription(product.description);
    setEditProductPrice(product.price);
    setEditProductLink(product.link);
    setEditSelectedCategory(product.categoryId);
    setEditSelectedSubcategory(product.subcategoryId);
  };

  const handleSaveEdit = () => {
    setProducts(products.map(product => product.id === editProductId ? {
      ...product,
      name: editProductName,
      description: editProductDescription,
      price: editProductPrice,
      link: editProductLink,
      categoryId: editSelectedCategory,
      subcategoryId: editSelectedSubcategory
    } : product));
    setEditProductId(null);
    setEditProductName('');
    setEditProductDescription('');
    setEditProductPrice(0);
    setEditProductLink('');
    setEditSelectedCategory(1);
    setEditSelectedSubcategory(1);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.price.toString().includes(searchTerm.toLowerCase()) ||
    product.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categories.find(category => category.id === product.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategories.find(subcategory => subcategory.id === product.subcategoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container component="main" maxWidth="lg">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Agregar Producto
          </Button>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Agregar Producto</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddProduct} noValidate sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="productName"
                label="Nombre del Producto"
                name="productName"
                autoComplete="off"
                autoFocus
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="productDescription"
                label="Descripción"
                name="productDescription"
                autoComplete="off"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="number"
                id="productPrice"
                label="Precio"
                name="productPrice"
                autoComplete="off"
                value={productPrice}
                onChange={(e) => setProductPrice(parseFloat(e.target.value))}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="productLink"
                label="Enlace"
                name="productLink"
                autoComplete="off"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="select-category-label">Categoría</InputLabel>
                <Select
                  labelId="select-category-label"
                  id="select-category"
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) => setSelectedCategory(e.target.value as number)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="select-subcategory-label">Subcategoría</InputLabel>
                <Select
                  labelId="select-subcategory-label"
                  id="select-subcategory"
                  value={selectedSubcategory}
                  label="Subcategoría"
                  onChange={(e) => setSelectedSubcategory(e.target.value as number)}
                >
                  {subcategories
                    .filter((subcategory) => subcategory.categoryId === selectedCategory)
                    .map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <DialogActions>
                <Button onClick={handleClose} color="secondary">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Agregar
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Enlace</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Subcategoría</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {editProductId === product.id ? (
                      <TextField
                        fullWidth
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        margin="normal"
                      />
                    ) : (
                      product.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <TextField
                        fullWidth
                        value={editProductDescription}
                        onChange={(e) => setEditProductDescription(e.target.value)}
                        margin="normal"
                      />
                    ) : (
                      product.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <TextField
                        fullWidth
                        type="number"
                        value={editProductPrice}
                        onChange={(e) => setEditProductPrice(parseFloat(e.target.value))}
                        margin="normal"
                      />
                    ) : (
                      product.price
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <TextField
                        fullWidth
                        value={editProductLink}
                        onChange={(e) => setEditProductLink(e.target.value)}
                        margin="normal"
                      />
                    ) : (
                      <a href={product.link} target="_blank" rel="noopener noreferrer">{product.link}</a>
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="edit-select-category-label">Categoría</InputLabel>
                        <Select
                          labelId="edit-select-category-label"
                          id="edit-select-category"
                          value={editSelectedCategory}
                          label="Categoría"
                          onChange={(e) => setEditSelectedCategory(e.target.value as number)}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      categories.find(category => category.id === product.categoryId)?.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="edit-select-subcategory-label">Subcategoría</InputLabel>
                        <Select
                          labelId="edit-select-subcategory-label"
                          id="edit-select-subcategory"
                          value={editSelectedSubcategory}
                          label="Subcategoría"
                          onChange={(e) => setEditSelectedSubcategory(e.target.value as number)}
                        >
                          {subcategories
                            .filter((subcategory) => subcategory.categoryId === editSelectedCategory)
                            .map((subcategory) => (
                              <MenuItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : (
                      subcategories.find(subcategory => subcategory.id === product.subcategoryId)?.name
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editProductId === product.id ? (
                      <>
                        <IconButton onClick={handleSaveEdit} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={() => setEditProductId(null)} color="secondary">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditProduct(product)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteProduct(product.id)} sx={{ color: 'red' }}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Products;
