import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress, Backdrop, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';

interface Category {
  id: number;
  name: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [editOpen, setEditOpen] = useState<boolean>(false); // Estado para el modal de edición
  const [validationError, setValidationError] = useState<string>(''); // Estado para el error de validación

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error(error);
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const categoryExists = categories.some(
      (category) => category.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (categoryExists) {
      setValidationError('Una categoría con este nombre ya existe.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .insert([{ name: categoryName }])
      .single();
    if (error) {
      console.error(error);
    } else {
      setCategoryName('');
      setValidationError('');
      fetchCategories();
    }
    setLoading(false);
  };

  const handleEditCategory = (id: number, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .update({ name: editCategoryName })
      .eq('id', editCategoryId);
    if (error) {
      console.error(error);
    } else {
      setEditCategoryId(null);
      setEditCategoryName('');
      fetchCategories();
      setEditOpen(false);
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id: number) => {
    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) {
      console.error(error);
    } else {
      fetchCategories();
    }
    setLoading(false);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ mt: 4 }}>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography component="h1" variant="h5">
          Categorías
        </Typography>
        <Box component="form" onSubmit={handleAddCategory} noValidate sx={{ mt: 3, width: '100%' }}>
        <TextField
  margin="normal"
  required
  fullWidth
  id="categoryName"
  label="Nombre de la Categoría"
  name="categoryName"
  autoComplete="off"
  autoFocus
  value={categoryName}
  onChange={(e) => setCategoryName(e.target.value)}
  error={!!validationError}
  helperText={validationError}
  sx={{
    mb: 2,
    '& .MuiInputBase-root': {
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#115293',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0d3a6a',
    },
    '& .MuiInputLabel-root': {
      color: '#1976d2',
    },
    '&:hover .MuiInputLabel-root': {
      color: '#115293',
    },
    '&.Mui-focused .MuiInputLabel-root': {
      color: '#0d3a6a',
    },
    '& .MuiInputBase-input': {
      color: '#0d3a6a',
    },
    '& .MuiFormHelperText-root': {
      color: 'red',
    },
  }}
/>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                width: "200px",
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Agregar Categoría'}
            </Button>
          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ overflowX: 'auto', mt: 4 }}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre de la Categoría</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.name}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEditCategory(category.id, category.name)} color="primary" disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCategory(category.id)} sx={{ color: 'red' }} disabled={loading}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[4, 8, 12]}
            component="div"
            count={categories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Categoría</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} noValidate sx={{ mt: 3 }}>
          <TextField
  margin="normal"
  required
  fullWidth
  id="editCategoryName"
  label="Nombre de la Categoría"
  name="editCategoryName"
  autoComplete="off"
  value={editCategoryName}
  onChange={(e) => setEditCategoryName(e.target.value)}
  sx={{
    mb: 2,
    '& .MuiInputBase-root': {
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#115293',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0d3a6a',
    },
    '& .MuiInputLabel-root': {
      color: '#1976d2',
    },
    '&:hover .MuiInputLabel-root': {
      color: '#115293',
    },
    '&.Mui-focused .MuiInputLabel-root': {
      color: '#0d3a6a',
    },
    '& .MuiInputBase-input': {
      color: '#0d3a6a',
    },
  }}
/>

            <DialogActions>
              <Button
                onClick={handleEditClose}
                sx={{
                  color: 'white',
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                  '&:active': {
                    backgroundColor: 'secondary.darker',
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  color: 'white',
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&:active': {
                    backgroundColor: 'primary.darker',
                  },
                }}
              >
                Guardar
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Categories;
