package com.sgsu.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @Column(nullable = false)
    private Double montant;

    @Column(nullable = false)
    private LocalDateTime datePaiement;

    @Column(unique = true)
    private String trxId;

    private String methode;

    // Constructeurs manuels
    public Paiement() {}

    public Paiement(Etudiant etudiant, Double montant, LocalDateTime datePaiement, String trxId, String methode) {
        this.etudiant = etudiant;
        this.montant = montant;
        this.datePaiement = datePaiement;
        this.trxId = trxId;
        this.methode = methode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Etudiant getEtudiant() { return etudiant; }
    public void setEtudiant(Etudiant etudiant) { this.etudiant = etudiant; }
    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }
    public LocalDateTime getDatePaiement() { return datePaiement; }
    public void setDatePaiement(LocalDateTime datePaiement) { this.datePaiement = datePaiement; }
    public String getTrxId() { return trxId; }
    public void setTrxId(String trxId) { this.trxId = trxId; }
    public String getMethode() { return methode; }
    public void setMethode(String methode) { this.methode = methode; }
}
