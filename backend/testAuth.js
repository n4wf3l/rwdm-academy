require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function resetPassword(email, newPassword) {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("🔗 Connexion à la base de données établie");

    // Vérifier si l'utilisateur existe
    const [users] = await connection.execute(
      "SELECT id, firstName, lastName, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      await connection.end();
      return;
    }

    const user = users[0];
    console.log(`👤 Utilisateur trouvé: ${user.firstName} ${user.lastName} (${user.email})`);

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await connection.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    console.log(`✅ Mot de passe mis à jour pour ${user.email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    
    await connection.end();
  } catch (error) {
    console.error("💥 Erreur lors de la réinitialisation du mot de passe:", error.message);
  }
}

// Fonction pour tester un login
async function testLogin(email, password) {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Récupérer l'utilisateur avec son mot de passe hashé
    const [users] = await connection.execute(
      "SELECT id, firstName, lastName, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      await connection.end();
      return false;
    }

    const user = users[0];
    
    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log(`✅ Connexion réussie pour ${user.firstName} ${user.lastName} (${user.role})`);
      await connection.end();
      return true;
    } else {
      console.log(`❌ Mot de passe incorrect pour ${user.email}`);
      await connection.end();
      return false;
    }
  } catch (error) {
    console.error("💥 Erreur lors du test de connexion:", error.message);
    return false;
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args[0] === 'reset' && args[1] && args[2]) {
  // Mode réinitialisation: node testAuth.js reset email@example.com nouveaumotdepasse
  resetPassword(args[1], args[2]);
} else if (args[0] === 'test' && args[1] && args[2]) {
  // Mode test: node testAuth.js test email@example.com motdepasse
  testLogin(args[1], args[2]);
} else {
  console.log("🔧 Utilisation:");
  console.log("  Tester une connexion: node testAuth.js test email@example.com motdepasse");
  console.log("  Réinitialiser un mot de passe: node testAuth.js reset email@example.com nouveaumotdepasse");
  console.log("\n📋 Comptes disponibles:");
  console.log("  - nawfel.ajari@student.ehb.be (owner)");
  console.log("  - ludovic.busieaux@rwdmacademy.be (superadmin)");
  console.log("  - nicolas.baquet@rwdm-academ.be (owner)");
  console.log("  - patrick.michiels@rwdm-academy.be (admin)");
  console.log("  - Ou utiliser l'email de votre choix");
}