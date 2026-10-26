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

## Databases

SQL Server holds the shop data. Schema changes are EF Core migrations in `EcommWebApi`. Edit the C# model, add a migration, and commit that migration with the code. The same migration is applied to each database. UAT and production are not edited by hand.

| Database | Where it lives | Used by |
| --- | --- | --- |
| `EcommLocal` | SQL Server LocalDB on this PC (`MSSQLLocalDB`) | Development |
| `EcommUat` | The staging server, when that host exists | The `release` branch |
| `EcommProd` | The production server, when that host exists | The `main` branch |

Each environment has its own connection string. The local string can stay in development settings. The UAT and production strings stay on those servers, not in git. Local development connects only to `EcommLocal`.

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

GitHub accepts a staging deploy only from `release`, and a production deploy only from `main`. The servers are not created yet. These environments are the gates those deploys will use once a host exists.

The repository is private: [JumariBlignaut/e-comm](https://github.com/JumariBlignaut/e-comm).
