import { env } from "@WorkSphere/env/server";
import cors from "cors";
import express from "express";

import { connectDB } from "@/db/connect";
import { employeeRouter } from "@/routes/employeeRoutes";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).send("OK");
});

app.use("/api/v1/employees", employeeRouter);

const port = Number(process.env.PORT) || 3000;

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
