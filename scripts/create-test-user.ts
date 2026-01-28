import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_EMAIL = "manager@test.com";
const DEFAULT_PASSWORD = "password123";
const DEFAULT_ROLE: UserRole = "MANAGER";

const allowedRoles: UserRole[] = ["ADMIN", "MANAGER", "STAFF"];

function resolveRole(): UserRole {
  const envRole = process.env.TEST_USER_ROLE?.toUpperCase() as UserRole | undefined;
  if (envRole && allowedRoles.includes(envRole)) {
    return envRole;
  }
  return DEFAULT_ROLE;
}

async function main() {
  const email = process.env.TEST_USER_EMAIL ?? DEFAULT_EMAIL;
  const password = process.env.TEST_USER_PASSWORD ?? DEFAULT_PASSWORD;
  const role = resolveRole();

  console.log(`🔧 Creating test user ${email} (${role})...`);

  const passwordHash = await hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role,
      emailVerified: new Date(),
    },
    create: {
      email,
      passwordHash,
      role,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Test user ready:");
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role: ${user.role}`);
  console.log("\nUse env vars TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_USER_ROLE to override defaults.");
}

main()
  .catch((error) => {
    console.error("Failed to create test user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
