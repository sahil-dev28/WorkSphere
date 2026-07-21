import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getNextSequence, resetSequence } from "@/models/Counter";

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("getNextSequence", () => {
  it("returns 1, then 2, on successive calls for the same counter", async () => {
    const first = await getNextSequence("test-sequential");
    const second = await getNextSequence("test-sequential");

    expect(first).toBe(1);
    expect(second).toBe(2);
  });

  it("hands out distinct sequential values under concurrent calls — no duplicate, no lost increment", async () => {
    const results = await Promise.all([
      getNextSequence("test-concurrent"),
      getNextSequence("test-concurrent"),
      getNextSequence("test-concurrent"),
      getNextSequence("test-concurrent"),
      getNextSequence("test-concurrent"),
    ]);

    expect([...results].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it("restarts at 1 after resetSequence", async () => {
    await getNextSequence("test-reset");
    await getNextSequence("test-reset");
    await resetSequence("test-reset");

    const afterReset = await getNextSequence("test-reset");

    expect(afterReset).toBe(1);
  });
});
