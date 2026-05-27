package com.sgsu.controllers;

import com.sgsu.entities.Cours;
import com.sgsu.services.CoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cours")
@CrossOrigin(origins = "http://localhost:5173")
public class CoursController {

    private final CoursService coursService;

    public CoursController(CoursService coursService) {
        this.coursService = coursService;
    }

    @GetMapping
    public ResponseEntity<List<Cours>> getAllCours() {
        return ResponseEntity.ok(coursService.getAll());
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> sync() {
        coursService.syncInscriptions();
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Cours> createCours(@RequestBody Cours cours) {
        return ResponseEntity.ok(coursService.save(cours));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cours> updateCours(@PathVariable Long id, @RequestBody Cours cours) {
        return ResponseEntity.ok(coursService.update(id, cours));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCours(@PathVariable Long id) {
        coursService.delete(id);
        return ResponseEntity.ok().build();
    }
}
