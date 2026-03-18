'use client';

import type { ScriptAnalytics, TrendLabel } from '@promptpilot/types';

interface SummaryCardsProps {
  analytics: ScriptAnalytics;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function trendColor(trend: TrendLabel): string {
  switch (trend) {
    case 'improving': return 'text-green-400';
    case 'declining': return 'text-red-400';
    case 'stable': return 'text-pp-primary-400';
    case 'insufficient': return 'text-gray-500';
  }
}

function trendIcon(trend: TrendLabel): string {
  switch (trend) {
    case 'improving': return '\u2191';
    case 'declining': return '\u2193';
    case 'stable': return '\u2192';
    case 'insufficient': return '\u2014';
  }
}

export function SummaryCards({ analytics }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Sessions',
      value: String(analytics.sessionCount),
      sub: analytics.sessionCount === 1 ? 'recording' : 'recordings',
    },
    {
      label: 'Avg Duration',
      value: formatDuration(analytics.avgDurationMs),
      sub: 'per session',
    },
    {
      label: 'Success Rate',
      value: `${analytics.avgSuccessRate}%`,
      sub: 'commands',
    },
    {
      label: 'Trend',
      value: `${trendIcon(analytics.trend)} ${analytics.trend}`,
      sub: 'over sessions',
      className: trendColor(analytics.trend),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-gray-800 bg-pp-dark-900 p-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            {card.label}
          </p>
          <p className={`mt-1 text-2xl font-bold ${card.className ?? 'text-white'}`}>
            {card.value}
          </p>
          <p className="text-xs text-gray-500">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
