import express from "express";
import { config } from "./config";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import healthRouter from "./routes/health";
import scriptsRouter from "./routes/scripts";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use(healthRouter);
app.use(scriptsRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`@promptpilot/api listening on port ${config.port}`);
});

export default app;
