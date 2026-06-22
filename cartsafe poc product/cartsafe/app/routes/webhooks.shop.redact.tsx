import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received GDPR ${topic} webhook for ${shop}`);

  try {
    // 1. Delete all database sessions associated with the shop
    await db.session.deleteMany({
      where: { shop },
    });

    // 2. Delete the store configuration and cascaded held orders
    await db.store.deleteMany({
      where: { shopDomain: shop },
    });

    console.log(`[CartSafe] Successfully redacted data for shop: ${shop}`);
  } catch (error) {
    console.error(`[CartSafe] Error during shop redact for ${shop}:`, error);
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
