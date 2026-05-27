import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, Autocomplete, TextField, Avatar, Chip, Grid, Alert, LinearProgress
} from '@mui/material';
import { 
  CloudDone as CloudDoneIcon, CloudUpload as CloudUploadIcon, TrendingUp as StatsIcon,
  FileUpload as ImportIcon, FileDownload as ExportIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const Grades: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [cours, setCours] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedCours, setSelectedCours] = useState<any>(null);
  const [localGrades, setLocalGrades] = useState<any>({}); 
  const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState({ text: '', type: 'info' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [dataI, dataE, dataC, dataN] = await Promise.all([
        api.get('/inscriptions'), api.get('/etudiants'), api.get('/cours'), api.get('/notes')
      ]);
      setInscriptions(Array.isArray(dataI) ? dataI : []); setEtudiants(Array.isArray(dataE) ? dataE : []); setCours(Array.isArray(dataC) ? dataC : []); setNotes(Array.isArray(dataN) ? dataN : []);

      const structured: any = {};
      if (Array.isArray(dataN)) {
          dataN.forEach((n: any) => {
            const insId = n.inscription?.id || n.inscriptionId;
            if (insId) {
                if (!structured[insId]) structured[insId] = { CC: '', ET1: '', ET2: '' };
                const noteVal = (n.valeur !== undefined && n.valeur !== null) ? n.valeur : n.note;
                structured[insId][n.type] = noteVal?.toString() || '';
            }
          });
      }
      setLocalGrades(structured);
      if (dataI.length === 0) console.warn("Attention: Aucune inscription trouvée en base de données.");
    } catch (error: any) { 
        console.error(error); 
        alert("Erreur lors du chargement des données : " + error.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleGradeChange = (insId: number, type: string, value: string) => {
    let val = parseFloat(value);
    if (val > 20) val = 20; if (val < 0) val = 0;
    const finalVal = isNaN(val) ? '' : val.toString();

    setLocalGrades((prev: any) => ({
      ...prev,
      [insId]: { ...(prev[insId] || { CC: '', ET1: '', ET2: '' }), [type]: finalVal }
    }));
    setUnsavedChanges(prev => new Set(prev).add(`${insId}_${type}`));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const notesToSave = Array.from(unsavedChanges).map(change => {
        const [insId, type] = change.split('_');
        const valeur = localGrades[insId][type];
        return { 
            inscription: { id: Number(insId) }, 
            valeur: Number(valeur), 
            type 
        };
      });
      
      await api.post('/notes/batch', notesToSave);
      
      setMessage({ text: "Toutes les notes ont été synchronisées avec succès.", type: 'success' });
      setUnsavedChanges(new Set());
      loadData();
      alert("Notes sauvegardées avec succès !");
    } catch (error: any) { 
        console.error("Erreur sauvegarde:", error);
        setMessage({ text: "Erreur de sauvegarde.", type: 'error' }); 
        alert("Échec de la sauvegarde : " + (error.message || "Erreur serveur"));
    } finally { setSaving(false); }
  };

  const calculateMoy = (insId: number) => {
    const g = localGrades[insId] || { CC: '', ET1: '', ET2: '' };
    const cc = parseFloat(g.CC) || 0;
    const et1 = parseFloat(g.ET1) || 0;
    const et2 = parseFloat(g.ET2) || 0;
    const bestET = Math.max(et1, et2);
    if (g.CC === '' && g.ET1 === '' && g.ET2 === '') return null;
    return (cc * 0.4 + bestET * 0.6).toFixed(2);
  };

  const filteredInscriptions = selectedCours ? inscriptions.filter(i => (i.cours?.id || i.coursId) === selectedCours.id) : [];

  const classAverage = () => {
    if (filteredInscriptions.length === 0) return 0;
    let total = 0; let count = 0;
    filteredInscriptions.forEach(i => {
      const moy = calculateMoy(i.id);
      if (moy) { total += parseFloat(moy); count++; }
    });
    return count > 0 ? (total / count).toFixed(2) : "0.00";
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        let count = 0;
        const newNotes = [];

        for (let i = 1; i < lines.length; i++) {
            const [mat, code, type, note] = lines[i].split(",").map(c => c.trim());
            if (mat && code && type && note) {
                const s = etudiants.find(e => e.matricule === mat);
                const c = cours.find(cr => cr.code === code);
                if (s && c) {
                    const ins = inscriptions.find(ins => (ins.etudiant?.id || ins.etudiantId) === s.id && (ins.cours?.id || ins.coursId) === c.id);
                    if (ins) {
                        newNotes.push({ inscriptionId: ins.id, type, note: parseFloat(note), coefficient: 1 });
                        count++;
                    }
                }
            }
        }

        if (newNotes.length > 0) {
            setSaving(true);
            try {
                await api.post('/notes/batch', newNotes.map(n => ({
                    inscription: { id: n.inscriptionId },
                    valeur: n.note,
                    type: n.type
                })));
                loadData();
                setMessage({ text: `${count} notes importées avec succès !`, type: 'success' });
            } catch (err) {
                setMessage({ text: "Erreur lors de l'importation bulk.", type: 'error' });
            } finally {
                setSaving(false);
            }
        }
    };
    reader.readAsText(file);
  };

  const handleExportTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Matricule,CodeUE,Type(CC/ET1/ET2),Note\nMAT-001,INF101,CC,14.5";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modele_import_notes.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Box>
      {saving && <LinearProgress color="secondary" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 3000 }} />}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box><Typography variant="h4" sx={{ fontWeight: 800 }}>Saisie des Notes</Typography><Typography color="text.secondary">Gestionnaire de sessions CC / ET1 / ET2</Typography></Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {selectedCours && <Chip icon={<StatsIcon />} label={`Moyenne de classe: ${classAverage()}/20`} color="primary" variant="outlined" sx={{ fontWeight: 800, px: 1 }} />}
            <Button variant="outlined" startIcon={<ExportIcon />} onClick={handleExportTemplate} sx={{ borderRadius: 3 }}>Modèle</Button>
            <Button variant="outlined" component="label" startIcon={<ImportIcon />} sx={{ borderRadius: 3 }}>
                Importer
                <input type="file" hidden accept=".csv" onChange={handleImportCSV} />
            </Button>
            {unsavedChanges.size > 0 && <Button variant="contained" color="warning" onClick={handleSaveAll} startIcon={<CloudUploadIcon />} sx={{ borderRadius: 3, fontWeight: 800 }}>Enregistrer ({unsavedChanges.size})</Button>}
        </Box>
      </Box>

      {message.text && <Alert severity={message.type as any} sx={{ mb: 3 }} onClose={() => setMessage({text:'', type:'info'})}>{message.text}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #f1f5f9' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>SÉLECTION UE</Typography>
            <Autocomplete 
                options={cours} 
                getOptionLabel={(o) => `${o.code} - ${o.titre} (L${o.niveau || '?'} ${o.filiere || ''})`} 
                value={selectedCours} 
                onChange={(_, v) => setSelectedCours(v)} 
                isOptionEqualToValue={(o,v) => o.id === v.id} 
                renderInput={(p) => <TextField {...p} label="Rechercher UE (Code, Titre, Filière)" variant="outlined" />} 
                renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{option.titre}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip label={option.code} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            <Chip label={`L${option.niveau || '?'} ${option.filiere || ''}`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                            <Chip label={option.semestre} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        </Box>
                    </Box>
                )}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>LISTE DES ÉTUDIANTS - {selectedCours?.titre || 'Veuillez choisir une UE'}</Typography>
              {unsavedChanges.size === 0 && selectedCours && <Chip icon={<CloudDoneIcon />} label="Données à jour" color="success" size="small" />}
            </Box>
            {!selectedCours ? <Box sx={{ py: 10, textAlign: 'center' }}><Typography color="text.secondary">Aucun cours sélectionné.</Typography></Box> : (
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}><TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>ÉTUDIANT</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>CC (40%)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>ET1 (60%)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>ET2 (Ratt.)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>MOYENNE</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {filteredInscriptions.map(i => {
                      const etId = i.etudiant?.id || i.etudiantId;
                      const s = etudiants.find(e => e.id === etId);
                      const g = localGrades[i.id] || { CC: '', ET1: '', ET2: '' };
                      const moy = calculateMoy(i.id);
                      return (
                        <TableRow key={i.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 28, height: 28, fontSize: 10, bgcolor: 'primary.light' }}>{s?.nom[0]}</Avatar>
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{s?.nom?.toUpperCase()} {s?.prenom}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>{s?.matricule}</Typography>
                                </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center"><TextField size="small" value={g.CC} onChange={(e) => handleGradeChange(i.id, 'CC', e.target.value)} sx={{ width: 65, '& .MuiOutlinedInput-input': { fontWeight: 800, textAlign: 'center', p: 1 } }} /></TableCell>
                          <TableCell align="center"><TextField size="small" value={g.ET1} onChange={(e) => handleGradeChange(i.id, 'ET1', e.target.value)} sx={{ width: 65, '& .MuiOutlinedInput-input': { fontWeight: 800, textAlign: 'center', p: 1 } }} /></TableCell>
                          <TableCell align="center"><TextField size="small" value={g.ET2} onChange={(e) => handleGradeChange(i.id, 'ET2', e.target.value)} sx={{ width: 65, '& .MuiOutlinedInput-input': { fontWeight: 800, textAlign: 'center', p: 1 } }} /></TableCell>
                          <TableCell align="center">
                            {moy ? <Chip label={moy} color={parseFloat(moy) >= 10 ? "success" : "error"} size="small" sx={{ fontWeight: 900, borderRadius: 1 }} /> : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Grades;
