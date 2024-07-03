// src/components/Subcategories.tsx
import React, { useState, useEffect } from 'react';
import { Container, Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, InputLabel, FormControl, CircularProgress, Backdrop, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
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

const Subcategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryName, setSubcategoryName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number>(1);
  const [editSubcategoryId, setEditSubcategoryId] = useState<number | null>(null);
  const [editSubcategoryName, setEditSubcategoryName] = useState<string>('');
  const [editSelectedCategory, setEditSelectedCategory] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    if (error) console.error('Error fetching categories:', error);
    else setCategories(data || []);
    setLoading(false);
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from('subcategories')
      .select('*');
    if (error) console.error('Error fetching subcategories:', error);
    else setSubcategories(data || []);
    setLoading(false);
  };

  const handleAddSubcategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('subcategories')
      .insert([{ name: subcategoryName, category_id: selectedCategory }])
      .single();
    if (error) {
      console.error('Error adding subcategory:', error);
    } else {
      setSubcategoryName('');
      fetchSubcategories();
      setOpen(false);
    }
    setLoading(false);
  };

  const handleEditSubcategory = (id: number, name: string, categoryId: number) => {
    setEditSubcategoryId(id);
    setEditSubcategoryName(name);
    setEditSelectedCategory(categoryId);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('subcategories')
      .update({ name: editSubcategoryName, category_id: editSelectedCategory })
      .eq('id', editSubcategoryId);
    if (error) {
      console.error('Error updating subcategory:', error);
    } else {
      setEditSubcategoryId(null);
      setEditSubcategoryName('');
      fetchSubcategories();
    }
    setLoading(false);
  };

  const handleDeleteSubcategory = async (id: number) => {
    setLoading(true);
    const { error } = await supabase
      .from('subcategories')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting subcategory:', error);
    else fetchSubcategories();
    setLoading(false);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="md">
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
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Agregar Subcategoría
          </Button>
        </Box>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Agregar Subcategoría</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleAddSubcategory} noValidate sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="subcategoryName"
                label="Nombre de la Subcategoría"
                name="subcategoryName"
                autoComplete="off"
                autoFocus
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
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
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '45%', padding: '8px' }}>Nombre</TableCell>
                <TableCell sx={{ width: '35%', padding: '8px' }}>Categoría</TableCell>
                <TableCell sx={{ width: '20%', padding: '8px' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subcategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell sx={{ width: '45%', padding: '8px' }}>
                    {editSubcategoryId === subcategory.id ? (
                      <TextField
                        fullWidth
                        value={editSubcategoryName}
                        onChange={(e) => setEditSubcategoryName(e.target.value)}
                        margin="normal"
                      />
                    ) : (
                      subcategory.name
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '35%', padding: '8px' }}>
                    {editSubcategoryId === subcategory.id ? (
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
                      categories.find(category => category.id === subcategory.category_id)?.name
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '20%', padding: '8px' }} align="right">
                    {editSubcategoryId === subcategory.id ? (
                      <>
                        <IconButton onClick={handleSaveEdit} color="primary" disabled={loading}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton onClick={() => setEditSubcategoryId(null)} color="secondary" disabled={loading}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <>
                        <IconButton onClick={() => handleEditSubcategory(subcategory.id, subcategory.name, subcategory.category_id)} color="primary" disabled={loading}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteSubcategory(subcategory.id)} sx={{ color: 'red' }} disabled={loading}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[4, 8, 12]}
            component="div"
            count={subcategories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Subcategories;
