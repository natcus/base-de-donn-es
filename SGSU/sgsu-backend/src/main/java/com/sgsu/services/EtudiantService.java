package com.sgsu.services;

import com.sgsu.entities.Cours;
import com.sgsu.entities.Etudiant;
import com.sgsu.entities.Inscription;
import com.sgsu.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final InscriptionRepository inscriptionRepository;
    private final NoteRepository noteRepository;
    private final PaiementRepository paiementRepository;

    public EtudiantService(EtudiantRepository etudiantRepository, 
                          CoursRepository coursRepository, 
                          InscriptionRepository inscriptionRepository,
                          NoteRepository noteRepository,
                          PaiementRepository paiementRepository) {
        this.etudiantRepository = etudiantRepository;
        this.coursRepository = coursRepository;
        this.inscriptionRepository = inscriptionRepository;
        this.noteRepository = noteRepository;
        this.paiementRepository = paiementRepository;
    }

    @Transactional
    public Etudiant registerEtudiant(Etudiant etudiant) {
        Etudiant savedEtudiant = etudiantRepository.save(etudiant);
        List<Cours> coursCurriculum = coursRepository.findByFiliereAndNiveau(savedEtudiant.getFiliere(), savedEtudiant.getNiveau());
        for (Cours cours : coursCurriculum) {
            Inscription inscription = new Inscription();
            inscription.setEtudiant(savedEtudiant);
            inscription.setCours(cours);
            inscription.setDateInscription(LocalDate.now());
            inscriptionRepository.save(inscription);
        }
        return savedEtudiant;
    }

    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }

    public Etudiant getEtudiantByMatricule(String matricule) {
        return etudiantRepository.findByMatricule(matricule)
                .orElseThrow(() -> new RuntimeException("Etudiant non trouvé avec le matricule: " + matricule));
    }

    @Transactional
    public Etudiant updateEtudiant(Long id, Etudiant details) {
        Etudiant existing = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etudiant non trouvé"));
        
        existing.setNom(details.getNom());
        existing.setPrenom(details.getPrenom());
        existing.setEmail(details.getEmail());
        existing.setTelephone(details.getTelephone());
        existing.setAdresse(details.getAdresse());
        existing.setFiliere(details.getFiliere());
        existing.setNiveau(details.getNiveau());
        existing.setSexe(details.getSexe());
        existing.setType(details.getType());
        
        return etudiantRepository.save(existing);
    }

    @Transactional
    public void deleteEtudiant(Long id) {
        // 1. Supprimer les notes via inscriptions
        List<Inscription> inscriptions = inscriptionRepository.findByEtudiantId(id);
        for (Inscription ins : inscriptions) {
            noteRepository.deleteByInscriptionId(ins.getId());
        }
        
        // 2. Supprimer les inscriptions
        inscriptionRepository.deleteAll(inscriptions);
        
        // 3. Supprimer les paiements
        paiementRepository.deleteByEtudiantId(id);
        
        // 4. Supprimer l'étudiant
        etudiantRepository.deleteById(id);
    }
}
