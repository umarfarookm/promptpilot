import { Router, Request, Response } from "express";
import type { ApiResponse } from "@promptpilot/types";

const router = Router();

router.get("/api/health", (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: "ok" },
  };
  res.json(response);
});

export default router;
