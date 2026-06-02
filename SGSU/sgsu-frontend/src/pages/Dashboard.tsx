import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, 
  Chip, LinearProgress
} from '@mui/material';
import { 
  People as StudentsIcon, School as CoursesIcon, AssignmentTurnedIn as EnrollIcon,
  TrendingUp as SuccessIcon, Male as MaleIcon, Female as FemaleIcon
} from '@mui/icons-material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend
} from 'recharts';
import { api } from '../services/api';

const StatCard = ({ title, value, icon, color, trend }: any) => (
  <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}.light`, color: `${color}.main` }}>{icon}</Box>
      {trend && <Chip label={trend} size="small" color="success" sx={{ fontWeight: 800, fontSize: '10px' }} />}
    </Box>
    <Typography variant="h4" sx={{ fontWeight: 900 }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
  </Paper>
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<{etudiants: any[], cours: any[], inscriptions: any[], notes: any[]}>({ 
    etudiants: [], cours: [], inscriptions: [], notes: [] 
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [eData, cData, iData, nData] = await Promise.all([
        api.get('/etudiants').catch(() => []),
        api.get('/cours').catch(() => []),
        api.get('/inscriptions').catch(() => []),
        api.get('/notes').catch(() => [])
      ]);
      
      setData({
        etudiants: Array.isArray(eData) ? eData : [],
        cours: Array.isArray(cData) ? cData : [],
        inscriptions: Array.isArray(iData) ? iData : [],
        notes: Array.isArray(nData) ? nData : []
      });
    } catch (e) { 
      console.error("Erreur chargement Dashboard:", e);
      setData({ etudiants: [], cours: [], inscriptions: [], notes: [] });
    }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- LOGIQUE DE CALCUL DES DONNÉES POUR LES GRAPHIQUES ---
  const getAcademicResults = () => {
    let validated = 0; let failed = 0;
    data.etudiants.forEach((e: any) => {
        const studentIns = data.inscriptions.filter((i: any) => i.etudiantId === e.id);
        let totalMoy = 0; let count = 0;
        studentIns.forEach((ins: any) => {
            const getNote = (t: string) => data.notes.find((n: any) => (n.inscription?.id === ins.id || n.inscriptionId === ins.id) && n.type === t)?.valeur || 0;
            const cc = getNote('CC');
            const et1 = getNote('ET1');
            const et2 = getNote('ET2');
            totalMoy += (cc * 0.4 + Math.max(et1, et2) * 0.6);
            count++;
        });
        const gpa = count > 0 ? totalMoy / count : 0;
        if (count > 0) {
            if (gpa >= 10) validated++;
            else failed++;
        }
    });
    return [
        { name: 'Admis', value: validated, color: '#10b981' },
        { name: 'Ajournés', value: failed, color: '#ef4444' }
    ];
  };

  const getFiliereData = () => {
    const stats: any = {};
    data.etudiants.forEach((e: any) => {
        stats[e.filiere] = (stats[e.filiere] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  };

  const getGenderData = () => {
    let male = 0; let female = 0;
    data.etudiants.forEach((e: any) => {
        if (e.sexe === 'Masculin') male++;
        else female++;
    });
    return [
        { name: 'Hommes', value: male, color: '#6366f1' },
        { name: 'Femmes', value: female, color: '#ec4899' }
    ];
  };

  if (loading) return <LinearProgress />;

  const successRate = getAcademicResults();
  const filiereData = getFiliereData();
  const genderData = getGenderData();

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Tableau de Bord BI</Typography>
        <Typography color="text.secondary">Analyse en temps réel de la performance académique de l'établissement.</Typography>
      </Box>

      {/* KPIs Grid */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Étudiants" value={data.etudiants.length} icon={<StudentsIcon />} color="primary" trend="+5%" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Matières (UE)" value={data.cours.length} icon={<CoursesIcon />} color="secondary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Taux de Réussite" value={`${Math.round((successRate[0].value / (successRate[0].value + successRate[1].value || 1)) * 100)}%`} icon={<SuccessIcon />} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Inscriptions" value={data.inscriptions.length} icon={<EnrollIcon />} color="warning" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* GRAPHIQUE BARRES : FILIÈRES */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Effectifs par Filière</Typography>
            <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer>
                    <BarChart data={filiereData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <RechartsTooltip 
                            cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                            {filiereData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* PIE CHART : RÉUSSITE */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9', height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Bilan Académique</Typography>
            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={successRate}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {successRate.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Taux global basé sur les notes saisies.</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* GENRE ET DERNIÈRES ACTIVITÉS */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Mixité (Genre)</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', mb: 1, width: 56, height: 56 }}><MaleIcon fontSize="large" /></Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{genderData[0].value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>HOMMES</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', mb: 1, width: 56, height: 56 }}><FemaleIcon fontSize="large" /></Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{genderData[1].value}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>FEMMES</Typography>
                </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, borderRadius: 6, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Inscriptions Récentes</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {data.inscriptions.slice(-4).reverse().map((ins: any, idx) => {
                const s = data.etudiants.find((e: any) => e.id === ins.etudiantId);
                const c = data.cours.find((cr: any) => cr.id === ins.coursId);
                return (
                  <React.Fragment key={ins.id}>
                    <ListItem sx={{ py: 1.5, px: 3 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', borderRadius: 2 }}>{s?.nom ? s.nom[0] : '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="body2" sx={{ fontWeight: 800 }}>{s?.nom?.toUpperCase()} {s?.prenom}</Typography>}
                        secondary={`${c?.titre} (${c?.code})`}
                      />
                      <Chip label={ins.date} size="small" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    </ListItem>
                    {idx < 3 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
