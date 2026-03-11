import { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@promptpilot/types";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Unhandled error:", err.message);
  console.error(err.stack);

  const response: ApiResponse<null> = {
    success: false,
    error: "Internal server error",
  };

  res.status(500).json(response);
}
