import React, { useState } from 'react';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, 
  ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, useTheme, Paper, CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as EnrollmentIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Timeline as TimelineIcon,
  ContactPage as CardsIcon,
  AccountBalanceWallet as FinanceIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 280;

const Layout: React.FC = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin SGSU","role":"admin"}');

  const menuItems = [
    { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/' },
    { text: 'Dossiers Étudiants', icon: <PeopleIcon />, path: '/students' },
    { text: 'Offre de Formation', icon: <SchoolIcon />, path: '/courses' },
    { text: 'Inscriptions', icon: <EnrollmentIcon />, path: '/enrollments' },
    { text: 'Scolarité (Finances)', icon: <FinanceIcon />, path: '/finance' }, // AJOUTÉ ICI
    { text: 'Notes & Examens', icon: <TimelineIcon />, path: '/grades' },
    { text: 'Cartes Étudiants', icon: <CardsIcon />, path: '/cards' },
    { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* LOGO DYNAMIQUE */}
      <Box sx={{ px: 2, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ 
          width: 40, height: 40, bgcolor: 'white', 
          borderRadius: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          border: '1px solid #f1f5f9'
        }}>
          {localStorage.getItem('univLogo') ? (
            <img src={localStorage.getItem('univLogo')!} alt="Logo" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
          ) : (
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 900 }}>
                {(localStorage.getItem('univName') || 'S')[0]}
            </Typography>
          )}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.5, color: '#1e293b', fontSize: '1.1rem' }}>
          {localStorage.getItem('univName') || 'SGSU'} 
          <span style={{ color: theme.palette.primary.main, fontSize: '0.7rem', verticalAlign: 'top', marginLeft: '4px' }}>v1.0</span>
        </Typography>
      </Box>

      {/* NAVIGATION */}
      <List sx={{ mt: 2, flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
        {menuItems.map((item) => {
          // Sécurité stricte : Les enseignants n'ont pas accès aux modules administratifs
          if (user.role === 'prof' && (item.path === '/' || item.path === '/enrollments' || item.path === '/settings' || item.path === '/finance')) return null;

          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={{
                  borderRadius: 3, py: 1.5, px: 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'white' : '#64748b',
                  '&:hover': { bgcolor: active ? 'primary.main' : 'rgba(99, 102, 241, 0.08)', color: active ? 'white' : 'primary.main' },
                  transition: 'all 0.2s'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: active ? 700 : 600, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2, opacity: 0.5 }} />

      <Box sx={{ p: 1 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 3, py: 1.2, color: '#ef4444' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(12px)', color: '#1e293b', display: { xs: 'none', md: 'block' }, borderBottom: '1px solid #f1f5f9' }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 4 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {menuItems.find(i => i.path === location.pathname)?.text?.toUpperCase() || 'ACCUEIL'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}><Badge variant="dot" color="error"><NotificationsIcon sx={{ fontSize: 20 }} /></Badge></IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1 }}>{user.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{user.role === 'admin' ? 'Administrateur' : 'Enseignant'}</Typography>
              </Box>
              <Avatar sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: user.role === 'admin' ? 'primary.main' : 'secondary.main', fontWeight: 800 }}>{user.name[0]}</Avatar>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, my: 'auto' }} />
            <IconButton onClick={handleLogout} color="error" sx={{ bgcolor: 'rgba(239, 68, 68, 0.08)', borderRadius: 2 }}>
              <LogoutIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}>{drawer}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none', bgcolor: 'transparent', p: 2.5 } }} open>
          <Paper sx={{ height: '100%', borderRadius: 6, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', border: '1px solid #f1f5f9', overflow: 'hidden', background: 'white' }}>{drawer}</Paper>
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 4, md: 6 }, width: { md: `calc(100% - ${drawerWidth}px)` }, mt: '64px', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
