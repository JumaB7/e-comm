# Veld Supply — Architecture & Coding Decisions

**Document date:** 31 October 2026  
**Repo:** [JumariBlignaut/e-comm](https://github.com/JumariBlignaut/e-comm) (local folder `veld-supply`)  
**Companion doc:** [veld-supply-setup-guide.md](./veld-supply-setup-guide.md) (how we stood the environments up)

This document explains **why** the shop is shaped the way it is: stack choices, folder layout, Angular patterns, auth practices, and backend service design. It is written for someone joining the project, reviewing a PR, or revisiting a decision months later.

---

## 1. What we optimised for

Veld Supply is a small, real South African ecommerce shop (roughly fifty SKUs, rand pricing, VAT included, PayFast checkout). The architecture leans toward:

| Priority | Meaning for this repo |
| --- | --- |
| One deployable shop | Shop + admin in one Angular app; one ASP.NET API; static SPA hosted by that API on Azure |
| Clear ownership of money and stock | Totals and stock live on the server; the browser displays what the API calculated |
| Mobile and desktop fidelity to Figma | Separate templates where layouts diverge, not one responsive soup that fights the design |
| Predictable auth | JWT in session storage, identity from claims in memory, profile from the API when needed |
| Boring, hireable tech | Angular + ASP.NET Core + SQL Server + Tailwind — common in SA enterprise and agency work |
| Small surface area | Prefer a thin controller → service → EF path over frameworks we do not need yet |

We deliberately did **not** optimise for a multi-tenant SaaS, a microservices mesh, or a headless CMS. Those would be the wrong cost for this size of catalogue.

---

## 2. High-level system shape

```
┌────────────────────────────────────┐
│  EcommWebApp (Angular SPA)         │
│  shop + admin, desktop/mobile      │
│  Tailwind UI, signals, OnPush      │
└────────────────┬───────────────────┘
                 │  /api/*  (proxy locally; same origin on Azure)
┌────────────────▼───────────────────┐
│  EcommWebApi (ASP.NET Core)        │
│  Controllers → I*Service → EF Core │
│  JWT auth, PayFast, Resend         │
└────────────────┬───────────────────┘
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   SQL Server  PayFast  Resend
```

On Azure UAT the built Angular app is copied into `EcommWebApi/wwwroot`, so the browser talks to the **same host** for HTML and `/api`. Locally, `ng serve` proxies `/api` to the API so CORS stays simple and cookies/tokens behave like production.

---

## 3. Why these platforms and frameworks

### 3.1 Angular (frontend)

**Why Angular over React/Next or a plain SPA kit**

- Typed components, routing, forms, and HTTP are first-class — we need all of them for checkout, admin, and auth.
- Standalone components + `OnPush` match how we already structure screens (container → desktop/mobile).
- Signals are now a stable Angular model for UI state; we can keep RxJS for HTTP without making every form field an Observable stream.
- One app can host both the customer shop and the admin console without a second deploy pipeline.

**Why not Next.js / SSR**

The catalogue is modest and UAT already ships as static files from the API. SSR would add Node hosting and caching complexity without a clear SEO or TTFB requirement that outweighs that cost for this product.

### 3.2 ASP.NET Core + C# (backend)

**Why ASP.NET Core**

- First-class JWT bearer auth, EF Core, and SQL Server on Azure.
- Strong typing end-to-end with records for request/response contracts.
- Familiar deployment to Azure App Service (the UAT host we already use).
- One process serves API + static SPA in production — fewer moving parts than “API + separate static CDN + BFF”.

**Why not Node/Express or a BFF-only layer**

We do not have a second upstream to adapt. A BFF-with-strategies pattern (Router vs legacy EE) is useful when you *already* have two backends. Here there is one source of truth: this API and SQL Server. Adding a BFF would duplicate mapping for no gain.

### 3.3 SQL Server + EF Core

**Why SQL Server**

- Matches Azure SQL for UAT/production and LocalDB for local work.
- Relational model fits products, stock, orders, and line items cleanly.
- Money stays as integers (cents) in the database — no float drift.

**Why EF Core migrations**

Schema changes travel with the code. Local, UAT, and production apply the same migrations. We do not hand-edit UAT tables. That keeps “it works on my machine” from becoming “UAT has a mystery column”.

### 3.4 Tailwind CSS

**Why Tailwind**

- Figma-to-code is mostly spacing, type scale, and colour tokens. Utility classes map 1:1 without inventing a parallel SCSS architecture.
- One styling system for app screens and the `ecomm-components` library.
- We avoid component-scoped SCSS files, inline `style=""`, and `[style]` bindings — those fight design-token consistency and reviewability.
- Custom plugins / design tokens (heading, text, border colours) sit on top of Tailwind so brand classes stay named (`text-ink`, `border-line`) instead of raw hex in every template.

**Why not Bootstrap / Material / a heavy UI kit**

The Figma design is custom (display typography, hunting-retail look). A kit would force overrides that cost more than writing Tailwind utilities that match the file.

### 3.5 PayFast

South African checkout reality: card, Instant EFT, Capitec Pay. PayFast hosted checkout keeps card data off our servers. The API sets the amount, redirects the buyer, and only marks an order paid after a **signed** ITN matches. That is a deliberate trust boundary, not an accident of the SDK.

### 3.6 Resend (email)

Password-reset (and later transactional mail) needed a simple HTTP email API with templates. Resend fits that; the API registers `ResendEmailSender` when `Resend:ApiKey` is present, otherwise `LoggingEmailSender` so local/UAT without a key still runs. Secrets stay in user secrets / Azure app settings — never in git.

### 3.7 pnpm

Frontend package manager is **pnpm** (lockfile + install in CI). It is faster and stricter about phantom dependencies than npm for this workspace. (Other products in the wider org may still use npm; this shop standardised on pnpm.)

---

## 4. Frontend architecture

### 4.1 Feature folders, not a flat `components/` dump

Screens live under feature folders:

```
src/app/
  account/profile/
  checkout/
  sign-in/
  admin/orders/
  services/
  models/
  shell/
```

**Reasoning**

- A feature owns its container, desktop/mobile templates, form helpers, and base class. Finding “how checkout works” means opening one folder.
- Shared cross-cutting code stays in `services/`, `models/`, `forms/`, `directives/`.
- We avoid a giant `shared/` that becomes a junk drawer. Shared UI that is truly reusable goes into `projects/ecomm-components` instead.

### 4.2 Models in separate files / folders

TypeScript interfaces for API and UI shapes live under `src/app/models/` (`auth.model.ts`, `cart.model.ts`, `product.model.ts`, `order.model.ts`, …).

**Why separate from components and services**

1. **Stable contract surface** — `AuthService`, `CartService`, and account/checkout screens all import the same `CheckoutProfile` / `AuthSession`. Types next to one component encourage one-off shapes that drift from the API.
2. **Reviewability** — A PR that touches `auth.model.ts` is an explicit contract change.
3. **Optional fields match JSON** — Prefer `field?: T` (e.g. `prefillCheckout?: boolean`) when the API may omit a key. We avoid `field: T | null` unless the wire always sends the key and `null` is meaningful. That rule is easier to keep when models sit together.
4. **Split by domain file, not one mega `models.ts`** — Auth, cart, product, order, and sales change at different rates; separate files keep diffs readable.
5. **No generated client yet** — Types are hand-maintained mirrors of `Contracts/ShopContracts.cs`. When the C# record changes, update the matching FE interface in the same PR.

**Example: three layers for “who is this person?”**

| Layer | Type | Contains |
| --- | --- | --- |
| EF | `ShopUser` | `PasswordHash`, reset hash/expiry, address columns |
| API contract | `AuthModel`, `CheckoutProfileModel` | Token + public profile fields — no hashes |
| FE | `AuthSession`, `UserData`, `CheckoutProfile` | Session wire shape; memory identity; checkout profile |

`UserData` is intentionally narrower than `CheckoutProfile`: identity for the shell/guards, not street/suburb. That stops the shell from depending on a profile fetch just to show “Thabo Mokoena”.

### 4.3 Desktop / mobile split (container + base + two components)

Almost every screen follows:

```
feature-container.component.ts   → picks desktop vs mobile via *appBreakpoint
feature-base.directive.ts        → shared signals, forms, inject(), methods
feature-desktop.component.*      → desktop template + thin class
feature-mobile.component.*       → mobile template + thin class
```

**Why**

- Figma desktop and mobile layouts often differ in structure (nav, spacing, stacked vs side-by-side), not only CSS breakpoints. Separate templates keep markup honest.
- Shared behaviour lives once in the base (or a plain TypeScript base class when `@Directive()` bases confuse the language service for `input()` inheritance).
- The breakpoint directive aligns with Tailwind’s `lg` (`max-width: 1023.98px`) so “mobile layout” means the same thing in CSS and in which component mounts.
- Containers stay dumb: they only switch views. No business logic in the container.

**Use case:** Checkout on mobile is a single column with different control density; desktop can show bag + form side by side. One responsive template would become unreadable conditionals. Two templates + one base is the cheaper long-term structure.

### 4.4 Library components (`ecomm-components`)

Buttons, status pills, product cards live in `projects/ecomm-components` and are consumed as `ecomm-*` elements.

**Why a library inside the repo**

- Visual primitives should not re-implement padding and label variants on every screen.
- Desktop/mobile product cards can diverge while sharing the same public inputs.
- Signal `input()` is declared on the **concrete `@Component` class** (not only a base `@Directive()`), because the Angular language service often reports NG8002 for inherited signal inputs even when runtime works. We copy that lesson from sibling apps and document it in workspace rules.

Lib components stay **dumb**: inputs/outputs only, no `AuthService` injection. App services own data; the library owns presentation.

### 4.5 Signals vs Observables (code-level)

This is the decision people ask about most. In this repo the rule is:

> **Signals hold current UI / domain state. Observables move async values through time (HTTP, router, form streams). Bridge with `toSignal` / `toObservable` at the boundary — do not pick one tool for everything.**

#### When we use signals (and why, in *our* code)

| Example in repo | Why a signal |
| --- | --- |
| `AuthService.userDataState` / `userData` | “Who is signed in right now?” is a single current value. Shell, cart, and guards need synchronous reads (`signedIn()`, `userData()`). |
| `AuthService.busy` / `error` / `notice` | Button disabled state and inline messages are UI flags updated at the end of a request, not a stream consumers recompose. |
| `CartService.bagChoice`, `*Choice` contact fields | Bag and checkout contact change from clicks and typing. Many `computed` fields derive from them (`count`, `email`, `checkout`, `displayLines`). |
| `CatalogService.products`, `orders`, `ready` | After HTTP lands, we **set** a signal once. Templates bind `products()` / `ready()` — they do not subscribe to a long-lived product Observable. |
| `CheckoutBaseDirective.submitted`, `qtyEdits` | Per-screen UI state that should not live in a service. |
| `ShopShellBaseDirective.links` / `activeLabel` / `showSearch` | Pure functions of other signals (`userData`, `url`) → `computed`. |

**Concrete: cart as a signal graph**

`CartService` keeps the user’s choice in writable signals (`bagChoice`, `deliveryChoice`, `emailChoice`, …) and derives everything else:

- `delivery = computed(() => deliveryChoice() ?? 'courier')` — default without overwriting the user’s null choice.
- `count`, `displayLines`, `checkout` — all `computed` from those choices + the latest quote.
- Templates bind `bagCount()`, `lines()`, etc. No `getCount()` method in the template.

That is why signals win here: **one bag change automatically refreshes count, quote inputs, display lines, and checkout payload** without manually notifying subscribers.

**Concrete: choice vs derived (do not “fix” with `effect`)**

We keep the raw choice and derive what the UI shows. Example pattern (same idea as org-wide trade-ticket guidance):

```typescript
// Right — choice stays; UI reads a derived value
readonly delivery = computed(() => this.deliveryChoice() ?? 'courier');

// Wrong — effect that writes back into the choice when invalid
// effect(() => { if (bad) this.deliveryChoice.set('courier'); });
```

Writing back in an `effect` races with other writers (form, profile prefill, history) and causes flicker. We only use `effect` for **side effects**:

- Persist bag: `effect(() => this.session.setBag(JSON.stringify(this.bagChoice())));`
- React to auth identity: load profile / stash bag on sign-out (`syncBagOwner`), then optionally prefill — with `untracked` around the writes so the effect does not re-fire on every field set.

#### When we use Observables (and why, in *our* code)

| Example in repo | Why an Observable |
| --- | --- |
| Every `HttpClient` call | Angular’s HTTP API is Observable-based (cancelable, operators, interceptors). |
| `AuthService.profile()` | Shared async fetch: `shareReplay({ bufferSize: 1, refCount: false })` so cart + account page share one GET / one cache. Cleared on `clearSession` / new `store()`. |
| `AuthService.updateProfile()` / `CatalogService.pay()` | Caller needs to **compose** the async result (toast, navigate, PayFast form submit). Returning `Observable` lets the feature `subscribe` once. |
| `CheckoutBaseDirective` `form.valueChanges` | Reactive Forms expose streams; we push into cart signals and refresh invalid-field lists. Piped with `takeUntilDestroyed()`. |
| `ShopShellBaseDirective` router `events` | Navigation is an event stream → `toSignal` for `url`, then `computed` for `activeLabel` / `showSearch`. |
| `BreakpointDirective` | `BreakpointObserver.observe(...)` is a stream → `toSignal` → effect creates/destroys the embedded view. |
| Auth interceptor `catchError` | HTTP pipeline is Observable; stale-token logic lives in that pipe. |

**Concrete: profile as Observable, identity as signal**

```typescript
// auth.service.ts (simplified)
private readonly userDataState = signal<UserData | undefined>(undefined);
private readonly userData$ = toObservable(this.userDataState); // AO-style bridge
private profile$: Observable<CheckoutProfile | undefined> | undefined;

profile(): Observable<CheckoutProfile | undefined> {
  if (!this.profile$) {
    this.profile$ = this.http.get<CheckoutProfile>('/api/auth/profile').pipe(
      catchError(() => of(undefined)),  // required before any toSignal consumer
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
  return this.profile$;
}
```

Why not make profile a signal too?

- Profile is **fetched**, can fail, and is shared across features. `shareReplay` is the right cache primitive.
- Identity is **always known synchronously** after hydrate/store (from JWT). A signal is the right read model for “signed in?”.
- Shell still uses AO’s `getUserData(): Observable` → `toSignal` at the consumer (`ShopShellBaseDirective`), so either style of consumer works without rewriting AuthService.

**Concrete: the cart quote bridge (signals → Observable HTTP → signal)**

This is the clearest “use both” example in the repo:

```typescript
// cart.service.ts
private readonly quote = toSignal(
  toObservable(
    computed(() => ({
      delivery: this.delivery(),
      lines: this.lines().map((line) => ({ sku: line.sku, qty: line.qty, detail: line.detail })),
    })),
  ).pipe(
    switchMap((body) =>
      this.http.post<CartQuote>('/api/cart/quote', body).pipe(catchError(() => of(emptyCartQuote))),
    ),
  ),
  { initialValue: emptyCartQuote },
);
```

1. **Signal/computed** — “what would we quote right now?” (sync).
2. **`toObservable`** — turn that into a stream of quote requests as the bag changes.
3. **`switchMap` + HTTP** — cancel the previous in-flight quote when the bag changes again (Observable strength).
4. **`toSignal`** — present the latest quote to the UI as `quote()`, then `subtotalLabel` / `totalLabel` as `computed`.

Doing this as pure signals would mean manually calling `http.post` inside an `effect` (easy to double-fire, harder to cancel). Doing it as pure Observables would mean `combineLatest` of every contact/line field. The bridge is intentional.

**Concrete: checkout form ↔ cart**

- Form → cart: `valueChanges` (Observable) → `cart.setContact(...)` (signals).
- Cart → form: `effect` reads `cart.email()` etc. and `fill()`s pristine controls (including clearing to `''` when prefill is turned off).
- Dirty fields are not overwritten — so typing wins over prefill.

That split exists because Reactive Forms are Observable-native, while cart state is signal-native.

#### Decision cheat-sheet for new code

| Question | Prefer |
| --- | --- |
| Is this “the current value the template should show?” | `signal` / `computed` |
| Is this “something that arrives later / can be cancelled / shared?” | `Observable` (+ `catchError` if it can fail) |
| Do I need both? | Own state as signal; HTTP as Observable; bridge with `toSignal`/`toObservable` |
| Am I tempted to `effect(() => x.set(...))` to keep two signals in sync? | Stop — use `computed` for the derived one |
| Am I tempted to put bag/email in NgRx? | No — `CartService` / `AuthService` are enough |

#### Why not “everything Observable”

A pure-Rx cart would look like `combineLatest([bag$, delivery$, email$, street$, …])` feeding templates via `async` pipe everywhere. We tried the mental model against checkout: too many fields, too much derived display state, and OnPush + signals already give fine-grained updates. Observables stay where **time and cancellation** matter.

#### Why not NgRx

One team, one shop, two root services that *are* the store (`AuthService`, `CartService`, `CatalogService`). Actions/reducers/effects would add ceremony without multi-team store boundaries or time-travel debugging requirements.

### 4.6 Reactive forms

Checkout, sign-in, register, and profile use Angular Reactive Forms (`FormGroup` / `FormControl`), not template-driven forms.

**Why**

- Validation and submit gates are explicit (`submitted` signal + `markAllAsTouched`).
- SA mobile validation can live in a shared validator (`forms/sa-mobile.validator.ts`).
- Checkout syncs form → cart via `valueChanges`, and cart → form via a careful `fill` that respects dirty fields so typing is not overwritten by profile prefill.

### 4.7 Styling rules (enforced by convention)

- Tailwind only — no new SCSS/CSS feature files, no inline styles.
- Prefer project/canonical utilities (`min-w-180`, `z-70`) over arbitrary values when a scale token exists.
- Do not combine static `class=""` with `[class]="expr"`; use `[ngClass]` so Angular merges classes.
- Shell layout uses `flex min-h-screen flex-col` with a `flex-1` main region so footers sit at the bottom on short pages (mobile and desktop).

---

## 5. Auth practices (frontend and backend)

### 5.1 JWT bearer tokens

After sign-in/register, the API returns a JWT. The SPA stores the **opaque token** in `sessionStorage` (`veld-token`) via `SessionStoreService`.

**Why sessionStorage, not localStorage**

- Closing the tab ends the session — better default for a shared/family PC than a long-lived localStorage token.
- Tab-scoped bag + auth match “this shopping session”.

**Why not put PII in sessionStorage**

Identity (`name`, `email`, `phone`, `role`) is read from JWT claims into an in-memory `userData` signal (`jwt-claims.ts`). Legacy keys (`veld-name`, etc.) are scrubbed. That reduces accidental XSS exfiltration of profile copies and matches the “AO-style userData in memory” approach used elsewhere in the org.

### 5.2 `AuthService` responsibilities

The frontend `AuthService` owns:

- Sign-in / register / password reset calls
- Token hydrate on startup
- In-memory `userData`
- Profile GET/PUT (with cache via `shareReplay`)
- `clearSession` / `signOut`

Guards (`authGuard`, `adminGuard`) and the HTTP interceptor read the token through `SessionStoreService` / claim helpers — thin and testable.

### 5.3 HTTP interceptor (`auth.interceptor.ts`)

Exact behaviour we rely on:

1. **Attach bearer** from `SessionStoreService.getToken()` for normal `/api/*` calls.
2. **Skip bearer** on `/api/auth/sign-in|register|forgot-password|reset-password` — anonymous forms; also means a leftover token cannot confuse logging.
3. **On 401** (or **403** to `/api/admin`): call `auth.clearSession()` and navigate to `/sign-in` with `returnUrl` — **unless** the failure is stale:

```typescript
const staleAuthFailure =
  !!sentBearer && (!currentToken || sentBearer !== `Bearer ${currentToken}`);
```

**Why stale detection exists (real bug we hit)**

Sequence without it:

1. Old/invalid token still in storage → cart fires `GET /profile` → 401 in flight.
2. User signs in successfully → new token stored, navigate to `/admin`.
3. Late 401 handler runs → `clearSession()` → user dumped back on sign-in.

Comparing the bearer that *was sent* to the token *now* in storage ignores that late failure. Sign-in stays sticky.

**Why clear session before sign-in/register**

`AuthService.submit()` calls `clearSession()` first so:

- `profile$` cache is dropped (`profile$ = undefined`),
- `userData` is cleared,
- a half-dead session cannot leave the shell showing the previous name while login runs.

### 5.4 Roles

Two roles: `Customer` and `Admin`. Admin UI is gated by `adminGuard` (JWT role claim) and by `[Authorize(Roles = "Admin")]` on the API. The SPA also refuses to treat a non-admin as admin when `returnUrl` targets `/admin`. Defence in depth: UI hide ≠ security; the API enforces.

### 5.5 Password reset (end-to-end specifics)

Backend (`AuthService.RequestPasswordReset`):

1. Always prepare the same generic success message (whether or not the email exists).
2. If the user exists: generate raw token → store **SHA-256 hex** in `PasswordResetTokenHash`, set `PasswordResetExpiresAt`, save.
3. Build link from `App:PublicUrl` ?? `PayFast:ReturnBase` ?? localhost.
4. `IEmailSender.SendPasswordReset(...)` with idempotency key `pwd-reset-{hash}`.
5. In Development only, also return `resetLink` on `MessageModel` so local testing works without mail.

Confirm path looks up by **hash**, checks expiry, sets new `PasswordHash`, clears reset fields.

Frontend: forgot/reset screens call `requestPasswordReset` / `confirmPasswordReset`; they bind `busy` / `error` / `notice` signals — no profile cache involved.

### 5.6 Profile vs identity

| Concern | Source |
| --- | --- |
| Am I signed in? Who am I? | JWT → `userData` |
| Address / delivery / prefill preference | `GET /api/auth/profile` |
| Checkout fields | Cart contact signals; optionally filled from profile when `prefillCheckout` is true |

Turning **off** prefill clears checkout fields but keeps the saved profile so “Use saved details” still works. That matches the product copy on the account page.

### 5.7 Cart and sign-out

The bag is client-side (`sessionStorage`). On sign-out we **stash** the bag keyed by email and clear the active bag so the next person on the same tab does not inherit it. On sign-in we restore that user’s stash (guest lines are kept if there was no stash). There is no server-side cart yet — acceptable for this catalogue size; revisit if we need cross-device bags.

---

## 6. Backend layout — Auth and the service pattern (code-level)

### 6.1 Layers (what each folder is for)

```
Controllers/          HTTP only: auth attributes, rate limits, claim extraction, ShopResults
Contracts/            JSON request/response records the SPA actually consumes (*Model, *Request)
Services/{Domain}/    I*Service + *Service — one use case ≈ one method
Models/               EF entities (ShopUser, ShopOrder, …) — not returned from controllers
Data/                 ShopDbContext, migrations, seed
```

Auth as a worked example:

```
Controllers/AuthController.cs
        │  injects IAuthService; no DbContext
        ▼
Services/Auth/IAuthService.cs     port: Register, SignIn, RequestPasswordReset, …
Services/Auth/AuthService.cs      rules + orchestration
        ├── TokenService          Create(ShopUser) → JWT string
        ├── IEmailSender          SendPasswordReset(…)
        ├── PasswordBox           Hash / Verify (ShopSupport.cs)
        └── ShopDbContext         Users table
```

**Why three “model” shapes (contract vs entity vs FE interface)**

| Shape | File | Role |
| --- | --- | --- |
| `ShopUser` entity | `Models/ShopEntities.cs` | Columns, hashes, reset token fields — persistence |
| `AuthModel` / `CheckoutProfileModel` | `Contracts/ShopContracts.cs` | Wire JSON — what Angular types against |
| `AuthSession` / `CheckoutProfile` | `EcommWebApp/.../models/auth.model.ts` | FE TypeScript mirror of the wire JSON |

Controllers never return `ShopUser`. That keeps password hashes and reset hashes off the wire by construction, and lets us rename columns without silently changing the public API.

### 6.2 Why `IAuthService` + `AuthService` (specifics)

`AuthController` is intentionally boring:

```csharp
[EnableRateLimiting("auth")]
[HttpPost("sign-in")]
public async Task<ActionResult<AuthModel>> SignIn(SignInRequest request) =>
    ShopResults.From(await auth.SignIn(request));

[Authorize]
[HttpGet("profile")]
public async Task<ActionResult<CheckoutProfileModel>> Profile()
{
    var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
    return ShopResults.From(await auth.Profile(email));
}
```

What lives in the **service**, not the controller:

| Concern | Where | Why |
| --- | --- | --- |
| Normalise email, validate password length | `AuthService.Register` / `SignIn` | Reusable if we add another entry point later |
| `PasswordBox.Hash` / `Verify` | `AuthService` | Controllers must not know hashing |
| Issue JWT | `TokenService.Create(user)` called from `Session(user)` | One place for claim set (email, name, phone, role) |
| Generic forgot-password response + hash storage + email send | `RequestPasswordReset` | Controller stays one-liners; timing-safe messaging stays in one method |
| Map user (+ last order fallback) → `CheckoutProfileModel` | `MapProfile` | Profile shape is a use-case concern, not MVC |

**Why an interface even with one implementation**

- Same registration style as `IOrderService`, `IProductService`, `ICartService`, `IShopService` — auth is not special.
- Controllers depend on the port; tests can substitute a fake without `WebApplicationFactory` for every rule.
- Email already swaps (`IEmailSender`). Auth is the next likely swap (mock users, external IdP). The interface is cheap insurance.

**Why not MediatR / CQRS here**

`SignIn`, `Register`, `Profile` are short methods on one class. A `SignInCommand` + handler + pipeline behaviours would multiply files without a second team owning “auth commands”. If `AuthService` grows past a readable size, *then* split by feature — not before.

**Why profile takes `email` from the controller**

```csharp
var email = User.FindFirstValue(ClaimTypes.Email) ?? "";
return ShopResults.From(await auth.Profile(email));
```

The service does not read `HttpContext`. It receives the authenticated identity as data. That keeps auth use cases callable from tests and avoids hiding “who is this?” inside infrastructure.

Compare `OrdersController.Mine`: same pattern — extract email from claims, call `orders.ListForEmail(email)`. Admin uses `[Authorize(Roles = "Admin")]` on the whole `AdminController` instead of passing role into every method.

### 6.3 `ShopOutcome<T>` — expected failures vs exceptions

```csharp
public static ShopOutcome<T> Ok(T value) => …;
public static ShopOutcome<T> BadRequest(string message) => …;  // 400
public static ShopOutcome<T> Unauthorized(string message) => …; // 401
public static ShopOutcome<T> Conflict(string message) => …;     // 409
```

`ShopResults.From` maps that to `OkObjectResult` or `ObjectResult` + `MessageModel`.

**When we return `ShopOutcome` (business / client mistakes)**

- Wrong password → `Unauthorized("Email or password does not match.")` — not an exception.
- Duplicate email on register → `Conflict(...)`.
- Empty bag / insufficient stock on `OrderService.Create` → `BadRequest(...)`.
- Invalid/expired reset token → `BadRequest(...)`.

**When we still throw**

- Resend hard failure after a real send attempt (`ResendEmailSender` throws if `!response.Success`) — ops should see it; the request should not look like “email sent”.
- Missing `Jwt:Key` at startup — fail fast so we never issue unsigned tokens.

**Why this split**

Wrong password is a normal branch in the use case. DB connection death is not. Controllers stay `return ShopResults.From(...)` for both auth and orders (`Create`, `Ship`, …) so status codes stay consistent and the SPA’s `apiMessage()` helper can read `{ message }` bodies uniformly.

### 6.4 Domain helpers in `ShopSupport.cs` (not random statics)

| Helper | Job |
| --- | --- |
| `ShopMoney` | Cents ↔ rand display, courier fee constant, low-stock threshold — **one place** money formatting lives |
| `PasswordBox` | Hash/verify passwords — used only by auth |
| `OrderMapper` | `ShopOrder` / `ShopProduct` → `OrderModel` / `ProductModel` for the wire |

**Why mappers are not AutoMapper profiles (here)**

Mapping is small, explicit, and often includes derived fields (`Tone`, `FulfilmentNote`, paid detail strings). Hand-written `OrderMapper.Order(order)` is easier to review than convention-based profiles for this size. If mappings explode, that is when AutoMapper earns its keep.

**Why money is always cents on the server**

`OrderService.Create` computes `TotalCents` from DB `PriceCents * qty + courier`. `CartService.Quote` does the same for display. The SPA shows `subtotal` / `total` **labels** from the quote response; it does not decide payable amount. That is a deliberate anti-tamper boundary.

### 6.5 Email abstraction (wired in `Program.cs`)

```
IEmailSender
  ├── ResendEmailSender     if Resend:ApiKey / RESEND_API_KEY present
  └── LoggingEmailSender    otherwise (logs reset link)
```

Startup logs which sender is active. Local = user secrets; UAT = Azure `Resend__ApiKey`. Missing key on UAT is the usual reason “forgot password works locally but not on Azure”.

Idempotency keys on send (`pwd-reset-{hash}`) reduce duplicate sends if the client retries.

### 6.6 Auth HTTP surface — why each attribute

| Endpoint | Attributes | Reasoning |
| --- | --- | --- |
| `POST sign-in` / `register` / `forgot-password` / `reset-password` | `[EnableRateLimiting("auth")]`, anonymous | Slow brute force; no JWT required |
| `GET/PUT profile` | `[Authorize]` | Must be a real user; email from claims |
| Entire `AdminController` | `[Authorize(Roles = "Admin")]` | One gate for stock/sales/pack/ship |
| `POST /api/orders` | `[EnableRateLimiting("checkout")]`, anonymous-capable | Checkout spam protection; payment still validated later via PayFast |
| `GET /api/orders/mine` | `[Authorize]` | Orders filtered by claim email — never trust a body email alone |

### 6.7 Local vs PayFast checkout (OrderService)

After creating the order, `OrderService.Create` chooses mode:

- **Development** without merchant id (or not forced PayFast) → `mode: "local"` so the SPA can complete payment via `/api/payfast/local/{id}` without leaving the machine.
- **Configured merchant** → build PayFast field dictionary + URL; SPA POSTs a form; paid state flips only after signed ITN.

That keeps “I can buy on localhost” and “UAT talks to PayFast sandbox” as configuration, not a fork of the order pipeline.

### 6.8 Same service pattern outside auth

| Service | Examples of use-case methods | Outcome style |
| --- | --- | --- |
| `ICartService` | `Quote` | Always returns a quote model (empty lines OK) |
| `IOrderService` | `Create`, `Ship`, `Complete`, `ListForEmail` | `ShopOutcome` where validation can fail; null → 404 in controller |
| `IProductService` | CRUD + image | `ShopOutcome` on write validation |
| `IAuthService` | Register → Profile | `ShopOutcome` throughout |

Rule of thumb for new backend code: **controller extracts identity and HTTP concerns; service owns rules and persistence; contracts leave the building; entities stay inside.**

---

## 7. Use cases that drove decisions (examples)

| Use case | Decision it drove |
| --- | --- |
| Figma has different mobile/desktop checkout | Feature base + two templates, not one mega-template |
| Admin and customer share one site | Role claim + admin routes/guards + `[Authorize(Roles)]` |
| Shared PC / tab shopping | `sessionStorage` token; clear/stash bag on sign-out |
| Prefill optional at checkout | Profile flag + clear checkout fields when turned off; keep profile for manual apply |
| Password reset without leaking accounts | Generic response; hashed token; rate limits |
| Local without SMTP | Dev may return reset link; logging sender without API key |
| Short content pages on mobile | Shell `flex-col` + `flex-1` so footer sits at bottom |
| Design tokens from Figma | Tailwind utilities + project colour/type classes, no SCSS |
| UAT = one Azure URL | SPA in `wwwroot`; relative `/api`; CORS for local only |
| PayFast must be trusted | Signed ITN; amounts from API; no card data in our DB |

---

## 8. What we consciously deferred / still TODO

Marked in code with `TODO` where actionable. Deferred items are intentional postponements.

| Item | Status | Where |
| --- | --- | --- |
| Azure `Resend__ApiKey` on UAT | TODO (ops) | `Program.cs` fallback sender; App Service settings |
| Verified Resend sending domain | TODO | `appsettings.json` `Resend:From` |
| PayFast merchant credentials on UAT | TODO | `appsettings.json` / Azure; `OrderService.Create` |
| Order confirmation / receipt emails | TODO | `IEmailSender` |
| Footer Help pages (Delivery / Returns / Contact) | TODO | `shop-shell-desktop.component.html` |
| Production App Service deploy | TODO | `.github/workflows/shop.yml` |
| Server-side cart | Deferred | Session bag is enough for ~50 SKUs / single-device |
| NgRx / micro-frontends / BFF / MediatR | Deferred | Premature for one team and one API |
| Firearms/ammunition licensed checkout | Deferred | Explicitly out of normal add-to-cart (see root README) |

---

## 9. How to extend without fighting the architecture

1. **New screen** — Add a feature folder with container + base + desktop/mobile; register the route; reuse `ecomm-*` controls.
2. **New API capability** — Add contract records, `IFooService` + `FooService`, thin controller, EF entity/migration if persisted.
3. **New shared widget** — Prefer `ecomm-components` if it is presentational; keep services in the app.
4. **New auth-sensitive action** — Enforce on the API with `[Authorize]` / roles first; then hide in the UI.
5. **New derived UI state** — Prefer `computed` from existing signals; do not `effect` to “fix” another signal.

---

## 10. File map — “where do I look?”

| If you need to understand… | Start here |
| --- | --- |
| Signal vs Observable mix | `cart.service.ts` (quote bridge), `auth.service.ts` (userData signal + profile$) |
| Shell nav reacting to auth + route | `shop-shell-base.directive.ts` |
| Stale 401 after login | `auth.interceptor.ts` |
| JWT → memory identity | `jwt-claims.ts`, `AuthService.store` / `hydrateFromToken` |
| Checkout ↔ cart sync | `checkout-base.directive.ts` + `CartService` |
| Prefill on/off | `account-profile-base.directive.ts`, `CartService.clearCheckoutFields` |
| Auth use cases | `Services/Auth/AuthService.cs`, `IAuthService.cs`, `AuthController.cs` |
| Business failure → HTTP status | `ShopOutcome.cs`, `ShopResults.cs` |
| Money / order wire shape | `ShopSupport.cs` (`ShopMoney`, `OrderMapper`), `OrderService.Create` |
| Quote authority | `Services/Cart/CartService.cs` + FE `CartService.quote` |

---

## 11. Summary

The codebase is intentionally conventional: **Angular signals for current UI state**, **Observables for HTTP/time**, **ASP.NET use-case services behind interfaces**, **contracts out / entities in**, **SQL for truth**, **Tailwind for Figma fidelity**, **JWT for session**, **PayFast for money movement**, **Resend for mail**.

The specifics above are not style preferences for their own sake — each one maps to a bug we avoided (stale 401 wiping login, client-side price tampering, prefill leaving checkout dirty, UAT silent log-only email) or a cost we refused (NgRx, MediatR, BFF, one mega responsive template).

When a new idea appears, the question is: *does this earn its complexity for a small SA hunting-gear shop, and does it follow the signal/HTTP or controller/service split we already use?* If not, keep the thinner path.
