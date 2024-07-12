import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Backdrop,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetching categories:', error);
    else setCategories(data || []);
    setLoading(false);
  };

  const fetchSubcategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('subcategories').select('*');
    if (error) console.error('Error fetching subcategories:', error);
    else setSubcategories(data || []);
    setLoading(false);
  };

  const handleAddSubcategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const subcategoryExists = subcategories.some(
      (subcategory) => subcategory.name.toLowerCase() === subcategoryName.toLowerCase()
    );

    if (subcategoryExists) {
      setValidationError('Una subcategoría con este nombre ya existe.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('subcategories')
      .insert([{ name: subcategoryName, category_id: selectedCategory }])
      .single();
    if (error) {
      console.error('Error adding subcategory:', error);
    } else {
      setSubcategoryName('');
      setValidationError('');
      fetchSubcategories();
      setOpen(false);
    }
    setLoading(false);
  };

  const handleEditSubcategory = (id: number, name: string, categoryId: number) => {
    setEditSubcategoryId(id);
    setEditSubcategoryName(name);
    setEditSelectedCategory(categoryId);
    setEditOpen(true);
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
      setEditOpen(false);
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
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                error={!!validationError}
                helperText={validationError}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 3 }}>
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
                <Button
                  onClick={handleClose}
                  color="secondary"
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
                  color="primary"
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
                  Agregar
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onClose={handleEditClose}>
          <DialogTitle>Editar Subcategoría</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} noValidate sx={{ mt: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="editSubcategoryName"
                label="Nombre de la Subcategoría"
                name="editSubcategoryName"
                autoComplete="off"
                value={editSubcategoryName}
                onChange={(e) => setEditSubcategoryName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 3 }}>
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
              <DialogActions>
                <Button
                  onClick={handleEditClose}
                  color="secondary"
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
                  color="primary"
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

        <TableContainer component={Paper} sx={{ overflowX: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: 300 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '45%', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nombre</TableCell>
                <TableCell sx={{ width: '35%', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Categoría</TableCell>
                <TableCell sx={{ width: '20%', padding: '8px', fontWeight: 'bold', backgroundColor: '#f5f5f5' }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subcategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((subcategory) => (
                <TableRow key={subcategory.id}>
                  <TableCell sx={{ width: '45%', padding: '8px' }}>
                    {subcategory.name}
                  </TableCell>
                  <TableCell sx={{ width: '35%', padding: '8px' }}>
                    {categories.find(category => category.id === subcategory.category_id)?.name}
                  </TableCell>
                  <TableCell sx={{ width: '20%', padding: '8px' }} align="right">
                    <IconButton onClick={() => handleEditSubcategory(subcategory.id, subcategory.name, subcategory.category_id)} color="primary" disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteSubcategory(subcategory.id)} sx={{ color: 'red' }} disabled={loading}>
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
