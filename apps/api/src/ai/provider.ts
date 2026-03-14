/**
 * Common interface for all AI providers.
 * Each provider implements streaming text generation and a health check.
 */
export interface AiProvider {
  readonly name: string;
  streamGenerate(prompt: string): AsyncGenerator<string>;
  checkHealth(): Promise<boolean>;
}
