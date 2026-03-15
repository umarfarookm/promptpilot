import fs from 'fs';
import path from 'path';
import type { CommandValidationResult } from '@promptpilot/types';

const BLOCKED_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\brm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?\/\s*$/, reason: 'Deleting root filesystem is not allowed' },
  { pattern: /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\//, reason: 'Recursive force delete from root is not allowed' },
  { pattern: /\bsudo\b/, reason: 'sudo is not allowed in demo mode' },
  { pattern: /\bsu\s+-?\s*$/, reason: 'su is not allowed in demo mode' },
  { pattern: /\bdd\s+.*of=\/dev\//, reason: 'Writing to raw devices is not allowed' },
  { pattern: /:\(\)\s*\{\s*:\|:\s*&\s*\}\s*;?\s*:/, reason: 'Fork bombs are not allowed' },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: 'Writing to raw devices is not allowed' },
  { pattern: /\bmkfs\b/, reason: 'Formatting filesystems is not allowed' },
  { pattern: /\bshutdown\b/, reason: 'System shutdown is not allowed' },
  { pattern: /\breboot\b/, reason: 'System reboot is not allowed' },
  { pattern: /\bhalt\b/, reason: 'System halt is not allowed' },
  { pattern: /\bpoweroff\b/, reason: 'System poweroff is not allowed' },
  { pattern: /\bchmod\s+777\s+\//, reason: 'Changing root permissions is not allowed' },
  { pattern: /\bchown\s+.*\s+\//, reason: 'Changing root ownership is not allowed' },
];

const allowArbitrary = process.env.TERMINAL_ALLOW_ARBITRARY === 'true';

export function validateCommand(command: string): CommandValidationResult {
  if (allowArbitrary) {
    return { allowed: true };
  }

  const trimmed = command.trim();

  if (!trimmed) {
    return { allowed: false, reason: 'Empty command' };
  }

  for (const { pattern, reason } of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { allowed: false, reason };
    }
  }

  return { allowed: true };
}

export function validateWorkingDirectory(dir: string): CommandValidationResult {
  const resolved = path.resolve(dir);

  try {
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) {
      return { allowed: false, reason: 'Path is not a directory' };
    }
  } catch {
    return { allowed: false, reason: 'Directory does not exist' };
  }

  // Prevent using sensitive system directories
  const blocked = ['/', '/etc', '/usr', '/bin', '/sbin', '/var', '/boot', '/sys', '/proc'];
  if (blocked.includes(resolved)) {
    return { allowed: false, reason: `Working directory '${resolved}' is not allowed` };
  }

  return { allowed: true };
}
