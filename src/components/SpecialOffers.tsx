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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Backdrop,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../supabaseClient";

interface SpecialOffer {
  id: number;
  name: string;
  description: string;
  price: string;
  expiry_date: string;
  image_url?: string;
  is_active: boolean;
}

const SpecialOffers: React.FC = () => {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [expiry_date, setExpiryDate] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [editOfferId, setEditOfferId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editExpiryDate, setEditExpiryDate] = useState<string>("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchSpecialOffers();
  }, []);

  const fetchSpecialOffers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("special_offers").select("*");
    if (error) console.error("Error fetching special offers:", error);
    else setSpecialOffers(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    const { data, error } = await supabase.storage
      .from("special_offers")
      .upload(`public/${file.name}`, file, {
        cacheControl: "3600",
        upsert: false,
      });
    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }
    return `https://irxyqvsithjknuytafcl.supabase.co/storage/v1/object/public/special_offers/${data.path}`;
  };

  const handleImageDelete = async (imagePath: string) => {
    const { error } = await supabase.storage
      .from("special_offers")
      .remove([imagePath]);
    if (error) {
      console.error("Error deleting image:", error);
    }
  };

  const ensureNoActiveOffer = async () => {
    const { count } = await supabase
      .from("special_offers")
      .select("id", { count: "exact" })
      .eq("is_active", true);
    return count === 0;
  };

  const handleAddOffer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (isActive) {
      const noActiveOffer = await ensureNoActiveOffer();
      if (!noActiveOffer) {
        alert("Ya hay una oferta activa. Desactiva la oferta actual antes de agregar una nueva.");
        setLoading(false);
        return;
      }
    }

    let imageUrl = "";
    if (image) {
      const imagePath = await handleImageUpload(image);
      if (imagePath) {
        imageUrl = imagePath;
      }
    }

    const { data, error } = await supabase
      .from("special_offers")
      .insert([
        {
          name,
          description,
          price,
          expiry_date,
          image_url: imageUrl,
          is_active: isActive,
        },
      ])
      .select("*");
    if (error) {
      console.error("Error adding offer:", error);
      alert("Error adding offer: " + error.message);
    } else if (data && data.length > 0) {
      setSpecialOffers([...specialOffers, data[0]]);
      setName("");
      setDescription("");
      setPrice("");
      setExpiryDate("");
      setImage(null);
      setIsActive(true);
      setOpen(false);
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    if (editIsActive) {
      const noActiveOffer = await ensureNoActiveOffer();
      if (!noActiveOffer) {
        alert("Ya hay una oferta activa. Desactiva la oferta actual antes de activar esta oferta.");
        setLoading(false);
        return;
      }
    }

    let imageUrl = "";
    let imagePath: string | null = null;
    const currentOffer = specialOffers.find(
      (offer) => offer.id === editOfferId
    );

    if (editImage) {
      if (currentOffer?.image_url) {
        const previousImagePath = currentOffer.image_url
          .split("/")
          .slice(4)
          .join("/");
        await handleImageDelete(previousImagePath);
      }
      imagePath = await handleImageUpload(editImage);
      if (imagePath) {
        imageUrl = imagePath;
      }
    } else {
      imageUrl = currentOffer?.image_url || "";
    }

    const { data, error } = await supabase
      .from("special_offers")
      .update({
        name: editName,
        description: editDescription,
        price: editPrice,
        expiry_date: editExpiryDate,
        image_url: imageUrl,
        is_active: editIsActive,
      })
      .eq("id", editOfferId)
      .select("*");

    if (error) {
      console.error("Error updating offer:", error);
    } else if (data && data.length > 0) {
      setSpecialOffers(
        specialOffers.map((offer) =>
          offer.id === editOfferId ? { ...offer, ...data[0] } : offer
        )
      );
      resetEditState();
      setModalOpen(false);
    }
    setLoading(false);
  };

  const handleEditOffer = (offer: SpecialOffer) => {
    setEditOfferId(offer.id);
    setEditName(offer.name);
    setEditDescription(offer.description);
    setEditPrice(offer.price);
    setEditExpiryDate(offer.expiry_date);
    setEditImage(null);
    setEditIsActive(offer.is_active);
    setModalOpen(true);
  };

  const resetEditState = () => {
    setEditOfferId(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditExpiryDate("");
    setEditImage(null);
    setEditIsActive(true);
    setModalOpen(false);
  };

  const handleDeleteOffer = async (id: number) => {
    setLoading(true);
    const offerToDelete = specialOffers.find((offer) => offer.id === id);

    if (offerToDelete?.image_url) {
      const imagePath = offerToDelete.image_url.split("/").slice(4).join("/");
      await handleImageDelete(imagePath);
    }

    const { error } = await supabase
      .from("special_offers")
      .delete()
      .eq("id", id);
    if (error) console.error("Error deleting offer:", error);
    else setSpecialOffers(specialOffers.filter((offer) => offer.id !== id));
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
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
          Agregar Oferta
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Oferta Especial</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleAddOffer}
            noValidate
            sx={{ mt: 3 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre"
              name="name"
              autoComplete="off"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              autoComplete="off"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="price"
              label="Precio"
              name="price"
              autoComplete="off"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="expiry_date"
              label="Fecha de Expiración"
              name="expiry_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              autoComplete="off"
              value={expiry_date}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              style={{ marginTop: 16 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              }
              label="Activar Oferta"
            />
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
      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <Table
          sx={{
            minWidth: 750,
            borderSpacing: "0 10px",
            borderCollapse: "separate",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Nombre
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Descripción
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Precio
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Fecha de Expiración
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Imagen
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Activo
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {specialOffers.map((offer) => (
              <TableRow
                key={offer.id}
                sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" } }}
              >
                <TableCell sx={{ padding: "8px" }}>{offer.name}</TableCell>
                <TableCell sx={{ padding: "8px" }}>{offer.description}</TableCell>
                <TableCell sx={{ padding: "8px" }}>{offer.price}</TableCell>
                <TableCell sx={{ padding: "8px" }}>{offer.expiry_date}</TableCell>
                <TableCell sx={{ padding: "8px" }}>
                  {offer.image_url && (
                    <img
                      src={offer.image_url}
                      alt={offer.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ padding: "8px" }}>
                  {offer.is_active ? "Sí" : "No"}
                </TableCell>
                <TableCell
                  sx={{
                    padding: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton
                    onClick={() => handleEditOffer(offer)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteOffer(offer.id)}
                    sx={{ color: "red" }}
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
        <DialogTitle>Editar Oferta Especial</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveEdit();
            }}
            noValidate
            sx={{ mt: 3 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="editName"
              label="Nombre"
              name="editName"
              autoComplete="off"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="editDescription"
              label="Descripción"
              name="editDescription"
              autoComplete="off"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="editPrice"
              label="Precio"
              name="editPrice"
              autoComplete="off"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="editExpiry_date"
              label="Fecha de Expiración"
              name="editExpiry_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              autoComplete="off"
              value={editExpiryDate}
              onChange={(e) => setEditExpiryDate(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setEditImage(e.target.files ? e.target.files[0] : null)
              }
              style={{ marginTop: 16 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                />
              }
              label="Activar Oferta"
            />
            <DialogActions>
              <Button
                onClick={resetEditState}
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
                Guardar
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SpecialOffers;
