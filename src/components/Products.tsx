import React, { useState, useEffect } from "react";
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
  Autocomplete,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { supabase } from "../supabaseClient";
import { Box as MuiBox } from "@mui/material";

import { copyLinksToClipboard } from "../utils/exportToExcel";

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
  isedited: boolean;
  isdeleted: boolean;
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
  const itemsPerPage = 30;
  const [filterNew, setFilterNew] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(true); // Estado para el indicador de carga
  const [editProductIsEdited, setEditProductIsEdited] =
    useState<boolean>(false);
  const [deletingImage, setDeletingImage] = useState<boolean>(false);
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    setHasPendingChanges(
      products.some(
        (product) => product.isdeleted || product.isedited || !product.link
      )
    );
  }, [products]);

  useEffect(() => {
    const filtered = subcategories.filter(
      (subcategory) => subcategory.category_id === selectedCategory
    );
    setFilteredSubcategories(filtered);
  }, [selectedCategory, subcategories]);

  const checkImageExists = async (fileName: string) => {
    const { data, error } = await supabase.storage
      .from("products")
      .list("public", {
        limit: 1,
        offset: 0,
        search: fileName,
      });

    if (error) {
      console.error("Error checking if image exists:", error);
      return false;
    }

    return data.length > 0;
  };

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
    setDataLoading(true);
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Error fetching products:", error);
    else setProducts(data || []);
    setDataLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from("products")
      .upload(`public/${file.name}`, file, {
        cacheControl: "3600",
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
      alert("Un producto con este nombre ya existe.");
      setLoading(false);
      return;
    }

    let imageUrl = "";
    if (productImage) {
      const imageExists = await checkImageExists(productImage.name);
      if (imageExists) {
        imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/public/${productImage.name}`;
      } else {
        const imagePath = await handleImageUpload(productImage);
        if (imagePath) {
          imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/${imagePath}`;
        }
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
          isedited: false,
          isdeleted: false,
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
      setEditProductIsEdited(false);
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    let imageUrl = "";
    let imagePath: string | null = null;
    const currentProduct = products.find(
      (product) => product.id === editProductId
    );

    if (editProductImage) {
      const imageExists = await checkImageExists(editProductImage.name);
      if (imageExists) {
        imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/public/${editProductImage.name}`;
      } else {
        if (currentProduct?.image_url) {
          const previousImagePath = currentProduct.image_url
            .split("/")
            .slice(4)
            .join("/");
          await handleImageDelete(previousImagePath);
        }
        imagePath = await handleImageUpload(editProductImage);
        if (imagePath) {
          imageUrl = `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/products/${imagePath}`;
        }
      }
    } else {
      imageUrl = currentProduct?.image_url || "";
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name: editProductName,
        description: editProductDescription,
        price: editProductPrice,
        link: editProductLink,
        category_id: editSelectedCategory,
        subcategory_id: editSelectedSubcategory,
        image_url: imageUrl,
        isedited: editProductIsEdited,
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

  const handleEditProduct = (product: Product) => {
    if (product.isdeleted) {
      return; // No permitir la edición si el producto está eliminado
    }
    setEditProductId(product.id);
    setEditProductName(product.name);
    setEditProductDescription(product.description);
    setEditProductPrice(product.price);
    setEditProductLink(product.link);
    setEditSelectedCategory(product.category_id);
    setEditSelectedSubcategory(product.subcategory_id);
    setEditProductImage(null); // Reset the image selection when editing a product
    setEditProductIsEdited(product.isedited || true); // Set the initial state of the checkbox
    setModalOpen(true);
  };

  const handleExport = () => {
    copyLinksToClipboard(products);
  };

  const resetEditState = () => {
    setEditProductId(null);
    setEditProductName("");
    setEditProductDescription("");
    setEditProductPrice(0);
    setEditProductLink("");
    setEditSelectedCategory(1);
    setEditSelectedSubcategory(1);
    setEditProductImage(null); // Resetea la imagen aquí
    setEditProductIsEdited(false);
    setModalOpen(false);
  };

  const handleDeleteProduct = async (id: number) => {
    setLoading(true);
    const productToDelete = products.find((product) => product.id === id);

    if (productToDelete) {
      // Actualiza el campo isdeleted en lugar de eliminar el producto
      const { error } = await supabase
        .from("products")
        .update({ isdeleted: !productToDelete.isdeleted }) // Alterna el estado de isdeleted
        .eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
      } else {
        // Actualiza el estado local de los productos
        setProducts(
          products.map((product) =>
            product.id === id
              ? { ...product, isdeleted: !product.isdeleted }
              : product
          )
        );
      }
    }

    setLoading(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
    setHasPendingChanges(
      products.some(
        (product) => product.isdeleted || product.isedited || !product.link
      )
    );
  };

  const filteredProducts = products.filter((product) => {
    const category = categories.find(
      (category) => category.id === product.category_id
    );
    const subcategory = subcategories.find(
      (subcategory) => subcategory.id === product.subcategory_id
    );

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toString().includes(searchTerm.toLowerCase()) ||
      product.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category &&
        category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subcategory &&
        subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterNew
      ? !product.link || product.isdeleted || product.isedited
      : true;

    return matchesSearch && matchesFilter && (!product.isdeleted || filterNew);
  });

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const transformProducts = (products: Product[]) => {
    return products.map((product) => ({
      label: product.name,
      id: product.id,
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(event.target.value);
  };

  const filterOptions = (
    options: { label: string; id: number }[],
    state: any
  ) => {
    return options.filter((option) =>
      option.label.toLowerCase().includes(state.inputValue.toLowerCase())
    );
  };

  return (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        flexGrow: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        paddingLeft: 0, // Eliminar padding izquierdo
        paddingRight: 0, // Eliminar padding derecho
      }}
    >
      <Backdrop open={loading} style={{ zIndex: 1500 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%", // Asegúrate de que ocupe el ancho completo
          paddingLeft: 2, // Opcional: Añadir un poco de padding
          paddingRight: 2, // Opcional: Añadir un poco de padding
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
            placeholder="Buscar productos..."
            sx={{
              width: "100%",
              maxWidth: 400,
              marginBottom: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
                "& fieldset": {
                  borderColor: "#1976d2",
                },
                "&:hover fieldset": {
                  borderColor: "#115293",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0d3a6a",
                },
              },
              "& .MuiInputLabel-outlined": {
                color: "#1976d2",
                fontWeight: "bold",
              },
              "& .MuiInputLabel-outlined.Mui-focused": {
                color: "#0d3a6a",
              },
              "& .MuiOutlinedInput-input": {
                padding: "10px 14px",
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={filterNew}
                onChange={() => setFilterNew(!filterNew)}
                sx={{
                  "& .MuiSwitch-switchBase": {
                    color: "green",
                    "&.Mui-checked": {
                      color: "darkgreen",
                    },
                    "&.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "darkgreen",
                    },
                  },
                  "& .MuiSwitch-track": {
                    backgroundColor: "lightgray",
                  },
                }}
              />
            }
            label="Filtrar modificaciones"
            sx={{
              "& .MuiFormControlLabel-label": {
                fontWeight: "bold",
                color: "darkgreen",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleExport}
            sx={{
              backgroundColor: hasPendingChanges ? "#B0BEC5" : "#1976d2", // Gris si hay cambios pendientes
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
              "&:hover": {
                backgroundColor: hasPendingChanges ? "#B0BEC5" : "#115293",
                boxShadow: "0 6px 10px 4px rgba(25, 118, 210, .3)",
              },
              "&:active": {
                backgroundColor: hasPendingChanges ? "#B0BEC5" : "#0d3a6a",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "0 0 0 4px rgba(25, 118, 210, .5)",
              },
            }}
            disabled={hasPendingChanges}
          >
            COPIAR ENLACES
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            sx={{
              width: "200px",
              marginLeft: 1,
              backgroundColor: "#1976d2",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
              borderRadius: "8px",
              boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
              "&:hover": {
                backgroundColor: "#115293",
                boxShadow: "0 6px 10px 4px rgba(25, 118, 210, .3)",
              },
              "&:active": {
                backgroundColor: "#0d3a6a",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "0 0 0 4px rgba(25, 118, 210, .5)",
              },
            }}
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
              <Autocomplete
                disablePortal
                freeSolo
                id="product-name-autocomplete"
                options={transformProducts(products)}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.label
                }
                filterOptions={filterOptions}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    required
                    fullWidth
                    id="productName"
                    label="Nombre del Producto"
                    name="productName"
                    autoComplete="off"
                    autoFocus
                    value={productName}
                    onChange={handleInputChange}
                  />
                )}
                onInputChange={(_event, value) => setProductName(value)}
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
                <Button
                  onClick={handleClose}
                  sx={{
                    backgroundColor: "red",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: "8px",
                    boxShadow: "0 3px 5px 2px rgba(255, 0, 0, .3)",
                    "&:hover": {
                      backgroundColor: "darkred",
                      boxShadow: "0 6px 10px 4px rgba(255, 0, 0, .3)",
                    },
                    "&:active": {
                      backgroundColor: "firebrick",
                    },
                    "&:focus": {
                      outline: "none",
                      boxShadow: "0 0 0 4px rgba(255, 0, 0, .5)",
                    },
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "none",
                    borderRadius: "8px",
                    boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
                    "&:hover": {
                      backgroundColor: "#115293",
                      boxShadow: "0 6px 10px 4px rgba(25, 118, 210, .3)",
                    },
                    "&:active": {
                      backgroundColor: "#0d3a6a",
                    },
                    "&:focus": {
                      outline: "none",
                      boxShadow: "0 0 0 4px rgba(25, 118, 210, .5)",
                    },
                  }}
                >
                  Agregar
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>
        {dataLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
<TableContainer
  component={Paper}
  sx={{ overflowX: "auto", width: "100%" }}
>
  <Table
    sx={{
      borderCollapse: "separate",
      borderSpacing: "0 10px",
      minWidth: 750,
      tableLayout: "fixed",
    }}
  >
    <TableHead>
      <TableRow>
        <TableCell
          sx={{
            padding: "4px",
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
          }}
        >
          Nombre
        </TableCell>
        <TableCell
          sx={{
            padding: "4px",
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            width:'15%'
          }}
        >
          Descripción
        </TableCell>
        <TableCell
          sx={{
            padding: "4px",
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            width:'5%'
          }}
        >
          Precio
        </TableCell>
        <TableCell
          sx={{
            padding: "4px",
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            width: "40%", // Ajusta el tamaño de la columna de Enlace
          }}
        >
          Enlace
        </TableCell>
        <TableCell
          sx={{
            padding: "4px",
            fontWeight: "bold",
            backgroundColor: "#f5f5f5",
            width:'5%'
          }}
        >
          Acciones
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {paginatedProducts.map((product) => (
        <TableRow
          key={product.id}
          sx={{
            backgroundColor: product.isdeleted
              ? "rgba(255, 0, 0, 0.7)"
              : !product.link
              ? "rgba(0, 128, 0, 0.7)"
              : product.isedited
              ? "rgba(255, 255, 0, 0.7)"
              : "inherit",
            height: "30px",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.05)",
            },
          }}
        >
          <TableCell
            sx={{ padding: "4px", width: "15%", lineHeight: "1" }}
          >
            {editProductId === product.id ? (
              <TextField
                fullWidth
                value={editProductName}
                onChange={(e) => setEditProductName(e.target.value)}
                margin="normal"
                disabled={product.isdeleted}
                sx={{ margin: 0 }}
              />
            ) : (
              product.name
            )}
          </TableCell>
          <TableCell
            sx={{ padding: "4px", width: "15%", lineHeight: "1" }}
          >
            {editProductId === product.id ? (
              <TextField
                fullWidth
                value={editProductDescription}
                onChange={(e) =>
                  setEditProductDescription(e.target.value)
                }
                margin="normal"
                disabled={product.isdeleted}
                sx={{ margin: 0 }}
              />
            ) : (
              product.description
            )}
          </TableCell>
          <TableCell
            sx={{ padding: "4px", width: "10%", lineHeight: "1" }}
          >
            {editProductId === product.id ? (
              <TextField
                fullWidth
                type="number"
                value={editProductPrice}
                onChange={(e) =>
                  setEditProductPrice(parseFloat(e.target.value))
                }
                margin="normal"
                disabled={product.isdeleted}
                sx={{ margin: 0 }}
              />
            ) : (
              product.price
            )}
          </TableCell>
          <TableCell
            sx={{
              padding: "4px",
              width: "40%", // Ajusta el tamaño de la columna de Enlace
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "1",
            }}
          >
            {editProductId === product.id ? (
              <TextField
                fullWidth
                value={editProductLink}
                onChange={(e) => setEditProductLink(e.target.value)}
                margin="normal"
                disabled={product.isdeleted}
                sx={{ margin: 0 }}
              />
            ) : (
              <Tooltip title={product.link}>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {product.link}
                </a>
              </Tooltip>
            )}
          </TableCell>
          <TableCell
            align="right"
            sx={{ padding: "4px", width: "5%", lineHeight: "1" }}
          >
            {editProductId === product.id ? (
              <>
                <IconButton
                  onClick={handleSaveEdit}
                  color="primary"
                  disabled={product.isdeleted}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={resetEditState}
                  color="secondary"
                  disabled={product.isdeleted}
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton
                  onClick={() => handleEditProduct(product)}
                  sx={{ color: "black" }}
                  disabled={product.isdeleted}
                >
                  <EditIcon />
                </IconButton>
                {product.isdeleted ? (
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleDeleteProduct(product.id)}
                      sx={{ mb: 1 }}
                    >
                      Restaurar Producto
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("products")
                          .delete()
                          .eq("id", product.id);
                        if (error) {
                          console.error(
                            "Error deleting product permanently:",
                            error
                          );
                        } else {
                          setProducts(
                            products.filter((p) => p.id !== product.id)
                          );
                        }
                      }}
                    >
                      Eliminar para siempre
                    </Button>
                  </Box>
                ) : (
                  <IconButton
                    onClick={() => handleDeleteProduct(product.id)}
                    sx={{ color: "black" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

        )}
        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            sx={{
              mr: 2,
              backgroundColor: "#1976d2",
              color: "white",
              '&:hover': {
                backgroundColor: "#115293",
              },
              '&:disabled': {
                backgroundColor: "#B0BEC5",
                color: "white",
              }
            }}
          >
            Ir al Principio
          </Button>
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
              disabled={deletingImage}
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
              disabled={deletingImage}
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
              disabled={deletingImage}
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
              disabled={deletingImage}
            />

            {editProductId !== null &&
            products.find((p) => p.id === editProductId)?.image_url ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    products.find((p) => p.id === editProductId)?.image_url ??
                    ""
                  }
                  alt={editProductName}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    marginBottom: "10px",
                  }}
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    setDeletingImage(true);
                    const productToUpdate = products.find(
                      (p) => p.id === editProductId
                    );
                    if (productToUpdate && productToUpdate.image_url) {
                      const previousImagePath = productToUpdate.image_url
                        .split("/")
                        .slice(4)
                        .join("/");
                      await handleImageDelete(previousImagePath);
                      const { data, error } = await supabase
                        .from("products")
                        .update({ image_url: null })
                        .eq("id", editProductId)
                        .select("*");

                      if (error) {
                        console.error(
                          "Error deleting image from product:",
                          error
                        );
                      } else {
                        setProducts(
                          products.map((product) =>
                            product.id === editProductId
                              ? { ...product, ...data[0] }
                              : product
                          )
                        );
                      }
                    }
                    setDeletingImage(false);
                  }}
                  sx={{ marginTop: 2 }}
                  disabled={deletingImage}
                >
                  {deletingImage ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Eliminar Imagen"
                  )}
                </Button>
              </Box>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditProductImage(e.target.files ? e.target.files[0] : null)
                }
                style={{ marginTop: 16 }}
                disabled={deletingImage}
              />
            )}

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
                disabled={deletingImage}
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
                disabled={deletingImage}
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
            {editProductId !== null &&
              products.find((p) => p.id === editProductId)?.isedited && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={editProductIsEdited}
                      onChange={(e) => setEditProductIsEdited(e.target.checked)}
                      disabled={deletingImage}
                    />
                  }
                  label="Editado"
                />
              )}

            {editProductId !== null &&
              products.find((p) => p.id === editProductId)?.isdeleted && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={
                        products.find((p) => p.id === editProductId)
                          ?.isdeleted || false
                      }
                      onChange={async (e) => {
                        const updatedProduct = products.find(
                          (p) => p.id === editProductId
                        );
                        if (updatedProduct) {
                          updatedProduct.isdeleted = e.target.checked;
                          const { error } = await supabase
                            .from("products")
                            .update({ isdeleted: e.target.checked })
                            .eq("id", editProductId);
                          if (error) {
                            console.error("Error updating product:", error);
                          } else {
                            setProducts(
                              products.map((p) =>
                                p.id === editProductId ? updatedProduct : p
                              )
                            );
                          }
                        }
                      }}
                      disabled={deletingImage}
                    />
                  }
                  label="Eliminado"
                />
              )}
          </Box>

          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveEdit}
              startIcon={<SaveIcon />}
              sx={{
                backgroundColor: "#1976d2",
                color: "white",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 3px 5px 2px rgba(25, 118, 210, .3)",
                "&:hover": {
                  backgroundColor: "#115293",
                  boxShadow: "0 6px 10px 4px rgba(25, 118, 210, .3)",
                },
                "&:active": {
                  backgroundColor: "#0d3a6a",
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "0 0 0 4px rgba(25, 118, 210, .5)",
                },
              }}
              disabled={deletingImage}
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={resetEditState}
              startIcon={<CancelIcon />}
              sx={{
                backgroundColor: "red",
                color: "white",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: "8px",
                boxShadow: "0 3px 5px 2px rgba(255, 0, 0, .3)",
                "&:hover": {
                  backgroundColor: "darkred",
                  boxShadow: "0 6px 10px 4px rgba(255, 0, 0, .3)",
                },
                "&:active": {
                  backgroundColor: "firebrick",
                },
                "&:focus": {
                  outline: "none",
                  boxShadow: "0 0 0 4px rgba(255, 0, 0, .5)",
                },
              }}
              disabled={deletingImage}
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
