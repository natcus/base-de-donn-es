package com.sgsu;

import java.sql.*;

public class DbDiagnostic {
    public static void main(String[] args) {
        String url = System.getenv().getOrDefault("SPRING_DATASOURCE_URL", "jdbc:postgresql://localhost:5432/postgres");
        String user = System.getenv().getOrDefault("SPRING_DATASOURCE_USERNAME", "postgres");
        String password = System.getenv().getOrDefault("SPRING_DATASOURCE_PASSWORD", "lesympafils");

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("--- DIAGNOSTIC BASE DE DONNÉES : TABLE COURS ---");
            Statement stmt = conn.createStatement();
            // On vérifie d'abord si la table existe dans ce schéma
            ResultSet rs = stmt.executeQuery("SELECT id, code, titre, filiere, niveau FROM cours ORDER BY id");
            
            while (rs.next()) {
                System.out.printf("ID: %d | CODE: %s | TITRE: %s | FILIERE: %s | NIVEAU: %d%n",
                    rs.getLong("id"), rs.getString("code"), rs.getString("titre"), 
                    rs.getString("filiere"), rs.getInt("niveau"));
            }
            System.out.println("-------------------------------------------------");
        } catch (SQLException e) {
            System.err.println("Erreur de diagnostic : " + e.getMessage());
        }
    }
}
