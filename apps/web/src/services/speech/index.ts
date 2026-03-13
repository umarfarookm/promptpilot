import type { SpeechRecognitionProvider } from './types';
import { WebSpeechProvider } from './WebSpeechProvider';
import { WhisperProvider } from './WhisperProvider';

export type { SpeechRecognitionProvider } from './types';

export function createSpeechProvider(
  provider: 'web-speech-api' | 'whisper',
  config?: { language?: string; whisperEndpoint?: string }
): SpeechRecognitionProvider {
  switch (provider) {
    case 'web-speech-api':
      return new WebSpeechProvider(config?.language ?? 'en-US');
    case 'whisper':
      return new WhisperProvider();
    default:
      return new WebSpeechProvider(config?.language ?? 'en-US');
  }
}
