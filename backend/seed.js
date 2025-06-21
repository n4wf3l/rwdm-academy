require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function seedSuperadmin() {
  // Configuration de la BDD depuis le .env
  const dbConfig = {
    host: process.env.DB_HOST, // ex: "localhost"
    user: process.env.DB_USER, // ex: "root"
    password: process.env.DB_PASSWORD, // ex: "MonSuperMotDePasse"
    database: process.env.DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Vérifier si la table users contient déjà des utilisateurs
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );
    if (rows[0].count > 0) {
      console.log(
        "Des utilisateurs existent déjà. Le seeder ne s'exécute pas."
      );
      await connection.end();
      return;
    }
    n;
    const firstName = "Nawfel";
    const lastName = "Ajari";
    const email = "nawfel@hotmail.com";
    const plainPassword = "nawnaw1030"; // mot de passe en clair
    const role = "owner"; // Rôle à insérer
    const userFunction = "Fonction initiale";

    // Hacher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insertion dans la table users sans le champ description
    await connection.execute(
      "INSERT INTO users (firstName, lastName, email, password, role, `function`) VALUES (?, ?, ?, ?, ?, ?)",
      [firstName, lastName, email, hashedPassword, role, userFunction]
    );

    console.log("Superadmin inséré avec succès !");
    await connection.end();
  } catch (error) {
    console.error("Erreur lors de l'exécution du seeder :", error);
  }
}

seedSuperadmin();
