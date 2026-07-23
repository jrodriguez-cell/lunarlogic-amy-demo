# QuickBooks Local Sandbox Setup

This setup is for the local, single-company sandbox prototype. The routes are
intentionally unavailable outside a loopback hostname and must not be deployed
as the production authorization model.

## Prerequisites

- Node.js 20 or newer
- A Neon PostgreSQL database
- An Intuit Developer app with QuickBooks Online Accounting enabled
- An Intuit sandbox company

## Private environment

1. Create `.env` locally from the variable contract in `.env.example`.
2. Add the pooled and direct Neon connection strings.
3. Generate and add a private 32-byte base64 `TOKEN_ENCRYPTION_KEY`.
4. Add the Intuit Development client ID and client secret.
5. Keep `INTUIT_ENVIRONMENT=sandbox`.
6. Register this exact Development redirect URI in the Intuit app:

   ```text
   http://localhost:3000/api/integrations/quickbooks/callback
   ```

Never commit `.env`, place credentials in `.env.example`, or expose Intuit
credentials or QuickBooks tokens to browser code. Codex must not open, read,
search, or print `.env`; the developer owns all private values and
credential-dependent commands.

## Database setup

Apply the current Prisma schema and seed the fixed demo organization:

```bash
npm run push
npm run seed
```

Both commands are designed for the disposable local sandbox workflow. Establish
a Prisma migration baseline before moving an existing database to
`prisma migrate deploy`.

## Connect and verify

1. Start the application:

   ```bash
   npm run dev
   ```

2. Open:

   ```text
   http://localhost:3000/api/integrations/quickbooks/connect
   ```

3. Authorize the sandbox company in Intuit.
4. Confirm the company and connection status at:

   ```text
   http://localhost:3000/integrations
   ```

5. Use **Refresh company info** to make a live read-only `CompanyInfo` request.

The access token is refreshed shortly before expiry, or once after a QuickBooks
`401`. Intuit may rotate the refresh token during this operation; the
application atomically stores the newest encrypted token.

## Reconnection

- If the integration shows **Reconnect required**, start the Connect flow again
  and authorize the sandbox company.
- If Intuit credentials or the redirect URI change, update the private `.env`,
  restart the application, and reconnect.
- Use **Disconnect** only when authorization should be revoked. It revokes the
  Intuit token before deleting the locally stored connection credentials.

## Production boundary

The production implementation still needs application authentication,
organization-level authorization, HTTPS callback URLs, production Intuit
credentials, and an agreed single owner for OAuth token refresh. The client SOW
assigns OAuth scheduling to n8n, so Next.js and n8n must not refresh the same
QuickBooks connection independently.
