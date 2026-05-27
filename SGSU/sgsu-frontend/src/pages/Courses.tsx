import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const FILIERES = ['Informatique', 'Droit', 'Économie', 'Médecine', 'Lettres', 'Gestion'];
const NIVEAUX = [1, 2, 3];

const Courses: React.FC = () => {
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('Toutes');
  const [niveauFilter, setNiveauFilter] = useState('Tous');
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{"role":"admin"}');
  const isAdmin = user.role === 'admin';
  
  const [formData, setFormData] = useState({
    code: '',
    titre: '',
    credits: 6,
    semestre: 'S1',
    filiere: 'Informatique',
    niveau: 1
  });

  const loadCours = async () => {
    setLoading(true);
    try {
      const data = await api.get('/cours');
      setCours(data);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCours();
  }, []);

  const handleOpen = () => {
    setEditMode(false);
    setEditingId(null);
    setFormData({ code: '', titre: '', credits: 6, semestre: 'S1', filiere: 'Informatique', niveau: 1 });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleEdit = (c: any) => {
    setEditMode(true);
    setEditingId(c.id);
    setFormData({
      code: c.code,
      titre: c.titre,
      credits: c.credits,
      semestre: c.semestre,
      filiere: c.filiere || 'Informatique',
      niveau: c.niveau || 1
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Supprimer ce cours ? Cela annulera toutes les inscriptions et supprimera les notes liées.")) return;
    try {
      await api.delete(`/cours/${id}`);
      loadCours();
      alert("Cours supprimé avec succès.");
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression : " + (error.message || "Impossible de supprimer ce cours."));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const endpoint = editMode ? `/cours/${editingId}` : '/cours';
      if (editMode) {
        await api.put(endpoint, formData);
      } else {
        await api.post(endpoint, formData);
      }
      handleClose();
      loadCours();
      alert("Cours enregistré avec succès !");
    } catch (error: any) {
      console.error("Erreur enregistrement:", error);
      alert("Échec de l'enregistrement : " + (error.message || "Vérifiez les données saisies."));
    }
  };

  const filteredCours = cours.filter(c => {
    const matchesSearch = c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiliere = filiereFilter === 'Toutes' || c.filiere === filiereFilter;
    const matchesNiveau = niveauFilter === 'Tous' || c.niveau === parseInt(niveauFilter);
    return matchesSearch && matchesFiliere && matchesNiveau;
  });

  const handleSync = async () => {
    try {
        await api.post('/cours/sync');
        alert("Synchronisation terminée ! Tous les étudiants ont été inscrits à leurs cours respectifs.");
        loadCours();
    } catch (error: any) {
        alert("Erreur de synchronisation : " + error.message);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Offre de Formation</Typography>
          <Typography color="text.secondary">Gérez le catalogue des cours et les unités d'enseignement (UE).</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" color="secondary" onClick={handleSync} sx={{ borderRadius: 2 }}>
                Synchroniser
            </Button>
            {isAdmin && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} sx={{ borderRadius: 2 }}>
                    Nouveau Cours
                </Button>
            )}
        </Box>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 4, mb: 3, display: 'flex', gap: 2 }}>
        <TextField 
          placeholder="Rechercher un cours..." 
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: '#f1f5f9', border: 'none', '& fieldset': { border: 'none' } }
          }}
        />
        <TextField
          select
          size="small"
          label="Filière"
          value={filiereFilter}
          onChange={(e) => setFiliereFilter(e.target.value)}
          sx={{ minWidth: 150 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        >
          <MenuItem value="Toutes">Toutes</MenuItem>
          {FILIERES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
        </TextField>
        <TextField
          select
          size="small"
          label="Niveau"
          value={niveauFilter}
          onChange={(e) => setNiveauFilter(e.target.value)}
          sx={{ minWidth: 120 }}
          InputProps={{ sx: { borderRadius: 2 } }}
        >
          <MenuItem value="Tous">Tous</MenuItem>
          {NIVEAUX.map(n => <MenuItem key={n} value={n.toString()}>Licence {n}</MenuItem>)}
        </TextField>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 4, overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Code / Filière</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Niveau</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Intitulé du Cours</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Crédits</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Semestre</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Chargement...</TableCell></TableRow>
            ) : filteredCours.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">Aucun cours trouvé.</TableCell></TableRow>
            ) : (
              filteredCours.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{c.code}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.filiere || 'Général'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`Licence ${c.niveau}`} size="small" variant="outlined" sx={{ fontWeight: 800, color: 'text.secondary' }} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <BookIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.titre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${c.credits} ECTS`} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{c.semestre}</TableCell>
                  <TableCell>
                    {isAdmin && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" onClick={() => handleEdit(c)} color="primary">
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(c.id)} color="error">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
            {editMode ? "Modifier le cours" : "Ajouter un nouveau cours"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={8}>
              <TextField 
                fullWidth select label="Filière / Département" name="filiere" 
                value={formData.filiere} onChange={handleChange}
              >
                {FILIERES.map(f => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField 
                fullWidth select label="Niveau" name="niveau" 
                value={formData.niveau} onChange={handleChange}
              >
                {NIVEAUX.map(n => (
                  <MenuItem key={n} value={n}>Licence {n}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField 
                fullWidth label="Code UE" name="code" 
                value={formData.code} onChange={handleChange} 
                placeholder="Ex: INF101"
              />
            </Grid>
            <Grid item xs={8}>
              <TextField 
                fullWidth label="Intitulé du Cours" name="titre" 
                value={formData.titre} onChange={handleChange} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth type="number" label="Crédits ECTS" name="credits" 
                value={formData.credits} onChange={handleChange} 
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth select label="Semestre" name="semestre" 
                value={formData.semestre} onChange={handleChange}
              >
                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} color="inherit">Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ borderRadius: 2 }}>
            {editMode ? "Enregistrer les modifications" : "Créer le cours"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Courses;
