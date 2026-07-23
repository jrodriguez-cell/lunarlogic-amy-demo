# QuickBooks Sandbox Integration Plan

## Goal

Connect the LunarLogic demo to one QuickBooks Online sandbox company and prove that the connection remains usable after the application restarts and access tokens expire.

This plan follows **Scenario 1: local sandbox prototype**.

## Current scope

- One developer using the application locally.
- One fixed demo organization and legal entity.
- No application login required yet.
- PostgreSQL stores connection information.
- Prisma provides database access and migrations.
- QuickBooks is connected using OAuth 2.0.
- The first successful API request retrieves `CompanyInfo`.
- QuickBooks tokens and secrets remain server-only.

## Credential handling rule

- `.env.example` contains variable names and safe placeholders and may be inspected or committed.
- `.env` contains private Neon and Intuit credentials and must never be committed.
- Codex must never open, read, search, print, or otherwise inspect `.env`.
- The developer owns all values placed in `.env` and runs credential-dependent database commands.

## Not included in this milestone

- [ ] Multi-user authentication and permissions
- [ ] Multiple customer organizations
- [ ] Multiple QuickBooks companies or consolidated reporting
- [ ] Full accounting-data synchronization
- [ ] QuickBooks webhooks and background jobs
- [ ] Writing invoices, journal entries, or other data back to QuickBooks
- [ ] Replacing the existing dashboard mock data

## Phase 0 - Repository preparation

- [x] Create and switch to `quickbooks-integration`
- [x] Confirm there were no pre-existing code changes before implementation
- [x] Keep QuickBooks credentials and database secrets out of Git

## Phase 1 - PostgreSQL and Prisma

- [x] Install Prisma and the Neon PostgreSQL client dependencies
- [x] Add a safe `.env.example` with required variable names only
- [x] Configure pooled `DATABASE_URL` for runtime and direct `DIRECT_URL` for migrations
- [x] Create the initial Prisma schema
- [x] Add a fixed demo `Organization`
- [x] Add a fixed demo `LegalEntity`
- [x] Add a `QuickBooksConnection` model
- [x] Store the QuickBooks environment, connection status, encrypted `realmId`, encrypted tokens, scopes, and expiry timestamps
- [x] Add token-encryption helpers using a server-only encryption key
- [x] Create the first migration
- [x] Apply the Prisma schema to Neon with `npm run push`
- [x] Create an idempotent seed for the fixed demo organization and legal entity
- [x] Run the seed against Neon

### Developer steps required to finish Phase 1

1. [x] Create `.env` locally; Codex will not access this file.
2. [x] Paste Neon's pooled connection string into `DATABASE_URL`.
3. [x] Paste Neon's direct connection string into `DIRECT_URL`.
4. [ ] Generate a private 32-byte base64 key for `TOKEN_ENCRYPTION_KEY`.
5. [x] Apply the schema to Neon:

   ```bash
   npm run push
   ```

6. [x] Seed the fixed demo records:

   ```bash
   npm run seed
   ```

### Database workflow note

Scenario 1 currently uses `prisma db push`, which is suitable for the local sandbox prototype. It updates the schema without recording the committed SQL migration in Prisma's migration history. Before switching this Neon database to `prisma migrate deploy`, either establish a migration baseline or recreate the disposable Neon branch using migrations so Prisma does not try to create tables that already exist.

## Phase 2 - Intuit sandbox setup

- [ ] Create or open an app in the Intuit Developer Portal
- [ ] Enable the QuickBooks Online Accounting scope
- [ ] Create or select a QuickBooks sandbox company
- [ ] Register the local OAuth callback URL
- [ ] Add development client ID and client secret to the local environment
- [ ] Add `INTUIT_ENVIRONMENT=sandbox`

Expected local callback:

```text
http://localhost:3000/api/integrations/quickbooks/callback
```

## Phase 3 - OAuth connection lifecycle

- [ ] Create `GET /api/integrations/quickbooks/connect`
- [ ] Generate a secure, short-lived OAuth `state`
- [ ] Bind the OAuth state to the fixed demo organization and legal entity
- [ ] Redirect the browser to Intuit's authorization page
- [ ] Request only `com.intuit.quickbooks.accounting`
- [ ] Create `GET /api/integrations/quickbooks/callback`
- [ ] Validate the returned OAuth state
- [ ] Exchange the authorization code exactly once
- [ ] Encrypt and save the latest access token, refresh token, `realmId`, scopes, and expiry timestamps
- [ ] Redirect from the callback to a clean application URL
- [ ] Create a centralized server-only QuickBooks API client
- [ ] Refresh expired access tokens safely
- [ ] Save every rotated refresh token transactionally
- [ ] Prevent concurrent refreshes for the same connection
- [ ] Create `POST /api/integrations/quickbooks/disconnect`
- [ ] Revoke the token with Intuit before marking the local connection disconnected

## Phase 4 - Prove the connection

- [ ] Request `CompanyInfo` from the connected sandbox realm
- [ ] Store the returned QuickBooks company name
- [ ] Create a connection-status endpoint or server query
- [ ] Add a small integration screen or panel
- [ ] Show **Connect QuickBooks** when disconnected
- [ ] Show the sandbox company name and **Connected** status after authorization
- [ ] Show **Disconnect** when connected
- [ ] Show **Reconnect required** when token refresh can no longer recover

## Phase 5 - Verification

- [ ] Connect a sandbox company successfully
- [ ] Reject a callback with an invalid or missing OAuth state
- [ ] Confirm tokens and `realmId` are encrypted in PostgreSQL
- [ ] Confirm tokens never reach browser code or logs
- [ ] Restart the Next.js application and confirm the connection still works
- [ ] Force or simulate access-token expiry and confirm refresh works
- [ ] Confirm the newest rotated refresh token is persisted
- [ ] Disconnect and confirm further QuickBooks requests fail safely
- [ ] Run lint, type checking, and production build checks
- [ ] Document local setup and reconnection steps

## Completion criteria

This milestone is complete when:

- [ ] One fixed local demo organization can connect one QuickBooks sandbox company
- [ ] The application displays the real QuickBooks company name from `CompanyInfo`
- [ ] The connection survives an application restart
- [ ] Access-token refresh works without user interaction
- [ ] Disconnect revokes the Intuit authorization
- [ ] No QuickBooks token or client secret is exposed to the frontend or committed to Git

## Next milestone - Real accounting data

Do not start this section until the connection milestone is complete.

- [ ] Sync chart of accounts
- [ ] Sync customers and vendors
- [ ] Decide the historical backfill period
- [ ] Sync the accounting documents needed for cash flow
- [ ] Normalize QuickBooks documents and lines without losing their original IDs and relationships
- [ ] Replace dashboard cash data with a real server-side read model
- [ ] Add incremental synchronization and webhooks

## Progress log

| Date | Status | Notes |
| --- | --- | --- |
| 2026-07-22 | Plan created | Scenario 1 selected; implementation has not started. |
| 2026-07-22 | Phase 1 code complete | Prisma/Neon schema, migration, seed, encryption, and safe environment contract added. Neon migration and seed await developer credentials. |
| 2026-07-23 | Neon schema applied | Developer created `.env`, configured pooled and direct Neon URLs, and successfully ran `npm run push`. Seed and encryption key confirmation remain. |
| 2026-07-23 | Seed complete | Fixed Vanguard demo organization, legal entity, and disconnected sandbox connection were created in Neon. |
