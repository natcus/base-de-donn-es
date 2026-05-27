import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Autocomplete, TextField, Avatar, Divider, Chip
} from '@mui/material';
import { 
  Badge as CardIcon, Print as PrintIcon, QrCode as QrIcon, Phone as PhoneIcon, Home as HomeIcon, VerifiedUser as ShieldIcon
} from '@mui/icons-material';

import { api } from '../services/api';

const Cards: React.FC = () => {
  const [etudiants, setEtudiants] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const univName = localStorage.getItem('univName') || 'SGSU UNIVERSITY';
  const univLogo = localStorage.getItem('univLogo') || '';
  const academicYear = localStorage.getItem('academicYear') || '2024-2025';

  useEffect(() => {
    api.get('/etudiants')
      .then(data => setEtudiants(Array.isArray(data) ? data : []))
      .catch(e => console.error(e));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const StudentCard = ({ student }: { student: any }) => {
    if (!student) return null;

    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(univName)}-${student.matricule}`;

    // Couleurs premium selon le genre
    const isFemale = student.sexe === 'Féminin';
    const bgGradient = isFemale 
        ? 'linear-gradient(135deg, #be185d 0%, #831843 100%)' 
        : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    const accentColor = isFemale ? '#fbcfe8' : '#e0f2fe';

    return (
      <Box id="printable-card" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 'max-content', mx: 'auto' }}>
        
        {/* === FACE AVANT === */}
        <Paper 
          elevation={16}
          sx={{ 
            width: '85.6mm', // Dimension standard carte CR80
            height: '54mm', 
            borderRadius: '10px', 
            background: bgGradient,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxSizing: 'border-box'
          }}
        >
            {/* Effet Holographique (Reflet) */}
            <Box sx={{ 
                position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%', 
                background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)', 
                transform: 'skewX(-25deg)', zIndex: 0, opacity: 0.5 
            }} />
            
            {/* Design Abstrait Arrière-plan */}
            <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', filter: 'blur(30px)' }} />
            <Box sx={{ position: 'absolute', bottom: -50, left: -20, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.03)', filter: 'blur(20px)' }} />

            {/* CONTENU GAUCHE */}
            <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 1 }}>
                
                {/* Header : Logo & Nom de l'Université */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {univLogo ? (
                        <Box component="img" src={univLogo} sx={{ height: 24, width: 24, objectFit: 'contain', borderRadius: 0.5, bgcolor: 'white', p: 0.3 }} />
                    ) : (
                        <Box sx={{ width: 24, height: 24, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.9)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14 }}>{univName.charAt(0)}</Box>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 900, letterSpacing: 0.5, fontSize: '0.75rem', textTransform: 'uppercase' }}>{univName}</Typography>
                </Box>

                {/* Informations de l'Étudiant */}
                <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1, textTransform: 'uppercase', mb: 0.5 }}>{student.nom} <span style={{ fontWeight: 400 }}>{student.prenom}</span></Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: 1, color: accentColor, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.1)', px: 1, py: 0.2, borderRadius: 1 }}>
                            ID: {student.matricule || 'N/A'}
                        </Typography>
                        <Chip label={student.sexe === 'Féminin' ? 'F' : 'M'} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 900 }} />
                    </Box>

                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography sx={{ fontSize: '0.45rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Filière</Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.1 }}>{student.filiere}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography sx={{ fontSize: '0.45rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Niveau</Typography>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.1 }}>Licence {student.niveau}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* CONTENU DROIT (PHOTO 3:4) */}
            <Box sx={{ width: '30mm', p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.03)', borderLeft: '1px solid rgba(255,255,255,0.08)', zIndex: 1 }}>
                {/* Emplacement Photo d'identité (Ratio 3:4) */}
                <Box sx={{ 
                    width: '24mm', height: '32mm', 
                    borderRadius: 1, 
                    bgcolor: 'rgba(255,255,255,0.15)', 
                    border: '2px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', mb: 1
                }}>
                    <Typography sx={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>
                        {student.nom?.charAt(0) || '?'}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShieldIcon sx={{ fontSize: 10, color: accentColor }} />
                    <Typography sx={{ fontSize: '0.45rem', fontWeight: 800, color: accentColor, letterSpacing: 0.5 }}>ÉTUDIANT</Typography>
                </Box>
            </Box>
        </Paper>

        {/* === FACE ARRIÈRE === */}
        <Paper 
          elevation={4}
          sx={{ 
            width: '85.6mm', 
            height: '54mm', 
            borderRadius: '10px', 
            bgcolor: 'white',
            color: '#1e293b',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            border: '1px solid #cbd5e1',
            boxSizing: 'border-box'
          }}
        >
            {/* Bande Magnétique (Design) */}
            <Box sx={{ width: '100%', height: '10mm', bgcolor: '#0f172a', mt: 2, opacity: 0.9 }} />

            <Box sx={{ display: 'flex', p: 2, flex: 1 }}>
                {/* Colonne Gauche */}
                <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}><PhoneIcon sx={{ fontSize: 10 }} /> TÉLÉPHONE</Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, mb: 1 }}>{student.telephone || 'Non renseigné'}</Typography>
                    
                    <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}><HomeIcon sx={{ fontSize: 10 }} /> ADRESSE</Typography>
                    <Typography sx={{ fontSize: '0.6rem', lineHeight: 1.2, mb: 1 }}>{student.adresse || 'Aucune adresse enregistrée'}</Typography>

                    <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}><CardIcon sx={{ fontSize: 10 }} /> ANNÉE ACADÉMIQUE</Typography>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900 }}>{academicYear}</Typography>
                </Box>

                {/* Colonne Droite (QR) */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderLeft: '1px dashed #cbd5e1', pl: 2 }}>
                    <Box component="img" src={qrUrl} sx={{ width: '22mm', height: '22mm', p: 0.5, border: '1px solid #e2e8f0', borderRadius: 1 }} />
                    <Typography sx={{ fontSize: '0.45rem', fontWeight: 800, mt: 0.5, color: '#64748b' }}>SCAN TO VERIFY</Typography>
                </Box>
            </Box>

            <Box sx={{ width: '100%', bgcolor: '#f8fafc', p: 1, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ textAlign: 'center', fontSize: '0.40rem', color: '#64748b', lineHeight: 1.2 }}>
                    Cette carte est la propriété stricte de {univName}. En cas de perte, merci de la rapporter à l'administration. Ce document est strictement personnel et incessible.
                </Typography>
            </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      {/* === STYLES D'IMPRESSION GLOBAUX === */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-card, #printable-card * { visibility: visible; }
          #printable-card { 
            position: absolute; 
            left: 50%; 
            top: 50%; 
            transform: translate(-50%, -50%); 
            width: auto; 
            margin: 0;
          }
          @page { size: auto; margin: 0; }
        }
      `}</style>

      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>Cartes d'Étudiants</Typography>
            <Typography color="text.secondary">Génération de badges officiels au format standard CR80 (85.6 x 54 mm).</Typography>
        </Box>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!selectedStudent} sx={{ borderRadius: 3, py: 1.5, px: 4, fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)' }}>Imprimer la Carte</Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ '@media print': { display: 'none' } }}>
          <Paper sx={{ p: 4, borderRadius: 6, border: '1px solid #f1f5f9', position: 'sticky', top: 100 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>SÉLECTION DE L'ÉTUDIANT</Typography>
            <Autocomplete 
                options={etudiants} 
                getOptionLabel={(o) => `${o.nom.toUpperCase()} ${o.prenom} (${o.matricule})`} 
                value={selectedStudent} 
                onChange={(_, v) => setSelectedStudent(v)} 
                renderInput={(p) => <TextField {...p} label="Rechercher par nom ou matricule..." variant="outlined" />} 
            />
            
            {selectedStudent && (
                <Box sx={{ mt: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>INSTRUCTIONS D'IMPRESSION</Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        1. Insérez des cartes PVC CR80 dans votre imprimante.<br/>
                        2. Cliquez sur "Imprimer".<br/>
                        3. Dans les options de votre navigateur, assurez-vous que <b>"Graphiques d'arrière-plan"</b> est coché.<br/>
                        4. Décochez "En-têtes et pieds de page".
                    </Typography>
                </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {!selectedStudent ? (
            <Paper sx={{ height: 400, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8fafc', border: '2px dashed #e2e8f0', '@media print': { display: 'none' } }}>
              <Typography color="text.disabled" sx={{ fontWeight: 600 }}>Veuillez sélectionner un étudiant pour visualiser la maquette.</Typography>
            </Paper>
          ) : ( 
            <Box sx={{ p: 4, bgcolor: '#f1f5f9', borderRadius: 6, display: 'flex', justifyContent: 'center' }}>
                <StudentCard student={selectedStudent} />
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cards;

