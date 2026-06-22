# Deployment & Environment Guide (DEPLOY_AND_ENV) — CartSafe POC

This document outlines environment variables, deployment steps, database migrations, and CI/CD pipelines for CartSafe.

---

## 1. Environment Variables Reference

These variables must be set in the local `.env` file for development and in the deployment dashboard for production (Vercel settings).

| Variable Name | Environment | Description | Source |
|:---|:---|:---|:---|
| `SHOPIFY_API_KEY` | Dev & Prod | Shopify App Client ID | Shopify Partner Console |
| `SHOPIFY_API_SECRET` | Dev & Prod | Shopify App Client Secret (Secret!) | Shopify Partner Console |
| `DATABASE_URL` | Dev & Prod | Postgres connection string (with `?pgbouncer=true` if pooled) | Supabase DB Settings |
| `SUPABASE_URL` | Dev & Prod | Supabase project API endpoint URL | Supabase API Settings |
| `SUPABASE_ANON_KEY` | Dev & Prod | Supabase public anonymous key | Supabase API Settings |
| `SCOPES` | Dev & Prod | App access scopes requested from merchants | Set to: `write_orders,read_orders` |

---

## 2. Deployment Steps

Deploying CartSafe involves three target hosting services:

### A. Database Deployment (Supabase)
Prisma is the sole manager of database migrations. Ensure migrations are generated and applied to the database:
1. Generate a migration during development:
   ```bash
   npx prisma migrate dev --name <migration_name>
   ```
2. Apply migrations to the production/remote Supabase DB during CI/CD:
   ```bash
   npx prisma migrate deploy
   ```

### B. App Backend Deployment (Vercel)
The Remix app server is hosted on Vercel:
1. Link your local project to Vercel:
   ```bash
   vercel link
   ```
2. Configure environment variables in the Vercel Project Dashboard.
3. Deploy the application:
   ```bash
   vercel deploy --prod
   ```

### C. Extension Deployment (Shopify CDN)
The Checkout UI Extensions and Theme App Extensions are hosted on Shopify's servers:
1. Build and deploy the extensions via Shopify CLI:
   ```bash
   npx shopify app deploy
   ```
   *Note:* The CLI will read configurations from your `shopify.app.toml`, bundle the React UI extension and Theme app extension assets, and publish them to Shopify.

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
