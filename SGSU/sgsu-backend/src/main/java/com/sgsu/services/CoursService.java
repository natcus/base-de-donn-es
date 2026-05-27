package com.sgsu.services;

import com.sgsu.entities.Cours;
import com.sgsu.entities.Inscription;
import com.sgsu.entities.Etudiant;
import com.sgsu.repositories.CoursRepository;
import com.sgsu.repositories.EtudiantRepository;
import com.sgsu.repositories.InscriptionRepository;
import com.sgsu.repositories.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CoursService {

    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NoteRepository noteRepository;
    private final EtudiantRepository etudiantRepository;

    public CoursService(CoursRepository coursRepository, 
                        InscriptionRepository inscriptionRepository,
                        NoteRepository noteRepository,
                        EtudiantRepository etudiantRepository) {
        this.coursRepository = coursRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.noteRepository = noteRepository;
        this.etudiantRepository = etudiantRepository;
    }

    public List<Cours> getAll() {
        return coursRepository.findAll();
    }

    @Transactional
    public void syncInscriptions() {
        List<Cours> allCours = coursRepository.findAll();
        List<Etudiant> allEtudiants = etudiantRepository.findAll();
        System.out.println("DEBUG SYNC: Lancement synchronisation. Cours: " + allCours.size() + ", Etudiants: " + allEtudiants.size());

        for (Cours cours : allCours) {
            for (Etudiant etudiant : allEtudiants) {
                // Comparaison stricte et loggée
                boolean filiereMatch = etudiant.getFiliere().trim().equalsIgnoreCase(cours.getFiliere().trim());
                boolean niveauMatch = etudiant.getNiveau().equals(cours.getNiveau());
                
                if (filiereMatch && niveauMatch) {
                    if (!inscriptionRepository.existsByEtudiantIdAndCoursId(etudiant.getId(), cours.getId())) {
                        System.out.println("DEBUG SYNC: Création lien manquant -> Etudiant: " + etudiant.getNom() + " + Cours: " + cours.getCode());
                        Inscription ins = new Inscription();
                        ins.setEtudiant(etudiant);
                        ins.setCours(cours);
                        ins.setDateInscription(java.time.LocalDate.now());
                        inscriptionRepository.save(ins);
                    }
                }
            }
        }
    }

    @Transactional
    public Cours save(Cours cours) {
        System.out.println("DEBUG SAVE: Nouveau cours " + cours.getCode() + " pour " + cours.getFiliere() + " L" + cours.getNiveau());
        Cours savedCours = coursRepository.save(cours);
        
        List<Etudiant> etudiants = etudiantRepository.findByFiliereAndNiveau(savedCours.getFiliere(), savedCours.getNiveau());
        System.out.println("DEBUG SAVE: Etudiants cibles trouvés: " + etudiants.size());
        
        for (Etudiant etudiant : etudiants) {
            System.out.println("DEBUG SAVE: Inscription auto de: " + etudiant.getNom());
            Inscription inscription = new Inscription();
            inscription.setEtudiant(etudiant);
            inscription.setCours(savedCours);
            inscription.setDateInscription(java.time.LocalDate.now());
            inscriptionRepository.save(inscription);
        }
        
        return savedCours;
    }

    @Transactional
    public Cours update(Long id, Cours details) {
        System.out.println("DEBUG UPDATE: Tentative de modification du cours ID: " + id);
        System.out.println("DEBUG UPDATE: Nouveau code reçu: " + details.getCode());

        Cours existing = coursRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cours non trouvé avec l'ID: " + id));
        System.out.println("DEBUG UPDATE: Cours existant trouvé en base: " + existing.getTitre() + " (ID: " + existing.getId() + ")");
        
        // Vérification de conflit : est-ce que ce code est déjà pris par UN AUTRE cours ?
        java.util.Optional<Cours> conflict = coursRepository.findByCode(details.getCode());
        if (conflict.isPresent()) {
            System.out.println("DEBUG UPDATE: Conflit potentiel trouvé avec l'ID: " + conflict.get().getId());
            if (!conflict.get().getId().equals(id)) {
                throw new RuntimeException("Conflit : Le code '" + details.getCode() + "' est déjà utilisé par la matière '" + conflict.get().getTitre() + "' (ID: " + conflict.get().getId() + ").");
            } else {
                System.out.println("DEBUG UPDATE: Le code appartient déjà à ce cours, pas de conflit réel.");
            }
        }

        existing.setCode(details.getCode());
        existing.setTitre(details.getTitre());
        existing.setCredits(details.getCredits());
        existing.setFiliere(details.getFiliere());
        existing.setNiveau(details.getNiveau());
        existing.setSemestre(details.getSemestre());
        
        System.out.println("DEBUG UPDATE: Sauvegarde des modifications...");
        return coursRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        List<Inscription> inscriptions = inscriptionRepository.findByCoursId(id);
        for (Inscription ins : inscriptions) {
            noteRepository.deleteByInscriptionId(ins.getId());
        }
        inscriptionRepository.deleteAll(inscriptions);
        coursRepository.deleteById(id);
    }
}
