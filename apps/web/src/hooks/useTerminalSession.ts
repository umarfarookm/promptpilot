'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type {
  ServerMessage,
  TerminalSessionState,
  CommandFinishedPayload,
  CommandErrorPayload,
} from '@promptpilot/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

export interface RecordingState {
  isRecording: boolean;
  lastSavedId: string | null;
}

export interface TerminalSessionHook {
  state: TerminalSessionState;
  sessionId: string | null;
  connected: boolean;
  error: string | null;
  lastExitCode: number | null;
  lastCommandError: CommandErrorPayload | null;
  connect: (workingDirectory?: string) => void;
  disconnect: () => void;
  executeCommand: (command: string, blockIndex?: number) => void;
  cancelCommand: () => void;
  sendInput: (data: string) => void;
  resize: (cols: number, rows: number) => void;
  onOutput: (handler: (data: string) => void) => void;
  onCommandFinished: (handler: (payload: CommandFinishedPayload) => void) => void;
  startRecording: (scriptId: string, scriptTitle: string, blocks: unknown[]) => void;
  stopRecording: () => void;
  recordingState: RecordingState;
}

export function useTerminalSession(): TerminalSessionHook {
  const wsRef = useRef<WebSocket | null>(null);
  const outputHandlerRef = useRef<((data: string) => void) | null>(null);
  const finishedHandlerRef = useRef<((payload: CommandFinishedPayload) => void) | null>(null);

  const [state, setState] = useState<TerminalSessionState>('closed');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastExitCode, setLastExitCode] = useState<number | null>(null);
  const [lastCommandError, setLastCommandError] = useState<CommandErrorPayload | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    lastSavedId: null,
  });

  const send = useCallback((type: string, payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    let msg: ServerMessage;
    try {
      msg = JSON.parse(event.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case 'session:ready': {
        const payload = msg.payload as { sessionId: string };
        setSessionId(payload.sessionId);
        setState('ready');
        setError(null);
        break;
      }
      case 'session:error': {
        const payload = msg.payload as { error: string };
        setError(payload.error);
        break;
      }
      case 'terminal:output': {
        const payload = msg.payload as { data: string };
        outputHandlerRef.current?.(payload.data);
        break;
      }
      case 'command:started':
        setState('executing');
        setLastExitCode(null);
        setLastCommandError(null);
        break;
      case 'command:finished': {
        const payload = msg.payload as unknown as CommandFinishedPayload;
        setState('ready');
        setLastExitCode(payload.exitCode);
        finishedHandlerRef.current?.(payload);
        break;
      }
      case 'command:error': {
        const payload = msg.payload as unknown as CommandErrorPayload;
        setState('ready');
        setLastCommandError(payload);
        break;
      }
      case 'recording:started':
        setRecordingState({ isRecording: true, lastSavedId: null });
        break;
      case 'recording:stopped':
        setRecordingState((prev) => ({ ...prev, isRecording: false }));
        break;
      case 'recording:saved': {
        const payload = msg.payload as { recordingId: string };
        setRecordingState({ isRecording: false, lastSavedId: payload.recordingId });
        break;
      }
    }
  }, []);

  const connect = useCallback((workingDirectory?: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setState('initializing');
    setError(null);

    const ws = new WebSocket(`${WS_URL}/ws/terminal`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({
        type: 'session:init',
        payload: { workingDirectory },
      }));
    };

    ws.onmessage = handleMessage;

    ws.onclose = () => {
      setConnected(false);
      setState('closed');
      setSessionId(null);
      wsRef.current = null;
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setConnected(false);
    };
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const executeCommand = useCallback((command: string, blockIndex?: number) => {
    send('command:execute', { command, blockIndex });
  }, [send]);

  const cancelCommand = useCallback(() => {
    send('command:cancel', {});
  }, [send]);

  const sendInput = useCallback((data: string) => {
    send('command:input', { data });
  }, [send]);

  const resize = useCallback((cols: number, rows: number) => {
    send('terminal:resize', { cols, rows });
  }, [send]);

  const onOutput = useCallback((handler: (data: string) => void) => {
    outputHandlerRef.current = handler;
  }, []);

  const onCommandFinished = useCallback((handler: (payload: CommandFinishedPayload) => void) => {
    finishedHandlerRef.current = handler;
  }, []);

  const startRecording = useCallback(
    (scriptId: string, scriptTitle: string, blocks: unknown[]) => {
      send('recording:start', { scriptId, scriptTitle, blocks });
    },
    [send],
  );

  const stopRecording = useCallback(() => {
    send('recording:stop', {});
  }, [send]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Memoize the return value so consumers get a stable reference
  return useMemo(
    () => ({
      state,
      sessionId,
      connected,
      error,
      lastExitCode,
      lastCommandError,
      connect,
      disconnect,
      executeCommand,
      cancelCommand,
      sendInput,
      resize,
      onOutput,
      onCommandFinished,
      startRecording,
      stopRecording,
      recordingState,
    }),
    [
      state,
      sessionId,
      connected,
      error,
      lastExitCode,
      lastCommandError,
      connect,
      disconnect,
      executeCommand,
      cancelCommand,
      sendInput,
      resize,
      onOutput,
      onCommandFinished,
      startRecording,
      stopRecording,
      recordingState,
    ],
  );
}
