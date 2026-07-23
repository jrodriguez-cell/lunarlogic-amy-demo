import { randomBytes, randomUUID } from "node:crypto";

import { prisma } from "@/server/database/prisma";
import { fingerprintSecret } from "@/server/security/secret-crypto";
import { QUICKBOOKS_OAUTH_STATE_TTL_MS } from "./constants";

interface ConsumedOAuthState {
  legalEntityId: string;
}

export async function createOAuthState(
  legalEntityId: string,
): Promise<string> {
  const state = randomBytes(32).toString("base64url");
  const stateHash = fingerprintSecret(state);
  const expiresAt = new Date(Date.now() + QUICKBOOKS_OAUTH_STATE_TTL_MS);

  await prisma.$transaction([
    prisma.$executeRaw`
      DELETE FROM "QuickBooksOAuthState"
      WHERE "expiresAt" <= NOW()
         OR ("consumedAt" IS NOT NULL AND "consumedAt" < NOW() - INTERVAL '1 hour')
    `,
    prisma.$executeRaw`
      INSERT INTO "QuickBooksOAuthState"
        ("id", "stateHash", "legalEntityId", "expiresAt")
      VALUES
        (${randomUUID()}, ${stateHash}, ${legalEntityId}, ${expiresAt})
    `,
  ]);

  return state;
}

export async function consumeOAuthState(
  state: string,
): Promise<ConsumedOAuthState | null> {
  if (!state) {
    return null;
  }

  const stateHash = fingerprintSecret(state);
  const rows = await prisma.$queryRaw<ConsumedOAuthState[]>`
    UPDATE "QuickBooksOAuthState"
    SET "consumedAt" = NOW()
    WHERE "stateHash" = ${stateHash}
      AND "consumedAt" IS NULL
      AND "expiresAt" > NOW()
    RETURNING "legalEntityId"
  `;

  return rows[0] ?? null;
}
