import { config } from "../config";
import type { AiProvider } from "./provider";

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

export class OllamaProvider implements AiProvider {
  readonly name = "ollama";

  async *streamGenerate(prompt: string): AsyncGenerator<string> {
    const res = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: config.aiModel, prompt, stream: true }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Ollama returned ${res.status}: ${text || res.statusText}`,
      );
    }

    if (!res.body) {
      throw new Error("Ollama response has no body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed: OllamaGenerateResponse = JSON.parse(trimmed);
            if (parsed.response) {
              yield parsed.response;
            }
          } catch {
            // Skip malformed lines
          }
        }
      }

      if (buffer.trim()) {
        try {
          const parsed: OllamaGenerateResponse = JSON.parse(buffer.trim());
          if (parsed.response) {
            yield parsed.response;
          }
        } catch {
          // Ignore
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${config.ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(5_000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
