# Veld Supply — Project Setup Guide

**Document date:** 30 October 2026  
**Repo:** [JumariBlignaut/e-comm](https://github.com/JumariBlignaut/e-comm) (local folder `veld-supply`)  
**Stand-in brand:** Veld Supply (client shop name TBD)

This PDF summarises how the shop was started, what Azure and Resend needed, how the pieces connect, and how deployment was set up.

---

## 1. What we built

A South African hunting-gear ecommerce shop:

| Part | Choice |
| --- | --- |
| Frontend | Angular (TypeScript) — shop + admin in one app (`EcommWebApp`) |
| Backend | ASP.NET Core API in C# (`EcommWebApi`) — the only backend |
| Database | SQL Server (LocalDB locally; Azure SQL for UAT) |
| Payments | PayFast hosted checkout (card, Instant EFT, Capitec Pay) |
| Email (UAT) | Resend API + hosted template (`onboarding@resend.dev` until a domain is verified) |

Design reference: [Figma — Design](https://www.figma.com/design/AGgDdTWPjG3j6KEmVrLWw1/Design).

Money is stored in **cents**. Card data never touches our API; PayFast notifies us with a signed ITN when an order is paid.

---

## 2. Timeline — from startup to now

### Phase A — Frontend from Figma (≈ 26 Oct 2026)

- Built shop and admin UI from the Figma designs.
- Angular standalone components, desktop/mobile split, Tailwind styling.
- Early question: were frontend and API connected? At that stage the UI was still catching up to a full live API.

### Phase B — API, data, payments, auth

- ASP.NET Core API with EF Core + SQL Server.
- Products, cart, checkout, orders, admin stock/sales.
- PayFast sandbox wiring (`ReturnBase` / `NotifyBase`).
- JWT auth: register, sign-in, profile; customer vs admin roles.
- Password reset flow: token hashed in DB, link returned to the SPA; initially email was **logged only** (`LoggingEmailSender`).

### Phase C — Azure UAT + CI/CD

- Azure App Service **`veld-supply`** (South Africa North).
- Azure SQL database **`EcommUat`** on server **`e-comm-uat`**.
- GitHub Actions workflow builds Angular + publishes the API, then deploys the combined package to UAT from the **`release`** branch.

### Phase D — Resend for app email (30 Oct 2026)

- Connected Resend via Cursor MCP (`https://mcp.resend.com/mcp`).
- Created sending-only API key **“Veld Supply UAT”**.
- Created and published template alias **`password-reset`**.
- Replaced log-only sender with `ResendEmailSender` when `Resend:ApiKey` is present.
- Deferred custom domain: `veldsupply.co.za` is not registered in public DNS yet, so UAT uses **`onboarding@resend.dev`**.

---

## 3. How the pieces connect

```
┌─────────────────┐     /api (proxy locally)      ┌──────────────────┐
│  Angular SPA    │ ────────────────────────────► │  ASP.NET API     │
│  EcommWebApp    │   same host on Azure          │  EcommWebApi     │
│  :4200 local    │◄───────────────────────────── │  :5156 local     │
└─────────────────┘                               └────────┬─────────┘
                                                           │
                    ┌──────────────┬───────────────────────┼──────────────┐
                    ▼              ▼                       ▼              ▼
             ┌──────────┐  ┌────────────┐         ┌────────────┐  ┌──────────┐
             │ SQL      │  │ PayFast    │         │ Resend     │  │ JWT      │
             │ Server   │  │ hosted     │         │ Email API  │  │ secrets  │
             └──────────┘  └────────────┘         └────────────┘  └──────────┘
```

### Local development

1. Start API: `dotnet run --launch-profile http` → `http://localhost:5156`
2. Start shop: `pnpm start` → `http://localhost:4200`
3. `proxy.conf.json` forwards `/api` and `/products` to the API.
4. Local DB: LocalDB `EcommLocal` (connection string in `appsettings.Development.json`).
5. Resend key: .NET **user secrets** (`Resend:ApiKey`) — not committed to git.

### Azure UAT (single App Service)

1. CI builds the Angular app and `dotnet publish`es the API.
2. Shop static files are copied into `api/wwwroot`.
3. One App Service serves **SPA + API** together.
4. Browser calls `/api/...` on the same origin (no separate API host).
5. Secrets live as App Service settings / connection strings (not in git).

UAT URL:  
`https://veld-supply-cpdddtaqf8epdpe0.southafricanorth-01.azurewebsites.net`

### Password-reset email path

1. User submits email on `/forgot-password`.
2. SPA → `POST /api/auth/forgot-password`.
3. API creates a one-hour token, stores **hash only**, builds  
   `{App:PublicUrl or PayFast:ReturnBase}/reset-password?token=...`
4. `IEmailSender.SendPasswordReset` → Resend template `password-reset` with  
   `CUSTOMER_NAME`, `RESET_LINK`, idempotency key `pwd-reset-{tokenHash}`.
5. User opens link → `POST /api/auth/reset-password`.

If `Resend:ApiKey` is missing, the API logs the link instead (dev fallback). In Development, the API may also return the link in the JSON response for local testing.

---

## 4. What we needed on Azure

### Resources

| Resource | Name / notes |
| --- | --- |
| App Service | `veld-supply` |
| Region | South Africa North |
| Azure SQL server | `e-comm-uat` |
| Azure SQL database | `EcommUat` |
| GitHub Actions secret | `AZURE_WEBAPP_PUBLISH_PROFILE` (download from App Service → Get publish profile) |

### App Service configuration (do not commit)

| Setting | Purpose |
| --- | --- |
| Connection string **`Shop`** | Azure SQL for `EcommUat` |
| **`Jwt__Key`** | Signing key ≥ 32 characters (not the local dev key) |
| **`Jwt__Issuer`** / **`Jwt__Audience`** | `veld-supply` |
| **`Resend__ApiKey`** | Sending-only Resend key for UAT (or `RESEND_API_KEY`) |
| PayFast merchant settings | Optional until real sandbox checkout is wired |

Optional overrides if hostname changes:

- `PayFast__ReturnBase`, `PayFast__NotifyBase`
- `Cors__Origins__*`
- `App__PublicUrl` (used for reset links; falls back to `PayFast:ReturnBase`)

`appsettings.json` already lists the current UAT host for CORS and PayFast return/notify bases.

### Databases by environment

| Database | Where | Used by |
| --- | --- | --- |
| `EcommLocal` | SQL Server LocalDB | Local development |
| `EcommUat` | Azure SQL on `e-comm-uat` | `release` → App Service `veld-supply` |
| `EcommProd` | Production host (when ready) | `main` |

Schema changes: EF Core migrations in `EcommWebApi` — apply the same migrations to each database; do not hand-edit UAT/prod schema.

---

## 5. What we needed for Resend

### Account & access

1. Resend account ([resend.com/signup](https://resend.com/signup)).
2. Agent/MCP access in Cursor: remote MCP `https://mcp.resend.com/mcp` (or `/add-plugin resend` / Customize → Resend).
3. OAuth login so the agent could create keys and templates.

### Decisions for UAT

| Item | Choice |
| --- | --- |
| Use case | **App email** (password reset first; receipts later) |
| Domain | Deferred — no owned domain in DNS yet |
| Sender (temporary) | `Veld Supply <onboarding@resend.dev>` |
| Template | Alias `password-reset` (variables `CUSTOMER_NAME`, `RESET_LINK`) |
| API key | Name **Veld Supply UAT**, permission **sending_access** |

### Important UAT limitation

With `onboarding@resend.dev`, Resend only delivers to **the email on your Resend account** (and Resend test addresses). Seed users such as `admin@veldsupply.co.za` will not receive mail until you either:

- test with an account matching your Resend login email, or  
- verify a domain you own and switch `Resend:From`.

### Code integration

- NuGet package: `Resend` on `EcommWebApi`.
- Config (non-secret):

```json
"Resend": {
  "From": "Veld Supply <onboarding@resend.dev>",
  "PasswordResetTemplateId": "password-reset"
}
```

- Secret: `Resend:ApiKey` via user secrets (local) or `Resend__ApiKey` (Azure).
- `Program.cs` registers `ResendEmailSender` when the key is set; otherwise `LoggingEmailSender`.

### When you own a domain later

1. Create e.g. `mail.yourdomain.co.za` in Resend (sending enabled).
2. Add DNS records (SPF, DKIM, DMARC) at your DNS host.
3. Verify the domain in Resend.
4. Create a **domain-restricted** sending key; put it in Azure secrets.
5. Update `Resend:From` to e.g. `Veld Supply <hello@mail.yourdomain.co.za>`.
6. Update the template’s default From if needed and republish.

---

## 6. Deployment setup

### Branches

| Branch | Role |
| --- | --- |
| `develop` | Day-to-day work (default) |
| `release` | Staging / UAT deploy |
| `main` | Production (when host is ready) |

Flow: work on `develop` → merge to `release` for UAT → merge `release` → `main` for production.

### GitHub Actions (`.github/workflows/shop.yml`)

**Triggers:** push and PR to `develop`, `release`, `main`.

**Build job (all branches):**

1. `dotnet publish` API → `artifacts/api`
2. `pnpm install` + `pnpm build` in `EcommWebApp`
3. Upload artifacts: `api` and `shop` (Angular `browser` output)

**Deploy UAT** (`deploy-staging`):

- Only on **push** to **`release`**
- Environment: `staging`
- Copies shop files into `api/wwwroot`
- `azure/webapps-deploy@v3` with:
  - `app-name: veld-supply`
  - `publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}`

**Deploy production** (`deploy-production`):

- Only on push to `main` **and** when `vars.PRODUCTION_HOST` is set
- Currently a **stub** that fails with a clear error until publishing is configured

### How we set deployment up (checklist)

1. Create Azure App Service + Azure SQL.
2. Apply EF migrations / let the API migrate on startup against `EcommUat`.
3. Set App Service connection string `Shop` and JWT settings.
4. Download the App Service **publish profile**.
5. In GitHub repo → Settings → Secrets → Actions: add **`AZURE_WEBAPP_PUBLISH_PROFILE`**.
6. Create GitHub Environment **`staging`** (optional protection rules).
7. Merge tested work into **`release`** → Actions builds and deploys UAT.
8. Add **`Resend__ApiKey`** on the App Service after Resend key creation.
9. Production: set `PRODUCTION_HOST` and replace the stub publish step when ready.

---

## 7. Local run cheat sheet

**API** (`EcommWebApi`):

```powershell
dotnet run --launch-profile http
```

- API: http://localhost:5156  
- Swagger: http://localhost:5156/swagger  

**Shop** (`EcommWebApp`):

```powershell
pnpm start
```

- Shop: http://localhost:4200  

**Seed sign-in (local DB):**

- `admin@veldsupply.co.za` / `password`  
- `thabo@example.co.za` / `password`  

**Resend local secret:**

```powershell
cd EcommWebApi
dotnet user-secrets set "Resend:ApiKey" "<your-sending-key>"
```

---

## 8. Current status & next steps

| Area | Status |
| --- | --- |
| Shop + admin UI | In place from Figma |
| API + LocalDB | Working locally |
| PayFast | Sandbox URLs configured; merchant credentials as needed |
| Azure UAT | App Service + SQL + Actions deploy from `release` |
| Resend | Template + key + API wiring for password reset |
| Custom sending domain | **Not done** — register DNS domain first |
| Production deploy | **Stub** until host + publish are configured |
| Order/receipt emails | Suggested next Resend templates |

**Recommended next steps**

1. Register a real domain and verify it in Resend; leave UAT on `onboarding@resend.dev` until then.  
2. Set `Resend__ApiKey` on Azure if not already set; restart the App Service.  
3. Test forgot-password with the Resend account email on UAT.  
4. Add receipt / “order packed” templates when checkout notifications are ready.  
5. Finish production App Service + `PRODUCTION_HOST` publish path.

---

## 9. Secret hygiene

Never commit:

- Resend API keys  
- JWT signing keys for UAT/prod  
- Azure SQL connection strings  
- PayFast production merchant keys  
- Azure publish profiles  

Local: user secrets / environment variables.  
UAT/Prod: Azure App Service configuration and GitHub Actions secrets only.

---

*End of guide — generated for the Veld Supply / e-comm project.*
