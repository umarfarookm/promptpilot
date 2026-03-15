export type ScrollMode = 'auto' | 'speech' | 'step';

// WebSocket message types — client → server
export type ClientMessageType =
  | 'session:init'
  | 'command:execute'
  | 'command:cancel'
  | 'command:input'
  | 'terminal:resize'
  | 'recording:start'
  | 'recording:stop';

// WebSocket message types — server → client
export type ServerMessageType =
  | 'session:ready'
  | 'session:error'
  | 'terminal:output'
  | 'command:started'
  | 'command:finished'
  | 'command:error'
  | 'recording:started'
  | 'recording:stopped'
  | 'recording:saved';

export interface ClientMessage {
  type: ClientMessageType;
  payload: Record<string, unknown>;
}

export interface ServerMessage {
  type: ServerMessageType;
  payload: Record<string, unknown>;
}

// Specific message payloads

export interface SessionInitPayload {
  workingDirectory?: string;
  cols?: number;
  rows?: number;
}

export interface CommandExecutePayload {
  command: string;
  blockIndex?: number;
}

export interface CommandInputPayload {
  data: string;
}

export interface TerminalResizePayload {
  cols: number;
  rows: number;
}

export interface SessionReadyPayload {
  sessionId: string;
  workingDirectory: string;
}

export interface TerminalOutputPayload {
  data: string;
}

export interface CommandStartedPayload {
  command: string;
  blockIndex?: number;
}

export interface CommandFinishedPayload {
  command: string;
  exitCode: number;
  blockIndex?: number;
  duration: number;
}

export interface CommandErrorPayload {
  command: string;
  error: string;
  blockIndex?: number;
  suggestions?: string[];
}

// Session state

export type TerminalSessionState = 'initializing' | 'ready' | 'executing' | 'closed';

export interface TerminalSession {
  id: string;
  state: TerminalSessionState;
  workingDirectory: string;
  currentCommand: string | null;
  createdAt: Date;
}

// Recording types

export type RecordingEventType = 'block-advance' | 'command' | 'output' | 'exit' | 'error';

export interface RecordingEvent {
  timestamp: number;
  type: RecordingEventType;
  blockIndex?: number;
  data: string;
  exitCode?: number;
}

export interface RecordingData {
  version: 1;
  scriptId: string;
  scriptTitle: string;
  blocks: unknown[];
  startedAt: string;
  duration: number;
  events: RecordingEvent[];
}

export interface Recording {
  id: string;
  scriptId: string;
  title: string;
  durationMs: number;
  recordingData: RecordingData;
  createdAt: Date;
}

// Command validation

export interface CommandValidationResult {
  allowed: boolean;
  reason?: string;
}
