import type { SpeechTranscript, SpeechRecognitionStatus } from '@promptpilot/types';
import type { SpeechRecognitionProvider, TranscriptCallback, ErrorCallback, StatusCallback } from './types';

// Type declarations for the Web Speech API (not in all TS libs)
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string; message?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export class WebSpeechProvider implements SpeechRecognitionProvider {
  private recognition: SpeechRecognitionInstance | null = null;
  private resultCallbacks: TranscriptCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private statusCallbacks: StatusCallback[] = [];
  private _isSupported: boolean;
  private shouldBeListening: boolean = false;
  private language: string;
  private restartTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(language: string = 'en-US') {
    this.language = language;
    this._isSupported = typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  get isSupported(): boolean {
    return this._isSupported;
  }

  async start(): Promise<void> {
    if (!this._isSupported) {
      this.emitStatus('unsupported');
      this.emitError('Speech recognition is not supported in this browser');
      return;
    }

    this.emitStatus('requesting-mic');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.language;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript: SpeechTranscript = {
          text: result[0].transcript.trim(),
          isFinal: result.isFinal,
          confidence: result[0].confidence || 0.5,
          timestamp: Date.now(),
        };
        this.emitResult(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return; // ignore benign errors
      this.emitStatus('error');
      this.emitError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onstart = () => {
      this.emitStatus('listening');
    };

    this.recognition.onend = () => {
      // Auto-restart if we should still be listening (Web Speech API tends to stop)
      if (this.shouldBeListening) {
        this.restartTimeout = setTimeout(() => {
          if (this.shouldBeListening && this.recognition) {
            try {
              this.recognition.start();
            } catch {
              // Already started, ignore
            }
          }
        }, 100);
      } else {
        this.emitStatus('idle');
      }
    };

    this.shouldBeListening = true;
    try {
      this.recognition.start();
    } catch (err) {
      this.emitStatus('error');
      this.emitError(`Failed to start speech recognition: ${err}`);
    }
  }

  stop(): void {
    this.shouldBeListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      this.recognition.onend = null; // prevent auto-restart
      this.recognition.stop();
      this.recognition = null;
    }
    this.emitStatus('idle');
  }

  pause(): void {
    this.shouldBeListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      this.recognition.stop();
    }
    this.emitStatus('paused');
  }

  resume(): void {
    if (!this.recognition) return;
    this.shouldBeListening = true;
    try {
      this.recognition.start();
    } catch {
      // May already be started
    }
  }

  onResult(callback: TranscriptCallback): void {
    this.resultCallbacks.push(callback);
  }

  onError(callback: ErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  onStatusChange(callback: StatusCallback): void {
    this.statusCallbacks.push(callback);
  }

  private emitResult(transcript: SpeechTranscript): void {
    this.resultCallbacks.forEach(cb => cb(transcript));
  }

  private emitError(error: string): void {
    this.errorCallbacks.forEach(cb => cb(error));
  }

  private emitStatus(status: SpeechRecognitionStatus): void {
    this.statusCallbacks.forEach(cb => cb(status));
  }
}
