import { Router, Request, Response, NextFunction } from "express";
import type {
  ApiResponse,
  AiStatusResponse,
  AiGenerateRequest,
  AiRewriteRequest,
  AiTransitionsRequest,
  AiGrammarReviewRequest,
  AiStreamEvent,
} from "@promptpilot/types";
import { config } from "../config";
import { getAiProvider } from "../ai";
import {
  buildGeneratePrompt,
  buildRewritePrompt,
  buildTransitionsPrompt,
  buildGrammarPrompt,
} from "../ai/prompts";

const router = Router();

// ---------------------------------------------------------------------------
// Helper: stream an LLM response as SSE
// ---------------------------------------------------------------------------
async function streamAiResponse(res: Response, prompt: string): Promise<void> {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let clientClosed = false;
  res.on("close", () => {
    clientClosed = true;
  });

  const provider = getAiProvider();

  try {
    for await (const chunk of provider.streamGenerate(prompt)) {
      if (clientClosed) break;
      const event: AiStreamEvent = { type: "chunk", content: chunk };
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    if (!clientClosed) {
      const done: AiStreamEvent = { type: "done" };
      res.write(`data: ${JSON.stringify(done)}\n\n`);
    }
  } catch (err) {
    if (!clientClosed) {
      const message =
        err instanceof Error ? err.message : "Unknown error during generation";
      const event: AiStreamEvent = { type: "error", error: message };
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  } finally {
    res.end();
  }
}

// ---------------------------------------------------------------------------
// GET /api/ai/status — check AI provider availability
// ---------------------------------------------------------------------------
router.get(
  "/api/ai/status",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = getAiProvider();
      const available = await provider.checkHealth();
      const response: ApiResponse<AiStatusResponse> = {
        success: true,
        data: {
          available,
          provider: config.aiProvider,
          model: config.aiModel,
          error: available
            ? undefined
            : `${provider.name} is not reachable. Check your configuration.`,
        },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);

// ---------------------------------------------------------------------------
// POST /api/ai/generate — generate a script from a topic
// ---------------------------------------------------------------------------
router.post(
  "/api/ai/generate",
  async (req: Request, res: Response) => {
    const body = req.body as AiGenerateRequest;

    if (!body.topic) {
      res.status(400).json({ success: false, error: "topic is required" });
      return;
    }

    const prompt = buildGeneratePrompt(body);
    await streamAiResponse(res, prompt);
  },
);

// ---------------------------------------------------------------------------
// POST /api/ai/rewrite — rewrite an existing script
// ---------------------------------------------------------------------------
router.post(
  "/api/ai/rewrite",
  async (req: Request, res: Response) => {
    const body = req.body as AiRewriteRequest;

    if (!body.rawContent) {
      res.status(400).json({ success: false, error: "rawContent is required" });
      return;
    }

    const prompt = buildRewritePrompt(body);
    await streamAiResponse(res, prompt);
  },
);

// ---------------------------------------------------------------------------
// POST /api/ai/transitions — suggest transitions
// ---------------------------------------------------------------------------
router.post(
  "/api/ai/transitions",
  async (req: Request, res: Response) => {
    const body = req.body as AiTransitionsRequest;

    if (!body.rawContent) {
      res.status(400).json({ success: false, error: "rawContent is required" });
      return;
    }

    const prompt = buildTransitionsPrompt(body);
    await streamAiResponse(res, prompt);
  },
);

// ---------------------------------------------------------------------------
// POST /api/ai/grammar-review — grammar and clarity review
// ---------------------------------------------------------------------------
router.post(
  "/api/ai/grammar-review",
  async (req: Request, res: Response) => {
    const body = req.body as AiGrammarReviewRequest;

    if (!body.rawContent) {
      res.status(400).json({ success: false, error: "rawContent is required" });
      return;
    }

    const prompt = buildGrammarPrompt(body);
    await streamAiResponse(res, prompt);
  },
);

export default router;
