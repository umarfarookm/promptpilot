import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Server } from 'http';
import type {
  ClientMessage,
  ServerMessage,
  SessionInitPayload,
  CommandExecutePayload,
  CommandInputPayload,
  TerminalResizePayload,
} from '@promptpilot/types';
import { config } from '../config';
import { sessionManager } from './session-manager';
import { validateCommand } from './security';
import { RecordingManager } from './recording-manager';
import { saveRecording } from '../routes/recordings';
import { analyzeError } from './error-analyzer';

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function checkOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return origin === config.corsOrigin;
}

export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/terminal' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const origin = req.headers.origin;
    if (!checkOrigin(origin)) {
      console.log(`[ws] Rejected connection from origin: ${origin}`);
      ws.close(4003, 'Origin not allowed');
      return;
    }

    let sessionId: string | null = null;
    const recorder = new RecordingManager();
    let recentOutput = ''; // Buffer recent output for error analysis
    const MAX_OUTPUT_BUFFER = 4096;

    ws.on('message', (raw: Buffer) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: 'session:error', payload: { error: 'Invalid JSON' } });
        return;
      }

      switch (msg.type) {
        case 'session:init': {
          const payload = msg.payload as unknown as SessionInitPayload;
          const session = sessionManager.create(payload);
          sessionId = session.id;

          if (!session.pty) {
            send(ws, {
              type: 'session:error',
              payload: { error: 'Failed to start terminal. Check server logs.' },
            });
            break;
          }

          // Wire PTY events to WebSocket
          if (session.pty) {
            session.pty.on('data', (data: string) => {
              send(ws, { type: 'terminal:output', payload: { data } });
              // Buffer for error analysis
              recentOutput += data;
              if (recentOutput.length > MAX_OUTPUT_BUFFER) {
                recentOutput = recentOutput.slice(-MAX_OUTPUT_BUFFER);
              }
              // Record output if recording
              if (recorder.isRecording) {
                recorder.addEvent('output', data);
              }
            });

            session.pty.on('exit', (exitCode: number) => {
              const command = session.currentCommand || '';
              const duration = Date.now() - (session.createdAt?.getTime() || Date.now());
              session.currentCommand = null;
              sessionManager.setState(session.id, 'ready');

              // Run error analysis
              const errorAnalysis = analyzeError(recentOutput, exitCode);

              send(ws, {
                type: 'command:finished',
                payload: {
                  command,
                  exitCode,
                  duration,
                  ...(errorAnalysis ? { errorAnalysis } : {}),
                },
              });

              // Clear output buffer for next command
              recentOutput = '';

              // Record exit if recording
              if (recorder.isRecording) {
                recorder.addEvent('exit', command, undefined, exitCode);
              }
            });

            session.pty.on('error', (error: string) => {
              send(ws, {
                type: 'command:error',
                payload: { command: session.currentCommand || '', error },
              });

              if (recorder.isRecording) {
                recorder.addEvent('error', error);
              }
            });
          }

          send(ws, {
            type: 'session:ready',
            payload: {
              sessionId: session.id,
              workingDirectory: session.workingDirectory,
            },
          });
          break;
        }

        case 'command:execute': {
          if (!sessionId) {
            send(ws, {
              type: 'session:error',
              payload: { error: 'No active session. Send session:init first.' },
            });
            return;
          }

          const session = sessionManager.get(sessionId);
          if (!session?.pty) {
            send(ws, { type: 'session:error', payload: { error: 'Session not found' } });
            return;
          }

          const { command, blockIndex } = msg.payload as unknown as CommandExecutePayload;

          // Validate command
          const validation = validateCommand(command);
          if (!validation.allowed) {
            send(ws, {
              type: 'command:error',
              payload: { command, error: validation.reason || 'Command blocked', blockIndex },
            });
            return;
          }

          // Audit log
          console.log(`[audit] Session ${sessionId}: executing "${command}"`);

          session.currentCommand = command;
          sessionManager.setState(sessionId, 'executing');

          send(ws, {
            type: 'command:started',
            payload: { command, blockIndex },
          });

          // Record command if recording
          if (recorder.isRecording) {
            recorder.addEvent('command', command, blockIndex);
          }

          session.pty.execute(command);
          break;
        }

        case 'command:cancel': {
          if (!sessionId) return;
          const session = sessionManager.get(sessionId);
          if (session?.pty) {
            session.pty.cancel();
          }
          break;
        }

        case 'command:input': {
          if (!sessionId) return;
          const session = sessionManager.get(sessionId);
          const { data } = msg.payload as unknown as CommandInputPayload;
          if (session?.pty) {
            session.pty.write(data);
          }
          break;
        }

        case 'terminal:resize': {
          if (!sessionId) return;
          const session = sessionManager.get(sessionId);
          const { cols, rows } = msg.payload as unknown as TerminalResizePayload;
          if (session?.pty) {
            session.pty.resize(cols, rows);
          }
          break;
        }

        case 'recording:start': {
          const { scriptId, scriptTitle, blocks } = msg.payload as {
            scriptId: string;
            scriptTitle: string;
            blocks: unknown[];
          };
          recorder.start(scriptId, scriptTitle, blocks);
          send(ws, { type: 'recording:started', payload: {} });
          break;
        }

        case 'recording:stop': {
          const data = recorder.stop();
          if (data) {
            // Save to database
            saveRecording(data.scriptId, data.scriptTitle, data.duration, data)
              .then((recordingId) => {
                send(ws, {
                  type: 'recording:saved',
                  payload: { recordingId, duration: data.duration },
                });
              })
              .catch((err) => {
                console.error('[recording] Save error:', err);
                // Still send the data back even if DB save fails
                send(ws, {
                  type: 'recording:stopped',
                  payload: { recordingData: data },
                });
              });
          } else {
            send(ws, { type: 'recording:stopped', payload: {} });
          }
          break;
        }

        default:
          send(ws, {
            type: 'session:error',
            payload: { error: `Unknown message type: ${msg.type}` },
          });
      }
    });

    ws.on('close', () => {
      // Stop recording if active
      if (recorder.isRecording) {
        recorder.stop();
      }
      if (sessionId) {
        sessionManager.destroy(sessionId);
        sessionId = null;
      }
    });

    ws.on('error', (err) => {
      console.error('[ws] WebSocket error:', err.message);
      if (sessionId) {
        sessionManager.destroy(sessionId);
        sessionId = null;
      }
    });
  });

  console.log('[ws] WebSocket server attached at /ws/terminal');
  return wss;
}
