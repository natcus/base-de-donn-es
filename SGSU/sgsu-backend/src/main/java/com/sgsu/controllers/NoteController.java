package com.sgsu.controllers;

import com.sgsu.entities.Note;
import com.sgsu.services.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        return ResponseEntity.ok(noteService.getAllNotes());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        return ResponseEntity.ok(noteService.saveNote(note));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Note>> createNotes(@RequestBody List<Note> notes) {
        return ResponseEntity.ok(noteService.saveNotes(notes));
    }

    @GetMapping("/inscription/{inscriptionId}")
    public ResponseEntity<List<Note>> getNotesByInscription(@PathVariable Long inscriptionId) {
        return ResponseEntity.ok(noteService.getNotesByInscription(inscriptionId));
    }

    @GetMapping("/inscription/{inscriptionId}/moyenne")
    public ResponseEntity<Double> getMoyenne(@PathVariable Long inscriptionId) {
        return ResponseEntity.ok(noteService.calculerMoyenne(inscriptionId));
    }
}
