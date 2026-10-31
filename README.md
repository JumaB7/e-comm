# e-comm

South African hunting gear shop. The repo is called `e-comm` until the client chooses a shop name. The designs use **Veld Supply** as a stand-in.

About 50 products, sold one at a time, in rand. Prices include 15% VAT. A till can be added later; products carry SKUs so stock can match. Licensed firearms and ammunition, if they are added, will not use the normal add-to-cart checkout.

Designs: [Figma](https://www.figma.com/design/AGgDdTWPjG3j6KEmVrLWw1/Design)

## Stack

| Part | Choice |
| --- | --- |
| Frontend | Angular (TypeScript). Shop and admin live in one app. |
| Backend | ASP.NET Core API, written in C#. This API is the only backend. |
| Database | SQL Server. Three databases: local, UAT, and production. |
| API contract | OpenAPI. Swagger UI is on while developing, and is not published on the live site. |
| Payments | PayFast hosted checkout: card, Instant EFT, and Capitec Pay. |

Money is stored in cents. A price of R 9 860 is `986000`. The API calculates totals. Card numbers stay on PayFast. The API sets the amount, sends the buyer to PayFast, and marks an order paid only after PayFast’s signed notification matches.

Customers and admins are two roles on the same API. Admin actions, including stock and sales, check for the admin role.

## Run locally

Start the API first, then the shop. The shop calls `/api` on its own address, and the dev server forwards those calls to the API.

From `EcommWebApi`:

```powershell
dotnet run --launch-profile http
```

The API is [http://localhost:5156](http://localhost:5156). Swagger is [http://localhost:5156/swagger](http://localhost:5156/swagger). In Visual Studio, use the **http** profile. This uses the local database `EcommLocal`, not Azure.

From `EcommWebApp`:

```powershell
pnpm start
```

The shop is [http://localhost:4200](http://localhost:4200).

Sign in with `admin@veldsupply.co.za` or `thabo@example.co.za`. Both passwords are `password`.

## Databases

SQL Server holds the shop data. Schema changes are EF Core migrations in `EcommWebApi`. Edit the C# model, add a migration, and commit that migration with the code. The same migration is applied to each database. UAT and production are not edited by hand.

| Database | Where it lives | Used by |
| --- | --- | --- |
| `EcommLocal` | SQL Server LocalDB on this PC (`MSSQLLocalDB`) | Development |
| `EcommUat` | Azure SQL on `e-comm-uat` | The `release` branch / App Service `veld-supply` |
| `EcommProd` | The production server, when that host exists | The `main` branch |

Each environment has its own connection string. The local string can stay in development settings. The UAT and production strings stay on those servers, not in git. Local development connects only to `EcommLocal`.

UAT site: [https://veld-supply-cpdddtaqf8epdpe0.southafricanorth-01.azurewebsites.net](https://veld-supply-cpdddtaqf8epdpe0.southafricanorth-01.azurewebsites.net).

On that App Service, keep these as **Environment variables** / connection strings (not in git):

| Name | Notes |
| --- | --- |
| Connection string `Shop` | SQL Azure string for `EcommUat` |
| `Jwt__Key` | At least 32 characters, **not** `LOCAL_DEV_JWT_KEY_REPLACE_ME_32CHARS` |
| `Jwt__Issuer` / `Jwt__Audience` | `veld-supply` |
| `Resend__ApiKey` | Sending key from Resend (never commit) |
| PayFast merchant settings | `PayFast__MerchantId` / `MerchantKey` / `Passphrase` when sandbox/live is wired |

`PayFast:ReturnBase`, `PayFast:NotifyBase`, and CORS origins for that host live in `appsettings.json` and can be overridden on Azure if the hostname changes.

### Secret hygiene (before making the repo public)

Never commit Resend keys, UAT/prod JWT keys, Azure SQL strings, PayFast live keys, or publish profiles. Those belong in user secrets / Azure / GitHub Actions secrets.

Local seed accounts (`admin@veldsupply.co.za` / `thabo@example.co.za`, password `password`) are created **only in Development**. If UAT was seeded earlier with those users, change or delete those passwords on Azure before the repo goes public.

## Branches

`main` is the production branch. There is no `master` branch. `develop` is the default.

| Branch | Role |
| --- | --- |
| `develop` | Day-to-day work. |
| `release` | Deployed to staging (UAT and test). |
| `main` | Deployed to production. |

Work lands on `develop`. A version ready to try is merged into `release`, which deploys to staging. After that check passes, `release` is merged into `main`, which deploys to production.

## Environments

| Environment | Branch | What it is |
| --- | --- | --- |
| `staging` | `release` | The UAT and test site. |
| `production` | `main` | The live shop. |

GitHub accepts a staging deploy only from `release`, and a production deploy only from `main`. UAT deploys to the `veld-supply` App Service when `AZURE_WEBAPP_PUBLISH_PROFILE` is set. Production publishing is still a stub until `PRODUCTION_HOST` is set.

The repository is private: [JumariBlignaut/e-comm](https://github.com/JumariBlignaut/e-comm).
