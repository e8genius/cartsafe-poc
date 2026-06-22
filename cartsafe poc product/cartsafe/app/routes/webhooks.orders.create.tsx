import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, payload, admin } = await authenticate.webhook(request);

  console.log(`Received orders/create webhook for ${shop}`);

  if (!session) {
    return new Response("No session found", { status: 401 });
  }

  const discountCodes = payload.discount_codes || [];
  
  // Detect if a gift card was used as a payment method
  const hasGiftCard = payload.gateway === "gift_card" || 
    (payload.payment_gateway_names && payload.payment_gateway_names.includes("gift_card"));

  const hasDiscount = discountCodes.length > 0;

  if (hasDiscount && hasGiftCard) {
    console.log(`[CartSafe] Stacking violation detected on order ${payload.name} (${payload.id}) for store ${shop}`);

    // 1. Ensure the store exists in our database and is synced
    const store = await db.store.upsert({
      where: { shopDomain: shop },
      update: { accessToken: session.accessToken },
      create: { shopDomain: shop, accessToken: session.accessToken, isActive: true }
    });

    if (!store.isActive) {
      console.log(`[CartSafe] Stacking violation detected but protection is disabled for ${shop}. Skipping hold.`);
      return new Response("OK", { status: 200 });
    }

    const orderId = `gid://shopify/Order/${payload.id}`;

    // 2. Fetch fulfillment orders to put them on hold
    const fulfillmentOrdersResponse = await admin.graphql(`
      query getFulfillmentOrders($orderId: ID!) {
        order(id: $orderId) {
          fulfillmentOrders(first: 10) {
            nodes {
              id
              status
            }
          }
        }
      }
    `, {
      variables: {
        orderId
      }
    });

    const fulfillmentOrdersData = await fulfillmentOrdersResponse.json();
    const fulfillmentOrders = fulfillmentOrdersData?.data?.order?.fulfillmentOrders?.nodes || [];

    // 3. Apply fulfillment holds
    for (const fOrder of fulfillmentOrders) {
      if (fOrder.status === "OPEN" || fOrder.status === "IN_PROGRESS") {
        const holdResponse = await admin.graphql(`
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
        `, {
          variables: {
            id: fOrder.id,
            reason: "OTHER",
            notes: "CartSafe: Dual discount & gift card stacking detected."
          }
        });
        
        const holdData = await holdResponse.json();
        console.log(`[CartSafe] Hold applied to fulfillment order ${fOrder.id}:`, JSON.stringify(holdData));
      }
    }

    // 4. Add the Double-Discount-Alert tag to the order
    const tagResponse = await admin.graphql(`
      mutation tagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        id: orderId,
        tags: ["Double-Discount-Alert"]
      }
    });
    
    const tagData = await tagResponse.json();
    console.log(`[CartSafe] Tag added to order ${orderId}:`, JSON.stringify(tagData));

    // Calculate saved margin
    let savedMargin = 0;
    const subtotal = parseFloat(payload.subtotal_price || payload.total_line_items_price || payload.total_price || "0");
    for (const d of discountCodes) {
      const amount = parseFloat(d.amount || "0");
      if (d.type === "percentage") {
        savedMargin += subtotal * (amount / 100.0);
      } else if (d.type === "fixed_amount") {
        savedMargin += Math.min(amount, subtotal);
      } else {
        savedMargin += amount;
      }
    }

    // 5. Log the held order in the PostgreSQL database (No-PII policy)
    // Masking the gift card code as no full code is exposed in orders/create webhook payload
    const discountCodeNames = discountCodes.map((d: any) => d.code).join(", ");
    
    await db.heldOrder.upsert({
      where: { shopifyOrderId: orderId },
      update: {
        discountCode: discountCodeNames,
        totalAmount: parseFloat(payload.total_price),
        savedMargin,
        currency: payload.currency,
        status: "HELD"
      },
      create: {
        storeId: store.id,
        shopifyOrderId: orderId,
        orderName: payload.name,
        discountCode: discountCodeNames,
        giftCardCode: "xxxx-giftcard",
        totalAmount: parseFloat(payload.total_price),
        savedMargin,
        currency: payload.currency,
        status: "HELD"
      }
    });

    console.log(`[CartSafe] HeldOrder record created for order ${payload.name}`);
  }

  return new Response("OK", { status: 200 });
};
