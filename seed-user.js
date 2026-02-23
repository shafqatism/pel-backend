const { Client } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = 'postgresql://neondb_owner:npg_Fc3fGyPk8XQZ@ep-weathered-mode-ai1ubbr4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function seedUser() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const email = 'admin@pel.com.pk';
    const password = 'password123';
    const fullName = 'System Administrator';
    const role = 'admin';

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const res = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      console.log('User already exists');
      return;
    }

    await client.query(
      'INSERT INTO users (id, email, password, "fullName", role, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())',
      [email, hashedPassword, fullName, role]
    );
    console.log('Admin user created successfully!');
  } catch (err) {
    console.error('Error seeding user:', err);
  } finally {
    await client.end();
  }
}

seedUser();
