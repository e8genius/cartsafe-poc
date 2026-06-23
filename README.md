# CartSafe — Shopify Discount & Gift Card Stacking Guard (POC)

CartSafe is a native Shopify application designed to protect merchant margins from double-discounting exploits (specifically stacking promotional coupon codes with gift cards) without requiring a Shopify Plus plan or breaking native tracking with draft orders.

This repository encompasses the product development and market research lifecycle—from initial market research and opportunity identification to the technical Proof-of-Concept (POC) of the CartSafe Shopify App.

---

## 📁 Repository Structure

The project is structured into two main components in this repository:

### 1. Market Research & Problem Analysis (`/analyzer`)
This phase involved analyzing a large dataset of WhatsApp chats from Israeli e-commerce merchants to identify their most pressing pain points. 
- **Key Documents:** `rice_prioritization_matrix.md`, `cartsafe_research_prompt.md`, `cartsafe_feasibility_study.md`.
- *Note: Outdated or irrelevant analysis files have been moved to `analyzer/archive` for historical reference.*

### 2. Product Development (`/cartsafe poc product`)
Based on the RICE matrix, the decision was made to build **CartSafe**. This directory contains the actual product codebase (a Shopify App) and detailed documentation.
- **Key Documents:** [PRD.md](docs/PRD.md), [PR_FAQ.md](docs/PR_FAQ.md), [ARCHITECTURE.md](docs/ARCHITECTURE.md), [API_FLOWS.md](docs/API_FLOWS.md), [DATA_MODEL.md](docs/DATA_MODEL.md).

### 3. Product Simulator (Separate Repository)
To test and demonstrate CartSafe, a storefront simulator is hosted in a separate public repository:
- **Repository:** [cartsafe-simulator](https://github.com/e8genius/cartsafe-simulator)

---

## 🚀 System Overview (CartSafe Product)

CartSafe uses a three-stage native architecture:
1. **Stage 1 (Frontend Deterrent):** A client-side storefront JS observer that hides express checkout buttons and warns the user that stacking codes is prohibited.
2. **Stage 2 (Post-Purchase UX Feedback):** A Checkout UI Extension running on the "Thank You" page that instantly detects if stacking occurred, displaying a prominent visual block informing the customer their order is suspended.
3. **Stage 3 (The Enforcer):** An asynchronous webhook listener subscribing to `orders/create` that instantly catches stacked orders and places them on a native Shopify fulfillment hold, ensuring they do not ship.

---

## 🛠️ Technical Stack

- **App Framework:** Shopify App Remix Template (Node.js backend, Remix runtime, Polaris React frontend).
- **Checkout Customization:** Shopify UI Extensions API (React component targeted at Thank You page).
- **ORM & Database:** Prisma ORM connecting to a managed Supabase PostgreSQL instance.
- **Hosting:** Vercel (for Remix/Node serverless backend) and Shopify CDN (for extensions).

For detailed stack configuration, see [STACK.md](docs/STACK.md).

---

## 📋 Prerequisites

Before setting up the project locally, ensure you have:
1. **Node.js** (v22 or later) and `npm` installed.
2. A **Shopify Partners Account** to register your application and test stores.
3. A **Supabase Account** with an active PostgreSQL database instance.
4. Shopify CLI installed globally or run via `npx`:
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

---

## 🔧 Local Development Quickstart

Follow these steps to set up and run the app locally:

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/e8genius/cartsafe-poc.git
cd "cartsafe-poc/cartsafe poc product/cartsafe"
npm install
```

### 2. Configure Environment Variables
Create a `.env` file at the root of the `cartsafe/` directory. Fill it with the values obtained from your Shopify Partner panel and Supabase instance.
```env
SHOPIFY_API_KEY=your_client_id
SHOPIFY_API_SECRET=your_client_secret
DATABASE_URL=postgres://postgres.supabase_user:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SCOPES=write_orders,read_orders
```
For detailed environment variables setup and deployment guides, see [DEPLOY_AND_ENV.md](docs/DEPLOY_AND_ENV.md).

### 3. Database Migrations
Initialize your database schema using Prisma:
```bash
npx prisma db push
# or to generate migrations
npx prisma migrate dev --name init
```

### 4. Launch the Development Server
Run the Shopify CLI development server. It will automatically create tunnels and sync extensions with your test store:
```bash
npm run dev
```

---

## 📚 Detailed Documentation

All detailed project documents are located under the root `docs/` folder:
- **Product positioning & FAQs:** [PR_FAQ.md](docs/PR_FAQ.md)
- **Product Requirements (PRD):** [PRD.md](docs/PRD.md)
- **Technical Architecture:** [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API & GraphQL Schema:** [API_FLOWS.md](docs/API_FLOWS.md)
- **Database Schema & Metafields:** [DATA_MODEL.md](docs/DATA_MODEL.md)
- **Security & Privacy:** [SECURITY.md](docs/SECURITY.md)
- **Testing Scenarios:** [TESTING_SCENARIOS.md](docs/TESTING_SCENARIOS.md)
- **Developer Roadmap:** [ROADMAP.md](docs/ROADMAP.md)
