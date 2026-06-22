# Technical Stack Document (STACK) — CartSafe POC

This document outlines the software components, database engines, language runtimes, and system constraints used in the CartSafe application.

---

## 1. Core Technology Stack

| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **App Framework** | Shopify App Remix Template (Remix) | latest / v2.x | Handles OAuth, routing, backend sessions, and UI shell |
| **Backend Runtime** | Node.js | v22+ | Host environment for the Remix server and webhook listener |
| **Database** | PostgreSQL (Supabase) | v16+ | Managed PostgreSQL instance hosting store configurations and holds log |
| **ORM** | Prisma | latest | Manages migrations and typesafe database queries |
| **Thank You UI** | React (Shopify UI Extensions) | latest | Client-side widget rendering on the Order Status page |
| **Merchant UI** | Shopify Polaris React | latest | Native Shopify App Bridge-integrated UI styling components |

---

## 2. Component Runtimes & Configurations

### A. App Server (Remix & Node.js)
- **Deployment Platform:** Vercel (Serverless Functions).
- **Session Store:** Shopify's standard offline database session storage, mapped via the Prisma adapter.
- **Webhook Endpoint:** Secure `/api/webhooks` router configured to validate signature payloads before execution.
- **Fulfillment API:** Uses standard GraphQL Admin API to place native holds.

### B. Database (Supabase PostgreSQL)
- **Connection Mode:** Session pooler (`DATABASE_URL` uses PgBouncer on port `6543`).
- **Migrations Tool:** Prisma Migrate (`npx prisma migrate`). Migrations are tracked in SQL files and applied during deployments.
- **Security Policy:** Access token columns are guarded in environment configs and shielded from API serialization.

### C. Checkout UI Extension (React)
- **Target:** `purchase.thank_you.block.render`
- **Execution Environment:** Shopify's sandboxed Web Worker extension environment.
- **Network Constraints:** Allowed to make network requests to the App Server if necessary, though all necessary logic for this POC runs synchronously using client-side `useOrder()` hooks.

---

## 3. Platform Limitations & Budgets

### Checkout UI Extension Limits
- **Render Time Limit:** Must render within UI performance budgets (typically under 1s).
- **Component Access:** Restricted to Shopify's pre-approved Checkout UI components (Banner, Text, BlockStack). No raw HTML or DOM manipulation is allowed.

### Shopify GraphQL API Limits
- **Rate Limit:** standard Shopify REST/GraphQL API limits apply (leaky bucket rate limiting). Standard stores have a bucket capacity of 40 points/second. CartSafe backend webhook holds are throttled to run only when stacking occurs, avoiding rate limit violations.
