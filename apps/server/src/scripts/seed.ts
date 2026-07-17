import { env } from "@WorkSphere/env/server";

import { connectDB } from "@/db/connect";
import { Employee } from "@/models/Employee";

const run = async () => {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set to run the seed script",
    );
  }

  await connectDB(env.DATABASE_URL);

  const existing = await Employee.findOne({ role: "super_admin" });

  if (existing) {
    console.log(`Super Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const admin = new Employee({
    name: "Super Admin",
    email: env.SEED_ADMIN_EMAIL,
    department: "HR",
    designation: "Super Admin",
    salary: 0,
    password: env.SEED_ADMIN_PASSWORD,
    role: "super_admin",
    mustChangePassword: false,
  });

  await admin.save();

  console.log(`Super Admin created: ${admin.email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
