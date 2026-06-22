# Data Model — CartSafe POC

This document outlines the database schema (Prisma ORM notation) for the CartSafe application.

---

## 1. Database Schema (Prisma / PostgreSQL)

We use Prisma to manage database schema migrations and queries against our Supabase PostgreSQL instance. 

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Stores OAuth credentials and settings for each Shopify shop
model Store {
  id            String   @id @default(uuid())
  shopDomain    String   @unique // e.g., "my-store.myshopify.com"
  accessToken   String   // Shopify Offline Access Token
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  heldOrders    HeldOrder[]
}

// Log of orders caught by the webhook safety net
model HeldOrder {
  id           String   @id @default(uuid())
  storeId      String
  store        Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  
  shopifyOrderId String @unique // Shopify Order ID
  orderName      String // e.g., "#1001"
  discountCode   String // The coupon code used
  giftCardCode   String // The gift card code (always masked at the app layer to store only the last 4 characters, e.g. "xxxx-1234")
  totalAmount    Float
  currency       String // e.g., "ILS"
  
  status       String   @default("HELD") // HELD, RELEASED, CANCELLED
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

---

## 2. No-PII Data Policy

In compliance with privacy regulations (including Israeli Amendment 13), the database enforces a strict data minimization policy:
- `HeldOrder` does **not** store customer names, emails, phone numbers, or physical addresses.
- `giftCardCode` is permanently masked on the server before database insertion.
- When an app is uninstalled, all `HeldOrder` and `Store` records are immediately cascade-deleted (to be implemented in Phase 3).
