import { env } from "@WorkSphere/env/server";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";

import { connectDB } from "@/db/connect";
import { authRouter } from "@/routes/authRoutes";
import { dashboardRouter } from "@/routes/dashboardRoutes";
import { employeeRouter } from "@/routes/employeeRoutes";
import { organizationRouter } from "@/routes/organizationRoutes";
import { CORS_METHODS } from "@/utils/constants";

export const app: Express = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: CORS_METHODS,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/auth", authRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/organization", organizationRouter);
app.use("/api/dashboard", dashboardRouter);

// Vitest sets NODE_ENV=test automatically. Tests import `app` directly and
// manage their own in-memory Mongo connection — they must not also trigger
// a connection to the real configured database or bind the real port.
if (env.NODE_ENV !== "test") {
  const port = env.PORT;

  const start = async () => {
    try {
      await connectDB(env.DATABASE_URL);
      app.listen(port, () => {
        console.log(`Server is listening on port ${port}...`);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Server could not start with error: ${message}`);
    }
  };

  start();
}
