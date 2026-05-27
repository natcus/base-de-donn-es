package com.sgsu.services;

import com.sgsu.entities.Cours;
import com.sgsu.entities.Etudiant;
import com.sgsu.entities.Inscription;
import com.sgsu.repositories.CoursRepository;
import com.sgsu.repositories.EtudiantRepository;
import com.sgsu.repositories.InscriptionRepository;
import com.sgsu.repositories.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class InscriptionService {

    private final InscriptionRepository inscriptionRepository;
    private final EtudiantRepository etudiantRepository;
    private final CoursRepository coursRepository;
    private final NoteRepository noteRepository;

    public InscriptionService(InscriptionRepository inscriptionRepository,
                             EtudiantRepository etudiantRepository,
                             CoursRepository coursRepository,
                             NoteRepository noteRepository) {
        this.inscriptionRepository = inscriptionRepository;
        this.etudiantRepository = etudiantRepository;
        this.coursRepository = coursRepository;
        this.noteRepository = noteRepository;
    }

    @Transactional
    public Inscription inscrireEtudiant(Inscription inscription) {
        return inscriptionRepository.save(inscription);
    }

    public List<Inscription> getAllInscriptions() {
        return inscriptionRepository.findAll();
    }

    @Transactional
    public List<Inscription> inscrireBulk(Long etudiantId, List<Long> coursIds) {
        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Etudiant non trouvé"));
        
        List<Inscription> results = new ArrayList<>();
        for (Long coursId : coursIds) {
            Cours cours = coursRepository.findById(coursId)
                    .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
            
            Inscription ins = new Inscription();
            ins.setEtudiant(etudiant);
            ins.setCours(cours);
            ins.setDateInscription(LocalDate.now());
            results.add(inscriptionRepository.save(ins));
        }
        return results;
    }

    public List<Inscription> getInscriptionsParEtudiant(Long etudiantId) {
        return inscriptionRepository.findByEtudiantId(etudiantId);
    }

    public List<Inscription> getInscriptionsParCours(Long coursId) {
        return inscriptionRepository.findByCoursId(coursId);
    }

    @Transactional
    public void annulerInscription(Long id) {
        noteRepository.deleteByInscriptionId(id);
        inscriptionRepository.deleteById(id);
    }
}
