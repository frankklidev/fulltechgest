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
  Rating,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { supabase } from "../supabaseClient";

interface Testimonial {
  id: number;
  name: string;
  review: string;
  ratingNumber: number;
  createdAt: string;
}

const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [name, setName] = useState<string>("");
  const [review, setReview] = useState<string>("");
  const [ratingNumber, setRatingNumber] = useState<number>(0);
  const [editTestimonialId, setEditTestimonialId] = useState<number | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editReview, setEditReview] = useState<string>("");
  const [editRatingNumber, setEditRatingNumber] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("testimonials").select("*");
    if (error) console.error("Error fetching testimonials:", error);
    else setTestimonials(data || []);
    setLoading(false);
  };

  const handleAddTestimonial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("testimonials")
      .insert([{ name, review, ratingNumber, createdAt: new Date().toISOString() }])
      .select("*");
    if (error) {
      console.error("Error adding testimonial:", error);
      alert("Error adding testimonial: " + error.message);
    } else if (data && data.length > 0) {
      setTestimonials([...testimonials, data[0]]);
      setName("");
      setReview("");
      setRatingNumber(0);
      setOpen(false);
    }
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("testimonials")
      .update({
        name: editName,
        review: editReview,
        ratingNumber: editRatingNumber,
      })
      .eq("id", editTestimonialId)
      .select("*");

    if (error) {
      console.error("Error updating testimonial:", error);
    } else if (data && data.length > 0) {
      setTestimonials(
        testimonials.map((testimonial) =>
          testimonial.id === editTestimonialId ? { ...testimonial, ...data[0] } : testimonial
        )
      );
      resetEditState();
      setModalOpen(false);
    }
    setLoading(false);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditTestimonialId(testimonial.id);
    setEditName(testimonial.name);
    setEditReview(testimonial.review);
    setEditRatingNumber(testimonial.ratingNumber);
    setModalOpen(true);
  };

  const resetEditState = () => {
    setEditTestimonialId(null);
    setEditName("");
    setEditReview("");
    setEditRatingNumber(0);
    setModalOpen(false);
  };

  const handleDeleteTestimonial = async (id: number) => {
    setLoading(true);
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);
    if (error) console.error("Error deleting testimonial:", error);
    else setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id));
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
          Agregar Testimonio
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Agregar Testimonio</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddTestimonial} noValidate sx={{ mt: 3 }}>
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
              id="review"
              label="Reseña"
              name="review"
              autoComplete="off"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <Rating
              name="rating"
              value={ratingNumber}
              onChange={(event, newValue) => {
                setRatingNumber(newValue || 0);
              }}
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
                Reseña
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Calificación
              </TableCell>
              <TableCell
                sx={{
                  padding: "8px",
                  fontWeight: "bold",
                  backgroundColor: "#f5f5f5",
                }}
              >
                Fecha de Creación
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
            {testimonials.map((testimonial) => (
              <TableRow
                key={testimonial.id}
                sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" } }}
              >
                <TableCell sx={{ padding: "8px" }}>{testimonial.name}</TableCell>
                <TableCell sx={{ padding: "8px" }}>{testimonial.review}</TableCell>
                <TableCell sx={{ padding: "8px" }}>
                  <Rating value={testimonial.ratingNumber} readOnly />
                </TableCell>
                <TableCell sx={{ padding: "8px" }}>{new Date(testimonial.createdAt).toLocaleDateString()}</TableCell>
                <TableCell
                  sx={{
                    padding: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton
                    onClick={() => handleEditTestimonial(testimonial)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
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
        <DialogTitle>Editar Testimonio</DialogTitle>
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
              id="editReview"
              label="Reseña"
              name="editReview"
              autoComplete="off"
              value={editReview}
              onChange={(e) => setEditReview(e.target.value)}
            />
            <Rating
              name="editRating"
              value={editRatingNumber}
              onChange={(event, newValue) => {
                setEditRatingNumber(newValue || 0);
              }}
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

export default Testimonials;
