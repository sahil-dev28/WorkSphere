import { env } from "@WorkSphere/env/server";

import { connectDB } from "@/db/connect";
import { Employee } from "@/models/Employee";

// Data-quality patch, not a permanent fix. Employees created before `phone`
// became a required field have no phone at all, which fails full-document
// validation on any later update or soft-delete. This sets an obviously fake
// placeholder so those records stop erroring — real phone numbers should
// still be collected from these employees going forward.
const PLACEHOLDER_PHONE = "0000000000";

const run = async () => {
  await connectDB(env.DATABASE_URL);

  const result = await Employee.updateMany(
    { phone: { $exists: false } },
    { $set: { phone: PLACEHOLDER_PHONE } },
  );

  console.log(`Backfilled phone on ${result.modifiedCount} employee(s)`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
