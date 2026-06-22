# Master Research Prompt: CartSafe (Updated)

Copy and paste the prompt below into a web-enabled LLM (like Claude 3.5 Sonnet, Gemini 1.5 Pro, or GPT-4o) to generate a comprehensive technical and commercial feasibility study.

```markdown
You are a Principal E-commerce Architect, Shopify Core API Developer, and E-commerce SaaS Product Manager. I am planning a Proof-of-Concept (POC) for a mass-market Shopify App (targeting Shopify Basic & Standard merchants) that solves the "Double Discounting" and "Fixed-Price Quantity Discount" problems.

The absolute ideal product experience is to **PREVENT the transaction from completing** if a customer stacks a coupon code with a gift card payment, rather than handling it post-purchase (which causes merchant refund fees and administrative overhead).

Provide an exhaustive, technical, and commercial feasibility study focusing heavily on pre-transaction prevention. Use web search to fetch real-world cases, API documentation updates for 2025/2026, and app competitor data.

Structure the report into the following sections:

---

### SECTION 1: Feasibility of Pre-Transaction Blocking on Shopify Basic/Standard
1. **The Ultimate Goal: Blocking Before Payment:**
   - Is it technically possible on a standard Shopify Basic/Standard plan to block a customer from completing checkout if they have applied a discount code AND are paying with a gift card? 
   - Analyze the checkout flow. Since gift card redemption happens at the payment step of checkout, does any server-side validation or API run *during* or *after* the gift card is entered but *before* the order is finalized?
2. **Shopify Functions Constraints:**
   - Look at the `input.graphql` schema for **Cart and Checkout Validation Functions**. Does this API have access to the payment details (specifically, applied gift card balances or transactions)? If not, what are the exact boundary limitations?
   - Can the **Payment Customization API** or **Discount Allocator API** be used to detect a gift card payment and dynamically hide the discount code field or invalidate active coupons?
3. **Compare-at Prices (Sale Items) vs. Coupon Stacking:**
   - Detail the difference in Shopify's logic between a **Compare-at Price** (visual discount) and a true **Discount Code / Automatic Discount**. 
   - If a product is already on sale (Compare-at Price > Price), does Shopify's native "Discount Combinations" engine prevent a discount code from applying to it? 
   - How can a merchant on a Basic plan prevent coupon codes from applying to already-discounted "Compare-at Price" sale items? Can we programmatically hide or disable the coupon input box in the checkout UI based on cart contents?
4. **Draft Order Hijacking (The "Pre-Checkout Lock" Method):**
   - Analyze this workaround: The storefront Javascript intercepts the "Checkout" button, calls our app backend to create a Shopify `DraftOrder` with the items, applies custom discounting rules, disables the native coupon field on the resulting checkout, and redirects the user. Is this viable? What are the pros/cons for small merchants?

---

### SECTION 2: Evaluation of Alternative Workaround Methods
If a 100% pre-transaction block at checkout is technically impossible on Shopify Basic, evaluate and compare the following alternative deterrents:

1. **Method A: Storefront DOM Manipulation (Theme App Extensions):**
   - Injecting JS on the cart page to warn users. What are the bypass vulnerabilities (e.g. if the customer uses Apple Pay express checkout directly from the product page, bypassing the cart)?
2. **Method B: Real-Time Post-Purchase Holds (The Webhook Guard):**
   - Subscribing to `orders/create`, identifying a double-discount violation within seconds, and calling the `FulfillmentOrder` Hold API. 
   - What are the costs associated with this (e.g., does the merchant still pay transaction/refund fees to local Israeli gateways like PayPlus/Cardcom if they cancel a held order)?

---

### SECTION 3: Competitor Analysis & SaaS Benchmarks
1. **Competitor Technical Audit:**
   - Identify 3–4 apps in the Shopify App Store currently solving promotions management, coupon blocking, or custom discounting rules (e.g., PromoLock, Regula, VolumeBoost, BYOB).
   - **How do they do it?** Do they block it at checkout, hijack the cart via draft orders, use Shopify Functions, or do post-purchase holds? 
   - What are their pricing models and monthly subscription fees?

---

### SECTION 4: POC Architecture & Technical Specifications
1. **Proposed Technical Stack:**
   - Recommend a clean, modern stack (e.g., Remix, Node.js, SQLite/PostgreSQL, Polaris UI).
2. **Verification & Code Blueprint:**
   - Provide a sequence diagram of the chosen pre-transaction blocking flow (or the best possible workaround).
   - Provide a sample boilerplate code/GraphQL query showing how to implement the technical validation logic.
```
