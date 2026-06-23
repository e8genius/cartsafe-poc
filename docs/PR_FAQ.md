# CartSafe: Amazon-Style PR/FAQ

This document describes the CartSafe product, its positioning, user experience, and technical implementation details, written from the perspective of the Product Management and Growth Marketing roles.

---

## 📰 Press Release (PR)

### **CartSafe Launches Globally: Eradicating Double-Discounting Margin Leakage on Shopify Basic and Standard Plans**

*Merchants can now automatically detect and freeze orders that stack coupon codes with gift cards, saving thousands in lost margins without breaking native analytics.*

**TEL AVIV, ISRAEL — June 21, 2026** — Today, the CartSafe team announced the global launch of **CartSafe**, a plug-and-play Shopify application designed to protect e-commerce merchant margins from promotion exploits. CartSafe is the first app to offer an airtight, fully native detection and hold system for coupon and gift card stacking for stores on Shopify Basic and Standard plans, operating entirely within Shopify's allowed boundaries without requiring custom coding or expensive enterprise upgrades.

For years, e-commerce store owners have suffered from "double-dipping" margins. Savvy shoppers routinely apply promotional coupon codes (such as a site-wide 20% off) and then pay the remaining balance using a pre-purchased gift card. Because Shopify’s default checkout treats gift cards as a payment method rather than a discount, the standard checkout engine does not block this combination. Merchants are left with a painful choice: accept the double-digit margin loss, or manually hunt down these orders.

CartSafe solves this dilemma by acting as an automatic guard. It starts in the cart, warning customers that stacking is prohibited and guiding them through the standard checkout. If a customer ignores the warning and stacks the codes at checkout, CartSafe instantly catches the violation the moment the order is placed. The customer is immediately shown a bold warning on the "Thank You" page informing them their order is suspended. Simultaneously, CartSafe places the order on a native Shopify Fulfillment Hold, ensuring the warehouse does not ship the unprofitable order.

"We built CartSafe with a singular focus: protecting the profits of independent merchants without resorting to dirty hacks," said the Head of Product at CartSafe. "Many apps use 'Draft Orders' to block discounts, which destroys Facebook Pixel tracking and analytics. CartSafe keeps your data clean and your checkout native, simply acting as a tireless automated auditor that freezes bad orders before they ship."

#### **Immediate ROI & Transparent Pricing**
CartSafe is committed to merchant success. The app features a risk-free **Value-First Pricing Model**:
- **Free Tier**: Free of charge until CartSafe has frozen exactly **$100 in prevented margin leakage**.
- **Standard Tier**: A flat **$9.99/month** subscription once the savings threshold is crossed.

CartSafe is available for installation immediately on the Shopify App Store.

---

## 🙋 Frequently Asked Questions (FAQ)

### 👥 External FAQs (Merchant-Facing)

#### **1. How does CartSafe prevent double-discounting?**
CartSafe works in three stages:
1. **Frontend Deterrent:** We warn customers directly in the storefront cart when a promo code is applied, advising them that combining coupons with gift cards will trigger an order suspension.
2. **Thank You Page Extension:** If the customer ignores the deterrent and applies a gift card during payment, a React Checkout UI Extension instantly displays a prominent notification on the "Thank You" / confirmation page explaining that their order has been suspended.
3. **Webhook Hold (The Enforcer):** Behind the scenes, our Remix backend immediately intercepts the new order and applies a native Shopify fulfillment hold. Your warehouse and logistics integrations will never ship the order until you review it.

#### **2. Why doesn't it just block the payment from going through?**
Shopify restricts apps from altering checkout fields pre-payment on Basic and Standard plans. Apps claiming to block payments pre-transaction typically hijack the checkout by creating Shopify "Draft Orders," which destroys Google Analytics, Facebook Pixels, and conversion tracking. CartSafe preserves your checkout flow to keep tracking 100% accurate, but locks fulfillment and alerts the customer the moment the payment is completed.

#### **3. Will CartSafe slow down my checkout page or lower my conversion rates?**
No. Because CartSafe runs its validation asynchronously and renders on the "Thank You" page, your active checkout is completely unaffected. Legitimate shoppers experience lightning-fast conversions, while stacked checkouts are audited seamlessly in the background.

#### **4. How does the "Free until $100 saved" pricing work?**
CartSafe features an intuitive admin dashboard that logs every intercepted order and calculates the exact margin saved. The app is completely free until you have saved $100 in prevented losses. After that, it transitions to a flat $9.99/month subscription.

#### **5. Does CartSafe use "Draft Orders"?**
No. CartSafe keeps the native checkout experience completely intact. All your custom pixels, shipping rules, tax settings, and checkout custom behaviors will continue working flawlessly.

#### **6. Is CartSafe compliant with consumer privacy laws?**
Yes. CartSafe is designed under a strict Zero-PII policy. We do not store buyer names, emails, billing addresses, or payment cards. The app is fully compliant with European GDPR standards and Israeli Protection of Privacy Law (including Amendment 13).

---

### ⚙️ Internal FAQs (Technical & Operations)

#### **1. Why abandon the Payment Customization API?**
Shopify's Payment Customization API does not support hiding the native Gift Card input field. Furthermore, because a gift card is a payment method, hiding it at checkout would require hiding the credit card field itself if a coupon is active—accidentally blocking all legitimate credit card purchases. By moving to a Post-Transaction Enforcer model, we guarantee 100% safety for regular orders.

#### **2. How does the "Thank You" page widget work?**
CartSafe uses a Shopify Checkout UI Extension targeted at the `purchase.thank_you.block.render` and `customer_account.order.status.block.render` targets. This React-based extension reads order properties (`discountApplications` and `appliedGiftCards`) directly on the client. When stacking is detected, it renders a high-visibility warning block, letting the shopper know their order is on hold and instructing them to contact support.

#### **3. How does the app track and calculate "saved margin" for billing?**
The app counts a save when the `orders/create` webhook detects the stack and successfully invokes the `fulfillmentOrderHold` mutation.
We calculate the margin saved depending on the discount type:
- For percentage-based discounts:
$$\text{Margin Saved} = \text{Cart Subtotal} \times \text{Discount Code Percentage}$$
- For fixed-amount discounts:
$$\text{Margin Saved} = \min(\text{Discount Value}, \text{Cart Subtotal})$$
This data is stored in the database (`HeldOrder` table) and rendered in the merchant Polaris dashboard.

#### **4. What if the merchant still has to pay refund processing fees?**
By catching the order instantly and showing the warning on the Thank You page, the merchant has the leverage to contact the customer and say: *"Your order is on hold. Please pay the remaining balance via this invoice, or we will cancel it."* This turns a potential cancellation (which incurs payment gateway fees) into an upsell/recovery opportunity.
