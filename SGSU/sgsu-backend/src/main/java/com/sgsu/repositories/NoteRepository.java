package com.sgsu.repositories;

import com.sgsu.entities.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByInscriptionId(Long inscriptionId);
    void deleteByInscriptionId(Long inscriptionId);
    java.util.Optional<Note> findByInscriptionIdAndType(Long inscriptionId, String type);
}
