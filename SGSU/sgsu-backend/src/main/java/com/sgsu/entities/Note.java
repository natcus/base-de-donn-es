package com.sgsu.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notes")
@NoArgsConstructor
@AllArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inscription_id", nullable = false)
    private Inscription inscription;

    private String type; // CC, ET1, ET2
    
    @Column(name = "valeur")
    private Double valeur;

    @Column(nullable = false)
    private Integer coefficient = 1; // Valeur par défaut 1

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Inscription getInscription() { return inscription; }
    public void setInscription(Inscription inscription) { this.inscription = inscription; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getValeur() { return valeur; }
    public void setValeur(Double valeur) { this.valeur = valeur; }
    public Integer getCoefficient() { return coefficient; }
    public void setCoefficient(Integer coefficient) { this.coefficient = coefficient; }
}
