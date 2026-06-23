# Design System & Onboarding Guide

A practical cheat sheet for new developers. It covers the three things you touch
every day in this project: **colors**, **text & localization**, and the
**reusable components** in `src/app/shared/components/`.

The golden rule: **don't hardcode.** Style with the semantic Tailwind classes and
design tokens described here, write user-facing text through the translation
system, and reuse the shared components instead of rebuilding them. Do that and
you get light/dark mode, RTL, and a consistent look for free.

> Stack: Angular 21 (standalone components, signals) + Tailwind CSS v4
> (CSS-based config). Tokens live in [`src/styles.css`](../src/styles.css).

---

## 1. Colors

### How it works

Colors are defined once as CSS variables in [`src/styles.css`](../src/styles.css)
and exposed to Tailwind as `--color-*` aliases under the `@theme` block. You never
write a hex value in a component — you use the Tailwind class that maps to a token.

There are two layers:

1. **Raw palette** — `--Surface-*` and `--app-*` variables, defined twice: once in
   `:root` (light mode) and once in `.dark` (dark mode).
2. **Semantic aliases** — `--color-*` in `@theme`, which is what generates the
   Tailwind utility classes (`bg-primary`, `text-body`, `border-card-border`, …).

Because the raw palette is redefined under `.dark`, **using a semantic class gives
you dark mode automatically.** Don't reach for `bg-white` / `text-black` / hex —
those won't adapt.

### Everyday color classes

| Purpose | Class | Token |
| --- | --- | --- |
| Brand / primary action | `bg-primary`, `text-primary` | green `#00A63E` |
| Warning action | `bg-warning` | orange |
| Danger / destructive | `bg-danger` | red |
| Page background | `bg-page-bg` | screen surface |
| Card / elevated panel | `bg-panel` | elevated surface |
| Hover background | `bg-hover` | — |
| Selected row/item | `bg-selected` | blue tint |
| Primary body text | `text-body` | road-line |
| Secondary text | `text-body-soft` / `text-muted` | — |
| Placeholder / disabled text | `text-muted-light` | — |
| Card border | `border-card-border` | — |
| Divider line | `border-divider` | — |
| Focus ring | `ring-focus-ring` | blue glow |

### Status colors (trips / hotels)

Each status has a paired foreground + background token:

```html
<span class="text-status-completed bg-status-completed-bg">Completed</span>
<span class="text-status-active    bg-status-active-bg">Active</span>
<span class="text-status-scheduled bg-status-scheduled-bg">Scheduled</span>
<span class="text-status-cancelled bg-status-cancelled-bg">Cancelled</span>
```

> For simple status pills, prefer the [`<app-badge>`](#app-badge) component over
> hand-rolling these classes.

### ✅ Do / ❌ Don't

```html
<!-- ✅ semantic token: adapts to dark mode -->
<div class="bg-panel text-body border border-card-border">…</div>

<!-- ❌ hardcoded: breaks dark mode and consistency -->
<div class="bg-[#FFFFFF] text-[#223548] border-[#E1E7EF]">…</div>
```

### Dark mode

Dark mode is toggled by adding the `.dark` class on a root element (the
[`LanguageService`](../src/app/core/services/language.service.ts) /
theme-toggle handles this). You usually don't manage it manually — just keep
using semantic classes and both themes work.

### Adding a new color token

1. Add the raw variable in **both** `:root` and `.dark` in `src/styles.css`
   (so light and dark both resolve).
2. Add a `--color-yourname: var(--your-raw-var);` alias inside the `@theme` block.
3. Use it anywhere as `bg-yourname`, `text-yourname`, `border-yourname`, etc.

---

## 2. Text & Typography

### Font & sizes

The app font is **Poppins** (`--font-sans`). Use Tailwind's text-size utilities;
two custom sizes are added for dense UI:

| Class | Size | Use |
| --- | --- | --- |
| `text-2xs` | 0.6875rem | tiny labels |
| `text-cell` | 0.8125rem | table cells, compact rows |
| `text-xs` … `text-2xl` | Tailwind defaults | everything else |

Pair sizes with the semantic **text-color** classes from the table above
(`text-body`, `text-body-soft`, `text-muted`).

```html
<p class="text-cell text-body-soft">Compact secondary text</p>
```

### Localization (every user-facing string)

**All visible text must go through the translation system** — never hardcode a
literal string in a template. The app ships English (`en`), Arabic (`ar`), and
German (`de`).

Use the `translate` pipe with a typed key:

```html
<button>{{ 'nav.signIn' | translate }}</button>
<input [placeholder]="'hotelDetails.searchTrips' | translate" />
```

Keys are defined in
[`src/app/core/i18n/translations.ts`](../src/app/core/i18n/translations.ts) and the
type `TranslationKey` is derived from the English set
(`keyof typeof TRANSLATIONS.en`), so a typo or missing key is a **compile error**.

#### Adding a translation key

Add the **same key to all three languages** in `translations.ts`:

```ts
export const TRANSLATIONS = {
  en: { /* … */ 'hotel.payout': 'Payout' },
  ar: { /* … */ 'hotel.payout': 'الدفع' },
  de: { /* … */ 'hotel.payout': 'Auszahlung' },
};
```

Then use it: `{{ 'hotel.payout' | translate }}`. Adding it to `en` makes the key
type-valid; add `ar` + `de` so it actually renders in those languages.

#### RTL (Arabic)

When the language is Arabic, `LanguageService` sets `dir="rtl"` on `<html>`
automatically. Use **logical** Tailwind utilities (`ps-*`/`pe-*`, `ms-*`/`me-*`,
`start-*`/`end-*`) instead of physical ones (`pl-*`/`pr-*`) so layouts mirror
correctly.

---

## 3. Reusable Components

All shared UI lives in
[`src/app/shared/components/`](../src/app/shared/components/). Every component is a
**standalone** Angular component with a usage example in the JSDoc at the top of
its `.ts` file. Import the component class and drop its selector into your template.

Below is the curated core set. **For anything not listed, browse the folder — each
component documents itself at the top of its `.ts`.**

### `<app-btn>`
Button with variants and an optional loading spinner.
```html
<app-btn (click)="save()">Save</app-btn>
<app-btn type="submit" variant="primary" [loading]="saving()">Save</app-btn>
<app-btn variant="danger" [loading]="deleting()">
  <app-icon name="trash" size="sm" /> Delete
</app-btn>
```
Key inputs: `variant` (`primary` | `secondary` | `danger`), `size` (`sm` | `md` | `lg`), `loading`, `showLoader`.

### `<app-icon>`
Inline SVG icons by name (stroke-based, 24×24).
```html
<app-icon name="search" />
<app-icon name="trash" size="sm" />
```
`name` is typed (`IconName`) — autocomplete shows every available icon. Add new
icons by extending the `IconName` union and `ICON_PATHS` map in
[`icon.component.ts`](../src/app/shared/components/icon/icon.component.ts).

### `<app-card>`
Content card with header / body / footer slots.
```html
<app-card>
  <h3 card-header>Title</h3>
  <p>Body content.</p>
  <div card-footer>Footer actions</div>
</app-card>
```
Key inputs: `variant` (e.g. `elevated`), `padding`.

### `<app-input>`
Labelled input integrated with Angular Signal Forms (label + hint + validation in one wrapper).
```html
<app-input
  label="Name"
  inputId="user-name"
  [field]="fieldTree.name"
  placeholder="Enter name"
/>
```
Supports `type="number"`, `step`, hint text, and error display.

### `<app-select>`
Dropdown, also Signal-Forms integrated.
```html
<app-select
  label="Category"
  inputId="category"
  [field]="fieldTree.category"
  [options]="categories"
  placeholder="Select a category"
/>
```
Key inputs: `options`, `dropdownArrow` (`default` | `custom` | `none`).

### `<app-form-group>`
Form section wrapper (replaces manual `<fieldset>`), optionally collapsible.
```html
<app-form-group legend="Basic Information">
  <app-input … />
  <app-input … />
</app-form-group>
```

### `<app-modal>`
Animated modal driven by an `open` signal; project your content inside.
```html
<app-modal [open]="showModal()" title="Edit Hotel" (close)="showModal.set(false)">
  <p>Modal body…</p>
</app-modal>
```
Key inputs: `open` (required), `title`, `closeOnBackdrop`.

### `<app-confirm-dialog>` (service)
For confirmations, use the **service** instead of wiring modal signals — it returns a `Promise<boolean>`.
```ts
private readonly confirmDialog = inject(ConfirmDialogService);

async onDelete(id: string) {
  const ok = await this.confirmDialog.confirm({
    confirmLabel: 'Delete',
    confirmVariant: 'danger',
  });
  if (ok) this.deleteItem(id);
}
```

### `<app-data-table>`
Tabular data with custom cell templates, sorting, and skeleton loading.
```html
<app-data-table
  [data]="items()"
  [columns]="columns"
  trackByKey="id"
  [loading]="isLoading()"
  ariaLabel="Hotels table"
  (sortChange)="onSort($event)"
>
  <ng-template cellDef="price" let-row>{{ row.price }} CHF</ng-template>
  <ng-template cellDef="actions" let-row>
    <a [routerLink]="[row.id, 'edit']">Edit</a>
  </ng-template>
</app-data-table>
```
Set `sortable: true` on a `ColumnDef` to enable per-column sorting.

### `<app-badge>`
Status pill with color variants.
```html
<app-badge variant="success">Active</app-badge>
<app-badge variant="danger" size="sm">Inactive</app-badge>
```
Variants: `success` | `danger` | `warning` | `info` | `neutral` | `scheduled`.

### `<app-pagination>`
```html
<app-pagination
  [currentPage]="currentPage()"
  [totalItems]="filteredItems().length"
  [pageSize]="pageSize()"
  (pageChange)="currentPage.set($event)"
/>
```

### Toasts (service)
Toasts are triggered via the
[`NotificationStore`](../src/app/core/stores/notification.store.ts) — the global
`<app-toast>` host renders them.
```ts
private readonly notify = inject(NotificationStore);

this.notify.showSuccess('Saved successfully');
this.notify.showError('Something went wrong');
```
Methods: `showSuccess`, `showError`, `showWarning`, `showInfo`, `dismiss(id)`, `clearAll()`.

### Loading states
- `<app-spinner>` — inline loading spinner.
- `<app-skeleton-block>` — placeholder blocks while data loads (see also
  `app-skeleton-form`, `app-skeleton-table`); `<app-data-table>` has built-in
  skeleton rows via `[skeletonRows]`.

### The rest
The folder also includes `accordion`, `avatar`, `breadcrumb`, `checkbox`,
`date-picker`, `dropdown-menu`, `empty-state`, `file-upload`, `image`,
`image-slider`, `map`, `progress-bar`, `radio-group`, `rating`, `search-input`,
`slider`, `stepper`, `switch-toggle`, `tabs`, `tag-input`, `timeline`, and more.
Open the component's `.ts` for its usage example.

---

## 4. Conventions Recap

When building UI in this project:

- **Standalone components**, `ChangeDetectionStrategy.OnPush`, and signals.
- Use `input()` / `output()` functions — not `@Input()` / `@Output()` decorators.
- Use **`class` / `style` bindings**, never `ngClass` / `ngStyle`.
- Use native control flow (`@if`, `@for`, `@switch`) — not `*ngIf` / `*ngFor`.
- Separate `.ts` / `.html` / `.css` files per component (no inline templates/styles).
- **Tokens over hex**, **`translate` pipe over literal strings**, **logical
  spacing utilities** (`ps`/`pe`/`ms`/`me`) for RTL.
- Reuse a shared component before building a new one.

See [`.claude/CLAUDE.md`](../.claude/CLAUDE.md) for the full coding standards.
