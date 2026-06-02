import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, TextField, InputAdornment, Chip, Grid, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider
} from '@mui/material';
import { 
  AccountBalanceWallet as FinanceIcon, Search as SearchIcon, 
  Payments as PayIcon, History as HistoryIcon, FilterList as FilterIcon,
  TrendingUp as RevenueIcon, Warning as AlertIcon, ReceiptLong as ReceiptIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const Finance: React.FC = () => {
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openPay, setOpenPay] = useState(false);
  const [openReceipt, setOpenReceipt] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  
  const rawFee = localStorage.getItem('tuitionFee') || '500000';
  const TUITION_FEE = Number(String(rawFee).replace(/[^0-9.-]/g, '')) || 500000;

  const loadData = async () => {
    setLoading(true);
    try {
        const [dataE, dataP] = await Promise.all([
            api.get('/etudiants'),
            api.get('/paiements').catch(() => [])
        ]);
        setEtudiants(Array.isArray(dataE) ? dataE : []);
        setPaiements(Array.isArray(dataP) ? dataP : []);
    } catch (e) { 
        console.error("Erreur chargement:", e); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const getStudentBalance = (studentId: any) => {
    const studentPays = paiements.filter(p => String(p.etudiant?.id || p.etudiantId) === String(studentId));
    const paidRaw = studentPays.reduce((acc, p) => {
      const m = p?.montant;
      const num = Number(String(m).replace(/[^0-9.-]/g, '')) || 0;
      return acc + num;
    }, 0);
    const paid = Math.round(paidRaw);
    const remainingRaw = Math.round(TUITION_FEE - paid); // can be negative when overpaid
    const remaining = remainingRaw > 0 ? remainingRaw : 0; // never show negative as remaining
    return { paid, remaining, remainingRaw };
  };

  const handlePayment = async (montant: number) => {
    const { remaining } = getStudentBalance(selectedStudent.id);
    
    // LOGIQUE DE SÉCURITÉ STRICTE
    if (remaining <= 0) {
        alert("Cet étudiant a déjà soldé sa scolarité. Pour corriger un paiement, veuillez contacter l'administrateur.");
        setOpenPay(false);
        return;
    }

    if (montant > remaining) {
        alert("Action refusée : Vous essayez d'encaisser " + montant.toLocaleString() + " FCFA alors que l'étudiant ne doit plus que " + remaining.toLocaleString() + " FCFA.");
        return;
    }

    if (montant <= 0) {
        alert("Veuillez saisir un montant valide supérieur à 0.");
        return;
    }

    const trxId = 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    try {
        const payload = {
            etudiant: { id: selectedStudent.id },
            montant: montant,
            trxId: trxId,
            methode: 'Espèces'
        };
        const response = await api.post('/paiements', payload);
        const newPay = response.data;
        
        await loadData();
        
        setLastPayment(newPay);
        setOpenPay(false);
        setOpenReceipt(true);
        alert("Encaissement réussi de " + montant.toLocaleString() + " FCFA !");
    } catch (error: any) {
        console.error("Erreur détaillée:", error);
        alert("ÉCHEC DU PAIEMENT : " + (error.response?.data?.message || error.message || "Le serveur n'a pas pu enregistrer la transaction."));
    }
  };

  const handleDeletePayment = async (payId: number) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce paiement ? Cette action est irréversible.")) return;
    try {
        await api.delete(`/paiements/${payId}`);
        await loadData();
        alert("Paiement annulé avec succès.");
    } catch (error: any) {
        alert("Erreur lors de la suppression : " + error.message);
    }
  };

  const filteredStudents = etudiants.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = paiements.reduce((acc, p) => acc + parseFloat(p.montant), 0);
  const expectedRevenue = etudiants.length * TUITION_FEE;

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Gestion de la Scolarité</Typography>
        <Typography color="text.secondary">Suivi des encaissements et soldes financiers des étudiants.</Typography>
      </Box>

      {/* FINANCES SUMMARY */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 5, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700 }}>REVENU TOTAL ENCAISSÉ</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, my: 1 }}>{totalRevenue.toLocaleString()} FCFA</Typography>
                <LinearProgress variant="determinate" value={expectedRevenue > 0 ? (totalRevenue / expectedRevenue) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }} />
            </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #f1f5f9' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>TAUX DE RECOUVREMENT</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, my: 1 }}>{Math.round((totalRevenue / (expectedRevenue || 1)) * 100)}%</Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>Objectif : {expectedRevenue.toLocaleString()} FCFA</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #f1f5f9' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>IMPAYÉS TOTAUX</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, my: 1, color: 'error.main' }}>{(expectedRevenue - totalRevenue).toLocaleString()} FCFA</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>Sur {etudiants.length} étudiants inscrits.</Typography>
            </Paper>
        </Grid>
      </Grid>

      {/* STUDENT PAYMENTS TABLE */}
      <Paper sx={{ borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField 
                placeholder="Rechercher un étudiant..." 
                size="small" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, sx: { borderRadius: 3, bgcolor: '#f8fafc', border: 'none' } }}
            />
            <Button startIcon={<FilterIcon />} variant="outlined" sx={{ borderRadius: 3 }}>Filtres</Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Étudiant</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Scolarité Totale</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Versé</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Reliquat</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((s) => {
                const { paid, remaining, remainingRaw } = getStudentBalance(s.id);
                let status = 'Impayé';
                if (remainingRaw < 0) status = 'Crédit';
                else if (remainingRaw === 0) status = 'Soldé';
                else if (paid > 0) status = 'Partiel';
                return (
                  <TableRow key={s.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ borderRadius: 2, bgcolor: 'primary.light' }}>{s.nom[0]}</Avatar>
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{s.nom.toUpperCase()} {s.prenom}</Typography>
                            <Typography variant="caption" color="text.secondary">{s.matricule}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{TUITION_FEE.toLocaleString()} FCFA</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>{paid.toLocaleString()} FCFA</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: remainingRaw > 0 ? 'error.main' : remainingRaw < 0 ? 'success.main' : 'text.primary' }}>
                      {remaining.toLocaleString()} FCFA{remainingRaw < 0 ? ` (Crédit: ${(-remainingRaw).toLocaleString()} FCFA)` : ''}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={status} 
                        size="small" 
                        color={status === 'Soldé' ? 'success' : status === 'Partiel' ? 'warning' : 'error'}
                        sx={{ fontWeight: 800, borderRadius: 1.5 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            {paiements.some(p => (p.etudiant?.id || p.etudiantId) === s.id) && (
                                <>
                                    <IconButton size="small" color="primary" onClick={() => { 
                                        const last = paiements.filter(p => (p.etudiant?.id || p.etudiantId) === s.id).slice(-1)[0];
                                        setSelectedStudent(s); setLastPayment(last); setOpenReceipt(true); 
                                    }}>
                                        <ReceiptIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="secondary" onClick={() => { setSelectedStudent(s); setOpenHistory(true); }}>
                                        <HistoryIcon fontSize="small" />
                                    </IconButton>
                                </>
                            )}
                            <Button 
                                startIcon={<PayIcon />} 
                                size="small" 
                                variant="contained" 
                                onClick={() => { 
                                    setSelectedStudent(s); 
                                const bal = getStudentBalance(s.id);
                                setPayAmount(bal.remaining > 0 ? bal.remaining : 0);
                                    setOpenPay(true); 
                                }}
                                sx={{ borderRadius: 1.5, opacity: 1 }}
                            >
                              {remainingRaw <= 0 ? "Ajuster" : "Encaisser"}
                            </Button>
                        </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* DIALOG ENCAISSEMENT */}
      <Dialog open={openPay} onClose={() => setOpenPay(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>Enregistrer un Paiement</DialogTitle>
        <DialogContent>
            {selectedStudent && (
                <>
                    <Typography variant="body2" sx={{ mb: 1 }}>Étudiant : <b>{selectedStudent.nom?.toUpperCase()} {selectedStudent.prenom}</b></Typography>
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 3, fontWeight: 700 }}>Reste à payer : {getStudentBalance(selectedStudent.id).remaining.toLocaleString()} FCFA</Typography>
                    <TextField 
                        fullWidth 
                        label="Montant à encaisser (FCFA)" 
                        type="number" 
                        value={payAmount} 
                        onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                        autoFocus 
                    />
                </>
            )}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(99, 102, 241, 0.05)', borderRadius: 2, border: '1px dashed #6366f1' }}>
                <Typography variant="caption" sx={{ color: '#6366f1', fontWeight: 700 }}>L'encaissement générera un reçu numérique automatique.</Typography>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPay(false)} color="inherit">Annuler</Button>
            <Button variant="contained" onClick={() => handlePayment(payAmount)} sx={{ borderRadius: 2 }}>Confirmer le paiement</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG REÇU DE PAIEMENT */}
      <Dialog open={openReceipt} onClose={() => setOpenReceipt(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 5 } }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar src={localStorage.getItem('univLogo') || ''} sx={{ width: 60, height: 60, mb: 1, bgcolor: 'primary.main' }}>S</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{localStorage.getItem('univName') || 'SGSU'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>REÇU DE PAIEMENT OFFICIEL</Typography>
            </Box>

            <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

            <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>ID TRANSACTION</Typography>
                <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>{lastPayment?.trxId}</Typography>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>ÉTUDIANT</Typography>
                <Typography variant="body1" sx={{ fontWeight: 800 }}>{selectedStudent?.nom?.toUpperCase()} {selectedStudent?.prenom}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{selectedStudent?.matricule}</Typography>
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Montant Versé :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 900 }}>{lastPayment?.montant?.toLocaleString()} FCFA</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Date :</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {lastPayment?.datePaiement ? new Date(lastPayment.datePaiement).toLocaleString('fr-FR') : '-'}
                    </Typography>
                </Box>
            </Paper>

            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Ce document sert de preuve de paiement de la scolarité pour l'année académique {localStorage.getItem('academicYear')}.</Typography>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button fullWidth variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2.5 }}>Imprimer</Button>
                <Button fullWidth variant="contained" onClick={() => setOpenReceipt(false)} sx={{ borderRadius: 2.5 }}>Fermer</Button>
            </Box>
        </Box>
      </Dialog>

      {/* DIALOG HISTORIQUE DES PAIEMENTS */}
      <Dialog open={openHistory} onClose={() => setOpenHistory(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Historique des Paiements</DialogTitle>
        <DialogContent>
            {selectedStudent && (
                <Box>
                    <Typography variant="body2" sx={{ mb: 2 }}>Étudiant : <b>{selectedStudent.nom?.toUpperCase()} {selectedStudent.prenom}</b></Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Montant</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paiements.filter(p => (p.etudiant?.id || p.etudiantId) === selectedStudent.id).map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell>{new Date(p.datePaiement).toLocaleDateString()}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>{p.montant.toLocaleString()} FCFA</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" color="error" onClick={() => handleDeletePayment(p.id)}>Supprimer</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenHistory(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Finance;
