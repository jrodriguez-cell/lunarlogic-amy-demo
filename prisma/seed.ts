import { PrismaNeon } from "@prisma/adapter-neon";

import {
  PrismaClient,
  QuickBooksConnectionStatus,
  QuickBooksEnvironment,
} from "../src/generated/prisma/client";

const DEMO_ORGANIZATION_ID = "org_vanguard_holdings_group";
const DEMO_LEGAL_ENTITY_ID = "entity_vanguard_digital_llc";

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DIRECT_URL or DATABASE_URL is required to seed the database.");
  }

  return databaseUrl;
}

const adapter = new PrismaNeon({ connectionString: requireDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.organization.upsert({
    where: { id: DEMO_ORGANIZATION_ID },
    update: {
      slug: "vanguard-holdings-group",
      name: "Vanguard Holdings Group",
    },
    create: {
      id: DEMO_ORGANIZATION_ID,
      slug: "vanguard-holdings-group",
      name: "Vanguard Holdings Group",
    },
  });

  await prisma.legalEntity.upsert({
    where: { id: DEMO_LEGAL_ENTITY_ID },
    update: {
      organizationId: DEMO_ORGANIZATION_ID,
      key: "digital_llc",
      name: "Vanguard Digital LLC",
    },
    create: {
      id: DEMO_LEGAL_ENTITY_ID,
      organizationId: DEMO_ORGANIZATION_ID,
      key: "digital_llc",
      name: "Vanguard Digital LLC",
    },
  });

  await prisma.quickBooksConnection.upsert({
    where: { legalEntityId: DEMO_LEGAL_ENTITY_ID },
    update: {},
    create: {
      legalEntityId: DEMO_LEGAL_ENTITY_ID,
      environment: QuickBooksEnvironment.SANDBOX,
      status: QuickBooksConnectionStatus.DISCONNECTED,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Failed to seed the LunarLogic demo database.", error);
    await prisma.$disconnect();
    process.exit(1);
  });
