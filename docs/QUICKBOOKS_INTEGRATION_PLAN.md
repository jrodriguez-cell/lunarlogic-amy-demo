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
4. [x] Generate a private 32-byte base64 key for `TOKEN_ENCRYPTION_KEY`.
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

- [x] Create or open an app in the Intuit Developer Portal
- [x] Enable the QuickBooks Online Accounting scope
- [x] Create or select a QuickBooks sandbox company
- [x] Register the local OAuth callback URL
- [x] Add development client ID and client secret to the local environment
- [x] Add the safe server-only Intuit variable contract to `.env.example`
- [x] Add `INTUIT_ENVIRONMENT=sandbox` to the private local environment
- [x] Pin QuickBooks Online API minor version `75` in `.env.example`

Expected local callback:

```text
http://localhost:3000/api/integrations/quickbooks/callback
```

### Client/developer portal steps required to finish Phase 2

1. The client should own the Intuit Developer app that will eventually receive
   production credentials. They can either perform these steps or grant the
   developer appropriate access.
2. In the Intuit Developer Portal, create or open the app and select the
   **QuickBooks Online Accounting** capability.
3. Under **Development**, create or select a sandbox company.
4. Under the app's Development redirect URI settings, register the callback
   above exactly, including its scheme, host, port, path, casing, and absence of
   a trailing slash.
5. Copy the **Development** client ID and client secret into the private local
   `.env`. Do not send the secret through source control or place it in
   `.env.example`.
6. Set `INTUIT_ENVIRONMENT=sandbox` and
   `INTUIT_API_MINOR_VERSION=75` in the private local `.env`.
7. Confirm completion without sharing either credential in chat or logs.

Development credentials work only with sandbox companies. Production uses a
separate client ID, client secret, HTTPS redirect URI, and production review.

### Official Intuit references

- [OAuth 2.0 setup](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0)
- [Development credentials](https://developer.intuit.com/app/developer/qbo/docs/get-started/get-client-id-and-client-secret)
- [Redirect URI setup](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/set-redirect-uri)
- [Sandbox companies](https://developer.intuit.com/app/developer/qbo/docs/develop/sandboxes/manage-your-sandboxes)
- [OAuth Playground](https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0-playground)

## Phase 3 - OAuth connection lifecycle

- [x] Create `GET /api/integrations/quickbooks/connect`
- [x] Generate a secure, short-lived OAuth `state`
- [x] Bind the OAuth state to the fixed demo organization and legal entity
- [x] Make each OAuth state single-use and reject missing, expired, reused, or mismatched values
- [x] Redirect the browser to Intuit's authorization page
- [x] Request only `com.intuit.quickbooks.accounting`
- [x] Create `GET /api/integrations/quickbooks/callback`
- [x] Validate the returned OAuth state
- [x] Handle authorization errors such as `access_denied` and `invalid_scope`
- [x] Exchange the authorization code exactly once
- [x] Derive expiry timestamps from `expires_in` and `x_refresh_token_expires_in`
- [x] Encrypt and save the latest access token, refresh token, `realmId`, scopes, and expiry timestamps
- [x] Redirect from the callback to a clean application URL
- [x] Create a centralized server-only QuickBooks API client
- [x] Use environment-specific API base URLs and the configured supported minor version
- [x] Refresh shortly before expiry or retry once after an authorization `401`
- [x] Save every rotated refresh token atomically
- [x] Serialize refresh, reconnect, and disconnect changes with one database lock
- [x] Bound Intuit requests so an expired lock cannot create concurrent token rotation
- [x] Require a genuinely replaced token when concurrent requests wait after a `401`
- [x] Create `POST /api/integrations/quickbooks/disconnect`
- [x] Revoke the token with Intuit before marking the local connection disconnected
- [x] Fail closed outside the local sandbox environment and loopback routes

### Developer steps required before live OAuth verification

1. Complete the remaining Intuit Developer Portal items in Phase 2.
2. Add the Development credentials and sandbox settings to the private `.env`.
3. Apply the OAuth state table and refresh-lock columns to Neon:

   ```bash
   npm run push
   ```

4. Start the app and open:

   ```text
   http://localhost:3000/api/integrations/quickbooks/connect
   ```

## Phase 4 - Prove the connection

- [x] Request `CompanyInfo` from the connected sandbox realm after authorization
- [x] Store the returned QuickBooks company name
- [x] Create a connection-status endpoint
- [x] Create a retryable `CompanyInfo` endpoint
- [x] Add a small integration screen or panel
- [x] Show **Connect QuickBooks** when disconnected
- [x] Show the sandbox company name and **Connected** status after authorization
- [x] Show **Disconnect** when connected
- [x] Show **Reconnect required** when token refresh can no longer recover

## Phase 5 - Verification

- [x] Connect a sandbox company successfully
- [x] Reject a callback with an invalid or missing OAuth state
- [x] Confirm tokens and `realmId` are encrypted in PostgreSQL
- [x] Confirm tokens never reach browser code or logs
- [x] Restart the Next.js application and confirm the connection still works
- [x] Force or simulate access-token expiry and confirm refresh works
- [x] Confirm the newest rotated refresh token is persisted
- [x] Disconnect and confirm further QuickBooks requests fail safely
- [x] Run lint, type checking, and production build checks
- [x] Document local setup and reconnection steps

## Completion criteria

This milestone is complete when:

- [x] One fixed local demo organization can connect one QuickBooks sandbox company
- [x] The application displays the real QuickBooks company name from `CompanyInfo`
- [x] The connection survives an application restart
- [x] Access-token refresh works without user interaction
- [x] Disconnect revokes the Intuit authorization
- [x] No QuickBooks token or client secret is exposed to the frontend or committed to Git

## Next milestone - Real accounting data

Do not start this section until the connection milestone is complete.

- [ ] Sync chart of accounts
- [ ] Sync customers and vendors
- [ ] Decide the historical backfill period
- [ ] Sync the accounting documents needed for cash flow
- [ ] Normalize QuickBooks documents and lines without losing their original IDs and relationships
- [ ] Add paginated reads and rate-limit-aware retries
- [ ] Replace dashboard cash data with a real server-side read model
- [ ] Add incremental synchronization, webhooks, and periodic CDC reconciliation

## Future production readiness

- [ ] Add application login, authorization, and organization-level access controls
- [ ] Use separate Intuit production credentials and HTTPS redirect URIs
- [ ] Protect Connect and Disconnect operations from unauthorized users and CSRF
- [ ] Document QuickBooks data usage, retention, deletion, and customer disconnect behavior
- [ ] Add secret and token-encryption-key rotation procedures
- [ ] Complete Intuit's applicable production and security review requirements

## Progress log

| Date | Status | Notes |
| --- | --- | --- |
| 2026-07-22 | Plan created | Scenario 1 selected; implementation has not started. |
| 2026-07-22 | Phase 1 code complete | Prisma/Neon schema, migration, seed, encryption, and safe environment contract added. Neon migration and seed await developer credentials. |
| 2026-07-23 | Neon schema applied | Developer created `.env`, configured pooled and direct Neon URLs, and successfully ran `npm run push`. Seed and encryption key confirmation remain. |
| 2026-07-23 | Seed complete | Fixed Vanguard demo organization, legal entity, and disconnected sandbox connection were created in Neon. |
| 2026-07-23 | Phase 2 local preparation complete | Encryption key confirmed; safe Intuit environment contract, supported API minor version, official portal steps, and verified OAuth safeguards documented. Portal configuration and Development credentials await the client. |
| 2026-07-23 | Phase 3 code complete | One-time database OAuth state, authorization callback, encrypted token persistence, serialized connection lifecycle, bounded token rotation, loopback-only sandbox routes, status, CompanyInfo, and revoking disconnect endpoints implemented. Neon schema application and live sandbox authorization await the developer credentials. |
| 2026-07-23 | Live sandbox connected | OAuth completed successfully; the status endpoint reports a connected sandbox and real `CompanyInfo` name `Sandbox Company US 8040`. |
| 2026-07-23 | Phase 4 complete | Added the Integrations navigation/page, live connected-company state, callback notices, CompanyInfo refresh, disconnect confirmation, and disconnected/reconnect states. Desktop and mobile DOM checks passed; live CompanyInfo refresh succeeded without browser console errors. |
| 2026-07-23 | Phase 5 verification in progress | Invalid and missing OAuth states were rejected. Encrypted-at-rest storage was confirmed without exposing stored values. A naturally expired access token triggered successful access and refresh-token rotation, the newest tokens were persisted, and a subsequent live CompanyInfo request succeeded. Static client/log scans, targeted ESLint, and type checking passed. Restart, production build, and final disconnect checks remain. |
| 2026-07-23 | Phase 5 complete | The developer's production build passed. A fresh `npm run start` process restored the persisted connection and completed a live CompanyInfo request. Disconnect revoked authorization, cleared local connection credentials, and subsequent QuickBooks requests failed safely. The sandbox is intentionally disconnected and must be reconnected before the next accounting-data milestone. |
