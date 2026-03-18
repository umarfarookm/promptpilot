'use client';

import type { CommandStats } from '@promptpilot/types';

interface CommandResultsTableProps {
  commandStats: CommandStats;
}

export function CommandResultsTable({ commandStats }: CommandResultsTableProps) {
  if (commandStats.commands.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6 text-center text-gray-500">
        No commands executed in this session
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-pp-dark-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          Commands
        </h3>
        <span className="text-xs text-gray-500">
          {commandStats.succeeded}/{commandStats.total} succeeded ({commandStats.successRate}%)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs uppercase text-gray-500">
              <th className="pb-2 pr-4">Command</th>
              <th className="pb-2 pr-4">Exit Code</th>
              <th className="pb-2">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {commandStats.commands.map((cmd, i) => (
              <tr key={i}>
                <td className="py-2 pr-4 font-mono text-xs text-gray-300">
                  {cmd.command}
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${
                      cmd.exitCode === 0
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}
                  >
                    {cmd.exitCode}
                  </span>
                </td>
                <td className="py-2 text-xs text-gray-500">
                  {(cmd.durationMs / 1000).toFixed(1)}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
