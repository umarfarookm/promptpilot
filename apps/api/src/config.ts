import dotenv from "dotenv";

dotenv.config();

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://promptpilot:promptpilot@localhost:5432/promptpilot",
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
