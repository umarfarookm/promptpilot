import * as pty from 'node-pty';
import { EventEmitter } from 'events';

const EXIT_MARKER = `__PP_EXIT__`;
const EXIT_MARKER_RE = new RegExp(`${EXIT_MARKER}:(\\d+)`);

const COMMAND_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export interface PtyEvents {
  data: (data: string) => void;
  exit: (exitCode: number) => void;
  error: (error: string) => void;
}

export class PtyWrapper extends EventEmitter {
  private ptyProcess: pty.IPty;
  private running = false;
  private currentCommand: string | null = null;
  private commandStartTime = 0;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private outputSinceLastCheck = false;

  constructor(
    public readonly workingDirectory: string,
    cols: number = 80,
    rows: number = 24,
  ) {
    super();

    // Find a valid shell — process.env.SHELL may not be set under tsx watch
    const shell = this.findShell();
    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd: workingDirectory,
      env: {
        ...process.env,
        SHELL: shell,
        TERM: 'xterm-256color',
        // Prevent pagers from blocking
        PAGER: 'cat',
        GIT_PAGER: 'cat',
        LESS: '-FRSX',
      },
    });

    this.ptyProcess.onData((data: string) => {
      // Check for exit marker to detect command completion
      const match = EXIT_MARKER_RE.exec(data);
      if (match) {
        const exitCode = parseInt(match[1], 10);
        // Strip the marker from output
        const cleaned = data.replace(EXIT_MARKER_RE, '').replace(/\r?\n$/, '');
        if (cleaned) {
          this.emit('data', cleaned);
        }
        this.commandCompleted(exitCode);
        return;
      }

      this.outputSinceLastCheck = true;
      this.emit('data', data);
    });

    this.ptyProcess.onExit(({ exitCode }) => {
      this.running = false;
      this.clearTimeout();
      this.emit('exit', exitCode);
    });
  }

  execute(command: string): void {
    if (this.running) {
      this.emit('error', 'A command is already running');
      return;
    }

    this.running = true;
    this.currentCommand = command;
    this.commandStartTime = Date.now();
    this.outputSinceLastCheck = false;

    console.log(`[terminal] Executing: ${command}`);

    // Write command followed by exit marker echo
    const wrappedCommand = `${command}; echo "${EXIT_MARKER}:$?"\r`;
    this.ptyProcess.write(wrappedCommand);

    this.startTimeout();
  }

  cancel(): void {
    if (!this.running) return;

    // Send SIGINT (Ctrl+C)
    this.ptyProcess.write('\x03');
    this.clearTimeout();

    // Give it a moment, then force kill if still running
    setTimeout(() => {
      if (this.running) {
        this.ptyProcess.write('\x03');
        this.commandCompleted(130); // SIGINT exit code
      }
    }, 500);
  }

  write(data: string): void {
    this.ptyProcess.write(data);
  }

  resize(cols: number, rows: number): void {
    this.ptyProcess.resize(cols, rows);
  }

  destroy(): void {
    this.clearTimeout();
    this.running = false;
    try {
      this.ptyProcess.kill();
    } catch {
      // Already dead
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  get command(): string | null {
    return this.currentCommand;
  }

  private findShell(): string {
    // Try env var first
    if (process.env.SHELL) return process.env.SHELL;

    // Try common paths
    const fs = require('fs');
    const candidates = ['/bin/zsh', '/bin/bash', '/bin/sh'];
    for (const sh of candidates) {
      try {
        fs.accessSync(sh, fs.constants.X_OK);
        return sh;
      } catch {
        // try next
      }
    }
    return '/bin/sh';
  }

  private commandCompleted(exitCode: number) {
    const duration = Date.now() - this.commandStartTime;
    this.running = false;
    this.clearTimeout();

    console.log(
      `[terminal] Command finished: "${this.currentCommand}" (exit=${exitCode}, ${duration}ms)`,
    );

    this.emit('exit', exitCode);
    this.currentCommand = null;
  }

  private startTimeout() {
    this.clearTimeout();
    this.timeoutTimer = setInterval(() => {
      if (!this.running) {
        this.clearTimeout();
        return;
      }

      if (!this.outputSinceLastCheck) {
        // No output for an interval — check total elapsed
        const elapsed = Date.now() - this.commandStartTime;
        if (elapsed > COMMAND_TIMEOUT_MS) {
          console.log(`[terminal] Command timed out after ${elapsed}ms`);
          this.cancel();
          this.emit('error', 'Command timed out (5 minute timeout with no output)');
        }
      }
      this.outputSinceLastCheck = false;
    }, 30_000);
  }

  private clearTimeout() {
    if (this.timeoutTimer) {
      clearInterval(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }
}
