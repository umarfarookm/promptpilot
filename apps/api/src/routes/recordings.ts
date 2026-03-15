import { Router } from 'express';
import pool from '../db/pool';
import type { ApiResponse, Recording } from '@promptpilot/types';

const router = Router();

// List recordings for a script
router.get('/api/scripts/:scriptId/recordings', async (req, res) => {
  try {
    const { scriptId } = req.params;
    const result = await pool.query(
      `SELECT id, script_id, title, duration_ms, created_at
       FROM recordings
       WHERE script_id = $1
       ORDER BY created_at DESC`,
      [scriptId],
    );

    const recordings = result.rows.map((row) => ({
      id: row.id,
      scriptId: row.script_id,
      title: row.title,
      durationMs: row.duration_ms,
      createdAt: row.created_at,
    }));

    const response: ApiResponse<typeof recordings> = { success: true, data: recordings };
    res.json(response);
  } catch (err) {
    console.error('[recordings] List error:', err);
    res.status(500).json({ success: false, error: 'Failed to list recordings' });
  }
});

// Get a single recording (with data)
router.get('/api/recordings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, script_id, title, duration_ms, recording_data, created_at
       FROM recordings
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Recording not found' });
      return;
    }

    const row = result.rows[0];
    const recording: Recording = {
      id: row.id,
      scriptId: row.script_id,
      title: row.title,
      durationMs: row.duration_ms,
      recordingData: row.recording_data,
      createdAt: row.created_at,
    };

    const response: ApiResponse<Recording> = { success: true, data: recording };
    res.json(response);
  } catch (err) {
    console.error('[recordings] Get error:', err);
    res.status(500).json({ success: false, error: 'Failed to get recording' });
  }
});

// Download recording as JSON file
router.get('/api/recordings/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT title, recording_data FROM recordings WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Recording not found' });
      return;
    }

    const { title, recording_data } = result.rows[0];
    const filename = `${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(recording_data, null, 2));
  } catch (err) {
    console.error('[recordings] Download error:', err);
    res.status(500).json({ success: false, error: 'Failed to download recording' });
  }
});

// Delete a recording
router.delete('/api/recordings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM recordings WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Recording not found' });
      return;
    }

    const response: ApiResponse<void> = { success: true, message: 'Recording deleted' };
    res.json(response);
  } catch (err) {
    console.error('[recordings] Delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete recording' });
  }
});

// Save a recording (called internally from WebSocket handler)
export async function saveRecording(
  scriptId: string,
  title: string,
  durationMs: number,
  recordingData: unknown,
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO recordings (script_id, title, duration_ms, recording_data)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [scriptId, title, durationMs, JSON.stringify(recordingData)],
  );
  return result.rows[0].id;
}

export default router;
