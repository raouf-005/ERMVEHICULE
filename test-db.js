const { Client } = require("pg");

async function test() {
  console.log("Testing connection to Docker PostgreSQL on port 5433...");
  const client = new Client({
    host: "127.0.0.1",
    port: 5433,
    user: "postgres",
    password: "postgres",
    database: "garage",
  });

  try {
    await client.connect();
    console.log("✅ Connected successfully!");
    const res = await client.query("SELECT current_user, current_database()");
    console.log("User:", res.rows[0].current_user);
    console.log("Database:", res.rows[0].current_database);
    await client.end();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
}

test();
