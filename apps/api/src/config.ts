import dotenv from "dotenv";
import type { AiProviderId } from "@promptpilot/types";

dotenv.config();

const aiProvider = (process.env.AI_PROVIDER ?? "ollama") as AiProviderId;

export const config = {
  databaseUrl:
    process.env.DATABASE_URL ??
    "postgresql://promptpilot:promptpilot@localhost:5432/promptpilot",
  port: parseInt(process.env.PORT ?? "3001", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  // AI provider settings
  aiProvider,
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? getDefaultModel(aiProvider),
  ollamaUrl: process.env.OLLAMA_URL ?? "http://localhost:11434",
};

function getDefaultModel(provider: AiProviderId): string {
  switch (provider) {
    case "ollama":
      return "llama3.2";
    case "openai":
      return "gpt-4o-mini";
    case "anthropic":
      return "claude-sonnet-4-20250514";
  }
}
