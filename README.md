# sentinel_FrontEnd

A polished Next.js frontend for **SeerPrice**, a price tracking platform focused on **Egyptian online stores**.

Users can:

- register and log in
- sign in with Google
- add product URLs from supported stores
- track product prices from a dashboard
- view price history charts
- manage alert rules for price drops or target prices

## Overview

This repository contains the **frontend only**.

The application is built with:

- Next.js App Router
- React
- TypeScript
- internal Next.js API proxy routes
- session cookies for auth
- reusable UI components
- charts for price history

The backend lives in a separate NestJS repository.

## Product Idea

SeerPrice helps users monitor products from Egyptian stores without checking those stores manually every day.

Instead of repeatedly opening store pages and comparing prices, the user can:

1. copy a product URL
2. add it to the app
3. wait for scraping to collect product data
4. track price movement over time
5. create alert rules and receive notifications when conditions are met

## Frontend Architecture

This frontend uses a **backend-for-frontend** approach.

The browser does not talk directly to the NestJS backend everywhere.  
Instead, the app mainly communicates through internal Next.js route handlers under `app/api/...`.

Typical flow:

`Browser UI -> Next.js page/components -> Next.js route handlers -> NestJS backend`

This gives the frontend a clean place to:

- forward requests to the backend
- attach auth headers from cookies
- refresh expired sessions
- normalize request and response shapes
- keep browser code simpler and safer

## Authentication Flow

The frontend supports:

- email/password registration
- email/password login
- Google login
- logout
- refresh
- current user loading through `/api/auth/me`

Important auth routes:

- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`
- `/api/auth/refresh`
- `/api/auth/me`
- `/api/auth/referral-summary`
- `/api/auth/google`
- `/api/auth/social/callback`

Sessions are managed with **HTTP-only cookies** instead of relying on `localStorage` for identity.

## Main Frontend Features

- session-backed dashboard
- tracked products list
- auto-refresh for pending scraped products
- price history chart
- alert rules management
- warning state when a tracked product has no alert rules
- welcome modal
- theme toggle
- user menu
- clickable supported-store cards

## What Was Improved In This Frontend

This frontend was moved from more mock/demo-oriented behavior toward real backend integration.

Notable improvements:

- real auth and session proxy flow
- Google-only social auth wiring
- current user loaded from `/api/auth/me`
- logout flow strengthened
- migration from `middleware.ts` to `proxy.ts`
- dashboard tied to real live session data
- tracked items appear without manual reload after adding
- pending scraped items auto-refresh
- better alert rules UX
- cleaner user menu instead of direct logout button
- improved onboarding and visual polish

## Local Development

### Requirements

- Node.js
- npm
- running NestJS backend repo

### Environment Variables

Create a `.env.local` file:

```env
API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Backend Dependency

This frontend depends on a separate NestJS backend for:

- authentication
- social auth exchange
- tracked products
- price history
- alert rules
- referral data

If `API_URL` is not configured correctly, some flows will fall back to mock behavior or fail to reach the backend.

## Supported Store Direction

The project is designed around Egyptian store tracking.  
The UI currently highlights stores such as:

- Sigma Computer
- Alfrensia
- El Badr Group
- Kimo Store
- Games World Egypt

## Codex Usage

**Direct note:** this frontend was developed with heavy assistance from **OpenAI Codex**, and **most of the frontend work in this repository was built or refined using Codex**.

That includes a large part of the work around:

- frontend architecture refinement
- auth/session proxy flow
- dashboard integration
- tracked products UX
- alert rules UX
- component polishing
- theme and visual improvements
- route-handler based backend integration

Codex was used as a serious engineering assistant during implementation, iteration, and refinement of the frontend experience.

## Portfolio Note

This project is a good portfolio example because it demonstrates:

- real frontend-backend integration
- App Router architecture in Next.js
- session-based authentication
- proxy route patterns
- UI state management
- async UX handling for background scraping
- product-minded frontend decisions

## Future Improvements

- stronger loading and error boundaries
- better test coverage
- remove older legacy leftovers completely
- move some server-side data access away from internal HTTP round trips
- improve production deployment hardening
- replace polling with more real-time update patterns if needed

## License

This project is for portfolio and educational use unless otherwise specified.
