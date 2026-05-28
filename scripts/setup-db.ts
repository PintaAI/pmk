import { SQL } from "bun";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

const url = new URL(dbUrl);
const user = decodeURIComponent(url.username);
const password = decodeURIComponent(url.password);
const host = url.hostname;
const port = url.port || "5432";
const dbName = url.pathname.slice(1);

const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;

console.log(`Checking if database "${dbName}" exists...`);

const pg = new SQL(adminUrl);

const existing = await pg`
  SELECT 1 FROM pg_database WHERE datname = ${dbName}
`;

if (existing.length > 0) {
  console.log(`Database "${dbName}" already exists — nothing to do.`);
} else {
  await pg.unsafe(`CREATE DATABASE ${dbName}`);
  console.log(`Database "${dbName}" created.`);
}

process.exit(0);
