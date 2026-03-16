// ---------------------------------------------------------------------------
// Presentation Analytics types (Phase 5)
// ---------------------------------------------------------------------------

export type PaceLabel = 'rushed' | 'on-pace' | 'slow';

export type TrendLabel = 'improving' | 'declining' | 'stable' | 'insufficient';

export interface BlockActualTiming {
  blockIndex: number;
  blockType: string;
  estimatedMs: number;
  actualMs: number;
  pace: PaceLabel;
}

export interface CommandDetail {
  command: string;
  exitCode: number;
  durationMs: number;
  blockIndex?: number;
}

export interface CommandStats {
  total: number;
  succeeded: number;
  failed: number;
  successRate: number;
  avgDurationMs: number;
  commands: CommandDetail[];
}

export interface PaceAnalysis {
  rushed: number;
  onPace: number;
  slow: number;
}

export interface ErrorDetail {
  blockIndex?: number;
  error: string;
  recoveryMs: number;
}

export interface ErrorStats {
  total: number;
  avgRecoveryMs: number;
  errors: ErrorDetail[];
}

export interface SessionAnalytics {
  recordingId: string;
  scriptId: string;
  title: string;
  recordedAt: string;
  estimatedDurationMs: number;
  actualDurationMs: number;
  blockTimings: BlockActualTiming[];
  commandStats: CommandStats;
  paceAnalysis: PaceAnalysis;
  errorStats: ErrorStats;
}

export interface SessionAnalyticsSummary {
  recordingId: string;
  title: string;
  recordedAt: string;
  actualDurationMs: number;
  commandSuccessRate: number;
  errorCount: number;
}

export interface ScriptAnalytics {
  scriptId: string;
  sessionCount: number;
  avgDurationMs: number;
  avgSuccessRate: number;
  trend: TrendLabel;
  sessions: SessionAnalyticsSummary[];
  latest: SessionAnalytics | null;
}
