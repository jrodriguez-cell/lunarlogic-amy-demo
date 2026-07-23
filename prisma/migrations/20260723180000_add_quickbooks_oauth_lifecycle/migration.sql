ALTER TABLE "QuickBooksConnection"
ADD COLUMN "refreshLockId" TEXT,
ADD COLUMN "refreshLockedAt" TIMESTAMP(3);

CREATE TABLE "QuickBooksOAuthState" (
    "id" TEXT NOT NULL,
    "stateHash" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickBooksOAuthState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuickBooksOAuthState_stateHash_key"
ON "QuickBooksOAuthState"("stateHash");

CREATE INDEX "QuickBooksOAuthState_legalEntityId_idx"
ON "QuickBooksOAuthState"("legalEntityId");

CREATE INDEX "QuickBooksOAuthState_expiresAt_idx"
ON "QuickBooksOAuthState"("expiresAt");

ALTER TABLE "QuickBooksOAuthState"
ADD CONSTRAINT "QuickBooksOAuthState_legalEntityId_fkey"
FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
