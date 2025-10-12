require("dotenv").config();
const mysql = require("mysql2/promise");

async function migrateSplashPublication() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Check if table exists
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'splash_publication'"
    );

    if (tables.length === 0) {
      console.log('Creating splash_publication table...');
      await connection.execute(`
        CREATE TABLE splash_publication (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image VARCHAR(500),
          publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          is_active TINYINT(1) DEFAULT 0,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Table splash_publication created successfully');
    } else {
      console.log('Table splash_publication already exists');

      // Check if is_active column exists
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM splash_publication LIKE 'is_active'"
      );

      if (columns.length === 0) {
        console.log('Adding is_active column...');
        await connection.execute(
          'ALTER TABLE splash_publication ADD COLUMN is_active TINYINT(1) DEFAULT 0'
        );
        console.log('✅ Column is_active added successfully');
      } else {
        console.log('Column is_active already exists');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

migrateSplashPublication();