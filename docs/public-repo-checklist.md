# Making this repo public — checklist

**Date:** 31 October 2026

## Scan result (git tree)

| Check | Result |
| --- | --- |
| Resend API keys (`re_…`) in tracked files / git history | **None found** |
| Azure publish profiles / `.env` / `secrets.json` tracked | **None found** |
| UAT/prod connection strings in repo | **None** (only LocalDB Windows-auth string in Development) |
| PayFast live merchant id/key in repo | **Empty** in `appsettings.json` |
| GitHub Actions secrets referenced by name only | OK (`secrets.AZURE_WEBAPP_PUBLISH_PROFILE`) |

## Hardening applied in code

1. **`ShopSeed` runs only in Development** — so a fresh UAT/prod DB is not auto-filled with `admin@…` / `password`.
2. **Production/Staging refuse the committed development JWT key** — `Program.cs` throws if `Jwt:Key` is still `LOCAL_DEV_JWT_KEY_REPLACE_ME_32CHARS` outside Development.
3. **`.gitignore`** expanded for `.env`, publish profiles, local appsettings overrides, certs.

## You must still do (ops) before / when going public

1. **Rotate the Resend API key** that was created for UAT (it appeared in a local Cursor chat earlier — treat it as exposed even though it is not in git). Create a new key in Resend, set `Resend__ApiKey` on Azure, delete the old key.
2. **Confirm Azure App Service** `ASPNETCORE_ENVIRONMENT` is **not** `Development`.
3. **Confirm Azure `Jwt__Key`** is a unique long random value (not the local `dev-only-…` string).
4. **If UAT already has seed users**, change passwords for `admin@veldsupply.co.za` and `thabo@example.co.za` (or delete those accounts) — they used the well-known local password.
5. **Confirm Azure SQL / PayFast / publish profile** live only in App Service / GitHub Actions secrets — not in any branch.
6. Optional: enable GitHub secret scanning / push protection on the repo after it is public.

## What remains intentionally in the repo (not production secrets)

| Item | Why it is OK |
| --- | --- |
| `Jwt:Key` = `LOCAL_DEV_JWT_KEY_REPLACE_ME_32CHARS` in Development settings | Local-only; blocked outside Development |
| `PayFast:Passphrase` = `LOCAL_PAYFAST_PASSPHRASE` in Development | Only used for local fake ITN signing; merchant id empty |
| LocalDB connection string | Windows integrated auth, machine-local |
| Documented seed password `password` | Development seed only |
| Azure UAT hostname in CORS / PayFast return URLs | Public URL, not a credential — lock down the app itself |

## After flipping GitHub to public

Re-check Actions logs are not printing secrets, and that Swagger is off on UAT (it is gated to Development in `Program.cs`).
