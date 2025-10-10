require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

// Configuration de la BDD depuis le .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Utilisateurs par défaut à créer
const defaultUsers = [
  {
    firstName: "Nawfel",
    lastName: "Ajari",
    email: "nawfel@hotmail.com",
    password: "nawnaw1030",
    role: "owner",
    function: "Propriétaire du club",
    profilePicture: null,
    functionTitle: "Owner",
    description: "Propriétaire et fondateur du club"
  },
  {
    firstName: "Admin",
    lastName: "Super",
    email: "admin@rwdmacadmy.be",
    password: "admin123",
    role: "superadmin",
    function: "Super Administrateur",
    profilePicture: null,
    functionTitle: "Super Admin",
    description: "Administrateur principal du système"
  },
  {
    firstName: "Admin",
    lastName: "Test",
    email: "test@rwdmacademy.be",
    password: "test123",
    role: "admin",
    function: "Administrateur",
    profilePicture: null,
    functionTitle: "Admin",
    description: "Administrateur de test"
  }
];

async function seedUsers(customUsers = null, force = false) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("🔗 Connexion à la base de données établie");

    // Vérifier si des utilisateurs existent déjà
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM users"
    );

    if (rows[0].count > 0 && !force) {
      console.log("ℹ️  Des utilisateurs existent déjà dans la base de données.");
      console.log("💡 Utilisez l'option --force pour forcer la création d'utilisateurs supplémentaires");
      await connection.end();
      return;
    }

    const usersToCreate = customUsers || defaultUsers;
    console.log(`📝 Création de ${usersToCreate.length} utilisateur(s)...`);

    for (const user of usersToCreate) {
      try {
        // Vérifier si l'email existe déjà
        const [existingUser] = await connection.execute(
          "SELECT email FROM users WHERE email = ?",
          [user.email]
        );

        if (existingUser.length > 0) {
          console.log(`⚠️  L'utilisateur ${user.email} existe déjà, ignoré.`);
          continue;
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);

        // Insérer l'utilisateur
        await connection.execute(
          `INSERT INTO users (firstName, lastName, email, password, role, \`function\`, profilePicture, functionTitle, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.firstName,
            user.lastName,
            user.email,
            hashedPassword,
            user.role,
            user.function,
            user.profilePicture,
            user.functionTitle,
            user.description
          ]
        );

        console.log(`✅ Utilisateur créé: ${user.firstName} ${user.lastName} (${user.email}) - Rôle: ${user.role}`);
      } catch (userError) {
        console.error(`❌ Erreur lors de la création de l'utilisateur ${user.email}:`, userError.message);
      }
    }

    console.log("🎉 Seeding des utilisateurs terminé!");
    await connection.end();
  } catch (error) {
    console.error("💥 Erreur lors de l'exécution du seeder:", error.message);
    process.exit(1);
  }
}

// Fonction pour créer un utilisateur spécifique
async function createUser(userData) {
  if (!userData.email || !userData.password) {
    console.error("❌ Email et mot de passe sont requis");
    return;
  }

  const user = {
    firstName: userData.firstName || "Utilisateur",
    lastName: userData.lastName || "Test",
    email: userData.email,
    password: userData.password,
    role: userData.role || "admin",
    function: userData.function || "Administrateur",
    profilePicture: userData.profilePicture || null,
    functionTitle: userData.functionTitle || userData.role || "Admin",
    description: userData.description || "Utilisateur créé par le seeder"
  };

  await seedUsers([user], true);
}

// Gestion des arguments en ligne de commande
const args = process.argv.slice(2);
const isForce = args.includes('--force');

if (args.includes('--create-user')) {
  // Mode création d'utilisateur interactif
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("🔧 Mode création d'utilisateur interactif");
  
  rl.question('Email: ', (email) => {
    rl.question('Mot de passe: ', (password) => {
      rl.question('Prénom: ', (firstName) => {
        rl.question('Nom: ', (lastName) => {
          rl.question('Rôle (admin/superadmin/owner): ', (role) => {
            rl.close();
            
            createUser({
              email,
              password,
              firstName: firstName || 'Utilisateur',
              lastName: lastName || 'Test',
              role: role || 'admin'
            });
          });
        });
      });
    });
  });
} else {
  // Mode par défaut
  seedUsers(null, isForce);
}

module.exports = { seedUsers, createUser };