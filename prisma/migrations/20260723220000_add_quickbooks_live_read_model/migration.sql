CREATE TYPE "QuickBooksSyncStatus" AS ENUM (
    'RUNNING',
    'SUCCEEDED',
    'FAILED'
);

CREATE TYPE "QuickBooksReportType" AS ENUM (
    'BALANCE_SHEET',
    'PROFIT_AND_LOSS',
    'TRIAL_BALANCE',
    'AGED_RECEIVABLES',
    'AGED_PAYABLES'
);

CREATE TABLE "QuickBooksAccount" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "quickBooksId" TEXT NOT NULL,
    "syncToken" TEXT,
    "name" TEXT NOT NULL,
    "fullyQualifiedName" TEXT,
    "classification" TEXT,
    "accountType" TEXT NOT NULL,
    "accountSubType" TEXT,
    "currentBalance" DECIMAL(18,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sourceUpdatedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuickBooksAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuickBooksSyncRun" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "status" "QuickBooksSyncStatus" NOT NULL DEFAULT 'RUNNING',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "recordCounts" JSONB,
    "warnings" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "errorSummary" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "QuickBooksSyncRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuickBooksReportSnapshot" (
    "id" TEXT NOT NULL,
    "legalEntityId" TEXT NOT NULL,
    "syncRunId" TEXT NOT NULL,
    "reportType" "QuickBooksReportType" NOT NULL,
    "reportName" TEXT NOT NULL,
    "basis" TEXT,
    "currency" TEXT,
    "startPeriod" TEXT,
    "endPeriod" TEXT,
    "reportTime" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickBooksReportSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "QuickBooksAccount_legalEntityId_quickBooksId_key"
ON "QuickBooksAccount"("legalEntityId", "quickBooksId");

CREATE INDEX "QuickBooksAccount_legalEntityId_accountType_idx"
ON "QuickBooksAccount"("legalEntityId", "accountType");

CREATE INDEX "QuickBooksAccount_legalEntityId_active_idx"
ON "QuickBooksAccount"("legalEntityId", "active");

CREATE INDEX "QuickBooksSyncRun_legalEntityId_startedAt_idx"
ON "QuickBooksSyncRun"("legalEntityId", "startedAt");

CREATE INDEX "QuickBooksSyncRun_status_idx"
ON "QuickBooksSyncRun"("status");

CREATE INDEX "QuickBooksReportSnapshot_legalEntityId_reportType_fetchedAt_idx"
ON "QuickBooksReportSnapshot"("legalEntityId", "reportType", "fetchedAt");

CREATE INDEX "QuickBooksReportSnapshot_syncRunId_idx"
ON "QuickBooksReportSnapshot"("syncRunId");

ALTER TABLE "QuickBooksAccount"
ADD CONSTRAINT "QuickBooksAccount_legalEntityId_fkey"
FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuickBooksSyncRun"
ADD CONSTRAINT "QuickBooksSyncRun_legalEntityId_fkey"
FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuickBooksReportSnapshot"
ADD CONSTRAINT "QuickBooksReportSnapshot_legalEntityId_fkey"
FOREIGN KEY ("legalEntityId") REFERENCES "LegalEntity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuickBooksReportSnapshot"
ADD CONSTRAINT "QuickBooksReportSnapshot_syncRunId_fkey"
FOREIGN KEY ("syncRunId") REFERENCES "QuickBooksSyncRun"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
