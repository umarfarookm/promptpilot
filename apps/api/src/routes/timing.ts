import { Router, Request, Response, NextFunction } from "express";
import type { ApiResponse, TimingEstimate, TimingRequest } from "@promptpilot/types";
import { estimateTiming } from "../ai/timing";

const router = Router();

// POST /api/scripts/timing - estimate script duration
router.post(
  "/api/scripts/timing",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { rawContent, wordsPerMinute } = req.body as TimingRequest;

      if (!rawContent) {
        const response: ApiResponse<null> = {
          success: false,
          error: "rawContent is required",
        };
        res.status(400).json(response);
        return;
      }

      const estimate = estimateTiming(rawContent, wordsPerMinute);

      const response: ApiResponse<TimingEstimate> = {
        success: true,
        data: estimate,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
