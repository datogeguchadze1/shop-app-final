# LUXE Shop — Angular 21 E-Commerce App

A fully-featured, modern e-commerce application built with Angular 21 (standalone components), SCSS, RxJS, and Angular Signals.

---

## Tech Stack

- **Angular 21** — Standalone components, no NgModules
- **TypeScript** — Strict mode
- **Angular Router** — Lazy-loaded routes
- **RxJS** — Reactive data streams
- **Angular Signals** — Reactive state management
- **SCSS** — Dark purple design system

---

## Features

| Feature | Description |
|---|---|
| Auth | Login & Register with JWT stored in localStorage |
| Products | List, search, filter by category & price, detail page |
| Cart | Add, remove, edit quantity, checkout |
| Favorites | Add/remove favorites |
| Reviews | Add, edit, delete product reviews |
| Profile | View/edit info, change password, delete account |

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         auth.guard.ts
│   │   ├── interceptors/   auth.interceptor.ts
│   │   ├── models/         index.ts
│   │   └── services/       auth | cart | category | favorites
│   │                       product | review | user
│   ├── features/
│   │   ├── auth/           login | register
│   │   ├── cart/
│   │   ├── favorites/
│   │   ├── home/
│   │   ├── products/       product-list | product-detail
│   │   └── profile/
│   └── shared/
│       └── components/     navbar | footer | product-card
│                           loader | modal
├── environments/
│   └── environment.ts
└── styles.scss             Global design tokens + resets
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
npm install
npx ng serve
```

Open **http://localhost:4200**

### Build for Production

```bash
npx ng build
```

---

## API Configuration

All settings live in `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'https://shopapi.stepacademy.ge/api',
  token: '<your-jwt-token>',
  apiKey: '<your-api-key>'
};
```

The `AuthInterceptor` automatically attaches:
- `Authorization: Bearer <token>`
- `x-api-key: <apiKey>`

to every outgoing HTTP request.

---

## Design System

| Token | Value |
|---|---|
| `--bg` | `#080610` |
| `--surface` | `#110f1e` |
| `--accent` | `#8b5cf6` (purple) |
| `--text` | `#f0ecff` |
| `--text-muted` | `#8b84a8` |

Fonts: **Cormorant Garamond** (headings) + **DM Sans** (body)

---

## Routes

| Path | Component | Guard |
|---|---|---|
| `/` | HomeComponent | — |
| `/auth/login` | LoginComponent | — |
| `/auth/register` | RegisterComponent | — |
| `/products` | ProductListComponent | — |
| `/products/:id` | ProductDetailComponent | — |
| `/cart` | CartComponent | authGuard |
| `/favorites` | FavoritesComponent | authGuard |
| `/profile` | ProfileComponent | authGuard |
