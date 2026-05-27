import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, TextField, InputAdornment, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid, IconButton, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, 
  Assignment as GradesIcon, Print as PrintIcon, VerifiedUser as VerifiedIcon,
  Warning as WarningIcon, Cancel as CancelIcon, Phone as PhoneIcon, Home as HomeIcon,
  School as SchoolIcon, FileUpload as ImportIcon, FileDownload as ExportIcon,
  AccountBalanceWallet as FinanceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Students: React.FC = () => {
  const navigate = useNavigate();
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filiereFilter, setFiliereFilter] = useState('Toutes');
  const [niveauFilter, setNiveauFilter] = useState('Tous');
  
  const [open, setOpen] = useState(false);
  const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{"role":"admin"}');
  const isAdmin = user.role === 'admin';

  const [formData, setFormData] = useState({ 
    matricule: '', nom: '', prenom: '', email: '', 
    filiere: 'Informatique', niveau: 1,
    sexe: 'Masculin', type: 'Nouveau',
    telephone: '', adresse: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [eData, iData, cData, nData] = await Promise.all([
        api.get('/etudiants').catch(() => []),
        api.get('/inscriptions').catch(() => []),
        api.get('/cours').catch(() => []),
        api.get('/notes').catch(() => [])
      ]);
      
      setEtudiants(Array.isArray(eData) ? eData : []);
      setInscriptions(Array.isArray(iData) ? iData : []);
      setCours(Array.isArray(cData) ? cData : []);
      setNotes(Array.isArray(nData) ? nData : []);
    } catch (error) { 
      console.error("Erreur chargement Students:", error); 
    } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const getUENote = (insId: number, type: string) => {
    const n = (notes || []).find(note => (note.inscription?.id === insId || note.inscriptionId === insId) && note.type === type);
    return n ? (n.valeur || n.note) : '-';
  };

  const calculateFinalMoy = (insId: number) => {
    const cc = parseFloat(getUENote(insId, 'CC')) || 0;
    const et1 = parseFloat(getUENote(insId, 'ET1')) || 0;
    const et2 = parseFloat(getUENote(insId, 'ET2')) || 0;
    const bestET = Math.max(et1, et2);
    if (getUENote(insId, 'CC') === '-' && getUENote(insId, 'ET1') === '-' && getUENote(insId, 'ET2') === '-') return null;
    return (cc * 0.4 + bestET * 0.6).toFixed(2);
  };

  const getAcademicStatus = (studentId: number) => {
    const criteria = localStorage.getItem('validCriteria') || 'moyenne';
    const threshold = parseFloat(localStorage.getItem('validThreshold') || '10');

    const studentIns = (inscriptions || []).filter(i => (i.etudiant?.id || i.etudiantId) === studentId);
    if (studentIns.length === 0) return { label: 'Inconnu', color: 'default', icon: null };
    
    let totalMoy = 0; let count = 0; let hasDebt = false; let totalCredits = 0;
    
    studentIns.forEach(i => {
      const moy = calculateFinalMoy(i.id);
      if (moy) { 
        totalMoy += parseFloat(moy); count++; 
        if (parseFloat(moy) < 10) hasDebt = true; 
        if (parseFloat(moy) >= 10) {
            const cId = i.cours?.id || i.coursId;
            const c = (cours || []).find(course => course.id === cId);
            totalCredits += Number(c?.credits || 0);
        }
      }
    });

    const gpa = count > 0 ? totalMoy / count : 0;
    if (count === 0) return { label: 'En cours', color: 'default', icon: null };

    // LOGIQUE DE VALIDATION DYNAMIQUE
    let isValidated = false;
    if (criteria === 'moyenne') {
        isValidated = gpa >= threshold;
    } else {
        isValidated = totalCredits >= threshold;
    }

    if (isValidated) return hasDebt ? { label: 'Validé (dette)', color: 'warning', icon: <WarningIcon sx={{ fontSize: '14px' }} /> } : { label: 'Validé', color: 'success', icon: <VerifiedIcon sx={{ fontSize: '14px' }} /> };
    return { label: 'Ajourné', color: 'error', icon: <CancelIcon sx={{ fontSize: '14px' }} /> };
  };

  const handleExportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prenom', 'Email', 'Filiere', 'Niveau', 'Sexe', 'Type', 'Telephone', 'Adresse'];
    const rows = etudiants.map(e => [
        e.matricule, e.nom, e.prenom, e.email, e.filiere, e.niveau, e.sexe, e.type, e.telephone, `"${e.adresse || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(r => r.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `liste_etudiants_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        const newStudents = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(",");
            if (cols.length >= 4) {
                newStudents.push({
                    matricule: cols[0].trim(),
                    nom: cols[1].trim().toUpperCase(),
                    prenom: cols[2].trim(),
                    email: cols[3].trim(),
                    filiere: (cols[4] || 'Informatique').trim(),
                    niveau: parseInt(cols[5] || '1'),
                    sexe: (cols[6] || 'Masculin').trim(),
                    type: (cols[7] || 'Nouveau').trim(),
                    telephone: (cols[8] || '').trim(),
                    adresse: (cols[9] || '').trim()
                });
            }
        }
        // Envoi au serveur (simulation boucle)
        // Envoi au serveur (Le backend gère l'inscription auto)
        for (const s of newStudents) {
            try {
                await api.post('/etudiants', s);
            } catch (err) {
                console.error("Erreur import étudiant:", s.matricule, err);
            }
        }
        loadData();
        alert(`${newStudents.length} étudiants importés avec succès !`);
    };
    reader.readAsText(file);
  };

  const filteredEtudiants = (etudiants || []).filter(e => {
    const matchesSearch = `${e?.prenom || ''} ${e?.nom || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (e?.matricule || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFiliere = filiereFilter === 'Toutes' || e.filiere === filiereFilter;
    const matchesNiveau = niveauFilter === 'Tous' || e.niveau === parseInt(niveauFilter);
    return matchesSearch && matchesFiliere && matchesNiveau;
  });

  const handleSubmit = async () => {
    try {
        const endpoint = editMode ? `/etudiants/${editingId}` : '/etudiants';
        if (editMode) {
          await api.put(endpoint, formData);
        } else {
          await api.post(endpoint, formData);
        }
        
        setOpen(false);
        loadData();
        alert(`Dossier validé ! L'étudiant a été enregistré avec succès.`);
    } catch (error: any) {
        console.error("Erreur lors de l'enregistrement:", error);
        alert(`Erreur : ${error.message || "Impossible d'enregistrer l'étudiant. Vérifiez si l'email ou le matricule existe déjà."}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Attention : Supprimer cet étudiant supprimera également toutes ses notes et inscriptions. Confirmer ?")) return;
    try {
      await api.delete(`/etudiants/${id}`);
      loadData();
      alert("Étudiant supprimé avec succès.");
    } catch (error: any) {
      console.error("Erreur suppression:", error);
      alert(`Erreur lors de la suppression : ${error.message}`);
    }
  };

  return (
    <Box>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .MuiDialog-root * { visibility: visible; }
          .MuiDialog-root { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .MuiDialogActions-root, .MuiButton-root:not([startIcon*="Print"]) { display: none !important; }
        }
      `}</style>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, alignItems: 'center' }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Dossiers Étudiants</Typography><Typography color="text.secondary">Gestion civile et académique.</Typography></Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportCSV} sx={{ borderRadius: 2 }}>Exporter</Button>
            {isAdmin && (
                <>
                    <Button variant="outlined" component="label" startIcon={<ImportIcon />} sx={{ borderRadius: 2 }}>
                        Importer
                        <input type="file" hidden accept=".csv" onChange={handleImportCSV} />
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditMode(false); setOpen(true); setFormData({ matricule: '', nom: '', prenom: '', email: '', filiere: 'Informatique', niveau: 1, sexe: 'Masculin', type: 'Nouveau', telephone: '', adresse: '' }); }} sx={{ borderRadius: 2 }}>Nouvel Étudiant</Button>
                </>
            )}
        </Box>
      </Box>

      <Paper sx={{ p: 2, borderRadius: 4, mb: 3, display: 'flex', gap: 2 }}>
        <TextField 
            placeholder="Rechercher un étudiant..." 
            size="small" 
            fullWidth 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            InputProps={{ 
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), 
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
          {['Informatique', 'Droit', 'Économie', 'Médecine', 'Lettres'].map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
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
          {[1, 2, 3, 4, 5].map(n => <MenuItem key={n} value={n.toString()}>Licence {n}</MenuItem>)}
        </TextField>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}><TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Étudiant</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Civilité</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Cursus</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>État</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filteredEtudiants.map((e) => {
              const status = getAcademicStatus(e.id);
              return (
                <TableRow key={e.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: e.sexe === 'Féminin' ? '#ec4899' : 'primary.main', fontSize: '14px' }}>{e.nom ? e.nom[0] : '?'}</Avatar>
                      <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{e.nom ? e.nom.toUpperCase() : ''} {e.prenom}</Typography><Typography variant="caption">{e.matricule}</Typography></Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{e.sexe}</Typography>
                    <Chip label={e.type} size="small" sx={{ fontSize: 9, height: 18, bgcolor: e.type === 'Nouveau' ? '#dcfce7' : '#fef9c3', color: e.type === 'Nouveau' ? '#166534' : '#854d0e' }} />
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{e.filiere}</Typography><Typography variant="caption" color="primary">Licence {e.niveau}</Typography></TableCell>
                  <TableCell><Chip icon={status.icon as any} label={status.label} color={status.color as any} variant="outlined" sx={{ fontWeight: 800, borderRadius: 1.5, height: 26, fontSize: '10px' }} /></TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button variant="contained" size="small" startIcon={<GradesIcon />} onClick={() => { setSelectedStudent(e); setGradesDialogOpen(true); }} sx={{ borderRadius: 1.5 }}>Relevé</Button>
                      <Button variant="outlined" size="small" color="secondary" startIcon={<FinanceIcon />} onClick={() => navigate('/finance')} sx={{ borderRadius: 1.5 }}>Scolarité</Button>
                      {isAdmin && (
                        <>
                            <IconButton size="small" color="primary" onClick={() => { setEditMode(true); setEditingId(e.id); setFormData({...e}); setOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(e.id)}><DeleteIcon fontSize="small" /></IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIALOGUE FORMULAIRE COMPLET */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editMode ? "Modifier" : "Ajouter"} le Dossier Étudiant</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}><TextField fullWidth label="Matricule" value={formData.matricule} onChange={(e) => setFormData({...formData, matricule: e.target.value})} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Nom" value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Prénom" value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} /></Grid>
            
            <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Sexe" value={formData.sexe} onChange={(e) => setFormData({...formData, sexe: e.target.value})}>
                    <MenuItem value="Masculin">Masculin</MenuItem>
                    <MenuItem value="Féminin">Féminin</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Statut" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <MenuItem value="Nouveau">Nouveau</MenuItem>
                    <MenuItem value="Ancien">Ancien</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Filière" value={formData.filiere} onChange={(e) => setFormData({...formData, filiere: e.target.value})}>
                {['Informatique', 'Droit', 'Économie', 'Médecine', 'Lettres'].map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth label="Niveau" value={formData.niveau} onChange={(e) => setFormData({...formData, niveau: Number(e.target.value)})}>
                {[1, 2, 3, 4, 5].map(n => <MenuItem key={n} value={n}>Licence {n}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Téléphone" value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} label="Adresse Physique" value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} InputProps={{ startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', mt: 1 }} /> }} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setOpen(false)}>Annuler</Button><Button variant="contained" onClick={handleSubmit}>Enregistrer le Dossier</Button></DialogActions>
      </Dialog>

      {/* RELEVÉ DE NOTES (VISU) */}
      <Dialog open={gradesDialogOpen} onClose={() => setGradesDialogOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 2.5, bgcolor: 'white' }}>
            {/* ENTÊTE COMPACT */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, borderBottom: '2px solid #1e293b', pb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ width: 45, height: 45, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {localStorage.getItem('univLogo') ? (
                            <img src={localStorage.getItem('univLogo')!} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
                        ) : (
                            <SchoolIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1 }}>{localStorage.getItem('univName') || 'SGSU UNIVERSITY'}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem' }}>CODE: {localStorage.getItem('codeEtab') || 'SGSU-001'}</Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ fontWeight: 950, color: 'primary.main', lineHeight: 1 }}>RELEVÉ DE NOTES</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>ANNÉE : {localStorage.getItem('academicYear') || '2024-2025'}</Typography>
                </Box>
            </Box>

            {/* INFOS ÉTUDIANT COMPACTES */}
            <Grid container spacing={1} sx={{ mb: 2, px: 1 }}>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '0.65rem' }}>NOM & PRÉNOM</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase' }}>{selectedStudent?.nom} {selectedStudent?.prenom}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '0.65rem' }}>MATRICULE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedStudent?.matricule}</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '0.65rem' }}>SESSION</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{localStorage.getItem('academicYear')}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, fontSize: '0.65rem' }}>CURSUS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedStudent?.filiere} - Licence {selectedStudent?.niveau}</Typography>
                </Grid>
            </Grid>
          <TableContainer sx={{ px: 3 }}><Table size="small"><TableHead sx={{ bgcolor: 'primary.main' }}><TableRow>
            <TableCell sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>MATIÈRE</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>CC</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>ET1</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>ET2</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>MOYENNE</TableCell>
            <TableCell align="center" sx={{ color: 'white', fontWeight: 800, py: 1, fontSize: '0.75rem' }}>CRÉDITS</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {selectedStudent && (inscriptions || []).filter(i => (i.etudiant?.id || i.etudiantId) === selectedStudent.id).map(i => {
                const cId = i.cours?.id || i.coursId;
                const c = (cours || []).find(course => course.id === cId);
                const moy = calculateFinalMoy(i.id);
                return (
                    <TableRow key={i.id} hover sx={{ '& td': { py: 0.5 } }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{c?.titre} <br/><Typography variant="caption" sx={{ fontSize: '0.6rem' }} color="text.secondary">{c?.code} • {c?.credits} ECTS</Typography></TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{getUENote(i.id, 'CC')}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{getUENote(i.id, 'ET1')}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, fontSize: '0.75rem' }}>{getUENote(i.id, 'ET2')}</TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '0.75rem' }}>{moy ? `${moy}/20` : '-'}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontWeight: 950, color: parseFloat(moy || '0') >= 10 ? '#166534' : '#ef4444', fontSize: '0.75rem' }}>{parseFloat(moy || '0') >= 10 ? (c?.credits || 0) : 0}</Typography></TableCell>
                    </TableRow>
                );
            })}
          </TableBody></Table></TableContainer>

          {/* PIED DE PAGE : BILAN GÉNÉRAL */}
          {selectedStudent && (() => {
              const ins = (inscriptions || []).filter(i => (i.etudiant?.id || i.etudiantId) === selectedStudent.id);
              let total = 0; let count = 0; let totalCredits = 0;
              let usedRattrapage = false;

              ins.forEach(i => {
                  const moy = calculateFinalMoy(i.id);
                  if (moy) { 
                      total += parseFloat(moy); count++;
                      if (parseFloat(moy) >= 10) {
                        const cId = i.cours?.id || i.coursId;
                        const c = (cours || []).find(course => course.id === cId);
                        totalCredits += Number(c?.credits || 0);
                      }
                      
                      // Vérifier si ET2 a été utilisé
                      const et1 = parseFloat(getUENote(i.id, 'ET1')) || 0;
                      const et2 = parseFloat(getUENote(i.id, 'ET2')) || 0;
                      if (et2 > et1 && et2 > 0) usedRattrapage = true;
                  }
              });
              
              const gpa = count > 0 ? (total / count).toFixed(2) : "0.00";
              
              // LOGIQUE DE VALIDATION DYNAMIQUE POUR LE RELEVÉ
              const criteria = localStorage.getItem('validCriteria') || 'moyenne';
              const threshold = parseFloat(localStorage.getItem('validThreshold') || '10');
              let isValidated = false;
              if (criteria === 'moyenne') {
                  isValidated = parseFloat(gpa) >= threshold;
              } else {
                  isValidated = totalCredits >= threshold;
              }

              const session = usedRattrapage ? "Rattrapage" : "Normale";

              const getMention = (m: number) => {
                  if (m >= 16) return "Très Bien";
                  if (m >= 14) return "Bien";
                  if (m >= 12) return "Assez Bien";
                  if (m >= 10) return "Passable";
                  return "Ajourné";
              };

              return (
                <Box sx={{ p: 4, bgcolor: '#f8fafc', borderTop: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>TOTAL CRÉDITS ACQUIS</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>{totalCredits} ECTS</Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>RÉSULTAT & MENTION</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={getMention(parseFloat(gpa))} color={isValidated ? "success" : "error"} sx={{ fontWeight: 900, height: 35 }} />
                            {isValidated && (
                                <Chip label={`Session ${session}`} variant="outlined" sx={{ fontWeight: 700, height: 35, borderColor: usedRattrapage ? 'orange' : 'green', color: usedRattrapage ? 'orange' : 'green' }} />
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block' }}>MOYENNE GÉNÉRALE</Typography>
                        <Typography variant="h3" sx={{ fontWeight: 950, color: '#1e293b' }}>{gpa}/20</Typography>
                    </Box>
                </Box>
              );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc' }}>
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2 }}>Imprimer</Button>
            <Button onClick={() => setGradesDialogOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: 2 }}>
                Sortir
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
