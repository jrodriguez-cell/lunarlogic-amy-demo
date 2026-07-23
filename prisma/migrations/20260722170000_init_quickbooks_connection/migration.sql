-- CreateEnum
CREATE TYPE "QuickBooksEnvironment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "QuickBooksConnectionStatus" AS ENUM ('DISCONNECTED', 'CONNECTED', 'RECONNECT_REQUIRED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalEntity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuickBooksConnection" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "environment" "QuickBooksEnvironment" NOT NULL DEFAULT 'SANDBOX',
    "status" "QuickBooksConnectionStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "realmIdCiphertext" TEXT,
    "realmIdHash" TEXT,
    "accessTokenCiphertext" TEXT,
    "refreshTokenCiphertext" TEXT,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "hardExpiresAt" TIMESTAMP(3),
    "companyName" TEXT,
    "connectedAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickBooksConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LegalEntity_organizationId_key_key" ON "LegalEntity"("organizationId", "key");

-- CreateIndex
CREATE INDEX "LegalEntity_organizationId_idx" ON "LegalEntity"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickBooksConnection_legalEntityId_key" ON "QuickBooksConnection"("legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "QuickBooksConnection_environment_realmIdHash_key" ON "QuickBooksConnection"("environment", "realmIdHash");

-- CreateIndex
CREATE INDEX "QuickBooksConnection_status_idx" ON "QuickBooksConnection"("status");

-- AddForeignKey
ALTER TABLE "LegalEntity" ADD CONSTRAINT "LegalEntity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuickBooksConnection" ADD CONSTRAINT "QuickBooksConnection_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
