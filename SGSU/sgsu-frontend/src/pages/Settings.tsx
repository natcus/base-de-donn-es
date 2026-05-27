import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider, Alert, Switch, FormControlLabel, MenuItem
} from '@mui/material';
import { 
  Settings as SettingsIcon, Business as UnivIcon, Person as UserIcon, 
  Save as SaveIcon, Security as SecurityIcon
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [univName, setUnivName] = useState(localStorage.getItem('univName') || 'SGSU UNIVERSITY');
  const [academicYear, setAcademicYear] = useState(localStorage.getItem('academicYear') || '2024-2025');
  const [codeEtab, setCodeEtab] = useState(localStorage.getItem('codeEtab') || 'SGSU-001');
  const [validCriteria, setValidCriteria] = useState(localStorage.getItem('validCriteria') || 'moyenne'); // 'moyenne' ou 'credits'
  const [validThreshold, setValidThreshold] = useState(localStorage.getItem('validThreshold') || '10');
  const [tuitionFee, setTuitionFee] = useState(localStorage.getItem('tuitionFee') || '500000');
  const [logo, setLogo] = useState(localStorage.getItem('univLogo') || '');
  const [success, setSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem('univLogo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveUniv = () => {
    localStorage.setItem('univName', univName);
    localStorage.setItem('academicYear', academicYear);
    localStorage.setItem('codeEtab', codeEtab);
    localStorage.setItem('validCriteria', validCriteria);
    localStorage.setItem('validThreshold', validThreshold);
    localStorage.setItem('tuitionFee', tuitionFee);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    window.location.reload(); 
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Paramètres Système</Typography>
        <Typography color="text.secondary">Configurez l'identité de votre établissement et vos préférences.</Typography>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 4, borderRadius: 3 }}>Paramètres enregistrés avec succès !</Alert>}

      <Grid container spacing={4}>
        {/* CONFIGURATION UNIVERSITÉ */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Box sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}><UnivIcon /></Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Identité de l'Université</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                <Avatar src={logo} sx={{ width: 100, height: 100, borderRadius: 3, bgcolor: 'primary.main', fontSize: 40 }}>{univName?.charAt(0) || 'U'}</Avatar>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>LOGO DE L'UNIVERSITÉ</Typography>
                    <Button variant="outlined" component="label" size="small" sx={{ borderRadius: 2 }}>
                        Changer le logo
                        <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Button>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>Format JPG, PNG. Max 2MB.</Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField 
                        fullWidth 
                        label="Nom de l'Université" 
                        value={univName} 
                        onChange={(e) => setUnivName(e.target.value)} 
                        helperText="S'affichera sur les relevés de notes et les cartes d'étudiants."
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth 
                        label="Année Académique" 
                        value={academicYear} 
                        onChange={(e) => setAcademicYear(e.target.value)} 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth 
                        label="Code Établissement" 
                        value={codeEtab} 
                        onChange={(e) => setCodeEtab(e.target.value)} 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField 
                        fullWidth 
                        label="Frais de Scolarité (Par défaut)" 
                        type="number"
                        value={tuitionFee} 
                        onChange={(e) => setTuitionFee(e.target.value)} 
                    />
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ p: 1, bgcolor: 'secondary.light', color: 'secondary.main', borderRadius: 2 }}><SecurityIcon /></Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Critères de Promotion</Typography>
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <TextField 
                        select fullWidth label="Critère de Validation" 
                        value={validCriteria} onChange={(e) => setValidCriteria(e.target.value)}
                    >
                        <MenuItem value="moyenne">Moyenne Générale</MenuItem>
                        <MenuItem value="credits">Total de Crédits (ECTS)</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField 
                        fullWidth label="Seuil de Réussite" type="number"
                        value={validThreshold} onChange={(e) => setValidThreshold(e.target.value)}
                        helperText={validCriteria === 'moyenne' ? "Ex: 10 sur 20" : "Ex: 30 crédits"}
                    />
                </Grid>
            </Grid>

            <Button 
                variant="contained" 
                startIcon={<SaveIcon />} 
                onClick={handleSaveUniv}
                sx={{ mt: 4, py: 1.5, px: 4, borderRadius: 3, fontWeight: 800 }}
            >
                Sauvegarder les changements
            </Button>
          </Paper>
        </Grid>

        {/* PRÉFÉRENCES & SÉCURITÉ */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ p: 1, bgcolor: 'secondary.light', color: 'secondary.main', borderRadius: 2 }}><SecurityIcon /></Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Sécurité</Typography>
                </Box>
                <FormControlLabel control={<Switch defaultChecked />} label="Double authentification (2FA)" />
                <FormControlLabel control={<Switch defaultChecked />} label="Logs de connexion" />
                <Divider sx={{ my: 2 }} />
                <Button variant="outlined" fullWidth sx={{ borderRadius: 3 }}>Changer mon mot de passe</Button>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9', bgcolor: '#1e293b', color: 'white' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Mode Maintenance</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>Désactivez l'accès public pour effectuer des mises à jour.</Typography>
                <Button variant="contained" color="error" fullWidth sx={{ borderRadius: 3, fontWeight: 800 }}>Activer</Button>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
