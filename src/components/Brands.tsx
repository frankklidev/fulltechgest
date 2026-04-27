import React, { useEffect, useState } from 'react';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabaseClient';

interface Brand {
  id: number;
  name: string;
}

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState<string>('');
  const [editBrandId, setEditBrandId] = useState<number | null>(null);
  const [editBrandName, setEditBrandName] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchBrands();
  }, []);

const fetchBrands = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('brand')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) console.error('Error fetching brands:', error);
  else setBrands(data || []);

  setLoading(false);
};

const handleAddBrand = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const trimmedName = brandName.trim();

  if (!trimmedName) {
    alert('El nombre de la marca es obligatorio.');
    return;
  }

  const brandExists = brands.some(
    (brand) => brand.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (brandExists) {
    alert('Una marca con este nombre ya existe.');
    return;
  }

  setLoading(true);

  const { data, error } = await supabase
    .from('brand')
    .insert([{ name: trimmedName }])
    .select('id, name')
    .single();

  if (error) {
    console.error('Error adding brand:', error);
    alert('Error adding brand: ' + error.message);
  } else if (data) {
    setBrands((prev) =>
      [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
    );
    setBrandName('');
    setOpen(false);
  }

  setLoading(false);
};

const handleSaveEdit = async () => {
  if (!editBrandId) return;

  const trimmedName = editBrandName.trim();

  if (!trimmedName) {
    alert('El nombre de la marca es obligatorio.');
    return;
  }

  const brandExists = brands.some(
    (brand) =>
      brand.id !== editBrandId &&
      brand.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (brandExists) {
    alert('Una marca con este nombre ya existe.');
    return;
  }

  setLoading(true);

  const { data, error } = await supabase
    .from('brand')
    .update({ name: trimmedName })
    .eq('id', editBrandId)
    .select('id, name')
    .single();

  if (error) {
    console.error('Error updating brand:', error);
  } else if (data) {
    setBrands((prev) =>
      prev
        .map((brand) => (brand.id === editBrandId ? data : brand))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

    resetEditState();
  }

  setLoading(false);
};

  const handleEditBrand = (brand: Brand) => {
    setEditBrandId(brand.id);
    setEditBrandName(brand.name);
    setModalOpen(true);
  };

  const resetEditState = () => {
    setEditBrandId(null);
    setEditBrandName('');
    setModalOpen(false);
  };

const handleDeleteBrand = async (id: number) => {
  setLoading(true);

  const { error } = await supabase.from('brand').delete().eq('id', id);

  if (error) {
    console.error('Error deleting brand:', error);
  } else {
    setBrands((prev) => prev.filter((brand) => brand.id !== id));
  }

  setLoading(false);
};

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container component="main" maxWidth="lg" sx={{ marginTop: 4 }}>
      <Backdrop open={loading} style={{ zIndex: 1500 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Agregar Marca
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Marca</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddBrand} noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="brandName"
              label="Nombre de la Marca"
              name="brandName"
              autoComplete="off"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              autoFocus
            />
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleEditBrand(brand)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteBrand(brand.id)}
                    color="secondary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={modalOpen} onClose={resetEditState}>
        <DialogTitle>Editar Marca</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="editBrandName"
              label="Nombre de la Marca"
              name="editBrandName"
              autoComplete="off"
              value={editBrandName}
              onChange={(e) => setEditBrandName(e.target.value)}
              autoFocus
            />
            <DialogActions>
              <Button onClick={resetEditState} color="secondary">
                Cancelar
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="contained"
                color="primary"
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

export default Brands;
