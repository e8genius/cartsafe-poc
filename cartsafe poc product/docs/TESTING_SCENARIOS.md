# Testing Scenarios — CartSafe POC

This document outlines the detailed step-by-step test scenarios to verify the correctness of the CartSafe POC implementation.

---

## Setup Requirements for Testing
1. A active Shopify Development Store.
2. A test product priced at 100 ₪.
3. An active promotional discount code (e.g., `PROMO10` for 10% off).
4. A generated gift card containing 50 ₪ (e.g., `GIFT50`).

---

## Scenario A: Frontend Deterrent (Cart Page)

### Goal
Verify that the Storefront JS displays a warning when a discount code is applied in the cart.

### Steps
1. Add the test product (100 ₪) to the cart.
2. In the cart drawer/page, enter the discount code `PROMO10`.
3. Verify that the warning message is displayed: *"Notice: Coupons cannot be combined with gift cards. If you stack them at checkout, your order will be suspended."*
4. Verify that the **Apple Pay** / **Google Pay** express checkout buttons in the cart drawer or page **disappear**.
5. Remove the coupon from the cart.
6. Verify that the warning disappears and express checkout buttons reappear.

---

## Scenario B: Post-Transaction UX & Webhook Hold (Stacking Attack)

### Goal
Verify that if a customer completes checkout with both a gift card and a coupon, the order is flagged, suspended, and the customer is notified immediately on the Thank You page.

### Steps
1. Add the test product (100 ₪) to the cart.
2. Click **Checkout**.
3. On the checkout page, enter the discount code `PROMO10`.
4. Enter the gift card code `GIFT50`.
5. Verify the subtotal updates correctly: Product (100 ₪) - Discount (10 ₪) - Gift Card (50 ₪) = Remaining Balance (40 ₪).
6. Complete the checkout with a test credit card for the remaining 40 ₪.
7. Wait for the redirect to the **Order Status (Thank You)** page.
8. **Verify UI Extension:** Ensure a prominent red/yellow warning banner is visible under the order number stating: *"Order Suspended: Promotional codes cannot be combined with gift cards. Your order is on hold. Please contact support."*
9. **Verify Admin Webhook Hold:**
   - In the Shopify Admin, navigate to **Orders**.
   - Find the newly created order.
   - Verify that the order has the status **Hold** under the fulfillment status.
   - Open the CartSafe app dashboard in the Shopify admin.
   - Verify that the order is listed in the log of held orders, displaying the violation details.

---

## Scenario C: Legitimate Order (No Stacking)

### Goal
Verify that normal checkouts proceed without warnings or holds.

### Steps
1. Add the test product to the cart.
2. Apply the discount code `PROMO10` but **do not** use a gift card.
3. Complete checkout with a test credit card.
4. On the Thank You page, verify that **no warning banner is displayed**.
5. In the Shopify Admin, verify that the order's fulfillment status is **Unfulfilled** (Not on hold).
6. Repeat the process using a Gift Card, but **no** discount code. Verify the same safe result.
