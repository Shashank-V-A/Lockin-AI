import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { CODING_PROBLEMS } from "../lib/coding-problems-data";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Seeds coding problems into the database. */
async function main() {
  console.log("Seeding coding problems...");

  for (const problem of CODING_PROBLEMS) {
    const { fnPython: _fp, fnJs: _fj, fnJava: _fja, ...data } = problem;
    await prisma.codingProblem.upsert({
      where: { slug: problem.slug },
      update: data,
      create: data,
    });
  }

  console.log(`Seeded ${CODING_PROBLEMS.length} coding problems.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
