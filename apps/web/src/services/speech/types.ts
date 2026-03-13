import type { SpeechTranscript, SpeechRecognitionStatus } from '@promptpilot/types';

export type TranscriptCallback = (transcript: SpeechTranscript) => void;
export type ErrorCallback = (error: string) => void;
export type StatusCallback = (status: SpeechRecognitionStatus) => void;

export interface SpeechRecognitionProvider {
  start(): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  onResult(callback: TranscriptCallback): void;
  onError(callback: ErrorCallback): void;
  onStatusChange(callback: StatusCallback): void;
  readonly isSupported: boolean;
}
