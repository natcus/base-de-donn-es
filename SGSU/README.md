# 🎓 SGSU v1.0 - Système de Gestion de la Scolarité Universitaire

**SGSU** (Système de Gestion de la Scolarité Universitaire) est une plateforme SaaS moderne conçue pour automatiser et digitaliser l'administration des établissements d'enseignement supérieur suivant le système **LMD (Licence-Master-Doctorat)**.

---

## 💎 Vision & Design
SGSU se distingue par son interface **Premium & Glassmorphic**, offrant une expérience utilisateur fluide et intuitive. L'application n'est pas seulement un outil de saisie, c'est un centre de décision académique.

---

## 🚀 Fonctionnalités Clés

### 📁 Gestion des Dossiers Étudiants
- **Dossier Civil Complet :** Gestion du sexe, statut (Nouveau/Ancien), coordonnées et adresses.
- **Suivi Académique :** Calcul automatique du statut (Validé, Validé avec dettes, Ajourné).
- **Formatage Strict :** Normalisation des noms (`NOM Prénom`) pour une base de données propre.

### 📜 Relevés de Notes Officiels (Format LMD)
- **Compact & Professionnel :** Design optimisé pour une lecture sans défilement et une impression A4.
- **Logique de Calcul Avancée :** Moyenne pondérée (CC 40% / Examen 60%), calcul des crédits ECTS acquis.
- **Mention de Session :** Distinction automatique entre **Session Normale** et **Session de Rattrapage** (ET2).
- **Mentions :** Attribution automatique des mentions (Passable, Assez Bien, Bien, Très Bien).

### ⚙️ Administration & Personnalisation
- **Branding Total :** Téléchargement du Logo, définition du Code Établissement et de l'Année Académique.
- **Moteur de Règles Dynamique :** L'administrateur choisit le critère de promotion (**Moyenne Générale** ou **Total de Crédits**).
- **Cartes Étudiants :** Génération automatique de badges avec QR Code unique et design double-face.

### 🔐 Sécurité & Rôles
- **Administrateur :** Contrôle total sur les réglages, les inscriptions et la gestion des cours.
- **Enseignant (Professeur) :** Accès limité à la consultation et à la saisie des notes (Lecture seule sur le reste).

---

## 🛠 Stack Technique
- **Frontend :** React 18, Vite, Material UI (MUI) v5.
- **Backend (Cœur du Projet) :** Node.js / Express (Port 8081). C'est le moteur de l'application gérant toute la logique métier.
- **Base de Données (Prototype) :** Fichier JSON (`database.json`) avec gestion transactionnelle locale. L'architecture backend est pensée autour de la structuration, de l'intégrité et de l'interrogation de ces données.
- **Architecture :** Modulaire, orientée données. Typage TypeScript strict côté frontend pour une interaction sécurisée avec l'API.

---

## 🗄️ Architecture de la Base de Données

Le but premier de ce projet est la gestion avancée des données (BDDA). Actuellement, le backend repose sur une architecture de données structurée autour des entités suivantes :

- **`etudiants`** : Données civiles et académiques.
- **`cours`** : Catalogue des Unités d'Enseignement (UE).
- **`inscriptions`** : Table de liaison gérant les inscriptions des étudiants aux cours.
- **`notes`** : Historique des évaluations (CC, Examens) avec prise en charge des coefficients et sessions.
- **`paiements`** : Suivi des transactions financières pour la gestion de la scolarité.

Cette structuration permet des requêtes complexes (comme le calcul dynamique du GPA, le taux de recouvrement financier, etc.) simulant le comportement d'un véritable SGBD relationnel.

---

## 📈 Critique & Roadmap (Vision Expert)
D'après l'audit réalisé en v1.0, voici les prochaines étapes de développement :

1.  **Persistence Robuste :** Migration vers **PostgreSQL** avec un backend **Spring Boot** pour une sécurité maximale.
2.  **Reporting de Masse :** Module de génération de Procès-Verbaux (PV) et statistiques de réussite par filière.
3.  **Module Financier :** Intégration du suivi des paiements de scolarité.
4.  **Authentification Forte :** Mise en place d'un serveur **Keycloak** pour la gestion des accès (OIDC/SAML).

---

## 🛠 Installation

```bash
# Installation des dépendances
cd sgsu-frontend
npm install

# Lancement en mode développement
npm run dev
```

---

## 📄 Licence
Propriété de **PRO ELECTRONICS** - Tous droits réservés.
