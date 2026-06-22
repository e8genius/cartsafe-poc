# User Stories — CartSafe POC

This document outlines the core behaviors of the CartSafe app from the perspectives of both the Merchant (store owner) and the Buyer (customer).

---

## 1. Merchant User Stories

### Story 1.1: Standard Installation & Setup
- **As a** Shopify Store Owner (Merchant)
- **I want to** install the app from my Shopify Partners account and enable the guard with a single toggle
- **So that** I don't have to manually manage complex collections or discount combination settings.
- **Acceptance Criteria:**
  - App installs using standard OAuth flow.
  - The embedded dashboard displays a simple "Active / Inactive" toggle.
  - Toggling "Active" enables the Webhook listener, Checkout UI Extension, and Theme App Extension.

### Story 1.2: Order Monitoring & Alerting
- **As a** Shopify Store Owner (Merchant)
- **I want to** see a list of held orders in my dashboard that were flagged for double-discount attempts
- **So that** I can manually review them, contact the customer for the difference, or issue refunds.
- **Acceptance Criteria:**
  - Flagged orders are visible in a table inside the app.
  - Table displays: Order ID, Applied Discount Code, Gift Card Used (masked), and Date.
  - Orders are automatically placed under a `Fulfillment Hold` in Shopify's native orders panel.

---

## 2. Buyer User Stories

### Story 2.1: Cart Coupon Entry (Frontend Deterrent)
- **As a** Customer (Buyer) in the storefront cart
- **I want to** apply a promotional coupon code
- **So that** I get a discount on my cart items.
- **Acceptance Criteria:**
  - Entering a coupon code sets the custom attribute `_discount_active = true` on the cart.
  - The storefront displays a notification: *"Notice: Coupons cannot be combined with gift cards. If you stack them at checkout, your order will be suspended."*
  - The Express Checkout buttons (Apple Pay, Google Pay) are hidden to force standard checkout.

### Story 2.2: Stacking at Checkout (The Violation)
- **As a** Customer (Buyer) on the checkout page
- **I want to** use a coupon and pay the rest with a gift card
- **So that** I can stack both discounts and pay less.
- **Acceptance Criteria:**
  - The buyer successfully enters both the discount code and the gift card (as Shopify does not allow natively hiding the gift card field).
  - The checkout process completes and the payment is authorized.

### Story 2.3: The "Thank You" Page Suspension (Post-Purchase Feedback)
- **As a** Customer (Buyer) who just stacked codes and reached the Order Status page
- **I want to** see my order confirmation
- **So that** I know when my items will ship.
- **Acceptance Criteria:**
  - Instead of a normal confirmation, a prominent red/yellow Checkout UI Extension Banner appears.
  - The banner reads: *"Order Suspended: Promotional codes cannot be combined with gift cards. Your order is on hold and will not ship. Please contact support."*
  - The customer is immediately made aware that their hack was caught and the items will not arrive.

---

## 3. Scope Limitations & Offboarding Note

*Note:* As this is a POC (Proof of Concept) version, uninstall and offboarding data cleanup flows (e.g. automatic cart attribute removal, UI Extension deregistration, and complete merchant database record deletion upon app uninstallation) are not implemented. These will be added as part of the production roadmap.
