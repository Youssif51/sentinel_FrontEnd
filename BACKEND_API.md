# SeerPrice — Backend API Contract

This document defines everything the NestJS backend must implement to fully support the SeerPrice frontend.

---

## Setup

### Environment Variables

Create a `.env.local` file in the Next.js project root:

```env
# Required: NestJS base URL (no trailing slash)
API_URL=http://localhost:3001

# Optional
NEXT_PUBLIC_APP_URL=https://seerprice.com
```

Without `API_URL`, the app runs in **mock mode** automatically — useful for frontend-only development.

---

## Authentication

### Flow

1. User submits email + password → frontend POSTs to `/api/auth/login` (Next.js route)
2. Next.js proxies to NestJS `POST /auth/login`
3. NestJS returns `{ access_token: "JWT..." }`
4. Next.js stores the JWT in an **httpOnly cookie** named `session`
5. All subsequent proxied requests attach `Authorization: Bearer <token>`

### Middleware Protection

The Next.js middleware (`middleware.ts`) checks for the `session` cookie on every request.
- No cookie → redirect to `/login`
- Public routes bypass the check: `/login`, `/register`, `/api/auth/*`

---

## API Endpoints

Base URL (NestJS): `http://localhost:3001` (or whatever `API_URL` is set to)

All protected endpoints receive: `Authorization: Bearer <JWT>`

---

### Auth

#### `POST /auth/login`

**Request body:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response 200:**
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response 401:**
```json
{ "message": "Invalid credentials." }
```

**Response 423 (account locked):**
```json
{ "message": "Account is locked.", "unlocksAt": "2025-01-01T12:00:00.000Z" }
```

---

#### `POST /auth/register`

**Request body:**
```json
{ "email": "user@example.com", "password": "password123" }
```

**Response 201:**
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Response 409 (email taken):**
```json
{ "message": "Email already in use." }
```

**Response 422 (validation):**
```json
{ "message": "Password must be at least 8 characters." }
```

---

### Tracked Items

#### `GET /tracked-items`

Returns the authenticated user's tracked products + plan info.

**Response 200:**
```json
{
  "items": [
    {
      "id": "track-uuid-1",
      "product": {
        "id": "prod-uuid-1",
        "title": "ASUS ROG Strix G15 Gaming Laptop",
        "store": "Sigma Computer",
        "last_price": "49999",
        "in_stock": true,
        "last_scraped_at": "2025-01-01T10:00:00.000Z",
        "price_history": [
          { "price": "52999" }
        ]
      }
    }
  ],
  "plan": "FREE",
  "count": 1
}
```

> `plan` can be `"FREE"` or `"PRO"`. The frontend uses this to show the usage bar (FREE limit = 5).
> `price_history[0]` is the **previous price** used to calculate % change on the card.

---

#### `GET /tracked-items/by-product/:productId`

Used by the product detail page to fetch full product data.

**Response 200:**
```json
{
  "id": "prod-uuid-1",
  "title": "ASUS ROG Strix G15 Gaming Laptop",
  "store": "Sigma Computer",
  "last_price": "49999",
  "in_stock": true,
  "last_scraped_at": "2025-01-01T10:00:00.000Z",
  "price_history": [
    { "price": "52999" }
  ]
}
```

**Response 404:**
```json
{ "message": "Product not found" }
```

---

#### `POST /tracked-items`

Add a new product to track by URL.

**Request body:**
```json
{ "url": "https://sigma-computer.com/products/asus-rog-strix-g15" }
```

**Response 201:**
```json
{
  "id": "track-uuid-new",
  "product": {
    "id": "prod-uuid-new",
    "title": "ASUS ROG Strix G15...",
    "store": "Sigma Computer",
    "last_price": null,
    "in_stock": null,
    "last_scraped_at": null,
    "price_history": []
  }
}
```

> Return `last_price: null` if scraping is still pending — the frontend shows "Scraping..." in that case.

**Response 400:**
```json
{ "message": "Product URL is required." }
```

**Response 422 (unsupported store):**
```json
{ "message": "This store is not supported yet." }
```

---

#### `DELETE /tracked-items/:id`

Remove a tracked item. `:id` is the **tracked item id** (not product id).

**Response 200:**
```json
{ "message": "Deleted." }
```

**Response 404:**
```json
{ "message": "Tracked item not found." }
```

---

### Price History

#### `GET /price-history/:productId`

Returns 30-day price history for a product, used to render the chart.

**Response 200:**
```json
[
  {
    "scraped_at": "2025-01-01T00:00:00.000Z",
    "price": 49999,
    "in_stock": true
  },
  {
    "scraped_at": "2025-01-02T00:00:00.000Z",
    "price": 48500,
    "in_stock": true
  }
]
```

> Array ordered **oldest first** (the chart reads left-to-right = old to new).

---

### Alert Rules

#### `GET /alert-rules?productId=:productId`

Returns alert rules for a specific product.

**Response 200:**
```json
[
  {
    "id": "rule-uuid-1",
    "productId": "prod-uuid-1",
    "type": "PERCENTAGE_DROP",
    "threshold": 10,
    "last_fired_at": null
  },
  {
    "id": "rule-uuid-2",
    "productId": "prod-uuid-1",
    "type": "PRICE_BELOW",
    "threshold": 45000,
    "last_fired_at": "2025-01-05T08:00:00.000Z"
  }
]
```

---

#### `POST /alert-rules`

Create a new alert rule.

**Request body:**
```json
{
  "productId": "prod-uuid-1",
  "type": "PERCENTAGE_DROP",
  "threshold": 10
}
```

> `type` is either `"PERCENTAGE_DROP"` or `"PRICE_BELOW"`
> `threshold` for `PERCENTAGE_DROP` = percent (e.g. `10` = 10% drop)
> `threshold` for `PRICE_BELOW` = absolute price in EGP (e.g. `45000`)

**Response 201:**
```json
{
  "id": "rule-uuid-new",
  "productId": "prod-uuid-1",
  "type": "PERCENTAGE_DROP",
  "threshold": 10,
  "last_fired_at": null
}
```

**Response 400:**
```json
{ "message": "Missing required fields." }
```

---

#### `DELETE /alert-rules/:id`

**Response 200:**
```json
{ "message": "Deleted" }
```

**Response 404:**
```json
{ "message": "Rule not found." }
```

---

## Data Types Summary

```typescript
type Plan = 'FREE' | 'PRO';

type AlertRuleType = 'PERCENTAGE_DROP' | 'PRICE_BELOW';

interface Product {
  id: string;
  title: string;
  store: string;           // Display name: "Sigma Computer", "B.TECH", etc.
  last_price: string | null;  // Stringified number or null if not scraped yet
  in_stock: boolean | null;
  last_scraped_at: string | null;  // ISO 8601
  price_history: Array<{ price: string }>;  // [0] = previous price for % diff
}

interface TrackedItem {
  id: string;     // tracked item ID (used for DELETE)
  product: Product;
}

interface PricePoint {
  scraped_at: string;   // ISO 8601
  price: number;
  in_stock: boolean;
}

interface AlertRule {
  id: string;
  productId: string;
  type: AlertRuleType;
  threshold: number;
  last_fired_at: string | null;  // ISO 8601
}
```

---

## Notes

- **CORS**: NestJS must allow requests from the Next.js origin (e.g. `http://localhost:3000` in dev, your production domain in prod).
- **JWT**: The frontend stores the token in an httpOnly cookie — NestJS never needs to handle cookies, only validate the `Authorization: Bearer` header.
- **Scraping**: After `POST /tracked-items`, the scraper runs async. The frontend polls or waits — returning `last_price: null` is valid.
- **Mock cleanup**: The frontend has `sp_deleted_items` in localStorage as a mock workaround. Once the real DELETE endpoint works server-side, this is irrelevant.
- **Supported stores** (for scraper): Sigma Computer (`sigma-computer.com`), Alfrensia (`alfrensia.com`), El Badr Group (`elbadrgroupeg.store`), Kimo Store (`kimostore.net`), Games World Egypt (`gamesworldegypt.com`).
