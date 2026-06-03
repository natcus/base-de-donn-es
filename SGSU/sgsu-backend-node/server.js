require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir le frontend (fichiers statiques)
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// --- Authentification ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nom, email, password, role } = req.body;
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
        const newUser = await prisma.user.create({
            data: { nom, email, password, role: role || 'etudiant' }
        });
        res.json({ message: "Compte créé avec succès.", user: { nom: newUser.nom, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Identifiants invalides." });
        }
        res.json({ nom: user.nom, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Lister les étudiants
app.get('/api/etudiants', async (req, res) => {
    try {
        const etudiants = await prisma.etudiant.findMany();
        res.json(etudiants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ajouter un étudiant
app.post('/api/etudiants', async (req, res) => {
    try {
        const newEtudiant = await prisma.etudiant.create({
            data: {
                ...req.body,
                actif: 1
            }
        });
        res.json(newEtudiant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifier un étudiant
app.put('/api/etudiants/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await prisma.etudiant.update({
            where: { id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(404).json({ message: "Étudiant non trouvé ou erreur." });
    }
});

// Supprimer un étudiant
app.delete('/api/etudiants/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.etudiant.delete({ where: { id } });
        // Les inscriptions, notes, et paiements liés sont supprimés en cascade grâce au schéma
        res.json({ message: "Étudiant supprimé." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lister les cours
app.get('/api/cours', async (req, res) => {
    try {
        const cours = await prisma.cours.findMany();
        res.json(cours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ajouter un cours
app.post('/api/cours', async (req, res) => {
    try {
        const newCours = await prisma.cours.create({ data: req.body });
        res.json(newCours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifier un cours
app.put('/api/cours/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await prisma.cours.update({
            where: { id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(404).json({ message: "Cours non trouvé." });
    }
});

// Supprimer un cours
app.delete('/api/cours/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.cours.delete({ where: { id } });
        res.json({ message: "Cours supprimé." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lister les inscriptions
app.get('/api/inscriptions', async (req, res) => {
    try {
        const inscriptions = await prisma.inscription.findMany();
        res.json(inscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ajouter une inscription
app.post('/api/inscriptions', async (req, res) => {
    try {
        const { etudiantId, coursId } = req.body;

        // Vérifier si existe
        const exists = await prisma.inscription.findFirst({
            where: { etudiantId, coursId }
        });
        if (exists) {
            return res.status(400).json({ message: "Cet étudiant est déjà inscrit à ce cours." });
        }

        const newInscription = await prisma.inscription.create({
            data: {
                etudiantId,
                coursId,
                date: new Date().toISOString().split('T')[0],
                statut: 'Validée'
            }
        });
        res.json(newInscription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Supprimer une inscription
app.delete('/api/inscriptions/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.inscription.delete({ where: { id } });
        res.json({ message: "Inscription annulée." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Modifier une inscription
app.put('/api/inscriptions/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const updated = await prisma.inscription.update({
            where: { id },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(404).json({ message: "Inscription non trouvée." });
    }
});

// Inscriptions groupées
app.post('/api/inscriptions/bulk', async (req, res) => {
    try {
        const { etudiantId, coursIds } = req.body;
        const results = [];

        for (const coursId of coursIds) {
            const exists = await prisma.inscription.findFirst({
                where: { etudiantId, coursId }
            });
            if (!exists) {
                const newIns = await prisma.inscription.create({
                    data: {
                        etudiantId,
                        coursId,
                        date: new Date().toISOString().split('T')[0],
                        statut: 'Validée'
                    }
                });
                results.push(newIns);
            }
        }

        res.json({ message: `${results.length} inscriptions réalisées.`, data: results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MODULE NOTES & EXAMENS ---

app.get('/api/notes', async (req, res) => {
    try {
        const notes = await prisma.note.findMany();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const { inscriptionId, note, type, coefficient, session } = req.body;
        
        const noteValue = parseFloat(note);
        const coefValue = parseFloat(coefficient) || 1;

        if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
            return res.status(400).json({ message: "Note invalide (0-20)." });
        }

        // Vérifier si la note existe
        const existing = await prisma.note.findFirst({
            where: { inscriptionId, type }
        });

        const noteData = {
            inscriptionId,
            type: type || 'CC', 
            note: noteValue,
            coefficient: coefValue,
            session: session || 'Normale',
            date: new Date().toLocaleDateString('fr-FR')
        };

        let result;
        if (existing) {
            result = await prisma.note.update({
                where: { id: existing.id },
                data: noteData
            });
        } else {
            result = await prisma.note.create({
                data: noteData
            });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.note.delete({ where: { id } });
        res.json({ message: "Note supprimée." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- MODULE FINANCES (PAIEMENTS) ---

app.get('/api/paiements', async (req, res) => {
    try {
        const paiements = await prisma.paiement.findMany({
            include: { etudiant: true } // inclut l'étudiant car le front l'attend
        });
        res.json(paiements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/paiements', async (req, res) => {
    try {
        const { etudiant, montant, trxId, methode } = req.body;
        
        const newPaiement = await prisma.paiement.create({
            data: {
                etudiantId: etudiant.id,
                montant: parseFloat(montant),
                trxId: trxId || 'TRX-' + Date.now(),
                methode: methode || 'Espèces',
                datePaiement: new Date().toISOString()
            },
            include: { etudiant: true }
        });
        
        res.json(newPaiement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/paiements/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.paiement.delete({ where: { id } });
        res.json({ message: "Paiement supprimé." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Catch-all : renvoyer le frontend pour toutes les routes non-API (React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(port, () => {
    console.log('✅ Backend SGSU (PostgreSQL via Prisma) prêt !');
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
