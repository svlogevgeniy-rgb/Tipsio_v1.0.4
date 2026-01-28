import "dotenv/config";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set. Cannot wait for database.");
  process.exit(1);
}

const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT ?? 60_000);
const intervalMs = 1000;
const start = Date.now();

async function checkConnection() {
  const client = new Client({ connectionString });
  await client.connect();
  await client.query("SELECT 1");
  await client.end();
}

async function waitForDb() {
  while (true) {
    try {
      await checkConnection();
      console.log("✅ Database is ready.");
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Timed out waiting for database: ${message}`);
      }
      console.log("⏳ Waiting for database...", message);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
}

waitForDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
