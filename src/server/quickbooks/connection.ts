import {
  QuickBooksConnectionStatus,
  QuickBooksEnvironment,
} from "@/generated/prisma/client";
import { prisma } from "@/server/database/prisma";
import {
  decryptSecret,
  encryptSecret,
  fingerprintSecret,
} from "@/server/security/secret-crypto";
import {
  QUICKBOOKS_TOKEN_EXPIRY_BUFFER_MS,
} from "./constants";
import { getQuickBooksConfig } from "./config";
import {
  QuickBooksOAuthError,
  type QuickBooksTokenResponse,
  refreshAccessToken,
  revokeToken,
} from "./oauth";
import { randomUUID } from "node:crypto";

const CONNECTION_LOCK_STALE_AFTER_MS = 30_000;
const CONNECTION_LOCK_WAIT_ATTEMPTS = 100;
const REFRESH_WAIT_INTERVAL_MS = 100;

interface RefreshLockRow {
  id: string;
}

function lockedConnectionWhere(connectionId: string, lockId: string) {
  // Prisma will regenerate this field after the developer applies the schema.
  // The cast keeps offline type-checking possible before that credential-owned step.
  return {
    id: connectionId,
    refreshLockId: lockId,
  } as unknown as { id: string };
}

export interface QuickBooksConnectionSummary {
  legalEntityId: string;
  legalEntityName: string;
  environment: "sandbox" | "production";
  status: "disconnected" | "connected" | "reconnect_required";
  companyName: string | null;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
}

function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

function requireStoredSecret(
  value: string | null,
  fieldName: string,
): string {
  if (!value) {
    throw new Error(`The QuickBooks connection is missing ${fieldName}.`);
  }

  return value;
}

function databaseEnvironment() {
  return getQuickBooksConfig().environment === "sandbox"
    ? QuickBooksEnvironment.SANDBOX
    : QuickBooksEnvironment.PRODUCTION;
}

async function releaseConnectionLock(
  connectionId: string,
  lockId: string,
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "QuickBooksConnection"
    SET "refreshLockId" = NULL, "refreshLockedAt" = NULL
    WHERE "id" = ${connectionId} AND "refreshLockId" = ${lockId}
  `;
}

async function acquireConnectionLock(
  connectionId: string,
  lockId: string,
  connectedOnly: boolean,
): Promise<boolean> {
  const staleBefore = new Date(Date.now() - CONNECTION_LOCK_STALE_AFTER_MS);
  const rows = await prisma.$queryRaw<RefreshLockRow[]>`
    UPDATE "QuickBooksConnection"
    SET "refreshLockId" = ${lockId}, "refreshLockedAt" = NOW()
    WHERE "id" = ${connectionId}
      AND (
        ${connectedOnly} = FALSE
        OR "status" = 'CONNECTED'::"QuickBooksConnectionStatus"
      )
      AND (
        "refreshLockId" IS NULL
        OR "refreshLockedAt" IS NULL
        OR "refreshLockedAt" < ${staleBefore}
      )
    RETURNING "id"
  `;

  return rows.length === 1;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForConnectionLock(
  connectionId: string,
  lockId: string,
  connectedOnly: boolean,
): Promise<void> {
  for (
    let attempt = 0;
    attempt < CONNECTION_LOCK_WAIT_ATTEMPTS;
    attempt += 1
  ) {
    if (
      await acquireConnectionLock(connectionId, lockId, connectedOnly)
    ) {
      return;
    }

    await wait(REFRESH_WAIT_INTERVAL_MS);
  }

  throw new Error("The QuickBooks connection is busy. Try again.");
}

async function requireConnectedRecord(legalEntityId: string) {
  const connection = await prisma.quickBooksConnection.findUnique({
    where: { legalEntityId },
  });

  if (
    !connection ||
    connection.status !== QuickBooksConnectionStatus.CONNECTED ||
    !connection.accessTokenCiphertext ||
    !connection.refreshTokenCiphertext ||
    !connection.realmIdCiphertext
  ) {
    throw new Error("QuickBooks is not connected for this legal entity.");
  }

  return connection;
}

export async function saveAuthorizedConnection(
  legalEntityId: string,
  realmId: string,
  tokens: QuickBooksTokenResponse,
): Promise<void> {
  const connection = await prisma.quickBooksConnection.upsert({
    where: { legalEntityId },
    create: {
      legalEntityId,
      environment: databaseEnvironment(),
      status: QuickBooksConnectionStatus.DISCONNECTED,
    },
    update: {},
  });
  const lockId = randomUUID();
  await waitForConnectionLock(connection.id, lockId, false);
  const now = new Date();

  try {
    await prisma.quickBooksConnection.update({
      where: lockedConnectionWhere(connection.id, lockId),
      data: {
        environment: databaseEnvironment(),
        status: QuickBooksConnectionStatus.CONNECTED,
        realmIdCiphertext: encryptSecret(realmId),
        realmIdHash: fingerprintSecret(realmId),
        accessTokenCiphertext: encryptSecret(tokens.accessToken),
        refreshTokenCiphertext: encryptSecret(tokens.refreshToken),
        scopes: tokens.scopes,
        accessTokenExpiresAt: addSeconds(
          now,
          tokens.accessTokenExpiresInSeconds,
        ),
        refreshTokenExpiresAt: addSeconds(
          now,
          tokens.refreshTokenExpiresInSeconds,
        ),
        hardExpiresAt:
          tokens.hardExpiresInSeconds === null
            ? null
            : addSeconds(now, tokens.hardExpiresInSeconds),
        companyName: null,
        connectedAt: now,
        lastSyncedAt: null,
      },
    });
  } finally {
    await releaseConnectionLock(connection.id, lockId);
  }
}

export async function getQuickBooksAccessToken(
  legalEntityId: string,
  forceRefresh = false,
): Promise<string> {
  let connection = await requireConnectedRecord(legalEntityId);
  const initialAccessTokenCiphertext = connection.accessTokenCiphertext;
  const tokenIsUsable =
    connection.accessTokenExpiresAt !== null &&
    connection.accessTokenExpiresAt.getTime() >
      Date.now() + QUICKBOOKS_TOKEN_EXPIRY_BUFFER_MS;

  if (!forceRefresh && tokenIsUsable) {
    return decryptSecret(
      requireStoredSecret(
        connection.accessTokenCiphertext,
        "its access token",
      ),
    );
  }

  const lockId = randomUUID();
  let ownsLock = await acquireConnectionLock(connection.id, lockId, true);

  for (
    let attempt = 0;
    !ownsLock && attempt < CONNECTION_LOCK_WAIT_ATTEMPTS;
    attempt += 1
  ) {
    await wait(REFRESH_WAIT_INTERVAL_MS);
    connection = await requireConnectedRecord(legalEntityId);

    if (
      connection.accessTokenCiphertext !== initialAccessTokenCiphertext &&
      connection.accessTokenExpiresAt &&
      connection.accessTokenExpiresAt.getTime() >
        Date.now() + QUICKBOOKS_TOKEN_EXPIRY_BUFFER_MS
    ) {
      return decryptSecret(
        requireStoredSecret(
          connection.accessTokenCiphertext,
          "its access token",
        ),
      );
    }

    ownsLock = await acquireConnectionLock(connection.id, lockId, true);
  }

  if (!ownsLock) {
    throw new Error("A QuickBooks token refresh is already in progress.");
  }

  try {
    connection = await requireConnectedRecord(legalEntityId);

    if (
      connection.accessTokenCiphertext !== initialAccessTokenCiphertext &&
      connection.accessTokenExpiresAt &&
      connection.accessTokenExpiresAt.getTime() >
        Date.now() + QUICKBOOKS_TOKEN_EXPIRY_BUFFER_MS
    ) {
      return decryptSecret(
        requireStoredSecret(
          connection.accessTokenCiphertext,
          "its access token",
        ),
      );
    }

    const tokens = await refreshAccessToken(
      decryptSecret(
        requireStoredSecret(
          connection.refreshTokenCiphertext,
          "its refresh token",
        ),
      ),
    );
    const now = new Date();

    await prisma.quickBooksConnection.update({
      where: lockedConnectionWhere(connection.id, lockId),
      data: {
        accessTokenCiphertext: encryptSecret(tokens.accessToken),
        refreshTokenCiphertext: encryptSecret(tokens.refreshToken),
        scopes: tokens.scopes,
        accessTokenExpiresAt: addSeconds(
          now,
          tokens.accessTokenExpiresInSeconds,
        ),
        refreshTokenExpiresAt: addSeconds(
          now,
          tokens.refreshTokenExpiresInSeconds,
        ),
        ...(tokens.hardExpiresInSeconds === null
          ? {}
          : {
              hardExpiresAt: addSeconds(
                now,
                tokens.hardExpiresInSeconds,
              ),
            }),
      },
    });

    return tokens.accessToken;
  } catch (error) {
    if (
      error instanceof QuickBooksOAuthError &&
      (error.status === 400 || error.status === 401)
    ) {
      await prisma.quickBooksConnection.update({
        where: lockedConnectionWhere(connection.id, lockId),
        data: { status: QuickBooksConnectionStatus.RECONNECT_REQUIRED },
      }).catch(() => undefined);
    }

    throw error;
  } finally {
    await releaseConnectionLock(connection.id, lockId);
  }
}

export async function getQuickBooksRealmId(
  legalEntityId: string,
): Promise<string> {
  const connection = await requireConnectedRecord(legalEntityId);
  return decryptSecret(
    requireStoredSecret(connection.realmIdCiphertext, "its realm ID"),
  );
}

export async function saveQuickBooksCompanyName(
  legalEntityId: string,
  companyName: string,
): Promise<void> {
  await prisma.quickBooksConnection.updateMany({
    where: {
      legalEntityId,
      status: QuickBooksConnectionStatus.CONNECTED,
    },
    data: {
      companyName,
      lastSyncedAt: new Date(),
    },
  });
}

export async function getQuickBooksConnectionSummary(
  legalEntityId: string,
): Promise<QuickBooksConnectionSummary> {
  const legalEntity = await prisma.legalEntity.findUnique({
    where: { id: legalEntityId },
    include: { quickBooksConnection: true },
  });

  if (!legalEntity) {
    throw new Error("The configured demo legal entity does not exist.");
  }

  const connection = legalEntity.quickBooksConnection;

  return {
    legalEntityId,
    legalEntityName: legalEntity.name,
    environment:
      connection?.environment === QuickBooksEnvironment.PRODUCTION
        ? "production"
        : "sandbox",
    status:
      connection?.status === QuickBooksConnectionStatus.CONNECTED
        ? "connected"
        : connection?.status ===
            QuickBooksConnectionStatus.RECONNECT_REQUIRED
          ? "reconnect_required"
          : "disconnected",
    companyName: connection?.companyName ?? null,
    connectedAt: connection?.connectedAt?.toISOString() ?? null,
    lastSyncedAt: connection?.lastSyncedAt?.toISOString() ?? null,
    accessTokenExpiresAt:
      connection?.accessTokenExpiresAt?.toISOString() ?? null,
    refreshTokenExpiresAt:
      connection?.refreshTokenExpiresAt?.toISOString() ?? null,
  };
}

export async function disconnectQuickBooks(
  legalEntityId: string,
): Promise<void> {
  const connection = await prisma.quickBooksConnection.findUnique({
    where: { legalEntityId },
  });

  if (!connection) {
    return;
  }

  const lockId = randomUUID();
  await waitForConnectionLock(connection.id, lockId, false);

  try {
    const lockedConnection =
      await prisma.quickBooksConnection.findUniqueOrThrow({
        where: { id: connection.id },
      });

    if (lockedConnection.refreshTokenCiphertext) {
      await revokeToken(
        decryptSecret(lockedConnection.refreshTokenCiphertext),
      );
    }

    await prisma.quickBooksConnection.update({
      where: lockedConnectionWhere(connection.id, lockId),
      data: {
        status: QuickBooksConnectionStatus.DISCONNECTED,
        realmIdCiphertext: null,
        realmIdHash: null,
        accessTokenCiphertext: null,
        refreshTokenCiphertext: null,
        scopes: [],
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        hardExpiresAt: null,
        companyName: null,
        connectedAt: null,
        lastSyncedAt: null,
      },
    });
  } finally {
    await releaseConnectionLock(connection.id, lockId);
  }
}
