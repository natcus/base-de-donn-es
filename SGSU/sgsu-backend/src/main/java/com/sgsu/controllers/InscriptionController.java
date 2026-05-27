package com.sgsu.controllers;

import com.sgsu.entities.Inscription;
import com.sgsu.services.InscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class InscriptionController {

    private final InscriptionService inscriptionService;

    // Constructeur manuel au lieu de @RequiredArgsConstructor
    public InscriptionController(InscriptionService inscriptionService) {
        this.inscriptionService = inscriptionService;
    }

    @GetMapping
    public ResponseEntity<List<Inscription>> getAll() {
        return ResponseEntity.ok(inscriptionService.getAllInscriptions());
    }

    @PostMapping
    public ResponseEntity<Inscription> inscrire(@RequestBody Inscription inscription) {
        return ResponseEntity.ok(inscriptionService.inscrireEtudiant(inscription));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Inscription>> inscrireBulk(@RequestBody java.util.Map<String, Object> payload) {
        Long etudiantId = Long.valueOf(payload.get("etudiantId").toString());
        List<Integer> coursIdsInt = (List<Integer>) payload.get("coursIds");
        List<Long> coursIds = coursIdsInt.stream().map(Long::valueOf).toList();
        return ResponseEntity.ok(inscriptionService.inscrireBulk(etudiantId, coursIds));
    }

    @GetMapping("/etudiant/{etudiantId}")
    public ResponseEntity<List<Inscription>> getByEtudiant(@PathVariable Long etudiantId) {
        return ResponseEntity.ok(inscriptionService.getInscriptionsParEtudiant(etudiantId));
    }

    @GetMapping("/cours/{coursId}")
    public ResponseEntity<List<Inscription>> getByCours(@PathVariable Long coursId) {
        return ResponseEntity.ok(inscriptionService.getInscriptionsParCours(coursId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> annuler(@PathVariable Long id) {
        inscriptionService.annulerInscription(id);
        return ResponseEntity.noContent().build();
    }
}
