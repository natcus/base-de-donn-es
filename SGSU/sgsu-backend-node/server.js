const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8081;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialisation de la base de données JSON
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        etudiants: [
            { id: 1, matricule: '2024001', nom: 'Doe', prenom: 'John', email: 'john@univ.edu', filiere: 'Informatique', niveau: 1, actif: 1 }
        ],
        cours: [
            { id: 1, code: 'INF101', titre: 'Introduction à l\'Algorithmique', credits: 6, semestre: 'S1', filiere: 'Informatique' }
        ],
        inscriptions: [],
        notes: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

// Fonction pour lire les données
const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Fonction pour écrire les données
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- API Routes ---

// Lister les étudiants
app.get('/api/etudiants', (req, res) => {
    const db = readDB();
    res.json(db.etudiants);
});

// Ajouter un étudiant
app.post('/api/etudiants', (req, res) => {
    const db = readDB();
    const newEtudiant = {
        id: Date.now(),
        ...req.body,
        actif: 1
    };
    db.etudiants.push(newEtudiant);
    writeDB(db);
    res.json(newEtudiant);
});

// Modifier un étudiant
app.put('/api/etudiants/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.etudiants.findIndex(e => e.id === id);
    if (index !== -1) {
        db.etudiants[index] = { ...db.etudiants[index], ...req.body };
        writeDB(db);
        res.json(db.etudiants[index]);
    } else {
        res.status(404).json({ message: "Étudiant non trouvé." });
    }
});

// Supprimer un étudiant
app.delete('/api/etudiants/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    db.etudiants = db.etudiants.filter(e => e.id !== id);
    // On supprime aussi ses inscriptions par cascade
    db.inscriptions = db.inscriptions.filter(i => i.etudiantId !== id);
    writeDB(db);
    res.json({ message: "Étudiant supprimé." });
});

// Lister les cours
app.get('/api/cours', (req, res) => {
    const db = readDB();
    res.json(db.cours);
});

// Ajouter un cours
app.post('/api/cours', (req, res) => {
    const db = readDB();
    const newCours = {
        id: Date.now(),
        ...req.body
    };
    db.cours.push(newCours);
    writeDB(db);
    res.json(newCours);
});

// Modifier un cours
app.put('/api/cours/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.cours.findIndex(c => c.id === id);
    if (index !== -1) {
        db.cours[index] = { ...db.cours[index], ...req.body };
        writeDB(db);
        res.json(db.cours[index]);
    } else {
        res.status(404).json({ message: "Cours non trouvé." });
    }
});

// Supprimer un cours
app.delete('/api/cours/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    db.cours = db.cours.filter(c => c.id !== id);
    // On supprime aussi les inscriptions à ce cours par cascade
    db.inscriptions = db.inscriptions.filter(i => i.coursId !== id);
    writeDB(db);
    res.json({ message: "Cours supprimé." });
});

// Lister les inscriptions
app.get('/api/inscriptions', (req, res) => {
    const db = readDB();
    res.json(db.inscriptions);
});

// Ajouter une inscription
app.post('/api/inscriptions', (req, res) => {
    const db = readDB();
    const { etudiantId, coursId } = req.body;

    // Validation : Vérifier si l'étudiant est déjà inscrit à ce cours
    const exists = db.inscriptions.find(i => i.etudiantId == etudiantId && i.coursId == coursId);
    if (exists) {
        return res.status(400).json({ message: "Cet étudiant est déjà inscrit à ce cours." });
    }

    const newInscription = {
        id: Date.now(),
        etudiantId,
        coursId,
        date: new Date().toISOString().split('T')[0],
        statut: 'Validée'
    };
    db.inscriptions.push(newInscription);
    writeDB(db);
    res.json(newInscription);
});

// Supprimer une inscription
app.delete('/api/inscriptions/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    db.inscriptions = db.inscriptions.filter(i => i.id !== id);
    writeDB(db);
    res.json({ message: "Inscription annulée." });
});

// Modifier une inscription
app.put('/api/inscriptions/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.inscriptions.findIndex(i => i.id === id);
    
    if (index !== -1) {
        db.inscriptions[index] = { ...db.inscriptions[index], ...req.body };
        writeDB(db);
        res.json(db.inscriptions[index]);
    } else {
        res.status(404).json({ message: "Inscription non trouvée." });
    }
});
// Inscriptions groupées
app.post('/api/inscriptions/bulk', (req, res) => {
    const db = readDB();
    const { etudiantId, coursIds } = req.body;
    const results = [];

    coursIds.forEach(coursId => {
        const exists = db.inscriptions.find(i => i.etudiantId === etudiantId && i.coursId === coursId);
        if (!exists) {
            const newIns = {
                id: Date.now() + Math.random(),
                etudiantId,
                coursId,
                date: new Date().toISOString().split('T')[0],
                statut: 'Validée'
            };
            db.inscriptions.push(newIns);
            results.push(newIns);
        }
    });

    writeDB(db);
    res.json({ message: `${results.length} inscriptions réalisées.`, data: results });
});

// --- MODULE NOTES & EXAMENS (MULTI-ÉVALUATIONS) ---

// Lister toutes les notes
app.get('/api/notes', (req, res) => {
    const db = readDB();
    if (!db.notes) db.notes = [];
    res.json(db.notes);
});

// Ajouter/Mettre à jour une évaluation spécifique
app.post('/api/notes', (req, res) => {
    const db = readDB();
    if (!db.notes) db.notes = []; // Sécurité cruciale
    
    const { inscriptionId, note, type, coefficient, session } = req.body;
    
    const noteValue = parseFloat(note);
    const coefValue = parseFloat(coefficient) || 1;

    if (isNaN(noteValue) || noteValue < 0 || noteValue > 20) {
        return res.status(400).json({ message: "Note invalide (0-20)." });
    }

    // --- CORRECTION : Mise à jour si la note existe déjà pour ce type ---
    const index = db.notes.findIndex(n => n.inscriptionId === inscriptionId && n.type === type);
    
    const noteData = {
        id: index !== -1 ? db.notes[index].id : Date.now(),
        inscriptionId,
        type: type || 'CC', 
        note: noteValue,
        coefficient: coefValue,
        session: session || 'Normale',
        date: new Date().toLocaleDateString('fr-FR')
    };

    if (index !== -1) {
        db.notes[index] = noteData;
    } else {
        db.notes.push(noteData);
    }

    writeDB(db);
    res.json(noteData);
});

// Supprimer une note spécifique
app.delete('/api/notes/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    db.notes = db.notes.filter(n => n.id !== id);
    writeDB(db);
    res.json({ message: "Note supprimée." });
});

// Start server
app.listen(port, () => {
    console.log('✅ Backend SGSU (Mode JSON) prêt !');
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});
