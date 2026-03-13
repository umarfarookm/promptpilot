import type { SpeechRecognitionProvider, TranscriptCallback, ErrorCallback, StatusCallback } from './types';

export class WhisperProvider implements SpeechRecognitionProvider {
  get isSupported(): boolean {
    return false; // Not implemented yet
  }

  async start(): Promise<void> {
    throw new Error('Whisper provider is not yet implemented. Use web-speech-api instead.');
  }

  stop(): void {}
  pause(): void {}
  resume(): void {}
  onResult(_callback: TranscriptCallback): void {}
  onError(_callback: ErrorCallback): void {}
  onStatusChange(_callback: StatusCallback): void {}
}
