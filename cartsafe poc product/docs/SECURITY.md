# Security, Privacy & Limits — CartSafe POC

This document outlines the security architecture, data handling, and compliance considerations for the CartSafe app.

---

## 1. Webhook Authentication & HMAC Validation

To prevent malicious third parties from spoofing webhook payloads (e.g., triggering fake fulfillment holds), the App Backend must validate the signature of every incoming request from Shopify.

### Validation Mechanism
Shopify signs every webhook request with the app's Client Secret using HMAC-SHA256.
- **Header:** `X-Shopify-Hmac-Sha256`
- **Validation Logic (Node.js):**
```javascript
import crypto from 'crypto';

export function verifyWebhook(rawBody, hmacHeader, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  
  const hashBuffer = Buffer.from(hash);
  const hmacBuffer = Buffer.from(hmacHeader);
  
  if (hashBuffer.length !== hmacBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, hmacBuffer);
}
```
If validation fails, the backend immediately drops the request with a `401 Unauthorized` status.

---

## 2. Access Token Management (OAuth)

Shopify uses OAuth 2.0 to grant access tokens.
- **Token Type:** Offline Access Tokens. These tokens are stored securely in Supabase and do not expire.
- **Database Security:** Access tokens are stored in the database. In a production environment, these should be encrypted at rest (e.g., using PostgreSQL pgcrypto or application-level encryption). For this POC, we will store them in a secure environment variables-backed DB table.
- **Scopes (Least Privilege):** We request only the absolute minimum API scopes required to track orders and manage holds:
  - `write_orders` & `read_orders` (to read transactions and place orders on fulfillment hold)

---

## 3. Data Privacy & Compliance (Israel Privacy Law / Amendment 13)

Since the target audience is Israeli merchants, the application must comply with local privacy regulations (Amendment 13 of the Protection of Privacy Law, 2025/2026).

### A. Data Minimization
- **No PII Storage:** The app database **does not store** customer credit card numbers, billing addresses, or passwords.
- **Minimal Order Logging:** For held orders, the app logs only:
  - Shopify `order_id` (referenced internally)
  - The masked total (e.g., 200 ₪)
  - The name of the stacked coupon code used.
  - No names or phone numbers are saved in the database unless explicitly consented.

### B. Shopify Mandatory Privacy Webhooks
To be published or used, the app must handle Shopify's mandatory GDPR webhook endpoints:
- `customers/data_request`: Requesting customer details. (Since we don't store them, we return an empty payload).
- `customers/redact`: Deleting customer details. (No-op, as we do not store customer records).
- `shop/redact`: Deleting shop data when the app is uninstalled.

---

---

## 4. Threat Model & Cart Attribute Spoofing (C-6)

- **Threat Vector:** Customers using developer tools can manually delete or modify the cart attribute `_discount_active` to bypass the pre-checkout block.
- **Pre-Transaction Mitigation:** The storefront JS observer is injected via Theme App Extensions to hide accelerated checkout buttons and set the attribute, which blocks average shoppers.
- **Post-Transaction Verification (Webhook Safety Net):** Because we cannot guarantee 100% security on client-side state manipulation, we subscribe to the `orders/create` webhook. The webhook validates whether a coupon code and a gift card were stacked on the backend (using secure Shopify server data, which cannot be spoofed). If stacked, the fulfillment is immediately locked.

---

## 5. API Limitations & Rate Limits

- **Shopify REST/GraphQL Rate Limits:** Shopify limits API requests using a leaky bucket algorithm (standard 40 points/second for GraphQL). Since our webhook holds only run on stacked orders (rare edge cases), we will operate well below the rate limits.
- **Checkout UI Extensions Execution:** The checkout UI extension executes client-side on the thank-you page. It runs in a sandboxed Web Worker environment provided by Shopify, ensuring no performance block or impact on checkout load times.
