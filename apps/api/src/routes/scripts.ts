import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import type {
  ApiResponse,
  Script,
  CreateScriptRequest,
  UpdateScriptRequest,
} from "@promptpilot/types";
import { parseScript } from "@promptpilot/script-engine";
import pool from "../db/pool";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/scripts - list all scripts
router.get(
  "/api/scripts",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT id, title, description, updated_at
         FROM scripts
         ORDER BY updated_at DESC`
      );

      const scripts = result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        updatedAt: row.updated_at,
      }));

      const response: ApiResponse<typeof scripts> = {
        success: true,
        data: scripts,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/scripts/:id - get one script with parsed blocks
router.get(
  "/api/scripts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT id, title, description, raw_content, created_at, updated_at
         FROM scripts
         WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Script not found",
        };
        res.status(404).json(response);
        return;
      }

      const row = result.rows[0];
      const blocks = parseScript(row.raw_content);

      const script: Script = {
        id: row.id,
        title: row.title,
        description: row.description,
        blocks,
        rawContent: row.raw_content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const response: ApiResponse<Script> = {
        success: true,
        data: script,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/scripts - create a new script
router.post(
  "/api/scripts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, rawContent } =
        req.body as CreateScriptRequest;

      if (!title || !rawContent) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Title and rawContent are required",
        };
        res.status(400).json(response);
        return;
      }

      const result = await pool.query(
        `INSERT INTO scripts (title, description, raw_content)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, raw_content, created_at, updated_at`,
        [title, description ?? null, rawContent]
      );

      const row = result.rows[0];
      const blocks = parseScript(row.raw_content);

      const script: Script = {
        id: row.id,
        title: row.title,
        description: row.description,
        blocks,
        rawContent: row.raw_content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const response: ApiResponse<Script> = {
        success: true,
        data: script,
        message: "Script created successfully",
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/scripts/:id - update a script
router.put(
  "/api/scripts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, rawContent } =
        req.body as UpdateScriptRequest;

      // Build dynamic update query
      const fields: string[] = [];
      const values: unknown[] = [];
      let paramIndex = 1;

      if (title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(description);
      }
      if (rawContent !== undefined) {
        fields.push(`raw_content = $${paramIndex++}`);
        values.push(rawContent);
      }

      if (fields.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "No fields to update",
        };
        res.status(400).json(response);
        return;
      }

      fields.push(`updated_at = NOW()`);
      values.push(req.params.id);

      const result = await pool.query(
        `UPDATE scripts
         SET ${fields.join(", ")}
         WHERE id = $${paramIndex}
         RETURNING id, title, description, raw_content, created_at, updated_at`,
        values
      );

      if (result.rows.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Script not found",
        };
        res.status(404).json(response);
        return;
      }

      const row = result.rows[0];
      const blocks = parseScript(row.raw_content);

      const script: Script = {
        id: row.id,
        title: row.title,
        description: row.description,
        blocks,
        rawContent: row.raw_content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const response: ApiResponse<Script> = {
        success: true,
        data: script,
        message: "Script updated successfully",
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/scripts/:id - delete a script
router.delete(
  "/api/scripts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `DELETE FROM scripts WHERE id = $1 RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Script not found",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: result.rows[0].id },
        message: "Script deleted successfully",
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/scripts/import - import script from file upload
router.post(
  "/api/scripts/import",
  upload.single("file"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        const response: ApiResponse<null> = {
          success: false,
          error: "No file uploaded",
        };
        res.status(400).json(response);
        return;
      }

      const rawContent = req.file.buffer.toString("utf-8");
      const title =
        req.body.title ??
        req.file.originalname.replace(/\.[^/.]+$/, "");

      const result = await pool.query(
        `INSERT INTO scripts (title, description, raw_content)
         VALUES ($1, $2, $3)
         RETURNING id, title, description, raw_content, created_at, updated_at`,
        [title, req.body.description ?? null, rawContent]
      );

      const row = result.rows[0];
      const blocks = parseScript(row.raw_content);

      const script: Script = {
        id: row.id,
        title: row.title,
        description: row.description,
        blocks,
        rawContent: row.raw_content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      const response: ApiResponse<Script> = {
        success: true,
        data: script,
        message: "Script imported successfully",
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/scripts/:id/export - export script as text
router.get(
  "/api/scripts/:id/export",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await pool.query(
        `SELECT title, raw_content FROM scripts WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Script not found",
        };
        res.status(404).json(response);
        return;
      }

      const row = result.rows[0];
      const filename = `${row.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(row.raw_content);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
