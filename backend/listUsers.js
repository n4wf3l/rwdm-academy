require("dotenv").config();
const mysql = require("mysql2/promise");

async function listUsers() {
  const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("🔗 Connexion à la base de données établie");

    // Récupérer tous les utilisateurs (sans les mots de passe)
    const [users] = await connection.execute(
      "SELECT id, firstName, lastName, email, role, `function` FROM users ORDER BY id"
    );

    console.log("\n📋 Utilisateurs dans la base de données:");
    console.log("=" .repeat(80));
    
    if (users.length === 0) {
      console.log("Aucun utilisateur trouvé dans la base de données.");
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Rôle: ${user.role}`);
        console.log(`   💼 Fonction: ${user.function || 'Non définie'}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log("-".repeat(50));
      });
    }

    await connection.end();
  } catch (error) {
    console.error("💥 Erreur lors de la récupération des utilisateurs:", error.message);
  }
}

listUsers();