# API Flows & GraphQL Schema — CartSafe POC

This document outlines the GraphQL queries, inputs, and mutations used to interact with the Shopify API during the checkout process and backend operations.

---

## 1. Storefront Cart Mutations (Theme App Extension JS)

When a customer modifies the cart on the storefront, the Theme App Extension updates the cart attributes to leave a trace for the Thank You page extension and Webhook.

### Mutation: Set Discount Attribute
```graphql
mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
  cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
    cart {
      id
      attribute(key: "_discount_active") {
        value
      }
    }
  }
}
```
**Variables:**
```json
{
  "cartId": "gid://shopify/Cart/12345",
  "attributes": [
    {
      "key": "_discount_active",
      "value": "true"
    }
  ]
}
```

---

## 2. Thank You Page Widget (Checkout UI Extension)

The UI Extension running on the Thank You page uses the `useOrder()` React hook provided by Shopify's `@shopify/ui-extensions-react/checkout` library. It does not need raw GraphQL for this, but interacts with the following data structures.

### Client-Side Order Object
```typescript
interface Order {
  id: string;
  discountApplications: DiscountApplication[];
  appliedGiftCards: AppliedGiftCard[];
}

// Logic:
// if (order.discountApplications.length > 0 && order.appliedGiftCards.length > 0) {
//    return <Banner status="critical">Your order is on hold...</Banner>;
// }
```

---

## 3. Admin Mutations (Backend Webhook safety net)

When the backend `orders/create` webhook identifies a violation after an order is created, it calls the Admin API to pause fulfillment.

### Webhook Payload Inspection
The backend inspects the JSON payload received from Shopify:
```json
{
  "id": 123456789,
  "discount_codes": [
    { "code": "PROMO10", "amount": "10.00", "type": "fixed_amount" }
  ],
  "payment_gateway_names": ["gift_card", "shopify_payments"]
}
```
*Note: In the Admin API REST/JSON payload, applied gift cards are logged under `payment_gateway_names` as "gift_card", or within the `transactions` array.*

### Mutation: Hold Order Fulfillment
This mutation places a native hold on the fulfillment order of the flagged purchase.
```graphql
mutation fulfillmentOrderHold($id: ID!, $reason: FulfillmentOrderHoldReason!, $notes: String) {
  fulfillmentOrderHold(id: $id, reason: $reason, notes: $notes) {
    fulfillmentOrder {
      id
      status
    }
    userErrors {
      field
      message
    }
  }
}
```
**Variables:**
```json
{
  "id": "gid://shopify/FulfillmentOrder/12345678",
  "reason": "OTHER",
  "notes": "CartSafe: Stacked Coupon and Gift Card detected."
}
```
