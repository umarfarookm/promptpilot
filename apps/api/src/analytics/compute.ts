import type {
  RecordingData,
  RecordingEvent,
  ScriptBlock,
  SessionAnalytics,
  SessionAnalyticsSummary,
  ScriptAnalytics,
  BlockActualTiming,
  CommandDetail,
  CommandStats,
  PaceAnalysis,
  PaceLabel,
  ErrorDetail,
  ErrorStats,
  TrendLabel,
} from '@promptpilot/types';

const DEFAULT_WPM = 130;
const ACTION_MS = 3000;
const COMMAND_MS = 5000;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function computeEstimatedDurationMs(blocks: ScriptBlock[]): number {
  let totalMs = 0;
  for (const block of blocks) {
    switch (block.type) {
      case 'SAY':
      case 'TEXT':
        totalMs += (countWords(block.content) / DEFAULT_WPM) * 60_000;
        break;
      case 'ACTION':
        totalMs += ACTION_MS;
        break;
      case 'COMMAND':
        totalMs += COMMAND_MS;
        break;
      default:
        totalMs += (countWords(block.content) / DEFAULT_WPM) * 60_000;
    }
  }
  return Math.round(totalMs);
}

function getPaceLabel(actualMs: number, estimatedMs: number): PaceLabel {
  if (estimatedMs === 0) return 'on-pace';
  const ratio = actualMs / estimatedMs;
  if (ratio < 0.7) return 'rushed';
  if (ratio > 1.5) return 'slow';
  return 'on-pace';
}

export function computeSessionAnalytics(
  recording: { id: string; scriptId: string; title: string; durationMs: number; recordingData: RecordingData; createdAt: Date | string },
  blocks: ScriptBlock[],
): SessionAnalytics {
  const events = [...recording.recordingData.events].sort((a, b) => a.timestamp - b.timestamp);
  const estimatedDurationMs = computeEstimatedDurationMs(blocks);

  // Block timings — measure time between consecutive block-advance events
  const blockAdvances = events.filter((e) => e.type === 'block-advance');
  const blockTimings: BlockActualTiming[] = [];

  for (let i = 0; i < blockAdvances.length; i++) {
    const start = blockAdvances[i].timestamp;
    const end = i < blockAdvances.length - 1 ? blockAdvances[i + 1].timestamp : start + recording.durationMs - (start - events[0]?.timestamp || 0);
    const blockIndex = blockAdvances[i].blockIndex ?? i;
    const block = blocks[blockIndex];
    const blockEstMs = block ? computeEstimatedDurationMs([block]) : 0;
    const actualMs = Math.max(0, end - start);

    blockTimings.push({
      blockIndex,
      blockType: block?.type ?? 'UNKNOWN',
      estimatedMs: blockEstMs,
      actualMs,
      pace: getPaceLabel(actualMs, blockEstMs),
    });
  }

  // Command stats — pair command events with exit events
  const commands: CommandDetail[] = [];
  const pendingCommands: Map<string, { event: RecordingEvent; idx: number }> = new Map();

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.type === 'command') {
      pendingCommands.set(e.data, { event: e, idx: i });
    } else if (e.type === 'exit') {
      // Find the most recent command event to pair with
      let paired: { event: RecordingEvent; idx: number } | undefined;
      for (const [key, val] of pendingCommands) {
        if (!paired || val.idx > paired.idx) {
          paired = val;
        }
      }
      if (paired) {
        pendingCommands.delete(paired.event.data);
        commands.push({
          command: paired.event.data,
          exitCode: e.exitCode ?? -1,
          durationMs: e.timestamp - paired.event.timestamp,
          blockIndex: paired.event.blockIndex,
        });
      }
    }
  }

  const succeeded = commands.filter((c) => c.exitCode === 0).length;
  const totalDurationMs = commands.reduce((sum, c) => sum + c.durationMs, 0);

  const commandStats: CommandStats = {
    total: commands.length,
    succeeded,
    failed: commands.length - succeeded,
    successRate: commands.length > 0 ? Math.round((succeeded / commands.length) * 100) : 100,
    avgDurationMs: commands.length > 0 ? Math.round(totalDurationMs / commands.length) : 0,
    commands,
  };

  // Pace analysis
  const paceAnalysis: PaceAnalysis = {
    rushed: blockTimings.filter((b) => b.pace === 'rushed').length,
    onPace: blockTimings.filter((b) => b.pace === 'on-pace').length,
    slow: blockTimings.filter((b) => b.pace === 'slow').length,
  };

  // Error stats
  const errors: ErrorDetail[] = [];
  for (let i = 0; i < events.length; i++) {
    if (events[i].type === 'error') {
      // Recovery time = time until next block-advance or end of recording
      let recoveryMs = 0;
      for (let j = i + 1; j < events.length; j++) {
        if (events[j].type === 'block-advance' || events[j].type === 'command') {
          recoveryMs = events[j].timestamp - events[i].timestamp;
          break;
        }
      }
      errors.push({
        blockIndex: events[i].blockIndex,
        error: events[i].data,
        recoveryMs,
      });
    }
  }

  const errorStats: ErrorStats = {
    total: errors.length,
    avgRecoveryMs: errors.length > 0 ? Math.round(errors.reduce((s, e) => s + e.recoveryMs, 0) / errors.length) : 0,
    errors,
  };

  return {
    recordingId: recording.id,
    scriptId: recording.scriptId,
    title: recording.title,
    recordedAt: typeof recording.createdAt === 'string' ? recording.createdAt : recording.createdAt.toISOString(),
    estimatedDurationMs,
    actualDurationMs: recording.durationMs,
    blockTimings,
    commandStats,
    paceAnalysis,
    errorStats,
  };
}

export function computeSessionSummary(session: SessionAnalytics): SessionAnalyticsSummary {
  return {
    recordingId: session.recordingId,
    title: session.title,
    recordedAt: session.recordedAt,
    actualDurationMs: session.actualDurationMs,
    commandSuccessRate: session.commandStats.successRate,
    errorCount: session.errorStats.total,
  };
}

function computeTrend(sessions: SessionAnalyticsSummary[]): TrendLabel {
  if (sessions.length < 2) return 'insufficient';

  // Compare average success rate of first half vs second half
  const mid = Math.floor(sessions.length / 2);
  const recent = sessions.slice(0, mid);
  const older = sessions.slice(mid);

  const recentAvgRate = recent.reduce((s, r) => s + r.commandSuccessRate, 0) / recent.length;
  const olderAvgRate = older.reduce((s, r) => s + r.commandSuccessRate, 0) / older.length;

  const diff = recentAvgRate - olderAvgRate;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

export function computeScriptAnalytics(
  sessions: SessionAnalytics[],
): ScriptAnalytics {
  const summaries = sessions.map(computeSessionSummary);
  const avgDurationMs = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + r.actualDurationMs, 0) / sessions.length)
    : 0;
  const avgSuccessRate = sessions.length > 0
    ? Math.round(sessions.reduce((s, r) => s + r.commandStats.successRate, 0) / sessions.length)
    : 100;

  return {
    scriptId: sessions[0]?.scriptId ?? '',
    sessionCount: sessions.length,
    avgDurationMs,
    avgSuccessRate,
    trend: computeTrend(summaries),
    sessions: summaries,
    latest: sessions[0] ?? null,
  };
}
