import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV !== "test") {
  console.warn("DATABASE_URL environment variable is not defined");
}

const globalForDb = globalThis as unknown as {
  dbPool: Pool | undefined;
};

export const pool =
  globalForDb.dbPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl:
      databaseUrl?.includes("localhost") || databaseUrl?.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.dbPool = pool;
}
