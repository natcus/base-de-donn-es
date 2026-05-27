import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Autocomplete, TextField, Avatar, Chip, Grid, Checkbox, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, InputAdornment, Tooltip
} from '@mui/material';
import { 
  AssignmentInd as EnrollIcon, Delete as DeleteIcon, School as CourseIcon,
  Search as SearchIcon, CheckCircle as ValidIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const Enrollments: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEtudiant, setSelectedEtudiant] = useState<any>(null);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);

  const API_URL = 'http://localhost:8081/api';

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataI, dataE, dataC] = await Promise.all([
        api.get('/inscriptions').catch(() => []),
        api.get('/etudiants').catch(() => []),
        api.get('/cours').catch(() => [])
      ]);
      setInscriptions(Array.isArray(dataI) ? dataI : []);
      setEtudiants(Array.isArray(dataE) ? dataE : []);
      setCours(Array.isArray(dataC) ? dataC : []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleBulkEnroll = async () => {
    if (!selectedEtudiant || selectedCourses.length === 0) return;
    try {
      await api.post('/inscriptions/bulk', { 
        etudiantId: selectedEtudiant.id, 
        coursIds: selectedCourses.map(c => c.id) 
      });
      setSelectedCourses([]);
      loadData();
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Annuler cette inscription ?")) return;
    try {
      await api.delete(`/inscriptions/${id}`);
      loadData();
    } catch (error) { console.error(error); }
  };


  // Groupage des inscriptions par étudiant pour l'affichage expert
  const groupedInscriptions = etudiants.map(student => {
    const studentInscriptions = inscriptions.filter(i => (i.etudiant?.id || i.etudiantId) === student.id);
    if (studentInscriptions.length === 0) return null;
    return {
      student,
      inscriptions: studentInscriptions.map(i => ({
        ...i,
        course: i.cours || cours.find(c => c.id === i.coursId)
      }))
    };
  }).filter(item => item !== null);

  const totalInscriptions = inscriptions.length;
  const avgCoursesPerStudent = groupedInscriptions.length > 0 ? (totalInscriptions / groupedInscriptions.length).toFixed(1) : 0;

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>Monitoring Pédagogique</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Supervision des cohortes, gestion des options et dérogations de rattrapage.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}>{totalInscriptions}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>INSCRIPTIONS ACTIVES</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'secondary.main', lineHeight: 1 }}>{avgCoursesPerStudent}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>MATIÈRES / ÉTUDIANT</Typography>
            </Box>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Formulaire Dérogation */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)', bgcolor: '#ffffff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
                    <ValidIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Dérogation Manuelle</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Utilisez ce panneau uniquement pour assigner une <b>option hors-cursus</b> ou un <b>rattrapage</b> à un étudiant.
            </Typography>

            <Autocomplete
              options={etudiants}
              getOptionLabel={(o) => `${o.nom.toUpperCase()} ${o.prenom} (${o.matricule})`}
              value={selectedEtudiant}
              onChange={(_, v) => setSelectedEtudiant(v)}
              renderInput={(p) => <TextField {...p} label="Sélectionner l'Étudiant" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />}
            />
            <Divider sx={{ my: 3 }} />
            
            <Autocomplete
              multiple
              options={cours}
              getOptionLabel={(o) => `${o.code} - ${o.titre}`}
              getOptionDisabled={(option) => {
                  if (!selectedEtudiant) return false;
                  return !!inscriptions.find(i => (i.etudiant?.id === selectedEtudiant.id || i.etudiantId === selectedEtudiant.id) && (i.cours?.id === option.id || i.coursId === option.id));
              }}
              value={selectedCourses}
              onChange={(_, newValue) => setSelectedCourses(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Matières à ajouter"
                  placeholder="Sélectionner les matières..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip 
                    variant="filled" 
                    color="primary"
                    label={`${option.code}`} 
                    {...getTagProps({ index })} 
                    size="small" 
                    sx={{ fontWeight: 700 }}
                  />
                ))
              }
              sx={{ mb: 2 }}
            />
            
            <Button 
                fullWidth variant="contained" color="warning" disableElevation
                onClick={handleBulkEnroll} disabled={!selectedEtudiant || selectedCourses.length === 0} 
                sx={{ mt: 3, py: 1.5, borderRadius: 3, fontWeight: 800, textTransform: 'none', fontSize: '1rem' }}
            >

                Forcer l'Inscription
            </Button>
          </Paper>
        </Grid>

        {/* Historique Groupé */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px -10px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Audit des Dossiers Pédagogiques</Typography>
                <Chip label={`${groupedInscriptions.length} dossiers actifs`} size="small" sx={{ fontWeight: 700, bgcolor: 'white' }} />
            </Box>
            <TableContainer sx={{ maxHeight: 680, overflowY: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', bgcolor: '#f8fafc' }}>PROFIL ÉTUDIANT</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'text.secondary', bgcolor: '#f8fafc' }}>UNITÉS D'ENSEIGNEMENT (UE)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedInscriptions.reverse().map((item: any) => (
                    <TableRow key={item.student.id} hover>
                      <TableCell sx={{ verticalAlign: 'top', width: '280px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ width: 42, height: 42, bgcolor: '#6366f1', fontWeight: 800 }}>{item.student.nom[0]}</Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{item.student.nom.toUpperCase()} {item.student.prenom}</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{item.student.matricule}</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Chip label={`L${item.student.niveau} ${item.student.filiere}`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {item.inscriptions.map((ins: any) => (
                            <Chip 
                              key={ins.id} 
                              label={`${ins.course?.code || '?'}`} 
                              onDelete={() => handleDelete(ins.id)}
                              deleteIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                  fontWeight: 700, 
                                  bgcolor: 'transparent', 
                                  color: 'text.primary', 
                                  borderColor: '#cbd5e1',
                                  borderRadius: 2,
                                  '&:hover': { bgcolor: '#fee2e2', borderColor: '#f87171', color: '#dc2626' }
                              }}
                            />
                          ))}
                          <Chip 
                              label={`${item.inscriptions.length} matières`} 
                              size="small" 
                              sx={{ fontWeight: 900, bgcolor: '#f1f5f9', color: '#64748b', borderRadius: 2, border: 'none' }} 
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Enrollments;
