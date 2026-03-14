import { config } from "../config";
import type { AiProvider } from "./provider";
import { OllamaProvider } from "./ollama-client";
import { OpenAiProvider } from "./openai-client";
import { AnthropicProvider } from "./anthropic-client";

let _provider: AiProvider | null = null;

/** Returns the configured AI provider (singleton). */
export function getAiProvider(): AiProvider {
  if (!_provider) {
    switch (config.aiProvider) {
      case "openai":
        _provider = new OpenAiProvider();
        break;
      case "anthropic":
        _provider = new AnthropicProvider();
        break;
      case "ollama":
      default:
        _provider = new OllamaProvider();
        break;
    }
  }
  return _provider;
}

export type { AiProvider } from "./provider";
