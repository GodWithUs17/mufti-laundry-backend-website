const { Client } = require('pg');
const bcrypt = require('bcryptjs'); // Make sure this is installed: npm install bcryptjs

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:manifoldwisdom@localhost:5432/laundry_db?schema=public";

async function main() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("🌱 Starting Secure Seed...");

    // 1. HASH THE PASSWORD
    // This turns 'manifoldwisdom' into something like $2b$10$xyz...
    const saltRounds = 10;
    const hashedPW = await bcrypt.hash('test', saltRounds);

    // 2. Create the Admin (Tunde) with Hashed Password
    await client.query(`
      INSERT INTO "User" (id, email, name, password, role, "isActive")
      VALUES ('admin-1', 'admin@mufti.com', 'Tunde Mufti', $1, 'ADMIN', true)
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPW]); // Passing the hash here!

    // 3. Create Categories
    const categoryNames = ['Regular', 'Dry Clean', 'Bedding', 'Traditional'];
    const categoryMap = {};

    for (const name of categoryNames) {
      const res = await client.query(`
        INSERT INTO "Category" (id, name, "createdAt")
        VALUES (gen_random_uuid(), $1, NOW())
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [name]);
      
      categoryMap[name] = res.rows[0].id;
    }

    // 4. Create Services
    const services = [
      ['Shirt (Wash & Iron)', 600, 'Regular'],
      ['Trousers (Wash & Iron)', 700, 'Regular'],
      ['Suit (Dry Clean)', 2500, 'Dry Clean'],
      ['Duvet (Large)', 5000, 'Bedding'],
      ['Native Attire', 1200, 'Traditional'],
    ];

    for (const [name, price, catName] of services) {
      const catId = categoryMap[catName];
      await client.query(`
        INSERT INTO "Service" (id, name, price, "categoryId", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
        ON CONFLICT (name) 
        DO UPDATE SET 
          price = $2, 
          "categoryId" = $3,
          "updatedAt" = NOW();
      `, [name, price, catId]);
    }

    console.log("✅ Seed complete! You can now log in with 'manifoldwisdom'.");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await client.end();
  }
}

main();