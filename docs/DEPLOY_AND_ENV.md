# Deployment & Environment Guide (DEPLOY_AND_ENV) — CartSafe POC

This document outlines environment variables, deployment steps, database migrations, and CI/CD pipelines for CartSafe.

---

## 0. Production Links & Repositories

- **Shopify Development Store:** [cartsafe-test-store.myshopify.com](https://cartsafe-test-store.myshopify.com)
- **Product App (Vercel):** [https://cartsafe-poc.vercel.app/](https://cartsafe-poc.vercel.app/)
- **Storefront Simulator (Vercel):** [https://cartsafe-simulator.vercel.app/](https://cartsafe-simulator.vercel.app/)
- **GitHub Product Repository:** [e8genius/cartsafe-poc](https://github.com/e8genius/cartsafe-poc)
- **GitHub Simulator Repository:** [e8genius/cartsafe-simulator](https://github.com/e8genius/cartsafe-simulator)

---

## 1. Environment Variables Reference

These variables must be set in the local `.env` file for development and in the deployment dashboard for production (Vercel settings).

| Variable Name | Environment | Description | Source |
|:---|:---|:---|:---|
| `SHOPIFY_API_KEY` | Dev & Prod | Shopify App Client ID | Shopify Partner Console |
| `SHOPIFY_API_SECRET` | Dev & Prod | Shopify App Client Secret (Secret!) | Shopify Partner Console |
| `DATABASE_URL` | Dev & Prod | Postgres connection string (with `?pgbouncer=true` if pooled) | Supabase DB Settings |
| `DIRECT_URL` | Dev & Prod | Postgres direct connection string (no pooler, for migrations) | Supabase DB Settings |
| `SCOPES` | Dev & Prod | App access scopes requested from merchants | Set to: `write_orders,read_orders,write_payment_customizations,read_payment_customizations` |
| `SHOPIFY_APP_URL` | Prod | The public Vercel URL of the Product App | `https://cartsafe-poc.vercel.app` |
| `SHOPIFY_CHECKOUT_DISCOUNT_VALIDATOR_ID` | Prod | Shopify Function ID for cart validation | Output of `shopify app deploy` |

---

## 2. Deployment Steps

Deploying CartSafe involves three target hosting services:

### A. Database Deployment (Supabase)
Prisma is the sole manager of database migrations. Ensure migrations are generated and applied to the database:
1. Generate a migration during development:
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```
2. Apply migrations to the production/remote Supabase DB:
   ```bash
   npx prisma migrate deploy
   ```

### B. App Backend Deployment (Vercel)
The Remix / React Router 7 app server is hosted on Vercel:
1. **GitHub Integration:** Vercel automatically deploys the app when you push to the `main` branch of [e8genius/cartsafe-poc](https://github.com/e8genius/cartsafe-poc).
2. **Project Settings in Vercel:**
   - **Root Directory:** Set to `cartsafe poc product/cartsafe`.
   - **Build Command:** Keep default (`npm run build`).
   - **Environment Variables:** Configure all variables from Section 1 in Vercel's Dashboard.
3. **Automatic Prisma Generation:** The project has been configured with a `"postinstall": "prisma generate"` script in `package.json`. Vercel will run this automatically after installing packages, ensuring types compile correctly during the build phase.

### C. Extension Deployment (Shopify CDN)
The Checkout UI Extensions and Theme App Extensions are hosted on Shopify's servers:
1. Link your local project to Shopify (if not already done):
   ```bash
   npx shopify app config link
   ```
2. Build and deploy the extensions via Shopify CLI:
   ```bash
   npm run deploy
   ```
   *Note:* The CLI will read configurations from your `shopify.app.toml`, bundle the React UI extension and Theme app extension assets, and publish them to Shopify's CDN.

---

## 3. Automated CI/CD Pipeline

To ensure quality control and automated releases, CartSafe implements a GitHub Actions pipeline (`.github/workflows/deploy.yml`):

### Pipeline Stages
1. **Linting & Code Quality:**
   - Run ESLint on the Remix Javascript/TypeScript codebase and the UI Extension React code.
2. **Build Verification:**
   - Compile the Remix frontend/backend bundle (`npm run build`).
3. **Database Migration:**
   - Connect to Supabase and run `npx prisma migrate deploy` to ensure database schemas are up to date.
4. **App Deployment:**
   - Deploy Remix app routes automatically to Vercel (using Vercel Git Integration).
   - Deploy/publish checkout extensions to Shopify CDN using the Shopify CLI action.
