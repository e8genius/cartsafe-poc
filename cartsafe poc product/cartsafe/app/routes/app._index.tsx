import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData, useSubmit, useNavigation } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  // 1. Ensure the store is upserted
  const store = await db.store.upsert({
    where: { shopDomain: shop },
    update: { accessToken: session.accessToken },
    create: { shopDomain: shop, accessToken: session.accessToken, isActive: true },
  });

  // 2. Fetch HeldOrders
  const heldOrders = await db.heldOrder.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch shop ID to update metafields
  const shopResponse = await admin.graphql(`
    query getShop {
      shop {
        id
      }
    }
  `);
  const shopJson = await shopResponse.json();
  const shopId = shopJson?.data?.shop?.id || "";

  return {
    store,
    heldOrders,
    shopId,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const isActiveStr = formData.get("isActive");
  const shopId = formData.get("shopId");
  
  if (isActiveStr !== null && shopId) {
    const isActive = isActiveStr === "true";

    // 1. Update DB Store state
    await db.store.upsert({
      where: { shopDomain: shop },
      update: { isActive },
      create: { shopDomain: shop, accessToken: session.accessToken, isActive },
    });

    // 2. Sync to Shop Metafield (cartsafe.is_active)
    const metafieldResponse = await admin.graphql(`
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "cartsafe",
            key: "is_active",
            type: "boolean",
            value: isActive ? "true" : "false",
          }
        ]
      }
    });

    const metafieldJson = await metafieldResponse.json();
    console.log(`[CartSafe] Metafield update response:`, JSON.stringify(metafieldJson));

    // 3. Sync Cart Validation Function State
    const functionId = process.env.SHOPIFY_CHECKOUT_DISCOUNT_VALIDATOR_ID;
    console.log(`[CartSafe] Function ID from env:`, functionId);

    if (functionId) {
      const validationsResponse = await admin.graphql(`
        query {
          cartCheckoutValidations(first: 10) {
            edges {
              node {
                id
                functionId
              }
            }
          }
        }
      `);
      const validationsJson = await validationsResponse.json();
      const existingValidations = validationsJson?.data?.cartCheckoutValidations?.edges || [];

      if (isActive) {
        const existing = existingValidations.find((edge: any) => edge.node.functionId === functionId);
        if (!existing) {
          const createResponse = await admin.graphql(`
            mutation cartCheckoutValidationCreate($functionId: String!) {
              cartCheckoutValidationCreate(validation: { functionId: $functionId }) {
                cartCheckoutValidation {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `, {
            variables: { functionId }
          });
          console.log(`[CartSafe] Validation create response:`, JSON.stringify(await createResponse.json()));
        }
      } else {
        for (const edge of existingValidations) {
          if (edge.node.functionId === functionId) {
            const deleteResponse = await admin.graphql(`
              mutation cartCheckoutValidationDelete($id: ID!) {
                cartCheckoutValidationDelete(id: $id) {
                  deletedCartCheckoutValidationId
                  userErrors {
                    field
                    message
                  }
                }
              }
            `, {
              variables: { id: edge.node.id }
            });
            console.log(`[CartSafe] Validation delete response:`, JSON.stringify(await deleteResponse.json()));
          }
        }
      }
    }

    return {
      success: true,
      isActive,
    };
  }

  return { success: false };
};

export default function Index() {
  const { store, heldOrders, shopId } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  // Compute stats
  const totalSaved = heldOrders.reduce((sum: number, o: any) => sum + (o.savedMargin || 0), 0);
  const totalHeldCount = heldOrders.length;
  
  const isUpdating = navigation.state === "submitting";
  const isActive = store.isActive;

  const handleToggle = () => {
    const formData = new FormData();
    formData.append("isActive", isActive ? "false" : "true");
    formData.append("shopId", shopId);
    submit(formData, { method: "POST" });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === "ILS" ? "₪" : currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <s-page heading="CartSafe Margin Guard">
      <s-section heading="Overview & Metrics">
        <s-paragraph>
          CartSafe prevents promotional coupon codes from being stacked with gift cards on your checkout page, protecting your profit margins from double-discount exploits.
        </s-paragraph>
        
        <s-stack direction="inline" gap="base">
          <div style={{ flex: 1, minWidth: "220px" }}>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="base">
                <s-heading>Protection Status</s-heading>
                <s-text style={{ fontSize: "20px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                  {isActive ? "Active Protection" : "Protection Disabled"}
                </s-text>
                <s-button onClick={handleToggle} loading={isUpdating}>
                  {isActive ? "Disable Protection" : "Enable Protection"}
                </s-button>
              </s-stack>
            </s-box>
          </div>

          <div style={{ flex: 1, minWidth: "220px" }}>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="base">
                <s-heading>Cumulative Margin Saved</s-heading>
                <s-text style={{ fontSize: "20px", fontWeight: "bold", color: "#2e7d32", display: "block", marginBottom: "8px" }}>
                  {formatCurrency(totalSaved, "ILS")}
                </s-text>
                <s-paragraph>Revenue preserved from stacking violations</s-paragraph>
              </s-stack>
            </s-box>
          </div>

          <div style={{ flex: 1, minWidth: "220px" }}>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="base">
                <s-heading>Shielded Violations</s-heading>
                <s-text style={{ fontSize: "20px", fontWeight: "bold", display: "block", marginBottom: "8px" }}>
                  {totalHeldCount}
                </s-text>
                <s-paragraph>Orders caught by the safety net webhook</s-paragraph>
              </s-stack>
            </s-box>
          </div>
        </s-stack>
      </s-section>

      <s-section heading="Safety Net Log (Held Orders)">
        <s-paragraph>
          The table below displays all stacked coupon and gift card attempts that were intercepted and placed on a native fulfillment hold. No customer PII is stored.
        </s-paragraph>
        
        {heldOrders.length === 0 ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-paragraph>No violations intercepted yet. Your checkout margins are safe!</s-paragraph>
          </s-box>
        ) : (
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", fontFamily: "inherit" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e1e3e5", color: "#5c5f62" }}>
                  <th style={{ padding: "12px 8px" }}>Order</th>
                  <th style={{ padding: "12px 8px" }}>Date</th>
                  <th style={{ padding: "12px 8px" }}>Coupon Code</th>
                  <th style={{ padding: "12px 8px" }}>Gift Card</th>
                  <th style={{ padding: "12px 8px" }}>Total Price</th>
                  <th style={{ padding: "12px 8px" }}>Saved Margin</th>
                  <th style={{ padding: "12px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {heldOrders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #e1e3e5" }}>
                    <td style={{ padding: "12px 8px", fontWeight: "600" }}>{order.orderName}</td>
                    <td style={{ padding: "12px 8px" }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px 8px" }}><code style={{ background: "#f1f2f4", padding: "2px 6px", borderRadius: "4px" }}>{order.discountCode}</code></td>
                    <td style={{ padding: "12px 8px" }}><code style={{ background: "#f1f2f4", padding: "2px 6px", borderRadius: "4px" }}>{order.giftCardCode}</code></td>
                    <td style={{ padding: "12px 8px" }}>{formatCurrency(order.totalAmount, order.currency)}</td>
                    <td style={{ padding: "12px 8px", color: "#2e7d32", fontWeight: "600" }}>{formatCurrency(order.savedMargin || 0, order.currency)}</td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{ 
                        display: "inline-block", 
                        padding: "4px 8px", 
                        borderRadius: "12px", 
                        fontSize: "12px", 
                        fontWeight: "600",
                        background: order.status === "HELD" ? "#ffe8e8" : "#e8f5e9",
                        color: order.status === "HELD" ? "#c62828" : "#2e7d32"
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </s-box>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
