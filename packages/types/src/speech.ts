export interface ScriptWordPosition {
  blockIndex: number;
  sentenceIndex: number;
  wordIndex: number;
  globalWordIndex: number;
}

export interface SpeechTranscript {
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
}

export interface AlignmentResult {
  matchedUpTo: ScriptWordPosition;
  confidence: number;
  spokenWordCount: number;
}

export interface SpeechSyncSettings {
  enabled: boolean;
  provider: 'web-speech-api' | 'whisper';
  language: string;
  scrollBehavior: 'smooth' | 'instant';
  lookAheadLines: number;
  whisperEndpoint?: string;
}

export type SpeechRecognitionStatus =
  | 'idle'
  | 'requesting-mic'
  | 'listening'
  | 'paused'
  | 'error'
  | 'unsupported';
