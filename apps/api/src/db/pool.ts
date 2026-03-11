import { Pool } from "pg";
import { config } from "../config";

const pool = new Pool({
  connectionString: config.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
  process.exit(1);
});

export default pool;
