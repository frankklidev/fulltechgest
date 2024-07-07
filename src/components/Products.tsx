import React, { useState, useEffect} from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Backdrop,
  Modal,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { supabase } from "../supabaseClient";
import { Box as MuiBox } from "@mui/material";
import { exportToExcel } from "../utils/exportToExcel";

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
  const [filteredSubcategories, setFilteredSubcategories] = useState<
    Subcategory[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(0);
  const [productLink, setProductLink] = useState<string>("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(1);
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [editProductName, setEditProductName] = useState<string>("");
  const [editProductDescription, setEditProductDescription] =
    useState<string>("");
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editProductLink, setEditProductLink] = useState<string>("");
  const [editProductImage, setEditProductImage] = useState<File | null>(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState<number>(1);
  const [editSelectedSubcategory, setEditSelectedSubcategory] =
    useState<number>(1);
  const [open, setOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const [filterNew, setFilterNew] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = subcategories.filter(
      (subcategory) => subcategory.category_id === selectedCategory
    );
    setFilteredSubcategories(filtered);
  }, [selectedCategory, subcategories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data || []);
  };

  const fetchSubcategories = async () => {
    const { data, error } = await supabase.from("subcategories").select("*");
    if (error) console.error("Error fetching subcategories:", error);
    else setSubcategories(data || []);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
  };

  const handleImageUpload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from("products")
      .upload(`public/${file.name}`, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }
    return data.path;
  };
  

  const handleImageDelete = async (imagePath: string) => {
    const { error } = await supabase.storage
      .from("products")
      .remove([imagePath]);
    if (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
  
    // Validación para comprobar si el nombre del producto ya existe
    const productExists = products.some(
      (product) => product.name.toLowerCase() === productName.toLowerCase()
    );
  
    if (productExists) {
      alert('Un producto con este nombre ya existe.');
      setLoading(false);
      return;
    }
  
    let imageUrl = "";
    if (productImage) {
      const imagePath = await handleImageUpload(productImage);
      if (imagePath) {
        imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/${imagePath}`;
      }
    }
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: productName,
          description: productDescription,
          price: productPrice,
          link: productLink,
          category_id: selectedCategory,
          subcategory_id: selectedSubcategory,
          image_url: imageUrl,
        },
      ])
      .select("*");
    if (error) {
      console.error("Error adding product:", error);
      alert("Error adding product: " + error.message);
    } else if (data && data.length > 0) {
      setProducts([...products, data[0]]);
      setProductName("");
      setProductDescription("");
      setProductPrice(0);
      setProductLink("");
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
    setEditProductImage(null); // Reset the image selection when editing a product
    setModalOpen(true);
  };

  const handleExport = () => {
    exportToExcel(products);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    let imageUrl = "";
    let imagePath: string | null = null;
    const currentProduct = products.find(
      (product) => product.id === editProductId
    );
  
    if (editProductImage) {
      // Eliminar la imagen anterior si existe
      if (currentProduct?.image_url) {
        const previousImagePath = currentProduct.image_url
          .split("/")
          .slice(4)
          .join("/");
        await handleImageDelete(previousImagePath);
      }
      // Subir la nueva imagen
      imagePath = await handleImageUpload(editProductImage);
      if (imagePath) {
        imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/${imagePath}`;
      }
    } else {
      // Mantener la URL de la imagen actual si no se proporciona una nueva
      imageUrl = currentProduct?.image_url || "";
    }
  
    // Asegura que los datos retornados sean seleccionados
    const { data, error } = await supabase
      .from("products")
      .update({
        name: editProductName,
        description: editProductDescription,
        price: editProductPrice,
        link: editProductLink,
        category_id: editSelectedCategory,
        subcategory_id: editSelectedSubcategory,
        image_url: imageUrl, // Mantener la URL de la imagen actual o la nueva si se subió una
      })
      .eq("id", editProductId)
      .select("*");
  
    if (error) {
      console.error("Error updating product:", error);
    } else if (data && data.length > 0) {
      setProducts(
        products.map((product) =>
          product.id === editProductId ? { ...product, ...data[0] } : product
        )
      );
      resetEditState();
      setModalOpen(false);
    }
    setLoading(false);
  };
  

  const resetEditState = () => {
    setEditProductId(null);
    setEditProductName("");
    setEditProductDescription("");
    setEditProductPrice(0);
    setEditProductLink("");
    setEditSelectedCategory(1);
    setEditSelectedSubcategory(1);
    setEditProductImage(null);
    setModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    setLoading(true);
    const productToDelete = products.find((product) => product.id === id);
    if (productToDelete?.image_url) {
      const imagePath = productToDelete.image_url.split("/").slice(4).join("/");
      await handleImageDelete(imagePath);
    }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) console.error("Error deleting product:", error);
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

  const filteredProducts = products.filter((product) => {
    const category = categories.find((category) => category.id === product.category_id);
    const subcategory = subcategories.find((subcategory) => subcategory.id === product.subcategory_id);
    
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm.toLowerCase()) ||
      product.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category && category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subcategory && subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterNew ? !product.link : true;
    return matchesSearch && matchesFilter;
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <Container component="main" maxWidth="lg">
      <Backdrop open={loading} style={{ zIndex: 1500 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <TextField
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={filterNew}
                onChange={() => setFilterNew(!filterNew)}
              />
            }
            label="Filtrar nuevos productos"
          />

          <Button
            variant="contained"
            onClick={handleExport}
            sx={{
              marginLeft: 1,
              color: "white",
              backgroundColor: "green",
              "&:hover": {
                backgroundColor: "darkgreen", // Color cuando el botón está en hover
              },
              "&:active": {
                backgroundColor: "darkgreen", // Color cuando el botón está activo
              },
              "&:focus": {
                backgroundColor: "darkgreen", // Color cuando el botón está en foco
              },
            }}
          >
            Exportar a Excel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            sx={{ width: "200px", marginLeft: 1 }}
          >
            Agregar Producto
          </Button>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Agregar Producto</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              onSubmit={handleAddProduct}
              noValidate
              sx={{ mt: 3 }}
            >
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
                onChange={(e) =>
                  setProductImage(e.target.files ? e.target.files[0] : null)
                }
                style={{ marginTop: 16 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="select-category-label">Categoría</InputLabel>
                <Select
                  labelId="select-category-label"
                  id="select-category"
                  value={selectedCategory}
                  label="Categoría"
                  onChange={(e) =>
                    setSelectedCategory(e.target.value as number)
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="select-subcategory-label">
                  Subcategoría
                </InputLabel>
                <Select
                  labelId="select-subcategory-label"
                  id="select-subcategory"
                  value={selectedSubcategory}
                  label="Subcategoría"
                  onChange={(e) =>
                    setSelectedSubcategory(e.target.value as number)
                  }
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
        <TableContainer
          component={Paper}
          sx={{ overflowX: "auto", width: "100%" }}
        >
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
              {paginatedProducts.map((product) => (
                <TableRow
                  key={product.id}
                  sx={{ backgroundColor: product.link ? "inherit" : "green" }}
                >
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
                        onChange={(e) =>
                          setEditProductDescription(e.target.value)
                        }
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
                        onChange={(e) =>
                          setEditProductPrice(parseFloat(e.target.value))
                        }
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
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {product.link}
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="edit-select-category-label">
                          Categoría
                        </InputLabel>
                        <Select
                          labelId="edit-select-category-label"
                          id="edit-select-category"
                          value={editSelectedCategory}
                          label="Categoría"
                          onChange={(e) =>
                            setEditSelectedCategory(e.target.value as number)
                          }
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      categories.find(
                        (category) => category.id === product.category_id
                      )?.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editProductId === product.id ? (
                      <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="edit-select-subcategory-label">
                          Subcategoría
                        </InputLabel>
                        <Select
                          labelId="edit-select-subcategory-label"
                          id="edit-select-subcategory"
                          value={editSelectedSubcategory}
                          label="Subcategoría"
                          onChange={(e) =>
                            setEditSelectedSubcategory(e.target.value as number)
                          }
                        >
                          {subcategories
                            .filter(
                              (subcategory) =>
                                subcategory.category_id === editSelectedCategory
                            )
                            .map((subcategory) => (
                              <MenuItem
                                key={subcategory.id}
                                value={subcategory.id}
                              >
                                {subcategory.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    ) : (
                      subcategories.find(
                        (subcategory) =>
                          subcategory.id === product.subcategory_id
                      )?.name
                    )}
                  </TableCell>
                  <TableCell>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {editProductId === product.id && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditProductImage(
                            e.target.files ? e.target.files[0] : null
                          )
                        }
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {editProductId === product.id ? (
                      <>
                        <IconButton onClick={handleSaveEdit} color="primary">
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={resetEditState} color="secondary">
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton
                          onClick={() => handleEditProduct(product)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteProduct(product.id)}
                          sx={{ color: "red" }}
                        >
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
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Box sx={{ mx: 2, display: "flex", alignItems: "center" }}>
              Página {currentPage} de {totalPages}
            </Box>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
            
          </Box>
        )}
      </Box>
      <Modal
        open={modalOpen}
        onClose={resetEditState}
        aria-labelledby="edit-product-modal-title"
        aria-describedby="edit-product-modal-description"
      >
        <MuiBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <h2 id="edit-product-modal-title">Editar Producto</h2>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="editProductName"
              label="Nombre del Producto"
              name="editProductName"
              autoComplete="off"
              autoFocus
              value={editProductName}
              onChange={(e) => setEditProductName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="editProductDescription"
              label="Descripción"
              name="editProductDescription"
              autoComplete="off"
              value={editProductDescription}
              onChange={(e) => setEditProductDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              type="number"
              id="editProductPrice"
              label="Precio"
              name="editProductPrice"
              autoComplete="off"
              value={editProductPrice}
              onChange={(e) => setEditProductPrice(parseFloat(e.target.value))}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="editProductLink"
              label="Enlace"
              name="editProductLink"
              autoComplete="off"
              value={editProductLink}
              onChange={(e) => setEditProductLink(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditProductImage(e.target.files ? e.target.files[0] : null)
              }
              style={{ marginTop: 16 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="edit-select-category-label">Categoría</InputLabel>
              <Select
                labelId="edit-select-category-label"
                id="edit-select-category"
                value={editSelectedCategory}
                label="Categoría"
                onChange={(e) =>
                  setEditSelectedCategory(e.target.value as number)
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="edit-select-subcategory-label">
                Subcategoría
              </InputLabel>
              <Select
                labelId="edit-select-subcategory-label"
                id="edit-select-subcategory"
                value={editSelectedSubcategory}
                label="Subcategoría"
                onChange={(e) =>
                  setEditSelectedSubcategory(e.target.value as number)
                }
              >
                {subcategories
                  .filter(
                    (subcategory) =>
                      subcategory.category_id === editSelectedCategory
                  )
                  .map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
              startIcon={<SaveIcon />}
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={resetEditState}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
          </DialogActions>
        </MuiBox>
      </Modal>
    </Container>
  );
};

export default Products;
