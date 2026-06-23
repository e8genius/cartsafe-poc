# Product Requirements Document (PRD) — CartSafe POC

This document outlines the product requirements, target segment, success metrics, and functional boundaries for the CartSafe Proof-of-Concept.

---

## 1. Problem Statement & Opportunities

### The Double-Discounting Loophole
On Shopify Basic and Standard plans, shoppers can stack promotional discount codes with gift cards because the native checkout rules treat gift cards as payment methods rather than discounts. This results in significant profit margin leaks for small-to-medium business (SMB) merchants.

### The Problem with Post-Transaction Manual Checks
When merchants discover a stacked coupon order, cancelling it post-purchase triggers non-recoverable processing fees. If they miss the stack entirely, they lose their profit margin. 

### The Market Gap
Competitor apps (e.g. PromoLock) that use native checkout blocks are priced for Enterprise ($300-$600/month). Low-cost alternatives ($10-$50/month) rely on Draft Order Hijacking, which breaks attribution tracking (Google Analytics, Facebook Pixels) and accelerated checkouts (Apple Pay / Google Pay). CartSafe provides a low-cost, 100% native solution that detects stacking and freezes the order without breaking Shopify's standard tracking and conversion paths.

---

## 2. Target Segment & User Personas

- **Store Owner (Merchant):** SMB e-commerce store managers in Israel running on Shopify Basic/Standard plans. They handle marketing, fulfillment, and customer service, and need automated protection against double-discount abuse without custom coding or expensive upgrades.
- **Storefront Customer (Buyer):** Price-sensitive online shoppers who look for discounts and seek to combine coupons with gift cards during checkouts.

---

## 3. Product Scope Boundaries

### In Scope (POC Phase)
1. **Frontend Deterrent (Cart Page):** Client-side storefront JavaScript that detects a coupon code, displays a warning that stacking is prohibited, and hides Apple Pay/Google Pay buttons to ensure the user passes through the standard checkout funnel.
2. **Post-Purchase UX Feedback (Thank You Page):** A Checkout UI Extension running on the "Order Status" (Thank You) page that instantly detects if the customer stacked a coupon and gift card, displaying a prominent visual block informing them their order is suspended.
3. **Fulfillment Hold Webhook (The Enforcer):** A backend webhook listening to `orders/create` that instantly analyzes the transaction. If both discounts are found, it places the order on a native Shopify fulfillment hold and flags it for the merchant.
4. **App Dashboard:** Embedded Shopify admin interface showing total saved margins and a log of held orders (displaying Order ID, coupon used, masked gift card, and date).
5. **No-PII Policy:** 100% compliance with privacy regulations by removing customer emails, phone numbers, and full gift card codes from database storage.

### Out of Scope (Explicitly Excluded)
1. **Pre-Transaction Checkout Blocking:** Modifying the native checkout page UI to physically remove the gift card box (this is impossible on Basic plans without using Draft Orders, which we have excluded to preserve tracking).
2. **Fixed-Price Quantity Discount Stacking (Compare-At Pricing):** The POC does not prevent discount codes from applying to compare-at sale items. This is deferred to future releases.
3. **Automated Order Cancellation:** The webhook holds fulfillment for manual review rather than automatically cancelling the order. This allows the merchant to contact the customer and recover the payment difference rather than eating refund fees immediately.

---

## 4. Success Metrics

- **Primary Metric:** Cumulative Margin Caught & Frozen (calculated and shown in the dashboard).
- **Secondary Metrics:**
  - Webhook processing time (orders must be placed on hold within 10 seconds of creation).
  - UI Extension load time on Thank You page (<200ms).
  - App Store uninstallation rate (minimizing merchant churn).

---

## 5. Definition of Done (DoD)

A feature is considered done when it meets the following criteria:
1. **Functional:** The `orders/create` webhook correctly identifies a stacked order and places it on native fulfillment hold via the Admin API.
2. **Quality Assurance:** All scenarios in [TESTING_SCENARIOS.md](file:///Users/e8genius/Documents/Apps/payme%20task/cartsafe%20poc%20product/docs/TESTING_SCENARIOS.md) are verified and pass without regressions.
3. **Compliance:** The system database schema stores no customer emails, names, or unmasked gift cards, aligning with `SECURITY.md` guidelines.
4. **Documented:** Code structure, environment configurations, and deployment steps are updated in the master README, STACK, and DEPLOY docs.
