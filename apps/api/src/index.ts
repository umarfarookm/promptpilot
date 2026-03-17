import { createServer } from "http";
import express from "express";
import { config } from "./config";
import { corsMiddleware } from "./middleware/cors";
import { errorHandler } from "./middleware/error-handler";
import healthRouter from "./routes/health";
import scriptsRouter from "./routes/scripts";
import aiRouter from "./routes/ai";
import templatesRouter from "./routes/templates";
import timingRouter from "./routes/timing";
import recordingsRouter from "./routes/recordings";
import analyticsRouter from "./routes/analytics";
import { attachWebSocket } from "./terminal/ws-handler";

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use(healthRouter);
app.use(scriptsRouter);
app.use(aiRouter);
app.use(templatesRouter);
app.use(timingRouter);
app.use(recordingsRouter);
app.use(analyticsRouter);

// Error handler (must be last)
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = createServer(app);
attachWebSocket(server);

server.listen(config.port, () => {
  console.log(`@promptpilot/api listening on port ${config.port}`);
});

export default app;
