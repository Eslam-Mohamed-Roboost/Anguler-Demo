# Architecture & Developer Guide

How this app is put together and how to extend it: folder structure, routing,
creating components and services, calling APIs, state, and a full end-to-end
walkthrough for adding a new feature.

> For **colors, text, and reusable UI components**, see the companion
> [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md). This guide focuses on **app architecture**.

---

## 1. Overview & Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | **Angular 21** — standalone components, **signals**, zoneless change detection |
| Styling | **Tailwind CSS v4** (CSS-based config) + design tokens — see DESIGN_SYSTEM.md |
| HTTP | `HttpClient` (fetch) wrapped by `ApiService`, responses use the **`Result<T>`** pattern |
| Charts | Highcharts (`highcharts-angular`) |
| Realtime | SignalR (`@microsoft/signalr`) via `RealTimeService` |
| i18n | Custom typed translation system (`en` / `ar` / `de`) + `translate` pipe |

**The mental model — how a request flows:**

```
Component (signals)
   │  calls a method on
   ▼
Feature Service  (extends ApiService)
   │  this.get/post/... → Observable<Result<T>>
   ▼
ApiService  → HttpClient → [interceptors: auth → lang → error → loading] → API
   ▲
   │  Result<T> = { isSuccess, data, error, statusCode }
Component subscribes, unwraps data into signals, renders
```

Key idea: **every API response is a `Result<T>`** — a success/failure envelope —
not a bare value. Components decide what to do on `isSuccess` vs `error`.

---

## 2. Folder Structure

```
src/app/
├── core/                     # App-wide singletons — imported by features, never the reverse
│   ├── components/           # App-level components (e.g. default-page)
│   ├── guards/               # Route guards: auth.guard, role.guard, form-dirty.guard
│   ├── i18n/                 # translations.ts (en/ar/de) + TranslationKey type
│   ├── interceptors/         # HTTP interceptors: auth, lang, error, loading, mock
│   ├── models/               # Cross-cutting models (result.model.ts)
│   ├── services/             # Singletons: ApiService, AuthService, ThemeService, …
│   ├── stores/               # Signal stores: notification.store, loading.store
│   └── tokens/               # HttpContext tokens: SKIP_LOADING, SKIP_ERROR_NOTIFICATION
│
├── features/                 # One folder per feature — self-contained
│   └── <feature>/
│       ├── pages/            # Routed, top-level screens (lazy-loaded)
│       ├── components/       # Presentational pieces used by this feature's pages
│       ├── services/         # Feature data services (extend ApiService)
│       ├── models/ | types/  # DTOs and view models for this feature
│       └── <feature>.routes.ts
│
└── shared/                   # Reusable, feature-agnostic building blocks
    ├── components/           # app-btn, app-card, app-modal, … (see DESIGN_SYSTEM.md)
    ├── directives/
    ├── pipes/                # translate.pipe, …
    ├── base/                 # BaseComponent
    └── utils/
```

**Dependency direction:** `features` → `shared` → `core`. Core never imports a
feature; one feature should not import another feature's internals.

**Naming conventions:**

- Components: `name.component.ts` + `name.component.html` + `name.component.css` (all three).
- Services: `name.service.ts`. Routes: `feature.routes.ts`. Guards: `name.guard.ts`.
- **`pages/`** = routed screens. **`components/`** = the parts those screens compose.

---

## 3. Routing & Pages

The root [`app.routes.ts`](../src/app/app.routes.ts) defines top-level routes and
**lazy-loads** each feature. Routes are provided in
[`app.config.ts`](../src/app/app.config.ts) via
`provideRouter(routes, withComponentInputBinding())` — the latter binds route
params straight into component `input()`s.

A typical layout-wrapped, guarded route:

```ts
{
  path: '',
  component: LayoutAdminComponent,         // layout shell (sidebar + navbar)
  children: [
    {
      path: 'dashboard',
      data: { breadcrumb: 'Dashboard', icon: 'dashboard' },
      loadComponent: () =>
        import('./features/admin-dashboard/pages/home/home-component')
          .then((m) => m.HomeComponent),
    },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  ],
}
```

A **feature route file** ([`hotel-details.routes.ts`](../src/app/features/hotel-details/hotel-details.routes.ts)) groups a feature's screens:

```ts
export const HOTEL_DETAILS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/hotel-dashboard/hotel-dashboard.component')
        .then((m) => m.HotelDashboardComponent),
    data: { breadcrumb: 'Hotel Integration' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/hotel-profile/hotel-profile.component')
        .then((m) => m.HotelProfileComponent),
    data: { breadcrumb: 'Hotel Profile' },
  },
];
```

**Guards** are functional (`CanActivateFn`):

- [`authGuard`](../src/app/core/guards/auth.guard.ts) — redirects unauthenticated users.
- [`roleGuard(['admin', 'hotel'])`](../src/app/core/guards/role.guard.ts) — factory that restricts by role.

```ts
{
  path: 'hotel-details',
  canActivate: [authGuard, roleGuard(['admin', 'hotel'])],
  loadChildren: () =>
    import('./features/hotel-details/hotel-details.routes')
      .then((m) => m.HOTEL_DETAILS_ROUTES),
}
```

### Adding a page

1. Create `features/<feature>/pages/<page>/<page>.component.{ts,html,css}`.
2. Add an entry to the feature's `*.routes.ts` with `loadComponent`.
3. Make sure the feature is mounted in `app.routes.ts` (via `loadChildren`), with
   guards and `data.breadcrumb` as needed.

---

## 4. Creating a Component

Every component is **standalone**, uses **`OnPush`**, and lives in three files.
Do **not** set `standalone: true` (it's the default in v20+) and do **not** use
inline `template`/`styles`.

```ts
// driver-card.component.ts
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-driver-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],            // import what the template uses
  host: { class: 'block' },            // host bindings go here, NOT @HostBinding
  templateUrl: './driver-card.component.html',
  styleUrl: './driver-card.component.css',
})
export class DriverCardComponent {
  readonly driver = input.required<Driver>();      // inputs via input()
  readonly select = output<string>();              // outputs via output()

  protected readonly displayName = computed(() =>  // derived state via computed()
    this.driver().name.trim() || 'Unknown',
  );

  onSelect(): void {
    this.select.emit(this.driver().id);
  }
}
```

Rules of thumb:

- Use `inject()` for dependencies, not constructor injection.
- Local state = **signals**; derived state = **`computed()`**; update with `.set()` / `.update()` (never `mutate`).
- Templates use native control flow (`@if`, `@for`, `@switch`) and `class`/`style`
  bindings (never `ngClass`/`ngStyle`, `*ngIf`/`*ngFor`).
- Need RxJS cleanup? Extend [`BaseComponent`](../src/app/shared/base/base.component.ts)
  and pipe `this.takeUntilDestroyed()` (or inject `DestroyRef` + `takeUntilDestroyed`).

---

## 5. Creating a Service

Services are **`providedIn: 'root'`** singletons with a single responsibility.
A plain (non-HTTP) service:

```ts
@Injectable({ providedIn: 'root' })
export class SelectionService {
  private readonly _selected = signal<string[]>([]);
  readonly selected = this._selected.asReadonly();

  toggle(id: string): void {
    this._selected.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }
}
```

For services that talk to the backend, extend `ApiService` — see next section.

---

## 6. Calling an API (the Data Layer)

### `ApiService` — the single HTTP gateway

All HTTP goes through [`ApiService`](../src/app/core/services/api.service.ts). It
wraps `HttpClient`, prefixes `environment.apiUrl`, and types every response as
`Result<T>`:

```ts
get<T>(path, params?, context?): Observable<Result<T>>
post<T>(path, body, context?): Observable<Result<T>>
put<T>(path, body, context?): Observable<Result<T>>
patch<T>(path, body, context?): Observable<Result<T>>
delete<T>(path, context?): Observable<Result<T>>
```

There is also [`AdminApiService`](../src/app/core/services/admin-api.service.ts)
(same shape, prefixes `environment.adminApiUrl`) for admin endpoints.

### The `Result<T>` envelope

Defined in [`result.model.ts`](../src/app/core/models/result.model.ts):

```ts
interface ApiResponse<T> {
  isSuccess: boolean;
  data: T | null;
  error: ApiError | null;   // { code, description, type }
  statusCode: number;
}
export type Result<T> = ApiResponse<T>;
```

Type guards `isSuccess(result)` / `isFailure(result)` narrow the type, and
[`ResultHandlerService`](../src/app/core/services/result-handler.service.ts)
offers `unwrapData$()`, `unwrapDataOrNull$()`, and `handleResult()` helpers when
you just want the inner `T`.

### A feature service

Extend `ApiService` and call `this.get/post/...` with typed paths
(pattern from [`hotel-details.service.ts`](../src/app/features/hotel-details/services/hotel-details.service.ts)):

```ts
@Injectable({ providedIn: 'root' })
export class DriversService extends ApiService {
  getDrivers(page: number, pageSize: number, search?: string): Observable<Result<DriversResponse>> {
    let params = new HttpParams().set('pageNumber', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    return this.get<DriversResponse>('/drivers', params);
  }

  getDriver(id: string): Observable<Result<Driver>> {
    return this.get<Driver>(`/drivers/${id}`);
  }

  updateDriver(id: string, body: DriverUpdate): Observable<Result<Driver>> {
    return this.put<Driver>(`/drivers/${id}`, body);
  }
}
```

### Interceptors — cross-cutting HTTP behavior

Registered in [`app.config.ts`](../src/app/app.config.ts) in this order:

```ts
withInterceptors([authInterceptor, langInterceptor, errorInterceptor, loadingInterceptor])
```

- **auth** — attaches the bearer token for our API URLs.
- **lang** — adds the current language header.
- **error** — on HTTP error, shows a toast via `NotificationStore` (centralized error UX).
- **loading** — drives the global loading indicator.

You usually **don't handle HTTP errors in components** — the error interceptor
already surfaces them. Opt out per-request with `HttpContext` tokens:

- `SKIP_LOADING` — don't trigger the global spinner (e.g. background polling).
- `SKIP_ERROR_NOTIFICATION` — suppress the automatic error toast (handle it yourself).

```ts
this.get<HotelTripsResponse>('/hotels/trips', params,
  new HttpContext().set(SKIP_LOADING, true));
```

---

## 7. Consuming Data in a Component

Inject the service, drive UI from **signals**, and tie subscriptions to the
component lifetime with `takeUntilDestroyed` (pattern from
[`hotel-dashboard.component.ts`](../src/app/features/hotel-details/pages/hotel-dashboard/hotel-dashboard.component.ts)):

```ts
export class DriversListComponent {
  private readonly driversService = inject(DriversService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notify = inject(NotificationStore);

  readonly loading = signal(false);
  readonly drivers = signal<Driver[]>([]);

  loadDrivers(): void {
    this.loading.set(true);
    this.driversService.getDrivers(1, 20)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (result.isSuccess && result.data) {
            this.drivers.set(result.data.items);
          }
          this.loading.set(false);
        },
        error: () => this.loading.set(false),  // toast already shown by error interceptor
      });
  }
}
```

**Debounced search** (common in tables) uses a `Subject` +
`debounceTime`/`distinctUntilChanged`/`switchMap` — see the hotel dashboard for a
full example. **User feedback** (success/error messages) goes through
[`NotificationStore`](../src/app/core/stores/notification.store.ts):
`this.notify.showSuccess('Saved')`.

---

## 8. State Management

- **Component-local state:** `signal()`; derived values: `computed()`. Mutate with
  `.set()` / `.update()` only.
- **Shared/app state:** signal-based **stores** in `core/stores/`:
  - `NotificationStore` — toasts (`showSuccess` / `showError` / `showWarning` / `showInfo`).
  - `LoadingStore` — global loading flag (driven by the loading interceptor).
- Keep transformations pure; expose read-only signals (`asReadonly()`) from services/stores.

---

## 9. Styling & i18n (quick links)

- **Styling** — use the design tokens (`bg-panel`, `text-body`, `border-card-border`,
  status colors) and shared components. Full reference: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- **Text** — never hardcode user-facing strings. Use the `translate` pipe with a
  typed key and add the key to all three languages in
  [`translations.ts`](../src/app/core/i18n/translations.ts):

  ```html
  <h1>{{ 'drivers.title' | translate }}</h1>
  ```

- **Theme** — light/dark is handled by
  [`ThemeService`](../src/app/core/services/theme.service.ts) (`isDark()` signal,
  toggles `.dark` on `<html>`). Use semantic classes and dark mode works automatically.

---

## 10. End-to-End Walkthrough: Add a "Drivers" Feature

A complete example that ties everything together.

**1. Create the folder structure**

A feature is a self-contained folder. Here is a fuller example with each part
annotated by what it does:

```
src/app/features/drivers/
├── drivers.routes.ts                       # the feature's route table (lazy entry point)
│
├── pages/                                  # routed SCREENS — orchestrate data + layout
│   ├── drivers-list/
│   │   └── drivers-list.component.{ts,html,css}
│   └── driver-detail/
│       └── driver-detail.component.{ts,html,css}
│
├── components/                             # PRESENTATIONAL pieces used by the pages
│   ├── driver-card/
│   │   └── driver-card.component.{ts,html,css}
│   └── driver-filters/
│       └── driver-filters.component.{ts,html,css}
│
├── services/                              # DATA ACCESS — the only place that calls the API
│   └── drivers.service.ts                  # extends ApiService → Observable<Result<T>>
│
├── models/                                # SERVER CONTRACT — DTOs, request/response shapes
│   └── driver.model.ts
│
└── types/                                 # UI-ONLY types / view models (optional)
    └── driver.types.ts
```

**What each part is responsible for:**

| Part | Owns / responsible for | Must NOT do | Example |
| --- | --- | --- | --- |
| `drivers.routes.ts` | The feature's `Routes` array; lazy `loadComponent` entries; per-route `data` (breadcrumb/icon). It's the single entry point mounted from `app.routes.ts`. | Contain UI or business logic. | `export const DRIVERS_ROUTES: Routes = [...]` |
| `pages/` | **Routed screens.** Orchestrate: inject services, hold page state in signals, call the API, handle loading/empty/error, and compose components. | Be reused as a child of another component; talk to `HttpClient` directly. | `DriversListComponent` loads drivers and renders a list. |
| `components/` | **Presentational building blocks.** Receive data via `input()`, emit events via `output()`. Dumb and reusable within the feature. | Inject data services or fetch data; know about routing. | `DriverCardComponent` shows one driver, emits `select`. |
| `services/` | **All data access for the feature.** Extend `ApiService`, expose methods returning `Observable<Result<T>>`, build params, map DTOs. The *only* layer that talks to the backend. | Touch the DOM or hold UI state. | `DriversService.getDrivers(page, size)` |
| `models/` | **The server contract** — DTOs and request/response interfaces that mirror the API. | Contain UI-shaped or computed display fields. | `Driver`, `DriversResponse`, `DriverUpdate` |
| `types/` | **UI-only types / view models** — shapes the templates consume after mapping from DTOs. Optional; omit if models suffice. | Be sent to the API as-is. | `DriverRow` (flattened for a table) |

**Rules of thumb:**

- `pages/` orchestrate; `components/` are presentational (inputs/outputs only).
- `services/` are the **only** place that talks to the API — components and pages
  never call `HttpClient`.
- `models/` = the server contract (DTOs); `types/` = UI-shaped data. Don't leak one
  into the other — map between them in the service or page.
- A feature **never imports another feature's internals.** Share via `shared/`
  (UI/pipes) or `core/` (services/state).

**2. Define models** — `models/driver.model.ts`

```ts
export interface Driver {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

export interface DriversResponse {
  items: Driver[];
  totalCount: number;
}

export interface DriverUpdate {
  name: string;
  phone: string;
}
```

**3. Create the API service** — `services/drivers.service.ts` (extends `ApiService`, as in §6).

**4. Build the page component** — `pages/drivers-list/drivers-list.component.ts`
(inject the service, load into signals, render with `@for`, as in §7). Compose
`app-driver-card` and shared components (`app-card`, `app-data-table`, `app-pagination`).

**5. Declare feature routes** — `drivers.routes.ts`

```ts
import { Routes } from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/drivers-list/drivers-list.component')
        .then((m) => m.DriversListComponent),
    data: { breadcrumb: 'Drivers' },
  },
];
```

**6. Mount the feature in `app.routes.ts`** (inside the layout, with guards)

```ts
{
  path: 'drivers',
  canActivate: [authGuard, roleGuard(['admin'])],
  loadChildren: () =>
    import('./features/drivers/drivers.routes').then((m) => m.DRIVERS_ROUTES),
}
```

**7. Add translations** — add `drivers.title`, `drivers.search`, etc. to `en`,
`ar`, and `de` in `translations.ts`.

**8. Style with tokens** — in the templates use `bg-panel`, `text-body`,
`border-card-border`, status colors, and `translate` — never hex or hardcoded
strings (see DESIGN_SYSTEM.md).

**9. Verify** — `npx ng build` (no broken imports / template errors), then click
through the new route.

---

## 11. Conventions Recap & New-Feature Checklist

**Always:**

- Standalone components, `ChangeDetectionStrategy.OnPush`, signals.
- `inject()`, `input()` / `output()` — not decorators.
- Native control flow (`@if`/`@for`/`@switch`); `class`/`style` bindings.
- Three files per component; no inline templates/styles.
- All HTTP through `ApiService` / a feature service returning `Result<T>`.
- Let the **error interceptor** handle error toasts; use tokens to opt out.
- Design tokens over hex; `translate` pipe over literal strings.

**New-feature checklist:**

- [ ] `features/<feature>/` with `pages/`, `components/`, `services/`, `models/`.
- [ ] Service extends `ApiService`, methods return `Observable<Result<T>>`.
- [ ] `*.routes.ts` with `loadComponent`, mounted in `app.routes.ts` with guards.
- [ ] Page drives UI from signals; subscriptions use `takeUntilDestroyed`.
- [ ] Translation keys added to `en` / `ar` / `de`.
- [ ] Styled with design tokens; dark mode verified.
- [ ] `npx ng build` passes.

See [`.claude/CLAUDE.md`](../.claude/CLAUDE.md) for the full coding standards and
[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the visual system.
