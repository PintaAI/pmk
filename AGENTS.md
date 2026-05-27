<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:auth-stack -->
# Auth Stack: Better Auth + Prisma + Neon (PostgreSQL)

Before editing any part of this stack, **always fetch the latest official documentation** using web search. Versions and APIs drift fast — do not rely on training data.

## Stack overview

| Layer | Package | Current version | Docs to check |
|---|---|---|---|
| Auth | `better-auth` | 1.6.11 | https://better-auth.com/docs/installation |
| Auth Prisma adapter | `@better-auth/prisma-adapter` | 1.6.11 | https://better-auth.com/docs/adapters/prisma |
| Auth Next.js plugin | `nextCookies` from `better-auth/next-js` | — | https://better-auth.com/docs/integrations/next |
| ORM | `prisma` / `@prisma/client` | 7.8.0 | https://www.prisma.io/docs/orm/prisma-client |
| Neon adapter | `@prisma/adapter-neon` | 7.8.0 | https://neon.com/docs/guides/prisma |
| Deployment | Vercel | — | https://better-auth.com/docs/guides/dynamic-base-url |

## Files and their purpose

### `lib/auth.ts` — Better Auth server instance
- `baseURL.allowedHosts` must include every domain that will serve the app (localhost, `*.vercel.app`, custom domain).
- Do NOT hardcode `trustedOrigins` — use `baseURL` object form instead; `allowedHosts` auto-populates `trustedOrigins`.
- `nextCookies()` plugin is required if auth functions (signInEmail, signUpEmail) are called from Server Actions.
- `experimental.joins` improves session query performance 2-3x.
- **Before editing**: websearch "better-auth options" + "better-auth nextjs integration"

### `lib/auth-client.ts` — Better Auth React client
- Simple `createAuthClient()` from `better-auth/react`.
- **Before editing**: websearch "better-auth react createAuthClient"

### `app/api/auth/[...all]/route.ts` — Auth API route handler
- Uses `toNextJsHandler(auth)` from `better-auth/next-js`.
- **Before editing**: websearch "better-auth nextjs route handler"

### `lib/prisma.ts` — Prisma client singleton
- Uses `@prisma/adapter-neon` with pooled `DATABASE_URL`.
- Imports from `../generated/prisma/client` (NOT `@prisma/client` — Prisma 7 requires custom output path).
- **Before editing**: websearch "prisma neon adapter" + "prisma 7 setup"

### `prisma/schema.prisma` — Database schema
- Generator: `prisma-client` (NOT `prisma-client-js` — Prisma 7 breaking change).
- Datasource: no `url` property (Prisma 7 uses `prisma.config.ts` instead).
- Models: User, Session, Account, Verification.
- **Before adding plugins** (magic link, OAuth, orgs, etc.): run `npx @better-auth/cli@latest generate --output prisma/schema.prisma` to regenerate models, then manually remove the `url` from the datasource block if it adds one.
- **Before editing**: websearch "better-auth prisma schema"

### `prisma.config.ts` — Prisma CLI config
- Uses `DIRECT_URL` (Neon direct connection, not pooled).
- Required by Prisma 7+ for all CLI commands (generate, migrate, db push).
- **Before editing**: websearch "neon prisma prisma.config.ts"

### `.env` — Environment variables
| Var | Purpose | Source |
|---|---|---|
| `DATABASE_URL` | Pooled connection (runtime) | Neon Console → Connect |
| `DIRECT_URL` | Direct connection (migrations) | Neon Console → Connect |
| `BETTER_AUTH_SECRET` | Encryption/hashing key | Run `bunx better-auth secret` or `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Canonical app URL | `http://localhost:3000` dev, production URL in prod |

## Common maintenance tasks

### Adding a Better Auth plugin (e.g. magic link, OAuth, 2FA)
1. websearch "better-auth <plugin-name> plugin"
2. Read the plugin docs and update `lib/auth.ts` imports and `plugins` array.
3. Re-run `npx @better-auth/cli@latest generate --output prisma/schema.prisma` to update models, then fix the datasource block (remove `url` if added).
4. Run `bunx prisma migrate dev --name add_<plugin>`.

### Updating Prisma
1. websearch "prisma latest version" + "prisma 7 to 8 migration" if applicable.
2. `bun update prisma @prisma/client @prisma/adapter-neon @better-auth/prisma-adapter better-auth`
3. Check generator provider name hasn't changed (Prisma 7: `prisma-client`, not `prisma-client-js`).
4. Check that import path `generated/prisma/client` still resolves.
5. Run `bunx prisma generate` and `bunx tsc --noEmit`.

### Deploying to Vercel
- Set `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` in Vercel project env vars.
- `postinstall: "prisma generate"` in package.json ensures Prisma client rebuilds.
- `baseURL.allowedHosts` already includes `*.vercel.app` — preview deploys work automatically.
- For custom domains, add them to `baseURL.allowedHosts` in `lib/auth.ts`.
- websearch "better-auth vercel deployment" for any platform-specific changes.

## Important gotchas
- **Prisma 7**: generator is `prisma-client` (no `-js` suffix). Import from `generated/prisma/client`, not `@prisma/client`.
- **Prisma 7 + Neon**: No `url` in datasource block. Use `prisma.config.ts` with `DIRECT_URL`.
- **Next.js 16**: `middleware.ts` is deprecated — use `proxy.ts` with named export `proxy`.
- **Next.js 16 proxy**: Only Node.js runtime is supported (no edge). Cookie-only checks are faster but not secure — always validate session in the page/route.
- **Neon**: Two connection strings — pooled (`-pooler`) for runtime, direct for CLI. Never use the pooled URL for migrations.
<!-- END:auth-stack -->
