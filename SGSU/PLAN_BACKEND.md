# Plan d'Implémentation Backend : SGSU (Spring Boot & PostgreSQL)

Ce document détaille l'architecture et les étapes de développement pour construire un backend robuste, sécurisé et performant pour la plateforme SGSU, capable de s'interfacer avec le Frontend React existant.

## 1. Stack Technologique (La Fondation)
*   **Framework Principal :** Java 17+ avec Spring Boot 3.x
*   **Base de Données :** PostgreSQL (Robustesse pour les données académiques et financières)
*   **ORM :** Spring Data JPA / Hibernate
*   **Sécurité :** Spring Security avec JWT (Json Web Tokens) / Keycloak (Optionnel pour le SSO)
*   **API :** RESTful avec formatage JSON complet
*   **Documentation :** Swagger / OpenAPI (Springdoc)
*   **Déploiement :** Docker & Docker Compose

---

## 2. Architecture Logicielle (MVC Étendu)
Le projet sera structuré en couches strictes pour garantir la maintenabilité :
*   `com.sgsu.entities` : Modèles de base de données (Les tables).
*   `com.sgsu.repositories` : Interfaces d'accès aux données (JPA).
*   `com.sgsu.services` : Logique métier (Calcul des moyennes, Inscription auto).
*   `com.sgsu.controllers` : Points d'entrée de l'API REST (Endpoints).
*   `com.sgsu.dtos` : Objets de transfert de données (Pour cacher les mots de passe et optimiser le JSON).
*   `com.sgsu.security` : Filtres JWT et configuration CORS.

---

## 3. Modélisation de la Base de Données (Entités JPA)

### A. Utilisateur & Sécurité (`User`)
*   `id` (UUID), `email`, `password` (Hashed), `role` (ADMIN, PROF), `nom`

### B. Scolarité (`Etudiant`, `Cours`)
*   **Etudiant :** `id`, `matricule` (Unique), `nom`, `prenom`, `sexe`, `filiere`, `niveau` (L1, L2...), `telephone`, `adresse`, `statut`
*   **Cours (UE) :** `id`, `code` (Unique), `titre`, `filiere`, `niveau`, `semestre`, `credits`

### C. Pédagogie (`Inscription`, `Note`)
*   **Inscription :** `id`, `etudiant_id`, `cours_id`, `date_inscription` *(Relation ManyToMany avec attributs)*
*   **Note :** `id`, `inscription_id`, `type` (CC, ET1, ET2), `valeur` (0-20)

### D. Finances (`Paiement`)
*   **Paiement :** `id`, `etudiant_id`, `montant`, `motif` (Frais de scolarité, Inscription), `date_paiement`, `trx_id` (Unique, généré)

---

## 4. Étapes de Développement (La Feuille de Route)

### Phase 1 : Initialisation & Sécurité (Semaine 1)
1.  **Setup Spring Boot** avec les dépendances Web, JPA, PostgreSQL, Validation et Security.
2.  **Configuration Base de données** (Fichier `application.yml` pour se lier au Docker PostgreSQL).
3.  **Création du module d'Authentification :** Endpoint `/api/auth/login` qui vérifie les identifiants et génère un Token JWT.
4.  **Filtre CORS :** Autoriser le frontend React (localhost:5173) à communiquer avec l'API (localhost:8081).

### Phase 2 : Le Cœur Académique (Semaine 2)
1.  **Entités & Repositories :** Création de `Etudiant`, `Cours` et `Inscription`.
2.  **Services Métier :**
    *   *Logique d'inscription automatique :* Quand un étudiant est créé, le backend cherche tous les cours de sa filière/niveau et crée automatiquement les lignes dans `Inscription`.
3.  **Controllers REST :** Implémentation des endpoints CRUD standard (`GET /api/etudiants`, `POST /api/etudiants`, etc.).

### Phase 3 : Notes & Évaluations (Semaine 3)
1.  **Entité Note :** Création de l'entité avec contrainte de validation (Note comprise entre 0 et 20).
2.  **Service de calcul :** Méthode pour calculer la moyenne de l'étudiant (CC * 40% + Max(ET1, ET2) * 60%).
3.  **Endpoints de synchronisation massive :** Endpoint permettant de recevoir un tableau JSON avec 50 notes et de les sauvegarder en une seule transaction (Optimisation pour le frontend).

### Phase 4 : Finances & Paramètres (Semaine 4)
1.  **Entité Paiement :** Création du système de suivi financier.
2.  **Générateur TRX :** Algorithme pour générer les identifiants de transaction uniques (ex: `TRX-2024-XXXX`).
3.  **Module Paramètres (Optionnel) :** Si nous voulons sauvegarder les paramètres de l'université (Logo, Nom) en base de données plutôt que dans le navigateur (LocalStorage), création de l'entité `Config`.

### Phase 5 : Finalisation & Déploiement
1.  **Swagger UI :** Activation de la documentation API (pour que le frontend puisse lire les schémas).
2.  **Tests Unitaires :** Tests sur les calculs de moyennes et les inscriptions automatiques.
3.  **Dockerisation :** Création du `Dockerfile` pour le backend Spring Boot pour tourner conjointement avec PostgreSQL.
