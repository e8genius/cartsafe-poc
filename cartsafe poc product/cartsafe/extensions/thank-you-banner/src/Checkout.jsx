import '@shopify/ui-extensions/preact';
import {render} from "preact";
import {useEffect} from "preact/hooks";

// 1. Export the extension
export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  // Read applied discount codes and gift cards
  const discountCodes = shopify.discountCodes.value;
  const giftCards = shopify.appliedGiftCards.value;

  const hasStacked = discountCodes.length > 0 && giftCards.length > 0;
  const isCheckoutPage = shopify.extension.target === "purchase.checkout.block.render";

  // Intercept and block checkout submission if stacked
  useEffect(() => {
    if (isCheckoutPage && shopify.buyerJourney) {
      const unsubscribe = shopify.buyerJourney.intercept(({ canBlockProgress }) => {
        if (canBlockProgress && hasStacked) {
          return {
            behavior: "block",
            reason: "Promo codes and gift cards cannot be stacked.",
            errors: [
              {
                message: "Promo codes and gift cards cannot be stacked. Please remove either the promo code or the gift card to complete your order."
              }
            ]
          };
        }
        return { behavior: "allow" };
      });
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [isCheckoutPage, hasStacked]);

  if (!hasStacked) {
    return null;
  }

  // Render warning block when discount + gift card are stacked
  return (
    <s-banner heading="Order Suspended" tone="critical">
      <s-stack gap="base">
        <s-text>
          {isCheckoutPage 
            ? "Promo codes and gift cards cannot be combined. Please remove either the promo code or the gift card to complete your checkout."
            : "Your order is on hold because promo codes and gift cards cannot be combined. Please contact support."
          }
        </s-text>
      </s-stack>
    </s-banner>
  );
}