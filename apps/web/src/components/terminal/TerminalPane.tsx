'use client';

import { useRef, useEffect } from 'react';
import type { TerminalSessionHook } from '@/hooks/useTerminalSession';

const DARK_THEME = {
  background: '#0d1117',
  foreground: '#c9d1d9',
  cursor: '#58a6ff',
  cursorAccent: '#0d1117',
  selectionBackground: '#264f78',
  black: '#484f58',
  red: '#ff7b72',
  green: '#3fb950',
  yellow: '#d29922',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  cyan: '#39d353',
  white: '#c9d1d9',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#56d364',
  brightYellow: '#e3b341',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d364',
  brightWhite: '#f0f6fc',
};

interface TerminalPaneProps {
  session: TerminalSessionHook;
}

export function TerminalPane({ session }: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<InstanceType<typeof import('@xterm/xterm').Terminal> | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // Initialize terminal once on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let resizeObs: ResizeObserver | null = null;

    (async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');

      if (disposed) return;

      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      const term = new Terminal({
        theme: DARK_THEME,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Menlo, monospace',
        fontSize: 13,
        lineHeight: 1.3,
        cursorBlink: true,
        allowProposedApi: true,
      });

      term.loadAddon(fitAddon);
      term.loadAddon(webLinksAddon);
      term.open(container);
      fitAddon.fit();
      termRef.current = term;

      // Send terminal dimensions on resize
      resizeObs = new ResizeObserver(() => {
        if (!disposed) {
          fitAddon.fit();
          sessionRef.current.resize(term.cols, term.rows);
        }
      });
      resizeObs.observe(container);

      // Wire output from session to terminal
      sessionRef.current.onOutput((data: string) => {
        if (!disposed) {
          term.write(data);
        }
      });

      // Send user input to session
      term.onData((data: string) => {
        sessionRef.current.sendInput(data);
      });
    })();

    return () => {
      disposed = true;
      resizeObs?.disconnect();
      if (termRef.current) {
        termRef.current.dispose();
        termRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col bg-[#0d1117]">
      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Terminal</span>
          {session.state === 'executing' && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
              <span className="text-xs text-yellow-400">Running</span>
            </span>
          )}
          {session.state === 'ready' && session.connected && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs text-green-400">Ready</span>
            </span>
          )}
          {!session.connected && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <span className="text-xs text-red-400">Disconnected</span>
            </span>
          )}
        </div>
        {session.state === 'executing' && (
          <button
            type="button"
            onClick={session.cancelCommand}
            className="rounded px-2 py-0.5 text-xs text-red-400 transition-colors hover:bg-red-900/30"
          >
            Cancel (Ctrl+C)
          </button>
        )}
      </div>

      {/* Terminal display */}
      <div ref={containerRef} className="flex-1 p-2" />
    </div>
  );
}
