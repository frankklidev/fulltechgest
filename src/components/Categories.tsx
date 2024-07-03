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
    const { error } = await supabase
      .from('categories')
      .insert([{ name: categoryName }])
      .single();
    if (error) {
      console.error(error);
    } else {
      setCategoryName('');
      fetchCategories();
    }
    setLoading(false);
  };

  const handleEditCategory = (id: number, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
    setEditOpen(true); // Abrir el modal de edición
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
      setEditOpen(false); // Cerrar el modal de edición
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
    <Container component="main" maxWidth="md">
      <Backdrop open={loading} style={{ zIndex: 1400 }}>
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
        <Typography component="h1" variant="h5">
          Categorías
        </Typography>
        <Box component="form" onSubmit={handleAddCategory} noValidate sx={{ mt: 3 }}>
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
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Agregar Categoría'}
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Nombre de la Categoría</TableCell>
                <TableCell align="right">Acciones</TableCell>
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

      {/* Modal de edición */}
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
            />
            <DialogActions>
              <Button onClick={handleEditClose} color="secondary">
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
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
