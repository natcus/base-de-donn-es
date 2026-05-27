package com.sgsu.repositories;

import com.sgsu.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByMatricule(String matricule);
    java.util.List<Etudiant> findByFiliereAndNiveau(String filiere, Integer niveau);
}
