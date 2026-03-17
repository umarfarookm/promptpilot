import { Router } from 'express';
import pool from '../db/pool';
import type { ApiResponse, Recording, ScriptBlock, SessionAnalytics, ScriptAnalytics } from '@promptpilot/types';
import { parseScript } from '@promptpilot/script-engine';
import { computeSessionAnalytics, computeScriptAnalytics } from '../analytics/compute';

const router = Router();

// Analytics for a single recording
router.get('/api/recordings/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch recording
    const recResult = await pool.query(
      `SELECT r.id, r.script_id, r.title, r.duration_ms, r.recording_data, r.created_at,
              s.raw_content
       FROM recordings r
       JOIN scripts s ON s.id = r.script_id
       WHERE r.id = $1`,
      [id],
    );

    if (recResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Recording not found' });
      return;
    }

    const row = recResult.rows[0];
    const recording: Recording = {
      id: row.id,
      scriptId: row.script_id,
      title: row.title,
      durationMs: row.duration_ms,
      recordingData: row.recording_data,
      createdAt: row.created_at,
    };

    const blocks = parseScript(row.raw_content) as ScriptBlock[];
    const analytics = computeSessionAnalytics(recording, blocks);

    const response: ApiResponse<SessionAnalytics> = { success: true, data: analytics };
    res.json(response);
  } catch (err) {
    console.error('[analytics] Recording analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to compute recording analytics' });
  }
});

// Aggregate analytics for all recordings of a script
router.get('/api/scripts/:scriptId/analytics', async (req, res) => {
  try {
    const { scriptId } = req.params;

    // Fetch script for blocks
    const scriptResult = await pool.query(
      `SELECT raw_content FROM scripts WHERE id = $1`,
      [scriptId],
    );

    if (scriptResult.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Script not found' });
      return;
    }

    const blocks = parseScript(scriptResult.rows[0].raw_content) as ScriptBlock[];

    // Fetch all recordings for this script
    const recResult = await pool.query(
      `SELECT id, script_id, title, duration_ms, recording_data, created_at
       FROM recordings
       WHERE script_id = $1
       ORDER BY created_at DESC`,
      [scriptId],
    );

    const sessions: SessionAnalytics[] = recResult.rows.map((row) => {
      const recording: Recording = {
        id: row.id,
        scriptId: row.script_id,
        title: row.title,
        durationMs: row.duration_ms,
        recordingData: row.recording_data,
        createdAt: row.created_at,
      };
      return computeSessionAnalytics(recording, blocks);
    });

    const analytics = computeScriptAnalytics(sessions);
    analytics.scriptId = scriptId;

    const response: ApiResponse<ScriptAnalytics> = { success: true, data: analytics };
    res.json(response);
  } catch (err) {
    console.error('[analytics] Script analytics error:', err);
    res.status(500).json({ success: false, error: 'Failed to compute script analytics' });
  }
});

export default router;
