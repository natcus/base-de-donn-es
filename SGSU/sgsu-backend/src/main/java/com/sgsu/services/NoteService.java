package com.sgsu.services;

import com.sgsu.entities.Note;
import com.sgsu.repositories.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    @Transactional
    public Note saveNote(Note note) {
        Long insId = note.getInscription().getId();
        String type = note.getType();
        
        // Chercher si une note existe déjà pour cette inscription et ce type
        return noteRepository.findByInscriptionIdAndType(insId, type)
                .map(existing -> {
                    existing.setValeur(note.getValeur());
                    return noteRepository.save(existing);
                })
                .orElseGet(() -> noteRepository.save(note));
    }

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    @Transactional
    public List<Note> saveNotes(List<Note> notes) {
        return notes.stream().map(this::saveNote).collect(java.util.stream.Collectors.toList());
    }

    public List<Note> getNotesByInscription(Long inscriptionId) {
        return noteRepository.findByInscriptionId(inscriptionId);
    }

    public Double calculerMoyenne(Long inscriptionId) {
        List<Note> notes = noteRepository.findByInscriptionId(inscriptionId);
        if (notes.isEmpty()) return 0.0;

        Map<String, Double> notesByType = notes.stream()
                .collect(Collectors.toMap(
                        Note::getType,
                        Note::getValeur,
                        (v1, v2) -> v1
                ));

        Double cc = notesByType.getOrDefault("CC", 0.0);
        Double et1 = notesByType.getOrDefault("ET1", 0.0);
        Double et2 = notesByType.getOrDefault("ET2", 0.0);

        Double maxEt = Math.max(et1, et2);

        return (cc * 0.4) + (maxEt * 0.6);
    }
}
