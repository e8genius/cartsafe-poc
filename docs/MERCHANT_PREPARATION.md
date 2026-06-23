# Merchant & Developer Preparation Guide

This document outlines everything you need to prepare, register, and configure before we begin the implementation phase of the **CartSafe POC**.

---

## 1. Accounts & Services to Register

You will need to create accounts for three services. All of them have **100% free tiers** suitable for this POC.

### A. Shopify Partners Account
This is the portal where you create the Shopify App and test stores.
1. Go to [Shopify Partners](https://partners.shopify.com/) and register.
2. Under **Stores**, click **Add store** → **Create development store**.
   - Select **Create a store to test and build** (do not select Quick Start / developer preview unless you need special unstable features).
   - Give it a name (e.g., `cartsafe-test-store.myshopify.com`).

### B. Supabase Account (Database)
This will host our PostgreSQL database.
1. Go to [Supabase](https://supabase.com/) and sign up.
2. Click **New project** and name it (e.g., `cartsafe-poc`).
3. Set a strong Database Password (save this password, we will need it!).
4. Choose a region close to your target users (e.g., Europe or Middle East).

### C. Ngrok or Cloudflare Tunnel (Local Testing)
To test Shopify apps locally, Shopify needs to send webhooks to your local machine.
- Shopify CLI handles this automatically using Cloudflare Tunnels (built-in, no registration required).
- *Optional:* You can sign up for a free account at [ngrok](https://ngrok.com/) if you prefer to use a custom stable domain for testing.

---

## 2. API Keys & Configuration Values

Once the accounts are set up, you will need to gather the following values. We will place them in a `.env` file at the root of the project.

| Variable Name | Source | Description |
|:---|:---|:---|
| `SHOPIFY_API_KEY` | Shopify Partner Console → Apps | The Client ID of your created app |
| `SHOPIFY_API_SECRET` | Shopify Partner Console → Apps | The Client Secret of your app |
| `DATABASE_URL` | Supabase Settings → Database | The PostgreSQL connection string (Transaction/Session) |
| `SUPABASE_URL` | Supabase Settings → API | The URL of your Supabase project |
| `SUPABASE_ANON_KEY` | Supabase Settings → API | The anonymous public key |
| `SCOPES` | Developer Defined | Set to: `write_orders,read_orders` |

---

## 3. Security & GitHub (Git Safety)

Since you plan to upload this project to **GitHub**, we must ensure no credentials or access tokens are leaked.

### A. The `.gitignore` File
We must never commit the `.env` file. Ensure your `.gitignore` contains:
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Database files (if SQLite is used locally)
*.db
*.db-journal

# Node dependencies
node_modules/
dist/
.cache/
```

### B. Shopify Config Commits
The Shopify CLI generates a `shopify.app.toml` config file. This file contains public configuration (like app scopes and URLs) and is **safe to commit to Git**. However, never paste secrets into it.

---

## 4. Checklist for Next Step
When you are ready to begin the implementation, please have:
- [ ] Your Shopify Partner Account email.
- [ ] Your Shopify Development Store domain (`*.myshopify.com`).
- [ ] A Supabase database connection string (`DATABASE_URL`).
