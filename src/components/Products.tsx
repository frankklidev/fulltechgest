import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, Backdrop } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { supabase } from '../supabaseClient';

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  link: string;
  category_id: number;
  subcategory_id: number;
  image_url?: string;
}

const Products: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productLink, setProductLink] = useState<string>('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(1);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProductName, setEditProductName] = useState<string>('');
  const [editProductDescription, setEditProductDescription] = useState<string>('');
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductLink, setEditProductLink] = useState<string>('');
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState<number>(1);
  const [editSelectedSubcategory, setEditSelectedSubcategory] = useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = subcategories.filter((subcategory) => subcategory.category_id === selectedCategory);
    setFilteredSubcategories(filtered);
  }, [selectedCategory, subcategories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetching categories:', error);
    else setCategories(data || []);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase.from('subcategories').select('*');
    if (error) console.error('Error fetching subcategories:', error);
    else setSubcategories(data || []);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  const handleImageUpload = async (file: File) => {
    const { data, error } = await supabase.storage.from('products').upload(`public/${file.name}`, file);
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    return data.path;
  };

  const handleImageDelete = async (imagePath: string) => {
    const { error } = await supabase.storage.from('products').remove([imagePath]);
    if (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (productImage) {
      const imagePath = await handleImageUpload(productImage);
      imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/${imagePath}`;
    }
    const { data, error } = await supabase.from('products').insert([
      {
        name: productName,
        description: productDescription,
        price: productPrice,
        link: productLink,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory,
        image_url: imageUrl,
      },
    ]).select('*');
    if (error) {
      console.error('Error adding product:', error);
      alert('Error adding product: ' + error.message);
    } else if (data && data.length > 0) {
      setProducts([...products, data[0]]);
      setProductName('');
      setProductDescription('');
      setProductPrice(0);
      setProductLink('');
      setSelectedCategory(1);
      setSelectedSubcategory(1);
      setProductImage(null);
      setOpen(false);
    }
    setLoading(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.id);
    setEditProductName(product.name);
    setEditProductDescription(product.description);
    setEditProductPrice(product.price);
    setEditProductLink(product.link);
    setEditSelectedCategory(product.category_id);
    setEditSelectedSubcategory(product.subcategory_id);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    let imageUrl = '';
    let imagePath: string | null = '';
    const currentProduct = products.find(product => product.id === editProductId);

    if (editProductImage) {
      // Eliminar la imagen anterior si existe
      if (currentProduct?.image_url) {
        const previousImagePath = currentProduct.image_url.split('/').slice(4).join('/');
        await handleImageDelete(previousImagePath);
      }
      // Subir la nueva imagen
      imagePath = await handleImageUpload(editProductImage);
      imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/${imagePath}`;
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: editProductName,
        description: editProductDescription,
        price: editProductPrice,
        link: editProductLink,
        category_id: editSelectedCategory,
        subcategory_id: editSelectedSubcategory,
        image_url: imageUrl || currentProduct?.image_url || '', // Asegurarse de que sea una cadena vacía si es null
      })
      .eq('id', editProductId)
      .select(); // Asegura que los datos retornados sean seleccionados

    if (error) {
      console.error('Error updating product:', error);
    } else if (data && data.length > 0) {
      setProducts(products.map((product) => (product.id === editProductId ? { ...product, ...data[0] } : product)));
      setEditProductId(null);
      setEditProductName('');
      setEditProductDescription('');
      setEditProductPrice(0);
      setEditProductLink('');
      setEditSelectedCategory(1);
      setEditSelectedSubcategory(1);
      setEditProductImage(null);
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id: number) => {
    setLoading(true);
    const productToDelete = products.find(product => product.id === id);
    if (productToDelete?.image_url) {
      const imagePath = productToDelete.image_url.split('/').slice(4).join('/');
      await handleImageDelete(imagePath);
    }
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) console.error('Error deleting product:', error);
    else setProducts(products.filter((product) => product.id !== id));
    setLoading(false);
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.price.toString().includes(searchTerm.toLowerCase()) ||
    product.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categories.find((category) => category.id === product.category_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subcategories.find((subcategory) => subcategory.id === product.subcategory_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container component="main" maxWidth="lg">
      <Backdrop open={loading} style={{ zIndex: 1000 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
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
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProductImage(e.target.files ? e.target.files[0] : null)}
                style={{ marginTop: 16 }}
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
                  {filteredSubcategories.map((subcategory) => (
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
                <TableCell>Imagen</TableCell>
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
                      categories.find((category) => category.id === product.category_id)?.name
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
                            .filter((subcategory) => subcategory.category_id === editSelectedCategory)
                            .map((subcategory) => (
                              <MenuItem key={subcategory.id} value={subcategory.id}>
                                {subcategory.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : (
                      subcategories.find((subcategory) => subcategory.id === product.subcategory_id)?.name
                    )}
                  </TableCell>
                  <TableCell>
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
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
