import { config } from "../config";
import type { AiProvider } from "./provider";

interface AnthropicStreamEvent {
  type: string;
  delta?: { type: string; text?: string };
}

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";

  async *streamGenerate(prompt: string): AsyncGenerator<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.aiApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.aiModel,
        max_tokens: 4096,
        stream: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Anthropic returned ${res.status}: ${text || res.statusText}`,
      );
    }

    if (!res.body) throw new Error("Anthropic response has no body");

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

          try {
            const event: AnthropicStreamEvent = JSON.parse(trimmed.slice(6));
            if (
              event.type === "content_block_delta" &&
              event.delta?.type === "text_delta" &&
              event.delta.text
            ) {
              yield event.delta.text;
            }
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
    // A lightweight check — just verify the key format is present.
    // The Anthropic API doesn't have a /models list endpoint that
    // works without burning tokens, so we just validate config.
    return config.aiApiKey.startsWith("sk-ant-");
  }
}
