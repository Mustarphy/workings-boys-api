import pg from "pg";

const client = new pg.Client({
  connectionString: "postgresql://neondb_owner:npg_Fl4IcZYQ1gaz@ep-tight-wind-a8stwk25.eastus2.azure.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("✅ Connected to Neon DB");
    return client.end();
  })
  .catch(err => {
    console.error("❌ Connection failed:", err);
  });
