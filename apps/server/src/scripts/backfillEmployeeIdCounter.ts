// Seeds the employeeId Counter document to the current max employeeId
// sequence found in the Employee collection, so getNextSequence("employeeId")
// continues from the right number instead of restarting at 1 and colliding
// with existing employeeId values on a database populated before the
// Counter-based generation scheme existed.
//
//   pnpm --filter server exec tsx src/scripts/backfillEmployeeIdCounter.ts

import { env } from "@WorkSphere/env/server";

import { connectDB } from "@/db/connect";
import { setSequence } from "@/models/Counter";
import { Employee } from "@/models/Employee";
import { parseEmployeeIdSequence } from "@/utils/constants";

const run = async () => {
  await connectDB(env.DATABASE_URL);

  const employees = await Employee.find({}, { employeeId: 1 }).lean();

  const maxSequence = employees.reduce((max, employee) => {
    if (!employee.employeeId) return max;
    return Math.max(max, parseEmployeeIdSequence(employee.employeeId));
  }, 0);

  console.log(`Found ${employees.length} employee(s), max existing sequence: ${maxSequence}.`);
  await setSequence("employeeId", maxSequence);
  console.log(
    `Counter "employeeId" set to ${maxSequence} — next generated id will be EMP-${String(maxSequence + 1).padStart(4, "0")}.`,
  );

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
