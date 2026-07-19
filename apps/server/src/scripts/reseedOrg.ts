// Wipes the Employee collection and rebuilds a clean, realistic org
// hierarchy: 1 CEO (super_admin) -> 7 department heads (hr_manager, one per
// department) -> ~6 employees per department, all reporting to their own
// department's head. Preserves the three demo-login accounts referenced by
// the login page's quick-fill buttons (same email + password), so the demo
// flow keeps working after the reseed.
//
// DESTRUCTIVE — deletes every existing Employee document. Requires --yes.
//
//   pnpm --filter server exec tsx src/scripts/reseedOrg.ts --yes

import { env } from "@WorkSphere/env/server";

import { connectDB } from "@/db/connect";
import { Employee } from "@/models/Employee";
import { departments } from "@/utils/constants";

const CEO = {
  name: "Gisela Jones",
  email: "admin@worksphere.dev",
  password: "ChangeMe123!",
  phone: "+19995550001",
  designation: "Chief Executive Officer",
  department: "HR" as const,
  salary: 250000,
  joiningDate: new Date("2019-01-06"),
};

interface SeedPerson {
  name: string;
  email: string;
  password: string;
  phone: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status?: "active" | "on_leave" | "terminated";
}

const DEPARTMENT_HEADS: Record<(typeof departments)[number], SeedPerson> = {
  Engineering: {
    name: "Meera Nair",
    email: "meera.nair@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550101",
    designation: "Engineering Manager",
    salary: 165000,
    joiningDate: "2020-03-10",
  },
  Design: {
    name: "Owen Fairbanks",
    email: "owen.fairbanks@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550102",
    designation: "Design Manager",
    salary: 145000,
    joiningDate: "2020-06-01",
  },
  Product: {
    name: "Sofia Marchetti",
    email: "sofia.marchetti@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550103",
    designation: "Product Manager",
    salary: 155000,
    joiningDate: "2020-09-14",
  },
  Sales: {
    name: "Derek Coleman",
    email: "derek.coleman@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550104",
    designation: "Sales Manager",
    salary: 140000,
    joiningDate: "2021-01-11",
  },
  Marketing: {
    name: "Nadia Petrova",
    email: "nadia.petrova@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550105",
    designation: "Marketing Manager",
    salary: 135000,
    joiningDate: "2021-02-22",
  },
  HR: {
    // Preserves the existing "HR Manager" demo-login account.
    name: "Priya Shah",
    email: "hr.demo@worksphere.dev",
    password: "HrManagerDemo123!",
    phone: "+19995550106",
    designation: "HR Manager",
    salary: 130000,
    joiningDate: "2019-11-04",
  },
  Finance: {
    name: "Anders Lindqvist",
    email: "anders.lindqvist@worksphere.dev",
    password: "DeptHead123!",
    phone: "+19995550107",
    designation: "Finance Manager",
    salary: 150000,
    joiningDate: "2020-04-20",
  },
};

const DEPARTMENT_EMPLOYEES: Record<(typeof departments)[number], SeedPerson[]> = {
  Engineering: [
    {
      name: "Rahul Verma",
      email: "rahul.verma@worksphere.dev",
      password: "RahulNewPass123",
      phone: "+19995550201",
      designation: "Software Engineer",
      salary: 95000,
      joiningDate: "2022-05-02",
    },
    {
      name: "Tasha Whitfield",
      email: "tasha.whitfield@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550202",
      designation: "Senior Software Engineer",
      salary: 118000,
      joiningDate: "2021-08-16",
    },
    {
      name: "Julian Ortiz",
      email: "julian.ortiz@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550203",
      designation: "QA Engineer",
      salary: 82000,
      joiningDate: "2023-01-09",
    },
    {
      name: "Priyanka Desai",
      email: "priyanka.desai@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550204",
      designation: "DevOps Engineer",
      salary: 108000,
      joiningDate: "2022-11-21",
    },
    {
      name: "Marcus Chen",
      email: "marcus.chen@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550205",
      designation: "Software Engineer",
      salary: 92000,
      joiningDate: "2023-06-12",
    },
    {
      name: "Wendy Okafor",
      email: "wendy.okafor@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550206",
      designation: "Junior Software Engineer",
      salary: 74000,
      joiningDate: "2024-02-19",
      status: "on_leave",
    },
  ],
  Design: [
    {
      name: "Hedwig Trevino",
      email: "hedwig.trevino@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550301",
      designation: "Product Designer",
      salary: 96000,
      joiningDate: "2022-03-04",
    },
    {
      name: "Guinevere Schultz",
      email: "guinevere.schultz@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550302",
      designation: "UX Researcher",
      salary: 89000,
      joiningDate: "2022-07-18",
    },
    {
      name: "Felix Adeyemi",
      email: "felix.adeyemi@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550303",
      designation: "Visual Designer",
      salary: 84000,
      joiningDate: "2023-04-01",
    },
    {
      name: "Rosalind Kerr",
      email: "rosalind.kerr@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550304",
      designation: "Product Designer",
      salary: 91000,
      joiningDate: "2021-12-06",
    },
    {
      name: "Théo Beaumont",
      email: "theo.beaumont@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550305",
      designation: "Design Systems Engineer",
      salary: 102000,
      joiningDate: "2023-09-25",
    },
    {
      name: "Amara Osei",
      email: "amara.osei@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550306",
      designation: "Junior Designer",
      salary: 71000,
      joiningDate: "2024-05-13",
    },
  ],
  Product: [
    {
      name: "Ariana Mcgowan",
      email: "ariana.mcgowan@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550401",
      designation: "Associate Product Manager",
      salary: 98000,
      joiningDate: "2022-10-03",
    },
    {
      name: "Diego Salazar",
      email: "diego.salazar@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550402",
      designation: "Business Analyst",
      salary: 86000,
      joiningDate: "2022-02-14",
    },
    {
      name: "Naledi Mokoena",
      email: "naledi.mokoena@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550403",
      designation: "Product Analyst",
      salary: 80000,
      joiningDate: "2023-07-30",
    },
    {
      name: "Callum Fitzgerald",
      email: "callum.fitzgerald@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550404",
      designation: "Associate Product Manager",
      salary: 97000,
      joiningDate: "2021-09-09",
    },
    {
      name: "Ines Larsson",
      email: "ines.larsson@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550405",
      designation: "Technical Program Manager",
      salary: 112000,
      joiningDate: "2022-12-05",
    },
    {
      name: "Sami Haddad",
      email: "sami.haddad@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550406",
      designation: "Product Analyst",
      salary: 79000,
      joiningDate: "2024-01-22",
    },
  ],
  Sales: [
    {
      name: "Karan Mehta",
      email: "karan.mehta@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550501",
      designation: "Sales Representative",
      salary: 62000,
      joiningDate: "2023-03-15",
    },
    {
      name: "Ginger Ramos",
      email: "ginger.ramos@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550502",
      designation: "Account Executive",
      salary: 88000,
      joiningDate: "2021-11-01",
    },
    {
      name: "Bram Visser",
      email: "bram.visser@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550503",
      designation: "Sales Development Rep",
      salary: 58000,
      joiningDate: "2024-04-08",
    },
    {
      name: "Odalys Reyes",
      email: "odalys.reyes@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550504",
      designation: "Account Executive",
      salary: 90000,
      joiningDate: "2022-06-27",
    },
    {
      name: "Tobias Lindgren",
      email: "tobias.lindgren@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550505",
      designation: "Sales Representative",
      salary: 60000,
      joiningDate: "2023-10-16",
    },
    {
      name: "Chiamaka Eze",
      email: "chiamaka.eze@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550506",
      designation: "Regional Sales Lead",
      salary: 104000,
      joiningDate: "2021-05-19",
    },
  ],
  Marketing: [
    {
      name: "Divya Rao",
      email: "divya.rao@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550601",
      designation: "Marketing Specialist",
      salary: 71000,
      joiningDate: "2022-08-08",
      status: "terminated",
    },
    {
      name: "Lucas Ferreira",
      email: "lucas.ferreira@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550602",
      designation: "Content Strategist",
      salary: 78000,
      joiningDate: "2023-02-27",
    },
    {
      name: "Ingrid Solberg",
      email: "ingrid.solberg@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550603",
      designation: "Growth Marketing Manager",
      salary: 99000,
      joiningDate: "2021-10-11",
    },
    {
      name: "Mateo Cruz",
      email: "mateo.cruz@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550604",
      designation: "SEO Specialist",
      salary: 73000,
      joiningDate: "2023-11-06",
    },
    {
      name: "Freya Nystrom",
      email: "freya.nystrom@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550605",
      designation: "Brand Designer",
      salary: 82000,
      joiningDate: "2022-04-17",
    },
    {
      name: "Tunde Bakare",
      email: "tunde.bakare@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550606",
      designation: "Marketing Analyst",
      salary: 75000,
      joiningDate: "2024-03-01",
    },
  ],
  HR: [
    {
      name: "Test Frontend User",
      email: "test.frontend@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550701",
      designation: "HR Coordinator",
      salary: 65000,
      joiningDate: "2023-05-05",
    },
    {
      name: "Yusuf Karimov",
      email: "yusuf.karimov@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550702",
      designation: "Recruiter",
      salary: 70000,
      joiningDate: "2022-09-19",
    },
    {
      name: "Camille Dubois",
      email: "camille.dubois@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550703",
      designation: "People Operations Specialist",
      salary: 74000,
      joiningDate: "2021-07-13",
    },
    {
      name: "Rhys Llewellyn",
      email: "rhys.llewellyn@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550704",
      designation: "Recruiter",
      salary: 69000,
      joiningDate: "2023-08-28",
    },
    {
      name: "Adaeze Nwosu",
      email: "adaeze.nwosu@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550705",
      designation: "HR Generalist",
      salary: 76000,
      joiningDate: "2022-01-24",
    },
    {
      name: "Otis Blackwood",
      email: "otis.blackwood@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550706",
      designation: "Compensation Analyst",
      salary: 81000,
      joiningDate: "2024-06-10",
    },
  ],
  Finance: [
    {
      name: "Elena Kowalski",
      email: "elena.kowalski@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550801",
      designation: "Financial Analyst",
      salary: 85000,
      joiningDate: "2022-05-30",
    },
    {
      name: "Grigor Petrossian",
      email: "grigor.petrossian@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550802",
      designation: "Accountant",
      salary: 76000,
      joiningDate: "2021-06-21",
    },
    {
      name: "Beatriz Almeida",
      email: "beatriz.almeida@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550803",
      designation: "Payroll Specialist",
      salary: 70000,
      joiningDate: "2023-03-13",
    },
    {
      name: "Connor Maguire",
      email: "connor.maguire@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550804",
      designation: "Financial Analyst",
      salary: 87000,
      joiningDate: "2022-11-02",
    },
    {
      name: "Sunniva Haugen",
      email: "sunniva.haugen@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550805",
      designation: "Treasury Analyst",
      salary: 92000,
      joiningDate: "2023-12-18",
    },
    {
      name: "Pavel Novak",
      email: "pavel.novak@worksphere.dev",
      password: "Employee123!",
      phone: "+19995550806",
      designation: "Accounts Payable Clerk",
      salary: 61000,
      joiningDate: "2024-07-22",
    },
  ],
};

async function run() {
  const confirmed = process.argv.includes("--yes");

  await connectDB(env.DATABASE_URL);

  const existingCount = await Employee.countDocuments({});

  if (!confirmed) {
    console.log(
      `DRY RUN — would delete ${existingCount} existing employee document(s) and create ` +
        `1 CEO + ${departments.length} department heads + ` +
        `${Object.values(DEPARTMENT_EMPLOYEES).flat().length} employees. ` +
        `Re-run with --yes to actually do it.`,
    );
    process.exit(0);
  }

  console.log(`Deleting ${existingCount} existing employee document(s)...`);
  await Employee.deleteMany({});

  const ceo = await new Employee({
    name: CEO.name,
    email: CEO.email,
    phone: CEO.phone,
    department: CEO.department,
    designation: CEO.designation,
    salary: CEO.salary,
    joiningDate: CEO.joiningDate,
    password: CEO.password,
    role: "super_admin",
    reportingManager: null,
    mustChangePassword: false,
  }).save();
  console.log(`Created CEO: ${ceo.name} <${ceo.email}> (${ceo.employeeId})`);

  for (const department of departments) {
    const head = DEPARTMENT_HEADS[department];

    const headDoc = await new Employee({
      name: head.name,
      email: head.email,
      phone: head.phone,
      department,
      designation: head.designation,
      salary: head.salary,
      joiningDate: new Date(head.joiningDate),
      password: head.password,
      role: "hr_manager",
      reportingManager: ceo._id,
      mustChangePassword: false,
    }).save();
    console.log(`  Created ${department} head: ${headDoc.name} <${headDoc.email}> (${headDoc.employeeId})`);

    for (const person of DEPARTMENT_EMPLOYEES[department]) {
      const employeeDoc = await new Employee({
        name: person.name,
        email: person.email,
        phone: person.phone,
        department,
        designation: person.designation,
        salary: person.salary,
        joiningDate: new Date(person.joiningDate),
        status: person.status ?? "active",
        password: person.password,
        role: "employee",
        reportingManager: headDoc._id,
        mustChangePassword: false,
      }).save();
      console.log(`    Created: ${employeeDoc.name} <${employeeDoc.email}> (${employeeDoc.employeeId})`);
    }
  }

  const total = await Employee.countDocuments({});
  console.log(`\nDone — ${total} employees created.`);
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
