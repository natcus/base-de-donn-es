package com.sgsu.controllers;

import com.sgsu.entities.Paiement;
import com.sgsu.repositories.PaiementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "http://localhost:5173")
public class PaiementController {

    private final PaiementRepository paiementRepository;

    public PaiementController(PaiementRepository paiementRepository) {
        this.paiementRepository = paiementRepository;
    }

    @GetMapping
    public List<Paiement> getAll() {
        return paiementRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Paiement> create(@RequestBody Paiement paiement) {
        paiement.setDatePaiement(LocalDateTime.now());
        return ResponseEntity.ok(paiementRepository.save(paiement));
    }

    @GetMapping("/etudiant/{etudiantId}")
    public List<Paiement> getByEtudiant(@PathVariable Long etudiantId) {
        return paiementRepository.findByEtudiantId(etudiantId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paiementRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
