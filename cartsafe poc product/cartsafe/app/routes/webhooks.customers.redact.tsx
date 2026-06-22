import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received GDPR ${topic} webhook for ${shop}`);

  // CartSafe does not store customer PII (no names, emails, addresses, phones)
  // in compliance with Israeli Privacy Law Amendment 13.
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
