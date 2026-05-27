import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Alert, Container
} from '@mui/material';
import {
  Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff,
  School as SchoolIcon, ArrowForward as ArrowIcon
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email === 'admin@sgsu.edu' && formData.password === 'admin123') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin', name: 'Admin' }));
      window.location.href = '/';
    } else if (formData.email === 'pro@sgsu.edu' && formData.password === 'pro123') {
      localStorage.setItem('user', JSON.stringify({ role: 'prof', name: 'Professeur' }));
      window.location.href = '/grades';
    } else {
      setError('Identifiants invalides. Utilisez admin@sgsu.edu / admin123');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Éléments de design en arrière-plan */}
      <Box sx={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(100px)' }} />
      <Box sx={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', filter: 'blur(100px)' }} />

      <Container maxWidth="xs" sx={{ zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: 5,
            borderRadius: 8,
            textAlign: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Box sx={{
            width: 70,
            height: 70,
            bgcolor: 'primary.main',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)'
          }}>
            <SchoolIcon sx={{ color: 'white', fontSize: 35 }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, color: '#1e293b' }}>Bienvenue</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
            Connectez-vous pour accéder à ENASTIC.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Adresse Email"
              variant="outlined"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { borderRadius: 3 }
              }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: 3 }
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              endIcon={<ArrowIcon />}
              sx={{
                mt: 4,
                py: 2,
                borderRadius: 4,
                fontWeight: 800,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
              }}
            >
              Se Connecter
            </Button>
          </form>

          <Box sx={{ mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Mot de passe oublié ? <span style={{ color: '#6366f1', fontWeight: 700, cursor: 'pointer' }}>Contactez l'administrateur</span>
            </Typography>
          </Box>
        </Paper>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 4, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
          SGSU v1.0 • Système de Gestion Académique Premium
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;
