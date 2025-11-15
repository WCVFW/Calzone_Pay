import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  try {
    console.log('🔧 Starting database setup...\n');

    // Read schema.sql
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Connect without specifying database (to create it)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });

    console.log('✅ Connected to MySQL\n');

    // Split schema by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(stmt => {
        // Remove line comments (--) and trim
        return stmt
          .split('\n')
          .map(line => line.replace(/--.*$/, '')) // Remove inline comments
          .join('\n')
          .trim();
      })
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute:\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const result = await connection.query(statement);
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.log(`  ${i + 1}. ✓ ${preview}...`);
      } catch (err) {
        const preview = statement.substring(0, 50).replace(/\n/g, ' ');
        console.error(`  ${i + 1}. ✗ ${preview}...`);
        console.error(`     Error: ${err.message}`);
      }
    }

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n📊 Verifying tables...\n');

    // Verify tables
    const [tables] = await connection.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "recharge_db"');
    
    if (tables.length > 0) {
      console.log('Created tables:');
      tables.forEach(table => {
        console.log(`  ✓ ${table.TABLE_NAME}`);
      });
    }

    await connection.end();
    console.log('\n✅ All done! Ready to start the server.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    console.error('\nMake sure:');
    console.error('  1. MySQL server is running');
    console.error('  2. DB credentials in .env are correct (DB_USER=root, DB_PASSWORD=root)');
    console.error('  3. You have network access to localhost:3306');
    process.exit(1);
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

setupDatabase();
