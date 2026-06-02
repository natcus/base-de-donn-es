# Rapport de Projet : Système de Gestion de la Scolarité Universitaire (SGSU)

## 1. Introduction & Contexte du Projet
Le projet **SGSU (Système de Gestion de la Scolarité Universitaire)** a été conçu dans le cadre de l'Unité d'Enseignement « **Base de Données Avancée (BDDA)** ». L'objectif principal est de concevoir, modéliser et implémenter un système robuste permettant l'automatisation et la digitalisation de l'administration académique et financière d'un établissement d'enseignement supérieur (système LMD).

Bien que le projet intègre une interface graphique moderne (React/Vite), le **cœur de l'application réside dans son architecture de données et sa logique métier (Backend Node.js)**. 

---

## 2. Architecture de la Base de Données

Pour cette première version (v1.0), le choix technique s'est porté sur une base de données orientée documents stockée sous format JSON (`database.json`), interfacée par un serveur Node.js qui agit comme un mini-SGBD. Ce backend gère la cohérence, l'intégrité et les relations des données.

### 2.1 Modèle Conceptuel de Données (MCD) - Entités Principales

Le système repose sur 5 entités fondamentales fortement reliées :

1. **`Etudiant`** : Représente l'apprenant.
   - *Attributs* : ID, Matricule, Nom, Prénom, Sexe, Email, Filière, Niveau, Téléphone, Adresse, Statut.
2. **`Cours` (UE)** : Représente l'Unité d'Enseignement.
   - *Attributs* : ID, Code, Titre, Crédits ECTS, Semestre, Filière.
3. **`Inscription`** : Table de relation (many-to-many) entre un Étudiant et un Cours.
   - *Attributs* : ID, ID Étudiant, ID Cours, Date d'inscription, Statut.
4. **`Note`** : Représente une évaluation liée à une Inscription.
   - *Attributs* : ID, ID Inscription, Type (CC, ET1, ET2), Note (sur 20), Coefficient, Session, Date.
5. **`Paiement`** : Représente une transaction financière.
   - *Attributs* : ID, ID Étudiant, Montant, ID Transaction (TRX), Méthode de paiement, Date.

### 2.2 Règles de Gestion et Intégrité Référentielle

Bien que la persistance soit au format JSON, le Backend implémente des contraintes strictes simulant un SGBD relationnel :
- **Unicité** : Un étudiant ne peut s'inscrire qu'une seule fois à un cours donné au cours d'une même année.
- **Suppression en Cascade** : Si un étudiant ou un cours est supprimé de la base, toutes ses inscriptions (et par extension ses notes) sont automatiquement purgées pour éviter les données orphelines.
- **Intégrité Financière** : Il est impossible d'encaisser un montant supérieur au reliquat de la scolarité de l'étudiant.

---

## 3. Logiques Métier Avancées (Traitements Backend & Frontend)

Le système ne se contente pas de faire du CRUD (Create, Read, Update, Delete) basique, il effectue des traitements de données complexes :

- **Calcul du GPA et Bilan Académique** : À partir de la table `notes`, l'application consolide les notes de Contrôle Continu (CC) et d'Examen (ET1/ET2) selon des pondérations définies (40% CC, 60% Examen). Le statut de validation est dynamiquement calculé.
- **Calcul du Reste à Payer (Reliquat)** : Pour chaque étudiant, l'application agrège tous les paiements liés à son ID et soustrait le total versé du montant de scolarité globale, en gérant les statuts (Soldé, Impayé, Partiel).
- **Tableau de Bord Décisionnel (BI)** : Interrogation de la base pour générer des indicateurs de performance (Taux de réussite global, Répartition par filière, Taux de recouvrement financier, Statistiques de mixité).

---

## 4. Choix Technologiques

* **Backend / SGBD (Prototype) :** Node.js avec Express. Il offre des endpoints RESTful permettant au client d'effectuer des requêtes structurées (GET, POST, PUT, DELETE). L'accès concurrent au fichier `database.json` est géré de façon asynchrone pour la v1.
* **Frontend :** Interface développée avec React 18, Vite et Material UI (MUI). Architecture modulaire pour assurer l'évolutivité.
* **Typage :** Utilisation de TypeScript pour garantir la correspondance exacte entre les modèles de données du frontend et la structure de la base de données.

---

## 5. Perspectives et Évolution (V2.0)

Conformément à la feuille de route du projet de Base de Données Avancée, la prochaine itération se concentrera sur une migration de l'infrastructure de données :

1. **Migration SGBDR (PostgreSQL ou MySQL)** : Remplacement du fichier JSON par un véritable moteur relationnel pour la gestion native des contraintes (Clés primaires/étrangères, Triggers, Procédures stockées).
2. **Backend Orienté Objet** : Déploiement du serveur **Spring Boot (Java)** déjà pré-configuré dans le répertoire `sgsu-backend`, exploitant JPA/Hibernate pour le mapping objet-relationnel (ORM).
3. **Sécurité et Multitenancy** : Ajout d'une base de données d'authentification et de gestion des rôles (Admin, Professeur, Étudiant).

---
*Rapport généré pour la soutenance / l'évaluation du module BDDA.*
