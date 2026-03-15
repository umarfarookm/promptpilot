import { randomUUID } from 'crypto';
import os from 'os';
import type {
  TerminalSession,
  TerminalSessionState,
  SessionInitPayload,
} from '@promptpilot/types';
import { PtyWrapper } from './pty-wrapper';
import { validateWorkingDirectory } from './security';

export interface ManagedSession extends TerminalSession {
  cols: number;
  rows: number;
  pty: PtyWrapper | null;
}

export class SessionManager {
  private sessions = new Map<string, ManagedSession>();

  create(init?: SessionInitPayload): ManagedSession {
    const id = randomUUID();
    let workingDirectory = init?.workingDirectory || os.tmpdir();

    // Validate working directory
    if (init?.workingDirectory) {
      const validation = validateWorkingDirectory(init.workingDirectory);
      if (!validation.allowed) {
        console.log(`[terminal] Invalid working directory: ${validation.reason}, falling back to tmpdir`);
        workingDirectory = os.tmpdir();
      }
    }

    const cols = init?.cols ?? 80;
    const rows = init?.rows ?? 24;

    let ptyInstance: PtyWrapper | null = null;
    try {
      ptyInstance = new PtyWrapper(workingDirectory, cols, rows);
    } catch (err) {
      console.error(`[terminal] Failed to spawn PTY:`, err);
    }

    const session: ManagedSession = {
      id,
      state: ptyInstance ? 'ready' : 'closed',
      workingDirectory,
      currentCommand: null,
      createdAt: new Date(),
      cols,
      rows,
      pty: ptyInstance,
    };

    this.sessions.set(id, session);
    console.log(`[terminal] Session created: ${id} (cwd: ${workingDirectory})`);
    return session;
  }

  get(id: string): ManagedSession | undefined {
    return this.sessions.get(id);
  }

  setState(id: string, state: TerminalSessionState) {
    const session = this.sessions.get(id);
    if (session) {
      session.state = state;
    }
  }

  destroy(id: string) {
    const session = this.sessions.get(id);
    if (session) {
      session.state = 'closed';
      if (session.pty) {
        session.pty.destroy();
        session.pty = null;
      }
      this.sessions.delete(id);
      console.log(`[terminal] Session destroyed: ${id}`);
    }
  }

  destroyAll() {
    for (const id of this.sessions.keys()) {
      this.destroy(id);
    }
  }
}

export const sessionManager = new SessionManager();
