import cors from "cors";
import express, { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { ZodError } from "zod";

import { swaggerSpec } from "./docs/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import teritageRoutes from "./routes/teritageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const swaggerServe = swaggerUi.serve as unknown as RequestHandler[];
const swaggerSetup = swaggerUi.setup(swaggerSpec) as unknown as RequestHandler;
app.use("/docs", ...swaggerServe, swaggerSetup);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", adminRoutes);
app.use("/api", teritageRoutes);
app.use("/api", walletRoutes);
app.use("/api", notificationRoutes);
app.use("/api", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }
  next(err);
});

app.use(errorHandler);

export default app;
