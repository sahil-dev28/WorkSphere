import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { env } from "@WorkSphere/env/server";
import { app } from "@/app";
import { Employee } from "@/models/Employee";

let mongod: MongoMemoryServer;
let adminCookie: string;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  const admin = await Employee.create({
    name: "Test Admin",
    email: "test-admin@worksphere.dev",
    phone: "+15550000000",
    department: "Engineering",
    designation: "Admin",
    salary: 100000,
    password: "TestPassword123!",
    role: "super_admin",
    mustChangePassword: false,
  });

  const token = jwt.sign({ id: admin._id.toString(), role: admin.role }, env.JWT_SECRET);
  adminCookie = `token=${token}`;

  // Sequential, not Employee.create([...]) — Employee's pre-save hook derives
  // the next employeeId from the current max in the collection, so concurrent
  // saves could race and collide. Mongoose's array-form create() runs each
  // doc's save() concurrently (Promise.all), not sequentially, so passing an
  // array here would race the same way. Awaiting each row's save in turn
  // keeps that generation correct — same class of bug importEmployees already
  // documents and avoids for the same reason.
  const rows = [
    {
      name: "Alice Engineer",
      email: "alice.eng@worksphere.dev",
      phone: "+15550000001",
      department: "Engineering",
      designation: "Staff",
      salary: 60000,
      status: "active",
      joiningDate: "2024-01-10",
      password: "TestPassword123!",
      role: "employee",
      mustChangePassword: false,
    },
    {
      name: "Bob Engineer",
      email: "bob.eng@worksphere.dev",
      phone: "+15550000002",
      department: "Engineering",
      designation: "Staff",
      salary: 60000,
      status: "on_leave",
      joiningDate: "2023-05-20",
      password: "TestPassword123!",
      role: "employee",
      mustChangePassword: false,
    },
    {
      name: "Cara Sales",
      email: "cara.sales@worksphere.dev",
      phone: "+15550000003",
      department: "Sales",
      designation: "Staff",
      salary: 60000,
      status: "active",
      joiningDate: "2025-02-01",
      password: "TestPassword123!",
      role: "employee",
      mustChangePassword: false,
    },
    {
      name: "Dev Sales",
      email: "dev.sales@worksphere.dev",
      phone: "+15550000004",
      department: "Sales",
      designation: "Staff",
      salary: 60000,
      status: "terminated",
      joiningDate: "2022-11-30",
      password: "TestPassword123!",
      role: "employee",
      mustChangePassword: false,
    },
  ] as const;

  for (const row of rows) {
    await Employee.create(row);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("GET /api/employees", () => {
  it("returns everything, unpaginated, when no query params are sent", async () => {
    const res = await request(app).get("/api/employees").set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5); // admin + 4 seeded rows
    expect(res.body.total).toBe(5);
  });

  it("paginates when limit/page are present", async () => {
    const res = await request(app)
      .get("/api/employees?limit=2&page=1")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.total).toBe(5);
  });

  it("filters by department", async () => {
    const res = await request(app)
      .get("/api/employees?department=Sales&limit=10")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(
      res.body.data.every((e: { department: string }) => e.department === "Sales"),
    ).toBe(true);
  });

  it("searches name and email case-insensitively", async () => {
    const res = await request(app)
      .get("/api/employees?q=ALICE&limit=10")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.data.map((e: { name: string }) => e.name)).toEqual(["Alice Engineer"]);
  });

  it("sorts by joined_asc", async () => {
    const res = await request(app)
      .get("/api/employees?sort=joined_asc&department=Sales&limit=10")
      .set("Cookie", adminCookie);

    const dates = res.body.data.map((e: { joiningDate: string }) => e.joiningDate);
    expect(dates).toEqual([...dates].sort());
  });

  it("rejects an invalid department with 400", async () => {
    const res = await request(app)
      .get("/api/employees?department=NotReal")
      .set("Cookie", adminCookie);

    expect(res.status).toBe(400);
  });

  it("returns 401 without a session cookie", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(401);
  });
});
