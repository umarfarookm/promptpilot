export interface ErrorAnalysis {
  category: string;
  message: string;
  suggestions: string[];
}

interface ErrorPattern {
  pattern: RegExp;
  category: string;
  message: string;
  suggestions: string[];
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    pattern: /command not found/i,
    category: 'missing-command',
    message: 'Command not found',
    suggestions: [
      'Check if the command is installed',
      'Verify the command is in your PATH',
      'Try installing it with your package manager',
    ],
  },
  {
    pattern: /permission denied/i,
    category: 'permission',
    message: 'Permission denied',
    suggestions: [
      'Check file permissions with `ls -la`',
      'Ensure the file is executable: `chmod +x <file>`',
      'Verify you have access to the directory',
    ],
  },
  {
    pattern: /EADDRINUSE|address already in use/i,
    category: 'port-conflict',
    message: 'Port already in use',
    suggestions: [
      'Find what is using the port: `lsof -i :<port>`',
      'Kill the process using the port',
      'Try a different port',
    ],
  },
  {
    pattern: /MODULE_NOT_FOUND|Cannot find module/i,
    category: 'missing-module',
    message: 'Module not found',
    suggestions: [
      'Run `npm install` or `pnpm install` to install dependencies',
      'Check if the module name is correct',
      'Verify the module is listed in package.json',
    ],
  },
  {
    pattern: /ENOENT|no such file or directory/i,
    category: 'file-not-found',
    message: 'File or directory not found',
    suggestions: [
      'Check the file path for typos',
      'List the directory contents with `ls`',
      'Verify you are in the correct directory with `pwd`',
    ],
  },
  {
    pattern: /ECONNREFUSED|Connection refused/i,
    category: 'connection',
    message: 'Connection refused',
    suggestions: [
      'Check if the target service is running',
      'Verify the host and port are correct',
      'Check firewall settings',
    ],
  },
  {
    pattern: /syntax error|SyntaxError/i,
    category: 'syntax',
    message: 'Syntax error',
    suggestions: [
      'Check the command for typos',
      'Verify quotes and brackets are balanced',
      'Review the command syntax in the documentation',
    ],
  },
  {
    pattern: /out of memory|ENOMEM/i,
    category: 'memory',
    message: 'Out of memory',
    suggestions: [
      'Close other applications to free memory',
      'Try running with less data',
      'Increase available memory or swap space',
    ],
  },
  {
    pattern: /timeout|ETIMEDOUT/i,
    category: 'timeout',
    message: 'Operation timed out',
    suggestions: [
      'Check your network connection',
      'Try the operation again',
      'Increase the timeout value if configurable',
    ],
  },
  {
    pattern: /npm ERR!|yarn error/i,
    category: 'package-manager',
    message: 'Package manager error',
    suggestions: [
      'Clear the cache: `npm cache clean --force` or `pnpm store prune`',
      'Delete node_modules and reinstall',
      'Check for conflicting dependency versions',
    ],
  },
];

export function analyzeError(output: string, exitCode: number): ErrorAnalysis | null {
  if (exitCode === 0) return null;

  for (const { pattern, category, message, suggestions } of ERROR_PATTERNS) {
    if (pattern.test(output)) {
      return { category, message, suggestions };
    }
  }

  // Generic failure
  if (exitCode !== 0) {
    return {
      category: 'unknown',
      message: `Command failed with exit code ${exitCode}`,
      suggestions: [
        'Review the output above for error details',
        'Try running the command manually in a terminal',
        'Check command arguments and flags',
      ],
    };
  }

  return null;
}
