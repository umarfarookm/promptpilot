import { config } from "../config";
import type { AiProvider } from "./provider";

interface OpenAiChunk {
  choices: { delta: { content?: string }; finish_reason: string | null }[];
}

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";

  async *streamGenerate(prompt: string): AsyncGenerator<string> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.aiApiKey}`,
      },
      body: JSON.stringify({
        model: config.aiModel,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `OpenAI returned ${res.status}: ${text || res.statusText}`,
      );
    }

    if (!res.body) throw new Error("OpenAI response has no body");

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
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          try {
            const parsed: OpenAiChunk = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip malformed lines
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async checkHealth(): Promise<boolean> {
    if (!config.aiApiKey) return false;
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${config.aiApiKey}` },
        signal: AbortSignal.timeout(5_000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
